# Debug Onsite Approval Error

## 🐛 Problem

When clicking "Review & Verify" and trying to approve, the data fails to be sent and nothing is inserted into the database.

## 🔍 Debugging Steps

### Step 1: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try to approve an entry
4. Look for error messages

**What to look for:**
- Red error messages
- Network errors
- 400/403/500 status codes

### Step 2: Check Network Tab

1. Open DevTools (F12)
2. Go to Network tab
3. Try to approve an entry
4. Find the request to `/api/approvals/onsite/{id}`
5. Click on it to see details

**Check:**
- **Status Code:** Should be 200, if not check what it is
- **Request Payload:** What data is being sent
- **Response:** What error message is returned

### Step 3: Check Backend Logs

Look at your backend console for error messages. You should see:

```
=== POST /api/approvals/onsite/1 ===
Supervisor: John Doe
Supervisor Type: ONSITE
```

If you see errors, copy them.

## 🎯 Common Issues & Solutions

### Issue 1: "Only onsite supervisors can create onsite approvals"

**Cause:** Your supervisor type in database is not ONSITE

**Solution:**
```sql
UPDATE users 
SET supervisorType = 'ONSITE' 
WHERE email = 'YOUR_EMAIL';
```

### Issue 2: "Table 'onsite_approvals' doesn't exist"

**Cause:** Database tables not created

**Solution:**
Run this SQL in phpMyAdmin:
```sql
CREATE TABLE IF NOT EXISTS onsite_approvals (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    logbook_id BIGINT NOT NULL UNIQUE,
    supervisor_id BIGINT NOT NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    comments TEXT,
    presence_confirmed BOOLEAN DEFAULT FALSE,
    location_latitude DECIMAL(10, 8),
    location_longitude DECIMAL(11, 8),
    validated_activities TEXT,
    actual_hours_worked DECIMAL(4, 2),
    photo_evidence_url VARCHAR(500),
    approval_date DATETIME,
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (logbook_id) REFERENCES logbooks(id) ON DELETE CASCADE,
    FOREIGN KEY (supervisor_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Issue 3: "Cannot add or update a child row: a foreign key constraint fails"

**Cause:** Logbook ID or Supervisor ID doesn't exist

**Solution:**
Check if the logbook exists:
```sql
SELECT * FROM logbooks WHERE id = YOUR_LOGBOOK_ID;
```

Check if the supervisor exists:
```sql
SELECT * FROM users WHERE email = 'YOUR_EMAIL';
```

### Issue 4: 401 Unauthorized

**Cause:** Token expired or invalid

**Solution:**
- Logout and login again
- Check if token is in localStorage: `localStorage.getItem('token')`

### Issue 5: 400 Bad Request - "Comments are required"

**Cause:** Frontend not sending required fields

**Solution:** Make sure you fill in the comments field before approving

## 📊 What Data Should Be Sent

When you click "Approve with Verification", the frontend should send:

```json
{
  "status": "APPROVED",
  "comments": "Your comments here",
  "presenceConfirmed": true,
  "locationLatitude": -6.7924,
  "locationLongitude": 39.2083,
  "validatedActivities": "Validated activities text",
  "actualHoursWorked": 8.0,
  "photoEvidenceUrl": "data:image/jpeg;base64,..."
}
```

## 🔧 Quick Fixes

### Fix 1: Check Database Tables Exist

```sql
SHOW TABLES LIKE '%approval%';
```

Should show:
- `onsite_approvals`
- `university_approvals`

If not, run: `logbook/CREATE_SEPARATE_APPROVAL_TABLES.sql`

### Fix 2: Check Supervisor Type

```sql
SELECT id, email, role, supervisorType 
FROM users 
WHERE email = 'YOUR_EMAIL';
```

Should show `supervisorType = 'ONSITE'`

If not:
```sql
UPDATE users 
SET supervisorType = 'ONSITE' 
WHERE email = 'YOUR_EMAIL';
```

### Fix 3: Check Logbook Exists

```sql
SELECT id, date, student_id, status 
FROM logbooks 
WHERE id = YOUR_LOGBOOK_ID;
```

Should return a row. If not, the logbook doesn't exist.

### Fix 4: Test Endpoint Manually

Use this HTML file to test the endpoint:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Test Onsite Approval</title>
</head>
<body>
    <h1>Test Onsite Approval Endpoint</h1>
    
    <form id="testForm">
        <label>Token:</label><br>
        <input type="text" id="token" style="width: 500px"><br><br>
        
        <label>Logbook ID:</label><br>
        <input type="number" id="logbookId" value="1"><br><br>
        
        <label>Comments:</label><br>
        <textarea id="comments" rows="3" cols="50">Test approval</textarea><br><br>
        
        <label>
            <input type="checkbox" id="presenceConfirmed" checked>
            Presence Confirmed
        </label><br><br>
        
        <button type="submit">Test Approval</button>
    </form>
    
    <h2>Response:</h2>
    <pre id="response"></pre>
    
    <script>
        document.getElementById('testForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const token = document.getElementById('token').value;
            const logbookId = document.getElementById('logbookId').value;
            const comments = document.getElementById('comments').value;
            const presenceConfirmed = document.getElementById('presenceConfirmed').checked;
            
            try {
                const response = await fetch(`http://localhost:8080/api/approvals/onsite/${logbookId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        status: 'APPROVED',
                        comments: comments,
                        presenceConfirmed: presenceConfirmed,
                        locationLatitude: -6.7924,
                        locationLongitude: 39.2083,
                        validatedActivities: 'Test validated activities',
                        actualHoursWorked: 8.0
                    })
                });
                
                const data = await response.text();
                document.getElementById('response').textContent = 
                    `Status: ${response.status}\n\n${data}`;
                    
            } catch (error) {
                document.getElementById('response').textContent = 
                    `Error: ${error.message}`;
            }
        });
        
        // Auto-fill token from localStorage
        const token = localStorage.getItem('token');
        if (token) {
            document.getElementById('token').value = token;
        }
    </script>
