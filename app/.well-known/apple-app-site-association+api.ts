export async function GET() {
	const teamId = process.env.APPLE_TEAM_ID;
	const bundleId = process.env.APPLE_BUNDLE_ID ?? "com.openfort.exposample";

	if (!teamId) {
		return Response.json(
			{ error: "APPLE_TEAM_ID not configured" },
			{ status: 500 },
		);
	}

	return Response.json({
		webcredentials: {
			apps: [`${teamId}.${bundleId}`],
		},
	});
}
