import axios from 'axios';

interface SendRegistrationEmailParams {
  memberEmail: string;
  memberName: string;
}

interface SendApprovalEmailParams {
  memberEmail: string;
  memberName: string;
  password?: string;
}

interface SendRejectionEmailParams {
  memberEmail: string;
  memberName: string;
  rejectionReason?: string;
}

// Registration Confirmation Email Template
const getRegistrationEmailTemplate = (memberName: string): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registration Confirmation - VARA Association</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f4f4;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
            padding: 40px 20px;
            text-align: center;
        }
        .header .logo {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 15px;
            letter-spacing: 1px;
        }
        .header h1 {
            font-size: 28px;
            margin-bottom: 10px;
        }
        .content {
            padding: 40px 30px;
        }
        .content h2 {
            color: #333;
            margin-bottom: 15px;
            font-size: 22px;
        }
        .greeting {
            font-size: 18px;
            color: #667eea;
            font-weight: bold;
            margin-bottom: 20px;
        }
        .content p {
            color: #666;
            margin-bottom: 15px;
            font-size: 16px;
        }
        .highlight-box {
            background-color: #f0f7ff;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 25px 0;
            border-radius: 4px;
        }
        .highlight-box p {
            color: #555;
            margin: 0;
            font-weight: 500;
        }
        .footer {
            background-color: #f9f9f9;
            padding: 30px;
            text-align: center;
            color: #888;
            font-size: 14px;
            border-top: 1px solid #eee;
        }
        .footer-brand {
            color: #667eea;
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">VARA ASSOCIATION</div>
            <h1>Welcome to VARA! 🎉</h1>
            <p>Registration Successful</p>
        </div>

        <div class="content">
            <h2>Thank You for Registering with VARA!</h2>
            
            <div class="greeting">Hello ${memberName},</div>
            
            <p>We are delighted to have you join the VARA Association community! Your registration has been successfully received.</p>

            <div class="highlight-box">
                <p>Your account is currently under admin review.</p>
                <p style="margin-top: 10px; font-size: 14px; color: #666;">Status: <strong>Pending Approval</strong></p>
            </div>

            <p><strong>What happens next?</strong></p>
            <p>Our VARA admin team will review your registration and verify your details. Once approved, you'll receive a confirmation email with instructions on how to access your account and member benefits.</p>

            <p><strong>Expected timeframe:</strong> Admin approval typically takes 24-48 hours.</p>

            <p style="margin-top: 30px;">If you have any questions or need assistance, please don't hesitate to reach out to our support team.</p>

            <p style="margin-top: 30px; color: #555;">Best regards,<br><strong>VARA Association Admin Team</strong></p>
        </div>

        <div class="footer">
            <div class="footer-brand">VARA ASSOCIATION</div>
            <p>&copy; 2026 VARA Association. All Rights Reserved.</p>
            <p>This is an automated email. Please do not reply to this message.</p>
            <div style="margin-top: 15px;">
                <a href="https://membership.varauae.com" style="color: #667eea; text-decoration: none; margin: 0 10px;">Visit Website</a> | 
                <a href="mailto:support@varauae.com" style="color: #667eea; text-decoration: none; margin: 0 10px;">Contact Support</a>
            </div>
        </div>
    </div>
</body>
</html>
  `;
};

// Account Approval Email Template
const getApprovalEmailTemplate = (memberName: string, memberEmail: string, password?: string): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Approved - VARA Association</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f4f4;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
            color: #ffffff;
            padding: 40px 20px;
            text-align: center;
        }
        .header .logo {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 15px;
            letter-spacing: 1px;
        }
        .header h1 {
            font-size: 28px;
            margin-bottom: 10px;
        }
        .content {
            padding: 40px 30px;
        }
        .content h2 {
            color: #333;
            margin-bottom: 15px;
            font-size: 22px;
        }
        .greeting {
            font-size: 18px;
            color: #2ecc71;
            font-weight: bold;
            margin-bottom: 20px;
        }
        .content p {
            color: #666;
            margin-bottom: 15px;
            font-size: 16px;
        }
        .approval-badge {
            display: inline-block;
            background-color: #d4edda;
            color: #155724;
            padding: 12px 20px;
            border-radius: 4px;
            font-weight: 600;
            margin: 15px 0;
            border: 1px solid #c3e6cb;
        }
        .credentials-box {
            background-color: #f8f9fa;
            border: 2px solid #2ecc71;
            padding: 25px;
            margin: 25px 0;
            border-radius: 6px;
        }
        .credentials-box h3 {
            color: #333;
            margin-bottom: 15px;
            font-size: 16px;
            border-bottom: 2px solid #2ecc71;
            padding-bottom: 10px;
        }
        .credential-item {
            margin-bottom: 15px;
            background-color: #ffffff;
            padding: 12px;
            border-left: 4px solid #2ecc71;
            border-radius: 3px;
        }
        .credential-label {
            font-size: 12px;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
        }
        .credential-value {
            font-size: 15px;
            font-weight: 600;
            color: #333;
            font-family: 'Courier New', monospace;
            word-break: break-all;
        }
        .highlight-box {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .highlight-box p {
            color: #855404;
            margin: 0;
            font-size: 14px;
        }
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        .login-button {
            background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
            color: #ffffff;
            padding: 12px 40px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: 600;
            display: inline-block;
            transition: transform 0.3s;
        }
        .login-button:hover {
            transform: translateY(-2px);
        }
        .instructions {
            background-color: #f0f7ff;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .instructions h4 {
            color: #333;
            margin-bottom: 10px;
            font-size: 14px;
        }
        .instructions ol {
            margin-left: 20px;
            color: #666;
            font-size: 14px;
        }
        .instructions li {
            margin-bottom: 8px;
        }
        .footer {
            background-color: #f9f9f9;
            padding: 30px;
            text-align: center;
            color: #888;
            font-size: 14px;
            border-top: 1px solid #eee;
        }
        .footer p {
            margin: 5px 0;
        }
        .footer-brand {
            color: #2ecc71;
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">VARA ASSOCIATION</div>
            <h1>Account Approved! ✓</h1>
            <p>Ready to Access Your Account</p>
        </div>

        <div class="content">
            <h2>Great News, ${memberName}!</h2>
            
            <div class="greeting">Your account has been approved!</div>
            
            <p>Congratulations! Your registration with VARA Association has been reviewed and approved by our admin team. You can now access your account and enjoy all member benefits.</p>

            <div class="approval-badge">✓ Account Status: Approved</div>

            ${password ? `
            <div class="credentials-box">
                <h3>Your Login Credentials</h3>
                
                <div class="credential-item">
                    <div class="credential-label">Email Address</div>
                    <div class="credential-value">${memberEmail}</div>
                </div>
                
                <div class="credential-item">
                    <div class="credential-label">Password</div>
                    <div class="credential-value">${password}</div>
                </div>
            </div>

            <div class="highlight-box">
                <p>🔒 <strong>Important:</strong> Please save your credentials in a secure place. We recommend changing your password on your first login for security purposes.</p>
            </div>
            ` : `
            <div class="credentials-box">
                <h3>Your Login Email</h3>
                
                <div class="credential-item">
                    <div class="credential-label">Email Address</div>
                    <div class="credential-value">${memberEmail}</div>
                </div>
            </div>

            <p>Use the email and password you created during registration to login to your account.</p>

            <div class="highlight-box">
                <p>🔑 <strong>Forgot Your Password?</strong> You can reset your password anytime from the login page if needed.</p>
            </div>
            `}

            <div class="instructions">
                <h4><strong>How to Login:</strong></h4>
                <ol>
                    <li>Visit the VARA Association portal</li>
                    <li>Enter your email address and password</li>
                    <li>Click "Login"</li>
                    <li>Update your profile if needed</li>
                </ol>
            </div>

            <div class="button-container">
                <a href="https://membership.varauae.com/login" class="login-button">Login to Your Account</a>
            </div>

            <p><strong>What's Next?</strong></p>
            <p>Once logged in, you can:</p>
            <ul style="color: #666; margin-left: 20px;">
                <li>Update your profile information</li>
                <li>View member benefits and resources</li>
                <li>Access exclusive content</li>
                <li>Connect with other members</li>
            </ul>

            <p style="margin-top: 30px;">If you have any questions or need assistance, please don't hesitate to contact our support team.</p>

            <p style="margin-top: 30px; color: #555;">Best regards,<br><strong>VARA Association Admin Team</strong></p>
        </div>

        <div class="footer">
            <div class="footer-brand">VARA ASSOCIATION</div>
            <p>&copy; 2026 VARA Association. All Rights Reserved.</p>
            <p>This is an automated email. Please do not reply to this message.</p>
            <p style="margin-top: 10px; font-size: 12px; color: #aaa;">If you did not register for VARA, please contact support immediately.</p>
            <div style="margin-top: 15px;">
                <a href="https://membership.varauae.com" style="color: #2ecc71; text-decoration: none; margin: 0 10px;">Visit Website</a> | 
                <a href="mailto:support@varauae.com" style="color: #2ecc71; text-decoration: none; margin: 0 10px;">Contact Support</a>
            </div>
        </div>
    </div>
</body>
</html>
  `;
};

