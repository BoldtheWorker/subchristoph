<?php
// routes/portfolio.php
require_once __DIR__ . '/../config.php';

function handleGetPortfolio() {
    global $pdo;
    try {
        $stmt = $pdo->query("SELECT * FROM portfolio_items ORDER BY sort_order ASC, created_at DESC");
        $items = $stmt->fetchAll();
        
        // Convert integer booleans
        foreach ($items as &$item) {
            $item['is_featured'] = (bool)$item['is_featured'];
        }
        
        sendResponse($items);
    } catch (PDOException $e) {
        sendResponse([], 500);
    }
}
?>
