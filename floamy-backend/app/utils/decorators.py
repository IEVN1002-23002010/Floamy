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