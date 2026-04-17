import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import NavigationBar from '@/components/navigationBar';
import { useAuth } from '@/contexts/AuthContext';
import { getLeaderboard } from '@/apis/user.api';

// ─── Types ───────────────────────────────────────────────────────────────────

type Tab = 'by_kilometers' | 'by_hours' | 'by_pace';

interface KmEntry {
  rank: number;
  user_id: number;
  user_name: string;
  profile_picture: string | null;
  total_distance_km: number;
}

interface HoursEntry {
  rank: number;
  user_id: number;
  user_name: string;
  profile_picture: string | null;
  total_seconds: number;
  total_hours: string;
}

interface PaceEntry {
  rank: number;
  user_id: number;
  user_name: string;
  profile_picture: string | null;
  avg_pace: string;
  pace_seconds_per_km: number;
}

interface LeaderboardData {
  by_kilometers: KmEntry[];
  by_hours: HoursEntry[];
  by_pace: PaceEntry[];
}



// ─── Constants ───────────────────────────────────────────────────────────────

const PRIMARY_GREEN = '#11CF6A';
const SECONDARY_GREEN = '#278E50';
const BG = '#F9F9F9';
const WHITE = '#FFFFFF';
const GRAY_MEDIUM = '#7C7D82';
const GRAY_LIGHT = '#EAEAEA';
const GRAY_DARK = '#292A2E';
const NAVY = '#2D3C52';

const GOLD = '#FFD25F';
const SILVER = '#C0C4CC';
const BRONZE = '#D4885A';

const MEDAL = [GOLD, SILVER, BRONZE];
const PLATFORM_H = [80, 58, 44];

const CONFETTI_COLORS = ['#11CF6A', '#FFD25F', '#FF6B6B', '#4ECDC4', '#A78BFA', '#F97316', '#278E50', '#60A5FA'];
const CONFETTI_COUNT = 24;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TABS: { key: Tab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'by_kilometers', label: 'Distância', icon: 'map-outline' },
  { key: 'by_hours',      label: 'Tempo',     icon: 'time-outline' },
  { key: 'by_pace',       label: 'Ritmo',     icon: 'speedometer-outline' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getEntryValue = (entry: any, tab: Tab): string => {
  if (tab === 'by_kilometers') return `${Number(entry.total_distance_km).toFixed(1)} km`;
  if (tab === 'by_hours') return entry.total_hours;
  if (tab === 'by_pace') return entry.avg_pace;
  return '';
};

const getEntryLabel = (tab: Tab): string => {
  if (tab === 'by_kilometers') return 'distância total';
  if (tab === 'by_hours') return 'tempo total';
  if (tab === 'by_pace') return 'ritmo médio';
  return '';
};

const firstName = (name: string) => name?.split(' ')[0] ?? name;

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const SkeletonBox = ({ width, height, borderRadius = 8, style }: {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
}) => {
  const opacity = useRef(new Animated.Value(0.35)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 650, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.35, duration: 650, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);
  return (
    <Animated.View
      style={[{ width, height, borderRadius, backgroundColor: '#E8E8E8', opacity }, style]}
    />
  );
};

const SkeletonPodiumItem = ({ isPrimary }: { isPrimary: boolean }) => {
  const avatarSize = isPrimary ? 62 : 48;
  const platformH = isPrimary ? 80 : 58;
  return (
    <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 4 }}>
      <SkeletonBox width={avatarSize} height={avatarSize} borderRadius={avatarSize / 2} style={{ marginBottom: 8 }} />
      <SkeletonBox width={60} height={10} borderRadius={5} style={{ marginBottom: 6 }} />
      <SkeletonBox width={44} height={9} borderRadius={5} style={{ marginBottom: 8 }} />
      <SkeletonBox width={'100%'} height={platformH} borderRadius={0} />
    </View>
  );
};

