-- Test membership data query
-- Run this to check if membership data exists

-- 1. Check member profiles
SELECT 
    id,
    member_id,
    user_id,
    full_name,
    created_at
FROM member_profiles
LIMIT 5;

-- 2. Check memberships for each member
SELECT 
    m.id as membership_id,
    m.member_id,
    m.status,
    m.joined_date,
    m.expiry_date,
    mp.full_name,
    mt.name as membership_type
FROM memberships m
JOIN member_profiles mp ON m.member_id = mp.id
LEFT JOIN membership_types mt ON m.membership_type_id = mt.id
LIMIT 10;

-- 3. Check if membership_types exist
SELECT 
    id,
    name,
    category,
    benefits
FROM membership_types
LIMIT 5;
