/*============================================================================================
    # Wrapper Overlay
============================================================================================*/
// document.getElementById("toggle-content").addEventListener("click", function () {
//     // Hide the overlay
//     const overlay = document.getElementById("overlay");
//     overlay.style.display = "none";

    // Play the audio
//    const audioPlayer = document.getElementById("audio-player");
//    audioPlayer.play();  // Start playing the audio
// });

let autoScrollRafId = null;
let autoScrollPausedUntil = 0;
function pauseAutoScroll(ms=3000){ autoScrollPausedUntil = performance.now() + ms; }
['wheel','touchstart','touchmove','keydown'].forEach(evt=>{
  window.addEventListener(evt, ()=>pauseAutoScroll(3000), {passive:true});
});

function startAutoScroll(){
    if (autoScrollRafId) { cancelAnimationFrame(autoScrollRafId); autoScrollRafId = null; }
    const speedPxPerSec = 33; // previous speed (~33 px/s)
    let lastTs = null;
    const step = (ts)=>{
        if (lastTs == null) lastTs = ts;
        const atBottom = (window.innerHeight + window.scrollY) >= document.body.scrollHeight - 1;
        if (atBottom) { revealFooterIfBottom(); autoScrollRafId = null; return; }
        if (ts >= autoScrollPausedUntil) {
            const dt = Math.min(100, ts - lastTs); // cap dt to avoid jumps
            const dy = (speedPxPerSec * dt) / 1000;
            window.scrollTo({ top: window.scrollY + dy, left: 0, behavior: 'auto' });
        }
        lastTs = ts;
        autoScrollRafId = requestAnimationFrame(step);
    };
    autoScrollRafId = requestAnimationFrame(step);
}

document.getElementById("toggle-content").addEventListener("click", function () {
    var wrapper = document.querySelector(".wrapper");
    var card = document.querySelector(".card");

    wrapper.classList.add("hidden");

    wrapper.addEventListener("transitionend", function () {
        wrapper.style.display = "none";
        card.style.display = "block";
        // Start slideshow now that the overlay is gone; auto-scroll when slideshow finishes
        startSlideshow(() => setTimeout(startAutoScroll, 400));
    }, { once: true });

    const audioPlayer = document.getElementById("audio-player");
    audioPlayer.play();
});

document.getElementById("toggle-content1").addEventListener("click", function () {
    var wrapper = document.querySelector(".wrapper");
    var card = document.querySelector(".card");

    wrapper.classList.add("hidden");

    wrapper.addEventListener("transitionend", function () {
        wrapper.style.display = "none";
        card.style.display = "block";
        // Start slideshow now that the overlay is gone; auto-scroll when slideshow finishes
        startSlideshow(() => setTimeout(startAutoScroll, 400));
    }, { once: true });

    const audioPlayer = document.getElementById("audio-player");
    audioPlayer.play();
});

function randomizeButterflies() {
  document.querySelectorAll('.butterfly').forEach(bf => {
    // random vertical position: anywhere 0–90vh
    const randTop = Math.floor(Math.random() * 90) + 5; 
    bf.style.top = randTop + "vh";

    // random size: kecil-besar
    const randSize = Math.floor(Math.random() * 40) + 30; // 30px – 70px
    bf.style.width = randSize + "px";
  });
}

// run at start
randomizeButterflies();

// re-random setiap kali animation habis
document.querySelectorAll('.butterfly').forEach(bf => {
  bf.addEventListener("animationiteration", () => {
    const randTop = Math.floor(Math.random() * 90) + 5; 
    bf.style.top = randTop + "vh";
    const randSize = Math.floor(Math.random() * 40) + 30;
    bf.style.width = randSize + "px";
  });
});








/** =====================================================
 *  Timer Countdown
  ======================================================= */