const SkeletonRow = () => (
  <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 }}>
    <SkeletonBox width={22} height={14} borderRadius={4} />
    <SkeletonBox width={40} height={40} borderRadius={20} />
    <View style={{ flex: 1, gap: 6 }}>
      <SkeletonBox width={'70%'} height={12} borderRadius={5} />
      <SkeletonBox width={'40%'} height={10} borderRadius={5} />
    </View>
    <SkeletonBox width={52} height={12} borderRadius={5} />
  </View>
);

const LeaderboardSkeleton = () => (
  <>
    <View style={[styles.podiumWrapper, { paddingTop: 20 }]}>
      <View style={styles.podiumRow}>
        <SkeletonPodiumItem isPrimary={false} />
        <SkeletonPodiumItem isPrimary={true} />
        <SkeletonPodiumItem isPrimary={false} />
      </View>
      <SkeletonBox width={'50%'} height={10} borderRadius={5} style={{ alignSelf: 'center', marginVertical: 10 }} />
    </View>
    <View style={styles.listCard}>
      <SkeletonBox width={120} height={11} borderRadius={5} style={{ margin: 16 }} />
      {[...Array(5)].map((_, i) => (
        <React.Fragment key={i}>
          {i > 0 && <View style={styles.divider} />}
          <SkeletonRow />
        </React.Fragment>
      ))}
    </View>
  </>
);

// ─── Confetti ─────────────────────────────────────────────────────────────────

const Confetti = ({ active }: { active: boolean }) => {
  const particles = useRef(
    Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
      translateY: new Animated.Value(-40),
      opacity: new Animated.Value(0),
      rotate: new Animated.Value(0),
      x: (SCREEN_WIDTH / CONFETTI_COUNT) * i + Math.random() * (SCREEN_WIDTH / CONFETTI_COUNT),
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      size: 7 + (i % 4),
      wide: i % 3 === 0,
    }))
  ).current;

  useEffect(() => {
    if (!active) return;
    const anims = particles.map((p, i) => {
      p.translateY.setValue(-40 - (i % 5) * 20);
      p.opacity.setValue(1);
      p.rotate.setValue(0);
      const duration = 1800 + (i % 6) * 200;
      const delay = (i % 8) * 60;
      return Animated.parallel([
        Animated.timing(p.translateY, { toValue: 680, duration, delay, useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(duration * 0.65 + delay),
          Animated.timing(p.opacity, { toValue: 0, duration: 350, useNativeDriver: true }),
        ]),
        Animated.timing(p.rotate, { toValue: i % 2 === 0 ? 4 : -4, duration, delay, useNativeDriver: true }),
      ]);
    });
    const master = Animated.parallel(anims);
    master.start();
    return () => master.stop();
  }, [active]);

  if (!active) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p, i) => {
        const rotate = p.rotate.interpolate({ inputRange: [-4, 4], outputRange: ['-180deg', '180deg'] });
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: p.x,
              top: 0,
              width: p.wide ? p.size * 1.8 : p.size,
              height: p.wide ? p.size * 0.6 : p.size,
              borderRadius: 2,
              backgroundColor: p.color,
              opacity: p.opacity,
              transform: [{ translateY: p.translateY }, { rotate }],
            }}
          />
        );
      })}
    </View>
  );
};

// ─── Sub-components ──────────────────────────────────────────────────────────

interface AvatarProps {
  url: string | null;
  name: string;
  size?: number;
  fontSize?: number;
  borderColor?: string;
  borderWidth?: number;
}

const Avatar = ({ url, name, size = 44, fontSize = 16, borderColor, borderWidth = 0 }: AvatarProps) => {
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  const borderStyle = borderColor
    ? { borderWidth, borderColor, borderRadius: (size + borderWidth * 2) / 2 }
    : {};

  const inner = url ? (
    <ExpoImage
      source={{ uri: url }}
      style={{ width: size, height: size, borderRadius: size / 2 }}
      contentFit="cover"
    />
  ) : (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: PRIMARY_GREEN,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: WHITE, fontFamily: 'Inter-Bold', fontSize }}>{initial}</Text>
    </View>
  );

  if (borderColor) {
    return (
      <View
        style={{
          padding: borderWidth,
          borderRadius: (size + borderWidth * 2) / 2,
          backgroundColor: borderColor,
        }}
      >
        {inner}
      </View>
    );
  }

  return inner;
};

