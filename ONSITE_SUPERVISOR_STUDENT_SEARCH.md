# Onsite Supervisor - Student Search Feature

## Overview

Added a powerful student search feature to the Supervisor Dashboard that allows onsite supervisors to quickly find and manage students on-site by entering their Student ID.

## Features Added

### 1. Student Search Bar
- Prominent search section at the top of the dashboard
- Enter student ID to search
- Press Enter or click Search button
- Clear button to reset search

### 2. Student Information Display
When a student is found, displays:
- **Personal Information**
  - Full Name
  - Student ID
  - Email
  - Course (if available)
  - Year (if available)

- **Check-In Status**
  - Recent check-in records (last 5)
  - Location information
  - Check-in/check-out times
  - Current status (On Site / Checked Out)

- **Logbook Entries**
  - All logbook entries for the student
  - Status of each entry (Pending/Approved/Rejected)
  - Hours worked
  - Week number
  - Activity descriptions
  - Quick review/view buttons

### 3. Quick Actions
From the student view, supervisors can:
- Review pending logbook entries
- View approved/rejected entries
- See check-in history
- Monitor student presence

## Frontend Changes

### File Modified
- `studylog-central/src/pages/SupervisorDashboard.tsx`

### New UI Components
1. **Search Card** - Highlighted search section with primary color accent
2. **Student Information Card** - Comprehensive student details view
3. **Check-In Status Section** - Visual check-in/check-out records
4. **Logbook Entries Section** - Inline logbook management

### New State Variables
```typescript
const [studentSearchId, setStudentSearchId] = useState("");
const [searchedStudent, setSearchedStudent] = useState<StudentInfo | null>(null);
const [studentLogbooks, setStudentLogbooks] = useState<LogbookEntry[]>([]);
const [studentCheckIns, setStudentCheckIns] = useState<CheckInInfo[]>([]);
const [isSearching, setIsSearching] = useState(false);
const [showStudentView, setShowStudentView] = useState(false);
```

### New Functions
- `searchStudent()` - Search for student by ID
- `clearStudentSearch()` - Reset search and clear results

## Backend Changes

### New Controller
**File:** `logbook/logbook/src/main/java/com/example/logbook/controller/StudentController.java`

### New Endpoints

#### 1. Search Student by Student ID
```
GET /api/students/search?studentId={studentId}
Authorization: Bearer {token}
Role: SUPERVISOR, ADMIN
```

**Response:**
```json
{
  "id": 5,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@student.edu",
  "studentId": "STU001",
  "course": "Computer Science",
  "year": 3,
  "role": "STUDENT"
}
```

#### 2. Get All Students
```
GET /api/students/all
Authorization: Bearer {token}
Role: SUPERVISOR, ADMIN
```

#### 3. Get Student by ID
```
GET /api/students/{id}
Authorization: Bearer {token}
Role: SUPERVISOR, ADMIN
```

#### 4. Get Students by Supervisor
```
GET /api/students/supervisor/{supervisorId}
Authorization: Bearer {token}
Role: SUPERVISOR, ADMIN
```

### Repository Updates
**File:** `logbook/logbook/src/main/java/com/example/logbook/repository/UserRepository.java`

Added methods:
```java
Optional<User> findByStudentId(String studentId);
List<User> findByOnsiteSupervisorOrUniversitySupervisor(User onsiteSupervisor, User universitySupervisor);
```

## Usage Workflow

### For Onsite Supervisors

1. **Student Arrives at Site**
   - Student checks in using their app
   - Supervisor sees them in check-in list

2. **Supervisor Needs to Find Student**
   - Enter student ID in search bar (e.g., "STU001")
   - Click Search or press Enter
   - Student information loads instantly

3. **View Student Details**
   - See personal information
   - Check current check-in status
   - Review recent check-ins
   - View all logbook entries

4. **Take Actions**
   - Review pending logbook entries directly
   - Approve or reject with comments
   - Monitor student activity
   - Verify hours worked

