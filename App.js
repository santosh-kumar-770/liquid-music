
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';

const tracks = [
  { id: '1', title: 'Midnight Memories', artist: 'Your music library', color: '#635B9A', duration: '3:42' },
  { id: '2', title: 'Ocean Eyes', artist: 'Your music library', color: '#356B82', duration: '3:20' },
  { id: '3', title: 'After Hours', artist: 'Your music library', color: '#874B66', duration: '4:01' },
];

export default function App() {
  const [selectedTab, setSelectedTab] = useState('Home');
  const [currentTrack, setCurrentTrack] = useState(tracks[0]);
  const [playing, setPlaying] = useState(false);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#09090D" />

      <LinearGradient
        colors={['#202035', '#101017', '#09090D']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safe}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>YOUR SOUND. YOUR SPACE.</Text>
              <Text style={styles.brand}>muzics<Text style={styles.brandDot}>.</Text></Text>
            </View>

            <BlurView intensity={35} tint="light" style={styles.profileGlass}>
              <Text style={styles.profileIcon}>♫</Text>
            </BlurView>
          </View>

          <View style={styles.greeting}>
            <Text style={styles.heading}>Feel every{'\n'}frequency.</Text>
            <Text style={styles.subtitle}>
              Your music, right here on your device.
            </Text>
          </View>

          <Pressable style={styles.hero} onPress={() => setPlaying(!playing)}>
            <LinearGradient
              colors={['#9A8AE8', '#55458E', '#24213E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroGradient}
            >
              <View style={styles.orbOne} />
              <View style={styles.orbTwo} />
              <Text style={styles.heroLabel}>NOW PLAYING</Text>
              <View style={styles.heroArtwork}>
                <Text style={styles.heroMusicNote}>♫</Text>
              </View>
              <Text style={styles.heroTitle}>{currentTrack.title}</Text>
              <Text style={styles.heroArtist}>{currentTrack.artist}</Text>
              <View style={styles.heroControls}>
                <Text style={styles.heroHint}>Your personal soundtrack</Text>
                <View style={styles.playButton}>
                  <Text style={styles.playIcon}>{playing ? 'Ⅱ' : '▶'}</Text>
                </View>
              </View>
            </LinearGradient>
          </Pressable>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your library</Text>
            <Pressable onPress={() => setSelectedTab('Library')}>
              <Text style={styles.seeAll}>See all ↗</Text>
            </Pressable>
          </View>

          <View style={styles.libraryCard}>
            <BlurView intensity={22} tint="light" style={styles.libraryBlur}>
              <View style={styles.libraryIcon}>
                <Text style={styles.folderIcon}>♫</Text>
              </View>
              <View style={styles.libraryCopy}>
                <Text style={styles.libraryTitle}>On this device</Text>
                <Text style={styles.librarySubtitle}>
                  Your offline music collection
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </BlurView>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Made for your mood</Text>
          </View>

          {tracks.map((track, index) => (
            <Pressable
              key={track.id}
              style={styles.trackRow}
              onPress={() => {
                setCurrentTrack(track);
                setPlaying(true);
              }}
            >
              <LinearGradient
                colors={[track.color, '#171720']}
                style={styles.trackArtwork}
              >
                <Text style={styles.trackNote}>♫</Text>
              </LinearGradient>
              <View style={styles.trackInfo}>
                <Text style={styles.trackTitle}>{track.title}</Text>
                <Text style={styles.trackArtist}>{track.artist}</Text>
              </View>
              <Text style={styles.trackDuration}>{track.duration}</Text>
              <Pressable
                hitSlop={10}
                onPress={() => {
                  setCurrentTrack(track);
                  setPlaying(!playing || currentTrack.id !== track.id);
                }}
              >
                <Text style={styles.moreIcon}>
                  {currentTrack.id === track.id && playing ? 'Ⅱ' : '▶'}
                </Text>
              </Pressable>
            </Pressable>
          ))}

          <View style={styles.footer}>
            <Text style={styles.footerText}>MADE FOR MUSIC LOVERS</Text>
            <Text style={styles.footerSubtext}>No cloud. Just your music.</Text>
          </View>
        </ScrollView>

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
              onPress={() => setSelectedTab(tab.name)}
            >
              <Text style={[
                styles.tabIcon,
                selectedTab === tab.name && styles.activeTabText,
              ]}>
                {tab.icon}
              </Text>
              <Text style={[
                styles.tabLabel,
                selectedTab === tab.name && styles.activeTabText,
              ]}>
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
  content: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 125 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { color: '#A5A0BC', fontSize: 9, letterSpacing: 3, fontWeight: '700' },
  brand: { color: '#FFFFFF', fontSize: 31, fontWeight: '800', letterSpacing: -1.5 },
  brandDot: { color: '#B4A5FF' },
  profileGlass: { width: 45, height: 45, borderRadius: 23, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FFFFFF25' },
  profileIcon: { color: '#FFFFFF', fontSize: 23 },
  greeting: { marginTop: 34, marginBottom: 24 },
  heading: { color: '#FFFFFF', fontSize: 39, lineHeight: 43, fontWeight: '700', letterSpacing: -1.8 },
  subtitle: { color: '#A5A2B5', fontSize: 13, marginTop: 12 },
  hero: { borderRadius: 29, overflow: 'hidden', marginBottom: 32 },
  heroGradient: { padding: 23, minHeight: 280, overflow: 'hidden' },
  orbOne: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: '#FFFFFF12', top: -80, right: -35 },
  orbTwo: { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: '#B8A7FF18', bottom: -60, left: -40 },
  heroLabel: { color: '#E0D9FF', fontSize: 9, letterSpacing: 2.5, fontWeight: '700' },
  heroArtwork: { width: 94, height: 94, alignSelf: 'center', marginTop: 15, marginBottom: 12, borderRadius: 26, backgroundColor: '#FFFFFF20', borderColor: '#FFFFFF35', borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  heroMusicNote: { color: '#FFFFFF', fontSize: 53 },
  heroTitle: { color: '#FFFFFF', fontSize: 21, fontWeight: '700', textAlign: 'center' },
  heroArtist: { color: '#E0D9F4', fontSize: 12, textAlign: 'center', marginTop: 4 },
  heroControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 17 },
  heroHint: { color: '#E0D9F4', fontSize: 11 },
  playButton: { width: 43, height: 43, backgroundColor: '#FFFFFF', borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  playIcon: { color: '#26213B', fontSize: 17, fontWeight: '800' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
  sectionTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', letterSpacing: -0.4 },
  seeAll: { color: '#B5A6FF', fontSize: 12, fontWeight: '600' },
  libraryCard: { borderRadius: 20, overflow: 'hidden', marginBottom: 32, borderWidth: 1, borderColor: '#FFFFFF12' },
  libraryBlur: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  libraryIcon: { width: 48, height: 48, borderRadius: 15, backgroundColor: '#A99AFF22', alignItems: 'center', justifyContent: 'center' },
  folderIcon: { color: '#C3B8FF', fontSize: 26 },
  libraryCopy: { flex: 1, marginLeft: 13 },
  libraryTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  librarySubtitle: { color: '#9D9BAF', fontSize: 11, marginTop: 5 },
  chevron: { color: '#B3ADC8', fontSize: 28 },
  trackRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 17 },
  trackArtwork: { width: 51, height: 51, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  trackNote: { color: '#FFFFFF', fontSize: 27 },
  trackInfo: { flex: 1, marginLeft: 13 },
  trackTitle: { color: '#F7F6FA', fontSize: 13, fontWeight: '600' },
  trackArtist: { color: '#9996AA', fontSize: 11, marginTop: 5 },
  trackDuration: { color: '#89869A', fontSize: 10, marginRight: 15 },
  moreIcon: { color: '#E4DFFF', fontSize: 17, width: 22, textAlign: 'center' },
  footer: { alignItems: 'center', marginTop: 25, marginBottom: 20 },
  footerText: { color: '#716D85', fontSize: 9, letterSpacing: 2 },
  footerSubtext: { color: '#A5A0B5', fontSize: 11, marginTop: 8 },
  tabBar: { position: 'absolute', bottom: 10, left: 18, right: 18, borderRadius: 25, overflow: 'hidden', flexDirection: 'row', justifyContent: 'space-around', paddingTop: 13, paddingBottom: 10, borderWidth: 1, borderColor: '#FFFFFF20' },
  tab: { flex: 1, alignItems: 'center', gap: 4 },
  tabIcon: { color: '#89869A', fontSize: 22 },
  tabLabel: { color: '#89869A', fontSize: 9, fontWeight: '500' },
  activeTabText: { color: '#C7BAFF' },
});
