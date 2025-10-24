import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendEmail } from '@/lib/resend';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { to, subject = 'Elivra Test Email' } = await request.json();

    if (!to) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
    }

    const testHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Elivra Test Email</title>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1D3557; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #C9A961 0%, #F5F0E6 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          h1 { color: #1D3557; margin: 0; font-size: 28px; }
          .success { color: #10B981; background: #ECFDF5; padding: 16px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Elivra Email Test</h1>
          </div>
          <div class="content">
            <div class="success">
              <strong>✅ Success!</strong> Your email configuration is working correctly.
            </div>
            <p>Hello ${session.user?.name || 'there'}!</p>
            <p>This is a test email to verify that your Elivra email configuration is working properly with Resend.</p>
            <p><strong>Configuration Details:</strong></p>
            <ul>
              <li>✅ Resend API Key: Configured</li>
              <li>✅ From Email: ${process.env.RESEND_FROM_EMAIL}</li>
              <li>✅ Email Templates: Available</li>
              <li>✅ Send Function: Working</li>
            </ul>
            <p>You can now send invitations, reminders, and other event emails to your guests!</p>
            <p>Best regards,<br>The Elivra Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await sendEmail({
      to: to,
      subject: subject,
      html: testHtml,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Test email sent successfully!',
      data: result.data 
    });

  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json({ 
      error: 'Failed to send test email',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}