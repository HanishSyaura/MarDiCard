<?php
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$file = __DIR__ . '/../data/rsvp.json';

if ($method !== 'POST') {
    echo json_encode(["attend" => 0, "not_attend" => 0]);
    exit;
}

$action = isset($_POST['action']) ? $_POST['action'] : "";

$data = json_decode(file_get_contents($file), true);

if ($action === "increment") {
    $type = isset($_POST['type']) ? $_POST['type'] : "";

    if ($type === "attend") {
        $data['attend'] += 1;
    } elseif ($type === "not_attend") {
        $data['not_attend'] += 1;
    } else {
        echo json_encode(["error" => "Invalid type"]);
        exit;
    }

    file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));
    echo json_encode($data);
    exit;
}

echo json_encode(["error" => "Invalid action"]);
?>
