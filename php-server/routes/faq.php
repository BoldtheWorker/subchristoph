<?php
// routes/faq.php
require_once __DIR__ . '/../config.php';

function handleGetFaq() {
    global $pdo;
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    $isAdmin = !empty($authHeader);

    try {
        if ($isAdmin) {
            $stmt = $pdo->query("SELECT * FROM faq_items ORDER BY sort_order ASC");
        } else {
            $stmt = $pdo->query("SELECT * FROM faq_items WHERE is_published = 1 ORDER BY sort_order ASC");
        }
        $items = $stmt->fetchAll();
        foreach ($items as &$item) {
            $item['is_published'] = (bool)$item['is_published'];
        }
        sendResponse($items);
    } catch (PDOException $e) {
        sendResponse([], 500);
    }
}

function handleCreateFaq() {
    global $pdo;
    $input = getJsonInput();
    if (empty($input['question']) || empty($input['answer'])) {
        sendResponse(['error' => 'question and answer required'], 400);
    }

    $id = bin2hex(random_bytes(16));
    
    try {
        $countStmt = $pdo->query("SELECT COUNT(*) as c FROM faq_items");
        $count = $countStmt->fetch()['c'];
        
        $stmt = $pdo->prepare("
            INSERT INTO faq_items (id, question, answer, sort_order, is_published)
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $id,
            $input['question'],
            $input['answer'],
            $input['sort_order'] ?? $count + 1,
            isset($input['is_published']) && $input['is_published'] === false ? 0 : 1
        ]);

        $stmt = $pdo->prepare("SELECT * FROM faq_items WHERE id = ?");
        $stmt->execute([$id]);
        $item = $stmt->fetch();
        $item['is_published'] = (bool)$item['is_published'];
        sendResponse($item, 201);
    } catch (PDOException $e) {
        sendResponse(['error' => $e->getMessage()], 500);
    }
}

function handleDeleteFaq($id) {
    global $pdo;
    try {
        $stmt = $pdo->prepare("DELETE FROM faq_items WHERE id = ?");
        $stmt->execute([$id]);
        if ($stmt->rowCount() === 0) sendResponse(['error' => 'Not found'], 404);
        sendResponse(['success' => true]);
    } catch (PDOException $e) {
        sendResponse(['error' => $e->getMessage()], 500);
    }
}
?>
