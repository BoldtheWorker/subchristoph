<?php
// routes/auth.php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../lib/jwt.php';

function handleLogin() {
    global $pdo;
    $input = getJsonInput();
    $email = $input['email'] ?? '';
    $password = $input['password'] ?? '';

    if (empty($email) || empty($password)) {
        sendResponse(['error' => 'Email and password required'], 400);
    }

    try {
        $stmt = $pdo->prepare("SELECT * FROM admins WHERE email = ?");
        $stmt->execute([$email]);
        $admin = $stmt->fetch();

        if (!$admin || !password_verify($password, $admin['password'])) {
            sendResponse(['error' => 'Invalid credentials'], 401);
        }

        $userPayload = [
            'id' => $admin['id'],
            'email' => $admin['email'],
            'isAdmin' => true,
            'iat' => time(),
            'exp' => time() + (7 * 24 * 60 * 60) // 7 days
        ];

        $token = jwt_encode($userPayload, JWT_SECRET);

        sendResponse([
            'token' => $token,
            'user' => [
                'id' => $admin['id'],
                'email' => $admin['email'],
                'isAdmin' => true
            ]
        ]);
    } catch (PDOException $e) {
        sendResponse(['error' => $e->getMessage()], 500);
    }
}

function checkAuth() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

    if (empty($authHeader) || strpos($authHeader, 'Bearer ') !== 0) {
        sendResponse(['error' => 'Unauthorized'], 401);
    }

    $token = substr($authHeader, 7);
    $payload = jwt_decode($token, JWT_SECRET);

    if (!$payload || ($payload['exp'] ?? 0) < time()) {
        sendResponse(['error' => 'Invalid or expired token'], 401);
    }

    return $payload;
}
?>
