'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface DownloadQRButtonProps {
  qrCodeDataURL: string;
  inviteId: string;
}

export default function DownloadQRButton({ qrCodeDataURL, inviteId }: DownloadQRButtonProps) {
  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = qrCodeDataURL;
    a.download = `invite-${inviteId}.png`;
    a.click();
  };

  return (
    <Button
      type="button"
      className="btn-outline-gold text-sm flex items-center gap-2"
      onClick={handleDownload}
    >
      <Download className="h-4 w-4" /> Download QR
    </Button>
  );
}