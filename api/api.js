const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');

function jsonResponse(res, status, data) {
  res.setHeader('Content-Type', 'application/json; charset=UTF-8');
  res.statusCode = status;
  res.end(JSON.stringify(data));
}

const baseDir = process.env.DATA_DIR || (process.env.VERCEL ? path.resolve('/tmp', 'mardicard-data') : path.resolve(process.cwd(), 'data'));
const messagesPath = path.resolve(baseDir, 'messages.json');
const rsvpPath = path.resolve(baseDir, 'rsvp.json');

async function ensureDir(p) {
  await fsp.mkdir(path.dirname(p), { recursive: true }).catch(() => {});
}

async function readJSON(p, fallback) {
  try {
    const buf = await fsp.readFile(p);
    const data = JSON.parse(buf.toString('utf8'));
    return data ?? fallback;
  } catch (e) {
    return fallback;
  }
}

async function writeJSON(p, data) {
  try {
    await ensureDir(p);
    const tmp = p + '.tmp';
    await fsp.writeFile(tmp, JSON.stringify(data, null, 2), 'utf8');
    await fsp.rename(tmp, p);
    return true;
  } catch (e) {
    // Likely running on Vercel with read-only FS
    return { error: e.message || String(e) };
  }
}

async function handleGet(req, res) {
  const messages = await readJSON(messagesPath, []);
  const rsvp = await readJSON(rsvpPath, { attend: 0, not_attend: 0, entries: [] });
  if (!Array.isArray(rsvp.entries)) rsvp.entries = [];
  jsonResponse(res, 200, { status: 'ok', messages, rsvp });
}

