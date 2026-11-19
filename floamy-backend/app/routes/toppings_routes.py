from flask import Blueprint, request, jsonify
from app.extensions import get_db_connection

toppings_bp = Blueprint("toppings", __name__)


@toppings_bp.get("/")
def list_toppings():
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute("""
            SELECT t.id, t.nombre, t.precio, t.stock, t.proveedor_id, t.activo,
                   p.nombre AS proveedor_nombre
            FROM toppings t
            LEFT JOIN proveedores p ON t.proveedor_id = p.id
            ORDER BY t.id DESC
        """)
        rows = cursor.fetchall()
        for r in rows:
            r["precio"] = float(r["precio"] or 0)
            r["stock"] = int(r["stock"] or 0)
    return jsonify(rows)


@toppings_bp.post("/")
def create_topping():
    data = request.get_json(silent=True) or {}
    nombre = (data.get("nombre") or "").strip()
    precio = float(data.get("precio") or 0)
    stock = int(data.get("stock") or 0)
    prov_raw = data.get("proveedor_id") or data.get("proveedorId")
    prov_id = int(prov_raw) if prov_raw else None

    if not nombre:
        return jsonify({"error": "El nombre del topping es obligatorio"}), 400

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "INSERT INTO toppings (nombre, precio, stock, proveedor_id, activo) VALUES (%s, %s, %s, %s, 1)",
                (nombre, precio, stock, prov_id),
            )
            new_id = cursor.lastrowid
        conn.commit()
    except Exception as exc:
        try:
            conn.rollback()
        except Exception:
            pass
        return jsonify({"error": f"No se pudo registrar el topping: {exc}"}), 400

    return jsonify({"id": new_id, "message": "Topping registrado"}), 201


@toppings_bp.put("/<int:top_id>")
def update_topping(top_id):
    data = request.get_json(silent=True) or {}
    nombre = (data.get("nombre") or "").strip()
    precio = float(data.get("precio") or 0)
    stock = int(data.get("stock") or 0)
    prov_raw = data.get("proveedor_id") or data.get("proveedorId")
    prov_id = int(prov_raw) if prov_raw else None

    if not nombre:
        return jsonify({"error": "El nombre del topping es obligatorio"}), 400

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                UPDATE toppings
                SET nombre = %s, precio = %s, stock = %s, proveedor_id = %s
                WHERE id = %s
                """,
                (nombre, precio, stock, prov_id, top_id),
            )
        conn.commit()
    except Exception as exc:
        try:
            conn.rollback()
        except Exception:
            pass
        return jsonify({"error": f"No se pudo actualizar el topping: {exc}"}), 400

    return jsonify({"message": "Topping actualizado"})


@toppings_bp.patch("/<int:top_id>/stock")
def adjust_topping_stock(top_id):
    data = request.get_json(silent=True) or {}
    delta = int(data.get("delta") or 0)
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute(
            "UPDATE toppings SET stock = GREATEST(0, stock + %s) WHERE id = %s",
            (delta, top_id),
        )
    conn.commit()
    return jsonify({"message": "Stock de topping actualizado"})


@toppings_bp.delete("/<int:top_id>")
def delete_topping(top_id):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM toppings WHERE id = %s", (top_id,))
        conn.commit()
    except Exception as exc:
        try:
            conn.rollback()
        except Exception:
            pass
        return jsonify({"error": f"No se pudo eliminar el topping: {exc}"}), 400

    return jsonify({"message": "Topping eliminado"})