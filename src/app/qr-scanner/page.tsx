'use client';

import { useState, useRef, useCallback } from 'react';
// The library exports a default component; adjust import accordingly
import QrScanner from 'react-qr-barcode-scanner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Camera, RefreshCcw, Scan } from 'lucide-react';

export default function QRScannerPage() {
  const [data, setData] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState<boolean>(true);
  const lastResultRef = useRef<string>('');

  const handleResult = useCallback((text: string) => {
    if (text && text !== lastResultRef.current) {
      lastResultRef.current = text;
      setData(text);
      setError(null);
      setScanning(false);
    }
  }, []);

  const resetScan = () => {
    setScanning(true);
    setData('');
    setError(null);
    lastResultRef.current = '';
  };

  return (
    <div className="section-frame py-10 animate-fade-up-soft">
      <Card className="w-full max-w-xl mx-auto wedding-elevated-card">
        <CardHeader className="text-center space-y-4">
          <div className="accent-bar-gold mb-2">
            <CardTitle className="text-3xl font-bold text-royal-navy font-playfair-display flex items-center justify-center gap-2">
              <Scan className="h-7 w-7 text-royal-navy" /> QR Scanner
            </CardTitle>
          </div>
          <CardDescription className="text-slate-gray font-inter">
            Scan guest invitation QR codes to check them in quickly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="relative w-full h-72 rounded-xl border border-royal-navy/15 bg-gradient-to-b from-white/60 to-white/30 backdrop-blur-sm overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-60 h-60 border-2 border-gold-sand/80 rounded-xl shadow-inner relative">
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-transparent via-royal-navy/70 to-transparent animate-pulse" />
                {!data && (
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-xs font-inter text-slate-gray/70 tracking-wide">Align code within frame</div>
                )}
              </div>
            </div>
            {scanning && (
              <QrScanner
                onUpdate={(err: unknown, result: unknown) => {
                  if (result) {
                    try {
                      const r: Record<string, unknown> = result as Record<string, unknown>;
                      const text = typeof (r as { getText?: () => string }).getText === 'function'
                        ? (r as { getText: () => string }).getText()
                        : typeof r.text === 'string'
                          ? (r.text as string)
                          : '';
                      if (text) handleResult(text);
                    } catch {
                      // ignore malformed reading
                    }
                  } else if (err) {
                    if (err && typeof err === 'object' && 'message' in (err as Record<string, unknown>)) {
                      setError(String((err as { message?: unknown }).message || ''));
                    } else if (typeof err === 'string') {
                      setError(err);
                    }
                  }
                }}
                onError={(err: string | DOMException) => {
                  if (typeof err === 'string') {
                    setError(err);
                  } else if (err && typeof err === 'object') {
                    const maybeMsg = (err as { message?: unknown }).message;
                    if (typeof maybeMsg === 'string') setError(maybeMsg);
                    else setError('Unknown error');
                  }
                }}
              />
            )}
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button onClick={resetScan} variant="outline" className="btn-outline-gold flex items-center gap-2 text-sm">
              <RefreshCcw className="h-4 w-4" />
              {scanning ? 'Reset' : 'Scan Again'}
            </Button>
            <Link href="/dashboard">
              <Button className="btn-gradient-primary flex items-center gap-2 text-sm">
                <Camera className="h-4 w-4" /> Dashboard
              </Button>
            </Link>
          </div>
          <div className="text-center space-y-3">
            {data && (
              <div className="space-y-2">
                <p className="font-inter text-sm text-slate-gray">Scanned Data</p>
                <Badge variant="outline" className="font-mono text-xs px-3 py-2 bg-gold-sand/10 border-gold-sand/40 max-w-full break-all">
                  {data}
                </Badge>
              </div>
            )}
            {error && !data && (
              <p className="text-sm text-destructive font-inter">{error}</p>
            )}
            {!data && !error && (
              <p className="text-xs text-slate-gray/70 font-inter tracking-wide">Initializing camera...</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}