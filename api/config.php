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

// Database credentials (Update these with your Laragon/hosting details)
define('DB_HOST', 'localhost');
define('DB_NAME', 'christoph_db');
define('DB_USER', 'root');
define('DB_PASS', '');

// Paystack Keys (Add your keys here after deploying to the server for security)
define('PAYSTACK_SECRET_KEY', 'REPLACE_ME_ON_SERVER');

// JWT Secret (Add your secret here after deploying to the server)
define('JWT_SECRET', 'REPLACE_ME_ON_SERVER');

try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (PDOException $e) {
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
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
