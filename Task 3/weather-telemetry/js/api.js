// ====== OpenWeatherMap API layer (Fetch API + async/await + try/catch) ======
// Tip: use the API key  demo  (Settings page) to try every page with sample data, no real key needed.

const Demo = {
  conds: [
    ['Clear', 'clear sky', '01'], ['Clouds', 'scattered clouds', '03'], ['Rain', 'light rain', '10'],
    ['Clouds', 'overcast clouds', '04'], ['Thunderstorm', 'thunderstorm', '11'], ['Snow', 'light snow', '13'],
    ['Mist', 'mist', '50']
  ],
  hash(s) { let h = 0; for (const c of s.toLowerCase()) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; },

  data(path, p) {
    const name = p.q ? p.q.replace(/\b\w/g, (c) => c.toUpperCase()) : 'My Location';
    if (/xyz|asdf|invalid/i.test(name)) throw new Error('City not found. Check the spelling and try again.');
    const imp = p.units === 'imperial';
    const T = (t) => (imp ? t * 1.8 + 32 : t);
    const W = (s) => (imp ? s * 2.237 : s);
    const h = this.hash(name), tz = 19800, now = Math.floor(Date.now() / 1000);
    const base = 12 + (h % 20);
    const mid = Math.floor((now + tz) / 86400) * 86400 - tz;
    const sunrise = mid + 6 * 3600, sunset = mid + 18 * 3600;
    const dn = (ts) => { const hr = ((ts + tz) % 86400) / 3600; return hr < 6 || hr >= 18 ? 'n' : 'd'; };

    if (path === 'air_pollution') {
      const aqi = 1 + (h % 5);
      return { list: [{ main: { aqi }, components: { co: 200 + aqi * 60, no2: 8 * aqi, o3: 40 + aqi * 9, so2: 3 * aqi, pm2_5: 6 * aqi, pm10: 10 * aqi } }] };
    }

    if (path === 'weather') {
      const c = this.conds[h % this.conds.length];
      return {
        name, sys: { country: 'XX', sunrise, sunset }, dt: now, timezone: tz, coord: { lat: 6.93, lon: 79.85 },
        weather: [{ main: c[0], description: c[1], icon: c[2] + dn(now) }],
        main: { temp: T(base), feels_like: T(base + 3), humidity: 55 + (h % 40), pressure: 1000 + (h % 25) },
        wind: { speed: W(2 + (h % 7)) }, visibility: 6000 + (h % 4000), clouds: { all: (h % 10) * 10 }
      };
    }

    // forecast: 40 x 3-hourly entries
    const start = Math.ceil(now / 10800) * 10800;
    const list = Array.from({ length: 40 }, (_, i) => {
      const dt = start + i * 10800;
      const hr = ((dt + tz) % 86400) / 3600;
      const day = Math.floor(i / 8);
      const c = this.conds[(h + day) % this.conds.length];
      const t = base + 4 * Math.sin(((hr - 9) / 24) * 2 * Math.PI) + Math.sin(day + h) * 2;
      return {
        dt, main: { temp: T(t), temp_max: T(t + 1.5), temp_min: T(t - 1.5), humidity: 60 + (i % 5) * 5, pressure: 1005 + (i % 6) },
        weather: [{ main: c[0], description: c[1], icon: c[2] + dn(dt) }],
        pop: ['Rain', 'Thunderstorm', 'Snow'].includes(c[0]) ? 0.5 + (i % 4) / 10 : (i % 3) / 10,
        wind: { speed: W(2 + (i % 5)) }, rain: c[0] === 'Rain' ? { '3h': 1.2 } : undefined
      };
    });
    return { city: { name, timezone: tz }, list };
  }
};

const API = {
  async call(path, params, key) {
    const qs = new URLSearchParams({ ...params, appid: key });
    let res;
    try {
      res = await fetch(`${CONFIG.BASE}/${path}?${qs}`);
    } catch {
      throw new Error('Network error. Check your internet connection and try again.');
    }
    if (res.status === 404) throw new Error('City not found. Check the spelling and try again.');
    if (res.status === 401) throw new Error('Invalid or not-yet-active API key (new keys can take up to 2 hours to activate).');
    if (res.status === 429) throw new Error('API rate limit reached. Please wait a minute and try again.');
    if (!res.ok) throw new Error(`Server error (${res.status}). Please try again later.`);
    try {
      return await res.json();
    } catch {
      throw new Error('Received an unreadable response from the server.');
    }
  },

  async request(path, params) {
    const key = Settings.apiKey;
    if (!key) throw new Error('NO_KEY');
    if (key.toLowerCase() === 'demo') {           // demo mode: sample data, no network
      await new Promise((r) => setTimeout(r, 600)); // lets the spinner show
      return Demo.data(path, params);
    }
    return this.call(path, params, key);
  },

  // q = "City name" string OR { lat, lon }
  locParams(q) {
    return typeof q === 'string' ? { q } : { lat: q.lat, lon: q.lon };
  },

  current(q) {
    return this.request('weather', { ...this.locParams(q), units: Settings.units });
  },

  forecast(q) {
    return this.request('forecast', { ...this.locParams(q), units: Settings.units });
  },

  air(lat, lon) {
    return this.request('air_pollution', { lat, lon });
  },

  async bundle(q) {
    const [current, forecast] = await Promise.all([this.current(q), this.forecast(q)]);
    return { current, forecast };
  },

  async testKey(key) {
    if (key.toLowerCase() === 'demo') return { demo: true };
    return this.call('weather', { q: 'London', units: 'metric' }, key);
  }
};
