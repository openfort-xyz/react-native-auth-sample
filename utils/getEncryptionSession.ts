
export const getEncryptionSession = async (): Promise<string> => {
  try {
    // This application is using the backend of another sample in this repository.
    // You can find the source code for the backend in the following link:
    // https://github.com/openfort-xyz/openfort-js/blob/main/examples/apps/auth-sample/src/pages/api/protected-create-encryption-session.ts

    const api = "https://openfort-auth-non-custodial.vercel.app/api/protected-create-encryption-session";
    const response = await fetch(api, {
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