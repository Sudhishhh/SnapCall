const fs = require('fs');

const key = process.env.GEMINI_API_KEY || '';
const content = `window.__ENV__ = { GEMINI_API_KEY: ${JSON.stringify(key)} };\n`;

fs.writeFileSync('config.js', content, { encoding: 'utf8' });
console.log('Wrote config.js');
