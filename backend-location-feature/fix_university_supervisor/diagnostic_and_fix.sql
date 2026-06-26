-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 1: Run these diagnostics first to find the root cause
-- ─────────────────────────────────────────────────────────────────────────────

-- Check supervisor records — supervisorType must be 'UNIVERSITY' not NULL
SELECT id, first_name, last_name, email, supervisor_type
FROM users
WHERE role = 'SUPERVISOR';

-- Check student records — university_supervisor_id must NOT be NULL
SELECT id, first_name, last_name, email,
       onsite_supervisor_id,
       university_supervisor_id
FROM users
WHERE role = 'STUDENT';

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 2: Fix supervisor_type if it is NULL
-- Replace 'university@example.com' with the actual university supervisor email
-- ─────────────────────────────────────────────────────────────────────────────

UPDATE users
SET supervisor_type = 'UNIVERSITY'
WHERE role = 'SUPERVISOR'
  AND supervisor_type IS NULL
  AND email LIKE '%university%';   -- adjust this filter to match your data

-- Or update a specific supervisor by ID:
-- UPDATE users SET supervisor_type = 'UNIVERSITY' WHERE id = <supervisor_id>;

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 3: Fix missing university_supervisor_id on student rows
-- Replace the IDs with your actual values
-- ─────────────────────────────────────────────────────────────────────────────

-- Assign university supervisor (id = X) to student (id = Y):
-- UPDATE users
-- SET university_supervisor_id = <university_supervisor_id>
-- WHERE id = <student_id>
--   AND role = 'STUDENT';

-- Bulk: assign one university supervisor to all students who have no assignment:
-- UPDATE users
-- SET university_supervisor_id = <university_supervisor_id>
-- WHERE role = 'STUDENT'
--   AND university_supervisor_id IS NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 4: Verify assignments look correct
-- ─────────────────────────────────────────────────────────────────────────────

SELECT
    s.id          AS student_id,
    s.first_name  AS student_name,
    u.first_name  AS university_supervisor,
    u.supervisor_type
FROM users s
LEFT JOIN users u ON s.university_supervisor_id = u.id
WHERE s.role = 'STUDENT';
