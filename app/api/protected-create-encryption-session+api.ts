export async function POST(_request: Request) {
	const shieldApiKey = process.env.SHIELD_API_KEY ?? "undefined";
	const shieldSecretKey = process.env.SHIELD_SECRET_KEY ?? "undefined";
	const shieldEncryptionShare =
		process.env.SHIELD_ENCRYPTION_SHARE ?? "undefined";

	try {
		const response = await fetch(
			`https://shield.openfort.io/project/encryption-session`,
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
		const jsonResponse = await response.json();

		return Response.json({ session: jsonResponse.session_id });
	} catch (e) {
		console.error(`API server error: ${e}`);
		return Response.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
