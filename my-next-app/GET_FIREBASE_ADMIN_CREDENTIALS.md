# 🔐 How to Get Firebase Admin SDK Credentials

## Why You Need This
The seed script (and server-side operations) require **Firebase Admin SDK** credentials to bypass authentication rules. This allows your server to write directly to the database.

## Step-by-Step Instructions

### 1. Go to Firebase Console
Visit: https://console.firebase.google.com/

### 2. Select Your Project
Click on **farmerbusiness-8e2aa** (your project)

### 3. Navigate to Service Accounts
- Click the **⚙️ Settings** icon (gear icon) in the left sidebar
- Click **Project settings**
- Click the **Service accounts** tab at the top

### 4. Generate Private Key
- You'll see "Firebase Admin SDK" section
- Click **Generate new private key** button
- A confirmation dialog will appear, click **Generate key**
- A JSON file will download to your computer (keep this secure!)

### 5. Extract the Credentials
Open the downloaded JSON file. It will look like this:

```json
{
  "type": "service_account",
  "project_id": "farmerbusiness-8e2aa",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@farmerbusiness-8e2aa.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "...",
  "token_uri": "...",
  "auth_provider_x509_cert_url": "...",
  "client_x509_cert_url": "..."
}
```

### 6. Update Your .env.local File

Open `.env.local` and update these three values:

```bash
FIREBASE_PROJECT_ID=farmerbusiness-8e2aa
FIREBASE_CLIENT_EMAIL=<copy the "client_email" value from JSON>
FIREBASE_PRIVATE_KEY="<copy the "private_key" value from JSON - include the quotes>"
```

**Important Notes:**
- Keep the `private_key` value in **double quotes**
- The private key should include the `\n` characters (newlines)
- Make sure the entire key is on one line in the `.env.local` file

### 7. Example

After updating, your `.env.local` should have something like:

```bash
FIREBASE_PROJECT_ID=farmerbusiness-8e2aa
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-abc123@farmerbusiness-8e2aa.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
FIREBASE_DATABASE_URL=https://farmerbusiness-8e2aa-default-rtdb.firebaseio.com
```

## 🔒 Security Tips

1. **Never commit the service account JSON file to Git**
2. **Never share your private key publicly**
3. Add `.env.local` to `.gitignore` (it should already be there)
4. Keep the downloaded JSON file in a secure location

## ✅ Verify Configuration

After updating `.env.local`, run the seed script:

```bash
cd my-next-app
npm run seed
```

If configured correctly, you should see:
```
🌱 Starting to seed products...
✅ Created: Fresh Apples (ID: ...)
✅ Created: Bananas (ID: ...)
...
```

## 🚨 Common Issues

### Issue: "Firebase Admin not initialized"
**Solution:** Make sure all three Admin variables are set in `.env.local`

### Issue: "PERMISSION_DENIED"
**Solution:** 
1. Verify your Firebase Database Rules allow Admin SDK access
2. Check that your Database URL is correct
3. Ensure the service account has the right permissions

### Issue: "Invalid private key"
**Solution:** 
1. Make sure the private key is wrapped in double quotes
2. Include the `\n` characters (newlines)
3. Ensure no extra spaces before/after the key

## Need Help?

If you're still having issues:
1. Check the Firebase Console for any error messages
2. Verify your project ID matches exactly
3. Try regenerating a new service account key
4. Ensure your Firebase project has the Realtime Database enabled
