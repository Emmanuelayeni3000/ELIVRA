import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendEmail } from '@/lib/resend';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
  const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { baseUrl } = body;

    // Fetch the guest and verify ownership
    const guest = await prisma.invite.findFirst({
      where: {
        id,
        event: {
          userId: session.user.id,
        },
      },
      include: {
        event: true,
      },
    });

    if (!guest) {
      return NextResponse.json({ error: 'Guest not found or unauthorized' }, { status: 404 });
    }

    if (!guest.email) {
      return NextResponse.json({ error: 'Guest does not have an email address' }, { status: 400 });
    }

  // Create RSVP-first link using guest token
    const token = guest.qrCode?.includes('/')
      ? guest.qrCode.split('/').filter(Boolean).pop() || guest.id
      : guest.qrCode ?? guest.id;
    const inviteLink = `${baseUrl || process.env.NEXT_PUBLIC_APP_URL}/rsvp/${token}`;

    // Enhanced Beautiful Email Template
    const emailHtml = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Wedding Invitation - ${guest.event.title}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap');
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              line-height: 1.6;
              color: #1D3557;
              background: linear-gradient(135deg, #F5F0E6 0%, #FFFFFF 100%);
              margin: 0;
              padding: 20px;
            }
            
            .email-container {
              max-width: 650px;
              margin: 0 auto;
              background: #FFFFFF;
              border-radius: 20px;
              box-shadow: 0 20px 40px rgba(29, 53, 87, 0.08);
              overflow: hidden;
              position: relative;
            }
            
            .decorative-border {
              height: 4px;
              background: linear-gradient(90deg, #C9A368 0%, #D4B377 50%, #C9A368 100%);
            }
            
            .header {
              background: linear-gradient(135deg, #1D3557 0%, #2A4A6B 50%, #1D3557 100%);
              color: white;
              padding: 50px 40px;
              text-align: center;
              position: relative;
              overflow: hidden;
            }
            
            .header::before {
              content: '';
              position: absolute;
              top: -50%;
              left: -50%;
              width: 200%;
              height: 200%;
              background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1" fill="rgba(255,255,255,0.03)"/><circle cx="80" cy="80" r="1" fill="rgba(255,255,255,0.03)"/><circle cx="40" cy="60" r="1" fill="rgba(255,255,255,0.03)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
              animation: float 20s ease-in-out infinite;
            }
            
            @keyframes float {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              50% { transform: translateY(-20px) rotate(180deg); }
            }
            
            .header-content {
              position: relative;
              z-index: 2;
            }
            
            .invitation-title {
              font-family: 'Playfair Display', serif;
              font-size: 42px;
              font-weight: 700;
              margin: 0 0 15px 0;
              text-shadow: 0 2px 4px rgba(0,0,0,0.1);
              letter-spacing: -0.5px;
            }
            
            .invitation-subtitle {
              font-size: 18px;
              font-weight: 300;
              opacity: 0.95;
              letter-spacing: 0.5px;
            }
            
            .content {
              padding: 50px 40px;
            }
            
            .greeting {
              font-size: 18px;
              margin-bottom: 25px;
              color: #1D3557;
            }
            
            .guest-name {
              font-weight: 600;
              color: #C9A368;
            }
            
            .invitation-text {
              font-size: 16px;
              margin-bottom: 35px;
              line-height: 1.7;
              color: #444444;
            }
            
            .event-details {
              background: linear-gradient(135deg, #F5F0E6 0%, #FAF5F0 100%);
              padding: 35px;
              border-radius: 16px;
              margin: 35px 0;
              border: 1px solid rgba(201, 163, 104, 0.1);
              position: relative;
              overflow: hidden;
            }
            
            .event-details::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 3px;
              background: linear-gradient(90deg, #C9A368, #D4B377, #C9A368);
            }
            
            .event-title {
              font-family: 'Playfair Display', serif;
              color: #1D3557;
              font-size: 28px;
              font-weight: 600;
              margin: 0 0 25px 0;
              text-align: center;
              letter-spacing: -0.3px;
            }
            
            .detail-item {
              margin: 18px 0;
              display: flex;
              align-items: center;
              font-size: 16px;
              color: #1D3557;
            }
            
            .detail-icon {
              width: 50px;
              height: 50px;
              margin-right: 20px;
              background: linear-gradient(135deg, #C9A368, #D4B377);
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 20px;
              flex-shrink: 0;
              box-shadow: 0 4px 12px rgba(201, 163, 104, 0.2);
            }
            
            .detail-text {
              font-weight: 500;
              line-height: 1.4;
            }
            
            .event-description {
              margin-top: 25px;
              padding: 20px;
              background: rgba(255, 255, 255, 0.7);
              border-radius: 12px;
              font-style: italic;
              color: #666;
              border-left: 4px solid #C9A368;
            }
            
            .cta-section {
              text-align: center;
              margin: 40px 0;
            }
            
            .cta-text {
              font-size: 16px;
              margin-bottom: 25px;
              color: #444444;
            }
            
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #C9A368 0%, #D4B377 100%);
              color: white;
              padding: 18px 40px;
              text-decoration: none;
              border-radius: 50px;
              font-weight: 600;
              font-size: 16px;
              letter-spacing: 0.5px;
              transition: all 0.3s ease;
              box-shadow: 0 8px 25px rgba(201, 163, 104, 0.3);
              text-transform: uppercase;
            }
            
            .cta-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 12px 35px rgba(201, 163, 104, 0.4);
            }
            
            .closing-message {
              font-size: 16px;
              line-height: 1.7;
              color: #444444;
              margin: 35px 0;
              text-align: center;
            }
            
            .signature {
              font-family: 'Playfair Display', serif;
              font-size: 18px;
              font-weight: 600;
              color: #1D3557;
              text-align: center;
              margin: 30px 0;
            }
            
            .footer {
              background: linear-gradient(135deg, #F5F0E6 0%, #E8DDD4 100%);
              padding: 30px 40px;
              text-align: center;
              border-top: 1px solid rgba(201, 163, 104, 0.1);
            }
            
            .footer-content {
              color: #666;
              font-size: 13px;
              line-height: 1.6;
            }
            
            .wedvite-branding {
              margin-top: 15px;
              font-weight: 600;
              color: #C9A368;
              font-size: 14px;
              letter-spacing: 0.5px;
            }
            
            .divider {
              height: 1px;
              background: linear-gradient(90deg, transparent, #C9A368, transparent);
              margin: 30px 0;
            }
            
            /* Mobile Responsive */
            @media (max-width: 600px) {
              body { padding: 10px; }
              .email-container { border-radius: 12px; }
              .header { padding: 35px 25px; }
              .invitation-title { font-size: 32px; }
              .content { padding: 35px 25px; }
              .event-details { padding: 25px 20px; }
              .footer { padding: 25px 20px; }
              .cta-button { padding: 15px 30px; font-size: 15px; }
              .detail-icon { width: 40px; height: 40px; margin-right: 15px; }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="decorative-border"></div>
            
            <div class="header">
              <div class="header-content">
                <h1 class="invitation-title">✨ You're Invited ✨</h1>
                <p class="invitation-subtitle">Join us for a celebration of love and joy</p>
              </div>
            </div>
            
            <div class="content">
              <p class="greeting">Dear <span class="guest-name">${guest.guestName}</span>,</p>
              
              <p class="invitation-text">
                We joyfully invite you to celebrate with us at our special event. 
                Your presence would make our celebration complete and meaningful.
              </p>
              
              <div class="event-details">
                <h3 class="event-title">${guest.event.title}</h3>
                
                <div class="detail-item">
                  <div class="detail-icon">📅</div>
                  <div class="detail-text">
                    <strong>${new Date(guest.event.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</strong>
                  </div>
                </div>
                
                ${guest.event.time ? `
                <div class="detail-item">
                  <div class="detail-icon">🕐</div>
                  <div class="detail-text">
                    <strong>${guest.event.time}</strong>
                  </div>
                </div>
                ` : ''}
                
                <div class="detail-item">
                  <div class="detail-icon">📍</div>
                  <div class="detail-text">
                    <strong>${guest.event.location}</strong>
                  </div>
                </div>
                
                ${guest.event.description ? `
                <div class="event-description">
                  <p>${guest.event.description}</p>
                </div>
                ` : ''}
              </div>
              
              <div class="cta-section">
                <p class="cta-text">
                  Click below to confirm your RSVP first. You'll be taken to your personalized invitation right after:
                </p>
                
                <a href="${inviteLink}" class="cta-button">
                  Review & Confirm RSVP
                </a>
              </div>
              
              <div class="divider"></div>
              
              <p class="closing-message">
                We can't wait to celebrate this special moment with you. 
                Your presence will make our day even more memorable!
              </p>
              
              <p class="signature">
                With love and excitement,<br>
                The Wedding Team 💕
              </p>
            </div>
            
            <div class="footer">
              <div class="footer-content">
                <p>This invitation was sent via WedVite - Digital Wedding Invitations</p>
                <p>If you have any issues accessing your invitation, please contact us directly.</p>
                <div class="wedvite-branding">WedVite ✨ Making celebrations beautiful</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email
    await sendEmail({
      to: guest.email,
      subject: `You're Invited! ${guest.event.title}`,
      html: emailHtml,
    });

    // Update the sentAt timestamp
    await prisma.invite.update({
      where: { id: guest.id },
      data: { sentAt: new Date() },
    });

    return NextResponse.json({ message: 'Invitation sent successfully' }, { status: 200 });
  } catch (error: unknown) {
    console.error('Send invitation error:', error);
    return NextResponse.json({ error: 'Failed to send invitation' }, { status: 500 });
  }
}