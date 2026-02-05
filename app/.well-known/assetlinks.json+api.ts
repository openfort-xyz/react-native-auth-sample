export async function GET() {
	const packageName =
		process.env.ANDROID_PACKAGE_NAME ?? "com.openfort.exposample";
	const sha256Fingerprints =
		process.env.ANDROID_SHA256_FINGERPRINTS?.split(",").filter(
			(f: string) => f.trim(),
		) ?? [];

	if (sha256Fingerprints.length === 0) {
		return Response.json(
			{ error: "ANDROID_SHA256_FINGERPRINTS not configured" },
			{ status: 500 },
		);
	}

	return Response.json([
		{
			relation: ["delegate_permission/common.handle_all_urls"],
			target: {
				namespace: "android_app",
				package_name: packageName,
				sha256_cert_fingerprints: sha256Fingerprints,
			},
		},
	]);
}
