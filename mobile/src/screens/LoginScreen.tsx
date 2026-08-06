import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { loginWithGoogle, updateDisplayName, loading } = useAuth();
  const [error, setError] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [usernameInput, setUsernameInput] = useState<string>('Candidate');

  const handleGooglePress = async () => {
    setError('');
    try {
      await loginWithGoogle();
      setShowModal(true);
    } catch (err: any) {
      setError(err?.message || 'Google authentication failed');
    }
  };

  const handleSaveUsername = async () => {
    if (!usernameInput.trim()) {
      setError('Please enter a valid display name.');
      return;
    }
    try {
      await updateDisplayName(usernameInput.trim());
      setShowModal(false);
    } catch (err: any) {
      setError('Failed to update username.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Background Lights / Glow Effect */}
        <View style={styles.glowTopLeft} />
        <View style={styles.glowBottomRight} />

        {/* Card Container */}
        <View style={styles.card}>
          {/* Security Badge */}
          <View style={styles.securityBadge}>
            <Text style={styles.securityBadgeText}>🛡️ Google OAuth 2.0 Security</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>
            Welcome to{' '}
            <Text style={styles.gradientTitle}>Interview with Abhi</Text>
          </Text>

          <Text style={styles.subtitle}>
            Sign in with your Google account to start 1-on-1 AI voice mock interviews with real-time scoring.
          </Text>

          {/* Error Feedback */}
          {!!error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          )}

          {/* Google Sign-In Button */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGooglePress}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#34d399" />
            ) : (
              <View style={styles.googleButtonContent}>
                <View style={styles.googleIconContainer}>
                  <Text style={styles.googleG}>G</Text>
                </View>
                <View style={styles.googleButtonTextContainer}>
                  <Text style={styles.googleButtonTitle}>Sign in with Google</Text>
                  <Text style={styles.googleButtonSub}>Select your Google Account</Text>
                </View>
                <View style={styles.googleTag}>
                  <Text style={styles.googleTagText}>OAuth 2.0</Text>
                </View>
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.footerNote}>
            🔒 100% Free & End-to-End Encrypted Authentication
          </Text>
        </View>

        {/* Feature Overview Card */}
        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>✨ AI Interview Platform</Text>
          <Text style={styles.featureText}>
            Practice STAR-method structured technical questions, receive 14-metric evaluation rubrics, and boost your technical interview confidence.
          </Text>
        </View>
      </ScrollView>

      {/* Username Setup Modal */}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Candidate Username</Text>
            <Text style={styles.modalSub}>
              This display name will be stored in your database profile for interview scoring.
            </Text>

            <TextInput
              style={styles.textInput}
              value={usernameInput}
              onChangeText={setUsernameInput}
              placeholder="e.g. Abhishek candidate"
              placeholderTextColor="#64748b"
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveUsername}>
              <Text style={styles.saveButtonText}>Save & Start Interviewing</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 32,
    justifyContent: 'center',
  },
  glowTopLeft: {
    position: 'absolute',
    top: -50,
    left: -50,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  glowBottomRight: {
    position: 'absolute',
    bottom: -50,
    right: -50,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(20, 184, 166, 0.12)',
  },
  card: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.8)',
    padding: 24,
    marginBottom: 20,
  },
  securityBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(6, 78, 59, 0.8)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    marginBottom: 16,
  },
  securityBadgeText: {
    color: '#6ee7b7',
    fontSize: 11,
    fontWeight: '800',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 8,
  },
  gradientTitle: {
    color: '#34d399',
  },
  subtitle: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 20,
    marginBottom: 24,
  },
  errorBanner: {
    backgroundColor: 'rgba(127, 29, 29, 0.8)',
    borderColor: 'rgba(239, 68, 68, 0.5)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    color: '#fca5a5',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '700',
  },
  googleButton: {
    backgroundColor: '#0f172a',
    borderColor: '#334155',
    borderWidth: 2,
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  googleIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  googleG: {
    fontSize: 20,
    fontWeight: '900',
    color: '#4285F4',
  },
  googleButtonTextContainer: {
    flex: 1,
  },
  googleButtonTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  googleButtonSub: {
    color: '#94a3b8',
    fontSize: 11,
  },
  googleTag: {
    backgroundColor: 'rgba(6, 78, 59, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  googleTagText: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: '800',
  },
  footerNote: {
    color: '#64748b',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },
  featureCard: {
    backgroundColor: 'rgba(6, 78, 59, 0.2)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
  },
  featureTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 6,
  },
  featureText: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#090d16',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#10b981',
    padding: 24,
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 6,
  },
  modalSub: {
    color: '#34d399',
    fontSize: 12,
    marginBottom: 16,
  },
  textInput: {
    backgroundColor: '#0f172a',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#10b981',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
});
