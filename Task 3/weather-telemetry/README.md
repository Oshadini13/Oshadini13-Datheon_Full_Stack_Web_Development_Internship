# Weather Telemetry

Live weather and climate dashboard built with the Fetch API, async/await, the OpenWeatherMap API and CSS Flexbox. No build step.

## Run
1. Get a free API key: https://openweathermap.org/api (new keys can take up to 2 hours to activate).
2. Open `index.html` in a browser (or serve the folder: `python -m http.server 8000`).
3. Go to **Settings**, paste the key, press **Save**. You can also put it in `DEFAULT_API_KEY` in `js/config.js`.
4. Search any city on the Dashboard.

**No key yet?** Enter `demo` as the API key to try every page with sample data.

**Important:** serve the folder over http (GitHub Pages or `python -m http.server`) rather than double-clicking the files. Some browsers (Firefox, Safari) don't share saved settings between pages opened from `file://`, so the key is lost when you switch pages.

## Deploy on GitHub Pages
1. Push the folder contents to a GitHub repo (`index.html` at the root).
2. Repo **Settings → Pages → Deploy from a branch → main / (root)**.
3. Open `https://<user>.github.io/<repo>/`, go to Settings, add your key.

## Structure
```
weather-telemetry/
├── index.html      Dashboard: current weather + 5-day cards
├── forecast.html   Forecast: day selector, 3-hour breakdown, temperature chart
├── climate.html    Climate: air quality + 5-day statistics
├── settings.html   API key, units, history
├── about.html      Project info
├── css/style.css   Themes, layout (Flexbox), responsive rules
└── js/
    ├── config.js   Config + localStorage settings
    ├── api.js      fetch() calls with try/catch error handling
    ├── ui.js       Navigation, theme, icons, formatting, spinner/errors
    ├── dashboard.js / forecast.js / climate.js / settings.js
```
