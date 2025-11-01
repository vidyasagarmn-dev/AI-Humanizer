require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const app = express();

// --- Helper Function for Polling Delay ---
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms)); // Kept for safety, but not used now

// --- Middleware ---
app.use(express.static('public'));
app.use(express.json());

// --- API Endpoint ---
app.post('/api/humanize', async (req, res) => {
    const { text } = req.body;
    // We are now using the standard Canvas API key handling
    const apiKey = "Your_api_key"; 

    // --- GEMINI API CONFIGURATION ---
    const model = 'gemini-2.5-flash-preview-09-2025';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    // System instruction to guide the model's behavior
    const systemInstructionText = `You are a professional editor and humanizer. Your task is to paraphrase the provided text to make it sound more conversational, engaging, and natural, removing overly formal or robotic language. Respond only with the humanized text, without any additional commentary or formatting.`;

    if (!text) {
        return res.status(400).json({ error: 'Text content is required for humanization.' });
    }

    try {
        // Construct the payload for the Gemini API call
        const payload = {
            contents: [{ parts: [{ text: text }] }],
            systemInstruction: {
                parts: [{ text: systemInstructionText }]
            },
        };

        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!apiResponse.ok) {
            const errorData = await apiResponse.json();
            console.error('Gemini API Error:', errorData);
            throw new Error(errorData.error?.message || `Gemini API call failed with status ${apiResponse.status}`);
        }

        const data = await apiResponse.json();
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedText) {
            console.error('Empty response from Gemini:', data);
            throw new Error('Failed to generate humanized text. The model returned an empty response.');
        }

        // --- STEP 3: SEND FINAL RESULT ---
        res.json({ humanizedText: generatedText });

    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ error: error.message || 'An unknown server error occurred during Gemini processing.' });
    }
});

// --- Start the Server ---
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

