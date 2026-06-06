import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity, Linking, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../../supabase';

export default function AuthCallback() {
  const params = useLocalSearchParams<{ token_hash?: string; type?: string }>();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const isWeb = Platform.OS === 'web';

  useEffect(() => {
    const verify = async () => {
      const { token_hash, type } = params;

      if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({ token_hash, type: type as any });
        if (error) {
          console.error('verifyOtp error:', error.message);
          setStatus('error');
          if (!isWeb) setTimeout(() => router.replace('/'), 2000);
          return;
        }
        setStatus('success');
        if (!isWeb) setTimeout(() => router.replace('/'), 1500);
        return;
      }

      // Params yok — mobile'da ana sayfaya gönder
      if (!isWeb) router.replace('/');
      else setStatus('error');
    };

    verify();
  }, []);

  if (status === 'loading') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (status === 'success') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', gap: 16, padding: 32 }}>
        <Text style={{ fontSize: 52 }}>✓</Text>
        <Text style={{ color: '#fff', fontSize: 22, fontWeight: '700', textAlign: 'center' }}>
          Email doğrulandı!
        </Text>
        {isWeb ? (
          <>
            <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15, textAlign: 'center', lineHeight: 22 }}>
              Hesabın onaylandı. Uygulamayı telefona aç ve giriş yap.
            </Text>
            <TouchableOpacity
              style={{ backgroundColor: '#fff', paddingHorizontal: 32, paddingVertical: 15, borderRadius: 14, marginTop: 8 }}
              onPress={() => Linking.openURL('izlio://')}
            >
              <Text style={{ color: '#000', fontWeight: '800', fontSize: 16 }}>İzlio'yu Aç</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
            Uygulamaya yönlendiriliyorsunuz...
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', gap: 16, padding: 32 }}>
      <Text style={{ fontSize: 52 }}>✗</Text>
      <Text style={{ color: '#ff6b6b', fontSize: 18, fontWeight: '700', textAlign: 'center' }}>
        Doğrulama başarısız
      </Text>
      <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, textAlign: 'center' }}>
        Link geçersiz veya süresi dolmuş olabilir.
      </Text>
    </View>
  );
}