5. **Clear Search**
   - Click Clear button to search for another student
   - Return to general dashboard view

## Example Scenarios

### Scenario 1: Daily Check-In Verification
```
1. Student arrives and checks in
2. Supervisor searches: "STU001"
3. Sees "Currently On Site" badge
4. Reviews today's logbook entry
5. Approves with location verification
```

### Scenario 2: End of Day Review
```
1. Supervisor searches: "STU001"
2. Views all entries for the week
3. Checks total hours worked
4. Reviews activities completed
5. Provides feedback on pending entries
```

### Scenario 3: Attendance Verification
```
1. Supervisor searches: "STU001"
2. Views check-in history
3. Verifies attendance patterns
4. Checks check-in/check-out times
5. Confirms hours match logbook entries
```

## Testing

### Test the Search Feature

1. **Start the Frontend**
   ```bash
   cd studylog-central
   npm run dev
   ```

2. **Login as Supervisor**
   - Navigate to `/supervisor/login`
   - Use supervisor credentials

3. **Search for Student**
   - Enter a student ID (e.g., "STU001")
   - Click Search
   - Verify student information loads

4. **Test Actions**
   - Review a pending logbook entry
   - View check-in status
   - Clear search and try another student

### Sample Student IDs for Testing

If you need to create test students, use these IDs:
- STU001
- STU002
- STU003
- STU004
- STU005

## API Testing

### Using cURL

```bash
# Login as supervisor
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"supervisor@example.com","password":"password123"}'

# Save the token from response

# Search for student
curl -X GET "http://localhost:8080/api/students/search?studentId=STU001" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using PowerShell

```powershell
# Login
$loginBody = @{
    email = "supervisor@example.com"
    password = "password123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $loginBody

$token = $loginResponse.token

# Search student
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:8080/api/students/search?studentId=STU001" `
    -Method GET `
    -Headers $headers
```

## Benefits

### For Onsite Supervisors
- ✅ Quick student lookup by ID
- ✅ Instant access to student information
- ✅ Real-time check-in status
- ✅ Centralized logbook management
- ✅ Efficient daily operations

### For Students
- ✅ Faster approval process
- ✅ Better supervisor engagement
- ✅ Immediate feedback
- ✅ Transparent tracking

### For System
- ✅ Improved workflow efficiency
- ✅ Better data organization
- ✅ Enhanced supervisor experience
- ✅ Streamlined operations

## Security

- All endpoints require authentication
- Role-based access control (SUPERVISOR, ADMIN only)
- Student data protected by JWT tokens
- Search limited to assigned students (future enhancement)

## Future Enhancements

1. **Barcode/QR Code Scanning**
   - Scan student ID cards
   - Instant lookup

2. **Filtered Search**
   - Search by name
   - Search by course
   - Search by year

3. **Bulk Operations**
   - Approve multiple entries
   - Export student data
   - Generate reports

4. **Real-Time Updates**
   - WebSocket notifications
   - Live check-in status
   - Instant logbook updates

5. **Advanced Filters**
   - Filter by check-in status
   - Filter by approval status
   - Filter by date range

## Troubleshooting

### Student Not Found
- Verify student ID is correct
- Check if student is registered
- Ensure student has correct role

### Search Not Working
- Check backend is running on port 8080
- Verify supervisor is logged in
- Check network connection

### No Logbook Entries
- Student may not have created entries yet
- Check date range
- Verify student is assigned to supervisor

### Check-In Data Missing
- Student may not have checked in yet
- Check if check-in feature is enabled
- Verify check-in endpoint is working

## Summary

The student search feature transforms the onsite supervisor experience by providing instant access to student information, check-in status, and logbook entries. This enables supervisors to efficiently manage students on-site, verify attendance, and provide timely feedback on logbook entries.

**Total New Endpoints:** 4
**Total Endpoints Now:** 54
**Frontend Components Modified:** 1
**Backend Controllers Added:** 1
**Repository Methods Added:** 2
