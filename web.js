/* ================= HELPERS & LIVE CLOCK ================= */
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function updateMissionClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedHours = String(hours).padStart(2, '0');

    if ($('liveClock')) {
        $('liveClock').innerText = `${formattedHours}:${minutes}:${seconds} ${ampm} IST`;
    }
}
setInterval(updateMissionClock, 1000);
updateMissionClock();

let audioEnabled = false;
let soundMuted = false;

document.addEventListener('click', () => { audioEnabled = true; }, { once: true });

function toggleMuteAudio() {
    soundMuted = !soundMuted;
    const icon = $('muteIcon');
    const text = $('muteText');
    if (soundMuted) {
        if (icon) icon.className = "fa-solid fa-volume-xmark text-brand-fire";
        if (text) text.innerText = "MUTED";
    } else {
        if (icon) icon.className = "fa-solid fa-volume-high";
        if (text) text.innerText = "MUTE";
    }
}

function playBeep(freq = 880, dur = 0.2) {
    if (!audioEnabled || soundMuted) return;
    try {
        const c = new (window.AudioContext || window.webkitAudioContext)(), o = c.createOscillator(), g = c.createGain();
        o.type = 'sawtooth'; o.frequency.value = freq; g.gain.value = 0.1; o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + dur);
    } catch (e) { }
}

/* ================= ESP32 LIVE CAM LINK & 'L' SHORTCUT ================= */
const DEFAULT_ESP32_CAM_URL = 'http://192.168.4.1:81/stream';

function getEsp32CamUrl() {
    const input = $('esp32CamUrlInput');
    const saved = localStorage.getItem('bharatAstraEsp32CamUrl');
    if (input && input.value.trim()) return input.value.trim();
    return saved || DEFAULT_ESP32_CAM_URL;
}

function saveEsp32CamUrl(url) {
    const clean = (url || '').trim();
    if (!clean) return;
    localStorage.setItem('bharatAstraEsp32CamUrl', clean);
    if ($('esp32CamUrlInput')) $('esp32CamUrlInput').value = clean;
}

function configureEsp32CamUrl() {
    const current = getEsp32CamUrl();
    const updated = prompt('Enter your ESP32-CAM Live Stream URL:', current);
    if (updated && updated.trim()) {
        saveEsp32CamUrl(updated.trim());
    }
}

function openEsp32CamWindow() {
    const url = getEsp32CamUrl();
    saveEsp32CamUrl(url);
    window.open(url, '_blank', 'noopener,noreferrer');
}

(function initEsp32Cam() {
    const saved = localStorage.getItem('bharatAstraEsp32CamUrl');
    if (saved && $('esp32CamUrlInput')) {
        $('esp32CamUrlInput').value = saved;
    }
})();

document.addEventListener('keydown', (e) => {
    const tag = (e.target && e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target?.isContentEditable) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        openEsp32CamWindow();
    }
});

/* ================= BACKGROUND PARTICLES ================= */
const cv = $('orbitCanvas'), cx = cv.getContext('2d');
const resize = () => { cv.width = innerWidth; cv.height = innerHeight; }; addEventListener('resize', resize); resize();
const pts = Array.from({ length: 60 }, () => ({ x: Math.random() * cv.width, y: Math.random() * cv.height, s: Math.random() * 1.5 + .5, dx: (Math.random() - .5) * .3, dy: (Math.random() - .5) * .3, a: Math.random() * .5 + .2 }));
(function loop() {
    cx.clearRect(0, 0, cv.width, cv.height);
    pts.forEach(p => { p.x = (p.x + p.dx + cv.width) % cv.width; p.y = (p.y + p.dy + cv.height) % cv.height; cx.fillStyle = `rgba(0,242,254,${p.a})`; cx.beginPath(); cx.arc(p.x, p.y, p.s, 0, 6.283); cx.fill(); });
    requestAnimationFrame(loop);
})();

