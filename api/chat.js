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
        const body = req.body || {};
        const messages = body.messages || [];
        const latestMessage = messages.length > 0 ? messages[messages.length - 1].content : 'Hello';

        const rawKey = process.env.GEMINI_API_KEY;
        if (!rawKey) {
            return res.status(200).json({ reply: "API key is missing in Vercel settings." });
        }

        const apiKey = rawKey.trim().replace(/^["']|["']$/g, '');

        // Updated to use v1beta endpoint for gemini-1.5-flash compatibility
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
            console.error('Gemini API Error:', JSON.stringify(data));
            return res.status(200).json({ reply: `Gemini Error: ${data.error?.message || 'Invalid request'}` });
        }

        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not process that.';
        return res.status(200).json({ reply });

    } catch (e) {
        console.error('Server Crash:', e);
        return res.status(200).json({ reply: 'Server error occurred while connecting to AI.' });
    }
};