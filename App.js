import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity,
  Image, ActivityIndicator, SafeAreaView, StatusBar, ScrollView,
  Animated, Modal,
} from 'react-native';
import { supabase } from './supabase';

// ─── Platform tanımları ───────────────────────────────────────────────────────
const PLATFORMS = [
  {
    slug: 'netflix',
    name: 'Netflix',
    color: '#E50914',
    lightLogo: 'https://media.movieofthenight.com/services/netflix/logo-light-theme.svg',
    darkLogo: 'https://media.movieofthenight.com/services/netflix/logo-white.svg',
    short: 'N',
  },
  {
    slug: 'amazon',
    name: 'Prime Video',
    color: '#00A8E1',
    lightLogo: 'https://media.movieofthenight.com/services/prime/logo-light-theme.svg',
    darkLogo: 'https://media.movieofthenight.com/services/prime/logo-white.svg',
    short: 'P',
  },
  {
    slug: 'disney',
    name: 'Disney+',
    color: '#0063E5',
    lightLogo: 'https://media.movieofthenight.com/services/disney/logo-light-theme.svg',
    darkLogo: 'https://media.movieofthenight.com/services/disney/logo-white.svg',
    short: 'D',
  },
  {
    slug: 'hbo',
    name: 'HBO Max',
    color: '#8B4FBE',
    lightLogo: 'https://media.movieofthenight.com/services/hbo/logo-light-theme.svg',
    darkLogo: 'https://media.movieofthenight.com/services/hbo/logo-white.svg',
    short: 'H',
  },
];

const GENRES = ['Action','Adventure','Animation','Comedy','Crime','Documentary',
  'Drama','Fantasy','History','Horror','Music','Mystery','Romance',
  'Science Fiction','Sport','Thriller','War','Western'];
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

