from flask import Blueprint, request, jsonify
from app.extensions import get_db_connection
from app.services.stock_service import adjust_product_stock

products_bp = Blueprint("products", __name__)


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
    data = request.get_json() or {}
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute(
            "INSERT INTO helados (sabor, nombre_comercial, tono, imagen_url) VALUES (%s, %s, %s, %s)",
            (data["flavor"], data["name"], data.get("tone", "vanilla"), data.get("image")),
        )
        helado_id = cursor.lastrowid

        cursor.execute("SELECT id FROM presentaciones ORDER BY id ASC")
        pres_rows = cursor.fetchall()
        incoming_pres = {int(p["presentationId"]): int(p.get("stock", 0)) for p in data.get("presentations", []) if p.get("presentationId")}

        for pr in pres_rows:
            pid = pr["id"]
            if pid in incoming_pres:
                st = incoming_pres[pid]
            elif pid == 1:
                st = int(data.get("stockCup", 10))
            elif pid == 2:
                st = int(data.get("stockLiter", 5))
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
    data = request.get_json() or {}
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute(
            "UPDATE helados SET sabor=%s, nombre_comercial=%s, tono=%s, imagen_url=%s WHERE id=%s",
            (data["flavor"], data["name"], data.get("tone", "vanilla"), data.get("image"), helado_id),
        )

        incoming_pres = data.get("presentations") or []
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
            cursor.execute("UPDATE productos SET stock=%s, activo=1 WHERE helado_id=%s AND presentacion_id=1", (data.get("stockCup", 0), helado_id))
            cursor.execute("UPDATE productos SET stock=%s, activo=1 WHERE helado_id=%s AND presentacion_id=2", (data.get("stockLiter", 0), helado_id))
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