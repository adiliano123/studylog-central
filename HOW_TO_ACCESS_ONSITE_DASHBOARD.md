# How to Access the Onsite Supervisor Dashboard

## Problem

You're seeing the OLD supervisor dashboard (`SupervisorDashboard.tsx`) instead of the NEW onsite supervisor dashboard (`OnsiteSupervisorDashboard.tsx`) with all the features.

## Where Are the New Features?

The new features (photo upload, GPS location, validated activities, etc.) are in:

**URL:** `http://localhost:8082/supervisor/onsite/dashboard`

**File:** `studylog-central/src/pages/OnsiteSupervisorDashboard.tsx`

## Solution 1: Direct URL Access (Fastest)

1. Open your browser
2. Go to: `http://localhost:8082/supervisor/onsite/dashboard`
3. You should see the Onsite Supervisor Dashboard

## Solution 2: Fix Supervisor Type in Database

The login redirect checks your `supervisorType` in the database. If it's not set correctly, you'll be redirected to the wrong dashboard.

### Check Your Supervisor Type

Run this SQL query in phpMyAdmin:

```sql
SELECT id, firstName, lastName, email, role, supervisorType 
FROM users 
WHERE email = 'YOUR_EMAIL_HERE';
```

Replace `YOUR_EMAIL_HERE` with the email you use to login.

### Expected Result

```
supervisorType = 'ONSITE'
```

### If supervisorType is NULL or UNIVERSITY

Update it to ONSITE:

```sql
UPDATE users 
SET supervisorType = 'ONSITE' 
WHERE email = 'YOUR_EMAIL_HERE';
```

Then logout and login again.

## Solution 3: Register a New Onsite Supervisor

1. Go to: `http://localhost:8082/supervisor/register`
2. Fill in the form
3. **IMPORTANT:** Click the "Onsite Supervisor" card (not University)
4. Complete registration
5. Login with the new account
6. You should be redirected to `/supervisor/onsite/dashboard`

## Features in Onsite Dashboard

Once you're on the correct dashboard, you'll see:

### 1. Review & Verify Dialog

When you click "Review & Verify" on a pending entry, you'll see:

- ✅ **Check-In Verification** - Shows if student checked in
- ✅ **Presence Confirmation** - Checkbox to confirm presence
- ✅ **Validated Activities** - Text area to confirm/correct activities
- ✅ **Hours Validation** - Input to adjust hours if needed
- ✅ **Photo Evidence Upload** - File input to upload photo
- ✅ **GPS Location** - Automatically captured coordinates
- ✅ **Supervisor Comments** - Text area for feedback

### 2. Approved Entries Section

For entries you've already approved, you'll see:

- ✅ **Approval Date** - When you approved it
- ✅ **Summary Badges**:
  - 🟢 Presence Confirmed
  - 🟡 Hours Adjusted (if different)
  - 🔵 Location Verified
  - 🟣 Photo Evidence
- ✅ **View Details Button** - Click to see full approval data

### 3. View Details Dialog

When you click "View Details" on an approved entry, you'll see:

- ✅ Approval status and date
- ✅ Supervisor name
- ✅ Presence confirmation indicator
- ✅ Hours comparison (claimed vs validated)
- ✅ Original vs validated activities
- ✅ GPS coordinates
- ✅ Photo evidence (full image)
- ✅ Supervisor comments

## Visual Guide

### Where to Upload Photo

1. Login as onsite supervisor
2. Go to "Pending Onsite Verification" section
3. Click "Review & Verify" on any entry
4. Scroll down to "Photo Evidence (Optional)"
5. Click "Choose File" button
6. Select an image from your computer
7. You'll see a preview of the image
8. Click "Approve with Verification"

### Where to See GPS Location

1. When you open the "Review & Verify" dialog
2. Your browser will ask for location permission
3. Allow it
4. Scroll down - you'll see a green box showing:
   ```
   📍 Approval location captured:
   -6.792400, 39.208300
   ```

### Where to See All Approval Data

1. After approving an entry
2. Go to "Onsite Approved Entries" section
3. Find the entry you approved
4. You'll see badges like:
   - [✓ Presence Confirmed]
   - [Hours Adjusted: 7.5h]
   - [📍 Location Verified]
   - [Photo Evidence]
5. Click "View Details" button
6. A dialog opens showing ALL the data

## Troubleshooting

### Issue 1: Still Seeing Old Dashboard

**Symptom:** URL is `/supervisor/dashboard` instead of `/supervisor/onsite/dashboard`

**Solution:**
- Manually go to `http://localhost:8082/supervisor/onsite/dashboard`
- Or fix your supervisorType in database (see Solution 2 above)

### Issue 2: "Review & Verify" Button Missing

**Symptom:** Only see "Review" button

**Solution:** You're on the wrong dashboard. Go to `/supervisor/onsite/dashboard`

### Issue 3: No Photo Upload Field

**Symptom:** Don't see file input for photo

**Solution:** 
- Make sure you're on `/supervisor/onsite/dashboard`
- Click "Review & Verify" (not just "Review")
- Scroll down in the dialog

### Issue 4: No GPS Location

**Symptom:** Don't see location coordinates

**Solution:**
- Allow location permission when browser asks
- If you denied it, go to browser settings and allow location for localhost
- Refresh the page and try again

## Quick Test

To quickly test if you're on the right dashboard:

1. Look at the page title - should say "Onsite Supervisor Dashboard"
2. Look at the subtitle - should say "Daily verification & presence monitoring"
3. Check the URL - should be `/supervisor/onsite/dashboard`
4. Look for "Currently On Site" section - only exists in onsite dashboard
5. Look for "Find Student on Site" search box - only in onsite dashboard

## Comparison

### OLD Dashboard (SupervisorDashboard.tsx)
- URL: `/supervisor/dashboard`
- Title: "Supervisor Dashboard"
- Features: Basic approve/reject only
- Button: "Review" (simple)

### NEW Dashboard (OnsiteSupervisorDashboard.tsx)
- URL: `/supervisor/onsite/dashboard`
- Title: "Onsite Supervisor Dashboard"
- Features: Full verification with photo, GPS, hours validation
- Button: "Review & Verify" (detailed)

## Summary

**To see all the new features:**

1. Go to: `http://localhost:8082/supervisor/onsite/dashboard`
2. Click "Review & Verify" on a pending entry
3. You'll see:
   - Photo upload field
   - GPS location (auto-captured)
   - Hours validation
   - Activity validation
   - Presence confirmation
   - Comments field

**To see approved entry details:**

1. Go to "Onsite Approved Entries" section
2. Click "View Details" on any approved entry
3. You'll see all the approval data including photo and GPS

That's it! You're now on the correct dashboard with all the features.
