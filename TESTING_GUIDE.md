# Testing Guide - Onsite Supervisor Features

## ✅ Frontend Running
- **URL**: http://localhost:8082/
- **Backend**: http://localhost:8080/ (should be running)

## Test Scenarios

### Scenario 1: Register Onsite Supervisor

1. **Navigate to Registration**
   - Go to: http://localhost:8082/supervisor/register
   
2. **Select Supervisor Type**
   - Click on "Onsite Supervisor" card (should highlight with blue border)
   - Icon should be 🏢 Building

3. **Fill Form with Sample Data**
   - Click "Sample 1 (Onsite)" button
   - Form should auto-fill with:
     - Email: john.smith@techcorp.com
     - Password: Secure123!
     - First Name: John
     - Last Name: Smith
     - Staff ID: ONS001
     - Department: Engineering
     - Supervisor Type: ONSITE (read-only)

4. **Submit Registration**
   - Click "Create Onsite Supervisor Account"
   - Should see success message
   - Should show supervisor type badge: 🏢 Onsite

### Scenario 2: Login as Onsite Supervisor

1. **Navigate to Login**
   - Go to: http://localhost:8082/supervisor/login
   
2. **Enter Credentials**
   - Email: john.smith@techcorp.com
   - Password: Secure123!
   
3. **Verify Redirect**
   - Should redirect to: http://localhost:8082/supervisor/onsite/dashboard
   - Should see "Onsite Supervisor Dashboard" header with 🏢 icon
   - Should see "Daily verification & presence monitoring" subtitle

### Scenario 3: Test Dashboard Features

#### A. Currently On Site Section
- Should see green card showing "Currently On Site (X)"
- If students are checked in, they appear here
- Shows student name and check-in time

#### B. New Entries Notification
- If there are new logbook entries (last 24 hours), should see:
  - Yellow notification banner at top
  - "X New Logbook Entries Awaiting Review"
  - "Review Now" button
- Click "Review Now" → should scroll to pending section

#### C. Student Search
- Enter a student ID (e.g., "STU001")
- Click "Search" button
- Should see:
  - Student information card
  - Recent check-ins section
  - Logbook entries section

### Scenario 4: Review Logbook Entry

1. **Find Pending Entry**
   - Scroll to "Pending Onsite Verification" section
   - Should see list of entries with:
     - Student name
     - Date
     - Hours worked
     - Activities
     - "Review & Verify" button

2. **Click Review & Verify**
   - Dialog should open with title "Onsite Verification & Approval"
   
3. **Check-In Verification Section**
   - Should see blue box showing check-in records
   - If student checked in: ✓ Green checkmark
   - If no check-in: ⚠️ Red warning

4. **Presence Confirmation**
   - Should see checkbox: "I confirm the student was physically present on site"
   - Try clicking "Approve" without checking → should be disabled
   - Check the box → "Approve" button should enable

5. **View Student's Claims**
   - Should see gray box with "Student's Claimed Hours"
   - Should see "Week Number"
   - Should see "Student's Activity Description" in highlighted box

6. **Validate Activities**
   - Should see textarea with student's activities
   - Try editing the text
   - Original description should still be visible above

7. **Validate Hours**
   - Left side: "Claimed Hours" (disabled, gray)
   - Right side: "Actual Hours Worked" (editable)
   - Change the hours → should see yellow warning:
     "⚠️ Hours adjusted from X to Y"

8. **Upload Photo Evidence**
   - Click "Choose File" button
   - Select an image
   - Should see preview of image
   - Should see "Remove Photo" button
   - Click remove → preview should disappear

9. **GPS Location**
   - Should see green box with:
     "Approval location captured: [latitude], [longitude]"

10. **Add Comments**
    - Type in "Supervisor Comments & Feedback" textarea
    - Try to approve without comments → should be disabled
    - Add comments → button should enable

11. **Approve Entry**
    - Ensure presence is confirmed
    - Ensure comments are added
    - Click "Approve with Verification"
    - Should see:
      - Dialog closes
      - Toast notification: "Entry Approved"
      - Entry moves to "Onsite Approved Entries" section
      - Status badge changes to blue "Onsite Approved"

### Scenario 5: Test Rejection

1. **Open Review Dialog**
   - Click "Review & Verify" on another entry

2. **Add Rejection Comments**
   - Type reason in comments field
   - Example: "Activities not completed as described"

3. **Click Reject**
   - Click "Reject Entry" button (red)
   - Should see:
     - Dialog closes
     - Toast notification: "Entry Rejected"
     - Status changes to red "Rejected"

### Scenario 6: Test Auto-Refresh

1. **Keep Dashboard Open**
   - Wait 30 seconds
   - Dashboard should automatically refresh
   - New entries should appear if any

2. **Create New Entry as Student**
   - In another browser/tab, login as student
   - Create a logbook entry
   - Go back to supervisor dashboard
   - Within 30 seconds, should see:
     - Yellow notification banner updates
     - New entry appears in pending section
     - Toast notification: "New Logbook Entries"

### Scenario 7: Test University Supervisor Dashboard

1. **Register University Supervisor**
   - Go to: http://localhost:8082/supervisor/register
   - Click "University Supervisor" card (🎓 icon)
   - Click "Sample 1 (University)" button
   - Submit registration

