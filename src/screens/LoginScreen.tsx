// src/screens/LoginScreen.tsx
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

// Logo from root assets
const LOGO = require('../../assets/logo.png');

const { width } = Dimensions.get('window');
const isSmallDevice = width < 380;

export const LoginScreen = ({ navigation }: any) => {
  const { signIn } = useAuth();

  // Animation refs
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  
  // SOS Button Animations
  const sosScaleAnim = useRef(new Animated.Value(1)).current;
  const sosPulseAnim = useRef(new Animated.Value(1)).current;
  const sosExpandAnim = useRef(new Animated.Value(0)).current;
  const sosOpacityAnim = useRef(new Animated.Value(0)).current;
  const sosRotateAnim = useRef(new Animated.Value(0)).current;
  const sosTranslateXAnim = useRef(new Animated.Value(0)).current;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [isSosExpanded, setIsSosExpanded] = useState(false);

  // Start animations
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: false,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(sosScaleAnim, {
          toValue: 1.3,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(sosScaleAnim, {
          toValue: 0.7,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(sosScaleAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(sosPulseAnim, {
          toValue: 1.5,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(sosPulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(sosRotateAnim, {
        toValue: 1,
        duration: 6000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotateInterpolation = sosRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleSosPress = () => {
    if (!isSosExpanded) {
      setIsSosExpanded(true);
      Animated.parallel([
        Animated.spring(sosExpandAnim, {
          toValue: 1,
          friction: 6,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(sosOpacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(sosTranslateXAnim, {
          toValue: 1,
          friction: 6,
          tension: 60,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Vibration.vibrate([0, 200, 100, 200, 100, 300]);
      
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      setTimeout(() => {
        navigation.navigate('InstantAssistance');
      }, 300);
    }
  };

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
        const userData: any = response.data.user || {};
        const formattedUser = {
          id: userData.id || userData.userId || 'user-' + Date.now(),
          name: userData.name || userData.fullName || 'User',
          email: userData.email || email,
          phone: userData.phone || userData.phoneNumber || '',
        };
        await signIn(response.data.token, formattedUser);
        navigation.replace('Main');
      }
    } catch (error: any) {
      const errorMessage = error.message?.toLowerCase() || '';
      
      if (errorMessage.includes('not found') || 
          errorMessage.includes('invalid credentials') ||
          errorMessage.includes('user does not exist') ||
          errorMessage.includes('account not found') ||
          errorMessage.includes('no user') ||
          errorMessage.includes('email not registered')) {
        
        Alert.alert(
          'Account Not Found',
          `No account found for "${email}". Would you like to create a new account?`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => {
                setLoading(false);
              }
            },
            {
              text: 'Create Account',
              onPress: () => {
                setLoading(false);
                navigation.replace('Register', { 
                  email: email,
                  password: password 
                });
              },
              style: 'default',
            },
          ]
        );
      } else {
        Alert.alert('Login Failed', error.message || 'Please try again.');
        setLoading(false);
      }
      
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  // Interpolations for expand animation
  const expandScale = sosExpandAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.8, 0.85],
  });

  const expandTranslateX = sosTranslateXAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 40],
  });

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
            {/* Top Navigation Bar - SOS Button */}
            <View style={styles.topNavBar}>
              <View style={styles.navSpacer} />
              <TouchableOpacity
                onPress={handleSosPress}
                activeOpacity={0.8}
                style={styles.sosTouchable}
              >
                <Animated.View 
                  style={[
                    styles.sosWrapper,
                    { 
                      transform: [
                        { scale: isSosExpanded ? expandScale : sosScaleAnim }
                      ] 
                    }
                  ]}
                >
                  {/* Red Dot with Pulse */}
                  <Animated.View 
                    style={[
                      styles.sosDotMain,
                      isSosExpanded && styles.sosDotMainExpanded
                    ]}
                  >
                    <Animated.View 
                      style={[
                        styles.sosPulseRing,
                        { transform: [{ scale: sosPulseAnim }] }
                      ]}
                    />
                    <View style={styles.sosDotCenter} />
                    <Animated.View 
                      style={[
                        styles.sosDotInnerPulse,
                        { transform: [{ scale: sosPulseAnim }] }
                      ]}
                    />
                  </Animated.View>

                  {/* Expanded Content */}
                  {isSosExpanded && (
                    <Animated.View 
                      style={[
                        styles.sosExpandedContent,
                        {
                          opacity: sosOpacityAnim,
                          transform: [
                            { translateX: expandTranslateX }
                          ]
                        }
                      ]}
                    >
                      <Text style={styles.sosExpandedText}>
                        EMERGENCY
                      </Text>
                      <Animated.View 
                        style={[
                          styles.sosExpandedArrow,
                          { 
                            opacity: sosOpacityAnim,
                            transform: [{ rotate: rotateInterpolation }]
                          }
                        ]}
                      >
                        <Text style={styles.sosArrowText}>→</Text>
                      </Animated.View>
                    </Animated.View>
                  )}
                </Animated.View>
              </TouchableOpacity>
            </View>

            {/* Logo and Header */}
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
              <Text style={styles.title}>Emergency Response</Text>
              <View style={styles.subtitleContainer}>
                <View style={styles.subtitleLine} />
                <Text style={styles.subtitle}>Sign in to access full features</Text>
                <View style={styles.subtitleLine} />
              </View>
            </View>

            {/* Login Form */}
            <View style={styles.cardContainer}>
              <View style={styles.formContainer}>
                {/* Email */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <View style={[styles.inputWrapper, errors.email ? styles.inputError : null]}>
                    <Text style={styles.inputIcon}>✉</Text>
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
                      returnKeyType="next"
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
                      returnKeyType="done"
                      onSubmitEditing={handleLogin}
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Text style={styles.eyeText}>
                        {showPassword ? '👁' : '👁‍🗨'}
                      </Text>
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
                  <TouchableOpacity onPress={handleForgotPassword}>
                    <Text style={styles.forgotText}>Forgot Password?</Text>
                  </TouchableOpacity>
                </View>

                {/* Login Button */}
                <TouchableOpacity
                  style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={['#DC2626', '#B91C1C']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.loginGradient}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.loginButtonText}>Sign In</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>

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

  topNavBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 8,
    marginBottom: isSmallDevice ? 8 : 12,
  },
  navSpacer: {
    flex: 1,
  },
  sosTouchable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosDotMain: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 8,
    position: 'relative',
  },
  sosDotMainExpanded: {
    backgroundColor: '#DC2626',
    shadowOpacity: 0.8,
    shadowRadius: 24,
  },
  sosPulseRing: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(220, 38, 38, 0.3)',
  },
  sosDotCenter: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 2,
  },
  sosDotInnerPulse: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    zIndex: 1,
  },
  sosExpandedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 44,
  },
  sosExpandedText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#DC2626',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(220, 38, 38, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  sosExpandedArrow: {
    marginLeft: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  sosArrowText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  headerContainer: {
    alignItems: 'center',
    marginBottom: isSmallDevice ? 20 : 30,
  },
  logoWrapper: {
    width: isSmallDevice ? 110 : 130,
    height: isSmallDevice ? 110 : 130,
    borderRadius: isSmallDevice ? 55 : 65,
    marginBottom: 20,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  logoGradient: {
    width: '100%',
    height: '100%',
    borderRadius: isSmallDevice ? 55 : 65,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  logo: {
    width: '99%',
    height: '99%',
    borderRadius: 60,
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
  formContainer: {
    width: '100%',
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
    fontSize: 22,
    color: '#6B7280',
  },
  errorText: {
    color: '#DC2626',
    fontSize: isSmallDevice ? 11 : 12,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '500',
  },

  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: isSmallDevice ? 20 : 22,
    height: isSmallDevice ? 20 : 22,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 6,
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
    fontSize: isSmallDevice ? 12 : 14,
    fontWeight: '700',
  },
  rememberText: {
    fontSize: isSmallDevice ? 12 : 13,
    color: '#4B5563',
    fontWeight: '500',
  },
  forgotText: {
    fontSize: isSmallDevice ? 12 : 13,
    color: '#DC2626',
    fontWeight: '600',
  },

  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginGradient: {
    padding: isSmallDevice ? 14 : 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: isSmallDevice ? 48 : 56,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: isSmallDevice ? 15 : 16,
    fontWeight: '700',
    letterSpacing: 1,
  },

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

  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: isSmallDevice ? 13 : 14,
    color: '#6B7280',
  },
  registerLinkText: {
    fontSize: isSmallDevice ? 13 : 14,
    color: '#DC2626',
    fontWeight: '700',
  },
});

export default LoginScreen;