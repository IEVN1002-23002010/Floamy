from datetime import datetime, timedelta, timezone
import jwt
from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import check_password_hash, generate_password_hash
from app.extensions import get_db_connection
from app.routes.roles_routes import parse_permissions
from app.routes.clients_routes import encrypt_phone

auth_bp = Blueprint("auth", __name__)


def generate_jwt_token(user_id: int, correo: str, rol: str, permisos: dict) -> str:
    exp_hours = int(current_app.config.get("JWT_EXPIRATION_HOURS", 12))
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "user_id": user_id,
        "correo": correo,
        "rol": rol,
        "permisos": permisos,
        "iat": now,
        "exp": now + timedelta(hours=exp_hours),
    }
    token = jwt.encode(payload, current_app.config["SECRET_KEY"], algorithm="HS256")
    return token if isinstance(token, str) else token.decode("utf-8")


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    correo = (data.get("correo") or "").strip()
    password = (data.get("password") or "").strip()

    if not correo or not password:
        return jsonify({"error": "Ingresa tu correo y contraseña"}), 400

    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute(
            """
            SELECT u.id, u.nombre, u.correo, u.password_hash, u.activo, r.nombre AS rol, r.permisos
            FROM usuarios u
            JOIN roles r ON u.rol_id = r.id
            WHERE u.correo = %s
            LIMIT 1
            """,
            (correo,),
        )
        user = cursor.fetchone()

    if not user:
        return jsonify({"error": "Correo o contraseña incorrectos"}), 401

    stored_pw = user.pop("password_hash", "") or ""
    valid_pw = stored_pw == password
    if not valid_pw and (stored_pw.startswith("scrypt:") or stored_pw.startswith("pbkdf2:")):
        valid_pw = check_password_hash(stored_pw, password)

    if not valid_pw:
        return jsonify({"error": "Correo o contraseña incorrectos"}), 401

    if not user["activo"]:
        return jsonify({"error": "Tu cuenta está desactivada"}), 403

    permisos = parse_permissions(user.get("rol") or "", user.get("permisos"))
    user["permisos"] = permisos
    user["token"] = generate_jwt_token(
        user_id=int(user["id"]),
        correo=user["correo"],
        rol=user["rol"],
        permisos=permisos,
    )
    return jsonify(user)


@auth_bp.post("/register-client")
def register_client():
    data = request.get_json(silent=True) or {}
    nombre = (data.get("nombre") or "").strip()
    correo = (data.get("correo") or "").strip()
    telefono = (data.get("telefono") or "").strip()
    password = (data.get("password") or "").strip()
    zona = (data.get("zona") or "").strip() or None
    genero = (data.get("genero") or "").strip() or None
    raw_edad = data.get("edad")
    edad = int(raw_edad) if str(raw_edad or "").isdigit() and int(raw_edad) > 0 else None

    if not nombre or not correo or not password:
        return jsonify({"error": "Completa nombre, correo y contraseña"}), 400

    encrypted_phone = encrypt_phone(telefono) if telefono else None

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id FROM roles WHERE LOWER(nombre) = 'cliente' LIMIT 1")
            rol_row = cursor.fetchone()
            rol_id = rol_row["id"] if rol_row else 4

            cursor.execute("SELECT id FROM usuarios WHERE correo = %s", (correo,))
            if cursor.fetchone():
                return jsonify({"error": "Ese correo ya está registrado"}), 409

            password_hash = generate_password_hash(password)
            cursor.execute(
                "INSERT INTO usuarios (nombre, correo, password_hash, rol_id, activo) VALUES (%s, %s, %s, %s, 1)",
                (nombre, correo, password_hash, rol_id),
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
                    insert_vals.append(encrypted_phone)
                if "edad" in cols:
                    insert_cols.append("edad")
                    insert_vals.append(edad)
                if "genero" in cols:
                    insert_cols.append("genero")
                    insert_vals.append(genero)
                if "zona" in cols:
                    insert_cols.append("zona")
                    insert_vals.append(zona)
                if "pedidos_totales" in cols:
                    insert_cols.append("pedidos_totales")
                    insert_vals.append(0)

                if insert_cols:
                    placeholders = ", ".join(["%s"] * len(insert_cols))
                    col_names = ", ".join(insert_cols)
                    cursor.execute(f"INSERT INTO clientes ({col_names}) VALUES ({placeholders})", tuple(insert_vals))
            except Exception:
                pass

        conn.commit()
    except Exception as exc:
        try:
            conn.rollback()
        except Exception:
            pass
        return jsonify({"error": f"No se pudo completar el registro: {exc}"}), 400

    permisos = parse_permissions("Cliente", {})
    token = generate_jwt_token(
        user_id=int(new_id),
        correo=correo,
        rol="Cliente",
        permisos=permisos,
    )
    return jsonify({
        "id": new_id,
        "nombre": nombre,
        "correo": correo,
        "rol": "Cliente",
        "permisos": permisos,
        "token": token,
    }), 201