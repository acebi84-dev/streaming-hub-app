import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity,
  Image, ActivityIndicator, SafeAreaView, StatusBar, ScrollView,
  Animated, Modal,
} from 'react-native';
import { Linking } from 'react-native';
import { supabase } from './supabase';
import { Compass, TrendingUp, Film } from 'lucide-react-native';

const PLATFORMS = [
  { slug: 'netflix',  name: 'Netflix',      color: '#E50914', darkLogo: 'https://media.movieofthenight.com/services/netflix/logo-white.svg' },
  { slug: 'amazon',   name: 'Prime Video',  color: '#00A8E1', darkLogo: 'https://media.movieofthenight.com/services/prime/logo-white.svg' },
  { slug: 'disney',   name: 'Disney+',      color: '#0063E5', darkLogo: 'https://media.movieofthenight.com/services/disney/logo-white.svg' },
  { slug: 'hbo',      name: 'HBO Max',      color: '#8B4FBE', darkLogo: 'https://media.movieofthenight.com/services/hbo/logo-white.svg' },
];

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

function getSelectedPlatforms() {
  try { const s = localStorage.getItem('selectedPlatforms'); if (s) {
    const parsed = JSON.parse(s);
    const valid = parsed.filter(slug => PLATFORMS.some(p => p.slug === slug));
    return valid.length > 0 ? valid : PLATFORMS.map(p => p.slug);
  } } catch (e) {}
  return PLATFORMS.map(p => p.slug);
}
function saveSelectedPlatforms(slugs) {
  try { localStorage.setItem('selectedPlatforms', JSON.stringify(slugs)); } catch (e) {}
}

function CarouselComments() {
  const [index, setIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]).start();
      setIndex(prev => (prev + 1) % COMMENTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  return (
    <Animated.View style={[styles.commentBubble, { opacity: fadeAnim }]}>
      <Text style={styles.commentText}>{COMMENTS[index]}</Text>
    </Animated.View>
  );
}

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
                      <Image source={{ uri: p.darkLogo }} style={styles.platformCardLogo} resizeMode="contain" />
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

