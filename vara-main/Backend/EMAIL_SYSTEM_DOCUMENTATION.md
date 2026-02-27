# VARA Association - Email System Documentation

## Overview

The VARA membership system uses **MSG91** as the email service provider with a robust template-based email system. Emails are sent automatically at key points in the member lifecycle.

---

## Email Service Provider: MSG91

**Configuration** (from `.env`):
```env
MSG91_AUTH_KEY=489904A4Yyq90ru69734122P1
MSG91_SENDER_EMAIL=noreply@membership.varauae.com
MSG91_SENDER_NAME=vara
MSG91_DOMAIN=membership.varauae.com
MSG91_MEMBERREGISTRATION_TEMPLATE_ID=template_18_02_2026_15_02_5
MSG91_APPROVAL_TEMPLATE_ID=template_18_02_2026_15_02_7
MSG91_REJECTION_TEMPLATE_ID=template_19_02_2026_14_02_3
```

**API Endpoint**: `https://control.msg91.com/api/v5/email/send`

---

## Email Templates

### 1. Registration Confirmation Template
- **Template ID**: `template_18_02_2026_15_02_5`
- **Triggered**: When new member registers
- **Purpose**: Confirm registration and inform about pending admin approval

**Template Variables**:
- `VAR1`: Member Name (for personalization)
- `VAR2`: Organization Name ("VARA Association")
- `VAR3`: Expected Approval Time ("24-48 hours")
- `VAR4`: Support Email ("support@varauae.com")

### 2. Account Approval Template
- **Template ID**: `template_18_02_2026_15_02_7`
- **Triggered**: When admin approves member account
- **Purpose**: Notify member of approval with login credentials

**Template Variables**:
- `VAR1`: Member Name
- `VAR2`: Login Email  
- `VAR3`: Password
- `VAR4`: Login URL ("https://membership.varauae.com/login")
- `VAR5`: Organization Name ("VARA Association")

### 3. Account Rejection Template
- **Template ID**: `template_19_02_2026_14_02_3`
- **Triggered**: When admin rejects member application
- **Purpose**: Notify member of rejection with reason and support contact

**Template Variables**:
- `VAR1`: Member Name
- `VAR2`: Rejection Reason
- `VAR3`: Support Email ("support@varauae.com")
- `VAR4`: Organization Name ("VARA Association")

---

## Automatic Email Triggers

### 📧 Registration Confirmation Email

**When**: Automatically sent when member completes registration

**Process Flow**:
1. Member submits registration form (POST `/auth/register`)
2. User account created in database
3. Membership application created with status "pending"
4. **Email automatically sent** via `sendRegistrationConfirmationEmail()`
5. Registration completes successfully (even if email fails)

