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

        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'Anthropic API key not configured on server' });
        }

        // Call Anthropic API using the current model
        const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': apiKey
            },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 1024,
                messages: [
                    { role: 'user', content: latestMessage }
                ]
            })
        });

        const data = await anthropicRes.json();

        if (!anthropicRes.ok) {
            console.error('Anthropic API error:', data);
            return res.status(500).json({ error: data.error?.message || 'Anthropic error' });
        }

        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not process that.';
        return res.status(200).json({ reply });

    } catch (e) {
        console.error('Server error:', e);
        return res.status(500).json({ error: 'server error' });
    }
};