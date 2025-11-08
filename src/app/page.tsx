import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import Header from '@/components/layout/header';
import {
  Mail,
  CalendarCheck,
  Users,
  Calendar,
  Share2,
  QrCode,
  Heart,
  Sparkles,
  ArrowRight,
  Instagram,
  Twitter,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-pearl-beige to-pure-white text-royal-navy">
      <Header />

      {/* Hero Section */}
      <section className="relative isolate overflow-hidden px-4 pt-28 pb-20 sm:px-6 md:pb-28 lg:px-10 lg:pt-32">
        <div className="absolute inset-0">
          <Image
            src="/images/hero1.jpg"
            alt="Elegant wedding celebration"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center transition-transform duration-[4s] ease-out hover:scale-105"
          />
          <div className="absolute inset-0 bg-royal-navy/55 backdrop-blur-[1px]" />
        </div>

        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-10 text-center lg:flex-row lg:items-end lg:justify-between lg:text-left">
          <div className="flex-1 space-y-8">
            <div className="mx-auto w-16 border-t-4 border-gold-foil/80 sm:mx-0" aria-hidden="true" />
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.4em] text-gold-foil/80">digital invitations</p>
              <h1 className="font-playfair-display text-[2.6rem] font-bold leading-tight text-pure-white sm:text-5xl lg:text-6xl xl:text-7xl">
                Craft the perfect invite for life&apos;s most <span className="text-gold-foil font-great-vibes">elegant moments</span>
              </h1>
            </div>
            <p className="max-w-2xl text-base leading-relaxed text-pure-white/85 sm:text-lg lg:text-xl">
              Elivra helps you design, personalize, and share stunning event invitations — from weddings to galas — with seamless QR code integration and elegant guest experiences across every device.
            </p>
            <div className="flex w-full flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Link href="/signup" className="sm:w-auto">
                <Button className="w-full wedding-button-primary group relative overflow-hidden px-8 py-4 text-lg font-semibold shadow-xl sm:w-auto">
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Create an Invite
                    <ArrowRight className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="absolute inset-0 scale-x-0 bg-white/20 transition-transform duration-500 ease-in-out group-hover:scale-x-100" />
                </Button>
              </Link>
              <Link href="/qr-scanner" className="sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full wedding-button-secondary items-center px-8 py-4 text-lg font-semibold text-pure-white shadow-lg transition-all duration-300 ease-out hover:-translate-y-1 hover:text-royal-navy hover:shadow-xl sm:w-auto"
                >
                  <QrCode className="h-5 w-5" aria-hidden="true" />
                  <span>Scan Invite QR Code</span>
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex flex-1 flex-col items-center gap-4 rounded-3xl bg-white/10 p-6 backdrop-blur-sm lg:max-w-sm">
            <p className="font-inter text-sm uppercase tracking-[0.4em] text-gold-foil/75">Trusted by planners</p>
            <div className="grid w-full grid-cols-2 gap-4 text-left text-pure-white/90">
              <div>
                <p className="text-3xl font-semibold">12k+</p>
                <p className="text-sm">Invitations designed</p>
              </div>
              <div>
                <p className="text-3xl font-semibold">98%</p>
                <p className="text-sm">Five-star feedback</p>
              </div>
              <div>
                <p className="text-3xl font-semibold">4x</p>
                <p className="text-sm">Faster RSVPs</p>
              </div>
              <div>
                <p className="text-3xl font-semibold">30+</p>
                <p className="text-sm">Premium templates</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative overflow-hidden py-20 sm:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F5F0E6]/90 to-[#FFFFFF]" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-foil/80">Why couples choose elivra</p>
            <h2
              id="features-heading"
              className="mt-4 font-playfair-display text-3xl text-royal-navy sm:text-4xl lg:text-5xl"
            >
              Core features for a <span className="text-gold-foil font-great-vibes">seamless</span> celebration
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-gray sm:text-lg">
              Elegant tools designed to help you plan, share, and celebrate — crafted with premium visuals, real-time insights, and delightful interactions on every screen size.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            <Card
              role="article"
              aria-labelledby="feature-1"
              className="animate-featureIn bg-white/70 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:shadow-2xl focus-within:ring-4 focus-within:ring-gold-foil/30"
            >
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-pearl-beige ring-1 ring-white/30">
                    <Mail className="h-6 w-6 text-royal-navy" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 id="feature-1" className="text-xl font-semibold text-royal-navy">Beautiful invitations</h3>
                    <p className="mt-2 text-slate-gray">
                      Design bespoke digital invitations with RSVP tracking and rich templates that match the mood of your celebration.
                    </p>
                    <Link
                      href="/features/invitations"
                      className="mt-4 inline-flex items-center text-gold-foil transition hover:underline"
                    >
                      Explore templates
                      <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              role="article"
              aria-labelledby="feature-2"
              className="animate-featureIn bg-white/70 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:shadow-2xl focus-within:ring-4 focus-within:ring-gold-foil/30"
            >
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-pearl-beige ring-1 ring-white/30">
                    <CalendarCheck className="h-6 w-6 text-royal-navy" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 id="feature-2" className="text-xl font-semibold text-royal-navy">RSVP & guest management</h3>
                    <p className="mt-2 text-slate-gray">
                      Track responses, manage seating, and message guests with powerful workflows tuned for clarity and speed.
                    </p>
                    <Link
                      href="/features/rsvp"
                      className="mt-4 inline-flex items-center text-gold-foil transition hover:underline"
                    >
                      Manage RSVPs
                      <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              role="article"
              aria-labelledby="feature-3"
              className="animate-featureIn bg-white/70 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:shadow-2xl focus-within:ring-4 focus-within:ring-gold-foil/30"
            >
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-pearl-beige ring-1 ring-white/30">
                    <Users className="h-6 w-6 text-royal-navy" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 id="feature-3" className="text-xl font-semibold text-royal-navy">Memorable guest journeys</h3>
                    <p className="mt-2 text-slate-gray">
                      Deliver polished, mobile-first invitation pages and on-site QR scanning for effortless guest check-ins.
                    </p>
                    <Link
                      href="/features/guest"
                      className="mt-4 inline-flex items-center text-gold-foil transition hover:underline"
                    >
                      Guest tools
                      <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <Card className="animate-featureIn flex items-center gap-4 bg-white/60 p-4 backdrop-blur-sm transition hover:shadow-lg">
              <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-pearl-beige">
                <Calendar className="h-5 w-5 text-royal-navy" aria-hidden="true" />
              </span>
              <div>
                <h4 className="font-semibold text-royal-navy">Scheduling & reminders</h4>
                <p className="text-sm text-slate-gray">Keep timelines, reminders, and vendor handoffs in one elegant dashboard.</p>
              </div>
            </Card>
            <Card className="animate-featureIn flex items-center gap-4 bg-white/60 p-4 backdrop-blur-sm transition hover:shadow-lg">
              <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-pearl-beige">
                <Share2 className="h-5 w-5 text-royal-navy" aria-hidden="true" />
              </span>
              <div>
                <h4 className="font-semibold text-royal-navy">Share & integrate</h4>
                <p className="text-sm text-slate-gray">Distribute across email, print, and social — all synced with your event data.</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#ffffff] to-[#F5F0E6] py-20">
        <div className="absolute inset-0 bg-[url('/patterns/elegant-pattern.svg')] opacity-5" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold-foil/30 to-transparent" aria-hidden="true" />

        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 md:grid-cols-2 md:items-center lg:px-8">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-foil/80">ready to begin?</p>
            <h2 className="font-playfair-display text-3xl leading-tight text-royal-navy sm:text-4xl lg:text-5xl">
              Craft the perfect <span className="text-gold-foil font-great-vibes">invite</span> for life&apos;s most elegant moments
            </h2>
            <p className="text-base leading-relaxed text-slate-gray sm:text-lg">
              Join thousands of couples who have created unforgettable wedding experiences with Elivra — beautiful invitations, effortless RSVPs, and polished guest tools.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/signup">
                <Button
                  variant="brand"
                  className="group relative overflow-hidden bg-gradient-to-r from-gold-foil to-[#D4B377] px-8 py-4 text-lg font-semibold text-royal-navy shadow-xl transition hover:-translate-y-1 focus-visible:ring-0"
                  style={{ WebkitTapHighlightColor: 'none' }}
                >
                  <span className="flex items-center gap-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-royal-navy text-pure-white">
                      <Heart className="h-4 w-4" aria-hidden="true" />
                    </span>
                    Start free trial
                  </span>
                  <span className="absolute inset-0 scale-x-0 bg-white/10 transition-transform duration-500 ease-in-out group-hover:scale-x-100" />
                </Button>
              </Link>
              <Link href="/signin" className="text-center text-sm font-semibold text-royal-navy underline underline-offset-4 hover:text-gold-foil">
                Already have an account?
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <Card className="animate-featureIn flex items-start gap-4 bg-white/70 p-6 backdrop-blur-md">
              <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-pearl-beige ring-1 ring-white/40">
                <Sparkles className="h-6 w-6 text-royal-navy" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-royal-navy">Beautiful templates</h3>
                <p className="mt-1 text-sm text-slate-gray">Premium, customizable invitation templates that set the tone for your celebration.</p>
              </div>
            </Card>
            <Card className="animate-featureIn flex items-start gap-4 bg-white/65 p-6 backdrop-blur-md">
              <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-pearl-beige ring-1 ring-white/40">
                <Calendar className="h-6 w-6 text-royal-navy" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-royal-navy">Smart scheduling</h3>
                <p className="mt-1 text-sm text-slate-gray">Automated reminders and timelines keep your planning on track without the stress.</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Elegant Footer */}
      <footer className="relative overflow-hidden bg-[#1D3557] py-16 text-[#ffffff]">
        <div className="absolute inset-0 bg-[url('/patterns/footer-pattern.svg')] opacity-5" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-4">
            <div className="space-y-4">
              <Link href="/" className="inline-block">
                <Image
                  src="/Elivra-footer.png"
                  alt="Elivra Logo"
                  width={180}
                  height={48}
                  className="h-15 w-auto"
                />
              </Link>
              <p className="font-inter text-pure-white/80 leading-relaxed">
                Crafting beautiful wedding experiences through elegant digital solutions.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-playfair-display text-xl">Quick Links</h4>
              <nav className="space-y-2">
                <Link href="/features" className="block text-pure-white/75 transition hover:text-gold-foil">Features</Link>
                <Link href="/templates" className="block text-pure-white/75 transition hover:text-gold-foil">Templates</Link>
                <Link href="/pricing" className="block text-pure-white/75 transition hover:text-gold-foil">Pricing</Link>
              </nav>
            </div>

            <div className="space-y-4">
              <h4 className="font-playfair-display text-xl">Support</h4>
              <nav className="space-y-2">
                <Link href="/help" className="block text-pure-white/75 transition hover:text-gold-foil">Help Center</Link>
                <Link href="/contact" className="block text-pure-white/75 transition hover:text-gold-foil">Contact Us</Link>
                <Link href="/faq" className="block text-pure-white/75 transition hover:text-gold-foil">FAQs</Link>
              </nav>
            </div>

            <div className="space-y-4">
              <h4 className="font-playfair-display text-xl">Legal</h4>
              <nav className="space-y-2">
                <Link href="/privacy" className="block text-pure-white/75 transition hover:text-gold-foil">Privacy Policy</Link>
                <Link href="/terms" className="block text-pure-white/75 transition hover:text-gold-foil">Terms of Service</Link>
                <Link href="/cookies" className="block text-pure-white/75 transition hover:text-gold-foil">Cookie Policy</Link>
              </nav>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-white/20 pt-8 text-sm text-pure-white/65 sm:flex-row">
            <p>&copy; {new Date().getFullYear()} Elivra. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="text-pure-white/65 transition hover:text-gold-foil focus:outline-none focus:ring-2 focus:ring-gold-foil/40"
              >
                <span className="sr-only">Instagram</span>
                <Instagram className="h-6 w-6" aria-hidden="true" />
              </a>
              <a
                href="#"
                className="text-pure-white/65 transition hover:text-gold-foil focus:outline-none focus:ring-2 focus:ring-gold-foil/40"
              >
                <span className="sr-only">Twitter</span>
                <Twitter className="h-6 w-6" aria-hidden="true" />
              </a>
              <a
                href="#"
                className="text-pure-white/65 transition hover:text-gold-foil focus:outline-none focus:ring-2 focus:ring-gold-foil/40"
              >
                <span className="sr-only">Share</span>
                <Share2 className="h-6 w-6" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}