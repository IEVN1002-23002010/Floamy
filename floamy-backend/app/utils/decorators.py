from functools import wraps
import jwt
from flask import request, jsonify, current_app


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Token JWT requerido"}), 401

        token = auth_header.split(" ", 1)[1].strip()
        if not token:
            return jsonify({"error": "Token JWT vacío"}), 401

        try:
            payload = jwt.decode(
                token,
                current_app.config["SECRET_KEY"],
                algorithms=["HS256"],
            )
            request.user = payload
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Tu sesión expiró. Inicia sesión nuevamente."}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Token JWT inválido"}), 401

        return f(*args, **kwargs)

    return decorated

def require_permission(key):
    def decorate(view):
        @token_required
        @wraps(view)
        def checked(*args, **kwargs):
            from app.extensions import get_db_connection
            from app.routes.roles_routes import parse_permissions
            with get_db_connection() as conn, conn.cursor() as cursor:
                cursor.execute("SELECT r.nombre,r.permisos FROM usuarios u JOIN roles r ON r.id=u.rol_id WHERE u.id=%s AND u.activo=1", (request.user.get("user_id"),))
                role = cursor.fetchone()
            if not role or role["nombre"].lower() == "cliente" or not parse_permissions(role["nombre"], role["permisos"]).get(key):
                return jsonify(error="Tu rol no tiene permiso."), 403
            return view(*args, **kwargs)
        return checked
    return decorate
