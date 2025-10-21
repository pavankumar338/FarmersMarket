# 🔧 Fixing "Invalid Email or Password" Error

## Quick Diagnosis

If you're getting "Invalid email or password" when trying to sign in, follow these steps:

### Step 1: Check Debug Page
1. Go to **http://localhost:3000/auth/debug**
2. This page shows all registered users in your database
3. Look for your email in the list

### Step 2: Common Issues & Solutions

#### ❌ Issue: "No users found in database"
**Solution:** You need to register first
1. Go to http://localhost:3000/auth/register
2. Fill in the registration form
3. Submit and wait for success message
4. Then try signing in again

#### ❌ Issue: "User found but 'Has Password' shows No"
**Solution:** Password wasn't saved during registration
1. This is a database/rules issue
2. Check Firebase rules are applied (see APPLY_FIREBASE_RULES.md)
3. Re-register with the same email (system will update)

#### ❌ Issue: "Email not in the list"
**Solution:** Registration failed silently
1. Check browser console for errors during registration
2. Verify Firebase connectivity
3. Try registering again with a different email

#### ❌ Issue: "Firebase Error: Permission denied"
**Solution:** Firebase rules not applied
1. Open Firebase Console
2. Go to Build → Realtime Database → Rules
3. Copy all content from `firebase.rules.json`
4. Paste and click "Publish"
5. See APPLY_FIREBASE_RULES.md for detailed steps

#### ❌ Issue: "Email exists but wrong password"
**Solution:** You may have forgotten or mistyped
1. Currently no password reset (TODO feature)
2. Register with a different email, or
3. Manually reset in Firebase Console (advanced)

### Step 3: Test Email Lookup
On the debug page (/auth/debug):
1. Enter your email in the "Test Email Lookup" box
2. Click "Test"
3. See if your user exists and has correct data

### Step 4: Check Server Logs
Look at your terminal where `npm run dev` is running:
- You should see log messages like:
  - "User found: [email]" (good)
  - "User not found for email: [email]" (need to register)
  - "Password mismatch" (wrong password)
  - "Authentication successful" (working!)

## Technical Details

### How Authentication Works
1. You enter email + password on sign-in page
2. System queries Firebase `/users` node for matching email
3. If found, compares password hash using bcrypt
4. If match, creates session with user ID and role
5. Redirects to dashboard based on role

### Database Structure
```
/users
  /{userId}
    email: "user@example.com"
    password: "$2a$10$..." (hashed with bcrypt)
    name: "User Name"
    role: "farmer" | "organization"
    id: "{userId}"
```

### Common Mistakes
1. **Case sensitivity**: Email is case-sensitive in Firebase queries
2. **Trailing spaces**: "user@email.com " ≠ "user@email.com"
3. **Wrong role selected**: Signing in as "farmer" but registered as "organization"
4. **Firebase not initialized**: Check `.env.local` has correct Firebase config

## Still Not Working?

### 1. Check Firebase Configuration
File: `.env.local`
```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-app.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 2. Enable Anonymous Authentication
Even though you're using email/password, the system needs Anonymous auth enabled:
1. Firebase Console → Build → Authentication
2. Sign-in method tab
3. Enable "Anonymous"
4. Save

### 3. Verify Firebase Rules
Your `firebase.rules.json` should allow:
- ✅ Anyone to read `/users` (for email lookup)
- ✅ Authenticated users to read their own data
- ✅ New users to create their profile

### 4. Check Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try signing in
4. Look for requests to Firebase
5. Check if they return 200 OK or errors

### 5. Clear Browser Cache
Sometimes old session data causes issues:
1. Clear cookies for localhost
2. Clear local storage
3. Refresh page
4. Try signing in again

## Need More Help?

### Debug Checklist
- [ ] Visited /auth/debug page
- [ ] Confirmed user exists in database
- [ ] Verified "Has Password" shows "Yes"
- [ ] Checked email spelling (no typos)
- [ ] Firebase rules applied and published
- [ ] Anonymous auth enabled in Firebase
- [ ] `.env.local` has correct Firebase config
- [ ] Server logs show useful error messages
- [ ] Network tab shows successful Firebase requests

### Next Steps
1. If still stuck, check server terminal for specific error logs
2. Review FIREBASE_RULES_SUMMARY.md for security rules
3. Try registering a new test user with simple credentials
4. Test with debug page to see exact database state

---

**Pro Tip:** Bookmark the debug page (/auth/debug) for quick troubleshooting during development!
