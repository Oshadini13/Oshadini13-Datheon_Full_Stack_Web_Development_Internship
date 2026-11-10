// ====== Forecast page: 5-day cards, 3-hour breakdown, temperature chart ======
initPage('forecast.html');
initSearch(search);

let days = [];
let tz = 0;

function tempChart(list, offset) {
  const W = 640, H = 220, pl = 36, pr = 12, pt = 16, pb = 30;
  const temps = list.map((e) => e.main.temp);
  const min = Math.floor(Math.min(...temps)) - 1;
  const max = Math.ceil(Math.max(...temps)) + 1;
  const x = (i) => pl + (i * (W - pl - pr)) / (list.length - 1);
  const y = (t) => pt + ((max - t) * (H - pt - pb)) / (max - min);
  const pts = list.map((e, i) => `${x(i).toFixed(1)},${y(e.main.temp).toFixed(1)}`);
  const baseY = H - pb;
  const area = `M${pts[0]} L${pts.join(' L')} L${x(list.length - 1).toFixed(1)},${baseY} L${x(0).toFixed(1)},${baseY} Z`;

  // Horizontal grid lines + y labels
  let grid = '';
  for (let k = 0; k <= 4; k++) {
    const t = min + ((max - min) * k) / 4;
    const gy = y(t).toFixed(1);
    grid += `<line x1="${pl}" x2="${W - pr}" y1="${gy}" y2="${gy}" stroke="currentColor" stroke-opacity=".2"/>` +
            `<text x="${pl - 6}" y="${(+gy + 4)}" text-anchor="end">${Math.round(t)}°</text>`;
  }

  // Day labels at local noon
  let labels = '';
  list.forEach((e, i) => {
    const d = new Date((e.dt + offset) * 1000);
    if (d.getUTCHours() === 12) {
      const wd = d.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
      labels += `<text x="${x(i).toFixed(1)}" y="${H - 8}" text-anchor="middle">${wd}</text>`;
    }
  });

  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Temperature trend over the next 5 days">
    ${grid}
    <path d="${area}" fill="currentColor" fill-opacity=".15"/>
    <polyline points="${pts.join(' ')}" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
    ${labels}
  </svg>`;
}

function showDay(i) {
  document.querySelectorAll('#forecast .day').forEach((el, k) => el.classList.toggle('active', k === i));
  const d = days[i];
  $('hourlyTitle').textContent = d.date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', timeZone: 'UTC' }) + ' — 3-hour breakdown';
  $('hourly').innerHTML = d.items.map((e) => `
    <div class="hour">
      <div>${cityTime(e.dt, tz, { hour: 'numeric' })}</div>
      ${iconImg(e.weather[0].icon, e.weather[0].description)}
      <b>${Math.round(e.main.temp)}${unitSym()}</b>
      <div>💧 ${Math.round((e.pop || 0) * 100)}%</div>
    </div>`).join('');
}

async function search(q) {
  setLoading(true);
  try {
    const { current, forecast } = await API.bundle(q);
    applyTheme(current);
    tz = forecast.city.timezone;
    days = dailyForecast(forecast);

    $('place').textContent = `${current.name}, ${current.sys.country}`;
    $('placeSub').textContent = `Now ${Math.round(current.main.temp)}${unitSym()} · ${current.weather[0].description}`;
    $('forecast').innerHTML = days.map((d, i) => dayCard(d, i)).join('');
    $('chart').innerHTML = tempChart(forecast.list, tz);
    $('result').classList.remove('hidden');
    showDay(0);
    rememberCity(current.name, search);
  } catch (err) {
    handleError(err);
  } finally {
    setLoading(false);
  }
}

$('forecast').addEventListener('click', (e) => {
  const card = e.target.closest('.day');
  if (card) showDay(+card.dataset.i);
});

// Init
if (!Settings.apiKey) {
  handleError(new Error('NO_KEY'));
} else if (Settings.lastCity) {
  $('cityInput').value = Settings.lastCity;
  search(Settings.lastCity);
}
