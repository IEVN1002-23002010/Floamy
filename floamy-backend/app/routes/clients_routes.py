import base64
import hashlib
import hmac
import os
from flask import Blueprint, current_app, request, jsonify
from app.extensions import get_db_connection
from app.utils.decorators import token_required

clients_bp = Blueprint("clients", __name__)


def _get_phone_key() -> bytes:
    secret = ""
    try:
        secret = str(current_app.config.get("SECRET_KEY") or "")
    except RuntimeError:
        pass
    if not secret:
        secret = os.environ.get("SECRET_KEY", "floamy-secret-key-jwt-2026-leon-gto-secure")
    return hashlib.sha256(secret.encode("utf-8")).digest()


def _keystream(key: bytes, iv: bytes, length: int) -> bytes:
    out = bytearray()
    counter = 0
    while len(out) < length:
        block = hashlib.sha256(key + iv + counter.to_bytes(4, "big")).digest()
        out.extend(block)
        counter += 1
    return bytes(out[:length])


def encrypt_phone(phone: str) -> str:
    clean = (phone or "").strip()
    if not clean or clean.startswith("enc:"):
        return clean
    key = _get_phone_key()
    iv = os.urandom(16)
    raw = clean.encode("utf-8")
    stream = _keystream(key, iv, len(raw))
    cipher = bytes(a ^ b for a, b in zip(raw, stream))
    tag = hmac.new(key, iv + cipher, hashlib.sha256).digest()[:16]
    token = base64.urlsafe_b64encode(iv + tag + cipher).decode("ascii")
    return f"enc:{token}"


def decrypt_phone(stored: str) -> str:
    val = (stored or "").strip()
    if not val:
        return "—"
    if not val.startswith("enc:"):
        return val
    try:
        blob = base64.urlsafe_b64decode(val[4:].encode("ascii"))
        if len(blob) < 32:
            return "—"
        iv, tag, cipher = blob[:16], blob[16:32], blob[32:]
        key = _get_phone_key()
        expected_tag = hmac.new(key, iv + cipher, hashlib.sha256).digest()[:16]
        if not hmac.compare_digest(tag, expected_tag):
            return "—"
        stream = _keystream(key, iv, len(cipher))
        raw = bytes(a ^ b for a, b in zip(cipher, stream))
        return raw.decode("utf-8")
    except Exception:
        return "—"


@clients_bp.route("", methods=["GET"])
@clients_bp.route("/", methods=["GET"])
@token_required
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
        raw_tel = r.get("telefono") or r.get("phone") or ""
        telefono = decrypt_phone(raw_tel) if raw_tel else "—"

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
            "edad": r.get("edad"),
            "genero": r.get("genero") or "",
            "zona": r.get("zona") or "",
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
@token_required
def create_client():
    data = request.get_json(silent=True) or {}
    nombre = (data.get("nombre") or data.get("name") or "").strip()
    correo = (data.get("correo") or data.get("email") or "").strip()
    telefono = (data.get("telefono") or data.get("phone") or "").strip()
    zona = (data.get("zona") or "").strip() or None
    genero = (data.get("genero") or "").strip() or None
    raw_edad = data.get("edad")
    edad = int(raw_edad) if str(raw_edad or "").isdigit() and int(raw_edad) > 0 else None

    if not nombre or not correo:
        return jsonify({"error": "Nombre y correo son obligatorios"}), 400

    encrypted_phone = encrypt_phone(telefono) if telefono else None

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
                insert_vals.append(encrypted_phone)
            elif "phone" in cols:
                insert_cols.append("phone")
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
@token_required
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