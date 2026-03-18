<?php
// routes/paystack.php
require_once __DIR__ . '/../config.php';

function handlePaystackInit() {
    global $pdo;
    $input = getJsonInput();
    
    $email = $input['email'] ?? '';
    $amount = $input['amount'] ?? '';
    $booking_id = $input['booking_id'] ?? '';
    $callback_url = $input['callback_url'] ?? '';

    if (empty($email) || empty($amount) || empty($booking_id)) {
        sendResponse(['error' => 'Missing required fields'], 400);
    }

    $url = "https://api.paystack.co/transaction/initialize";
    $fields = [
        'email' => $email,
        'amount' => $amount,
        'currency' => 'GHS',
        'callback_url' => $callback_url,
        'metadata' => [
            'booking_id' => $booking_id,
            'custom_fields' => [
                ['display_name' => "Booking ID", 'variable_name' => "booking_id", 'value' => $booking_id]
            ]
        ]
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($fields));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer " . PAYSTACK_SECRET_KEY,
        "Cache-Control: no-cache",
        "Content-Type: application/json"
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $result = curl_exec($ch);
    $data = json_decode($result, true);
    $err = curl_error($ch);
    curl_close($ch);

    if ($err) {
        sendResponse(['error' => "CURL Error: " . $err], 500);
    }

    if (!$data || !isset($data['status']) || !$data['status']) {
        sendResponse(['error' => 'Paystack initialization failed: ' . json_encode($data)], 500);
    }

    try {
        $stmt = $pdo->prepare("UPDATE bookings SET paystack_reference = ? WHERE id = ?");
        $stmt->execute([$data['data']['reference'], $booking_id]);
        
        sendResponse([
            'authorization_url' => $data['data']['authorization_url'],
            'reference' => $data['data']['reference']
        ]);
    } catch (PDOException $e) {
        sendResponse(['error' => $e->getMessage()], 500);
    }
}

function handlePaystackVerify() {
    global $pdo;
    $input = getJsonInput();
    $reference = $input['reference'] ?? '';

    if (empty($reference)) {
        sendResponse(['error' => 'Missing reference'], 400);
    }

    $url = "https://api.paystack.co/transaction/verify/" . rawurlencode($reference);

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer " . PAYSTACK_SECRET_KEY,
        "Cache-Control: no-cache"
    ]);
    
    $result = curl_exec($ch);
    $data = json_decode($result, true);
    $err = curl_error($ch);
    curl_close($ch);

    if ($err) {
        sendResponse(['error' => "CURL Error: " . $err], 500);
    }

    if (!$data || !isset($data['status']) || !$data['status']) {
        sendResponse(['error' => 'Paystack verification failed: ' . json_encode($data)], 500);
    }

    $transaction = $data['data'];
    $bookingId = $transaction['metadata']['booking_id'] ?? null;

    if ($transaction['status'] === "success" && $bookingId) {
        try {
            $stmt = $pdo->prepare("UPDATE bookings SET status = 'paid', paystack_reference = ? WHERE id = ?");
            $stmt->execute([$reference, $bookingId]);
            sendResponse(['status' => 'success', 'booking_id' => $bookingId]);
        } catch (PDOException $e) {
            sendResponse(['error' => $e->getMessage()], 500);
        }
    }

    sendResponse(['status' => $transaction['status'], 'message' => 'Payment not successful']);
}
?>