// ─── Podium ───────────────────────────────────────────────────────────────────

interface PodiumItemProps {
  entry: any;
  tab: Tab;
  rank: 1 | 2 | 3;
}

const PodiumItem = ({ entry, tab, rank }: PodiumItemProps) => {
  const idx = rank - 1;
  const medalColor = MEDAL[idx];
  const platformH = PLATFORM_H[idx];
  const avatarSize = rank === 1 ? 62 : 48;
  const avatarFontSize = rank === 1 ? 24 : 18;

  const platformColors: [string, string] =
    rank === 1
      ? ['#FFE177', '#F4B01E']
      : rank === 2
      ? ['#D8DCE6', '#A9ADB8']
      : ['#E8AA7A', '#C06030'];

  return (
    <View style={[styles.podiumCol, rank === 1 && styles.podiumColFirst]}>
      {rank === 1 && (
        <Ionicons name="trophy" size={20} color={GOLD} style={{ marginBottom: 6 }} />
      )}
      <Avatar
        url={entry.profile_picture}
        name={entry.user_name}
        size={avatarSize}
        fontSize={avatarFontSize}
        borderColor={medalColor}
        borderWidth={2}
      />
      <Text style={[styles.podiumName, rank === 1 && styles.podiumNameFirst]} numberOfLines={1}>
        {firstName(entry.user_name)}
      </Text>
      <Text style={[styles.podiumValue, rank === 1 && styles.podiumValueFirst]} numberOfLines={1}>
        {getEntryValue(entry, tab)}
      </Text>
      <LinearGradient
        colors={platformColors}
        style={[styles.platform, { height: platformH }]}
      >
        <Text style={styles.platformNum}>{rank}</Text>
      </LinearGradient>
    </View>
  );
};

// ─── Rank Row ─────────────────────────────────────────────────────────────────

interface RankRowProps {
  entry: any;
  tab: Tab;
}

