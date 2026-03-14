<?php
// routes/upload.php
require_once __DIR__ . '/../config.php';

function handleUpload() {
    if (!isset($_FILES['file'])) {
        sendResponse(['error' => 'No file uploaded'], 400);
    }

    $file = $_FILES['file'];
    $uploadsDir = __DIR__ . '/../../server/uploads/'; // Keep compatible with existing uploads folder
    if (!is_dir($uploadsDir)) {
        mkdir($uploadsDir, 0777, true);
    }

    $filename = time() . '-' . rand(1000, 9999) . '-' . basename($file['name']);
    $targetPath = $uploadsDir . $filename;

    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        // Return relative path consistent with Node.js
        sendResponse([
            'url' => '/uploads/' . $filename,
            'filename' => $filename
        ]);
    } else {
        sendResponse(['error' => 'Failed to move uploaded file'], 500);
    }
}
?>
