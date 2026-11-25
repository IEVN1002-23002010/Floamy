import os
import uuid
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from werkzeug.utils import secure_filename
from app.extensions import get_db_connection

products_bp = Blueprint("products", __name__)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp", "gif"}


def _upload_dir() -> str:
    folder = os.path.join(current_app.root_path, "static", "uploads", "products")
    os.makedirs(folder, exist_ok=True)
    return folder


def _allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def _get_columns(cursor, table_name: str) -> set:
    try:
        cursor.execute(f"SHOW COLUMNS FROM {table_name}")
        return {row["Field"] for row in cursor.fetchall()}
    except Exception:
        return set()


def _infer_liters(pres_row: dict) -> float:
    raw = pres_row.get("litros_consumidos")
    if raw is not None and float(raw) > 0:
        return float(raw)
    s = (pres_row.get("nombre") or "").lower()
    if "medio" in s or "1/2" in s or "500" in s:
        return 0.5
    if "litro" in s or "1l" in s or "1000" in s:
        return 1.0
    if "12" in s:
        return 0.35
    if "cono" in s:
        return 0.15
    return 0.24


def _calc_available_units(
    stock_litros: float,
    litros_unit: float,
    desechable_stock: float | None = None,
    cuchara_stock: float | None = None,
) -> int:
    if litros_unit <= 0 or stock_litros <= 0:
        return 0
    unidades = int((stock_litros + 1e-6) // litros_unit)
    if desechable_stock is not None:
        unidades = min(unidades, max(0, int(desechable_stock)))
    if cuchara_stock is not None:
        unidades = min(unidades, max(0, int(cuchara_stock)))
    return max(0, unidades)


def _sync_product_stocks(cursor, helado_id: int, stock_litros: float, activo: int | None = None):
    cursor.execute("SELECT * FROM presentaciones")
    presentaciones = cursor.fetchall()

    ing_stocks = {}
    try:
        cursor.execute("SELECT id, stock_actual FROM ingredientes")
        for row in cursor.fetchall():
            ing_stocks[int(row["id"])] = float(row["stock_actual"] or 0)
    except Exception:
        pass

    cursor.execute("SELECT id, presentacion_id FROM productos WHERE helado_id = %s", (helado_id,))
    existing_map = {int(row["presentacion_id"]): int(row["id"]) for row in cursor.fetchall()}

    for pres in presentaciones:
        pres_id = int(pres["id"])
        litros_unit = _infer_liters(pres)
        des_id = pres.get("ingrediente_desechable_id") or pres.get("empaque_ingrediente_id")
        cuch_id = pres.get("cuchara_ingrediente_id")

        des_stock = ing_stocks.get(int(des_id)) if des_id else None
        cuch_stock = ing_stocks.get(int(cuch_id)) if cuch_id else None
        unidades = _calc_available_units(stock_litros, litros_unit, des_stock, cuch_stock)

        if pres_id in existing_map:
            if activo is not None:
                cursor.execute(
                    "UPDATE productos SET stock = %s, activo = %s WHERE id = %s",
                    (unidades, activo, existing_map[pres_id]),
                )
            else:
                cursor.execute(
                    "UPDATE productos SET stock = %s WHERE id = %s",
                    (unidades, existing_map[pres_id]),
                )
        else:
            cursor.execute(
                """
                INSERT INTO productos (helado_id, presentacion_id, stock, activo)
                VALUES (%s, %s, %s, %s)
                """,
                (helado_id, pres_id, unidades, 1 if activo is None else activo),
            )


@products_bp.get("/uploads/<path:filename>")
def serve_product_upload(filename):
    return send_from_directory(_upload_dir(), filename)


@products_bp.post("/upload")
def upload_product_image():
    if "file" not in request.files:
        return jsonify({"error": "No se envió ningún archivo."}), 400

    file = request.files["file"]
    if not file or not file.filename:
        return jsonify({"error": "Selecciona una imagen válida."}), 400

    if not _allowed_file(file.filename):
        return jsonify({"error": "Formato no permitido. Usa PNG, JPG, WEBP o GIF."}), 400

    ext = secure_filename(file.filename).rsplit(".", 1)[1].lower()
    new_name = f"{uuid.uuid4().hex}.{ext}"
    file.save(os.path.join(_upload_dir(), new_name))

    base_url = request.host_url.rstrip("/")
    image_url = f"{base_url}/api/products/uploads/{new_name}"
    return jsonify({"url": image_url}), 201


@products_bp.get("/")
@products_bp.get("")
def list_products():
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute("""
            SELECT id, sabor, nombre_comercial, tono, imagen_url, stock_litros
            FROM helados
            ORDER BY id ASC
        """)
        helados = cursor.fetchall()

        cursor.execute("""
            SELECT r.id,
                   r.helado_id,
                   r.ingrediente_id,
                   i.nombre AS ingrediente_nombre,
                   i.unidad,
                   i.stock_actual,
                   i.costo_unitario,
                   r.cantidad_por_litro
            FROM recetas_helado r
            INNER JOIN ingredientes i ON r.ingrediente_id = i.id
            ORDER BY r.id ASC
        """)
        recetas_rows = cursor.fetchall()

        pres_cols = _get_columns(cursor, "presentaciones")
        extra_pres_fields = []
        if "ingrediente_desechable_id" in pres_cols:
            extra_pres_fields.append("p.ingrediente_desechable_id")
        if "empaque_ingrediente_id" in pres_cols:
            extra_pres_fields.append("p.empaque_ingrediente_id")
        if "cuchara_ingrediente_id" in pres_cols:
            extra_pres_fields.append("p.cuchara_ingrediente_id")
        extra_sql = (", " + ", ".join(extra_pres_fields)) if extra_pres_fields else ""

        cursor.execute(f"""
            SELECT pr.id,
                   pr.helado_id,
                   pr.presentacion_id,
                   p.nombre,
                   p.precio,
                   p.litros_consumidos,
                   pr.stock,
                   pr.activo
                   {extra_sql}
            FROM productos pr
            INNER JOIN presentaciones p ON pr.presentacion_id = p.id
            ORDER BY p.precio ASC, p.id ASC
        """)
        prod_rows = cursor.fetchall()

        ing_stocks = {}
        try:
            cursor.execute("SELECT id, stock_actual FROM ingredientes")
            for row in cursor.fetchall():
                ing_stocks[int(row["id"])] = float(row["stock_actual"] or 0)
        except Exception:
            pass

    helado_liters_map = {int(h["id"]): float(h["stock_litros"] or 0) for h in helados}

    recetas_map = {}
    for r in recetas_rows:
        item = {
            "id": r["id"],
            "ingrediente_id": r["ingrediente_id"],
            "ingrediente_nombre": r["ingrediente_nombre"],
            "nombre": r["ingrediente_nombre"],
            "unidad": r["unidad"],
            "stock_actual": float(r["stock_actual"] or 0),
            "costo_unitario": float(r["costo_unitario"] or 0),
            "cantidad_por_litro": float(r["cantidad_por_litro"] or 0),
        }
        recetas_map.setdefault(r["helado_id"], []).append(item)

    prod_map = {}
    for p in prod_rows:
        hid = int(p["helado_id"])
        activo = bool(p["activo"])
        precio = float(p["precio"] or 0)
        litros_consumidos = _infer_liters(p)
        stock_litros = helado_liters_map.get(hid, 0.0)

        des_id = p.get("ingrediente_desechable_id") or p.get("empaque_ingrediente_id")
        cuch_id = p.get("cuchara_ingrediente_id")
        des_stock = ing_stocks.get(int(des_id)) if des_id else None
        cuch_stock = ing_stocks.get(int(cuch_id)) if cuch_id else None

        stock_disp = _calc_available_units(stock_litros, litros_consumidos, des_stock, cuch_stock) if activo else 0

        prod_map.setdefault(hid, []).append({
            "id": p["id"],
            "productId": p["id"],
            "presentacion_id": p["presentacion_id"],
            "presentationId": p["presentacion_id"],
            "presentacion_nombre": p["nombre"],
            "name": p["nombre"],
            "precio": precio,
            "price": precio,
            "litros_consumidos": litros_consumidos,
            "litrosConsumidos": litros_consumidos,
            "ingredienteDesechableId": int(des_id) if des_id else None,
            "desechableStock": des_stock,
            "cucharaIngredienteId": int(cuch_id) if cuch_id else None,
            "cucharaStock": cuch_stock,
            "stock": stock_disp,
            "activo": activo,
        })

    result = []
    for h in helados:
        hid = int(h["id"])
        variantes = prod_map.get(hid, [])
        activo = any(v["activo"] for v in variantes) if variantes else True
        stock_litros = float(h["stock_litros"] or 0)
        receta = recetas_map.get(hid, [])
        img = h["imagen_url"] or ""

        result.append({
            "id": hid,
            "nombre_comercial": h["nombre_comercial"],
            "name": h["nombre_comercial"],
            "sabor": h["sabor"],
            "flavor": h["sabor"],
            "tono": h["tono"] or "strawberry",
            "tone": h["tono"] or "strawberry",
            "imagen_url": img,
            "imageUrl": img,
            "image": img,
            "stock_litros": stock_litros,
            "stockLitros": stock_litros,
            "activo": activo,
            "receta": receta,
            "recipe": receta,
            "presentaciones": variantes,
            "presentations": variantes,
        })

    return jsonify(result)


@products_bp.post("/")
@products_bp.post("")
def create_product():
    data = request.get_json(silent=True) or {}
    nombre = (data.get("nombre_comercial") or data.get("name") or "").strip()
    sabor = (data.get("sabor") or data.get("flavor") or "").strip()
    tono = (data.get("tono") or data.get("tone") or "strawberry").strip()
    imagen_url = (data.get("imagen_url") or data.get("imageUrl") or "").strip()

    raw_stock = data.get("stock_litros") if data.get("stock_litros") is not None else data.get("stockLitros")
    stock_litros = round(float(raw_stock), 3) if raw_stock not in (None, "") else 0.0
    if stock_litros < 0:
        stock_litros = 0.0

    raw_recipe = data.get("receta") or data.get("recipe") or []

    if not nombre or not sabor:
        return jsonify({"error": "El nombre del producto y el sabor son obligatorios."}), 400

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO helados (sabor, nombre_comercial, tono, imagen_url, stock_litros)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (sabor, nombre, tono, imagen_url or None, stock_litros),
            )
            helado_id = cursor.lastrowid

            seen_ings = set()
            for line in raw_recipe:
                ing_id = int(line.get("ingrediente_id") or line.get("ingredienteId") or 0)
                cant = round(float(line.get("cantidad_por_litro") or line.get("cantidad") or 0), 3)
                if ing_id <= 0 or cant <= 0 or ing_id in seen_ings:
                    continue
                seen_ings.add(ing_id)
                cursor.execute(
                    """
                    INSERT INTO recetas_helado (helado_id, ingrediente_id, cantidad_por_litro)
                    VALUES (%s, %s, %s)
                    """,
                    (helado_id, ing_id, cant),
                )

            _sync_product_stocks(cursor, helado_id, stock_litros, 1)

        conn.commit()
    except Exception as exc:
        conn.rollback()
        return jsonify({"error": f"No se pudo registrar el producto: {exc}"}), 400

    return jsonify({"id": helado_id, "message": "Producto registrado correctamente"}), 201


