<?php
// repair_admin.php
require_once 'config.php';

$email = 'admin@christophmedia.com';
$password = 'admin123';
$hash = password_hash($password, PASSWORD_BCRYPT);

try {
    $stmt = $pdo->prepare("UPDATE admins SET password = ? WHERE email = ?");
    $result = $stmt->execute([$hash, $email]);
    
    if ($result && $stmt->rowCount() > 0) {
        echo json_encode(['status' => 'success', 'message' => "Password updated for $email"]);
    } else {
        // Try creating it if it doesn't exist
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM admins WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetchColumn() == 0) {
            $stmt = $pdo->prepare("INSERT INTO admins (id, email, password) VALUES (?, ?, ?)");
            $stmt->execute(['admin-root', $email, $hash]);
            echo json_encode(['status' => 'success', 'message' => "Admin created: $email"]);
        } else {
            echo json_encode(['status' => 'info', 'message' => "No changes made (password might already be correct)"]);
        }
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