**Code Location**: 
- Trigger: [`src/controllers/authController.ts`](src/controllers/authController.ts#L357-L368)
- Service: [`src/services/emailService.ts`](src/services/emailService.ts)

**Example Log Output**:
```
📧 Preparing registration email...
  To: member@example.com
  Template ID: vara_01
  Sender: noreply@membership.varauae.com
📤 Sending email request to MSG91...
✅ Registration confirmation email sent successfully!
```

---

### 📧 Account Approval Email

**When**: Automatically sent when admin approves a member

**Process Flow**:
1. Admin clicks "Approve" on pending member (POST `/auth/approve/:userId`)
2. User's `is_verified` flag set to `true`
3. Membership application status updated to "approved"
4. Member profile created with unique Member ID
5. **Email automatically sent** via `sendApprovalEmail()`
6. Member can now login

**Code Location**: 
- Trigger: [`src/controllers/authController.ts`](src/controllers/authController.ts#L970-L981)
- Service: [`src/services/emailService.ts`](src/services/emailService.ts)

**Example Log Output**:
```
📧 Preparing approval email...
  To: member@example.com
  Template ID: template_18_02_2026_15_02_7
  Sender: noreply@membership.varauae.com
📤 Sending email to MSG91...
✅ Account approval email sent successfully!
```

---

### 📧 Account Rejection Email

**When**: Automatically sent when admin rejects a member application

**Process Flow**:
1. Admin clicks "Reject" on pending member (DELETE `/auth/reject/:userId`)
2. **Email automatically sent** via `sendRejectionEmail()`
3. User account deleted from database
4. User removed from Supabase Auth
5. Member cannot login anymore

**Code Location**: 
- Trigger: [`src/controllers/authController.ts`](src/controllers/authController.ts#L1022-L1033)
- Service: [`src/services/emailService.ts`](src/services/emailService.ts)

**Request Body** (Optional):
```json
{
  "rejectionReason": "Your application does not meet current membership criteria."
}
```

**Example Log Output**:
```
📧 Preparing rejection email...
  To: member@example.com
  Template ID: template_19_02_2026_14_02_3
  Sender: noreply@membership.varauae.com
📤 Sending rejection email to MSG91...
✅ Rejection email sent successfully!
❌ User rejected: member@example.com (ID: 12345)
```

---

## Technical Implementation

### MSG91 API Request Format (Template Mode)

```javascript
POST https://control.msg91.com/api/v5/email/send

Headers:
{
  "Content-Type": "application/json",
  "Accept": "application/json",
  "authkey": "<MSG91_AUTH_KEY>"
}

Body:
{
  "recipients": [
    {
      "to": [
        {
          "email": "member@example.com",
          "name": "Member Name"
        }
      ],
      "variables": {
        "VAR1": "Member Name",
        "VAR2": "VARA Association",
        "VAR3": "24-48 hours",
        "VAR4": "support@varauae.com"
      }
    }
  ],
  "from": {
    "email": "noreply@membership.varauae.com",
    "name": "vara"
  },
  "domain": "membership.varauae.com",
  "template_id": "vara_01"
}
```

### Email Service Architecture

**File**: `src/services/emailService.ts`

**Functions**:
1. `sendRegistrationConfirmationEmail({ memberEmail, memberName })`
   - Uses template ID: `template_18_02_2026_15_02_5`
   - Variables: VAR1-VAR4
   - Non-blocking operation

2. `sendApprovalEmail({ memberEmail, memberName, password })`
   - Uses template ID: `template_18_02_2026_15_02_7`
   - Variables: VAR1-VAR5
   - Non-blocking operation

3. `sendRejectionEmail({ memberEmail, memberName, rejectionReason? })`
   - Uses template ID: `template_19_02_2026_14_02_3`
   - Variables: VAR1-VAR4
   - Optional rejection reason parameter
   - Non-blocking operation

### Error Handling

✅ **Non-blocking**: Registration/Approval succeeds even if email fails
✅ **Comprehensive Logging**: All steps logged for debugging
✅ **Graceful Degradation**: Returns error details without throwing
✅ **Return Format**: `{ success: boolean; message: string; data?: any }`

**Example Error Handling**:
```typescript
try {
  await sendRegistrationConfirmationEmail({
    memberEmail: email,
    memberName: fullName
  });
  console.log('✅ Registration confirmation email sent successfully');
} catch (emailError: any) {
  console.error('⚠️ Email sending failed:', emailError.message);
  // Continue with registration even if email fails
}
```

---

## Setting Up MSG91 Templates

### Step 1: Create Template in MSG91 Dashboard
1. Login to MSG91 Dashboard
2. Navigate to **Email** → **Templates**
3. Click **Create New Template**

### Step 2: Registration Confirmation Template

**Template ID**: `vara_01`

**Subject**: `Welcome to VARA Association - Registration Confirmation`

**HTML Body** (use provided template with variables):
- Use `##VAR1##` for Member Name
- Use `##VAR2##` for Organization Name
- Use `##VAR3##` for Approval Time
- Use `##VAR4##` for Support Email

**Example**:
```html
<h1>Welcome to ##VAR2##, ##VAR1##!</h1>
<p>Thank you for registering. Your account will be reviewed within ##VAR3##.</p>
<p>Contact us: ##VAR4##</p>
```

### Step 3: Test Email
Use MSG91 dashboard to test template with sample variables.

---

## Testing the Email System

### Test Registration Email

**Method 1: Via API**
```bash
POST http://localhost:5003/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "fullName": "Test User",
  "password": "Test123!",
  "gender": "Male",
  "contactNumber": "1234567890",
  "emirate": "Dubai"
}
```

**Method 2: Via Frontend**
1. Go to registration page
2. Fill in all required fields
3. Submit form
4. Check email inbox for confirmation

**Expected Result**:
- ✅ User created in database
- ✅ Email sent to provided address
- ✅ Console shows: "✅ Registration confirmation email sent successfully"

### Test Approval Email

**Prerequisites**: 
- Have a pending user in system
- Login as admin

**Method 1: Via API**
```bash
POST http://localhost:5003/auth/approve/:userId
Authorization: Bearer <admin_token>
```

**Method 2: Via Frontend**
1. Login as admin
2. Go to Pending Users page
3. Click "Approve" on a user
4. Check user's email inbox

**Expected Result**:
- ✅ User's status changed to verified
- ✅ Email sent to user
- ✅ Console shows: "✅ Approval email sent successfully"

---

## Monitoring & Logs

### Console Logs to Watch

**Successful Registration Email**:
```
📧 Preparing registration email...
  To: member@example.com
  Template ID: vara_01
  Sender: noreply@membership.varauae.com
📤 Sending email request to MSG91...
✅ Registration confirmation email sent successfully!
📧 MSG91 Response: { request_id: '...', message: 'Email sent successfully' }
```

**Failed Email**:
```
❌ Error sending registration confirmation email: Request failed with status code 401
📧 MSG91 API error response: { status: 401, data: { message: 'Invalid auth key' } }
⚠️ Continuing registration despite email error...
```

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Invalid `MSG91_AUTH_KEY` | Check API key in MSG91 dashboard |
| Template not found | Wrong `template_id` | Verify template ID in MSG91 |
| Email not received | Wrong recipient email | Check spam folder, verify email |
| 429 Rate Limit | Too many requests | Check MSG91 plan limits |
| Network timeout | MSG91 server issue | Retry after some time |

---

## Email Flow Diagram

```
Member Registration
    ↓
Create User Account
    ↓
Create Membership Application (status: pending)
    ↓
📧 Send Registration Confirmation Email ← Template ID: vara_01
    ↓
Response to Frontend (Registration Complete)

Admin Approval
    ↓
Update User (is_verified: true)
    ↓
Update Application (status: approved)
    ↓
Create Member Profile
    ↓
📧 Send Approval Email ← Template or Direct Content
    ↓
Response to Frontend (User Approved)
```

---

## Security Considerations

✅ **Sensitive Data**: Passwords are hashed before storage
✅ **Email Privacy**: Member emails not shared with third parties
✅ **API Key Security**: MSG91 auth key stored in `.env` (not committed)
✅ **Non-blocking**: Email failures don't expose system internals
✅ **Error Messages**: Generic messages shown to users, detailed logs server-side

---

## Production Checklist

Before going live, ensure:

- [ ] MSG91 account active and verified
- [ ] Domain `membership.varauae.com` configured in MSG91
- [ ] Template `vara_01` created and tested
- [ ] `.env` contains correct MSG91 credentials
- [ ] Test emails sent and received successfully
- [ ] Spam folder checked (whitelist sender if needed)
- [ ] Email logs monitored for errors
- [ ] Rate limits understood (check MSG91 plan)
- [ ] Fallback support email configured
- [ ] Privacy policy mentions email communication

---

## Support

**Email Issues**: Check MSG91 dashboard logs  
**Template Issues**: Update in MSG91 dashboard  
**Integration Issues**: Check server logs in `src/controllers/authController.ts`  
**MSG91 Support**: [https://msg91.com/help](https://msg91.com/help)

---

**Last Updated**: February 18, 2026  
**Version**: 1.0.0  
**System**: VARA Membership Management