/* ================= RENDERED SECTIONS ================= */
if ($('problemCards')) {
    $('problemCards').innerHTML = [
        ['fire', 'fa-fire-flame-curved', '01', 'FIRE HAZARD MONITORING', '"Detect smoke and flame conditions and trigger an early warning."', 'Smoke & Flame Sensors', 'Miniature Fire Demo Zone'],
        ['flood', 'fa-water', '02', 'MPU6050 WAVE & FLOOD MONITORING', '"Monitor high-wave activity, buoy tilt, and flood/tsunami-level motion."', 'MPU6050 Accelerometer', 'Buoy Station Zone A']
    ].map(([k, ic, n, t, q, s, z]) => `<div class="glass-panel glass-panel-hover p-8 rounded-2xl border-l-4 border-l-brand-${k}">
      <div class="flex items-center space-x-4 mb-4"><div class="w-14 h-14 rounded-xl bg-brand-${k}/20 border border-brand-${k} flex items-center justify-center text-brand-${k} text-2xl"><i class="fa-solid ${ic}"></i></div>
      <div><span class="text-xs font-mono text-brand-${k}">MONITORING TARGET #${n}</span><h3 class="text-2xl font-orbitron font-bold text-white">${t}</h3></div></div>
      <p class="text-slate-300 font-rajdhani text-lg">${q}</p>
      <div class="mt-6 pt-4 border-t border-slate-800/80 text-xs font-mono text-slate-400 space-y-2"><div class="flex justify-between"><span>Sensor:</span><span class="text-white">${s}</span></div><div class="flex justify-between"><span>Demo Area:</span><span class="text-white">${z}</span></div></div></div>`).join('');
}

if ($('flowSteps')) {
    $('flowSteps').innerHTML = [
        ['fa-satellite', 'SATELLITE MOVEMENT', 'Platform moves over miniature zone'], ['fa-microchip', 'SENSOR DATA', 'MPU6050 buoy tilt readings'],
        ['fa-memory', 'MICROCONTROLLER', 'ESP32 local embedded processing'], ['fa-chart-line', 'CONDITION ANALYSIS', 'Check against 75.0° tilt threshold'],
        ['fa-triangle-exclamation', 'FLOOD / WAVE DETECT', 'State classification established'], ['fa-bell', 'EMERGENCY ALERT', 'Dashboard popup, buzzer & web sync']
    ].map(([ic, t, d], i) => `<div class="p-4 rounded-xl bg-slate-900/80 border ${i == 5 ? 'border-brand-flood/50 bg-brand-flood/10' : 'border-slate-700'} hover:border-brand-cyan transition-all">
      <div class="w-8 h-8 mx-auto mb-2 rounded-full ${i == 5 ? 'bg-brand-flood text-white' : 'bg-brand-cyan/20 text-brand-cyan'} flex items-center justify-center text-xs font-bold font-orbitron">0${i + 1}</div>
      <i class="fa-solid ${ic} text-2xl ${i >= 4 ? 'text-brand-flood' : 'text-slate-300'} mb-2"></i><div class="text-xs font-bold text-white">${t}</div><p class="text-[10px] text-slate-400 mt-1">${d}</p></div>`).join('');
}

const gallery = { gallery1: ['FIRE+DEMO+AREA', 'ff3b30', 'Fire Demonstration Area & Sensors'], gallery2: ['MPU6050+BUOY+ZONE', '007aff', 'MPU6050 Buoy Wave & Flood Monitor'], gallery3: ['MICROCONTROLLER', '34c759', 'ESP32 Controller & Buzzer'] };
if ($('galleryGrid')) {
    $('galleryGrid').innerHTML = Object.entries(gallery).map(([k, [txt, col, cap]]) => `<div class="glass-panel p-4 rounded-xl space-y-3 group">
      <div class="relative h-48 rounded-lg bg-slate-950 overflow-hidden border border-slate-800"><img id="img-${k}" src="https://placehold.co/600x400/0a1120/${col}?text=${txt}" alt="${cap}" class="w-full h-full object-cover">
      <div class="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
       <label class="cursor-pointer p-2 rounded-lg bg-slate-900 text-white border border-slate-700"><i class="fa-solid fa-camera"></i><input type="file" accept="image/*" class="hidden" onchange="handleImageUpload(event,'${k}')"></label></div></div>
      <div class="text-xs font-mono space-y-1"><div class="text-slate-200 font-bold" id="cap-${k}">${cap}</div><button onclick="editCaption('${k}')" class="text-[10px] text-slate-500 hover:text-brand-cyan underline">Edit Caption</button></div></div>`).join('');
}

