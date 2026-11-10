// ====== Climate page: air quality + 5-day climate statistics ======
initPage('climate.html');
initSearch(search);

const AQI_LABELS = ['', 'Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];

const metric = (label, value, sub) =>
  `<div class="metric"><div class="label">${label}</div><div class="value">${value}</div>${sub ? `<div class="sub">${sub}</div>` : ''}</div>`;

function renderAir(air) {
  const box = $('airBox');
  if (!air || !air.list || !air.list.length) {
    box.innerHTML = '<p>Air quality data is not available for this location.</p>';
    return;
  }
  const a = air.list[0];
  const c = a.components;
  const aqi = a.main.aqi;
  box.innerHTML = `
    <span class="aqi-badge aqi-${aqi}">AQI ${aqi} · ${AQI_LABELS[aqi]}</span>
    <div class="metrics">
      ${metric('PM2.5', c.pm2_5.toFixed(1), 'µg/m³')}
      ${metric('PM10', c.pm10.toFixed(1), 'µg/m³')}
      ${metric('Ozone (O₃)', c.o3.toFixed(1), 'µg/m³')}
      ${metric('NO₂', c.no2.toFixed(1), 'µg/m³')}
      ${metric('SO₂', c.so2.toFixed(1), 'µg/m³')}
      ${metric('CO', c.co.toFixed(0), 'µg/m³')}
    </div>`;
}

function renderStats(cur, fc) {
  const L = fc.list;
  const avg = (f) => L.reduce((s, e) => s + f(e), 0) / L.length;
  const rain = L.reduce((s, e) => s + ((e.rain && e.rain['3h']) || 0), 0);
  const maxPop = Math.max(...L.map((e) => e.pop || 0));
  const dayMin = Math.round((cur.sys.sunset - cur.sys.sunrise) / 60);

  $('stats').innerHTML = [
    metric('Avg temp', Math.round(avg((e) => e.main.temp)) + unitSym(), '5-day mean'),
    metric('Warmest', Math.round(Math.max(...L.map((e) => e.main.temp_max))) + unitSym()),
    metric('Coolest', Math.round(Math.min(...L.map((e) => e.main.temp_min))) + unitSym()),
    metric('Avg humidity', Math.round(avg((e) => e.main.humidity)) + '%'),
    metric('Avg pressure', Math.round(avg((e) => e.main.pressure)) + ' hPa'),
    metric('Avg wind', fmtWind(avg((e) => e.wind.speed))),
    metric('Peak rain chance', Math.round(maxPop * 100) + '%'),
    metric('Expected rain', rain.toFixed(1) + ' mm', 'next 5 days'),
    metric('Daylight today', `${Math.floor(dayMin / 60)}h ${dayMin % 60}m`)
  ].join('');
}

async function search(q) {
  setLoading(true);
  try {
    const { current, forecast } = await API.bundle(q);
    let air = null;
    try { air = await API.air(current.coord.lat, current.coord.lon); } catch { /* air quality is optional */ }

    applyTheme(current);
    $('place').textContent = `${current.name}, ${current.sys.country}`;
    $('placeSub').textContent = `Now ${Math.round(current.main.temp)}${unitSym()} · ${current.weather[0].description}`;
    renderAir(air);
    renderStats(current, forecast);
    $('result').classList.remove('hidden');
    rememberCity(current.name, search);
  } catch (err) {
    handleError(err);
  } finally {
    setLoading(false);
  }
}

// Init
if (!Settings.apiKey) {
  handleError(new Error('NO_KEY'));
} else if (Settings.lastCity) {
  $('cityInput').value = Settings.lastCity;
  search(Settings.lastCity);
}
