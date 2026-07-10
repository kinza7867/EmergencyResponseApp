// src/screens/RegisterScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
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
  StatusBar,
  ScrollView,
  Animated,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { authService } from '../services/authService';

// Logo from root assets
const LOGO = require('../../assets/logo.png');

const { width } = Dimensions.get('window');
const isSmallDevice = width < 380;

export const RegisterScreen = ({ route, navigation }: any) => {
  // Get pre-filled email/password from Login screen
  const { email: preFilledEmail, password: preFilledPassword } = route.params || {};

  const [name, setName] = useState('');
  const [email, setEmail] = useState(preFilledEmail || '');
  const [phone, setPhone] = useState('+92');
  const [password, setPassword] = useState(preFilledPassword || '');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  // Focus Refs
  const emailInputRef = useRef<TextInput>(null);
  const phoneInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();
  }, []);

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const validatePhone = (value: string) => {
    // Remove +92 prefix for validation if present
    const cleanNumber = value.replace('+92', '');
    return /^[0-9]{10}$/.test(cleanNumber);
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { name: '', email: '', phone: '', password: '', confirmPassword: '' };

    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
      isValid = false;
    }
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }
    if (!phone.trim() || phone === '+92') {
      newErrors.phone = 'Phone number is required';
      isValid = false;
    } else if (!validatePhone(phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
      isValid = false;
    }
    if (!password.trim()) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      // Clean phone number for API (remove +92 if present)
      const cleanPhone = phone.replace('+92', '');
      const response = await authService.register({ 
        name, 
        email, 
        phone: cleanPhone, 
        password 
      });
      if (response.success) {
        Alert.alert(
          'Registration Successful',
          'Your account has been created. Please login.',
          [
            {
              text: 'Sign In',
              onPress: () => {
                navigation.navigate('Login', { 
                  email: email,
                  password: password 
                });
              },
            },
          ]
        );
        setName('');
        setEmail('');
        setPhone('+92');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle phone input with +92 prefix
  const handlePhoneChange = (text: string) => {
    // If text is empty or just '+', set to '+92'
    if (!text || text === '+') {
      setPhone('+92');
      return;
    }
    
    // If text doesn't start with +92, add it
    if (!text.startsWith('+92')) {
      // Remove any non-digit characters and limit to 10 digits after +92
      const digits = text.replace(/\D/g, '');
      const limitedDigits = digits.slice(0, 10);
      setPhone(`+92${limitedDigits}`);
      return;
    }
    
    // If starts with +92, allow editing after prefix
    const prefix = '+92';
    const rest = text.slice(prefix.length);
    const digits = rest.replace(/\D/g, '');
    const limitedDigits = digits.slice(0, 10);
    setPhone(`+92${limitedDigits}`);
  };

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

              {/* Logo with Red Circle Background */}
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
                <Text style={styles.title}>Create Account</Text>
                <View style={styles.subtitleContainer}>
                  <View style={styles.subtitleLine} />
                  <Text style={styles.subtitle}>Join the emergency response network</Text>
                  <View style={styles.subtitleLine} />
                </View>
              </View>

              {/* Form Card */}
              <View style={styles.cardContainer}>
                {/* Full Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Full Name</Text>
                  <View style={[styles.inputWrapper, errors.name ? styles.inputError : null]}>
                    <Text style={styles.inputIcon}>✉</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your full name"
                      placeholderTextColor="#9CA3AF"
                      value={name}
                      onChangeText={text => { 
                        setName(text); 
                        if (errors.name) setErrors({ ...errors, name: '' }); 
                      }}
                      returnKeyType="next"
                      onSubmitEditing={() => emailInputRef.current?.focus()}
                      blurOnSubmit={false}
                      maxLength={50}
                    />
                  </View>
                  {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
                </View>

                {/* Email */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <View style={[styles.inputWrapper, errors.email ? styles.inputError : null]}>
                    <Text style={styles.inputIcon}>@</Text>
                    <TextInput
                      ref={emailInputRef}
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
                      returnKeyType="next"
                      onSubmitEditing={() => phoneInputRef.current?.focus()}
                      blurOnSubmit={false}
                      maxLength={100}
                    />
                  </View>
                  {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
                </View>

                {/* Phone */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Phone Number</Text>
                  <View style={[styles.inputWrapper, errors.phone ? styles.inputError : null]}>
                    <Text style={styles.inputIcon}>📱</Text>
                    <TextInput
                      ref={phoneInputRef}
                      style={styles.input}
                      placeholder="+92XXXXXXXXXX"
                      placeholderTextColor="#9CA3AF"
                      value={phone}
                      onChangeText={handlePhoneChange}
                      keyboardType="phone-pad"
                      returnKeyType="next"
                      onSubmitEditing={() => passwordInputRef.current?.focus()}
                      blurOnSubmit={false}
                      maxLength={13} // +92 + 10 digits
                    />
                  </View>
                  {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
                </View>

                {/* Password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password</Text>
                  <View style={[styles.inputWrapper, errors.password ? styles.inputError : null]}>
                    <Text style={styles.inputIcon}>🔒</Text>
                    <TextInput
                      ref={passwordInputRef}
                      style={styles.input}
                      placeholder="Create security password"
                      placeholderTextColor="#9CA3AF"
                      value={password}
                      onChangeText={text => { 
                        setPassword(text); 
                        if (errors.password) setErrors({ ...errors, password: '' }); 
                      }}
                      secureTextEntry={!showPassword}
                      returnKeyType="next"
                      onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
                      blurOnSubmit={false}
                      maxLength={30}
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowPassword(!showPassword)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.eyeText}>
                        {showPassword ? '◎' : '●'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
                </View>

                {/* Confirm Password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <View style={[styles.inputWrapper, errors.confirmPassword ? styles.inputError : null]}>
                    <Text style={styles.inputIcon}>🔒</Text>
                    <TextInput
                      ref={confirmPasswordInputRef}
                      style={styles.input}
                      placeholder="Confirm your password"
                      placeholderTextColor="#9CA3AF"
                      value={confirmPassword}
                      onChangeText={text => { 
                        setConfirmPassword(text); 
                        if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' }); 
                      }}
                      secureTextEntry={!showConfirmPassword}
                      returnKeyType="done"
                      onSubmitEditing={handleRegister}
                      maxLength={30}
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.eyeText}>
                        {showConfirmPassword ? '◎' : '●'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
                </View>

                {/* Register Button */}
                <TouchableOpacity
                  style={[styles.registerButton, loading && styles.registerButtonDisabled]}
                  onPress={handleRegister}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#DC2626', '#B91C1C']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.registerGradient}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.registerButtonText}>Create Account</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Login Link */}
                <View style={styles.loginContainer}>
                  <Text style={styles.loginText}>Already have an account? </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
                    <Text style={styles.loginLinkText}>Sign In</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
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

  // Header with Logo
  headerContainer: {
    alignItems: 'center',
    marginBottom: isSmallDevice ? 20 : 30,
  },
  logoWrapper: {
    width: isSmallDevice ? 100 : 120,
    height: isSmallDevice ? 100 : 120,
    borderRadius: isSmallDevice ? 50 : 60,
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
    borderRadius: isSmallDevice ? 50 : 60,
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

  // Form Card
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
    fontSize: 16,
    paddingLeft: 14,
  },
  input: {
    flex: 1,
    padding: isSmallDevice ? 12 : 14,
    paddingLeft: 10,
    fontSize: isSmallDevice ? 14 : 15,
    color: '#1F2937',
  },
  eyeIcon: {
    padding: 14,
  },
  eyeText: {
    fontSize: 20,
    color: '#6B7280',
  },
  errorText: {
    color: '#DC2626',
    fontSize: isSmallDevice ? 11 : 12,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '500',
  },

  // Register Button
  registerButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  registerGradient: {
    padding: isSmallDevice ? 14 : 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: isSmallDevice ? 48 : 56,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: isSmallDevice ? 15 : 16,
    fontWeight: '700',
    letterSpacing: 1,
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
});

export default RegisterScreen;