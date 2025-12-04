# Chlorocode Setup

## Environment Variables

To run this application, you need to configure your Firebase and Jules API credentials.
Create a `.env.local` file in the root directory with the following content:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Optional: Google Jules API Key
# Ensure the Jules API is enabled in your Google Cloud Project
NEXT_PUBLIC_JULES_API_KEY=your_google_cloud_api_key
```

## Getting Started

1.  Run `npm install` to install dependencies.
2.  Run `npm run dev` to start the development server.
3.  Open [http://localhost:3000](http://localhost:3000).