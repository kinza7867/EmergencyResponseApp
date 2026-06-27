// src/screens/LoginScreen.tsx
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 380;

export const LoginScreen = ({ navigation }: any) => {
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: '', password: '' };

    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      if (response.success) {
        await signIn(response.data.token, response.data.user);
      }
    } catch (error: any) {
      if (error.message?.toLowerCase().includes('not found') || 
          error.message?.toLowerCase().includes('invalid credentials')) {
        Alert.alert(
          'Account Not Found',
          'No account exists with these credentials. Would you like to create one?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Create Account', 
              onPress: () => navigation.navigate('Register', { email, password })
            }
          ]
        );
      } else {
        Alert.alert('Login Failed', error.message || 'Invalid credentials. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Reset Password',
      'Enter your email address and we\'ll send you a link to reset your password.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send Link',
          onPress: () => Alert.alert('Success', 'Password reset link sent to your email.')
        }
      ]
    );
  };

  const handleInstantAssistance = () => {
    navigation.navigate('InstantAssistance');
  };

  return (
    <View style={styles.fullScreenContainer}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      
      <LinearGradient
        colors={['#ebc9c9', '#cf8d8d']}
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
            {/* Instant Assistance Button */}
            <TouchableOpacity
              style={styles.instantAssistanceBtn}
              onPress={handleInstantAssistance}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#FF6B6B', '#FF4444']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.instantGradient}
              >
                <Text style={styles.instantIcon}>🆘</Text>
                <View style={styles.instantTextContainer}>
                  <Text style={styles.instantTitle}>INSTANT ASSISTANCE</Text>
                  <Text style={styles.instantSubtitle}>Tap for emergency help</Text>
                </View>
                <Text style={styles.instantArrow}>→</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Logo and Header */}
            <View style={styles.headerContainer}>
              <View style={styles.logoWrapper}>
                <Image
                  source={{ 
                    uri: 'https://img.icons8.com/ios-filled/150/plus-key.png'
                  }}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.title}>Emergency Response</Text>
              <Text style={styles.subtitle}>Sign in to access full features</Text>
            </View>

            {/* Login Form */}
            <View style={styles.cardContainer}>
              <View style={styles.formContainer}>
                {/* Email */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <View style={[styles.inputWrapper, errors.email ? styles.inputError : null]}>
                    <Text style={styles.inputIcon}>✉️</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your email"
                      placeholderTextColor="#9CA3AF"
                      value={email}
                      onChangeText={text => {
                        setEmail(text);
                        if (errors.email) setErrors({ ...errors, email: '' });
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                  {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
                </View>

                {/* Password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password</Text>
                  <View style={[styles.inputWrapper, errors.password ? styles.inputError : null]}>
                    <Text style={styles.inputIcon}>🔒</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your password"
                      placeholderTextColor="#9CA3AF"
                      value={password}
                      onChangeText={text => {
                        setPassword(text);
                        if (errors.password) setErrors({ ...errors, password: '' });
                      }}
                      secureTextEntry={!showPassword}
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Text style={styles.eyeText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                    </TouchableOpacity>
                  </View>
                  {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
                </View>

                {/* Options */}
                <View style={styles.optionsContainer}>
                  <TouchableOpacity
                    style={styles.rememberMe}
                    onPress={() => setRememberMe(!rememberMe)}
                  >
                    <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                      {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.rememberText}>Remember me</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                    <Text>Forgot Password?</Text>
                    </TouchableOpacity>
                </View>

                {/* Login Button */}
                <TouchableOpacity
                  style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.loginButtonText}>Sign In</Text>
                  )}
                </TouchableOpacity>

                {/* Register Link */}
                <View style={styles.registerContainer}>
                  <Text style={styles.registerText}>Don't have an account? </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                    <Text style={styles.registerLinkText}>Create Account</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#ebc9c9',
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
    paddingTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight ? StatusBar.currentHeight + 20 : 40,
    paddingBottom: 30,
  },
  instantAssistanceBtn: {
    marginBottom: isSmallDevice ? 20 : 26,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  instantGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: isSmallDevice ? 14 : 16,
    paddingHorizontal: isSmallDevice ? 16 : 20,
  },
  instantIcon: {
    fontSize: isSmallDevice ? 28 : 32,
    marginRight: 12,
  },
  instantTextContainer: {
    flex: 1,
  },
  instantTitle: {
    fontSize: isSmallDevice ? 14 : 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  instantSubtitle: {
    fontSize: isSmallDevice ? 11 : 12,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  instantArrow: {
    fontSize: isSmallDevice ? 20 : 24,
    color: '#FFFFFF',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: isSmallDevice ? 20 : 30,
  },
  logoWrapper: {
    width: isSmallDevice ? 100 : 120,
    height: isSmallDevice ? 100 : 120,
    borderRadius: isSmallDevice ? 50 : 60, // Perfect circle logic based on width & height
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logo: {
    width: '50%',
    height: '50%',
    tintColor: '#eb1c1c', // Perfectly styles the transparent cross vector red
  },
  title: {
    fontSize: isSmallDevice ? 22 : 26,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: isSmallDevice ? 13 : 14,
    color: '#4B5563',
    fontWeight: '400',
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: isSmallDevice ? 18 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: isSmallDevice ? 13 : 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
  },
  inputError: {
    borderColor: '#DC2626',
    borderWidth: 1.5,
  },
  inputIcon: {
    fontSize: 16,
    paddingLeft: 12,
  },
  input: {
    flex: 1,
    padding: isSmallDevice ? 10 : 12,
    paddingLeft: 8,
    fontSize: isSmallDevice ? 14 : 15,
    color: '#1F2937',
  },
  eyeIcon: {
    padding: 12,
  },
  eyeText: {
    fontSize: 18,
  },
  errorText: {
    color: '#DC2626',
    fontSize: isSmallDevice ? 11 : 12,
    marginTop: 4,
    marginLeft: 4,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: isSmallDevice ? 18 : 20,
    height: isSmallDevice ? 18 : 20,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: isSmallDevice ? 10 : 12,
    fontWeight: '700',
  },
  rememberText: {
    fontSize: isSmallDevice ? 12 : 13,
    color: '#4B5563',
  },
  forgotText: {
    fontSize: isSmallDevice ? 12 : 13,
    color: '#DC2626',
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#DC2626',
    padding: isSmallDevice ? 14 : 16,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: isSmallDevice ? 15 : 16,
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  registerText: {
    fontSize: isSmallDevice ? 13 : 14,
    color: '#6B7280',
  },
  registerLinkText: {
    fontSize: isSmallDevice ? 13 : 14,
    color: '#DC2626',
    fontWeight: '600',
  },
});