# Student Registration - University Supervisor Filter Fix

## Problem
Students were not seeing any supervisors in the dropdown during registration because the backend API wasn't returning the `supervisorType` field.

## Root Cause
The `/api/admin/supervisors` endpoint in `AdminController.java` was not including the `supervisorType` field in the response, so the frontend couldn't filter between ONSITE and UNIVERSITY supervisors.

## Solution

### Backend Changes (AdminController.java)
Added `supervisorType` field to the supervisor response:

```java
@GetMapping("/supervisors")
public ResponseEntity<?> getAllSupervisors() {
    List<User> supervisors = userService.getAllSupervisors();
    
    List<Map<String, Object>> supervisorList = supervisors.stream()
        .map(supervisor -> {
            Map<String, Object> info = new HashMap<>();
            info.put("id", supervisor.getId());
            info.put("firstName", supervisor.getFirstName());
            info.put("lastName", supervisor.getLastName());
            info.put("email", supervisor.getEmail());
            info.put("department", supervisor.getDepartment());
            info.put("staffId", supervisor.getStaffId());
            // NEW: Include supervisorType
            info.put("supervisorType", supervisor.getSupervisorType() != null 
                ? supervisor.getSupervisorType().toString() 
                : "UNIVERSITY");
            return info;
        })
        .collect(Collectors.toList());
    
    return ResponseEntity.ok(supervisorList);
}
```

### Frontend Changes (StudentRegister.tsx)
Already implemented filtering logic:

```typescript
const fetchSupervisors = async () => {
    const response = await fetch("http://localhost:8080/api/admin/supervisors");
    const data = await response.json();
    
    // Filter to only show UNIVERSITY supervisors
    const universitySupervisors = data.filter((supervisor: Supervisor) => 
        supervisor.supervisorType === 'UNIVERSITY'
    );
    
    setSupervisors(universitySupervisors);
};
```

## Why This Design?

### Students Select University Supervisors Only
- University supervisors are academic advisors assigned during registration
- They provide final academic approval of logbook entries
- Students can choose their university supervisor or admin can assign later

### Onsite Supervisors Are Assigned by Company
- Onsite supervisors are workplace supervisors at the placement site
- They are assigned by the company/organization where student works
- They verify daily attendance, activities, and hours worked
- Not selectable during student registration

## Approval Workflow
1. Student submits logbook entry
2. Onsite supervisor (at workplace) reviews and approves first
3. University supervisor (academic) provides final approval
4. Entry becomes FULLY_APPROVED when both approve

## Testing
1. Register as university supervisor with sample data
2. Go to student registration page
3. Verify university supervisors appear in dropdown
4. Verify onsite supervisors do NOT appear
5. Successfully register student with university supervisor

## Files Modified
- `logbook/logbook/src/main/java/com/example/logbook/controller/AdminController.java`
- `studylog-central/src/pages/StudentRegister.tsx` (already had filtering logic)
