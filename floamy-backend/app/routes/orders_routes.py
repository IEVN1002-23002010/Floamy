import random
import re
from datetime import datetime, date
from flask import Blueprint, request, jsonify
from app.extensions import get_db_connection

orders_bp = Blueprint("orders", __name__)

STAGE_TO_STATUS = {
    0: "Pendiente",
    1: "En preparación",
    2: "Listo para recolección",
    3: "Entregado",
}

MESES_CORTOS = (
    "", "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
)

MESES_LARGOS = (
    "", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
)


def status_to_stage_index(status: str) -> int:
    s = (status or "").strip().lower()
    if "entreg" in s or "complet" in s:
        return 3
    if "listo" in s or "recol" in s:
        return 2
    if "prep" in s or "proc" in s:
        return 1
    return 0


def resolve_enum_col(schema: list, col_name: str, raw_val: str, keyword_groups: list, default_text: str) -> str:
    raw_lower = (raw_val or "").strip().lower()
    for col in schema:
        if col["Field"] == col_name:
            ctype = str(col.get("Type") or "")
            if ctype.lower().startswith("enum("):
                vals = re.findall(r"'([^']*)'", ctype)
                if vals:
                    for v in vals:
                        if v.lower() == raw_lower:
                            return v
                    for group in keyword_groups:
                        if any(k in raw_lower for k in group):
                            for v in vals:
                                if any(k in v.lower() for k in group):
                                    return v
                    return vals[0]
    return raw_val.strip() if (raw_val and raw_val.strip()) else default_text


def resolve_db_status(ped_schema: list, stage: int) -> str:
    default_label = STAGE_TO_STATUS.get(stage, "Pendiente")
    groups = [
        ("pend",),
        ("prep", "proc"),
        ("listo", "recol"),
        ("entreg", "complet"),
    ]
    return resolve_enum_col(ped_schema, "estado", default_label, groups, default_label)


def fill_required_defaults(schema: list, row_data: dict):
    for col in schema:
        fname = col["Field"]
        if fname in row_data:
            continue
        is_required = col.get("Null") == "NO" and col.get("Default") is None
        is_auto = "auto_increment" in (col.get("Extra") or "").lower()
        if is_required and not is_auto:
            ctype = (col.get("Type") or "").lower()
            if any(t in ctype for t in ("int", "decimal", "float", "double", "numeric")):
                row_data[fname] = 0
            else:
                row_data[fname] = ""


def resolve_product_id(cursor, item: dict):
    base = item.get("product") if isinstance(item.get("product"), dict) else item

    for source in (item, base):
        for key in ("producto_id", "productId", "id"):
            val = source.get(key)
            if isinstance(val, int) and val > 0:
                return val
            if isinstance(val, str):
                m = re.match(r"^(\d+)", val.strip())
                if m:
                    return int(m.group(1))

    name = (item.get("name") or item.get("nombre") or base.get("name") or base.get("nombre") or "").strip()
    size = (item.get("size") or item.get("tamano") or base.get("size") or base.get("tamano") or "").strip()

    if name:
        cursor.execute("SELECT * FROM productos WHERE nombre = %s", (name,))
        matches = cursor.fetchall()
        if matches:
            if size:
                for m in matches:
                    prod_size = str(m.get("tamano") or m.get("presentacion") or "")
                    if size.lower() in prod_size.lower():
                        return m["id"]
            return matches[0]["id"]

    cursor.execute("SELECT id FROM productos ORDER BY id ASC LIMIT 1")
    fallback = cursor.fetchone()
    return fallback["id"] if fallback else None


