# Fix Approval Error - Step by Step

## 🎯 Most Likely Problem

The `onsite_approvals` table doesn't exist in your database.

## ✅ SOLUTION - Follow These Steps

### Step 1: Check if Table Exists

1. Open **phpMyAdmin** (XAMPP Control Panel → MySQL → Admin)
2. Select database `logbook_db` on the left
3. Look for table `onsite_approvals` in the list

**If you DON'T see it**, continue to Step 2.

### Step 2: Create the Tables

1. In phpMyAdmin, click on `logbook_db` database
2. Click the **SQL** tab at the top
3. Copy and paste this SQL:

```sql
-- Create onsite_approvals table
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

-- Create university_approvals table
CREATE TABLE IF NOT EXISTS university_approvals (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    logbook_id BIGINT NOT NULL UNIQUE,
    supervisor_id BIGINT NOT NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    comments TEXT,
    academic_assessment TEXT,
    learning_outcomes_met BOOLEAN DEFAULT FALSE,
    approval_date DATETIME,
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (logbook_id) REFERENCES logbooks(id) ON DELETE CASCADE,
    FOREIGN KEY (supervisor_id) REFERENCES users(id) ON DELETE CASCADE
);
```

4. Click **Go** button
5. You should see "2 rows affected" or success message

### Step 3: Verify Tables Were Created

Run this SQL:

```sql
SHOW TABLES LIKE '%approval%';
```

You should see:
- `onsite_approvals`
- `university_approvals`

### Step 4: Check Supervisor Type

Run this SQL (replace with your email):

```sql
SELECT id, email, role, supervisorType 
FROM users 
WHERE email = 'YOUR_EMAIL_HERE';
```

**If `supervisorType` is NULL**, run this:

```sql
UPDATE users 
SET supervisorType = 'ONSITE' 
WHERE email = 'YOUR_EMAIL_HERE';
```

### Step 5: Test Again

1. Go back to your browser
2. Refresh the page (F5)
3. Try to approve an entry again
4. It should work now!

## 🔍 If It Still Doesn't Work

### Check Backend Logs

Look at your backend console (where you ran `mvn spring-boot:run`).

You should see:
```
=== POST /api/approvals/onsite/1 ===
Supervisor: John Doe
Supervisor Type: ONSITE
Creating new onsite approval
Saved onsite approval ID: 1
Updated logbook status to: ONSITE_APPROVED
```

**If you see an error**, copy it and let me know.

### Check Browser Console

1. Press F12
2. Go to Console tab
3. Try to approve again
4. Look for red error messages

### Check Network Tab

1. Press F12
2. Go to Network tab
3. Try to approve again
4. Find the request to `/api/approvals/onsite/...`
5. Click on it
6. Check:
   - **Status:** Should be 200
   - **Response:** What does it say?

## 📊 Quick Database Test

Run this to test if you can insert manually:

```sql
-- Test insert
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
    (SELECT id FROM logbooks LIMIT 1),
    (SELECT id FROM users WHERE role = 'SUPERVISOR' LIMIT 1),
    'APPROVED',
    'Test approval',
    TRUE,
    NOW(),
    NOW(),
    NOW()
);

-- Check if it worked
SELECT * FROM onsite_approvals;
```

**If this fails**, there's a database constraint issue. Check:
- Do you have any logbooks? `SELECT * FROM logbooks;`
- Do you have any supervisors? `SELECT * FROM users WHERE role = 'SUPERVISOR';`

## ✅ Success Checklist

After following the steps, verify:

- [ ] `onsite_approvals` table exists
- [ ] `university_approvals` table exists
- [ ] Your supervisor has `supervisorType = 'ONSITE'`
- [ ] Backend is running without errors
- [ ] You can approve an entry
- [ ] Data appears in `onsite_approvals` table
- [ ] Logbook status changes to `ONSITE_APPROVED`

## 🎉 After It Works

Once you can approve successfully, check the database:

```sql
-- See your approval
SELECT 
    oa.id,
    oa.status,
    oa.comments,
    oa.presence_confirmed,
    oa.actual_hours_worked,
    oa.approval_date,
    CONCAT(u.firstName, ' ', u.lastName) as supervisor,
    l.date as logbook_date
FROM onsite_approvals oa
JOIN users u ON oa.supervisor_id = u.id
JOIN logbooks l ON oa.logbook_id = l.id
ORDER BY oa.id DESC;
```

You should see your approval data!

## 📞 Still Having Issues?

If it still doesn't work after following all steps, provide me with:

1. **Error from backend console**
2. **Error from browser console (F12)**
3. **Result of:** `SHOW TABLES LIKE '%approval%';`
4. **Result of:** `SELECT email, supervisorType FROM users WHERE email = 'YOUR_EMAIL';`
5. **Screenshot of the error message**

I'll help you fix it!
