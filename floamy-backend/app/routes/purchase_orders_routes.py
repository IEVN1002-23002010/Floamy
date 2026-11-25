import random
from flask import Blueprint, request, jsonify
from app.extensions import get_db_connection

purchase_orders_bp = Blueprint("purchase_orders", __name__)


def _get_financial_summary(cursor) -> dict:
    cursor.execute("SELECT COALESCE(SUM(total), 0) AS ingresos FROM pedidos")
    ingresos = float((cursor.fetchone() or {}).get("ingresos") or 0)

    cursor.execute("SELECT COALESCE(SUM(total), 0) AS pagado FROM ordenes_compra WHERE estado = 'Pagada'")
    pagado = float((cursor.fetchone() or {}).get("pagado") or 0)

    cursor.execute("SELECT COALESCE(SUM(total), 0) AS pendiente FROM ordenes_compra WHERE estado = 'Pendiente'")
    pendiente = float((cursor.fetchone() or {}).get("pendiente") or 0)

    disponible = round(ingresos - pagado, 2)
    return {
        "ingresos_totales": round(ingresos, 2),
        "egresos_pagados": round(pagado, 2),
        "ordenes_pendientes": round(pendiente, 2),
        "dinero_disponible": disponible,
    }


def _apply_order_payment(cursor, order_id: int, metodo_pago: str, usuario_id=None):
    cursor.execute("SELECT * FROM ordenes_compra WHERE id = %s LIMIT 1", (order_id,))
    orden = cursor.fetchone()
    if not orden:
        raise ValueError("Orden de compra no encontrada.")
    if orden["estado"] == "Pagada":
        raise ValueError("Esta orden ya fue pagada.")
    if orden["estado"] == "Cancelada":
        raise ValueError("No se puede pagar una orden cancelada.")

    summary = _get_financial_summary(cursor)
    total_orden = float(orden["total"] or 0)
    if summary["dinero_disponible"] < total_orden:
        raise ValueError(
            f"Fondos insuficientes en caja: hay ${summary['dinero_disponible']:,.2f} disponibles y la orden cuesta ${total_orden:,.2f}."
        )

    cursor.execute(
        """
        SELECT dc.*, i.nombre AS ingrediente_nombre, i.unidad
        FROM detalle_compra dc
        INNER JOIN ingredientes i ON dc.ingrediente_id = i.id
        WHERE dc.orden_id = %s
        """,
        (order_id,),
    )
    detalles = cursor.fetchall()
    if not detalles:
        raise ValueError("La orden no tiene insumos registrados.")

    for d in detalles:
        cant = float(d["cantidad"] or 0)
        ing_id = int(d["ingrediente_id"])

        cursor.execute(
            """
            UPDATE ingredientes
            SET stock_actual = stock_actual + %s
            WHERE id = %s
            """,
            (cant, ing_id),
        )

        cursor.execute(
            """
            INSERT INTO movimientos_ingredientes (ingrediente_id, tipo, cantidad, usuario_id)
            VALUES (%s, 'Entrada', %s, %s)
            """,
            (ing_id, cant, int(usuario_id) if usuario_id else orden.get("usuario_id")),
        )

    cursor.execute(
        """
        UPDATE ordenes_compra
        SET estado = 'Pagada',
            metodo_pago = %s,
            fecha_pago = NOW()
        WHERE id = %s
        """,
        (metodo_pago or "Efectivo", order_id),
    )


@purchase_orders_bp.get("/")
@purchase_orders_bp.get("")
def list_purchase_orders():
    conn = get_db_connection()
    with conn.cursor() as cursor:
        summary = _get_financial_summary(cursor)

        cursor.execute("""
            SELECT oc.id,
                   oc.folio,
                   oc.proveedor_id,
                   p.nombre AS proveedor_nombre,
                   p.contacto AS proveedor_contacto,
                   p.telefono AS proveedor_telefono,
                   oc.usuario_id,
                   u.nombre AS responsable,
                   oc.total,
                   oc.metodo_pago,
                   oc.estado,
                   oc.notas,
                   DATE_FORMAT(oc.fecha_orden, '%d %b %Y, %H:%i') AS fecha_orden,
                   DATE_FORMAT(oc.fecha_pago, '%d %b %Y, %H:%i') AS fecha_pago
            FROM ordenes_compra oc
            INNER JOIN proveedores p ON oc.proveedor_id = p.id
            LEFT JOIN usuarios u ON oc.usuario_id = u.id
            ORDER BY oc.id DESC
        """)
        orders = cursor.fetchall()

        cursor.execute("""
            SELECT dc.id,
                   dc.orden_id,
                   dc.ingrediente_id,
                   i.nombre AS ingrediente_nombre,
                   i.unidad,
                   dc.cantidad,
                   dc.costo_unitario,
                   dc.subtotal
            FROM detalle_compra dc
            INNER JOIN ingredientes i ON dc.ingrediente_id = i.id
            ORDER BY dc.id ASC
        """)
        det_rows = cursor.fetchall()

        det_map = {}
        for d in det_rows:
            d["cantidad"] = float(d["cantidad"] or 0)
            d["costo_unitario"] = float(d["costo_unitario"] or 0)
            d["subtotal"] = float(d["subtotal"] or 0)
            det_map.setdefault(d["orden_id"], []).append(d)

        for o in orders:
            o["total"] = float(o["total"] or 0)
            o["items"] = det_map.get(o["id"], [])

    return jsonify({
        "summary": summary,
        "orders": orders,
    })


