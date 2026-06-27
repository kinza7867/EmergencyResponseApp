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
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { authService } from '../services/authService';

export const RegisterScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
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

  // Hardware Focus Refs for smoother keyboard traversal
  const emailInputRef = useRef<TextInput>(null);
  const phoneInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

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

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const validatePhone = (value: string) => /^[0-9]{10,15}$/.test(value);

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
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
      isValid = false;
    } else if (!validatePhone(phone)) {
      newErrors.phone = 'Please enter a valid phone number (10–15 digits)';
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
      const response = await authService.register({ name, email, phone, password });
      if (response.success) {
        Alert.alert(
          '✅ Registration Successful',
          'Your account has been successfully verified. Log in to access the emergency panel.',
          [
            {
              text: 'Sign In',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
        setName('');
        setEmail('');
        setPhone('');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Join the active emergency assistance network</Text>
              </View>

              {/* Form Input Setup */}
              <View style={styles.formContainer}>
                {/* Full Name */}
                <View style={styles.inputGroup}>
                  <View style={styles.labelContainer}>
                    <Text style={styles.label}>Full Name</Text>
                    {errors.name ? <Text style={styles.errorLabel}>⚠️ {errors.name}</Text> : null}
                  </View>
                  <View style={[styles.inputWrapper, errors.name ? styles.inputWrapperError : null]}>
                    <Text style={styles.inputIcon}>👤</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your full name"
                      placeholderTextColor="#9CA3AF"
                      value={name}
                      onChangeText={text => { setName(text); if (errors.name) setErrors({ ...errors, name: '' }); }}
                      returnKeyType="next"
                      onSubmitEditing={() => emailInputRef.current?.focus()}
                      blurOnSubmit={false}
                    />
                  </View>
                </View>

                {/* Email Address */}
                <View style={styles.inputGroup}>
                  <View style={styles.labelContainer}>
                    <Text style={styles.label}>Email Address</Text>
                    {errors.email ? <Text style={styles.errorLabel}>⚠️ {errors.email}</Text> : null}
                  </View>
                  <View style={[styles.inputWrapper, errors.email ? styles.inputWrapperError : null]}>
                    <Text style={styles.inputIcon}>📧</Text>
                    <TextInput
                      ref={emailInputRef}
                      style={styles.input}
                      placeholder="Enter your email"
                      placeholderTextColor="#9CA3AF"
                      value={email}
                      onChangeText={text => { setEmail(text); if (errors.email) setErrors({ ...errors, email: '' }); }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="next"
                      onSubmitEditing={() => phoneInputRef.current?.focus()}
                      blurOnSubmit={false}
                    />
                  </View>
                </View>

                {/* Phone Number */}
                <View style={styles.inputGroup}>
                  <View style={styles.labelContainer}>
                    <Text style={styles.label}>Phone Number</Text>
                    {errors.phone ? <Text style={styles.errorLabel}>⚠️ {errors.phone}</Text> : null}
                  </View>
                  <View style={[styles.inputWrapper, errors.phone ? styles.inputWrapperError : null]}>
                    <Text style={styles.inputIcon}>📱</Text>
                    <TextInput
                      ref={phoneInputRef}
                      style={styles.input}
                      placeholder="Enter your phone number"
                      placeholderTextColor="#9CA3AF"
                      value={phone}
                      onChangeText={text => { setPhone(text); if (errors.phone) setErrors({ ...errors, phone: '' }); }}
                      keyboardType="phone-pad"
                      returnKeyType="next"
                      onSubmitEditing={() => passwordInputRef.current?.focus()}
                      blurOnSubmit={false}
                    />
                  </View>
                </View>

                {/* Password Field */}
                <View style={styles.inputGroup}>
                  <View style={styles.labelContainer}>
                    <Text style={styles.label}>Password</Text>
                    {errors.password ? <Text style={styles.errorLabel}>⚠️ {errors.password}</Text> : null}
                  </View>
                  <View style={[styles.inputWrapper, errors.password ? styles.inputWrapperError : null]}>
                    <Text style={styles.inputIcon}>🔒</Text>
                    <TextInput
                      ref={passwordInputRef}
                      style={styles.input}
                      placeholder="Create security password"
                      placeholderTextColor="#9CA3AF"
                      value={password}
                      onChangeText={text => { setPassword(text); if (errors.password) setErrors({ ...errors, password: '' }); }}
                      secureTextEntry={!showPassword}
                      returnKeyType="next"
                      onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
                      blurOnSubmit={false}
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowPassword(!showPassword)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.eyeText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Confirm Password Field */}
                <View style={styles.inputGroup}>
                  <View style={styles.labelContainer}>
                    <Text style={styles.label}>Confirm Password</Text>
                    {errors.confirmPassword ? <Text style={styles.errorLabel}>⚠️ {errors.confirmPassword}</Text> : null}
                  </View>
                  <View style={[styles.inputWrapper, errors.confirmPassword ? styles.inputWrapperError : null]}>
                    <Text style={styles.inputIcon}>🔐</Text>
                    <TextInput
                      ref={confirmPasswordInputRef}
                      style={styles.input}
                      placeholder="Confirm your security password"
                      placeholderTextColor="#9CA3AF"
                      value={confirmPassword}
                      onChangeText={text => { setConfirmPassword(text); if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' }); }}
                      secureTextEntry={!showConfirmPassword}
                      returnKeyType="done"
                      onSubmitEditing={handleRegister}
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.eyeText}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Action Trigger Button */}
                <TouchableOpacity
                  style={[styles.registerButton, loading && styles.registerButtonDisabled]}
                  onPress={handleRegister}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="large" />
                  ) : (
                    <View style={styles.buttonContent}>
                      <Text style={styles.registerButtonText}>Create Secure Account</Text>
                      <Text style={styles.registerButtonSubtext}>Access emergency tools instantly</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Alternate Navigation Hook */}
                <View style={styles.loginContainer}>
                  <Text style={styles.loginText}>Already registered?{'   '}</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
                    <Text style={styles.loginLinkText}>Sign In</Text>
                  </TouchableOpacity>
                </View>
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
    backgroundColor: '#eccccc',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 30,
  },
  animatedContainer: {
    flex: 1,
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
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 16,
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
  eyeIcon: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  eyeText: {
    fontSize: 18,
  },
  registerButton: {
    backgroundColor: '#DC2626',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  registerButtonDisabled: {
    opacity: 0.65,
  },
  buttonContent: {
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  registerButtonSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    marginTop: 2,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  loginText: {
    fontSize: 14,
    color: '#6B7280',
  },
  loginLinkText: {
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '700',
  },
});