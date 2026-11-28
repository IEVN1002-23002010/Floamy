-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Nov 28, 2026 at 12:07 AM
-- Server version: 8.4.3
-- PHP Version: 8.3.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `floamy_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `clientes`
--

CREATE TABLE `clientes` (
  `id` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `correo` varchar(120) NOT NULL,
  `telefono` varchar(255) DEFAULT NULL,
  `edad` int DEFAULT NULL,
  `genero` varchar(30) DEFAULT NULL,
  `zona` varchar(100) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `total_compras` int DEFAULT '0',
  `total_gastado` decimal(10,2) DEFAULT '0.00',
  `fecha_registro` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `clientes`
--

INSERT INTO `clientes` (`id`, `nombre`, `correo`, `telefono`, `edad`, `genero`, `zona`, `password_hash`, `total_compras`, `total_gastado`, `fecha_registro`) VALUES
(1, 'Venta de mostrador', 'mostrador@floamy.mx', '477 000 0000', NULL, NULL, NULL, NULL, 8, 1152.00, '2026-11-01 09:00:00'),
(2, 'Mariana López', 'mariana.lopez@correo.mx', '477 234 8910', 26, 'Femenino', 'Jardines del Moral', 'Cliente123', 3, 409.30, '2026-11-03 12:15:00'),
(3, 'Jorge Ávila', 'jorge.avila@correo.mx', '477 561 2034', 34, 'Masculino', 'Centro', 'Cliente123', 3, 481.50, '2026-11-05 16:40:00'),
(4, 'Sofía Herrera', 'sofia.herrera@correo.mx', '477 892 4412', 22, 'Femenino', 'León Moderno', 'Cliente123', 3, 426.00, '2026-11-07 14:20:00'),
(5, 'Carlos Mendoza', 'carlos.mendoza@correo.mx', '477 318 7750', 29, 'Masculino', 'Valle del Campestre', 'Cliente123', 2, 370.00, '2026-11-09 18:05:00'),
(6, 'Valeria Ortega', 'valeria.ortega@correo.mx', '477 645 1928', 24, 'Femenino', 'Panorama', 'Cliente123', 2, 220.00, '2026-11-11 11:50:00'),
(7, 'Diego Ramírez', 'diego.ramirez@correo.mx', '477 903 5581', 38, 'Masculino', 'San Isidro', 'Cliente123', 2, 341.00, '2026-11-12 17:30:00'),
(8, 'Fernanda Castro', 'fernanda.castro@correo.mx', '477 412 6390', 21, 'Femenino', 'La Martinica', 'Cliente123', 2, 255.00, '2026-11-14 15:10:00'),
(9, 'Camila Navarro', 'camila.navarro@correo.mx', '477 519 8420', 28, 'Femenino', 'Andrade', 'Cliente123', 2, 344.00, '2026-11-15 10:20:00'),
(10, 'Christofer Dario', 'christofer@floamy.mx', '477 780 1122', 22, 'Masculino', 'Centro', 'Contrest123', 3, 590.00, '2026-11-15 13:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `cortes_caja`
--

CREATE TABLE `cortes_caja` (
  `id` int NOT NULL,
  `fecha_corte` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `usuario_id` int DEFAULT NULL,
  `responsable` varchar(120) NOT NULL,
  `fondo_inicial` decimal(10,2) NOT NULL DEFAULT '0.00',
  `ventas_efectivo` decimal(10,2) NOT NULL DEFAULT '0.00',
  `ventas_tarjeta` decimal(10,2) NOT NULL DEFAULT '0.00',
  `ventas_transferencia` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total_ventas` decimal(10,2) NOT NULL DEFAULT '0.00',
  `pedidos_count` int NOT NULL DEFAULT '0',
  `efectivo_esperado` decimal(10,2) NOT NULL DEFAULT '0.00',
  `efectivo_contado` decimal(10,2) NOT NULL DEFAULT '0.00',
  `diferencia` decimal(10,2) NOT NULL DEFAULT '0.00',
  `observaciones` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `cortes_caja`
--

INSERT INTO `cortes_caja` (`id`, `fecha_corte`, `usuario_id`, `responsable`, `fondo_inicial`, `ventas_efectivo`, `ventas_tarjeta`, `ventas_transferencia`, `total_ventas`, `pedidos_count`, `efectivo_esperado`, `efectivo_contado`, `diferencia`, `observaciones`) VALUES
(1, '2026-11-14 20:30:00', 1, 'Andrea Moreno', 500.00, 452.00, 355.00, 404.50, 1211.50, 8, 952.00, 952.00, 0.00, 'Cierre de semana cuadrado sin novedades'),
(2, '2026-11-18 20:30:00', 3, 'Lucía García', 500.00, 265.00, 674.30, 326.00, 1265.30, 8, 765.00, 765.00, 0.00, 'Turno vespertino cerrado en orden'),
(3, '2026-11-22 20:30:00', 1, 'Andrea Moreno', 500.00, 250.00, 299.00, 216.00, 765.00, 5, 750.00, 750.00, 0.00, 'Cierre dominical cuadrado'),
(4, '2026-11-26 20:30:00', 3, 'Lucía García', 500.00, 185.00, 340.00, 147.00, 672.00, 4, 685.00, 685.00, 0.00, 'Cierre previo al viernes');

-- --------------------------------------------------------

--
-- Table structure for table `detalle_compra`
--

