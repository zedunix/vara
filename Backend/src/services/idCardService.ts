/**
 * ============================================================
 *  VARA UAE — ID Card Service
 *  Responsibilities:
 *    1. Fetch member data from Supabase (server-side, service key)
 *    2. Fetch & base64-encode member photo
 *    3. Inject all data into A6 HTML master template
 *    4. Generate press-ready A6 PDF via Puppeteer
 * ============================================================
 */

import type { Browser } from 'puppeteer';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { supabaseAdmin } from '../config/supabase';

// ── Types ────────────────────────────────────────────────────

export interface MemberCardData {
  id: string;
  full_name: string;
  designation: string;
  member_id: string;
  photo_url: string | null;
  start_date: string;  // ISO date string or YYYY-MM-DD
  end_date: string;
  website_url?: string;
}

export interface GeneratedCard {
  pdfBuffer: Buffer;
  fileName: string;
}

// ── Constants ────────────────────────────────────────────────

function getPath(subPath: string): string {
  // Try relative to __dirname first (works in dev and if assets are copied to dist)
  const relativePath = path.resolve(__dirname, '..', subPath);
  if (fs.existsSync(relativePath)) {
    return relativePath;
  }
  // Try going up to project root and checking src/ (works in compiled production if assets are not copied to dist)
  const srcPath = path.resolve(__dirname, '..', '..', 'src', subPath);
  if (fs.existsSync(srcPath)) {
    return srcPath;
  }
  return relativePath; // fallback
}

const TEMPLATE_PATH = getPath('templates/idcard.html');
const VARA_LOGO_PATH = getPath('assets/vara-id.png');
const VARAFIED_BADGE_PATH = getPath('assets/Varafied Icon@4x.png');

// ── Singleton browser instance ───────────────────────────────

let _browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (_browser && _browser.connected) return _browser;

  if (process.env.VERCEL) {
    // Vercel serverless environment
    const puppeteerCore = await import('puppeteer-core');
    const chromium = await import('@sparticuz/chromium');
    
    const launch = puppeteerCore.default?.launch || puppeteerCore.launch;
    const chromiumModule = chromium.default || chromium;
    
    _browser = await launch({
      args: chromiumModule.args,
      defaultViewport: chromiumModule.defaultViewport,
      executablePath: await chromiumModule.executablePath(),
      headless: chromiumModule.headless as any,
    }) as unknown as Browser;
  } else {
    // Local development/standard server
    const puppeteer = await import('puppeteer');
    const launch = puppeteer.default?.launch || puppeteer.launch;
    _browser = await launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--font-render-hinting=none',
      ],
    }) as unknown as Browser;
  }
  return _browser;
}

// Gracefully close browser on process exit
process.on('exit', async () => {
  if (_browser) await _browser.close();
});

// ── Asset Helpers ────────────────────────────────────────────

/**
 * Read a local file and return as a base64 data-URL.
 */
function localFileToDataUrl(filePath: string): string {
  if (!fs.existsSync(filePath)) {
    console.warn(`[IDCard] Asset not found: ${filePath}`);
    return '';
  }
  const ext  = path.extname(filePath).slice(1).toLowerCase();
  const mime = ext === 'svg' ? 'image/svg+xml' : `image/${ext === 'jpg' ? 'jpeg' : ext}`;
  const b64  = fs.readFileSync(filePath).toString('base64');
  return `data:${mime};base64,${b64}`;
}

/**
 * Fetch a remote image (http/https) and return as base64 data-URL.
 * Falls back to empty string on error.
 */
async function remoteUrlToDataUrl(url: string): Promise<string> {
  return new Promise((resolve) => {
    const proto = url.startsWith('https') ? https : http;
    proto.get(url, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (chunk: Buffer) => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const contentType = res.headers['content-type'] || 'image/jpeg';
        resolve(`data:${contentType};base64,${buffer.toString('base64')}`);
      });
      res.on('error', () => resolve(''));
    }).on('error', () => resolve(''));
  });
}

// ── Date Helpers ─────────────────────────────────────────────

interface DateParts {
  day: string;
  month: string; // e.g. "JANUARY"
  year: string;  // e.g. "2026"
}

