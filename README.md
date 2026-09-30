# REVNT — interactive prototype

Open `index.html` in any modern browser (Chrome, Safari, Firefox, Edge). No build step or server needed.

- **Phones (≤600px wide, or any touch phone in landscape):** runs full-screen like a real app. The top bar has Back and a screen list.
- **Tablets and desktops:** shows the app inside a phone frame, with the screen map on the side (a "Screens" drawer on tablets).
- **Themes:** light, dark, or match system — switch from the screen map footer or Profile → Settings → Appearance.
- **Deep links:** add a screen id to the URL, e.g. `index.html#payment`.

## Files
- `index.html` — page shell
- `css/styles.css` — colour tokens (light + dark), layout, components
- `js/data.js` — sample gear, messages, earnings, initial state
- `js/screens.js` — one template per Figma frame
- `js/app.js` — actions, navigation, theme, responsive layout
- `assets/` — logo, avatar, Google and Facebook icons

## Notes
- Fonts (Istok Web, IBM Plex Mono) and icons (Material Symbols) load from Google Fonts, so an internet connection is needed for them. Offline, text falls back to system fonts and icons are hidden.
- To add it to a phone's home screen, host the folder anywhere static (GitHub Pages, Netlify, Vercel) and use "Add to Home Screen".
- Change the brand colour in `css/styles.css` → `--brand` (and its dark-mode twin).
