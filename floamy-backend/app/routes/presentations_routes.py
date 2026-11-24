import os
import uuid
from flask import Blueprint, request, jsonify, current_app, send_from_directory, url_for
from werkzeug.utils import secure_filename
from app.extensions import get_db_connection

presentations_bp = Blueprint("presentations", __name__)

ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".gif"}


def _get_upload_dir():
    upload_dir = os.path.join(current_app.root_path, "static", "uploads", "presentations")
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

    relative_url = url_for("presentations.serve_upload", filename=unique_name)
    return f"{request.host_url.rstrip('/')}{relative_url}"


def _parse_presentation_payload():
    if request.content_type and "multipart/form-data" in request.content_type:
        nombre = (request.form.get("nombre") or "").strip()
        precio = float(request.form.get("precio") or 0)
        initial_stock = int(request.form.get("stockInicial") or 10)
        imagen_url = (request.form.get("imagen_url") or "").strip() or None

        uploaded_file = request.files.get("imagen_file")
        if uploaded_file and uploaded_file.filename:
            imagen_url = _save_uploaded_image(uploaded_file)

        return nombre, precio, initial_stock, imagen_url

    data = request.get_json(silent=True) or {}
    nombre = (data.get("nombre") or "").strip()
    precio = float(data.get("precio") or 0)
    initial_stock = int(data.get("stockInicial") or 10)
    imagen_url = (data.get("imagen_url") or "").strip() or None
    return nombre, precio, initial_stock, imagen_url


@presentations_bp.get("/uploads/<path:filename>")
def serve_upload(filename):
    return send_from_directory(_get_upload_dir(), filename)


@presentations_bp.get("/")
def list_presentations():
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute(
            "SELECT id, nombre, precio, imagen_url FROM presentaciones ORDER BY precio ASC, id ASC"
        )
        rows = cursor.fetchall()
        for r in rows:
            r["precio"] = float(r["precio"] or 0)
    return jsonify(rows)


@presentations_bp.post("/")
def create_presentation():
    try:
        nombre, precio, initial_stock, imagen_url = _parse_presentation_payload()
    except ValueError as err:
        return jsonify({"error": str(err)}), 400

    if not nombre:
        return jsonify({"error": "El nombre del tamaño es obligatorio"}), 400

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "INSERT INTO presentaciones (nombre, precio, imagen_url) VALUES (%s, %s, %s)",
                (nombre, precio, imagen_url),
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
    try:
        nombre, precio, _, imagen_url = _parse_presentation_payload()
    except ValueError as err:
        return jsonify({"error": str(err)}), 400

    if not nombre:
        return jsonify({"error": "El nombre del tamaño es obligatorio"}), 400

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "UPDATE presentaciones SET nombre = %s, precio = %s, imagen_url = %s WHERE id = %s",
                (nombre, precio, imagen_url, pres_id),
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