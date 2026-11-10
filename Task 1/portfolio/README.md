# Oshadini Nilumika | Developer Portfolio

A responsive, dark-themed developer portfolio (black, blue and white) with a light theme toggle, smooth scrolling, a mobile hamburger menu and project modal popups. Plain HTML5, CSS3 and JavaScript (ES6), no build step.

**Live site:** `https://YOUR-USERNAME.github.io/YOUR-REPO/` (replace after deploying)

## Features

- Semantic HTML5 structure: header, hero, about, experience, skills grid, featured projects, contact
- Mobile-first layout using Flexbox and CSS Grid
- Dark theme by default, light theme toggle (choice is remembered)
- Smooth scrolling navigation with active-section highlighting
- Mobile hamburger menu
- Project modal popups built on the native `<dialog>` element
- Accessible: keyboard focus styles, ARIA labels, reduced-motion support

## Project structure

```
portfolio/
├── index.html
├── css/style.css
├── js/script.js
├── assets/profile.jpg
└── README.md
```

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
python -m http.server 8000
# then visit http://localhost:8000
```

## Deploy to GitHub Pages

1. Create a public repository on GitHub, for example `portfolio`.
2. Upload all files (keep the folder structure), or push from the terminal:
   ```bash
   git init
   git add .
   git commit -m "Add developer portfolio"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/portfolio.git
   git push -u origin main
   ```
3. In the repository go to **Settings → Pages**, set **Source** to **Deploy from a branch**, choose `main` and `/ (root)`, then save.
4. After a minute the site is live at `https://YOUR-USERNAME.github.io/portfolio/`.

### Deploy to Netlify or Vercel instead

Drag the folder into Netlify Drop, or import the repository in Vercel. No build command is needed; the output directory is the project root.

## Customising

- Text content: edit `index.html`.
- Projects shown in cards and modals: edit the `projects` array in `js/script.js`.
- Colours and fonts: edit the variables at the top of `css/style.css`.
- Add a GitHub link: add an `<a>` in the contact list in `index.html`.

## Tech

HTML5 · CSS3 · JavaScript (ES6+) · Google Fonts (Inter, Space Grotesk)
