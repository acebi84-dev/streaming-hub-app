import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity,
  Image, ActivityIndicator, SafeAreaView, StatusBar, ScrollView,
  Animated, Modal,
} from 'react-native';
import { supabase } from './supabase';

// ─── Sabitler ───────────────────────────────────────────────────────────────

const PLATFORMS = [
  { slug: 'netflix', name: 'Netflix',       color: '#E50914', short: 'N' },
  { slug: 'amazon',  name: 'Amazon Prime',  color: '#00A8E1', short: 'A' },
  { slug: 'disney',  name: 'Disney+',       color: '#01137c', short: 'D' },
  { slug: 'hbo',     name: 'HBO Max',       color: '#8B4FBE', short: 'H' },
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

// ─── localStorage yardımcıları ───────────────────────────────────────────────

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

// ─── Platform ikonu bileşeni ─────────────────────────────────────────────────

function PlatformBadge({ slug, url }) {
  const platform = PLATFORMS.find(p => p.slug === slug);
  if (!platform) return null;

  return (
    <TouchableOpacity
      style={[styles.platformBadge, { backgroundColor: platform.color }]}
      onPress={() => url && window.open(url, '_blank')}
      disabled={!url}
    >
      <Text style={styles.platformBadgeText}>{platform.short}</Text>
    </TouchableOpacity>
  );
}

// ─── Dönen yorum bileşeni ────────────────────────────────────────────────────

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

// ─── Platform Ayarları Modalı ────────────────────────────────────────────────

function PlatformModal({ visible, selected, onSave, onClose }) {
  const [local, setLocal] = useState(selected);

  useEffect(() => { setLocal(selected); }, [selected, visible]);

  function toggle(slug) {
    setLocal(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    );
  }

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.modalContainer}>
          <TouchableOpacity activeOpacity={1}>
            <Text style={styles.modalTitle}>Platform Seçimi</Text>
            <Text style={styles.modalSubtitle}>Hangi platformları görmek istiyorsun?</Text>

            <View style={styles.platformList}>
              {PLATFORMS.map(p => {
                const isSelected = local.includes(p.slug);
                return (
                  <TouchableOpacity
                    key={p.slug}
                    style={[styles.platformOption, isSelected && { borderColor: p.color, borderWidth: 2 }]}
                    onPress={() => toggle(p.slug)}
                  >
                    <View style={[styles.platformDot, { backgroundColor: p.color }]} />
                    <Text style={styles.platformOptionText}>{p.name}</Text>
                    {isSelected && <Text style={[styles.platformCheck, { color: p.color }]}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.saveBtn} onPress={() => { onSave(local); onClose(); }}>
                <Text style={styles.saveBtnText}>Kaydet</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Text style={styles.closeBtnText}>İptal</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── Detay Modalı ───────────────────────────────────────────────────────────

function DetailModal({ item, onClose }) {
  if (!item) return null;
  const typeLabel = item.type === 'movie' ? '🎬 Film' : '📺 Dizi';
  const langLabel = item.original_language ? LANGUAGE_MAP[item.original_language] : null;

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.modalContainer}>
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
                <Text style={styles.modalTitle}>{item.title}</Text>
                {item.original_title && item.original_title !== item.title && (
                  <Text style={styles.modalOriginalTitle}>{item.original_title}</Text>
                )}
                <Text style={styles.modalMeta}>{typeLabel}{langLabel ? ' · ' + langLabel : ''}</Text>
                {item.year && <Text style={styles.modalMeta}>{item.year}</Text>}
                <View style={styles.modalImdbRow}>
                  <Text style={styles.imdbLabel}>IMDb</Text>
                  <Text style={styles.imdbScore}>{item.imdb_score ? item.imdb_score.toFixed(1) : 'N/A'}</Text>
                </View>

                {/* Platform ikonları */}
                {item.availability && item.availability.length > 0 && (
                  <View style={styles.modalPlatforms}>
                    {item.availability.map(a => (
                      <PlatformBadge key={a.platform_slug} slug={a.platform_slug} url={a.platform_url} />
                    ))}
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
                <TouchableOpacity style={styles.imdbBtn} onPress={() => window.open('https://www.imdb.com/title/' + item.imdb_id + '/', '_blank')}>
                  <Text style={styles.imdbLabel}>IMDb</Text>
                  <Text style={styles.imdbArrow}>↗</Text>
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

// ─── Ana Uygulama ────────────────────────────────────────────────────────────

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
      .select(`*, availability:hub_availability(platform_slug, platform_url)`)
      .not('imdb_score', 'is', null)
      .not('imdb_id', 'is', null)
      .order(sortBy, { ascending: sortAsc })
      .limit(100);

    if (activeSearch.length > 0) {
      query = supabase
        .from('hub_contents')
        .select(`*, availability:hub_availability(platform_slug, platform_url)`)
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

    // Seçili platformlarda olan içerikleri filtrele
    const filtered = (data || []).filter(item =>
      item.availability && item.availability.some(a => selectedPlatforms.includes(a.platform_slug))
    );

    // Her içeriğin availability'sini sadece seçili platformlarla sınırla
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
            {item.original_title && item.original_title !== item.title && (
              <Text style={styles.originalTitle}> · {item.original_title}</Text>
            )}
          </View>
          <View style={styles.row}>
            <Text style={styles.typeText}>{typeLabel}</Text>
            {genres ? <Text style={styles.dot}> · </Text> : null}
            {genres ? <Text style={styles.genreText}>{genres}</Text> : null}
            {langLabel ? <Text style={styles.dot}> · </Text> : null}
            {langLabel ? <Text style={styles.langText}>{langLabel}</Text> : null}
          </View>
          <View style={styles.row}>
            {item.year ? <Text style={styles.metaText}>{item.year}</Text> : null}
            {item.year && runtime ? <Text style={styles.dot}> · </Text> : null}
            {runtime ? <Text style={styles.metaText}>{runtime}</Text> : null}
          </View>

          {/* Platform ikonları */}
          {item.availability && item.availability.length > 0 && (
            <View style={styles.platformRow}>
              {item.availability.map(a => (
                <PlatformBadge key={a.platform_slug} slug={a.platform_slug} url={a.platform_url} />
              ))}
            </View>
          )}

          <View style={styles.bottomRow}>
            <TouchableOpacity style={styles.imdbBtn} onPress={() => item.imdb_id && window.open('https://www.imdb.com/title/' + item.imdb_id + '/', '_blank')}>
              <Text style={styles.imdbLabel}>IMDb</Text>
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
      <StatusBar barStyle="light-content" backgroundColor="#0d0f14" />

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
          <View>
            <Text style={styles.appTitle}>Ne İzlesek?</Text>
            <Text style={styles.headerSubtitle}>Film & Dizi Puanları</Text>
          </View>
          <TouchableOpacity style={styles.platformSettingsBtn} onPress={() => setShowPlatformModal(true)}>
            <Text style={styles.platformSettingsBtnText}>⚙ Platformlar</Text>
            <View style={styles.platformDots}>
              {selectedPlatforms.map(slug => {
                const p = PLATFORMS.find(x => x.slug === slug);
                return p ? <View key={slug} style={[styles.platformDotSmall, { backgroundColor: p.color }]} /> : null;
              })}
            </View>
          </TouchableOpacity>
        </View>
        <CarouselComments />
      </View>

      {/* Arama */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Film, dizi, oyuncu veya yönetmen ara..."
          placeholderTextColor="#4a5568"
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

      {/* Tür seçimi */}
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

      {/* Sıralama + Filtreler */}
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
            {showFilters ? 'Gizle' : 'Filtreler ▼'}
          </Text>
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filtersBox}>
          <Text style={styles.filterLabel}>IMDb Puanı: <Text style={styles.filterValue}>{minImdb > 0 ? minImdb + '+' : 'Tümü'}</Text></Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
            {IMDB_VALUES.map((val) => (
              <TouchableOpacity key={val} style={[styles.sliderBtn, minImdb === val && styles.sliderBtnActive]} onPress={() => setMinImdb(val)}>
                <Text style={[styles.sliderBtnText, minImdb === val && styles.sliderBtnTextActive]}>{val === 0 ? 'Tümü' : val + '+'}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={styles.filterLabel}>Yıl: <Text style={styles.filterValue}>{minYear > 1950 ? minYear + '+' : 'Tümü'}</Text></Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
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

      {/* Genre */}
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

// ─── Stiller ─────────────────────────────────────────────────────────────────

const ACCENT = '#00A8E1';
const ACCENT2 = '#E50914';
const BG = '#0d0f14';
const CARD_BG = '#161b27';
const SURFACE = '#1e2535';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

  // Header
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  appTitle: { color: '#fff', fontSize: 28, fontWeight: 'bold', letterSpacing: 0.5 },
  headerSubtitle: { color: '#4a5568', fontSize: 12, marginTop: 2 },
  platformSettingsBtn: { backgroundColor: SURFACE, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, alignItems: 'center', gap: 4 },
  platformSettingsBtnText: { color: '#aaa', fontSize: 12 },
  platformDots: { flexDirection: 'row', gap: 4, marginTop: 4 },
  platformDotSmall: { width: 8, height: 8, borderRadius: 4 },

  // Yorum
  commentBubble: { backgroundColor: SURFACE, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderColor: '#2d3748', alignSelf: 'flex-start' },
  commentText: { color: '#718096', fontSize: 13, fontStyle: 'italic' },

  // Arama
  searchRow: { flexDirection: 'row', paddingHorizontal: 16, marginVertical: 8, gap: 8, alignItems: 'center' },
  searchInput: { flex: 1, backgroundColor: SURFACE, color: '#fff', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15 },
  clearBtn: { backgroundColor: SURFACE, width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  clearBtnText: { color: '#4a5568', fontSize: 14 },
  searchBtn: { backgroundColor: ACCENT, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  searchBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },

  // Tür
  typeRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8, gap: 8 },
  typeBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, backgroundColor: SURFACE, alignItems: 'center' },
  typeBtnActive: { backgroundColor: ACCENT },
  typeBtnText: { color: '#4a5568', fontSize: 13, fontWeight: 'bold' },
  typeBtnTextActive: { color: '#fff' },

  // Sıralama
  sortRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8, gap: 8, alignItems: 'center' },
  sortBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: SURFACE },
  sortBtnActive: { backgroundColor: CARD_BG, borderWidth: 1, borderColor: ACCENT },
  sortBtnText: { color: '#4a5568', fontSize: 13 },
  sortBtnTextActive: { color: ACCENT, fontWeight: 'bold' },
  filterToggle: { marginLeft: 'auto', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: SURFACE },
  filterToggleActive: { backgroundColor: CARD_BG, borderWidth: 1, borderColor: ACCENT },
  filterToggleText: { color: '#4a5568', fontSize: 12 },
  filterToggleTextActive: { color: ACCENT },

  // Filtreler
  filtersBox: { marginHorizontal: 16, marginBottom: 8, backgroundColor: SURFACE, borderRadius: 10, padding: 12 },
  filterLabel: { color: '#718096', fontSize: 12, marginBottom: 6 },
  filterValue: { color: ACCENT, fontWeight: 'bold' },
  sliderBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16, backgroundColor: CARD_BG, marginRight: 6 },
  sliderBtnActive: { backgroundColor: ACCENT },
  sliderBtnText: { color: '#4a5568', fontSize: 12 },
  sliderBtnTextActive: { color: '#fff', fontWeight: 'bold' },
  resetBtn: { alignSelf: 'flex-start', marginTop: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: ACCENT },
  resetBtnText: { color: ACCENT, fontSize: 12 },

  // Genre
  genreWrapper: { paddingLeft: 16, marginBottom: 12 },
  genreContent: { paddingRight: 16, flexDirection: 'row', alignItems: 'center' },
  genreBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: SURFACE, marginRight: 8 },
  genreBtnActive: { backgroundColor: ACCENT },
  genreBtnText: { color: '#4a5568', fontSize: 13 },
  genreBtnTextActive: { color: '#fff', fontWeight: 'bold' },

  loader: { marginTop: 60 },
  list: { paddingHorizontal: 16, paddingBottom: 20 },

  // Kart
  card: { flexDirection: 'row', backgroundColor: CARD_BG, borderRadius: 12, marginBottom: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#1e2535' },
  poster: { width: 90, height: 130 },
  posterPlaceholder: { width: 90, height: 130, backgroundColor: SURFACE, alignItems: 'center', justifyContent: 'center' },
  posterPlaceholderText: { color: '#4a5568', fontSize: 24 },
  info: { flex: 1, padding: 12 },
  row: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 3, flexWrap: 'wrap' },
  title: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  originalTitle: { color: '#4a5568', fontSize: 12, fontStyle: 'italic' },
  typeText: { color: '#718096', fontSize: 12 },
  langText: { color: '#4a5568', fontSize: 11 },
  dot: { color: '#2d3748', fontSize: 12 },
  genreText: { color: '#4a5568', fontSize: 12 },
  metaText: { color: '#718096', fontSize: 11 },

  // Platform badge (kartta)
  platformRow: { flexDirection: 'row', gap: 4, marginVertical: 6 },
  platformBadge: { width: 22, height: 22, borderRadius: 5, alignItems: 'center', justifyContent: 'center' },
  platformBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  // Alt butonlar
  bottomRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' },
  imdbBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: SURFACE, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, cursor: 'pointer' },
  imdbLabel: { backgroundColor: '#F5C518', color: '#000', fontSize: 10, fontWeight: 'bold', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 3 },
  imdbScore: { color: '#F5C518', fontSize: 15, fontWeight: 'bold' },
  imdbArrow: { color: '#4a5568', fontSize: 10 },
  trailerBtn: { backgroundColor: ACCENT, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  trailerBtnText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  detailBtn: { backgroundColor: SURFACE, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#2d3748' },
  detailBtnText: { color: '#718096', fontSize: 11 },

  // Boş liste
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 6, textAlign: 'center' },
  emptySubText: { color: '#4a5568', fontSize: 13 },

  // Modal ortak
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContainer: { backgroundColor: CARD_BG, borderRadius: 16, padding: 20, width: '100%', maxWidth: 500, borderWidth: 1, borderColor: '#2d3748' },
  modalTitle: { color: '#fff', fontSize: 17, fontWeight: 'bold', marginBottom: 4 },
  modalSubtitle: { color: '#718096', fontSize: 13, marginBottom: 16 },

  // Platform modal
  platformList: { gap: 10, marginBottom: 20 },
  platformOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: SURFACE, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#2d3748', gap: 10 },
  platformDot: { width: 12, height: 12, borderRadius: 6 },
  platformOptionText: { color: '#fff', fontSize: 14, flex: 1 },
  platformCheck: { fontSize: 16, fontWeight: 'bold' },

  // Detay modal
  modalHeader: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  modalPoster: { width: 80, height: 120, borderRadius: 8 },
  modalPosterPlaceholder: { width: 80, height: 120, backgroundColor: SURFACE, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  modalHeaderInfo: { flex: 1, justifyContent: 'center' },
  modalOriginalTitle: { color: '#4a5568', fontSize: 12, fontStyle: 'italic', marginBottom: 4 },
  modalMeta: { color: '#718096', fontSize: 12, marginBottom: 2 },
  modalImdbRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  modalPlatforms: { flexDirection: 'row', gap: 4, marginTop: 8 },
  modalTagline: { color: '#4a5568', fontSize: 12, fontStyle: 'italic', marginBottom: 10, borderLeftWidth: 2, borderLeftColor: ACCENT, paddingLeft: 8 },
  modalDetail: { color: '#718096', fontSize: 12, marginBottom: 6 },
  modalDetailLabel: { fontWeight: 'bold', color: '#a0aec0' },
  modalSynopsisTitle: { color: ACCENT, fontSize: 13, fontWeight: 'bold', marginTop: 8, marginBottom: 6 },
  modalSynopsis: { color: '#a0aec0', fontSize: 14, lineHeight: 22, marginBottom: 16 },
  modalButtons: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  saveBtn: { backgroundColor: ACCENT, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8 },
  saveBtnText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  closeBtn: { backgroundColor: SURFACE, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  closeBtnText: { color: '#718096', fontSize: 13 },
});
