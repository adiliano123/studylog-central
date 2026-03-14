# Files That Enable Independent Supervisor Approval

## Overview
This document lists all files that work together to provide independent approval functionality where both onsite and university supervisors can approve logbooks independently without blocking each other.

---

## 🗄️ DATABASE LAYER

### 1. Separate Approval Tables (SQL)

**File:** `logbook/CREATE_SEPARATE_APPROVAL_TABLES.sql`

**Purpose:** Creates two independent tables for approvals

**Key Tables:**
- `onsite_approvals` - Stores onsite supervisor approvals
- `university_approvals` - Stores university supervisor approvals

**Why Important:** 
- Each supervisor type has their own table
- No conflicts or blocking between supervisor types
- Each logbook can have ONE onsite approval AND ONE university approval

```sql
CREATE TABLE onsite_approvals (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    logbook_id BIGINT NOT NULL UNIQUE,
    supervisor_id BIGINT NOT NULL,
    status ENUM('APPROVED', 'REJECTED') NOT NULL,
    -- ... other fields
);

CREATE TABLE university_approvals (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    logbook_id BIGINT NOT NULL UNIQUE,
    supervisor_id BIGINT NOT NULL,
    status ENUM('APPROVED', 'REJECTED') NOT NULL,
    -- ... other fields
);
```

---

## 📦 BACKEND - MODEL LAYER

### 2. Onsite Approval Model

**File:** `logbook/logbook/src/main/java/com/example/logbook/model/OnsiteApproval.java`

**Purpose:** Entity model for onsite approvals

**Key Features:**
- Separate entity from university approvals
- One-to-one relationship with Logbook
- Contains onsite-specific fields (presence_confirmed, location, photo_evidence)

```java
@Entity
@Table(name = "onsite_approvals")
public class OnsiteApproval {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "logbook_id", unique = true)
    private Logbook logbook;
    
    @ManyToOne
    @JoinColumn(name = "supervisor_id")
    private User supervisor;
    
    @Enumerated(EnumType.STRING)
    private ApprovalStatus status;
    
    // Onsite-specific fields
    private Boolean presenceConfirmed;
    private Double locationLatitude;
    private Double locationLongitude;
    // ...
}
```

### 3. University Approval Model

**File:** `logbook/logbook/src/main/java/com/example/logbook/model/UniversityApproval.java`

**Purpose:** Entity model for university approvals

**Key Features:**
- Separate entity from onsite approvals
- One-to-one relationship with Logbook
- Contains university-specific fields (academic_assessment, learning_outcomes)

```java
@Entity
@Table(name = "university_approvals")
public class UniversityApproval {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "logbook_id", unique = true)
    private Logbook logbook;
    
    @ManyToOne
    @JoinColumn(name = "supervisor_id")
    private User supervisor;
    
    @Enumerated(EnumType.STRING)
    private ApprovalStatus status;
    
    // University-specific fields
    private String academicAssessment;
    private Boolean learningOutcomesMet;
    // ...
}
```

### 4. Logbook Model (Updated)

**File:** `logbook/logbook/src/main/java/com/example/logbook/model/Logbook.java`

**Purpose:** Main logbook entity with independent approval tracking

**Key Features:**
- Two separate boolean flags: `onsiteApproved` and `universityApproved`
- Two separate relationships: `onsiteApproval` and `universityApproval`
- Independent status update methods

```java
@Entity
@Table(name = "logbooks")
public class Logbook {
    // Separate approval flags
    private Boolean onsiteApproved = false;
    private Boolean universityApproved = false;
    
    // Separate relationships
    @OneToOne(mappedBy = "logbook")
    private OnsiteApproval onsiteApproval;
    
    @OneToOne(mappedBy = "logbook")
    private UniversityApproval universityApproval;
    
    // Independent update methods
    public void updateStatusFromOnsiteApproval(OnsiteApproval.ApprovalStatus status) {
        if (status == APPROVED) {
            this.onsiteApproved = true;
            if (this.universityApproved) {
                this.status = FULLY_APPROVED;
            } else {
                this.status = ONSITE_APPROVED;
            }
        }
    }
    
    public void updateStatusFromUniversityApproval(UniversityApproval.ApprovalStatus status) {
        if (status == APPROVED) {
            this.universityApproved = true;
            if (this.onsiteApproved) {
                this.status = FULLY_APPROVED;
            } else {
                this.status = UNIVERSITY_APPROVED;
            }
        }
    }
}
```

