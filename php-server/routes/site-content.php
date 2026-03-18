<?php
// routes/site-content.php
require_once __DIR__ . '/../config.php';

function handleGetSiteContent() {
    global $pdo;
    try {
        $stmt = $pdo->query("SELECT * FROM site_content");
        sendResponse($stmt->fetchAll());
    } catch (PDOException $e) {
        sendResponse(['error' => $e->getMessage()], 500);
    }
}

function handleUpdateSiteContent() {
    global $pdo;
    $input = getJsonInput();
    
    if (empty($input['section']) || empty($input['key']) || !isset($input['value'])) {
        sendResponse(['error' => 'section, key, and value required'], 400);
    }

    try {
        $id = bin2hex(random_bytes(16));
        $stmt = $pdo->prepare("
            INSERT INTO site_content (id, section, key_name, value)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE value = VALUES(value)
        ");
        $stmt->execute([
            $id,
            $input['section'],
            $input['key'],
            $input['value']
        ]);
        sendResponse(['success' => true]);
    } catch (PDOException $e) {
        sendResponse(['error' => $e->getMessage()], 500);
    }
}
?>