if ($('hwGrid')) {
    $('hwGrid').innerHTML = [
        ['fa-microchip', 'text-brand-cyan', 'MAIN CONTROLLER', 'ESP32 / Arduino'], ['fa-compass-drafting', 'text-brand-flood', 'MOTION SENSOR', 'MPU6050 Accelerometer'],
        ['fa-gear', 'text-amber-400', 'MOTION', 'Satellite Track Motor'], ['fa-tv', 'text-blue-400', 'OUTPUT', 'LCD, LEDs & Buzzer'],
        ['fa-code', 'text-emerald-400', 'PROGRAMMING', 'Arduino IDE'], ['fa-brain', 'text-brand-cyan', 'FUTURE STACK', 'AI/ML & Vision (Planned)']
    ].map(([ic, c, l, v]) => `<div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center space-y-2"><i class="fa-solid ${ic} text-2xl ${c}"></i><div class="text-slate-400 text-[10px]">${l}</div><div class="font-bold text-white font-orbitron">${v}</div></div>`).join('');
}

if ($('teamGrid')) {
    $('teamGrid').innerHTML = ['IVANKA SINGH', 'AVYUKT SAXENA', 'MITHRA VINOTHKUMAR', 'AMEERA MACEDA AHMED', 'SOHANA DOSTI'].map(n =>
        `<div class="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-brand-cyan/50 transition-all text-center group"><h3 class="font-orbitron font-bold text-lg text-white group-hover:text-brand-cyan">${n}</h3><p class="font-mono text-xs text-slate-400 mt-1">CLASS 9 • 2026–2027</p></div>`).join('');
}

if ($('roadmapGrid')) {
    $('roadmapGrid').innerHTML = [['PHYSICAL PROTOTYPE', 'Current moving platform and MPU6050 buoy validation.'], ['SMART SENSORS', 'Planned sensor expansion beyond the current prototype.'], ['AI DETECTION', 'Planned AI/ML pattern classification.'], ['ALERT NETWORK', 'Mesh cloud node notification relays.'], ['LOCATION AWARE', 'Geofenced browser & push alerts.'], ['LARGE-SCALE', 'Official emergency authority grid integration.']]
        .map(([t, d], i) => `<div class="p-4 rounded-xl bg-slate-900/80 border ${i == 0 ? 'border-brand-cyan/30' : 'border-slate-800'} text-center space-y-2"><div class="${i == 0 ? 'text-brand-cyan' : 'text-slate-300'} font-bold font-orbitron">0${i + 1}. ${t}</div><p class="text-[11px] text-slate-400">${d}</p></div>`).join('');
}

/* ================= DEMO SIMULATION + LIVE FIREBASE TELEMETRY ================= */
// Matches your ESP32 path: /alerts/latest.json
const FIREBASE_ALERT_URL = 'https://bharatastra-154d9-default-rtdb.asia-southeast1.firebasedatabase.app/alerts/latest.json';
let isInitialFetch = true;
let lastHandledEventKey = null;
let latestTelemetry = { active: false, angle: 0, eventId: 0 };

const initialFeedItems = [
    { id: '1', type: 'FIRE', title: 'FIRE DEMO ALERT', location: 'Miniature City Zone A', time: '10 mins ago', status: 'STANDBY' },
    { id: '2', type: 'FLOOD', title: 'FLOOD / TSUNAMI WAVE ALERT', location: 'Buoy Station Zone A', time: '25 mins ago', status: 'STANDBY' },
    { id: '3', type: 'FLOOD', title: 'MPU6050 TILT CALIBRATION', location: 'Buoy Station Zone A', time: '1 hour ago', status: 'RESOLVED' }
];

