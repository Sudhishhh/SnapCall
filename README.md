# SnapCal

AI-powered calorie tracking from a single meal photo.

SnapCal helps users estimate calories and macros in seconds using image analysis, then tracks daily intake in a fast, mobile-first interface.

## Why SnapCal

Logging food manually is slow and frustrating. SnapCal reduces friction by letting users:

- Capture a meal photo
- Get instant nutrition estimates with AI
- Add the result to their daily log with one tap

## Core Features

- Photo-to-nutrition analysis using Gemini Vision
- Estimated calories, protein, carbs, and fats
- Daily calorie progress ring
- Macro progress mini-rings
- Date-based meal history and totals
- Local persistence using browser localStorage
- Mobile-friendly, app-like UI

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Google Gemini API (Vision)

## Project Structure

```text
snapcal/
├─ index.html      # App UI (Dashboard & Scanning)
├─ style.css       # Premium iOS-inspired design
├─ app.js          # App logic, history management, and API handler
├─ config.js       # Local API configuration (Git-ignored)
└─ api/gemini.js   # Vercel serverless function (Secure Proxy)
```

## Demo Flow

1. Open the app.
2. Tap Scan your meal.
3. Upload or capture a food image.
4. Wait for AI analysis.
5. Tap Add to Daily Log.
6. Review calories and macros for the selected day.

## Run Locally

1. Clone this repository.
2. Create a `config.js` file in the root directory:
   ```javascript
   window.__ENV__ = {
     GEMINI_API_KEY: "YOUR_GOOGLE_GEMINI_API_KEY"
   };
   ```
3. Open `index.html` in your browser.

*Note: `config.js` is ignored by Git to keep your key safe. You can also use `generate-config.js` as a helper tool to create this file from your terminal.*

## API Setup & Deployment

SnapCal uses a **Dual-Mode** API handler to balance ease of development with production security.

### 1. Local Mode
When running via `file://` or a local server, `app.js` reads your key directly from `config.js`. This allows for fast testing without needing a backend.

### 2. Production Mode (Vercel)
When deployed, the app uses a **Secure Proxy** to hide your API key:
- The frontend calls the serverless function at `/api/gemini`.
- This function retrieves the key from Vercel's **Environment Variables**.
- **Result:** Your API key is never exposed to the public or visible in the browser source code.

### Deployment Instructions:
1. Push your code to GitHub.
2. Import the project into **Vercel**.
3. In Vercel **Settings** → **Environment Variables**, add `GEMINI_API_KEY` with your actual key.
4. Deploy!

## New Features
- **Client-side Compression:** Images are automatically resized before upload to bypass Vercel's 4.5MB payload limit and speed up analysis.
- **Meal History:** View, track, and delete meals directly from the dashboard.
- **Auto-Fallback:** Smart API logic that automatically switches between local and proxy modes.

## Usecase

- Solves a real daily pain point in health tracking
- Fast to use, low learning curve, mobile-first
- Strong potential for personalization and nutrition coaching

## Future Improvements

- Better portion-size estimation
- Barcode + packaged-food lookup
- User profiles and goals
- Weekly insights and trends
- Meal suggestions based on macro targets



