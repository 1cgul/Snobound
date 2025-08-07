# Snobound - Snow Sports Community App

A peer-to-peer snowboarding and skiing app that connects experienced riders with those eager to learn. Built with React Native and Expo.

## 🎿 About Snobound

Snobound bridges the gap between experienced snow sports enthusiasts and beginners by creating a community where:
- **Teachers** can share their expertise and help others improve their skills
- **Learners** can connect with experienced riders for guidance and mentorship
- Everyone can enjoy the slopes together in a supportive environment

## ✨ Features

- ✅ **Clean and modern snow-themed UI design**
- ✅ **Role-based registration**: Choose to teach or learn
- ✅ **Comprehensive user profiles**: First name, last name, and role selection
- ✅ **Smart form validation**: Email format, password strength, field matching
- ✅ **Responsive design** with keyboard handling
- ✅ **TypeScript support** for better code quality
- ✅ **Snow sports themed messaging** and UI elements

## � Project Structure

```
├── App.tsx                          # Main app component with navigation logic
├── types.ts                         # Shared TypeScript interfaces and types
├── screens/                         # Individual screen components
│   ├── LoginScreen.tsx             # Login form screen
│   ├── SignupScreen.tsx            # Registration form screen
│   └── DashboardScreen.tsx         # Post-login dashboard
├── services/                       # API service layer (backend integration)
│   ├── authService.ts              # Authentication API calls
│   └── userService.ts              # User management API calls
├── app.json                        # Expo configuration
├── package.json                    # Dependencies and scripts
├── tsconfig.json                   # TypeScript configuration
├── babel.config.js                 # Babel configuration
└── assets/                         # Image assets
```

## 🏗️ Architecture

The app follows a clean component-based architecture:

- **App.tsx**: Main navigation controller that manages screen transitions and user state
- **Screens**: Individual components for each major app screen (Login, Signup, Dashboard)
- **Services**: API service layer ready for backend integration
- **Types**: Shared TypeScript interfaces for type safety across the app

## 🔧 Backend Integration Ready

The project is structured to easily integrate with a backend:

- **authService.ts**: Ready for authentication API endpoints
- **userService.ts**: Ready for user management API endpoints
- Mock implementations in place for immediate frontend development
- Clear separation between UI and data layers

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

## Project Structure

```
├── App.tsx              # Main app component with forms
├── app.json             # Expo configuration
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── babel.config.js      # Babel configuration
└── assets/              # Image assets
```

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
