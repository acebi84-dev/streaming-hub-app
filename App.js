import React, { useState, useEffect, useRef } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import * as Updates from 'expo-updates';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as ExpoLinking from 'expo-linking';

SplashScreen.preventAutoHideAsync();

async function checkForOTAUpdate() {
  try {
    const update = await Updates.checkForUpdateAsync();
    if (update.isAvailable) {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    }
  } catch (_) {}
}





import {
  StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity,
  Image, ActivityIndicator, SafeAreaView, StatusBar, ScrollView,
  Animated, Modal, KeyboardAvoidingView, Platform, useWindowDimensions,
  PanResponder,
} from 'react-native';
import YoutubeIframe from 'react-native-youtube-iframe';
import { Linking, Share, AppState } from 'react-native';
import ReAnimated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, runOnJS } from 'react-native-reanimated';
import { supabase, supabasePublic, getStoredToken, setStoredToken } from './supabase';
import { Compass, TrendingUp, Film, Sparkles, ChevronLeft, Mail, Eye, EyeOff, Bookmark, User, SlidersHorizontal, CheckCircle, Check, Play, Star, Share2, Trash2, Users, Search, UserPlus, UserMinus, Settings } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
// import * as AppleAuthentication from 'expo-apple-authentication';
// AdMob devre dışı


const PROFILE_GENRES = [
  { id: 'action',    label: 'Aksiyon',      emoji: '💥' },
  { id: 'comedy',    label: 'Komedi',        emoji: '😂' },
  { id: 'drama',     label: 'Drama',         emoji: '🎭' },
  { id: 'crime',     label: 'Suç',           emoji: '🔪' },
  { id: 'scifi',     label: 'Bilim Kurgu',   emoji: '🚀' },
  { id: 'horror',    label: 'Korku',         emoji: '👻' },
  { id: 'documentary', label: 'Belgesel',    emoji: '🎥' },
  { id: 'animation', label: 'Animasyon',     emoji: '🎨' },
  { id: 'romance',   label: 'Romantik',      emoji: '❤️' },
  { id: 'thriller',  label: 'Gerilim',       emoji: '😰' },
  { id: 'fantasy',   label: 'Fantastik',     emoji: '🧙' },
  { id: 'history',   label: 'Tarih',         emoji: '⚔️' },
];
const PROFILE_LANGUAGES = [
  { code: 'tr', label: 'Türkçe',      emoji: '🇹🇷' },
  { code: 'en', label: 'İngilizce',   emoji: '🇬🇧' },
  { code: 'ko', label: 'Korece',      emoji: '🇰🇷' },
  { code: 'ja', label: 'Japonca',     emoji: '🇯🇵' },
  { code: 'es', label: 'İspanyolca',  emoji: '🇪🇸' },
  { code: 'fr', label: 'Fransızca',   emoji: '🇫🇷' },
  { code: 'de', label: 'Almanca',     emoji: '🇩🇪' },
  { code: 'hi', label: 'Hintçe',      emoji: '🇮🇳' },
  { code: 'pt', label: 'Portekizce',  emoji: '🇵🇹' },
  { code: 'zh', label: 'Çince',       emoji: '🇨🇳' },
  { code: 'it', label: 'İtalyanca',   emoji: '🇮🇹' },
  { code: 'ru', label: 'Rusça',       emoji: '🇷🇺' },
];
const PLATFORMS = [
  { slug: 'netflix',     name: 'Netflix',     color: '#E50914', mono: 'N',   darkLogo: 'https://media.movieofthenight.com/services/netflix/logo-white.svg' },
  { slug: 'amazon',      name: 'Prime Video', color: '#00A8E1', mono: 'P',   darkLogo: 'https://media.movieofthenight.com/services/prime/logo-white.svg' },
  { slug: 'disney',      name: 'Disney+',     color: '#0063E5', mono: 'D+',  darkLogo: 'https://media.movieofthenight.com/services/disney/logo-white.svg' },
  { slug: 'hbo',         name: 'HBO Max',     color: '#8B4FBE', mono: 'HBO', darkLogo: 'https://media.movieofthenight.com/services/hbo/logo-white.svg' },
  { slug: 'mubi',        name: 'MUBI',        color: '#000000', mono: 'M',   darkLogo: 'https://media.movieofthenight.com/services/mubi/logo-white.svg' },
  { slug: 'crunchyroll', name: 'Crunchyroll', color: '#FF6600', mono: 'CR',  darkLogo: 'https://media.movieofthenight.com/services/crunchyroll/logo-white.svg' },
];

const GENRE_API_TERM = {
  action: 'Action', comedy: 'Comedy', drama: 'Drama', crime: 'Crime',
  scifi: 'Science', horror: 'Horror', documentary: 'Documentary',
  animation: 'Animation', romance: 'Romance', thriller: 'Thriller',
  fantasy: 'Fantasy', history: 'History',
};

const GENRES = [
  { en: 'Action', tr: 'Aksiyon' }, { en: 'Adventure', tr: 'Macera' },
  { en: 'Animation', tr: 'Animasyon' }, { en: 'Comedy', tr: 'Komedi' },
  { en: 'Crime', tr: 'Suç' }, { en: 'Documentary', tr: 'Belgesel' },
  { en: 'Drama', tr: 'Drama' }, { en: 'Family', tr: 'Aile' },
  { en: 'Fantasy', tr: 'Fantezi' }, { en: 'History', tr: 'Tarih' },
  { en: 'Horror', tr: 'Korku' }, { en: 'Music', tr: 'Müzik' },
  { en: 'Mystery', tr: 'Gizem' }, { en: 'News', tr: 'Haber' },
  { en: 'Reality', tr: 'Reality' }, { en: 'Romance', tr: 'Romantik' },
  { en: 'Science Fiction', tr: 'Bilim Kurgu' }, { en: 'Sport', tr: 'Spor' },
  { en: 'Talk Show', tr: 'Talk Show' }, { en: 'Thriller', tr: 'Gerilim' },
  { en: 'War', tr: 'Savaş' }, { en: 'Western', tr: 'Western' },
];

const IMDB_VALUES = [0, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5];
const YEAR_VALUES = [1950,1980,1990,2000,2005,2010,2015,2018,2019,2020,2021,2022,2023,2024,2025];
const LANGUAGES = [
  { code: 'tr', label: 'Türkçe' }, { code: 'en', label: 'İngilizce' },
  { code: 'ko', label: 'Korece' }, { code: 'ja', label: 'Japonca' },
  { code: 'es', label: 'İspanyolca' }, { code: 'fr', label: 'Fransızca' },
  { code: 'de', label: 'Almanca' }, { code: 'hi', label: 'Hintçe' },
  { code: 'pt', label: 'Portekizce' }, { code: 'zh', label: 'Çince' },
  { code: 'it', label: 'İtalyanca' }, { code: 'ru', label: 'Rusça' },
];
const LANGUAGE_MAP = {
  tr:'Türkçe', en:'İngilizce', ko:'Korece', ja:'Japonca', es:'İspanyolca',
  fr:'Fransızca', de:'Almanca', hi:'Hintçe', pt:'Portekizce', zh:'Çince',
  it:'İtalyanca', ru:'Rusça', ar:'Arapça', sv:'İsveççe', da:'Danca',
  no:'Norveççe', nl:'Felemenkçe', pl:'Lehçe', th:'Tayca', id:'Endonezce',
};
const COMMENTS = [
  "Hangi platformda ne izlesem? 🤔",
  "IMDb puanı yüksek diziler hangileri? 🎬",
  "Komedi türde ne izlesem? 🍿",
  "Bu hafta sonu ne izlesek? 📺",
  "En iyi aksiyon filmleri? 💥",
  "Korece dizilerin IMDb puanları?",
  "Belgesel mi izlesem? 🌍",
  "Aile ile izleyebileceğim bir şey var mı? 👨‍👩‍👧",
];

// Direct REST client — iOS JSC'de Supabase JS auth lock'ı bypass eder
const _SUPA = {
  url: 'https://bvggvperehlduxziaqfu.supabase.co',
  key: 'sb_publishable_Q3JqA0F8fU7vE6fQMZ_ZcA_-x5qLhnk',
  token: null,
};
function _xhrOnce(path, method, body, token) {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.timeout = 6000;
    const done = (data, error) => resolve({ data, error, status: xhr.status });
    xhr.ontimeout = () => resolve({ data: null, error: { message: 'timeout' }, status: 0 });
    xhr.onerror = () => resolve({ data: null, error: { message: 'network' }, status: 0 });
    xhr.onload = () => {
      try {
        const json = xhr.responseText ? JSON.parse(xhr.responseText) : null;
        if (xhr.status >= 200 && xhr.status < 300) done(json, null);
        else done(null, { message: (json && json.message) || 'hata', code: json && json.code });
      } catch (e) { done(null, { message: e.message }); }
    };
    xhr.open(method || 'GET', _SUPA.url + '/rest/v1/' + path);
    xhr.setRequestHeader('apikey', _SUPA.key);
    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    if (body) {
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Prefer', 'resolution=merge-duplicates,return=representation');
    }
    xhr.send(body ? JSON.stringify(body) : null);
  });
}

async function dbXHR(path, method, body) {
  const tok = _SUPA.token || getStoredToken() || _SUPA.key;
  const result = await _xhrOnce(path, method, body, tok);
  const isJwtError = result.status === 401 && result.error && /jwt/i.test(result.error.message || '');
  if (isJwtError) {
    try {
      const { data } = await supabase.auth.refreshSession();
      const newToken = data && data.session && data.session.access_token;
      if (newToken) {
        _SUPA.token = newToken;
        setStoredToken(newToken);
        const retry = await _xhrOnce(path, method, body, newToken);
        return { data: retry.data, error: retry.error };
      }
    } catch (_) {}
  }
  return { data: result.data, error: result.error };
}

// localStorage React Native'de yok — in-memory cache kullanıyoruz, Supabase profile ile senkronize
const _platformCache = { slugs: null };
function getSelectedPlatforms() {
  if (_platformCache.slugs) return _platformCache.slugs;
  return PLATFORMS.map(p => p.slug);
}
function saveSelectedPlatforms(slugs) {
  _platformCache.slugs = slugs;
}
async function savePlatformsToProfile(userId, slugs) {
  _platformCache.slugs = slugs;
  await dbXHR('profiles', 'POST', { id: userId, selected_platforms: slugs, updated_at: new Date().toISOString() });
}

function CarouselComments() {
  const [index, setIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 400, useNativeDriver: true }).start(() => {
        setIndex(prev => (prev + 1) % COMMENTS.length);
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  return (
    <Animated.View style={[styles.commentBubble, { opacity: fadeAnim }]}>
      <Text style={styles.commentText}>{COMMENTS[index]}</Text>
    </Animated.View>
  );
}


// ── Watchlist Helpers ─────────────────────────────────────────
async function getWatchlistEntry(userId, contentId) {
  const { data } = await dbXHR('watchlist?user_id=eq.' + userId + '&content_id=eq.' + contentId + '&select=*');
  return Array.isArray(data) ? (data[0] || null) : null;
}
async function upsertWatchlist(userId, contentId, status, rating) {
  const { data, error } = await dbXHR('watchlist?on_conflict=user_id,content_id', 'POST', {
    user_id: userId, content_id: contentId, status,
    rating: rating !== undefined ? rating : null,
    updated_at: new Date().toISOString(),
  });
  if (error) console.warn('upsertWatchlist error:', JSON.stringify(error), 'status:', status);
  const row = Array.isArray(data) ? (data[0] || null) : null;
  if (!error && ['watched', 'watching', 'want'].includes(status)) {
    logActivity(userId, status, contentId, rating);
  }
  return { data: row, error };
}
async function logActivity(userId, action, contentId, rating) {
  try {
    await dbXHR('activity_feed', 'POST', {
      user_id: userId, action, content_id: contentId,
      rating: rating !== undefined && rating !== null ? rating : null,
    });
  } catch (_) {}
}
async function removeWatchlist(userId, contentId) {
  await dbXHR('watchlist?user_id=eq.' + userId + '&content_id=eq.' + contentId, 'DELETE');
}

function extractYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

// ── Avatar (renkli baş harf, kullanıcı kimliğinden türetilir) ──
const AVATAR_COLORS = ['#FF6B6B', '#FFA94D', '#FFD43B', '#69DB7C', '#38D9A9', '#4DABF7', '#748FFC', '#9775FA', '#DA77F2', '#F783AC', '#00BBF9', '#FB8500'];
function avatarColorFor(seed) {
  const s = String(seed || '');
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}
function avatarInitial(name) {
  const s = (name || '').trim();
  return s ? s.slice(0, 1).toUpperCase() : '?';
}
function Avatar({ seed, name, size = 44 }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: avatarColorFor(seed), alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#fff', fontWeight: '800', fontSize: Math.round(size * 0.42) }}>{avatarInitial(name)}</Text>
    </View>
  );
}
function suggestUsername(input) {
  if (!input) return '';
  const map = { 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u', 'İ': 'i', 'Ç': 'c', 'Ğ': 'g', 'Ö': 'o', 'Ş': 's', 'Ü': 'u' };
  let s = input.toLowerCase().replace(/[çğıöşüİÇĞÖŞÜ]/g, ch => map[ch] || ch);
  s = s.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return s.slice(0, 16);
}

// ── Watchlist Button (içerik kartı için) ─────────────────────
function WatchlistButton({ item, user, style, initialEntry, onUpdate, modalVariant, compact }) {
  const [entry, setEntry] = useState(initialEntry ?? null);
  const [showMenu, setShowMenu] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const isMounted = useRef(true);
  useEffect(() => { return () => { isMounted.current = false; }; }, []);

  useEffect(() => {
    if (initialEntry !== undefined) return; // initialEntry verilmişse DB sorgusu atla
    if (user && item?.id) {
      getWatchlistEntry(user.id, item.id).then(d => { if (isMounted.current) setEntry(d); }).catch(() => {});
    }
  }, [user, item?.id]);

  function setStatus(status) {
    if (!user) return;
    setEntry({ user_id: user.id, content_id: item.id, status, rating: entry?.rating || null });
    setShowMenu(false);
    if (status === 'watched') setShowRating(true);
    upsertWatchlist(user.id, item.id, status, entry?.rating || null)
      .then(({ data }) => { if (isMounted.current && data) setEntry(data); onUpdate?.(); })
      .catch(() => {});
  }

  function setRating(rating) {
    if (!user || !entry) return;
    const prevStatus = entry.status;
    setEntry({ ...entry, rating });
    setShowRating(false);
    upsertWatchlist(user.id, item.id, prevStatus, rating)
      .then(({ data }) => { if (isMounted.current && data) setEntry(data); onUpdate?.(); })
      .catch(() => {});
  }

  function remove() {
    if (!user) return;
    setEntry(null);
    setShowMenu(false);
    removeWatchlist(user.id, item.id).then(() => onUpdate?.()).catch(() => {});
  }

  async function share() {
    const title = item.title_tr || item.title;
    const statusLabel = entry?.status === 'watched' ? 'izledim' : entry?.status === 'watching' ? 'izliyorum' : 'izlemek istiyorum';
    const ratingText = entry?.rating ? ` — ${entry.rating}/10 puan verdim` : '';
    const text = `"${title}" filmini/dizisini ${statusLabel}${ratingText}! 🎬 İzlio ile keşfet.`;
    Share.share({ message: text, title });
    setShowMenu(false);
  }

  const statusConfig = {
    watched:  { label: 'İzledim',          icon: <CheckCircle size={20} color="#51cf66" strokeWidth={2} />, color: '#51cf66' },
    watching: { label: 'İzliyorum',         icon: <Play size={20} color="#339af0" strokeWidth={2} />,        color: '#339af0' },
    want:     { label: 'İzleyeceğim',        icon: <Bookmark size={20} color="#ffd43b" strokeWidth={2} />,    color: '#ffd43b' },
  };

  return (
    <View style={[{ position: 'relative' }, modalVariant && { alignSelf: 'stretch' }, style]}>
      {compact ? (
        <TouchableOpacity
          style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, backgroundColor: entry ? statusConfig[entry.status]?.color + '18' : 'rgba(255,255,255,0.06)' }}
          onPress={() => setShowMenu(true)}
          hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
        >
          {entry ? React.cloneElement(statusConfig[entry.status]?.icon, { size: 13 }) : <Star size={13} color="rgba(255,255,255,0.5)" strokeWidth={2} />}
          <Text style={{ color: entry ? statusConfig[entry.status]?.color : 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '600' }}>
            {entry ? statusConfig[entry.status]?.label : 'Listeye Ekle'}
          </Text>
        </TouchableOpacity>
      ) : (
      <TouchableOpacity
        style={[
          wlStyles.btn,
          modalVariant && { paddingVertical: 16, borderRadius: 14, justifyContent: 'center', gap: 10 },
          entry && { backgroundColor: statusConfig[entry.status]?.color + '22', borderColor: statusConfig[entry.status]?.color },
        ]}
        onPress={() => setShowMenu(true)}
        hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
      >
        {entry ? (modalVariant ? React.cloneElement(statusConfig[entry.status]?.icon, { size: 20 }) : statusConfig[entry.status]?.icon) : <Star size={modalVariant ? 18 : 14} color="rgba(255,255,255,0.7)" strokeWidth={2} />}
        <Text style={[wlStyles.btnText, modalVariant && { fontSize: 15, fontWeight: '700' }, entry && { color: statusConfig[entry.status]?.color }]}>
          {entry ? statusConfig[entry.status]?.label : 'İzleme Listesine Ekle'}
        </Text>
        {entry?.rating && <Text style={[wlStyles.ratingText, { color: statusConfig[entry.status]?.color }]}>★{entry.rating}</Text>}
      </TouchableOpacity>
      )}

      {/* Status menu */}
      <Modal visible={showMenu} transparent animationType="fade" onRequestClose={() => setShowMenu(false)}>
        <TouchableOpacity style={wlStyles.menuOverlay} activeOpacity={1} onPress={() => setShowMenu(false)}>
          <View style={wlStyles.menuBox}>
            <Text style={wlStyles.menuTitle}>{item.title_tr || item.title}</Text>
            {Object.entries(statusConfig).map(([key, cfg]) => (
              <TouchableOpacity key={key} style={[wlStyles.menuItem, entry?.status === key && { backgroundColor: cfg.color + '22' }]} onPress={() => setStatus(key)}>
                {cfg.icon}
                <Text style={[wlStyles.menuItemText, entry?.status === key && { color: cfg.color, fontWeight: '700' }]}>{cfg.label}</Text>
                {entry?.status === key && <CheckCircle size={16} color={cfg.color} strokeWidth={2} style={{ marginLeft: 'auto' }} />}
              </TouchableOpacity>
            ))}
            {entry && <>
              <View style={wlStyles.menuDivider} />
              <TouchableOpacity style={wlStyles.menuItem} onPress={() => { setShowMenu(false); setShowRating(true); }}>
                <Star size={20} color="#ffd43b" strokeWidth={2} />
                <Text style={wlStyles.menuItemText}>Puan Ver {entry.rating ? `(${entry.rating}/10)` : ''}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={wlStyles.menuItem} onPress={share}>
                <Share2 size={20} color="rgba(255,255,255,0.7)" strokeWidth={2} />
                <Text style={wlStyles.menuItemText}>Paylaş</Text>
              </TouchableOpacity>
              <TouchableOpacity style={wlStyles.menuItem} onPress={remove}>
                <Trash2 size={20} color="#ff6b6b" strokeWidth={2} />
                <Text style={[wlStyles.menuItemText, { color: '#ff6b6b' }]}>Listeden Çıkar</Text>
              </TouchableOpacity>
            </>}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Rating modal */}
      <Modal visible={showRating} transparent animationType="fade" onRequestClose={() => setShowRating(false)}>
        <TouchableOpacity style={wlStyles.menuOverlay} activeOpacity={1} onPress={() => setShowRating(false)}>
          <View style={wlStyles.ratingBox}>
            <Text style={wlStyles.menuTitle}>Puan Ver</Text>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 16, textAlign: 'center' }}>{item.title_tr || item.title}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <TouchableOpacity key={n} style={[wlStyles.ratingBtn, entry?.rating === n && { backgroundColor: '#ffd43b', borderColor: '#ffd43b' }]} onPress={() => setRating(n)}>
                  <Text style={[wlStyles.ratingBtnText, entry?.rating === n && { color: '#000' }]}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {entry?.rating && (
              <TouchableOpacity style={{ marginTop: 16, alignItems: 'center', paddingVertical: 12, paddingHorizontal: 20 }} onPress={() => setRating(null)}>
                <Text style={{ color: '#ff6b6b', fontSize: 13 }}>Puanı Kaldır</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const wlStyles = StyleSheet.create({
  btn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  btnText: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '600' },
  ratingText: { fontSize: 12, fontWeight: '700', marginLeft: 4 },
  menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  menuBox: { backgroundColor: '#1c1c1e', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 36 },
  menuTitle: { color: '#fff', fontSize: 17, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 8, borderRadius: 12 },
  menuItemText: { color: 'rgba(255,255,255,0.85)', fontSize: 16 },
  menuDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 8 },
  ratingBox: { backgroundColor: '#1c1c1e', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 },
  ratingBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  ratingBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});

// ── Watchlist Screen ───────────────────────────────────────────
function timeAgo(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const diff = Math.max(0, Date.now() - d.getTime());
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'az önce';
  if (min < 60) return min + ' dk önce';
  const hr = Math.floor(min / 60);
  if (hr < 24) return hr + ' sa önce';
  const day = Math.floor(hr / 24);
  if (day < 7) return day + ' gün önce';
  const week = Math.floor(day / 7);
  if (week < 5) return week + ' hf önce';
  const month = Math.floor(day / 30);
  if (month < 12) return month + ' ay önce';
  return Math.floor(day / 365) + ' yıl önce';
}

function PersonRow({ person, isFollowing, onToggleFollow }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12 }}>
      <Avatar seed={person.id} name={person.display_name || person.username} size={46} />
      <View style={{ flex: 1, gap: 1 }}>
        <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }} numberOfLines={1}>{person.display_name || person.username}</Text>
        {person.username ? <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, fontWeight: '500' }} numberOfLines={1}>@{person.username}</Text> : null}
      </View>
      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12, backgroundColor: isFollowing ? 'rgba(255,255,255,0.08)' : '#fff', borderWidth: 1, borderColor: isFollowing ? 'rgba(255,255,255,0.18)' : '#fff' }}
        onPress={onToggleFollow}>
        {isFollowing ? <UserMinus size={15} color="rgba(255,255,255,0.7)" /> : <UserPlus size={15} color="#000" />}
        <Text style={{ color: isFollowing ? 'rgba(255,255,255,0.7)' : '#000', fontWeight: '700', fontSize: 13 }}>{isFollowing ? 'Takipten Çık' : 'Takip Et'}</Text>
      </TouchableOpacity>
    </View>
  );
}

