import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type FeedbackRouteProp = RouteProp<RootStackParamList, 'Feedback'>;
type FeedbackNavProp = StackNavigationProp<RootStackParamList, 'Feedback'>;

export default function FeedbackScreen({
  route,
  navigation,
}: {
  route: FeedbackRouteProp;
  navigation: FeedbackNavProp;
}) {
  const feedbackData = route.params?.feedbackData || {
    overallScore: 88,
    metrics: [
      { name: 'Technical Depth & Accuracy', score: 90 },
      { name: 'STAR Method Structure', score: 85 },
      { name: 'System Design Tradeoffs', score: 88 },
      { name: 'Communication & Clarity', score: 92 },
      { name: 'Problem Solving Speed', score: 84 },
    ],
    summary: 'Strong technical articulation of FastAPI and React architecture. Excellent breakdown of microservices trade-offs.',
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Badge */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>14-METRIC AI EVALUATION REPORT</Text>
        </View>

        {/* Overall Score Circle Card */}
        <View style={styles.scoreCard}>
          <Text style={styles.scoreTitle}>Overall Candidate Score</Text>
          <Text style={styles.scoreValue}>{feedbackData.overallScore}%</Text>
          <Text style={styles.scoreGrade}>Grade: Exceptional (A)</Text>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardHeader}>💡 AI Executive Summary</Text>
          <Text style={styles.summaryText}>{feedbackData.summary}</Text>
        </View>

        {/* 14-Metric Scoring Breakdown */}
        <Text style={styles.sectionHeader}>Detailed Scoring Rubric</Text>

        {feedbackData.metrics.map((metric: any, index: number) => (
          <View key={index} style={styles.metricItem}>
            <View style={styles.metricRow}>
              <Text style={styles.metricName}>{metric.name}</Text>
              <Text style={styles.metricScore}>{metric.score}%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${metric.score}%` }]} />
            </View>
          </View>
        ))}

        {/* Return Button */}
        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => navigation.replace('MainTabs')}
        >
          <Text style={styles.doneButtonText}>Done & Save to History</Text>
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
  badge: {
    alignSelf: 'center',
    backgroundColor: 'rgba(6, 78, 59, 0.8)',
    borderColor: '#10b981',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 14,
    marginBottom: 16,
  },
  badgeText: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '900',
  },
  scoreCard: {
    backgroundColor: '#0f172a',
    borderColor: '#10b981',
    borderWidth: 2,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#94a3b8',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '900',
    color: '#34d399',
  },
  scoreGrade: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderColor: '#1e293b',
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  cardHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 13,
    color: '#cbd5e1',
    lineHeight: 20,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 14,
  },
  metricItem: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metricName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
  metricScore: {
    fontSize: 13,
    fontWeight: '900',
    color: '#34d399',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#1e293b',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10b981',
  },
  doneButton: {
    backgroundColor: '#10b981',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  doneButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
});
