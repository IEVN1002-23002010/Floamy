from flask import Blueprint, request, jsonify
from app.extensions import get_db_connection

clients_bp = Blueprint("clients", __name__)


@clients_bp.route("", methods=["GET"])
@clients_bp.route("/", methods=["GET"])
def list_clients():
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM clientes ORDER BY id DESC")
        rows = cursor.fetchall()

        try:
            cursor.execute("SELECT * FROM pedidos")
            pedidos_rows = cursor.fetchall()
        except Exception:
            pedidos_rows = []

    clients_by_id = {r["id"]: r for r in rows if r.get("id") is not None}
    clients_by_name = {}
    for r in rows:
        raw_name = (r.get("nombre") or r.get("nombre_completo") or r.get("name") or "").strip().lower()
        if raw_name and raw_name not in clients_by_name:
            clients_by_name[raw_name] = r["id"]

    stats = {cid: {"orders": 0, "spent": 0.0} for cid in clients_by_id}

    for p in pedidos_rows:
        estado = (p.get("estado") or "").strip().lower()
        if "cancel" in estado:
            continue

        target_id = None
        p_cid = p.get("cliente_id")
        if p_cid in clients_by_id:
            target_id = p_cid
        else:
            p_name = (p.get("cliente_nombre") or p.get("cliente") or "").strip().lower()
            if p_name in clients_by_name:
                target_id = clients_by_name[p_name]

        if target_id is not None:
            stats[target_id]["orders"] += 1
            stats[target_id]["spent"] += float(p.get("total") or 0)

    result = []
    for r in rows:
        cid = r.get("id")
        nombre = r.get("nombre") or r.get("nombre_completo") or r.get("name") or "Cliente"
        correo = r.get("correo") or r.get("email") or ""
        telefono = r.get("telefono") or r.get("phone") or "—"

        base_pedidos = int(r.get("pedidos_totales") or r.get("pedidos") or 0)
        base_gastado = float(r.get("total_gastado") or r.get("gastado") or 0)

        calc = stats.get(cid, {"orders": 0, "spent": 0.0})
        pedidos = max(calc["orders"], base_pedidos)
        gastado = round(max(calc["spent"], base_gastado), 2)

        db_nivel = (r.get("nivel") or "").strip()
        if db_nivel.upper() == "VIP" or pedidos >= 5 or gastado >= 500:
            nivel = "VIP"
        elif pedidos >= 3:
            nivel = "Frecuente"
        else:
            nivel = "Nuevo"

        result.append({
            "id": cid,
            "name": nombre,
            "nombre": nombre,
            "email": correo,
            "correo": correo,
            "phone": telefono,
            "telefono": telefono,
            "orders": pedidos,
            "pedidos": pedidos,
            "spent": gastado,
            "gastado": gastado,
            "tier": nivel,
            "nivel": nivel,
        })

    return jsonify(result)


@clients_bp.route("", methods=["POST"])
@clients_bp.route("/", methods=["POST"])
def create_client():
    data = request.get_json(silent=True) or {}
    nombre = (data.get("nombre") or data.get("name") or "").strip()
    correo = (data.get("correo") or data.get("email") or "").strip()
    telefono = (data.get("telefono") or data.get("phone") or "").strip()

    if not nombre or not correo:
        return jsonify({"error": "Nombre y correo son obligatorios"}), 400

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SHOW COLUMNS FROM clientes")
            cols = {row["Field"] for row in cursor.fetchall()}

            insert_cols = []
            insert_vals = []

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
            elif "phone" in cols:
                insert_cols.append("phone")
                insert_vals.append(telefono)

            if "pedidos_totales" in cols:
                insert_cols.append("pedidos_totales")
                insert_vals.append(0)
            if "total_gastado" in cols:
                insert_cols.append("total_gastado")
                insert_vals.append(0)

            placeholders = ", ".join(["%s"] * len(insert_cols))
            col_names = ", ".join(insert_cols)
            cursor.execute(f"INSERT INTO clientes ({col_names}) VALUES ({placeholders})", tuple(insert_vals))
        conn.commit()
    except Exception as exc:
        try:
            conn.rollback()
        except Exception:
            pass
        return jsonify({"error": f"No se pudo registrar el cliente: {exc}"}), 400

    return jsonify({"message": "Cliente registrado"}), 201


@clients_bp.delete("/<int:client_id>")
def delete_client(client_id):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM clientes WHERE id = %s", (client_id,))
        conn.commit()
    except Exception as exc:
        try:
            conn.rollback()
        except Exception:
            pass
        return jsonify({"error": f"No se pudo eliminar el cliente: {exc}"}), 400

    return jsonify({"message": "Cliente eliminado"})