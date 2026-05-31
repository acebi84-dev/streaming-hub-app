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
  const [itemStack, setItemStack] = React.useState([item]);
  const cur = itemStack[itemStack.length - 1];
  const typeLabel = cur.type === 'movie' ? '🎬 Film' : '📺 Dizi';
  const langLabel = cur.original_language ? LANGUAGE_MAP[cur.original_language] : null;
  const [similarItems, setSimilarItems] = React.useState([]);
  const [posterFullscreen, setPosterFullscreen] = React.useState(false);

  React.useEffect(() => {
    setSimilarItems([]);
    if (!cur.imdb_id) return;
    fetchSimilar(cur);
  }, [cur.imdb_id]);

  async function fetchSimilar(item) {
    try {
      // Get similar_tmdb_ids from DB
      const { data: contentData } = await supabase
        .from('hub_contents')
        .select('similar_tmdb_ids')
        .eq('imdb_id', cur.imdb_id)
        .single();

      const tmdbIds = contentData?.similar_tmdb_ids;
      if (!tmdbIds || tmdbIds.length === 0) return;

      // Find matching contents directly by tmdb_id — no TMDB API calls needed
      const { data } = await supabase
        .from('hub_contents')
        .select('id, title, title_tr, original_language, imdb_score, poster_url, imdb_id, availability:hub_availability(platform_slug, platform_url)')
        .in('tmdb_id', tmdbIds)
        .not('imdb_score', 'is', null);

      const filtered = (data || []).filter(i => i.availability && i.availability.length > 0).slice(0, 10);
      // Only show if we got at least 2 meaningful results
      if (filtered.length >= 2) setSimilarItems(filtered);
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
              <TouchableOpacity onPress={() => cur.poster_url && setPosterFullscreen(true)} activeOpacity={0.85}>
              {cur.poster_url ? <Image source={{ uri: cur.poster_url }} style={styles.modalPoster} /> : <View style={styles.modalPosterPlaceholder}><Text style={{ color: '#ffffff22', fontSize: 24 }}>?</Text></View>}
            </TouchableOpacity>
            <Modal visible={posterFullscreen} transparent animationType="fade" onRequestClose={() => setPosterFullscreen(false)}>
              <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', alignItems: 'center', justifyContent: 'center' }} onPress={() => setPosterFullscreen(false)} activeOpacity={1}>
                <Image source={{ uri: cur.poster_url }} style={{ width: '90%', height: '80%', borderRadius: 16 }} resizeMode="contain" />
              </TouchableOpacity>
            </Modal>
              <View style={styles.modalHeaderInfo}>
                <Text style={styles.modalTitle} numberOfLines={2}>{cur.original_language === 'tr' && cur.title_tr ? cur.title_tr : cur.title}</Text>
                {cur.original_title && cur.original_title !== cur.title && cur.original_language !== 'tr' && <Text style={styles.modalOriginalTitle}>{cur.original_title}</Text>}
                <Text style={styles.modalMeta}>{typeLabel}{langLabel ? ' · ' + langLabel : ''}</Text>
                {cur.year && <Text style={styles.modalMeta}>{cur.year}</Text>}
                <View style={styles.modalImdbRow}>
                  <View style={styles.imdbBadge}><Text style={styles.imdbBadgeText}>IMDb</Text></View>
                  <Text style={styles.imdbScoreLarge}>{cur.imdb_score ? cur.imdb_score.toFixed(1) : 'N/A'}</Text>
                </View>
                {cur.availability && cur.availability.length > 0 && (
                  <View style={styles.modalPlatformRow}>
                    {cur.availability.map(a => {
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
            {cur.tagline ? <Text style={styles.modalTagline}>"{cur.tagline}"</Text> : null}
            {cur.director ? <Text style={styles.modalDetail}>🎬 <Text style={styles.modalDetailLabel}>Yönetmen: </Text>{cur.director}</Text> : null}
            {cur.cast_list ? <Text style={styles.modalDetail}>👥 <Text style={styles.modalDetailLabel}>Oyuncular: </Text>{cur.cast_list}</Text> : null}
            {cur.synopsis_tr ? (<><Text style={styles.modalSynopsisTitle}>Konu</Text><Text style={styles.modalSynopsis}>{cur.synopsis_tr}</Text></>) : null}
            <View style={styles.modalButtons}>
              {cur.trailer_url && <TouchableOpacity style={styles.trailerBtn} onPress={() => window.open(cur.trailer_url, '_blank')}><Text style={styles.trailerBtnText}>▶ Fragman</Text></TouchableOpacity>}
              {cur.imdb_id && <TouchableOpacity style={styles.imdbLinkBtn} onPress={() => window.open('https://www.imdb.com/title/' + cur.imdb_id + '/', '_blank')}><View style={styles.imdbBadge}><Text style={styles.imdbBadgeText}>IMDb</Text></View><Text style={styles.imdbLinkText}>↗ imdb.com</Text></TouchableOpacity>}
              {itemStack.length > 1 && <TouchableOpacity style={styles.closeBtn} onPress={() => setItemStack(prev => prev.slice(0,-1))}><Text style={styles.closeBtnText}>← Geri</Text></TouchableOpacity>}
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}><Text style={styles.closeBtnText}>✕ Kapat</Text></TouchableOpacity>
            </View>
            {similarItems.length > 0 && (
              <View style={styles.similarSection}>
                <Text style={styles.similarTitle}>Benzer İçerikler</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 8 }}>
                  {similarItems.map(s => {
                    const p = PLATFORMS.find(x => x.slug === s.availability?.[0]?.platform_slug);
                    return (
                      <TouchableOpacity key={s.imdb_id} style={styles.similarCard} onPress={() => { setSimilarItems([]); setItemStack(prev => [...prev, s]); }}>
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
  const [sortBy, setCollectionSort] = useState('avg_votes');
  const [sortAscCol, setSortAscCol] = useState(false);
  const [minImdb, setColMinImdb] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [showColScrollTop, setColShowScrollTop] = useState(false);
  const colScrollRef = React.useRef(null);
  const [colSearchInput, setColSearchInput] = useState('');
  const [colActiveSearch, setColActiveSearch] = useState('');

  useEffect(() => { fetchCollections(); }, [sortBy, sortAscCol]);

  async function fetchCollections() {
    setLoading(true);
    const { data, error } = await supabase
      .from('hub_collections')
      .select('*, items:hub_collection_items(content_id, imdb_score, content:hub_contents(id, title, title_tr, original_language, poster_url, imdb_score, imdb_id, availability:hub_availability(platform_slug, platform_url)))')
      .order(sortBy, { ascending: sortAscCol, nullsFirst: false });
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

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Koleksiyonlar</Text>
      </View>
      <View style={[styles.searchContainer, { marginHorizontal: 16, marginVertical: 8 }]}>
        <TextInput maxFontSizeMultiplier={1} style={[styles.searchInput, { flex: 1 }]} placeholder="Koleksiyon ara..." placeholderTextColor="#ffffff44" value={colSearchInput} onChangeText={setColSearchInput} onSubmitEditing={() => setColActiveSearch(colSearchInput)} returnKeyType="search" />
        {colSearchInput.length > 0 && <TouchableOpacity style={styles.clearBtn} onPress={() => { setColSearchInput(''); setColActiveSearch(''); }}><Text style={styles.clearBtnText}>✕</Text></TouchableOpacity>}
        <TouchableOpacity style={styles.searchIconBtn} onPress={() => setColActiveSearch(colSearchInput)}>
          <Text style={styles.searchIconText}>⌕</Text>
        </TouchableOpacity>
      </View>
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
                      <TouchableOpacity key={c.id} style={styles.popularCard} onPress={() => setSelectedItem({ ...c, availability: platforms })}>
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

  const selectedGenreLabel = POPULAR_GENRES.find(g => g.en === genreFilter)?.tr || 'Tür';

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
        <View style={styles.cardPosterWrap}>
          {item.poster_w240
            ? <Image source={{ uri: item.poster_w240 }} style={styles.popularCardImg} resizeMode="cover" />
            : <View style={[styles.popularCardImg, { backgroundColor: SURFACE, alignItems: 'center', justifyContent: 'center' }]}><Text style={{ color: '#ffffff22', fontSize: 20 }}>?</Text></View>}
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
      <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />

      <View style={styles.popularHeader}>
        <Text style={styles.sectionTitle}>Globalde En Popüler</Text>
        <Text style={styles.popularHeaderSub}>Türkiye kataloğunda izlenebilir</Text>
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
        .or('title.ilike.%' + activeSearch + '%,original_title.ilike.%' + activeSearch + '%,title_tr.ilike.%' + activeSearch + '%,cast_list.ilike.%' + activeSearch + '%,director.ilike.%' + activeSearch + '%')
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
      <TouchableOpacity style={styles.card} onPress={() => setSelectedItem(item)} activeOpacity={0.85}>
        <View style={styles.cardPosterWrap}>
          {item.poster_url ? <Image source={{ uri: item.poster_url }} style={styles.poster} /> : <View style={styles.posterPlaceholder}><Text style={styles.posterPlaceholderText}>?</Text></View>}
          <View style={styles.cardImdbOverlay}>
            <View style={styles.imdbBadge}><Text style={styles.imdbBadgeText}>IMDb</Text></View>
            <Text style={styles.cardImdbScore}>{item.imdb_score ? item.imdb_score.toFixed(1) : '—'}</Text>
          </View>
        </View>
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>{item.original_language === 'tr' && item.title_tr ? item.title_tr : item.title}</Text>
          {item.original_title && item.original_title !== item.title && <Text style={styles.originalTitle} numberOfLines={1}>{item.original_title}</Text>}
          <Text style={styles.cardMeta} numberOfLines={1}>
            {[typeLabel, genres, item.year].filter(Boolean).join(' · ')}
          </Text>
          {item.availability && item.availability.length > 0 && (
            <View style={styles.platformRow}>
              {item.availability.map(a => {
                const p = PLATFORMS.find(x => x.slug === a.platform_slug);
                if (!p) return null;
                return (
                  <TouchableOpacity key={a.platform_slug} style={[styles.platformPill, { backgroundColor: p.color }]} onPress={(e) => { e.stopPropagation?.(); a.platform_url && Linking.openURL(a.platform_url); }} disabled={!a.platform_url}>
                    <Image source={{ uri: p.darkLogo }} style={styles.platformPillLogo} resizeMode="contain" />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
          <View style={styles.bottomRow}>
            {item.trailer_url && <TouchableOpacity style={styles.trailerBtn} onPress={(e) => { e.stopPropagation?.(); window.open(item.trailer_url, '_blank'); }}><Text style={styles.trailerBtnText}>▶ Fragman</Text></TouchableOpacity>}
            <TouchableOpacity style={styles.imdbBtn} onPress={(e) => { e.stopPropagation?.(); item.imdb_id && window.open('https://www.imdb.com/title/' + item.imdb_id + '/', '_blank'); }}>
              <Text style={styles.imdbArrow}>IMDb ↗</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
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
              <TrendingUp size={22} color="#ffffff" strokeWidth={1.8} />
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
              <Film size={22} color="#ffffff" strokeWidth={1.8} />
              <Text style={[styles.tabLabel, styles.tabLabelActive]}>Koleksiyon</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={{ flex: 1 }}>

      {/* Header - Apple TV minimal */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.appLogoRow}>
            <Image source={{ uri: 'data:image/png;base64,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' }} style={styles.appLogoIcon} resizeMode="contain" />
            <Text style={styles.appTitle}>İzlio</Text>
          </View>
          <TouchableOpacity style={styles.platformSelectBtn} onPress={() => setShowPlatformModal(true)}>
            <View style={styles.platformSelectDots}>
              {selectedPlatforms.slice(0, 4).map(slug => {
                const p = PLATFORMS.find(x => x.slug === slug);
                return p ? <View key={slug} style={[styles.platformSelectDot, { backgroundColor: p.color }]} /> : null;
              })}
            </View>
            <Text style={styles.platformSelectText}>Platformlar</Text>
            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Arama */}
      <View style={styles.searchRow}>
        <TextInput maxFontSizeMultiplier={1}
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
        <View style={[styles.filtersBox, { zIndex: 10 }]}>

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
          <ActivityIndicator size="large" color="#ffffff" />
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
            ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color="#ffffff" style={{ marginVertical: 16 }} /> : null}
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
              <Compass size={22} color="#ffffff" strokeWidth={1.8} />
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
  clearBtn: { backgroundColor: 'rgba(118,118,128,0.18)', width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
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
  sortBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(118,118,128,0.18)' },
  sortBtnActive: { backgroundColor: 'rgba(255,255,255,0.15)' },
  sortDirBtn: { marginLeft: 'auto' },
  sortBtnText: { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  sortBtnTextActive: { color: '#ffffff', fontWeight: '600' },
  filterLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 6 },
  filterValue: { color: '#ffffff', fontWeight: '600' },
  sliderBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: 'rgba(118,118,128,0.18)', marginRight: 6 },
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
  trailerBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.15)' },
  trailerBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  detailBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: 'rgba(118,118,128,0.2)' },
  detailBtnText: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  scrollTopBtn: { position: 'absolute', right: 16, bottom: 80, width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: {width:0,height:2}, shadowOpacity: 0.4, shadowRadius: 8 },
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
  modalPlatformBtn: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  modalPlatformLogo: { width: 48, height: 14 },
  modalTagline: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontStyle: 'italic', marginBottom: 12, paddingLeft: 12, borderLeftWidth: 2, borderLeftColor: 'rgba(255,255,255,0.3)' },
  modalDetail: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 6, lineHeight: 18 },
  modalDetailLabel: { color: 'rgba(255,255,255,0.45)', fontWeight: '600' },
  modalSynopsisTitle: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '700', marginTop: 8, marginBottom: 4, letterSpacing: 0.5 },
  modalSynopsis: { color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 20 },
  modalButtons: { flexDirection: 'row', gap: 8, marginTop: 14, flexWrap: 'wrap' },
  closeBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(118,118,128,0.2)' },
  closeBtnText: { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  imdbLinkBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(245,197,24,0.12)' },
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
  popularTopBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: 'rgba(118,118,128,0.18)' },
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
});