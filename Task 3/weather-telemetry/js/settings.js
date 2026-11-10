// ====== Settings page ======
initPage('settings.html');

const keyEl = $('apiKey');
const unitsEl = $('units');
const msg = $('msg');

keyEl.value = Settings.apiKey;
unitsEl.value = Settings.units;

const say = (t) => { msg.textContent = t; };

$('saveBtn').addEventListener('click', () => {
  Settings.apiKey = keyEl.value.trim();
  Settings.units = unitsEl.value;
  say('✅ Settings saved.');
});

$('testBtn').addEventListener('click', async () => {
  const k = keyEl.value.trim();
  if (!k) return say('Enter an API key first.');
  say('Testing key…');
  try {
    await API.testKey(k);
    say('✅ Key works!');
  } catch (e) {
    say('❌ ' + e.message);
  }
});

$('clearBtn').addEventListener('click', () => {
  Settings.clearRecent();
  say('Search history cleared.');
});

$('resetBtn').addEventListener('click', () => {
  if (confirm('Reset all settings (API key, units, history)?')) {
    Store.save({});
    location.reload();
  }
});
