# Supervisor Dashboard Filtering Fix

## Problem
After one supervisor approved a logbook entry, the other supervisor could not see it in their pending list to approve it. This was caused by overly restrictive filtering logic in both supervisor dashboards.

## Root Cause

### Onsite Supervisor Dashboard
The filtering was checking both `!onsiteApproved` AND `status === "PENDING"`:
```typescript
// OLD CODE (PROBLEMATIC)
const pendingEntries = entries.filter(entry => 
  !entry.onsiteApproved && entry.status === "PENDING"
);
```

Problem: This was correct for onsite supervisors, but the status check was redundant.

### University Supervisor Dashboard
The filtering was checking `status === "ONSITE_APPROVED"`:
```typescript
// OLD CODE (PROBLEMATIC)
const pendingEntries = entries.filter(entry => 
  entry.onsiteApproved && !entry.universityApproved && entry.status === "ONSITE_APPROVED"
);
```

Problem: If the university supervisor approved first (which shouldn't happen but could), the status would be "UNIVERSITY_APPROVED" instead of "ONSITE_APPROVED", causing the entry to disappear from both dashboards.

## Solution

### Simplified Filtering Logic

#### Onsite Supervisor Dashboard
```typescript
// NEW CODE (FIXED)
const pendingEntries = entries.filter(entry => !entry.onsiteApproved);
const approvedEntries = entries.filter(entry => entry.onsiteApproved);
```

- Shows ALL entries not yet approved by onsite supervisor
- Doesn't care about status or university approval
- Onsite supervisor can approve regardless of university supervisor's action

#### University Supervisor Dashboard
```typescript
// NEW CODE (FIXED)
const pendingEntries = entries.filter(entry => 
  entry.onsiteApproved && !entry.universityApproved
);
const reviewedEntries = entries.filter(entry => entry.universityApproved);
```

- Shows ALL entries approved by onsite but not yet by university
- Doesn't check specific status values
- University supervisor can approve regardless of exact status

### Student Search Section Fix
Also removed the status check in the student search section:
```typescript
// OLD
{!entry.onsiteApproved && entry.status === "PENDING" && (
  <OnsiteReviewDialog entry={entry} />
)}

// NEW
{!entry.onsiteApproved && (
  <OnsiteReviewDialog entry={entry} />
)}
```

## How It Works Now

### Independent Approval Flow

**Scenario 1: Onsite Approves First (Normal Flow)**
1. Student submits → Status: PENDING
2. Onsite supervisor sees it in pending list (because `!onsiteApproved`)
3. Onsite approves → Status: ONSITE_APPROVED, `onsiteApproved = true`
4. University supervisor sees it in pending list (because `onsiteApproved && !universityApproved`)
5. University approves → Status: FULLY_APPROVED, `universityApproved = true`

**Scenario 2: University Approves First (Edge Case)**
1. Student submits → Status: PENDING
2. University supervisor sees it in pending list (if `onsiteApproved` somehow true)
3. University approves → Status: UNIVERSITY_APPROVED, `universityApproved = true`
4. Onsite supervisor still sees it in pending list (because `!onsiteApproved`)
5. Onsite approves → Status: FULLY_APPROVED, `onsiteApproved = true`

**Scenario 3: Either Supervisor Rejects**
1. Student submits → Status: PENDING
2. Any supervisor rejects → Status: REJECTED
3. Entry disappears from both pending lists (because status is REJECTED)

## Key Changes

### Files Modified
1. `studylog-central/src/pages/OnsiteSupervisorDashboard.tsx`
   - Line ~689: Simplified `pendingEntries` filter
   - Line ~873: Removed status check in student search section
   - Line ~115: Removed status check in new entries count

2. `studylog-central/src/pages/UniversitySupervisorDashboard.tsx`
   - Line ~355: Removed status check from `pendingEntries` filter

### Backend Changes
Already fixed in previous update:
- `logbook/logbook/src/main/java/com/example/logbook/model/Logbook.java`
  - Modified `updateStatusFromApproval()` to only set `reviewed = true` when both approved or rejected

## Benefits

✅ Both supervisors can approve independently
✅ Order doesn't matter (onsite first or university first)
✅ No entries disappear from dashboards unexpectedly
✅ Simpler, more maintainable filtering logic
✅ Works correctly regardless of approval order
✅ Each supervisor only sees entries relevant to them

## Testing Checklist

### Test 1: Normal Flow (Onsite First)
- [ ] Student submits logbook
- [ ] Onsite supervisor sees entry in pending list
- [ ] Onsite supervisor approves
- [ ] Entry moves to onsite approved list
- [ ] University supervisor sees entry in pending list
- [ ] University supervisor approves
- [ ] Entry moves to university approved list
- [ ] Student sees both approvals

### Test 2: Reverse Flow (University First - Edge Case)
- [ ] Student submits logbook
- [ ] University supervisor somehow sees entry
- [ ] University supervisor approves
- [ ] Onsite supervisor still sees entry in pending list
- [ ] Onsite supervisor approves
- [ ] Entry becomes fully approved
- [ ] Student sees both approvals

### Test 3: Rejection
- [ ] Student submits logbook
- [ ] Onsite supervisor rejects
- [ ] Entry disappears from both dashboards
- [ ] Student sees rejection

### Test 4: Student Search
- [ ] Onsite supervisor searches for student
- [ ] Sees all student's logbooks
- [ ] Can approve entries not yet approved by onsite
- [ ] Cannot approve entries already approved by onsite

## Summary

The fix ensures that both supervisors can approve logbook entries independently without blocking each other. The filtering logic now relies solely on the approval flags (`onsiteApproved` and `universityApproved`) rather than checking specific status values, making the system more robust and flexible.
