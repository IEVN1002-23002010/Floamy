import os
import uuid
import json
from flask import Blueprint, request, jsonify, current_app, send_from_directory, url_for
from werkzeug.utils import secure_filename
from app.extensions import get_db_connection
from app.services.stock_service import adjust_product_stock

products_bp = Blueprint("products", __name__)

ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".gif"}


def _get_upload_dir():
    upload_dir = os.path.join(current_app.root_path, "static", "uploads", "products")
    os.makedirs(upload_dir, exist_ok=True)
    return upload_dir


def _save_uploaded_image(file_storage):
    if not file_storage or not file_storage.filename:
        return None
    filename = secure_filename(file_storage.filename)
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError("Formato de imagen no válido. Usa PNG, JPG, WEBP o GIF.")

    unique_name = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(_get_upload_dir(), unique_name)
    file_storage.save(file_path)

    relative_url = url_for("products.serve_upload", filename=unique_name)
    return f"{request.host_url.rstrip('/')}{relative_url}"


def _parse_product_payload():
    if request.content_type and "multipart/form-data" in request.content_type:
        name = (request.form.get("name") or "").strip()
        flavor = (request.form.get("flavor") or "").strip()
        tone = (request.form.get("tone") or "vanilla").strip()
        stock_cup = int(request.form.get("stockCup") or 10)
        stock_liter = int(request.form.get("stockLiter") or 5)

        pres_raw = request.form.get("presentations")
        presentations = json.loads(pres_raw) if pres_raw else []

        image_url = (request.form.get("image") or "").strip() or None
        uploaded_file = request.files.get("image_file")
        if uploaded_file and uploaded_file.filename:
            image_url = _save_uploaded_image(uploaded_file)

        return {
            "name": name,
            "flavor": flavor,
            "tone": tone,
            "stockCup": stock_cup,
            "stockLiter": stock_liter,
            "presentations": presentations,
            "image": image_url,
        }

    data = request.get_json(silent=True) or {}
    return {
        "name": (data.get("name") or "").strip(),
        "flavor": (data.get("flavor") or "").strip(),
        "tone": (data.get("tone") or "vanilla").strip(),
        "stockCup": int(data.get("stockCup") or 10),
        "stockLiter": int(data.get("stockLiter") or 5),
        "presentations": data.get("presentations") or [],
        "image": (data.get("image") or "").strip() or None,
    }


@products_bp.get("/uploads/<path:filename>")
def serve_upload(filename):
    return send_from_directory(_get_upload_dir(), filename)


@products_bp.get("/")
def list_products():
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute("""
            SELECT id, nombre_comercial AS name, sabor AS flavor, tono AS tone, imagen_url AS image
            FROM helados
            WHERE id IN (SELECT DISTINCT helado_id FROM productos WHERE activo = 1)
            ORDER BY id ASC
        """)
        helados = cursor.fetchall()

        cursor.execute("SELECT id, nombre, precio FROM presentaciones ORDER BY precio ASC, id ASC")
        presentaciones = cursor.fetchall()

        cursor.execute("SELECT id, helado_id, presentacion_id, stock FROM productos WHERE activo = 1")
        prod_rows = cursor.fetchall()

    prod_map = {(p["helado_id"], p["presentacion_id"]): p for p in prod_rows}

    result = []
    for h in helados:
        pres_list = []
        stock_cup = 0
        stock_liter = 0
        cup_pid = None
        liter_pid = None

        for pr in presentaciones:
            match = prod_map.get((h["id"], pr["id"]))
            st = int(match["stock"]) if match else 0
            pid = match["id"] if match else None
            price = float(pr["precio"] or 0)

            pres_list.append({
                "presentationId": pr["id"],
                "productId": pid,
                "name": pr["nombre"],
                "price": price,
                "stock": st,
            })

            if pr["id"] == 1 or "vaso" in pr["nombre"].lower():
                stock_cup = st
                cup_pid = pid
            elif pr["id"] == 2 or "litro" in pr["nombre"].lower():
                stock_liter = st
                liter_pid = pid

        result.append({
            "id": h["id"],
            "name": h["name"],
            "flavor": h["flavor"],
            "tone": h["tone"],
            "image": h["image"],
            "presentations": pres_list,
            "stockCup": stock_cup,
            "stockLiter": stock_liter,
            "cupProductId": cup_pid,
            "literProductId": liter_pid,
        })

    return jsonify(result)


