from datetime import datetime, date, timedelta
from flask import Blueprint, jsonify, request
from app.extensions import get_db_connection
from app.utils.decorators import token_required

dashboard_bp = Blueprint("dashboard", __name__)

FLAVOR_COLORS = ["#6DA0BF", "#011640", "#AAC8E0", "#E6B85C", "#BFD79B", "#8FAEC4"]
PRESENTATION_COLORS = ["#011640", "#6DA0BF", "#AAC8E0", "#E6B85C", "#BFD79B"]
DEMO_COLORS = ["#011640", "#6DA0BF", "#E6B85C", "#BFD79B", "#AAC8E0", "#8FAEC4"]
WEEKDAYS_ES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]


def obtener_promedio_resenas(cursor):
    try:
        cursor.execute("SHOW TABLES")
        tablas = [list(fila.values())[0] for fila in cursor.fetchall()]
        tabla_resenas = next(
            (t for t in tablas if any(p in t.lower() for p in ("resena", "reseña", "opinion", "valoracion", "calificacion"))),
            None,
        )
        if not tabla_resenas:
            return 0.0

        cursor.execute(f"SHOW COLUMNS FROM `{tabla_resenas}`")
        columnas = [fila["Field"] for fila in cursor.fetchall()]
        col_puntos = next(
            (c for c in columnas if any(p in c.lower() for p in ("calificacion", "estrellas", "puntuacion", "rating", "valor"))),
            None,
        )
        if not col_puntos:
            return 0.0

        cursor.execute(f"SELECT COALESCE(AVG(`{col_puntos}`), 0) AS promedio FROM `{tabla_resenas}`")
        dato = cursor.fetchone() or {}
        return round(float(dato.get("promedio") or 0), 1)
    except Exception:
        return 0.0


def parse_order_date(row: dict):
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


def resolve_stage(row: dict) -> int:
    if row.get("etapa") is not None:
        try:
            return max(0, min(3, int(row["etapa"])))
        except Exception:
            pass
    s = str(row.get("estado") or "").strip().lower()
    if "entreg" in s or "complet" in s:
        return 3
    if "listo" in s or "recol" in s:
        return 2
    if "prep" in s or "proc" in s:
        return 1
    return 0


