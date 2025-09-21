<?php
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$file = __DIR__ . '/../data/messages.json';

if ($method === 'GET') {
    // Baca semua ucapan
    $data = file_get_contents($file);
    echo json_encode(["messages" => json_decode($data)]);
    exit;
}

if ($method === 'POST') {
    $name = isset($_POST['name']) ? trim($_POST['name']) : "Anonymous";
    $message = isset($_POST['message']) ? trim($_POST['message']) : "";

    if ($message === "") {
        echo json_encode(["status" => "error", "message" => "Ucapan kosong"]);
        exit;
    }

    $data = json_decode(file_get_contents($file), true);

    $newMessage = [
        "name" => $name,
        "message" => $message,
        "timestamp" => date("Y-m-d H:i")
    ];

    array_unshift($data, $newMessage); // letak newest first

    file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));

    echo json_encode(["status" => "success"]);
    exit;
}
?>
