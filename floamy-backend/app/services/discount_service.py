def calculate_discount(items, is_first_pwa_order=False):
    subtotal = sum(item["price"] * item["qty"] for item in items)
    total_cups = sum(item["qty"] for item in items if item["size"] == "Vaso 8 oz")
    total_liters = sum(item["qty"] for item in items if item["size"] == "Litro")

    if is_first_pwa_order and subtotal > 0:
        return round(subtotal * 0.10, 2), "Primer pedido PWA (10%)"
    if total_liters >= 2:
        return round(subtotal * 0.15, 2), "Pack familiar 2+ litros (15%)"
    if total_cups >= 2:
        return round(subtotal * 0.10, 2), "Combo 2+ vasos aplicado (10%)"
    return 0.0, ""