async function handlePost(req, res, body) {
  const action = body.action || '';

  if (action === 'message') {
    let name = (body.name || 'Anonymous').toString().trim();
    let message = (body.message || '').toString().trim();
    if (!message) return jsonResponse(res, 400, { status: 'error', message: 'Message is required' });
    if (name.length > 100) name = name.slice(0, 100);
    if (message.length > 1000) message = message.slice(0, 1000);

    const messages = await readJSON(messagesPath, []);
    const entry = { name: name || 'Anonymous', message, timestamp: new Date().toISOString() };
    messages.unshift(entry);
    const ok = await writeJSON(messagesPath, messages);
    if (ok !== true) return jsonResponse(res, 500, { status: 'error', message: 'Failed to save message', detail: ok });
    return jsonResponse(res, 200, { status: 'success', entry });
  }

  if (action === 'rsvp') {
    const type = (body.type || '').toString();
    if (!['attend', 'not_attend'].includes(type)) return jsonResponse(res, 400, { status: 'error', message: 'Invalid RSVP type' });
    let name = (body.name || 'Anonymous').toString().trim();
    if (name.length > 100) name = name.slice(0, 100);

    const rsvp = await readJSON(rsvpPath, { attend: 0, not_attend: 0, entries: [] });
    if (!Array.isArray(rsvp.entries)) rsvp.entries = [];
    rsvp[type] = (rsvp[type] || 0) + 1;
    const entry = { name: name || 'Anonymous', type, timestamp: new Date().toISOString() };
    rsvp.entries.unshift(entry);
    if (rsvp.entries.length > 1000) rsvp.entries = rsvp.entries.slice(0, 1000);
    const ok = await writeJSON(rsvpPath, rsvp);
    if (ok !== true) return jsonResponse(res, 500, { status: 'error', message: 'Failed to save RSVP', detail: ok });
    return jsonResponse(res, 200, { status: 'success', rsvp, entry });
  }

  if (action === 'clear_messages') {
    const ok = await writeJSON(messagesPath, []);
    if (ok !== true) return jsonResponse(res, 500, { status: 'error', message: 'Failed to clear messages', detail: ok });
    return jsonResponse(res, 200, { status: 'success', messages: [] });
  }

  if (action === 'clear_rsvp') {
    const empty = { attend: 0, not_attend: 0, entries: [] };
    const ok = await writeJSON(rsvpPath, empty);
    if (ok !== true) return jsonResponse(res, 500, { status: 'error', message: 'Failed to clear RSVP', detail: ok });
    return jsonResponse(res, 200, { status: 'success', rsvp: empty });
  }

  if (action === 'seed_demo') {
    const demoMessages = [
      { name: 'Ali', message: 'Tahniah! Semoga bahagia hingga ke Jannah.', timestamp: new Date(Date.now()-3600e3).toISOString() },
      { name: 'Siti', message: 'Selamat pengantin baru!', timestamp: new Date(Date.now()-1800e3).toISOString() },
      { name: 'Ravi', message: 'Congratulations and best wishes!', timestamp: new Date().toISOString() },
      { name: 'Mei', message: 'Semoga berkekalan hingga ke akhir hayat.', timestamp: new Date().toISOString() },
      { name: 'John', message: 'All the best on your special day!', timestamp: new Date().toISOString() },
    ];
    const demoRsvpEntries = [
      { name: 'Ammar', type: 'attend', timestamp: new Date(Date.now()-7200e3).toISOString() },
      { name: 'Farah', type: 'attend', timestamp: new Date(Date.now()-7000e3).toISOString() },
      { name: 'Hakim', type: 'not_attend', timestamp: new Date(Date.now()-6800e3).toISOString() },
      { name: 'Nina', type: 'attend', timestamp: new Date(Date.now()-6600e3).toISOString() },
      { name: 'Lily', type: 'not_attend', timestamp: new Date(Date.now()-6400e3).toISOString() },
      { name: 'Danish', type: 'attend', timestamp: new Date(Date.now()-6200e3).toISOString() },
      { name: 'Hafiz', type: 'attend', timestamp: new Date(Date.now()-6000e3).toISOString() },
      { name: 'Sara', type: 'attend', timestamp: new Date(Date.now()-5900e3).toISOString() },
      { name: 'Yuki', type: 'not_attend', timestamp: new Date(Date.now()-5800e3).toISOString() },
      { name: 'Ben', type: 'attend', timestamp: new Date(Date.now()-5700e3).toISOString() },
    ];
    const attendCount = demoRsvpEntries.filter(e => e.type === 'attend').length;
    const notAttendCount = demoRsvpEntries.filter(e => e.type === 'not_attend').length;
    const demoRsvp = { attend: attendCount, not_attend: notAttendCount, entries: demoRsvpEntries };

    const ok1 = await writeJSON(messagesPath, demoMessages);
    const ok2 = await writeJSON(rsvpPath, demoRsvp);
    if (ok1 !== true || ok2 !== true) return jsonResponse(res, 500, { status: 'error', message: 'Failed to seed', detail: { ok1, ok2 } });
    return jsonResponse(res, 200, { status: 'success', messages: demoMessages, rsvp: demoRsvp });
  }

  return jsonResponse(res, 400, { status: 'error', message: 'Invalid action' });
}

function parseBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const raw = Buffer.concat(chunks);
      const text = raw.toString('utf8');
      const ct = (req.headers['content-type'] || '').toLowerCase();
      if (ct.includes('application/json')) {
        try { resolve(JSON.parse(text)); } catch { resolve({}); }
        return;
      }
      if (ct.includes('application/x-www-form-urlencoded')) {
        const params = new URLSearchParams(text);
        resolve(Object.fromEntries(params.entries()));
        return;
      }
      // Fallback: try to coerce querystring-like bodies
      try {
        const params = new URLSearchParams(text);
        resolve(Object.fromEntries(params.entries()));
      } catch {
        resolve({});
      }
    });
  });
}

module.exports = async (req, res) => {
  if (req.method === 'GET') return handleGet(req, res);
  if (req.method === 'POST') {
    const body = await parseBody(req);
    return handlePost(req, res, body);
  }
  jsonResponse(res, 405, { status: 'error', message: 'Method not allowed' });
};

// Inline function config to avoid specifying runtime in vercel.json
module.exports.config = {
  maxDuration: 10
};
