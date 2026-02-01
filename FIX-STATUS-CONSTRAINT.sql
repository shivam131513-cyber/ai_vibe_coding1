-- ============================================
-- FIX: Update Status Check Constraint
-- Fixes "reports_status_check" constraint violation
-- ============================================

-- Drop the old constraint
ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_status_check;

-- Add new constraint with all valid status values
ALTER TABLE reports ADD CONSTRAINT reports_status_check 
CHECK (status IN ('sent', 'acknowledged', 'in_progress', 'resolved', 'verified'));

-- Verify the constraint
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'reports'::regclass
  AND conname = 'reports_status_check';

-- Success message
SELECT '✅ Status constraint updated! You can now submit reports.' as status;
