module.exports = async (req, res) => {
    // Handle CORS headers
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
        const clean = (messages || []).slice(-10).map(m => ({
            apiName: undefined,
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: String(m.content).slice(0, 500)
        }));

        const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 400,
                system: 'You are the Astra AI assistant on the Bharat Astra website, a school prototype by Team Horizon (Class 9) for disaster detection and awareness. You can answer questions about ANY natural disaster (including earthquakes, cyclones, tsunamis, volcanic eruptions, floods, and wildfires), how they occur, science behind them, preparedness, and safety protocols. Be friendly, clear, and concise. In real emergencies, tell people to call their local emergency number (112 in India) and follow official authorities. Never claim the prototype can predict disasters.',
                messages: clean
            })
        });

        const data = await apiRes.json();
        
        if (!apiRes.ok) {
            console.error('Anthropic API error:', data);
            return res.status(500).json({ error: data.error?.message || 'Anthropic error' });
        }

        const reply = (data.content || []).map(b => b.text || '').join('').trim();
        return res.status(200).json({ reply: reply || 'Sorry, I could not answer that.' });

    } catch (e) {
        console.error('Server error:', e);
        return res.status(500).json({ error: 'server error' });
    }
};