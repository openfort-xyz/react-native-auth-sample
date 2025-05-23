
export const getEncryptionSession = async (): Promise<string> => {
  try {
    // You can find the source code for the backend in the following link:
    // https://github.com/openfort-xyz/auth-sample-backend
    const api = "/api/protected-create-encryption-session";
    const response = await fetch(process.env.EXPO_PUBLIC_API_URL! + api, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to create encryption session');
    }

    const data = await response.json();

    return data.session;
  } catch (error) {
    throw new Error('Failed to create encryption session');
  }
};