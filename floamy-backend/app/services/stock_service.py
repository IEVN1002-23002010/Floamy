def adjust_product_stock(cursor, product_id, delta):
    cursor.execute(
        "UPDATE productos SET stock = GREATEST(0, stock + %s) WHERE id = %s",
        (delta, product_id)
    )

def adjust_ingredient_stock(cursor, ingredient_id, delta):
    cursor.execute(
        "UPDATE ingredientes SET stock_actual = GREATEST(0, stock_actual + %s) WHERE id = %s",
        (delta, ingredient_id)
    )