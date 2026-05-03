/* ===== CONFIG ===== */
const GEMINI_MODEL = 'gemini-2.5-flash';
const DAILY_GOAL = 2000;

/* ===== STATE ===== */
let imageB64   = null;
let logEntries = JSON.parse(localStorage.getItem('snapcal_log') || '[]');
let lastResult = null;
let selectedDate = new Date().toISOString().split('T')[0];

/* ===== DOM REFS ===== */
const dateStrip     = document.getElementById('dateStrip');
const mainProgress  = document.getElementById('mainProgress');
const caloriesLeft  = document.getElementById('caloriesLeft');
const valProtein    = document.getElementById('valProtein');
const valCarbs      = document.getElementById('valCarbs');
const valFats       = document.getElementById('valFats');
const ringProtein   = document.getElementById('ringProtein');
const ringCarbs     = document.getElementById('ringCarbs');
const ringFats      = document.getElementById('ringFats');

const fileInput     = document.getElementById('fileInput');
const uploadTrigger = document.getElementById('uploadTrigger');
const previewImg    = document.getElementById('previewImg');
const aiLoader      = document.getElementById('aiLoader');
const aiResult      = document.getElementById('aiResult');
const fabUpload     = document.getElementById('fabUpload');

const resFoodName   = document.getElementById('resFoodName');
const resKcal       = document.getElementById('resKcal');
const resProtein    = document.getElementById('resProtein');
const resCarbs      = document.getElementById('resCarbs');
const resFats       = document.getElementById('resFats');
const logNowBtn     = document.getElementById('logNowBtn');
const resetBtn      = document.getElementById('resetBtn');

const DASH_CIRCUMFERENCE = 502.65; // for 80r ring

/* ===== INIT ===== */
initDateStrip();
renderDashboard();

/* ===== EVENT LISTENERS ===== */
uploadTrigger.addEventListener('click', () => fileInput.click());
fabUpload.addEventListener('click', () => fileInput.click());

resetBtn.addEventListener('click', () => {
  if (confirm(`Reset log for ${selectedDate}?`)) {
    logEntries = logEntries.filter(e => e.date !== selectedDate);
    localStorage.setItem('snapcal_log', JSON.stringify(logEntries));
    renderDashboard();
    showToast("✅ Log cleared");
  }
});

fileInput.addEventListener('change', () => handleFile(fileInput.files[0]));

async function handleFile(file) {
  if (!file || !file.type.startsWith('image/')) return;
  
  const reader = new FileReader();
  reader.onload = async e => {
    imageB64 = e.target.result;
    previewImg.src = imageB64;
    previewImg.style.display = 'block';
    uploadTrigger.style.display = 'none';
    
    // Automatic analysis
    analyzeMeal();
  };
  reader.readAsDataURL(file);
}

async function analyzeMeal() {
  aiLoader.style.display = 'flex';
  aiResult.style.display = 'none';
  
  const prompt = `Analyze this food image. Provide:
1. Food name
2. Medium portion calories (kcal)
3. Macros: protein (g), carbs (g), fat (g)

Respond ONLY in JSON:
{
  "food": "Name",
  "calories": 0,
  "protein": 0,
  "carbs": 0,
  "fats": 0
}`;

  try {
    const response = await callGeminiVision(prompt, imageB64);
    let data;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      data = JSON.parse(jsonMatch[0]);
    } catch { 
      throw new Error("Bad JSON response");
    }
    lastResult = data;
    showResult(data);
  } catch (err) {
    console.error('Analysis failed:', err);
    const msg = err?.message ? `❌ ${err.message}` : "❌ Analysis failed. Try again.";
    showToast(msg, "error");
    resetUpload();
  } finally {
    aiLoader.style.display = 'none';
  }
}

function showResult(d) {
  resFoodName.textContent = d.food;
  resKcal.textContent = `${d.calories} kcal`;
  resProtein.textContent = `${d.protein}g Protein`;
  resCarbs.textContent = `${d.carbs}g Carbs`;
  resFats.textContent = `${d.fats}g Fat`;
  aiResult.style.display = 'block';
}

function resetUpload() {
  imageB64 = null;
  previewImg.style.display = 'none';
  uploadTrigger.style.display = 'flex';
  aiResult.style.display = 'none';
  fileInput.value = '';
}

logNowBtn.addEventListener('click', () => {
  if (!lastResult) return;
  const entry = {
    ...lastResult,
    id: Date.now(),
    date: selectedDate, // Use the selected date (or switch this back to current today if you prefer)
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    img: imageB64
  };
  logEntries.unshift(entry);
  localStorage.setItem('snapcal_log', JSON.stringify(logEntries));
  
  renderDashboard();
  resetUpload();
  showToast("✅ Meal logged!");
});

/* ===== RENDERING ===== */
function initDateStrip() {
  dateStrip.innerHTML = '';
  // Generate last 14 days
  for(let i = -7; i <= 3; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dateISO = date.toISOString().split('T')[0];
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum  = date.getDate();

    const el = document.createElement('div');
    el.className = `date-item ${dateISO === selectedDate ? 'active' : ''}`;
    el.innerHTML = `
      <span class="date-day">${dayName}</span>
      <span class="date-val">${dayNum}</span>
    `;
    el.onclick = () => {
      selectedDate = dateISO;
      initDateStrip();
      renderDashboard();
      // Auto centers
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    };
    dateStrip.appendChild(el);
    
    // Auto centers today initially
    if(dateISO === selectedDate) {
      setTimeout(() => {
        el.scrollIntoView({ block: 'nearest', inline: 'center' });
      }, 100);
    }
  }
}

function renderDashboard() {
  // Filter by selected date
  const filtered = logEntries.filter(e => e.date === selectedDate);

  const totals = filtered.reduce((acc, curr) => {
    acc.kcal += curr.calories || 0;
    acc.p += curr.protein || 0;
    acc.c += curr.carbs || 0;
    acc.f += curr.fats || 0;
    return acc;
  }, { kcal: 0, p: 0, c: 0, f: 0 });

  caloriesLeft.textContent = totals.kcal;
  
  // Update Rings
  const kcalPercent = Math.min(1, totals.kcal / DAILY_GOAL);
  const offset = DASH_CIRCUMFERENCE - (kcalPercent * DASH_CIRCUMFERENCE);
  mainProgress.style.strokeDashoffset = offset;

  valProtein.textContent = `${totals.p}g`;
  valCarbs.textContent = `${totals.c}g`;
  valFats.textContent = `${totals.f}g`;

  // Mini rings
  updateMiniRing(ringProtein, totals.p / 150);
  updateMiniRing(ringCarbs, totals.c / 250);
  updateMiniRing(ringFats, totals.f / 70);
}


function updateMiniRing(el, percent) {
  el.setAttribute('stroke-dasharray', `${Math.min(100, Math.max(0, percent * 100))}, 100`);
}


/* ===== VISION API (Gemini) ===== */
function getGeminiKey() {
  // Deprecated: key is now handled by /api/gemini serverless proxy.
  return '';
}

async function callGeminiVision(prompt, b64DataUrl) {
  // Call the serverless proxy which uses process.env.GEMINI_API_KEY on the server.
  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, b64: b64DataUrl })
  });

  if (!res.ok) {
    let details = '';
    try {
      details = await res.text();
    } catch {
      details = '';
    }
    throw new Error(`API Error: ${res.status}${details ? ` - ${details}` : ''}`);
  }
  const json = await res.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
  if (!text) throw new Error('Empty response from Gemini');
  return text;
}

/* ===== UTILS ===== */
function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}
