# BluTuub

A blue-themed YouTube parody and video-sharing website prototype.

## Features
- Responsive video feed, search, and category filters
- Upload form with title, description, category, and optional custom thumbnail
- Server-side AI moderation for title, description, thumbnail, and four sampled video frames
- Firebase Authentication for email/password accounts

## Run the site
Open `index.html` in a browser, or enable GitHub Pages in **Settings → Pages** and select the `main` branch and `/(root)`.

## Set up and deploy AI moderation

The moderation backend is in `functions/index.js`. The OpenAI API key is stored as a Firebase Functions secret and must never be placed in public website files.

1. Install Node.js 20 and the Firebase CLI.
2. In a terminal at the repository root, run `npm install --global firebase-tools`.
3. Run `firebase login`.
4. Ensure Firebase project `blutuub-1831a` is on the Blaze (pay-as-you-go) plan if Firebase requires billing for Cloud Functions.
5. Create an OpenAI API key in the OpenAI platform and keep it private.
6. Run `firebase functions:secrets:set OPENAI_API_KEY` and paste the key when prompted.
7. Run `firebase deploy --only functions`.
8. Open BluTuub, sign in with Firebase, and try **Create**. AI moderation requires the function to be deployed and the OpenAI secret to be configured.

If deployment asks you to enable APIs or billing, follow the Firebase Console instructions for project `blutuub-1831a`. Never paste your OpenAI API key into `script.js`, `index.html`, `firebase-config.js`, GitHub issues, or public chat.

## Safety and prototype limits

- AI checks the title and description plus the chosen thumbnail (or a generated thumbnail from the video) and **four sampled video frames**.
- Sampling only four frames can miss explicit content between sampled frames. This is not full frame-by-frame video moderation and does not inspect audio.
- The current video is still only previewed in the browser session; it is not uploaded to a server, stored permanently, or shared with other users.
- Moderation can make mistakes. This prototype blocks flagged results and fails closed if moderation is unavailable.
- The moderation model accepts text and images, not video or audio directly. Its image moderation supports a sexual-content category, but it is **not a dedicated child sexual abuse material (CSAM) detector**. Do not send known or suspected CSAM to the OpenAI Moderation API; follow dedicated child-safety, reporting, and escalation procedures if such material is encountered.
- A production platform needs persistent video storage, server-side full-video processing, stronger abuse/rate-limit controls, and a human review and appeal process.

Official docs: [OpenAI Moderation guide](https://developers.openai.com/api/docs/guides/moderation).

BluTuub is a parody project and is not affiliated with YouTube.
