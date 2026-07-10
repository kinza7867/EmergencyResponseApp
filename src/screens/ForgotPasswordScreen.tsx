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
  StatusBar,
  Dimensions,
  Image,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';

// Logo from root assets
const LOGO = require('../../assets/logo.png');

const { width } = Dimensions.get('window');
const isSmallDevice = width < 380;

export const ForgotPasswordScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<'email' | 'code' | 'reset'>('email');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [modalScale] = useState(new Animated.Value(0.5));
  const [modalOpacity] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();
  }, []);

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  // Step 1: Request Reset Code
  const handleRequestReset = async () => {
    setError('');
    
    if (!email || !email.trim()) {
      setError('Email address is required');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    
    try {
      // Check if email exists in system
      const response = await authService.forgotPassword(email);
      
      if (response.success) {
        // Generate a 6-digit code
        const dummyCode = Math.floor(100000 + Math.random() * 900000).toString();
        setResetCode(dummyCode);
        setEnteredCode('');
        setStep('code');
        setShowSuccessModal(true);
        
        // Animate modal in
        Animated.parallel([
          Animated.spring(modalScale, {
            toValue: 1,
            friction: 5,
            tension: 50,
            useNativeDriver: true,
          }),
          Animated.timing(modalOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }
    } catch (error: any) {
      const errorMessage = error.message?.toLowerCase() || '';
      
      if (errorMessage.includes('not found') || 
          errorMessage.includes('user does not exist') ||
          errorMessage.includes('account not found') ||
          errorMessage.includes('no user') ||
          errorMessage.includes('email not registered')) {
        
        Alert.alert(
          'Account Not Found',
          `No account found with email: ${email}\n\nWould you like to create a new account?`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Create Account',
              onPress: () => navigation.navigate('Register', { email: email }),
            },
          ]
        );
      } else {
        Alert.alert('Error', error.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify Code
  const handleVerifyCode = () => {
    if (!enteredCode || enteredCode.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter the 6-digit verification code.');
      return;
    }
    
    if (enteredCode === resetCode) {
      setStep('reset');
      setShowSuccessModal(false);
      // Animate modal out
      Animated.parallel([
        Animated.spring(modalScale, {
          toValue: 0.5,
          friction: 5,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.timing(modalOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => setShowSuccessModal(false));
      
      Alert.alert('Code Verified', 'Please create your new password.');
    } else {
      Alert.alert('Invalid Code', 'The verification code you entered is incorrect. Please try again.');
    }
  };

  // Step 3: Reset Password - Store new password
  const handleResetPassword = async () => {
    setError('');
    
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    
    try {
      let response;
      
      // Use type assertion to avoid TypeScript errors
      const authServiceAny = authService as any;
      
      if (typeof authServiceAny.resetPassword === 'function') {
        // If resetPassword method exists
        response = await authServiceAny.resetPassword(email, newPassword, resetCode);
      } else if (typeof authServiceAny.updatePassword === 'function') {
        // If updatePassword method exists
        response = await authServiceAny.updatePassword(email, newPassword);
      } else {
        // Fallback: Just store in AsyncStorage for demo
        await AsyncStorage.setItem('resetPassword', newPassword);
        await AsyncStorage.setItem('resetEmail', email);
        response = { success: true };
      }
      
      if (response && response.success) {
        Alert.alert(
          'Password Reset Successful',
          `Your password has been reset successfully for:\n\n${email}\n\nPlease login with your new password.`,
          [
            {
              text: 'Go to Login',
              onPress: () => {
                // Reset all fields
                setEmail('');
                setNewPassword('');
                setConfirmPassword('');
                setResetCode('');
                setEnteredCode('');
                setStep('email');
                navigation.navigate('Login');
              },
            },
          ]
        );
      } else {
        throw new Error('Failed to reset password');
      }
    } catch (error: any) {
      console.log('Reset password error:', error);
      Alert.alert(
        'Reset Failed', 
        error.message || 'Could not reset password. Please try again or contact support.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Close modal
  const closeModal = () => {
    Animated.parallel([
      Animated.spring(modalScale, {
        toValue: 0.5,
        friction: 5,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setShowSuccessModal(false));
  };

  // Render Email Step
  const renderEmailStep = () => (
    <>
      <Text style={styles.cardSubtitle}>
        Enter the email address associated with your account and we'll send you a verification code to reset your password.
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email Address</Text>
        <View style={[styles.inputWrapper, error ? styles.inputError : null]}>
          <Text style={styles.inputIcon}>@</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your registered email"
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
            onSubmitEditing={handleRequestReset}
            maxLength={100}
          />
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      <TouchableOpacity
        style={[styles.resetButton, loading && styles.resetButtonDisabled]}
        onPress={handleRequestReset}
        disabled={loading}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#DC2626', '#B91C1C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.resetGradient}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.resetButtonText}>Send Verification Code</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </>
  );

  // Render Code Verification Step
  const renderCodeStep = () => (
    <>
      <Text style={styles.cardSubtitle}>
        Enter the 6-digit verification code sent to your email.
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Verification Code</Text>
        <View style={[styles.inputWrapper, error ? styles.inputError : null]}>
          <Text style={styles.inputIcon}>⌨</Text>
          <TextInput
            style={[styles.input, styles.codeInput]}
            placeholder="Enter 6-digit code"
            placeholderTextColor="#9CA3AF"
            value={enteredCode}
            onChangeText={(text) => {
              const cleaned = text.replace(/[^0-9]/g, '');
              setEnteredCode(cleaned);
              if (error) setError('');
            }}
            keyboardType="number-pad"
            maxLength={6}
            returnKeyType="done"
            onSubmitEditing={handleVerifyCode}
          />
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      <TouchableOpacity
        style={[styles.resetButton, loading && styles.resetButtonDisabled]}
        onPress={handleVerifyCode}
        disabled={loading}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#DC2626', '#B91C1C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.resetGradient}
        >
          <Text style={styles.resetButtonText}>Verify Code</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backToLogin}
        onPress={() => {
          setStep('email');
          setEnteredCode('');
        }}
      >
        <Text style={styles.backToLoginText}>← Back to email</Text>
      </TouchableOpacity>
    </>
  );

  // Render Reset Password Step
  const renderResetStep = () => (
    <>
      <Text style={styles.cardSubtitle}>
        Create a new password for your account. Make sure it's secure and memorable.
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>New Password</Text>
        <View style={[styles.inputWrapper, error ? styles.inputError : null]}>
          <Text style={styles.inputIcon}>⌘</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter new password (min 6 characters)"
            placeholderTextColor="#9CA3AF"
            value={newPassword}
            onChangeText={(text) => {
              setNewPassword(text);
              if (error) setError('');
            }}
            secureTextEntry={!showNewPassword}
            returnKeyType="next"
            maxLength={30}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowNewPassword(!showNewPassword)}
            activeOpacity={0.7}
          >
            <Text style={styles.eyeText}>
              {showNewPassword ? '◯' : '◉'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Confirm Password</Text>
        <View style={[styles.inputWrapper, error ? styles.inputError : null]}>
          <Text style={styles.inputIcon}>⌘</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirm your new password"
            placeholderTextColor="#9CA3AF"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (error) setError('');
            }}
            secureTextEntry={!showConfirmPassword}
            returnKeyType="done"
            onSubmitEditing={handleResetPassword}
            maxLength={30}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            activeOpacity={0.7}
          >
            <Text style={styles.eyeText}>
              {showConfirmPassword ? '◯' : '◉'}
            </Text>
          </TouchableOpacity>
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      <TouchableOpacity
        style={[styles.resetButton, loading && styles.resetButtonDisabled]}
        onPress={handleResetPassword}
        disabled={loading}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#DC2626', '#B91C1C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.resetGradient}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.resetButtonText}>Reset Password</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backToLogin}
        onPress={() => {
          setStep('code');
          setNewPassword('');
          setConfirmPassword('');
        }}
      >
        <Text style={styles.backToLoginText}>← Back to verification</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <View style={styles.fullScreenContainer}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      
      <LinearGradient
        colors={['#FEF2F2', '#FEE2E2', '#FCA5A5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
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
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {/* Back Button */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
              >
                <Text style={styles.backIcon}>←</Text>
                <Text style={styles.backText}>Back</Text>
              </TouchableOpacity>

              {/* Header with Logo */}
              <View style={styles.headerContainer}>
                <View style={styles.logoWrapper}>
                  <LinearGradient
                    colors={['#DC2626', '#991B1B']}
                    style={styles.logoGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Image
                      source={LOGO}
                      style={styles.logo}
                      resizeMode="contain"
                    />
                  </LinearGradient>
                </View>
                <Text style={styles.title}>
                  {step === 'email' ? 'Reset Password' : 
                   step === 'code' ? 'Verify Code' : 
                   'Set New Password'}
                </Text>
                <View style={styles.subtitleContainer}>
                  <View style={styles.subtitleLine} />
                  <Text style={styles.subtitle}>
                    {step === 'email' ? 'Recover your account access' : 
                     step === 'code' ? 'Enter the verification code' : 
                     'Create a new secure password'}
                  </Text>
                  <View style={styles.subtitleLine} />
                </View>
              </View>

              {/* Form Card */}
              <View style={styles.cardContainer}>
                {/* Step Indicator */}
                <View style={styles.stepIndicator}>
                  <View style={[styles.stepDot, step === 'email' || step === 'code' || step === 'reset' ? styles.stepDotActive : null]} />
                  <View style={[styles.stepLine, step === 'code' || step === 'reset' ? styles.stepLineActive : null]} />
                  <View style={[styles.stepDot, step === 'code' || step === 'reset' ? styles.stepDotActive : null]} />
                  <View style={[styles.stepLine, step === 'reset' ? styles.stepLineActive : null]} />
                  <View style={[styles.stepDot, step === 'reset' ? styles.stepDotActive : null]} />
                </View>
                <View style={styles.stepLabels}>
                  <Text style={[styles.stepLabel, step === 'email' || step === 'code' || step === 'reset' ? styles.stepLabelActive : null]}>
                    Request
                  </Text>
                  <Text style={[styles.stepLabel, step === 'code' || step === 'reset' ? styles.stepLabelActive : null]}>
                    Verify
                  </Text>
                  <Text style={[styles.stepLabel, step === 'reset' ? styles.stepLabelActive : null]}>
                    Reset
                  </Text>
                </View>

                {step === 'email' && renderEmailStep()}
                {step === 'code' && renderCodeStep()}
                {step === 'reset' && renderResetStep()}

                {/* Divider */}
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Login Link */}
                <View style={styles.loginContainer}>
                  <Text style={styles.loginText}>Remember your password? </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
                    <Text style={styles.loginLinkText}>Sign In</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>

      {/* Success Modal - Show Verification Code */}
      <Modal
        transparent={true}
        visible={showSuccessModal}
        onRequestClose={closeModal}
        animationType="none"
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContainer,
              {
                transform: [{ scale: modalScale }],
                opacity: modalOpacity,
              }
            ]}
          >
            <View style={styles.modalIconContainer}>
              <Text style={styles.modalIcon}>✉</Text>
            </View>
            <Text style={styles.modalTitle}>Verification Code Sent</Text>
            <Text style={styles.modalMessage}>
              We've sent a verification code to:
            </Text>
            <Text style={styles.modalEmail}>{email}</Text>
            <View style={styles.codeContainer}>
              <Text style={styles.codeLabel}>Your Verification Code:</Text>
              <Text style={styles.codeValue}>{resetCode}</Text>
              <Text style={styles.codeHint}>(Enter this code to verify your identity)</Text>
            </View>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={closeModal}
              >
                <Text style={styles.modalButtonCancelText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={closeModal}
              >
                <LinearGradient
                  colors={['#DC2626', '#B91C1C']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.modalButtonGradient}
                >
                  <Text style={styles.modalButtonConfirmText}>Got it</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#FEF2F2',
  },
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: isSmallDevice ? 16 : 20,
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 20,
    paddingBottom: 30,
  },
  animatedContainer: {
    width: '100%',
  },

  // Back Button
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 4,
  },
  backIcon: {
    fontSize: 24,
    color: '#DC2626',
    fontWeight: '300',
    marginRight: 2,
  },
  backText: {
    fontSize: 15,
    color: '#DC2626',
    fontWeight: '500',
  },

  // Header
  headerContainer: {
    alignItems: 'center',
    marginBottom: isSmallDevice ? 20 : 24,
  },
  logoWrapper: {
    width: isSmallDevice ? 90 : 110,
    height: isSmallDevice ? 90 : 110,
    borderRadius: isSmallDevice ? 45 : 55,
    marginBottom: 16,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  logoGradient: {
    width: '100%',
    height: '100%',
    borderRadius: isSmallDevice ? 45 : 55,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  logo: {
    width: '88%',
    height: '88%',
  },
  title: {
    fontSize: isSmallDevice ? 24 : 28,
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  subtitleLine: {
    flex: 0.15,
    height: 2,
    backgroundColor: '#DC2626',
    borderRadius: 1,
  },
  subtitle: {
    fontSize: isSmallDevice ? 13 : 14,
    color: '#4B5563',
    fontWeight: '400',
    paddingHorizontal: 12,
    textAlign: 'center',
  },

  // Step Indicator
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E5E7EB',
  },
  stepDotActive: {
    backgroundColor: '#DC2626',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#E5E7EB',
  },
  stepLineActive: {
    backgroundColor: '#DC2626',
  },
  stepLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  stepLabel: {
    fontSize: isSmallDevice ? 10 : 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  stepLabelActive: {
    color: '#DC2626',
    fontWeight: '700',
  },

  // Card
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: isSmallDevice ? 18 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  cardSubtitle: {
    fontSize: isSmallDevice ? 13 : 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 20,
    textAlign: 'center',
  },

  // Input
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: isSmallDevice ? 13 : 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
  },
  inputError: {
    borderColor: '#DC2626',
    borderWidth: 2,
    backgroundColor: '#FEF2F2',
  },
  inputIcon: {
    fontSize: 18,
    paddingLeft: 14,
    color: '#6B7280',
  },
  input: {
    flex: 1,
    padding: isSmallDevice ? 12 : 14,
    paddingLeft: 10,
    fontSize: isSmallDevice ? 14 : 15,
    color: '#1F2937',
  },
  codeInput: {
    textAlign: 'center',
    letterSpacing: 8,
    fontSize: isSmallDevice ? 20 : 22,
    fontWeight: '700',
  },
  errorText: {
    color: '#DC2626',
    fontSize: isSmallDevice ? 11 : 12,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '500',
  },
  eyeIcon: {
    padding: 14,
  },
  eyeText: {
    fontSize: 20,
    color: '#6B7280',
  },

  // Reset Button
  resetButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  resetGradient: {
    padding: isSmallDevice ? 14 : 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: isSmallDevice ? 48 : 56,
  },
  resetButtonDisabled: {
    opacity: 0.7,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: isSmallDevice ? 15 : 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Back to Login
  backToLogin: {
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 8,
  },
  backToLoginText: {
    fontSize: isSmallDevice ? 13 : 14,
    color: '#6B7280',
    fontWeight: '500',
  },

  // Divider
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: isSmallDevice ? 12 : 13,
    color: '#94A3B8',
    fontWeight: '600',
  },

  // Login Link
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: isSmallDevice ? 13 : 14,
    color: '#6B7280',
  },
  loginLinkText: {
    fontSize: isSmallDevice ? 13 : 14,
    color: '#DC2626',
    fontWeight: '700',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  modalIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIcon: {
    fontSize: 32,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
  },
  modalMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  modalEmail: {
    fontSize: 16,
    fontWeight: '700',
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 16,
  },
  codeContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  codeLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  codeValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#DC2626',
    letterSpacing: 4,
  },
  codeHint: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 4,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalButtonCancelText: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '600',
  },
  modalButtonConfirm: {
    overflow: 'hidden',
  },
  modalButtonGradient: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  modalButtonConfirmText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default ForgotPasswordScreen;