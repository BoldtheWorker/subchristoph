<?php
// routes/bookings.php
require_once __DIR__ . '/../config.php';

function handleCreateBooking() {
    global $pdo;
    $input = getJsonInput();
    
    $required = ['service', 'client_name', 'client_email', 'client_phone', 'preferred_date'];
    foreach ($required as $field) {
        if (empty($input[$field])) {
            sendResponse(['error' => "Missing required field: $field"], 400);
        }
    }

    $id = bin2hex(random_bytes(16)); // Generate UUID-like ID
    
    try {
        $stmt = $pdo->prepare("
            INSERT INTO bookings (id, service, client_name, client_email, client_phone, preferred_date, message, amount_kobo, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending_payment')
        ");
        
        $stmt->execute([
            $id,
            $input['service'],
            $input['client_name'],
            $input['client_email'],
            $input['client_phone'],
            $input['preferred_date'],
            $input['message'] ?? null,
            $input['amount_kobo'] ?? null
        ]);

        $stmt = $pdo->prepare("SELECT * FROM bookings WHERE id = ?");
        $stmt->execute([$id]);
        sendResponse($stmt->fetch(), 201);
    } catch (PDOException $e) {
        sendResponse(['error' => $e->getMessage()], 500);
    }
}

function handleGetBookings() {
    // Note: In Node.js this was admin only. We'll add auth later.
    global $pdo;
    try {
        $stmt = $pdo->query("SELECT * FROM bookings ORDER BY created_at DESC");
        sendResponse($stmt->fetchAll());
    } catch (PDOException $e) {
        sendResponse(['error' => $e->getMessage()], 500);
    }
}
?>