---

## 📦 BACKEND - REPOSITORY LAYER

### 5. Onsite Approval Repository

**File:** `logbook/logbook/src/main/java/com/example/logbook/repository/OnsiteApprovalRepository.java`

**Purpose:** Data access for onsite approvals

**Key Methods:**
- `findByLogbookId()` - Get onsite approval for a logbook
- `existsByLogbookId()` - Check if onsite approval exists
- `findBySupervisor()` - Get all approvals by a supervisor

```java
@Repository
public interface OnsiteApprovalRepository extends JpaRepository<OnsiteApproval, Long> {
    Optional<OnsiteApproval> findByLogbookId(Long logbookId);
    boolean existsByLogbookId(Long logbookId);
    List<OnsiteApproval> findBySupervisor(User supervisor);
    List<OnsiteApproval> findByStatus(OnsiteApproval.ApprovalStatus status);
}
```

### 6. University Approval Repository

**File:** `logbook/logbook/src/main/java/com/example/logbook/repository/UniversityApprovalRepository.java`

**Purpose:** Data access for university approvals

**Key Methods:**
- `findByLogbookId()` - Get university approval for a logbook
- `existsByLogbookId()` - Check if university approval exists
- `findBySupervisor()` - Get all approvals by a supervisor

```java
@Repository
public interface UniversityApprovalRepository extends JpaRepository<UniversityApproval, Long> {
    Optional<UniversityApproval> findByLogbookId(Long logbookId);
    boolean existsByLogbookId(Long logbookId);
    List<UniversityApproval> findBySupervisor(User supervisor);
    List<UniversityApproval> findByStatus(UniversityApproval.ApprovalStatus status);
}
```

---

## 📦 BACKEND - SERVICE LAYER

### 7. Onsite Approval Service

**File:** `logbook/logbook/src/main/java/com/example/logbook/service/OnsiteApprovalService.java`

**Purpose:** Business logic for onsite approvals

**Key Features:**
- Creates/updates onsite approvals independently
- Validates supervisor type is ONSITE
- Updates logbook status after approval
- Uses `@Transactional` for atomic operations

```java
@Service
public class OnsiteApprovalService {
    @Transactional
    public OnsiteApproval createOrUpdateApproval(Long logbookId, User supervisor, OnsiteApproval approvalData) {
        // Verify supervisor is onsite type
        if (supervisor.getSupervisorType() != User.SupervisorType.ONSITE) {
            throw new RuntimeException("Only onsite supervisors can create onsite approvals");
        }
        
        // Get logbook
        Logbook logbook = logbookRepository.findById(logbookId)
                .orElseThrow(() -> new RuntimeException("Logbook not found"));
        
        // Create or update approval
        OnsiteApproval approval = onsiteApprovalRepository.findByLogbookId(logbookId)
                .orElse(new OnsiteApproval());
        
        // Set data and save
        approval.setLogbook(logbook);
        approval.setSupervisor(supervisor);
        approval.setStatus(approvalData.getStatus());
        // ... set other fields
        
        OnsiteApproval savedApproval = onsiteApprovalRepository.save(approval);
        
        // Update logbook status INDEPENDENTLY
        logbook.updateStatusFromOnsiteApproval(approvalData.getStatus());
        logbookRepository.save(logbook);
        
        return savedApproval;
    }
}
```

### 8. University Approval Service

**File:** `logbook/logbook/src/main/java/com/example/logbook/service/UniversityApprovalService.java`

**Purpose:** Business logic for university approvals

**Key Features:**
- Creates/updates university approvals independently
- Validates supervisor type is UNIVERSITY
- Updates logbook status after approval
- Uses `@Transactional` for atomic operations

