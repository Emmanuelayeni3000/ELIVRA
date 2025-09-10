"use client";
import { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Sheet, SheetContent, SheetClose } from '@/components/ui/sheet';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { signOut } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/signin');
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-royal-navy font-inter">Loading dashboard...</p>
      </div>
    );
  }

  const getInitials = (name?: string | null) => {
    if (!name) return '';
    const partsArr = name.trim().split(/\s+/).filter(Boolean);
    if (partsArr.length === 0) return '';
    const firstPart = partsArr[0] ?? '';
    const lastPart = partsArr.length > 1 ? (partsArr[partsArr.length - 1] ?? '') : '';
    const firstChar = firstPart ? firstPart.charAt(0) : '';
    const lastChar = lastPart ? lastPart.charAt(0) : '';
    return (firstChar + lastChar).toUpperCase();
  };

  const navItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Events', href: '/dashboard/events' },
    { label: 'Guests', href: '/dashboard/guests' },
    { label: 'Invitations', href: '/dashboard/invitations' },
  ];

  const renderNav = (closeMobile?: () => void) => (
  <ul className="space-y-2 font-inter">
      {navItems.map(item => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/');
        const handleClick: React.MouseEventHandler<HTMLAnchorElement> = () => {
          if (closeMobile) closeMobile();
        };
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={handleClick}
              className={`flex items-center px-3 py-2 rounded-lg text-sm/6 transition-colors focus:outline-none focus:ring-2 focus:ring-royal-navy/40 ${active ? 'bg-[#1D3557] text-white shadow-sm' : 'text-royal-navy hover:text-gold-foil'}`}
            >
              <span>{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="min-h-screen w-full bg-white flex relative">
      {/* Mobile/Tablet Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-royal-navy/10 shadow-sm">
        <div className="flex items-center justify-between px-4 py-1">
          {/* Logo on the left */}
          <Link href="/dashboard" className="flex items-center">
            <div className="flex items-center gap-3">
              <Image
                src="/images/wedvite-logo.png"
                alt="WedVite Logo"
                width={50}
                height={50}
                className="h-15 w-15"
                priority
              />
              {/* <div className="flex flex-col">
                <span className="text-lg font-playfair-display font-bold text-royal-navy leading-tight">WedVite</span>
                <span className="text-xs text-gold-foil/80 font-inter">Celebration Console</span>
              </div> */}
            </div>
          </Link>

          {/* Hamburger menu on the right */}
          <button
            type="button"
            aria-label="Open navigation menu"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-royal-navy/5 text-royal-navy border border-royal-navy/20 hover:bg-royal-navy/10 focus:outline-none focus:ring-2 focus:ring-royal-navy/40 transition-colors"
            onClick={() => setMobileOpen(true)}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile sheet for off-canvas navigation */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left">
          <Link href="/dashboard" className="flex items-center">
            <div className="flex items-center gap-3">
              <Image
                src="/images/wedvite-logo.png"
                alt="WedVite Logo"
                width={50}
                height={50}
                className="h-15 w-15"
                priority
              />
              <div className="flex flex-col">
                <span className="text-lg font-playfair-display font-bold text-royal-navy leading-tight">WedVite</span>
                {/* <span className="text-xs text-gold-foil/80 font-inter">Celebration Console</span> */}
              </div>
            </div>
          </Link>
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            {renderNav(() => setMobileOpen(false))}
          </nav>
          <div className="p-4 border-t border-white/10 mt-auto">
            <div>
              {/* replicate account dropdown area for mobile */}
              <div className="w-full">
                <button className="w-full inline-flex items-center gap-3 px-2 py-2 rounded-md text-royal-navy hover:bg-royal-navy/5">
                  <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">{getInitials(session?.user?.name)}</div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium leading-tight line-clamp-1">{session?.user?.name}</p>
                    <p className="text-[10px] text-royal-navy/60 line-clamp-1">{session?.user?.email}</p>
                  </div>
                </button>
                <div className="mt-3">
                  <button onClick={async () => { await signOut(); router.push('/signin'); }} className="w-full text-left text-sm text-royal-navy hover:text-red-600 flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </div>
              </div>
            </div>
          </div>
          <SheetClose asChild>
            <button className="sr-only">Close</button>
          </SheetClose>
        </SheetContent>
      </Sheet>

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 w-64 flex flex-col bg-white text-royal-navy border-r border-royal-navy/10 shadow-lg md:shadow-sm z-50 md:z-auto transform transition-transform duration-300 ease-out -translate-x-full md:translate-x-0`}
        aria-label="Sidebar navigation"
      >
  {/* desktop-only header retained; mobile close handled by Sheet */}
        <div className="p-6 pb-4 border-b border-white/10 flex items-center justify-between">
          {/* Branding only visible on mobile; hidden on desktop */}
          <div className="md:hidden">
            <h2 className="text-2xl font-playfair-display font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gold-foil to-pearl-beige">WedVite</h2>
            <p className="mt-1 text-xs text-gold-foil/80 font-inter">Celebration Console</p>
          </div>

          {/* Move account/avatar to the top on desktop; hide on small screens to avoid duplication with mobile Sheet */}
          <div className="hidden md:flex md:justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full md:w-auto justify-start gap-3 px-2 hover:bg-royal-navy/5">
                  <Avatar className="h-9 w-9 ring-2 ring-royal-navy/60 ring-offset-2 ring-offset-white rounded-full">
                    <AvatarImage src={session?.user?.image || ''} />
                    <AvatarFallback>{getInitials(session?.user?.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left md:ml-2">
                    <p className="text-sm font-medium leading-tight line-clamp-1">{session?.user?.name}</p>
                    <p className="text-[10px] text-royal-navy/60 line-clamp-1">{session?.user?.email}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white text-royal-navy">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={async () => { await signOut(); router.push('/signin'); }}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          {renderNav(() => setMobileOpen(false))}
        </nav>
  {/* account area moved to the top of the sidebar for desktop; bottom area removed to avoid duplication */}
      </aside>

      {/* Content */}
      <main className="flex-1 relative z-10 p-6 md:p-8 section-frame pt-20 md:pt-6">
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-up-soft">
          {children}
        </div>
      </main>
    </div>
  );
}
