exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };
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
                model: 'claude-sonnet-5-5',
                max_tokens: 400,
                system: 'You are the Astra AI assistant on the Bharat Astra website, a school prototype by Team Horizon (Class 9) that detects fire (smoke/flame sensors) and floods (ultrasonic sensor) and shows emergency alerts. Be friendly, clear and concise. Give practical fire and flood safety tips. In real emergencies, tell people to call their local emergency number (112 in India) and follow official authorities. Never claim the prototype can predict disasters.',
                messages: clean
            })
        });
        const data = await res.json();
        const reply = (data.content || []).map(b => b.text || '').join('').trim();
        return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reply: reply || 'Sorry, I could not answer that.' }) };
    } catch (e) {
        return { statusCode: 500, body: JSON.stringify({ error: 'server error' }) };
    }
};
