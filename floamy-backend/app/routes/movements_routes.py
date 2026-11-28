from flask import Blueprint, request, jsonify
from app.extensions import get_db_connection
from app.services.stock_service import adjust_ingredient_stock, sync_all_product_stocks
from app.utils.decorators import token_required

movements_bp = Blueprint("movements", __name__)


@movements_bp.route("", methods=["GET"])
@movements_bp.route("/", methods=["GET"])
@token_required
def list_movements():
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute("""
            SELECT m.id,
                   m.ingrediente_id,
                   m.cantidad,
                   DATE_FORMAT(m.fecha, '%d %b, %H:%i') AS date,
                   m.tipo AS type,
                   i.nombre AS ingredient,
                   CONCAT(m.cantidad, ' ', i.unidad) AS amount,
                   COALESCE(u.nombre, 'Sistema') AS responsible
            FROM movimientos_ingredientes m
            JOIN ingredientes i ON m.ingrediente_id = i.id
            LEFT JOIN usuarios u ON m.usuario_id = u.id
            ORDER BY m.fecha DESC, m.id DESC
        """)
        rows = cursor.fetchall()
    return jsonify(rows)


@movements_bp.route("", methods=["POST"])
@movements_bp.route("/", methods=["POST"])
@token_required
def register_movement():
    data = request.get_json(silent=True) or {}
    qty = abs(float(data.get("cantidad", 0)))
    tipo = data.get("tipo", "Entrada")
    delta = qty if tipo == "Entrada" else -qty
    ing_id = int(data["ingredienteId"])

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "INSERT INTO movimientos_ingredientes (ingrediente_id, tipo, cantidad, usuario_id) VALUES (%s, %s, %s, %s)",
                (ing_id, tipo, delta, data.get("usuarioId")),
            )
            adjust_ingredient_stock(cursor, ing_id, delta)
            sync_all_product_stocks(cursor)
        conn.commit()
    except Exception as exc:
        try:
            conn.rollback()
        except Exception:
            pass
        return jsonify({"error": f"No se pudo registrar el movimiento: {exc}"}), 400

    return jsonify({"message": "Movimiento registrado y stock sincronizado"}), 201


@movements_bp.route("/<int:mov_id>", methods=["PUT", "PATCH", "POST"])
@movements_bp.route("/<int:mov_id>/", methods=["PUT", "PATCH", "POST"])
@token_required
def update_movement(mov_id):
    data = request.get_json(silent=True) or {}
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM movimientos_ingredientes WHERE id = %s", (mov_id,))
            old = cursor.fetchone()
            if not old:
                return jsonify({"error": "Movimiento no encontrado"}), 404

            old_cant = abs(float(old["cantidad"]))
            old_delta = old_cant if old["tipo"] == "Entrada" else -old_cant

            adjust_ingredient_stock(cursor, int(old["ingrediente_id"]), -old_delta)

            new_ing = int(data.get("ingredienteId", old["ingrediente_id"]))
            new_tipo = data.get("tipo", old["tipo"])
            new_cant = abs(float(data.get("cantidad", old_cant)))
            new_delta = new_cant if new_tipo == "Entrada" else -new_cant

            adjust_ingredient_stock(cursor, new_ing, new_delta)
            cursor.execute(
                """
                UPDATE movimientos_ingredientes
                SET ingrediente_id = %s, tipo = %s, cantidad = %s
                WHERE id = %s
                """,
                (new_ing, new_tipo, new_delta, mov_id),
            )
            sync_all_product_stocks(cursor)
        conn.commit()
    except Exception as exc:
        try:
            conn.rollback()
        except Exception:
            pass
        return jsonify({"error": f"No se pudo actualizar el movimiento: {exc}"}), 400

    return jsonify({"message": "Movimiento actualizado y stock sincronizado"})


@movements_bp.route("/<int:mov_id>", methods=["DELETE"])
@movements_bp.route("/<int:mov_id>/", methods=["DELETE"])
@token_required
def delete_movement(mov_id):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM movimientos_ingredientes WHERE id = %s", (mov_id,))
            old = cursor.fetchone()
            if not old:
                return jsonify({"error": "Movimiento no encontrado"}), 404

            old_cant = abs(float(old["cantidad"]))
            old_delta = old_cant if old["tipo"] == "Entrada" else -old_cant

            adjust_ingredient_stock(cursor, int(old["ingrediente_id"]), -old_delta)
            cursor.execute("DELETE FROM movimientos_ingredientes WHERE id = %s", (mov_id,))
            sync_all_product_stocks(cursor)
        conn.commit()
    except Exception as exc:
        try:
            conn.rollback()
        except Exception:
            pass
        return jsonify({"error": f"No se pudo eliminar el movimiento: {exc}"}), 400

    return jsonify({"message": "Movimiento eliminado y stock sincronizado"})