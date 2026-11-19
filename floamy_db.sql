-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Nov 19, 2026 at 10:54 PM
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
  `telefono` varchar(20) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `total_compras` int DEFAULT '0',
  `total_gastado` decimal(10,2) DEFAULT '0.00',
  `fecha_registro` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `clientes`
--

INSERT INTO `clientes` (`id`, `nombre`, `correo`, `telefono`, `password_hash`, `total_compras`, `total_gastado`, `fecha_registro`) VALUES
(1, 'Christofer Dario', 'langcarmine916@gmail.com', '', 'Contrest123', 0, 0.00, '2026-11-17 15:59:05'),
(24, 'manlo', 'line@gmail.com', '', NULL, 0, 0.00, '2026-11-17 17:48:36'),
(25, 'Andrea Moreno', '', NULL, NULL, 0, 0.00, '2026-11-17 18:00:37'),
(64, 'Venta de mostrador', 'cliente.213861@floamy.local', NULL, NULL, 0, 0.00, '2026-11-17 18:41:44');

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
(1, '2026-11-18 19:48:39', 1, 'Andrea Moreno', 500.00, 0.00, 0.00, 0.00, 0.00, 0, 500.00, 5000.00, 4500.00, NULL),
(2, '2026-11-18 19:48:48', 1, 'Andrea Moreno', 500.00, 0.00, 0.00, 0.00, 0.00, 0, 500.00, 7500.00, 7000.00, NULL),
(3, '2026-11-18 19:50:21', 1, 'Andrea Moreno', 500.00, 0.00, 0.00, 0.00, 0.00, 0, 500.00, 500.00, 0.00, NULL),
(4, '2026-11-18 19:50:55', 1, 'Andrea Moreno', 0.00, 0.00, 0.00, 0.00, 0.00, 0, 0.00, 150.00, 150.00, 'detalle'),
(5, '2026-11-18 19:51:16', 1, 'Andrea Moreno', 500.00, 0.00, 0.00, 0.00, 0.00, 0, 500.00, 50.00, -450.00, NULL),
(6, '2026-11-18 23:05:55', 1, 'Andrea Moreno', 500.00, 1817.00, 0.00, 0.00, 1817.00, 11, 2317.00, 2317.00, 0.00, NULL),
(7, '2026-11-19 00:52:35', 1, 'Andrea Moreno', 500.00, 307.00, 86.00, 201.00, 594.00, 9, 807.00, 807.00, 0.00, NULL),
(8, '2026-11-19 00:52:43', 1, 'Andrea Moreno', 900.00, 307.00, 86.00, 201.00, 594.00, 9, 1207.00, 807.00, -400.00, NULL),
(9, '2026-11-19 00:53:05', 1, 'Andrea Moreno', 500.00, 307.00, 86.00, 201.00, 594.00, 9, 807.00, 8070.00, 7263.00, NULL),
(10, '2026-11-19 01:07:48', 1, 'Andrea Moreno', 500.00, 4552.00, 3628.00, 201.00, 8381.00, 14, 5052.00, 5052.00, 0.00, NULL),
(11, '2026-11-19 01:08:12', 1, 'Andrea Moreno', 500.00, 4552.00, 3628.00, 201.00, 8381.00, 14, 5052.00, 5052.00, 0.00, NULL),
(12, '2026-11-19 16:41:34', 1, 'Andrea Moreno', 500.00, 8452.00, 3628.00, 201.00, 12281.00, 15, 8952.00, 8952.00, 0.00, NULL),
(13, '2026-11-19 16:42:04', 1, 'Andrea Moreno', 500.00, 8452.00, 3628.00, 201.00, 12281.00, 15, 8952.00, 8953.00, 1.00, NULL);

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
(1, 1, 5, 1, 45.00, NULL),
(2, 1, 6, 1, 150.00, NULL),
(3, 2, 7, 1, 45.00, NULL),
(4, 2, 8, 1, 150.00, NULL),
(5, 3, 5, 1, 45.00, NULL),
(6, 4, 8, 1, 150.00, NULL),
(7, 4, 7, 3, 45.00, NULL),
(8, 4, 9, 1, 45.00, NULL),
(9, 5, 4, 2, 150.00, NULL),
(10, 12, 5, 1, 45.00, NULL),
(11, 12, 6, 4, 150.00, NULL),
(12, 13, 7, 5, 45.00, NULL),
(13, 16, 7, 4, 45.00, NULL),
(14, 17, 5, 1, 45.00, NULL),
(15, 17, 6, 2, 150.00, NULL),
(16, 17, 8, 20, 150.00, NULL),
(17, 17, 9, 3, 45.00, NULL),
(18, 18, 8, 2, 150.00, NULL),
(19, 19, 5, 12, 45.00, NULL),
(20, 20, 1, 1, 45.00, NULL),
(21, 21, 5, 4, 45.00, NULL),
(22, 22, 7, 2, 45.00, NULL),
(23, 23, 4, 1, 150.00, NULL),
(24, 24, 1, 1, 45.00, NULL),
(25, 24, 2, 2, 150.00, NULL),
(26, 25, 3, 1, 45.00, NULL),
(27, 26, 7, 3, 45.00, NULL),
(28, 27, 7, 1, 45.00, NULL),
(29, 28, 3, 1, 45.00, NULL),
(30, 29, 9, 1, 45.00, NULL),
(31, 29, 3, 1, 45.00, NULL),
(32, 30, 7, 2, 45.00, NULL),
(33, 30, 8, 2, 150.00, NULL),
(34, 31, 5, 1, 45.00, NULL),
(35, 32, 3, 4, 45.00, NULL),
(36, 33, 16, 3, 41.00, 'Chispas de chocolate'),
(37, 34, 17, 2, 45.00, 'Fresa'),
(38, 35, 6, 2, 160.00, 'Fresa'),
(39, 36, 6, 1, 150.00, NULL),
(40, 37, 4, 1, 156.00, 'Chispas de chocolate'),
(41, 38, 4, 1, 150.00, NULL),
(42, 39, 4, 1, 150.00, NULL),
(43, 40, 9, 2, 51.00, 'Chispas de chocolate'),
(44, 40, 3, 1, 45.00, NULL),
(45, 41, 1, 1, 45.00, NULL),
(46, 42, 17, 1, 35.00, NULL),
(47, 43, 5, 1, 45.00, NULL),
(48, 44, 17, 1, 35.00, NULL),
(49, 45, 6, 1, 150.00, NULL),
(50, 46, 19, 1, 41.00, 'Chispas de chocolate'),
(51, 47, 1, 1, 45.00, NULL),
(52, 48, 5, 1, 51.00, 'Chispas de chocolate'),
(53, 49, 4, 11, 156.00, 'Chispas de chocolate'),
(54, 50, 4, 11, 166.00, 'Chispas de chocolate, Mango'),
(55, 51, 20, 1, 45.00, NULL),
(56, 52, 21, 10, 150.00, NULL),
(57, 53, 21, 18, 150.00, NULL),
(58, 54, 21, 26, 150.00, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `helados`
--

CREATE TABLE `helados` (
  `id` int NOT NULL,
  `sabor` varchar(50) NOT NULL,
  `nombre_comercial` varchar(80) NOT NULL,
  `tono` varchar(30) DEFAULT 'vanilla',
  `imagen_url` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `helados`
--

INSERT INTO `helados` (`id`, `sabor`, `nombre_comercial`, `tono`, `imagen_url`) VALUES
(1, 'Vainilla', 'Vainilla Nube', 'vanilla', 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=400&q=80'),
(2, 'Chocolate', 'Cacao Profundo', 'chocolate', 'https://images.unsplash.com/photo-1580915411954-282cb1b0d780?auto=format&fit=crop&w=400&q=80'),
(3, 'Fresa', 'Fresa Nevada', 'strawberry', 'https://images.unsplash.com/photo-1505394033641-40c6ad1178d7?auto=format&fit=crop&w=400&q=80'),
(4, 'Mango', 'Mango Solar', 'mango', 'https://sivarious.com/wp-content/uploads/2023/06/helado-de-mango-casero.jpg'),
(5, 'Limón', 'Limón Glaciar', 'lime', 'https://images.unsplash.com/photo-1516559828984-fb3b99548b21?auto=format&fit=crop&w=400&q=80'),
(8, 'Lang', 'LANGcarmineUWU', 'vanilla', '');

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
(1, 'Leche entera', 'Lácteos', 21.00, 10.00, 'L', 24.00, 1),
(2, 'Crema para batir', 'Lácteos', 13.00, 8.00, 'L', 85.00, 1),
(3, 'Azúcar', 'Secos', 15.00, 5.00, 'kg', 28.00, 3),
(4, 'Cacao', 'Secos', 2.00, 4.00, 'kg', 190.00, 3),
(5, 'Fresa natural', 'Fruta Natural', 15.00, 4.00, 'kg', 55.00, 2),
(6, 'Mango ataulfo', 'Fruta Natural', 12.00, 3.00, 'kg', 48.00, 2),
(7, 'Limón', 'Fruta Natural', 6.00, 3.00, 'kg', 32.00, 2),
(8, 'Vainilla', 'Esencias', 4.00, 5.00, 'L', 210.00, 3);

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
(1, 4, 'Producción', -1.20, 1, '2026-11-17 16:01:56'),
(2, 3, 'Producción', -1.00, 1, '2026-11-17 18:08:17');

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
(1, 1, 'Transferencia', 175.50, 'FP-9687198', '2026-11-17 15:59:23'),
(2, 2, 'Transferencia', 175.50, 'FP-9278903', '2026-11-17 16:01:18'),
(3, 3, 'Tarjeta simulada', 40.50, 'FP-9776256', '2026-11-17 17:22:26'),
(4, 4, 'Transferencia', 297.00, 'FP-9238214', '2026-11-17 17:26:33'),
(5, 5, 'Efectivo en sucursal', 255.00, 'FP-9093517', '2026-11-17 17:33:18'),
(6, 45, 'Transferencia', 150.00, 'FP-4854772', '2026-11-19 00:50:50'),
(7, 46, 'Tarjeta', 41.00, 'FP-3276131', '2026-11-19 00:51:04'),
(8, 47, 'Tarjeta', 45.00, 'FP-9823628', '2026-11-19 00:51:25'),
(9, 48, 'Transferencia', 51.00, 'FP-1810874', '2026-11-19 00:52:14'),
(10, 49, 'Tarjeta', 1716.00, 'FP-3562932', '2026-11-19 00:53:34'),
(11, 50, 'Tarjeta', 1826.00, 'FP-2993873', '2026-11-19 00:54:31'),
(12, 51, 'Efectivo', 45.00, 'FP-3859966', '2026-11-19 01:06:35'),
(13, 52, 'Efectivo', 1500.00, 'FP-7899219', '2026-11-19 01:06:58'),
(14, 53, 'Efectivo', 2700.00, 'FP-6522534', '2026-11-19 01:07:31'),
(15, 54, 'Efectivo', 3900.00, 'FP-7144362', '2026-11-19 16:37:55');

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
(1, '#FL-9561', 1, 'Christofer Dario', 195.00, 19.50, 175.50, 3, 'PWA', '2026-11-17 15:59:23'),
(2, '#FL-5473', 1, 'Andrea Moreno', 195.00, 19.50, 175.50, 3, 'PWA', '2026-11-17 16:01:18'),
(3, '#FL-6295', 1, 'Andrea Moreno', 45.00, 4.50, 40.50, 3, 'PWA', '2026-11-17 17:22:26'),
(4, '#FL-5907', 1, 'Andrea Moreno', 330.00, 33.00, 297.00, 3, 'PWA', '2026-11-17 17:26:33'),
(5, '#FL-3476', NULL, 'Venta de mostrador', 300.00, 45.00, 255.00, 3, 'Sucursal', '2026-11-17 17:33:18'),
(6, '#FL-7682', NULL, 'Venta de mostrador', 645.00, 96.75, 548.25, 3, 'Sucursal', '2026-11-17 17:43:30'),
(7, '#FL-8134', NULL, 'Venta de mostrador', 645.00, 96.75, 548.25, 3, 'Sucursal', '2026-11-17 17:44:05'),
(8, '#FL-9192', NULL, 'Venta de mostrador', 645.00, 96.75, 548.25, 3, 'Sucursal', '2026-11-17 17:44:12'),
(9, '#FL-8003', NULL, 'Venta de mostrador', 645.00, 96.75, 548.25, 3, 'Sucursal', '2026-11-17 17:44:16'),
(10, '#FL-9155', NULL, 'Venta de mostrador', 645.00, 96.75, 548.25, 3, 'Sucursal', '2026-11-17 17:44:22'),
(11, '#FL-3038', NULL, 'Venta de mostrador', 645.00, 96.75, 548.25, 3, 'Sucursal', '2026-11-17 17:44:54'),
(12, '#FL-8749', 24, 'manlo', 645.00, 0.00, 645.00, 3, 'PWA', '2026-11-17 17:50:38'),
(13, '#FL-8232', 24, 'manlo', 225.00, 22.50, 202.50, 3, 'PWA', '2026-11-17 17:50:59'),
(14, '#FL-3399', 25, 'Andrea Moreno', 180.00, 0.00, 180.00, 3, 'PWA', '2026-11-17 18:00:37'),
(15, '#FL-1664', 25, 'Andrea Moreno', 180.00, 0.00, 180.00, 3, 'PWA', '2026-11-17 18:00:39'),
(16, '#FL-3450', 25, 'Andrea Moreno', 180.00, 0.00, 180.00, 3, 'PWA', '2026-11-17 18:00:51'),
(17, '#FL-3206', 25, 'Andrea Moreno', 3480.00, 0.00, 3480.00, 3, 'PWA', '2026-11-17 18:02:27'),
(18, '#FL-6381', 25, 'Andrea Moreno', 300.00, 0.00, 300.00, 3, 'PWA', '2026-11-17 18:02:46'),
(19, '#FL-4091', 25, 'Andrea Moreno', 540.00, 0.00, 540.00, 3, 'PWA', '2026-11-17 18:06:37'),
(20, '#FL-8792', 25, 'Andrea Moreno', 45.00, 0.00, 45.00, 3, 'PWA', '2026-11-17 18:11:14'),
(21, '#FL-2487', 25, 'Andrea Moreno', 180.00, 0.00, 180.00, 3, 'PWA', '2026-11-17 18:39:45'),
(22, '#FL-3603', 25, 'Andrea Moreno', 90.00, 0.00, 90.00, 3, 'PWA', '2026-11-17 18:40:42'),
(23, '#FL-8528', 64, 'Venta de mostrador', 150.00, 0.00, 150.00, 3, 'Sucursal', '2026-11-17 18:41:44'),
(24, '#FL-6824', 64, 'Venta de mostrador', 345.00, 51.75, 293.25, 3, 'Sucursal', '2026-11-17 18:41:59'),
(25, '#FL-7993', 25, 'Andrea Moreno', 45.00, 0.00, 45.00, 3, 'PWA', '2026-11-17 18:42:19'),
(26, '#FL-8678', 25, 'Andrea Moreno', 135.00, 0.00, 135.00, 3, 'PWA', '2026-11-17 18:43:17'),
(27, '#FL-8202', 25, 'Andrea Moreno', 45.00, 0.00, 45.00, 3, 'PWA', '2026-11-17 18:43:51'),
(28, '#FL-6617', 64, 'Venta de mostrador', 45.00, 0.00, 45.00, 3, 'Sucursal', '2026-11-17 19:34:49'),
(29, '#FL-9105', 64, 'Venta de mostrador', 90.00, 9.00, 81.00, 3, 'Sucursal', '2026-11-18 09:59:12'),
(30, '#FL-5941', 25, 'Andrea Moreno', 390.00, 0.00, 390.00, 3, 'PWA', '2026-11-18 09:59:43'),
(31, '#FL-9391', 25, 'Andrea Moreno', 45.00, 0.00, 45.00, 3, 'PWA', '2026-11-18 10:31:25'),
(32, '#FL-2858', 64, 'Venta de mostrador', 180.00, 18.00, 162.00, 3, 'Sucursal', '2026-11-18 17:59:27'),
(33, '#FL-3678', 25, 'Andrea Moreno', 123.00, 0.00, 123.00, 3, 'PWA', '2026-11-18 19:10:48'),
(34, '#FL-4996', 64, 'Venta de mostrador', 90.00, 0.00, 90.00, 3, 'Sucursal', '2026-11-18 19:11:41'),
(35, '#FL-4565', 25, 'Andrea Moreno', 320.00, 0.00, 320.00, 3, 'PWA', '2026-11-18 19:49:22'),
(36, '#FL-8765', 25, 'Andrea Moreno', 150.00, 0.00, 150.00, 3, 'PWA', '2026-11-18 19:50:40'),
(37, '#FL-5364', 25, 'Andrea Moreno', 156.00, 0.00, 156.00, 3, 'PWA', '2026-11-18 23:03:34'),
(38, '#FL-6763', 25, 'Andrea Moreno', 150.00, 0.00, 150.00, 3, 'PWA', '2026-11-18 23:05:08'),
(39, '#FL-2321', 25, 'Andrea Moreno', 150.00, 0.00, 150.00, 3, 'PWA', '2026-11-18 23:05:37'),
(40, '#FL-5520', 25, 'Andrea Moreno', 147.00, 0.00, 147.00, 3, 'PWA', '2026-11-19 00:42:45'),
(41, '#FL-1657', 25, 'Andrea Moreno', 45.00, 0.00, 45.00, 3, 'PWA', '2026-11-19 00:43:02'),
(42, '#FL-1998', 25, 'Andrea Moreno', 35.00, 0.00, 35.00, 3, 'PWA', '2026-11-19 00:43:17'),
(43, '#FL-7373', 64, 'Venta de mostrador', 45.00, 0.00, 45.00, 3, 'Sucursal', '2026-11-19 00:44:37'),
(44, '#FL-4498', 64, 'Venta de mostrador', 35.00, 0.00, 35.00, 3, 'Sucursal', '2026-11-19 00:44:49'),
(45, '#FL-6345', 25, 'Andrea Moreno', 150.00, 0.00, 150.00, 3, 'PWA', '2026-11-19 00:50:50'),
(46, '#FL-2669', 25, 'Andrea Moreno', 41.00, 0.00, 41.00, 3, 'PWA', '2026-11-19 00:51:04'),
(47, '#FL-6447', 25, 'Andrea Moreno', 45.00, 0.00, 45.00, 3, 'PWA', '2026-11-19 00:51:25'),
(48, '#FL-4775', 25, 'Andrea Moreno', 51.00, 0.00, 51.00, 3, 'PWA', '2026-11-19 00:52:14'),
(49, '#FL-7628', 25, 'Andrea Moreno', 1716.00, 0.00, 1716.00, 3, 'PWA', '2026-11-19 00:53:34'),
(50, '#FL-3008', 25, 'Andrea Moreno', 1826.00, 0.00, 1826.00, 3, 'PWA', '2026-11-19 00:54:31'),
(51, '#FL-3722', 25, 'Andrea Moreno', 45.00, 0.00, 45.00, 0, 'PWA', '2026-11-19 01:06:35'),
(52, '#FL-4085', 25, 'Andrea Moreno', 1500.00, 0.00, 1500.00, 0, 'PWA', '2026-11-19 01:06:58'),
(53, '#FL-1308', 25, 'Andrea Moreno', 2700.00, 0.00, 2700.00, 0, 'PWA', '2026-11-19 01:07:31'),
(54, '#FL-4588', 25, 'Andrea Moreno', 3900.00, 0.00, 3900.00, 0, 'PWA', '2026-11-19 16:37:55');

-- --------------------------------------------------------

--
-- Table structure for table `presentaciones`
--

CREATE TABLE `presentaciones` (
  `id` int NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `precio` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `presentaciones`
--

INSERT INTO `presentaciones` (`id`, `nombre`, `precio`) VALUES
(1, 'Vaso 8 oz', 45.00),
(2, 'Litro', 150.00),
(3, 'Cono', 35.00);

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
(1, 1, 1, 20, 1),
(2, 1, 2, 6, 1),
(3, 2, 1, 6, 1),
(4, 2, 2, 8, 1),
(5, 3, 1, 2, 1),
(6, 3, 2, 12, 1),
(7, 4, 1, 9, 1),
(8, 4, 2, 12, 1),
(9, 5, 1, 4, 1),
(10, 5, 2, 3, 1),
(15, 1, 3, 10, 1),
(16, 2, 3, 7, 1),
(17, 3, 3, 6, 1),
(18, 4, 3, 10, 1),
(19, 5, 3, 9, 1),
(20, 8, 1, 0, 0),
(21, 8, 2, 0, 0),
(22, 8, 3, 0, 0);

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
(1, 'Lácteos Lactozos', 'Emanuel Valtierra', '123456789'),
(2, 'Verdulería Valeria', 'Carlos Trejo', '987654321'),
(3, 'PrimaPrimos', 'Trevol CJ', '6622789123'),
(4, 'Toppings-Springs', 'William', '2232233432');

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
(1, 'Mariana López', 5, 'El helado de vainilla sabe realmente artesanal. Cremoso, fresco y la atención fue increíble.', 'Gracias tilin!!!', '2026-11-17 13:10:00'),
(2, 'Jorge Ávila', 5, 'Mango Solar es mi nuevo favorito. El pedido estuvo listo antes de lo esperado.', NULL, '2026-11-17 13:10:00'),
(3, 'Sofía Herrera', 5, 'Me encantó el empaque y poder seguir mi pedido en tiempo real.', NULL, '2026-11-17 13:10:00'),
(4, 'LANGcarmineUWU', 4, 'Muy buenos heladitos, me encantó el floe', 'olaa', '2026-11-17 16:20:49');

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
(1, 'Administrador', 'Control total del sistema', '{\"pos\": true, \"roles\": true, \"users\": true, \"orders\": true, \"clients\": true, \"pedidos\": true, \"resenas\": true, \"resumen\": true, \"reviews\": true, \"clientes\": true, \"products\": true, \"usuarios\": true, \"dashboard\": true, \"inventory\": true, \"movements\": true, \"productos\": true, \"suppliers\": true, \"inventario\": true, \"movimientos\": true, \"proveedores\": true, \"cash_register\": true, \"punto_de_venta\": true, \"catalog_options\": true}'),
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
  `activo` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `toppings`
--

INSERT INTO `toppings` (`id`, `nombre`, `precio`, `stock`, `proveedor_id`, `activo`) VALUES
(1, 'Chispas de chocolate', 6.00, 0, 4, 1),
(2, 'Fresa', 10.00, 21, 2, 1),
(3, 'Mango', 10.00, 14, 2, 1);

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
(1, 'Andrea Moreno', 'andrea@floamy.mx', 'floamy2025', 1, 1, '2026-11-17 16:09:10'),
(2, 'Pablo Reyes', 'pablo@floamy.mx', 'floamy2025', 3, 1, '2026-11-17 13:10:00'),
(3, 'Lucía García', 'lucia@floamy.mx', 'floamy2025', 2, 1, '2026-11-17 13:10:00'),
(4, 'LANGcarmineUWU', 'langcarmine916@gmail.com', 'floamy2025', 1, 1, '2026-11-17 16:10:06'),
(5, 'aa', 'langostacarmine@gmail.com', 'Contrest123', 4, 1, '2026-11-17 17:43:48'),
(6, 'Christofer Dario', 'ine@gmail.com', 'Contrest123', 4, 1, '2026-11-17 17:47:28'),
(7, 'manlo', 'line@gmail.com', 'Contrest123', 4, 1, '2026-11-17 17:48:36');

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
-- Indexes for table `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pedido_id` (`pedido_id`),
  ADD KEY `producto_id` (`producto_id`);

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
-- Indexes for table `movimientos_ingredientes`
--
ALTER TABLE `movimientos_ingredientes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ingrediente_id` (`ingrediente_id`),
  ADD KEY `usuario_id` (`usuario_id`);

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
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=65;

--
-- AUTO_INCREMENT for table `cortes_caja`
--
ALTER TABLE `cortes_caja`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=59;

--
-- AUTO_INCREMENT for table `helados`
--
ALTER TABLE `helados`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `ingredientes`
--
ALTER TABLE `ingredientes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `movimientos_ingredientes`
--
ALTER TABLE `movimientos_ingredientes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `pagos_simulados`
--
ALTER TABLE `pagos_simulados`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `pedidos`
--
ALTER TABLE `pedidos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

--
-- AUTO_INCREMENT for table `presentaciones`
--
ALTER TABLE `presentaciones`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `proveedores`
--
ALTER TABLE `proveedores`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `resenas`
--
ALTER TABLE `resenas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `toppings`
--
ALTER TABLE `toppings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints for dumped tables
--

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
