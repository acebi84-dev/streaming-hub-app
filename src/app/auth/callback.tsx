import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../../supabase';

export default function AuthCallback() {
  const params = useLocalSearchParams<{ token_hash?: string; type?: string }>();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const verify = async () => {
      const { token_hash, type } = params;

      if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({ token_hash, type: type as any });
        if (error) {
          console.error('verifyOtp error:', error.message);
          setStatus('error');
          setTimeout(() => router.replace('/'), 2000);
          return;
        }
        setStatus('success');
        setTimeout(() => router.replace('/'), 1500);
        return;
      }

      // Implicit flow: access_token fragment
      const url = await Linking.getInitialURL();
      if (url) {
        const fragment = url.split('#')[1] || '';
        const p = new URLSearchParams(fragment);
        const access_token = p.get('access_token');
        const refresh_token = p.get('refresh_token');
        if (access_token && refresh_token) {
          await supabase.auth.setSession({ access_token, refresh_token });
          setStatus('success');
          setTimeout(() => router.replace('/'), 1500);
          return;
        }
      }

      router.replace('/');
    };

    verify();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', gap: 16 }}>
      {status === 'loading' && <ActivityIndicator size="large" color="#fff" />}
      {status === 'success' && (
        <>
          <Text style={{ fontSize: 48 }}>✓</Text>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>Email doğrulandı!</Text>
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Uygulamaya yönlendiriliyorsunuz...</Text>
        </>
      )}
      {status === 'error' && (
        <>
          <Text style={{ fontSize: 48 }}>✗</Text>
          <Text style={{ color: '#ff6b6b', fontSize: 18, fontWeight: '700' }}>Doğrulama başarısız</Text>
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Link geçersiz veya süresi dolmuş.</Text>
        </>
      )}
    </View>
  );
}
