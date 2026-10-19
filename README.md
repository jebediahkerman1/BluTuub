# BluTuub

A blue-themed YouTube parody and video-sharing website prototype.

## Features
- Responsive video feed, search, and category filters
- Upload form with title, description, category, and optional custom thumbnail
- Server-side AI moderation for title, description, thumbnail, and four sampled video frames
- Firebase Authentication for email/password accounts

## Run the site
Open `index.html` in a browser, or enable GitHub Pages in **Settings → Pages** and select the `main` branch and `/(root)`.

## Deploy AI moderation without installing anything on your PC

The moderation backend is in `functions/index.js`. You can trigger deployment through GitHub Actions so Node.js and the Firebase CLI run on GitHub's cloud runner, not on your computer.

### One-time browser setup

1. Create an OpenAI API key in the OpenAI platform. Keep it private.
2. In your GitHub repository, open **Settings → Secrets and variables → Actions → New repository secret** and add a secret named `OPENAI_API_KEY` with your key as the value.
3. In Google Cloud Console for Firebase project `blutuub-1831a`, create a service account for deployment and grant only the permissions needed to deploy Cloud Functions and manage its secret. Create a JSON key for that service account and copy the JSON securely.
4. In GitHub **Settings → Secrets and variables → Actions**, add another repository secret named `FIREBASE_SERVICE_ACCOUNT` with the full service-account JSON as its value. Never commit that JSON file to the repository or share it publicly.
5. Make sure Firebase project `blutuub-1831a` has billing enabled if Cloud Functions requires the Blaze pay-as-you-go plan. OpenAI's moderation endpoint itself is free, but Firebase hosting/compute and other cloud services may have charges.

### Deploy from your browser

1. Open the repository's **Actions** tab.
2. Select **Deploy BluTuub AI moderation**.
3. Click **Run workflow**, then **Run workflow** again to confirm.
4. Wait for the workflow to finish successfully. If it fails, open the failed run's log for the setup step that needs attention.

The workflow stores the OpenAI key in Firebase Secret Manager and deploys the function. The website will not be live-moderated until this workflow succeeds and Firebase Authentication is configured for the same project.

## Safety and prototype limits

- AI checks the title and description plus the chosen thumbnail (or a generated thumbnail from the video) and **four sampled video frames**.
- Sampling only four frames can miss explicit content between sampled frames. This is not full frame-by-frame video moderation and does not inspect audio.
- The current video is still only previewed in the browser session; it is not uploaded to a server, stored permanently, or shared with other users.
- Moderation can make mistakes. This prototype blocks flagged results and fails closed if moderation is unavailable.
- The moderation model accepts text and images, not video or audio directly. Its image moderation supports a sexual-content category, but it is **not a dedicated child sexual abuse material (CSAM) detector**. Do not send known or suspected CSAM to the OpenAI Moderation API; follow dedicated child-safety, reporting, and escalation procedures if such material is encountered.
- A production platform needs persistent video storage, server-side full-video processing, stronger abuse/rate-limit controls, and a human review and appeal process.

Official docs: [OpenAI Moderation guide](https://developers.openai.com/api/docs/guides/moderation).

BluTuub is a parody project and is not affiliated with YouTube.