function WatchlistScreen({ user, onItemPress, onBack }) {
  const { width: winWidth } = useWindowDimensions();
  const isNarrow = winWidth < 360;
  const GRID_COLS = winWidth >= 700 ? 4 : 3;
  const GRID_GAP = 12;
  const gridItemWidth = (winWidth - 32 - GRID_GAP * (GRID_COLS - 1)) / GRID_COLS;
  const gridItemHeight = gridItemWidth * 1.5;
  const [tab, setTab] = useState('list');
  const [listSubTab, setListSubTab] = useState('watched');
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [profile, setProfile] = useState(null);
  const [followingIds, setFollowingIds] = useState([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [feed, setFeed] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [actorMap, setActorMap] = useState({});
  const [followers, setFollowers] = useState([]);
  const [loadingFollowers, setLoadingFollowers] = useState(true);
  const [following, setFollowing] = useState([]);
  const [loadingFollowing, setLoadingFollowing] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const isMounted = useRef(true);
  useEffect(() => { return () => { isMounted.current = false; }; }, []);

  useEffect(() => {
    if (!user) return;
    dbXHR('profiles?id=eq.' + user.id + '&select=display_name,surname,username,birth_date,gender,bio')
      .then(({ data }) => { if (isMounted.current) setProfile(Array.isArray(data) ? data[0] : null); })
      .catch(() => {});
  }, [user?.id]);

  useEffect(() => { fetchItems().catch(() => {}); }, [listSubTab]);

  useEffect(() => {
    if (!user) return;
    init();
  }, [user?.id]);

  async function init() {
    const ids = await loadFollowing();
    fetchFeed(ids);
    fetchFollowers();
    fetchFollowing(ids);
  }

  async function fetchItems() {
    if (!user) { setLoadingItems(false); return; }
    setLoadingItems(true);
    try {
      const sel = 'select=*,content:hub_contents(id,title,title_tr,type,year,imdb_score,poster_url,imdb_id,original_language,synopsis_tr,director,cast_list,trailer_url,tagline,availability:hub_availability(platform_slug,platform_url))';
      const { data } = await dbXHR('watchlist?user_id=eq.' + user.id + '&status=eq.' + listSubTab + '&order=updated_at.desc&' + sel);
      if (isMounted.current) setItems(Array.isArray(data) ? data : []);
    } finally {
      if (isMounted.current) setLoadingItems(false);
    }
  }

  async function loadFollowing() {
    const { data } = await dbXHR('follows?follower_id=eq.' + user.id + '&select=following_id');
    const ids = Array.isArray(data) ? data.map(r => r.following_id) : [];
    if (isMounted.current) setFollowingIds(ids);
    return ids;
  }

  async function fetchFollowers() {
    if (isMounted.current) setLoadingFollowers(true);
    try {
      const { data } = await dbXHR('follows?following_id=eq.' + user.id + '&select=follower_id');
      const ids = Array.isArray(data) ? data.map(r => r.follower_id) : [];
      if (isMounted.current) setFollowerCount(ids.length);
      if (!ids.length) { if (isMounted.current) setFollowers([]); return; }
      const { data: profs } = await dbXHR('public_profiles?id=in.(' + ids.join(',') + ')&select=id,username,display_name&order=display_name.asc');
      if (isMounted.current) setFollowers(Array.isArray(profs) ? profs : []);
    } finally {
      if (isMounted.current) setLoadingFollowers(false);
    }
  }

  async function fetchFollowing(ids) {
    if (isMounted.current) setLoadingFollowing(true);
    try {
      if (!ids || ids.length === 0) { if (isMounted.current) setFollowing([]); return; }
      const { data } = await dbXHR('public_profiles?id=in.(' + ids.join(',') + ')&select=id,username,display_name&order=display_name.asc');
      if (isMounted.current) setFollowing(Array.isArray(data) ? data : []);
    } finally {
      if (isMounted.current) setLoadingFollowing(false);
    }
  }

  async function fetchFeed(ids) {
    if (isMounted.current) setLoadingFeed(true);
    try {
      if (!ids || ids.length === 0) { if (isMounted.current) setFeed([]); return; }
      const sel = 'select=*,content:hub_contents(id,title,title_tr,type,year,imdb_score,poster_url,original_language)';
      const { data } = await dbXHR('activity_feed?user_id=in.(' + ids.join(',') + ')&order=created_at.desc&limit=50&' + sel);
      const rows = Array.isArray(data) ? data : [];
      const actorIds = [...new Set(rows.map(r => r.user_id))];
      if (actorIds.length > 0) {
        const { data: profs } = await dbXHR('public_profiles?id=in.(' + actorIds.join(',') + ')&select=id,username,display_name');
        const map = {};
        (Array.isArray(profs) ? profs : []).forEach(p => { map[p.id] = p; });
        if (isMounted.current) setActorMap(map);
      }
      if (isMounted.current) setFeed(rows);
    } finally {
      if (isMounted.current) setLoadingFeed(false);
    }
  }

  async function runSearch(q) {
    const term = q.trim().toLowerCase();
    if (!term) { setSearchResults([]); setSearching(false); return; }
    setSearching(true);
    try {
      const { data } = await dbXHR('public_profiles?username=ilike.*' + term + '*&id=neq.' + user.id + '&select=id,username,display_name&limit=20');
      if (isMounted.current) setSearchResults(Array.isArray(data) ? data : []);
    } finally {
      if (isMounted.current) setSearching(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(() => runSearch(searchQuery), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  async function toggleFollow(targetId) {
    const isFollowing = followingIds.includes(targetId);
    const newIds = isFollowing ? followingIds.filter(id => id !== targetId) : [...followingIds, targetId];
    setFollowingIds(newIds);
    if (isFollowing) {
      await dbXHR('follows?follower_id=eq.' + user.id + '&following_id=eq.' + targetId, 'DELETE');
    } else {
      await dbXHR('follows', 'POST', { follower_id: user.id, following_id: targetId });
    }
    fetchFeed(newIds);
    fetchFollowing(newIds);
    fetchFollowers();
  }

  const TOP_TABS = [
    { key: 'list', label: 'İzleme Listem' },
    { key: 'feed', label: 'Aktivite Akışı' },
    { key: 'followers', label: 'Takipçi' },
    { key: 'following', label: 'Takip' },
    { key: 'search', label: 'Ara' },
  ];

  const SUB_TABS = [
    { key: 'watched',  label: 'İzledim',    icon: Check },
    { key: 'watching', label: 'İzliyorum',  icon: Play },
    { key: 'want',     label: 'İzleyeceğim', icon: Bookmark },
  ];

  const fullName = [profile?.display_name, profile?.surname].filter(Boolean).join(' ') || profile?.username || 'Kullanıcı';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', marginBottom: 14 }}>
          <ChevronLeft size={20} color="#fff" strokeWidth={2.2} />
          <Text style={{ color: '#fff', fontSize: 17, fontWeight: '700' }}>Profil</Text>
        </TouchableOpacity>
        {/* person card */}
        <View style={{ flexDirection: isNarrow ? 'column' : 'row', alignItems: isNarrow ? 'center' : 'center', gap: 14, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 18, padding: 16, marginBottom: 16 }}>
          <Avatar seed={user?.id} name={profile?.display_name || profile?.username || 'Kullanıcı'} size={isNarrow ? 64 : 72} />
          <View style={{ flex: isNarrow ? undefined : 1, alignItems: isNarrow ? 'center' : 'flex-start', gap: 3, width: isNarrow ? '100%' : undefined }}>
            <Text style={{ color: '#fff', fontSize: 19, fontWeight: '800' }} numberOfLines={1}>{fullName}</Text>
            {profile?.username ? <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: '600' }}>@{profile.username}</Text> : null}
            {profile?.bio ? (
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 6, lineHeight: 18, textAlign: isNarrow ? 'center' : 'left' }} numberOfLines={3}>{profile.bio}</Text>
            ) : null}
            <View style={{ flexDirection: 'row', gap: 26, marginTop: 18 }}>
              <TouchableOpacity onPress={() => setTab('followers')} style={{ alignItems: isNarrow ? 'center' : 'flex-start', gap: 2 }}>
                <Text style={{ color: '#fff', fontSize: 17, fontWeight: '800' }}>{followerCount}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '600' }}>Takipçi</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setTab('following')} style={{ alignItems: isNarrow ? 'center' : 'flex-start', gap: 2 }}>
                <Text style={{ color: '#fff', fontSize: 17, fontWeight: '800' }}>{followingIds.length}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '600' }}>Takip</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, alignItems: 'center', paddingRight: 24 }}>
          {TOP_TABS.map(t => (
            <TouchableOpacity key={t.key}
              style={{ paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20, backgroundColor: tab === t.key ? '#fff' : 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: tab === t.key ? '#fff' : 'rgba(255,255,255,0.12)' }}
              onPress={() => setTab(t.key)}>
              <Text style={{ color: tab === t.key ? '#000' : 'rgba(255,255,255,0.75)', fontWeight: '700', fontSize: 14 }}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {tab === 'list' && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginTop: 10, alignItems: 'center', paddingRight: 24 }}>
            {SUB_TABS.map(t => {
              const Icon = t.icon;
              const sel = listSubTab === t.key;
              return (
                <TouchableOpacity key={t.key}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 13, paddingVertical: 7, borderRadius: 14, backgroundColor: sel ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: sel ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)' }}
                  onPress={() => setListSubTab(t.key)}>
                  <Icon size={14} strokeWidth={1.8} color={sel ? '#fff' : 'rgba(255,255,255,0.5)'} />
                  <Text style={{ color: sel ? '#fff' : 'rgba(255,255,255,0.5)', fontWeight: '600', fontSize: 12 }}>{t.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      {tab === 'list' ? (
        loadingItems ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color="#fff" size="large" />
          </View>
        ) : items.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 }}>
            <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' }}>
              {listSubTab === 'watched' && <Check size={22} color="rgba(255,255,255,0.35)" strokeWidth={1.8} />}
              {listSubTab === 'watching' && <Play size={22} color="rgba(255,255,255,0.35)" strokeWidth={1.8} />}
              {listSubTab === 'want' && <Bookmark size={22} color="rgba(255,255,255,0.35)" strokeWidth={1.8} />}
            </View>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, fontWeight: '600' }}>Henüz içerik yok</Text>
            <Text style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13, textAlign: 'center', paddingHorizontal: 40 }}>
              {listSubTab === 'watched' ? 'İzlediğin içerikleri burada göreceksin' : listSubTab === 'watching' ? 'Şu an izlediğin dizileri buraya ekle' : 'İzlemek istediğin içerikleri buraya kaydet'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={i => i.id}
            numColumns={GRID_COLS}
            key={'grid-' + GRID_COLS}
            columnWrapperStyle={{ gap: GRID_GAP }}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16, gap: GRID_GAP }}
            renderItem={({ item: row }) => {
              const c = row.content;
              if (!c) return null;
              return (
                <TouchableOpacity style={{ width: gridItemWidth }} onPress={() => onItemPress(c)}>
                  {c.poster_url ? (
                    <Image source={{ uri: c.poster_url }} style={{ width: gridItemWidth, height: gridItemHeight, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)' }} resizeMode="cover" />
                  ) : (
                    <View style={{ width: gridItemWidth, height: gridItemHeight, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' }}>
                      <Film size={26} color="rgba(255,255,255,0.3)" />
                    </View>
                  )}
                  <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700', marginTop: 8 }} numberOfLines={1}>{c.original_language === 'tr' && c.title_tr ? c.title_tr : c.title}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 }}>
                    <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>{c.year || (c.type === 'movie' ? 'Film' : 'Dizi')}</Text>
                    {row.rating ? <Text style={{ color: '#ffd43b', fontSize: 12, fontWeight: '700' }}>· ★ {row.rating}</Text> : null}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )
      ) : tab === 'feed' ? (
        loadingFeed ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color="#fff" size="large" />
          </View>
        ) : feed.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingHorizontal: 40 }}>
            <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={30} color="rgba(255,255,255,0.35)" strokeWidth={1.5} />
            </View>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, fontWeight: '600' }}>Henüz aktivite yok</Text>
            <Text style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13, textAlign: 'center' }}>
              Takip ettiklerinin izledikleri içerikleri burada gör
            </Text>
            <TouchableOpacity style={{ paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14, backgroundColor: '#fff' }} onPress={() => setTab('search')}>
              <Text style={{ color: '#000', fontWeight: '700', fontSize: 14 }}>Kullanıcı Ara</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={feed}
            keyExtractor={r => r.id}
            contentContainerStyle={{ padding: 16, gap: 12 }}
            renderItem={({ item: row }) => {
              const c = row.content;
              if (!c) return null;
              const actor = actorMap[row.user_id];
              const actorName = actor?.display_name || (actor?.username ? '@' + actor.username : 'Bir kullanıcı');
              return (
                <TouchableOpacity style={{ flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 10 }} onPress={() => onItemPress(c)}>
                  {c.poster_url ? <Image source={{ uri: c.poster_url }} style={{ width: 52, height: 78, borderRadius: 8 }} resizeMode="cover" /> : <View style={{ width: 52, height: 78, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.08)' }} />}
                  <View style={{ flex: 1, gap: 3 }}>
                    <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12.5 }} numberOfLines={2}>
                      <Text style={{ color: '#fff', fontWeight: '700' }}>{actorName}</Text> {ACTIVITY_ACTION_LABEL[row.action] || row.action} <Text style={{ color: '#fff', fontWeight: '700' }}>{c.original_language === 'tr' && c.title_tr ? c.title_tr : c.title}</Text>
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>{c.type === 'movie' ? 'Film' : 'Dizi'}{c.year ? ` · ${c.year}` : ''}{row.rating ? ` · ★ ${row.rating}/10` : ''}</Text>
                    </View>
                    <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '600', marginTop: 1 }}>{timeAgo(row.created_at)}</Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )
      ) : tab === 'followers' ? (
        loadingFollowers ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color="#fff" size="large" />
          </View>
        ) : followers.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingHorizontal: 40 }}>
            <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={30} color="rgba(255,255,255,0.35)" strokeWidth={1.5} />
            </View>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, fontWeight: '600' }}>Henüz takipçin yok</Text>
          </View>
        ) : (
          <FlatList
            data={followers}
            keyExtractor={p => p.id}
            contentContainerStyle={{ padding: 16, gap: 10 }}
            renderItem={({ item: p }) => (
              <PersonRow person={p} isFollowing={followingIds.includes(p.id)} onToggleFollow={() => toggleFollow(p.id)} />
            )}
          />
        )
      ) : tab === 'following' ? (
        loadingFollowing ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color="#fff" size="large" />
          </View>
        ) : following.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingHorizontal: 40 }}>
            <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={30} color="rgba(255,255,255,0.35)" strokeWidth={1.5} />
            </View>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, fontWeight: '600' }}>Henüz kimseyi takip etmiyorsun</Text>
            <Text style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13, textAlign: 'center' }}>Kullanıcı arayıp takip edebilirsin</Text>
            <TouchableOpacity style={{ paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14, backgroundColor: '#fff' }} onPress={() => setTab('search')}>
              <Text style={{ color: '#000', fontWeight: '700', fontSize: 14 }}>Kullanıcı Ara</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={following}
            keyExtractor={p => p.id}
            contentContainerStyle={{ padding: 16, gap: 10 }}
            renderItem={({ item: p }) => (
              <PersonRow person={p} isFollowing={followingIds.includes(p.id)} onToggleFollow={() => toggleFollow(p.id)} />
            )}
          />
        )
      ) : (
        <View style={{ flex: 1 }}>
          <View style={{ paddingHorizontal: 16, paddingTop: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
              <Search size={18} color="rgba(255,255,255,0.4)" />
              <TextInput style={{ flex: 1, color: '#fff', fontSize: 15 }} placeholder="Kullanıcı adı ile ara..." placeholderTextColor="rgba(255,255,255,0.3)"
                value={searchQuery} autoCapitalize="none" autoCorrect={false} onChangeText={setSearchQuery} />
            </View>
          </View>
          {searching ? (
            <View style={{ paddingTop: 30, alignItems: 'center' }}><ActivityIndicator color="#fff" /></View>
          ) : searchQuery.trim() && searchResults.length === 0 ? (
            <Text style={{ color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginTop: 30, fontSize: 14 }}>Kullanıcı bulunamadı</Text>
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={p => p.id}
              contentContainerStyle={{ padding: 16, gap: 10 }}
              renderItem={({ item: p }) => (
                <PersonRow person={p} isFollowing={followingIds.includes(p.id)} onToggleFollow={() => toggleFollow(p.id)} />
              )}
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const ACTIVITY_ACTION_LABEL = {
  watched: 'izledi',
  watching: 'izliyor',
  want: 'izleme listesine ekledi',
  rated: 'puanladı',
};

function PlatformModal({ visible, selected, onSave, onClose }) {
  const [local, setLocal] = useState(selected);
  useEffect(() => { setLocal(selected); }, [selected, visible]);
  function toggle(slug) {
    setLocal(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]);
  }
  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.platformModalContainer}>
          <TouchableOpacity activeOpacity={1}>
            <View style={styles.platformModalHandle} />
            <Text style={styles.platformModalTitle}>Platform Seç</Text>
            <Text style={styles.platformModalSubtitle}>İzlemek istediğin platformları seç</Text>
            <View style={styles.platformGrid}>
              {PLATFORMS.map(p => {
                const isSel = local.includes(p.slug);
                return (
                  <TouchableOpacity key={p.slug} style={[styles.platformCard, isSel && { borderColor: p.color, borderWidth: 2 }]} onPress={() => toggle(p.slug)}>
                    <View style={[styles.platformCardBg, { backgroundColor: p.color }]}>
                      <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16, letterSpacing: 0.5 }}>{p.name}</Text>
                    </View>
                    {isSel && <View style={[styles.platformCardCheck, { backgroundColor: p.color }]}><Text style={styles.platformCardCheckText}>✓</Text></View>}
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity style={styles.platformSaveBtn} onPress={() => { onSave(local); onClose(); }}>
              <Text style={styles.platformSaveBtnText}>Kaydet ({local.length} platform)</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

function DetailModal({ item, onClose, user }) {
  if (!item) return null;

  const { width: SCREEN_W, height: SCREEN_H } = useWindowDimensions();
  const HEADER_H = Math.round(SCREEN_H * 0.45);

  const [navStack, setNavStack] = React.useState([]);
  const cur = navStack.length > 0 ? navStack[navStack.length - 1] : item;
  const [similarItems, setSimilarItems] = React.useState([]);

  const videoH = Math.round(SCREEN_W * 9 / 16);

  const title = cur.original_language === 'tr' && cur.title_tr ? cur.title_tr : cur.title;
  const typeLabel = cur.type === 'movie' ? 'Film' : 'Dizi';
  const langLabel = cur.original_language ? LANGUAGE_MAP[cur.original_language] : null;
  const youtubeId = extractYouTubeId(cur.trailer_url);
  const metaParts = [typeLabel, cur.year && String(cur.year), langLabel].filter(Boolean);

  React.useEffect(() => {
    setSimilarItems([]);
    if (!cur.imdb_id) return;
    fetchSimilar();
  }, [cur.imdb_id]);

  async function fetchSimilar() {
    try {
      const { data: contentData } = await supabasePublic
        .from('hub_contents').select('similar_tmdb_ids').eq('imdb_id', cur.imdb_id).single();
      const tmdbIds = contentData?.similar_tmdb_ids;
      if (!tmdbIds || tmdbIds.length === 0) return;
      const { data } = await supabasePublic
        .from('hub_contents')
        .select('id, title, title_tr, original_language, imdb_score, poster_url, imdb_id, synopsis_tr, director, cast_list, trailer_url, tagline, type, year, availability:hub_availability(platform_slug, platform_url)')
        .in('tmdb_id', tmdbIds).not('imdb_score', 'is', null);
      const filtered = (data || []).filter(i => i.availability && i.availability.length > 0).slice(0, 10);
      if (filtered.length >= 2) setSimilarItems(filtered);
    } catch (e) {}
  }

  const ImdbBadgeInline = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <View style={{ backgroundColor: '#F5C518', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 }}>
        <Text style={{ color: '#000', fontSize: 9, fontWeight: '900' }}>IMDb</Text>
      </View>
      <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>{cur.imdb_score?.toFixed(1)}</Text>
    </View>
  );

  return (
    <Modal animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>

          {/* ── Media hero ── */}
          <View style={{ height: youtubeId ? videoH : HEADER_H, overflow: 'hidden', backgroundColor: '#000' }}>
            {youtubeId ? (
              <YoutubeIframe
                height={videoH}
                width={SCREEN_W}
                videoId={youtubeId}
                play
                mute
                initialPlayerParams={{ preventFullScreen: false, rel: 0, autoplay: 1 }}
                webViewProps={{ allowsInlineMediaPlayback: true, mediaPlaybackRequiresUserAction: false }}
              />
            ) : cur.poster_url ? (
              <Image source={{ uri: cur.poster_url }} style={{ width: SCREEN_W, height: HEADER_H }} resizeMode="cover" />
            ) : (
              <View style={{ width: SCREEN_W, height: HEADER_H, backgroundColor: '#111' }} />
            )}

            {/* Gradient — poster mode only */}
            {!youtubeId && <>
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 90, backgroundColor: 'rgba(0,0,0,0.38)' }} />
              <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: HEADER_H * 0.68, backgroundColor: 'rgba(0,0,0,0.7)' }} />
            </>}

            {/* Close button */}
            <TouchableOpacity
              style={{ position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', zIndex: 20 }}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>✕</Text>
            </TouchableOpacity>

            {/* Back button */}
            {navStack.length > 0 && (
              <TouchableOpacity
                style={{ position: 'absolute', top: 16, left: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', zIndex: 20 }}
                onPress={() => setNavStack(prev => prev.slice(0, -1))}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <ChevronLeft size={20} color="#fff" strokeWidth={2.5} />
              </TouchableOpacity>
            )}

            {/* Platform badges — top-right column (poster mode) */}
            {!youtubeId && cur.availability?.length > 0 && (
              <View style={{ position: 'absolute', top: 60, right: 16, flexDirection: 'column', gap: 6, zIndex: 20 }}>
                {cur.availability.map(a => {
                  const p = PLATFORMS.find(x => x.slug === a.platform_slug);
                  if (!p) return null;
                  return (
                    <TouchableOpacity key={a.platform_slug}
                      style={{ backgroundColor: p.color, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}
                      onPress={() => openPlatformUrl(a.platform_slug, a.platform_url)}
                      disabled={!a.platform_url}
                    >
                      <Text style={{ color: '#fff', fontWeight: '700', fontSize: 11 }}>{p.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Title + meta — bottom-left overlay (poster mode) */}
            {!youtubeId && (
              <View style={{ position: 'absolute', bottom: 20, left: 20, right: 110, zIndex: 10 }}>
                <Text style={{ color: '#fff', fontSize: 26, fontWeight: '900', letterSpacing: -0.5, marginBottom: 7, lineHeight: 32, textShadowColor: 'rgba(0,0,0,0.9)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 8 }} numberOfLines={3}>
                  {title}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>{metaParts.join(' · ')}</Text>
                  {cur.imdb_score != null && <ImdbBadgeInline />}
                </View>
              </View>
            )}
          </View>

          {/* Title block below YouTube player */}
          {youtubeId && (
            <View style={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 14 }}>
              <Text style={{ color: '#fff', fontSize: 26, fontWeight: '900', letterSpacing: -0.5, marginBottom: 8, lineHeight: 32 }} numberOfLines={3}>
                {title}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{metaParts.join(' · ')}</Text>
                {cur.imdb_score != null && <ImdbBadgeInline />}
              </View>
              {cur.availability?.length > 0 && (
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                  {cur.availability.map(a => {
                    const p = PLATFORMS.find(x => x.slug === a.platform_slug);
                    if (!p) return null;
                    return (
                      <TouchableOpacity key={a.platform_slug}
                        style={{ backgroundColor: p.color, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 }}
                        onPress={() => openPlatformUrl(a.platform_slug, a.platform_url)}
                        disabled={!a.platform_url}
                      >
                        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>{p.name}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          )}

          {/* Separator */}
          <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginHorizontal: 20 }} />

          {/* ── Scrollable content ── */}
          <View style={{ padding: 20 }}>

            {/* Tagline */}
            {cur.tagline ? (
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, fontStyle: 'italic', marginBottom: 20, paddingLeft: 14, borderLeftWidth: 2, borderLeftColor: 'rgba(255,255,255,0.2)', lineHeight: 20 }}>
                "{cur.tagline}"
              </Text>
            ) : null}

            {/* Watchlist — primary full-width */}
            <WatchlistButton item={cur} user={user} modalVariant style={{ marginBottom: 12 }} />

            {/* Trailer open (when trailer_url is not YouTube) */}
            {cur.trailer_url && !youtubeId && (
              <TouchableOpacity
                style={{ borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.28)', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginBottom: 10 }}
                onPress={() => Linking.openURL(cur.trailer_url)}
              >
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>▶  Fragman İzle</Text>
              </TouchableOpacity>
            )}

            {/* IMDb link */}
            {cur.imdb_id && (
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, marginBottom: 20 }}
                onPress={() => Linking.openURL('https://www.imdb.com/title/' + cur.imdb_id + '/')}
              >
                <View style={{ backgroundColor: '#F5C518', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                  <Text style={{ color: '#000', fontSize: 10, fontWeight: '900' }}>IMDb</Text>
                </View>
                <Text style={{ color: '#F5C518', fontSize: 13, fontWeight: '600' }}>↗ imdb.com'da görüntüle</Text>
              </TouchableOpacity>
            )}

            {/* Synopsis */}
            {cur.synopsis_tr ? (
              <View style={{ marginBottom: 22 }}>
                <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.9 }}>Konu</Text>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15, lineHeight: 24 }}>{cur.synopsis_tr}</Text>
              </View>
            ) : null}

            {/* Director */}
            {cur.director ? (
              <View style={{ marginBottom: 14 }}>
                <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.9 }}>Yönetmen</Text>
                <Text style={{ color: 'rgba(255,255,255,0.82)', fontSize: 14, lineHeight: 20 }}>{cur.director}</Text>
              </View>
            ) : null}

            {/* Cast */}
            {cur.cast_list ? (
              <View style={{ marginBottom: 26 }}>
                <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.9 }}>Oyuncular</Text>
                <Text style={{ color: 'rgba(255,255,255,0.82)', fontSize: 14, lineHeight: 20 }}>{cur.cast_list}</Text>
              </View>
            ) : null}

            {/* Similar items */}
            {similarItems.length > 0 && (
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '700', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>Benzer İçerikler</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 4 }}>
                  {similarItems.map(s => {
                    const p = PLATFORMS.find(x => x.slug === s.availability?.[0]?.platform_slug);
                    return (
                      <TouchableOpacity key={s.imdb_id} style={{ width: 96 }}
                        onPress={() => { setSimilarItems([]); setNavStack(prev => [...prev, s]); }}>
                        {s.poster_url
                          ? <Image source={{ uri: s.poster_url }} style={{ width: 96, height: 140, borderRadius: 12, marginBottom: 6 }} resizeMode="cover" />
                          : <View style={{ width: 96, height: 140, borderRadius: 12, backgroundColor: SURFACE, marginBottom: 6 }} />}
                        <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, marginBottom: 4, lineHeight: 15 }} numberOfLines={2}>
                          {s.original_language === 'tr' && s.title_tr ? s.title_tr : s.title}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <View style={styles.imdbBadge}><Text style={styles.imdbBadgeText}>IMDb</Text></View>
                          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>{s.imdb_score?.toFixed(1)}</Text>
                          {p && <View style={[styles.similarPlatformDot, { backgroundColor: p.color }]} />}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const POPULAR_GENRES = [
  { en: 'Action', tr: 'Aksiyon' }, { en: 'Adventure', tr: 'Macera' },
  { en: 'Animation', tr: 'Animasyon' }, { en: 'Comedy', tr: 'Komedi' },
  { en: 'Crime', tr: 'Suç' }, { en: 'Documentary', tr: 'Belgesel' },
  { en: 'Drama', tr: 'Drama' }, { en: 'Family', tr: 'Aile' },
  { en: 'Fantasy', tr: 'Fantezi' }, { en: 'History', tr: 'Tarih' },
  { en: 'Horror', tr: 'Korku' }, { en: 'Music', tr: 'Müzik' },
  { en: 'Mystery', tr: 'Gizem' }, { en: 'Romance', tr: 'Romantik' },
  { en: 'Science Fiction', tr: 'Bilim Kurgu' }, { en: 'Thriller', tr: 'Gerilim' },
  { en: 'War', tr: 'Savaş' }, { en: 'Western', tr: 'Western' },
];


function CollectionsScreen({ selectedPlatforms, onBack, user, initialCollectionId }) {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCollectionId, setActiveCollectionId] = useState(initialCollectionId || null);
  const isMounted = useRef(true);
  useEffect(() => { return () => { isMounted.current = false; }; }, []);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);
  const [sortBy, setCollectionSort] = useState('avg_votes');
  const [sortAscCol, setSortAscCol] = useState(false);
  const [minImdb, setColMinImdb] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [showColScrollTop, setColShowScrollTop] = useState(false);
  const colScrollRef = React.useRef(null);
  const [colSearchInput, setColSearchInput] = useState('');
  const [colActiveSearch, setColActiveSearch] = useState('');

  useEffect(() => { fetchCollections().catch(() => {}); }, [sortBy, sortAscCol]);

  async function fetchCollections() {
    if (!isMounted.current) return;
    setLoading(true);
    try {
      const { data, error } = await supabasePublic
        .from('hub_collections')
        .select('*, items:hub_collection_items(content_id, imdb_score, content:hub_contents(id, title, title_tr, original_language, poster_url, imdb_score, imdb_id, type, year, trailer_url, synopsis_tr, director, cast_list, tagline, availability:hub_availability(platform_slug, platform_url)))')
        .order(sortBy, { ascending: sortAscCol, nullsFirst: false });
      if (error || !isMounted.current) return;
      const filtered = (data || []).filter(col =>
        col.items.some(item =>
          item.content?.availability?.some(a => selectedPlatforms.includes(a.platform_slug))
        )
      );
      if (isMounted.current) setCollections(filtered);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }

  const allGenres = [...new Set(collections.flatMap(c => c.genres ? c.genres.split(', ') : []))].filter(Boolean).sort();
  function toggleColSort(field) { if (sortBy === field) setSortAscCol(!sortAscCol); else { setCollectionSort(field); setSortAscCol(false); } }
  function getColSortIcon(field) { if (sortBy !== field) return ''; return sortAscCol ? ' ↑' : ' ↓'; }

  const filteredCollections = collections.filter(c => {
    if (selectedGenre && !(c.genres && c.genres.includes(selectedGenre))) return false;
    if (minImdb > 0 && (c.avg_imdb_score || 0) < minImdb) return false;
    if (colActiveSearch && !((c.name||'').toLowerCase().includes(colActiveSearch.toLowerCase()) || (c.name_tr||'').toLowerCase().includes(colActiveSearch.toLowerCase()))) return false;
    return true;
  });

  const genreMap = Object.fromEntries(GENRES.map(g => [g.en, g.tr]));
  const hasColActiveFilters = selectedGenre || minImdb > 0 || sortBy !== 'avg_votes' || sortAscCol || colActiveSearch;
  const displayedCollections = activeCollectionId ? filteredCollections.filter(c => c.id === activeCollectionId) : filteredCollections;

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <DetailModal key={selectedItem?.id || 'modal'} item={selectedItem} onClose={() => setSelectedItem(null)} user={user} />
      <View style={[styles.header, { flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: '300', lineHeight: 26 }}>‹</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.sectionTitle}>Koleksiyonlar</Text>
      </View>
      <View style={[styles.searchContainer, { marginHorizontal: 16, marginVertical: 8 }]}>
        <TextInput maxFontSizeMultiplier={1} style={[styles.searchInput, { flex: 1 }]} placeholder="Koleksiyon ara..." placeholderTextColor="#ffffff44" value={colSearchInput} onChangeText={setColSearchInput} onSubmitEditing={() => setColActiveSearch(colSearchInput)} returnKeyType="search" />
        {colSearchInput.length > 0 && <TouchableOpacity style={styles.clearBtn} onPress={() => { setColSearchInput(''); setColActiveSearch(''); }}><Text style={styles.clearBtnText}>✕</Text></TouchableOpacity>}
        <TouchableOpacity style={styles.searchIconBtn} onPress={() => setColActiveSearch(colSearchInput)}>
          <Text style={styles.searchIconText}>⌕</Text>
        </TouchableOpacity>
      </View>
      {activeCollectionId && (
        <TouchableOpacity style={{ marginHorizontal: 16, marginBottom: 6, flexDirection: 'row', alignItems: 'center', gap: 6 }} onPress={() => setActiveCollectionId(null)}>
          <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>‹ Tüm Koleksiyonlar</Text>
        </TouchableOpacity>
      )}
      {/* Filter button */}
      <TouchableOpacity style={[styles.filtersBtn, (selectedGenre || minImdb > 0) && styles.filtersBtnActive]} onPress={() => setShowFilters(!showFilters)}>
        <Text style={[styles.filtersBtnText, (selectedGenre || minImdb > 0) && styles.filtersBtnTextActive]}>
          {showFilters ? '▲' : '▼'} Filtreler & Sıralama
          {(selectedGenre || minImdb > 0) ? ' ●' : ''}
        </Text>
      </TouchableOpacity>

      {showFilters && (
        <View style={[styles.filtersBox, { zIndex: 10 }]}>
          {/* Sıralama */}
          <Text style={styles.filterSectionTitle}>Sıralama</Text>
          <View style={styles.sortRow}>
            {[['avg_votes', 'Ortalama Oy'], ['avg_imdb_score', 'IMDb Puanı']].map(([val, label]) => (
              <TouchableOpacity key={val} style={[styles.sortBtn, sortBy === val && styles.sortBtnActive]} onPress={() => toggleColSort(val)}>
                <Text style={[styles.sortBtnText, sortBy === val && styles.sortBtnTextActive]}>{label}{getColSortIcon(val)}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={[styles.sortBtn, styles.sortDirBtn]} onPress={() => setSortAscCol(!sortAscCol)}>
              <Text style={styles.sortBtnText}>{sortAscCol ? '↑ Artan' : '↓ Azalan'}</Text>
            </TouchableOpacity>
          </View>
          {/* Tür */}
          <Text style={styles.filterLabel}>Tür: <Text style={styles.filterValue}>{selectedGenre ? (genreMap[selectedGenre] || selectedGenre) : 'Tümü'}</Text></Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            <TouchableOpacity style={[styles.sliderBtn, !selectedGenre && styles.sliderBtnActive]} onPress={() => setSelectedGenre(null)}>
              <Text style={[styles.sliderBtnText, !selectedGenre && styles.sliderBtnTextActive]}>Tümü</Text>
            </TouchableOpacity>
            {allGenres.map(g => (
              <TouchableOpacity key={g} style={[styles.sliderBtn, selectedGenre === g && styles.sliderBtnActive]} onPress={() => setSelectedGenre(selectedGenre === g ? null : g)}>
                <Text style={[styles.sliderBtnText, selectedGenre === g && styles.sliderBtnTextActive]}>{genreMap[g] || g}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {/* Min IMDb */}
          <Text style={styles.filterLabel}>IMDb Puanı: <Text style={styles.filterValue}>{minImdb > 0 ? `${minImdb}+` : 'Tümü'}</Text></Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            {[0, 6, 7, 7.5, 8].map(val => (
              <TouchableOpacity key={val} style={[styles.sliderBtn, minImdb === val && styles.sliderBtnActive]} onPress={() => setColMinImdb(val)}>
                <Text style={[styles.sliderBtnText, minImdb === val && styles.sliderBtnTextActive]}>{val === 0 ? 'Tümü' : `${val}+`}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {/* Reset */}
          <TouchableOpacity style={styles.resetBtnInline} onPress={() => { setSelectedGenre(null); setColMinImdb(0); setCollectionSort('avg_votes'); setSortAscCol(false); }}>
            <Text style={styles.resetBtnInlineText}>Sıfırla</Text>
          </TouchableOpacity>
        </View>
      )}



      <ScrollView ref={colScrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }} onScroll={e => setColShowScrollTop(e.nativeEvent.contentOffset.y > 400)} scrollEventThrottle={16}>
        {loading ? (
          <ActivityIndicator size="large" color={ACCENT} style={{ marginTop: 60 }} />
        ) : (
          displayedCollections.map(col => {
            const items = col.items
              .filter(i => i.content?.availability?.some(a => selectedPlatforms.includes(a.platform_slug)))
              .sort((a, b) => (b.imdb_score || 0) - (a.imdb_score || 0));
            if (items.length === 0) return null;

            return (
              <View key={col.id} style={styles.popularSection}>
                <View style={styles.collectionHeader}>
                  <Text style={styles.collectionName}>{col.name_tr || col.name}</Text>
                  <View style={styles.collectionMeta}>
                    <View style={styles.imdbBadge}><Text style={styles.imdbBadgeText}>IMDb</Text></View>
                    <Text style={styles.collectionScore}>Ort. {col.avg_imdb_score?.toFixed(1)}</Text>
                    <Text style={styles.collectionCount}>· {items.length} film</Text>
                    {col.avg_votes && <Text style={styles.collectionCount}>· {(col.avg_votes / 1000).toFixed(0)}K oy</Text>}
                  </View>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.popularRow}>
                  {items.map(item => {
                    const c = item.content;
                    if (!c) return null;
                    const platforms = c.availability?.filter(a => selectedPlatforms.includes(a.platform_slug)) || [];
                    return (
                      <TouchableOpacity key={c.id} style={styles.popularCard} onPress={() => {
                          setSelectedItem({ ...c, availability: platforms });
                        }}>
                        {c.poster_url
                          ? <Image source={{ uri: c.poster_url }} style={styles.popularCardImg} resizeMode="cover" />
                          : <View style={[styles.popularCardImg, { backgroundColor: SURFACE }]} />}
                        <Text style={styles.popularCardTitle} numberOfLines={2}>{c.original_language === 'tr' && c.title_tr ? c.title_tr : c.title}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                          {c.imdb_score && <><View style={styles.imdbBadge}><Text style={styles.imdbBadgeText}>IMDb</Text></View><Text style={styles.popularScore}>{c.imdb_score.toFixed(1)}</Text></>}
                          {platforms.map(a => { const p = PLATFORMS.find(x => x.slug === a.platform_slug); return p ? <View key={p.slug} style={[styles.similarPlatformDot, { backgroundColor: p.color }]} /> : null; })}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            );
          })
        )}
      </ScrollView>
      {showColScrollTop && (
        <TouchableOpacity style={styles.scrollTopBtn} onPress={() => colScrollRef.current?.scrollTo({ x: 0, y: 0, animated: true })}>
          <Text style={styles.scrollTopIcon}>↑</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}



function NewScreen({ selectedPlatforms, onBack, user }) {
  const [items, setItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week');
  const isMountedNew = useRef(true);
  useEffect(() => { return () => { isMountedNew.current = false; }; }, []);
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [genreFilter, setGenreFilter] = useState(null);
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => { fetchNew().catch(e => { console.error('fetchNew error:', e); setLoading(false); }); }, [selectedPlatforms, period]);

  async function fetchNew() {
    if (!isMountedNew.current) return;
    setLoading(true);
    try {
      const now = new Date();
      let fromDate;
      if (period === 'day') {
        fromDate = new Date(now); fromDate.setDate(now.getDate() - 1);
      } else if (period === 'week') {
        fromDate = new Date(now); fromDate.setDate(now.getDate() - 7);
      } else {
        fromDate = new Date(now); fromDate.setMonth(now.getMonth() - 1);
      }
      const fromStr = fromDate.toISOString().split('T')[0];
      const platforms = selectedPlatforms.length > 0 ? selectedPlatforms : PLATFORMS.map(p => p.slug);
      const { data, error } = await supabasePublic
        .from('hub_availability')
        .select('platform_slug, platform_url, available_since, content:hub_contents(id, title, title_tr, original_language, imdb_score, poster_url, imdb_id, type, year, synopsis_tr, director, cast_list, trailer_url, tagline, genre)')
        .in('platform_slug', platforms)
        .gte('available_since', fromStr)
        .order('available_since', { ascending: false })
        .limit(300);
      if (!isMountedNew.current || error) return;
      const grouped = {};
      (data || []).forEach(row => {
        if (!row.content) return;
        const slug = row.platform_slug;
        if (!grouped[slug]) grouped[slug] = [];
        grouped[slug].push({ ...row.content, platform_url: row.platform_url, available_since: row.available_since });
      });
      if (isMountedNew.current) setItems(grouped);
    } finally {
      if (isMountedNew.current) setLoading(false);
    }
  }

  function filterItems(list) {
    let result = list;
    if (typeFilter === 'movie') result = result.filter(i => i.type === 'movie');
    if (typeFilter === 'series') result = result.filter(i => i.type === 'series');
    if (genreFilter) result = result.filter(i => i.genre && i.genre.includes(genreFilter));
    return result;
  }

  const platformOrder = PLATFORMS.filter(p => selectedPlatforms.includes(p.slug));
  const selectedGenreLabel = POPULAR_GENRES.find(g => g.en === genreFilter)?.tr || 'Tür';

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <DetailModal key={selectedItem?.id || 'modal'} item={selectedItem} onClose={() => setSelectedItem(null)} user={user} />
      <View style={[styles.popularHeader, { flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: '300', lineHeight: 26 }}>‹</Text>
          </TouchableOpacity>
        )}
        <View>
          <Text style={styles.sectionTitle}>En Yeniler</Text>
          <Text style={styles.popularHeaderSub}>Platforma yeni eklenenler</Text>
        </View>
      </View>
      <View style={styles.popularTopBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.popularTopBarRow}>
          {[['all','Tümü'],['series','Diziler'],['movie','Filmler']].map(([val, label]) => (
            <TouchableOpacity
              key={val}
              style={[styles.popularTopBtn, typeFilter === val && styles.popularTopBtnActive]}
              onPress={() => { setTypeFilter(val); setShowGenreDropdown(false); }}
            >
              <Text style={[styles.popularTopBtnText, typeFilter === val && styles.popularTopBtnTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
          <View style={styles.popularTopSeparator} />
          <TouchableOpacity
            style={[styles.popularTopBtn, genreFilter !== null && styles.popularTopBtnGenreActive]}
            onPress={() => setShowGenreDropdown(!showGenreDropdown)}
          >
            <Text style={[styles.popularTopBtnText, genreFilter !== null && styles.popularTopBtnTextGenreActive]}>{selectedGenreLabel} ▾</Text>
          </TouchableOpacity>
          {genreFilter && (
            <TouchableOpacity style={styles.popularTopBtn} onPress={() => setGenreFilter(null)}>
              <Text style={styles.popularTopBtnText}>✕</Text>
            </TouchableOpacity>
          )}
          <View style={styles.popularTopSeparator} />
          <TouchableOpacity
            style={[styles.popularTopBtn, styles.popularTopBtnActive]}
            onPress={() => { setShowPeriodDropdown(!showPeriodDropdown); setShowGenreDropdown(false); }}
          >
            <Text style={styles.popularTopBtnTextActive}>
              {period === 'day' ? 'Bugün' : period === 'week' ? 'Bu Hafta' : 'Bu Ay'} ▾
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      {showGenreDropdown && (
        <View style={styles.genreDropdown}>
          <ScrollView style={{ maxHeight: 240 }} showsVerticalScrollIndicator={false}>
            {POPULAR_GENRES.map(g => (
              <TouchableOpacity
                key={g.en}
                style={[styles.genreDropdownItem, genreFilter === g.en && styles.genreDropdownItemActive]}
                onPress={() => { setGenreFilter(genreFilter === g.en ? null : g.en); setShowGenreDropdown(false); }}
              >
                <Text style={[styles.genreDropdownText, genreFilter === g.en && styles.genreDropdownTextActive]}>{g.tr}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      {showPeriodDropdown && (
        <View style={styles.genreDropdown}>
          {[['day','Bugün'],['week','Bu Hafta'],['month','Bu Ay']].map(([val, label]) => (
            <TouchableOpacity
              key={val}
              style={[styles.genreDropdownItem, period === val && styles.genreDropdownItemActive]}
              onPress={() => { setPeriod(val); setShowPeriodDropdown(false); }}
            >
              <Text style={[styles.genreDropdownText, period === val && styles.genreDropdownTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
        {loading ? (
          <ActivityIndicator size="large" color={ACCENT} style={{ marginTop: 60 }} />
        ) : (
          platformOrder.map(p => {
            const filtered = filterItems(items[p.slug] || []);
            if (filtered.length === 0) return null;
            return (
              <View key={p.slug} style={styles.popularSection}>
                <View style={[styles.popularPlatformLabel, { backgroundColor: p.color }]}>
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>{p.name}</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.popularRow}>
                  {filtered.map(item => (
                    <TouchableOpacity key={item.id} style={styles.popularCard} onPress={() => setSelectedItem({ ...item, availability: [{ platform_slug: p.slug, platform_url: item.platform_url }] })}>
                      <View style={styles.cardPosterWrap}>
                        {item.poster_url
                          ? <Image source={{ uri: item.poster_url }} style={styles.popularCardImg} resizeMode="cover" />
                          : <View style={[styles.popularCardImg, { backgroundColor: SURFACE, alignItems: 'center', justifyContent: 'center' }]}><Text style={{ color: '#ffffff22', fontSize: 20 }}>?</Text></View>}
                        {item.imdb_score && <View style={styles.cardImdbOverlay}>
                          <View style={styles.imdbBadge}><Text style={styles.imdbBadgeText}>IMDb</Text></View>
                          <Text style={styles.cardImdbScore}>{item.imdb_score.toFixed(1)}</Text>
                        </View>}
                      </View>
                      <Text style={styles.popularCardTitle} numberOfLines={2}>{item.original_language === 'tr' && item.title_tr ? item.title_tr : item.title}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            );
          })
        )}
        {!loading && platformOrder.every(p => filterItems(items[p.slug] || []).length === 0) && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyText}>İçerik bulunamadı</Text>
            <Text style={styles.emptySubText}>Seçilen dönemde yeni içerik yok</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function PopularScreen({ selectedPlatforms, onBack, user }) {
  const [popular, setPopular] = useState({});
  const [loading, setLoading] = useState(true);
  const isMountedPop = useRef(true);
  useEffect(() => { return () => { isMountedPop.current = false; }; }, []);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemLoading, setItemLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'movie', 'series'
  const [genreFilter, setGenreFilter] = useState(null);
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);

  useEffect(() => { fetchPopular().catch(e => { console.error('fetchPopular error:', e); setLoading(false); }); }, [selectedPlatforms]);

  async function fetchPopular() {
    if (!isMountedPop.current) return;
    setLoading(true);
    try {
      const platforms = selectedPlatforms.length > 0 ? selectedPlatforms : PLATFORMS.map(p => p.slug);
      const { data, error } = await supabasePublic
        .from('hub_popular')
        .select('*')
        .in('platform', platforms)
        .order('rating', { ascending: false });
      if (error || !isMountedPop.current) return;
      const imdbIds = [...new Set((data || []).map(i => i.imdb_id).filter(Boolean))];
      const contentMap = {};
      if (imdbIds.length > 0) {
        const { data: contents } = await supabasePublic
          .from('hub_contents')
          .select('imdb_id, synopsis_tr, director, cast_list, trailer_url, tagline, poster_url, type, year, title_tr, original_language')
          .in('imdb_id', imdbIds);
        (contents || []).forEach(c => { contentMap[c.imdb_id] = c; });
      }
      if (!isMountedPop.current) return;
      const grouped = {};
      (data || []).forEach(item => {
        const e = item.imdb_id ? contentMap[item.imdb_id] : null;
        const merged = {
          ...item,
          type: e?.type || item.show_type || null,
          year: e?.year || item.release_year || null,
          poster_url: e?.poster_url || item.poster_w480 || item.poster_w240,
          imdb_score: item.rating ? item.rating / 10 : null,
          availability: item.streaming_link ? [{ platform_slug: item.platform, platform_url: item.streaming_link }] : [],
          ...(e && {
            synopsis_tr: e.synopsis_tr,
            director: e.director,
            cast_list: e.cast_list,
            trailer_url: e.trailer_url,
            tagline: e.tagline,
            title_tr: e.title_tr || item.title_tr,
            original_language: e.original_language,
          }),
        };
        if (!grouped[item.platform]) grouped[item.platform] = [];
        grouped[item.platform].push(merged);
      });
      if (isMountedPop.current) setPopular(grouped);
    } finally {
      if (isMountedPop.current) setLoading(false);
    }
  }

  function filterItems(items) {
    let result = items;
    if (typeFilter === 'movie') result = result.filter(i => i.show_type === 'movie');
    if (typeFilter === 'series') result = result.filter(i => i.show_type === 'series');
    return result;
  }

  const selectedGenreLabel = POPULAR_GENRES.find(g => g.en === genreFilter)?.tr || 'Tür';

  function openPopularItem(item) {
    setSelectedItem(item); // fetchPopular'da zaten zenginleştirildi
  }

  function renderPopularCard(item) {
    const p = PLATFORMS.find(x => x.slug === item.platform);
    return (
      <TouchableOpacity key={item.id} style={styles.popularCard} onPress={() => openPopularItem(item)} disabled={itemLoading}>
        <View style={styles.cardPosterWrap}>
          {item.poster_w240
            ? <Image source={{ uri: item.poster_w240 }} style={styles.popularCardImg} resizeMode="cover" />
            : <View style={[styles.popularCardImg, { backgroundColor: SURFACE, alignItems: 'center', justifyContent: 'center' }]}><Text style={{ color: '#ffffff22', fontSize: 20 }}>?</Text></View>}
          {itemLoading && <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', borderRadius: 10 }}><ActivityIndicator color="#fff" size="small" /></View>}
          {item.rating && <View style={styles.cardImdbOverlay}>
            <View style={styles.imdbBadge}><Text style={styles.imdbBadgeText}>IMDb</Text></View>
            <Text style={styles.cardImdbScore}>{(item.rating / 10).toFixed(1)}</Text>
          </View>}
        </View>
        <Text style={styles.popularCardTitle} numberOfLines={2}>{item.original_language === 'tr' && item.title_tr ? item.title_tr : item.title}</Text>
      </TouchableOpacity>
    );
  }

  const platformOrder = PLATFORMS.filter(p => selectedPlatforms.includes(p.slug));

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <DetailModal key={selectedItem?.id || 'modal'} item={selectedItem} onClose={() => setSelectedItem(null)} user={user} />
      <View style={[styles.popularHeader, { flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: '300', lineHeight: 26 }}>‹</Text>
          </TouchableOpacity>
        )}
        <View>
          <Text style={styles.sectionTitle}>Popüler</Text>
          <Text style={styles.popularHeaderSub}>Türkiye kataloğunda izlenebilir</Text>
        </View>
      </View>
      {/* Netflix-style top filter bar */}
      <View style={styles.popularTopBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.popularTopBarRow}>
          {[['all','Tümü'],['series','Diziler'],['movie','Filmler']].map(([val, label]) => (
            <TouchableOpacity
              key={val}
              style={[styles.popularTopBtn, typeFilter === val && styles.popularTopBtnActive]}
              onPress={() => { setTypeFilter(val); setShowGenreDropdown(false); }}
            >
              <Text style={[styles.popularTopBtnText, typeFilter === val && styles.popularTopBtnTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
          <View style={styles.popularTopSeparator} />
          <TouchableOpacity
            style={[styles.popularTopBtn, genreFilter !== null && styles.popularTopBtnGenreActive]}
            onPress={() => setShowGenreDropdown(!showGenreDropdown)}
          >
            <Text style={[styles.popularTopBtnText, genreFilter !== null && styles.popularTopBtnTextGenreActive]}>
              {selectedGenreLabel} ▾
            </Text>
          </TouchableOpacity>
          {genreFilter && (
            <TouchableOpacity style={styles.popularTopBtn} onPress={() => setGenreFilter(null)}>
              <Text style={styles.popularTopBtnText}>✕</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* Genre dropdown */}
      {showGenreDropdown && (
        <View style={styles.genreDropdown}>
          <ScrollView style={{ maxHeight: 240 }} showsVerticalScrollIndicator={false}>
            {POPULAR_GENRES.map(g => (
              <TouchableOpacity
                key={g.en}
                style={[styles.genreDropdownItem, genreFilter === g.en && styles.genreDropdownItemActive]}
                onPress={() => { setGenreFilter(genreFilter === g.en ? null : g.en); setShowGenreDropdown(false); }}
              >
                <Text style={[styles.genreDropdownText, genreFilter === g.en && styles.genreDropdownTextActive]}>{g.tr}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
        {loading ? (
          <ActivityIndicator size="large" color={ACCENT} style={{ marginTop: 60 }} />
        ) : (
          platformOrder.map(p => {
            const allItems = popular[p.slug] || [];
            const items = filterItems(allItems);
            if (!items || items.length === 0) return null;
            return (
              <View key={p.slug} style={styles.popularSection}>
                <View style={[styles.popularPlatformLabel, { backgroundColor: p.color }]}>
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>{p.name}</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.popularRow}>
                  {items.map(item => renderPopularCard(item))}
                </ScrollView>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}


// ── Apple TV UI Constants ──────────────────────────────────────
const CARD_W = 112;
const CARD_H = 168;
const HERO_H = 500;
// Üstten alta doğru artan opaklık değerleri — çok sayıda ince katman üst üste binince bant hissi vermeden yumuşak bir gradient oluşturur (native modül gerekmez)
const HERO_GRADIENT_STEPS = Array.from({ length: 36 }, (_, i) => Math.pow(i / 35, 1.7) * 0.94);

// ── ContentCard (Reanimated scale press) ──────────────────────
function ContentCard({ item, onPress }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const title = (item.original_language === 'tr' && item.title_tr) ? item.title_tr : (item.title || '');
  const firstAvail = item.availability?.[0];
  const platform = firstAvail ? PLATFORMS.find(p => p.slug === firstAvail.platform_slug) : null;
  return (
    <ReAnimated.View style={[{ width: CARD_W, marginRight: 10 }, animStyle]}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={() => { scale.value = withSpring(0.91, { damping: 14, stiffness: 340 }); }}
        onPressOut={() => { scale.value = withSpring(1.0, { damping: 14, stiffness: 340 }); }}
        onPress={() => onPress(item)}
      >
        <View style={{ width: CARD_W, height: CARD_H, borderRadius: 10, overflow: 'hidden', backgroundColor: '#1a1a2e' }}>
          {item.poster_url
            ? <Image source={{ uri: item.poster_url }} style={{ width: CARD_W, height: CARD_H }} resizeMode="cover" />
            : <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 26, opacity: 0.25 }}>🎬</Text></View>}
          {item.imdb_score != null && (
            <View style={{ position: 'absolute', top: 6, left: 6, backgroundColor: 'rgba(0,0,0,0.78)', borderRadius: 5, paddingHorizontal: 5, paddingVertical: 2, flexDirection: 'row', alignItems: 'center', gap: 2 }}>
              <Text style={{ color: '#ffd43b', fontSize: 9, fontWeight: '800' }}>★</Text>
              <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>{item.imdb_score.toFixed(1)}</Text>
            </View>
          )}
          {platform && (
            <View style={{ position: 'absolute', bottom: 6, left: 6, backgroundColor: platform.color, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 }}>
              <Text style={{ color: '#fff', fontSize: 8, fontWeight: '900' }}>{platform.name}</Text>
            </View>
          )}
        </View>
        <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '500', marginTop: 5, width: CARD_W }} numberOfLines={1}>{title}</Text>
      </TouchableOpacity>
    </ReAnimated.View>
  );
}

// ── ContentRow ─────────────────────────────────────────────────
function ContentRow({ title, items, onPress, loading, onSeeAll }) {
  const header = (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 12 }}>
      <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: -0.4 }}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: '600' }}>Tümünü Gör ›</Text>
        </TouchableOpacity>
      )}
    </View>
  );
  if (loading && (!items || items.length === 0)) {
    return (
      <View style={{ marginBottom: 28 }}>
        {header}
        <View style={{ height: CARD_H + 24, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="rgba(255,255,255,0.3)" />
        </View>
      </View>
    );
  }
  if (!items || items.length === 0) return null;
  return (
    <View style={{ marginBottom: 28 }}>
      {header}
      <FlatList
        horizontal
        data={items}
        keyExtractor={(item, i) => String(item.id || item.imdb_id || i)}
        renderItem={({ item }) => <ContentCard item={item} onPress={onPress} />}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        removeClippedSubviews={false}
      />
    </View>
  );
}

// ── FriendsActivityRow ─────────────────────────────────────────
function FriendsActivityRow({ items, onPress, loading }) {
  const header = (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12, gap: 8 }}>
      <Users size={18} color="#fff" strokeWidth={2.2} />
      <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: -0.4 }}>Arkadaşların Son İzledikleri</Text>
    </View>
  );
  if (loading && (!items || items.length === 0)) {
    return (
      <View style={{ marginBottom: 28 }}>
        {header}
        <View style={{ height: CARD_H + 24, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="rgba(255,255,255,0.3)" />
        </View>
      </View>
    );
  }
  if (!items || items.length === 0) return null;
  return (
    <View style={{ marginBottom: 28 }}>
      {header}
      <FlatList
        horizontal
        data={items}
        keyExtractor={(item, i) => String(item.id || i)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        removeClippedSubviews={false}
        renderItem={({ item }) => (
          <View style={{ width: CARD_W }}>
            <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10.5, fontWeight: '600', marginBottom: 5 }} numberOfLines={1}>{item._friendName} izledi</Text>
            <ContentCard item={item} onPress={onPress} />
          </View>
        )}
      />
    </View>
  );
}

// ── CollectionRow ──────────────────────────────────────────────
const COLL_W = 128;
const COLL_H = 185;
function CollectionRow({ collections, selectedPlatforms, onSeeAll, onCollectionPress, loading }) {
  const header = (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 12 }}>
      <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: -0.4 }}>Koleksiyonlar</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: '600' }}>Tümünü Gör ›</Text>
        </TouchableOpacity>
      )}
    </View>
  );
  if (loading && (!collections || collections.length === 0)) {
    return (
      <View style={{ marginBottom: 28 }}>
        {header}
        <View style={{ height: COLL_H + 36, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="rgba(255,255,255,0.3)" />
        </View>
      </View>
    );
  }
  if (!collections || collections.length === 0) return null;
  return (
    <View style={{ marginBottom: 28 }}>
      {header}
      <FlatList
        horizontal
        data={collections}
        keyExtractor={col => String(col.id)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        removeClippedSubviews={false}
        renderItem={({ item: col }) => {
          const availItems = (col.items || [])
            .filter(i => i.content?.availability?.some(a => selectedPlatforms.includes(a.platform_slug)))
            .sort((a, b) => (b.imdb_score || 0) - (a.imdb_score || 0));
          const posters = availItems.slice(0, 4).map(i => i.content?.poster_url).filter(Boolean);
          return (
            <TouchableOpacity style={{ width: COLL_W, marginRight: 12 }} onPress={() => onCollectionPress ? onCollectionPress(col) : onSeeAll?.()} activeOpacity={0.8}>
              <View style={{ width: COLL_W, height: COLL_H, borderRadius: 12, overflow: 'hidden', backgroundColor: '#1a1a2e' }}>
                {posters[0]
                  ? <Image source={{ uri: posters[0] }} style={{ width: COLL_W, height: COLL_H }} resizeMode="cover" />
                  : <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 32, opacity: 0.2 }}>🎬</Text></View>}
                <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.75)', padding: 8, borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>
                  <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800', marginBottom: 2 }} numberOfLines={2}>{col.name_tr || col.name}</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10 }}>★ {col.avg_imdb_score?.toFixed(1)} · {availItems.length} içerik</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

// ── HeroSection ────────────────────────────────────────────────
function HeroSection({ item, scrollY, onPress }) {
  if (!item) return null;
  const title = (item.original_language === 'tr' && item.title_tr) ? item.title_tr : (item.title || '');
  const imgTranslate = scrollY.interpolate({
    inputRange: [-HERO_H, 0, HERO_H],
    outputRange: [-HERO_H * 0.25, 0, HERO_H * 0.35],
    extrapolate: 'clamp',
  });
  const contentOpacity = scrollY.interpolate({
    inputRange: [0, HERO_H * 0.55],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  return (
    <View style={{ height: HERO_H, overflow: 'hidden' }}>
      <Animated.View style={{ position: 'absolute', top: -40, left: 0, right: 0, height: HERO_H + 80, transform: [{ translateY: imgTranslate }] }}>
        {item.poster_url
          ? <Image source={{ uri: item.poster_url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          : <View style={{ flex: 1, backgroundColor: '#111' }} />}
      </Animated.View>
      <View style={{ position: 'absolute', bottom: HERO_H * 0.4, left: 0, right: 0, height: HERO_H * 0.1, backgroundColor: 'rgba(0,0,0,0.2)' }} />
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: HERO_H * 0.42, backgroundColor: 'rgba(0,0,0,0.72)' }} />
      <Animated.View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 26, opacity: contentOpacity }}>
        <Text style={{ color: '#fff', fontSize: 35, fontWeight: '900', letterSpacing: -0.8, marginBottom: 8, lineHeight: 41, textShadowColor: 'rgba(0,0,0,0.9)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8 }} numberOfLines={2}>{title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          {item.imdb_score != null && <Text style={{ color: '#ffd43b', fontWeight: '800', fontSize: 14 }}>★ {item.imdb_score.toFixed(1)}</Text>}
          {item.year && <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{item.year}</Text>}
          {item.type && <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{item.type === 'movie' ? 'Film' : 'Dizi'}</Text>}
          {(item.availability || []).slice(0, 2).map(a => {
            const p = PLATFORMS.find(x => x.slug === a.platform_slug);
            if (!p) return null;
            return <View key={a.platform_slug} style={{ backgroundColor: p.color, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5 }}><Text style={{ color: '#fff', fontWeight: '800', fontSize: 10 }}>{p.name}</Text></View>;
          })}
        </View>
        {item.synopsis_tr && <Text style={{ color: 'rgba(255,255,255,0.58)', fontSize: 12, lineHeight: 17, marginBottom: 14 }} numberOfLines={2}>{item.synopsis_tr}</Text>}
        <TouchableOpacity style={{ backgroundColor: '#fff', borderRadius: 12, paddingVertical: 13, paddingHorizontal: 22, alignSelf: 'flex-start' }} onPress={() => onPress(item)} activeOpacity={0.85}>
          <Text style={{ color: '#000', fontWeight: '800', fontSize: 14 }}>▶  Detayları Gör</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// ── PersonalizedHeroSection ─────────────────────────────────────
function PersonalizedHeroSection({ items, scrollY, onPress }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const idxRef = useRef(0);
  const opacity = useSharedValue(1);
  const slideX = useSharedValue(0);
  const nextFnRef = useRef(null);
  const prevFnRef = useRef(null);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: slideX.value }],
  }));

  useEffect(() => {
    idxRef.current = 0;
    setCurrentIdx(0);
    opacity.value = 1;
    slideX.value = 0;
  }, [items.map(i => i.id).join(',')]);

  // Auto-advance timer — restarts after each swipe (currentIdx dep resets it)
  useEffect(() => {
    if (items.length <= 1) return;
    const id = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 350 }, (finished) => {
        if (!finished) return;
        runOnJS(doSwitch)();
      });
      slideX.value = withTiming(-18, { duration: 350 });
    }, 5000);
    return () => clearTimeout(id);
  }, [currentIdx, items.length]);

  function doSwitch() {
    const next = (idxRef.current + 1) % items.length;
    idxRef.current = next;
    setCurrentIdx(next);
    slideX.value = 18;
    opacity.value = withTiming(1, { duration: 420 });
    slideX.value = withTiming(0, { duration: 420 });
  }

  function doPrev() {
    const prev = (idxRef.current - 1 + items.length) % items.length;
    idxRef.current = prev;
    setCurrentIdx(prev);
    slideX.value = -18;
    opacity.value = withTiming(1, { duration: 420 });
    slideX.value = withTiming(0, { duration: 420 });
  }

  // Update refs each render so PanResponder always calls latest closures
  nextFnRef.current = () => {
    opacity.value = withTiming(0, { duration: 280 }, (f) => { if (f) runOnJS(doSwitch)(); });
    slideX.value = withTiming(-18, { duration: 280 });
  };
  prevFnRef.current = () => {
    opacity.value = withTiming(0, { duration: 280 }, (f) => { if (f) runOnJS(doPrev)(); });
    slideX.value = withTiming(18, { duration: 280 });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 8 && Math.abs(gs.dx) > Math.abs(gs.dy) * 1.3,
      onMoveShouldSetPanResponderCapture: (_, gs) =>
        Math.abs(gs.dx) > 8 && Math.abs(gs.dx) > Math.abs(gs.dy) * 1.3,
      onPanResponderRelease: (_, gs) => {
        if (Math.abs(gs.dx) < 40) return;
        if (gs.dx < 0) nextFnRef.current?.();
        else prevFnRef.current?.();
      },
    })
  ).current;

  const item = items[currentIdx];
  if (!item) return null;

  const title = (item.original_language === 'tr' && item.title_tr) ? item.title_tr : (item.title || '');
  const contentOpacity = scrollY.interpolate({
    inputRange: [0, HERO_H * 0.55],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const imgTranslate = scrollY.interpolate({
    inputRange: [-HERO_H, 0, HERO_H],
    outputRange: [-HERO_H * 0.25, 0, HERO_H * 0.35],
    extrapolate: 'clamp',
  });

  return (
    <View style={{ height: HERO_H, overflow: 'hidden' }} {...panResponder.panHandlers}>
      <ReAnimated.View style={[StyleSheet.absoluteFill, animStyle]}>
        <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: HERO_H + 80, transform: [{ translateY: imgTranslate }] }}>
          {item.poster_url
            ? <Image source={{ uri: item.poster_url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            : <View style={{ flex: 1, backgroundColor: '#111' }} />}
        </Animated.View>
        {/* Native gradient modülü olmadan kademeli karartma — ince katmanlar üst üste binerek yumuşak geçiş hissi verir */}
        <View pointerEvents="none" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: HERO_H * 0.66, flexDirection: 'column' }}>
          {HERO_GRADIENT_STEPS.map((op, i) => (
            <View key={i} style={{ flex: 1, backgroundColor: `rgba(8,8,11,${op})` }} />
          ))}
        </View>
        <Animated.View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: items.length > 1 ? 38 : 26, opacity: contentOpacity }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
              <Text style={{ color: '#ffd43b', fontSize: 11 }}>✦</Text>
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }}>SANA ÖZEL</Text>
            </View>
          </View>
          <Text style={{ color: '#fff', fontSize: 30, fontWeight: '900', letterSpacing: -0.8, marginBottom: 8, lineHeight: 35, textShadowColor: 'rgba(0,0,0,0.85)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 10 }} numberOfLines={2}>{title}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
            {item.imdb_score != null && <Text style={{ color: '#ffd43b', fontWeight: '800', fontSize: 14 }}>★ {item.imdb_score.toFixed(1)}</Text>}
            {item.year && <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>{item.year}</Text>}
            {item.type && <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>{item.type === 'movie' ? 'Film' : 'Dizi'}</Text>}
            {(item.availability || []).slice(0, 2).map(a => {
              const p = PLATFORMS.find(x => x.slug === a.platform_slug);
              if (!p) return null;
              return <View key={a.platform_slug} style={{ backgroundColor: p.color, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5 }}><Text style={{ color: '#fff', fontWeight: '800', fontSize: 10 }}>{p.name}</Text></View>;
            })}
          </View>
          {item.synopsis_tr && <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, lineHeight: 17, marginBottom: 14, textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6 }} numberOfLines={2}>{item.synopsis_tr}</Text>}
          <TouchableOpacity style={{ backgroundColor: '#fff', borderRadius: 12, paddingVertical: 13, paddingHorizontal: 22, alignSelf: 'flex-start' }} onPress={() => onPress(item)} activeOpacity={0.85}>
            <Text style={{ color: '#000', fontWeight: '800', fontSize: 14 }}>▶  Detayları Gör</Text>
          </TouchableOpacity>
        </Animated.View>
      </ReAnimated.View>
      {items.length > 1 && (
        <View style={{ position: 'absolute', bottom: 14, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 5 }}>
          {items.map((_, i) => (
            <View key={i} style={{ height: 4, width: i === currentIdx ? 20 : 6, borderRadius: 2, backgroundColor: i === currentIdx ? '#fff' : 'rgba(255,255,255,0.3)' }} />
          ))}
        </View>
      )}
    </View>
  );
}

// ── DiscoverScreen (Tümünü Gör → Keşfet) ──────────────────────
function DiscoverScreen({ selectedPlatforms, onBack, user }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [genreFilter, setGenreFilter] = useState(null);
  const [langFilter, setLangFilter] = useState(null);
  const [minImdb, setMinImdb] = useState(0);
  const [sortBy, setSortBy] = useState('imdb_score');
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const isMounted = useRef(true);
  useEffect(() => { return () => { isMounted.current = false; }; }, []);
  useEffect(() => { fetchItems().catch(() => {}); }, [selectedPlatforms, activeSearch, typeFilter, genreFilter, langFilter, minImdb, sortBy]);

  async function fetchItems() {
    if (!isMounted.current) return;
    if (selectedPlatforms.length === 0) { setItems([]); setLoading(false); return; }
    setLoading(true);
    try {
      const platformFilter = selectedPlatforms.map(p => `platform_slug.eq.${p}`).join(',');
      let q = supabasePublic.from('hub_contents')
        .select('*, availability:hub_availability!inner(platform_slug, platform_url)')
        .not('imdb_score', 'is', null).not('imdb_id', 'is', null)
        .or(platformFilter, { referencedTable: 'hub_availability' });
      if (activeSearch.trim()) {
        const s = activeSearch.trim().replace(/[%_\\]/g, '\\$&');
        q = q.or(`title.ilike.%${s}%,original_title.ilike.%${s}%,title_tr.ilike.%${s}%,cast_list.ilike.%${s}%,director.ilike.%${s}%`);
      }
      if (typeFilter !== 'all') q = q.eq('type', typeFilter);
      if (genreFilter) q = q.ilike('genre', `%${genreFilter}%`);
      if (langFilter) q = q.eq('original_language', langFilter);
      if (minImdb > 0) q = q.gte('imdb_score', minImdb);
      q = q.order(sortBy, { ascending: false, nullsFirst: false }).limit(90);
      const { data, error } = await q;
      if (!isMounted.current || error) return;
      const enriched = (data || []).map(item => ({ ...item, availability: (item.availability || []).filter(a => selectedPlatforms.includes(a.platform_slug)) }));
      if (isMounted.current) setItems(enriched);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }

  const genreLabel = POPULAR_GENRES.find(g => g.en === genreFilter)?.tr || 'Tür';
  const langLabel = PROFILE_LANGUAGES.find(l => l.code === langFilter)?.label || 'Dil';

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <DetailModal key={selectedItem?.id || 'modal'} item={selectedItem} onClose={() => setSelectedItem(null)} user={user} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 }}>
        <TouchableOpacity onPress={onBack} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 22, fontWeight: '300', lineHeight: 26 }}>‹</Text>
        </TouchableOpacity>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800' }}>Keşfet</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 10, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 }}>
        <Text style={{ color: '#555', fontSize: 13, marginRight: 8 }}>🔍</Text>
        <TextInput style={{ flex: 1, color: '#fff', fontSize: 15 }} placeholder="Film, dizi, oyuncu, yönetmen ara..." placeholderTextColor="#444" value={searchInput} onChangeText={setSearchInput} onSubmitEditing={() => setActiveSearch(searchInput)} returnKeyType="search" maxFontSizeMultiplier={1} />
        {searchInput.length > 0 && <TouchableOpacity style={{ padding: 8 }} hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }} onPress={() => { setSearchInput(''); setActiveSearch(''); }}><Text style={{ color: '#555', fontSize: 16, paddingLeft: 8 }}>✕</Text></TouchableOpacity>}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, flexShrink: 0 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 8, alignItems: 'center' }}>
        {[['all','Tümü'],['movie','Filmler'],['series','Diziler']].map(([val, label]) => (
          <TouchableOpacity key={val} style={{ paddingHorizontal: 14, paddingVertical: 11, borderRadius: 20, backgroundColor: typeFilter === val ? '#fff' : 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: typeFilter === val ? '#fff' : 'rgba(255,255,255,0.1)' }} onPress={() => setTypeFilter(val)}>
            <Text style={{ color: typeFilter === val ? '#000' : 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: '700' }}>{label}</Text>
          </TouchableOpacity>
        ))}
        <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />
        <TouchableOpacity style={{ paddingHorizontal: 14, paddingVertical: 11, borderRadius: 20, backgroundColor: genreFilter ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: genreFilter ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.1)' }} onPress={() => { setShowGenreDropdown(v => !v); setShowLangDropdown(false); }}>
          <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: '700' }}>{genreLabel} ▾</Text>
        </TouchableOpacity>
        {genreFilter && <TouchableOpacity style={{ paddingHorizontal: 12, paddingVertical: 11, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)' }} onPress={() => setGenreFilter(null)}><Text style={{ color: '#fff', fontSize: 13 }}>✕</Text></TouchableOpacity>}
        <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />
        <TouchableOpacity style={{ paddingHorizontal: 14, paddingVertical: 11, borderRadius: 20, backgroundColor: langFilter ? 'rgba(100,210,255,0.18)' : 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: langFilter ? 'rgba(100,210,255,0.5)' : 'rgba(255,255,255,0.1)' }} onPress={() => { setShowLangDropdown(v => !v); setShowGenreDropdown(false); }}>
          <Text style={{ color: langFilter ? '#64d2ff' : 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: '700' }}>{langLabel} ▾</Text>
        </TouchableOpacity>
        {langFilter && <TouchableOpacity style={{ paddingHorizontal: 12, paddingVertical: 11, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)' }} onPress={() => setLangFilter(null)}><Text style={{ color: '#fff', fontSize: 13 }}>✕</Text></TouchableOpacity>}
        <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />
        <View style={{ paddingHorizontal: 6, paddingVertical: 7, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#ffd43b', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 }}>IMDb</Text>
        </View>
        {[0, 6, 7, 7.5, 8].map(val => (
          <TouchableOpacity key={val} style={{ paddingHorizontal: 14, paddingVertical: 11, borderRadius: 20, backgroundColor: minImdb === val ? '#ffd43b' : 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: minImdb === val ? '#ffd43b' : 'rgba(255,255,255,0.1)' }} onPress={() => setMinImdb(val)}>
            <Text style={{ color: minImdb === val ? '#000' : 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: '700' }}>{val === 0 ? 'Tümü' : `${val}+`}</Text>
          </TouchableOpacity>
        ))}
        <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />
        {[['imdb_score','IMDb ↓'],['year','Yıl ↓']].map(([val, label]) => (
          <TouchableOpacity key={val} style={{ paddingHorizontal: 14, paddingVertical: 11, borderRadius: 20, backgroundColor: sortBy === val ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: sortBy === val ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.1)' }} onPress={() => setSortBy(val)}>
            <Text style={{ color: sortBy === val ? '#fff' : 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: '700' }}>{label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {showGenreDropdown && (
        <View style={{ position: 'absolute', top: 178, left: 16, right: 16, backgroundColor: '#1c1c1e', borderRadius: 14, zIndex: 100, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.55, shadowRadius: 14 }}>
          <ScrollView style={{ maxHeight: 260 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 8 }}>
            {POPULAR_GENRES.map(g => (
              <TouchableOpacity key={g.en} style={{ paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, backgroundColor: genreFilter === g.en ? 'rgba(255,255,255,0.12)' : 'transparent' }} onPress={() => { setGenreFilter(genreFilter === g.en ? null : g.en); setShowGenreDropdown(false); }}>
                <Text style={{ color: genreFilter === g.en ? '#fff' : 'rgba(255,255,255,0.65)', fontSize: 15, fontWeight: genreFilter === g.en ? '700' : '400' }}>{g.tr}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      {showLangDropdown && (
        <View style={{ position: 'absolute', top: 178, left: 16, right: 16, backgroundColor: '#1c1c1e', borderRadius: 14, zIndex: 100, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.55, shadowRadius: 14 }}>
          <ScrollView style={{ maxHeight: 260 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 8 }}>
            {PROFILE_LANGUAGES.map(l => (
              <TouchableOpacity key={l.code} style={{ paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, backgroundColor: langFilter === l.code ? 'rgba(100,210,255,0.14)' : 'transparent' }} onPress={() => { setLangFilter(langFilter === l.code ? null : l.code); setShowLangDropdown(false); }}>
                <Text style={{ color: langFilter === l.code ? '#64d2ff' : 'rgba(255,255,255,0.65)', fontSize: 15, fontWeight: langFilter === l.code ? '700' : '400' }}>{l.emoji} {l.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color="#fff" size="large" /></View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item, i) => String(item.id || i)}
          numColumns={3}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 80 }}
          columnWrapperStyle={{ gap: 10, marginBottom: 10 }}
          renderItem={({ item }) => {
            const avail = (item.availability || []).filter(a => selectedPlatforms.includes(a.platform_slug));
            const p = avail[0] ? PLATFORMS.find(x => x.slug === avail[0].platform_slug) : null;
            const title = item.original_language === 'tr' && item.title_tr ? item.title_tr : (item.title || '');
            return (
              <TouchableOpacity style={{ flex: 1 }} onPress={() => setSelectedItem({ ...item, availability: avail })} activeOpacity={0.8}>
                <View style={{ borderRadius: 10, overflow: 'hidden', backgroundColor: '#1a1a2e', aspectRatio: 2 / 3 }}>
                  {item.poster_url
                    ? <Image source={{ uri: item.poster_url }} style={{ flex: 1 }} resizeMode="cover" />
                    : <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text style={{ opacity: 0.2, fontSize: 22 }}>🎬</Text></View>}
                  {item.imdb_score != null && (
                    <View style={{ position: 'absolute', top: 5, left: 5, backgroundColor: 'rgba(0,0,0,0.78)', borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1, flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                      <Text style={{ color: '#ffd43b', fontSize: 8, fontWeight: '800' }}>★</Text>
                      <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>{item.imdb_score.toFixed(1)}</Text>
                    </View>
                  )}
                  {p && <View style={{ position: 'absolute', bottom: 5, left: 5, backgroundColor: p.color, borderRadius: 3, paddingHorizontal: 4, paddingVertical: 1 }}><Text style={{ color: '#fff', fontSize: 7, fontWeight: '900' }}>{p.name}</Text></View>}
                </View>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 5 }} numberOfLines={1}>{title}</Text>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 80, gap: 8 }}>
              <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 15, fontWeight: '600' }}>
                {selectedPlatforms.length === 0
                  ? 'Platform seçilmedi'
                  : 'Bu kriterlere uygun içerik seçili platformlarda bulunamadı'}
              </Text>
              {selectedPlatforms.length > 0 && (
                <Text style={{ color: 'rgba(255,255,255,0.18)', fontSize: 13 }}>Filtreleri değiştirmeyi dene</Text>
              )}
            </View>
          }
        />
      )}
    </View>
  );
}

// ── AppleTVMainScreen ──────────────────────────────────────────
function AppleTVMainScreen({ user, selectedPlatforms, favoriteGenres, favoriteLanguages, isPremium, onWatchlist, onProfile }) {
  const [heroItems, setHeroItems] = useState([]);
  const [discoverItems, setDiscoverItems] = useState([]);
  const [popularItems, setPopularItems] = useState([]);
  const [newItems, setNewItems] = useState([]);
  const [collections, setCollections] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [fullScreen, setFullScreen] = useState(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState(null);
  const [loadingDiscover, setLoadingDiscover] = useState(true);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [loadingNew, setLoadingNew] = useState(true);
  const [loadingCollections, setLoadingCollections] = useState(true);
  const [friendsActivity, setFriendsActivity] = useState([]);
  const [loadingFriendsActivity, setLoadingFriendsActivity] = useState(true);
  const scrollY = useRef(new Animated.Value(0)).current;
  const isMounted = useRef(true);
  useEffect(() => { return () => { isMounted.current = false; }; }, []);

  useEffect(() => {
    fetchDiscover().catch(() => {});
    fetchPopularItems().catch(() => {});
    fetchNewItems().catch(() => {});
    fetchCollectionItems().catch(() => {});
  }, [selectedPlatforms]);

  useEffect(() => { fetchDiscover().catch(() => {}); }, [activeSearch]);

  useEffect(() => { fetchFriendsActivity().catch(() => {}); }, [user?.id]);

  async function fetchFriendsActivity() {
    if (!user) { setFriendsActivity([]); setLoadingFriendsActivity(false); return; }
    setLoadingFriendsActivity(true);
    try {
      const { data: followRows } = await dbXHR('follows?follower_id=eq.' + user.id + '&select=following_id');
      const ids = Array.isArray(followRows) ? followRows.map(r => r.following_id) : [];
      if (ids.length === 0) { if (isMounted.current) setFriendsActivity([]); return; }
      const sel = 'select=*,content:hub_contents(id,title,title_tr,type,year,imdb_score,poster_url,original_language,availability:hub_availability(platform_slug,platform_url))';
      const { data } = await dbXHR('activity_feed?user_id=in.(' + ids.join(',') + ')&action=in.(watched,watching)&order=created_at.desc&limit=20&' + sel);
      const rows = Array.isArray(data) ? data : [];
      const actorIds = [...new Set(rows.map(r => r.user_id))];
      let actorMap = {};
      if (actorIds.length > 0) {
        const { data: profs } = await dbXHR('public_profiles?id=in.(' + actorIds.join(',') + ')&select=id,username,display_name');
        (Array.isArray(profs) ? profs : []).forEach(p => { actorMap[p.id] = p; });
      }
      const seen = new Set();
      const merged = [];
      for (const row of rows) {
        if (!row.content || seen.has(row.content.id)) continue;
        seen.add(row.content.id);
        const actor = actorMap[row.user_id];
        merged.push({
          ...row.content,
          availability: (row.content.availability || []).filter(a => selectedPlatforms.includes(a.platform_slug)),
          _friendName: actor?.display_name || (actor?.username ? '@' + actor.username : 'Bir arkadaşın'),
        });
      }
      if (isMounted.current) setFriendsActivity(merged);
    } finally {
      if (isMounted.current) setLoadingFriendsActivity(false);
    }
  }

  useEffect(() => {
    fetchPersonalizedHero().catch(() => {});
  }, [selectedPlatforms.join(','), (favoriteGenres || []).join(','), (favoriteLanguages || []).join(',')]);

  async function fetchPersonalizedHero() {
    if (!isMounted.current || selectedPlatforms.length === 0) { setHeroItems([]); return; }
    const platforms = selectedPlatforms;
    const genres = favoriteGenres || [];
    const langs = favoriteLanguages || [];
    const platformFilter = platforms.map(p => `platform_slug.eq.${p}`).join(',');
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const genreOr = genres.length > 0
      ? genres.map(g => `genre.ilike.%${GENRE_API_TERM[g] || g}%`).join(',')
      : null;

    const baseQ = (minScore = 7) => supabasePublic.from('hub_contents')
      .select('*, availability:hub_availability!inner(platform_slug, platform_url)')
      .gte('imdb_score', minScore).not('imdb_id', 'is', null)
      .or(platformFilter, { referencedTable: 'hub_availability' })
      .order('imdb_score', { ascending: false })
      .limit(10);

    let items = [];

    // 1. Son 30 gün içinde eklenenler (genre + dil varsa filtreli)
    const { data: recentAvail } = await supabasePublic
      .from('hub_availability')
      .select('content_id')
      .in('platform_slug', platforms)
      .gte('available_since', thirtyDaysAgo);
    const recentIds = [...new Set((recentAvail || []).map(a => a.content_id))];

    if (recentIds.length > 0) {
      let q = baseQ().in('id', recentIds);
      if (langs.length > 0) q = q.in('original_language', langs);
      if (genreOr) q = q.or(genreOr);
      const { data } = await q;
      items = data || [];
    }

    // Hedef: 10 içerik. Bir filtre katmanında yetersiz kalınırsa önce o katmanda
    // imdb_score eşiğini kademeli düşürerek doldurmayı dene, hâlâ yetmezse bir sonraki
    // (daha geniş) filtre katmanına geç.
    const SCORE_STEPS = [7, 6, 5, 4, 3, 2, 1, 0];
    async function fillByScore(buildQuery) {
      let result = [];
      for (const minScore of SCORE_STEPS) {
        const { data } = await buildQuery(minScore);
        result = data || [];
        if (result.length >= 10) break;
      }
      return result;
    }

    // 2. Yeterli içerik yoksa: tüm katalog + dil + genre (puan eşiği kademeli düşürülerek)
    if (items.length < 10 && langs.length > 0 && genreOr) {
      items = await fillByScore(minScore => {
        let q = baseQ(minScore).in('original_language', langs);
        return q.or(genreOr);
      });
    }

    // 3. Yeterli yoksa: tüm katalog + dil (genre filtresi yok), puan kademeli
    if (items.length < 10 && langs.length > 0) {
      items = await fillByScore(minScore => baseQ(minScore).in('original_language', langs));
    }

    // 4. Yeterli içerik yoksa: tüm katalog + genre, puan kademeli
    if (items.length < 10 && genreOr) {
      items = await fillByScore(minScore => baseQ(minScore).or(genreOr));
    }

    // 5. Hâlâ yeterli yoksa: tüm katalog, hiç filtre yok, puan kademeli
    if (items.length < 10) {
      items = await fillByScore(minScore => baseQ(minScore));
    }

    if (!isMounted.current) return;
    setHeroItems(items.map(item => ({
      ...item,
      availability: (item.availability || []).filter(a => platforms.includes(a.platform_slug)),
    })));
  }

  async function fetchDiscover() {
    if (!isMounted.current) return;
    if (selectedPlatforms.length === 0) { setDiscoverItems([]); setLoadingDiscover(false); return; }
    setLoadingDiscover(true);
    const platformFilter = selectedPlatforms.map(p => `platform_slug.eq.${p}`).join(',');
    let q = supabasePublic.from('hub_contents')
      .select('*, availability:hub_availability!inner(platform_slug, platform_url)')
      .not('imdb_score', 'is', null).not('imdb_id', 'is', null)
      .or(platformFilter, { referencedTable: 'hub_availability' });
    if (activeSearch.trim()) {
      const s = activeSearch.trim().replace(/[%_\\]/g, '\\$&');
      q = q.or(`title.ilike.%${s}%,original_title.ilike.%${s}%,title_tr.ilike.%${s}%,cast_list.ilike.%${s}%,director.ilike.%${s}%`);
    }
    q = q.order('imdb_score', { ascending: false }).limit(30);
    const { data, error } = await q;
    if (!isMounted.current) return;
    if (error) { setLoadingDiscover(false); return; }
    const enriched = (data || []).map(item => ({ ...item, availability: (item.availability || []).filter(a => selectedPlatforms.includes(a.platform_slug)) }));
    setDiscoverItems(enriched);
    setLoadingDiscover(false);
  }

  async function fetchPopularItems() {
    if (!isMounted.current) return;
    if (selectedPlatforms.length === 0) { setPopularItems([]); setLoadingPopular(false); return; }
    setLoadingPopular(true);
    try {
      const { data, error } = await supabasePublic
        .from('hub_popular').select('*')
        .in('platform', selectedPlatforms)
        .order('rating', { ascending: false }).limit(25);
      if (!isMounted.current || error || !data) return;

      const imdbIds = [...new Set(data.map(i => i.imdb_id).filter(Boolean))];
      const contentMap = {};
      if (imdbIds.length > 0) {
        const { data: contents } = await supabasePublic
          .from('hub_contents')
          .select('imdb_id, id, synopsis_tr, director, cast_list, trailer_url, tagline, poster_url, type, year, title_tr, original_language')
          .in('imdb_id', imdbIds);
        (contents || []).forEach(c => { contentMap[c.imdb_id] = c; });
      }
      if (!isMounted.current) return;

      const seen = new Set();
      const items = data.filter(item => {
        const k = item.imdb_id || item.title || item.id;
        if (!k || seen.has(k)) return false;
        seen.add(k); return true;
      }).map(item => {
        const e = item.imdb_id ? contentMap[item.imdb_id] : null;
        return {
          id: e?.id || item.id,
          title: item.title || item.show_name || '',
          title_tr: e?.title_tr || null,
          original_language: e?.original_language || null,
          poster_url: e?.poster_url || item.poster_w480 || item.poster_w240,
          imdb_score: item.rating ? item.rating / 10 : null,
          year: e?.year || item.release_year || null,
          type: e?.type || item.show_type || null,
          imdb_id: item.imdb_id,
          synopsis_tr: e?.synopsis_tr || null,
          director: e?.director || null,
          cast_list: e?.cast_list || null,
          trailer_url: e?.trailer_url || null,
          tagline: e?.tagline || null,
          availability: [{ platform_slug: item.platform, platform_url: item.streaming_link }],
        };
      });
      if (isMounted.current) setPopularItems(items);
    } finally {
      if (isMounted.current) setLoadingPopular(false);
    }
  }

  async function fetchNewItems() {
    if (!isMounted.current) return;
    if (selectedPlatforms.length === 0) { setNewItems([]); setLoadingNew(false); return; }
    setLoadingNew(true);
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 21);
    const fromStr = cutoff.toISOString().split('T')[0];
    const { data, error } = await supabasePublic
      .from('hub_availability')
      .select('platform_slug, platform_url, available_since, content:hub_contents(id, title, title_tr, original_language, imdb_score, poster_url, imdb_id, type, year, synopsis_tr, director, cast_list, trailer_url, genre)')
      .in('platform_slug', selectedPlatforms)
      .gte('available_since', fromStr)
      .order('available_since', { ascending: false }).limit(30);
    if (!isMounted.current) return;
    if (error || !data) { setLoadingNew(false); return; }
    const seen = new Set();
    const items = (data || [])
      .map(row => ({ ...row.content, availability: [{ platform_slug: row.platform_slug, platform_url: row.platform_url }], available_since: row.available_since }))
      .filter(item => { if (!item.id || seen.has(item.id)) return false; seen.add(item.id); return true; });
    setNewItems(items);
    setLoadingNew(false);
  }

  async function fetchCollectionItems() {
    if (!isMounted.current) return;
    if (selectedPlatforms.length === 0) { setCollections([]); setLoadingCollections(false); return; }
    setLoadingCollections(true);
    const { data, error } = await supabasePublic
      .from('hub_collections')
      .select('id, name, name_tr, avg_imdb_score, items:hub_collection_items(content_id, imdb_score, content:hub_contents(id, poster_url, availability:hub_availability(platform_slug)))')
      .order('avg_votes', { ascending: false, nullsFirst: false })
      .limit(12);
    if (!isMounted.current) return;
    if (error || !data) { setLoadingCollections(false); return; }
    const filtered = (data || []).filter(col =>
      (col.items || []).some(i => i.content?.availability?.some(a => selectedPlatforms.includes(a.platform_slug)))
    );
    setCollections(filtered);
    setLoadingCollections(false);
  }

  function handleItemPress(item) {
    setSelectedItem(item);
  }

  // Tam ekran yönlendirme
  if (fullScreen === 'discover') return <DiscoverScreen selectedPlatforms={selectedPlatforms} onBack={() => { scrollY.setValue(0); setFullScreen(null); }} user={user} />;
  if (fullScreen === 'popular') return <PopularScreen selectedPlatforms={selectedPlatforms} onBack={() => { scrollY.setValue(0); setFullScreen(null); }} user={user} />;
  if (fullScreen === 'new') return <NewScreen selectedPlatforms={selectedPlatforms} onBack={() => { scrollY.setValue(0); setFullScreen(null); }} user={user} />;
  if (fullScreen === 'collections') return <CollectionsScreen selectedPlatforms={selectedPlatforms} onBack={() => { scrollY.setValue(0); setFullScreen(null); setSelectedCollectionId(null); }} user={user} initialCollectionId={selectedCollectionId} />;

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 6, paddingBottom: 8, justifyContent: 'space-between' }}>
        <View>
          <Text style={{ color: '#fff', fontSize: 34, fontWeight: '900', letterSpacing: 3 }}>İZLİO</Text>
          <Text style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10 }}>OTA-v24</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }} onPress={onWatchlist} hitSlop={{ top: 24, bottom: 24, left: 24, right: 12 }}>
            <User size={26} color="#fff" strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }} onPress={onProfile} hitSlop={{ top: 24, bottom: 24, left: 12, right: 24 }}>
            <Settings size={26} color="#fff" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search bar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 10, gap: 8 }}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' }}>
          <Text style={{ color: '#555', fontSize: 13, marginRight: 8 }}>🔍</Text>
          <TextInput
            style={{ flex: 1, color: '#fff', fontSize: 15 }}
            placeholder="Film, dizi, oyuncu, yönetmen ara..."
            placeholderTextColor="#444"
            value={searchInput}
            onChangeText={setSearchInput}
            onSubmitEditing={() => setActiveSearch(searchInput)}
            returnKeyType="search"
            maxFontSizeMultiplier={1}
          />
          {searchInput.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchInput(''); setActiveSearch(''); }} hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}>
              <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginLeft: 6 }}>
                <Text style={{ color: '#aaa', fontSize: 11, fontWeight: '800', lineHeight: 13 }}>✕</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={{ width: 60, height: 60, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', alignItems: 'center', justifyContent: 'center' }}
          onPress={() => setFullScreen('discover')}
          hitSlop={{ top: 24, bottom: 24, left: 24, right: 24 }}
        >
          <SlidersHorizontal size={20} color="rgba(255,255,255,0.65)" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Main scroll */}
      <Animated.ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
      >
        {!activeSearch.trim() && <PersonalizedHeroSection items={heroItems} scrollY={scrollY} onPress={handleItemPress} />}
        <View style={{ paddingTop: 22 }}>
          {activeSearch.trim() ? (
            <>
              <ContentRow title={`"${activeSearch}" Sonuçları`} items={discoverItems} onPress={handleItemPress} loading={loadingDiscover} />
              {discoverItems.length === 0 && !loadingDiscover && (
                <Text style={{ color: 'rgba(255,255,255,0.25)', textAlign: 'center', marginTop: 60, fontSize: 16 }}>Sonuç bulunamadı</Text>
              )}
            </>
          ) : (
            <>
              <FriendsActivityRow items={friendsActivity} onPress={handleItemPress} loading={loadingFriendsActivity} />
              <ContentRow title="En İyi Puanlılar" items={discoverItems} onPress={handleItemPress} loading={loadingDiscover} onSeeAll={() => setFullScreen('discover')} />
              <ContentRow title="Şu An Popüler" items={popularItems} onPress={handleItemPress} loading={loadingPopular} onSeeAll={() => setFullScreen('popular')} />
              <ContentRow title="Yeni Eklenenler" items={newItems} onPress={handleItemPress} loading={loadingNew} onSeeAll={() => setFullScreen('new')} />
              <CollectionRow collections={collections} selectedPlatforms={selectedPlatforms} onSeeAll={() => { setSelectedCollectionId(null); setFullScreen('collections'); }} onCollectionPress={col => { setSelectedCollectionId(col.id); setFullScreen('collections'); }} loading={loadingCollections} />
            </>
          )}
        </View>
        <View style={{ height: 60 }} />
      </Animated.ScrollView>

      <DetailModal key={selectedItem?.id || 'modal'} item={selectedItem} onClose={() => setSelectedItem(null)} user={user} />
    </View>
  );
}

// ── Legacy HomeScreen (artık kullanılmıyor) ────────────────────
function HomeScreen({ selectedPlatforms, onPlatformToggle, onNavigate, isPremium, onWatchlist, onProfile }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, []);

  const TABS = [
    {
      id: 'discover',
      icon: <Compass size={28} color="#ffffff" strokeWidth={1.6} />,
      name: 'Keşfet',
      desc: 'Tüm içeriklerde ara, puanla sırala, türe göre filtrele',
      color: '#0A84FF',
    },
    {
      id: 'popular',
      icon: <TrendingUp size={28} color="#ffffff" strokeWidth={1.6} />,
      name: 'Popüler',
      desc: 'Şu an en çok izlenen filmler ve diziler',
      color: '#FF375F',
    },
    {
      id: 'new',
      icon: <Sparkles size={28} color="#ffffff" strokeWidth={1.6} />,
      name: 'Yeniler',
      desc: 'Platforma bu hafta yeni eklenen içerikler',
      color: '#30D158',
    },
    {
      id: 'collections',
      icon: <Film size={28} color="#ffffff" strokeWidth={1.6} />,
      name: 'Koleksiyon',
      desc: 'Sinema evrenleri, seriler ve özel listeler',
      color: '#BF5AF2',
    },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000' }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

        {/* Top bar */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8 }}>
          <View style={{ flex: 1 }} />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity onPress={onWatchlist} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }}>
              <Text style={{ fontSize: 18 }}>🔖</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onProfile} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }}>
              <Text style={{ fontSize: 18 }}>👤</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Ad Banner */}
        {!isPremium && <AdBanner />}

        {/* Logo & Tagline */}
        <View style={styles.homeLogo}>
          <View style={styles.homeLogoRow}>
            <Image source={require('./assets/images/logo.png')} style={styles.homeLogoIcon} resizeMode="contain" />
            <Text style={styles.homeTitle}>İzlio</Text>
          </View>
          <Text style={styles.homeTagline}>Bir sonraki favorini keşfet.</Text>
        </View>

        {/* Platform Seçimi */}
        <View style={styles.homeSectionWrap}>
          <Text style={styles.homeSectionLabel}>Platformlarını seç</Text>
          <View style={styles.homePlatformRow}>
            {PLATFORMS.map(p => {
              const isSelected = selectedPlatforms.includes(p.slug);
              return (
                <TouchableOpacity
                  key={p.slug}
                  style={[styles.homePlatformCard, { borderColor: isSelected ? p.color : 'rgba(255,255,255,0.1)' }]}
                  onPress={() => onPlatformToggle(p.slug)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.homePlatformDot, { backgroundColor: p.color }]} />
                  <Text style={[styles.homePlatformName, { color: isSelected ? '#fff' : 'rgba(255,255,255,0.4)' }]}>{p.name}</Text>
                  {isSelected && <View style={[styles.homePlatformCheck, { backgroundColor: p.color }]}><Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>✓</Text></View>}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Sekme Kartları */}
        <View style={styles.homeSectionWrap}>
          <Text style={styles.homeSectionLabel}>Ne yapmak istersin?</Text>
          <View style={styles.homeTabGrid}>
            {TABS.map(tab => (
              <TouchableOpacity
                key={tab.id}
                style={styles.homeTabCard}
                onPress={() => onNavigate(tab.id)}
                activeOpacity={0.85}
              >
                <View style={[styles.homeTabIconWrap, { backgroundColor: tab.color + '22' }]}>
                  {React.cloneElement(tab.icon, { color: tab.color })}
                </View>
                <Text style={styles.homeTabName}>{tab.name}</Text>
                <Text style={styles.homeTabDesc}>{tab.desc}</Text>
                <View style={[styles.homeTabArrow, { backgroundColor: tab.color }]}>
                  <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>›</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </Animated.View>
    </ScrollView>
  );
}



function openPlatformUrl(slug, url) {
  if (!url) return;
  const nativeSchemes = {
    netflix: url.replace('https://www.netflix.com', 'nflx://www.netflix.com'),
    amazon: url.replace('https://www.amazon.com', 'aiv://aiv').replace('https://www.primevideo.com', 'aiv://aiv'),
    disney: url.replace('https://www.disneyplus.com', 'disneyplus://'),
    hbo: url.replace('https://www.max.com', 'max://').replace('https://play.hbomax.com', 'max://'),
  };
  const nativeUrl = nativeSchemes[slug] || url;
  Linking.canOpenURL(nativeUrl).then(supported => {
    Linking.openURL(supported ? nativeUrl : url);
  }).catch(() => Linking.openURL(url));
}


function useInterstitial() { return () => {}; }

function AdBanner() { return null; }



// ── Onboarding Screen ─────────────────────────────────────────
function OnboardingScreen({ user, onComplete }) {
  const [step, setStep] = useState(0); // 0=welcome 1=platforms 2=genres 3=languages 4=profile
  const [selPlatforms, setSelPlatforms] = useState(PLATFORMS.map(p => p.slug));
  const [selGenres, setSelGenres] = useState([]);
  const [selLanguages, setSelLanguages] = useState([]);
  const [displayName, setDisplayName] = useState('');
  const [surname, setSurname] = useState('');
  const [username, setUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const u = username.trim().toLowerCase();
    if (!u) { setUsernameStatus(''); return; }
    if (!/^[a-z0-9_]{3,20}$/.test(u)) { setUsernameStatus('invalid'); return; }
    setUsernameStatus('checking');
    const t = setTimeout(() => {
      dbXHR('public_profiles?username=ilike.' + u.replace(/_/g, '\\_') + '&select=id').then(({ data }) => {
        setUsernameStatus(Array.isArray(data) && data.length > 0 ? 'taken' : 'available');
      }).catch(() => setUsernameStatus(''));
    }, 500);
    return () => clearTimeout(t);
  }, [username]);

  function togglePlatform(slug) {
    setSelPlatforms(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]);
  }
  function toggleGenre(id) {
    setSelGenres(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);
  }
  function toggleLanguage(code) {
    setSelLanguages(prev => prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]);
  }

  async function finish() {
    setLoading(true);
    const u = username.trim().toLowerCase();
    await dbXHR('profiles', 'POST', {
      id: user.id,
      selected_platforms: selPlatforms,
      favorite_genres: selGenres,
      favorite_languages: selLanguages,
      display_name: displayName || null,
      surname: surname || null,
      username: u,
      birth_date: birthDate || null,
      gender: gender || null,
      bio: bio || null,
      updated_at: new Date().toISOString(),
    });
    onComplete({ platforms: selPlatforms, genres: selGenres, languages: selLanguages });
    setLoading(false);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
      <StatusBar barStyle="light-content" />
      {/* Progress */}
      <View style={{ flexDirection: 'row', gap: 6, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 4 }}>
        {[0,1,2,3,4].map(i => (
          <View key={i} style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: i <= step ? '#fff' : 'rgba(255,255,255,0.15)' }} />
        ))}
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">

        {step === 0 && (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 }}>
            <Image source={require('./assets/images/logo.png')} style={{ width: 90, height: 90, borderRadius: 22, marginBottom: 24 }} resizeMode="contain" />
            <Text style={{ color: '#fff', fontSize: 32, fontWeight: '800', letterSpacing: 0.5, marginBottom: 12 }}>İzlio'ya Hoş Geldin</Text>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, textAlign: 'center', lineHeight: 24 }}>
              Sana özel içerik keşfi için birkaç saniyeni al.
            </Text>
          </View>
        )}

        {step === 1 && (
          <View style={{ paddingTop: 32 }}>
            <Text style={{ color: '#fff', fontSize: 26, fontWeight: '800', marginBottom: 6 }}>Platformlarını Seç</Text>
            <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, marginBottom: 28 }}>Hangi platformlara aboneliğin var?</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {PLATFORMS.map(p => {
                const sel = selPlatforms.includes(p.slug);
                return (
                  <TouchableOpacity key={p.slug}
                    style={{ width: '47%', aspectRatio: 2.2, borderRadius: 14, backgroundColor: sel ? p.color : 'rgba(255,255,255,0.07)', borderWidth: 2, borderColor: sel ? p.color : 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => togglePlatform(p.slug)}>
                    <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>{p.name}</Text>
                    {sel && <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 }}>✓ Seçildi</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={{ paddingTop: 32 }}>
            <Text style={{ color: '#fff', fontSize: 26, fontWeight: '800', marginBottom: 6 }}>Favori Türlerin</Text>
            <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, marginBottom: 28 }}>Birden fazla seçebilirsin.</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {PROFILE_GENRES.map(g => {
                const sel = selGenres.includes(g.id);
                return (
                  <TouchableOpacity key={g.id}
                    style={{ paddingHorizontal: 16, paddingVertical: 12, borderRadius: 24, backgroundColor: sel ? '#fff' : 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: sel ? '#fff' : 'rgba(255,255,255,0.12)' }}
                    onPress={() => toggleGenre(g.id)}>
                    <Text style={{ color: sel ? '#000' : '#fff', fontWeight: sel ? '700' : '500', fontSize: 14 }}>{g.emoji} {g.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={{ paddingTop: 32 }}>
            <Text style={{ color: '#fff', fontSize: 26, fontWeight: '800', marginBottom: 6 }}>İçerik Dili Tercihi</Text>
            <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, marginBottom: 28 }}>Hangi dillerdeki içerikleri seversin? Birden fazla seçebilirsin.</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {PROFILE_LANGUAGES.map(l => {
                const sel = selLanguages.includes(l.code);
                return (
                  <TouchableOpacity key={l.code}
                    style={{ paddingHorizontal: 16, paddingVertical: 12, borderRadius: 24, backgroundColor: sel ? '#64d2ff' : 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: sel ? '#64d2ff' : 'rgba(255,255,255,0.12)' }}
                    onPress={() => toggleLanguage(l.code)}>
                    <Text style={{ color: sel ? '#000' : '#fff', fontWeight: sel ? '700' : '500', fontSize: 14 }}>{l.emoji} {l.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {step === 4 && (
          <View style={{ paddingTop: 32 }}>
            <Text style={{ color: '#fff', fontSize: 26, fontWeight: '800', marginBottom: 6 }}>Profilini Tamamla</Text>
            <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, marginBottom: 28 }}>Kullanıcı adı zorunludur, diğer alanlar isteğe bağlıdır.</Text>

            <View style={{ gap: 14 }}>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={[obStyles.inputRow, { flex: 1 }]}>
                  <TextInput style={obStyles.input} placeholder="İsmin" placeholderTextColor="rgba(255,255,255,0.3)" value={displayName} onChangeText={setDisplayName} />
                </View>
                <View style={[obStyles.inputRow, { flex: 1 }]}>
                  <TextInput style={obStyles.input} placeholder="Soyismin" placeholderTextColor="rgba(255,255,255,0.3)" value={surname} onChangeText={setSurname} />
                </View>
              </View>
              <View>
                <View style={obStyles.inputRow}>
                  <TextInput style={obStyles.input} placeholder="Kullanıcı adı (örn: ahmet_34)" placeholderTextColor="rgba(255,255,255,0.3)"
                    value={username} autoCapitalize="none" autoCorrect={false}
                    onChangeText={t => setUsername(t.replace(/[^a-zA-Z0-9_]/g, ''))} />
                </View>
                <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 6, marginLeft: 4 }}>Arkadaşların seni bulabilmesi için gerekir.</Text>
                {usernameStatus ? (
                  <Text style={{
                    fontSize: 12, marginTop: 6, marginLeft: 4,
                    color: usernameStatus === 'available' ? '#4cd964' : usernameStatus === 'checking' ? 'rgba(255,255,255,0.4)' : '#ff6b6b',
                  }}>
                    {usernameStatus === 'available' && '✓ Kullanılabilir'}
                    {usernameStatus === 'taken' && 'Bu kullanıcı adı alınmış'}
                    {usernameStatus === 'checking' && 'Kontrol ediliyor...'}
                    {usernameStatus === 'invalid' && '3-20 karakter, küçük harf/rakam/_ kullanın'}
                  </Text>
                ) : null}
              </View>
              <BirthDatePicker value={birthDate} onChange={setBirthDate} />
              <View style={{ gap: 8 }}>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 4 }}>Cinsiyet (isteğe bağlı)</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  {[['male','Erkek'],['female','Kadın'],['other','Diğer']].map(([val, label]) => (
                    <TouchableOpacity key={val}
                      style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: gender === val ? '#fff' : 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: gender === val ? '#fff' : 'rgba(255,255,255,0.12)', alignItems: 'center' }}
                      onPress={() => setGender(prev => prev === val ? '' : val)}>
                      <Text style={{ color: gender === val ? '#000' : '#fff', fontWeight: '600', fontSize: 14 }}>{label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 8 }}>Hakkımda (isteğe bağlı)</Text>
                <View style={[obStyles.inputRow, { minHeight: 90, alignItems: 'flex-start', paddingVertical: 12 }]}>
                  <TextInput
                    style={[obStyles.input, { minHeight: 70, textAlignVertical: 'top' }]}
                    placeholder="Kendinden bahset... (ör. ilgi alanların, izlemeyi sevdiğin türler)"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={bio} onChangeText={t => setBio(t.slice(0, 200))}
                    multiline numberOfLines={4} maxLength={200}
                  />
                </View>
                <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 4, textAlign: 'right' }}>{bio.length}/200</Text>
              </View>
            </View>
          </View>
        )}

      </ScrollView>

      {/* Bottom buttons */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 32, gap: 12 }}>
        {step < 4 ? (
          <TouchableOpacity
            style={[obStyles.mainBtn, step === 1 && selPlatforms.length === 0 && { opacity: 0.4 }]}
            disabled={step === 1 && selPlatforms.length === 0}
            onPress={() => setStep(s => s + 1)}>
            <Text style={obStyles.mainBtnText}>{step === 0 ? 'Başla' : 'Devam'} →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[obStyles.mainBtn, (loading || usernameStatus !== 'available') && { opacity: 0.4 }]}
            onPress={finish}
            disabled={loading || usernameStatus !== 'available'}>
            {loading ? <ActivityIndicator color="#000" /> : <Text style={obStyles.mainBtnText}>Tamamla 🎉</Text>}
          </TouchableOpacity>
        )}
        {step > 0 && (
          <TouchableOpacity onPress={() => setStep(s => s - 1)} style={{ alignItems: 'center', paddingVertical: 12 }}>
            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>← Geri</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const obStyles = StyleSheet.create({
  inputRow: { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  input: { color: '#fff', fontSize: 16 },
  mainBtn: { backgroundColor: '#fff', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  mainBtnText: { color: '#000', fontSize: 16, fontWeight: '800' },
});

// ── Birth Date Picker ──────────────────────────────────────────
function BirthDatePicker({ value, onChange }) {
  const parsed = value && value.length === 10 ? value.split('-') : ['', '', ''];
  const [year, setYear] = useState(parsed[0]);
  const [month, setMonth] = useState(parsed[1]);
  const [day, setDay] = useState(parsed[2]);
  const monthRef = useRef(null);
  const yearRef = useRef(null);

  useEffect(() => {
    if (value && value.length === 10) {
      setYear(value.slice(0, 4));
      setMonth(value.slice(5, 7));
      setDay(value.slice(8, 10));
    } else if (!value) {
      setYear(''); setMonth(''); setDay('');
    }
  }, [value]);

  function emit(y, m, d) {
    if (y.length === 4 && m.length >= 1 && d.length >= 1) {
      onChange(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`);
    } else {
      onChange('');
    }
  }

  const cell = { flex: 1, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 6, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' };
  const lbl = { color: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: '600', letterSpacing: 0.5, marginBottom: 4 };
  const inp = { color: '#fff', fontSize: 18, fontWeight: '600', textAlign: 'center', width: '100%' };

  return (
    <View>
      <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 10 }}>Doğum Tarihi</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={cell}>
          <Text style={lbl}>GÜN</Text>
          <TextInput style={inp} value={day} onChangeText={v => { const c = v.replace(/\D/g,'').slice(0,2); setDay(c); emit(year,month,c); if(c.length===2) monthRef.current?.focus(); }} keyboardType="number-pad" maxLength={2} placeholder="GG" placeholderTextColor="rgba(255,255,255,0.2)" />
        </View>
        <View style={cell}>
          <Text style={lbl}>AY</Text>
          <TextInput ref={monthRef} style={inp} value={month} onChangeText={v => { const c = v.replace(/\D/g,'').slice(0,2); setMonth(c); emit(year,c,day); if(c.length===2) yearRef.current?.focus(); }} keyboardType="number-pad" maxLength={2} placeholder="AA" placeholderTextColor="rgba(255,255,255,0.2)" />
        </View>
        <View style={[cell, { flex: 1.6 }]}>
          <Text style={lbl}>YIL</Text>
          <TextInput ref={yearRef} style={inp} value={year} onChangeText={v => { const c = v.replace(/\D/g,'').slice(0,4); setYear(c); emit(c,month,day); }} keyboardType="number-pad" maxLength={4} placeholder="YYYY" placeholderTextColor="rgba(255,255,255,0.2)" returnKeyType="done" />
        </View>
      </View>
    </View>
  );
}

// ── Profile Modal ──────────────────────────────────────────────
function AccordionSection({ title, isOpen, onToggle, children }) {
  return (
    <View style={{ borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14 }}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <Text style={{ flex: 1, color: '#fff', fontSize: 15, fontWeight: '700' }}>{title}</Text>
        <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16, fontWeight: '300' }}>{isOpen ? '∧' : '∨'}</Text>
      </TouchableOpacity>
      {isOpen && (
        <View style={{ paddingHorizontal: 18, paddingBottom: 18, gap: 12 }}>
          {children}
        </View>
      )}
    </View>
  );
}

function SettingsModal({ visible, user, selectedPlatforms, onClose, onSave, onSignOut, isPremium, onUpgrade }) {
  const [editName, setEditName] = useState('');
  const [editSurname, setEditSurname] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState(''); // '' | 'checking' | 'available' | 'taken' | 'invalid'
  const [editBirth, setEditBirth] = useState('');
  const [editGender, setEditGender] = useState('');
  const [editBio, setEditBio] = useState('');
  const [selPlatforms, setSelPlatforms] = useState(selectedPlatforms);
  const [selGenres, setSelGenres] = useState([]);
  const [selLanguages, setSelLanguages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [openPersonal, setOpenPersonal] = useState(false);
  const [openPlatforms, setOpenPlatforms] = useState(true);
  const [openGenres, setOpenGenres] = useState(false);
  const [openLanguages, setOpenLanguages] = useState(false);
  const initialUsernameRef = useRef('');

  useEffect(() => {
    if (visible && user) {
      dbXHR('profiles?id=eq.' + user.id + '&select=*').then(({ data }) => {
        const d = Array.isArray(data) ? data[0] : null;
        if (d) {
          setEditName(d.display_name || '');
          setEditSurname(d.surname || '');
          setEditUsername(d.username || '');
          initialUsernameRef.current = d.username || '';
          setEditBirth(d.birth_date || '');
          setEditGender(d.gender || '');
          setEditBio(d.bio || '');
          setSelPlatforms(d.selected_platforms?.length > 0 ? d.selected_platforms : selectedPlatforms);
          setSelGenres(d.favorite_genres || []);
          setSelLanguages(d.favorite_languages || []);
        }
      }).catch(() => {});
    }
  }, [visible]);

  useEffect(() => {
    const u = editUsername.trim().toLowerCase();
    if (!u || u === initialUsernameRef.current) { setUsernameStatus(''); return; }
    if (!/^[a-z0-9_]{3,20}$/.test(u)) { setUsernameStatus('invalid'); return; }
    setUsernameStatus('checking');
    const t = setTimeout(() => {
      dbXHR('public_profiles?username=ilike.' + u.replace(/_/g, '\\_') + '&select=id').then(({ data }) => {
        const taken = Array.isArray(data) && data.length > 0;
        setUsernameStatus(taken ? 'taken' : 'available');
      }).catch(() => setUsernameStatus(''));
    }, 500);
    return () => clearTimeout(t);
  }, [editUsername]);

  function togglePlatform(slug) {
    setSelPlatforms(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]);
  }
  function toggleGenre(id) {
    setSelGenres(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);
  }
  function toggleLanguage(code) {
    setSelLanguages(prev => prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]);
  }

  async function save() {
    const u = editUsername.trim().toLowerCase();
    if (u && usernameStatus === 'invalid') {
      setSaveError('Kullanıcı adı 3-20 karakter olmalı, sadece küçük harf, rakam ve _ içerebilir.');
      return;
    }
    if (u && usernameStatus === 'taken') {
      setSaveError('Bu kullanıcı adı zaten alınmış.');
      return;
    }
    if (u && usernameStatus === 'checking') {
      setSaveError('Kullanıcı adı kontrol ediliyor, lütfen bekleyin.');
      return;
    }
    setLoading(true); setSaveError('');
    const { error } = await dbXHR('profiles', 'POST', {
      id: user.id,
      display_name: editName || null,
      surname: editSurname || null,
      username: u || null,
      birth_date: editBirth || null,
      gender: editGender || null,
      bio: editBio || null,
      selected_platforms: selPlatforms,
      favorite_genres: selGenres,
      favorite_languages: selLanguages,
      updated_at: new Date().toISOString(),
    });
    if (error && error.message !== 'timeout') {
      setSaveError(/duplicate|unique/i.test(error.message || '') ? 'Bu kullanıcı adı zaten alınmış.' : (error.message || 'Kayıt başarısız.'));
    } else {
      initialUsernameRef.current = u;
      onSave(selPlatforms, selGenres, selLanguages);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setLoading(false);
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#111' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' }}>
          <Text style={{ flex: 1, color: '#fff', fontSize: 20, fontWeight: '800' }}>Profil Ayarları</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16 }}>Kapat</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }} keyboardShouldPersistTaps="handled">

          {/* Avatar */}
          <View style={{ alignItems: 'center', paddingVertical: 12 }}>
            <View style={{ marginBottom: 10 }}>
              <Avatar seed={user?.id} name={editName || editUsername || user?.email} size={72} />
            </View>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>{[editName, editSurname].filter(Boolean).join(' ') || user?.email}</Text>
            {editName ? <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 2 }}>{user?.email}</Text> : null}
            {editUsername ? <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 2 }}>@{editUsername}</Text> : null}
          </View>

          {/* Kişisel Bilgiler — accordion */}
          <AccordionSection title="Kişisel Bilgiler" isOpen={openPersonal} onToggle={() => setOpenPersonal(p => !p)}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={[pmStyles.inputRow, { flex: 1 }]}>
                <TextInput style={pmStyles.input} placeholder="İsim" placeholderTextColor="rgba(255,255,255,0.3)" value={editName} onChangeText={setEditName} />
              </View>
              <View style={[pmStyles.inputRow, { flex: 1 }]}>
                <TextInput style={pmStyles.input} placeholder="Soyisim" placeholderTextColor="rgba(255,255,255,0.3)" value={editSurname} onChangeText={setEditSurname} />
              </View>
            </View>
            <View>
              <View style={pmStyles.inputRow}>
                <TextInput style={pmStyles.input} placeholder="Kullanıcı adı (örn: ahmet_34)" placeholderTextColor="rgba(255,255,255,0.3)"
                  value={editUsername} autoCapitalize="none" autoCorrect={false}
                  onChangeText={t => setEditUsername(t.replace(/[^a-zA-Z0-9_]/g, ''))} />
              </View>
              {usernameStatus ? (
                <Text style={{
                  fontSize: 12, marginTop: 6, marginLeft: 4,
                  color: usernameStatus === 'available' ? '#4cd964' : usernameStatus === 'checking' ? 'rgba(255,255,255,0.4)' : '#ff6b6b',
                }}>
                  {usernameStatus === 'available' && '✓ Kullanılabilir'}
                  {usernameStatus === 'taken' && 'Bu kullanıcı adı alınmış'}
                  {usernameStatus === 'checking' && 'Kontrol ediliyor...'}
                  {usernameStatus === 'invalid' && '3-20 karakter, küçük harf/rakam/_ kullanın'}
                </Text>
              ) : null}
            </View>
            <BirthDatePicker value={editBirth} onChange={setEditBirth} />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {[['male','Erkek'],['female','Kadın'],['other','Diğer']].map(([val, label]) => (
                <TouchableOpacity key={val}
                  style={{ flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: editGender === val ? '#fff' : 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: editGender === val ? '#fff' : 'rgba(255,255,255,0.1)', alignItems: 'center' }}
                  onPress={() => setEditGender(prev => prev === val ? '' : val)}>
                  <Text style={{ color: editGender === val ? '#000' : 'rgba(255,255,255,0.7)', fontWeight: '600', fontSize: 13 }}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 8 }}>Hakkımda</Text>
              <View style={[pmStyles.inputRow, { minHeight: 90, alignItems: 'flex-start', paddingVertical: 12 }]}>
                <TextInput
                  style={[pmStyles.input, { minHeight: 70, textAlignVertical: 'top' }]}
                  placeholder="Kendinden bahset... (ör. ilgi alanların, izlemeyi sevdiğin türler)"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={editBio} onChangeText={t => setEditBio(t.slice(0, 200))}
                  multiline numberOfLines={4} maxLength={200}
                />
              </View>
              <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 4, textAlign: 'right' }}>{editBio.length}/200</Text>
            </View>
          </AccordionSection>

          {/* Platformlar — accordion */}
          <AccordionSection title="Platformlar" isOpen={openPlatforms} onToggle={() => setOpenPlatforms(p => !p)}>
            {Array.from({ length: Math.ceil(PLATFORMS.length / 2) }, (_, i) => i).map(row => (
              <View key={row} style={{ flexDirection: 'row', gap: 10 }}>
                {PLATFORMS.slice(row * 2, row * 2 + 2).map(p => {
                  const sel = selPlatforms.includes(p.slug);
                  return (
                    <TouchableOpacity key={p.slug} onPress={() => togglePlatform(p.slug)}
                      style={{ flex: 1, paddingVertical: 18, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: sel ? p.color : 'rgba(255,255,255,0.06)', borderWidth: 1.5, borderColor: sel ? p.color : 'rgba(255,255,255,0.1)', gap: 6, position: 'relative' }}>
                      {sel && (
                        <View style={{ position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: 9, backgroundColor: 'rgba(255,255,255,0.35)', alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ color: '#fff', fontSize: 9, fontWeight: '900' }}>✓</Text>
                        </View>
                      )}
                      <Text style={{ color: '#fff', fontSize: 13, fontWeight: sel ? '700' : '500', opacity: sel ? 1 : 0.5 }}>{p.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </AccordionSection>

          {/* Favori Türler — accordion */}
          <AccordionSection title={`Favori Türler${selGenres.length > 0 ? ` (${selGenres.length})` : ''}`} isOpen={openGenres} onToggle={() => setOpenGenres(p => !p)}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {PROFILE_GENRES.map(g => {
                const sel = selGenres.includes(g.id);
                return (
                  <TouchableOpacity key={g.id}
                    style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: sel ? '#fff' : 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: sel ? '#fff' : 'rgba(255,255,255,0.1)' }}
                    onPress={() => toggleGenre(g.id)}>
                    <Text style={{ color: sel ? '#000' : 'rgba(255,255,255,0.75)', fontWeight: sel ? '700' : '500', fontSize: 13 }}>{g.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </AccordionSection>

          {/* İçerik Dilleri — accordion */}
          <AccordionSection title={`İçerik Dili${selLanguages.length > 0 ? ` (${selLanguages.length})` : ''}`} isOpen={openLanguages} onToggle={() => setOpenLanguages(p => !p)}>
            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 10 }}>Hangi dillerdeki içerikleri seversin? Birden fazla seçebilirsin.</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {PROFILE_LANGUAGES.map(l => {
                const sel = selLanguages.includes(l.code);
                return (
                  <TouchableOpacity key={l.code}
                    style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: sel ? '#64d2ff' : 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: sel ? '#64d2ff' : 'rgba(255,255,255,0.1)' }}
                    onPress={() => toggleLanguage(l.code)}>
                    <Text style={{ color: sel ? '#000' : 'rgba(255,255,255,0.75)', fontWeight: sel ? '700' : '500', fontSize: 13 }}>{l.emoji} {l.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </AccordionSection>

          {/* Kaydet */}
          {saveError ? <Text style={{ color: '#ff6b6b', fontSize: 13, textAlign: 'center' }}>{saveError}</Text> : null}
          <TouchableOpacity style={[pmStyles.saveBtn, loading && { opacity: 0.6 }]} onPress={save} disabled={loading}>
            {loading ? <ActivityIndicator color="#000" /> : <Text style={pmStyles.saveBtnText}>{saved ? '✓ Kaydedildi' : 'Kaydet'}</Text>}
          </TouchableOpacity>

          {/* Premium */}
          {!isPremium && (
            <TouchableOpacity style={pmStyles.premiumBtn} onPress={onUpgrade}>
              <Text style={pmStyles.premiumBtnText}>Premium'a Geç — Reklamsız</Text>
            </TouchableOpacity>
          )}
          {isPremium && (
            <View style={{ paddingVertical: 12, alignItems: 'center' }}>
              <Text style={{ color: '#ffd43b', fontSize: 14, fontWeight: '700' }}>Premium Üye</Text>
            </View>
          )}

          {/* Çıkış */}
          <TouchableOpacity style={pmStyles.signOutBtn} onPress={onSignOut}>
            <Text style={pmStyles.signOutText}>Çıkış Yap</Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const pmStyles = StyleSheet.create({
  inputRow: { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  input: { color: '#fff', fontSize: 15 },
  saveBtn: { backgroundColor: '#fff', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#000', fontSize: 16, fontWeight: '800' },
  signOutBtn: { paddingVertical: 16, alignItems: 'center', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  signOutText: { color: 'rgba(255,255,255,0.5)', fontSize: 15, fontWeight: '600' },
  premiumBtn: { backgroundColor: '#ffd43b', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  premiumBtnText: { color: '#000', fontSize: 15, fontWeight: '800' },
});

// ── Username Setup Modal (kullanıcı adı henüz yoksa, mevcut kullanıcılara) ──
function UsernameSetupModal({ visible, user, suggested, onDone }) {
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (visible) { setUsername(suggested || ''); setStatus(''); } }, [visible]);

  useEffect(() => {
    const u = username.trim().toLowerCase();
    if (!u) { setStatus(''); return; }
    if (!/^[a-z0-9_]{3,20}$/.test(u)) { setStatus('invalid'); return; }
    setStatus('checking');
    const t = setTimeout(() => {
      dbXHR('public_profiles?username=ilike.' + u.replace(/_/g, '\\_') + '&select=id').then(({ data }) => {
        setStatus(Array.isArray(data) && data.length > 0 ? 'taken' : 'available');
      }).catch(() => setStatus(''));
    }, 500);
    return () => clearTimeout(t);
  }, [username]);

  async function save() {
    const u = username.trim().toLowerCase();
    if (!u || status !== 'available') return;
    setSaving(true);
    const { error } = await dbXHR('profiles', 'POST', { id: user.id, username: u, updated_at: new Date().toISOString() });
    setSaving(false);
    if (!error) onDone(u);
  }

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={() => onDone(null)}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.78)', justifyContent: 'center', padding: 24 }}>
        <View style={{ backgroundColor: '#15151f', borderRadius: 20, padding: 24, gap: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
          <Avatar seed={user?.id} name={username || user?.email} size={56} />
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800' }}>Kullanıcı Adı Seç</Text>
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 20 }}>
            Arkadaşlarının seni bulup takip edebilmesi için bir kullanıcı adı belirle.
          </Text>
          <View style={pmStyles.inputRow}>
            <TextInput style={pmStyles.input} placeholder="kullanici_adi" placeholderTextColor="rgba(255,255,255,0.3)"
              value={username} autoCapitalize="none" autoCorrect={false}
              onChangeText={t => setUsername(t.replace(/[^a-zA-Z0-9_]/g, ''))} />
          </View>
          {status ? (
            <Text style={{
              fontSize: 13, marginTop: -6,
              color: status === 'available' ? '#4cd964' : status === 'checking' ? 'rgba(255,255,255,0.4)' : '#ff6b6b',
            }}>
              {status === 'available' && '✓ Kullanılabilir'}
              {status === 'taken' && 'Bu kullanıcı adı alınmış'}
              {status === 'checking' && 'Kontrol ediliyor...'}
              {status === 'invalid' && '3-20 karakter, küçük harf/rakam/_ kullanın'}
            </Text>
          ) : null}
          <TouchableOpacity style={[pmStyles.saveBtn, (status !== 'available' || saving) && { opacity: 0.5 }]} disabled={status !== 'available' || saving} onPress={save}>
            {saving ? <ActivityIndicator color="#000" /> : <Text style={pmStyles.saveBtnText}>Kaydet</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDone(null)} style={{ alignItems: 'center', paddingVertical: 6 }}>
            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Daha sonra</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ── Auth Screen ──────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  // Kullanıcı email onaylayıp uygulamaya döndüğünde login moduna geç
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        setMsg(prev => {
          if (prev.includes('gönderildi')) {
            setMode('login');
            return 'Email onaylandıktan sonra giriş yapabilirsin.';
          }
          return prev;
        });
      }
    });
    return () => sub.remove();
  }, []);

  async function handleEmail() {
    if (!email || !password) { setError('Email ve şifre gerekli'); return; }
    setLoading(true); setError(''); setMsg('');
    try {
      if (mode === 'login') {
        const res = await fetch('https://bvggvperehlduxziaqfu.supabase.co/auth/v1/token?grant_type=password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'apikey': 'sb_publishable_Q3JqA0F8fU7vE6fQMZ_ZcA_-x5qLhnk' },
          body: JSON.stringify({ email, password }),
        });
        const json = await res.json();
        if (!res.ok || json.error) {
          setError(json.error_description || json.msg || json.error || 'Giriş başarısız');
        } else {
          if (json.access_token && json.refresh_token) {
            _SUPA.token = json.access_token;
            setStoredToken(json.access_token);
            await SecureStore.setItemAsync('izlio_access_token', json.access_token).catch(() => {});
            await SecureStore.setItemAsync('izlio_refresh_token', json.refresh_token).catch(() => {});
            await supabase.auth.setSession({ access_token: json.access_token, refresh_token: json.refresh_token }).catch(() => {});
          }
          onAuth(json.user);
        }
      } else {
        const result = await supabase.auth.signUp({ email, password });
        if (result.error) {
          setError(result.error.message);
        } else {
          setMsg('Doğrulama emaili gönderildi. Emailini kontrol et.');
          // 4 saniye sonra login moduna geç: kullanıcı emaili onaylayıp döndüğünde direkt giriş yapabilsin
          setTimeout(() => {
            setMode('login');
            setMsg('Email onaylandıktan sonra giriş yapabilirsin.');
          }, 4000);
        }
      }
    } catch(e) { setError(e.message); }
    setLoading(false);
  }

  async function handleForgot() {
    if (!email) { setError('Email adresin gerekli'); return; }
    setLoading(true); setError(''); setMsg('');
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) setError(error.message);
    else setMsg('Şifre sıfırlama emaili gönderildi.');
    setLoading(false);
  }

  async function handleGoogle() {
    if (Platform.OS === 'web') { setError('Google giriş sadece mobilde çalışır'); return; }
    setLoading(true); setError('');
    try {
      const redirectTo = 'izlio://auth/callback';
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo, skipBrowserRedirect: true },
      });
      if (error) { setError(error.message); setLoading(false); return; }

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (result.type !== 'success' || !result.url) { setLoading(false); return; }

      const params = new URLSearchParams(result.url.split('#')[1] || result.url.split('?')[1] || '');
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');
      if (!access_token || !refresh_token) { setError('Google girişi tamamlanamadı'); setLoading(false); return; }

      const { data: sessionData, error: sessionError } = await supabase.auth.setSession({ access_token, refresh_token });
      if (sessionError) setError(sessionError.message);
      else if (sessionData?.user) onAuth(sessionData.user);
    } catch(e) {
      setError(e.message || 'Google giriş başarısız');
    }
    setLoading(false);
  }

  async function handleApple() {
    if (Platform.OS !== 'ios') { setError('Apple girişi sadece iOS\'ta çalışır'); return; }
    setLoading(true); setError('');
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) { setError('Apple girişi tamamlanamadı'); setLoading(false); return; }

      const { data: sessionData, error: sessionError } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      });
      if (sessionError) setError(sessionError.message);
      else if (sessionData?.user) onAuth(sessionData.user);
    } catch(e) {
      if (e.code === 'ERR_REQUEST_CANCELED') { setLoading(false); return; }
      setError(e.message || 'Apple giriş başarısız');
    }
    setLoading(false);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={authStyles.container} keyboardShouldPersistTaps="handled">

          {/* Logo */}
          <View style={authStyles.logoWrap}>
            <Image source={require('./assets/images/logo.png')} style={authStyles.logo} resizeMode="contain" />
            <Text style={authStyles.subtitle}>Bir sonraki favorini keşfet.</Text>
          </View>

          {/* Social Buttons */}
          <View style={authStyles.socialWrap}>
            <TouchableOpacity style={authStyles.googleBtn} onPress={handleGoogle} disabled={loading}>
              <Svg width="20" height="20" viewBox="0 0 48 48">
                <Path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <Path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <Path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <Path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <Path fill="none" d="M0 0h48v48H0z"/>
              </Svg>
              <Text style={authStyles.googleText}>Google ile devam et</Text>
            </TouchableOpacity>

            <TouchableOpacity style={authStyles.appleBtnReal} onPress={handleApple}>
              <Svg width="20" height="24" viewBox="0 0 814 1000">
                <Path fill="#fff" d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.7 0 663 0 541.8c0-207.3 134.4-316.7 266.5-316.7 100.9 0 184.4 66.9 246.9 66.9 59.2 0 152-65.7 265.7-65.7zm-96.9-349.3c43.4-51.5 74.7-123.1 74.7-194.7 0-9.9-.6-19.9-2.5-28.6-71.4 2.5-154.7 47.9-206.4 107.3-39.5 44.7-81.8 116.8-81.8 189.3 0 10.5 1.9 21.1 2.5 24.4 4.5.6 11.5 1.9 18.5 1.9 63.5 0 144.4-42.8 194.9-99.6z"/>
              </Svg>
              <Text style={authStyles.appleBtnText}>Apple ile devam et</Text>
            </TouchableOpacity>
          </View>

          <View style={authStyles.dividerRow}>
            <View style={authStyles.divider} />
            <Text style={authStyles.dividerText}>ya da email ile</Text>
            <View style={authStyles.divider} />
          </View>

          {/* Email & Password */}
          <View style={authStyles.inputWrap}>
            <View style={authStyles.inputRow}>
              <Mail size={18} color="rgba(255,255,255,0.4)" strokeWidth={1.8} />
              <TextInput
                style={authStyles.input}
                placeholder="Email"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {mode !== 'forgot' && (
              <View style={authStyles.inputRow}>
                <EyeOff size={18} color="rgba(255,255,255,0.4)" strokeWidth={1.8} />
                <TextInput
                  style={authStyles.input}
                  placeholder="Şifre"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                  autoCapitalize="none"
                />
                <TouchableOpacity hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }} onPress={() => setShowPass(!showPass)}>
                  {showPass
                    ? <Eye size={18} color="rgba(255,255,255,0.5)" strokeWidth={1.8} />
                    : <EyeOff size={18} color="rgba(255,255,255,0.3)" strokeWidth={1.8} />}
                </TouchableOpacity>
              </View>
            )}
          </View>

          {error ? <Text style={authStyles.error}>{error}</Text> : null}
          {msg ? <Text style={authStyles.success}>{msg}</Text> : null}

          {/* Main Button */}
          <TouchableOpacity
            style={[authStyles.mainBtn, loading && { opacity: 0.6 }]}
            onPress={mode === 'forgot' ? handleForgot : handleEmail}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#000" />
              : <Text style={authStyles.mainBtnText}>
                  {mode === 'login' ? 'Giriş Yap' : mode === 'signup' ? 'Kayıt Ol' : 'Şifremi Sıfırla'}
                </Text>}
          </TouchableOpacity>

          {/* Mode Switch */}
          <View style={authStyles.switchRow}>
            {mode === 'login' && <>
              <TouchableOpacity hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }} onPress={() => { setMode('signup'); setError(''); setMsg(''); }}>
                <Text style={authStyles.linkText}>Hesap oluştur</Text>
              </TouchableOpacity>
              <Text style={authStyles.dot}> · </Text>
              <TouchableOpacity hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }} onPress={() => { setMode('forgot'); setError(''); setMsg(''); }}>
                <Text style={authStyles.linkText}>Şifremi unuttum</Text>
              </TouchableOpacity>
            </>}
            {mode !== 'login' && (
              <TouchableOpacity hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }} onPress={() => { setMode('login'); setError(''); setMsg(''); }}>
                <Text style={authStyles.linkText}>Zaten hesabım var</Text>
              </TouchableOpacity>
            )}
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const authStyles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 20, paddingBottom: 40, justifyContent: 'center' },
  logoWrap: { alignItems: 'center', marginBottom: 40 },
  logo: { width: 220, height: 110, marginBottom: 10 },
  subtitle: { color: 'rgba(255,255,255,0.45)', fontSize: 15, marginTop: 4 },
  socialWrap: { gap: 12, marginBottom: 24 },
  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 14, paddingVertical: 15 },
  googleText: { fontSize: 16, fontWeight: '600', color: '#111', letterSpacing: 0.2 },
  appleBtnReal: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#000', borderRadius: 14, paddingVertical: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  appleBtnText: { fontSize: 16, fontWeight: '600', color: '#fff', letterSpacing: 0.2 },
  appleBtn: { width: '100%', height: 50 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  divider: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  dividerText: { color: 'rgba(255,255,255,0.35)', fontSize: 13 },
  inputWrap: { gap: 12, marginBottom: 16 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  input: { flex: 1, color: '#fff', fontSize: 16 },
  error: { color: '#ff6b6b', fontSize: 13, textAlign: 'center', marginBottom: 10 },
  success: { color: '#51cf66', fontSize: 13, textAlign: 'center', marginBottom: 10 },
  mainBtn: { backgroundColor: '#fff', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 20 },
  mainBtnText: { color: '#000', fontSize: 16, fontWeight: '800' },
  switchRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: 4 },
  linkText: { color: 'rgba(255,255,255,0.6)', fontSize: 14, textDecorationLine: 'underline' },
  dot: { color: 'rgba(255,255,255,0.3)' },
});

export default function App() {
  useEffect(() => { checkForOTAUpdate(); }, []);

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [favoriteGenres, setFavoriteGenres] = useState([]);
  const [favoriteLanguages, setFavoriteLanguages] = useState([]);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);
  const [usernameSuggestion, setUsernameSuggestion] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [showWatchlist, setShowWatchlist] = useState(false);
  const [watchlistItem, setWatchlistItem] = useState(null);

  // Kullanıcı giriş yaptığında profil bilgilerini yükle
  useEffect(() => {
    if (!user) return;
    dbXHR('profiles?id=eq.' + user.id + '&select=selected_platforms,is_premium,favorite_genres,favorite_languages,username,display_name')
      .then(({ data }) => {
        const d = Array.isArray(data) ? data[0] : null;
        if (d?.selected_platforms && d.selected_platforms.length > 0) {
          saveSelectedPlatforms(d.selected_platforms);
          setSelectedPlatforms(d.selected_platforms);
          setShowOnboarding(false);
          if (!d.username) {
            setUsernameSuggestion(suggestUsername(d.display_name) || suggestUsername((user.email || '').split('@')[0]) || '');
            setShowUsernamePrompt(true);
          }
        } else {
          setShowOnboarding(true);
        }
        if (d?.is_premium) setIsPremium(true);
        if (d?.favorite_genres?.length > 0) setFavoriteGenres(d.favorite_genres);
        if (d?.favorite_languages?.length > 0) setFavoriteLanguages(d.favorite_languages);
      })
      .catch(() => { setShowOnboarding(true); });
  }, [user?.id]);

  useEffect(() => {
    async function initSession() {
      try {
        const accessToken = await SecureStore.getItemAsync('izlio_access_token').catch(() => null);
        const refreshToken = await SecureStore.getItemAsync('izlio_refresh_token').catch(() => null);
        if (accessToken && refreshToken) {
          await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }).catch(() => {});
        }
      } catch (_) {}
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.access_token) { _SUPA.token = session.access_token; setStoredToken(session.access_token); }
        setUser(session?.user ?? null);
        setAuthLoading(false);
      }).catch(e => { console.error('getSession catch:', e); setAuthLoading(false); });
    }
    initSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        if (session?.access_token) {
          _SUPA.token = session.access_token; setStoredToken(session.access_token);
          await SecureStore.setItemAsync('izlio_access_token', session.access_token).catch(() => {});
          if (session.refresh_token) await SecureStore.setItemAsync('izlio_refresh_token', session.refresh_token).catch(() => {});
        } else if (_event === 'SIGNED_OUT') {
          _SUPA.token = null; setStoredToken(null);
          SecureStore.deleteItemAsync('izlio_access_token').catch(() => {});
          SecureStore.deleteItemAsync('izlio_refresh_token').catch(() => {});
        }
        const u = session?.user ?? null;
        setUser(u);
        if (u && _event === 'SIGNED_IN') {
          const { data } = await dbXHR('profiles?id=eq.' + u.id + '&select=selected_platforms');
          const d = Array.isArray(data) ? data[0] : null;
          if (d?.selected_platforms && d.selected_platforms.length > 0) {
            saveSelectedPlatforms(d.selected_platforms);
          }
        }
      } catch(e) { console.error('onAuthStateChange error:', e); }
    });

    // Email doğrulama deep link handler
    const handleUrl = async (url) => {
      try {
        if (!url) return;
        const [base, fragment] = url.split('#');
        const queryStr = (base.includes('?') ? base.split('?')[1] : '') || fragment || '';
        const params = new URLSearchParams(queryStr);

        const token_hash = params.get('token_hash');
        const type = params.get('type');
        if (token_hash && type) {
          try { await supabase.auth.verifyOtp({ token_hash, type }); } catch(e) { console.error('verifyOtp error:', e); }
          return;
        }

        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        if (access_token && refresh_token) {
          try { await supabase.auth.setSession({ access_token, refresh_token }); } catch(e) {}
        }
      } catch(e) { console.error('handleUrl error:', e); }
    };

    Linking.getInitialURL().then(url => { if (url) handleUrl(url); }).catch(e => console.error('Linking error:', e));
    const linkingSub = Linking.addEventListener('url', ({ url }) => handleUrl(url));

    return () => { subscription.unsubscribe(); linkingSub.remove(); };
  }, []);

  useEffect(() => {
    if (!authLoading) setTimeout(() => SplashScreen.hideAsync(), 2000);
  }, [authLoading]);

  const [selectedPlatforms, setSelectedPlatforms] = useState(getSelectedPlatforms);
  const [showPlatformModal, setShowPlatformModal] = useState(false);

  function handlePlatformToggle(slug) {
    setSelectedPlatforms(prev => {
      const next = prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug];
      saveSelectedPlatforms(next);
      return next;
    });
  }

  function handlePlatformSave(slugs) { setSelectedPlatforms(slugs); saveSelectedPlatforms(slugs); if (user) savePlatformsToProfile(user.id, slugs).catch(() => {}); }

  if (authLoading) return null;
  if (!user) return <AuthScreen onAuth={(u) => { setUser(u); }} />;
  if (showWatchlist) return (
    <>
      <WatchlistScreen
        user={user}
        onBack={() => { setShowWatchlist(false); setWatchlistItem(null); }}
        onItemPress={(item) => setWatchlistItem(item)}
      />
      <DetailModal key={watchlistItem?.id || 'wmodal'} item={watchlistItem} onClose={() => setWatchlistItem(null)} user={user} />
    </>
  );

  if (showOnboarding) return <OnboardingScreen user={user} onComplete={({ platforms, genres, languages }) => {
    setSelectedPlatforms(platforms);
    saveSelectedPlatforms(platforms);
    savePlatformsToProfile(user.id, platforms).catch(() => {});
    if (genres) setFavoriteGenres(genres);
    if (languages) setFavoriteLanguages(languages);
    setShowOnboarding(false);
  }} />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
      <StatusBar barStyle="light-content" />
      <SettingsModal
        visible={showProfile}
        user={user}
        selectedPlatforms={selectedPlatforms}
        onClose={() => setShowProfile(false)}
        onSave={(platforms, genres, languages) => { setSelectedPlatforms(platforms); saveSelectedPlatforms(platforms); if (genres) setFavoriteGenres(genres); if (languages) setFavoriteLanguages(languages); }}
        onSignOut={() => { _SUPA.token = null; setStoredToken(null); SecureStore.deleteItemAsync('izlio_access_token').catch(() => {}); SecureStore.deleteItemAsync('izlio_refresh_token').catch(() => {}); supabase.auth.signOut().catch(() => {}); setUser(null); setShowProfile(false); }}
        isPremium={isPremium}
        onUpgrade={() => { setShowProfile(false); alert('Yakında! In-App Purchase entegrasyonu hazırlanıyor.'); }}
      />
      <UsernameSetupModal
        visible={showUsernamePrompt}
        user={user}
        suggested={usernameSuggestion}
        onDone={() => setShowUsernamePrompt(false)}
      />
      <PlatformModal visible={showPlatformModal} selected={selectedPlatforms} onSave={handlePlatformSave} onClose={() => setShowPlatformModal(false)} />
      <AppleTVMainScreen
        user={user}
        selectedPlatforms={selectedPlatforms}
        favoriteGenres={favoriteGenres}
        favoriteLanguages={favoriteLanguages}
        isPremium={isPremium}
        onWatchlist={() => setShowWatchlist(true)}
        onProfile={() => setShowProfile(true)}
      />
    </SafeAreaView>
  );
}

const BG = '#0a0a0f';
const CARD = '#13131f';
const SURFACE = '#1a1a2e';
const BORDER = '#ffffff11';
const ACCENT = '#00A8E1';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

  // ── Tab Bar ──────────────────────────────────────
  tabBar: { flexDirection: 'row', backgroundColor: 'rgba(18,18,18,0.97)', borderTopWidth: 0.5, borderTopColor: 'rgba(255,255,255,0.08)', paddingBottom: 6, paddingTop: 4 },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 6, gap: 3 },
  tabItemActive: {},
  tabLabel: { color: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: '500', letterSpacing: 0.3 },
  tabLabelActive: { color: '#ffffff', fontWeight: '600' },

  // ── Header ───────────────────────────────────────
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 10, borderBottomWidth: 0 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  appTitle: { color: '#ffffff', fontSize: 28, fontWeight: '700', letterSpacing: 2 },
  appLogoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  appLogoIcon: { width: 32, height: 32, borderRadius: 8 },
  sectionTitle: { color: '#ffffff', fontSize: 26, fontWeight: '700', letterSpacing: -0.6 },
  platformSelectBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  platformSelectDots: { flexDirection: 'row', gap: 4 },
  platformSelectDot: { width: 8, height: 8, borderRadius: 4 },
  platformSelectText: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '500' },
  platformSelectCount: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },

  // ── Search ───────────────────────────────────────
  searchRow: { flexDirection: 'row', paddingHorizontal: 16, marginVertical: 10, gap: 8, alignItems: 'center' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchInput: { flex: 1, backgroundColor: 'rgba(118,118,128,0.18)', color: '#fff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 16 },
  clearBtn: { backgroundColor: 'rgba(118,118,128,0.18)', width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  clearBtnText: { color: 'rgba(255,255,255,0.4)', fontSize: 14 },
  searchBtn: { backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 16, paddingVertical: 11, borderRadius: 12 },
  searchIconBtn: { backgroundColor: 'rgba(255,255,255,0.12)', width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  searchIconText: { color: '#ffffff', fontSize: 22 },
  searchBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  // ── Filters ──────────────────────────────────────
  filterBar: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8, alignItems: 'center', gap: 8 },
  filterToggle: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: 'rgba(118,118,128,0.18)', alignItems: 'center' },
  filterToggleActive: { backgroundColor: 'rgba(255,255,255,0.1)' },
  filterToggleText: { color: 'rgba(255,255,255,0.45)', fontSize: 13, fontWeight: '600' },
  filterToggleTextActive: { color: '#ffffff' },
  resetBtnInline: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: 'rgba(255,59,48,0.12)' },
  resetBtnInlineText: { color: '#ff453a', fontSize: 13, fontWeight: '600' },
  filtersBox: { marginHorizontal: 16, marginBottom: 10, backgroundColor: 'rgba(44,44,46,0.96)', borderRadius: 16, padding: 16 },
  filterSectionTitle: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, marginTop: 4 },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  typeBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(118,118,128,0.18)', alignItems: 'center' },
  typeBtnActive: { backgroundColor: 'rgba(255,255,255,0.2)' },
  typeBtnText: { color: 'rgba(255,255,255,0.45)', fontSize: 13, fontWeight: '600' },
  typeBtnTextActive: { color: '#fff' },
  sortRow: { flexDirection: 'row', gap: 8, marginBottom: 14, flexWrap: 'wrap' },
  sortBtn: { paddingHorizontal: 14, paddingVertical: 11, borderRadius: 10, backgroundColor: 'rgba(118,118,128,0.18)' },
  sortBtnActive: { backgroundColor: 'rgba(255,255,255,0.15)' },
  sortDirBtn: { marginLeft: 'auto' },
  sortBtnText: { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  sortBtnTextActive: { color: '#ffffff', fontWeight: '600' },
  filterLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 6 },
  filterValue: { color: '#ffffff', fontWeight: '600' },
  sliderBtn: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 16, backgroundColor: 'rgba(118,118,128,0.18)', marginRight: 6 },
  sliderBtnActive: { backgroundColor: 'rgba(255,255,255,0.2)' },
  sliderBtnText: { color: 'rgba(255,255,255,0.45)', fontSize: 12 },
  sliderBtnTextActive: { color: '#fff', fontWeight: '600' },

  // ── Content Cards ─────────────────────────────────
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingHorizontal: 14, paddingBottom: 20 },
  card: { flexDirection: 'row', backgroundColor: 'rgba(28,28,30,0.8)', borderRadius: 16, marginBottom: 10, overflow: 'hidden' },
  cardPosterWrap: { position: 'relative' },
  poster: { width: 90, height: 132 },
  posterPlaceholder: { width: 90, height: 132, backgroundColor: 'rgba(44,44,46,0.8)', alignItems: 'center', justifyContent: 'center' },
  posterPlaceholderText: { color: 'rgba(255,255,255,0.12)', fontSize: 24 },
  cardImdbOverlay: { position: 'absolute', bottom: 6, left: 4, flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 6, paddingHorizontal: 4, paddingVertical: 2 },
  cardImdbScore: { color: '#fff', fontSize: 11, fontWeight: '700' },
  info: { flex: 1, padding: 12, justifyContent: 'space-between' },
  row: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 2, flexWrap: 'wrap' },
  title: { color: '#ffffff', fontSize: 15, fontWeight: '600', marginBottom: 4, letterSpacing: -0.3, lineHeight: 20 },
  originalTitle: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginBottom: 4 },
  cardMeta: { color: 'rgba(255,255,255,0.45)', fontSize: 12, marginBottom: 8 },
  typeText: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  genreText: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  metaText: { color: 'rgba(255,255,255,0.4)', fontSize: 11 },
  dot: { color: 'rgba(255,255,255,0.25)', fontSize: 11 },
  platformRow: { flexDirection: 'row', gap: 6, marginBottom: 8, flexWrap: 'wrap' },
  platformPill: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  platformPillLogo: { width: 42, height: 12 },
  bottomRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginTop: 'auto' },
  imdbBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  imdbBadge: { backgroundColor: '#F5C518', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 5 },
  imdbBadgeText: { color: '#000', fontSize: 9, fontWeight: '900' },
  imdbScore: { color: '#fff', fontSize: 13, fontWeight: '700' },
  imdbArrow: { color: 'rgba(255,255,255,0.35)', fontSize: 11 },
  trailerBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.15)' },
  trailerBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  detailBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: 'rgba(118,118,128,0.2)' },
  detailBtnText: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  scrollTopBtn: { position: 'absolute', right: 16, bottom: 80, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: {width:0,height:2}, shadowOpacity: 0.4, shadowRadius: 8 },
  scrollTopIcon: { color: '#fff', fontSize: 20, fontWeight: 'bold' },

  // ── Modal ────────────────────────────────────────
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  detailModalContainer: { backgroundColor: '#1c1c1e', borderRadius: 20, margin: 16, marginTop: 'auto', maxHeight: '90%', overflow: 'hidden' },
  modalScrollContent: { padding: 20 },
  modalHeader: { flexDirection: 'row', gap: 14, marginBottom: 14 },
  modalPoster: { width: 90, height: 130, borderRadius: 12 },
  modalPosterPlaceholder: { width: 90, height: 130, backgroundColor: 'rgba(44,44,46,0.8)', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  modalHeaderInfo: { flex: 1, justifyContent: 'flex-start', gap: 4 },
  modalTitle: { color: '#fff', fontSize: 17, fontWeight: '700', letterSpacing: -0.3 },
  modalOriginalTitle: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
  modalMeta: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  modalImdbRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  imdbScoreLarge: { color: '#fff', fontSize: 18, fontWeight: '700' },
  modalPlatformRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 6 },
  modalPlatformBtn: { borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10 },
  modalPlatformLogo: { width: 48, height: 14 },
  modalTagline: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontStyle: 'italic', marginBottom: 12, paddingLeft: 12, borderLeftWidth: 2, borderLeftColor: 'rgba(255,255,255,0.3)' },
  modalDetail: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 6, lineHeight: 18 },
  modalDetailLabel: { color: 'rgba(255,255,255,0.45)', fontWeight: '600' },
  modalSynopsisTitle: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '700', marginTop: 8, marginBottom: 4, letterSpacing: 0.5 },
  modalSynopsis: { color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 20 },
  modalButtons: { flexDirection: 'row', gap: 8, marginTop: 14, flexWrap: 'wrap' },
  closeBtn: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 10, backgroundColor: 'rgba(118,118,128,0.2)' },
  closeBtnText: { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  imdbLinkBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 12, borderRadius: 10, backgroundColor: 'rgba(245,197,24,0.12)' },
  imdbLinkText: { color: '#F5C518', fontSize: 13, fontWeight: '600' },
  similarSection: { marginTop: 16 },
  similarTitle: { color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: '700', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  similarCard: { width: 90 },
  similarPoster: { width: 90, height: 130, borderRadius: 10, marginBottom: 6 },
  similarCardTitle: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginBottom: 4, lineHeight: 14 },
  similarScore: { color: '#fff', fontSize: 11, fontWeight: '700' },
  similarPlatformDot: { width: 7, height: 7, borderRadius: 4 },

  // ── Platform Modal ───────────────────────────────
  platformModalContainer: { backgroundColor: '#1c1c1e', borderRadius: 20, margin: 16, padding: 20 },
  platformModalHandle: { width: 36, height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  platformModalTitle: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 4, letterSpacing: -0.4 },
  platformModalSubtitle: { color: 'rgba(255,255,255,0.45)', fontSize: 13, marginBottom: 20 },
  platformGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  platformCard: { width: '47%', borderRadius: 14, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent' },
  platformCardBg: { padding: 20, alignItems: 'center', justifyContent: 'center', minHeight: 70 },
  platformCardLogo: { width: 100, height: 28 },
  platformCardCheck: { position: 'absolute', top: 8, right: 8, width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  platformCardCheckText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  platformModalCard: { borderRadius: 16, padding: 16, alignItems: 'center', gap: 8 },
  platformSaveBtn: { backgroundColor: 'rgba(255,255,255,0.15)', paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  platformSaveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // ── Popular Screen ───────────────────────────────
  popularHeader: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10 },
  popularHeaderTitle: { color: '#fff', fontSize: 22, fontWeight: '700', letterSpacing: -0.5 },
  popularHeaderSub: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 },
  popularTopBar: { borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.08)', backgroundColor: BG },
  popularTopBarRow: { paddingHorizontal: 16, paddingVertical: 10, gap: 8, flexDirection: 'row' },
  popularTopBtn: { paddingHorizontal: 14, paddingVertical: 11, borderRadius: 20, backgroundColor: 'rgba(118,118,128,0.18)' },
  popularTopBtnActive: { backgroundColor: 'rgba(255,255,255,0.2)' },
  popularTopBtnGenreActive: { backgroundColor: 'rgba(255,255,255,0.15)' },
  popularTopBtnText: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '500' },
  popularTopBtnTextActive: { color: '#ffffff', fontWeight: '600' },
  popularTopBtnTextGenreActive: { color: '#ffffff', fontWeight: '600' },
  popularTopSeparator: { width: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 2 },
  genreDropdown: { marginHorizontal: 16, marginBottom: 8, backgroundColor: 'rgba(44,44,46,0.98)', borderRadius: 14, padding: 8, maxHeight: 280 },
  genreDropdownItem: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  genreDropdownItemActive: { backgroundColor: 'rgba(10,132,255,0.2)' },
  genreDropdownText: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  genreDropdownTextActive: { color: '#0a84ff', fontWeight: '600' },
  popularSection: { marginBottom: 12 },
  popularPlatformLabel: { marginHorizontal: 16, marginBottom: 10, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 9, alignSelf: 'flex-start' },
  popularPlatformLogo: { width: 100, height: 24 },
  popularRow: { paddingHorizontal: 16, gap: 10 },
  popularCard: { width: 115 },
  popularCardImg: { width: 115, height: 168, borderRadius: 12, marginBottom: 6 },
  popularCardTitle: { color: 'rgba(255,255,255,0.85)', fontSize: 11, lineHeight: 14, marginBottom: 4 },
  popularImdb: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  popularScore: { color: '#fff', fontSize: 11, fontWeight: '700' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyText: { color: '#ffffff', fontSize: 18, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  emptySubText: { color: 'rgba(255,255,255,0.4)', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  popularRankBadge: { position: 'absolute', top: 6, left: 6, zIndex: 1, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2 },
  popularRank: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  popularFireBadge: { backgroundColor: 'rgba(26,26,46,0.9)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, marginLeft: 6 },
  popularFireText: { color: '#ff6b35', fontSize: 11, fontWeight: '700' },

  // ── Collections ──────────────────────────────────
  collectionHeader: { paddingHorizontal: 16, paddingBottom: 6, paddingTop: 4 },
  collectionName: { color: '#ffffff', fontSize: 15, fontWeight: '600', marginBottom: 4, letterSpacing: -0.3 },
  collectionMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  collectionScore: { color: '#fff', fontSize: 13, fontWeight: '700' },
  collectionCount: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },

  // ── Misc ─────────────────────────────────────────
  filtersBtn: { marginHorizontal: 16, marginVertical: 8, backgroundColor: 'rgba(44,44,46,0.8)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 },
  filtersBtnActive: { backgroundColor: 'rgba(255,255,255,0.1)' },
  filtersBtnText: { color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  filtersBtnTextActive: { color: '#ffffff' },
  imdbBadgeHeader: { backgroundColor: '#F5C518', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  imdbBadgeHeaderText: { color: '#000', fontSize: 10, fontWeight: 'bold' },
  headerRight: { flex: 1, gap: 6 },
  headerTagRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerSubtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  commentBubble: { backgroundColor: 'rgba(10,132,255,0.12)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10 },
  commentText: { color: 'rgba(10,132,255,0.9)', fontSize: 13, fontStyle: 'italic', fontWeight: '500' },
  appIcon: { width: 70, height: 70, borderRadius: 18, backgroundColor: '#E50914', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  appIconPlay: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center', position: 'absolute', top: 8, left: 10 },
  appIconTriangle: { width: 0, height: 0, borderTopWidth: 7, borderBottomWidth: 7, borderLeftWidth: 12, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: '#fff', marginLeft: 2 },
  appIconQ: { position: 'absolute', bottom: 4, right: 8 },
  appIconQText: { color: '#fff', fontSize: 32, fontWeight: '900', lineHeight: 36 },
  platformLogoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  platformLogoCard: { flex: 1, minWidth: '45%', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, justifyContent: 'center', alignItems: 'center' },
  platformLogoImg: { width: 80, height: 22 },
  platformLogoOff: { fontSize: 10, fontWeight: '700', marginTop: 4 },

  // Home Screen
  homeTopBar: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  homeTopBarTitle: { color: '#fff', fontSize: 28, fontWeight: '700', letterSpacing: 2 },
  homeLogo: { alignItems: 'center', paddingTop: 20, paddingBottom: 28 },
  homeTitle: { color: '#fff', fontSize: 42, fontWeight: '800', letterSpacing: 1 },
  homeTagline: { color: 'rgba(255,255,255,0.45)', fontSize: 15, marginTop: 6, letterSpacing: 0.3 },
  homeSectionWrap: { paddingHorizontal: 20, marginBottom: 28 },
  homeSectionLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 },
  homePlatformRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  homePlatformCard: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, backgroundColor: 'rgba(255,255,255,0.05)', position: 'relative', width: '47%' },
  homePlatformDot: { width: 8, height: 8, borderRadius: 4 },
  homePlatformName: { fontSize: 13, fontWeight: '600' },
  homePlatformCheck: { position: 'absolute', top: -5, right: -5, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  homeTabGrid: { gap: 12 },
  homeTabCard: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', position: 'relative' },
  homeTabIconWrap: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  homeTabName: { color: '#fff', fontSize: 17, fontWeight: '700', marginBottom: 4 },
  homeTabDesc: { color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 18 },
  homeTabArrow: { position: 'absolute', top: 18, right: 18, width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  homeLogoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  homeLogoIcon: { width: 44, height: 44, borderRadius: 10 },
  miniHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 10 },
  miniHeaderBack: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  backBtnText: { color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: '700', letterSpacing: 0.2 },
  miniHeaderTitle: { flex: 1, color: '#fff', fontSize: 26, fontWeight: '700', letterSpacing: -0.6 },
});