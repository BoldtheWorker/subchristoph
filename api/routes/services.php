<?php
// routes/services.php
require_once __DIR__ . '/../config.php';

function handleGetServices() {
    global $pdo;
    try {
        $stmt = $pdo->query("SELECT * FROM services WHERE is_active = 1 ORDER BY sort_order ASC");
        $services = $stmt->fetchAll();
        
        // Decode sub_services JSON strings
        foreach ($services as &$service) {
            $service['sub_services'] = json_decode($service['sub_services'], true) ?: [];
        }
        
        sendResponse($services);
    } catch (PDOException $e) {
        sendResponse(['error' => $e->getMessage()], 500);
    }
}
?>