@products_bp.put("/<int:helado_id>")
@products_bp.patch("/<int:helado_id>")
def update_product(helado_id):
    data = request.get_json(silent=True) or {}
    nombre = (data.get("nombre_comercial") or data.get("name") or "").strip()
    sabor = (data.get("sabor") or data.get("flavor") or "").strip()
    tono = (data.get("tono") or data.get("tone") or "strawberry").strip()
    imagen_url = (data.get("imagen_url") or data.get("imageUrl") or "").strip()

    raw_stock = data.get("stock_litros") if data.get("stock_litros") is not None else data.get("stockLitros")
    stock_litros = round(float(raw_stock), 3) if raw_stock not in (None, "") else 0.0
    if stock_litros < 0:
        stock_litros = 0.0

    activo = None
    if "activo" in data:
        activo = 1 if data["activo"] else 0

    raw_recipe = data.get("receta") if "receta" in data else data.get("recipe")

    if not nombre or not sabor:
        return jsonify({"error": "El nombre del producto y el sabor son obligatorios."}), 400

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id FROM helados WHERE id = %s", (helado_id,))
            if not cursor.fetchone():
                return jsonify({"error": "Producto no encontrado."}), 404

            cursor.execute(
                """
                UPDATE helados
                SET sabor = %s,
                    nombre_comercial = %s,
                    tono = %s,
                    imagen_url = %s,
                    stock_litros = %s
                WHERE id = %s
                """,
                (sabor, nombre, tono, imagen_url or None, stock_litros, helado_id),
            )

            if raw_recipe is not None:
                cursor.execute("DELETE FROM recetas_helado WHERE helado_id = %s", (helado_id,))
                seen_ings = set()
                for line in raw_recipe:
                    ing_id = int(line.get("ingrediente_id") or line.get("ingredienteId") or 0)
                    cant = round(float(line.get("cantidad_por_litro") or line.get("cantidad") or 0), 3)
                    if ing_id <= 0 or cant <= 0 or ing_id in seen_ings:
                        continue
                    seen_ings.add(ing_id)
                    cursor.execute(
                        """
                        INSERT INTO recetas_helado (helado_id, ingrediente_id, cantidad_por_litro)
                        VALUES (%s, %s, %s)
                        """,
                        (helado_id, ing_id, cant),
                    )

            _sync_product_stocks(cursor, helado_id, stock_litros, activo)

        conn.commit()
    except Exception as exc:
        conn.rollback()
        return jsonify({"error": f"No se pudo actualizar el producto: {exc}"}), 400

    return jsonify({"message": "Producto actualizado"})


