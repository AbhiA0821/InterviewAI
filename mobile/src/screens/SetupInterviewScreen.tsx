import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { uploadResumePDF, startInterviewSession } from '../services/api';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type SetupScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MainTabs'>;

export default function SetupInterviewScreen({ navigation }: { navigation: SetupScreenNavigationProp }) {
  const [role, setRole] = useState<string>('Software Engineer');
  const [level, setLevel] = useState<string>('Senior');
  const [topic, setTopic] = useState<string>('Full Stack & System Design');
  const [resumeFileName, setResumeFileName] = useState<string>('');
  const [resumeSkills, setResumeSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setResumeFileName(file.name);
        setLoading(true);

        const parsed = await uploadResumePDF(file.uri, file.name);
        if (parsed.skills) {
          setResumeSkills(parsed.skills);
        }
        if (parsed.suggested_role) {
          setRole(parsed.suggested_role);
        }
      }
    } catch (err) {
      console.warn('Document picker error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartInterview = async () => {
    setLoading(true);
    try {
      const sessionData = await startInterviewSession({
        role,
        level,
        topic,
        resumeSkills,
      });
      navigation.navigate('LiveInterview', { sessionData });
    } catch (err) {
      console.warn('Start interview error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Interview Setup</Text>
        <Text style={styles.subtitle}>Customize your target role or upload a resume to tailor the AI interviewer.</Text>

        {/* Resume PDF Picker Box */}
        <TouchableOpacity style={styles.uploadBox} onPress={handlePickDocument}>
          <Text style={styles.uploadIcon}>📄</Text>
          <Text style={styles.uploadTitle}>
            {resumeFileName ? resumeFileName : 'Upload PDF Resume (Optional)'}
          </Text>
          <Text style={styles.uploadSub}>
            {resumeFileName ? 'Parsed & Extracted Skills' : 'Tap to select PDF resume for custom question generation'}
          </Text>

          {resumeSkills.length > 0 && (
            <View style={styles.skillsContainer}>
              {resumeSkills.map((skill, index) => (
                <View key={index} style={styles.skillBadge}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          )}
        </TouchableOpacity>

        {/* Role Input */}
        <Text style={styles.label}>Target Role</Text>
        <TextInput style={styles.input} value={role} onChangeText={setRole} placeholder="e.g. Frontend Lead" placeholderTextColor="#64748b" />

        {/* Experience Level Selector */}
        <Text style={styles.label}>Experience Level</Text>
        <View style={styles.levelRow}>
          {['Junior', 'Mid', 'Senior', 'Lead'].map((lvl) => (
            <TouchableOpacity
              key={lvl}
              style={[styles.levelChip, level === lvl && styles.levelChipActive]}
              onPress={() => setLevel(lvl)}
            >
              <Text style={[styles.levelChipText, level === lvl && styles.levelChipTextActive]}>{lvl}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tech Topic Input */}
        <Text style={styles.label}>Technical Topic Focus</Text>
        <TextInput style={styles.input} value={topic} onChangeText={setTopic} placeholder="e.g. React & System Design" placeholderTextColor="#64748b" />

        {/* Launch Interview Button */}
        <TouchableOpacity style={styles.launchButton} onPress={handleStartInterview} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.launchButtonText}>🚀 Launch Voice AI Interview</Text>
          )}
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
  uploadBox: {
    backgroundColor: '#0f172a',
    borderColor: '#10b981',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  uploadIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  uploadTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  uploadSub: {
    color: '#64748b',
    fontSize: 11,
    textAlign: 'center',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
    marginTop: 12,
  },
  skillBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10b981',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  skillText: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: '700',
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: '#cbd5e1',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#0f172a',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 20,
  },
  levelRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  levelChip: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  levelChipActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10b981',
  },
  levelChipText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '800',
  },
  levelChipTextActive: {
    color: '#34d399',
  },
  launchButton: {
    backgroundColor: '#10b981',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  launchButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
});
