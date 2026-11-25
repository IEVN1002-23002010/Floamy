from flask import Blueprint, request, jsonify
from app.extensions import get_db_connection
from app.services.stock_service import adjust_ingredient_stock

inventory_bp = Blueprint("inventory", __name__)


@inventory_bp.get("/")
def list_ingredients():
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute("""
            SELECT i.id, i.nombre AS name, COALESCE(i.categoria, 'General') AS categoria,
                   i.stock_actual AS current, i.stock_minimo AS minimum,
                   i.unidad AS unit, COALESCE(i.costo_unitario, 0) AS costo_unitario,
                   i.proveedor_id, p.nombre AS proveedor_nombre
            FROM ingredientes i
            LEFT JOIN proveedores p ON i.proveedor_id = p.id
            ORDER BY i.id ASC
        """)
        rows = cursor.fetchall()
        for r in rows:
            r["current"] = float(r["current"] or 0)
            r["minimum"] = float(r["minimum"] or 0)
            r["costo_unitario"] = float(r["costo_unitario"] or 0)
    return jsonify(rows)


@inventory_bp.post("/")
def add_ingredient():
    data = request.get_json() or {}
    prov_id = data.get("proveedor_id") or data.get("proveedorId")
    prov_id = int(prov_id) if prov_id else None
    categoria = (data.get("categoria") or "General").strip() or "General"
    costo = float(data.get("costo_unitario") or data.get("costoUnitario") or 0)

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO ingredientes (nombre, categoria, stock_actual, stock_minimo, unidad, costo_unitario, proveedor_id)
                VALUES (%s, %s, 0, %s, %s, %s, %s)
                """,
                (
                    data["name"].strip(),
                    categoria,
                    float(data["minimum"]),
                    data.get("unit", "L").strip(),
                    costo,
                    prov_id,
                )
            )
        conn.commit()
    except Exception as exc:
        try:
            conn.rollback()
        except Exception:
            pass
        return jsonify({"error": f"No se pudo guardar el ingrediente: {exc}"}), 400

    return jsonify({"message": "Ingrediente agregado"}), 201


@inventory_bp.put("/<int:ing_id>")
def update_ingredient(ing_id):
    data = request.get_json() or {}
    prov_id = data.get("proveedor_id") or data.get("proveedorId")
    prov_id = int(prov_id) if prov_id else None
    categoria = (data.get("categoria") or "General").strip() or "General"
    costo = float(data.get("costo_unitario") or data.get("costoUnitario") or 0)

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                UPDATE ingredientes
                SET nombre = %s, categoria = %s, stock_minimo = %s,
                    unidad = %s, costo_unitario = %s, proveedor_id = %s
                WHERE id = %s
                """,
                (
                    data["name"].strip(),
                    categoria,
                    float(data["minimum"]),
                    data.get("unit", "L").strip(),
                    costo,
                    prov_id,
                    ing_id,
                )
            )
        conn.commit()
    except Exception as exc:
        try:
            conn.rollback()
        except Exception:
            pass
        return jsonify({"error": f"No se pudo actualizar el ingrediente: {exc}"}), 400

    return jsonify({"message": "Ingrediente actualizado"})


@inventory_bp.patch("/<int:ing_id>/adjust")
def adjust_ingredient(ing_id):
    data = request.get_json() or {}
    conn = get_db_connection()
    with conn.cursor() as cursor:
        adjust_ingredient_stock(cursor, ing_id, float(data.get("delta", 0)))
    conn.commit()
    return jsonify({"message": "Inventario ajustado"})


@inventory_bp.delete("/<int:ing_id>")
def delete_ingredient(ing_id):
    conn = get_db_connection()
    with conn.cursor() as cursor:
        try:
            cursor.execute("DELETE FROM movimientos_ingredientes WHERE ingrediente_id = %s", (ing_id,))
        except Exception:
            pass
        cursor.execute("DELETE FROM ingredientes WHERE id = %s", (ing_id,))
    conn.commit()
    return jsonify({"message": "Ingrediente eliminado"})