/**
 * Send registration confirmation email via MSG91
 */
export const sendRegistrationConfirmationEmail = async ({
  memberEmail,
  memberName
}: SendRegistrationEmailParams): Promise<any> => {
  try {
    const templateId = process.env.MSG91_MEMBERREGISTRATION_TEMPLATE_ID || 'vara_01';
    const senderEmail = process.env.MSG91_SENDER_EMAIL || 'noreply@membership.varauae.com';
    const senderName = process.env.MSG91_SENDER_NAME || 'vara';
    const domain = process.env.MSG91_DOMAIN || 'membership.varauae.com';

    // MSG91 Template API Format
    const requestBody = {
      recipients: [
        {
          to: [
            {
              email: memberEmail,
              name: memberName
            }
          ],
          variables: {
            VAR1: memberName, // Member name for personalization
            VAR2: 'VARA Association', // Organization name
            VAR3: '24-48 hours', // Expected approval time
            VAR4: 'support@varauae.com' // Support email
          }
        }
      ],
      from: {
        email: senderEmail,
        name: senderName
      },
      domain: domain,
      template_id: templateId
    };

    const response = await axios.post(
      'https://control.msg91.com/api/v5/email/send',
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'authkey': process.env.MSG91_AUTH_KEY
        }
      }
    );

    return { success: true, message: 'Email sent successfully', data: response.data };
  } catch (error: any) {
    console.error('❌ Error sending registration confirmation email:', error.message);
    if (error.response) {
      console.error('📧 MSG91 API error response:', {
        status: error.response.status,
        data: error.response.data
      });
    }
    // Don't throw - log error but don't fail the registration
    return { success: false, message: error.message };
  }
};

