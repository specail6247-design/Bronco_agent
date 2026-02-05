const fs = require('fs');

async function testGeminiKey() {
  // Read env file
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const env = {};
  envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join('=').replace(/^["']|["']$/g, '');
      env[key] = value;
    }
  });

  const apiKey = env.GEMINI_API_KEY;
  console.log('🔑 Testing Gemini API Key...');
  console.log('Key (first 20 chars):', apiKey?.substring(0, 20) + '...');
  console.log('Key length:', apiKey?.length);

  // Test API call
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  
  try {
    const response = await fetch(`${url}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: 'Say "Hello, this API key works!"' }]
        }]
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ API Key is VALID!');
      console.log('Response:', data.candidates[0].content.parts[0].text);
    } else {
      console.log('❌ API Key is INVALID');
      console.log('Error:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }
}

testGeminiKey();
