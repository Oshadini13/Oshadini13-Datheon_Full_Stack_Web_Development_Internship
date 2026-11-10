// ====== Global config + persistent settings (localStorage) ======
const CONFIG = {
  // Optional: paste your OpenWeatherMap API key here, or add it on the Settings page.
  DEFAULT_API_KEY: '',
  BASE: 'https://api.openweathermap.org/data/2.5',
  ICON: (code) => `https://openweathermap.org/img/wn/${code}@2x.png`
};

const Store = {
  load() {
    try { return JSON.parse(localStorage.getItem('wt_settings')) || {}; }
    catch { return {}; }
  },
  save(obj) {
    try { localStorage.setItem('wt_settings', JSON.stringify(obj)); } catch { /* storage blocked */ }
  },
  get(key, fallback) {
    const s = this.load();
    return s[key] !== undefined ? s[key] : fallback;
  },
  set(key, value) {
    const s = this.load();
    s[key] = value;
    this.save(s);
  }
};

const Settings = {
  get apiKey() { return Store.get('apiKey', '') || CONFIG.DEFAULT_API_KEY; },
  set apiKey(v) { Store.set('apiKey', v); },

  get units() { return Store.get('units', 'metric'); },   // 'metric' | 'imperial'
  set units(v) { Store.set('units', v); },

  get lastCity() { return Store.get('lastCity', ''); },
  set lastCity(v) { Store.set('lastCity', v); },

  get recent() { return Store.get('recent', []); },
  addRecent(city) {
    const list = this.recent.filter((c) => c.toLowerCase() !== city.toLowerCase());
    list.unshift(city);
    Store.set('recent', list.slice(0, 6));
  },
  clearRecent() { Store.set('recent', []); }
};
