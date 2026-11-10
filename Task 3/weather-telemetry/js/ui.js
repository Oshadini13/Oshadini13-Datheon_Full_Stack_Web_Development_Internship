// ====== Shared UI helpers: navigation, theme, icons, formatting, states ======
const $ = (id) => document.getElementById(id);

const NAV = [
  ['index.html', 'Dashboard'],
  ['forecast.html', 'Forecast'],
  ['climate.html', 'Climate'],
  ['settings.html', 'Settings'],
  ['about.html', 'About']
];

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ---------- Navigation ----------
function renderNav(active) {
  const root = $('nav-root');
  if (!root) return;
  const links = NAV.map(([href, label]) =>
    `<li><a href="${href}" class="${href === active ? 'active' : ''}">${label}</a></li>`).join('');
  root.innerHTML = `
    <header class="site-header">
      <nav class="nav-inner">
        <a class="brand" href="index.html">🌍 Weather Telemetry</a>
        <button class="menu-btn" id="menuBtn" aria-label="Toggle menu">☰</button>
        <ul class="nav-links" id="navLinks">${links}</ul>
      </nav>
    </header>`;
  $('menuBtn').addEventListener('click', () => $('navLinks').classList.toggle('open'));
}

function initPage(active) {
  renderNav(active);
  document.body.className = Store.get('theme', '');
}

// ---------- Theme (dynamic gradient) ----------
function themeClass(cur) {
  const main = cur.weather[0].main.toLowerCase();
  const night = cur.dt < cur.sys.sunrise || cur.dt > cur.sys.sunset;
  if (main === 'thunderstorm') return 'thunder';
  if (main === 'rain' || main === 'drizzle') return 'rain';
  if (main === 'snow') return 'snow';
  if (['mist', 'fog', 'haze', 'smoke', 'dust', 'sand', 'ash', 'squall', 'tornado'].includes(main)) return 'mist';
  if (night) return 'clear-night';
  return main === 'clouds' ? 'clouds' : 'clear-day';
}

function applyTheme(cur) {
  const cls = themeClass(cur);
  document.body.className = cls;
  Store.set('theme', cls);
}

// ---------- Icons ----------
function emojiFor(code) {
  const night = code.endsWith('n');
  const map = { '01': night ? '🌙' : '☀️', '02': '⛅', '03': '☁️', '04': '☁️', '09': '🌧️', '10': '🌦️', '11': '⛈️', '13': '❄️', '50': '🌫️' };
  return map[code.slice(0, 2)] || '🌡️';
}

// Dynamic OpenWeatherMap icon; falls back to an emoji if the image can't load.
function iconImg(code, alt) {
  return `<img src="${CONFIG.ICON(code)}" alt="${esc(alt)}" data-e="${emojiFor(code)}" ` +
    `onerror="this.outerHTML='<span class=&quot;emoji&quot;>'+this.dataset.e+'</span>'">`;
}

// ---------- Formatting ----------
const unitSym = () => (Settings.units === 'imperial' ? '°F' : '°C');
const fmtWind = (s) => (Settings.units === 'imperial' ? `${s.toFixed(1)} mph` : `${(s * 3.6).toFixed(1)} km/h`);
const fmtVis = (m) => (Settings.units === 'imperial' ? `${(m / 1609.34).toFixed(1)} mi` : `${(m / 1000).toFixed(1)} km`);

// Format a UTC timestamp in the searched city's local time
function cityTime(ts, tz, opts) {
  return new Date((ts + tz) * 1000).toLocaleString('en-US', { ...opts, timeZone: 'UTC' });
}

// ---------- Forecast helpers ----------
// Group 3-hourly entries into 5 daily summaries (city-local dates)
function dailyForecast(fc) {
  const tz = fc.city.timezone;
  const byDay = {};
  fc.list.forEach((e) => {
    const d = new Date((e.dt + tz) * 1000);
    const key = d.toISOString().slice(0, 10);
    (byDay[key] = byDay[key] || []).push({ ...e, hour: d.getUTCHours() });
  });
  return Object.entries(byDay).slice(0, 5).map(([key, items]) => {
    const rep = items.reduce((a, b) => (Math.abs(b.hour - 12) < Math.abs(a.hour - 12) ? b : a));
    return {
      key,
      items,
      date: new Date(key + 'T00:00:00Z'),
      hi: Math.max(...items.map((i) => i.main.temp_max)),
      lo: Math.min(...items.map((i) => i.main.temp_min)),
      icon: rep.weather[0].icon.replace('n', 'd'),
      cond: rep.weather[0].description,
      pop: Math.max(...items.map((i) => i.pop || 0))
    };
  });
}

function dayCard(d, i) {
  const wd = d.date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
  const dt = d.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  return `
    <div class="day" data-i="${i}">
      <div class="name">${wd}</div>
      <div class="date">${dt}</div>
      ${iconImg(d.icon, d.cond)}
      <div><span class="hi">${Math.round(d.hi)}°</span><span class="lo">${Math.round(d.lo)}°</span></div>
      <div class="cond">${esc(d.cond)}</div>
      <div class="pop">💧 ${Math.round(d.pop * 100)}%</div>
    </div>`;
}

// ---------- Page states: spinner / errors ----------
function setLoading(on) {
  $('spinner').classList.toggle('hidden', !on);
  document.querySelectorAll('.search button').forEach((b) => { b.disabled = on; });
  if (on) {
    ['error', 'notice', 'result'].forEach((id) => { if ($(id)) $(id).classList.add('hidden'); });
  }
}

function handleError(err) {
  if ($('result')) $('result').classList.add('hidden');
  if (err.message === 'NO_KEY') {
    const n = $('notice');
    n.innerHTML = '🔑 Add your free OpenWeatherMap API key in <a href="settings.html">Settings</a> to get started.';
    n.classList.remove('hidden');
    return;
  }
  const e = $('error');
  e.textContent = '⚠️ ' + err.message;
  e.classList.remove('hidden');
}

// ---------- Search box (city search, geolocation, recent chips) ----------
function renderRecent(onSearch) {
  const box = $('recent');
  if (!box) return;
  box.innerHTML = Settings.recent.map((c) => `<button type="button" class="chip" data-c="${esc(c)}">${esc(c)}</button>`).join('');
  box.querySelectorAll('.chip').forEach((b) => {
    b.addEventListener('click', () => { $('cityInput').value = b.dataset.c; onSearch(b.dataset.c); });
  });
}

function initSearch(onSearch) {
  $('searchForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const city = $('cityInput').value.trim();
    if (city) onSearch(city);
  });

  const geo = $('geoBtn');
  if (geo) {
    geo.addEventListener('click', () => {
      if (!navigator.geolocation) return handleError(new Error('Geolocation is not supported by this browser.'));
      geo.disabled = true;
      navigator.geolocation.getCurrentPosition(
        (p) => { geo.disabled = false; onSearch({ lat: p.coords.latitude, lon: p.coords.longitude }); },
        () => { geo.disabled = false; handleError(new Error('Location access was denied or unavailable.')); }
      );
    });
  }
  renderRecent(onSearch);
}

// Called after a successful search
function rememberCity(name, onSearch) {
  $('cityInput').value = name;
  Settings.lastCity = name;
  Settings.addRecent(name);
  renderRecent(onSearch);
}
