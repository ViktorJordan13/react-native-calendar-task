# RN Calendar — Meetings & Events

A React Native (bare CLI, **not** Expo) calendar application with email/password
authentication, biometric unlock, and a fully custom calendar UI for creating
and editing meetings. Built with TypeScript and Firebase.

> Technical assessment submission. The emphasis is on architecture, separation
> of concerns, and reusable components rather than feature volume.

---

## Features

- **Authentication** — email/password sign up & sign in (Firebase Auth) with
  field validation.
- **Biometric unlock** — after a password login, the session can be unlocked
  with Face ID / Touch ID / fingerprint on next launch. Biometrics is used as a
  *session unlock*, not as primary auth (the secure pattern).
- **Custom calendar** — hand-built month grid (Google-Calendar-style,
  Monday-first) and a day agenda view, with a Month/Day toggle. **No third-party
  calendar component.**
- **Events (meetings)** — create, edit, and delete events with title,
  description, and start/end times. Stored in Firestore and shown per-day in
  real time.
- **Profile** — user info and logout.
- **Custom UI** — design-token theme, custom header and bottom navbar, safe-area
  handling for all notch / Dynamic Island / home-indicator devices, and native
  screen-transition animations.

---

## Software versions

These are the versions the project was built and pinned against. Use them (or
newer compatible patches) to reproduce the build.

| Tool / Library | Version |
| --- | --- |
| React Native | 0.84.0 |
| React | 19.1.0 |
| TypeScript | 5.6.3 |
| Node.js | >= 20 (LTS) |
| @react-navigation/native | 7.2.5 |
| @react-navigation/native-stack | 7.16.0 |
| @react-navigation/bottom-tabs | 7.16.2 |
| @react-native-firebase/app · auth · firestore | 24.0.0 |
| react-native-biometrics | 3.0.1 |
| react-native-keychain | 10.0.0 |
| react-native-safe-area-context | 5.8.0 |
| react-hook-form | 7.76.1 |
| @hookform/resolvers | 5.4.0 |
| zod | 4.4.3 |
| @react-native-community/datetimepicker | 9.1.0 |
| Jest | 29.x |
| @testing-library/react-native | 13.3.3 |

iOS: Xcode 15+, CocoaPods, iOS 15+ deployment target.
Android: JDK 17, Android SDK 34, Gradle (bundled wrapper).

---

## Prerequisites

Set up your machine per the official guide (CLI / "React Native CLI Quickstart",
**not** Expo): https://reactnative.dev/docs/environment-setup

You need: Node 20+, Watchman (macOS), Ruby + CocoaPods (iOS), JDK 17 + Android
Studio (Android).

---

## Firebase setup (required)

The app uses `@react-native-firebase`, which reads native config files. There is
**no API key in the JS bundle**.

1. Create a Firebase project at https://console.firebase.google.com.
2. In **Authentication → Sign-in method**, enable **Email/Password**.
3. In **Firestore Database**, create a database (start in test mode for local
   development, then apply the rules below).
4. **Android**: register an Android app with applicationId `com.rncalendar`,
   download `google-services.json`, and place it in `android/app/`.
5. **iOS**: register an iOS app with the matching bundle ID, download
   `GoogleService-Info.plist`, and add it to the iOS project in Xcode
   (`ios/rncalendar/`).

> Both config files are git-ignored on purpose — they contain project
> identifiers and should not be committed.

### Suggested Firestore security rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /events/{eventId} {
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.ownerId;
      allow create: if request.auth != null
        && request.auth.uid == request.resource.data.ownerId;
    }
  }
}
```

---

## Install & run

```bash
# 1. Install JS dependencies
npm install

# 2. iOS native deps (macOS only)
cd ios && pod install && cd ..

# 3. Start Metro
npm start

# 4a. Run on iOS
npm run ios

# 4b. Run on Android
npm run android
```

---

## Testing

```bash
npm test            # run all tests
npm run test:coverage   # with coverage report
```

The suite covers the pure calendar date logic, the auth/event validation
schemas, and shared component behavior. Coverage comfortably exceeds the
required 5% (the date utilities and validation layer alone are exhaustively
tested).

---

## Architecture

Feature-based structure — code is grouped by domain, not by file type.

```
src/
  app/            Navigation (root + auth/app/event-editor), typed routes
  components/     Reusable primitives: Screen, Header, Button, Input
  theme/          Design tokens (colors, spacing, typography, radius)
  providers/      AuthProvider — session state, single source of truth
  lib/            firebase.ts — single Firebase entry point
  features/
    auth/         screens, services (authService, biometrics), validation, hooks
    calendar/     custom MonthView / DayView / header, date utils, hooks
    events/       Firestore CRUD service, hooks, editor screen, validation
    profile/      profile + logout
__tests__/        Jest + React Native Testing Library
```

### Key design decisions

- **Service layer isolates the backend.** Only `authService` touches Firebase
  Auth and only `eventsService` touches Firestore. Screens and hooks depend on
  these interfaces, so swapping Firebase for Async Storage would be a localized
  change.
- **Auth state drives navigation.** `RootNavigator` renders the auth stack or
  the app stack based on the `user` value from `AuthProvider`. Login/logout
  cause navigation purely through state — no imperative `reset()` calls.
- **Biometrics is session-unlock, not auth.** The password login is the real
  authentication; a successful login optionally stores a Keychain-backed
  (hardware-secured) session that Face ID / Touch ID can later unlock. This
  matches the "sign in with biometrics if previously logged in" requirement.
- **Custom calendar, dependency-free date math.** `dateUtils.ts` builds the
  42-cell Monday-first month grid with pure functions — easy to test, and it
  satisfies the "no third-party calendar component" constraint.
- **Validation separated from UI.** Zod schemas live apart from screens and feed
  react-hook-form, so rules are reusable and unit-testable.
- **Notch handling is centralized.** Every screen renders inside `<Screen>`,
  which reads real device insets via `react-native-safe-area-context`.

---

## Project structure note

This repository contains the application source (`src/`, `App.tsx`, configs,
tests). To run it, scaffold a bare RN 0.84 TypeScript project with the same app
name (`rncalendar`) and drop these files in, or initialize git in place and add
the native `android/` and `ios/` folders via `npx @react-native-community/cli init`.
See the Install & run section.

---

## Screenshots

_Add a few screenshots here (sign in, month view, day view, event editor,
profile) before submitting._
```
docs/screenshots/
  01-signin.png
  02-month.png
  03-day.png
  04-editor.png
  05-profile.png
```
```