function setupCountdown(campaignSelector, startTimeMillis, endTimeMillis) {
    var second = 1000;
    var minute = second * 60;
    var hour = minute * 60;
    var day = hour * 24;

    function calculateRemaining() {
        var now = new Date().getTime();
        return now >= startTimeMillis && now < endTimeMillis ? endTimeMillis - now : 0;
    }

    var didRefresh = false;
    var previousGap = calculateRemaining();

    function countdown() {
        var gap = calculateRemaining();
        var shouldRefresh = previousGap > day && gap <= day || previousGap > 0 && gap === 0;

        previousGap = gap;

        var textDay = Math.floor(gap / day);
        var textHour = Math.floor((gap % day) / hour);
        var textMinute = Math.floor((gap % hour) / minute);
        var textSecond = Math.floor((gap % minute) / second);

        if (document.querySelector(campaignSelector + ' .timer')) {
            document.querySelector(campaignSelector + ' .day').innerText = textDay;
            document.querySelector(campaignSelector + ' .hour').innerText = textHour;
            document.querySelector(campaignSelector + ' .minute').innerText = textMinute;
            document.querySelector(campaignSelector + ' .second').innerText = textSecond;
        }

        if (shouldRefresh && !didRefresh) {
            didRefresh = true;
            setTimeout(function () {
                window.location.reload();
            }, 30000 + Math.random() * 90000);
        }
    }

    countdown();
    setInterval(countdown, 1000);
}

document.addEventListener("DOMContentLoaded", function (event) {
    if (!document.querySelectorAll || !document.body.classList) {
        return;
    }

});

setupCountdown(
  ".campaign-0",
  Date.now(), // start kira dari sekarang
  new Date("2025-12-20T10:30:00").getTime() // tarikh & masa majlis
);





/** =====================================================
 *  Add to Calendar
  ======================================================= */
const event = {
    title: "Jemputan Kenduri Kahwin John & Sarah",
    startDate: "99991231T033000Z", // YYYYMMDDTHHmmssZ (UTC)
    endDate: "99991231T090000Z",
    location: "10A Jalan Seri Ampang 2, Kampung Pisang, 47300 Subang, Selangor, Malaysia",
    description: "Kami menjemput tuan/puan hadir ke majlis perkahwinan anakanda kami.",
};

// Function to generate Google Calendar URL
function generateGoogleCalendarLink(event) {
    const { title, startDate, endDate, location, description } = event;

    const baseUrl = "https://calendar.google.com/calendar/render?action=TEMPLATE";
    const params = new URLSearchParams({
        text: title,
        dates: `${startDate}/${endDate}`,
        details: description,
        location: location,
    });

    return `${baseUrl}&${params.toString()}`;
}

// Function to generate ICS file content
function generateICS(event) {
    const { title, startDate, endDate, location, description } = event;

    return `
        BEGIN:VCALENDAR
        VERSION:2.0
        BEGIN:VEVENT
        SUMMARY:${title}
        DTSTART:${startDate}
        DTEND:${endDate}
        LOCATION:${location}
        DESCRIPTION:${description}
        END:VEVENT
        END:VCALENDAR
    `.trim();
}

