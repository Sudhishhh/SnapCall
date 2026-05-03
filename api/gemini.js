export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return res.status(500).json({ error: 'Missing GEMINI_API_KEY environment variable' });
  }

  const { prompt, b64 } = req.body;
  if (!b64 || !prompt) {
    return res.status(400).json({ error: 'Missing prompt or b64 image' });
  }

  try {
    const base64Data = b64.split(',')[1];
    const mimeType = b64.split(';')[0].split(':')[1];
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;

    const payload = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Data
              }
            }
          ]
        }
      ]
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText });
    }

    const json = await response.json();
    return res.status(200).json(json);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
