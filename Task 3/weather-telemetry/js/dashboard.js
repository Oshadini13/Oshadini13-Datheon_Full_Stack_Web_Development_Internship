// ====== Dashboard page ======
initPage('index.html');
initSearch(search);

function renderCurrent(cur) {
  const w = cur.weather[0];
  $('city').textContent = `${cur.name}, ${cur.sys.country}`;
  $('localTime').textContent = 'Local time: ' + cityTime(cur.dt, cur.timezone, { weekday: 'short', hour: '2-digit', minute: '2-digit' });
  $('desc').textContent = w.description;
  $('iconWrap').innerHTML = iconImg(w.icon, w.description);
  $('temp').textContent = Math.round(cur.main.temp) + unitSym();
  $('humidity').textContent = cur.main.humidity + '%';
  $('wind').textContent = fmtWind(cur.wind.speed);
  $('pressure').textContent = cur.main.pressure + ' hPa';
  $('feels').textContent = Math.round(cur.main.feels_like) + unitSym();
  $('visibility').textContent = cur.visibility !== undefined ? fmtVis(cur.visibility) : '—';
  $('clouds').textContent = (cur.clouds ? cur.clouds.all : 0) + '%';
  $('sunrise').textContent = cityTime(cur.sys.sunrise, cur.timezone, { hour: '2-digit', minute: '2-digit' });
  $('sunset').textContent = cityTime(cur.sys.sunset, cur.timezone, { hour: '2-digit', minute: '2-digit' });
}

async function search(q) {
  setLoading(true);
  try {
    const { current, forecast } = await API.bundle(q);
    applyTheme(current);
    renderCurrent(current);
    $('forecast').innerHTML = dailyForecast(forecast).map((d, i) => dayCard(d, i)).join('');
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