```java
@Service
public class UniversityApprovalService {
    @Transactional
    public UniversityApproval createOrUpdateApproval(Long logbookId, User supervisor, UniversityApproval approvalData) {
        // Verify supervisor is university type
        if (supervisor.getSupervisorType() != User.SupervisorType.UNIVERSITY) {
            throw new RuntimeException("Only university supervisors can create university approvals");
        }
        
        // Get logbook
        Logbook logbook = logbookRepository.findById(logbookId)
                .orElseThrow(() -> new RuntimeException("Logbook not found"));
        
        // Create or update approval
        UniversityApproval approval = universityApprovalRepository.findByLogbookId(logbookId)
                .orElse(new UniversityApproval());
        
        // Set data and save
        approval.setLogbook(logbook);
        approval.setSupervisor(supervisor);
        approval.setStatus(approvalData.getStatus());
        // ... set other fields
        
        UniversityApproval savedApproval = universityApprovalRepository.save(approval);
        
        // Update logbook status INDEPENDENTLY
        logbook.updateStatusFromUniversityApproval(approvalData.getStatus());
        logbookRepository.save(logbook);
        
        return savedApproval;
    }
}
```

---

## 📦 BACKEND - CONTROLLER LAYER

### 9. Onsite Approval Controller

**File:** `logbook/logbook/src/main/java/com/example/logbook/controller/OnsiteApprovalController.java`

**Purpose:** REST API endpoints for onsite approvals

**Key Endpoints:**
- `POST /api/approvals/onsite/{logbookId}` - Create/update onsite approval
- `GET /api/approvals/onsite/{logbookId}` - Get onsite approval
- `POST /api/approvals/onsite/bulk-approve` - Bulk approve

```java
@RestController
@RequestMapping("/api/approvals/onsite")
public class OnsiteApprovalController {
    @PostMapping("/{logbookId}")
    @PreAuthorize("hasRole('ROLE_SUPERVISOR')")
    public ResponseEntity<?> createOnsiteApproval(
            @PathVariable Long logbookId,
            @RequestBody OnsiteApprovalRequest request,
            Authentication authentication) {
        
        User supervisor = userService.getUserByEmail(email);
        
        // Verify supervisor is onsite type
        if (supervisor.getSupervisorType() != User.SupervisorType.ONSITE) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only onsite supervisors can create onsite approvals");
        }
        
        OnsiteApproval savedApproval = onsiteApprovalService.createOrUpdateApproval(
                logbookId, supervisor, approvalData);
        
        return ResponseEntity.ok(savedApproval);
    }
}
```

### 10. University Approval Controller

**File:** `logbook/logbook/src/main/java/com/example/logbook/controller/UniversityApprovalController.java`

**Purpose:** REST API endpoints for university approvals

**Key Endpoints:**
- `POST /api/approvals/university/{logbookId}` - Create/update university approval
- `GET /api/approvals/university/{logbookId}` - Get university approval

```java
@RestController
@RequestMapping("/api/approvals/university")
public class UniversityApprovalController {
    @PostMapping("/{logbookId}")
    @PreAuthorize("hasRole('ROLE_SUPERVISOR')")
    public ResponseEntity<?> createUniversityApproval(
            @PathVariable Long logbookId,
            @RequestBody UniversityApprovalRequest request,
            Authentication authentication) {
        
        User supervisor = userService.getUserByEmail(email);
        
        // Verify supervisor is university type
        if (supervisor.getSupervisorType() != User.SupervisorType.UNIVERSITY) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only university supervisors can create university approvals");
        }
        
        UniversityApproval savedApproval = universityApprovalService.createOrUpdateApproval(
                logbookId, supervisor, approvalData);
        
        return ResponseEntity.ok(savedApproval);
    }
}
```

---

## 🎨 FRONTEND LAYER

### 11. Onsite Supervisor Dashboard

**File:** `studylog-central/src/pages/OnsiteSupervisorDashboard.tsx`

**Purpose:** UI for onsite supervisors to approve logbooks

**Key Features:**
- Filters entries by `!entry.onsiteApproved`
- Calls `POST /api/approvals/onsite/{logbookId}`
- Shows only entries pending onsite approval
- Independent from university approval status

