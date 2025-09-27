<?php
// Simple JSON-backed API for messages and RSVP
// GET: returns { status, messages, rsvp }
// POST actions:
//   - action=message, name, message
//   - action=rsvp, type in {attend, not_attend}

header('Content-Type: application/json; charset=UTF-8');

$messagesPath = __DIR__ . '/../data/messages.json';
$rsvpPath     = __DIR__ . '/../data/rsvp.json';

function read_json($path, $default) {
    if (!file_exists($path)) {
        return $default;
    }
    $fp = fopen($path, 'r');
    if (!$fp) return $default;
    try {
        flock($fp, LOCK_SH);
        $contents = stream_get_contents($fp);
        flock($fp, LOCK_UN);
    } finally {
        fclose($fp);
    }
    $data = json_decode($contents, true);
    return is_array($data) ? $data : $default;
}

function write_json($path, $data) {
    $dir = dirname($path);
    if (!is_dir($dir)) {
        mkdir($dir, 0777, true);
    }
    $tmp = $path . '.tmp';
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    $fp = fopen($tmp, 'w');
    if (!$fp) return false;
    try {
        if (!flock($fp, LOCK_EX)) return false;
        fwrite($fp, $json);
        fflush($fp);
        flock($fp, LOCK_UN);
    } finally {
        fclose($fp);
    }
    // atomic replace on most systems
    return rename($tmp, $path);
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $messages = read_json($messagesPath, []);
    $rsvp = read_json($rsvpPath, ['attend' => 0, 'not_attend' => 0, 'entries' => []]);
    if (!isset($rsvp['entries']) || !is_array($rsvp['entries'])) $rsvp['entries'] = [];
    echo json_encode([
        'status'   => 'ok',
        'messages' => $messages,
        'rsvp'     => $rsvp,
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($method === 'POST') {
    $action = $_POST['action'] ?? '';

    if ($action === 'message') {
        $name = trim($_POST['name'] ?? 'Anonymous');
        $message = trim($_POST['message'] ?? '');

        if ($message === '') {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Message is required']);
            exit;
        }

        // Limit lengths
        if (mb_strlen($name) > 100) {
            $name = mb_substr($name, 0, 100);
        }
        if (mb_strlen($message) > 1000) {
            $message = mb_substr($message, 0, 1000);
        }

        $messages = read_json($messagesPath, []);
        $entry = [
            'name'      => $name ?: 'Anonymous',
            'message'   => $message,
            'timestamp' => date('c'),
        ];
        // Prepend newest first
        array_unshift($messages, $entry);

        if (!write_json($messagesPath, $messages)) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Failed to save message']);
            exit;
        }

        echo json_encode(['status' => 'success', 'message' => 'Message saved', 'entry' => $entry], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($action === 'rsvp') {
        $type = $_POST['type'] ?? '';
        if (!in_array($type, ['attend', 'not_attend'], true)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Invalid RSVP type']);
            exit;
        }
        $name = trim($_POST['name'] ?? 'Anonymous');
        if (mb_strlen($name) > 100) $name = mb_substr($name, 0, 100);

        $rsvp = read_json($rsvpPath, ['attend' => 0, 'not_attend' => 0, 'entries' => []]);
        // Ensure structure
        if (!isset($rsvp['attend'])) $rsvp['attend'] = (int)($rsvp['attend'] ?? 0);
        if (!isset($rsvp['not_attend'])) $rsvp['not_attend'] = (int)($rsvp['not_attend'] ?? 0);
        if (!isset($rsvp['entries']) || !is_array($rsvp['entries'])) $rsvp['entries'] = [];

        $rsvp[$type] = (int)($rsvp[$type] ?? 0) + 1;

        $entry = [
            'name' => $name ?: 'Anonymous',
            'type' => $type,
            'timestamp' => date('c'),
        ];
        // Prepend newest first
        array_unshift($rsvp['entries'], $entry);
        // Cap the entries list to avoid unbounded growth (keep last 1000)
        if (count($rsvp['entries']) > 1000) {
            $rsvp['entries'] = array_slice($rsvp['entries'], 0, 1000);
        }

        if (!write_json($rsvpPath, $rsvp)) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Failed to save RSVP']);
            exit;
        }
        echo json_encode(['status' => 'success', 'rsvp' => $rsvp, 'entry' => $entry]);
        exit;
    }

    if ($action === 'clear_messages') {
        if (!write_json($messagesPath, [])) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Failed to clear messages']);
            exit;
        }
        echo json_encode(['status' => 'success', 'messages' => []]);
        exit;
    }

    if ($action === 'clear_rsvp') {
        $empty = ['attend' => 0, 'not_attend' => 0, 'entries' => []];
        if (!write_json($rsvpPath, $empty)) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Failed to clear RSVP']);
            exit;
        }
        echo json_encode(['status' => 'success', 'rsvp' => $empty]);
        exit;
    }

    if ($action === 'seed_demo') {
        $demoMessages = [
            ['name' => 'Ali', 'message' => 'Tahniah! Semoga bahagia hingga ke Jannah.', 'timestamp' => date('c', time()-3600)],
            ['name' => 'Siti', 'message' => 'Selamat pengantin baru!', 'timestamp' => date('c', time()-1800)],
            ['name' => 'Ravi', 'message' => 'Congratulations and best wishes!', 'timestamp' => date('c')],
            ['name' => 'Mei', 'message' => 'Semoga berkekalan hingga ke akhir hayat.', 'timestamp' => date('c')],
            ['name' => 'John', 'message' => 'All the best on your special day!', 'timestamp' => date('c')],
        ];
        $demoRsvpEntries = [
            ['name' => 'Ammar', 'type' => 'attend', 'timestamp' => date('c', time()-7200)],
            ['name' => 'Farah', 'type' => 'attend', 'timestamp' => date('c', time()-7000)],
            ['name' => 'Hakim', 'type' => 'not_attend', 'timestamp' => date('c', time()-6800)],
            ['name' => 'Nina', 'type' => 'attend', 'timestamp' => date('c', time()-6600)],
            ['name' => 'Lily', 'type' => 'not_attend', 'timestamp' => date('c', time()-6400)],
            ['name' => 'Danish', 'type' => 'attend', 'timestamp' => date('c', time()-6200)],
            ['name' => 'Hafiz', 'type' => 'attend', 'timestamp' => date('c', time()-6000)],
            ['name' => 'Sara', 'type' => 'attend', 'timestamp' => date('c', time()-5900)],
            ['name' => 'Yuki', 'type' => 'not_attend', 'timestamp' => date('c', time()-5800)],
            ['name' => 'Ben', 'type' => 'attend', 'timestamp' => date('c', time()-5700)],
        ];
        $attendCount = 0; $notAttendCount = 0;
        foreach ($demoRsvpEntries as $e) { if ($e['type'] === 'attend') $attendCount++; else $notAttendCount++; }
        $demoRsvp = ['attend' => $attendCount, 'not_attend' => $notAttendCount, 'entries' => $demoRsvpEntries];

        if (!write_json($messagesPath, $demoMessages)) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Failed to seed messages']);
            exit;
        }
        if (!write_json($rsvpPath, $demoRsvp)) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Failed to seed RSVP']);
            exit;
        }
        echo json_encode(['status' => 'success', 'messages' => $demoMessages, 'rsvp' => $demoRsvp]);
        exit;
    }

    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid action']);
    exit;
}

http_response_code(405);
echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