@products_bp.post("/")
def create_product():
    try:
        data = _parse_product_payload()
    except ValueError as err:
        return jsonify({"error": str(err), "message": str(err)}), 400

    if not data["name"] or not data["flavor"]:
        return jsonify({"error": "El nombre comercial y el sabor son obligatorios"}), 400

    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute(
            "INSERT INTO helados (sabor, nombre_comercial, tono, imagen_url) VALUES (%s, %s, %s, %s)",
            (data["flavor"], data["name"], data["tone"], data["image"]),
        )
        helado_id = cursor.lastrowid

        cursor.execute("SELECT id FROM presentaciones ORDER BY id ASC")
        pres_rows = cursor.fetchall()
        incoming_pres = {
            int(p["presentationId"]): int(p.get("stock", 0))
            for p in data["presentations"]
            if p.get("presentationId")
        }

        for pr in pres_rows:
            pid = pr["id"]
            if pid in incoming_pres:
                st = incoming_pres[pid]
            elif pid == 1:
                st = data["stockCup"]
            elif pid == 2:
                st = data["stockLiter"]
            else:
                st = 10
            cursor.execute(
                "INSERT INTO productos (helado_id, presentacion_id, stock, activo) VALUES (%s, %s, %s, 1)",
                (helado_id, pid, st),
            )
    conn.commit()
    return jsonify({"id": helado_id, "message": "Producto creado"}), 201


@products_bp.put("/<int:helado_id>")
def update_product(helado_id):
    try:
        data = _parse_product_payload()
    except ValueError as err:
        return jsonify({"error": str(err), "message": str(err)}), 400

    if not data["name"] or not data["flavor"]:
        return jsonify({"error": "El nombre comercial y el sabor son obligatorios"}), 400

    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute(
            "UPDATE helados SET sabor=%s, nombre_comercial=%s, tono=%s, imagen_url=%s WHERE id=%s",
            (data["flavor"], data["name"], data["tone"], data["image"], helado_id),
        )

        incoming_pres = data["presentations"]
        if incoming_pres:
            for item in incoming_pres:
                pres_id = int(item["presentationId"])
                st = int(item.get("stock", 0))
                cursor.execute(
                    "SELECT id FROM productos WHERE helado_id = %s AND presentacion_id = %s",
                    (helado_id, pres_id),
                )
                existing = cursor.fetchone()
                if existing:
                    cursor.execute("UPDATE productos SET stock = %s, activo = 1 WHERE id = %s", (st, existing["id"]))
                else:
                    cursor.execute(
                        "INSERT INTO productos (helado_id, presentacion_id, stock, activo) VALUES (%s, %s, %s, 1)",
                        (helado_id, pres_id, st),
                    )
        else:
            cursor.execute("UPDATE productos SET stock=%s, activo=1 WHERE helado_id=%s AND presentacion_id=1", (data["stockCup"], helado_id))
            cursor.execute("UPDATE productos SET stock=%s, activo=1 WHERE helado_id=%s AND presentacion_id=2", (data["stockLiter"], helado_id))
    conn.commit()
    return jsonify({"message": "Producto actualizado"})


@products_bp.patch("/stock/<int:product_id>")
def patch_stock(product_id):
    data = request.get_json() or {}
    conn = get_db_connection()
    with conn.cursor() as cursor:
        adjust_product_stock(cursor, product_id, int(data.get("delta", 0)))
    conn.commit()
    return jsonify({"message": "Stock actualizado"})


@products_bp.delete("/<int:helado_id>")
def delete_product(helado_id):
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute(
            """
            SELECT COUNT(*) AS total
            FROM detalle_pedido dp
            INNER JOIN productos p ON dp.producto_id = p.id
            WHERE p.helado_id = %s
            """,
            (helado_id,),
        )
        row = cursor.fetchone() or {}
        has_orders = int(row.get("total") or 0) > 0

        if has_orders:
            cursor.execute(
                "UPDATE productos SET activo = 0, stock = 0 WHERE helado_id = %s",
                (helado_id,),
            )
        else:
            cursor.execute("DELETE FROM productos WHERE helado_id = %s", (helado_id,))
            cursor.execute("DELETE FROM helados WHERE id = %s", (helado_id,))
    conn.commit()
    return jsonify({"message": "Producto eliminado"})