/**
 * Send account approval email with login credentials via MSG91
 */
export const sendApprovalEmail = async ({
  memberEmail,
  memberName,
  password
}: SendApprovalEmailParams): Promise<any> => {
  try {
    const templateId = process.env.MSG91_APPROVAL_TEMPLATE_ID; // Optional separate template for approval
    const senderEmail = process.env.MSG91_SENDER_EMAIL || 'noreply@membership.varauae.com';
    const senderName = process.env.MSG91_SENDER_NAME || 'vara';
    const domain = process.env.MSG91_DOMAIN || 'membership.varauae.com';

    // If template ID exists, use MSG91 Template API Format
    if (templateId) {
      const requestBody = {
        recipients: [
          {
            to: [
              {
                email: memberEmail,
                name: memberName
              }
            ],
            variables: {
              VAR1: memberName, // Member name
              VAR2: memberEmail, // Login email
              VAR3: password || 'Use your registration password', // Password (if provided)
              VAR4: 'https://membership.varauae.com/login', // Login URL
              VAR5: 'VARA Association' // Organization name
            }
          }
        ],
        from: {
          email: senderEmail,
          name: senderName
        },
        domain: domain,
        template_id: templateId
      };

      const response = await axios.post(
        'https://control.msg91.com/api/v5/email/send',
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'authkey': process.env.MSG91_AUTH_KEY
          }
        }
      );

      return { success: true, message: 'Email sent successfully', data: response.data };
    } else {
      // Fallback: Send with HTML content (Direct Content Mode)
      const htmlTemplate = getApprovalEmailTemplate(memberName, memberEmail, password);
      const subject = `Your VARA Account is Approved - Login Now!`;

      const requestBody = {
        recipients: [
          {
            to: [
              {
                email: memberEmail,
                name: memberName
              }
            ]
          }
        ],
        from: {
          email: senderEmail,
          name: senderName
        },
        domain: domain,
        subject: subject,
        body: htmlTemplate
      };

      const response = await axios.post(
        'https://control.msg91.com/api/v5/email/send',
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'authkey': process.env.MSG91_AUTH_KEY
          }
        }
      );

      return { success: true, message: 'Email sent successfully', data: response.data };
    }
  } catch (error: any) {
    console.error('❌ Error sending approval email:', error.message);
    if (error.response) {
      console.error('📧 MSG91 API error response:', {
        status: error.response.status,
        data: error.response.data
      });
    }
    // Don't throw - log error but don't fail the approval process
    return { success: false, message: error.message };
  }
};

/**
 * Send account rejection email via MSG91
 */
export const sendRejectionEmail = async ({
  memberEmail,
  memberName,
  rejectionReason
}: SendRejectionEmailParams): Promise<any> => {
  try {
    const templateId = process.env.MSG91_REJECTION_TEMPLATE_ID;
    const senderEmail = process.env.MSG91_SENDER_EMAIL || 'noreply@membership.varauae.com';
    const senderName = process.env.MSG91_SENDER_NAME || 'vara';
    const domain = process.env.MSG91_DOMAIN || 'membership.varauae.com';

    if (!templateId) {
      console.warn('⚠️ MSG91_REJECTION_TEMPLATE_ID not configured in .env');
      return { success: false, message: 'Rejection email template not configured' };
    }

    // MSG91 Template API Format
    const requestBody = {
      recipients: [
        {
          to: [
            {
              email: memberEmail,
              name: memberName
            }
          ],
          variables: {
            VAR1: memberName, // Member name
            VAR2: rejectionReason || 'Your application does not meet the current membership criteria.', // Rejection reason
            VAR3: 'support@varauae.com', // Support email
            VAR4: 'VARA Association' // Organization name
          }
        }
      ],
      from: {
        email: senderEmail,
        name: senderName
      },
      domain: domain,
      template_id: templateId
    };

    const response = await axios.post(
      'https://control.msg91.com/api/v5/email/send',
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'authkey': process.env.MSG91_AUTH_KEY
        }
      }
    );

    return { success: true, message: 'Email sent successfully', data: response.data };
  } catch (error: any) {
    console.error('❌ Error sending rejection email:', error.message);
    if (error.response) {
      console.error('📧 MSG91 API error response:', {
        status: error.response.status,
        data: error.response.data
      });
    }
    // Don't throw - log error but don't fail the rejection process
    return { success: false, message: error.message };
  }
};