function parseDateParts(dateStr: string): DateParts {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    return { day: '--', month: '---', year: '----' };
  }
  return {
    day:   String(d.getUTCDate()),
    month: d.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' }).toUpperCase(),
    year:  String(d.getUTCFullYear()),
  };
}

// ── Sanitisation ─────────────────────────────────────────────

function sanitize(value: string | null | undefined): string {
  if (!value) return '';
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\{\{/g, '&#123;&#123;')  // block template injection
    .replace(/\}\}/g, '&#125;&#125;')
    .substring(0, 200);                // max length guard
}

// ── Template Builder ─────────────────────────────────────────

function buildPhotoHtml(dataUrl: string, altText: string): string {
  if (!dataUrl) {
    // SVG person silhouette placeholder
    return `<svg class="photo-placeholder" viewBox="0 0 24 24" fill="none"
              stroke="rgba(255,255,255,0.5)" stroke-width="1.5" aria-label="No photo">
              <circle cx="12" cy="8" r="4"/>
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>`;
  }
  return `<img src="${dataUrl}" alt="${sanitize(altText)}" />`;
}

async function buildHtml(member: MemberCardData): Promise<string> {
  const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

  const startParts = parseDateParts(member.start_date);
  const endParts   = parseDateParts(member.end_date);

  // Encode assets
  const varaLogoB64      = localFileToDataUrl(VARA_LOGO_PATH);
  const varafiedBadgeB64 = localFileToDataUrl(VARAFIED_BADGE_PATH);

  // Member photo: fetch remote and inline
  let photoDataUrl = '';
  if (member.photo_url) {
    photoDataUrl = await remoteUrlToDataUrl(member.photo_url);
  }
  const photoHtml = buildPhotoHtml(photoDataUrl, member.full_name);

  const replacements: Record<string, string> = {
    '{{VARA_LOGO_B64}}':      varaLogoB64,
    '{{VARAFIED_BADGE_B64}}': varafiedBadgeB64,
    '{{PHOTO_HTML}}':         photoHtml,
    '{{FULL_NAME}}':          sanitize(member.full_name),
    '{{DESIGNATION}}':        sanitize(member.designation),
    '{{MEMBER_ID}}':          sanitize(member.member_id),
    '{{START_DAY}}':          sanitize(startParts.day),
    '{{START_MONTH}}':        sanitize(startParts.month),
    '{{START_YEAR}}':         sanitize(startParts.year),
    '{{END_DAY}}':            sanitize(endParts.day),
    '{{END_MONTH}}':          sanitize(endParts.month),
    '{{END_YEAR}}':           sanitize(endParts.year),
    '{{WEBSITE_URL}}':        sanitize(member.website_url || 'www.varauae.com'),
  };

  let html = template;
  for (const [key, value] of Object.entries(replacements)) {
    // Replace all occurrences
    html = html.split(key).join(value);
  }

  return html;
}

// ── Shared page loader ───────────────────────────────────────

// A6 at 96 dpi screen resolution for preview width
// 105mm = ~397px  |  148mm = ~560px  (96dpi × mm/25.4)
const A6_PX_W = 397;
const A6_PX_H = 560;

async function loadCardPage(html: string) {
  const browser = await getBrowser();
  const page = await browser.newPage();
  await page.setViewport({ width: A6_PX_W, height: A6_PX_H, deviceScaleFactor: 2 });
  await page.setContent(html, { waitUntil: 'networkidle2', timeout: 30_000 });
  await page.evaluateHandle('document.fonts.ready');
  return page;
}

// ── PDF Generator ────────────────────────────────────────────

async function generateA6Pdf(html: string): Promise<Buffer> {
  const page = await loadCardPage(html);
  try {
    const pdfBuffer = await page.pdf({
      width:  '105mm',
      height: '148mm',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      preferCSSPageSize: true,
    });
    return Buffer.from(pdfBuffer);
  } finally {
    await page.close();
  }
}

// ── PNG Screenshot (preview) ─────────────────────────────────

/**
 * Renders the same HTML template as a PNG screenshot.
 * Returns a high-res PNG buffer — pixel-perfect match to the PDF.
 */
async function generateA6Screenshot(html: string): Promise<Buffer> {
  const page = await loadCardPage(html);
  try {
    const png = await page.screenshot({
      type: 'png',
      clip: { x: 0, y: 0, width: A6_PX_W, height: A6_PX_H },
      omitBackground: false,
    });
    return Buffer.from(png);
  } finally {
    await page.close();
  }
}

