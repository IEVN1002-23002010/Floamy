import math
from flask import Blueprint, request, jsonify
from app.extensions import get_db_connection

toppings_bp = Blueprint("toppings", __name__)


def _get_columns(cursor, table_name):
    try:
        cursor.execute(f"SHOW COLUMNS FROM {table_name}")
        return {row["Field"] for row in cursor.fetchall()}
    except Exception:
        return set()


@toppings_bp.get("/")
def list_toppings():
    conn = get_db_connection()
    with conn.cursor() as cursor:
        top_cols = _get_columns(cursor, "toppings")
        ing_cols = _get_columns(cursor, "ingredientes")
        ing_stock_col = "stock_actual" if "stock_actual" in ing_cols else "stock"

        has_ing_link = "ingrediente_id" in top_cols
        has_portion_col = "cantidad_por_porcion" in top_cols

        if has_ing_link:
            portion_expr = "COALESCE(t.cantidad_por_porcion, 0.04)" if has_portion_col else "0.04"
            cursor.execute(f"""
                SELECT t.id, t.nombre, t.precio, t.stock,
                       COALESCE(t.proveedor_id, i.proveedor_id) AS proveedor_id,
                       t.activo,
                       t.ingrediente_id,
                       {portion_expr} AS cantidad_por_porcion,
                       COALESCE(p.nombre, p_ing.nombre) AS proveedor_nombre,
                       i.nombre AS ingrediente_nombre,
                       i.unidad AS ingrediente_unidad,
                       i.{ing_stock_col} AS ingrediente_stock
                FROM toppings t
                LEFT JOIN proveedores p ON t.proveedor_id = p.id
                LEFT JOIN ingredientes i ON t.ingrediente_id = i.id
                LEFT JOIN proveedores p_ing ON i.proveedor_id = p_ing.id
                ORDER BY t.id DESC
            """)
        else:
            cursor.execute("""
                SELECT t.id, t.nombre, t.precio, t.stock, t.proveedor_id, t.activo,
                       p.nombre AS proveedor_nombre
                FROM toppings t
                LEFT JOIN proveedores p ON t.proveedor_id = p.id
                ORDER BY t.id DESC
            """)

        rows = cursor.fetchall()
        synced = False
        for r in rows:
            r["precio"] = float(r["precio"] or 0)
            porcion = float(r.get("cantidad_por_porcion") or 0.04)
            r["cantidad_por_porcion"] = porcion

            ing_id = r.get("ingrediente_id")
            ing_stock = r.get("ingrediente_stock")
            if ing_id and ing_stock is not None and porcion > 0:
                live_stock = max(0, math.floor((float(ing_stock) + 1e-9) / porcion))
                if int(r.get("stock") or 0) != live_stock:
                    cursor.execute("UPDATE toppings SET stock = %s WHERE id = %s", (live_stock, r["id"]))
                    synced = True
                r["stock"] = live_stock
                r["ingrediente_stock"] = float(ing_stock)
            else:
                r["stock"] = int(r["stock"] or 0)

        if synced:
            conn.commit()

    return jsonify(rows)


