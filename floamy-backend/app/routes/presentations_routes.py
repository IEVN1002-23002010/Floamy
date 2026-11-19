from flask import Blueprint, request, jsonify
from app.extensions import get_db_connection

presentations_bp = Blueprint("presentations", __name__)


@presentations_bp.get("/")
def list_presentations():
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT id, nombre, precio FROM presentaciones ORDER BY precio ASC, id ASC")
        rows = cursor.fetchall()
        for r in rows:
            r["precio"] = float(r["precio"] or 0)
    return jsonify(rows)


@presentations_bp.post("/")
def create_presentation():
    data = request.get_json(silent=True) or {}
    nombre = (data.get("nombre") or "").strip()
    precio = float(data.get("precio") or 0)
    initial_stock = int(data.get("stockInicial") or 10)

    if not nombre:
        return jsonify({"error": "El nombre del tamaño es obligatorio"}), 400

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "INSERT INTO presentaciones (nombre, precio) VALUES (%s, %s)",
                (nombre, precio),
            )
            pres_id = cursor.lastrowid

            cursor.execute("SELECT id FROM helados")
            for h in cursor.fetchall():
                cursor.execute(
                    "INSERT INTO productos (helado_id, presentacion_id, stock, activo) VALUES (%s, %s, %s, 1)",
                    (h["id"], pres_id, initial_stock),
                )
        conn.commit()
    except Exception as exc:
        try:
            conn.rollback()
        except Exception:
            pass
        return jsonify({"error": f"No se pudo crear el tamaño: {exc}"}), 400

    return jsonify({"id": pres_id, "message": "Tamaño creado"}), 201


@presentations_bp.put("/<int:pres_id>")
def update_presentation(pres_id):
    data = request.get_json(silent=True) or {}
    nombre = (data.get("nombre") or "").strip()
    precio = float(data.get("precio") or 0)

    if not nombre:
        return jsonify({"error": "El nombre del tamaño es obligatorio"}), 400

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "UPDATE presentaciones SET nombre = %s, precio = %s WHERE id = %s",
                (nombre, precio, pres_id),
            )
        conn.commit()
    except Exception as exc:
        try:
            conn.rollback()
        except Exception:
            pass
        return jsonify({"error": f"No se pudo actualizar el tamaño: {exc}"}), 400

    return jsonify({"message": "Tamaño actualizado"})


@presentations_bp.delete("/<int:pres_id>")
def delete_presentation(pres_id):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM productos WHERE presentacion_id = %s", (pres_id,))
            cursor.execute("DELETE FROM presentaciones WHERE id = %s", (pres_id,))
        conn.commit()
    except Exception as exc:
        try:
            conn.rollback()
        except Exception:
            pass
        return jsonify({"error": f"No se pudo eliminar el tamaño: {exc}"}), 400

    return jsonify({"message": "Tamaño eliminado"})