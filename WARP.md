# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project overview
- Stack: Static HTML/CSS/JS with a php directory (currently containing a JavaScript file named api.php). No Node/PNPM, no build tooling, no test framework, and no linter configured.
- Entry point: index.html
- Assets: css/, images/, js/, music/
- Data storage: data/messages.json and data/rsvp.json (JSON files intended to hold guest messages and RSVP counters). There is no server code writing to these files in this repo.
- Demo (from README): https://kad-jemputan-kahwin.vercel.app/

Common commands (Windows PowerShell)
Use a local static server to avoid fetch/CORS issues when loading resources.

- Serve with PHP (recommended if PHP is installed)
  ```powershell
  php -S 127.0.0.1:8000 -t .
  ```
  Then open http://127.0.0.1:8000

- Serve with Python 3
  ```powershell
  python -m http.server 8000
  ```
  Then open http://127.0.0.1:8000

- Serve with Node (if Node.js is installed)
  ```powershell
  npx http-server -p 8000
  ```
  Then open http://127.0.0.1:8000

Notes on build/lint/tests
- There are no package manifests or config for build, lint, or testing. Consequently:
  - Build: not applicable
  - Lint: not applicable
  - Tests: not applicable

High-level architecture and behavior
- index.html organizes the entire single-page experience:
  - A full-screen overlay (.wrapper/.overlay) with two buttons (#toggle-content and #toggle-content1) that, when clicked, fade out the overlay, reveal the .card, and trigger audio playback (#audio-player).
  - The main .card contains sections:
    - .intro with a .slideshow of three slides (images and names)
    - .info with event details (location, date, time) and a countdown widget
    - .ucapan showing a prayer section and a message wall ("Ucapan")
    - .footer listing five icon buttons that toggle bottom menus (calendar, location, music, RSVP, contact)
    - Multiple bottom menus (#calendar-menu, #location-menu, #music-menu, #rsvp-menu, #contact-menu, #ucapan-menu, and an empty #success-menu used for confirmations)

- js/main.js drives all interactive behavior:
  - Overlay behavior: fades out the intro overlay and starts audio playback when a button is clicked.
  - Butterfly decoration: randomizes position/size and re-randomizes on animation iterations.
  - Countdown: setupCountdown(selector, startMillis, endMillis) updates day/hour/minute/second displays under .campaign-0.
  - Calendar integration:
    - addGoogleCalendar(): opens a pre-filled Google Calendar template URL.
    - addAppleCalendar(): generates and downloads an ICS file based on an event object.
  - Location shortcuts: openGoogleMaps() and openWaze() open navigation to specified coordinates.
  - Contact shortcuts: openWhatsApp(phone) opens a prefilled message; makePhoneCall(phone) triggers tel: link.
  - Background effect: generates animated “petals” inside .petal-container with capped element count.
  - Bottom menu system: maps button IDs to menu IDs, provides open/close logic, closes on outside click, and supports a close button inside #ucapan-menu.
  - Message wall ("Ucapan"):
    - fetchMessages(): attempts GET fetch('php/api.php') and expects JSON { messages: [...] } to render message cards.
    - On form submit, POSTs to 'php/api.php' and, on success, prepends the message to the list and closes the menu.
    - Note: This repository does not contain a working server endpoint that returns/accepts JSON; see “Backend/API notes” below.
  - RSVP buttons: POST to 'php/api.php' to increment counters and open #success-menu with a response.
  - Image slideshow: cycles through slides, animating image and names in sequence.

- data/
  - messages.json: stores an array of messages (currently empty: [])
  - rsvp.json: tracks counters { "attend": 0, "not_attend": 0 }

- php/
  - api.php: Despite the .php extension, this file currently contains JavaScript that duplicates some front-end behaviors (message fetch/append, RSVP POST). It is not a PHP backend.

Backend/API notes (important for development)
- The front end expects a JSON API at 'php/api.php' for two actions:
  - GET: returns { messages: [...] } to populate the message wall
  - POST: handles two types of actions
    - action=message (or add_message): append a new message
    - action=rsvp (or increment_rsvp): update RSVP counters
- In this repository, php/api.php contains JavaScript, not server-side code. As a result:
  - Fetch requests to 'php/api.php' will return a static file and JSON parsing will fail.
  - The RSVP/message features cannot function without implementing a backend or stubbing responses.

Practical development guidance for Warp in this repo
- For UI/animation/layout work: run a static server (see Commands above), navigate to the page, and ignore API-related errors.
- If you need API functionality locally, you have two options:
  1) Implement a minimal backend that reads/writes data/messages.json and data/rsvp.json and responds with JSON at 'php/api.php'.
  2) Temporarily stub fetch calls in js/main.js to return mock JSON in development.

Key details from README.md
- Provides a live demo URL and preview images.

Troubleshooting
- Opening index.html via file:// will break fetch calls and may block audio autoplay. Always use a local server.
- Countdown end time uses new Date("2025-12-20T10:30:00") which is interpreted in the browser’s local time zone.
