<?php
// routes/carousel.php

function handleGetCarousel() {
    global $pdo;
    try {
        $stmt = $pdo->query("SELECT * FROM carousel_slides WHERE is_published = 1 ORDER BY sort_order ASC");
        sendResponse($stmt->fetchAll());
    } catch (Exception $e) {
        sendResponse(['error' => $e->getMessage()], 500);
    }
}

function handleGetCarouselAll() {
    global $pdo;
    try {
        $stmt = $pdo->query("SELECT * FROM carousel_slides ORDER BY sort_order ASC");
        sendResponse($stmt->fetchAll());
    } catch (Exception $e) {
        sendResponse(['error' => $e->getMessage()], 500);
    }
}

function handleCreateCarouselSlide() {
    global $pdo;
    $data = getJsonInput();
    $id = bin2hex(random_bytes(16));
    
    try {
        $stmt = $pdo->prepare("INSERT INTO carousel_slides (id, image_url, label, heading, description, cta_text, cta_link, secondary_text, secondary_link, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $id,
            $data['image_url'] ?? '',
            $data['label'] ?? '',
            $data['heading'] ?? '',
            $data['description'] ?? '',
            $data['cta_text'] ?? '',
            $data['cta_link'] ?? '',
            $data['secondary_text'] ?? '',
            $data['secondary_link'] ?? '',
            $data['sort_order'] ?? 0
        ]);
        sendResponse(['id' => $id, 'status' => 'success']);
    } catch (Exception $e) {
        sendResponse(['error' => $e->getMessage()], 500);
    }
}

function handleUpdateCarouselSlide($id) {
    global $pdo;
    $data = getJsonInput();
    
    try {
        $fields = [];
        $params = [];
        foreach ($data as $key => $value) {
            if (in_array($key, ['image_url', 'label', 'heading', 'description', 'cta_text', 'cta_link', 'secondary_text', 'secondary_link', 'sort_order', 'is_published'])) {
                $fields[] = "$key = ?";
                $params[] = $value;
            }
        }
        $params[] = $id;
        
        $sql = "UPDATE carousel_slides SET " . implode(', ', $fields) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        sendResponse(['status' => 'success']);
    } catch (Exception $e) {
        sendResponse(['error' => $e->getMessage()], 500);
    }
}

function handleDeleteCarouselSlide($id) {
    global $pdo;
    try {
        $stmt = $pdo->prepare("DELETE FROM carousel_slides WHERE id = ?");
        $stmt->execute([$id]);
        sendResponse(['status' => 'success']);
    } catch (Exception $e) {
        sendResponse(['error' => $e->getMessage()], 500);
    }
}
?>
