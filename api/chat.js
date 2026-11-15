module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { messages } = req.body || {};
        const latestMessage = messages && messages.length > 0 ? messages[messages.length - 1].content : 'Hello';

        const apiKey = process.env.GEMINI_API_KEY || process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'API key not configured in Vercel settings.' });
        }

        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { text: "You are the Astra AI assistant on the Bharat Astra website, a school prototype by Team Horizon (Class 9) for disaster detection and awareness. Answer questions about natural disasters (earthquakes, cyclones, tsunamis, floods, wildfires), preparedness, and safety protocols. Keep answers friendly, clear, and concise. In emergencies, tell users to call 112 in India." },
                            { text: latestMessage }
                        ]
                    }
                ]
            })
        });

        const data = await geminiRes.json();

        if (!geminiRes.ok) {
            console.error('Gemini API error details:', JSON.stringify(data));
            return res.status(500).json({ error: data.error?.message || 'Gemini API rejected the request.' });
        }

        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not process that.';
        return res.status(200).json({ reply });

    } catch (e) {
        console.error('Server catch error:', e);
        return res.status(500).json({ error: 'Internal server error occurred.' });
    }
};