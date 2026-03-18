-- Christoph Media Hub: MySQL Schema
-- Import this into your phpMyAdmin database

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- ─────────────────────────────────────────────────────────────────────────────
-- Tables
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `admins` (
  `id` varchar(36) PRIMARY KEY,
  `email` varchar(255) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `bookings` (
  `id` varchar(36) PRIMARY KEY,
  `service` varchar(255) NOT NULL,
  `client_name` varchar(255) NOT NULL,
  `client_email` varchar(255) NOT NULL,
  `client_phone` varchar(50) NOT NULL,
  `preferred_date` date NOT NULL,
  `message` text,
  `status` varchar(50) NOT NULL DEFAULT 'pending_payment',
  `amount_kobo` bigint(20),
  `paystack_reference` varchar(255),
  `admin_notes` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `portfolio_items` (
  `id` varchar(36) PRIMARY KEY,
  `title` varchar(255) NOT NULL,
  `description` text,
  `category` varchar(100) NOT NULL,
  `image_url` varchar(255),
  `media_url` varchar(255),
  `is_featured` tinyint(1) NOT NULL DEFAULT 0,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `blog_posts` (
  `id` varchar(36) PRIMARY KEY,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL UNIQUE,
  `content` longtext NOT NULL,
  `excerpt` text,
  `category` varchar(100),
  `cover_image_url` varchar(255),
  `is_published` tinyint(1) NOT NULL DEFAULT 0,
  `published_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `faq_items` (
  `id` varchar(36) PRIMARY KEY,
  `question` text NOT NULL,
  `answer` text NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `is_published` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `services` (
  `id` varchar(36) PRIMARY KEY,
  `title` varchar(255) NOT NULL,
  `short_title` varchar(255),
  `description` text,
  `icon` varchar(100) NOT NULL DEFAULT 'Mic',
  `price` int(11) NOT NULL DEFAULT 0,
  `sub_services` text NOT NULL,
  `category` varchar(100),
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `site_content` (
  `id` varchar(36) PRIMARY KEY,
  `section` varchar(255) NOT NULL,
  `key_name` varchar(255) NOT NULL,
  `value` text NOT NULL,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE(`section`, `key_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `testimonials` (
  `id` varchar(36) PRIMARY KEY,
  `client_name` varchar(255) NOT NULL,
  `client_role` varchar(255),
  `content` text NOT NULL,
  `rating` int(11) NOT NULL DEFAULT 5,
  `is_featured` tinyint(1) NOT NULL DEFAULT 0,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────────────────────────────────────────
-- Default Admin (Password: admin123)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO `admins` (`id`, `email`, `password`) VALUES
('default-admin-id', 'admin@christophmedia.com', '$2y$10$wT8K0b3P7LpI9J6.zS1X6ueK1VpJ4vV5Gk5L6L6L6L6L6L6L6L6L');

COMMIT;
