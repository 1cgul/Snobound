# Snobound - Snow Sports Community App

A peer-to-peer snowboarding and skiing app that connects experienced riders with those eager to learn. Built with React Native and Expo.

## 🎿 About Snobound

Snobound bridges the gap between experienced snow sports enthusiasts and beginners by creating a community where:
- **Teachers** can share their expertise and help others improve their skills through lessons
- **Learners** can connect and schedule meetups with experienced riders for guidance and mentorship
- Everyone can enjoy the slopes together in a supportive environment

## ✨ Features

- ✅ **Clean and modern snow-themed UI design**
- ✅ **Role-based registration**
- ✅ **Comprehensive user profiles**


## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on your device:
   - Scan the QR code with the Expo Go app (iOS/Android)
   - Or press `i` for iOS simulator
   - Or press `a` for Android emulator
   - Or press `w` to run in web browser

## Form Features

### Login Form
- Email input with validation
- Password input (secure)
- Form validation with error alerts
- Success message on login

### Registration Form
- Full name input
- Email input with validation
- Password input with minimum length requirement
- Password confirmation with matching validation
- Form validation with error alerts
- Success message on registration

## Validation Rules

- Email must be a valid email format
- Password must be at least 6 characters long
- For registration: passwords must match
- All fields are required

## Customization

You can easily customize the app by modifying:
- Colors and styling in the `styles` object in `App.tsx`
- Form validation rules in the `validateForm` function
- Add new form fields by extending the `FormData` interface