def extract_date_meta(row: dict) -> dict:
    dt = None
    for key in ("fecha", "fecha_pedido", "created_at", "creado_en", "fecha_creacion"):
        val = row.get(key)
        if isinstance(val, datetime):
            dt = val
            break
        if isinstance(val, date):
            dt = datetime(val.year, val.month, val.day)
            break
        if isinstance(val, str) and len(val.strip()) >= 10:
            raw = val.strip()
            for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d"):
                try:
                    dt = datetime.strptime(raw[:len(fmt)], fmt)
                    break
                except Exception:
                    pass
            if dt:
                break

    if dt is None:
        for val in row.values():
            if isinstance(val, datetime):
                dt = val
                break
            if isinstance(val, date):
                dt = datetime(val.year, val.month, val.day)
                break

    if dt is None:
        return {
            "display": "",
            "isoDate": "",
            "isoMonth": "",
            "dayLabel": "Sin fecha",
            "monthLabel": "Sin fecha",
        }

    return {
        "display": f"{dt.day:02d} {MESES_CORTOS[dt.month]}, {dt.hour:02d}:{dt.minute:02d}",
        "isoDate": dt.strftime("%Y-%m-%d"),
        "isoMonth": dt.strftime("%Y-%m"),
        "dayLabel": f"{dt.day:02d} {MESES_CORTOS[dt.month]} {dt.year}",
        "monthLabel": f"{MESES_LARGOS[dt.month]} {dt.year}",
    }


@orders_bp.route("", methods=["GET"])
@orders_bp.route("/", methods=["GET"])
def list_orders():
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM pedidos ORDER BY id DESC")
        pedidos = cursor.fetchall()

        clientes_map = {}
        try:
            cursor.execute("SELECT * FROM clientes")
            for c in cursor.fetchall():
                clientes_map[c["id"]] = c.get("nombre") or c.get("nombre_completo") or c.get("name") or "Cliente"
        except Exception:
            pass

        productos_map = {}
        try:
            cursor.execute("SELECT * FROM productos")
            for pr in cursor.fetchall():
                productos_map[pr["id"]] = pr
        except Exception:
            pass

        result = []
        for p in pedidos:
            pid = p["id"]
            order_folio = p.get("folio") or f"#FL-{pid}"
            raw_status = p.get("estado") or "Pendiente"
            stage = p.get("etapa")
            if stage is None:
                stage = status_to_stage_index(raw_status)
            else:
                stage = max(0, min(3, int(stage)))

            display_status = STAGE_TO_STATUS.get(stage, raw_status)

            customer_name = (
                p.get("cliente_nombre")
                or p.get("cliente")
                or clientes_map.get(p.get("cliente_id"))
                or "Cliente Floamy"
            )

            items = []
            try:
                cursor.execute("SELECT * FROM detalle_pedido WHERE pedido_id = %s", (pid,))
                for d in cursor.fetchall():
                    prod = productos_map.get(d.get("producto_id"), {})
                    p_name = (
                        d.get("nombre_producto")
                        or d.get("nombre")
                        or prod.get("nombre")
                        or "Helado"
                    )
                    p_size = (
                        d.get("tamano")
                        or d.get("presentacion")
                        or prod.get("tamano")
                        or prod.get("presentacion")
                        or "Vaso 8 oz"
                    )
                    qty = int(d.get("cantidad") or 1)
                    top_txt = (d.get("toppings") or "").strip()
                    extra = f" (+ {top_txt})" if top_txt else ""
                    items.append(f"{qty} × {p_name} · {p_size}{extra}")
            except Exception:
                pass

            payment_method = p.get("metodo_pago") or p.get("metodo") or "Efectivo"
            payment_folio = ""
            for pay_table in ("pagos_simulados", "pagos"):
                try:
                    cursor.execute(f"SELECT * FROM {pay_table} WHERE pedido_id = %s ORDER BY id DESC LIMIT 1", (pid,))
                    pago = cursor.fetchone()
                    if pago:
                        payment_method = pago.get("metodo") or pago.get("metodo_pago") or payment_method
                        payment_folio = pago.get("folio_pago") or pago.get("folio") or ""
                        break
                except Exception:
                    pass

            date_meta = extract_date_meta(p)
            canal_str = p.get("canal") or ("Sucursal" if "mostrador" in customer_name.lower() else "PWA")

            result.append({
                "id": order_folio,
                "dbId": pid,
                "orderFolio": order_folio,
                "folio": payment_folio or order_folio,
                "customer": customer_name,
                "cliente": customer_name,
                "canal": canal_str,
                "time": date_meta["display"],
                "date": date_meta["display"],
                "fecha": date_meta["display"],
                "isoDate": date_meta["isoDate"],
                "isoMonth": date_meta["isoMonth"],
                "dayLabel": date_meta["dayLabel"],
                "monthLabel": date_meta["monthLabel"],
                "status": display_status,
                "estado": display_status,
                "stage": stage,
                "total": float(p.get("total") or 0),
                "payment": payment_method,
                "paymentMethod": payment_method,
                "metodo_pago": payment_method,
                "items": items,
            })

    return jsonify(result)


