module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const body = req.body || {};
        const messages = body.messages || [];
        const latestMessage = messages.length > 0 ? messages[messages.length - 1].content : 'Hello';

        const rawKey = process.env.GROQ_API_KEY;
        if (!rawKey) {
            return res.status(200).json({ reply: "GROQ_API_KEY is missing in Vercel settings." });
        }

        const apiKey = rawKey.trim().replace(/^["']|["']$/g, '');

        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'openai/gpt-oss-20b',
                max_tokens: 150, // Hard cap to prevent essays
                messages: [
                    {
                        role: 'system',
                        content: "You are Astra AI on Bharat Astra (a Class 9 school prototype by Team Horizon for disaster awareness). Give ultra-short, direct answers (2-3 sentences max, or 3 brief bullet points). Never write long paragraphs or use markdown headers. For emergencies, remind users to call 112 in India."
                    },
                    {
                        role: 'user',
                        content: latestMessage
                    }
                ]
            })
        });

        const data = await groqRes.json();

        if (!groqRes.ok) {
            console.error('Groq API Error:', JSON.stringify(data));
            return res.status(200).json({ reply: `Groq Error: ${data.error?.message || 'Invalid request'}` });
        }

        const reply = data.choices?.[0]?.message?.content || 'Sorry, I could not process that.';
        return res.status(200).json({ reply });

    } catch (e) {
        console.error('Server Crash:', e);
        return res.status(200).json({ reply: 'Server error occurred while connecting to AI.' });
    }
};