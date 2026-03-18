<?php
// config.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");
header("Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database credentials (Update these for your environment)
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'elbethe1_christoph_production');
define('DB_USER', getenv('DB_USER') ?: 'elbethe1_roo_tuser');
define('DB_PASS', getenv('DB_PASS') ?: 'YOUR_DB_PASSWORD');

// Paystack Keys (USE ENVIRONMENT VARIABLES FOR SECURITY)
define('PAYSTACK_SECRET_KEY', getenv('PAYSTACK_SECRET_KEY') ?: 'YOUR_PAYSTACK_SECRET_KEY');

// JWT Secret (USE ENVIRONMENT VARIABLES FOR SECURITY)
define('JWT_SECRET', getenv('JWT_SECRET') ?: 'YOUR_JWT_SECRET_KEY');

try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (PDOException $e) {
    // Return empty array to prevent frontend crash if DB fails
    echo json_encode([]);
    exit();
}

function sendResponse($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit();
}

function getJsonInput() {
    return json_decode(file_get_contents('php://input'), true) ?? [];
}
?>
