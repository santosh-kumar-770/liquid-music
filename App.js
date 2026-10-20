
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as MediaLibrary from 'expo-media-library/legacy';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';

const COLORS = {
  background: '#09090D',
  purple: '#B5A6FF',
  muted: '#A5A2B5',
};

function formatTime(seconds = 0) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function cleanTitle(filename = 'Unknown track') {
  return filename.replace(/\.[^/.]+$/, '').replace(/[_]/g, ' ');
}

export default function App() {
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);

  const [songs, setSongs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [scanning, setScanning] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [selectedTab, setSelectedTab] = useState('Library');
  const [searchText, setSearchText] = useState('');

  const currentTrack = currentIndex >= 0 ? songs[currentIndex] : null;

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'doNotMix',
    }).catch(console.warn);
  }, []);

  const scanMusic = useCallback(async () => {
    if (scanning) return;

    setScanning(true);
    setPermissionDenied(false);

    try {
      const permission = await MediaLibrary.requestPermissionsAsync(
        false,
        ['audio']
      );

      if (!permission.granted) {
        setPermissionDenied(true);
        Alert.alert(
          'Music permission needed',
          'Allow My Muzics to access audio files in Android settings, then try scanning again.'
        );
        return;
      }

      let allSongs = [];
      let after;

      // Read every available page instead of stopping at the first 100 songs.
      for (let page = 0; page < 100; page++) {
        const result = await MediaLibrary.getAssetsAsync({
          mediaType: MediaLibrary.MediaType.audio,
          first: 100,
          after,
          sortBy: [['filename', true]],
        });

        allSongs = allSongs.concat(result.assets);

        if (!result.hasNextPage || !result.endCursor) break;
        after = result.endCursor;
      }

      const cleanedSongs = allSongs.map((asset) => ({
        id: asset.id,
        uri: asset.uri,
        filename: asset.filename || 'Unknown track',
        title: cleanTitle(asset.filename),
        duration: asset.duration || 0,
        artist: 'Local audio',
      }));

      setSongs(cleanedSongs);

      if (cleanedSongs.length === 0) {
        Alert.alert(
          'No music found',
          'Android did not return any indexed audio files. Check that your music files are stored on the phone or SD card and are visible to Android.'
        );
      }
    } catch (error) {
      console.error('Music scan failed:', error);
      Alert.alert(
        'Could not scan music',
        error?.message || 'Please try again.'
      );
    } finally {
      setScanning(false);
    }
  }, [scanning]);

  useEffect(() => {
    scanMusic();
    // Scan when the screen first opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const playTrack = async (index) => {
    const track = songs[index];
    if (!track?.uri) return;

    try {
      if (index === currentIndex && status.playing) {
        player.pause();
        return;
      }

      if (index !== currentIndex) {
        setCurrentIndex(index);
        player.replace(track.uri);
      }

      player.play();
    } catch (error) {
      console.error('Playback failed:', error);
      Alert.alert(
        'Unable to play track',
        'This file may use an unsupported format or may no longer be available.'
      );
    }
  };

  const skipTrack = (direction) => {
    if (!songs.length) return;

    const nextIndex =
      currentIndex < 0
        ? 0
        : (currentIndex + direction + songs.length) % songs.length;

    playTrack(nextIndex);
  };

  const filteredSongs = songs.filter((song) =>
    `${song.title} ${song.artist}`
      .toLowerCase()
      .includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#09090D" />

      <LinearGradient
        colors={['#25203C', '#111019', '#09090D']}
        locations={[0, 0.42, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>YOUR SOUND. YOUR SPACE.</Text>
            <Text style={styles.brand}>
              muzics<Text style={styles.brandDot}>.</Text>
            </Text>
          </View>

          <Pressable style={styles.scanButton} onPress={scanMusic}>
            {scanning ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.scanIcon}>↻</Text>
            )}
          </Pressable>
        </View>

        {selectedTab === 'Search' ? (
          <View style={styles.searchPanel}>
            <Text style={styles.sectionTitle}>Find your music</Text>
            <Text style={styles.subtitle}>
              Search your indexed local songs below.
            </Text>
            <View style={styles.searchBox}>
              <Text style={styles.searchSymbol}>⌕</Text>
              <Text
                style={styles.searchPlaceholder}
                onPress={() =>
                  Alert.alert(
                    'Search',
                    'Search input will be added in the next UI refinement.'
                  )
                }
              >
                {searchText || 'Search songs'}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.intro}>
            <Text style={styles.heading}>
              Your music.{'\n'}Your rules.
            </Text>
            <Text style={styles.subtitle}>
              Offline listening. No cloud required.
            </Text>
          </View>
        )}

        <View style={styles.hero}>
          <LinearGradient
            colors={['#8B79D6', '#51427F', '#28213F']}
            style={styles.heroGradient}
          >
            <View style={styles.heroOrb} />
            <Text style={styles.heroLabel}>NOW PLAYING</Text>

            <View style={styles.heroArtwork}>
              <Text style={styles.heroNote}>♫</Text>
            </View>

            <Text style={styles.heroTitle} numberOfLines={1}>
              {currentTrack?.title || 'Choose your soundtrack'}
            </Text>

            <Text style={styles.heroArtist} numberOfLines={1}>
              {currentTrack?.artist || 'Your device. Your music.'}
            </Text>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${
                      status.duration > 0
                        ? Math.min(
                            100,
                            (status.currentTime / status.duration) * 100
                          )
                        : 0
                    }%`,
                  },
                ]}
              />
            </View>

            <View style={styles.timeRow}>
              <Text style={styles.timeText}>
                {formatTime(status.currentTime)}
              </Text>
              <Text style={styles.timeText}>
                {formatTime(status.duration || currentTrack?.duration)}
              </Text>
            </View>

            <View style={styles.controls}>
              <Pressable onPress={() => skipTrack(-1)}>
                <Text style={styles.sideControl}>|◀</Text>
              </Pressable>

              <Pressable
                style={styles.playButton}
                onPress={() => {
                  if (currentIndex < 0) {
                    if (songs.length) playTrack(0);
                  } else if (status.playing) {
                    player.pause();
                  } else {
                    player.play();
                  }
                }}
              >
                <Text style={styles.playIcon}>
                  {status.playing ? 'Ⅱ' : '▶'}
                </Text>
              </Pressable>

              <Pressable onPress={() => skipTrack(1)}>
                <Text style={styles.sideControl}>▶|</Text>
              </Pressable>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Your library</Text>
            <Text style={styles.libraryCount}>
              {scanning
                ? 'Scanning device…'
                : `${songs.length} audio files found`}
            </Text>
          </View>

          <Pressable onPress={scanMusic} disabled={scanning}>
            <Text style={styles.refreshText}>
              {scanning ? 'Scanning' : 'Rescan ↻'}
            </Text>
          </Pressable>
        </View>

        {permissionDenied && (
          <Text style={styles.message}>
            Audio access is needed to load your songs.
          </Text>
        )}

        <ScrollView
          style={styles.songList}
          contentContainerStyle={styles.songListContent}
          showsVerticalScrollIndicator={false}
        >
          {scanning && songs.length === 0 ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color={COLORS.purple} />
              <Text style={styles.emptyText}>Finding your music…</Text>
            </View>
          ) : filteredSongs.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyNote}>♫</Text>
              <Text style={styles.emptyTitle}>
                {searchText ? 'No matching songs' : 'Your library is waiting'}
              </Text>
              <Text style={styles.emptyText}>
                {searchText
                  ? 'Try another song title.'
                  : 'Add audio files to your phone or SD card, then rescan.'}
              </Text>
              <Pressable style={styles.rescanPill} onPress={scanMusic}>
                <Text style={styles.rescanLabel}>Scan again</Text>
              </Pressable>
            </View>
          ) : (
            filteredSongs.map((song) => {
              const index = songs.findIndex((item) => item.id === song.id);
              const isCurrent = currentIndex === index;

              return (
                <Pressable
                  key={song.id}
                  style={styles.songRow}
                  onPress={() => playTrack(index)}
                >
                  <LinearGradient
                    colors={
                      isCurrent
                        ? ['#9B8AE9', '#453665']
                        : ['#39304F', '#191721']
                    }
                    style={styles.songArtwork}
                  >
                    <Text style={styles.songNote}>
                      {isCurrent && status.playing ? '♫' : '♪'}
                    </Text>
                  </LinearGradient>

                  <View style={styles.songInfo}>
                    <Text
                      style={[
                        styles.songTitle,
                        isCurrent && styles.currentSongTitle,
                      ]}
                      numberOfLines={1}
                    >
                      {song.title}
                    </Text>
                    <Text style={styles.songArtist} numberOfLines={1}>
                      {song.artist} · {formatTime(song.duration)}
                    </Text>
                  </View>

                  <Text style={styles.rowControl}>
                    {isCurrent && status.playing ? 'Ⅱ' : '▶'}
                  </Text>
                </Pressable>
              );
            })
          )}
        </ScrollView>

        {currentTrack && (
          <Pressable
            style={styles.miniPlayer}
            onPress={() => setSelectedTab('Library')}
          >
            <BlurView intensity={80} tint="dark" style={styles.miniBlur}>
              <View style={styles.miniArtwork}>
                <Text style={styles.miniNote}>♫</Text>
              </View>
              <View style={styles.miniInfo}>
                <Text style={styles.miniTitle} numberOfLines={1}>
                  {currentTrack.title}
                </Text>
                <Text style={styles.miniArtist}>Playing from your device</Text>
              </View>
              <Pressable
                hitSlop={12}
                onPress={() =>
                  status.playing ? player.pause() : player.play()
                }
              >
                <Text style={styles.miniControl}>
                  {status.playing ? 'Ⅱ' : '▶'}
                </Text>
              </Pressable>
            </BlurView>
          </Pressable>
        )}

        <BlurView intensity={75} tint="dark" style={styles.tabBar}>
          {[
            { name: 'Home', icon: '⌂' },
            { name: 'Library', icon: '▤' },
            { name: 'Search', icon: '⌕' },
            { name: 'Island', icon: '◉' },
          ].map((tab) => (
            <Pressable
              key={tab.name}
              style={styles.tab}
              onPress={() => {
                if (tab.name === 'Island') {
                  Alert.alert(
                    'Music Island',
                    'The floating overlay will be implemented after local playback works.'
                  );
                } else {
                  setSelectedTab(tab.name);
                }
              }}
            >
              <Text
                style={[
                  styles.tabIcon,
                  selectedTab === tab.name && styles.activeTabText,
                ]}
              >
                {tab.icon}
              </Text>
              <Text
                style={[
                  styles.tabLabel,
                  selectedTab === tab.name && styles.activeTabText,
                ]}
              >
                {tab.name}
              </Text>
            </Pressable>
          ))}
        </BlurView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#09090D' },
  safe: { flex: 1 },
  header: {
    paddingHorizontal: 22,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyebrow: {
    color: '#A5A0BC',
    fontSize: 9,
    letterSpacing: 2.5,
    fontWeight: '700',
  },
  brand: {
    color: '#FFFFFF',
    fontSize: 31,
    fontWeight: '800',
    letterSpacing: -1.5,
  },
  brandDot: { color: '#B4A5FF' },
  scanButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#FFFFFF25',
    backgroundColor: '#FFFFFF10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanIcon: { color: '#FFFFFF', fontSize: 27 },
  intro: { paddingHorizontal: 22, marginTop: 28, marginBottom: 18 },
  heading: {
    color: '#FFFFFF',
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '700',
    letterSpacing: -1.4,
  },
  subtitle: { color: '#A5A2B5', fontSize: 12, marginTop: 9 },
  hero: { marginHorizontal: 20, borderRadius: 27, overflow: 'hidden' },
  heroGradient: { padding: 20, alignItems: 'center', overflow: 'hidden' },
  heroOrb: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: '#FFFFFF10',
    top: -110,
    right: -50,
  },
  heroLabel: {
    alignSelf: 'flex-start',
    color: '#E3DDFF',
    fontSize: 9,
    letterSpacing: 2.5,
    fontWeight: '700',
  },
  heroArtwork: {
    width: 74,
    height: 74,
    marginTop: 12,
    marginBottom: 9,
    borderRadius: 23,
    backgroundColor: '#FFFFFF20',
    borderWidth: 1,
    borderColor: '#FFFFFF35',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroNote: { color: '#FFFFFF', fontSize: 45 },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    maxWidth: '90%',
  },
  heroArtist: { color: '#E0D9F4', fontSize: 11, marginTop: 4 },
  progressTrack: {
    width: '100%',
    height: 3,
    backgroundColor: '#FFFFFF30',
    borderRadius: 2,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressFill: { height: 3, backgroundColor: '#FFFFFF', borderRadius: 2 },
  timeRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  timeText: { color: '#E0D9F4', fontSize: 9 },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
    marginTop: 10,
  },
  sideControl: { color: '#FFFFFF', fontSize: 20, fontWeight: '600' },
  playButton: {
    width: 42,
    height: 42,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: { color: '#26213B', fontSize: 17, fontWeight: '800' },
  sectionHeader: {
    paddingHorizontal: 22,
    marginTop: 23,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  libraryCount: { color: '#9996AA', fontSize: 10, marginTop: 4 },
  refreshText: { color: '#B5A6FF', fontSize: 12, fontWeight: '600' },
  message: { color: '#E8B8B8', paddingHorizontal: 22, marginBottom: 10 },
  songList: { flex: 1 },
  songListContent: { paddingHorizontal: 22, paddingBottom: 190 },
  songRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  songArtwork: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  songNote: { color: '#FFFFFF', fontSize: 26 },
  songInfo: { flex: 1, marginLeft: 12, marginRight: 8 },
  songTitle: { color: '#F7F6FA', fontSize: 12, fontWeight: '600' },
  currentSongTitle: { color: '#C7BAFF' },
  songArtist: { color: '#9996AA', fontSize: 10, marginTop: 5 },
  rowControl: { color: '#DAD2FF', fontSize: 16, paddingHorizontal: 5 },
  emptyState: { alignItems: 'center', paddingTop: 25, paddingHorizontal: 15 },
  emptyNote: { color: '#B5A6FF', fontSize: 44, marginBottom: 8 },
  emptyTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  emptyText: { color: '#9996AA', fontSize: 11, textAlign: 'center', marginTop: 8 },
  rescanPill: {
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#A99AFF25',
  },
  rescanLabel: { color: '#D4CAFF', fontSize: 12, fontWeight: '600' },
  miniPlayer: {
    position: 'absolute',
    bottom: 83,
    left: 18,
    right: 18,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FFFFFF25',
  },
  miniBlur: { flexDirection: 'row', alignItems: 'center', padding: 10 },
  miniArtwork: {
    width: 37,
    height: 37,
    borderRadius: 11,
    backgroundColor: '#51427F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniNote: { color: '#FFFFFF', fontSize: 22 },
  miniInfo: { flex: 1, marginHorizontal: 11 },
  miniTitle: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },
  miniArtist: { color: '#AAA5BE', fontSize: 9, marginTop: 4 },
  miniControl: { color: '#FFFFFF', fontSize: 18, paddingHorizontal: 7 },
  tabBar: {
    position: 'absolute',
    bottom: 8,
    left: 18,
    right: 18,
    borderRadius: 25,
    overflow: 'hidden',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    paddingBottom: 9,
    borderWidth: 1,
    borderColor: '#FFFFFF20',
  },
  tab: { flex: 1, alignItems: 'center', gap: 3 },
  tabIcon: { color: '#89869A', fontSize: 21 },
  tabLabel: { color: '#89869A', fontSize: 9 },
  activeTabText: { color: '#C7BAFF' },
  searchPanel: { paddingHorizontal: 22, marginTop: 30, marginBottom: 18 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#FFFFFF10',
    borderWidth: 1,
    borderColor: '#FFFFFF20',
  },
  searchSymbol: { color: '#B5A6FF', fontSize: 22, marginRight: 10 },
  searchPlaceholder: { color: '#A5A2B5', fontSize: 13 },
});
