# REVNT — Gear up. Ride out.

A responsive website for renting and listing riding gear, built from the REVNT Figma wireframes.
Open `index.html` in any modern browser. No build step or server is needed.

## What's in it
- **Desktop:** sticky top navigation, hero landing page, explore page with a filter sidebar, two-column gear and checkout pages, a listing wizard with live preview, and a two-pane inbox.
- **Phones:** compact header, bottom tab bar, filter bottom-sheet, and a sticky "Rent Now" bar.
- **Themes:** light and dark (follows the device, toggle in the nav or Settings).
- **Motion:** intro loader, page transitions, hero text reveal and rotating word, floating parallax cards, brand marquee, scroll reveals, 3D card tilt, heart bursts, button ripples, count-up numbers, animated chart, confetti and a drawn check on confirmations, typing dots in chat. All motion turns off when the device asks for reduced motion.

## Pages — every Figma frame (URL → frame)
Opening `index.html` starts at the **Splash Screen**, then **Onboarding 1–3**. The full list is also on the site at `#/screens` (footer → "All screens"), with a "Sign in as demo user" button.

| Onboarding | Renting gear | Listing gear | Account |
|---|---|---|---|
| `#/splash` Splash Screen | `#/home` Main App - Home | `#/list` List Gear | `#/earnings` Earnings |
| `#/onboarding/1` Onboarding 1 | `#/explore` Explore | `#/list/photos` Add Photos | `#/messages` Messages |
| `#/onboarding/2` Onboarding 2 | `#/filters` Filters | `#/list/info` Gear Information | `#/messages/Ayush K.` Chat |
| `#/onboarding/3` Onboarding 3 | `#/results` Search Results | `#/list/pricing` Pricing and Availability | `#/notifications` Notifications |
| `#/signin` Sign-in | `#/gear/k5r` Gear Details | `#/list/review` Review Listing | `#/profile` Profile |
| `#/register` Register | `#/checkout` Rental Details | `#/list/live` Listing Live | `#/settings` Settings |
| `#/verify` Verification | `#/payment` Payment | `#/listings` My Listings | `#/help` Help and Support |
| `#/setup` Personalization | `#/confirmed` Renting Confirmed | `#/requests` Rental Requests | `#/terms` Terms and Conditions |
| `#/purpose` Choose Purpose | `#/rentals` My Rentals | `#/requests/1` Request Details | `#/logout` Logout |

Photos: `assets/rent.jpg` (Onboarding 1, "Rent Gear"), `assets/lease.jpg` (Onboarding 2, "Lease Gear"), `assets/both.jpg` (Onboarding 3, "Both"). The same photos appear on the Choose Purpose cards and behind that page.

The browser's back button works. Pages behind sign-in redirect to Sign-in first (any email and a 6+ character password works; demo values are pre-filled).

## Files
- `index.html` — page shell
- `css/styles.css` — colour tokens (light + dark), layouts, components, animations
- `js/data.js` — sample gear, categories, messages, earnings, initial state
- `js/ui.js` — shared components and animation helpers
- `js/pages.js` — every page
- `js/app.js` — routing, actions, navigation bar, tab bar, footer
- `assets/` — logo, avatar, Google and Facebook icons, and the rent / lease / both photos

## Notes
- Fonts (Archivo, Istok Web, IBM Plex Mono) and icons (Material Symbols) load from Google Fonts, so it needs an internet connection. Offline it falls back to system fonts and hides icons.
- Change the brand colour in `css/styles.css` → `--brand` (and its dark-mode value).
- Data is in-memory demo data; refreshing the page resets it (the theme choice is remembered).
- To publish, upload the folder to any static host (GitHub Pages, Netlify, Vercel).
