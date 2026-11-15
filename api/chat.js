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

        const rawKey = process.env.GEMINI_API_KEY || process.env.ANTHROPIC_API_KEY;
        if (!rawKey) {
            return res.status(200).json({ reply: "API key is missing in Vercel settings." });
        }

        const apiKey = rawKey.trim().replace(/^["']|["']$/g, '');

        // Using gemini-3.8-flash on the updated v1beta interactions endpoint
        const geminiRes = await fetch(`https://googleapis.com{AQ.Ab8RN6LHYFcycQqIruJ7ZF3VeG97V8mqHl4C8NggtEivde1wFQ}`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Api-Revision': '2026-05-20'
            },
            body: JSON.stringify({
                model: "gemini-3.8-flash",
                input: [
                    {
                        type: "user_input",
                        content: [
                            { type: "text", text: "You are the Astra AI assistant on the Bharat Astra website, a school prototype by Team Horizon (Class 9) for disaster detection and awareness. Answer questions about natural disasters (earthquakes, cyclones, tsunamis, floods, wildfires), preparedness, and safety protocols. Keep answers friendly, clear, and concise. In emergencies, tell users to call 112 in India." },
                            { type: "text", text: latestMessage }
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

        // Clean mapping traversal down the response step parameters safely
        let reply = 'Sorry, I could not process that.';
        if (data.steps && data.steps.length > 0) {
            // Find the model output turn inside the generated metadata block
            const outputStep = data.steps.find(step => step.type === 'model_output');
            if (outputStep && outputStep.content && outputStep.content.length > 0) {
                const textPart = outputStep.content.find(part => part.type === 'text');
                if (textPart && textPart.text) {
                    reply = textPart.text;
                }
            }
        }
        
        return res.status(200).json({ reply });

    } catch (e) {
        console.error('Server Crash:', e);
        return res.status(200).json({ reply: 'Server error occurred while connecting to AI.' });
    }
};
