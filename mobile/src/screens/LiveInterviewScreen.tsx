import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  AppState,
} from 'react-native';
import { audioService } from '../services/audioService';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type LiveInterviewRouteProp = RouteProp<RootStackParamList, 'LiveInterview'>;
type LiveInterviewNavProp = StackNavigationProp<RootStackParamList, 'LiveInterview'>;

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export default function LiveInterviewScreen({
  route,
  navigation,
}: {
  route: LiveInterviewRouteProp;
  navigation: LiveInterviewNavProp;
}) {
  const sessionData = route.params?.sessionData || {};

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [proctorWarning, setProctorWarning] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: sessionData.initial_question || 'Welcome to the interview! Can you tell me about your technical background?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Proctoring focus tracking listener
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState !== 'active') {
        setProctorWarning(true);
      }
    });
    return () => subscription.remove();
  }, []);

  const handleToggleRecording = async () => {
    if (isRecording) {
      // Stop recording and process transcript
      setLoading(true);
      const uri = await audioService.stopRecording();
      setIsRecording(false);

      // Add user transcript message
      const userText = 'In my previous project, I designed a microservices architecture using FastAPI and React with PostgreSQL, ensuring sub-100ms response times.';
      const newMsg: Message = {
        id: Date.now().toString(),
        sender: 'user',
        text: userText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, newMsg]);

      // Simulate AI follow-up response
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: 'Great STAR-method breakdown! How did you handle cache invalidation and database connection pooling under high traffic loads?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiResponse]);
        setLoading(false);
      }, 1500);
    } else {
      // Start recording
      try {
        await audioService.startRecording();
        setIsRecording(true);
      } catch (err) {
        console.warn('Mic error:', err);
      }
    }
  };

  const handleFinishInterview = () => {
    audioService.cleanup();
    const feedbackData = {
      overallScore: 88,
      metrics: [
        { name: 'Technical Depth', score: 90 },
        { name: 'STAR Method Structure', score: 85 },
        { name: 'System Design Tradeoffs', score: 88 },
        { name: 'Communication Clarity', score: 92 },
      ],
      summary: 'Strong technical articulation of FastAPI and React architecture. Great breakdown of microservices tradeoffs.',
    };
    navigation.replace('Feedback', { feedbackData });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Session Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.sessionTitle}>{sessionData.role || 'Senior Engineer'}</Text>
          <Text style={styles.sessionSub}>{sessionData.topic || 'Full Stack & System Design'}</Text>
        </View>
        <TouchableOpacity style={styles.endButton} onPress={handleFinishInterview}>
          <Text style={styles.endButtonText}>Finish Interview</Text>
        </TouchableOpacity>
      </View>

      {/* Proctoring Warning Banner */}
      {proctorWarning && (
        <View style={styles.proctorBanner}>
          <Text style={styles.proctorText}>⚠️ Session Proctor Notice: App focus change detected.</Text>
        </View>
      )}

      {/* Conversation Stream */}
      <ScrollView style={styles.chatContainer} contentContainerStyle={styles.chatContent}>
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.messageBubble,
              msg.sender === 'user' ? styles.userBubble : styles.aiBubble,
            ]}
          >
            <Text style={styles.senderLabel}>
              {msg.sender === 'ai' ? '🤖 AI Interrogator (Abhi)' : '👤 Candidate (You)'}
            </Text>
            <Text style={styles.messageText}>{msg.text}</Text>
            <Text style={styles.timestamp}>{msg.timestamp}</Text>
          </View>
        ))}

        {loading && (
          <View style={styles.aiLoadingBubble}>
            <ActivityIndicator color="#34d399" />
            <Text style={styles.aiLoadingText}>AI Interrogator evaluating your response...</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Voice Controller */}
      <View style={styles.controllerBox}>
        {/* Audio Frequency Visualizer Simulation */}
        {isRecording && (
          <View style={styles.visualizerRow}>
            <View style={[styles.visBar, { height: 24 }]} />
            <View style={[styles.visBar, { height: 40 }]} />
            <View style={[styles.visBar, { height: 18 }]} />
            <View style={[styles.visBar, { height: 32 }]} />
            <View style={[styles.visBar, { height: 28 }]} />
          </View>
        )}

        <TouchableOpacity
          style={[styles.micButton, isRecording && styles.micButtonActive]}
          onPress={handleToggleRecording}
          activeOpacity={0.8}
        >
          <Text style={styles.micIcon}>{isRecording ? '⏹️' : '🎙️'}</Text>
        </TouchableOpacity>
        <Text style={styles.micStatusText}>
          {isRecording ? 'Tap to Stop & Send Answer' : 'Tap Mic to Start Speaking'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    backgroundColor: '#090d16',
  },
  headerLeft: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
  },
  sessionSub: {
    fontSize: 11,
    color: '#34d399',
    fontWeight: '700',
  },
  endButton: {
    backgroundColor: 'rgba(225, 29, 72, 0.2)',
    borderColor: 'rgba(225, 29, 72, 0.5)',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  endButtonText: {
    color: '#fda4af',
    fontSize: 12,
    fontWeight: '800',
  },
  proctorBanner: {
    backgroundColor: 'rgba(180, 83, 9, 0.8)',
    padding: 8,
    alignItems: 'center',
  },
  proctorText: {
    color: '#fef3c7',
    fontSize: 11,
    fontWeight: '800',
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    gap: 14,
  },
  messageBubble: {
    borderRadius: 20,
    padding: 16,
    maxWidth: '88%',
  },
  aiBubble: {
    backgroundColor: '#0f172a',
    borderColor: 'rgba(16, 185, 129, 0.4)',
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  userBubble: {
    backgroundColor: 'rgba(6, 78, 59, 0.6)',
    borderColor: '#10b981',
    borderWidth: 1,
    alignSelf: 'flex-end',
  },
  senderLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    marginBottom: 6,
  },
  messageText: {
    fontSize: 14,
    color: '#ffffff',
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  aiLoadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#0f172a',
    padding: 14,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  aiLoadingText: {
    color: '#34d399',
    fontSize: 12,
    fontWeight: '700',
  },
  controllerBox: {
    backgroundColor: '#090d16',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingVertical: 20,
    alignItems: 'center',
  },
  visualizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    height: 40,
  },
  visBar: {
    width: 6,
    backgroundColor: '#34d399',
    borderRadius: 3,
  },
  micButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#10b981',
    shadowRadius: 10,
    shadowOpacity: 0.5,
  },
  micButtonActive: {
    backgroundColor: '#ef4444',
  },
  micIcon: {
    fontSize: 28,
  },
  micStatusText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },
});
