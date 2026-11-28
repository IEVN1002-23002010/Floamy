from datetime import datetime, date
from flask import Blueprint, request, jsonify
from app.extensions import get_db_connection
from app.utils.decorators import token_required

cash_register_bp = Blueprint("cash_register", __name__)


def extract_order_date(row: dict):
    for key in ("fecha", "fecha_pedido", "created_at", "creado_en", "fecha_creacion"):
        val = row.get(key)
        if isinstance(val, datetime):
            return val.date()
        if isinstance(val, date):
            return val
        if isinstance(val, str) and len(val.strip()) >= 10:
            try:
                return datetime.strptime(val.strip()[:10], "%Y-%m-%d").date()
            except Exception:
                pass
    for val in row.values():
        if isinstance(val, datetime):
            return val.date()
        if isinstance(val, date):
            return val
    return None


def extract_payment_method(row: dict) -> str:
    if not row:
        return ""
    for key in ("metodo", "metodo_pago", "forma_pago", "tipo_pago", "payment_method"):
        val = row.get(key)
        if val and str(val).strip():
            return str(val).strip()
    return ""


def get_db_today(cursor) -> date:
    try:
        cursor.execute("SELECT CURDATE() AS hoy")
        row = cursor.fetchone() or {}
        hoy = row.get("hoy")
        if isinstance(hoy, datetime):
            return hoy.date()
        if isinstance(hoy, date):
            return hoy
        if isinstance(hoy, str) and len(hoy) >= 10:
            return datetime.strptime(hoy[:10], "%Y-%m-%d").date()
    except Exception:
        pass
    return date.today()


def calculate_day_totals(cursor, target_date: date) -> dict:
    db_today = get_db_today(cursor)

    pagos_map = {}
    for pay_table in ("pagos_simulados", "pagos"):
        try:
            cursor.execute(f"SELECT * FROM {pay_table} ORDER BY id ASC")
            for pg in cursor.fetchall():
                pid = pg.get("pedido_id")
                metodo_pg = extract_payment_method(pg)
                if pid and metodo_pg:
                    pagos_map[pid] = metodo_pg
        except Exception:
            pass

    cursor.execute("SELECT * FROM pedidos")
    rows = cursor.fetchall()

    efectivo = 0.0
    tarjeta = 0.0
    transferencia = 0.0
    pedidos_count = 0

    for p in rows:
        estado = str(p.get("estado") or "").strip().lower()
        if "cancel" in estado:
            continue

        p_date = extract_order_date(p)
        if p_date is not None:
            if p_date != target_date:
                continue
        elif target_date != db_today:
            continue

        total = float(p.get("total") or 0)
        raw_metodo = pagos_map.get(p.get("id")) or extract_payment_method(p) or "Efectivo"
        metodo = raw_metodo.lower()
        pedidos_count += 1

        if "tarj" in metodo or "card" in metodo or "cred" in metodo or "deb" in metodo:
            tarjeta += total
        elif "trans" in metodo or "spei" in metodo or "dep" in metodo:
            transferencia += total
        else:
            efectivo += total

    egresos_proveedores = 0.0
    egresos_efectivo = 0.0
    try:
        cursor.execute(
            """
            SELECT total, metodo_pago
            FROM ordenes_compra
            WHERE estado = 'Pagada' AND DATE(COALESCE(fecha_pago, fecha_orden)) = %s
            """,
            (target_date.isoformat(),),
        )
        for oc in cursor.fetchall():
            monto = float(oc.get("total") or 0)
            egresos_proveedores += monto
            if "efect" in str(oc.get("metodo_pago") or "efectivo").lower():
                egresos_efectivo += monto
    except Exception:
        pass

    cursor.execute("SELECT COALESCE(SUM(total), 0) AS ingresos FROM pedidos")
    ingresos_acum = float((cursor.fetchone() or {}).get("ingresos") or 0)
    egresos_acum = 0.0
    try:
        cursor.execute("SELECT COALESCE(SUM(total), 0) AS pagado FROM ordenes_compra WHERE estado = 'Pagada'")
        egresos_acum = float((cursor.fetchone() or {}).get("pagado") or 0)
    except Exception:
        pass

    total_ventas = round(efectivo + tarjeta + transferencia, 2)
    return {
        "fecha": target_date.isoformat(),
        "pedidos_count": pedidos_count,
        "ventas_efectivo": round(efectivo, 2),
        "ventas_tarjeta": round(tarjeta, 2),
        "ventas_transferencia": round(transferencia, 2),
        "total_ventas": total_ventas,
        "egresos_proveedores": round(egresos_proveedores, 2),
        "egresos_efectivo": round(egresos_efectivo, 2),
        "saldo_disponible": round(ingresos_acum - egresos_acum, 2),
    }


