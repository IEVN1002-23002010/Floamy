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


def _get_columns(cursor, table_name):
    try:
        cursor.execute(f"SHOW COLUMNS FROM {table_name}")
        return {row["Field"] for row in cursor.fetchall()}
    except Exception:
        return set()


def _parse_presentation_payload():
    if request.content_type and "multipart/form-data" in request.content_type:
        nombre = (request.form.get("nombre") or "").strip()
        precio = float(request.form.get("precio") or 0)
        initial_stock = int(request.form.get("stockInicial") or 10)
        litros_consumidos = float(
            request.form.get("litros_consumidos")
            or request.form.get("litrosConsumidos")
            or 0.25
        )
        raw_desechable = (
            request.form.get("ingrediente_desechable_id")
            or request.form.get("ingredienteDesechableId")
        )
        ingrediente_desechable_id = int(raw_desechable) if raw_desechable else None
        imagen_url = (request.form.get("imagen_url") or "").strip() or None

        uploaded_file = request.files.get("imagen_file") or request.files.get("imageFile")
        if uploaded_file and uploaded_file.filename:
            imagen_url = _save_uploaded_image(uploaded_file)

        return {
            "nombre": nombre,
            "precio": precio,
            "initial_stock": initial_stock,
            "litros_consumidos": litros_consumidos,
            "ingrediente_desechable_id": ingrediente_desechable_id,
            "imagen_url": imagen_url,
        }

    data = request.get_json(silent=True) or {}
    raw_desechable = (
        data.get("ingrediente_desechable_id")
        if data.get("ingrediente_desechable_id") is not None
        else data.get("ingredienteDesechableId")
    )
    return {
        "nombre": (data.get("nombre") or "").strip(),
        "precio": float(data.get("precio") or 0),
        "initial_stock": int(data.get("stockInicial") or 10),
        "litros_consumidos": float(
            data.get("litros_consumidos")
            or data.get("litrosConsumidos")
            or 0.25
        ),
        "ingrediente_desechable_id": int(raw_desechable) if raw_desechable else None,
        "imagen_url": (data.get("imagen_url") or "").strip() or None,
    }


@presentations_bp.get("/uploads/<path:filename>")
def serve_upload(filename):
    return send_from_directory(_get_upload_dir(), filename)


@presentations_bp.get("/")
def list_presentations():
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM presentaciones ORDER BY precio ASC, id ASC")
        rows = cursor.fetchall()
        for r in rows:
            r["precio"] = float(r.get("precio") or 0)
            if "litros_consumidos" in r:
                r["litros_consumidos"] = float(r["litros_consumidos"] or 0.25)
                r["litrosConsumidos"] = r["litros_consumidos"]
            if "ingrediente_desechable_id" in r:
                r["ingredienteDesechableId"] = r["ingrediente_desechable_id"]
    return jsonify(rows)


@presentations_bp.post("/")
def create_presentation():
    try:
        payload = _parse_presentation_payload()
    except ValueError as err:
        return jsonify({"error": str(err)}), 400

    if not payload["nombre"]:
        return jsonify({"error": "El nombre del tamaño es obligatorio"}), 400

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            pres_cols = _get_columns(cursor, "presentaciones")
            hel_cols = _get_columns(cursor, "helados")

            row_data = {
                "nombre": payload["nombre"],
                "precio": payload["precio"],
                "imagen_url": payload["imagen_url"],
            }
            if "litros_consumidos" in pres_cols:
                row_data["litros_consumidos"] = payload["litros_consumidos"]
            if "ingrediente_desechable_id" in pres_cols:
                row_data["ingrediente_desechable_id"] = payload["ingrediente_desechable_id"]

            cols_sql = ", ".join(row_data.keys())
            ph_sql = ", ".join(["%s"] * len(row_data))
            cursor.execute(
                f"INSERT INTO presentaciones ({cols_sql}) VALUES ({ph_sql})",
                tuple(row_data.values()),
            )
            pres_id = cursor.lastrowid

            if "stock_litros" in hel_cols:
                cursor.execute("SELECT id, COALESCE(stock_litros, 0) AS stock_litros FROM helados")
                for h in cursor.fetchall():
                    st = (
                        int(float(h["stock_litros"]) // payload["litros_consumidos"])
                        if payload["litros_consumidos"] > 0
                        else 0
                    )
                    cursor.execute(
                        "INSERT INTO productos (helado_id, presentacion_id, stock, activo) VALUES (%s, %s, %s, 1)",
                        (h["id"], pres_id, st),
                    )
            else:
                cursor.execute("SELECT id FROM helados")
                for h in cursor.fetchall():
                    cursor.execute(
                        "INSERT INTO productos (helado_id, presentacion_id, stock, activo) VALUES (%s, %s, %s, 1)",
                        (h["id"], pres_id, payload["initial_stock"]),
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
        payload = _parse_presentation_payload()
    except ValueError as err:
        return jsonify({"error": str(err)}), 400

    if not payload["nombre"]:
        return jsonify({"error": "El nombre del tamaño es obligatorio"}), 400

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            pres_cols = _get_columns(cursor, "presentaciones")
            updates = ["nombre = %s", "precio = %s", "imagen_url = %s"]
            params = [payload["nombre"], payload["precio"], payload["imagen_url"]]

            if "litros_consumidos" in pres_cols:
                updates.append("litros_consumidos = %s")
                params.append(payload["litros_consumidos"])
            if "ingrediente_desechable_id" in pres_cols:
                updates.append("ingrediente_desechable_id = %s")
                params.append(payload["ingrediente_desechable_id"])

            params.append(pres_id)
            cursor.execute(
                f"UPDATE presentaciones SET {', '.join(updates)} WHERE id = %s",
                tuple(params),
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