@orders_bp.route("", methods=["POST"])
@orders_bp.route("/", methods=["POST"])
def create_order():
    data = request.get_json(silent=True) or {}
    customer = (data.get("customer") or data.get("customerName") or data.get("cliente") or "Cliente Web").strip()
    raw_payment = str(data.get("paymentMethod") or data.get("payment") or data.get("metodo_pago") or "Efectivo").strip()
    raw_canal = str(data.get("canal") or ("Sucursal" if "mostrador" in customer.lower() else "PWA"))
    items = data.get("items") or data.get("productos") or []

    if not items:
        return jsonify({"error": "El carrito está vacío"}), 400

    normalized_items = []
    for raw_item in items:
        base = raw_item.get("product") if isinstance(raw_item.get("product"), dict) else raw_item
        qty = int(raw_item.get("qty") or raw_item.get("cantidad") or raw_item.get("quantity") or 1)
        price = float(
            raw_item.get("price")
            or raw_item.get("precio")
            or raw_item.get("unitPrice")
            or base.get("price")
            or base.get("precio")
            or 0
        )
        name = str(raw_item.get("name") or raw_item.get("nombre") or base.get("name") or base.get("nombre") or "Helado").strip()
        size = str(raw_item.get("size") or raw_item.get("tamano") or base.get("size") or base.get("tamano") or "Vaso 8 oz").strip()
        toppings_raw = raw_item.get("toppings") or []
        toppings_str = ", ".join(toppings_raw) if isinstance(toppings_raw, list) else str(toppings_raw).strip()
        topping_ids = raw_item.get("toppingIds") or []
        normalized_items.append({
            "raw": raw_item,
            "qty": qty,
            "price": price,
            "name": name,
            "size": size,
            "toppings": toppings_str,
            "toppingIds": topping_ids,
        })

    calc_subtotal = sum(i["qty"] * i["price"] for i in normalized_items)
    total = float(data.get("total") if data.get("total") is not None else calc_subtotal)
    subtotal = float(data.get("subtotal") if data.get("subtotal") is not None else (calc_subtotal or total))
    raw_discount = data.get("descuento") if data.get("descuento") is not None else data.get("discount")
    descuento = float(raw_discount if raw_discount is not None else max(0.0, round(subtotal - total, 2)))

    if data.get("stage") is not None:
        init_stage = max(0, min(3, int(data["stage"])))
    elif data.get("status") or data.get("estado"):
        init_stage = status_to_stage_index(str(data.get("status") or data.get("estado")))
    elif "mostrador" in customer.lower():
        init_stage = 3
    else:
        init_stage = 0

    folio = f"#FL-{random.randint(1000, 9999)}"
    payment_folio = f"FP-{random.randint(1000000, 9999999)}"

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SHOW COLUMNS FROM pedidos")
            ped_schema = cursor.fetchall()
            ped_cols = {row["Field"] for row in ped_schema}

            payment_method = resolve_enum_col(
                ped_schema,
                "metodo_pago",
                raw_payment,
                [("efectivo",), ("tarjeta",), ("transferencia", "spei")],
                "Efectivo",
            )
            canal_val = resolve_enum_col(
                ped_schema,
                "canal",
                raw_canal,
                [("pos", "mostrador", "tienda", "sucursal"), ("pwa", "web", "online")],
                "PWA",
            )

            cliente_id = None
            if "cliente_id" in ped_cols:
                cursor.execute("SHOW COLUMNS FROM clientes")
                cli_schema = cursor.fetchall()
                cli_cols = {row["Field"] for row in cli_schema}
                name_col = "nombre" if "nombre" in cli_cols else ("nombre_completo" if "nombre_completo" in cli_cols else None)
                if name_col:
                    cursor.execute(f"SELECT id FROM clientes WHERE {name_col} = %s LIMIT 1", (customer,))
                    found_cli = cursor.fetchone()
                    if found_cli:
                        cliente_id = found_cli["id"]
                    else:
                        cli_data = {name_col: customer}
                        raw_email = (data.get("correo") or data.get("email") or "").strip()
                        unique_email = raw_email or f"cliente.{random.randint(100000, 999999)}@floamy.local"
                        if "correo" in cli_cols:
                            cli_data["correo"] = unique_email
                        elif "email" in cli_cols:
                            cli_data["email"] = unique_email

                        fill_required_defaults(cli_schema, cli_data)

                        for col in cli_schema:
                            fname = col["Field"]
                            if col.get("Key") == "UNI" and fname not in (name_col, "correo", "email"):
                                if not cli_data.get(fname):
                                    cli_data[fname] = f"{random.randint(1000000000, 9999999999)}"

                        c_cols = ", ".join(cli_data.keys())
                        c_ph = ", ".join(["%s"] * len(cli_data))
                        cursor.execute(f"INSERT INTO clientes ({c_cols}) VALUES ({c_ph})", tuple(cli_data.values()))
                        cliente_id = cursor.lastrowid

            ped_data = {}
            if "folio" in ped_cols:
                ped_data["folio"] = folio
            if "cliente_id" in ped_cols and cliente_id is not None:
                ped_data["cliente_id"] = cliente_id
            if "cliente_nombre" in ped_cols:
                ped_data["cliente_nombre"] = customer
            elif "cliente" in ped_cols:
                ped_data["cliente"] = customer
            if "usuario_id" in ped_cols and data.get("usuario_id"):
                try:
                    uid = int(data["usuario_id"])
                    cursor.execute("SELECT id FROM usuarios WHERE id = %s LIMIT 1", (uid,))
                    if cursor.fetchone():
                        ped_data["usuario_id"] = uid
                except Exception:
                    pass
            if "subtotal" in ped_cols:
                ped_data["subtotal"] = subtotal
            if "descuento" in ped_cols:
                ped_data["descuento"] = descuento
            if "total" in ped_cols:
                ped_data["total"] = total
            if "metodo_pago" in ped_cols:
                ped_data["metodo_pago"] = payment_method
            if "canal" in ped_cols:
                ped_data["canal"] = canal_val
            if "estado" in ped_cols:
                ped_data["estado"] = resolve_db_status(ped_schema, init_stage)
            if "etapa" in ped_cols:
                ped_data["etapa"] = init_stage

            fill_required_defaults(ped_schema, ped_data)

            p_cols = ", ".join(ped_data.keys())
            p_ph = ", ".join(["%s"] * len(ped_data))
            cursor.execute(f"INSERT INTO pedidos ({p_cols}) VALUES ({p_ph})", tuple(ped_data.values()))
            pedido_id = cursor.lastrowid

            cursor.execute("SHOW COLUMNS FROM detalle_pedido")
            det_schema = cursor.fetchall()
            det_cols = {row["Field"] for row in det_schema}

            for item in normalized_items:
                prod_id = resolve_product_id(cursor, item["raw"])
                qty = item["qty"]
                price = item["price"]

                det_data = {"pedido_id": pedido_id}
                if "producto_id" in det_cols and prod_id is not None:
                    det_data["producto_id"] = prod_id
                if "nombre_producto" in det_cols:
                    det_data["nombre_producto"] = item["name"]
                if "tamano" in det_cols:
                    det_data["tamano"] = item["size"]
                if "presentacion" in det_cols:
                    det_data["presentacion"] = item["size"]
                if "toppings" in det_cols and item.get("toppings"):
                    det_data["toppings"] = item["toppings"]
                if "cantidad" in det_cols:
                    det_data["cantidad"] = qty
                if "precio_unitario" in det_cols:
                    det_data["precio_unitario"] = price
                elif "precio" in det_cols:
                    det_data["precio"] = price
                if "subtotal" in det_cols:
                    det_data["subtotal"] = round(qty * price, 2)

                fill_required_defaults(det_schema, det_data)

                d_cols = ", ".join(det_data.keys())
                d_ph = ", ".join(["%s"] * len(det_data))
                cursor.execute(f"INSERT INTO detalle_pedido ({d_cols}) VALUES ({d_ph})", tuple(det_data.values()))

                if prod_id is not None:
                    try:
                        cursor.execute(
                            "UPDATE productos SET stock = GREATEST(0, stock - %s) WHERE id = %s",
                            (qty, prod_id),
                        )
                    except Exception:
                        pass

                for tid in item.get("toppingIds") or []:
                    try:
                        cursor.execute(
                            "UPDATE toppings SET stock = GREATEST(0, stock - %s) WHERE id = %s",
                            (qty, int(tid)),
                        )
                    except Exception:
                        pass

            for pay_table in ("pagos_simulados", "pagos"):
                try:
                    cursor.execute(f"SHOW COLUMNS FROM {pay_table}")
                    pag_schema = cursor.fetchall()
                    pag_cols = {row["Field"] for row in pag_schema}
                    pag_data = {"pedido_id": pedido_id}

                    method_col = "metodo" if "metodo" in pag_cols else ("metodo_pago" if "metodo_pago" in pag_cols else None)
                    if method_col:
                        pag_data[method_col] = resolve_enum_col(
                            pag_schema,
                            method_col,
                            raw_payment,
                            [("efectivo",), ("tarjeta",), ("transferencia", "spei")],
                            raw_payment or "Efectivo",
                        )

                    pag_status = resolve_enum_col(
                        pag_schema,
                        "estado",
                        "Pagado",
                        [("pagado", "complet"), ("pend",)],
                        "Pagado",
                    )

                    if "folio_pago" in pag_cols:
                        pag_data["folio_pago"] = payment_folio
                    elif "folio" in pag_cols:
                        pag_data["folio"] = payment_folio
                    if "monto" in pag_cols:
                        pag_data["monto"] = total
                    elif "total" in pag_cols:
                        pag_data["total"] = total
                    if "estado" in pag_cols:
                        pag_data["estado"] = pag_status

                    fill_required_defaults(pag_schema, pag_data)

                    pg_cols = ", ".join(pag_data.keys())
                    pg_ph = ", ".join(["%s"] * len(pag_data))
                    cursor.execute(f"INSERT INTO {pay_table} ({pg_cols}) VALUES ({pg_ph})", tuple(pag_data.values()))
                    break
                except Exception:
                    continue

        conn.commit()
    except Exception as exc:
        try:
            conn.rollback()
        except Exception:
            pass
        return jsonify({"error": f"No se pudo guardar el pedido: {exc}"}), 400

    return jsonify({
        "id": folio,
        "dbId": pedido_id,
        "folio": folio,
        "paymentFolio": payment_folio,
        "total": total,
        "status": STAGE_TO_STATUS.get(init_stage, "Pendiente"),
        "stage": init_stage,
    }), 201


