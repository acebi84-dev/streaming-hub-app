import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../../supabase';

export default function AuthCallback() {
  const params = useLocalSearchParams<{ token_hash?: string; type?: string }>();
  const router = useRouter();

  useEffect(() => {
    const verify = async () => {
      const { token_hash, type } = params;

      if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({ token_hash, type: type as any });
        if (error) console.error('verifyOtp error:', error.message);
      } else {
        // Implicit flow: access_token fragment'ta gelir
        const url = await Linking.getInitialURL();
        if (url) {
          const fragment = url.split('#')[1] || '';
          const p = new URLSearchParams(fragment);
          const access_token = p.get('access_token');
          const refresh_token = p.get('refresh_token');
          if (access_token && refresh_token) {
            await supabase.auth.setSession({ access_token, refresh_token });
          }
        }
      }

      router.replace('/');
    };

    verify();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
      <ActivityIndicator size="large" color="#fff" />
    </View>
  );
}
