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
