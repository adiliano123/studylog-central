# Supervisor Login Redirect Fix - Complete Guide

## ✅ WHAT WAS FIXED

### Backend Changes

1. **Updated `JwtResponse.java`**
   - Added `supervisorType` field
   - Now returns supervisor type in login response

2. **Updated `AuthController.java`**
   - Login endpoint now includes `supervisorType` in response
   - Logs supervisor type for debugging

### Frontend Changes

1. **Updated `SupervisorLogin.tsx`**
   - Added console logging for debugging
   - Improved redirect logic based on `supervisorType`

## 🎯 HOW IT WORKS NOW

### Login Flow

1. **Supervisor logs in** → `POST /api/auth/login`
2. **Backend returns:**
   ```json
   {
     "token": "eyJhbGc...",
     "email": "supervisor@example.com",
     "role": "SUPERVISOR",
     "firstName": "John",
     "lastName": "Doe",
     "supervisorType": "ONSITE"  // ← NEW!
   }
   ```
3. **Frontend checks `supervisorType`:**
   - If `"ONSITE"` → Redirect to `/supervisor/onsite/dashboard`
   - If `"UNIVERSITY"` → Redirect to `/supervisor/university/dashboard`
   - If `null` → Redirect to `/supervisor/dashboard` (fallback)

## 🔧 TESTING STEPS

### Step 1: Restart Backend

The backend needs to be restarted to load the new code:

1. Stop the backend (Ctrl+C in the terminal)
2. Start it again:
   ```bash
   cd c:\Users\jonas\OneDrive\Desktop\logbook\logbook
   mvn spring-boot:run
   ```

### Step 2: Clear Browser Cache

1. Open browser DevTools (F12)
2. Go to Application tab
3. Clear Storage → Clear site data
4. Or just do Ctrl+Shift+Delete → Clear cache

### Step 3: Test Login

1. Go to: `http://localhost:8082/supervisor/login`
2. Login with your supervisor credentials
3. **Check browser console (F12)** - you should see:
   ```
   === LOGIN SUCCESSFUL ===
   Email: your-email@example.com
   Role: SUPERVISOR
   SupervisorType: ONSITE
   Redirecting to: /supervisor/onsite/dashboard
   ```
4. You should be redirected to the onsite dashboard automatically

### Step 4: Verify Dashboard

After login, check:
- ✅ URL is `/supervisor/onsite/dashboard`
- ✅ Page title is "Onsite Supervisor Dashboard"
- ✅ Subtitle is "Daily verification & presence monitoring"
- ✅ You see "Currently On Site" section
- ✅ You see "Find Student on Site" search box
- ✅ Pending entries have "Review & Verify" button (not just "Review")

## 🐛 TROUBLESHOOTING

### Issue 1: Still Redirecting to Old Dashboard

**Symptom:** After login, URL is `/supervisor/dashboard` instead of `/supervisor/onsite/dashboard`

**Possible Causes:**
1. Backend not restarted
2. SupervisorType not set in database
3. Browser cache not cleared

**Solutions:**

**A. Check Backend Logs**

Look for this line in backend console:
```
Login successful for: your-email@example.com (Role: SUPERVISOR, SupervisorType: ONSITE)
```

If you see `SupervisorType: null`, the database doesn't have the supervisor type set.

**B. Check Database**

Run this SQL query:
```sql
SELECT id, firstName, lastName, email, role, supervisorType 
FROM users 
WHERE email = 'YOUR_EMAIL_HERE';
```

If `supervisorType` is `NULL`, update it:
```sql
UPDATE users 
SET supervisorType = 'ONSITE' 
WHERE email = 'YOUR_EMAIL_HERE';
```

**C. Check Browser Console**

Open DevTools (F12) → Console tab

You should see:
```
=== LOGIN SUCCESSFUL ===
Email: your-email@example.com
Role: SUPERVISOR
SupervisorType: ONSITE
Redirecting to: /supervisor/onsite/dashboard
```

If `SupervisorType: undefined`, the backend is not sending it.

### Issue 2: Backend Not Sending SupervisorType

**Symptom:** Browser console shows `SupervisorType: undefined`

