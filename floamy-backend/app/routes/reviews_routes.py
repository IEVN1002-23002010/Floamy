from flask import Blueprint, request, jsonify
from app.extensions import get_db_connection

reviews_bp = Blueprint("reviews", __name__)

@reviews_bp.get("/")
def list_reviews():
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute("""
            SELECT id, cliente_nombre, COALESCE(calificacion, 5) AS calificacion,
                   comentario, respuesta, DATE_FORMAT(fecha, '%d %b %Y') AS fecha
            FROM resenas
            ORDER BY id DESC
        """)
        rows = cursor.fetchall()
    return jsonify(rows)

@reviews_bp.post("/")
def create_review():
    data = request.get_json() or {}
    nombre = (data.get("cliente_nombre") or "Cliente Floamy").strip()
    comentario = (data.get("comentario") or "").strip()
    calificacion = int(data.get("calificacion", 5))

    if not comentario:
        return jsonify({"error": "El comentario es obligatorio"}), 400

    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute(
            "INSERT INTO resenas (cliente_nombre, calificacion, comentario) VALUES (%s, %s, %s)",
            (nombre, max(1, min(5, calificacion)), comentario)
        )
        new_id = cursor.lastrowid
    return jsonify({"id": new_id, "message": "Reseña publicada"}), 201

@reviews_bp.patch("/<int:review_id>/reply")
def reply_review(review_id):
    data = request.get_json() or {}
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute("UPDATE resenas SET respuesta = %s WHERE id = %s", (data.get("respuesta", ""), review_id))
    return jsonify({"message": "Respuesta guardada"})

@reviews_bp.delete("/<int:review_id>")
def delete_review(review_id):
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute("DELETE FROM resenas WHERE id = %s", (review_id,))
    return jsonify({"message": "Reseña eliminada"})