USE floamy_db;

INSERT INTO roles (nombre, descripcion, permisos) VALUES
('Administrador', 'Control total del sistema', '{"pos":true,"orders":true,"clients":true,"products":true,"inventory":true}'),
('Empleado', 'Pedidos, clientes y consulta de stock', '{"pos":true,"orders":true,"clients":true,"products":false,"inventory":false}'),
('Cocina', 'Inventario, producción y stock', '{"pos":false,"orders":true,"clients":false,"products":true,"inventory":true}'),
('Cliente', 'Catálogo, carrito y seguimiento', '{"pos":false,"orders":false,"clients":false,"products":false,"inventory":false}');

INSERT INTO usuarios (nombre, correo, password_hash, rol_id, activo) VALUES
('Andrea Moreno', 'andrea@floamy.mx', 'floamy2025', 1, TRUE),
('Pablo Reyes', 'pablo@floamy.mx', 'floamy2025', 3, TRUE),
('Lucía García', 'lucia@floamy.mx', 'floamy2025', 2, TRUE);

INSERT INTO helados (sabor, nombre_comercial, tono, imagen_url) VALUES
('Vainilla', 'Vainilla Nube', 'vanilla', 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=400&q=80'),
('Chocolate', 'Cacao Profundo', 'chocolate', 'https://images.unsplash.com/photo-1580915411954-282cb1b0d780?auto=format&fit=crop&w=400&q=80'),
('Fresa', 'Fresa Nevada', 'strawberry', 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=400&q=80'),
('Mango', 'Mango Solar', 'mango', 'https://images.unsplash.com/photo-1505394033641-40c6ad1178d7?auto=format&fit=crop&w=400&q=80'),
('Limón', 'Limón Glaciar', 'lime', 'https://images.unsplash.com/photo-1516559828984-fb3b99548b21?auto=format&fit=crop&w=400&q=80');

INSERT INTO presentaciones (nombre, precio) VALUES
('Vaso 8 oz', 45.00),
('Litro', 150.00);

INSERT INTO productos (helado_id, presentacion_id, stock) VALUES
(1, 1, 18), (1, 2, 8),
(2, 1, 12), (2, 2, 6),
(3, 1, 15), (3, 2, 7),
(4, 1, 10), (4, 2, 4),
(5, 1, 6),  (5, 2, 3);

INSERT INTO ingredientes (nombre, categoria, stock_actual, stock_minimo, unidad, costo_unitario) VALUES
('Leche entera', 'Lácteos', 18.0, 10.0, 'L', 24.00),
('Crema para batir', 'Lácteos', 7.0, 8.0, 'L', 85.00),
('Azúcar', 'Secos', 14.0, 5.0, 'kg', 28.00),
('Cacao', 'Secos', 3.2, 4.0, 'kg', 190.00),
('Fresa natural', 'Fruta Natural', 9.0, 4.0, 'kg', 55.00),
('Mango ataulfo', 'Fruta Natural', 2.0, 3.0, 'kg', 48.00),
('Limón', 'Fruta Natural', 6.0, 3.0, 'kg', 32.00),
('Vainilla', 'Esencias', 1.5, 1.0, 'L', 210.00);

INSERT INTO resenas (cliente_nombre, calificacion, comentario) VALUES
('Mariana López', 5, 'El helado de vainilla sabe realmente artesanal. Cremoso, fresco y la atención fue increíble.'),
('Jorge Ávila', 5, 'Mango Solar es mi nuevo favorito. El pedido estuvo listo antes de lo esperado.'),
('Sofía Herrera', 5, 'Me encantó el empaque y poder seguir mi pedido en tiempo real.');