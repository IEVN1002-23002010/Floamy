from functools import wraps
import jwt
from flask import request, jsonify, current_app

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Token requerido"}), 401
        token = auth_header.split(" ")[1]
        try:
            payload = jwt.decode(token, current_app.config["SECRET_KEY"], algorithms=["HS256"])
            request.user = payload
        except jwt.InvalidTokenError:
            return jsonify({"error": "Token inválido o expirado"}), 401
        return f(*args, **kwargs)
    return decorated