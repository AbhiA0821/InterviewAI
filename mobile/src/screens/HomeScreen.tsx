import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../navigation/AppNavigator';

type HomeScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Home'>;

export default function HomeScreen({ navigation }: { navigation: HomeScreenNavigationProp }) {
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Welcome Card */}
        <View style={styles.welcomeCard}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>AI INTERVIEW DASHBOARD</Text>
          </View>
          <Text style={styles.greeting}>
            Hello, <Text style={styles.highlight}>{user?.displayName || 'Candidate'}</Text>
          </Text>
          <Text style={styles.subtext}>
            Ready for your next mock technical interview? Select a role or upload your resume to generate tailored questions.
          </Text>

          <TouchableOpacity style={styles.startCtaButton} onPress={() => navigation.navigate('Setup')}>
            <Text style={styles.startCtaText}>🎙️ Start Voice AI Interview</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <Text style={styles.sectionHeader}>Performance Overview</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>14</Text>
            <Text style={styles.statLabel}>AI Evaluation Metrics</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>92%</Text>
            <Text style={styles.statLabel}>Avg STAR Score</Text>
          </View>
        </View>

        {/* Recent Topics Card */}
        <Text style={styles.sectionHeader}>Quick Practice Topics</Text>
        <TouchableOpacity style={styles.topicCard} onPress={() => navigation.navigate('Setup')}>
          <Text style={styles.topicIcon}>⚡</Text>
          <View style={styles.topicInfo}>
            <Text style={styles.topicTitle}>System Design & Architecture</Text>
            <Text style={styles.topicSub}>Scalability, Caching, Databases</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.topicCard} onPress={() => navigation.navigate('Setup')}>
          <Text style={styles.topicIcon}>💻</Text>
          <View style={styles.topicInfo}>
            <Text style={styles.topicTitle}>Full Stack React & FastAPI</Text>
            <Text style={styles.topicSub}>Async IO, State Management, APIs</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  scrollContent: {
    padding: 20,
  },
  welcomeCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 24,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderWidth: 1,
    padding: 24,
    marginBottom: 24,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(6, 78, 59, 0.8)',
    borderColor: '#10b981',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    marginBottom: 12,
  },
  badgeText: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: '800',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 8,
  },
  highlight: {
    color: '#34d399',
  },
  subtext: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 20,
    marginBottom: 20,
  },
  startCtaButton: {
    backgroundColor: '#10b981',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  startCtaText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 26,
    fontWeight: '900',
    color: '#34d399',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '700',
  },
  topicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  topicIcon: {
    fontSize: 24,
    marginRight: 14,
  },
  topicInfo: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 2,
  },
  topicSub: {
    fontSize: 12,
    color: '#64748b',
  },
});
