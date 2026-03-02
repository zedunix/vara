import { forwardRef } from 'react';
import { User as UserIcon } from 'lucide-react';
import varafiedBadge from '/Images/vara-logo.png';

interface IdCardPreviewProps {
  userData: {
    fullName: string;
    role: string;
    memberId: string;
    startDate: string;
    endDate: string;
    photoUrl?: string;
  };
}

const IdCardPreview = forwardRef<HTMLDivElement, IdCardPreviewProps>(
  ({ userData }, ref) => {
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      const month = date.toLocaleDateString('en-US', { month: 'long' }).toUpperCase();
      const year = date.getFullYear();
      const day = date.getDate();
      return { month, year, day };
    };

    const startDateParts = formatDate(userData.startDate);
    const endDateParts = formatDate(userData.endDate);

    return (
      <div
        ref={ref}
        style={{
          position: 'relative',
          backgroundColor: '#0066FF',
          overflow: 'hidden',
          width: '105mm',
          height: '148mm',
          aspectRatio: '105/148',
        }}
      >
        {/* Decorative Background Circles - Left Side */}
        <div style={{ position: 'absolute', left: '-4mm', top: '45%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '3mm', zIndex: 1 }}>
          <div style={{ display: 'flex', gap: '3mm' }}>
            <div style={{ width: '8mm', height: '8mm', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.08)' }} />
            <div style={{ width: '8mm', height: '8mm', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.08)' }} />
            <div style={{ width: '8mm', height: '8mm', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.08)' }} />
            <div style={{ width: '8mm', height: '8mm', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.05)' }} />
          </div>
          <div style={{ display: 'flex', gap: '3mm' }}>
            <div style={{ width: '8mm', height: '8mm', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.08)' }} />
            <div style={{ width: '8mm', height: '8mm', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.08)' }} />
            <div style={{ width: '8mm', height: '8mm', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.08)' }} />
            <div style={{ width: '8mm', height: '8mm', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.05)' }} />
          </div>
          <div style={{ display: 'flex', gap: '3mm' }}>
            <div style={{ width: '8mm', height: '8mm', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.08)' }} />
            <div style={{ width: '8mm', height: '8mm', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.08)' }} />
            <div style={{ width: '8mm', height: '8mm', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.08)' }} />
            <div style={{ width: '8mm', height: '8mm', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.05)' }} />
          </div>
        </div>

        {/* Main Content Container */}
        <div style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'column', paddingLeft: '8mm', paddingRight: '8mm', paddingTop: '8mm', paddingBottom: '8mm' }}>
          {/* Header Section */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '6mm' }}>
            {/* Left: Title Text */}
            <div style={{ flex: 1 }}>
              <h1
                style={{
                  fontSize: '4.2mm',
                  color: '#66B3FF',
                  letterSpacing: '0.3mm',
                  lineHeight: '1.2',
                  fontWeight: 'bold',
                }}
              >
                THE CREATIVE
                <br />
                MALAYALI
                <br />
                DESIGNERS
                <br />
                OF UAE
              </h1>
            </div>

            {/* Right: VARA Logo */}
            <div
              style={{width: '22mm',
                height: '22mm',
                flexShrink: 0,
              }}
            >
              <img
                src="/Images/vara-id.png"
                alt="VARA Logo"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
          </div>

          {/* "Be a varafied member" Section */}
          <div style={{ marginBottom: '4mm' }}>
            <h2
              style={{
                fontSize: '11mm',
                lineHeight: '0.95',
                letterSpacing: '-0.5mm',
                fontWeight: 'bold',
              }}
            >
              <span style={{ color: 'transparent', WebkitTextStroke: '1.2px #FFD700' }}>Be</span>
              <br />
              <span style={{ color: 'transparent', WebkitTextStroke: '1.2px #FFD700' }}>a </span>
              <span style={{ color: '#FFD700', fontWeight: 900, textShadow: '0 2px 4px rgba(255, 215, 0, 0.3)' }}>varafied</span>
              <img
                src={varafiedBadge}
                alt="Varafied Badge"
                style={{
                  display: 'inline-block',
                  marginLeft: '0.5em',
                  width: '7mm',
                  height: '7mm',
                  transform: 'translateY(1mm)',
                  filter: 'drop-shadow(0 2px 6px rgba(255, 215, 0, 0.4))',
                }}
              />
              <br />
              <span style={{ color: 'transparent', WebkitTextStroke: '1.2px #FFD700' }}>member</span>
            </h2>
            <p
              style={{
                marginTop: '2mm',
                lineHeight: '1.4',
                fontSize: '3mm',
                color: 'rgba(255, 255, 255, 0.95)',
                maxWidth: '50mm',
              }}
            >
              Official inauguration of verified
              <br />
              Membership Registration
            </p>
          </div>

          {/* User Photo */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6mm', marginBottom: '5mm' }}>
            {/* Photo Container with Name and Role */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2mm' }}>
              <div
                style={{
                  borderRadius: '50%',
                  overflow: 'hidden',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32mm',
                  height: '32mm',
                  border: '3px solid #FFD700',
                  boxSizing: 'border-box',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                }}
              >
                {userData.photoUrl ? (
                  <img
                    src={userData.photoUrl}
                    alt={userData.fullName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <UserIcon style={{ width: '16mm', height: '16mm', color: 'rgba(255, 255, 255, 0.6)' }} />
                )}
              </div>
              {/* Name below photo */}
              <div style={{ textAlign: 'center', width: '32mm' }}>
                <div
                  style={{
                    fontSize: '3.5mm',
                    color: 'white',
                    fontWeight: 'bold',
                    lineHeight: 1.2,
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  {userData.fullName}
                </div>
                <div
                  style={{
                    fontSize: '2.8mm',
                    color: 'white',
                    fontWeight: 500,
                    marginTop: '0.5mm',
                    textTransform: 'uppercase',
                  }}
                >
                  {userData.role}
                </div>
              </div>
              {/* For more info section */}
              <div style={{ textAlign: 'center', marginTop: '1mm' }}>
                <div
                  style={{ fontSize: '2.5mm', color: '#FFD700', fontWeight: 600 }}
                >
                  For more info
                </div>
                <div
                  style={{ fontSize: '3mm', color: 'white', fontWeight: 'bold', marginTop: '0.5mm' }}
                >
                  www.varauae.com
                </div>
              </div>
            </div>

            {/* Date Grid on Right Side */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5mm', alignContent: 'start' }}>
              {/* Starts On */}
              <div
                style={{ gridColumn: 'span 2', paddingBottom: '1.5mm', borderBottom: '0.5mm solid rgba(255,255,255,0.2)' }}
              >
                <div
                  style={{ fontSize: '3mm', color: 'white', fontWeight: 'bold', letterSpacing: '0.05em' }}
                >
                  STARTS
                </div>
                <div
                  style={{ fontSize: '3mm', color: 'white', fontWeight: 'bold', letterSpacing: '0.05em' }}
                >
                  ON
                </div>
                <div
                  style={{ fontSize: '2.2mm', color: '#66B3FF', fontWeight: 500, marginTop: '0.5mm' }}
                >
                  {startDateParts.month}
                </div>
                <div
                  style={{ fontSize: '2.2mm', color: '#66B3FF', fontWeight: 500 }}
                >
                  {startDateParts.year}
                </div>
              </div>

              {/* Big Start Day */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '1mm' }}>
                <div
                  style={{
                    fontSize: '14mm',
                    color: 'transparent',
                    WebkitTextStroke: '1.2px #FFD700',
                    width: '18mm',
                    height: '18mm',
                    lineHeight: 1,
                    fontWeight: 900,
                    fontVariantNumeric: 'tabular-nums',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {startDateParts.day}
                </div>
              </div>

              {/* Icons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5mm', justifyContent: 'center', alignItems: 'center', paddingTop: '1mm' }}>
                <div
                  style={{
                    width: '7mm',
                    height: '7mm',
                    borderRadius: '50%',
                    border: '1.5px solid #FFD700',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <UserIcon style={{ width: '3.5mm', height: '3.5mm', color: '#FFD700' }} />
                </div>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FFD700"
                  strokeWidth="1.5"
                  style={{ width: '7mm', height: '7mm' }}
                >
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              </div>

              {/* Ends On */}
              <div
                style={{ gridColumn: 'span 2', paddingBottom: '1.5mm', marginTop: '1.5mm', borderBottom: '0.5mm solid rgba(255,255,255,0.2)' }}
              >
                <div
                  style={{ fontSize: '3mm', color: 'white', fontWeight: 'bold', letterSpacing: '0.05em' }}
                >
                  ENDS
                </div>
                <div
                  style={{ fontSize: '3mm', color: 'white', fontWeight: 'bold', letterSpacing: '0.05em' }}
                >
                  ON
                </div>
                <div
                  style={{ fontSize: '2.2mm', color: '#66B3FF', fontWeight: 500, marginTop: '0.5mm' }}
                >
                  {endDateParts.month}
                </div>
                <div
                  style={{ fontSize: '2.2mm', color: '#66B3FF', fontWeight: 500 }}
                >
                  {endDateParts.year}
                </div>
              </div>

              {/* Big End Day */}
              <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '1mm' }}>
                <div
                  style={{
                    fontSize: '14mm',
                    color: 'transparent',
                    WebkitTextStroke: '1.2px #FFD700',
                    width: '18mm',
                    height: '18mm',
                    lineHeight: 1,
                    fontWeight: 900,
                    fontVariantNumeric: 'tabular-nums',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {endDateParts.day}
                </div>
              </div>
            </div>
          </div>

          {/* Social Icons at Bottom */}
          <div style={{ marginTop: 'auto', paddingTop: '2mm', textAlign: 'center' }}>
            <div
              style={{ fontSize: '2.5mm', color: '#66B3FF', fontWeight: 500, letterSpacing: '0.05em' }}
            >
              f @ ✉ ✆ @ @varauae
            </div>
          </div>
        </div>
      </div>
    );
  }
);

IdCardPreview.displayName = 'IdCardPreview';

export default IdCardPreview;
