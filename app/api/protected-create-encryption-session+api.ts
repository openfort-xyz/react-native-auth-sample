export async function POST() {
	const shieldApiKey = process.env.SHIELD_API_KEY;
	const shieldSecretKey = process.env.SHIELD_SECRET_KEY;
	const shieldEncryptionShare = process.env.SHIELD_ENCRYPTION_SHARE;

	if (!shieldApiKey || !shieldSecretKey || !shieldEncryptionShare) {
		console.error("Missing required Shield environment variables");
		return Response.json(
			{ error: "Shield credentials not configured" },
			{ status: 500 },
		);
	}

	try {
		const response = await fetch(
			"https://shield.openfort.io/project/encryption-session",
			{
				headers: {
					"Content-Type": "application/json",
					"x-api-key": shieldApiKey,
					"x-api-secret": shieldSecretKey,
				},
				method: "POST",
				body: JSON.stringify({
					encryption_part: shieldEncryptionShare,
				}),
			},
		);

		if (!response.ok) {
			console.error(`Shield API error: ${response.status}`);
			return Response.json(
				{ error: "Failed to create encryption session" },
				{ status: 502 },
			);
		}

		const jsonResponse = await response.json();

		if (!jsonResponse.session_id) {
			console.error("Missing session_id in Shield response");
			return Response.json(
				{ error: "Invalid encryption session response" },
				{ status: 502 },
			);
		}

		return Response.json({ session: jsonResponse.session_id });
	} catch (e) {
		console.error(`API server error: ${e}`);
		return Response.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