@products_bp.post("/<int:helado_id>/produce")
def produce_batch(helado_id):
    data = request.get_json(silent=True) or {}
    litros = round(float(data.get("litros") or 0), 3)
    usuario_id = data.get("usuario_id") or data.get("usuarioId")

    if litros <= 0:
        return jsonify({"error": "Indica una cantidad de litros mayor a 0."}), 400

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM helados WHERE id = %s LIMIT 1", (helado_id,))
            helado = cursor.fetchone()
            if not helado:
                raise ValueError("Sabor de helado no encontrado.")

            cursor.execute(
                """
                SELECT r.ingrediente_id, r.cantidad_por_litro, i.nombre, i.stock_actual, i.unidad
                FROM recetas_helado r
                INNER JOIN ingredientes i ON r.ingrediente_id = i.id
                WHERE r.helado_id = %s
                """,
                (helado_id,),
            )
            receta = cursor.fetchall()
            if not receta:
                raise ValueError("Este producto no tiene ingredientes configurados en su receta por litro.")

            for item in receta:
                requerido = round(float(item["cantidad_por_litro"]) * litros, 3)
                disponible = float(item["stock_actual"] or 0)
                if disponible < requerido:
                    raise ValueError(
                        f"Insumo insuficiente: se necesitan {requerido} {item['unidad']} de {item['nombre']} y hay {disponible} {item['unidad']}."
                    )

            for item in receta:
                requerido = round(float(item["cantidad_por_litro"]) * litros, 2)
                ing_id = int(item["ingrediente_id"])
                cursor.execute(
                    "UPDATE ingredientes SET stock_actual = stock_actual - %s WHERE id = %s",
                    (requerido, ing_id),
                )
                cursor.execute(
                    """
                    INSERT INTO movimientos_ingredientes (ingrediente_id, tipo, cantidad, usuario_id)
                    VALUES (%s, 'Producción', %s, %s)
                    """,
                    (ing_id, -requerido, int(usuario_id) if usuario_id else None),
                )

            nuevo_stock = round(float(helado["stock_litros"] or 0) + litros, 3)
            cursor.execute(
                "UPDATE helados SET stock_litros = %s WHERE id = %s",
                (nuevo_stock, helado_id),
            )
            _sync_product_stocks(cursor, helado_id, nuevo_stock)

        conn.commit()
    except ValueError as err:
        conn.rollback()
        return jsonify({"error": str(err)}), 400
    except Exception as exc:
        conn.rollback()
        return jsonify({"error": f"No se pudo registrar la producción: {exc}"}), 400

    return jsonify({"message": f"Se produjeron {litros} L de {helado['nombre_comercial']}."})


@products_bp.delete("/<int:helado_id>")
def delete_product(helado_id):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM helados WHERE id = %s", (helado_id,))
        conn.commit()
    except Exception as exc:
        conn.rollback()
        return jsonify({"error": f"No se pudo eliminar el producto: {exc}"}), 400

    return jsonify({"message": "Producto eliminado"})