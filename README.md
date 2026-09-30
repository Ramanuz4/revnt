# REVNT — Gear up. Ride out.

A responsive website for renting and listing riding gear, built from the REVNT Figma wireframes.
Open `index.html` in any modern browser. No build step or server is needed.

## What's in it
- **Desktop:** sticky top navigation, hero landing page, explore page with a filter sidebar, two-column gear and checkout pages, a listing wizard with live preview, and a two-pane inbox.
- **Phones:** compact header, bottom tab bar, filter bottom-sheet, and a sticky "Rent Now" bar.
- **Themes:** light and dark (follows the device, toggle in the nav or Settings).
- **Motion:** intro loader, page transitions, hero text reveal and rotating word, floating parallax cards, brand marquee, scroll reveals, 3D card tilt, heart bursts, button ripples, count-up numbers, animated chart, confetti and a drawn check on confirmations, typing dots in chat. All motion turns off when the device asks for reduced motion.

## Pages (URL → Figma frame)
`#/welcome` Onboarding 1–3 · `#/signin` Sign-in · `#/register` Register · `#/verify` Verification · `#/setup` Personalization · `#/purpose` Choose Purpose ·
`#/home` Main App - Home · `#/explore` Explore, Filters, Search Results · `#/gear/k5r` Gear Details · `#/checkout` Rental Details · `#/payment` Payment · `#/confirmed` Renting Confirmed · `#/rentals` My Rentals ·
`#/list` … `#/list/review` List Gear → Review Listing · `#/list/live` Listing Live · `#/listings` My Listings · `#/requests` Rental Requests + Request Details ·
`#/earnings` Earnings · `#/messages` Messages + Chat · `#/notifications` Notifications · `#/profile` Profile · `#/settings` Settings + Logout · `#/help` Help and Support · `#/terms` Terms and Conditions

The browser's back button works. Pages behind sign-in redirect to Sign-in first (any email and a 6+ character password works; demo values are pre-filled).

## Files
- `index.html` — page shell
- `css/styles.css` — colour tokens (light + dark), layouts, components, animations
- `js/data.js` — sample gear, categories, messages, earnings, initial state
- `js/ui.js` — shared components and animation helpers
- `js/pages.js` — every page
- `js/app.js` — routing, actions, navigation bar, tab bar, footer
- `assets/` — logo, avatar, Google and Facebook icons

## Notes
- Fonts (Archivo, Istok Web, IBM Plex Mono) and icons (Material Symbols) load from Google Fonts, so it needs an internet connection. Offline it falls back to system fonts and hides icons.
- Change the brand colour in `css/styles.css` → `--brand` (and its dark-mode value).
- Data is in-memory demo data; refreshing the page resets it (the theme choice is remembered).
- To publish, upload the folder to any static host (GitHub Pages, Netlify, Vercel).
