# DeadWeight 🌿

### 🏆 1st Place — Hack Club Atlas Hackathon 2026 (placed 1/31)

**Prompt: "Less is More"**

DeadWeight scans any website and shows you exactly how much of it is waste — unused CSS, unused JavaScript, oversized images, unnecessary fonts, and third-party bloat. It converts that waste into grams of CO₂ and gives you specific, actionable recommendations to fix it.

The internet produces roughly 4% of global CO₂ emissions, comparable to the aviation industry. A huge chunk of that comes from websites loading code that never executes and assets that are far larger than they need to be. DeadWeight makes that invisible waste visible.

## How it works

1. You enter a URL
2. DeadWeight opens the page in a headless Chrome browser using Puppeteer
3. It starts Chrome's Coverage API, which tracks every byte of CSS and JavaScript that actually executes versus what was loaded but never used
4. It scrolls the page to trigger lazy-loaded content, then navigates to up to 8 internal pages from the same site, all while coverage keeps accumulating across the session
5. It compares every image's natural resolution against its display size to detect oversized images
6. It checks which font files were downloaded versus which font families are actually rendered
7. It categorizes all third-party requests (analytics, ads, social widgets, CDNs)
8. It converts total waste into CO₂ emissions using the Website Carbon Calculator's methodology (0.81 kWh/GB × 442g CO₂/kWh global grid average)
9. It returns a full report with a sustainability grade, waste breakdown, specific fix recommendations, and environmental impact metrics

## Features

- **Multi-page coverage analysis** — Scans the main page plus up to 8 linked internal pages. Coverage data accumulates across all navigations, so shared bundles are only flagged as waste if the code is unused across the entire session. This avoids false positives on multi-page sites.
- **Known library detection** — Recognizes common libraries like jQuery, Lodash, Moment.js, Chart.js, Bootstrap, Font Awesome, and others. Gives specific replacement suggestions instead of generic "reduce code" advice.
- **Sustainability grade** — A+ through F based on waste percentage.
- **CO₂ impact calculator** — Adjustable monthly pageview input. Shows annual emissions, savings potential, and real-world equivalents (trees needed to offset, hours of Netflix, Google searches, etc.).
- **Snapshot tracking** — Save scan results over time and view a historical dashboard showing waste percentage, page weight, and CO₂ per visit trending across snapshots.
- **Skip button** — If scanning additional pages takes too long, skip the remaining pages and get results from what has been scanned so far.

## Tech stack

- **Backend**: Node.js, Express, Puppeteer
- **Frontend**: React, Vite, Tailwind CSS
- **Analysis**: Chrome DevTools Protocol (CDP), Coverage API, network interception
- **Data**: JSON file-based storage for snapshots

## Getting started

### Prerequisites

- Node.js 18+
- Google Chrome installed

### Install

```bash
# Clone the repo
git clone https://github.com/yourusername/deadweight.git
cd deadweight

# Backend
cd backend
npm install
npx puppeteer browsers install chrome  # if bundled Chrome doesn't install automatically

# Frontend
cd ../frontend
npm install
```

### Configure

If Puppeteer can't find Chrome automatically, update the `executablePath` in `backend/analyzer/index.js`:

```js
const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', // adjust to your Chrome path
  headless: true,
});
```

On Mac this is typically `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`.
On Linux it's usually `/usr/bin/google-chrome`.

### Run

Terminal 1:
```bash
cd backend
node server.js
```

Terminal 2:
```bash
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser.

## Project structure

```
deadweight/
├── backend/
│   ├── server.js                    # Express server, API routes
│   ├── store.js                     # Snapshot storage (JSON file)
│   ├── essentialCache.js            # Essential bytes caching
│   ├── analyzer/
│   │   ├── index.js                 # Main Puppeteer pipeline
│   │   ├── cssAnalyzer.js           # CSS coverage analysis
│   │   ├── jsAnalyzer.js            # JS coverage analysis
│   │   ├── imageAnalyzer.js         # Image size/format analysis
│   │   ├── fontAnalyzer.js          # Font usage detection
│   │   ├── thirdPartyAnalyzer.js    # Third-party request categorization
│   │   └── co2Calculator.js         # Emissions math
│   └── utils/
│       └── cleanFileName.js         # URL to readable filename conversion
├── frontend/
│   ├── src/
│   │   ├── App.jsx                  # Root component, state management
│   │   ├── main.jsx                 # Entry point
│   │   ├── components/
│   │   │   ├── UrlInput.jsx         # Landing page with URL input
│   │   │   ├── LoadingScreen.jsx    # Scanning progress screen
│   │   │   ├── Report.jsx           # Full analysis report
│   │   │   ├── Dashboard.jsx        # Historical snapshot dashboard
│   │   │   ├── Grade.jsx            # Sustainability letter grade
│   │   │   ├── SummaryCard.jsx      # Key metrics (loaded, needed, waste %)
│   │   │   ├── BeforeAfterBar.jsx   # Page composition bar chart
│   │   │   ├── WasteBreakdown.jsx   # Waste by category (CSS, JS, images, fonts)
│   │   │   ├── Impact.jsx           # Real-world CO₂ equivalents
│   │   │   ├── FixList.jsx          # Actionable recommendations
│   │   │   ├── Co2Section.jsx       # CO₂ calculator with pageview input
│   │   │   └── LeafIcon.jsx         # Shared leaf SVG component
│   │   └── utils/
│   │       └── formatBytes.js       # Byte formatting utility
│   └── index.html
└── README.md
```

## API

### `POST /analyze`
Scan a URL. Body: `{ "url": "https://example.com" }`

Returns full analysis report with waste breakdown, recommendations, and CO₂ data.

### `POST /snapshot`
Save a scan result. Body: `{ "url": "...", "report": { ... } }`

### `GET /snapshots?url=...`
Get all saved snapshots for a URL.

### `GET /sites`
List all tracked sites with their latest snapshot data.

### `DELETE /sites?url=...`
Remove a tracked site and all its snapshots.

### `POST /skip`
Tell the backend to stop scanning additional pages and return results from what has been scanned so far.

## Limitations

- **SPA coverage**: Single-page apps load their entire application shell upfront. Features triggered by user interaction (clicking buttons, opening modals) won't be captured by automated page navigation. Coverage numbers for SPAs will always show higher waste than traditional multi-page sites.
- **Dynamic content**: Ads, A/B tests, and personalized content change between visits, which can cause minor variations in scan results.
- **Image estimation**: Optimal image size is estimated from display dimensions and scale factor. Actual savings depend on compression settings and format conversion.
- **CO₂ methodology**: Emissions are calculated using global averages. Actual impact varies by data center location, energy source, CDN caching, and user geography.

## Methodology

- **CSS/JS coverage**: Chrome's Coverage API tracks which byte ranges of each file are actually used during page rendering and script execution.
- **Image analysis**: Compares `naturalWidth`/`naturalHeight` (downloaded resolution) against `clientWidth`/`clientHeight` (display size) for every `<img>` element.
- **Font analysis**: Uses the `document.fonts` API to check which font families are declared versus which are actually rendered. Cross-references against downloaded font files.
- **CO₂ calculation**: `data transferred (GB) × 0.81 kWh/GB × 442 g CO₂/kWh`. Based on the Website Carbon Calculator's published methodology and IEA global grid carbon intensity data.
- **Multi-page scanning**: Coverage is started once and kept running across all page navigations. Chrome automatically unions the used byte ranges, so code that executes on any page counts as used.

## License

MIT