// Function to download an ICS file
function downloadICS(filename, content) {
    const blob = new Blob([content], { type: "text/calendar" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Handler for Google Calendar button
function addGoogleCalendar() {
    const googleLink = generateGoogleCalendarLink(event);
    window.open(googleLink, "_blank");
}

// Handler for Apple Calendar button
function addAppleCalendar() {
    const icsContent = generateICS(event);
    downloadICS("event.ics", icsContent);
}





/** =====================================================
 *  Location for Google and Waze
  ======================================================= */
function openGoogleMaps() {
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=Current+Location&destination=1.542054,103.7045034&travelmode=driving`;

    window.open(googleMapsUrl, "_blank");  // Open in a new tab
}

function openWaze() {
    const wazeUrl = `https://waze.com/ul?ll=1.542054,103.7045034&navigate=yes`;

    window.open(wazeUrl, "_blank");  // Open in a new tab
}





/** =====================================================
    Contact
  ======================================================= */
function openWhatsApp(phoneNumber) {
    const message = "Salam. Saya ingin bertanyakan sesuatu berkenaan majlis perkahwinan ini Waie Hamka dan Hanish Syaura.";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");  // Opens WhatsApp in a new tab
}

function makePhoneCall(phoneNumber) {
    const callUrl = `tel:${phoneNumber}`;
    window.location.href = callUrl;  // Opens the phone dialer
}







/** =====================================================
 *  Animation
  ======================================================= */
function reveal() {
    var reveals = document.querySelectorAll(".reveal");

    for (var i = 0; i < reveals.length; i++) {
        var windowHeight = window.innerHeight;
        var elementTop = reveals[i].getBoundingClientRect().top;
        var elementVisible = 10;

        if (elementTop < windowHeight - elementVisible) {
            reveals[i].classList.add("active");
        } else {
            reveals[i].classList.remove("active");
        }
    }
}

window.addEventListener("scroll", reveal);





/** =====================================================
 *  Background Animation
  ======================================================= */
const petalContainer = document.querySelector('.petal-container');

const maxPetals = 70; // Maximum number of petals allowed at once
const petalInterval = 100; // Interval for creating petals (100 milliseconds)

function createPetal() {
    if (petalContainer.childElementCount < maxPetals) {
        const petal = document.createElement('div');
        petal.className = 'petal';

        const startY = Math.random() * 100; // Randomized vertical start position
        const duration = 4 + Math.random() * 2; // Randomized animation duration (4 to 6 seconds)

        const petalSize = 5 + Math.random() * 10; // Random size between 5px and 20px

        // Randomize the opacity between 0.3 and 0.8 for varied transparency
        const petalOpacity = 0.3 + Math.random() * 0.5; // Randomized opacity

        petal.style.top = `${startY}%`; // Randomized starting vertical position
        petal.style.width = `${petalSize}px`;
        petal.style.height = `${petalSize}px`;
        petal.style.opacity = petalOpacity; // Set the random opacity
        petal.style.animationDuration = `${duration}s`; // Randomized animation duration

        // Randomize the final translation for X and Y for varied movement
        const translateX = 300 + Math.random() * 120; // TranslateX with some randomness
        const translateY = 300 + Math.random() * 120; // TranslateY with some randomness

        petal.style.setProperty('--translate-x', `${translateX}px`); // Set variable for translation X
        petal.style.setProperty('--translate-y', `${translateY}px`); // Set variable for translation Y

        petalContainer.appendChild(petal);

        // Ensure the petal is removed only after the animation completes
        setTimeout(() => {
            petalContainer.removeChild(petal);
        }, duration * 1000); // Convert duration to milliseconds
    }
}

// Create petals at a shorter interval with the defined interval time
setInterval(createPetal, petalInterval); // Create petals every 100 milliseconds




/** =====================================================
 *  Toggle Menu
  ======================================================= */
// ================================== Calendar ==================================
// Get all buttons and their corresponding menus
const toggleButtons = {
    'calendar-btn': 'calendar-menu',
    'location-btn': 'location-menu',
    'music-btn': 'music-menu',
    'rsvp-btn': 'rsvp-menu',
    'ucapan-btn': 'ucapan-menu',
    'contact-btn': 'contact-menu',
    'admin-btn': 'admin-menu',
    'kehadiran-btn': 'rsvp-menu'
    // Success menu will be opened programmatically after RSVP succeeds
};

// Function to toggle a menu open/close
function toggleMenu(menuId, event) {
    event.stopPropagation(); // Prevent click from propagating
    const menu = document.getElementById(menuId);

    if (menu.classList.contains('open')) {
        menu.classList.remove('open'); // Close the menu
    } else {
        // Close all other menus first
        closeAllMenus();
        menu.classList.add('open'); // Open the menu
    }
}

// Function to close all menus
function closeAllMenus() {
    for (const menuId of Object.values(toggleButtons)) {
        const menu = document.getElementById(menuId);
        if (menu.classList.contains('open')) {
            menu.classList.remove('open'); // Close the menu
        }
    }
}

// Add click event listeners to all toggle buttons
for (const [buttonId, menuId] of Object.entries(toggleButtons)) {
    const button = document.getElementById(buttonId);
    if (button) button.addEventListener('click', (event) => toggleMenu(menuId, event));
}

// Add a global click handler to close all menus when clicking outside
document.addEventListener('click', () => closeAllMenus());

// Prevent clicks within menus from closing them
for (const menuId of Object.values(toggleButtons)) {
    const menu = document.getElementById(menuId);
    if (menu) menu.addEventListener('click', (event) => event.stopPropagation());
}

// Function to close a specific menu
function closeMenu(menuId) {
    const menu = document.getElementById(menuId);
    if (menu.classList.contains('open')) {
        menu.classList.remove('open'); // Close the menu
    }
}

// Add event listener for the close button inside the ucapan menu
const closeButton = document.querySelector('#ucapan-menu .tutup');
if (closeButton) {
    closeButton.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent this from propagating and triggering other closures
        closeMenu('ucapan-menu'); // Close the specific menu
    });
}

// Function to open RSVP
const kehadiranBtn = document.getElementById("kehadiran-btn");





const formUcapan = document.getElementById("form-ucapan");
const messagesContainer = document.getElementById("messagesContainer");

function appendMessage(name, message, timestamp){
    const card = document.createElement("div");
    card.classList.add("message-card");

    const header = document.createElement("div");
    header.classList.add("message-header");

    const strong = document.createElement("strong");
    strong.textContent = name;

    const ts = document.createElement("span");
    ts.classList.add("timestamp");
    // Show local time if ISO provided
    try {
        const d = new Date(timestamp);
        ts.textContent = isNaN(d.getTime()) ? String(timestamp || "") : d.toLocaleString();
    } catch (_) {
        ts.textContent = String(timestamp || "");
    }

    header.appendChild(strong);
    header.appendChild(document.createTextNode(" "));
    header.appendChild(ts);

    const p = document.createElement("p");
    p.textContent = message; // safe text insertion

    card.appendChild(header);
    card.appendChild(p);

    messagesContainer.prepend(card);
}

function updateRSVPCounts(attend, not_attend){
    const a = document.getElementById("rsvp-attend-count");
    const n = document.getElementById("rsvp-not-attend-count");
    if (a) a.textContent = String(attend ?? 0);
    if (n) n.textContent = String(not_attend ?? 0);
}

let allMessages = [];
let messagesPage = 1;
const messagesPageSize = 10;
const messagesPrevBtn = document.getElementById('messagesPrev');
const messagesNextBtn = document.getElementById('messagesNext');
const messagesPageInfo = document.getElementById('messagesPageInfo');

// RSVP pagination state
let rsvpEntries = [];
let rsvpPage = 1;
const rsvpPageSize = 10;
const rsvpPrevBtn = document.getElementById('rsvpPrev');
const rsvpNextBtn = document.getElementById('rsvpNext');
const rsvpPageInfo = document.getElementById('rsvpPageInfo');
const rsvpListEl = document.getElementById('rsvpList');

function renderRsvpPage(page){
    if (!rsvpListEl) return;
    const totalPages = Math.max(1, Math.ceil(rsvpEntries.length / rsvpPageSize));
    rsvpPage = Math.min(Math.max(1, page), totalPages);
    rsvpListEl.innerHTML = '';
    const start = (rsvpPage - 1) * rsvpPageSize;
    const end = start + rsvpPageSize;
    rsvpEntries.slice(start, end).forEach(item => {
        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.justifyContent = 'space-between';
        li.style.padding = '6px 8px';
        li.style.background = 'rgba(255,255,255,0.2)';
        li.style.borderRadius = '6px';
        li.style.marginBottom = '6px';
        const left = document.createElement('span');
        left.textContent = item.name || 'Anonymous';
        const right = document.createElement('span');
        right.textContent = (item.type === 'attend' ? 'Hadir' : 'Tidak Hadir');
        right.style.fontWeight = '700';
        right.style.color = item.type === 'attend' ? 'lightgreen' : '#ffd1d1';
        li.appendChild(left);
        li.appendChild(right);
        rsvpListEl.appendChild(li);
    });
    if (rsvpPageInfo) rsvpPageInfo.textContent = `Halaman ${rsvpPage}/${totalPages}`;
    if (rsvpPrevBtn) rsvpPrevBtn.disabled = rsvpPage <= 1;
    if (rsvpNextBtn) rsvpNextBtn.disabled = rsvpPage >= totalPages;
}

if (rsvpPrevBtn) rsvpPrevBtn.addEventListener('click', ()=>renderRsvpPage(rsvpPage-1));
if (rsvpNextBtn) rsvpNextBtn.addEventListener('click', ()=>renderRsvpPage(rsvpPage+1));

function renderMessagesPage(page){
    const totalPages = Math.max(1, Math.ceil(allMessages.length / messagesPageSize));
    messagesPage = Math.min(Math.max(1, page), totalPages);
    messagesContainer.innerHTML = "";
    const start = (messagesPage - 1) * messagesPageSize;
    const end = start + messagesPageSize;
    allMessages.slice(start, end).forEach(m => appendMessage(m.name, m.message, m.timestamp));
    if (messagesPageInfo) messagesPageInfo.textContent = `Halaman ${messagesPage}/${totalPages}`;
    if (messagesPrevBtn) messagesPrevBtn.disabled = messagesPage <= 1;
    if (messagesNextBtn) messagesNextBtn.disabled = messagesPage >= totalPages;
}

if (messagesPrevBtn) messagesPrevBtn.addEventListener('click', ()=>renderMessagesPage(messagesPage-1));
if (messagesNextBtn) messagesNextBtn.addEventListener('click', ()=>renderMessagesPage(messagesPage+1));

function fetchMessages(){
    fetch('/api/api')
        .then(res=>res.json())
        .then(data=>{
            if (data && Array.isArray(data.messages)) {
                allMessages = data.messages;
                renderMessagesPage(messagesPage);
            }
            if (data && data.rsvp) {
                updateRSVPCounts(data.rsvp.attend, data.rsvp.not_attend);
                if (Array.isArray(data.rsvp.entries)) {
                    rsvpEntries = data.rsvp.entries;
                    renderRsvpPage(rsvpPage);
                }
            }
        })
        .catch(err=>console.error(err));
}



formUcapan.addEventListener("submit", function(e){
    e.preventDefault();
    const name = (formUcapan.querySelector("input[name='name']").value || "Anonymous").trim();
    const message = formUcapan.querySelector("textarea[name='message']").value.trim();
    if (!message) { alert("Sila masukkan ucapan!"); return; }

    const formData = new FormData();
    formData.append("action","message");
    formData.append("name", name);
    formData.append("message", message);

    fetch('/api/api', {method:'POST', body: formData})
        .then(res=>res.json())
        .then(data=>{
            if (data.status==="success"){
                // Prepend to in-memory list and jump to first page
                allMessages.unshift({name, message, timestamp: data.entry?.timestamp || new Date().toISOString()});
                formUcapan.reset();
                closeMenu("ucapan-menu");
                renderMessagesPage(1);
            } else alert(data.message || "Gagal hantar ucapan");
        })
        .catch(err=>console.error(err));
});

function initAfterDom(){
    // Hide footer until bottom
    const footer = document.querySelector('.footer');
    if (footer) { footer.classList.add('hidden'); footer.classList.remove('visible'); }

    // Admin panel toggle via ?admin=1
    const isAdmin = new URLSearchParams(location.search).get('admin') === '1';
    const adminBtn = document.getElementById('admin-btn');
    if (isAdmin && adminBtn) adminBtn.style.display = '';

    // Wire admin actions
    const adminPost = (action)=> fetch('/api/api', { method:'POST', body: (()=>{const fd=new FormData(); fd.append('action', action); return fd;})() }).then(async r=>{ const t = await r.text(); try { return JSON.parse(t); } catch { throw new Error('Bad JSON: '+t); } });
    const btnClearMessages = document.getElementById('btnClearMessages');
    const btnClearRsvp = document.getElementById('btnClearRsvp');
    const btnSeedDemo = document.getElementById('btnSeedDemo');
    const showToast = (msg)=>{
        let el = document.createElement('div');
        el.className = 'toast';
        el.textContent = msg;
        document.body.appendChild(el);
        setTimeout(()=>{ el.style.opacity = '0'; setTimeout(()=>el.remove(), 300); }, 1500);
    };
    const withBusy = async (btn, fn) => { if (!btn) return; const orig = btn.textContent; btn.disabled = true; btn.classList.add('loading'); try { await fn(); } catch(e){ console.error(e); showToast('Operation failed'); } finally { btn.disabled = false; btn.classList.remove('loading'); btn.textContent = orig; } };

    if (btnClearMessages) btnClearMessages.addEventListener('click', ()=>withBusy(btnClearMessages, async ()=>{
        const data = await adminPost('clear_messages');
        allMessages = [];
        renderMessagesPage(1);
        showToast('Ucapan cleared');
        // final sync
        await fetchMessages();
    }));

    if (btnClearRsvp) btnClearRsvp.addEventListener('click', ()=>withBusy(btnClearRsvp, async ()=>{
        const data = await adminPost('clear_rsvp');
        updateRSVPCounts(0,0);
        rsvpEntries = [];
        renderRsvpPage(1);
        showToast('RSVP cleared');
        // final sync
        await fetchMessages();
    }));

    if (btnSeedDemo) btnSeedDemo.addEventListener('click', ()=>withBusy(btnSeedDemo, async ()=>{
        const data = await adminPost('seed_demo');
        if (data && Array.isArray(data.messages)) { allMessages = data.messages; renderMessagesPage(1); }
        if (data && data.rsvp) { updateRSVPCounts(data.rsvp.attend, data.rsvp.not_attend); rsvpEntries = data.rsvp.entries || []; renderRsvpPage(1); }
        showToast('Demo data seeded');
        // final sync
        await fetchMessages();
    }));

    // Ensure all menus are closed on load
    closeAllMenus();

    fetchMessages();
    setInterval(fetchMessages, 7000); // auto-refresh every 7s

    // Footer reveal on manual scroll
    window.addEventListener('scroll', revealFooterIfBottom);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAfterDom);
} else {
  // DOM already parsed
  initAfterDom();
}


