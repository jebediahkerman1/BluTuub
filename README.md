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


## Real online accounts (Supabase)

BluTuub now includes a Supabase email/password sign-in UI and profile sync. To activate it on GitHub Pages:

1. Create a project at [supabase.com](https://supabase.com/).
2. In the Supabase project, open **SQL Editor**, create a query, paste the complete contents of `supabase-setup.sql`, and run it. This creates the public profile table, row-level security rules, and account-creation trigger.
3. In **Project Settings → API** (or **Connect**), copy the **Project URL** and the **publishable/anon public key**.
4. Edit `supabase-config.js` in this repository. Replace `PASTE_YOUR_SUPABASE_PROJECT_URL_HERE` and `PASTE_YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY_HERE` with those two values.
5. In Supabase **Authentication → URL Configuration**, set the Site URL to `https://jebediahkerman1.github.io/BluTuub/` and add that URL to the Redirect URLs list.
6. Open the website and use the profile button → **Sign in / Create account**.

**Security:** only use the project's public publishable/anon key in `supabase-config.js`. Never put a `service_role` or secret key in a website repository. The SQL enables row-level security and limits profile edits to the signed-in owner. Email confirmation settings are controlled in Supabase Authentication.

The account/profile system is being connected first. Video uploads are still local browser previews and are not yet shared online; that requires a separate storage and video database implementation.
