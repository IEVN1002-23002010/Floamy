import math
import random
import re
from datetime import datetime, date
from flask import Blueprint, request, jsonify
from app.extensions import get_db_connection

from app.utils.decorators import token_required
from decimal import Decimal
from app.routes.coupons_routes import available_coupon, discount_for

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


def _get_columns(cursor, table_name):
    try:
        cursor.execute(f"SHOW COLUMNS FROM {table_name}")
        return {row["Field"] for row in cursor.fetchall()}
    except Exception:
        return set()


def _infer_liters(pres_row, fallback_size=""):
    if pres_row:
        raw = pres_row.get("litros_consumidos")
        if raw is not None and float(raw) > 0:
            return float(raw)
        fallback_size = pres_row.get("nombre") or fallback_size
    s = (fallback_size or "").lower()
    if "medio" in s or "1/2" in s or "500" in s:
        return 0.5
    if "litro" in s or "1l" in s or "1000" in s:
        return 1.0
    if "12" in s:
        return 0.35
    if "cono" in s:
        return 0.15
    return 0.24


def _get_presentation_disposable_ids(pres_row):
    if not pres_row:
        return []
    ids = []
    for key in ("ingrediente_desechable_id", "empaque_ingrediente_id", "cuchara_ingrediente_id"):
        val = pres_row.get(key)
        if val and int(val) not in ids:
            ids.append(int(val))
    return ids


