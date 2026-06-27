// src/screens/ForgotPasswordScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Keyboard,
  TouchableWithoutFeedback,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { authService } from '../services/authService';

export const ForgotPasswordScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [scaleAnim] = useState(new Animated.Value(0.95));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleResetRequest = async () => {
    if (!email || !email.trim()) {
      setError('An email address is required');
      return;
    }

    setError('');
    setLoading(true);
    
    // FAKE BACKEND SIMULATION FOR HR DEMO
    setTimeout(() => {
      setLoading(false);
      
      Alert.alert(
        '📨 Link Dispatched',
        `Verification instructions have been successfully transmitted to: \n\n${email.trim()}`,
        [
          {
            text: 'Return to Login',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    }, 1500); // Delays for 1.5 seconds to look realistic
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Top Navigation Back Trigger Bar */}
          <View style={styles.topNavigationHeader}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Text style={styles.backIconText}>‹</Text>
              <Text style={styles.backButtonLabelText}>Back</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View
              style={[
                styles.animatedContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
                },
              ]}
            >
              {/* Emergency Matched Brand Header */}
              <View style={styles.headerContainer}>
                <LinearGradient
                  colors={['#DC2626', '#EF4444']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.iconContainer}
                >
                  <Text style={styles.iconText}>🚨</Text>
                </LinearGradient>
                <Text style={styles.title}>Reset Password</Text>
                <Text style={styles.subtitle}>
                  Recover your secure credential parameters for network tool access
                </Text>
              </View>

              {/* Form Framework Input */}
              <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                  <View style={styles.labelContainer}>
                    <Text style={styles.label}>Account Email Address</Text>
                    {error ? <Text style={styles.errorLabel}>⚠️ {error}</Text> : null}
                  </View>
                  <View style={[styles.inputWrapper, error ? styles.inputWrapperError : null]}>
                    <Text style={styles.inputIcon}>📧</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter verified account email"
                      placeholderTextColor="#9CA3AF"
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        if (error) setError('');
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="done"
                      onSubmitEditing={handleResetRequest}
                    />
                  </View>
                </View>

                {/* Primary Action Button */}
                <TouchableOpacity
                  style={[styles.actionButton, loading && styles.actionButtonDisabled]}
                  onPress={handleResetRequest}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="large" />
                  ) : (
                    <View style={styles.buttonContent}>
                      <Text style={styles.actionButtonText}>Transmit Recovery Email</Text>
                      <Text style={styles.actionButtonSubtext}>Secured deployment link generation</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Cancellation Link Frame */}
                <TouchableOpacity 
                  style={styles.cancelContainer} 
                  onPress={() => navigation.navigate('Login')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelLinkText}>Cancel and return to Sign In</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
  },
  topNavigationHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  backIconText: {
    fontSize: 32,
    color: '#6B7280',
    fontWeight: '300',
    marginRight: 4,
    lineHeight: 32,
  },
  backButtonLabelText: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 30,
    justifyContent: 'center',
  },
  animatedContainer: {
    width: '100%',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 84,
    height: 84,
    borderRadius: 42,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  iconText: {
    fontSize: 38,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#DC2626',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  errorLabel: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  inputWrapperError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  inputIcon: {
    fontSize: 18,
    paddingLeft: 14,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    fontSize: 15,
    color: '#1F2937',
  },
  actionButton: {
    backgroundColor: '#DC2626',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  actionButtonDisabled: {
    opacity: 0.65,
  },
  buttonContent: {
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  actionButtonSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    marginTop: 2,
  },
  cancelContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 10,
  },
  cancelLinkText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});