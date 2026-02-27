# VARA UAE Database Schema

## Currency: AED (United Arab Emirates Dirham)

## Structure

The database is organized into separate module files for easier maintenance:

| File | Module | Description |
|------|--------|-------------|
| `01_auth.sql` | Authentication | Users, password reset tokens |
| `02_membership.sql` | Membership | Member profiles, membership types, memberships, applications |
| `03_accounts.sql` | Accounts | Income/expense categories, income records, expense records, vendors |
| `04_events.sql` | Events | Events, event registrations, announcements |
| `05_jobs.sql` | Jobs | Job listings, job applicants |
| `06_admin.sql` | Admin | Admin profiles, board members |
| `07_audit.sql` | Audit | Activity logs, notifications |

## Execution Order

Run the SQL files in numerical order:

```bash
# PostgreSQL
psql -U username -d vara_db -f 01_auth.sql
psql -U username -d vara_db -f 02_membership.sql
psql -U username -d vara_db -f 03_accounts.sql
psql -U username -d vara_db -f 04_events.sql
psql -U username -d vara_db -f 05_jobs.sql
psql -U username -d vara_db -f 06_admin.sql
psql -U username -d vara_db -f 07_audit.sql
```

## Dependencies

- `02_membership.sql` depends on `01_auth.sql` (users table)
- `03_accounts.sql` depends on `01_auth.sql` (users table)
- `04_events.sql` depends on `01_auth.sql` and `02_membership.sql`
- `05_jobs.sql` depends on `01_auth.sql` and `02_membership.sql`
- `06_admin.sql` depends on `01_auth.sql`
- `07_audit.sql` depends on `01_auth.sql`

## Tables Overview

### Authentication (01_auth.sql)
- `users` - User accounts for authentication
- `password_reset_tokens` - Password reset functionality

### Membership (02_membership.sql)
- `member_profiles` - Detailed member information
- `membership_types` - Standard, Premium, Corporate memberships
- `memberships` - Active member subscriptions
- `membership_applications` - Pending membership requests

### Accounts (03_accounts.sql)
- `income_categories` - Income classification
- `expense_categories` - Expense classification
- `income_records` - All income transactions (AED)
- `expense_records` - All expense transactions (AED)
- `vendors` - Vendor/supplier directory

### Events (04_events.sql)
- `events` - Event listings
- `event_registrations` - Member event registrations
- `announcements` - System announcements

### Jobs (05_jobs.sql)
- `jobs` - Job postings (salary in AED)
- `job_applicants` - Job applications

### Admin (06_admin.sql)
- `admin_profiles` - Admin user details
- `board_members` - Board member management (superadmin/admin)

### Audit (07_audit.sql)
- `activity_logs` - System audit trail
- `notifications` - User notifications