function incrementRSVP(type){
    const formData = new FormData();
    formData.append("action","rsvp");
    formData.append("type",type);
    const nameInput = document.getElementById('rsvp-name-input');
    const name = (nameInput?.value || 'Anonymous').trim();
    formData.append("name", name);

    fetch('/api/api',{method:'POST', body: formData})
        .then(res=>res.json())
        .then(data=>{
            if (data && data.rsvp) {
                updateRSVPCounts(data.rsvp.attend, data.rsvp.not_attend);
                if (Array.isArray(data.rsvp.entries)) {
                    rsvpEntries = data.rsvp.entries;
                    renderRsvpPage(rsvpPage);
                }
            }
            const successMenu = document.getElementById("success-menu");
            if(type==="attend") successMenu.innerHTML="<p>Kami menantikan kedatangan anda!</p>";
            else successMenu.innerHTML="<p>Maaf, mungkin lain kali.</p>";
            successMenu.classList.add("open");
        })
        .catch(err=>console.error(err));
}

document.getElementById("btn-hadir").addEventListener("click",()=>incrementRSVP("attend"));
document.getElementById("btn-tidak-hadir").addEventListener("click",()=>incrementRSVP("not_attend"));







/** =====================================================
 *  Image Carousel
  ======================================================= */


const slides = document.querySelectorAll('.slideshow .slide');
let current = 0;

