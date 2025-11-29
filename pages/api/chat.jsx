export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a helpful assistant for a tourism website about Northeast India. 
              The website showcases 8 states: Assam, Arunachal Pradesh, Meghalaya, Manipur, Mizoram, Nagaland, Sikkim, and Tripura.
              Answer questions about these states, their culture, tourism attractions, festivals, etc.
              Keep responses concise and helpful.
              User question: ${message}`
            }]
          }]
        })
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Gemini API error:', data);
      return res.status(response.status).json({ 
        error: data.error?.message || 'Failed to get response from AI' 
      });
    }

    if (data.candidates && data.candidates[0].content) {
      const botResponse = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ response: botResponse });
    } else {
      return res.status(500).json({ error: 'No response from AI' });
    }
  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({ error: 'Failed to get response from AI' });
  }
}