def build_marketing_metrics(cursor, total_ventas: float, total_pedidos: int, clientes_rows: list) -> dict:
    # 1. Meta de ventas
    meta_ventas = 18000.00
    periodo_meta = "Noviembre 2026"
    try:
        cursor.execute("SELECT periodo, meta_ventas FROM metas_marketing ORDER BY id ASC LIMIT 1")
        row_meta = cursor.fetchone()
        if row_meta:
            periodo_meta = row_meta.get("periodo") or periodo_meta
            meta_ventas = float(row_meta.get("meta_ventas") or meta_ventas)
    except Exception:
        pass

    avance_pct = round((total_ventas / meta_ventas) * 100, 1) if meta_ventas > 0 else 0.0
    restante_meta = round(max(0.0, meta_ventas - total_ventas), 2)

    # 2. Gastos de publicidad y ROI
    campanas = []
    inversion_total = 0.0
    ingresos_campanas = 0.0
    try:
        cursor.execute(
            """
            SELECT id, campana, canal, monto_invertido, ingresos_generados,
                   DATE_FORMAT(fecha_inicio, '%d %b %Y') AS fecha_inicio
            FROM gastos_publicidad
            WHERE activo = 1
            ORDER BY id DESC
            """
        )
        for c in cursor.fetchall():
            inv = float(c.get("monto_invertido") or 0)
            ing = float(c.get("ingresos_generados") or 0)
            roi_item = round(((ing - inv) / inv) * 100, 1) if inv > 0 else 0.0
            inversion_total += inv
            ingresos_campanas += ing
            campanas.append({
                "id": c["id"],
                "campana": c["campana"],
                "canal": c["canal"],
                "monto_invertido": round(inv, 2),
                "ingresos_generados": round(ing, 2),
                "roi": roi_item,
                "fecha_inicio": c.get("fecha_inicio") or "",
            })
    except Exception:
        pass

    base_ingresos_roi = ingresos_campanas if ingresos_campanas > 0 else total_ventas
    roi_general = round(((base_ingresos_roi - inversion_total) / inversion_total) * 100, 1) if inversion_total > 0 else 0.0
    roas = round(base_ingresos_roi / inversion_total, 2) if inversion_total > 0 else 0.0

    # 3. Tasa de conversión de visitas a compras
    total_visitas = 0
    visitas_pwa = 0
    visitas_sucursal = 0
    try:
        cursor.execute("SELECT COUNT(*) AS total FROM visitas_tienda")
        total_visitas = int((cursor.fetchone() or {}).get("total") or 0)

        cursor.execute("SELECT canal, COUNT(*) AS cnt FROM visitas_tienda GROUP BY canal")
        for v in cursor.fetchall():
            c_name = str(v.get("canal") or "").lower()
            if "sucursal" in c_name or "qr" in c_name:
                visitas_sucursal += int(v.get("cnt") or 0)
            else:
                visitas_pwa += int(v.get("cnt") or 0)
    except Exception:
        pass

    if total_visitas < total_pedidos:
        total_visitas = max(total_pedidos, 1)

    tasa_conversion = round((total_pedidos / total_visitas) * 100, 2) if total_visitas > 0 else 0.0

    # 4. Datos demográficos de clientes (excluyendo Venta de mostrador)
    age_buckets = {"18 - 24 años": 0, "25 - 30 años": 0, "31 - 40 años": 0, "41+ años": 0}
    zone_counts = {}
    gender_counts = {}
    total_demografia = 0

    for c in clientes_rows:
        nom = (c.get("nombre") or c.get("nombre_completo") or "").strip().lower()
        if "mostrador" in nom:
            continue

        edad_val = c.get("edad")
        zona_val = (c.get("zona") or "").strip()
        gen_val = (c.get("genero") or "").strip()

        if edad_val is not None or zona_val or gen_val:
            total_demografia += 1

        if edad_val is not None:
            try:
                ed = int(edad_val)
                if ed <= 24:
                    age_buckets["18 - 24 años"] += 1
                elif ed <= 30:
                    age_buckets["25 - 30 años"] += 1
                elif ed <= 40:
                    age_buckets["31 - 40 años"] += 1
                else:
                    age_buckets["41+ años"] += 1
            except Exception:
                pass

        if zona_val:
            zone_counts[zona_val] = zone_counts.get(zona_val, 0) + 1

        if gen_val:
            gender_counts[gen_val] = gender_counts.get(gen_val, 0) + 1

    total_edades = sum(age_buckets.values())
    rangos_edad = [
        {
            "label": k,
            "count": v,
            "pct": round((v / total_edades) * 100) if total_edades > 0 else 0,
            "color": DEMO_COLORS[idx % len(DEMO_COLORS)],
        }
        for idx, (k, v) in enumerate(age_buckets.items())
    ]

    sorted_zonas = sorted(zone_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    total_zonas = sum(v for _, v in sorted_zonas)
    zonas = [
        {
            "label": k,
            "count": v,
            "pct": round((v / total_zonas) * 100) if total_zonas > 0 else 0,
            "color": DEMO_COLORS[idx % len(DEMO_COLORS)],
        }
        for idx, (k, v) in enumerate(sorted_zonas)
    ]

    total_generos = sum(gender_counts.values())
    generos = [
        {
            "label": k,
            "count": v,
            "pct": round((v / total_generos) * 100) if total_generos > 0 else 0,
            "color": DEMO_COLORS[idx % len(DEMO_COLORS)],
        }
        for idx, (k, v) in enumerate(sorted(gender_counts.items(), key=lambda x: x[1], reverse=True))
    ]

    return {
        "meta_ventas": {
            "periodo": periodo_meta,
            "objetivo": round(meta_ventas, 2),
            "actual": round(total_ventas, 2),
            "restante": restante_meta,
            "porcentaje": min(100.0, avance_pct),
            "porcentaje_real": avance_pct,
        },
        "publicidad": {
            "inversion_total": round(inversion_total, 2),
            "ingresos_atribuidos": round(base_ingresos_roi, 2),
            "roi": roi_general,
            "roas": roas,
            "campanas": campanas,
        },
        "conversion": {
            "visitas": total_visitas,
            "compras": total_pedidos,
            "tasa": tasa_conversion,
            "visitas_pwa": visitas_pwa,
            "visitas_sucursal": visitas_sucursal,
        },
        "demografia": {
            "total_clientes_perfilados": total_demografia,
            "rangos_edad": rangos_edad,
            "zonas": zonas,
            "generos": generos,
        },
    }


@dashboard_bp.get("/summary")
@token_required
def summary():
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT COALESCE(SUM(total),0) AS ventas, COUNT(*) AS pedidos, COALESCE(AVG(total),0) AS ticket FROM pedidos")
        kpis = cursor.fetchone()

        mostrador_ids = set()
        clientes_rows = []
        try:
            cursor.execute("SELECT * FROM clientes")
            clientes_rows = cursor.fetchall()
            for c in clientes_rows:
                nom = (c.get("nombre") or c.get("nombre_completo") or c.get("name") or "").lower()
                if "mostrador" in nom:
                    mostrador_ids.add(c.get("id"))
        except Exception:
            pass

        cursor.execute("SELECT * FROM pedidos")
        pedidos_rows = cursor.fetchall()

        compras_por_cliente = {}
        canceled_ids = set()

        today = date.today()
        week_start = today - timedelta(days=today.weekday())
        week_end = week_start + timedelta(days=6)

        week_totals = [0.0] * 7
        all_weekday_totals = [0.0] * 7
        stage_counts = {0: 0, 1: 0, 2: 0, 3: 0}

        for p in pedidos_rows:
            estado_txt = str(p.get("estado") or "").strip().lower()
            if "cancel" in estado_txt:
                if p.get("id") is not None:
                    canceled_ids.add(p["id"])
                continue

            cid = p.get("cliente_id")
            nombre = (p.get("cliente_nombre") or p.get("cliente") or "").strip().lower()
            if cid not in mostrador_ids and "mostrador" not in nombre:
                clave = f"id_{cid}" if cid else (f"nom_{nombre}" if nombre else None)
                if clave:
                    compras_por_cliente[clave] = compras_por_cliente.get(clave, 0) + 1

            st = resolve_stage(p)
            stage_counts[st] = stage_counts.get(st, 0) + 1

            total_val = float(p.get("total") or 0)
            p_date = parse_order_date(p)
            if p_date:
                wd = p_date.weekday()
                all_weekday_totals[wd] += total_val
                if week_start <= p_date <= week_end:
                    week_totals[wd] += total_val

        active_daily = week_totals if sum(week_totals) > 0 else all_weekday_totals
        evolucion_ventas = [
            {"dia": WEEKDAYS_ES[i], "total": round(active_daily[i], 2)}
            for i in range(7)
        ]

        total_activos = sum(stage_counts.values())
        estados_pedidos = {
            "entregados": stage_counts[3],
            "preparacion": stage_counts[1],
            "listos": stage_counts[2],
            "pendientes": stage_counts[0],
            "total": total_activos,
        }

        recurrentes = sum(1 for total in compras_por_cliente.values() if total >= 2)
        resenas = obtener_promedio_resenas(cursor)

        cursor.execute("SELECT COALESCE(SUM(cantidad),0) AS unidades FROM detalle_pedido")
        uds = cursor.fetchone()

        prod_map = {}
        helado_map = {}
        pres_map = {}
        try:
            cursor.execute("SELECT * FROM productos")
            for pr in cursor.fetchall():
                prod_map[pr["id"]] = pr
        except Exception:
            pass
        try:
            cursor.execute("SELECT * FROM helados")
            for h in cursor.fetchall():
                helado_map[h["id"]] = h
        except Exception:
            pass
        try:
            cursor.execute("SELECT * FROM presentaciones ORDER BY id ASC")
            for ps in cursor.fetchall():
                pres_map[ps["id"]] = ps
        except Exception:
            pass

        flavor_totals = {}
        pres_totals = {}
        for ps in pres_map.values():
            pname = str(ps.get("nombre") or "").strip()
            if pname:
                pres_totals[pname] = 0

        try:
            cursor.execute("SELECT * FROM detalle_pedido")
            for d in cursor.fetchall():
                if d.get("pedido_id") in canceled_ids:
                    continue
                qty = int(d.get("cantidad") or 1)
                prod = prod_map.get(d.get("producto_id"), {})
                helado = helado_map.get(prod.get("helado_id"), {})
                pres = pres_map.get(prod.get("presentacion_id"), {})

                pres_name = str(
                    pres.get("nombre")
                    or d.get("presentacion")
                    or d.get("tamano")
                    or prod.get("presentacion")
                    or prod.get("tamano")
                    or ""
                ).strip()

                if not pres_name:
                    unit_price = float(d.get("precio_unitario") or d.get("precio") or prod.get("precio") or 0)
                    if unit_price >= 120:
                        pres_name = "Litro"
                    elif unit_price <= 36 and "Cono" in pres_totals:
                        pres_name = "Cono"
                    else:
                        pres_name = "Vaso 8 oz"

                pres_totals[pres_name] = pres_totals.get(pres_name, 0) + qty

                if not prod or int(prod.get("activo") or 0) == 0:
                    continue

                raw_flavor = (
                    prod.get("sabor")
                    or helado.get("sabor")
                    or helado.get("nombre")
                    or d.get("sabor")
                    or d.get("nombre_producto")
                    or d.get("producto")
                    or d.get("nombre")
                    or d.get("descripcion")
                    or prod.get("nombre")
                    or ""
                )
                clean_flavor = str(raw_flavor).split(" - ")[0].split(" (")[0].strip()
                if not clean_flavor or clean_flavor.lower() in ("otro", "otros"):
                    continue

                flavor_totals[clean_flavor] = flavor_totals.get(clean_flavor, 0) + qty
        except Exception:
            pass

        sorted_flavors = sorted(flavor_totals.items(), key=lambda x: x[1], reverse=True)
        if len(sorted_flavors) > 5:
            final_flavors = list(sorted_flavors[:4])
            others_qty = sum(q for _, q in sorted_flavors[4:])
            if others_qty > 0:
                final_flavors.append(("Otros", others_qty))
        else:
            final_flavors = list(sorted_flavors)

        total_flavor_qty = sum(q for _, q in final_flavors)
        sabores = []
        if total_flavor_qty > 0:
            accum_pct = 0
            for idx, (fname, fqty) in enumerate(final_flavors):
                if idx == len(final_flavors) - 1:
                    pct = max(0, 100 - accum_pct)
                else:
                    pct = round((fqty / total_flavor_qty) * 100)
                    accum_pct += pct
                sabores.append({
                    "name": fname,
                    "value": pct,
                    "cantidad": fqty,
                    "color": FLAVOR_COLORS[idx % len(FLAVOR_COLORS)],
                })

        sorted_pres = sorted(pres_totals.items(), key=lambda x: x[1], reverse=True)
        total_pres_qty = sum(q for _, q in sorted_pres)
        presentaciones = []
        if total_pres_qty > 0:
            accum_pres_pct = 0
            non_zero_indices = [i for i, (_, q) in enumerate(sorted_pres) if q > 0]
            last_non_zero = non_zero_indices[-1] if non_zero_indices else -1
            for idx, (pname, pqty) in enumerate(sorted_pres):
                if pqty == 0:
                    pct = 0
                elif idx == last_non_zero:
                    pct = max(0, 100 - accum_pres_pct)
                else:
                    pct = round((pqty / total_pres_qty) * 100)
                    accum_pres_pct += pct
                presentaciones.append({
                    "name": pname,
                    "value": pct,
                    "cantidad": pqty,
                    "color": PRESENTATION_COLORS[idx % len(PRESENTATION_COLORS)],
                })
        else:
            for idx, (pname, _) in enumerate(sorted_pres):
                presentaciones.append({
                    "name": pname,
                    "value": 0,
                    "cantidad": 0,
                    "color": PRESENTATION_COLORS[idx % len(PRESENTATION_COLORS)],
                })

        cursor.execute("SELECT nombre, stock_actual, stock_minimo, unidad FROM ingredientes WHERE stock_actual <= stock_minimo")
        alertas = cursor.fetchall()

        total_ventas = float(kpis.get("ventas") or 0)
        total_pedidos = int(kpis.get("pedidos") or 0)
        marketing = build_marketing_metrics(cursor, total_ventas, total_pedidos, clientes_rows)

    return jsonify({
        "kpis": {**kpis, "recurrentes": recurrentes, "resenas": resenas, **uds},
        "alertas": alertas,
        "evolucion_ventas": evolucion_ventas,
        "sabores": sabores,
        "presentaciones": presentaciones,
        "estados_pedidos": estados_pedidos,
        "marketing": marketing,
    })


@dashboard_bp.post("/visit")
def register_visit():
    data = request.get_json(silent=True) or {}
    session_token = (data.get("session_token") or "").strip()[:80] or None
    ruta = (data.get("ruta") or "/").strip()[:120]
    canal = (data.get("canal") or "PWA").strip()[:40]

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            if session_token:
                cursor.execute("SELECT id FROM visitas_tienda WHERE session_token = %s LIMIT 1", (session_token,))
                if cursor.fetchone():
                    return jsonify({"counted": False}), 200
            cursor.execute(
                "INSERT INTO visitas_tienda (session_token, ruta, canal) VALUES (%s, %s, %s)",
                (session_token, ruta, canal),
            )
        conn.commit()
    except Exception:
        try:
            conn.rollback()
        except Exception:
            pass
    return jsonify({"counted": True}), 201


@dashboard_bp.put("/goal")
@token_required
def update_sales_goal():
    data = request.get_json(silent=True) or {}
    objetivo = round(float(data.get("objetivo") or 0), 2)
    periodo = (data.get("periodo") or "Noviembre 2026").strip()
    if objetivo <= 0:
        return jsonify({"error": "La meta debe ser mayor a $0"}), 400

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO metas_marketing (id, periodo, meta_ventas)
                VALUES (1, %s, %s)
                ON DUPLICATE KEY UPDATE periodo = VALUES(periodo), meta_ventas = VALUES(meta_ventas)
                """,
                (periodo, objetivo),
            )
        conn.commit()
    except Exception as exc:
        conn.rollback()
        return jsonify({"error": f"No se pudo actualizar la meta: {exc}"}), 400

    return jsonify({"message": "Meta actualizada"})


@dashboard_bp.post("/ads")
@token_required
def create_ad_campaign():
    data = request.get_json(silent=True) or {}
    campana = (data.get("campana") or "").strip()
    canal = (data.get("canal") or "Instagram Ads").strip()
    inversion = round(float(data.get("monto_invertido") or 0), 2)
    ingresos = round(float(data.get("ingresos_generados") or 0), 2)

    if not campana or inversion <= 0:
        return jsonify({"error": "Ingresa el nombre de la campaña y una inversión mayor a $0"}), 400

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO gastos_publicidad (campana, canal, monto_invertido, ingresos_generados, fecha_inicio, activo)
                VALUES (%s, %s, %s, %s, CURDATE(), 1)
                """,
                (campana, canal, inversion, ingresos),
            )
        conn.commit()
    except Exception as exc:
        conn.rollback()
        return jsonify({"error": f"No se pudo registrar la campaña: {exc}"}), 400

    return jsonify({"message": "Campaña registrada"}), 201


@dashboard_bp.delete("/ads/<int:ad_id>")
@token_required
def delete_ad_campaign(ad_id):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM gastos_publicidad WHERE id = %s", (ad_id,))
        conn.commit()
    except Exception as exc:
        conn.rollback()
        return jsonify({"error": f"No se pudo eliminar la campaña: {exc}"}), 400

    return jsonify({"message": "Campaña eliminada"})