function renderGlobalFeed() {
    if (!$('globalFeedList')) return;
    $('globalFeedList').innerHTML = initialFeedItems.map(i => {
        const f = i.type === 'FIRE';
        return `<div class="p-4 rounded-xl glass-panel border ${f ? 'border-brand-fire/30' : 'border-brand-flood/30'} flex flex-col sm:flex-row sm:items-center justify-between gap-3">
    <div class="flex items-center space-x-3"><span class="p-2 rounded-lg ${f ? 'bg-brand-fire/20 text-brand-fire' : 'bg-brand-flood/20 text-brand-flood'}"><i class="fa-solid ${f ? 'fa-fire' : 'fa-water'}"></i></span>
    <div><div class="text-white font-bold text-sm">${esc(i.title)}</div><div class="text-slate-400 text-xs">${esc(i.location)} • ${esc(i.time)}</div></div></div>
    <div class="flex items-center space-x-3"><span class="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">${esc(i.status)}</span><button onclick="openShareModal()" class="text-xs text-brand-cyan hover:underline"><i class="fa-solid fa-share-nodes"></i> Share</button></div></div>`;
    }).join('');
}
renderGlobalFeed();

function setBanner(cls, dot, html) {
    if (!$('homepageEmergencyBanner')) return;
    $('homepageEmergencyBanner').className = 'relative z-30 ' + cls + ' py-2.5 px-4 text-center text-xs font-mono';
    if ($('bannerStatusDot')) $('bannerStatusDot').className = 'w-2.5 h-2.5 rounded-full animate-ping ' + dot;
    if ($('bannerText')) $('bannerText').innerHTML = html;
}

function triggerDemoSimulation(type) {
    const ok = '<span class="text-emerald-400">NORMAL</span>';
    document.body.classList.remove("flood-emergency-mode");
    if (type === 'FIRE') {
        if ($('dashFireStatus')) $('dashFireStatus').innerHTML = '<span class="text-brand-fire font-bold animate-pulse">SMOKE ALERT</span>';
        if ($('dashFloodStatus')) $('dashFloodStatus').innerHTML = ok;
        if ($('heroSmokeReadout')) { $('heroSmokeReadout').innerText = 'ALERT'; $('heroSmokeReadout').className = 'text-brand-fire'; }
        setBanner('bg-red-950/90 border-b border-brand-fire/50', 'bg-brand-fire', 'STATUS: <span class="text-brand-fire font-bold tracking-wider">ACTIVE FIRE WARNING DETECTED IN DEMO AREA</span>');
        openEmergencyModal('FIRE', 'FIRE HAZARD DETECTED', 'Miniature Fire Demonstration Area', 'Smoke sensor alert detected. Buzzer triggered.'); playBeep(900, .4);
    } else if (type === 'FLOOD') {
        document.body.classList.add("flood-emergency-mode");
        if ($('dashFireStatus')) $('dashFireStatus').innerHTML = ok;
        if ($('dashFloodStatus')) $('dashFloodStatus').innerHTML = '<span class="text-brand-flood font-bold animate-pulse">FLOOD / TILT DETECTED</span>';
        if ($('heroUltrasonicReadout')) { $('heroUltrasonicReadout').innerText = 'FLOOD'; $('heroUltrasonicReadout').className = 'text-brand-flood'; }
        setBanner('bg-blue-950/90 border-b border-brand-flood/50', 'bg-brand-flood', 'STATUS: <span class="text-brand-flood font-bold tracking-wider">ACTIVE FLOOD / TILT DETECTED BY MPU6050</span>');
        openEmergencyModal('FLOOD', 'FLOOD DETECTED', 'Buoy Station Zone A', 'MPU6050 tilt threshold (75.0°) exceeded!'); playBeep(600, .4);
    } else {
        if ($('dashFireStatus')) $('dashFireStatus').innerHTML = ok;
        if ($('dashFloodStatus')) $('dashFloodStatus').innerHTML = ok;
        if ($('heroSmokeReadout')) { $('heroSmokeReadout').innerText = 'CLEAR'; $('heroSmokeReadout').className = 'text-emerald-400'; }
        if ($('heroUltrasonicReadout')) { $('heroUltrasonicReadout').innerText = 'NORMAL'; $('heroUltrasonicReadout').className = 'text-emerald-400'; }
        setBanner('bg-slate-900/90 border-b border-brand-cyan/20', 'bg-brand-success', 'STATUS: <span class="text-brand-success font-bold tracking-wider">NO ACTIVE MAJOR EMERGENCIES REPORTED</span>');
    }
}