function DetailModal({ item, onClose }) {
  if (!item) return null;
  const typeLabel = item.type === 'movie' ? '🎬 Film' : '📺 Dizi';
  const langLabel = item.original_language ? LANGUAGE_MAP[item.original_language] : null;
  const [similarItems, setSimilarItems] = React.useState([]);

  React.useEffect(() => {
    setSimilarItems([]);
    if (!item.imdb_id) return;
    fetchSimilar(item);
  }, [item.imdb_id]);

  async function fetchSimilar(item) {
    try {
      // First get similar_tmdb_ids from DB
      const { data: contentData } = await supabase
        .from('hub_contents')
        .select('similar_tmdb_ids')
        .eq('imdb_id', item.imdb_id)
        .single();

      const tmdbIds = contentData?.similar_tmdb_ids;
      if (!tmdbIds || tmdbIds.length === 0) return;

      // Find contents in our DB that match these TMDB ids via imdb lookup
      // We store tmdb ids, so we need to find matching hub_contents
      // Use a workaround: find by checking tmdb_id if available, else skip
      // For now, fetch imdb_ids from TMDB for these tmdb_ids
      const TMDB_KEY = 'd92c22452d03782f77e3523e6929f85a';
      const type = item.type === 'movie' ? 'movie' : 'tv';
      const imdbIds = (await Promise.all(
        tmdbIds.slice(0, 10).map(async tmdbId => {
          const r = await fetch(`https://api.themoviedb.org/3/${type}/${tmdbId}/external_ids?api_key=${TMDB_KEY}`);
          const d = await r.json();
          return d.imdb_id;
        })
      )).filter(Boolean);

      if (imdbIds.length === 0) return;

      const { data } = await supabase
        .from('hub_contents')
        .select('id, title, title_tr, original_language, imdb_score, poster_url, imdb_id, availability:hub_availability(platform_slug, platform_url)')
        .in('imdb_id', imdbIds)
        .not('imdb_score', 'is', null);

      const filtered = (data || []).filter(i => i.availability && i.availability.length > 0).slice(0, 10);
      setSimilarItems(filtered);
    } catch (e) {
      console.error('Similar fetch error:', e);
    }
  }

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.detailModalContainer}>
          <TouchableOpacity activeOpacity={1}>
            <View style={styles.modalHeader}>
              {item.poster_url ? <Image source={{ uri: item.poster_url }} style={styles.modalPoster} /> : <View style={styles.modalPosterPlaceholder}><Text style={{ color: '#ffffff22', fontSize: 24 }}>?</Text></View>}
              <View style={styles.modalHeaderInfo}>
                <Text style={styles.modalTitle} numberOfLines={2}>{item.original_language === 'tr' && item.title_tr ? item.title_tr : item.title}</Text>
                {item.original_title && item.original_title !== item.title && item.original_language !== 'tr' && <Text style={styles.modalOriginalTitle}>{item.original_title}</Text>}
                <Text style={styles.modalMeta}>{typeLabel}{langLabel ? ' · ' + langLabel : ''}</Text>
                {item.year && <Text style={styles.modalMeta}>{item.year}</Text>}
                <View style={styles.modalImdbRow}>
                  <View style={styles.imdbBadge}><Text style={styles.imdbBadgeText}>IMDb</Text></View>
                  <Text style={styles.imdbScoreLarge}>{item.imdb_score ? item.imdb_score.toFixed(1) : 'N/A'}</Text>
                </View>
                {item.availability && item.availability.length > 0 && (
                  <View style={styles.modalPlatformRow}>
                    {item.availability.map(a => {
                      const p = PLATFORMS.find(x => x.slug === a.platform_slug);
                      if (!p) return null;
                      return (
                        <TouchableOpacity key={a.platform_slug} style={[styles.modalPlatformBtn, { backgroundColor: p.color }]} onPress={() => a.platform_url && Linking.openURL(a.platform_url)} disabled={!a.platform_url}>
                          <Image source={{ uri: p.darkLogo }} style={styles.modalPlatformLogo} resizeMode="contain" />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            </View>
            {item.tagline ? <Text style={styles.modalTagline}>"{item.tagline}"</Text> : null}
            {item.director ? <Text style={styles.modalDetail}>🎬 <Text style={styles.modalDetailLabel}>Yönetmen: </Text>{item.director}</Text> : null}
            {item.cast_list ? <Text style={styles.modalDetail}>👥 <Text style={styles.modalDetailLabel}>Oyuncular: </Text>{item.cast_list}</Text> : null}
            {item.synopsis_tr ? (<><Text style={styles.modalSynopsisTitle}>Konu</Text><Text style={styles.modalSynopsis}>{item.synopsis_tr}</Text></>) : null}
            <View style={styles.modalButtons}>
              {item.trailer_url && <TouchableOpacity style={styles.trailerBtn} onPress={() => window.open(item.trailer_url, '_blank')}><Text style={styles.trailerBtnText}>▶ Fragman</Text></TouchableOpacity>}
              {item.imdb_id && <TouchableOpacity style={styles.imdbLinkBtn} onPress={() => window.open('https://www.imdb.com/title/' + item.imdb_id + '/', '_blank')}><View style={styles.imdbBadge}><Text style={styles.imdbBadgeText}>IMDb</Text></View><Text style={styles.imdbLinkText}>↗ imdb.com</Text></TouchableOpacity>}
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}><Text style={styles.closeBtnText}>✕ Kapat</Text></TouchableOpacity>
            </View>
            {similarItems.length > 0 && (
              <View style={styles.similarSection}>
                <Text style={styles.similarTitle}>Benzer İçerikler</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 8 }}>
                  {similarItems.map(s => {
                    const p = PLATFORMS.find(x => x.slug === s.availability?.[0]?.platform_slug);
                    return (
                      <TouchableOpacity key={s.imdb_id} style={styles.similarCard} onPress={() => { onClose(); setTimeout(() => {}, 100); }}>
                        {s.poster_url ? <Image source={{ uri: s.poster_url }} style={styles.similarPoster} resizeMode="cover" /> : <View style={[styles.similarPoster, { backgroundColor: SURFACE }]} />}
                        <Text style={styles.similarCardTitle} numberOfLines={2}>{s.original_language === 'tr' && s.title_tr ? s.title_tr : s.title}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <View style={styles.imdbBadge}><Text style={styles.imdbBadgeText}>IMDb</Text></View>
                          <Text style={styles.similarScore}>{s.imdb_score?.toFixed(1)}</Text>
                          {p && <View style={[styles.similarPlatformDot, { backgroundColor: p.color }]} />}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
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


function CollectionsScreen({ selectedPlatforms }) {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);

  useEffect(() => { fetchCollections(); }, []);

  async function fetchCollections() {
    setLoading(true);
    const { data, error } = await supabase
      .from('hub_collections')
      .select('*, items:hub_collection_items(content_id, imdb_score, content:hub_contents(id, title, title_tr, original_language, poster_url, imdb_score, imdb_id, availability:hub_availability(platform_slug, platform_url)))')
      .order('avg_imdb_score', { ascending: false });
    if (error) { console.error(error); setLoading(false); return; }

    // Filter collections where at least one movie is in selected platforms
    const filtered = (data || []).filter(col =>
      col.items.some(item =>
        item.content?.availability?.some(a => selectedPlatforms.includes(a.platform_slug))
      )
    );
    setCollections(filtered);
    setLoading(false);
  }

  const allGenres = [...new Set(collections.flatMap(c => c.genres ? c.genres.split(', ') : []))].filter(Boolean).sort();

  const filteredCollections = selectedGenre
    ? collections.filter(c => c.genres && c.genres.includes(selectedGenre))
    : collections;

  const genreMap = Object.fromEntries(GENRES.map(g => [g.en, g.tr]));

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />

      {/* Genre filter */}
      <View style={styles.popularTopBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.popularTopBarRow}>
          <TouchableOpacity
            style={[styles.popularTopBtn, !selectedGenre && styles.popularTopBtnActive]}
            onPress={() => { setSelectedGenre(null); setShowGenreDropdown(false); }}
          >
            <Text style={[styles.popularTopBtnText, !selectedGenre && styles.popularTopBtnTextActive]}>Tümü</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.popularTopBtn, selectedGenre && styles.popularTopBtnGenreActive]}
            onPress={() => setShowGenreDropdown(!showGenreDropdown)}
          >
            <Text style={[styles.popularTopBtnText, selectedGenre && styles.popularTopBtnTextGenreActive]}>
              {selectedGenre ? (genreMap[selectedGenre] || selectedGenre) : 'Tür'} ▾
            </Text>
          </TouchableOpacity>
          {selectedGenre && (
            <TouchableOpacity style={styles.popularTopBtn} onPress={() => setSelectedGenre(null)}>
              <Text style={styles.popularTopBtnText}>✕</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {showGenreDropdown && (
        <View style={[styles.genreDropdown, { top: 52 }]}>
          <ScrollView style={{ maxHeight: 240 }} showsVerticalScrollIndicator={false}>
            {allGenres.map(g => (
              <TouchableOpacity
                key={g}
                style={[styles.genreDropdownItem, selectedGenre === g && styles.genreDropdownItemActive]}
                onPress={() => { setSelectedGenre(g); setShowGenreDropdown(false); }}
              >
                <Text style={[styles.genreDropdownText, selectedGenre === g && styles.genreDropdownTextActive]}>{genreMap[g] || g}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
        <View style={styles.popularHeader}>
          <Text style={styles.popularHeaderTitle}>🎬 Koleksiyonlar</Text>
          <Text style={styles.popularHeaderSub}>IMDB puanına göre sıralı</Text>
        </View>
        {loading ? (
          <ActivityIndicator size="large" color={ACCENT} style={{ marginTop: 60 }} />
        ) : (
          filteredCollections.map(col => {
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
                    <Text style={styles.collectionScore}>{col.avg_imdb_score?.toFixed(1)}</Text>
                    <Text style={styles.collectionCount}>{items.length} film</Text>
                  </View>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.popularRow}>
                  {items.map(item => {
                    const c = item.content;
                    if (!c) return null;
                    const platforms = c.availability?.filter(a => selectedPlatforms.includes(a.platform_slug)) || [];
                    return (
                      <TouchableOpacity key={c.id} style={styles.popularCard} onPress={() => setSelectedItem({ ...c, availability: platforms })}>
                        {c.poster_url
                          ? <Image source={{ uri: c.poster_url }} style={styles.popularCardImg} resizeMode="cover" />
                          : <View style={[styles.popularCardImg, { backgroundColor: SURFACE }]} />}
                        <Text style={styles.popularCardTitle} numberOfLines={2}>{c.original_language === 'tr' && c.title_tr ? c.title_tr : c.title}</Text>
                        {c.imdb_score && <View style={styles.popularImdb}><View style={styles.imdbBadge}><Text style={styles.imdbBadgeText}>IMDb</Text></View><Text style={styles.popularScore}>{c.imdb_score.toFixed(1)}</Text></View>}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

function PopularScreen({ selectedPlatforms }) {
  const [popular, setPopular] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'movie', 'series'
  const [genreFilter, setGenreFilter] = useState(null);
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);

  useEffect(() => { fetchPopular(); }, [selectedPlatforms]);

  async function fetchPopular() {
    setLoading(true);
    const platforms = selectedPlatforms.length > 0 ? selectedPlatforms : PLATFORMS.map(p => p.slug);
    const { data, error } = await supabase
      .from('hub_popular')
      .select('*')
      .in('platform', platforms)
      .order('rating', { ascending: false });
    if (error) { console.error(error); setLoading(false); return; }
    const grouped = {};
    (data || []).forEach(item => {
      if (!grouped[item.platform]) grouped[item.platform] = [];
      grouped[item.platform].push(item);
    });
    setPopular(grouped);
    setLoading(false);
  }

  function filterItems(items) {
    let result = items;
    if (typeFilter === 'movie') result = result.filter(i => i.show_type === 'movie');
    if (typeFilter === 'series') result = result.filter(i => i.show_type === 'series');
    if (genreFilter) result = result.filter(i => i.genres && i.genres.includes(genreFilter));
    return result;
  }

  const selectedGenreLabel = POPULAR_GENRES.find(g => g.en === genreFilter)?.tr || 'Kategoriler';

  async function openPopularItem(item) {
    // Base normalized item
    const base = {
      ...item,
      poster_url: item.poster_w480 || item.poster_w240,
      imdb_score: item.rating ? item.rating / 10 : null,
      availability: item.streaming_link ? [{ platform_slug: item.platform, platform_url: item.streaming_link }] : [],
    };
    setSelectedItem(base);

    // Enrich from hub_contents if imdb_id exists
    if (item.imdb_id) {
      const { data } = await supabase
        .from('hub_contents')
        .select('synopsis_tr, director, cast_list, trailer_url, tagline, poster_url')
        .eq('imdb_id', item.imdb_id)
        .limit(1)
        .single();
      if (data) {
        setSelectedItem({
          ...base,
          synopsis_tr: data.synopsis_tr,
          director: data.director,
          cast_list: data.cast_list,
          trailer_url: data.trailer_url,
          tagline: data.tagline,
          poster_url: data.poster_url || base.poster_url,
        });
      }
    }
  }

  function renderPopularCard(item) {
    const p = PLATFORMS.find(x => x.slug === item.platform);
    return (
      <TouchableOpacity key={item.id} style={styles.popularCard} onPress={() => openPopularItem(item)}>
        {item.poster_w240
          ? <Image source={{ uri: item.poster_w240 }} style={styles.popularPoster} />
          : <View style={[styles.popularPoster, { backgroundColor: SURFACE, alignItems: 'center', justifyContent: 'center' }]}><Text style={{ color: '#ffffff22', fontSize: 20 }}>?</Text></View>
        }
        <Text style={styles.popularTitle} numberOfLines={2}>{item.title}</Text>
        {item.rating && <View style={styles.popularImdb}><View style={styles.imdbBadge}><Text style={styles.imdbBadgeText}>IMDb</Text></View><Text style={styles.popularScore}>{(item.rating / 10).toFixed(1)}</Text></View>}
      </TouchableOpacity>
    );
  }

  const platformOrder = PLATFORMS.filter(p => selectedPlatforms.includes(p.slug));

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />

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
        <View style={styles.popularHeader}>
          <Text style={styles.popularHeaderTitle}>🔥 Globalde En Popüler</Text>
          <Text style={styles.popularHeaderSub}>Türkiye kataloğunda izlenebilir</Text>
        </View>
        {loading ? (
          <ActivityIndicator size="large" color={ACCENT} style={{ marginTop: 60 }} />
        ) : (
          platformOrder.map(p => {
            const allItems = popular[p.slug] || [];
            const items = filterItems(allItems);
            if (!items || items.length === 0) return null;
            return (
              <View key={p.slug} style={styles.popularSection}>
                <View style={[styles.popularPlatformLabel, { backgroundColor: p.color + '22', borderColor: p.color + '44' }]}>
                  <Image source={{ uri: p.darkLogo }} style={styles.popularPlatformLogo} resizeMode="contain" />
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

export default function App() {
  const [activeTab, setActiveTab] = useState('discover');
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [sortBy, setSortBy] = useState('imdb_score');
  const [sortAsc, setSortAsc] = useState(false);
  const [minImdb, setMinImdb] = useState(0);
  const [minYear, setMinYear] = useState(1950);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState(getSelectedPlatforms);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const flatListRef = React.useRef(null);
  const isLoadingMoreRef = React.useRef(false);
  const currentPageRef = React.useRef(0);
  const PAGE_SIZE = 30;

  useEffect(() => { fetchContents(); }, [activeSearch, selectedType, selectedGenre, selectedLanguage, sortBy, sortAsc, minImdb, minYear, selectedPlatforms]);

  async function fetchContents(loadMore = false) {
    if (selectedPlatforms.length === 0) { setContents([]); setLoading(false); return; }
    if (loadMore) {
      if (isLoadingMoreRef.current) return;
      isLoadingMoreRef.current = true;
      setLoadingMore(true);
    } else {
      setLoading(true);
      setPage(0);
      currentPageRef.current = 0;
    }
    const currentPage = loadMore ? currentPageRef.current + 1 : 0;
    const from = currentPage * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const platformFilter = selectedPlatforms.map(p => `platform_slug.eq.${p}`).join(',');
    const availabilitySelect = `*, availability:hub_availability!inner(platform_slug, platform_url)`;

    let query = supabase.from('hub_contents')
      .select(availabilitySelect)
      .not('imdb_score', 'is', null)
      .not('imdb_id', 'is', null)
      .or(platformFilter, { referencedTable: 'hub_availability' })
      .order(sortBy, { ascending: sortAsc })
      .range(from, to);

    if (activeSearch.length > 0) {
      query = supabase.from('hub_contents')
        .select(availabilitySelect)
        .not('imdb_score', 'is', null)
        .not('imdb_id', 'is', null)
        .or(platformFilter, { referencedTable: 'hub_availability' })
        .or('title.ilike.%' + activeSearch + '%,original_title.ilike.%' + activeSearch + '%,cast_list.ilike.%' + activeSearch + '%,director.ilike.%' + activeSearch + '%')
        .order(sortBy, { ascending: sortAsc })
        .limit(500);
    }
    if (selectedType !== 'all') query = query.eq('type', selectedType);
    if (selectedGenre) query = query.ilike('genre', '%' + selectedGenre + '%');
    if (selectedLanguage) query = query.eq('original_language', selectedLanguage);
    if (minImdb > 0) query = query.gte('imdb_score', minImdb);
    if (minYear > 1950) query = query.gte('year', minYear);

    const { data, error } = await query;
    if (error) { console.error(error); setLoading(false); setLoadingMore(false); return; }
    const enriched = (data || []).map(item => ({ ...item, availability: item.availability.filter(a => selectedPlatforms.includes(a.platform_slug)) }));

    if (loadMore) {
      setContents(prev => {
        const existingIds = new Set(prev.map(i => i.id));
        const unique = enriched.filter(i => !existingIds.has(i.id));
        return [...prev, ...unique];
      });
      setPage(currentPage);
      currentPageRef.current = currentPage;
    } else {
      setContents(enriched);
    }
    setHasMore(enriched.length >= PAGE_SIZE);
    setLoading(false);
    setLoadingMore(false);
    isLoadingMoreRef.current = false;
  }

  function handlePlatformSave(slugs) { setSelectedPlatforms(slugs); saveSelectedPlatforms(slugs); }
  function handleSearch() { setActiveSearch(searchInput); setShowFilters(false); }
  function clearSearch() { setSearchInput(''); setActiveSearch(''); }
  function toggleSort(field) { if (sortBy === field) setSortAsc(!sortAsc); else { setSortBy(field); setSortAsc(false); } }
  function getSortIcon(field) { if (sortBy !== field) return ''; return sortAsc ? ' ↑' : ' ↓'; }
  function formatRuntime(minutes) {
    if (!minutes) return null;
    const h = Math.floor(minutes / 60), m = minutes % 60;
    if (h > 0 && m > 0) return h + 's ' + m + 'dk';
    if (h > 0) return h + 's';
    return m + 'dk';
  }

  const hasActiveFilters = minImdb > 0 || minYear > 1950 || selectedLanguage || selectedGenre || selectedType !== 'all';

  function renderItem({ item }) {
    const typeLabel = item.type === 'movie' ? '🎬 Film' : '📺 Dizi';
    const langLabel = item.original_language ? LANGUAGE_MAP[item.original_language] : null;
    const genreMap = Object.fromEntries(GENRES.map(g => [g.en, g.tr]));
    const genres = item.genre ? item.genre.split(',').slice(0, 2).map(g => genreMap[g.trim()] || g.trim()).join(', ') : '';
    const runtime = formatRuntime(item.runtime);
    const hasDetails = item.synopsis_tr || item.director || item.cast_list || item.tagline;
    return (
      <View style={styles.card}>
        {item.poster_url ? <Image source={{ uri: item.poster_url }} style={styles.poster} /> : <View style={styles.posterPlaceholder}><Text style={styles.posterPlaceholderText}>?</Text></View>}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>{item.original_language === 'tr' && item.title_tr ? item.title_tr : item.title}</Text>
          {item.original_title && item.original_title !== item.title && item.original_language !== 'tr' && <Text style={styles.originalTitle} numberOfLines={1}>{item.original_title}</Text>}
          <View style={styles.row}>
            <Text style={styles.typeText}>{typeLabel}</Text>
            {genres ? <Text style={styles.dot}> · </Text> : null}
            {genres ? <Text style={styles.genreText}>{genres}</Text> : null}
          </View>
          <View style={styles.row}>
            {langLabel ? <Text style={styles.metaText}>{langLabel}</Text> : null}
            {langLabel && item.year ? <Text style={styles.dot}> · </Text> : null}
            {item.year ? <Text style={styles.metaText}>{item.year}</Text> : null}
            {runtime ? <Text style={styles.dot}> · </Text> : null}
            {runtime ? <Text style={styles.metaText}>{runtime}</Text> : null}
          </View>
          {item.availability && item.availability.length > 0 && (
            <View style={styles.platformRow}>
              {item.availability.map(a => {
                const p = PLATFORMS.find(x => x.slug === a.platform_slug);
                if (!p) return null;
                return (
                  <TouchableOpacity key={a.platform_slug} style={[styles.platformPill, { backgroundColor: p.color }]} onPress={() => a.platform_url && Linking.openURL(a.platform_url)} disabled={!a.platform_url}>
                    <Image source={{ uri: p.darkLogo }} style={styles.platformPillLogo} resizeMode="contain" />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
          <View style={styles.bottomRow}>
            <TouchableOpacity style={styles.imdbBtn} onPress={() => item.imdb_id && window.open('https://www.imdb.com/title/' + item.imdb_id + '/', '_blank')}>
              <View style={styles.imdbBadge}><Text style={styles.imdbBadgeText}>IMDb</Text></View>
              <Text style={styles.imdbScore}>{item.imdb_score ? item.imdb_score.toFixed(1) : 'N/A'}</Text>
              <Text style={styles.imdbArrow}>↗</Text>
            </TouchableOpacity>
            {item.trailer_url && <TouchableOpacity style={styles.trailerBtn} onPress={() => window.open(item.trailer_url, '_blank')}><Text style={styles.trailerBtnText}>▶ Fragman</Text></TouchableOpacity>}
            {hasDetails && <TouchableOpacity style={styles.detailBtn} onPress={() => setSelectedItem(item)}><Text style={styles.detailBtnText}>Detaylar</Text></TouchableOpacity>}
          </View>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" />
      <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      <PlatformModal visible={showPlatformModal} selected={selectedPlatforms} onSave={handlePlatformSave} onClose={() => setShowPlatformModal(false)} />

      {activeTab === 'popular' ? (
        <>
          <PopularScreen selectedPlatforms={selectedPlatforms} />
          <View style={styles.tabBar}>
            <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('discover')}>
              <Compass size={22} color="#ffffff44" strokeWidth={1.8} />
              <Text style={styles.tabLabel}>Keşfet</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tabItem, styles.tabItemActive]} onPress={() => setActiveTab('popular')}>
              <TrendingUp size={22} color="#00A8E1" strokeWidth={1.8} />
              <Text style={[styles.tabLabel, styles.tabLabelActive]}>Popüler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('collections')}>
              <Film size={22} color="#ffffff44" strokeWidth={1.8} />
              <Text style={styles.tabLabel}>Koleksiyon</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : activeTab === 'collections' ? (
        <>
          <CollectionsScreen selectedPlatforms={selectedPlatforms} />
          <View style={styles.tabBar}>
            <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('discover')}>
              <Compass size={22} color="#ffffff44" strokeWidth={1.8} />
              <Text style={styles.tabLabel}>Keşfet</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('popular')}>
              <TrendingUp size={22} color="#ffffff44" strokeWidth={1.8} />
              <Text style={styles.tabLabel}>Popüler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tabItem, styles.tabItemActive]} onPress={() => setActiveTab('collections')}>
              <Film size={22} color="#00A8E1" strokeWidth={1.8} />
              <Text style={[styles.tabLabel, styles.tabLabelActive]}>Koleksiyon</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={{ flex: 1 }}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          {/* Sol: SVG İkon */}
          <View style={styles.appIcon}>
            <View style={styles.appIconPlay}>
              <View style={styles.appIconTriangle} />
            </View>
            <View style={styles.appIconQ}>
              <Text style={styles.appIconQText}>?</Text>
            </View>
          </View>

          {/* Sağ: başlık + platform butonu + subtitle + carousel */}
          <View style={styles.headerRight}>
            <Text style={styles.appTitle}>Ne İzlesek?</Text>
            <View style={styles.headerTagRow}>
              <Text style={styles.headerSubtitle}>Film & Dizi Puanları</Text>
              <View style={styles.imdbBadgeHeader}><Text style={styles.imdbBadgeHeaderText}>IMDb</Text></View>
            </View>
            <CarouselComments />
          </View>
        </View>

        {/* Platform Seç butonu */}
        <TouchableOpacity style={styles.platformSelectBtn} onPress={() => setShowPlatformModal(true)}>
          <View style={styles.platformSelectDots}>
            {selectedPlatforms.slice(0, 4).map(slug => {
              const p = PLATFORMS.find(x => x.slug === slug);
              return p ? <View key={slug} style={[styles.platformSelectDot, { backgroundColor: p.color }]} /> : null;
            })}
          </View>
          <Text style={styles.platformSelectText}>Platform Seç</Text>
          <Text style={styles.platformSelectCount}>{selectedPlatforms.length} seçili</Text>
        </TouchableOpacity>
      </View>

      {/* Arama */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Film, dizi, oyuncu veya yönetmen ara..."
          placeholderTextColor="#3a3a4a"
          value={searchInput}
          onChangeText={setSearchInput}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {searchInput.length > 0 && <TouchableOpacity style={styles.clearBtn} onPress={clearSearch}><Text style={styles.clearBtnText}>✕</Text></TouchableOpacity>}
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}><Text style={styles.searchBtnText}>Ara</Text></TouchableOpacity>
      </View>

      {/* Filtreler toggle */}
      <View style={styles.filterBar}>
        <TouchableOpacity style={[styles.filterToggle, showFilters && styles.filterToggleActive]} onPress={() => setShowFilters(!showFilters)}>
          <Text style={[styles.filterToggleText, showFilters && styles.filterToggleTextActive]}>
            {showFilters ? '▲ Gizle' : '▼ Filtreler & Sıralama'}
            {hasActiveFilters && !showFilters ? ' ●' : ''}
          </Text>
        </TouchableOpacity>
        {hasActiveFilters && (
          <TouchableOpacity style={styles.resetBtnInline} onPress={() => { setMinImdb(0); setMinYear(1950); setSelectedLanguage(null); setSelectedGenre(null); setSelectedType('all'); }}>
            <Text style={styles.resetBtnInlineText}>Sıfırla</Text>
          </TouchableOpacity>
        )}
      </View>

      {showFilters && (
        <View style={styles.filtersBox}>

          {/* Tür */}
          <Text style={styles.filterSectionTitle}>İçerik Türü</Text>
          <View style={styles.typeRow}>
            {[['all', 'Tümü'], ['movie', 'Filmler'], ['series', 'Diziler']].map(([val, label]) => (
              <TouchableOpacity key={val} style={[styles.typeBtn, selectedType === val && styles.typeBtnActive]} onPress={() => setSelectedType(val)}>
                <Text style={[styles.typeBtnText, selectedType === val && styles.typeBtnTextActive]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Sıralama */}
          <Text style={styles.filterSectionTitle}>Sıralama</Text>
          <View style={styles.sortRow}>
            {[['imdb_score', 'IMDb Puanı'], ['year', 'Yıl']].map(([val, label]) => (
              <TouchableOpacity key={val} style={[styles.sortBtn, sortBy === val && styles.sortBtnActive]} onPress={() => toggleSort(val)}>
                <Text style={[styles.sortBtnText, sortBy === val && styles.sortBtnTextActive]}>{label}{getSortIcon(val)}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={[styles.sortBtn, styles.sortDirBtn]} onPress={() => setSortAsc(!sortAsc)}>
              <Text style={styles.sortBtnText}>{sortAsc ? '↑ Artan' : '↓ Azalan'}</Text>
            </TouchableOpacity>
          </View>

          {/* IMDb */}
          <Text style={styles.filterLabel}>IMDb Puanı: <Text style={styles.filterValue}>{minImdb > 0 ? minImdb + '+' : 'Tümü'}</Text></Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            {IMDB_VALUES.map(val => (
              <TouchableOpacity key={val} style={[styles.sliderBtn, minImdb === val && styles.sliderBtnActive]} onPress={() => setMinImdb(val)}>
                <Text style={[styles.sliderBtnText, minImdb === val && styles.sliderBtnTextActive]}>{val === 0 ? 'Tümü' : val + '+'}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Yıl */}
          <Text style={styles.filterLabel}>Yıl: <Text style={styles.filterValue}>{minYear > 1950 ? minYear + '+' : 'Tümü'}</Text></Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            {YEAR_VALUES.map(val => (
              <TouchableOpacity key={val} style={[styles.sliderBtn, minYear === val && styles.sliderBtnActive]} onPress={() => setMinYear(val)}>
                <Text style={[styles.sliderBtnText, minYear === val && styles.sliderBtnTextActive]}>{val === 1950 ? 'Tümü' : val + '+'}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Dil */}
          <Text style={styles.filterLabel}>Dil: <Text style={styles.filterValue}>{selectedLanguage ? LANGUAGES.find(l => l.code === selectedLanguage)?.label : 'Tümü'}</Text></Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            <TouchableOpacity style={[styles.sliderBtn, selectedLanguage === null && styles.sliderBtnActive]} onPress={() => setSelectedLanguage(null)}>
              <Text style={[styles.sliderBtnText, selectedLanguage === null && styles.sliderBtnTextActive]}>Tümü</Text>
            </TouchableOpacity>
            {LANGUAGES.map(lang => (
              <TouchableOpacity key={lang.code} style={[styles.sliderBtn, selectedLanguage === lang.code && styles.sliderBtnActive]} onPress={() => setSelectedLanguage(lang.code)}>
                <Text style={[styles.sliderBtnText, selectedLanguage === lang.code && styles.sliderBtnTextActive]}>{lang.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Tür (genre) */}
          <Text style={styles.filterLabel}>Tür: <Text style={styles.filterValue}>{selectedGenre ? (GENRES.find(g => g.en === selectedGenre)?.tr || selectedGenre) : 'Tümü'}</Text></Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
            <TouchableOpacity style={[styles.sliderBtn, selectedGenre === null && styles.sliderBtnActive]} onPress={() => setSelectedGenre(null)}>
              <Text style={[styles.sliderBtnText, selectedGenre === null && styles.sliderBtnTextActive]}>Tümü</Text>
            </TouchableOpacity>
            {GENRES.map(g => (
              <TouchableOpacity key={g.en} style={[styles.sliderBtn, selectedGenre === g.en && styles.sliderBtnActive]} onPress={() => setSelectedGenre(selectedGenre === g.en ? null : g.en)}>
                <Text style={[styles.sliderBtnText, selectedGenre === g.en && styles.sliderBtnTextActive]}>{g.tr}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#00A8E1" />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <FlatList
            ref={flatListRef}
            data={contents}
            keyExtractor={item => item.id ? item.id.toString() : item.imdb_id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            onEndReached={() => { if (hasMore && !loadingMore && !loading) fetchContents(true); }}
            onEndReachedThreshold={0.3}
            onScroll={e => setShowScrollTop(e.nativeEvent.contentOffset.y > 400)}
            scrollEventThrottle={16}
            ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color="#00A8E1" style={{ marginVertical: 16 }} /> : null}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>🎬</Text>
                <Text style={styles.emptyText}>İçerik bulunamadı</Text>
                <Text style={styles.emptySubText}>Seçili platformlarda bu kriterlere uygun içerik yok</Text>
              </View>
            }
          />
          {showScrollTop && (
            <TouchableOpacity style={styles.scrollTopBtn} onPress={() => flatListRef.current?.scrollToOffset({ offset: 0, animated: true })}>
              <Text style={styles.scrollTopIcon}>↑</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
          <View style={styles.tabBar}>
            <TouchableOpacity style={[styles.tabItem, styles.tabItemActive]} onPress={() => setActiveTab('discover')}>
              <Compass size={22} color="#00A8E1" strokeWidth={1.8} />
              <Text style={[styles.tabLabel, styles.tabLabelActive]}>Keşfet</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('popular')}>
              <TrendingUp size={22} color="#ffffff44" strokeWidth={1.8} />
              <Text style={styles.tabLabel}>Popüler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('collections')}>
              <Film size={22} color="#ffffff44" strokeWidth={1.8} />
              <Text style={styles.tabLabel}>Koleksiyon</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: BORDER },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12 },
  appIcon: { width: 90, height: 90, borderRadius: 22, backgroundColor: '#E50914', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  appIconPlay: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center', position: 'absolute', top: 10, left: 13 },
  appIconTriangle: { width: 0, height: 0, borderTopWidth: 9, borderBottomWidth: 9, borderLeftWidth: 15, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: '#fff', marginLeft: 3 },
  appIconQ: { position: 'absolute', bottom: 6, right: 10 },
  appIconQText: { color: '#fff', fontSize: 40, fontWeight: '900', lineHeight: 44 },
  headerRight: { flex: 1, gap: 6 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  appTitle: { color: '#fff', fontSize: 26, fontWeight: 'bold', letterSpacing: -0.5 },
  headerTagRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerSubtitle: { color: '#ffffffaa', fontSize: 13, fontWeight: '500' },
  imdbBadgeHeader: { backgroundColor: '#F5C518', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  imdbBadgeHeaderText: { color: '#000', fontSize: 10, fontWeight: 'bold' },
  platformBtn: { backgroundColor: SURFACE, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: BORDER, flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-end' },
  platformBtnLogos: { flexDirection: 'row', gap: 4 },
  platformBtnDot: { width: 7, height: 7, borderRadius: 4 },
  platformBtnText: { color: '#ffffff66', fontSize: 11 },
  commentBubble: { backgroundColor: '#00A8E122', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderColor: '#00A8E144', alignSelf: 'flex-start' },
  commentText: { color: '#00A8E1cc', fontSize: 13, fontStyle: 'italic', fontWeight: '500' },
  platformLogoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  platformLogoCard: { flex: 1, minWidth: '45%', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, justifyContent: 'center', alignItems: 'center' },
  platformLogoImg: { width: 80, height: 22 },
  platformLogoOff: { fontSize: 10, fontWeight: '700', marginTop: 4 },
  platformSelectBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: SURFACE, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: BORDER, marginTop: 4 },
  platformSelectDots: { flexDirection: 'row', gap: 5 },
  platformSelectDot: { width: 10, height: 10, borderRadius: 5 },
  platformSelectText: { color: '#fff', fontSize: 16, fontWeight: '700', flex: 1 },
  platformSelectCount: { color: '#ffffff55', fontSize: 13 },
  searchRow: { flexDirection: 'row', paddingHorizontal: 16, marginVertical: 10, gap: 8, alignItems: 'center', flexShrink: 0 },
  searchInput: { flex: 1, minWidth: 0, backgroundColor: SURFACE, color: '#fff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 16, borderWidth: 1, borderColor: BORDER },
  clearBtn: { backgroundColor: SURFACE, width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: BORDER, flexShrink: 0 },
  clearBtnText: { color: '#ffffff44', fontSize: 14 },
  searchBtn: { backgroundColor: ACCENT, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, flexShrink: 0 },
  searchBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  filterBar: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8, alignItems: 'center', gap: 8 },
  filterToggle: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: SURFACE, alignItems: 'center', borderWidth: 1, borderColor: BORDER },
  filterToggleActive: { borderColor: ACCENT },
  filterToggleText: { color: '#ffffff55', fontSize: 13, fontWeight: '600' },
  filterToggleTextActive: { color: ACCENT },
  resetBtnInline: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#E5091466' },
  resetBtnInlineText: { color: '#E50914', fontSize: 13 },
  filtersBox: { marginHorizontal: 16, marginBottom: 10, backgroundColor: SURFACE, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: BORDER },
  filterSectionTitle: { color: '#ffffff88', fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, marginTop: 4 },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  typeBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: BG, alignItems: 'center', borderWidth: 1, borderColor: BORDER },
  typeBtnActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  typeBtnText: { color: '#ffffff44', fontSize: 13, fontWeight: '600' },
  typeBtnTextActive: { color: '#fff' },
  sortRow: { flexDirection: 'row', gap: 8, marginBottom: 14, flexWrap: 'wrap' },
  sortBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: BG, borderWidth: 1, borderColor: BORDER },
  sortBtnActive: { borderColor: ACCENT, backgroundColor: ACCENT + '22' },
  sortDirBtn: { marginLeft: 'auto' },
  sortBtnText: { color: '#ffffff55', fontSize: 13 },
  sortBtnTextActive: { color: ACCENT, fontWeight: '600' },
  filterLabel: { color: '#ffffff55', fontSize: 12, marginBottom: 6 },
  filterValue: { color: ACCENT, fontWeight: '600' },
  sliderBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, backgroundColor: BG, marginRight: 6, borderWidth: 1, borderColor: BORDER },
  sliderBtnActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  sliderBtnText: { color: '#ffffff44', fontSize: 12 },
  sliderBtnTextActive: { color: '#fff', fontWeight: '600' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  card: { flexDirection: 'row', backgroundColor: CARD, borderRadius: 14, marginBottom: 12, overflow: 'hidden', borderWidth: 1, borderColor: BORDER },
  poster: { width: 85, height: 125 },
  posterPlaceholder: { width: 85, height: 125, backgroundColor: SURFACE, alignItems: 'center', justifyContent: 'center' },
  posterPlaceholderText: { color: '#ffffff22', fontSize: 24 },
  info: { flex: 1, padding: 12 },
  row: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 2, flexWrap: 'wrap' },
  title: { color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 2 },
  originalTitle: { color: '#ffffff33', fontSize: 11, fontStyle: 'italic', marginBottom: 3 },
  typeText: { color: '#ffffff55', fontSize: 11 },
  dot: { color: '#ffffff22', fontSize: 11 },
  genreText: { color: '#ffffff44', fontSize: 11 },
  metaText: { color: '#ffffff44', fontSize: 11 },
  platformRow: { flexDirection: 'row', gap: 6, marginVertical: 6 },
  platformPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  platformPillLogo: { width: 40, height: 14 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2, flexWrap: 'wrap' },
  imdbBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: SURFACE, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: BORDER },
  imdbBadge: { backgroundColor: '#F5C518', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 3 },
  imdbBadgeText: { color: '#000', fontSize: 9, fontWeight: 'bold' },
  imdbScore: { color: '#F5C518', fontSize: 14, fontWeight: 'bold' },
  imdbArrow: { color: '#ffffff33', fontSize: 10 },
  trailerBtn: { backgroundColor: '#E5091422', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#E5091444' },
  trailerBtnText: { color: '#E50914', fontSize: 11, fontWeight: '600' },
  detailBtn: { backgroundColor: SURFACE, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: BORDER },
  detailBtnText: { color: '#ffffff55', fontSize: 11 },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  emptySubText: { color: '#ffffff33', fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'flex-end' },
  platformModalContainer: { backgroundColor: CARD, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, borderWidth: 1, borderColor: BORDER },
  platformModalHandle: { width: 40, height: 4, backgroundColor: '#ffffff22', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  platformModalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  platformModalSubtitle: { color: '#ffffff44', fontSize: 13, marginBottom: 20 },
  platformGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  platformCard: { width: '47%', backgroundColor: SURFACE, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: BORDER, position: 'relative' },
  platformCardBg: { borderRadius: 10, padding: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  platformCardLogo: { width: '100%', height: 28 },
  platformCardCheck: { position: 'absolute', top: 10, right: 10, width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  platformCardCheckText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  platformCardName: { color: '#ffffff66', fontSize: 12, textAlign: 'center' },
  platformSaveBtn: { backgroundColor: ACCENT, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  platformSaveBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  detailModalContainer: { backgroundColor: CARD, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, borderWidth: 1, borderColor: BORDER },
  modalHeader: { flexDirection: 'row', gap: 14, marginBottom: 14 },
  modalPoster: { width: 90, height: 132, borderRadius: 10 },
  modalPosterPlaceholder: { width: 90, height: 132, backgroundColor: SURFACE, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  modalHeaderInfo: { flex: 1, justifyContent: 'center' },
  modalTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  modalOriginalTitle: { color: '#ffffff44', fontSize: 11, fontStyle: 'italic', marginBottom: 4 },
  modalMeta: { color: '#ffffff55', fontSize: 12, marginBottom: 2 },
  modalImdbRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  imdbScoreLarge: { color: '#F5C518', fontSize: 18, fontWeight: 'bold' },
  modalPlatformRow: { flexDirection: 'row', gap: 6, marginTop: 8 },
  modalPlatformBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  modalPlatformLogo: { width: 50, height: 16 },
  modalTagline: { color: '#ffffff44', fontSize: 12, fontStyle: 'italic', marginBottom: 12, borderLeftWidth: 2, borderLeftColor: ACCENT, paddingLeft: 10 },
  modalDetail: { color: '#ffffff66', fontSize: 12, marginBottom: 6 },
  modalDetailLabel: { fontWeight: 'bold', color: '#ffffff88' },
  modalSynopsisTitle: { color: ACCENT, fontSize: 13, fontWeight: 'bold', marginTop: 10, marginBottom: 6 },
  modalSynopsis: { color: '#ffffff88', fontSize: 13, lineHeight: 20, marginBottom: 16 },
  modalButtons: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  imdbLinkBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: SURFACE, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: BORDER },
  imdbLinkText: { color: '#ffffff55', fontSize: 12 },
  closeBtn: { backgroundColor: SURFACE, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: BORDER },
  tabBar: { flexDirection: 'row', backgroundColor: CARD, borderTopWidth: 1, borderTopColor: BORDER, paddingBottom: 4 },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 10, gap: 2 },
  tabItemActive: { borderTopWidth: 2, borderTopColor: ACCENT },
  tabIcon: { fontSize: 20 },
  tabLabel: { color: '#ffffff44', fontSize: 11 },
  tabLabelActive: { color: ACCENT, fontWeight: '600' },
  popularTopBar: { borderBottomWidth: 1, borderBottomColor: BORDER, backgroundColor: BG },
  popularTopBarRow: { paddingHorizontal: 16, paddingVertical: 10, gap: 8, flexDirection: 'row' },
  popularTopBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: SURFACE, borderWidth: 1, borderColor: BORDER },
  popularTopBtnActive: { backgroundColor: '#fff', borderColor: '#fff' },
  popularTopBtnText: { color: '#ffffff88', fontSize: 14, fontWeight: '600' },
  popularTopBtnTextActive: { color: '#000' },
  popularTopBtnGenreActive: { backgroundColor: ACCENT + '33', borderColor: ACCENT },
  popularTopBtnTextGenreActive: { color: ACCENT },
  popularTopSeparator: { width: 1, backgroundColor: BORDER, marginHorizontal: 4 },
  genreDropdown: { backgroundColor: CARD, marginHorizontal: 16, borderRadius: 14, borderWidth: 1, borderColor: BORDER, marginTop: 4, position: 'absolute', top: 52, left: 0, right: 0, zIndex: 100, marginHorizontal: 16 },
  genreDropdownItem: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: BORDER },
  genreDropdownItemActive: { backgroundColor: SURFACE },
  genreDropdownText: { color: '#ffffffaa', fontSize: 14 },
  genreDropdownTextActive: { color: '#fff', fontWeight: '600' },
  popularHeader: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: BORDER },
  popularHeaderTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  popularHeaderSub: { color: '#ffffff99', fontSize: 12, marginTop: 2 },
  popularSection: { marginTop: 20 },
  popularPlatformLabel: { marginHorizontal: 16, marginBottom: 10, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, alignSelf: 'flex-start' },
  popularPlatformLogo: { width: 80, height: 22 },
  popularRow: { paddingHorizontal: 16, gap: 10 },
  popularCard: { width: 110, position: 'relative' },
  collectionHeader: { paddingHorizontal: 16, paddingBottom: 6, paddingTop: 4 },
  collectionName: { color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 4 },
  collectionMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  collectionScore: { color: '#fff', fontSize: 13, fontWeight: '700' },
  collectionCount: { color: '#ffffff55', fontSize: 12 },
  popularRankBadge: { position: 'absolute', top: 6, left: 6, zIndex: 1, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2 },
  popularRank: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  popularFireBadge: { backgroundColor: '#1a1a2e', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, marginLeft: 6 },
  popularFireText: { color: '#ff6b35', fontSize: 11, fontWeight: '700' },
  popularPoster: { width: 110, height: 160, borderRadius: 10, marginBottom: 6 },
  popularTitle: { color: '#ffffffcc', fontSize: 11, fontWeight: '600', lineHeight: 15 },
  popularImdb: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  popularScore: { color: '#F5C518', fontSize: 12, fontWeight: 'bold' },
  closeBtnText: { color: '#ffffff55', fontSize: 13 },
  similarSection: { marginTop: 14, marginBottom: 4 },
  similarTitle: { color: '#ffffff99', fontSize: 12, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  similarCard: { width: 90 },
  similarPoster: { width: 90, height: 130, borderRadius: 8, marginBottom: 6 },
  similarCardTitle: { color: '#ffffffcc', fontSize: 11, marginBottom: 4, lineHeight: 14 },
  similarScore: { color: '#fff', fontSize: 11, fontWeight: '700' },
  similarPlatformDot: { width: 8, height: 8, borderRadius: 4 },
  scrollTopBtn: { position: 'absolute', right: 16, bottom: 80, width: 44, height: 44, borderRadius: 22, backgroundColor: '#00A8E1', alignItems: 'center', justifyContent: 'center', elevation: 4 },
  scrollTopIcon: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
});
