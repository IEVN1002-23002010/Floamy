from flask import Blueprint, request, jsonify
from app.extensions import get_db_connection

suppliers_bp = Blueprint("suppliers", __name__)


@suppliers_bp.route("", methods=["GET"])
@suppliers_bp.route("/", methods=["GET"])
def list_suppliers():
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT id, nombre, contacto, telefono FROM proveedores ORDER BY id DESC")
        rows = cursor.fetchall()
    return jsonify(rows)


@suppliers_bp.route("", methods=["POST"])
@suppliers_bp.route("/", methods=["POST"])
def create_supplier():
    data = request.get_json(silent=True) or {}
    nombre = (data.get("nombre") or "").strip()
    contacto = (data.get("contacto") or "").strip()
    telefono = (data.get("telefono") or "").strip()

    if not nombre:
        return jsonify({"error": "El nombre del proveedor es obligatorio"}), 400

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "INSERT INTO proveedores (nombre, contacto, telefono) VALUES (%s, %s, %s)",
                (nombre, contacto, telefono),
            )
            new_id = cursor.lastrowid
        conn.commit()
    except Exception as exc:
        try:
            conn.rollback()
        except Exception:
            pass
        return jsonify({"error": f"No se pudo registrar el proveedor: {exc}"}), 400

    return jsonify({"id": new_id, "message": "Proveedor registrado"}), 201


@suppliers_bp.put("/<int:supplier_id>")
def update_supplier(supplier_id):
    data = request.get_json(silent=True) or {}
    nombre = (data.get("nombre") or "").strip()
    contacto = (data.get("contacto") or "").strip()
    telefono = (data.get("telefono") or "").strip()

    if not nombre:
        return jsonify({"error": "El nombre del proveedor es obligatorio"}), 400

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "UPDATE proveedores SET nombre = %s, contacto = %s, telefono = %s WHERE id = %s",
                (nombre, contacto, telefono, supplier_id),
            )
        conn.commit()
    except Exception as exc:
        try:
            conn.rollback()
        except Exception:
            pass
        return jsonify({"error": f"No se pudo actualizar el proveedor: {exc}"}), 400

    return jsonify({"message": "Proveedor actualizado"})


@suppliers_bp.delete("/<int:supplier_id>")
def delete_supplier(supplier_id):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            try:
                cursor.execute("UPDATE ingredientes SET proveedor_id = NULL WHERE proveedor_id = %s", (supplier_id,))
            except Exception:
                pass
            cursor.execute("DELETE FROM proveedores WHERE id = %s", (supplier_id,))
        conn.commit()
    except Exception as exc:
        try:
            conn.rollback()
        except Exception:
            pass
        return jsonify({"error": f"No se pudo eliminar el proveedor: {exc}"}), 400

    return jsonify({"message": "Proveedor eliminado"})