async function pollFirebaseAlerts() {
    try {
        const res = await fetch(FIREBASE_ALERT_URL + '?t=' + Date.now());
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();

        if ($('firebaseSyncStatus')) {
            $('firebaseSyncStatus').innerHTML = '<i class="fa-solid fa-database text-brand-success mr-1.5"></i>CLOUD TELEMETRY: <span class="text-brand-success font-bold">CONNECTED</span>';
        }

        if (!data) {
            isInitialFetch = false;
            return;
        }

        // Read fields sent by your ESP32: { active: bool, angle: float, eventId: int, device: string }
        const isActive = Boolean(data.active);
        const angle = Number(data.angle || 0);
        const eventId = data.eventId || 0;
        const device = data.device || 'BharatAstra MPU6050';

        latestTelemetry = { active: isActive, angle, eventId, device };

        if ($('tiltAngleVal')) $('tiltAngleVal').innerText = angle.toFixed(2) + '°';
        if ($('eventIdVal')) $('eventIdVal').innerText = eventId;

        const currentEventKey = `${eventId}_${isActive}`;

        // On initial page load, record existing state so old Firebase records don't trigger a popup on refresh
        if (isInitialFetch) {
            isInitialFetch = false;
            lastHandledEventKey = currentEventKey;
            if (!isActive) {
                triggerDemoSimulation('NORMAL');
            }
            return;
        }

        if (currentEventKey === lastHandledEventKey) return;
        lastHandledEventKey = currentEventKey;

        if (isActive) {
            const desc = `Live ESP32 Alert (${device}) | Tilt Angle: ${angle.toFixed(2)}° | Event #${eventId}`;
            document.body.classList.add("flood-emergency-mode");
            if ($('dashFloodStatus')) $('dashFloodStatus').innerHTML = `<span class="text-brand-flood font-bold animate-pulse">FLOOD / TILT ALERT (${angle.toFixed(1)}°)</span>`;
            if ($('heroUltrasonicReadout')) { $('heroUltrasonicReadout').innerText = 'FLOOD'; $('heroUltrasonicReadout').className = 'text-brand-flood'; }
            setBanner('bg-blue-950/90 border-b border-brand-flood/50', 'bg-brand-flood', `STATUS: <span class="text-brand-flood font-bold tracking-wider">FLOOD / TILT ALERT DETECTED (${angle.toFixed(2)}°)</span>`);

            openEmergencyModal('FLOOD', 'FLOOD / TILT DETECTED', 'Buoy Station Zone A', desc);
            playBeep(600, 0.45);

            initialFeedItems.unshift({
                id: String(eventId || Date.now()),
                type: 'FLOOD',
                title: `BUOY TILT ALERT (${angle.toFixed(1)}°)`,
                location: 'Buoy Station Zone A',
                time: new Date().toLocaleTimeString(),
                status: 'LIVE ESP32 ALERT'
            });
            if (initialFeedItems.length > 8) initialFeedItems.pop();
            renderGlobalFeed();
        } else {
            document.body.classList.remove("flood-emergency-mode");
            closeEmergencyModal();
            triggerDemoSimulation('NORMAL');
        }
    } catch (err) {
        isInitialFetch = false;
        if ($('firebaseSyncStatus')) {
            $('firebaseSyncStatus').innerHTML = '<i class="fa-solid fa-database text-amber-400 mr-1.5"></i>CLOUD TELEMETRY: <span class="text-amber-400">WAITING FOR ESP32</span>';
        }
    }
}

triggerDemoSimulation('NORMAL');
pollFirebaseAlerts();
setInterval(pollFirebaseAlerts, 2500);

