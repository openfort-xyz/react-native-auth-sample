import {
  EmbeddedState,
  OAuthProvider,
  ShieldAuthType,
  ThirdPartyOAuthProvider,
  TokenType,
  type AuthPlayerResponse,
  type Provider,
  type ShieldAuthentication
} from '@openfort/openfort-js';
import { Iframe } from '@openfort/react-native';
import type React from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { getEncryptionSession } from '../utils/getEncryptionSession';
import { openfort } from '../utils/openfortConfig';

type AuthProvider = 'email' | 'apple' | 'google' | null;

interface ContextType {
  user: AuthPlayerResponse | null;
  authState: AuthStatus;
  authProvider: AuthProvider;

  updateState: () => Promise<void>
  getEvmProvider: () => Provider;
  handleRecovery: ({
    method,
    password,
    chainId
  }: {
    method: 'password' | 'automatic',
    chainId: number
    password?: string,
  }) => Promise<{ error?: string }>;
  loginWithIdToken: (
    provider: OAuthProvider.APPLE | OAuthProvider.GOOGLE,
    idToken: string
  ) => Promise<string>;

  signMessage: (
    message: string,
    options?: { hashMessage: boolean; arrayifyMessage: boolean }
  ) => Promise<{ data?: string; error?: Error }>;

  signUpWithEmailPassword: (email: string, password: string, name?: string) => Promise<{ error?: string }>;

  logInWithEmailPassword: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<{ error?: string }>;
}

const OpenfortContext = createContext<ContextType | null>(null);

export const useOpenfort = () => {
  const context = useContext(OpenfortContext);
  if (!context) {
    throw new Error('useOpenfort must be used inside the OpenfortProvider');
  }
  return context;
};

export type AuthStatus =
  | "unauthenticated"  // No user logged in
  | "recovery"         // User needs to input recovery password
  | "authenticated"    // User has logged in successfully
  | "loading";         // Loading state

type OpenfortProps = {
  customUri?: string;
}

