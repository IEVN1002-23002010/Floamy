# --- payments_routes.py ---
from flask import Blueprint, jsonify
from app.extensions import get_db_connection

payments_bp = Blueprint("payments", __name__)

@payments_bp.get("/")
def list_payments():
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM pagos_simulados ORDER BY fecha DESC")
        rows = cursor.fetchall()
    return jsonify(rows)