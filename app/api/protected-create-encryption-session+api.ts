import { StatusError } from 'expo-server';

export async function POST(request: Request) {
    try {
        const response = await fetch(`https://shield.openfort.io/project/encryption-session`, {
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.SHIELD_API_KEY!,
                'x-api-secret': process.env.SHIELD_SECRET_KEY!,
            },
            method: 'POST',
            body: JSON.stringify({
                encryption_part: process.env.SHIELD_ENCRYPTION_SHARE!,
            }),
        })
        const jsonResponse = await response.json()

        return Response.json({ session: jsonResponse.session_id, });
    } catch (e) {
        console.error(`API server error: ${e}`)
        throw new StatusError(500, 'Internal Server Error');
    }
}
