# Root & Recepie

Root & Recepie is a web app for cooks who want to make meaningful food traditions without ignoring environmental impact. The app helps users search for recipes, check off ingredients they already have, find nearby stores likely to carry what is missing, and review a hybrid environmental estimate before they cook.

## Live App

- Frontend: [https://green-food-web.vercel.app](https://green-food-web.vercel.app)
- Backend: [https://green-food-4q4w.onrender.com](https://green-food-4q4w.onrender.com)

## What It Does

1. Search recipes through the Edamam Recipe Search API.
2. Open a recipe and review cuisine, diet, health labels, ingredients, and source information.
3. Save a location locally in the browser.
4. Check off ingredients you already have.
5. Find nearby grocery-oriented stores using Google Maps geocoding and Places search.
6. Estimate the environmental impact using:
   - Edamam's recipe carbon class when available
   - Climatiq's trip emissions estimate for the shopping run
7. Blend those two signals into a custom Root & Recepie overall impact score.
8. Save recipes locally so users can jump back to the map and impact steps.

## Custom Impact Score

Root & Recepie does not just show third-party API outputs separately. It also creates its own app-level **overall impact score** that blends:

- **70% recipe impact** from Edamam's `co2EmissionsClass`
- **30% shopping-trip impact** from the Climatiq-based trip estimate

### How it works

1. Edamam's carbon class is mapped to a numeric score:
   - `A+ = 100`
   - `A = 92`
   - `B = 82`
   - `C = 70`
   - `D = 55`
   - `E = 40`
   - `F = 22`
   - `G = 8`
2. The shopping-trip emissions estimate in kilograms of CO2e is also converted into a 0-100 score.
3. Root & Recepie blends them with a `70/30` weighting.
4. The result is labeled as:
   - `Low overall impact`
   - `Lower overall impact`
   - `Moderate overall impact`
   - `Higher overall impact`
   - `High overall impact`

This score is intentionally presented as a **decision aid**, not as an exact scientific lifecycle truth.

## Stack

### Frontend

- Next.js
- React
- Tailwind CSS

### Backend

- Express.js

### APIs

- Edamam Recipe Search API
- Google Maps Geocoding API
- Google Places API
- Google Maps JavaScript API
- Climatiq API

## Project Structure

```text
.
├── api/   # Express backend for API orchestration
├── web/   # Next.js frontend
└── README.md
```

## Setup Instructions

### 1. Install dependencies

```bash
npm install
```

### 2. Create a root `.env.local`

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
EDAMAM_APP_ID=your_edamam_app_id
EDAMAM_APP_KEY=your_edamam_app_key
GOOGLE_MAPS_API_KEY=your_google_maps_server_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_browser_key
CLIMATIQ_API_KEY=your_climatiq_api_key
```

### 3. Run the backend

```bash
npm run dev:api
```

### 4. Run the frontend

```bash
npm run dev:web
```

### 5. Open the app

Visit [http://localhost:3000](http://localhost:3000).

## Deployment Notes

### Vercel

- Framework preset: `Next.js`
- Root directory: `web`
- Required env vars:
  - `NEXT_PUBLIC_API_BASE_URL`
  - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

### Render

- Service type: `Web Service`
- Root directory: `api`
- Build command: `npm install`
- Start command: `npm start`
- Required env vars:
  - `EDAMAM_APP_ID`
  - `EDAMAM_APP_KEY`
  - `GOOGLE_MAPS_API_KEY`
  - `CLIMATIQ_API_KEY`
  - `CORS_ORIGIN`

Example production `CORS_ORIGIN`:

```env
CORS_ORIGIN=https://green-food-web.vercel.app
```

## Screenshots / Demo

Add screenshots, GIFs, or a demo video here before submission. Suggested captures:

- Homepage search
- Recipe list
- Ingredient checklist
- Nearby stores map
- Environmental impact page
- Saved recipes page

## Learning Journey

### What inspired this project

Food is more than fuel. It carries memory, heritage, ritual, and family identity. We wanted to build something that did not frame sustainability as a reason to give those things up, but instead as a reason to make the cooking process more intentional and informed.

### Potential impact

Root & Recepie can help users make recipes they care about while better understanding tradeoffs around shopping and environmental impact. Even in MVP form, the project encourages climate-aware cooking without shaming people for cultural dishes or making them navigate several disconnected tools on their own.

### What new technology we learned and why we chose it

- **Google Maps Places + Geocoding APIs**  
  We used them to turn a saved location into coordinates and nearby store recommendations, which made the product feel much more practical than a recipe browser alone.
- **Climatiq API**  
  We used it to produce a real trip-emissions estimate after Carbon Interface became unavailable during development.
- **Next.js App Router**  
  We used it to keep the multi-step frontend organized while still shipping quickly.

## Technical Rationale

### Why we structured the backend and frontend this way

We used a small monorepo with:

- `web` for the Next.js frontend and client-side workflow
- `api` for the Express backend that talks to all third-party APIs

This kept API keys off the client, gave us one place to normalize vendor responses, and made it easier to manage error handling and rate-limit reduction in a single layer.

### Biggest technical tradeoffs and choices

- **No database for MVP speed**  
  We used browser local storage for saved recipes, location, checklist state, map results, and impact results. This made the prototype fast to build, but state is browser-specific.
- **No Edamam caching**  
  Edamam's terms do not generally allow broad recipe caching, so instead of storing recipe payloads in a database we implemented short-lived in-memory request deduplication and session reuse.
- **Store recommendations, not inventory guarantees**  
  Google Places can help find grocery-oriented stores nearby, but it cannot prove exact ingredient inventory. We explicitly shaped the UX around "likely to carry" rather than pretending to know more than the API does.
- **App-owned environmental score, not a raw API dump**  
  We decided to create a blended Root & Recepie score rather than show Edamam and Climatiq as disconnected numbers. That made the result easier for users to compare, but it also required us to be explicit that the score is a weighted estimate built by our app.

### Most difficult technical bug and how we debugged it

One of the trickiest bugs involved Edamam recipe IDs breaking the Next.js dynamic routes. The IDs are URI-like values, so when they were not encoded correctly they leaked slashes and `#` fragments into URLs like:

```text
/recipes/http:/www.edamam.com/ontologies/edamam.owl#recipe_.../ingredients
```

That produced 404 errors in the middle of the recipe flow. We debugged it by comparing the failing route with the expected encoded form, then introduced a small shared routing helper so recipe IDs are always treated as opaque encoded values when they move through query params and dynamic path segments.

## API Notes and Limitations

- Edamam does not provide a native 1-to-5 user rating in the recipe search flow we used.
- Google Maps does not expose store inventory, so the app recommends nearby grocery-oriented places rather than exact stock.
- Edamam's recipe carbon class is a built-in per-serving rating, but Edamam does not publicly document the full internal methodology behind the grade cutoffs.
- The Root & Recepie overall impact score is an app-level blend of Edamam's recipe carbon class and Climatiq's trip estimate, not a claim of exact total environmental truth.
- Nearby store quality was improved using stricter place-type filtering, tiered fallback, backend scoring, chain-priority boosts, and app-side exclusions for weak matches like convenience/vape/boba-style results.

## AI Usage

Yes, AI tools were used as part of development.

### Example prompt

> Diagnose why clicking "Use this location" leads to a 404 on a dynamic Next.js recipe route where the URL contains an Edamam recipe URI.

### How the AI output had to be adapted

The initial diagnosis correctly pointed to an encoding bug, but the raw suggestion still needed to be adapted to this specific codebase. We added a shared route helper so Edamam IDs are encoded consistently in:

- recipe detail links
- the location step query string
- ingredient, map, impact, and saved-recipe routes

We also verified the fix against the actual failing deployed and local URLs rather than trusting the first suggestion blindly.

## Final Notes

Root & Recepie is intentionally an honest MVP. It combines multiple APIs into one cohesive flow, prioritizes clear tradeoffs over fake precision, and aims to show that environmental awareness and meaningful food traditions can coexist.
