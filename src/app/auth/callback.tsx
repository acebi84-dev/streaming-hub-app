import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity, Linking, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

const SUPABASE_URL = 'https://bvggvperehlduxziaqfu.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Q3JqA0F8fU7vE6fQMZ_ZcA_-x5qLhnk';

export default function AuthCallback() {
  const params = useLocalSearchParams<{ token_hash?: string; type?: string }>();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const isWeb = Platform.OS === 'web';

  useEffect(() => {
    let active = true;
    const verify = async () => {
      const { token_hash, type } = params;

      if (token_hash && type) {
        try {
          const res = await fetch(`${SUPABASE_URL}/auth/v1/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY },
            body: JSON.stringify({ token_hash, type }),
          });
          const data = await res.json();
          if (!active) return;
          if (data.error || !res.ok) {
            setStatus('error');
            if (!isWeb) setTimeout(() => router.replace('/'), 2000);
          } else {
            setStatus('success');
            if (!isWeb) setTimeout(() => router.replace('/'), 1500);
          }
        } catch {
          if (!active) return;
          setStatus('error');
          if (!isWeb) setTimeout(() => router.replace('/'), 2000);
        }
        return;
      }

      if (!isWeb) router.replace('/');
      else setStatus('error');
    };

    verify();
    return () => { active = false; };
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
