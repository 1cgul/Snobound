import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, UserRole, SkillLevel, ProfileSetupData } from '../types';
import { auth } from '../config/firebase';
import FirestoreService from '../services/firestoreService';

interface ProfileSetupScreenProps {
  user: User;
  onProfileComplete: (updatedUser: User) => void;
  onSkipForNow: () => void;
}

export default function ProfileSetupScreen({ 
  user, 
  onProfileComplete, 
  onSkipForNow 
}: ProfileSetupScreenProps) {
  const [profileData, setProfileData] = useState<ProfileSetupData>({
    profilePhoto: undefined,
    location: '',
    role: 'learner', // Default value
    skillLevel: 'beginner', // Default value
    bio: '',
  });

  const handleInputChange = (field: keyof ProfileSetupData, value: string | UserRole | SkillLevel) => {
    setProfileData((prev: ProfileSetupData) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!profileData.location.trim()) {
      Alert.alert('Error', 'Please enter your location');
      return false;
    }

    if (!profileData.bio.trim()) {
      Alert.alert('Error', 'Please enter a short bio');
      return false;
    }

    return true;
  };

  const handleSaveAndContinue = async () => {
    if (!validateForm()) return;

    try {
      // Get current Firebase user
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'No authenticated user found');
        return;
      }

      // Update user document in Firestore
      const userData = await FirestoreService.getUserByEmail(user.email);
      if (userData?.id) {
        await FirestoreService.updateUser(userData.id, {
          role: profileData.role,
          profilePhoto: profileData.profilePhoto,
          location: profileData.location,
          skillLevel: profileData.skillLevel,
          bio: profileData.bio,
          updatedAt: new Date(),
        });
      }

      const updatedUser: User = {
        ...user,
        role: profileData.role,
        profilePhoto: profileData.profilePhoto,
        location: profileData.location,
        skillLevel: profileData.skillLevel,
        bio: profileData.bio,
      };

      onProfileComplete(updatedUser);
    } catch (error: any) {
      console.error('Profile update error:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handlePhotoUpload = () => {
    // For now, we'll just show an alert
    // In a real app, you would implement image picker functionality
    Alert.alert('Photo Upload', 'Photo upload functionality would be implemented here');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Set Up Your Profile</Text>
            <Text style={styles.subtitle}>
              Tell us about yourself to get the best experience
            </Text>

            {/* Profile Photo */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Profile Photo</Text>
              <TouchableOpacity style={styles.photoUploadButton} onPress={handlePhotoUpload}>
                {profileData.profilePhoto ? (
                  <Image source={{ uri: profileData.profilePhoto }} style={styles.profileImage} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Text style={styles.photoPlaceholderText}>📷</Text>
                    <Text style={styles.photoUploadText}>Tap to upload photo</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Location */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                value={profileData.location}
                onChangeText={(value) => handleInputChange('location', value)}
                placeholder="e.g., Aspen, Colorado"
                autoCapitalize="words"
              />
            </View>

            {/* Role Selection */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>I want to...</Text>
              <View style={styles.roleContainer}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    profileData.role === 'learner' && styles.roleButtonSelected
                  ]}
                  onPress={() => handleInputChange('role', 'learner')}
                >
                  <Text style={[
                    styles.roleButtonText,
                    profileData.role === 'learner' && styles.roleButtonTextSelected
                  ]}>
                    🏂 Learn
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    profileData.role === 'teacher' && styles.roleButtonSelected
                  ]}
                  onPress={() => handleInputChange('role', 'teacher')}
                >
                  <Text style={[
                    styles.roleButtonText,
                    profileData.role === 'teacher' && styles.roleButtonTextSelected
                  ]}>
                    🎿 Teach
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Skill Level */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Skill Level</Text>
              <View style={styles.skillContainer}>
                {(['beginner', 'intermediate', 'advanced'] as SkillLevel[]).map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.skillButton,
                      profileData.skillLevel === level && styles.skillButtonSelected
                    ]}
                    onPress={() => handleInputChange('skillLevel', level)}
                  >
                    <Text style={[
                      styles.skillButtonText,
                      profileData.skillLevel === level && styles.skillButtonTextSelected
                    ]}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Bio */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>About You</Text>
              <TextInput
                style={[styles.input, styles.bioInput]}
                value={profileData.bio}
                onChangeText={(value) => handleInputChange('bio', value)}
                placeholder="Tell us a bit about yourself and your skiing/snowboarding experience..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Action Buttons */}
            <TouchableOpacity style={styles.submitButton} onPress={handleSaveAndContinue}>
              <Text style={styles.submitButtonText}>Save and Continue</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.skipButton} onPress={onSkipForNow}>
              <Text style={styles.skipButtonText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  bioInput: {
    height: 100,
    paddingTop: 15,
  },
  photoUploadButton: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  photoPlaceholder: {
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: 40,
    marginBottom: 8,
  },
  photoUploadText: {
    fontSize: 14,
    color: '#666',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  roleButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  roleButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  roleButtonTextSelected: {
    color: '#007AFF',
  },
  skillContainer: {
    flexDirection: 'column',
    gap: 10,
  },
  skillButton: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  skillButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  skillButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  skillButtonTextSelected: {
    color: '#007AFF',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  skipButton: {
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  skipButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});