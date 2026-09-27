# Business Lead Finder

A university project that lets you search for local businesses by **keyword + city/area**
(e.g. `Bakery` + `Lahore`, `Restaurant` + `Islamabad`, `Pharmacy` + `Karachi`) using the
**Google Places API (New) — Text Search**, then filter, sort, view on a map, and export
the results as CSV or Excel.

Built with **React + TypeScript + Vite**. No backend, no database, no authentication —
everything runs in the browser and talks directly to Google's Places API (New).

---

## Features

- Search by **Business Keyword** + **City / Area** (no browser GPS required)
- Results table with: Business Name, Phone, International Phone, Address, Website,
  Rating, Review Count, Google Maps Link, Business Status, Place ID
- **Local filters** (no extra API calls): Minimum Rating, Phone Required, Website Required
- **Sorting** by Business Name, Rating, or Review Count (ascending/descending)
- **Duplicate removal** by Place ID
- **Statistic cards**: Total Businesses, With Phone, With Website, Average Rating
- **CSV** and **Excel** export of the currently filtered/sorted results
- **1-hour localStorage cache** for identical keyword + location searches, to save
  Google Maps Demo Key quota
- **Last 5 recent searches**, saved in localStorage, one click to re-run
- **Manual "Load More"** pagination (only shown if Google returns a next-page token —
  no automatic/background pagination, to keep quota usage predictable)
- Optional **Map View** with markers, built from the coordinates already returned by
  the Text Search call (no extra Places calls)
- Explicit UI states for: loading, no results, missing API key, network error, and
  quota exceeded
- Responsive, clean UI for desktop and mobile

---

## Tech Stack

- React 19 + TypeScript
- Vite 8 (build tool + dev server)
- Google Maps Platform — **Places API (New)** (Text Search) via plain `fetch`
- Google Maps JavaScript API (loaded dynamically, only if you open Map View)
- [`xlsx`](https://www.npmjs.com/package/xlsx) for Excel export (lazy-loaded, only
  downloaded by the browser when you click "Download Excel")
- Native CSV generation (no extra package needed)

No Firebase, no Gemini API, no database, no authentication, and no scraping is used —
only the official Google Maps Platform REST APIs.

---

## Project Structure

```
business-lead-finder/
├── src/
│   ├── components/          # UI components (form, filters, table, stats, map, etc.)
│   │   ├── SearchForm.tsx
│   │   ├── FiltersPanel.tsx
│   │   ├── StatsCards.tsx
│   │   ├── ResultsTable.tsx
│   │   ├── ExportButtons.tsx
│   │   ├── MapView.tsx
│   │   └── StatusStates.tsx
│   ├── services/
│   │   └── googlePlaces.ts  # All Places API (New) calls live here
│   ├── utils/
│   │   ├── cache.ts             # 1-hour localStorage cache
│   │   ├── recentSearches.ts    # last 5 searches
│   │   ├── businessUtils.ts     # dedupe, filter, sort, stats
│   │   ├── exportCsv.ts
│   │   ├── exportExcel.ts
│   │   └── loadGoogleMapsScript.ts
│   ├── types/
│   │   └── index.ts         # shared TypeScript types
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── tsconfig*.json
└── vite.config.ts
```

---

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ and npm
- A Google Maps Platform API key with **Places API (New)** enabled (a Google Maps
  **Demo Key** is sufficient for coursework/demo purposes — see notes below)

### 2. Install dependencies

```bash
cd business-lead-finder
npm install
```

### 3. Configure your API key

Copy the example env file and add your key:

```bash
cp .env.example .env
```

Edit `.env`:

```
VITE_GOOGLE_MAPS_PLATFORM_KEY=your_google_maps_platform_key_here
```

> `.env` is listed in `.gitignore` and is **never** committed. The key is read only
> through Vite's `import.meta.env.VITE_GOOGLE_MAPS_PLATFORM_KEY` — it is not
> hard-coded anywhere in the source.