def _sync_all_product_stocks(cursor, ing_stock_col: str = "stock_actual"):
    cursor.execute("SELECT id, COALESCE(stock_litros, 0) AS stock_litros FROM helados")
    helados = cursor.fetchall()

    cursor.execute("SELECT * FROM presentaciones")
    presentaciones = cursor.fetchall()

    ing_stocks = {}
    try:
        cursor.execute(f"SELECT id, {ing_stock_col} AS stock_actual FROM ingredientes")
        for row in cursor.fetchall():
            ing_stocks[int(row["id"])] = float(row["stock_actual"] or 0)
    except Exception:
        pass

    for h in helados:
        hid = int(h["id"])
        stock_litros = float(h["stock_litros"] or 0)
        for pres in presentaciones:
            pres_id = int(pres["id"])
            litros_unit = _infer_liters(pres)
            if litros_unit <= 0 or stock_litros <= 0:
                unidades = 0
            else:
                unidades = int((stock_litros + 1e-6) // litros_unit)
                for des_id in _get_presentation_disposable_ids(pres):
                    if des_id in ing_stocks:
                        unidades = min(unidades, max(0, int(ing_stocks[des_id])))

            cursor.execute(
                "UPDATE productos SET stock = %s WHERE helado_id = %s AND presentacion_id = %s",
                (max(0, unidades), hid, pres_id),
            )


def _resolve_item_toppings(cursor, item: dict):
    resolved = []
    seen_ids = set()

    for tid in item.get("toppingIds") or []:
        try:
            tid_int = int(tid)
            if tid_int in seen_ids:
                continue
            cursor.execute("SELECT * FROM toppings WHERE id = %s LIMIT 1", (tid_int,))
            row = cursor.fetchone()
            if row:
                seen_ids.add(row["id"])
                resolved.append(row)
        except Exception:
            pass

    if not resolved and item.get("toppings"):
        raw_names = [n.strip() for n in str(item["toppings"]).split(",") if n.strip()]
        for name in raw_names:
            try:
                cursor.execute("SELECT * FROM toppings WHERE LOWER(nombre) = %s LIMIT 1", (name.lower(),))
                row = cursor.fetchone()
                if row and row["id"] not in seen_ids:
                    seen_ids.add(row["id"])
                    resolved.append(row)
            except Exception:
                pass

    return resolved


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
        for key in ("producto_id", "productId"):
            val = source.get(key)
            if isinstance(val, int) and val > 0:
                return val
            if isinstance(val, str):
                m = re.match(r"^(\d+)", val.strip())
                if m:
                    return int(m.group(1))

    top_id = item.get("id")
    if isinstance(top_id, int) and top_id > 0:
        return top_id
    if isinstance(top_id, str):
        m = re.match(r"^(\d+)", top_id.strip())
        if m:
            return int(m.group(1))

    name = (item.get("name") or item.get("nombre") or base.get("name") or base.get("nombre") or "").strip()
    size = (item.get("size") or item.get("tamano") or base.get("size") or base.get("tamano") or "").strip()

    if name:
        cursor.execute(
            """
            SELECT p.id, pr.nombre AS presentacion
            FROM productos p
            INNER JOIN helados h ON p.helado_id = h.id
            INNER JOIN presentaciones pr ON p.presentacion_id = pr.id
            WHERE h.nombre_comercial = %s
            """,
            (name,),
        )
        matches = cursor.fetchall()
        if matches:
            if size:
                for m in matches:
                    if size.lower() in str(m.get("presentacion") or "").lower():
                        return m["id"]
            return matches[0]["id"]

    base_id = base.get("id")
    if isinstance(base_id, int) and base_id > 0:
        return base_id

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
    filter_user_id = request.args.get("usuario_id", type=int)

    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM pedidos ORDER BY id DESC")
        pedidos = cursor.fetchall()

        usuarios_map = {}
        try:
            cursor.execute("SELECT id, nombre, correo FROM usuarios")
            for u in cursor.fetchall():
                usuarios_map[u["id"]] = u
        except Exception:
            pass

        clientes_map = {}
        try:
            cursor.execute("SELECT * FROM clientes")
            for c in cursor.fetchall():
                clientes_map[c["id"]] = c
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
            cli_row = clientes_map.get(p.get("cliente_id")) or {}
            uid = p.get("usuario_id") or cli_row.get("usuario_id")
            user_row = usuarios_map.get(uid) or {}

            if filter_user_id and uid != filter_user_id:
                continue

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
                or cli_row.get("nombre")
                or cli_row.get("nombre_completo")
                or user_row.get("nombre")
                or "Cliente Floamy"
            )
            customer_email = (
                p.get("correo")
                or cli_row.get("correo")
                or cli_row.get("email")
                or user_row.get("correo")
                or ""
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
                "usuario_id": uid,
                "correo": customer_email,
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
@token_required
def create_order():
    data = request.get_json(silent=True) or {}
    customer = (data.get("customer") or data.get("customerName") or data.get("cliente") or "").strip()
    raw_payment = str(data.get("paymentMethod") or data.get("payment") or data.get("metodo_pago") or "Efectivo").strip()
    is_pos_order = "mostrador" in customer.lower() or str(data.get("canal") or "").lower() in ("sucursal", "pos")
    raw_canal = str(data.get("canal") or ("Sucursal" if is_pos_order else "PWA"))
    items = data.get("items") or data.get("productos") or []

    if not items:
        return jsonify({"error": "El carrito está vacío"}), 400

    conn = get_db_connection()
    registered_user = None
    raw_uid = None if is_pos_order else request.user.get("user_id")
    if raw_uid:
        try:
            with conn.cursor() as cursor:
                cursor.execute(
                    "SELECT id, nombre, correo, activo FROM usuarios WHERE id = %s LIMIT 1",
                    (int(raw_uid),),
                )
                registered_user = cursor.fetchone()
        except Exception:
            registered_user = None

    if not is_pos_order and (not registered_user or not registered_user.get("activo")):
        return jsonify({"error": "Debes iniciar sesión o registrarte para confirmar tu pedido."}), 401

    if not customer:
        customer = registered_user["nombre"] if registered_user else "Cliente Mostrador"

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
            "resolved_prod_id": None,
            "resolved_toppings": [],
        })

    coupon_code = str(data.get("codigo_cupon") or "").strip()
    coupon = None
    subtotal = Decimal("0.00")
    if any(item["qty"] < 1 for item in normalized_items):
        return jsonify(error="Cantidad inválida."), 400

    if data.get("stage") is not None:
        init_stage = max(0, min(3, int(data["stage"])))
    elif data.get("status") or data.get("estado"):
        init_stage = status_to_stage_index(str(data.get("status") or data.get("estado")))
    elif is_pos_order:
        init_stage = 3
    else:
        init_stage = 0

    folio = f"#FL-{random.randint(1000, 9999)}"
    payment_folio = f"FP-{random.randint(1000000, 9999999)}"

    try:
        with conn.cursor() as cursor:
            cursor.execute("SHOW COLUMNS FROM pedidos")
            ped_schema = cursor.fetchall()
            ped_cols = {row["Field"] for row in ped_schema}

            hel_cols = _get_columns(cursor, "helados")
            ing_cols = _get_columns(cursor, "ingredientes")
            ing_stock_col = "stock_actual" if "stock_actual" in ing_cols else "stock"
            mov_cols = _get_columns(cursor, "movimientos_inventario")

            litros_requeridos = {}
            desechables_requeridos = {}
            toppings_ing_requeridos = {}
            toppings_porciones_requeridas = {}

            for item in normalized_items:
                pr_row = None
                pid_check = resolve_product_id(cursor, item["raw"])
                item["resolved_prod_id"] = pid_check
                if pid_check is not None:
                    cursor.execute("SELECT helado_id, presentacion_id FROM productos WHERE id = %s", (pid_check,))
                    p_row = cursor.fetchone()
                    if p_row:
                        cursor.execute("SELECT * FROM presentaciones WHERE id = %s", (p_row["presentacion_id"],))
                        pr_row = cursor.fetchone()

                        hid = p_row["helado_id"]
                        litros_item = round(_infer_liters(pr_row, item["size"]) * item["qty"], 4)
                        litros_requeridos[hid] = round(litros_requeridos.get(hid, 0.0) + litros_item, 4)

                        for des_id in _get_presentation_disposable_ids(pr_row):
                            desechables_requeridos[des_id] = desechables_requeridos.get(des_id, 0) + item["qty"]

                resolved_tops = _resolve_item_toppings(cursor, item)
                if not pr_row:
                    raise ValueError("Producto o presentación no disponible.")
                unit_price = Decimal(str(pr_row["precio"])) + sum(Decimal(str(t["precio"])) for t in resolved_tops)
                item["price"] = float(unit_price)
                subtotal += unit_price * item["qty"]
                item["resolved_toppings"] = resolved_tops
                for t_row in resolved_tops:
                    tid = int(t_row["id"])
                    toppings_porciones_requeridas[tid] = toppings_porciones_requeridas.get(tid, 0) + item["qty"]
                    ing_id = t_row.get("ingrediente_id")
                    if ing_id:
                        porcion = float(t_row.get("cantidad_por_porcion") or 0.04)
                        cant_ing = round(porcion * item["qty"], 4)
                        toppings_ing_requeridos[int(ing_id)] = round(
                            toppings_ing_requeridos.get(int(ing_id), 0.0) + cant_ing, 4
                        )

            if "stock_litros" in hel_cols:
                for hid, req_l in litros_requeridos.items():
                    cursor.execute(
                        "SELECT nombre_comercial, COALESCE(stock_litros, 0) AS stock_litros FROM helados WHERE id = %s",
                        (hid,),
                    )
                    h_row = cursor.fetchone()
                    if h_row and float(h_row["stock_litros"]) < req_l:
                        return jsonify({
                            "error": f"Stock insuficiente de {h_row['nombre_comercial']}: quedan {float(h_row['stock_litros'])} L."
                        }), 400

            for des_id, req_qty in desechables_requeridos.items():
                cursor.execute(
                    f"SELECT nombre, {ing_stock_col} AS stock_actual FROM ingredientes WHERE id = %s",
                    (des_id,),
                )
                i_row = cursor.fetchone()
                if i_row and float(i_row["stock_actual"] or 0) < req_qty:
                    return jsonify({
                        "error": f"Solo hay {int(float(i_row['stock_actual'] or 0))} unidades disponibles de {i_row['nombre']}."
                    }), 400

            for ing_id, req_cant in toppings_ing_requeridos.items():
                cursor.execute(
                    f"SELECT nombre, unidad, {ing_stock_col} AS stock_actual FROM ingredientes WHERE id = %s",
                    (ing_id,),
                )
                i_row = cursor.fetchone()
                if i_row and float(i_row["stock_actual"] or 0) < req_cant:
                    return jsonify({
                        "error": f"Stock insuficiente de topping ({i_row['nombre']}): quedan {float(i_row['stock_actual'])} {i_row['unidad']}."
                    }), 400

            for tid, req_porciones in toppings_porciones_requeridas.items():
                cursor.execute("SELECT nombre, stock, ingrediente_id FROM toppings WHERE id = %s", (tid,))
                t_row = cursor.fetchone()
                if t_row and not t_row.get("ingrediente_id") and int(t_row.get("stock") or 0) < req_porciones:
                    return jsonify({
                        "error": f"Solo quedan {int(t_row['stock'])} porciones de {t_row['nombre']}."
                    }), 400

            conn.begin()
            descuento = Decimal("0.00")
            if coupon_code:
                coupon = available_coupon(cursor, coupon_code, lock=True)
                descuento = discount_for(coupon, subtotal)
            total = subtotal - descuento
            if data.get("total") is not None and abs(Decimal(str(data["total"])) - total) >= Decimal(".005"):
                raise ValueError("El total cambió. Revisa el carrito y vuelve a aplicar el cupón.")
            subtotal, descuento, total = map(float, (subtotal, descuento, total))
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
                email_col = "correo" if "correo" in cli_cols else ("email" if "email" in cli_cols else None)

                found_cli = None
                if registered_user and "usuario_id" in cli_cols:
                    cursor.execute("SELECT id FROM clientes WHERE usuario_id = %s LIMIT 1", (registered_user["id"],))
                    found_cli = cursor.fetchone()
                if not found_cli and registered_user and email_col:
                    cursor.execute(f"SELECT id FROM clientes WHERE {email_col} = %s LIMIT 1", (registered_user["correo"],))
                    found_cli = cursor.fetchone()
                if not found_cli and name_col:
                    cursor.execute(f"SELECT id FROM clientes WHERE {name_col} = %s LIMIT 1", (customer,))
                    found_cli = cursor.fetchone()

                if found_cli:
                    cliente_id = found_cli["id"]
                elif name_col:
                    cli_data = {name_col: customer}
                    if registered_user and "usuario_id" in cli_cols:
                        cli_data["usuario_id"] = registered_user["id"]
                    raw_email = (registered_user["correo"] if registered_user else "") or (data.get("correo") or data.get("email") or "").strip()
                    unique_email = raw_email or f"cliente.{random.randint(100000, 999999)}@floamy.local"
                    if email_col:
                        cli_data[email_col] = unique_email

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
            if "usuario_id" in ped_cols and registered_user:
                ped_data["usuario_id"] = registered_user["id"]
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
            if coupon:
                cursor.execute("INSERT INTO canjes_cupon(pedido_id,cupon_id,codigo,descuento) VALUES (%s,%s,%s,%s)",
                               (pedido_id, coupon["id"], coupon["codigo"], descuento))
                cursor.execute("UPDATE cupones SET usados=usados+1 WHERE id=%s", (coupon["id"],))

            cursor.execute("SHOW COLUMNS FROM detalle_pedido")
            det_schema = cursor.fetchall()
            det_cols = {row["Field"] for row in det_schema}

            for item in normalized_items:
                prod_id = item["resolved_prod_id"] if item["resolved_prod_id"] is not None else resolve_product_id(cursor, item["raw"])
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
                    cursor.execute("SELECT helado_id, presentacion_id FROM productos WHERE id = %s", (prod_id,))
                    prod_row = cursor.fetchone()
                    if prod_row:
                        cursor.execute("SELECT * FROM presentaciones WHERE id = %s", (prod_row["presentacion_id"],))
                        pres_row = cursor.fetchone()

                        if "stock_litros" in hel_cols:
                            litros_item = round(_infer_liters(pres_row, item["size"]) * qty, 4)
                            cursor.execute(
                                "UPDATE helados SET stock_litros = GREATEST(0, ROUND(COALESCE(stock_litros, 0) - %s, 4)) WHERE id = %s",
                                (litros_item, prod_row["helado_id"]),
                            )
                        else:
                            cursor.execute(
                                "UPDATE productos SET stock = GREATEST(0, stock - %s) WHERE id = %s",
                                (qty, prod_id),
                            )

                        for des_id in _get_presentation_disposable_ids(pres_row):
                            cursor.execute(
                                f"UPDATE ingredientes SET {ing_stock_col} = GREATEST(0, {ing_stock_col} - %s) WHERE id = %s",
                                (qty, des_id),
                            )
                            if mov_cols:
                                mov_data = {"ingrediente_id": des_id, "cantidad": qty}
                                if "tipo" in mov_cols:
                                    mov_data["tipo"] = "salida"
                                elif "tipo_movimiento" in mov_cols:
                                    mov_data["tipo_movimiento"] = "salida"
                                if "motivo" in mov_cols:
                                    mov_data["motivo"] = f"Venta pedido {folio}"
                                elif "observaciones" in mov_cols:
                                    mov_data["observaciones"] = f"Venta pedido {folio}"
                                cols_sql = ", ".join(mov_data.keys())
                                ph_sql = ", ".join(["%s"] * len(mov_data))
                                cursor.execute(
                                    f"INSERT INTO movimientos_inventario ({cols_sql}) VALUES ({ph_sql})",
                                    tuple(mov_data.values()),
                                )

                for t_row in item.get("resolved_toppings") or []:
                    tid = int(t_row["id"])
                    ing_id = t_row.get("ingrediente_id")
                    if ing_id:
                        porcion = float(t_row.get("cantidad_por_porcion") or 0.04)
                        cant_ing = round(porcion * qty, 4)
                        cursor.execute(
                            f"UPDATE ingredientes SET {ing_stock_col} = GREATEST(0, {ing_stock_col} - %s) WHERE id = %s",
                            (cant_ing, int(ing_id)),
                        )
                        cursor.execute(
                            f"SELECT {ing_stock_col} AS stock_actual FROM ingredientes WHERE id = %s",
                            (int(ing_id),),
                        )
                        updated_ing = cursor.fetchone()
                        new_portions = (
                            math.floor(float(updated_ing["stock_actual"]) / porcion)
                            if updated_ing and porcion > 0
                            else 0
                        )
                        cursor.execute("UPDATE toppings SET stock = %s WHERE id = %s", (new_portions, tid))

                        if mov_cols:
                            mov_data = {"ingrediente_id": int(ing_id), "cantidad": cant_ing}
                            if "tipo" in mov_cols:
                                mov_data["tipo"] = "salida"
                            elif "tipo_movimiento" in mov_cols:
                                mov_data["tipo_movimiento"] = "salida"
                            motivo_top = f"Venta pedido {folio} (Topping: {t_row.get('nombre')})"
                            if "motivo" in mov_cols:
                                mov_data["motivo"] = motivo_top
                            elif "observaciones" in mov_cols:
                                mov_data["observaciones"] = motivo_top
                            cols_sql = ", ".join(mov_data.keys())
                            ph_sql = ", ".join(["%s"] * len(mov_data))
                            cursor.execute(
                                f"INSERT INTO movimientos_inventario ({cols_sql}) VALUES ({ph_sql})",
                                tuple(mov_data.values()),
                            )
                    else:
                        cursor.execute(
                            "UPDATE toppings SET stock = GREATEST(0, stock - %s) WHERE id = %s",
                            (qty, tid),
                        )

            if "stock_litros" in hel_cols:
                _sync_all_product_stocks(cursor, ing_stock_col)

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

    finally:
        conn.close()

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