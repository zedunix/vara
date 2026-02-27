import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import * as memberService from '../services/memberService';
import { supabaseAdmin } from '../config/supabase';
import { upload } from '../middleware/upload';
import { uploadToSupabase } from '../utils/fileUpload';

const router = Router();

// Get all members (Admin only)
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    // Get admin role
    const { data: adminUser } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();
    
    const members = await memberService.getAllMembers(userId, adminUser?.role);
    res.json({ success: true, data: members });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get member stats
router.get('/stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    const stats = await memberService.getMemberStats();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get membership types
router.get('/types', async (req: Request, res: Response) => {
  try {
    const types = await memberService.getMembershipTypes();
    res.json({ success: true, data: types });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get current user's member profile (must come before /:memberId to avoid matching "me" as memberId)
router.get('/me/profile', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    const member = await memberService.getMemberByUserId(userId);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member profile not found' });
    }
    res.json({ success: true, data: member });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Upload profile photo for current user
router.post('/me/profile-photo', authenticateToken, upload.single('profilePhoto'), async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Validate file type
    if (!file.mimetype.startsWith('image/')) {
      return res.status(400).json({ success: false, message: 'Only image files are allowed' });
    }

    // Upload to Supabase storage
    const photoUrl = await uploadToSupabase(file, 'profiles', 'profile-photos');

    // Get member profile
    const member = await memberService.getMemberByUserId(userId);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member profile not found' });
    }

    // Update member profile with new photo URL
    const updatedMember = await memberService.updateMember(member.member_id, {
      profile_photo: photoUrl
    });

    res.json({ 
      success: true, 
      data: { 
        profile_photo: photoUrl,
        member: updatedMember
      } 
    });
  } catch (error: any) {
    console.error('Profile photo upload error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get member by member ID
router.get('/:memberId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { memberId } = req.params;
    const member = await memberService.getMemberById(memberId);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }
    res.json({ success: true, data: member });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create member (Admin only)
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const member = await memberService.createMember(req.body);
    res.status(201).json({ success: true, data: member });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update member
router.put('/:memberId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { memberId } = req.params;
    const member = await memberService.updateMember(memberId, req.body);
    res.json({ success: true, data: member });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete member (Admin only)
router.delete('/:memberId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { memberId } = req.params;
    await memberService.deleteMember(memberId);
    res.json({ success: true, message: 'Member deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update membership status
router.patch('/:membershipId/status', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { membershipId } = req.params;
    const { status } = req.body;
    const membership = await memberService.updateMembershipStatus(membershipId, status);
    res.json({ success: true, data: membership });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
