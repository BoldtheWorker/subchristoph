<?php
// routes/testimonials.php
require_once __DIR__ . '/../config.php';

function handleGetTestimonials() {
    global $pdo;
    try {
        $stmt = $pdo->query("SELECT * FROM testimonials ORDER BY sort_order ASC, created_at DESC");
        $rows = $stmt->fetchAll();
        foreach ($rows as &$row) {
            $row['is_featured'] = (bool)$row['is_featured'];
        }
        sendResponse($rows);
    } catch (PDOException $e) {
        sendResponse(['error' => $e->getMessage()], 500);
    }
}

function handleCreateTestimonial() {
    global $pdo;
    $input = getJsonInput();
    if (empty($input['client_name']) || empty($input['content'])) {
        sendResponse(['error' => 'client_name and content required'], 400);
    }

    $id = bin2hex(random_bytes(16));
    
    try {
        $countStmt = $pdo->query("SELECT COUNT(*) as c FROM testimonials");
        $count = $countStmt->fetch()['c'];

        $stmt = $pdo->prepare("
            INSERT INTO testimonials (id, client_name, client_role, content, rating, is_featured, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $id,
            $input['client_name'],
            $input['client_role'] ?? null,
            $input['content'],
            $input['rating'] ?? 5,
            !empty($input['is_featured']) ? 1 : 0,
            $input['sort_order'] ?? $count
        ]);

        $stmt = $pdo->prepare("SELECT * FROM testimonials WHERE id = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        $row['is_featured'] = (bool)$row['is_featured'];
        sendResponse($row, 201);
    } catch (PDOException $e) {
        sendResponse(['error' => $e->getMessage()], 500);
    }
}

function handleDeleteTestimonial($id) {
    global $pdo;
    try {
        $stmt = $pdo->prepare("DELETE FROM testimonials WHERE id = ?");
        $stmt->execute([$id]);
        if ($stmt->rowCount() === 0) sendResponse(['error' => 'Not found'], 404);
        sendResponse(['success' => true]);
    } catch (PDOException $e) {
        sendResponse(['error' => $e->getMessage()], 500);
    }
}
?>