@orders_bp.route("/<order_id>/stage", methods=["PATCH", "PUT", "POST"])
@orders_bp.route("/<order_id>", methods=["PATCH", "PUT"])
def update_stage(order_id):
    data = request.get_json(silent=True) or {}
    if data.get("stage") is not None:
        stage = int(data["stage"])
    elif data.get("etapa") is not None:
        stage = int(data["etapa"])
    else:
        stage = status_to_stage_index(str(data.get("status") or data.get("estado") or ""))

    stage = max(0, min(3, stage))
    display_status = STAGE_TO_STATUS.get(stage, "Pendiente")

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SHOW COLUMNS FROM pedidos")
            ped_schema = cursor.fetchall()
            ped_cols = {row["Field"] for row in ped_schema}

            db_status = resolve_db_status(ped_schema, stage)

            clean_id = str(order_id).strip()
            is_numeric = clean_id.isdigit()
            where_clause = "id = %s" if is_numeric else "folio = %s"
            where_val = int(clean_id) if is_numeric else clean_id

            if "etapa" in ped_cols and "estado" in ped_cols:
                cursor.execute(
                    f"UPDATE pedidos SET estado = %s, etapa = %s WHERE {where_clause}",
                    (db_status, stage, where_val),
                )
            elif "etapa" in ped_cols:
                cursor.execute(
                    f"UPDATE pedidos SET etapa = %s WHERE {where_clause}",
                    (stage, where_val),
                )
            elif "estado" in ped_cols:
                cursor.execute(
                    f"UPDATE pedidos SET estado = %s WHERE {where_clause}",
                    (db_status, where_val),
                )
        conn.commit()
    except Exception as exc:
        try:
            conn.rollback()
        except Exception:
            pass
        return jsonify({"error": f"No se pudo actualizar etapa: {exc}"}), 400

    return jsonify({"message": "Etapa actualizada", "stage": stage, "status": display_status})