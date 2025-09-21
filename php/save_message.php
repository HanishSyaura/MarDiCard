<?php
header('Content-Type: application/json');

$messagesFile = __DIR__ . '/../data/messages.json';
$data = json_decode(file_get_contents($messagesFile), true);

$name = $_POST['name'] ?? 'Anonymous';
$message = $_POST['message'] ?? '';

if (!$message) {
    echo json_encode(['status' => 'error', 'message' => 'Empty message']);
    exit;
}

// Add timestamp
$data[] = [
    'name' => htmlspecialchars($name),
    'message' => htmlspecialchars($message),
    'timestamp' => date('H:i')
];

// Save back
file_put_contents($messagesFile, json_encode($data));

echo json_encode(['status' => 'success']);
