import re
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from flask import Blueprint, jsonify, request
from pymysql.err import IntegrityError
from app.extensions import get_db_connection
from app.utils.decorators import require_permission

coupons_bp = Blueprint("coupons", __name__)


def available_coupon(cursor, code, lock=False):
    query = "SELECT * FROM cupones WHERE codigo=%s"
    cursor.execute(query + (" FOR UPDATE" if lock else ""), (str(code).strip().upper(),))
    row = cursor.fetchone()
    if not row or not row["activo"] or row["archivado"] or row["usados"] >= row["limite"]:
        raise ValueError("El cupón no está disponible o ya agotó sus usos.")
    return row


def discount_for(row, subtotal):
    amount = row["valor"]
    if row["tipo"] == "porcentaje":
        amount = subtotal * amount / 100
    return min(subtotal, amount.quantize(Decimal(".01"), rounding=ROUND_HALF_UP))


@coupons_bp.post("/validar")
def validate():
    with get_db_connection() as conn, conn.cursor() as cursor:
        try:
            row = available_coupon(cursor, (request.get_json() or {}).get("codigo", ""))
        except ValueError as exc:
            return jsonify(error=str(exc)), 400
        return jsonify(codigo=row["codigo"], tipo=row["tipo"], valor=float(row["valor"]))


@coupons_bp.get("/")
@require_permission("coupons")
def listing():
    with get_db_connection() as conn, conn.cursor() as cursor:
        cursor.execute("SELECT id,nombre,codigo,tipo,valor,limite,usados,activo FROM cupones WHERE archivado=0 ORDER BY id DESC")
        rows = cursor.fetchall()
        for row in rows:
            row["valor"] = float(row["valor"])
            row["activo"] = bool(row["activo"])
        return jsonify(rows)


@coupons_bp.post("/")
@coupons_bp.put("/<int:cid>")
@require_permission("coupons")
def save(cid=None):
    data = request.get_json() or {}
    name = str(data.get("nombre") or "").strip()
    code = str(data.get("codigo") or "").strip().upper()
    kind = data.get("tipo")
    try:
        value = Decimal(str(data["valor"]))
        limit = int(str(data["limite"]))
        if not (value.is_finite() and 0 < value < 100000000 and value == value.quantize(Decimal(".01"))):
            raise ValueError()
        if kind not in ("porcentaje", "pesos") or (kind == "porcentaje" and value > 100):
            raise ValueError()
        if not (0 < limit <= 4294967295 and 0 < len(name) <= 100 and re.fullmatch(r"[A-Z0-9_-]{1,40}", code)):
            raise ValueError()
        if not isinstance(data.get("activo"), bool):
            raise ValueError()
    except (ValueError, InvalidOperation, KeyError):
        return jsonify(error="Revisa el nombre, código, descuento y límite de usos."), 400
    values = (name, code, kind, value, limit, data["activo"])
    with get_db_connection() as conn, conn.cursor() as cursor:
        conn.begin()
        try:
            if cid is None:
                cursor.execute("INSERT INTO cupones(nombre,codigo,tipo,valor,limite,activo) VALUES (%s,%s,%s,%s,%s,%s)", values)
            else:
                cursor.execute("SELECT usados FROM cupones WHERE id=%s AND archivado=0 FOR UPDATE", (cid,))
                row = cursor.fetchone()
                if not row or limit < row["usados"]:
                    return jsonify(error="Cupón inexistente o límite inferior a sus canjes."), 409
                cursor.execute("UPDATE cupones SET nombre=%s,codigo=%s,tipo=%s,valor=%s,limite=%s,activo=%s WHERE id=%s", values + (cid,))
            conn.commit()
        except IntegrityError:
            conn.rollback()
            return jsonify(error="Ese código ya está registrado."), 409
    return jsonify(ok=True)


@coupons_bp.delete("/<int:cid>")
@require_permission("coupons")
def delete(cid):
    with get_db_connection() as conn, conn.cursor() as cursor:
        conn.begin()
        cursor.execute("DELETE FROM cupones WHERE id=%s AND usados=0", (cid,))
        if not cursor.rowcount:
            cursor.execute("UPDATE cupones SET archivado=1,activo=0 WHERE id=%s AND archivado=0", (cid,))
        conn.commit()
    return jsonify(ok=True)