// ── Supabase Fetch ───────────────────────────────────────────

/**
 * Fetch and normalise member card data from Supabase.
 * Throws if member not found.
 *
 * Schema notes (confirmed against live DB):
 *   member_profiles.id         → UUID (PK)
 *   member_profiles.member_id  → visible string, e.g. "VARA-2026-0001"
 *   memberships.member_id      → UUID FK → member_profiles.id
 *   storage bucket             → "profiles" (files organised by email folder)
 */
export async function fetchMemberCardData(memberId: string): Promise<MemberCardData> {
  // 1. Look up member profile by the human-readable member_id string
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('member_profiles')
    .select('id, user_id, member_id, full_name, job_title, profile_photo, profile_photo_url')
    .eq('member_id', memberId)
    .maybeSingle();

  if (profileError) {
    console.error('[IDCard] Supabase profile error:', profileError.message);
    throw new Error('Database error fetching member profile');
  }
  if (!profile) {
    throw new Error(`Member not found: ${memberId}`);
  }

  // 2. Look up active membership using the UUID PK (memberships.member_id → member_profiles.id)
  const { data: membership } = await supabaseAdmin
    .from('memberships')
    .select('joined_date, expiry_date, membership_type_id')
    .eq('member_id', profile.id)          // UUID join
    .in('status', ['active', 'pending'])
    .order('joined_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  // 3. Resolve membership type name
  let membershipTypeName: string | null = null;
  if (membership?.membership_type_id) {
    const { data: mtype } = await supabaseAdmin
      .from('membership_types')
      .select('name')
      .eq('id', membership.membership_type_id)
      .maybeSingle();
    membershipTypeName = mtype?.name ?? null;
  }

  // Fallbacks when no active membership found
  const today = new Date();
  const oneYearLater = new Date(today);
  oneYearLater.setFullYear(today.getFullYear() + 1);

  const designationRaw = membershipTypeName ?? profile.job_title ?? 'Member';

  // 4. Resolve photo URL
  //    Priority: profile_photo_url (full URL) → profile_photo (storage path)
  let photoUrl: string | null = null;

  if (profile.profile_photo_url && profile.profile_photo_url.startsWith('http')) {
    photoUrl = profile.profile_photo_url;
  } else if (profile.profile_photo) {
    if (profile.profile_photo.startsWith('http')) {
      // Already a full URL
      photoUrl = profile.profile_photo;
    } else {
      // Storage path — generate public URL from "profiles" bucket
      const { data: storageData } = supabaseAdmin.storage
        .from('profiles')
        .getPublicUrl(profile.profile_photo);
      photoUrl = storageData?.publicUrl ?? null;
    }
  }

  return {
    id:          profile.id,
    full_name:   profile.full_name,
    designation: designationRaw,
    member_id:   profile.member_id,
    photo_url:   photoUrl,
    start_date:  membership?.joined_date ?? today.toISOString().split('T')[0],
    end_date:    membership?.expiry_date ?? oneYearLater.toISOString().split('T')[0],
    website_url: process.env.WEBSITE_URL || 'www.varauae.com',
  };
}

// ── Public API ───────────────────────────────────────────────

/**
 * Full pipeline: fetch member → build HTML → generate PDF.
 * Returns PDF buffer + formatted file name.
 */
export async function generateIdCardPdf(memberId: string): Promise<GeneratedCard> {
  const memberData = await fetchMemberCardData(memberId);
  const html       = await buildHtml(memberData);
  const pdfBuffer  = await generateA6Pdf(html);

  const safeName = memberData.full_name
    .toUpperCase()
    .replace(/[^A-Z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

  const fileName = `${safeName}-${memberData.member_id}.pdf`;

  return { pdfBuffer, fileName };
}

/**
 * Returns a PNG screenshot of the card — exactly what the PDF looks like.
 * Used by the frontend preview panel.
 */
export async function generateIdCardPreviewPng(memberId: string): Promise<Buffer> {
  const memberData = await fetchMemberCardData(memberId);
  const html       = await buildHtml(memberData);
  return generateA6Screenshot(html);
}
