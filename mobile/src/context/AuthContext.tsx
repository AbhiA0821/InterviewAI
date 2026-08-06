import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthContextType, UserProfile } from '../types/auth';
import { getSecureUser, saveSecureUser, clearSecureUser } from '../services/firebase';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Load cached session on app initialization
    const initAuth = async () => {
      const { user: savedUser, token: savedToken } = await getSecureUser();
      if (savedUser && savedToken) {
        setUser(savedUser);
        setIdToken(savedToken);
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      // Simulate Google OAuth 2.0 Login payload & Firebase ID Token generation
      const mockGoogleUser: UserProfile = {
        uid: `usr_${Date.now()}`,
        email: 'candidate@interviewai.com',
        displayName: 'Abhishek Candidate',
        photoURL: 'https://lh3.googleusercontent.com/a/default-avatar',
      };
      const mockFirebaseToken = `mock_firebase_id_token_${Date.now()}`;

      await saveSecureUser(mockGoogleUser, mockFirebaseToken);
      setUser(mockGoogleUser);
      setIdToken(mockFirebaseToken);
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateDisplayName = async (name: string) => {
    if (!user || !idToken) return;
    const updatedUser = { ...user, displayName: name };
    await saveSecureUser(updatedUser, idToken);
    setUser(updatedUser);
  };

  const logout = async () => {
    setLoading(true);
    await clearSecureUser();
    setUser(null);
    setIdToken(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        idToken,
        loading,
        loginWithGoogle,
        updateDisplayName,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
