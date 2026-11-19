import json
from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash
from app.extensions import get_db_connection

auth_bp = Blueprint("auth", __name__)

@auth_bp.post("/login")
def login():
    data = request.get_json() or {}
    correo = (data.get("correo") or "").strip()
    password = (data.get("password") or "").strip()

    if not correo or not password:
        return jsonify({"error": "Ingresa tu correo y contraseña"}), 400

    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute("""
            SELECT u.id, u.nombre, u.correo, u.password_hash, u.activo, r.nombre AS rol, r.permisos
            FROM usuarios u
            JOIN roles r ON u.rol_id = r.id
            WHERE u.correo = %s
            LIMIT 1
        """, (correo,))
        user = cursor.fetchone()

    if not user:
        return jsonify({"error": "Correo o contraseña incorrectos"}), 401

    stored_pw = user.pop("password_hash", "") or ""
    valid_pw = (stored_pw == password)
    if not valid_pw and (stored_pw.startswith("scrypt:") or stored_pw.startswith("pbkdf2:")):
        valid_pw = check_password_hash(stored_pw, password)

    if not valid_pw:
        return jsonify({"error": "Correo o contraseña incorrectos"}), 401

    if not user["activo"]:
        return jsonify({"error": "Tu cuenta está desactivada"}), 403

    raw_perms = user.get("permisos")
    if isinstance(raw_perms, str) and raw_perms.strip():
        try:
            user["permisos"] = json.loads(raw_perms)
        except Exception:
            user["permisos"] = {}
    elif not isinstance(raw_perms, dict):
        user["permisos"] = {}

    user["token"] = f"floamy-token-{user['id']}"
    return jsonify(user)

@auth_bp.post("/register-client")
def register_client():
    data = request.get_json() or {}
    nombre = (data.get("nombre") or "").strip()
    correo = (data.get("correo") or "").strip()
    telefono = (data.get("telefono") or "").strip()
    password = (data.get("password") or "").strip()

    if not nombre or not correo or not password:
        return jsonify({"error": "Completa nombre, correo y contraseña"}), 400

    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT id FROM roles WHERE nombre = 'Cliente' LIMIT 1")
        rol_row = cursor.fetchone()
        rol_id = rol_row["id"] if rol_row else 4

        cursor.execute("SELECT id FROM usuarios WHERE correo = %s", (correo,))
        if cursor.fetchone():
            return jsonify({"error": "Ese correo ya está registrado"}), 409

        cursor.execute(
            "INSERT INTO usuarios (nombre, correo, password_hash, rol_id, activo) VALUES (%s, %s, %s, %s, 1)",
            (nombre, correo, password, rol_id)
        )
        new_id = cursor.lastrowid

        try:
            cursor.execute("SHOW COLUMNS FROM clientes")
            cols = {row["Field"] for row in cursor.fetchall()}
            insert_cols = []
            insert_vals = []

            if "usuario_id" in cols:
                insert_cols.append("usuario_id")
                insert_vals.append(new_id)
            if "nombre" in cols:
                insert_cols.append("nombre")
                insert_vals.append(nombre)
            elif "nombre_completo" in cols:
                insert_cols.append("nombre_completo")
                insert_vals.append(nombre)
            if "correo" in cols:
                insert_cols.append("correo")
                insert_vals.append(correo)
            elif "email" in cols:
                insert_cols.append("email")
                insert_vals.append(correo)
            if "telefono" in cols:
                insert_cols.append("telefono")
                insert_vals.append(telefono)
            if "pedidos_totales" in cols:
                insert_cols.append("pedidos_totales")
                insert_vals.append(0)

            if insert_cols:
                placeholders = ", ".join(["%s"] * len(insert_cols))
                col_names = ", ".join(insert_cols)
                cursor.execute(f"INSERT INTO clientes ({col_names}) VALUES ({placeholders})", tuple(insert_vals))
        except Exception:
            pass

    return jsonify({
        "id": new_id,
        "nombre": nombre,
        "correo": correo,
        "rol": "Cliente",
        "permisos": {},
        "token": f"floamy-token-{new_id}"
    }), 201