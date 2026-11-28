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


def calc_available_units(
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


def sync_product_stocks_for_helado(
    cursor,
    helado_id: int,
    stock_litros: float,
    activo: int | None = None,
    presentaciones: list | None = None,
    ing_stocks: dict | None = None,
):
    if presentaciones is None:
        cursor.execute("SELECT * FROM presentaciones")
        presentaciones = cursor.fetchall()

    if ing_stocks is None:
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
        unidades = calc_available_units(stock_litros, litros_unit, des_stock, cuch_stock)

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


def sync_all_product_stocks(cursor):
    cursor.execute("SELECT id, stock_litros FROM helados")
    helados = cursor.fetchall()

    cursor.execute("SELECT * FROM presentaciones")
    presentaciones = cursor.fetchall()

    ing_stocks = {}
    try:
        cursor.execute("SELECT id, stock_actual FROM ingredientes")
        for row in cursor.fetchall():
            ing_stocks[int(row["id"])] = float(row["stock_actual"] or 0)
    except Exception:
        pass

    for h in helados:
        sync_product_stocks_for_helado(
            cursor,
            int(h["id"]),
            float(h["stock_litros"] or 0),
            activo=None,
            presentaciones=presentaciones,
            ing_stocks=ing_stocks,
        )


def adjust_product_stock(cursor, product_id, delta):
    cursor.execute(
        "UPDATE productos SET stock = GREATEST(0, stock + %s) WHERE id = %s",
        (delta, product_id),
    )


def adjust_ingredient_stock(cursor, ingredient_id, delta):
    cursor.execute(
        "UPDATE ingredientes SET stock_actual = GREATEST(0, stock_actual + %s) WHERE id = %s",
        (delta, ingredient_id),
    )