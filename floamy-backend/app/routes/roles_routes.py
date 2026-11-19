import json
from flask import Blueprint, request, jsonify
from app.extensions import get_db_connection

roles_bp = Blueprint("roles", __name__)

DEFAULT_PERMISSIONS = {
    "administrador": {
        "dashboard": True,
        "pos": True,
        "orders": True,
        "cash_register": True,
        "products": True,
        "catalog_options": True,
        "inventory": True,
        "movements": True,
        "suppliers": True,
        "clients": True,
        "users": True,
        "roles": True,
        "reviews": True,
    },
    "empleado": {
        "dashboard": False,
        "pos": True,
        "orders": True,
        "cash_register": True,
        "products": True,
        "catalog_options": False,
        "inventory": True,
        "movements": False,
        "suppliers": False,
        "clients": True,
        "users": False,
        "roles": False,
        "reviews": True,
    },
    "cocina": {
        "dashboard": False,
        "pos": False,
        "orders": True,
        "cash_register": False,
        "products": True,
        "catalog_options": False,
        "inventory": True,
        "movements": True,
        "suppliers": False,
        "clients": False,
        "users": False,
        "roles": False,
        "reviews": False,
    },
    "cliente": {
        "dashboard": False,
        "pos": False,
        "orders": True,
        "cash_register": False,
        "products": True,
        "catalog_options": False,
        "inventory": False,
        "movements": False,
        "suppliers": False,
        "clients": False,
        "users": False,
        "roles": False,
        "reviews": True,
    },
}

DEFAULT_DESCRIPTIONS = {
    "administrador": "Control total del sistema",
    "empleado": "Pedidos, caja, clientes y consulta de stock",
    "cocina": "Inventario, producción y stock",
    "cliente": "Catálogo, carrito y seguimiento",
}


def ensure_permissions_column(cursor):
    cursor.execute("SHOW COLUMNS FROM roles")
    cols = {row["Field"] for row in cursor.fetchall()}
    if "permisos" not in cols:
        cursor.execute("ALTER TABLE roles ADD COLUMN permisos TEXT NULL")
        cols.add("permisos")
    return cols


def parse_permissions(role_name: str, raw_perms) -> dict:
    key = role_name.strip().lower()
    base = dict(DEFAULT_PERMISSIONS.get(key, DEFAULT_PERMISSIONS["empleado"]))

    if isinstance(raw_perms, dict):
        base.update({k: bool(v) for k, v in raw_perms.items()})
        return base

    if isinstance(raw_perms, str) and raw_perms.strip():
        try:
            parsed = json.loads(raw_perms)
            if isinstance(parsed, dict):
                base.update({k: bool(v) for k, v in parsed.items()})
        except Exception:
            pass

    return base


@roles_bp.get("/")
@roles_bp.get("")
def list_roles():
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cols = ensure_permissions_column(cursor)
        conn.commit()

        cursor.execute("SELECT * FROM roles ORDER BY id ASC")
        rows = cursor.fetchall()

        result = []
        for r in rows:
            nombre = r.get("nombre") or r.get("rol") or "Rol"
            key = nombre.strip().lower()
            desc = (
                r.get("descripcion")
                if "descripcion" in cols and r.get("descripcion")
                else DEFAULT_DESCRIPTIONS.get(key, "Perfil del sistema")
            )
            result.append({
                "id": r["id"],
                "nombre": nombre,
                "descripcion": desc,
                "permisos": parse_permissions(nombre, r.get("permisos")),
            })

    return jsonify(result)


@roles_bp.put("/<int:role_id>")
@roles_bp.patch("/<int:role_id>")
def update_role(role_id):
    data = request.get_json(silent=True) or {}
    permisos = data.get("permisos") or {}

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            ensure_permissions_column(cursor)
            cursor.execute(
                "UPDATE roles SET permisos = %s WHERE id = %s",
                (json.dumps(permisos, ensure_ascii=False), role_id),
            )
        conn.commit()
    except Exception as exc:
        try:
            conn.rollback()
        except Exception:
            pass
        return jsonify({"error": f"No se pudieron guardar los permisos: {exc}"}), 400

    return jsonify({"message": "Permisos actualizados", "id": role_id, "permisos": permisos})