**Solution:**
1. Make sure backend was recompiled: `mvn compile`
2. Restart backend: `mvn spring-boot:run`
3. Check backend logs for compilation errors

### Issue 3: "Review & Verify" Button Still Missing

**Symptom:** Only see "Review" button, not "Review & Verify"

**Solution:**
- You're still on the old dashboard
- Manually go to: `http://localhost:8082/supervisor/onsite/dashboard`
- Check URL in address bar

## 📊 COMPARISON

### Before Fix

```
Login → Backend returns:
{
  "token": "...",
  "email": "...",
  "role": "SUPERVISOR"
  // supervisorType missing!
}

Frontend → Can't determine type → Redirects to /supervisor/dashboard (old)
```

### After Fix

```
Login → Backend returns:
{
  "token": "...",
  "email": "...",
  "role": "SUPERVISOR",
  "supervisorType": "ONSITE"  // ← Now included!
}

Frontend → Checks supervisorType → Redirects to /supervisor/onsite/dashboard (new)
```

## 🎯 QUICK TEST CHECKLIST

- [ ] Backend restarted
- [ ] Browser cache cleared
- [ ] Login successful
- [ ] Console shows supervisorType
- [ ] Redirected to `/supervisor/onsite/dashboard`
- [ ] See "Onsite Supervisor Dashboard" title
- [ ] See "Review & Verify" button
- [ ] Can upload photo
- [ ] Can see GPS location

## 📝 WHAT TO DO NOW

1. **Restart your backend:**
   ```bash
   # Stop current backend (Ctrl+C)
   cd c:\Users\jonas\OneDrive\Desktop\logbook\logbook
   mvn spring-boot:run
   ```

2. **Clear browser cache:**
   - Press F12
   - Application tab → Clear storage
   - Or Ctrl+Shift+Delete

3. **Login again:**
   - Go to `http://localhost:8082/supervisor/login`
   - Enter your credentials
   - Watch the console (F12)

4. **Verify redirect:**
   - Should go to `/supervisor/onsite/dashboard`
   - Should see new dashboard with all features

## 🔍 DEBUG COMMANDS

### Check Backend Response

Open browser DevTools → Network tab → Login → Response:

```json
{
  "token": "eyJhbGc...",
  "type": "Bearer",
  "email": "supervisor@example.com",
  "role": "SUPERVISOR",
  "firstName": "John",
  "lastName": "Doe",
  "supervisorType": "ONSITE"  // ← Should be here!
}
```

### Check LocalStorage

Open browser DevTools → Console → Type:

```javascript
JSON.parse(localStorage.getItem('user'))
```

Should show:
```json
{
  "email": "supervisor@example.com",
  "role": "SUPERVISOR",
  "supervisorType": "ONSITE"  // ← Should be here!
}
```

### Check Database

```sql
-- See all supervisors and their types
SELECT 
    id,
    firstName,
    lastName,
    email,
    role,
    supervisorType,
    department
FROM users 
WHERE role = 'SUPERVISOR'
ORDER BY supervisorType;
```

## ✅ SUCCESS INDICATORS

You'll know it's working when:

1. ✅ Backend logs show: `SupervisorType: ONSITE`
2. ✅ Browser console shows: `Redirecting to: /supervisor/onsite/dashboard`
3. ✅ URL changes to: `/supervisor/onsite/dashboard`
4. ✅ Page shows: "Onsite Supervisor Dashboard"
5. ✅ You see "Review & Verify" button with photo upload

## 🎉 SUMMARY

**Files Modified:**
1. `logbook/logbook/src/main/java/com/example/logbook/dto/JwtResponse.java`
2. `logbook/logbook/src/main/java/com/example/logbook/controller/AuthController.java`
3. `studylog-central/src/pages/SupervisorLogin.tsx`

**What Changed:**
- Backend now returns `supervisorType` in login response
- Frontend uses `supervisorType` to redirect to correct dashboard
- Added console logging for debugging

**Next Steps:**
1. Restart backend
2. Clear browser cache
3. Login again
4. You should be redirected to the new dashboard automatically!
