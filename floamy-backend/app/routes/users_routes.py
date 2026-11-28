import json
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from app.extensions import get_db_connection

users_bp = Blueprint("users", __name__)


@users_bp.get("/")
def list_users():
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute("""
            SELECT u.id, u.nombre, u.correo, u.activo, r.id AS rol_id, r.nombre AS rol
            FROM usuarios u
            JOIN roles r ON u.rol_id = r.id
            ORDER BY u.id ASC
        """)
        rows = cursor.fetchall()
        for r in rows:
            activo_val = r.get("activo")
            is_active = bool(activo_val) if activo_val is not None else True
            r["activo"] = 1 if is_active else 0
            r["estado"] = "Activo" if is_active else "Inactivo"
    return jsonify(rows)


@users_bp.post("/")
def create_user():
    data = request.get_json() or {}
    raw_password = str(data.get("password") or "floamy123").strip()
    password_hash = generate_password_hash(raw_password)
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "INSERT INTO usuarios (nombre, correo, password_hash, rol_id, activo) VALUES (%s, %s, %s, %s, 1)",
                (data["nombre"], data["correo"], password_hash, int(data["rol_id"]))
            )
        conn.commit()
    except Exception as exc:
        try:
            conn.rollback()
        except Exception:
            pass
        return jsonify({"error": f"No se pudo crear el usuario: {exc}"}), 400

    return jsonify({"message": "Usuario creado"}), 201


@users_bp.put("/<int:user_id>")
def update_user(user_id):
    data = request.get_json() or {}
    nombre = (data.get("nombre") or data.get("name") or "").strip()
    correo = (data.get("correo") or data.get("email") or "").strip()
    rol_nombre = (data.get("rol") or data.get("role") or "").strip()
    password = (data.get("password") or "").strip()

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id FROM roles WHERE nombre = %s", (rol_nombre,))
            rol_row = cursor.fetchone()
            if not rol_row:
                return jsonify({"error": "Rol no válido"}), 400

            if password:
                password_hash = generate_password_hash(password)
                cursor.execute(
                    "UPDATE usuarios SET nombre = %s, correo = %s, rol_id = %s, password_hash = %s WHERE id = %s",
                    (nombre, correo, rol_row["id"], password_hash, user_id),
                )
            else:
                cursor.execute(
                    "UPDATE usuarios SET nombre = %s, correo = %s, rol_id = %s WHERE id = %s",
                    (nombre, correo, rol_row["id"], user_id),
                )
        conn.commit()
    except Exception as exc:
        try:
            conn.rollback()
        except Exception:
            pass
        return jsonify({"error": f"No se pudo actualizar el usuario: {exc}"}), 400

    return jsonify({"message": "Usuario actualizado"})


@users_bp.patch("/<int:user_id>/toggle")
def toggle_user(user_id):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("UPDATE usuarios SET activo = CASE WHEN activo = 1 THEN 0 ELSE 1 END WHERE id = %s", (user_id,))
        conn.commit()
    except Exception as exc:
        try:
            conn.rollback()
        except Exception:
            pass
        return jsonify({"error": f"No se pudo actualizar el estado: {exc}"}), 400

    return jsonify({"message": "Estado actualizado"})


@users_bp.get("/roles")
def list_roles():
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT id, nombre, descripcion, permisos FROM roles ORDER BY id ASC")
        rows = cursor.fetchall()
        for r in rows:
            raw = r.get("permisos")
            if isinstance(raw, str) and raw.strip():
                try:
                    r["permisos"] = json.loads(raw)
                except Exception:
                    r["permisos"] = {}
            elif not isinstance(raw, dict):
                r["permisos"] = {}
    return jsonify(rows)


@users_bp.put("/roles/<int:role_id>")
def update_role_permissions(role_id):
    data = request.get_json() or {}
    permisos = data.get("permisos", {})
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "UPDATE roles SET permisos = %s WHERE id = %s",
                (json.dumps(permisos), role_id)
            )
        conn.commit()
    except Exception as exc:
        try:
            conn.rollback()
        except Exception:
            pass
        return jsonify({"error": f"No se pudieron actualizar los permisos: {exc}"}), 400

    return jsonify({"message": "Permisos actualizados", "permisos": permisos})