@purchase_orders_bp.post("/")
@purchase_orders_bp.post("")
def create_purchase_order():
    data = request.get_json(silent=True) or {}
    proveedor_id = data.get("proveedor_id") or data.get("proveedorId")
    usuario_id = data.get("usuario_id") or data.get("usuarioId")
    metodo_pago = (data.get("metodo_pago") or data.get("metodoPago") or "Efectivo").strip()
    notas = (data.get("notas") or "").strip()
    pagar_ahora = bool(data.get("pagar_ahora") or data.get("pagarAhora"))
    raw_items = data.get("items") or []

    if not proveedor_id:
        return jsonify({"error": "Selecciona un proveedor."}), 400
    if not raw_items:
        return jsonify({"error": "Agrega al menos un insumo a la orden."}), 400

    folio = f"#OC-{random.randint(1000, 9999)}"
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            clean_items = []
            total = 0.0

            for item in raw_items:
                ing_id = int(item.get("ingrediente_id") or item.get("ingredienteId") or 0)
                cant = round(float(item.get("cantidad") or 0), 2)
                if ing_id <= 0 or cant <= 0:
                    continue

                cursor.execute("SELECT costo_unitario FROM ingredientes WHERE id = %s", (ing_id,))
                ing_row = cursor.fetchone()
                if not ing_row:
                    raise ValueError(f"El ingrediente con ID {ing_id} no existe.")

                costo = round(float(ing_row.get("costo_unitario") or 0), 2)
                sub = round(cant * costo, 2)
                total = round(total + sub, 2)
                clean_items.append({
                    "ingrediente_id": ing_id,
                    "cantidad": cant,
                    "costo_unitario": costo,
                    "subtotal": sub,
                })

            if not clean_items:
                raise ValueError("Verifica que las cantidades sean mayores a 0.")

            cursor.execute(
                """
                INSERT INTO ordenes_compra (folio, proveedor_id, usuario_id, total, metodo_pago, estado, notas)
                VALUES (%s, %s, %s, %s, %s, 'Pendiente', %s)
                """,
                (
                    folio,
                    int(proveedor_id),
                    int(usuario_id) if usuario_id else None,
                    total,
                    metodo_pago,
                    notas or None,
                ),
            )
            orden_id = cursor.lastrowid

            for line in clean_items:
                cursor.execute(
                    """
                    INSERT INTO detalle_compra (orden_id, ingrediente_id, cantidad, costo_unitario, subtotal)
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    (
                        orden_id,
                        line["ingrediente_id"],
                        line["cantidad"],
                        line["costo_unitario"],
                        line["subtotal"],
                    ),
                )

            if pagar_ahora:
                _apply_order_payment(cursor, orden_id, metodo_pago, usuario_id)

        conn.commit()
    except ValueError as err:
        conn.rollback()
        return jsonify({"error": str(err)}), 400
    except Exception as exc:
        conn.rollback()
        return jsonify({"error": f"No se pudo registrar la orden: {exc}"}), 400

    return jsonify({
        "id": orden_id,
        "folio": folio,
        "total": total,
        "estado": "Pagada" if pagar_ahora else "Pendiente",
        "message": "Orden pagada e inventario surtido" if pagar_ahora else "Orden enviada al proveedor",
    }), 201


@purchase_orders_bp.patch("/<int:order_id>/pay")
def pay_purchase_order(order_id):
    data = request.get_json(silent=True) or {}
    metodo_pago = (data.get("metodo_pago") or data.get("metodoPago") or "Efectivo").strip()
    usuario_id = data.get("usuario_id") or data.get("usuarioId")

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            _apply_order_payment(cursor, order_id, metodo_pago, usuario_id)
        conn.commit()
    except ValueError as err:
        conn.rollback()
        return jsonify({"error": str(err)}), 400
    except Exception as exc:
        conn.rollback()
        return jsonify({"error": f"No se pudo procesar el pago: {exc}"}), 400

    return jsonify({"message": "Pago registrado e inventario actualizado"})


@purchase_orders_bp.patch("/<int:order_id>/cancel")
def cancel_purchase_order(order_id):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT estado FROM ordenes_compra WHERE id = %s", (order_id,))
            row = cursor.fetchone()
            if not row:
                return jsonify({"error": "Orden no encontrada"}), 404
            if row["estado"] == "Pagada":
                return jsonify({"error": "No se puede cancelar una orden que ya fue pagada."}), 400

            cursor.execute("UPDATE ordenes_compra SET estado = 'Cancelada' WHERE id = %s", (order_id,))
        conn.commit()
    except Exception as exc:
        conn.rollback()
        return jsonify({"error": f"No se pudo cancelar la orden: {exc}"}), 400

    return jsonify({"message": "Orden cancelada"})