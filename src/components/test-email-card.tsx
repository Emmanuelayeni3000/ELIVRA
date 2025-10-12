'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Send, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function TestEmailCard() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<{ success: boolean; message: string } | null>(null);

  const sendTestEmail = async () => {
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          to: email,
          subject: 'WedVite Email Configuration Test'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setLastResult({ success: true, message: data.message });
        toast.success('Test email sent successfully!');
        setEmail('');
      } else {
        setLastResult({ success: false, message: data.error || 'Failed to send email' });
        toast.error(data.error || 'Failed to send test email');
      }
    } catch {
      const errorMessage = 'Network error occurred';
      setLastResult({ success: false, message: errorMessage });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="wedding-elevated-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30">
      <CardHeader className="pb-3 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Mail className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-royal-navy">Email Configuration Test</CardTitle>
            <p className="text-sm text-slate-gray">Verify your Resend email setup</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 px-4 sm:px-6">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Enter test email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={sendTestEmail}
              disabled={loading || !email}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {lastResult && (
            <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
              lastResult.success 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {lastResult.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <span>{lastResult.message}</span>
            </div>
          )}

          <div className="text-xs text-slate-500 space-y-1">
            <p><strong>Note:</strong> This will send a test email to verify your configuration.</p>
            <p>Make sure your RESEND_API_KEY and RESEND_FROM_EMAIL are set in your environment variables.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}