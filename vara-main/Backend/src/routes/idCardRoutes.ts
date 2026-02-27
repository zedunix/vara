/**
 * ============================================================
 *  VARA UAE — ID Card Routes
 *  GET /api/id-card/download/:memberId
 *    → Returns a press-ready A6 PDF for the given member
 *  GET /api/id-card/preview/:memberId  (JSON meta, no PDF)
 * ============================================================
 */

import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticateToken } from '../middleware/auth';
import { generateIdCardPdf, fetchMemberCardData, generateIdCardPreviewPng } from '../services/idCardService';
import { supabaseAdmin } from '../config/supabase';

const router = Router();

// ── Rate Limiter ─────────────────────────────────────────────
// Max 10 PDF downloads per IP per 15 minutes
const idCardRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many ID card requests. Please try again after 15 minutes.',
  },
  skip: (req: Request) => {
    // Skip rate limit for admins (optional: add admin-check logic here)
    return false;
  },
});

// ── Helper ────────────────────────────────────────────────────

/** Verify the authenticated user is allowed to download that card. */
async function authoriseMemberAccess(
  requestingUserId: string,
  targetMemberId: string
): Promise<boolean> {
  // Allow admins / superadmins unconditionally
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', requestingUserId)
    .maybeSingle();

  if (user?.role === 'admin' || user?.role === 'superadmin') return true;

  // Allow members to download only their own card
  const { data: profile } = await supabaseAdmin
    .from('member_profiles')
    .select('user_id')
    .eq('member_id', targetMemberId)
    .maybeSingle();

  return profile?.user_id === requestingUserId;
}

// ── Routes ────────────────────────────────────────────────────

/**
 * GET /api/id-card/download/:memberId
 * Downloads the A6 PDF ID card for the given member.
 */
router.get(
  '/download/:memberId',
  idCardRateLimit,
  authenticateToken,
  async (req: Request, res: Response) => {
    const { memberId } = req.params;

    // Basic param sanitisation
    if (!memberId || !/^[A-Za-z0-9_-]{1,80}$/.test(memberId)) {
      return res.status(400).json({ success: false, message: 'Invalid member ID format' });
    }

    const requestingUserId = req.user?.userId;
    if (!requestingUserId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Authorisation check
    const allowed = await authoriseMemberAccess(requestingUserId, memberId);
    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to download this ID card',
      });
    }

    try {
      const { pdfBuffer, fileName } = await generateIdCardPdf(memberId);

      res.set({
        'Content-Type':        'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length':      pdfBuffer.length,
        'Cache-Control':       'no-store',
        'X-Content-Type-Options': 'nosniff',
      });

      res.status(200).end(pdfBuffer);
    } catch (error: any) {
      console.error('[IDCard] PDF generation failed:', error.message);

      if (error.message?.includes('not found')) {
        return res.status(404).json({ success: false, message: error.message });
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to generate ID card. Please try again.',
      });
    }
  }
);

/**
 * GET /api/id-card/preview/:memberId
 * Returns member card metadata as JSON — lightweight, no rendering.
 */
router.get(
  '/preview/:memberId',
  authenticateToken,
  async (req: Request, res: Response) => {
    const { memberId } = req.params;

    if (!memberId || !/^[A-Za-z0-9_-]{1,80}$/.test(memberId)) {
      return res.status(400).json({ success: false, message: 'Invalid member ID format' });
    }

    const requestingUserId = req.user?.userId;
    if (!requestingUserId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const allowed = await authoriseMemberAccess(requestingUserId, memberId);
    if (!allowed) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    try {
      const data = await fetchMemberCardData(memberId);
      const { id: _id, ...safe } = data;
      res.json({ success: true, data: safe });
    } catch (error: any) {
      if (error.message?.includes('not found')) {
        return res.status(404).json({ success: false, message: error.message });
      }
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

/**
 * GET /api/id-card/preview-image/:memberId
 * Returns a PNG screenshot of the exact card (same HTML as PDF).
 * The frontend displays this — what you see IS what you get in the PDF.
 */
router.get(
  '/preview-image/:memberId',
  authenticateToken,
  async (req: Request, res: Response) => {
    const { memberId } = req.params;

    if (!memberId || !/^[A-Za-z0-9_-]{1,80}$/.test(memberId)) {
      return res.status(400).json({ success: false, message: 'Invalid member ID format' });
    }

    const requestingUserId = req.user?.userId;
    if (!requestingUserId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const allowed = await authoriseMemberAccess(requestingUserId, memberId);
    if (!allowed) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    try {
      const pngBuffer = await generateIdCardPreviewPng(memberId);

      res.set({
        'Content-Type':        'image/png',
        'Content-Length':      pngBuffer.length,
        'Cache-Control':       'private, max-age=60', // cache 60s in browser
        'X-Content-Type-Options': 'nosniff',
      });
      res.status(200).end(pngBuffer);
    } catch (error: any) {
      console.error('[IDCard] Preview PNG failed:', error.message);
      if (error.message?.includes('not found')) {
        return res.status(404).json({ success: false, message: error.message });
      }
      return res.status(500).json({ success: false, message: 'Failed to generate preview' });
    }
  }
);

export default router;
