import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { text, language = 'hi-IN' } = body;

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        if (!process.env.SARVAM_API_KEY) {
            return NextResponse.json({ error: 'SARVAM_API_KEY is not configured.' }, { status: 500 });
        }

        const sarvamRes = await fetch('https://api.sarvam.ai/text-to-speech', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-subscription-key': process.env.SARVAM_API_KEY as string,
            },
            body: JSON.stringify({
                inputs: [text],
                target_language_code: language,
                speaker: "meera",
                pitch: 0,
                pace: 1.0,
                loudness: 1.5,
                speech_sample_rate: 8000,
                enable_preprocessing: true,
                model: "builtin/speech"
            }),
        });

        if (!sarvamRes.ok) {
            const errorText = await sarvamRes.text();
            console.error('Sarvam AI Error:', errorText);
            return NextResponse.json({ error: 'Sarvam AI TTS failed' }, { status: sarvamRes.status });
        }

        const data = await sarvamRes.json();
        
        // The API returns { audios: ["base64string"] }
        if (data.audios && data.audios.length > 0) {
            return NextResponse.json({ audioBase64: data.audios[0] });
        }

        return NextResponse.json({ error: 'Invalid response from Sarvam AI' }, { status: 500 });

    } catch (error) {
        console.error('Sarvam TTS Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
