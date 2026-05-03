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
├─ index.html      # App UI layout
├─ style.css       # Styling and responsive design
├─ app.js          # App logic, state, Gemini API call
└─ huggingface.py  # Quick API test script (now points to Gemini)
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
2. Open the project folder.
3. Launch index.html in your browser.

Optional local server:

```bash
# Python
python -m http.server 5500
```

Then open:

- http://localhost:5500

## API Setup

The app uses Hugging Face Router with Gemma in app.js.

If needed, update these constants in app.js:

- HF_TOKEN
- HF_API
- HF_MODEL

### Vercel deployment

The app uses a serverless function (`api/gemini.js`) that proxies requests to Gemini. The API key is safely stored on the server and never exposed to the client.

1. In the Vercel project settings, create an Environment Variable named `GEMINI_API_KEY` with your Google Gemini API key.
2. Deploy normally — no build step required.
3. The serverless function will use `process.env.GEMINI_API_KEY` to authenticate with Gemini; the client calls `/api/gemini` to send images and receive results.

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