@cash_register_bp.get("/summary")
@token_required
def get_summary():
    raw_date = (request.args.get("fecha") or "").strip()
    conn = get_db_connection()
    with conn.cursor() as cursor:
        try:
            target_date = datetime.strptime(raw_date[:10], "%Y-%m-%d").date() if raw_date else get_db_today(cursor)
        except Exception:
            target_date = get_db_today(cursor)

        totals = calculate_day_totals(cursor, target_date)

        cursor.execute(
            "SELECT COUNT(*) AS total FROM cortes_caja WHERE DATE(fecha_corte) = %s",
            (target_date.isoformat(),),
        )
        row_corte = cursor.fetchone() or {}
        totals["cortes_hoy"] = int(row_corte.get("total") or 0)

    return jsonify(totals)


@cash_register_bp.get("/")
@cash_register_bp.get("")
@token_required
def list_closures():
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute("""
            SELECT id,
                   DATE_FORMAT(fecha_corte, '%d %b %Y, %H:%i') AS fecha,
                   responsable,
                   fondo_inicial,
                   ventas_efectivo,
                   ventas_tarjeta,
                   ventas_transferencia,
                   total_ventas,
                   pedidos_count,
                   efectivo_esperado,
                   efectivo_contado,
                   diferencia,
                   observaciones
            FROM cortes_caja
            ORDER BY id DESC
        """)
        rows = cursor.fetchall()
        for r in rows:
            for col in (
                "fondo_inicial",
                "ventas_efectivo",
                "ventas_tarjeta",
                "ventas_transferencia",
                "total_ventas",
                "efectivo_esperado",
                "efectivo_contado",
                "diferencia",
            ):
                r[col] = float(r.get(col) or 0)
    return jsonify(rows)


@cash_register_bp.post("/")
@cash_register_bp.post("")
@token_required
def create_closure():
    data = request.get_json(silent=True) or {}
    fondo_inicial = round(float(data.get("fondo_inicial") or 0), 2)
    efectivo_contado = round(float(data.get("efectivo_contado") or 0), 2)
    observaciones = (data.get("observaciones") or "").strip()
    responsable = (data.get("responsable") or "Administrador").strip()
    usuario_id = data.get("usuario_id")
    raw_date = (data.get("fecha") or "").strip()

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            try:
                target_date = datetime.strptime(raw_date[:10], "%Y-%m-%d").date() if raw_date else get_db_today(cursor)
            except Exception:
                target_date = get_db_today(cursor)

            totals = calculate_day_totals(cursor, target_date)
            efectivo_esperado = round(
                fondo_inicial + totals["ventas_efectivo"] - totals["egresos_efectivo"],
                2,
            )
            diferencia = round(efectivo_contado - efectivo_esperado, 2)

            cursor.execute(
                """
                INSERT INTO cortes_caja (
                    usuario_id, responsable, fondo_inicial,
                    ventas_efectivo, ventas_tarjeta, ventas_transferencia,
                    total_ventas, pedidos_count,
                    efectivo_esperado, efectivo_contado, diferencia, observaciones
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    int(usuario_id) if usuario_id else None,
                    responsable,
                    fondo_inicial,
                    totals["ventas_efectivo"],
                    totals["ventas_tarjeta"],
                    totals["ventas_transferencia"],
                    totals["total_ventas"],
                    totals["pedidos_count"],
                    efectivo_esperado,
                    efectivo_contado,
                    diferencia,
                    observaciones or None,
                ),
            )
            new_id = cursor.lastrowid
        conn.commit()
    except Exception as exc:
        try:
            conn.rollback()
        except Exception:
            pass
        return jsonify({"error": f"No se pudo registrar el cierre: {exc}"}), 400

    return jsonify({
        "id": new_id,
        "efectivo_esperado": efectivo_esperado,
        "diferencia": diferencia,
        "message": "Cierre de caja registrado",
    }), 201


@cash_register_bp.delete("/<int:corte_id>")
@token_required
def delete_closure(corte_id):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM cortes_caja WHERE id = %s", (corte_id,))
        conn.commit()
    except Exception as exc:
        try:
            conn.rollback()
        except Exception:
            pass
        return jsonify({"error": f"No se pudo eliminar el registro: {exc}"}), 400

    return jsonify({"message": "Corte eliminado"})