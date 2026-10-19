# BluTuub

A blue-themed YouTube parody and video-sharing website prototype.

## Features
- Responsive blue-branded video feed
- Search and category filters
- Sample video cards with a video-player modal
- Upload form with title, description, category, and a local video preview
- Basic demo text checks for a few prohibited patterns

## Run it
Open `index.html` in a browser, or enable GitHub Pages in **Settings → Pages** and select the `main` branch and `/(root)`.

## Important prototype limits
This is a front-end demo. Uploaded videos are only held in the current browser session and are not shared or stored on a server. The moderation checker is a small rule-based demonstration, **not a real AI moderation service**; it checks the submitted title and description only and does not inspect video frames or audio. Do not treat its result as a real safety decision.

To launch a real multi-user platform, add a secure backend, video/object storage, user authentication, a moderation API called server-side, and a human review/appeals workflow. Never put private API keys in front-end JavaScript.

BluTuub is a parody project and is not affiliated with YouTube.



## Real online accounts (Firebase)

BluTuub uses Firebase Authentication for email/password accounts and Cloud Firestore for public profile data. To activate it:

1. Open the [Firebase Console](https://console.firebase.google.com/) and create a Firebase project (separate from Supabase).
2. In **Build → Authentication → Sign-in method**, enable **Email/Password**.
3. In **Project settings → General**, register a **Web app** and copy its Firebase configuration.
4. Put the values into `firebase-config.js` (apiKey, authDomain, projectId, appId, and messagingSenderId).
5. Create a Firestore database and publish `firestore.rules` in its **Rules** tab.
6. In Authentication settings, authorize `jebediahkerman1.github.io`.
7. Visit [BluTuub](https://jebediahkerman1.github.io/BluTuub/) and use the profile menu to sign in or create an account.

Never put a service-account private key in this repository. Firebase web config is public client config; Firestore security rules protect the data.

Uploads are still local browser previews and are not shared online yet.