/* ================= MODALS ================= */
function openEmergencyModal(type, title, loc, desc) {
    const fire = type === 'FIRE', t = $('emergencyModalTitle');
    if (!t) return;
    t.innerText = title;
    if ($('emergencyModalLoc')) $('emergencyModalLoc').innerText = loc;
    if ($('emergencyModalTime')) $('emergencyModalTime').innerText = new Date().toLocaleTimeString() + ' IST';
    if (desc && $('emergencyModalDesc')) $('emergencyModalDesc').innerText = '"' + desc + '"';
    if ($('emergencyModalCard')) $('emergencyModalCard').className = `w-full max-w-lg glass-panel p-6 sm:p-8 rounded-2xl border-2 space-y-6 relative ${fire ? 'border-brand-fire fire-glow' : 'border-brand-flood flood-glow'}`;
    if ($('emergencyModalIcon')) $('emergencyModalIcon').className = `w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${fire ? 'bg-brand-fire/20 text-brand-fire' : 'bg-brand-flood/20 text-brand-flood'}`;
    t.className = `font-orbitron font-black text-2xl ${fire ? 'text-brand-fire' : 'text-brand-flood'}`;
    if ($('emergencyModal')) $('emergencyModal').classList.remove('hidden');
}
const closeEmergencyModal = () => {
    if ($('emergencyModal')) $('emergencyModal').classList.add('hidden');
    document.body.classList.remove("flood-emergency-mode");
};
const openAccountModal = () => { if ($('accountModal')) $('accountModal').classList.remove('hidden'); };
const closeAccountModal = () => { if ($('accountModal')) $('accountModal').classList.add('hidden'); };
const openShareModal = () => { if ($('shareUrlInput')) $('shareUrlInput').value = location.origin + '/#alerts'; if ($('shareModal')) $('shareModal').classList.remove('hidden'); };
const closeShareModal = () => { if ($('shareModal')) $('shareModal').classList.add('hidden'); };
function copyShareUrl() { const i = $('shareUrlInput'); if (!i) return; i.select(); (navigator.clipboard ? navigator.clipboard.writeText(i.value) : Promise.resolve(document.execCommand('copy'))).then(() => { closeShareModal(); }); }
function toggleMobileMenu() {
    const m = $('mobileMenu');
    if (!m) return;
    const h = m.classList.toggle('hidden');
    if ($('mobileMenuBtn')) $('mobileMenuBtn').setAttribute('aria-expanded', String(!h));
}
function scrollToSection(id) { const e = $(id); if (e) e.scrollIntoView({ behavior: 'smooth' }); }

/* ================= ACCOUNT: COUNTRY -> CITY DROPDOWNS ================= */
const COUNTRY_CITIES = {
    "India": ["New Delhi", "Mumbai", "Hyderabad", "Bengaluru", "Chennai", "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Lucknow"],
    "United States": ["New York", "Los Angeles", "Chicago", "Houston", "San Francisco", "Seattle", "Miami", "Boston"],
    "United Kingdom": ["London", "Manchester", "Birmingham", "Edinburgh", "Glasgow", "Liverpool"],
    "Canada": ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa"],
    "Australia": ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide"],
    "United Arab Emirates": ["Dubai", "Abu Dhabi", "Sharjah"],
    "Singapore": ["Singapore"],
    "Japan": ["Tokyo", "Osaka", "Kyoto", "Yokohama"],
    "Germany": ["Berlin", "Munich", "Hamburg", "Frankfurt"],
    "France": ["Paris", "Lyon", "Marseille"],
    "Bangladesh": ["Dhaka", "Chittagong", "Sylhet"],
    "Nepal": ["Kathmandu", "Pokhara"],
    "Sri Lanka": ["Colombo", "Kandy"],
    "Pakistan": ["Karachi", "Lahore", "Islamabad"],
    "Indonesia": ["Jakarta", "Surabaya", "Bandung"],
    "Brazil": ["Sao Paulo", "Rio de Janeiro", "Brasilia"],
    "South Africa": ["Johannesburg", "Cape Town", "Durban"]
};
function populateCities() {
    if ($('accCity') && $('accCountry')) {
        $('accCity').innerHTML = (COUNTRY_CITIES[$('accCountry').value] || []).map(n => `<option value="${n}">${n}</option>`).join('');
    }
}
if ($('accCountry')) {
    $('accCountry').innerHTML = Object.keys(COUNTRY_CITIES).map(n => `<option value="${n}">${n}</option>`).join('');
    $('accCountry').value = 'India';
    populateCities();
}
function saveAccountPreferences(e) {
    e.preventDefault();
    const name = $('accName')?.value || 'User', city = $('accCity')?.value || 'New Delhi', country = $('accCountry')?.value || 'India';
    if ($('savedLocationDisplay')) $('savedLocationDisplay').innerText = `LOCATION: ${city.toUpperCase()}, ${country.toUpperCase()}`;
    if ($('userBtnLabel')) $('userBtnLabel').innerText = name.split(' ')[0].toUpperCase();
    closeAccountModal();
}

