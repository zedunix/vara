import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { supabaseAdmin } from '../config/supabase';
import { generateToken } from '../utils/jwt';
import { uploadToSupabase } from '../utils/fileUpload';
import { LoginRequest, AuthResponse } from '../types';
import { sendRegistrationConfirmationEmail, sendApprovalEmail, sendRejectionEmail } from '../services/emailService';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract all form fields
    const {
      // Step 1
      fullName,
      gender,
      ageCategory,
      bloodGroup,
      varaWhatsappGroup,
      assignedAdminId,
      // Step 2
      companyName,
      jobTitle,
      visaStatus,
      yearsInUAE,
      monthsInUAE,
      totalIndustryExperience,
      primaryAreaOfWork,
      // Step 3
      skillsets,
      otherSkill,
      portfolioLink,
      linkedinLink,
      behanceLink,
      instagramLink,
      softwareAndTools,
      // Step 4
      interestedInVolunteering,
      volunteeringAreas,
      // Step 5
      country,
      emirate,
      areaName,
      countryCode,
      contactNumber,
      whatsappCountryCode,
      whatsappNumber,
      email,
      password,
      keralaDistrict,
      proceedWithMembershipFee,
      message,
    } = req.body;

    // Validate required fields
    if (!email || !password || !fullName) {
      res.status(400).json({
        success: false,
        message: 'Email, password and full name are required',
      });
      return;
    }

    // Check if user already exists
    const { data: existingUser, error: existError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existError && existError.code !== 'PGRST116') {
      console.error('Error checking existing user:', existError);
    }

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'User with this email already exists',
      });
      return;
    }

    // 1️⃣ CREATE USER IN SUPABASE AUTH FIRST
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
    });

    if (authError) {
      console.error('❌ Auth user creation failed:', authError);
      res.status(500).json({
        success: false,
        message: 'Failed to create authentication user',
        error: authError.message,
      });
      return;
    }

    // Hash password for custom users table (backup)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Handle file uploads
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    let profilePhotoUrl: string | undefined;

    if (files?.profilePhoto) {
      profilePhotoUrl = await uploadToSupabase(
        files.profilePhoto[0],
        'profiles',
        email
      );
    }

    // Parse JSON strings back to arrays
    const parsedSkillsets = typeof skillsets === 'string' ? JSON.parse(skillsets || '[]') : skillsets || [];
    
    const parsedVolunteeringAreas = typeof volunteeringAreas === 'string' ? JSON.parse(volunteeringAreas || '[]') : volunteeringAreas || [];

    // 2️⃣ CREATE USER IN CUSTOM USERS TABLE & LINK TO AUTH USER
    const phoneNumber = `${countryCode || '+971'}${contactNumber || ''}`.trim();
    
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from('users')
      .insert([
        {
          id: authUser.user.id, // 🔑 Link to Supabase Auth user
          name: fullName,
          email,
          password_hash: hashedPassword,
          phone: phoneNumber || null,
          role: 'user',
          is_verified: false, // ⏳ Pending admin approval
          is_active: true,
        },
      ])
      .select('id, name, email, phone, role, created_at')
      .single();

    if (insertError) {
      console.error('❌ Custom user insert failed:', insertError);
      console.error('Error details:', {
        message: insertError.message,
        code: insertError.code,
        details: insertError.details,
      });
      
      // Clean up: delete the auth user if custom table insert fails
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id).catch(err => {
        console.error('⚠️ Failed to clean up auth user:', err);
      });

      res.status(500).json({
        success: false,
        message: 'Failed to create user profile',
        error: insertError.message,
        details: insertError.details,
      });
      return;
    }

    // Create membership application
    const { error: applicationError } = await supabaseAdmin
      .from('membership_applications')
      .insert([
        {
          user_id: newUser.id,
          full_name: fullName,
          email,
          gender,
          age_category: ageCategory,
          blood_group: bloodGroup,
          vara_whatsapp_group: varaWhatsappGroup,
          assigned_admin_id: assignedAdminId || null,
          company_name: companyName,
          job_title: jobTitle,
          visa_status: visaStatus,
          years_in_uae: yearsInUAE ? parseInt(String(yearsInUAE), 10) : 0,
          months_in_uae: monthsInUAE ? parseInt(String(monthsInUAE), 10) : 0,
          total_industry_experience: totalIndustryExperience,
          primary_area_of_work: primaryAreaOfWork,
          skillsets: parsedSkillsets,
          other_skill: otherSkill,
          portfolio_link: portfolioLink,
          linkedin_link: linkedinLink,
          behance_link: behanceLink,
          instagram_link: instagramLink,
          software_and_tools: softwareAndTools,
          interested_in_volunteering: interestedInVolunteering === 'Yes' || interestedInVolunteering === true,
          volunteering_areas: parsedVolunteeringAreas,
          country: country || 'UAE',
          emirate,
          area_name: areaName,
          country_code: countryCode || '+971',
          contact_number: contactNumber,
          whatsapp_country_code: whatsappCountryCode || '+971',
          whatsapp_number: whatsappNumber,
          kerala_district: keralaDistrict,
          proceed_with_membership_fee: proceedWithMembershipFee === 'Yes' || proceedWithMembershipFee === true,
          message,
          status: 'pending',
        },
      ]);

    if (applicationError) {
      console.error('\n❌ Application insert FAILED!');
      console.error('Error code:', applicationError.code);
      console.error('Error message:', applicationError.message);
      console.error('Error details:', applicationError.details);
      console.error('Error hint:', applicationError.hint);
      // Don't fail the registration, just log the error
    } else {
      // Verify the data was saved
      const { data: savedApp, error: verifyError } = await supabaseAdmin
        .from('membership_applications')
        .select('*')
        .eq('user_id', newUser.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
    }

    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      userRole: newUser.role,
    });

    // 📧 Send registration confirmation email
    try {
      await sendRegistrationConfirmationEmail({
        memberEmail: email,
        memberName: fullName
      });
    } catch (emailError: any) {
      console.error('⚠️ Email sending failed:', emailError.message);
      // Continue with registration even if email fails
    }

    const response: AuthResponse = {
      success: true,
      message: '✅ Registration successful! Your account is pending admin approval. You will be able to login once approved.',
      data: {
        user: newUser,
        token,
      },
    };

    res.status(201).json(response);
  } catch (error: any) {
    console.error('\n❌ === REGISTRATION FUNCTION ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
      return;
    }

    const { email, password }: LoginRequest = req.body;

    // Find user by email
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    // Check if user is approved by admin
    if (!user.is_verified) {
      res.status(403).json({
        success: false,
        message: '⏳ Your account is pending admin approval. Please contact the administrator.',
      });
      return;
    }

    // Fetch associated member profile data
    const { data: memberProfile, error: memberError } = await supabaseAdmin
      .from('member_profiles')
      .select(`
        *,
        memberships (
          id,
          status,
          joined_date,
          expiry_date,
          membership_types (
            name,
            category,
            price_aed,
            benefits
          )
        )
      `)
      .eq('user_id', user.id)
      .single();

    if (memberError && memberError.code !== 'PGRST116') {
      console.warn('Warning fetching member profile:', memberError);
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      userRole: user.role,
    });

    // Remove password from response
    const { password_hash: _, ...userWithoutPassword } = user;

    // Determine redirect URL based on role
    let redirectUrl = '/user-member/profile';
    if (user.role === 'admin' || user.role === 'superadmin') {
      redirectUrl = '/user-admin/profile';
    }

    const response: AuthResponse & { redirectUrl: string } = {
      success: true,
      message: 'Login successful',
      data: {
        user: {
          ...userWithoutPassword,
          memberProfile: memberProfile || null,
        },
        token,
      },
      redirectUrl,
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    // Fetch user data
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, name, email, phone, role, linkedin_url, portfolio_link, behance_url, dribbble_url, instagram_handle, portfolio_pdf_url, image_gallery_url, is_verified, created_at')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Fetch associated member profile data
    const { data: memberProfile, error: memberError } = await supabaseAdmin
      .from('member_profiles')
      .select(`
        *,
        memberships (
          id,
          status,
          joined_date,
          expiry_date,
          membership_types (
            name,
            category,
            price_aed,
            benefits
          )
        )
      `)
      .eq('user_id', userId)
      .single();

    if (memberError && memberError.code !== 'PGRST116') {
      console.warn('Warning fetching member profile:', memberError);
    }

    res.status(200).json({
      success: true,
      data: {
        ...user,
        memberProfile: memberProfile || null,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// Get all pending users (for admin approval)
export const getPendingUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    // Check if user is admin
    const { data: adminUser } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (!adminUser || (adminUser.role !== 'admin' && adminUser.role !== 'superadmin')) {
      res.status(403).json({
        success: false,
        message: 'Unauthorized - Admin access required',
      });
      return;
    }

    // Get all pending users (not verified)
    const { data: pendingUsersData, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, name, email, phone, role, is_verified, created_at')
      .eq('is_verified', false)
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('Error fetching pending users:', usersError);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch pending users',
        error: usersError.message,
      });
      return;
    }

    // For each pending user, get their membership applications
    // Filter by assigned_admin_id for regular admins
    const pendingUsers = await Promise.all(
      (pendingUsersData || []).map(async (user) => {
        // Build query for membership applications
        let appsQuery = supabaseAdmin
          .from('membership_applications')
          .select(`
            id,
            user_id,
            assigned_admin_id,
            full_name,
            gender,
            age_category,
            blood_group,
            vara_whatsapp_group,
            company_name,
            job_title,
            visa_status,
            years_in_uae,
            months_in_uae,
            total_industry_experience,
            primary_area_of_work,
            skillsets,
            other_skill,
            portfolio_link,
            interested_in_volunteering,
            volunteering_areas,
            country,
            emirate,
            area_name,
            country_code,
            contact_number,
            whatsapp_country_code,
            whatsapp_number,
            kerala_district,
            proceed_with_membership_fee,
            message,
            status,
            created_at,
            assigned_admin:users!assigned_admin_id (
              id,
              name,
              email
            )
          `)
          .eq('user_id', user.id);
        
        // Regular admins only see applications assigned to them
        if (adminUser.role === 'admin') {
          appsQuery = appsQuery.eq('assigned_admin_id', userId);
        }
        // Superadmins see all applications (no filter)
        
        appsQuery = appsQuery.order('created_at', { ascending: false });

        const { data: apps, error: appsError } = await appsQuery;

        if (appsError) {
          console.error(`Error fetching applications for user ${user.id}:`, appsError);
        }

        return {
          ...user,
          membership_applications: apps || [],
        };
      })
    );

    // Filter out users with no applications (for regular admins)
    const filteredPendingUsers = pendingUsers.filter(
      user => user.membership_applications && user.membership_applications.length > 0
    );

    res.status(200).json({
      success: true,
      data: filteredPendingUsers,
      count: filteredPendingUsers?.length || 0,
    });
  } catch (error: any) {
    console.error('Catch block error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// Approve a user
export const approveUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { userId: userToApproveId } = req.params;

    // Check if user is admin
    const { data: adminUser } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (!adminUser || (adminUser.role !== 'admin' && adminUser.role !== 'superadmin')) {
      res.status(403).json({
        success: false,
        message: 'Unauthorized - Admin access required',
      });
      return;
    }

    // Get the membership application for this user
    const { data: membershipApps, error: appsFetchError } = await supabaseAdmin
      .from('membership_applications')
      .select(`
        id,
        user_id,
        assigned_admin_id,
        full_name,
        email,
        gender,
        age_category,
        blood_group,
        vara_whatsapp_group,
        company_name,
        job_title,
        visa_status,
        years_in_uae,
        months_in_uae,
        total_industry_experience,
        primary_area_of_work,
        skillsets,
        other_skill,
        portfolio_link,
        interested_in_volunteering,
        volunteering_areas,
        country,
        emirate,
        area_name,
        country_code,
        contact_number,
        whatsapp_country_code,
        whatsapp_number,
        kerala_district,
        proceed_with_membership_fee,
        message,
        status,
        created_at
      `)
      .eq('user_id', userToApproveId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (appsFetchError) {
      console.error('❌ Error fetching membership applications:', appsFetchError);
    }

    const membershipApp = membershipApps?.[0];

    if (membershipApp) {
      // Application found
    } else {
      // No application found
    }

    // Approve the user in users table
    const { data: approvedUser, error: approveError } = await supabaseAdmin
      .from('users')
      .update({ is_verified: true, updated_at: new Date().toISOString() })
      .eq('id', userToApproveId)
      .select('id, name, email, role, is_verified')
      .single();

    if (approveError) {
      console.error('❌ Error approving user:', approveError);
      res.status(500).json({
        success: false,
        message: 'Failed to approve user',
        error: approveError.message,
      });
      return;
    }

    // Update membership application status to approved (if found)
    if (membershipApp && membershipApp.id) {
      const { error: updateAppError } = await supabaseAdmin
        .from('membership_applications')
        .update({ status: 'approved', updated_at: new Date().toISOString() })
        .eq('id', membershipApp.id);

      if (updateAppError) {
        console.error('⚠️ Error updating application status:', updateAppError);
      }
    }

    // Generate a unique member_id (e.g., VARA-2026-001)
    const year = new Date().getFullYear();
    const randomNum = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    const memberId = `VARA-${year}-${randomNum}`;

    // Create member profile record with all details from membership application
    // If membership app exists, use its data; otherwise use basic info from users table
    const memberProfileData = {
      user_id: userToApproveId,
      member_id: memberId,
      assigned_admin_id: membershipApp?.assigned_admin_id || userId,
      full_name: membershipApp?.full_name || approvedUser.name || '',
      gender: membershipApp?.gender || 'Not Specified',
      age_category: membershipApp?.age_category || '',
      blood_group: membershipApp?.blood_group || '',
      vara_whatsapp_group: membershipApp?.vara_whatsapp_group === 'Yes' || membershipApp?.vara_whatsapp_group === true || false,
      company_name: membershipApp?.company_name || '',
      job_title: membershipApp?.job_title || '',
      visa_status: membershipApp?.visa_status || '',
      years_in_uae: membershipApp?.years_in_uae || 0,
      months_in_uae: membershipApp?.months_in_uae || 0,
      total_industry_experience: membershipApp?.total_industry_experience || '',
      primary_area_of_work: membershipApp?.primary_area_of_work || '',
      skillsets: Array.isArray(membershipApp?.skillsets) ? membershipApp.skillsets : membershipApp?.skillsets ? JSON.parse(membershipApp.skillsets) : [],
      other_skill: membershipApp?.other_skill || '',
      portfolio_link: membershipApp?.portfolio_link || '',
      interested_in_volunteering: membershipApp?.interested_in_volunteering || false,
      volunteering_areas: Array.isArray(membershipApp?.volunteering_areas) ? membershipApp.volunteering_areas : membershipApp?.volunteering_areas ? JSON.parse(membershipApp.volunteering_areas) : [],
      country: membershipApp?.country || 'UAE',
      emirate: membershipApp?.emirate || '',
      area_name: membershipApp?.area_name || '',
      country_code: membershipApp?.country_code || '+971',
      contact_number: membershipApp?.contact_number || '',
      whatsapp_country_code: membershipApp?.whatsapp_country_code || '+971',
      whatsapp_number: membershipApp?.whatsapp_number || '',
      kerala_district: membershipApp?.kerala_district || '',
      proceed_with_membership_fee: membershipApp?.proceed_with_membership_fee === 'Yes' || membershipApp?.proceed_with_membership_fee === true || false,
      message: membershipApp?.message || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error: memberCreateError, data: createdProfile } = await supabaseAdmin
      .from('member_profiles')
      .insert([memberProfileData])
      .select('id, member_id, full_name, company_name, job_title');

    if (memberCreateError) {
      console.error('❌ Error creating member profile:', memberCreateError);
      console.error('  Code:', memberCreateError.code);
      console.error('  Message:', memberCreateError.message);
      console.error('  Details:', memberCreateError.details);
      // Log but don't fail - user is already approved in users table
    } else if (createdProfile && createdProfile.length > 0) {

      // Create membership record with joined_date and expiry_date
      const approvalDate = new Date();
      const expiryDate = new Date(approvalDate);
      expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1 year from approval

      // Get default membership type (Standard)
      const { data: membershipTypes } = await supabaseAdmin
        .from('membership_types')
        .select('id')
        .eq('name', 'Standard')
        .eq('is_active', true)
        .limit(1)
        .single();

      if (membershipTypes) {
        const { error: membershipError } = await supabaseAdmin
          .from('memberships')
          .insert([{
            member_id: createdProfile[0].id, // Use the UUID from member_profiles
            membership_type_id: membershipTypes.id,
            status: 'active',
            joined_date: approvalDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
            expiry_date: expiryDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }]);

        if (membershipError) {
          console.error('⚠️ Error creating membership record:', membershipError);
        }
      } else {
        console.warn('⚠️ No membership type found, skipping membership record creation');
      }
    }

    // 📧 Send approval confirmation email
    try {
      await sendApprovalEmail({
        memberEmail: approvedUser.email,
        memberName: membershipApp?.full_name || approvedUser.name || 'Member'
      });
    } catch (emailError: any) {
      console.error('⚠️ Approval email sending failed:', emailError.message);
      // Continue with approval even if email fails
    }

    res.status(200).json({
      success: true,
      message: `✅ User ${approvedUser.email} has been approved and can now login`,
      data: approvedUser,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// Reject a user (delete them)
export const rejectUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { userId: userToRejectId } = req.params;

    // Check if user is admin
    const { data: adminUser } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (!adminUser || (adminUser.role !== 'admin' && adminUser.role !== 'superadmin')) {
      res.status(403).json({
        success: false,
        message: 'Unauthorized - Admin access required',
      });
      return;
    }

    // Get user email and name before deleting
    const { data: userToDelete } = await supabaseAdmin
      .from('users')
      .select('email, id, full_name')
      .eq('id', userToRejectId)
      .single();

    // Send rejection email (non-blocking)
    if (userToDelete?.email) {
      try {
        await sendRejectionEmail({
          memberEmail: userToDelete.email,
          memberName: userToDelete.full_name || 'Member',
          rejectionReason: req.body.rejectionReason // Optional reason from request
        });
      } catch (emailError: any) {
        console.error('⚠️ Failed to send rejection email:', emailError.message);
        // Continue with rejection even if email fails
      }
    }

    // Delete from custom users table
    const { error: deleteError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userToRejectId);

    if (deleteError) {
      console.error('Error rejecting user:', deleteError);
      res.status(500).json({
        success: false,
        message: 'Failed to reject user',
        error: deleteError.message,
      });
      return;
    }

    // Delete from Supabase Auth
    await supabaseAdmin.auth.admin.deleteUser(userToRejectId).catch(err => {
      console.error('Could not delete auth user:', err);
    });

    res.status(200).json({
      success: true,
      message: `❌ User ${userToDelete?.email} has been rejected and deleted`,
      data: { deletedUserId: userToRejectId },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// ============ Forgot Password Functions ============

// Generate forgot password token
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email is required',
      });
      return;
    }

    // Check if user exists
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, name')
      .eq('email', email.toLowerCase())
      .single();

    if (userError || !user) {
      // Don't reveal if email exists or not for security
      res.status(200).json({
        success: true,
        message: 'If an account with this email exists, you will receive a password reset link.',
      });
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    // Store reset token in database
    const { error: tokenError } = await supabaseAdmin
      .from('password_reset_tokens')
      .insert([{
        user_id: user.id,
        token: resetToken,
        expires_at: expiresAt.toISOString(),
        used: false,
      }]);

    if (tokenError) {
      console.error('Error storing reset token:', tokenError);
      res.status(500).json({
        success: false,
        message: 'Failed to generate reset token',
      });
      return;
    }

    // In a real application, you would send this via email
    // For now, we'll just return success
    res.status(200).json({
      success: true,
      message: 'Password reset instructions have been sent to your email.',
      // FOR DEVELOPMENT ONLY - Remove this in production
      resetToken: resetToken,
      resetUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`,
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// Verify reset token
export const verifyResetToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({
        success: false,
        message: 'Reset token is required',
      });
      return;
    }

    // Check if token exists and is valid
    const { data: resetToken, error: tokenError } = await supabaseAdmin
      .from('password_reset_tokens')
      .select(`
        id,
        user_id,
        expires_at,
        used,
        users!inner (
          id,
          email,
          name
        )
      `)
      .eq('token', token)
      .eq('used', false)
      .single();

    if (tokenError || !resetToken) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
      return;
    }

    // Check if token has expired
    if (new Date() > new Date(resetToken.expires_at)) {
      res.status(400).json({
        success: false,
        message: 'Reset token has expired',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Reset token is valid',
      data: {
        email: resetToken.users[0].email,
        name: resetToken.users[0].name,
      },
    });
  } catch (error: any) {
    console.error('Verify reset token error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// Reset password
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({
        success: false,
        message: 'Reset token and new password are required',
      });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
      return;
    }

    // Verify token and get user
    const { data: resetToken, error: tokenError } = await supabaseAdmin
      .from('password_reset_tokens')
      .select(`
        id,
        user_id,
        expires_at,
        used,
        users!inner (
          id,
          email,
          name
        )
      `)
      .eq('token', token)
      .eq('used', false)
      .single();

    if (tokenError || !resetToken) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
      return;
    }

    // Check if token has expired
    if (new Date() > new Date(resetToken.expires_at)) {
      res.status(400).json({
        success: false,
        message: 'Reset token has expired',
      });
      return;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password in the correct column (password_hash)
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ 
        password_hash: hashedPassword,
        updated_at: new Date().toISOString(),
      })
      .eq('id', resetToken.user_id);

    if (updateError) {
      console.error('Error updating password:', updateError);
      res.status(500).json({
        success: false,
        message: 'Failed to update password',
      });
      return;
    }

    // Mark token as used
    await supabaseAdmin
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('id', resetToken.id);

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// Direct password reset without token
export const resetPasswordDirect = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      res.status(400).json({
        success: false,
        message: 'Email and new password are required',
      });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
      return;
    }

    // Check if user exists
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, name')
      .eq('email', email.toLowerCase())
      .single();

    if (userError || !user) {
      res.status(400).json({
        success: false,
        message: 'User with this email does not exist',
      });
      return;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password in the correct column (password_hash)
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ 
        password_hash: hashedPassword,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating password:', updateError);
      res.status(500).json({
        success: false,
        message: 'Failed to update password',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error: any) {
    console.error('Direct reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};