**Enable the required API** on your Google Cloud project:
- Go to Google Cloud Console → APIs & Services → Library
- Enable **"Places API (New)"**
- (Optional, only needed for the in-app Map View) Enable **"Maps JavaScript API"**

### 4. Run the development server

```bash
npm run dev
```

Open the printed local URL (typically `http://localhost:5173`).

### 5. Build for production

```bash
npm run build
```

This runs `tsc -b` (type-checking) followed by `vite build`. Output goes to `dist/`.

### 6. Preview the production build (optional)

```bash
npm run preview
```

---

## How to Use

1. Enter a **Business Keyword** (e.g. `Bakery`) and a **City / Area** (e.g. `Lahore`).
2. Click **Find Businesses**.
3. Use the **filters** (Minimum Rating, Phone Required, Website Required) and
   **sorting** controls to narrow down the list — these apply instantly, with no
   extra API calls.
4. Check the **statistic cards** for a quick summary of the filtered results.
5. Click **Download CSV** or **Download Excel** to export exactly what's currently
   shown (i.e., after filters/sorting are applied).
6. Click **Show Map View** to see the results plotted on a map (uses the
   coordinates already returned by the search — no extra API calls).
7. If Google indicates there are more results, a **Load More Results** button
   appears — pagination is manual, one page at a time, by design.

Repeating the exact same keyword + location search within 1 hour is served from a
local cache instead of hitting the API again, to conserve Demo Key quota. Your last
5 searches are saved and shown as quick-access chips under the search box.

---

## API Usage Notes (Demo Key Quota)

The Google Maps **Demo Key** has a limited daily request quota. This project is
built to use it sparingly:

- Only the fields actually displayed are requested, via an explicit
  `X-Goog-FieldMask` header on every Text Search call.
- Identical searches are cached in `localStorage` for 1 hour.
- Filtering and sorting are done **entirely client-side** — changing a filter or
  sort order never triggers a new API call.
- Pagination is **manual only** ("Load More" button) — the app never
  auto-fetches additional pages in the background.
- The Map View reuses coordinates from the original Text Search response; it does
  not call the Places API again (it only loads the Maps JavaScript renderer).

---

## Error / Status Handling

The app shows a dedicated UI state for each of the following:

| State | When it appears |
|---|---|
| Loading | While a search (or "Load More") request is in flight |
| No results | Search succeeded but returned zero matching businesses |
| Missing API key | `VITE_GOOGLE_MAPS_PLATFORM_KEY` is not set |
| Network error | The request failed to reach Google (offline, DNS, etc.) |
| Quota error | Google returned HTTP 429 (daily quota exceeded) |

---

## Known Limitations

- **Demo Key quota**: Google's Demo Key has a modest daily request cap; heavy
  testing can exhaust it for the day. The caching and manual pagination in this
  app are designed to reduce that risk, not eliminate it.
- **`nextPageToken` availability**: Places API (New) Text Search does not always
  return a next-page token, even when more results conceptually exist. The
  "Load More" button only appears when Google actually provides one — this is a
  characteristic of the API itself, not a bug in this project.
- **Map markers**: The optional map view uses the classic `google.maps.Marker`
  (rather than `AdvancedMarkerElement`) so it works without configuring a Map ID.
  Google has marked the classic marker as legacy; it still functions correctly
  but may eventually require migration.
- **No server-side proxy**: Because this is a front-end-only university project,
  the API key is used directly from the browser (standard practice for Demo Key
  / coursework use). For a production app, you would typically proxy Places API
  calls through a backend to keep the key restricted and off the client.
- **`xlsx` package advisory**: `npm audit` flags an advisory for the `xlsx`
  package version used here. It is used only for building an in-memory workbook
  from data you already fetched (no untrusted file parsing), and is lazy-loaded
  so it doesn't affect the initial page load.

---

## License

Created for educational/university project purposes.