/* ================= GALLERY ================= */
function handleImageUpload(ev, key) { const f = ev.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = e => { if ($('img-' + key)) $('img-' + key).src = e.target.result; }; r.readAsDataURL(f); }
function editCaption(key) { const c = prompt('Enter custom photo caption:'); if (c && $('cap-' + key)) $('cap-' + key).innerText = c; }

/* ================= AI CHATBOT ================= */
const chatHistory = [];
const FALLBACK = [
    [/status|angle|tilt|live|reading/i, () => `Live Telemetry: Buoy tilt angle is ${latestTelemetry.angle.toFixed(2)}° (Event #${latestTelemetry.eventId}). Status is ${latestTelemetry.active ? 'ALERT ACTIVE (above 75.0° limit)' : 'NORMAL (below 65.0° reset threshold)'}.`],
    [/fire|smoke|flame/i, () => "If you see fire or smoke: get everyone out, stay low, don't use lifts, and call your local emergency number (112 in India)."],
    [/flood|water|tsunami|wave/i, () => "In a flood or high-wave event: move to higher ground, avoid walking or driving through floodwater, and follow official instructions."],
    [/sensor|arduino|esp32|mpu6050|how.*work/i, () => "Bharat Astra uses an ESP32 and MPU6050 to calculate buoy roll angle. If tilt exceeds 75.0°, it triggers a single buzzer alert and updates Firebase until angle drops below 65.0°."],
    [/hello|hi\b|hey/i, () => "Hi! I'm the Astra AI assistant. Ask me about live buoy tilt status, fire/flood safety, or how the MPU6050 system works."]
];
function toggleChat() {
    const p = $('chatPanel');
    if (!p) return;
    p.classList.toggle('hidden');
    if (!p.classList.contains('hidden') && $('chatLog') && !$('chatLog').children.length) {
        addChatMsg("Hi! I'm the Astra AI assistant. Ask me about live buoy status, tilt angle, or safety procedures.", 'bot');
    }
}
function addChatMsg(text, who) {
    if (!$('chatLog')) return;
    const d = document.createElement('div');
    d.className = who === 'user' ? 'ml-8 p-2 rounded-lg bg-brand-cyan/20 text-white' : 'mr-8 p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200';
    d.textContent = text; $('chatLog').appendChild(d); $('chatLog').scrollTop = $('chatLog').scrollHeight; return d;
}
async function sendChat() {
    const inp = $('chatInput');
    if (!inp) return;
    const text = inp.value.trim();
    if (!text) return;
    inp.value = ''; addChatMsg(text, 'user'); chatHistory.push({ role: 'user', content: text });
    const typing = addChatMsg('...', 'bot'); let reply;
    try {
        const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: chatHistory.slice(-10) }) });
        if (!res.ok) throw 0;
        const data = await res.json();
        reply = data.reply || data.error;
    } catch (e) {
        const h = FALLBACK.find(([re]) => re.test(text));
        reply = h ? h[1]() : "I'm running in offline telemetry mode. Ask me for 'live status', 'tilt angle', or emergency safety tips!";
    }
    if (typing) typing.textContent = reply;
    chatHistory.push({ role: 'assistant', content: reply });
}