// ─── localStorage ─────────────────────────────────────────────────────────────
function getSelectedPlatforms() {
  try {
    const saved = localStorage.getItem('selectedPlatforms');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return PLATFORMS.map(p => p.slug);
}
function saveSelectedPlatforms(slugs) {
  try { localStorage.setItem('selectedPlatforms', JSON.stringify(slugs)); } catch (e) {}
}

// ─── Carousel ─────────────────────────────────────────────────────────────────
function CarouselComments() {
  const [index, setIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]).start();
      setIndex((prev) => (prev + 1) % COMMENTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  return (
    <Animated.View style={[styles.commentBubble, { opacity: fadeAnim }]}>
      <Text style={styles.commentText}>{COMMENTS[index]}</Text>
    </Animated.View>
  );
}

// ─── Platform Modal ───────────────────────────────────────────────────────────
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
            <Text style={styles.platformModalTitle}>Platform Seçimi</Text>
            <Text style={styles.platformModalSubtitle}>İzlemek istediğin platformları seç</Text>

            <View style={styles.platformGrid}>
              {PLATFORMS.map(p => {
                const isSelected = local.includes(p.slug);
                return (
                  <TouchableOpacity
                    key={p.slug}
                    style={[styles.platformCard, isSelected && { borderColor: p.color, borderWidth: 2 }]}
                    onPress={() => toggle(p.slug)}
                  >
                    <View style={[styles.platformCardBg, { backgroundColor: p.color + '22' }]}>
                      <Image
                        source={{ uri: p.darkLogo }}
                        style={styles.platformCardLogo}
                        resizeMode="contain"
                      />
                    </View>
                    {isSelected && (
                      <View style={[styles.platformCardCheck, { backgroundColor: p.color }]}>
                        <Text style={styles.platformCardCheckText}>✓</Text>
                      </View>
                    )}
                    <Text style={[styles.platformCardName, isSelected && { color: p.color }]}>{p.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.platformSaveBtn}
              onPress={() => { onSave(local); onClose(); }}
            >
              <Text style={styles.platformSaveBtnText}>Kaydet ({local.length} platform)</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── Detay Modal ──────────────────────────────────────────────────────────────
function DetailModal({ item, onClose }) {
  if (!item) return null;
  const typeLabel = item.type === 'movie' ? '🎬 Film' : '📺 Dizi';
  const langLabel = item.original_language ? LANGUAGE_MAP[item.original_language] : null;

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.detailModalContainer}>
          <TouchableOpacity activeOpacity={1}>
            <View style={styles.modalHeader}>
              {item.poster_url ? (
                <Image source={{ uri: item.poster_url }} style={styles.modalPoster} />
              ) : (
                <View style={styles.modalPosterPlaceholder}>
                  <Text style={{ color: '#666', fontSize: 24 }}>?</Text>
                </View>
              )}
              <View style={styles.modalHeaderInfo}>
                <Text style={styles.modalTitle} numberOfLines={2}>{item.title}</Text>
                {item.original_title && item.original_title !== item.title && (
                  <Text style={styles.modalOriginalTitle}>{item.original_title}</Text>
                )}
                <Text style={styles.modalMeta}>{typeLabel}{langLabel ? ' · ' + langLabel : ''}</Text>
                {item.year && <Text style={styles.modalMeta}>{item.year}</Text>}
                <View style={styles.modalImdbRow}>
                  <View style={styles.imdbBadge}>
                    <Text style={styles.imdbBadgeText}>IMDb</Text>
                  </View>
                  <Text style={styles.imdbScoreLarge}>{item.imdb_score ? item.imdb_score.toFixed(1) : 'N/A'}</Text>
                </View>
                {item.availability && item.availability.length > 0 && (
                  <View style={styles.modalPlatformRow}>
                    {item.availability.map(a => {
                      const p = PLATFORMS.find(x => x.slug === a.platform_slug);
                      if (!p) return null;
                      return (
                        <TouchableOpacity
                          key={a.platform_slug}
                          style={[styles.modalPlatformBtn, { backgroundColor: p.color }]}
                          onPress={() => a.platform_url && window.open(a.platform_url, '_blank')}
                          disabled={!a.platform_url}
                        >
                          <Image source={{ uri: p.darkLogo }} style={styles.modalPlatformLogo} resizeMode="contain" />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            </View>

            {item.tagline ? (
              <Text style={styles.modalTagline}>"{item.tagline}"</Text>
            ) : null}
            {item.director ? (
              <Text style={styles.modalDetail}>🎬 <Text style={styles.modalDetailLabel}>Yönetmen: </Text>{item.director}</Text>
            ) : null}
            {item.cast_list ? (
              <Text style={styles.modalDetail}>👥 <Text style={styles.modalDetailLabel}>Oyuncular: </Text>{item.cast_list}</Text>
            ) : null}
            {item.synopsis_tr ? (
              <>
                <Text style={styles.modalSynopsisTitle}>Konu</Text>
                <Text style={styles.modalSynopsis}>{item.synopsis_tr}</Text>
              </>
            ) : null}

            <View style={styles.modalButtons}>
              {item.trailer_url && (
                <TouchableOpacity style={styles.trailerBtn} onPress={() => window.open(item.trailer_url, '_blank')}>
                  <Text style={styles.trailerBtnText}>▶ Fragman</Text>
                </TouchableOpacity>
              )}
              {item.imdb_id && (
                <TouchableOpacity style={styles.imdbLinkBtn} onPress={() => window.open('https://www.imdb.com/title/' + item.imdb_id + '/', '_blank')}>
                  <View style={styles.imdbBadge}><Text style={styles.imdbBadgeText}>IMDb</Text></View>
                  <Text style={styles.imdbLinkText}>↗ imdb.com</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Text style={styles.closeBtnText}>✕ Kapat</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── Ana Uygulama ─────────────────────────────────────────────────────────────
export default function App() {
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

  useEffect(() => {
    fetchContents();
  }, [activeSearch, selectedType, selectedGenre, selectedLanguage, sortBy, sortAsc, minImdb, minYear, selectedPlatforms]);

  async function fetchContents() {
    if (selectedPlatforms.length === 0) { setContents([]); setLoading(false); return; }
    setLoading(true);

    let query = supabase
      .from('hub_contents')
      .select('*, availability:hub_availability(platform_slug, platform_url)')
      .not('imdb_score', 'is', null)
      .not('imdb_id', 'is', null)
      .order(sortBy, { ascending: sortAsc })
      .limit(100);

    if (activeSearch.length > 0) {
      query = supabase
        .from('hub_contents')
        .select('*, availability:hub_availability(platform_slug, platform_url)')
        .not('imdb_score', 'is', null)
        .not('imdb_id', 'is', null)
        .or('title.ilike.%' + activeSearch + '%,original_title.ilike.%' + activeSearch + '%,cast_list.ilike.%' + activeSearch + '%,director.ilike.%' + activeSearch + '%')
        .order(sortBy, { ascending: sortAsc })
        .limit(6000);
    }

    if (selectedType !== 'all') query = query.eq('type', selectedType);
    if (selectedGenre) query = query.ilike('genre', '%' + selectedGenre + '%');
    if (selectedLanguage) query = query.eq('original_language', selectedLanguage);
    if (minImdb > 0) query = query.gte('imdb_score', minImdb);
    if (minYear > 1950) query = query.gte('year', minYear);

    const { data, error } = await query;
    if (error) { console.error(error); setLoading(false); return; }

    const filtered = (data || []).filter(item =>
      item.availability && item.availability.some(a => selectedPlatforms.includes(a.platform_slug))
    );
    const enriched = filtered.map(item => ({
      ...item,
      availability: item.availability.filter(a => selectedPlatforms.includes(a.platform_slug)),
    }));

    setContents(enriched);
    setLoading(false);
  }

  function handlePlatformSave(slugs) {
    setSelectedPlatforms(slugs);
    saveSelectedPlatforms(slugs);
  }
  function handleSearch() { setActiveSearch(searchInput); }
  function clearSearch() { setSearchInput(''); setActiveSearch(''); }
  function toggleSort(field) {
    if (sortBy === field) setSortAsc(!sortAsc);
    else { setSortBy(field); setSortAsc(false); }
  }
  function getSortIcon(field) {
    if (sortBy !== field) return '';
    return sortAsc ? ' ↑' : ' ↓';
  }
  function formatRuntime(minutes) {
    if (!minutes) return null;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0 && m > 0) return h + 's ' + m + 'dk';
    if (h > 0) return h + 's';
    return m + 'dk';
  }

  function renderItem({ item }) {
    const typeLabel = item.type === 'movie' ? '🎬 Film' : '📺 Dizi';
    const langLabel = item.original_language ? LANGUAGE_MAP[item.original_language] : null;
    const genres = item.genre ? item.genre.split(',').slice(0, 2).join(', ') : '';
    const runtime = formatRuntime(item.runtime);
    const hasDetails = item.synopsis_tr || item.director || item.cast_list || item.tagline;

    return (
      <View style={styles.card}>
        {item.poster_url ? (
          <Image source={{ uri: item.poster_url }} style={styles.poster} />
        ) : (
          <View style={styles.posterPlaceholder}>
            <Text style={styles.posterPlaceholderText}>?</Text>
          </View>
        )}
        <View style={styles.info}>
          <View style={styles.row}>
            <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          </View>
          {item.original_title && item.original_title !== item.title && (
            <Text style={styles.originalTitle} numberOfLines={1}>{item.original_title}</Text>
          )}
          <View style={styles.row}>
            <Text style={styles.typeText}>{typeLabel}</Text>
            {genres ? <Text style={styles.dot}> · </Text> : null}
            {genres ? <Text style={styles.genreText}>{genres}</Text> : null}
          </View>
          <View style={styles.row}>
            {langLabel ? <Text style={styles.langText}>{langLabel}</Text> : null}
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
                  <TouchableOpacity
                    key={a.platform_slug}
                    style={[styles.platformPill, { backgroundColor: p.color + '22', borderColor: p.color + '44' }]}
                    onPress={() => a.platform_url && window.open(a.platform_url, '_blank')}
                    disabled={!a.platform_url}
                  >
                    <Image source={{ uri: p.darkLogo }} style={styles.platformPillLogo} resizeMode="contain" />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <View style={styles.bottomRow}>
            <TouchableOpacity
              style={styles.imdbBtn}
              onPress={() => item.imdb_id && window.open('https://www.imdb.com/title/' + item.imdb_id + '/', '_blank')}
            >
              <View style={styles.imdbBadge}><Text style={styles.imdbBadgeText}>IMDb</Text></View>
              <Text style={styles.imdbScore}>{item.imdb_score ? item.imdb_score.toFixed(1) : 'N/A'}</Text>
              <Text style={styles.imdbArrow}>↗</Text>
            </TouchableOpacity>
            {item.trailer_url && (
              <TouchableOpacity style={styles.trailerBtn} onPress={() => window.open(item.trailer_url, '_blank')}>
                <Text style={styles.trailerBtnText}>▶ Fragman</Text>
              </TouchableOpacity>
            )}
            {hasDetails && (
              <TouchableOpacity style={styles.detailBtn} onPress={() => setSelectedItem(item)}>
                <Text style={styles.detailBtnText}>Detaylar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" />
      <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      <PlatformModal
        visible={showPlatformModal}
        selected={selectedPlatforms}
        onSave={handlePlatformSave}
        onClose={() => setShowPlatformModal(false)}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.appTitle}>Ne İzlesek?</Text>
            <View style={styles.headerTagRow}>
              <Text style={styles.headerSubtitle}>Film & Dizi Puanları</Text>
              <View style={styles.imdbBadgeHeader}><Text style={styles.imdbBadgeHeaderText}>IMDb</Text></View>
            </View>
          </View>
          <TouchableOpacity style={styles.platformBtn} onPress={() => setShowPlatformModal(true)}>
            <View style={styles.platformBtnLogos}>
              {selectedPlatforms.slice(0, 4).map(slug => {
                const p = PLATFORMS.find(x => x.slug === slug);
                if (!p) return null;
                return (
                  <View key={slug} style={[styles.platformBtnDot, { backgroundColor: p.color }]} />
                );
              })}
            </View>
            <Text style={styles.platformBtnText}>Platformlar</Text>
          </TouchableOpacity>
        </View>

        {/* Platform logoları */}
        <View style={styles.platformLogoGrid}>
          {PLATFORMS.filter(p => selectedPlatforms.includes(p.slug)).map(p => (
            <View key={p.slug} style={[styles.platformLogoCard, { backgroundColor: p.color, borderColor: p.color }]}>
              <Image source={{ uri: p.darkLogo }} style={styles.platformLogoImg} resizeMode="contain" />
            </View>
          ))}
        </View>

        <CarouselComments />
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
        {searchInput.length > 0 && (
          <TouchableOpacity style={styles.clearBtn} onPress={clearSearch}>
            <Text style={styles.clearBtnText}>✕</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Text style={styles.searchBtnText}>Ara</Text>
        </TouchableOpacity>
      </View>

      {/* Tür */}
      <View style={styles.typeRow}>
        {[['all', 'Tümü'], ['movie', 'Filmler'], ['series', 'Diziler']].map(([val, label]) => (
          <TouchableOpacity
            key={val}
            style={[styles.typeBtn, selectedType === val && styles.typeBtnActive]}
            onPress={() => { setSelectedType(val); setSelectedGenre(null); }}
          >
            <Text style={[styles.typeBtnText, selectedType === val && styles.typeBtnTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sıralama */}
      <View style={styles.sortRow}>
        {[['imdb_score', 'IMDb Puanı'], ['year', 'Yıl']].map(([val, label]) => (
          <TouchableOpacity
            key={val}
            style={[styles.sortBtn, sortBy === val && styles.sortBtnActive]}
            onPress={() => toggleSort(val)}
          >
            <Text style={[styles.sortBtnText, sortBy === val && styles.sortBtnTextActive]}>
              {label}{getSortIcon(val)}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.filterToggle, showFilters && styles.filterToggleActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={[styles.filterToggleText, showFilters && styles.filterToggleTextActive]}>
            {showFilters ? 'Gizle ▲' : 'Filtreler ▼'}
          </Text>
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filtersBox}>
          <Text style={styles.filterLabel}>IMDb Puanı: <Text style={styles.filterValue}>{minImdb > 0 ? minImdb + '+' : 'Tümü'}</Text></Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
            {IMDB_VALUES.map((val) => (
              <TouchableOpacity key={val} style={[styles.sliderBtn, minImdb === val && styles.sliderBtnActive]} onPress={() => setMinImdb(val)}>
                <Text style={[styles.sliderBtnText, minImdb === val && styles.sliderBtnTextActive]}>{val === 0 ? 'Tümü' : val + '+'}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={styles.filterLabel}>Yıl: <Text style={styles.filterValue}>{minYear > 1950 ? minYear + '+' : 'Tümü'}</Text></Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
            {YEAR_VALUES.map((val) => (
              <TouchableOpacity key={val} style={[styles.sliderBtn, minYear === val && styles.sliderBtnActive]} onPress={() => setMinYear(val)}>
                <Text style={[styles.sliderBtnText, minYear === val && styles.sliderBtnTextActive]}>{val === 1950 ? 'Tümü' : val + '+'}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={styles.filterLabel}>Dil: <Text style={styles.filterValue}>{selectedLanguage ? LANGUAGES.find(l => l.code === selectedLanguage)?.label : 'Tümü'}</Text></Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
            <TouchableOpacity style={[styles.sliderBtn, selectedLanguage === null && styles.sliderBtnActive]} onPress={() => setSelectedLanguage(null)}>
              <Text style={[styles.sliderBtnText, selectedLanguage === null && styles.sliderBtnTextActive]}>Tümü</Text>
            </TouchableOpacity>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity key={lang.code} style={[styles.sliderBtn, selectedLanguage === lang.code && styles.sliderBtnActive]} onPress={() => setSelectedLanguage(lang.code)}>
                <Text style={[styles.sliderBtnText, selectedLanguage === lang.code && styles.sliderBtnTextActive]}>{lang.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {(minImdb > 0 || minYear > 1950 || selectedLanguage) && (
            <TouchableOpacity style={styles.resetBtn} onPress={() => { setMinImdb(0); setMinYear(1950); setSelectedLanguage(null); }}>
              <Text style={styles.resetBtnText}>Sıfırla</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={styles.genreWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.genreContent}>
          <TouchableOpacity style={[styles.genreBtn, selectedGenre === null && styles.genreBtnActive]} onPress={() => setSelectedGenre(null)}>
            <Text style={[styles.genreBtnText, selectedGenre === null && styles.genreBtnTextActive]}>Tüm Türler</Text>
          </TouchableOpacity>
          {GENRES.map((genre) => (
            <TouchableOpacity key={genre} style={[styles.genreBtn, selectedGenre === genre && styles.genreBtnActive]} onPress={() => setSelectedGenre(selectedGenre === genre ? null : genre)}>
              <Text style={[styles.genreBtnText, selectedGenre === genre && styles.genreBtnTextActive]}>{genre}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#00A8E1" style={styles.loader} />
      ) : (
        <FlatList
          data={contents}
          keyExtractor={(item) => item.id ? item.id.toString() : item.imdb_id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🎬</Text>
              <Text style={styles.emptyText}>İçerik bulunamadı</Text>
              <Text style={styles.emptySubText}>Seçili platformlarda bu kriterlere uygun içerik yok</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

// ─── Stiller ──────────────────────────────────────────────────────────────────
const BG = '#0a0a0f';
const CARD = '#13131f';
const SURFACE = '#1a1a2e';
const BORDER = '#ffffff11';
const ACCENT = '#00A8E1';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

  // Header
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: BORDER },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  headerLeft: { flex: 1 },
  appTitle: { color: '#fff', fontSize: 30, fontWeight: 'bold', letterSpacing: -0.5 },
  headerTagRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  headerSubtitle: { color: '#ffffff55', fontSize: 13 },
  imdbBadgeHeader: { backgroundColor: '#F5C518', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  imdbBadgeHeaderText: { color: '#000', fontSize: 10, fontWeight: 'bold' },

  // Platform butonu (sağ üst)
  platformBtn: { backgroundColor: SURFACE, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: BORDER, alignItems: 'center', gap: 6 },
  platformBtnLogos: { flexDirection: 'row', gap: 4 },
  platformBtnDot: { width: 8, height: 8, borderRadius: 4 },
  platformBtnText: { color: '#ffffff88', fontSize: 11 },

  // Platform logo satırı
  platformLogoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  platformLogoCard: { flex: 1, minWidth: '45%', backgroundColor: SURFACE, borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8, justifyContent: 'center', alignItems: 'center' },
  platformLogoImg: { width: 80, height: 22 },

  // Carousel
  commentBubble: { backgroundColor: SURFACE, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: BORDER, alignSelf: 'flex-start' },
  commentText: { color: '#ffffff55', fontSize: 12, fontStyle: 'italic' },

  // Arama
  searchRow: { flexDirection: 'row', paddingHorizontal: 16, marginVertical: 12, gap: 8, alignItems: 'center', flexShrink: 0 },
  searchInput: { flex: 1, minWidth: 0, backgroundColor: SURFACE, color: '#fff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, borderWidth: 1, borderColor: BORDER },
  clearBtn: { backgroundColor: SURFACE, width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: BORDER },
  clearBtnText: { color: '#ffffff44', fontSize: 14 },
  searchBtn: { backgroundColor: ACCENT, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, flexShrink: 0 },
  searchBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },

  // Tür
  typeRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8, gap: 8 },
  typeBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: SURFACE, alignItems: 'center', borderWidth: 1, borderColor: BORDER },
  typeBtnActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  typeBtnText: { color: '#ffffff44', fontSize: 13, fontWeight: '600' },
  typeBtnTextActive: { color: '#fff' },

  // Sıralama
  sortRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8, gap: 8, alignItems: 'center' },
  sortBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: SURFACE, borderWidth: 1, borderColor: BORDER },
  sortBtnActive: { borderColor: ACCENT },
  sortBtnText: { color: '#ffffff44', fontSize: 12 },
  sortBtnTextActive: { color: ACCENT, fontWeight: '600' },
  filterToggle: { marginLeft: 'auto', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: SURFACE, borderWidth: 1, borderColor: BORDER },
  filterToggleActive: { borderColor: ACCENT },
  filterToggleText: { color: '#ffffff44', fontSize: 12 },
  filterToggleTextActive: { color: ACCENT },

  // Filtreler
  filtersBox: { marginHorizontal: 16, marginBottom: 10, backgroundColor: SURFACE, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: BORDER },
  filterLabel: { color: '#ffffff55', fontSize: 12, marginBottom: 6 },
  filterValue: { color: ACCENT, fontWeight: '600' },
  sliderBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16, backgroundColor: BG, marginRight: 6, borderWidth: 1, borderColor: BORDER },
  sliderBtnActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  sliderBtnText: { color: '#ffffff44', fontSize: 12 },
  sliderBtnTextActive: { color: '#fff', fontWeight: '600' },
  resetBtn: { alignSelf: 'flex-start', marginTop: 6, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: ACCENT },
  resetBtnText: { color: ACCENT, fontSize: 12 },

  // Genre
  genreWrapper: { paddingLeft: 16, marginBottom: 12 },
  genreContent: { paddingRight: 16 },
  genreBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: SURFACE, marginRight: 8, borderWidth: 1, borderColor: BORDER },
  genreBtnActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  genreBtnText: { color: '#ffffff44', fontSize: 13 },
  genreBtnTextActive: { color: '#fff', fontWeight: '600' },

  loader: { marginTop: 60 },
  list: { paddingHorizontal: 16, paddingBottom: 20 },

  // Kart
  card: { flexDirection: 'row', backgroundColor: CARD, borderRadius: 14, marginBottom: 12, overflow: 'hidden', borderWidth: 1, borderColor: BORDER },
  poster: { width: 85, height: 125 },
  posterPlaceholder: { width: 85, height: 125, backgroundColor: SURFACE, alignItems: 'center', justifyContent: 'center' },
  posterPlaceholderText: { color: '#ffffff22', fontSize: 24 },
  info: { flex: 1, padding: 12 },
  row: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 2, flexWrap: 'wrap' },
  title: { color: '#fff', fontSize: 14, fontWeight: '700' },
  originalTitle: { color: '#ffffff33', fontSize: 11, fontStyle: 'italic', marginBottom: 3 },
  typeText: { color: '#ffffff55', fontSize: 11 },
  langText: { color: '#ffffff44', fontSize: 11 },
  dot: { color: '#ffffff22', fontSize: 11 },
  genreText: { color: '#ffffff44', fontSize: 11 },
  metaText: { color: '#ffffff44', fontSize: 11 },

  // Platform pill (kartta)
  platformRow: { flexDirection: 'row', gap: 6, marginVertical: 6 },
  platformPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  platformPillLogo: { width: 40, height: 14 },

  // Alt butonlar
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

  // Boş
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  emptySubText: { color: '#ffffff33', fontSize: 13 },

  // Modal overlay
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'flex-end' },

  // Platform modal (bottom sheet)
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

  // Detay modal
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
  closeBtnText: { color: '#ffffff55', fontSize: 13 },
});