const RankRow = ({ entry, tab }: RankRowProps) => (
  <View style={styles.rankRow}>
    <Text style={styles.rankNum}>{entry.rank}</Text>
    <Avatar url={entry.profile_picture} name={entry.user_name} size={40} fontSize={15} />
    <Text style={styles.rankName} numberOfLines={1}>
      {entry.user_name}
    </Text>
    <Text style={styles.rankValue}>{getEntryValue(entry, tab)}</Text>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

const LeaderboardScreen = () => {
  const navigation = useNavigation<any>();
  const { jwt } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>('by_kilometers');
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const fetchLeaderboard = useCallback(async () => {
    if (!jwt) return;
    try {
      setLoading(true);
      setError(null);
      const result = await getLeaderboard(jwt);
      setData(result.data);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3200);
    } catch (e: any) {
      setError(e?.message || 'Erro ao buscar ranking');
    } finally {
      setLoading(false);
    }
  }, [jwt]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const currentList: any[] = data ? (data[activeTab] ?? []) : [];
  const top3 = currentList.slice(0, 3);
  const rest = currentList.slice(3);

  // podium visual order: 2nd | 1st | 3rd
  const podiumOrder: [any | null, any | null, any | null] = [
    top3[1] ?? null,
    top3[0] ?? null,
    top3[2] ?? null,
  ];
  const podiumRanks: [2, 1, 3] = [2, 1, 3];

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={WHITE} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Image
            source={require('@/assets/icons/arrow-right.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <View style={styles.headerBtn} />
      </View>

      {/* ── Tabs ── */}
      <View style={styles.tabRow}>
        {TABS.map(tab => {
          const active = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabPill, active && styles.tabPillActive]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={tab.icon}
                size={13}
                color={active ? WHITE : GRAY_MEDIUM}
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Content ── */}
      {loading ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <LeaderboardSkeleton />
        </ScrollView>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={52} color={SILVER} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchLeaderboard} activeOpacity={0.8}>
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : currentList.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="trophy-outline" size={64} color={GRAY_LIGHT} />
          <Text style={styles.emptyText}>Nenhuma classificação disponível</Text>
          <Text style={styles.emptySubText}>Complete corridas para aparecer no ranking</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Podium ── */}
          {top3.length > 0 && (
            <View style={styles.podiumWrapper}>
              <View style={styles.podiumRow}>
                {podiumOrder.map((entry, i) => {
                  if (!entry) return <View key={i} style={{ flex: 1 }} />;
                  return (
                    <PodiumItem
                      key={entry.user_id}
                      entry={entry}
                      tab={activeTab}
                      rank={podiumRanks[i]}
                    />
                  );
                })}
              </View>
              <Text style={styles.podiumLabel}>
                Ranking por {getEntryLabel(activeTab)}
              </Text>
            </View>
          )}

          {/* ── Rest of list ── */}
          {rest.length > 0 && (
            <View style={styles.listCard}>
              <Text style={styles.listHeader}>Outros classificados</Text>
              {rest.map((entry, i) => (
                <React.Fragment key={entry.user_id}>
                  {i > 0 && <View style={styles.divider} />}
                  <RankRow entry={entry} tab={activeTab} />
                </React.Fragment>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* ── Nav Bar ── */}
      <View style={styles.navBar}>
        <NavigationBar />
      </View>

      {/* ── Confetti ── */}
      <Confetti active={showConfetti} />
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: WHITE,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: WHITE,
  },
  headerBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: 22,
    height: 22,
    transform: [{ rotate: '180deg' }],
    tintColor: GRAY_DARK,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: 'Inter-SemiBold',
    color: GRAY_DARK,
  },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: WHITE,
    borderRadius: 12,
    padding: 4,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  tabPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 9,
  },
  tabPillActive: {
    backgroundColor: SECONDARY_GREEN,
  },
  tabLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: GRAY_MEDIUM,
  },
  tabLabelActive: {
    color: WHITE,
    fontFamily: 'Inter-SemiBold',
  },

  // States
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: GRAY_MEDIUM,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: GRAY_DARK,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: GRAY_MEDIUM,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 4,
    backgroundColor: PRIMARY_GREEN,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: WHITE,
  },

  // Scroll
  scrollContent: {
    paddingBottom: 100,
    paddingTop: 8,
  },

  // Podium wrapper
  podiumWrapper: {
    marginHorizontal: 16,
    backgroundColor: WHITE,
    borderRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
  podiumRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  podiumLabel: {
    textAlign: 'center',
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: GRAY_MEDIUM,
    paddingVertical: 10,
  },

  // Podium columns
  podiumCol: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  podiumColFirst: {
    // first place is naturally taller due to platform height
  },
  podiumName: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: GRAY_DARK,
    marginTop: 6,
    marginBottom: 2,
    textAlign: 'center',
  },
  podiumNameFirst: {
    fontSize: 13,
    fontFamily: 'Inter-Bold',
  },
  podiumValue: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: GRAY_MEDIUM,
    marginBottom: 8,
    textAlign: 'center',
  },
  podiumValueFirst: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: SECONDARY_GREEN,
  },
  platform: {
    width: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  platformNum: {
    fontSize: 22,
    fontFamily: 'Inter-Black',
    color: WHITE,
    opacity: 0.9,
  },

  // Rank list
  listCard: {
    marginHorizontal: 16,
    backgroundColor: WHITE,
    borderRadius: 20,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  listHeader: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: GRAY_MEDIUM,
    paddingHorizontal: 16,
    paddingVertical: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  divider: {
    height: 1,
    backgroundColor: GRAY_LIGHT,
    marginHorizontal: 16,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  rankNum: {
    width: 22,
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: GRAY_MEDIUM,
    textAlign: 'center',
  },
  rankName: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: GRAY_DARK,
  },
  rankValue: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: SECONDARY_GREEN,
  },

  // Nav bar
  navBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default LeaderboardScreen;
