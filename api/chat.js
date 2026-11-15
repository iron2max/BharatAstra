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
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;

        const payload = {
            contents: [
                {
                    parts: [
                        { text: "You are the Astra AI assistant on the Bharat Astra website, a school prototype by Team Horizon (Class 9) for disaster detection and awareness. Answer questions about natural disasters (earthquakes, cyclones, tsunamis, floods, wildfires), preparedness, and safety protocols. Keep answers friendly, clear, and concise. In emergencies, tell users to call 112 in India." },
                        { text: latestMessage }
                    ]
                }
            ]
        };

        // Retry logic to handle temporary high-demand spikes gracefully
        let geminiRes;
        let data;
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
            attempts++;
            geminiRes = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            data = await geminiRes.json();

            // If successful or if it's an unrecoverable client error (like invalid key), stop retrying
            if (geminiRes.ok || geminiRes.status === 400 || geminiRes.status === 403) {
                break;
            }

            // If it's a high demand / rate limit error, wait 1.5 seconds before trying again
            if (attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 1500));
            }
        }

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