CREATE TABLE `detalle_compra` (
  `id` int NOT NULL,
  `orden_id` int NOT NULL,
  `ingrediente_id` int NOT NULL,
  `cantidad` decimal(10,2) NOT NULL,
  `costo_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `detalle_compra`
--

INSERT INTO `detalle_compra` (`id`, `orden_id`, `ingrediente_id`, `cantidad`, `costo_unitario`, `subtotal`) VALUES
(1, 1, 1, 20.00, 24.50, 490.00),
(2, 1, 2, 10.00, 86.00, 860.00),
(3, 1, 21, 25.00, 4.00, 100.00),
(4, 2, 5, 10.00, 56.00, 560.00),
(5, 2, 6, 10.00, 49.00, 490.00),
(6, 2, 7, 12.00, 32.00, 384.00),
(7, 3, 11, 150.00, 1.80, 270.00),
(8, 3, 13, 180.00, 1.60, 288.00),
(9, 3, 17, 55.00, 5.80, 319.00),
(10, 3, 19, 260.00, 0.65, 169.00),
(11, 4, 3, 30.00, 27.85, 835.50),
(12, 4, 8, 3.00, 215.00, 645.00),
(13, 4, 22, 4.00, 145.00, 580.00),
(14, 5, 4, 4.00, 195.00, 780.00),
(15, 5, 23, 5.00, 95.00, 475.00),
(16, 6, 5, 8.00, 56.00, 448.00),
(17, 6, 6, 9.00, 49.00, 441.00);

-- --------------------------------------------------------

--
-- Table structure for table `detalle_pedido`
--

CREATE TABLE `detalle_pedido` (
  `id` int NOT NULL,
  `pedido_id` int NOT NULL,
  `producto_id` int NOT NULL,
  `cantidad` int NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `toppings` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `detalle_pedido`
--

INSERT INTO `detalle_pedido` (`id`, `pedido_id`, `producto_id`, `cantidad`, `precio_unitario`, `toppings`) VALUES
(1, 1, 1, 2, 45.00, NULL),
(2, 1, 6, 1, 41.00, 'Chispas de chocolate'),
(3, 2, 12, 2, 35.00, NULL),
(4, 2, 15, 1, 35.00, NULL),
(5, 3, 11, 1, 150.00, NULL),
(6, 3, 7, 1, 55.00, 'Fresa natural picada'),
(7, 4, 4, 2, 57.00, 'Nuez caramelizada'),
(8, 5, 2, 1, 150.00, NULL),
(9, 5, 3, 2, 35.00, NULL),
(10, 6, 8, 1, 150.00, NULL),
(11, 6, 9, 2, 35.00, NULL),
(12, 7, 10, 2, 55.00, 'Mango en cubos'),
(13, 8, 3, 2, 41.00, 'Chispas de chocolate'),
(14, 8, 13, 1, 45.00, NULL),
(15, 9, 5, 1, 150.00, NULL),
(16, 9, 1, 1, 57.00, 'Nuez caramelizada'),
(17, 10, 7, 2, 45.00, NULL),
(18, 10, 6, 1, 35.00, NULL),
(19, 11, 1, 2, 55.00, 'Fresa natural picada'),
(20, 12, 12, 3, 35.00, NULL),
(21, 13, 4, 2, 51.00, 'Chispas de chocolate'),
(22, 13, 15, 1, 35.00, NULL),
(23, 14, 2, 1, 150.00, NULL),
(24, 14, 10, 2, 45.00, NULL),
(25, 15, 5, 1, 156.00, 'Chispas de chocolate'),
(26, 15, 9, 2, 35.00, NULL),
(27, 16, 1, 2, 45.00, NULL),
(28, 16, 15, 2, 35.00, NULL),
(29, 17, 11, 1, 150.00, NULL),
(30, 18, 7, 2, 55.00, 'Fresa natural picada'),
(31, 19, 1, 2, 57.00, 'Nuez caramelizada'),
(32, 19, 3, 1, 35.00, NULL),
(33, 20, 6, 2, 35.00, NULL),
(34, 20, 12, 2, 35.00, NULL),
(35, 21, 8, 1, 150.00, NULL),
(36, 21, 4, 2, 45.00, NULL),
(37, 22, 10, 2, 55.00, 'Mango en cubos'),
(38, 22, 15, 1, 35.00, NULL),
(39, 23, 2, 1, 150.00, NULL),
(40, 23, 9, 1, 35.00, NULL),
(41, 24, 14, 1, 150.00, NULL),
(42, 24, 1, 1, 45.00, NULL),
(43, 25, 4, 2, 51.00, 'Chispas de chocolate'),
(44, 25, 7, 1, 45.00, NULL),
(45, 26, 1, 1, 57.00, 'Nuez caramelizada'),
(46, 26, 12, 1, 35.00, NULL),
(47, 27, 13, 2, 55.00, 'Mango en cubos'),
(48, 28, 8, 1, 160.00, 'Mango en cubos'),
(49, 29, 7, 1, 61.00, 'Fresa natural picada, Chispas de chocolate'),
(50, 29, 3, 1, 35.00, NULL),
(51, 30, 5, 1, 160.00, 'Mango en cubos'),
(52, 30, 1, 1, 57.00, 'Nuez caramelizada');

-- --------------------------------------------------------

--
-- Table structure for table `gastos_publicidad`
--

CREATE TABLE `gastos_publicidad` (
  `id` int NOT NULL,
  `campana` varchar(120) NOT NULL,
  `canal` varchar(60) NOT NULL DEFAULT 'Instagram Ads',
  `monto_invertido` decimal(10,2) NOT NULL DEFAULT '0.00',
  `ingresos_generados` decimal(10,2) NOT NULL DEFAULT '0.00',
  `fecha_inicio` date NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `gastos_publicidad`
--

INSERT INTO `gastos_publicidad` (`id`, `campana`, `canal`, `monto_invertido`, `ingresos_generados`, `fecha_inicio`, `activo`) VALUES
(1, 'Reels Sabores de Temporada', 'Instagram Ads', 850.00, 3420.00, '2026-11-01', 1),
(2, 'Promo Litro Familiar Fin de Semana', 'Facebook Ads', 650.00, 2890.00, '2026-11-08', 1),
(3, 'Cupón Primera Compra PWA', 'TikTok Ads', 500.00, 1950.00, '2026-11-14', 1),
(4, 'Volantes y Degustación Zona Centro', 'Impreso / Local', 400.00, 1380.00, '2026-11-18', 1);

-- --------------------------------------------------------

--
-- Table structure for table `helados`
--

CREATE TABLE `helados` (
  `id` int NOT NULL,
  `sabor` varchar(50) NOT NULL,
  `nombre_comercial` varchar(80) NOT NULL,
  `tono` varchar(30) DEFAULT 'vanilla',
  `imagen_url` text,
  `stock_litros` decimal(10,3) NOT NULL DEFAULT '0.000'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `helados`
--

INSERT INTO `helados` (`id`, `sabor`, `nombre_comercial`, `tono`, `imagen_url`, `stock_litros`) VALUES
(1, 'Vainilla', 'Vainilla Nube', 'vanilla', 'http://localhost:5000/api/products/uploads/c432982afff441738e312b85eb3a8e10.png', 14.500),
(2, 'Chocolate', 'Cacao Profundo', 'chocolate', 'http://localhost:5000/api/products/uploads/0393bc9737a642218a8052e0fd3d29c9.png', 12.800),
(3, 'Fresa', 'Fresa Nevada', 'strawberry', 'http://localhost:5000/api/products/uploads/03a26a772af842f19a484317a3b27926.png', 11.600),
(4, 'Mango', 'Mango Solar', 'mango', 'http://localhost:5000/api/products/uploads/224bdcc5999b4a419650771850e7d541.png', 13.200),
(5, 'Limón', 'Limón Glaciar', 'lemon', 'http://localhost:5000/api/products/uploads/0d58bce67f7a4a4782a69a337e53d5ab.png', 10.900);

-- --------------------------------------------------------

--
-- Table structure for table `ingredientes`
--

CREATE TABLE `ingredientes` (
  `id` int NOT NULL,
  `nombre` varchar(80) NOT NULL,
  `categoria` varchar(50) DEFAULT NULL,
  `stock_actual` decimal(10,2) NOT NULL DEFAULT '0.00',
  `stock_minimo` decimal(10,2) NOT NULL DEFAULT '0.00',
  `unidad` varchar(15) NOT NULL,
  `costo_unitario` decimal(10,2) DEFAULT '0.00',
  `proveedor_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `ingredientes`
--

INSERT INTO `ingredientes` (`id`, `nombre`, `categoria`, `stock_actual`, `stock_minimo`, `unidad`, `costo_unitario`, `proveedor_id`) VALUES
(1, 'Leche entera pasteurizada', 'Lácteos', 32.50, 8.00, 'L', 24.50, 1),
(2, 'Crema para batir 35%', 'Lácteos', 24.00, 8.00, 'L', 86.00, 1),
(3, 'Azúcar refinada', 'Secos', 38.00, 8.00, 'kg', 27.85, 3),
(4, 'Cacao semiamargo en polvo', 'Secos', 7.50, 3.00, 'kg', 195.00, 4),
(5, 'Fresa fresca seleccionada', 'Fruta Natural', 18.50, 5.00, 'kg', 56.00, 2),
(6, 'Mango ataulfo maduro', 'Fruta Natural', 22.00, 5.00, 'kg', 49.00, 2),
(7, 'Limón persa', 'Fruta Natural', 19.00, 4.00, 'kg', 32.00, 2),
(8, 'Extracto natural de vainilla', 'Esencias', 5.80, 2.00, 'L', 215.00, 3),
(11, 'Cono sencillo', 'Desechables', 140.00, 35.00, 'pza', 1.80, 5),
(13, 'Vaso 8 oz', 'Desechables', 165.00, 40.00, 'pza', 1.60, 5),
(17, 'Envase 1 L', 'Desechables', 48.00, 15.00, 'pza', 5.80, 5),
(19, 'Cuchara para helado', 'Desechables', 240.00, 60.00, 'pza', 0.65, 5),
(21, 'Agua purificada', 'Líquidos', 45.00, 10.00, 'L', 4.00, 1),
(22, 'Nuez caramelizada', 'Toppings', 6.40, 1.50, 'kg', 145.00, 3),
(23, 'Chispas de chocolate', 'Toppings', 5.20, 1.50, 'kg', 95.00, 4);

-- --------------------------------------------------------

--
-- Table structure for table `metas_marketing`
--

CREATE TABLE `metas_marketing` (
  `id` int NOT NULL,
  `periodo` varchar(40) NOT NULL DEFAULT 'Noviembre 2026',
  `meta_ventas` decimal(10,2) NOT NULL DEFAULT '18000.00',
  `actualizado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `metas_marketing`
--

INSERT INTO `metas_marketing` (`id`, `periodo`, `meta_ventas`, `actualizado_en`) VALUES
(1, 'Noviembre 2026', 18000.00, '2026-11-27 16:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `movimientos_ingredientes`
--

CREATE TABLE `movimientos_ingredientes` (
  `id` int NOT NULL,
  `ingrediente_id` int NOT NULL,
  `tipo` enum('Entrada','Producción','Merma') NOT NULL,
  `cantidad` decimal(10,2) NOT NULL,
  `usuario_id` int DEFAULT NULL,
  `fecha` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `movimientos_ingredientes`
--

INSERT INTO `movimientos_ingredientes` (`id`, `ingrediente_id`, `tipo`, `cantidad`, `usuario_id`, `fecha`) VALUES
(1, 1, 'Entrada', 20.00, 1, '2026-11-04 09:00:00'),
(2, 2, 'Entrada', 10.00, 1, '2026-11-04 09:00:00'),
(3, 21, 'Entrada', 25.00, 1, '2026-11-04 09:00:00'),
(4, 5, 'Entrada', 10.00, 2, '2026-11-09 09:40:00'),
(5, 6, 'Entrada', 10.00, 2, '2026-11-09 09:40:00'),
(6, 7, 'Entrada', 12.00, 2, '2026-11-09 09:40:00'),
(7, 1, 'Producción', -5.00, 2, '2026-11-10 10:00:00'),
(8, 2, 'Producción', -2.50, 2, '2026-11-10 10:00:00'),
(9, 8, 'Producción', -0.30, 2, '2026-11-10 10:00:00'),
(10, 11, 'Entrada', 150.00, 1, '2026-11-14 10:45:00'),
(11, 13, 'Entrada', 180.00, 1, '2026-11-14 10:45:00'),
(12, 17, 'Entrada', 55.00, 1, '2026-11-14 10:45:00'),
(13, 19, 'Entrada', 260.00, 1, '2026-11-14 10:45:00'),
(14, 5, 'Merma', -0.60, 2, '2026-11-16 18:10:00'),
(15, 3, 'Entrada', 30.00, 1, '2026-11-19 11:30:00'),
(16, 8, 'Entrada', 3.00, 1, '2026-11-19 11:30:00'),
(17, 22, 'Entrada', 4.00, 1, '2026-11-19 11:30:00'),
(18, 4, 'Entrada', 4.00, 2, '2026-11-23 10:50:00'),
(19, 23, 'Entrada', 5.00, 2, '2026-11-23 10:50:00'),
(20, 6, 'Merma', -0.40, 2, '2026-11-24 17:45:00');

-- --------------------------------------------------------

--
-- Table structure for table `ordenes_compra`
--

CREATE TABLE `ordenes_compra` (
  `id` int NOT NULL,
  `folio` varchar(25) NOT NULL,
  `proveedor_id` int NOT NULL,
  `usuario_id` int DEFAULT NULL,
  `total` decimal(10,2) NOT NULL DEFAULT '0.00',
  `metodo_pago` varchar(40) NOT NULL DEFAULT 'Efectivo',
  `estado` enum('Pendiente','Pagada','Cancelada') NOT NULL DEFAULT 'Pendiente',
  `notas` varchar(255) DEFAULT NULL,
  `fecha_orden` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_pago` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `ordenes_compra`
--

INSERT INTO `ordenes_compra` (`id`, `folio`, `proveedor_id`, `usuario_id`, `total`, `metodo_pago`, `estado`, `notas`, `fecha_orden`, `fecha_pago`) VALUES
(1, '#OC-2101', 1, 1, 1450.00, 'Transferencia', 'Pagada', 'Surtido semanal de lácteos y agua purificada', '2026-11-04 08:30:00', '2026-11-04 09:00:00'),
(2, '#OC-2102', 2, 2, 1434.00, 'Efectivo', 'Pagada', 'Fruta fresca de temporada para producción', '2026-11-09 09:15:00', '2026-11-09 09:40:00'),
(3, '#OC-2103', 5, 1, 1046.00, 'Transferencia', 'Pagada', 'Reposición de conos, vasos, envases y cucharas', '2026-11-14 10:15:00', '2026-11-14 10:45:00'),
(4, '#OC-2104', 3, 1, 2060.50, 'Transferencia', 'Pagada', 'Azúcar, vainilla natural y nuez caramelizada', '2026-11-19 11:00:00', '2026-11-19 11:30:00'),
(5, '#OC-2105', 4, 2, 1255.00, 'Efectivo', 'Pagada', 'Cacao semiamargo y chispas de chocolate', '2026-11-23 10:20:00', '2026-11-23 10:50:00'),
(6, '#OC-2106', 2, 1, 889.00, 'Transferencia', 'Pendiente', 'Pedido programado de fresa y mango para fin de semana', '2026-11-27 12:00:00', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `pagos_simulados`
--

CREATE TABLE `pagos_simulados` (
  `id` int NOT NULL,
  `pedido_id` int NOT NULL,
  `metodo` varchar(50) NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `folio_pago` varchar(30) NOT NULL,
  `fecha` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `pagos_simulados`
--

INSERT INTO `pagos_simulados` (`id`, `pedido_id`, `metodo`, `monto`, `folio_pago`, `fecha`) VALUES
(1, 1, 'Tarjeta', 131.00, 'FP-8810421', '2026-11-10 12:15:00'),
(2, 2, 'Efectivo', 105.00, 'FP-8810590', '2026-11-10 14:40:00'),
(3, 3, 'Transferencia', 184.50, 'FP-8810734', '2026-11-11 16:20:00'),
(4, 4, 'Tarjeta', 114.00, 'FP-8810912', '2026-11-12 13:10:00'),
(5, 5, 'Efectivo', 220.00, 'FP-8811105', '2026-11-12 18:05:00'),
(6, 6, 'Transferencia', 220.00, 'FP-8820144', '2026-11-13 15:30:00'),
(7, 7, 'Tarjeta', 110.00, 'FP-8820389', '2026-11-14 12:45:00'),
(8, 8, 'Efectivo', 127.00, 'FP-8820510', '2026-11-14 17:15:00'),
(9, 9, 'Tarjeta', 186.30, 'FP-8820778', '2026-11-15 14:20:00'),
(10, 10, 'Tarjeta', 125.00, 'FP-8820901', '2026-11-15 18:40:00'),
(11, 11, 'Transferencia', 110.00, 'FP-8821123', '2026-11-16 13:50:00'),
(12, 12, 'Efectivo', 105.00, 'FP-8830190', '2026-11-16 16:30:00'),
(13, 13, 'Tarjeta', 137.00, 'FP-8830412', '2026-11-17 12:15:00'),
(14, 14, 'Transferencia', 216.00, 'FP-8830688', '2026-11-17 17:45:00'),
(15, 15, 'Tarjeta', 226.00, 'FP-8830904', '2026-11-18 15:10:00'),
(16, 16, 'Efectivo', 160.00, 'FP-8831150', '2026-11-18 18:20:00'),
(17, 17, 'Tarjeta', 150.00, 'FP-8831399', '2026-11-19 14:05:00'),
(18, 18, 'Efectivo', 110.00, 'FP-8831572', '2026-11-20 16:40:00'),
(19, 19, 'Tarjeta', 149.00, 'FP-8840115', '2026-11-21 13:25:00'),
(20, 20, 'Efectivo', 140.00, 'FP-8840340', '2026-11-21 17:50:00'),
(21, 21, 'Transferencia', 216.00, 'FP-8840581', '2026-11-22 15:15:00'),
(22, 22, 'Tarjeta', 145.00, 'FP-8840792', '2026-11-23 14:30:00'),
(23, 23, 'Efectivo', 185.00, 'FP-8840966', '2026-11-24 16:10:00'),
(24, 24, 'Tarjeta', 195.00, 'FP-8841180', '2026-11-25 13:45:00'),
(25, 25, 'Transferencia', 147.00, 'FP-8841305', '2026-11-26 15:20:00'),
(26, 26, 'Tarjeta', 92.00, 'FP-8841490', '2026-11-27 11:30:00'),
(27, 27, 'Efectivo', 110.00, 'FP-8841620', '2026-11-27 13:15:00'),
(28, 28, 'Transferencia', 160.00, 'FP-8841805', '2026-11-27 15:40:00'),
(29, 29, 'Tarjeta', 96.00, 'FP-8841940', '2026-11-27 17:10:00'),
(30, 30, 'Tarjeta', 217.00, 'FP-8842095', '2026-11-27 17:45:00');

-- --------------------------------------------------------

--
-- Table structure for table `pedidos`
--

CREATE TABLE `pedidos` (
  `id` int NOT NULL,
  `folio` varchar(20) NOT NULL,
  `cliente_id` int DEFAULT NULL,
  `cliente_nombre` varchar(100) DEFAULT 'Venta de mostrador',
  `subtotal` decimal(10,2) NOT NULL,
  `descuento` decimal(10,2) DEFAULT '0.00',
  `total` decimal(10,2) NOT NULL,
  `etapa` tinyint NOT NULL DEFAULT '0' COMMENT '0:Pendiente, 1:Preparacion, 2:Listo, 3:Entregado',
  `canal` enum('PWA','Sucursal') DEFAULT 'Sucursal',
  `fecha` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `pedidos`
--

INSERT INTO `pedidos` (`id`, `folio`, `cliente_id`, `cliente_nombre`, `subtotal`, `descuento`, `total`, `etapa`, `canal`, `fecha`) VALUES
(1, '#FL-4101', 2, 'Mariana López', 131.00, 0.00, 131.00, 3, 'PWA', '2026-11-10 12:15:00'),
(2, '#FL-4102', 1, 'Venta de mostrador', 105.00, 0.00, 105.00, 3, 'Sucursal', '2026-11-10 14:40:00'),
(3, '#FL-4103', 3, 'Jorge Ávila', 205.00, 20.50, 184.50, 3, 'PWA', '2026-11-11 16:20:00'),
(4, '#FL-4104', 4, 'Sofía Herrera', 114.00, 0.00, 114.00, 3, 'PWA', '2026-11-12 13:10:00'),
(5, '#FL-4105', 1, 'Venta de mostrador', 220.00, 0.00, 220.00, 3, 'Sucursal', '2026-11-12 18:05:00'),
(6, '#FL-4106', 5, 'Carlos Mendoza', 220.00, 0.00, 220.00, 3, 'PWA', '2026-11-13 15:30:00'),
(7, '#FL-4107', 6, 'Valeria Ortega', 110.00, 0.00, 110.00, 3, 'PWA', '2026-11-14 12:45:00'),
(8, '#FL-4108', 1, 'Venta de mostrador', 127.00, 0.00, 127.00, 3, 'Sucursal', '2026-11-14 17:15:00'),
(9, '#FL-4109', 2, 'Mariana López', 207.00, 20.70, 186.30, 3, 'PWA', '2026-11-15 14:20:00'),
(10, '#FL-4110', 7, 'Diego Ramírez', 125.00, 0.00, 125.00, 3, 'PWA', '2026-11-15 18:40:00'),
(11, '#FL-4111', 8, 'Fernanda Castro', 110.00, 0.00, 110.00, 3, 'PWA', '2026-11-16 13:50:00'),
(12, '#FL-4112', 1, 'Venta de mostrador', 105.00, 0.00, 105.00, 3, 'Sucursal', '2026-11-16 16:30:00'),
(13, '#FL-4113', 3, 'Jorge Ávila', 137.00, 0.00, 137.00, 3, 'PWA', '2026-11-17 12:15:00'),
(14, '#FL-4114', 4, 'Sofía Herrera', 240.00, 24.00, 216.00, 3, 'PWA', '2026-11-17 17:45:00'),
(15, '#FL-4115', 10, 'Christofer Dario', 226.00, 0.00, 226.00, 3, 'PWA', '2026-11-18 15:10:00'),
(16, '#FL-4116', 1, 'Venta de mostrador', 160.00, 0.00, 160.00, 3, 'Sucursal', '2026-11-18 18:20:00'),
(17, '#FL-4117', 5, 'Carlos Mendoza', 150.00, 0.00, 150.00, 3, 'PWA', '2026-11-19 14:05:00'),
(18, '#FL-4118', 6, 'Valeria Ortega', 110.00, 0.00, 110.00, 3, 'PWA', '2026-11-20 16:40:00'),
(19, '#FL-4119', 9, 'Camila Navarro', 149.00, 0.00, 149.00, 3, 'PWA', '2026-11-21 13:25:00'),
(20, '#FL-4120', 1, 'Venta de mostrador', 140.00, 0.00, 140.00, 3, 'Sucursal', '2026-11-21 17:50:00'),
(21, '#FL-4121', 7, 'Diego Ramírez', 240.00, 24.00, 216.00, 3, 'PWA', '2026-11-22 15:15:00'),
(22, '#FL-4122', 8, 'Fernanda Castro', 145.00, 0.00, 145.00, 3, 'PWA', '2026-11-23 14:30:00'),
(23, '#FL-4123', 1, 'Venta de mostrador', 185.00, 0.00, 185.00, 3, 'Sucursal', '2026-11-24 16:10:00'),
(24, '#FL-4124', 9, 'Camila Navarro', 195.00, 0.00, 195.00, 3, 'PWA', '2026-11-25 13:45:00'),
(25, '#FL-4125', 10, 'Christofer Dario', 147.00, 0.00, 147.00, 3, 'PWA', '2026-11-26 15:20:00'),
(26, '#FL-4126', 2, 'Mariana López', 92.00, 0.00, 92.00, 3, 'PWA', '2026-11-27 11:30:00'),
(27, '#FL-4127', 1, 'Venta de mostrador', 110.00, 0.00, 110.00, 3, 'Sucursal', '2026-11-27 13:15:00'),
(28, '#FL-4128', 3, 'Jorge Ávila', 160.00, 0.00, 160.00, 2, 'PWA', '2026-11-27 15:40:00'),
(29, '#FL-4129', 4, 'Sofía Herrera', 96.00, 0.00, 96.00, 1, 'PWA', '2026-11-27 17:10:00'),
(30, '#FL-4130', 10, 'Christofer Dario', 217.00, 0.00, 217.00, 0, 'PWA', '2026-11-27 17:45:00');

-- --------------------------------------------------------

--
-- Table structure for table `presentaciones`
--

CREATE TABLE `presentaciones` (
  `id` int NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `imagen_url` text,
  `litros_consumidos` decimal(10,3) NOT NULL DEFAULT '0.240',
  `empaque_ingrediente_id` int DEFAULT NULL,
  `empaque_cantidad` decimal(10,2) NOT NULL DEFAULT '1.00',
  `cuchara_ingrediente_id` int DEFAULT NULL,
  `cuchara_cantidad` decimal(10,2) NOT NULL DEFAULT '0.00',
  `ingrediente_desechable_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `presentaciones`
--

INSERT INTO `presentaciones` (`id`, `nombre`, `precio`, `imagen_url`, `litros_consumidos`, `empaque_ingrediente_id`, `empaque_cantidad`, `cuchara_ingrediente_id`, `cuchara_cantidad`, `ingrediente_desechable_id`) VALUES
(1, 'Vaso 8 oz', 45.00, 'http://localhost:5000/api/presentations/uploads/c2ee8c46bca2426296a1fceb16d16d57.png', 0.240, 13, 1.00, 19, 1.00, 13),
(2, 'Litro', 150.00, 'http://localhost:5000/api/presentations/uploads/303563798b7844b6954afeb220bb4480.png', 1.000, 17, 1.00, 19, 0.00, 17),
(3, 'Cono', 35.00, 'http://localhost:5000/api/presentations/uploads/e754061298534eb386ac6e3685cee838.png', 0.150, 11, 1.00, NULL, 0.00, 11);

-- --------------------------------------------------------

--
-- Table structure for table `productos`
--

CREATE TABLE `productos` (
  `id` int NOT NULL,
  `helado_id` int NOT NULL,
  `presentacion_id` int NOT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `activo` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `productos`
--

INSERT INTO `productos` (`id`, `helado_id`, `presentacion_id`, `stock`, `activo`) VALUES
(1, 1, 1, 45, 1),
(2, 1, 2, 14, 1),
(3, 1, 3, 60, 1),
(4, 2, 1, 40, 1),
(5, 2, 2, 12, 1),
(6, 2, 3, 55, 1),
(7, 3, 1, 38, 1),
(8, 3, 2, 11, 1),
(9, 3, 3, 50, 1),
(10, 4, 1, 42, 1),
(11, 4, 2, 13, 1),
(12, 4, 3, 58, 1),
(13, 5, 1, 36, 1),
(14, 5, 2, 10, 1),
(15, 5, 3, 48, 1);

-- --------------------------------------------------------

--
-- Table structure for table `proveedores`
--

CREATE TABLE `proveedores` (
  `id` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `contacto` varchar(100) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `proveedores`
--

INSERT INTO `proveedores` (`id`, `nombre`, `contacto`, `telefono`) VALUES
(1, 'Lácteos del Bajío S.A.', 'Héctor Ramírez', '477 714 8820'),
(2, 'Frutas Selectas de Irapuato', 'Valeria Solís', '462 625 3410'),
(3, 'Esencias y Secos Artesanales', 'Mariana Domínguez', '477 390 1145'),
(4, 'Chocolatería y Confitería Finos', 'Roberto Castellanos', '477 512 9084'),
(5, 'Empaques y Conos del Bajío', 'Sofía Valenzuela', '477 628 4910');

-- --------------------------------------------------------

--
-- Table structure for table `recetas_helado`
--

CREATE TABLE `recetas_helado` (
  `id` int NOT NULL,
  `helado_id` int NOT NULL,
  `ingrediente_id` int NOT NULL,
  `cantidad_por_litro` decimal(10,3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `recetas_helado`
--

INSERT INTO `recetas_helado` (`id`, `helado_id`, `ingrediente_id`, `cantidad_por_litro`) VALUES
(1, 1, 1, 0.500),
(2, 1, 2, 0.250),
(3, 1, 3, 0.180),
(4, 1, 8, 0.030),
(5, 2, 1, 0.500),
(6, 2, 2, 0.250),
(7, 2, 3, 0.200),
(8, 2, 4, 0.120),
(9, 3, 1, 0.400),
(10, 3, 2, 0.200),
(11, 3, 3, 0.180),
(12, 3, 5, 0.300),
(13, 4, 1, 0.350),
(14, 4, 2, 0.150),
(15, 4, 3, 0.160),
(16, 4, 6, 0.350),
(17, 5, 21, 0.550),
(18, 5, 3, 0.220),
(19, 5, 7, 0.250);

-- --------------------------------------------------------

--
-- Table structure for table `resenas`
--

CREATE TABLE `resenas` (
  `id` int NOT NULL,
  `cliente_nombre` varchar(100) NOT NULL,
  `calificacion` tinyint NOT NULL DEFAULT '5',
  `comentario` text NOT NULL,
  `respuesta` text,
  `fecha` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `resenas`
--

INSERT INTO `resenas` (`id`, `cliente_nombre`, `calificacion`, `comentario`, `respuesta`, `fecha`) VALUES
(1, 'Mariana López', 5, 'El helado de Vainilla Nube tiene una textura súper cremosa y natural. Siempre pido por la app y llega puntual.', 'Muchas gracias Mariana, nos alegra muchísimo que disfrutes nuestros sabores artesanales.', '2026-11-15 16:15:00'),
(2, 'Jorge Ávila', 5, 'Mango Solar con fruta natural es mi nuevo favorito para la tarde. Excelente presentación de litro.', 'Gracias Jorge, te esperamos pronto por otro litro de Mango Solar.', '2026-11-17 14:05:00'),
(3, 'Camila Navarro', 5, 'Me encanta poder seguir en vivo en qué etapa va mi pedido y recogerlo sin hacer fila.', 'Qué gusto leer eso Camila, trabajamos para que tu experiencia sea rápida y fresca.', '2026-11-21 15:30:00'),
(4, 'Diego Ramírez', 4, 'Muy buen sabor en Cacao Profundo y Fresa Nevada. El cono llegó súper crujiente.', 'Gracias por tu comentario Diego, cuidamos mucho la textura de nuestros conos.', '2026-11-22 18:20:00'),
(5, 'Sofía Herrera', 5, 'Vainilla Nube con nuez caramelizada está espectacular, súper recomendado.', NULL, '2026-11-24 12:40:00'),
(6, 'Fernanda Castro', 5, 'Limón Glaciar es súper refrescante y se nota que usan limón natural.', NULL, '2026-11-26 17:10:00');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `descripcion` varchar(150) DEFAULT NULL,
  `permisos` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `nombre`, `descripcion`, `permisos`) VALUES
(1, 'Administrador', 'Control total del sistema', '{\"pos\": true, \"roles\": true, \"users\": true, \"orders\": true, \"clients\": true, \"pedidos\": true, \"resenas\": true, \"resumen\": true, \"reviews\": true, \"clientes\": true, \"products\": true, \"usuarios\": true, \"dashboard\": true, \"inventory\": true, \"movements\": true, \"productos\": true, \"purchases\": true, \"suppliers\": true, \"inventario\": true, \"movimientos\": true, \"proveedores\": true, \"cash_register\": true, \"punto_de_venta\": true, \"catalog_options\": true}'),
(2, 'Empleado', 'Pedidos, clientes y consulta de stock', '{\"pos\": true, \"roles\": false, \"users\": false, \"orders\": true, \"clients\": true, \"pedidos\": true, \"resenas\": true, \"reviews\": true, \"clientes\": true, \"products\": false, \"dashboard\": false, \"inventory\": false, \"movements\": false, \"productos\": true, \"suppliers\": false, \"inventario\": true, \"cash_register\": true, \"punto_de_venta\": true, \"catalog_options\": false}'),
(3, 'Cocina', 'Inventario, producción y stock', '{\"pos\": false, \"roles\": false, \"users\": false, \"orders\": true, \"clients\": false, \"pedidos\": true, \"reviews\": false, \"products\": true, \"dashboard\": false, \"inventory\": true, \"movements\": true, \"productos\": true, \"suppliers\": false, \"inventario\": false, \"movimientos\": false, \"cash_register\": false, \"catalog_options\": false}'),
(4, 'Cliente', 'Catálogo, carrito y seguimiento', '{\"pos\": false, \"roles\": false, \"users\": false, \"orders\": false, \"clients\": false, \"pedidos\": true, \"resenas\": true, \"reviews\": true, \"products\": false, \"dashboard\": false, \"inventory\": false, \"movements\": false, \"productos\": true, \"suppliers\": false, \"cash_register\": false, \"catalog_options\": false}');

-- --------------------------------------------------------

--
-- Table structure for table `toppings`
--

CREATE TABLE `toppings` (
  `id` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `precio` decimal(10,2) NOT NULL DEFAULT '10.00',
  `stock` int NOT NULL DEFAULT '20',
  `proveedor_id` int DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `ingrediente_id` int DEFAULT NULL,
  `cantidad_por_porcion` decimal(10,3) NOT NULL DEFAULT '0.040'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `toppings`
--

INSERT INTO `toppings` (`id`, `nombre`, `precio`, `stock`, `proveedor_id`, `activo`, `ingrediente_id`, `cantidad_por_porcion`) VALUES
(1, 'Chispas de chocolate', 6.00, 130, 4, 1, 23, 0.040),
(2, 'Fresa natural picada', 10.00, 462, 2, 1, 5, 0.040),
(3, 'Mango en cubos', 10.00, 550, 2, 1, 6, 0.040),
(4, 'Nuez caramelizada', 12.00, 160, 4, 1, 22, 0.040);

-- --------------------------------------------------------

--
-- Table structure for table `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `correo` varchar(120) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `rol_id` int NOT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `ultimo_acceso` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `correo`, `password_hash`, `rol_id`, `activo`, `ultimo_acceso`) VALUES
(1, 'Andrea Moreno', 'andrea@floamy.mx', 'floamy2025', 1, 1, '2026-11-27 09:00:00'),
(2, 'Pablo Reyes', 'pablo@floamy.mx', 'floamy2025', 3, 1, '2026-11-27 08:30:00'),
(3, 'Lucía García', 'lucia@floamy.mx', 'floamy2025', 2, 1, '2026-11-27 10:15:00'),
(4, 'Christofer Dario', 'christofer@floamy.mx', 'Contrest123', 3, 1, '2026-11-27 14:20:00'),
(5, 'Mariana López', 'mariana.lopez@correo.mx', 'Cliente123', 4, 1, '2026-11-27 11:30:00'),
(6, 'Jorge Ávila', 'jorge.avila@correo.mx', 'Cliente123', 4, 1, '2026-11-27 15:40:00'),
(7, 'Sofía Herrera', 'sofia.herrera@correo.mx', 'Cliente123', 4, 1, '2026-11-27 17:10:00'),
(8, 'Carlos Mendoza', 'carlos.mendoza@correo.mx', 'Cliente123', 4, 1, '2026-11-19 14:05:00'),
(9, 'Valeria Ortega', 'valeria.ortega@correo.mx', 'Cliente123', 4, 1, '2026-11-20 16:40:00'),
(10, 'Diego Ramírez', 'diego.ramirez@correo.mx', 'Cliente123', 4, 1, '2026-11-22 15:15:00'),
(11, 'Fernanda Castro', 'fernanda.castro@correo.mx', 'Cliente123', 4, 1, '2026-11-23 14:30:00'),
(12, 'Camila Navarro', 'camila.navarro@correo.mx', 'Cliente123', 4, 1, '2026-11-25 13:45:00');

-- --------------------------------------------------------

--
-- Table structure for table `visitas_tienda`
--

CREATE TABLE `visitas_tienda` (
  `id` int NOT NULL,
  `session_token` varchar(80) DEFAULT NULL,
  `ruta` varchar(120) DEFAULT '/',
  `canal` varchar(40) DEFAULT 'PWA',
  `fecha` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `visitas_tienda`
--

INSERT INTO `visitas_tienda` (`id`, `session_token`, `ruta`, `canal`, `fecha`) VALUES
(1, 'vis-nov10-01', '/', 'PWA', '2026-11-10 11:30:00'),
(2, 'vis-nov10-02', '/sabores', 'PWA', '2026-11-10 12:05:00'),
(3, 'vis-nov10-03', '/', 'Sucursal QR', '2026-11-10 14:20:00'),
(4, 'vis-nov11-01', '/', 'PWA', '2026-11-11 15:40:00'),
(5, 'vis-nov11-02', '/sabores', 'PWA', '2026-11-11 16:10:00'),
(6, 'vis-nov11-03', '/', 'Sucursal QR', '2026-11-11 18:00:00'),
(7, 'vis-nov12-01', '/', 'PWA', '2026-11-12 12:50:00'),
(8, 'vis-nov12-02', '/sabores', 'PWA', '2026-11-12 13:02:00'),
(9, 'vis-nov12-03', '/', 'Sucursal QR', '2026-11-12 17:45:00'),
(10, 'vis-nov13-01', '/', 'PWA', '2026-11-13 15:00:00'),
(11, 'vis-nov13-02', '/sabores', 'PWA', '2026-11-13 15:20:00'),
(12, 'vis-nov14-01', '/', 'PWA', '2026-11-14 12:20:00'),
(13, 'vis-nov14-02', '/sabores', 'PWA', '2026-11-14 12:35:00'),
(14, 'vis-nov14-03', '/', 'Sucursal QR', '2026-11-14 16:50:00'),
(15, 'vis-nov15-01', '/', 'PWA', '2026-11-15 14:00:00'),
(16, 'vis-nov15-02', '/sabores', 'PWA', '2026-11-15 14:12:00'),
(17, 'vis-nov15-03', '/', 'PWA', '2026-11-15 18:25:00'),
(18, 'vis-nov16-01', '/', 'PWA', '2026-11-16 13:30:00'),
(19, 'vis-nov16-02', '/sabores', 'Sucursal QR', '2026-11-16 16:15:00'),
(20, 'vis-nov17-01', '/', 'PWA', '2026-11-17 12:00:00'),
(21, 'vis-nov17-02', '/sabores', 'PWA', '2026-11-17 17:30:00'),
(22, 'vis-nov18-01', '/', 'PWA', '2026-11-18 14:55:00'),
(23, 'vis-nov18-02', '/sabores', 'Sucursal QR', '2026-11-18 18:05:00'),
(24, 'vis-nov19-01', '/', 'PWA', '2026-11-19 13:50:00'),
(25, 'vis-nov19-02', '/sabores', 'PWA', '2026-11-19 16:20:00'),
(26, 'vis-nov20-01', '/', 'PWA', '2026-11-20 16:25:00'),
(27, 'vis-nov20-02', '/sabores', 'Sucursal QR', '2026-11-20 18:10:00'),
(28, 'vis-nov21-01', '/', 'PWA', '2026-11-21 13:10:00'),
(29, 'vis-nov21-02', '/sabores', 'PWA', '2026-11-21 17:35:00'),
(30, 'vis-nov22-01', '/', 'PWA', '2026-11-22 15:00:00'),
(31, 'vis-nov22-02', '/sabores', 'Sucursal QR', '2026-11-22 17:40:00'),
(32, 'vis-nov23-01', '/', 'PWA', '2026-11-23 14:15:00'),
(33, 'vis-nov23-02', '/sabores', 'PWA', '2026-11-23 16:50:00'),
(34, 'vis-nov24-01', '/', 'Sucursal QR', '2026-11-24 15:55:00'),
(35, 'vis-nov24-02', '/sabores', 'PWA', '2026-11-24 18:20:00'),
(36, 'vis-nov25-01', '/', 'PWA', '2026-11-25 13:30:00'),
(37, 'vis-nov25-02', '/sabores', 'PWA', '2026-11-25 16:40:00'),
(38, 'vis-nov26-01', '/', 'PWA', '2026-11-26 15:05:00'),
(39, 'vis-nov26-02', '/sabores', 'Sucursal QR', '2026-11-26 17:30:00'),
(40, 'vis-nov27-01', '/', 'PWA', '2026-11-27 11:15:00'),
(41, 'vis-nov27-02', '/sabores', 'PWA', '2026-11-27 13:05:00'),
(42, 'vis-nov27-03', '/', 'Sucursal QR', '2026-11-27 15:30:00'),
(43, 'vis-nov27-04', '/sabores', 'PWA', '2026-11-27 17:02:00'),
(44, 'vis-nov27-05', '/pedido', 'PWA', '2026-11-27 17:40:00');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `correo` (`correo`);

--
-- Indexes for table `cortes_caja`
--
ALTER TABLE `cortes_caja`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `detalle_compra`
--
ALTER TABLE `detalle_compra`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_dc_orden` (`orden_id`),
  ADD KEY `fk_dc_ingrediente` (`ingrediente_id`);

--
-- Indexes for table `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pedido_id` (`pedido_id`),
  ADD KEY `producto_id` (`producto_id`);

--
-- Indexes for table `gastos_publicidad`
--
ALTER TABLE `gastos_publicidad`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `helados`
--
ALTER TABLE `helados`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ingredientes`
--
ALTER TABLE `ingredientes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `proveedor_id` (`proveedor_id`);

--
-- Indexes for table `metas_marketing`
--
ALTER TABLE `metas_marketing`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `movimientos_ingredientes`
--
ALTER TABLE `movimientos_ingredientes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ingrediente_id` (`ingrediente_id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indexes for table `ordenes_compra`
--
ALTER TABLE `ordenes_compra`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_oc_folio` (`folio`),
  ADD KEY `fk_oc_proveedor` (`proveedor_id`),
  ADD KEY `fk_oc_usuario` (`usuario_id`);

--
-- Indexes for table `pagos_simulados`
--
ALTER TABLE `pagos_simulados`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pedido_id` (`pedido_id`);

--
-- Indexes for table `pedidos`
--
ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `folio` (`folio`),
  ADD KEY `cliente_id` (`cliente_id`);

--
-- Indexes for table `presentaciones`
--
ALTER TABLE `presentaciones`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `helado_id` (`helado_id`),
  ADD KEY `presentacion_id` (`presentacion_id`);

--
-- Indexes for table `proveedores`
--
ALTER TABLE `proveedores`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `recetas_helado`
--
ALTER TABLE `recetas_helado`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_helado_ing` (`helado_id`,`ingrediente_id`),
  ADD KEY `fk_receta_ingrediente` (`ingrediente_id`);

--
-- Indexes for table `resenas`
--
ALTER TABLE `resenas`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indexes for table `toppings`
--
ALTER TABLE `toppings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_topping_proveedor` (`proveedor_id`);

--
-- Indexes for table `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `correo` (`correo`),
  ADD KEY `rol_id` (`rol_id`);

--
-- Indexes for table `visitas_tienda`
--
ALTER TABLE `visitas_tienda`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_visitas_fecha` (`fecha`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `cortes_caja`
--
ALTER TABLE `cortes_caja`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `detalle_compra`
--
ALTER TABLE `detalle_compra`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT for table `gastos_publicidad`
--
ALTER TABLE `gastos_publicidad`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `helados`
--
ALTER TABLE `helados`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `ingredientes`
--
ALTER TABLE `ingredientes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `metas_marketing`
--
ALTER TABLE `metas_marketing`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `movimientos_ingredientes`
--
ALTER TABLE `movimientos_ingredientes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `ordenes_compra`
--
ALTER TABLE `ordenes_compra`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `pagos_simulados`
--
ALTER TABLE `pagos_simulados`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `pedidos`
--
ALTER TABLE `pedidos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `presentaciones`
--
ALTER TABLE `presentaciones`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `proveedores`
--
ALTER TABLE `proveedores`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `recetas_helado`
--
ALTER TABLE `recetas_helado`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `resenas`
--
ALTER TABLE `resenas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `toppings`
--
ALTER TABLE `toppings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `visitas_tienda`
--
ALTER TABLE `visitas_tienda`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `detalle_compra`
--
ALTER TABLE `detalle_compra`
  ADD CONSTRAINT `fk_dc_ingrediente` FOREIGN KEY (`ingrediente_id`) REFERENCES `ingredientes` (`id`),
  ADD CONSTRAINT `fk_dc_orden` FOREIGN KEY (`orden_id`) REFERENCES `ordenes_compra` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  ADD CONSTRAINT `detalle_pedido_ibfk_1` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `detalle_pedido_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`);

--
-- Constraints for table `ingredientes`
--
ALTER TABLE `ingredientes`
  ADD CONSTRAINT `ingredientes_ibfk_1` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id`);

--
-- Constraints for table `movimientos_ingredientes`
--
ALTER TABLE `movimientos_ingredientes`
  ADD CONSTRAINT `movimientos_ingredientes_ibfk_1` FOREIGN KEY (`ingrediente_id`) REFERENCES `ingredientes` (`id`),
  ADD CONSTRAINT `movimientos_ingredientes_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Constraints for table `ordenes_compra`
--
ALTER TABLE `ordenes_compra`
  ADD CONSTRAINT `fk_oc_proveedor` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id`),
  ADD CONSTRAINT `fk_oc_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `pagos_simulados`
--
ALTER TABLE `pagos_simulados`
  ADD CONSTRAINT `pagos_simulados_ibfk_1` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `pedidos`
--
ALTER TABLE `pedidos`
  ADD CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`);

--
-- Constraints for table `productos`
--
ALTER TABLE `productos`
  ADD CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`helado_id`) REFERENCES `helados` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `productos_ibfk_2` FOREIGN KEY (`presentacion_id`) REFERENCES `presentaciones` (`id`);

--
-- Constraints for table `recetas_helado`
--
ALTER TABLE `recetas_helado`
  ADD CONSTRAINT `fk_receta_helado` FOREIGN KEY (`helado_id`) REFERENCES `helados` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_receta_ingrediente` FOREIGN KEY (`ingrediente_id`) REFERENCES `ingredientes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `toppings`
--
ALTER TABLE `toppings`
  ADD CONSTRAINT `fk_topping_proveedor` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
