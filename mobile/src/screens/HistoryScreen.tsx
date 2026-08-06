import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type HistoryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MainTabs'>;

interface InterviewHistoryItem {
  id: string;
  role: string;
  topic: string;
  date: string;
  score: number;
}

export default function HistoryScreen({ navigation }: { navigation: HistoryScreenNavigationProp }) {
  const historyList: InterviewHistoryItem[] = [
    {
      id: 'sess_101',
      role: 'Senior Software Engineer',
      topic: 'Full Stack & FastAPI Microservices',
      date: 'Aug 6, 2026',
      score: 88,
    },
    {
      id: 'sess_102',
      role: 'System Architect',
      topic: 'Distributed Systems & Caching',
      date: 'Aug 4, 2026',
      score: 92,
    },
    {
      id: 'sess_103',
      role: 'Frontend Lead',
      topic: 'React Native & Mobile Performance',
      date: 'Aug 1, 2026',
      score: 85,
    },
  ];

  const handleReview = (item: InterviewHistoryItem) => {
    navigation.navigate('Feedback', {
      feedbackData: {
        overallScore: item.score,
        metrics: [
          { name: 'Technical Depth', score: item.score },
          { name: 'STAR Method Structure', score: item.score - 3 },
          { name: 'System Design Tradeoffs', score: item.score + 2 },
        ],
        summary: `Review for ${item.role} session on ${item.topic}. Demonstrated solid architectural understanding.`,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Interview History</Text>
        <Text style={styles.subtitle}>Review your past voice AI practice sessions and scores.</Text>

        {historyList.map((item) => (
          <TouchableOpacity key={item.id} style={styles.historyCard} onPress={() => handleReview(item)}>
            <View style={styles.cardHeader}>
              <View style={styles.roleBox}>
                <Text style={styles.roleText}>{item.role}</Text>
                <Text style={styles.dateText}>{item.date}</Text>
              </View>

              <View style={styles.scoreBadge}>
                <Text style={styles.scoreText}>{item.score}%</Text>
              </View>
            </View>

            <Text style={styles.topicText}>Focus: {item.topic}</Text>
          </TouchableOpacity>
        ))}
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
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 20,
  },
  historyCard: {
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roleBox: {
    flex: 1,
  },
  roleText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  dateText: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  scoreBadge: {
    backgroundColor: 'rgba(6, 78, 59, 0.8)',
    borderColor: '#10b981',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  scoreText: {
    color: '#34d399',
    fontSize: 14,
    fontWeight: '900',
  },
  topicText: {
    fontSize: 12,
    color: '#cbd5e1',
  },
});