2. **Login as University Supervisor**
   - Email: jane.doe@university.edu
   - Password: Academic123!
   - Should redirect to: http://localhost:8082/supervisor/university/dashboard

3. **Verify Different Dashboard**
   - Should see "University Supervisor Dashboard" with 🎓 icon
   - Should see "Academic assessment & final approval" subtitle
   - Should only see "ONSITE_APPROVED" entries
   - Should NOT see entries that are still "PENDING"

4. **Review Entry**
   - Click "Review" on an onsite-approved entry
   - Should see:
     - Student's activities
     - Onsite supervisor's feedback (blue box)
     - Academic feedback textarea
   - Add academic comments
   - Click "Approve for Academic Credit"
   - Status should change to "FULLY_APPROVED" (green)

## Expected Results Summary

### ✅ Onsite Supervisor Dashboard Should Have:
1. Currently on site section (green)
2. New entries notification (yellow banner)
3. Student search functionality
4. Pending verification section
5. Approved entries section
6. Auto-refresh every 30 seconds

### ✅ Review Dialog Should Have:
1. Check-in verification (blue box)
2. Presence confirmation checkbox
3. Student's claimed information display
4. Validated activities textarea (editable)
5. Hours validation (side-by-side)
6. Photo upload with preview
7. GPS location capture (green box)
8. Comments textarea (required)
9. Reject button (red)
10. Approve button (green, requires validation)

### ✅ Validation Rules:
- Approve requires: presence ✓ + comments ✓
- Reject requires: comments ✓
- Hours must be 0-24
- Activities must not be empty

### ✅ Status Flow:
```
PENDING (yellow)
  ↓ Onsite Supervisor Approves
ONSITE_APPROVED (blue)
  ↓ University Supervisor Approves
FULLY_APPROVED (green)
```

## Troubleshooting

### Frontend Not Loading
```bash
# Check if running
# Should see: http://localhost:8082/

# If not running, start it:
cd studylog-central
npm run dev
```

### Backend Not Responding
```bash
# Check if backend is running on port 8080
# Test with:
curl http://localhost:8080/api/logbooks
# Should return 403 (needs auth) or data

# If not running, start backend:
cd logbook/logbook
mvn spring-boot:run
```

### Can't Login
- Verify supervisor is registered
- Check email and password
- Check browser console for errors
- Verify backend is running

### No Logbooks Showing
- Create logbook entries as student first
- Verify student has created entries
- Check browser Network tab for API calls
- Verify endpoint returns data

### Student Search Not Working
- Verify student exists with that ID
- Check backend logs for errors
- Verify endpoint: GET /api/students/search?studentId=XXX

### Photo Upload Not Working
- Check file size (should be reasonable)
- Check file type (images only)
- Check browser console for errors
- Photo is stored as base64 (works offline)

## Quick Test Commands

### Create Test Student
```bash
curl -X POST http://localhost:8080/api/auth/register/student \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@student.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "Student",
    "studentId": "STU001",
    "course": "Computer Science",
    "year": 3
  }'
```

### Create Test Logbook (as student)
```bash
# First login as student to get token
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@student.com","password":"password123"}'

# Then create logbook
curl -X POST http://localhost:8080/api/logbooks/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer STUDENT_TOKEN" \
  -d '{
    "date": "2026-02-13",
    "hoursWorked": 8,
    "activities": "Worked on database migration and API development",
    "weekNumber": 7
  }'
```

## Browser Developer Tools

### Check Console
1. Press F12
2. Go to Console tab
3. Look for errors (red text)
4. Look for API calls

### Check Network
1. Press F12
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Look for API calls:
   - /api/logbooks
   - /api/students/search
   - /api/checkin/currently-checked-in
   - /api/approvals/onsite/{id}

### Check Application Storage
1. Press F12
2. Go to Application tab
3. Check Local Storage
4. Should see:
   - token
   - user (with supervisorType)

## Success Indicators

### ✅ Everything Working If:
1. Can register both supervisor types
2. Login redirects to correct dashboard
3. Onsite dashboard shows all features
4. Can search for students
5. Can review logbook entries
6. Check-in records appear
7. Can upload photos
8. Can approve/reject entries
9. Status updates correctly
10. Notifications appear
11. Auto-refresh works
12. University dashboard only shows onsite-approved entries

## Next Steps After Testing

1. Test with real data
2. Test with multiple students
3. Test with multiple supervisors
4. Test concurrent approvals
5. Test edge cases (no check-in, 0 hours, etc.)
6. Test on different browsers
7. Test on mobile devices
8. Performance testing with many entries

## Summary

**Frontend URL**: http://localhost:8082/
**Backend URL**: http://localhost:8080/

**Test Accounts**:
- Onsite: john.smith@techcorp.com / Secure123!
- University: jane.doe@university.edu / Academic123!
- Student: test@student.com / password123

**Key Features to Test**:
1. ✅ Notifications
2. ✅ Check-in verification
3. ✅ Activity validation
4. ✅ Hours validation
5. ✅ Photo upload
6. ✅ Approval/rejection
7. ✅ Status updates
8. ✅ Auto-refresh

All features are implemented and ready for testing!
