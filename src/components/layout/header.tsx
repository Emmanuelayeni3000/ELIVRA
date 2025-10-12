'use client';

import { useState, useEffect } from 'react';
import { ChartNoAxesGantt, X } from 'lucide-react';
import { Sheet, SheetContent, SheetClose } from '@/components/ui/sheet'
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
// auth hooks removed because header uses a single CTA; keep file lean

export default function Header() {
  // no auth state needed for simplified header

  const [scrolled, setScrolled] = useState(false);
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const headerBase = 'top-0 left-0 right-0 z-50 transition-all duration-300';
  const headerPosition = scrolled ? 'fixed' : 'absolute';
  const headerBg = scrolled
    ? 'backdrop-blur-md bg-white/20 dark:bg-royal-navy/10 shadow-md text-royal-navy'
    : 'bg-transparent text-pure-white';

  return (
    <header
      className={`${headerPosition} ${headerBase}  ${headerBg}`}
      aria-label="Main header"
    >
  <nav className="flex items-center justify-between max-w-7xl p-2 mx-auto">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/wedvite-logo.png"
            alt="WedVite Logo"
            width={50}
            height={50}
            className="h-19 w-19"
            priority
          />
        </Link>

  {/* Single, prominent CTA button (add right margin on mobile/tablet) */}
  <div className="hidden md:flex mr-4 md:mr-6 lg:mr-0 items-center space-x-4">
          <Link href="/signin">
            <Button
              variant="ghost"
              className="text-[#1D3557] hover:text-[#1D3557]/80 px-6 py-2 font-medium transition duration-200 flex items-center justify-center"
            >
              Log in
            </Button>
          </Link>
          <Link href="/signup">
            <Button
              className="bg-[#1D3557] text-[#FFFFFF] px-6 py-2 rounded-lg shadow-md hover:bg-[bg-royal-navy] hover:brightness-90 hover:scale-105 transition transform duration-200"
            >
              Start Planning
            </Button>
          </Link>
        </div>
        <div className="md:hidden">
          {/* hamburger on the right */}
          <Button variant="ghost" size="icon" onClick={() => setIsOffcanvasOpen(true)}>
            <ChartNoAxesGantt className="h-8 w-8" />
          </Button>
        </div>
      </nav>
      <Sheet open={isOffcanvasOpen} onOpenChange={setIsOffcanvasOpen}>
        <SheetContent side="left" className="w-80 bg-white">
          <div className="p-4 border-b border-gray-100">
            <Link href="/" className="flex items-center" onClick={() => setIsOffcanvasOpen(false)}>
              <Image
                src="/images/wedvite-logo.png"
                alt="WedVite Logo"
                width={50}
                height={50}
                className="h-12 w-12"
                priority
              />
            </Link>
          </div>
          <nav className="flex flex-col p-4 space-y-4 mt-6">
            <Link href="/signin" onClick={() => setIsOffcanvasOpen(false)}>
              <Button
                variant="ghost"
                className="w-full text-[#1D3557] hover:text-[#1D3557]/80 px-6 py-3 font-medium transition duration-200 flex items-center justify-center"
              >
                Log in
              </Button>
            </Link>
            <Link href="/signup" onClick={() => setIsOffcanvasOpen(false)}>
              <Button
                className="w-full bg-[#1D3557] text-[#FFFFFF] px-6 py-3 rounded-lg shadow-md hover:bg-opacity-90 hover:scale-105 transition transform duration-200 font-medium"
              >
                Start Planning
              </Button>
            </Link>
          </nav>
          <SheetClose asChild>
            <Button variant="ghost" className="absolute right-4 top-4 h-8 w-8 p-0 hover:bg-gray-100">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </SheetClose>
        </SheetContent>
      </Sheet>
    </header>
  );
}