function showSlide(index) {
  slides.forEach(slide => slide.classList.remove('active'));
  slides[index].classList.add('active');

  const img = slides[index].querySelector('.couple-img');
  const groom = slides[index].querySelector('.firstName');
  const bride = slides[index].querySelector('.secondName');

  // reset semua
  [img, groom, bride].forEach(el => {
    if (el) {
      el.style.opacity = 0;
      el.style.animation = 'none';
    }
  });

  // gambar dulu
  if (img) {
    setTimeout(() => {
      // Entry + gentle float afterwards
      img.style.animation = 'slideIn 1.5s ease forwards, softFloat 12s ease-in-out 2s infinite alternate';
    }, 500);
  }

  // nama groom selepas gambar
  if (groom) {
    setTimeout(() => {
      groom.style.animation = 'nameIn 1s ease forwards';
    }, 2000);
  }

  // nama bride selepas groom
  if (bride) {
    setTimeout(() => {
      bride.style.animation = 'nameIn 1s ease forwards';
    }, 4000);
  }
}

function nextSlide() {
  current++;
  if (current < slides.length) {
    showSlide(current);
    setTimeout(nextSlide, 10000); // buffer 1 min
  }
}

// Slideshow will start after overlay is dismissed
let slideshowStarted = false;
let slideTimeoutId = null;
let onSlideshowComplete = null;

// Footer reveal helper
function revealFooterIfBottom(){
  const footer = document.querySelector('.footer');
  const atBottom = (window.innerHeight + window.scrollY) >= document.body.scrollHeight - 1;
  if (atBottom && footer) {
    footer.classList.remove('hidden');
    footer.classList.add('visible');
  }
}

function scheduleNextSlide() {
  if (current < slides.length - 1) {
    slideTimeoutId = setTimeout(() => {
      current++;
      showSlide(current);
      scheduleNextSlide();
    }, 10000);
  } else {
    // Finished full cycle
    if (typeof onSlideshowComplete === 'function') {
      onSlideshowComplete();
    }
  }
}

function startSlideshow(callbackWhenDone) {
  if (slideshowStarted) return;
  slideshowStarted = true;
  onSlideshowComplete = callbackWhenDone;
  current = 0;
  showSlide(0);
  scheduleNextSlide();
}

