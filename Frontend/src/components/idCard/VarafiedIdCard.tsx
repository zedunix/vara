import { useCallback, useEffect, useState } from 'react';
import { Upload, Loader2, FileType, RefreshCw } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { downloadIdCardPdf } from './IdCardDownload';
import { toast } from 'sonner';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5003/api').replace(/\/+$/, '');

const VarafiedIdCard: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Server-rendered preview state
  const [previewUrl, setPreviewUrl]           = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewError, setPreviewError]       = useState(false);

  // Derived card meta from store (for the info panel only)
  const getUserData = () => {
    const memberProfile = user?.memberProfile;
    const membership    = memberProfile?.memberships?.[0];
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    return {
      fullName:  memberProfile?.full_name || user?.name || 'Member Name',
      role:      user?.role === 'admin' || user?.role === 'superadmin'
                   ? 'FOUNDER & CHAIRMAN OF VARA UAE'
                   : membership?.membership_types?.name || 'Member',
      memberId:  memberProfile?.member_id || 'VARA-MEMBER',
      startDate: membership?.joined_date || new Date().toISOString(),
      endDate:   membership?.expiry_date || oneYearFromNow.toISOString(),
      photoUrl:  memberProfile?.profile_photo_url || memberProfile?.profile_photo || undefined,
    };
  };
  const userData = getUserData();

  // ── Load server-rendered preview ───────────────────────────
  const loadPreview = useCallback(async () => {
    if (!userData.memberId || userData.memberId === 'VARA-MEMBER') return;

    setIsLoadingPreview(true);
    setPreviewError(false);

    // Revoke old object URL to free memory
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${API_BASE}/id-card/preview-image/${encodeURIComponent(userData.memberId)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error(`${res.status}`);
      const blob = await res.blob();
      setPreviewUrl(URL.createObjectURL(blob));
    } catch {
      setPreviewError(true);
    } finally {
      setIsLoadingPreview(false);
    }
  }, [userData.memberId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load on mount (and when memberId becomes available)
  useEffect(() => {
    loadPreview();
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [userData.memberId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Photo upload ──────────────────────────────────────────
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return; }
    if (file.size > 5 * 1024 * 1024)    { toast.error('Image size should be less than 5MB'); return; }

    setIsUploadingPhoto(true);
    toast.info('Uploading photo...');

    try {
      const formData = new FormData();
      formData.append('profilePhoto', file);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${API_BASE}/members/me/profile-photo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to upload photo');
      }
      const data = await response.json();
      if (user?.memberProfile) {
        updateUser({
          memberProfile: {
            ...user.memberProfile,
            profile_photo: data.data.profile_photo,
          },
        });
      }
      setIsUploadingPhoto(false);
      toast.success('Photo uploaded! Refreshing preview...');
      // Refresh the server-rendered preview after upload
      await loadPreview();
    } catch (error) {
      setIsUploadingPhoto(false);
      toast.error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // ── PDF download ──────────────────────────────────────────
  const handlePdfDownload = async () => {
    if (!userData.memberId || userData.memberId === 'VARA-MEMBER') {
      toast.error('Member ID not found. Please complete your profile.');
      return;
    }
    await downloadIdCardPdf({
      memberId: userData.memberId,
      onDownloadStart:    () => { setIsDownloadingPdf(true);  toast.info('Generating print-ready PDF...'); },
      onDownloadComplete: () => { setIsDownloadingPdf(false); toast.success('PDF downloaded! Ready for professional printing.'); },
      onDownloadError:    (e) => { setIsDownloadingPdf(false); toast.error(`PDF failed: ${e.message}`); },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Varafied ID Card</h1>
          <p className="text-gray-600 dark:text-gray-400">Your official VARA membership identification card</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* ── LEFT: Card Preview ── */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">

              {/* Title + refresh */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Card Preview</h2>
                <button
                  onClick={loadPreview}
                  disabled={isLoadingPreview}
                  title="Refresh preview"
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-40"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingPreview ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* ── Server-rendered preview image ── */}
              <div className="flex justify-center">
                <div
                  className="rounded-xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700"
                  style={{ width: '100%', maxWidth: '380px', aspectRatio: '105/148', background: '#0033ff' }}
                >
                  {isLoadingPreview && (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-blue-700">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                      <p className="text-white text-sm font-medium">Rendering card...</p>
                    </div>
                  )}

                  {!isLoadingPreview && previewError && (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gray-100 dark:bg-gray-700 p-6">
                      <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
                        Preview unavailable. Make sure the backend is running.
                      </p>
                      <button
                        onClick={loadPreview}
                        className="text-xs text-blue-500 hover:text-blue-700 underline"
                      >
                        Try again
                      </button>
                    </div>
                  )}

                  {!isLoadingPreview && !previewError && previewUrl && (
                    <img
                      src={previewUrl}
                      alt="VARA ID Card Preview"
                      className="w-full h-full object-contain"
                      style={{ display: 'block' }}
                    />
                  )}
                </div>
              </div>

              <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-3">
                This is the exact image that will be printed — server-rendered
              </p>

              {/* ── Download Buttons ── */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={handlePdfDownload}
                  disabled={isDownloadingPdf}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                >
                  {isDownloadingPdf ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Generating PDF...</>
                  ) : (
                    <><FileType className="w-5 h-5" /> Download ID Card (PDF — Print-Ready)</>
                  )}
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  True A6 · 105 × 148 mm · Press-ready · Puppeteer-rendered
                </p>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Info & Controls ── */}
          <div className="space-y-6">

            {/* Card Information */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Card Information</h2>
              <div className="space-y-4">
                {[
                  { label: 'Full Name',   value: userData.fullName },
                  { label: 'Member ID',   value: userData.memberId, mono: true },
                  { label: 'Role',        value: userData.role },
                  { label: 'Start Date',  value: new Date(userData.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) },
                  { label: 'End Date',    value: new Date(userData.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) },
                ].map((row, i, arr) => (
                  <div key={row.label} className={`flex items-center justify-between py-3 ${i < arr.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{row.label}</span>
                    <span className={`text-sm font-semibold text-gray-900 dark:text-white ${row.mono ? 'font-mono' : ''}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Profile Photo */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Profile Photo</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Upload a professional photo. Changes will instantly reflect in the preview.
              </p>
              <div className="space-y-4">
                {userData.photoUrl && (
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                      <img src={userData.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Current Photo</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Shown on your ID card</p>
                    </div>
                  </div>
                )}
                <label className="relative block cursor-pointer">
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" disabled={isUploadingPhoto} />
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                    {isUploadingPhoto ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">Uploading...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="w-8 h-8 text-gray-400" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">Click to upload a new photo</p>
                        <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">💡 Tips for Best Results</h3>
              <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">•</span><span>Use a square, professional photo with good lighting</span></li>
                <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">•</span><span>Face clearly visible and centred in the frame</span></li>
                <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">•</span><span>The preview above is the exact output — no surprises when printing</span></li>
                <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">•</span><span>Card is A6 (105 × 148 mm) — print directly from the PDF</span></li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default VarafiedIdCard;

/* ──────────────────────────────────────────────────────────
 * LEGACY COMPONENT — kept temporarily, not exported, not used.
 * Will be deleted once the server-rendered preview is confirmed.
 * ────────────────────────────────────────────────────────── */
const _DeprecatedVarafiedIdCard: React.FC = () => {
  const cardRef = (null as unknown as React.RefObject<HTMLDivElement>);
  const { user, updateUser } = useAuthStore();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Get user data for the card
  const getUserData = () => {
    const memberProfile = user?.memberProfile;
    const membership = memberProfile?.memberships?.[0];
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

    return {
      fullName: memberProfile?.full_name || user?.name || 'Member Name',
      role:
        user?.role === 'admin' || user?.role === 'superadmin'
          ? 'FOUNDER & CHAIRMAN OF VARA UAE'
          : membership?.membership_types?.name || 'Member',
      memberId: memberProfile?.member_id || 'VARA-MEMBER',
      startDate: membership?.joined_date || new Date().toISOString(),
      endDate: membership?.expiry_date || oneYearFromNow.toISOString(),
      photoUrl:
        photoUrl ||
        memberProfile?.profile_photo ||
        user?.portfolio_pdf_url ||
        undefined,
    };
  };

  const userData = getUserData();

  // Handle photo upload
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setIsUploadingPhoto(true);
    toast.info('Uploading photo...');

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('profilePhoto', file);

      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Upload to backend
      const response = await fetch('http://localhost:5003/api/members/me/profile-photo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload photo');
      }

      const data = await response.json();
      
      // Update local state with the uploaded photo URL
      setPhotoUrl(data.data.profile_photo);
      
      // Update auth store so photo persists after refresh
      if (user?.memberProfile) {
        updateUser({
          memberProfile: {
            ...user.memberProfile,
            profile_photo: data.data.profile_photo,
          },
        });
      }

      setIsUploadingPhoto(false);
      toast.success('Photo uploaded and saved to database!');
    } catch (error) {
      setIsUploadingPhoto(false);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      toast.error(`Upload failed: ${errorMessage}`);
      console.error('Photo upload error:', error);
    }
  };

  const handleDownload = async () => {
    await downloadIdCard({
      cardRef,
      fileName: `VARA_ID_Card_${userData.memberId}`,
      onDownloadStart: () => {
        setIsDownloading(true);
        toast.info('Preparing your ID card...');
      },
      onDownloadComplete: () => {
        setIsDownloading(false);
        toast.success('ID card downloaded successfully!');
      },
      onDownloadError: (error) => {
        setIsDownloading(false);
        toast.error(`Download failed: ${error.message}`);
      },
    });
  };

  const handlePdfDownload = async () => {
    if (!userData.memberId || userData.memberId === 'VARA-MEMBER') {
      toast.error('Member ID not found. Please complete your profile.');
      return;
    }
    await downloadIdCardPdf({
      memberId: userData.memberId,
      onDownloadStart: () => {
        setIsDownloadingPdf(true);
        toast.info('Generating print-ready PDF...');
      },
      onDownloadComplete: () => {
        setIsDownloadingPdf(false);
        toast.success('PDF downloaded! Ready for professional printing.');
      },
      onDownloadError: (error) => {
        setIsDownloadingPdf(false);
        toast.error(`PDF generation failed: ${error.message}`);
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Varafied ID Card
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your official VARA membership identification card
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: ID Card Preview */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Card Preview
              </h2>

              {/* Card Container with proper aspect ratio */}
              <div className="flex justify-center">
                <div
                  className="shadow-2xl rounded-lg overflow-hidden"
                  style={{
                    width: '100%',
                    maxWidth: '420px',
                    aspectRatio: '105/148',
                  }}
                >
                  <div className="w-full h-full" style={{ aspectRatio: '105/148' }}>
                    <IdCardPreview ref={cardRef} userData={userData} />
                  </div>
                </div>
              </div>

              {/* Download Buttons */}
              <div className="mt-8 space-y-3">
                {/* PDF (print-ready, server-side Puppeteer) */}
                <button
                  onClick={handlePdfDownload}
                  disabled={isDownloadingPdf || isDownloading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                >
                  {isDownloadingPdf ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <FileType className="w-5 h-5" />
                      Download ID Card (PDF — Print-Ready)
                    </>
                  )}
                </button>

                {/* PNG (client-side html2canvas) */}
                <button
                  onClick={handleDownload}
                  disabled={isDownloading || isDownloadingPdf}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl shadow hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating Image...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Download ID Card (PNG Preview)
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  PDF: True A6 (105 × 148 mm) · Press-ready · Server-rendered
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Card Information & Controls */}
          <div className="space-y-6">
            {/* User Information */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Card Information
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Full Name
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {userData.fullName}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Member ID
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white font-mono">
                    {userData.memberId}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Role
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {userData.role}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Start Date
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {new Date(userData.startDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    End Date
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {new Date(userData.endDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Photo Upload */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Profile Photo
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Upload a professional photo for your ID card. Square images work best.
              </p>

              <div className="space-y-4">
                {/* Current Photo Preview */}
                {userData.photoUrl && (
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                      <img
                        src={userData.photoUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Current Photo
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        This photo will appear on your ID card
                      </p>
                    </div>
                  </div>
                )}

                {/* Upload Button */}
                <label className="relative block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={isUploadingPhoto}
                  />
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                    {isUploadingPhoto ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Uploading...
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="w-8 h-8 text-gray-400" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Click to upload a new photo
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          PNG, JPG up to 5MB
                        </p>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
                💡 Tips for Best Results
              </h3>
              <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Use a square, professional photo with good lighting</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Ensure your face is clearly visible and centered</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Download the card as PNG for best print quality</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>The card is A6 size (105mm × 148mm) - perfect for printing</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
// end _DeprecatedVarafiedIdCard