@toppings_bp.post("/")
def create_topping():
    data = request.get_json(silent=True) or {}
    nombre = (data.get("nombre") or "").strip()
    precio = float(data.get("precio") or 0)
    prov_raw = data.get("proveedor_id") or data.get("proveedorId")
    prov_id = int(prov_raw) if prov_raw else None

    ing_raw = data.get("ingrediente_id") or data.get("ingredienteId")
    ing_id = int(ing_raw) if ing_raw else None
    porcion = float(data.get("cantidad_por_porcion") or data.get("cantidadPorPorcion") or 0.04)
    if porcion <= 0:
        porcion = 0.04

    if not nombre:
        return jsonify({"error": "El nombre del topping es obligatorio"}), 400

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            top_cols = _get_columns(cursor, "toppings")
            ing_cols = _get_columns(cursor, "ingredientes")
            ing_stock_col = "stock_actual" if "stock_actual" in ing_cols else "stock"

            stock = int(data.get("stock") or 0)
            if ing_id:
                cursor.execute(
                    f"SELECT {ing_stock_col} AS stock_actual, proveedor_id FROM ingredientes WHERE id = %s",
                    (ing_id,),
                )
                ing_row = cursor.fetchone()
                if ing_row:
                    stock = max(0, math.floor((float(ing_row["stock_actual"] or 0) + 1e-9) / porcion))
                    if prov_id is None and ing_row.get("proveedor_id"):
                        prov_id = int(ing_row["proveedor_id"])

            if "ingrediente_id" in top_cols and "cantidad_por_porcion" in top_cols:
                cursor.execute(
                    """
                    INSERT INTO toppings (nombre, precio, stock, proveedor_id, ingrediente_id, cantidad_por_porcion, activo)
                    VALUES (%s, %s, %s, %s, %s, %s, 1)
                    """,
                    (nombre, precio, stock, prov_id, ing_id, porcion),
                )
            elif "ingrediente_id" in top_cols:
                cursor.execute(
                    """
                    INSERT INTO toppings (nombre, precio, stock, proveedor_id, ingrediente_id, activo)
                    VALUES (%s, %s, %s, %s, %s, 1)
                    """,
                    (nombre, precio, stock, prov_id, ing_id),
                )
            else:
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
    prov_raw = data.get("proveedor_id") or data.get("proveedorId")
    prov_id = int(prov_raw) if prov_raw else None

    ing_raw = data.get("ingrediente_id") or data.get("ingredienteId")
    ing_id = int(ing_raw) if ing_raw else None
    porcion = float(data.get("cantidad_por_porcion") or data.get("cantidadPorPorcion") or 0.04)
    if porcion <= 0:
        porcion = 0.04

    if not nombre:
        return jsonify({"error": "El nombre del topping es obligatorio"}), 400

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            top_cols = _get_columns(cursor, "toppings")
            ing_cols = _get_columns(cursor, "ingredientes")
            ing_stock_col = "stock_actual" if "stock_actual" in ing_cols else "stock"

            stock = int(data.get("stock") or 0)
            if ing_id:
                cursor.execute(
                    f"SELECT {ing_stock_col} AS stock_actual, proveedor_id FROM ingredientes WHERE id = %s",
                    (ing_id,),
                )
                ing_row = cursor.fetchone()
                if ing_row:
                    stock = max(0, math.floor((float(ing_row["stock_actual"] or 0) + 1e-9) / porcion))
                    if prov_id is None and ing_row.get("proveedor_id"):
                        prov_id = int(ing_row["proveedor_id"])

            if "ingrediente_id" in top_cols and "cantidad_por_porcion" in top_cols:
                cursor.execute(
                    """
                    UPDATE toppings
                    SET nombre = %s, precio = %s, stock = %s, proveedor_id = %s,
                        ingrediente_id = %s, cantidad_por_porcion = %s
                    WHERE id = %s
                    """,
                    (nombre, precio, stock, prov_id, ing_id, porcion, top_id),
                )
            elif "ingrediente_id" in top_cols:
                cursor.execute(
                    """
                    UPDATE toppings
                    SET nombre = %s, precio = %s, stock = %s, proveedor_id = %s, ingrediente_id = %s
                    WHERE id = %s
                    """,
                    (nombre, precio, stock, prov_id, ing_id, top_id),
                )
            else:
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
        top_cols = _get_columns(cursor, "toppings")
        if "ingrediente_id" in top_cols:
            cursor.execute("SELECT ingrediente_id FROM toppings WHERE id = %s", (top_id,))
            row = cursor.fetchone()
            if row and row.get("ingrediente_id"):
                return jsonify({"message": "El stock de este topping se sincroniza desde Inventario"})

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