export const OpenfortProvider: React.FC<React.PropsWithChildren<OpenfortProps>> = ({
  customUri,
  children,
}) => {
  const [authLoading, setAuthLoading] = useState(false);
  const poller = useRef<NodeJS.Timeout | null>(null);
  const [user, setUser] = useState<AuthPlayerResponse | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [authProvider, setAuthProvider] = useState<AuthProvider>(null);

  const fetchUser = async () => {
    await new Promise((resolve) => setTimeout(resolve));
    const sessionData = await openfort.getUser().catch((error: Error) => {
      console.log("error", error);
    });
    if (sessionData) {
      setUser(sessionData);
    };
    setAuthLoading(false);
  };

  useEffect(() => {
    if (status === 'authenticated' || status === 'recovery')
      fetchUser();
  }, [status]);

  const updateState = async () => {
    try {
      const currentState = await openfort.getEmbeddedState();
      switch (currentState) {
        case EmbeddedState.NONE:
        case EmbeddedState.CREATING_ACCOUNT:
        case EmbeddedState.UNAUTHENTICATED:
          setStatus('unauthenticated');
          break;
        case EmbeddedState.EMBEDDED_SIGNER_NOT_CONFIGURED:
          setStatus('recovery');
          break;
        case EmbeddedState.READY:
          setStatus('authenticated');
          break;
        default:
          throw new Error('Invalid embedded state');
      }
      // console.log('Current state:', currentState);
    } catch (err) {
      console.error('Error checking embedded state with Openfort:', err);
      if (poller.current) clearInterval(poller.current);
    }
  };

  useEffect(() => {
    poller.current = setInterval(updateState, 1000);

    return () => {
      if (poller.current) clearInterval(poller.current);
    };
  }, []);

  const getEvmProvider = useCallback((): Provider => {
    const externalProvider = openfort.getEthereumProvider({
      policy: process.env.EXPO_PUBLIC_POLICY_ID,
    });
    if (!externalProvider) {
      throw new Error('EVM provider is undefined');
    }
    return externalProvider as Provider;
  }, []);

  const auth = useCallback(
    async (provider: OAuthProvider.APPLE | OAuthProvider.GOOGLE, idToken: string): Promise<string> => {
      try {
        const response = await openfort.loginWithIdToken({
          provider,
          token: idToken,
        });
        return response.player.id
      } catch (err) {
        console.error('Error authenticating:', err);
        throw err;
      }
    },
    []
  );

  const signMessage = useCallback(
    async (
      message: string,
      options?: { hashMessage: boolean; arrayifyMessage: boolean }
    ): Promise<{ data?: string; error?: Error }> => {
      await new Promise((resolve) => setTimeout(resolve));
      try {
        const data = await openfort.signMessage(message, options);
        return { data };
      } catch (err) {
        console.error('Error signing message:', err);
        return {
          error:
            err instanceof Error
              ? err
              : new Error('An error occurred signing the message'),
        };
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      setAuthLoading(true);
      await openfort.logout();
      await updateState();
      setAuthProvider(null); // Reset auth provider
      setAuthLoading(false);
      return {};
    } catch (err) {
      console.error('Error logging out with Openfort:', err);
      setAuthLoading(false);
      return { error: 'Error logging out with Openfort' };
    }
  }, []);

  const logInWithEmailPassword = useCallback(
    async (email: string, password: string): Promise<{ error?: string }> => {
      try {
        setAuthLoading(true);
        await new Promise((resolve) => setTimeout(resolve));
        await openfort.logInWithEmailPassword({ email, password });
        setAuthProvider('email'); // Set auth provider
        await updateState();
        setAuthLoading(false);
        return {};
      } catch (err) {
        console.error('Error logging in with email and password:', err);
        setAuthLoading(false);
        return { error: 'Error logging in with email and password' };
      }
    },
    []
  );

  const signUpWithEmailPassword = useCallback(
    async (
      email: string,
      password: string,
      name?: string
    ): Promise<{ error?: string }> => {
      try {
        setAuthLoading(true);
        await new Promise((resolve) => setTimeout(resolve));
        await openfort.signUpWithEmailPassword({ email, password, options: name ? { data: { name } } : undefined });
        setAuthProvider('email'); // Set auth provider
        await updateState();
        setAuthLoading(false);
        return {};
      } catch (err) {
        console.error('Error signing up with email and password:', err);
        setAuthLoading(false);
        return { error: 'Error signing up with email and password' };
      }
    }, []
  );

  const handleRecovery = useCallback(
    async ({ method, password, chainId }: { method: 'password' | 'automatic', password?: string, chainId: number }) => {
      try {
        setAuthLoading(true);
        await new Promise((resolve) => setTimeout(resolve));

        const token = await openfort.getAccessToken()!;
        const session = await getEncryptionSession();
        const shieldAuth = {
          auth: ShieldAuthType.OPENFORT,
          token: token,
          encryptionSession: session,
        };


        if (method === 'automatic') {
          await openfort.configureEmbeddedSigner(chainId, shieldAuth);
          return {};
        } else if (method === 'password') {
          if (!password || password.length < 4) {
            throw new Error('Password recovery must be at least 4 characters');
          }
          await openfort.configureEmbeddedSigner(chainId, shieldAuth, password);
          return {};
        }

        setAuthLoading(false);
        return { error: 'Invalid recovery method' };
      } catch (err) {
        console.error('Error handling recovery with Openfort:', err);

        setAuthLoading(false);
        return { error: 'Error handling recovery with Openfort' };
      }
    },
    [authProvider] // Include authProvider in the dependency array
  );

  const IframeRender = useMemo(() => {
    return <Iframe customUri={customUri} />
  }, [customUri])

  const contextValue: ContextType = {
    user,
    authState: authLoading ? 'loading' : status,
    authProvider,

    updateState,
    logInWithEmailPassword,
    signUpWithEmailPassword,
    loginWithIdToken: auth,
    getEvmProvider,
    handleRecovery,
    signMessage,
    logout,
  };

  return (
    <OpenfortContext.Provider value={contextValue}>
      {IframeRender}
      {children}
    </OpenfortContext.Provider>
  );
};