</body>
</html>
```

Save this as `test_onsite_approval.html` and open it in your browser.

## 📝 Information I Need

To help you fix this, please provide:

1. **Browser Console Error** (F12 → Console tab)
2. **Network Request Details** (F12 → Network tab → Click on the failed request)
   - Status code
   - Request payload
   - Response
3. **Backend Console Error** (from your terminal where backend is running)
4. **Database Check Results:**
   ```sql
   -- Check if tables exist
   SHOW TABLES LIKE '%approval%';
   
   -- Check your supervisor type
   SELECT email, supervisorType FROM users WHERE email = 'YOUR_EMAIL';
   
   -- Check if logbook exists
   SELECT id, date, status FROM logbooks LIMIT 5;
   ```

## 🎯 Most Likely Causes

Based on common issues:

1. **70% chance:** `onsite_approvals` table doesn't exist
2. **20% chance:** Supervisor type is not set to ONSITE
3. **5% chance:** Token expired
4. **5% chance:** Other database constraint issue

## ✅ Quick Test

Run this in phpMyAdmin to test if you can insert manually:

```sql
-- Get a supervisor ID
SET @supervisor_id = (SELECT id FROM users WHERE role = 'SUPERVISOR' LIMIT 1);

-- Get a logbook ID
SET @logbook_id = (SELECT id FROM logbooks LIMIT 1);

-- Try to insert
INSERT INTO onsite_approvals (
    logbook_id,
    supervisor_id,
    status,
    comments,
    presence_confirmed,
    approval_date,
    created_at,
    updated_at
) VALUES (
    @logbook_id,
    @supervisor_id,
    'APPROVED',
    'Test approval',
    TRUE,
    NOW(),
    NOW(),
    NOW()
);

-- Check if it worked
SELECT * FROM onsite_approvals ORDER BY id DESC LIMIT 1;
```

If this works, the problem is in the endpoint. If it fails, the problem is in the database setup.