```typescript
// Filter for onsite supervisor
const pendingEntries = entries.filter(entry => !entry.onsiteApproved);

// Approval handler
const handleOnsiteApproval = async (logbookId: number, approvalData: OnsiteApprovalRequest) => {
    const response = await fetch(`http://localhost:8080/api/approvals/onsite/${logbookId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(approvalData),
    });
    // ...
};
```

### 12. University Supervisor Dashboard

**File:** `studylog-central/src/pages/UniversitySupervisorDashboard.tsx`

**Purpose:** UI for university supervisors to approve logbooks

**Key Features:**
- Filters entries by `entry.onsiteApproved && !entry.universityApproved`
- Calls `POST /api/approvals/university/{logbookId}`
- Shows only entries pending university approval
- Independent from onsite approval process

```typescript
// Filter for university supervisor
const pendingEntries = entries.filter(entry => 
    entry.onsiteApproved && !entry.universityApproved
);

// Approval handler
const handleApprove = async (logbookId: number, comments: string) => {
    const response = await fetch(`http://localhost:8080/api/approvals/university/${logbookId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(approvalRequest),
    });
    // ...
};
```

---

## 🔑 KEY MECHANISMS FOR INDEPENDENCE

### 1. Separate Tables
- `onsite_approvals` and `university_approvals` are completely separate
- No shared records or conflicts
- Each can be created/updated independently

### 2. Separate Flags in Logbook
```java
private Boolean onsiteApproved = false;
private Boolean universityApproved = false;
```
- Two independent boolean flags
- One supervisor's approval doesn't affect the other's flag

### 3. Independent Status Update Methods
```java
// Onsite approval doesn't require university approval
public void updateStatusFromOnsiteApproval(ApprovalStatus status) {
    if (status == APPROVED) {
        this.onsiteApproved = true;
        // Check if BOTH approved for FULLY_APPROVED
        if (this.universityApproved) {
            this.status = FULLY_APPROVED;
        } else {
            this.status = ONSITE_APPROVED; // Can approve independently
        }
    }
}

// University approval doesn't require onsite approval
public void updateStatusFromUniversityApproval(ApprovalStatus status) {
    if (status == APPROVED) {
        this.universityApproved = true;
        // Check if BOTH approved for FULLY_APPROVED
        if (this.onsiteApproved) {
            this.status = FULLY_APPROVED;
        } else {
            this.status = UNIVERSITY_APPROVED; // Can approve independently
        }
    }
}
```

### 4. Separate Services
- `OnsiteApprovalService` handles only onsite approvals
- `UniversityApprovalService` handles only university approvals
- No cross-dependencies

### 5. Separate Controllers
- `/api/approvals/onsite/*` endpoints
- `/api/approvals/university/*` endpoints
- Different authorization checks

### 6. Separate Dashboards
- Onsite dashboard filters by `!onsiteApproved`
- University dashboard filters by `onsiteApproved && !universityApproved`
- Each supervisor sees only their pending items

---

## 📊 APPROVAL FLOW DIAGRAM

```
Student Creates Logbook
    ↓
status = PENDING
onsiteApproved = false
universityApproved = false
    ↓
    ├─→ Onsite Supervisor Approves
    │       ↓
    │   POST /api/approvals/onsite/{id}
    │       ↓
    │   Save to onsite_approvals table
    │       ↓
    │   onsiteApproved = true
    │   status = ONSITE_APPROVED
    │
    └─→ University Supervisor Approves
            ↓
        POST /api/approvals/university/{id}
            ↓
        Save to university_approvals table
            ↓
        universityApproved = true
        status = UNIVERSITY_APPROVED (or FULLY_APPROVED if onsite also approved)
```

**Key Point:** Either supervisor can approve first, and they don't block each other!

---

## ✅ SUMMARY

**Total Files: 12**

**Database:** 1 file
- CREATE_SEPARATE_APPROVAL_TABLES.sql

**Backend Models:** 3 files
- OnsiteApproval.java
- UniversityApproval.java
- Logbook.java

**Backend Repositories:** 2 files
- OnsiteApprovalRepository.java
- UniversityApprovalRepository.java

**Backend Services:** 2 files
- OnsiteApprovalService.java
- UniversityApprovalService.java

**Backend Controllers:** 2 files
- OnsiteApprovalController.java
- UniversityApprovalController.java

**Frontend:** 2 files
- OnsiteSupervisorDashboard.tsx
- UniversitySupervisorDashboard.tsx

**All these files work together to enable independent approval!**
