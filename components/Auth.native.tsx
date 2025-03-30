import { Platform } from 'react-native'
import * as AppleAuthentication from 'expo-apple-authentication'
import { useOpenfort } from '@/hooks/useOpenfort';
import {
    GoogleSignin,
    GoogleSigninButton,
    statusCodes,
  } from '@react-native-google-signin/google-signin'

interface AuthProps {
  onDismiss?: () => void;
}

export function Auth({ onDismiss }: AuthProps) {
    GoogleSignin.configure({
        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
        webClientId: 'YOUR CLIENT ID FROM GOOGLE CONSOLE',
      })
    const { auth } = useOpenfort();
    if (Platform.OS === 'ios')
    return (
        <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
        cornerRadius={5}
        style={{ width: 200, height: 64 }}
        onPress={async () => {
            try {
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
            })
            // Sign in via Openfort Auth.
            if (credential.identityToken) {
                const data = await auth('ios',credential.identityToken)
                console.log(JSON.stringify(data, null, 2))
            } else {
                throw new Error('No identityToken.')
            }
            } catch (e:any) {
                console.log('Error: ', e)
                // Handle user cancellation or errors by calling the onDismiss callback
                // if (e.code === AppleAuthentication.) {
                //   if (onDismiss) onDismiss();
                // }
            }
        }}
        />
    )
    return (
    <GoogleSigninButton
    size={GoogleSigninButton.Size.Wide}
    color={GoogleSigninButton.Color.Dark}
    onPress={async () => {
      try {
        await GoogleSignin.hasPlayServices()
        const userInfo = await GoogleSignin.signIn()
        if (userInfo?.data?.idToken) {
          const data = await auth(
            'android',
            userInfo.data.idToken,
          )
          console.log(data)
        } else {
          throw new Error('no ID token present!')
        }
      } catch (error: any) {
        console.log('Error: ', error)
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
          // User cancelled the login flow
          if (onDismiss) onDismiss();
        } else if (error.code === statusCodes.IN_PROGRESS) {
          // operation (e.g. sign in) is in progress already
        } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          // play services not available or outdated
        } else {
          // some other error happened
        }
      }
    }}
  />)
}