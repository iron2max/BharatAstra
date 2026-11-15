exports.handler = async (event) => {
    // Handle CORS preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: ''
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: 'Method not allowed'
        };
    }

    try {
        const { messages } = JSON.parse(event.body || '{}');
        const clean = (messages || []).slice(-10).map(m => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: String(m.content).slice(0, 500)
        }));

        const res = await fetch('https://api.anthropic.com/v1/messages', {
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

        const data = await res.json();
        const reply = (data.content || []).map(b => b.text || '').join('').trim();

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ reply: reply || 'Sorry, I could not answer that.' })
        };
    } catch (e) {
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: 'server error' })
        };
    }
};