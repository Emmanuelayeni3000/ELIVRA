import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import Header from '@/components/layout/header'; // Import Header component
import { Mail, CalendarCheck, Users, Calendar, Share2, QrCode, Heart, Sparkles, ArrowRight, Instagram, Twitter } from 'lucide-react';

export default function LandingPage() {
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-pearl-beige to-pure-white text-royal-navy">
      <Header />      {/* Hero Section */}
  <section className="relative flex min-h-[calc(100vh+7rem)] md:h-screen items-start md:items-center justify-center overflow-hidden pt-28 md:pt-0">
        <Image
          src="/images/hero1.jpg"
          alt="Elegant wedding celebration"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center z-0 transition-transform duration-[4s] ease-out hover:scale-105"
        />
        <div className="absolute inset-0 bg-royal-navy/40 backdrop-blur-sm z-10"></div>
        <div 
          className="relative z-20 text-center p-8 max-w-5xl mx-auto animate-ceremonyFadeIn"
        >
          {/* Decorative Elements */}
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
            <div className="w-0.5 h-24 bg-gradient-to-b from-gold-foil to-transparent"></div>
          </div>
          
          <h1
            className="text-5xl md:text-7xl font-playfair-display font-bold mb-6 leading-tight tracking-tight text-[#1D3557]"
          >
            Craft the perfect invite for life’s most <span className="text-gold-foil font-great-vibes">elegant moments</span>.
          </h1>
          
          <p className="text-lg md:text-xl mb-12 max-w-2xl mx-auto font-inter text-pure-white/90 leading-relaxed">
            Elivra helps you design, personalize, and share stunning event invitations — from weddings to galas — with seamless QR code integration.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link href="/signup">
              <Button 
                className="wedding-button-primary group relative overflow-hidden text-lg px-10 py-6 rounded-xl font-semibold tracking-wide shadow-xl"
              >
                <span className="relative z-10">Create an Invite</span>
                <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
              </Button>
            </Link>
            
            <Link href="/qr-scanner">
              <Button 
                variant="outline" 
                className="wedding-button-secondary text-pure-white hover:text-royal-navy text-lg px-10 py-6 shadow-lg font-semibold tracking-wide transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl"
              >
                <QrCode className="mr-2 h-5 w-5" aria-hidden="true" />
                Scan Invite QR Code
              </Button>
            </Link>
          </div>
          
          {/* Decorative Bottom Element */}
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 rotate-180">
            <div className="w-0.5 h-24 bg-gradient-to-b from-gold-foil to-transparent"></div>
          </div>
        </div>
      </section>

  {/* Features Section */}
            <section className="py-24 relative overflow-hidden">
              {/* Subtle gradient background for depth */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#F5F0E6]/90 to-[#FFFFFF] opacity-95"></div>

              <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-12">
                  <h2 id="features-heading" className="text-3xl md:text-4xl lg:text-5xl font-playfair-display mb-3 text-royal-navy">
                    Core Features for a <span className="text-gold-foil font-great-vibes">Seamless</span> Celebration
                  </h2>
                  <p className="max-w-2xl mx-auto text-slate-gray leading-relaxed">
                    Elegant tools designed to help you plan, share, and celebrate — crafted with premium visuals and delightful interactions.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                  {/* Card 1 */}
                  <Card role="article" aria-labelledby="feature-1" className="animate-featureIn bg-white/60 backdrop-blur-md border border-white/20 shadow-lg rounded-2xl hover:shadow-2xl transition transform hover:-translate-y-1 focus-within:ring-4 focus-within:ring-gold-foil/30" style={{ animationDelay: '0s' }}>
                    <CardContent className="p-6 md:p-8">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-14 h-14 rounded-full bg-pearl-beige flex items-center justify-center ring-1 ring-white/30">
                            <Mail className="h-6 w-6 text-royal-navy" aria-hidden="true" />
                          </div>
                        </div>
                        <div>
                          <h3 id="feature-1" className="text-xl font-semibold text-royal-navy">Beautiful Invitations</h3>
                          <p className="mt-2 text-slate-gray">Design and send bespoke digital invitations with RSVP tracking and beautiful templates that match your celebration.</p>
                          <Link href="/features/invitations" className="inline-block mt-4 text-gold-foil font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-gold-foil/40">Explore templates →</Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card 2 */}
                  <Card role="article" aria-labelledby="feature-2" className="animate-featureIn bg-white/60 backdrop-blur-md border border-white/20 shadow-lg rounded-2xl hover:shadow-2xl transition transform hover:-translate-y-1 focus-within:ring-4 focus-within:ring-gold-foil/30" style={{ animationDelay: '0.08s' }}>
                    <CardContent className="p-6 md:p-8">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-14 h-14 rounded-full bg-pearl-beige flex items-center justify-center ring-1 ring-white/30">
                            <CalendarCheck className="h-6 w-6 text-royal-navy" aria-hidden="true" />
                          </div>
                        </div>
                        <div>
                          <h3 id="feature-2" className="text-xl font-semibold text-royal-navy">RSVP & Guest Management</h3>
                          <p className="mt-2 text-slate-gray">Track responses, manage seating, and communicate with guests using simple, powerful tools built for clarity.</p>
                          <Link href="/features/rsvp" className="inline-block mt-4 text-gold-foil font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-gold-foil/40">Manage RSVPs →</Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card 3 */}
                  <Card role="article" aria-labelledby="feature-3" className="animate-featureIn bg-white/60 backdrop-blur-md border border-white/20 shadow-lg rounded-2xl hover:shadow-2xl transition transform hover:-translate-y-1 focus-within:ring-4 focus-within:ring-gold-foil/30" style={{ animationDelay: '0.16s' }}>
                    <CardContent className="p-6 md:p-8">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-14 h-14 rounded-full bg-pearl-beige flex items-center justify-center ring-1 ring-white/30">
                            <Users className="h-6 w-6 text-royal-navy" aria-hidden="true" />
                          </div>
                        </div>
                        <div>
                          <h3 id="feature-3" className="text-xl font-semibold text-royal-navy">Guest Experience</h3>
                          <p className="mt-2 text-slate-gray">Deliver polished, mobile-first invitation pages and on-site QR scanning for a seamless guest experience.</p>
                          <Link href="/features/guest" className="inline-block mt-4 text-gold-foil font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-gold-foil/40">Guest tools →</Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Secondary row with smaller feature cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 mt-10">
                  <Card className="animate-featureIn bg-white/50 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex items-center gap-4 hover:shadow-lg transition" style={{ animationDelay: '0.22s' }}>
                    <div className="w-12 h-12 rounded-full bg-pearl-beige flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-royal-navy" aria-hidden="true" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-royal-navy">Scheduling & Reminders</h4>
                      <p className="text-slate-gray text-sm">Keep timelines and reminders in one elegant dashboard.</p>
                    </div>
                  </Card>

                  <Card className="animate-featureIn bg-white/50 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex items-center gap-4 hover:shadow-lg transition" style={{ animationDelay: '0.28s' }}>
                    <div className="w-12 h-12 rounded-full bg-pearl-beige flex items-center justify-center">
                      <Share2 className="h-5 w-5 text-royal-navy" aria-hidden="true" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-royal-navy">Share & Integrate</h4>
                      <p className="text-slate-gray text-sm">Share invitations across email and social, with export and printing options.</p>
                    </div>
                  </Card>
                </div>
              </div>
            </section>

      {/* Call to Action Section - Redesigned */}
      <section className="py-20 bg-gradient-to-b from-[#ffffff] to-[#F5F0E6] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/patterns/elegant-pattern.svg')] opacity-5"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left: Heading & Primary CTA */}
            <div className="text-left max-w-2xl animate-featureIn" style={{ animationDelay: '0s' }}>
              <h2 className="text-4xl md:text-5xl font-playfair-display text-royal-navy mb-4 leading-tight">
                Craft the perfect <span className="text-gold-foil font-great-vibes">invite</span> for life&apos;s most elegant moments
              </h2>
              <p className="text-lg md:text-xl text-slate-gray font-inter leading-relaxed mb-8">
                Join thousands of couples who have created unforgettable wedding experiences with Elivra — beautiful invitations, effortless RSVPs, and polished guest tools.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link href="/signup">
                  <Button
                      variant="brand"
                      className="group relative overflow-hidden bg-gradient-to-r from-gold-foil to-[#D4B377] text-[#1D3557] px-8 py-4 rounded-lg shadow-xl font-semibold tracking-wide transform transition-all duration-300 ease-out hover:-translate-y-1 focus:outline-none focus-visible:ring-0 active:translate-y-0 active:shadow-xl appearance-none"
                      style={{ WebkitTapHighlightColor: 'none' }}
                    >
                    <span className="flex items-center gap-3">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-royal-navy text-pure-white">
                        <Heart className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="relative z-10">Start Free Trial</span>
                      <ArrowRight className="h-4 w-4 ml-2 opacity-90" aria-hidden="true" />
                    </span>
                    <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 pointer-events-none"></div>
                  </Button>
                </Link>

                {/* <Link href="/pricing">
                  <Button variant="outline" className="wedding-button-secondary px-6 py-3 rounded-lg">
                    View Pricing
                  </Button>
                </Link> */}
              </div>
            </div>

            {/* Right: Glassy cards with micro-features */}
            <div className="space-y-4">
              <Card className="bg-white/60 backdrop-blur-md border border-white/20 shadow-lg rounded-2xl p-6 flex items-start gap-4 animate-featureIn" style={{ animationDelay: '0.08s' }}>
                <div className="w-14 h-14 rounded-full bg-pearl-beige flex items-center justify-center ring-1 ring-white/30">
                  <Sparkles className="h-6 w-6 text-royal-navy" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-royal-navy">Beautiful Templates</h3>
                  <p className="text-slate-gray text-sm mt-1">Premium, customizable invitation templates that set the tone for your celebration.</p>
                </div>
              </Card>

              <Card className="bg-white/55 backdrop-blur-sm border border-white/10 shadow rounded-2xl p-6 flex items-start gap-4 animate-featureIn" style={{ animationDelay: '0.16s' }}>
                <div className="w-14 h-14 rounded-full bg-pearl-beige flex items-center justify-center ring-1 ring-white/30">
                  <Calendar className="h-6 w-6 text-royal-navy" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-royal-navy">Smart Scheduling</h3>
                  <p className="text-slate-gray text-sm mt-1">Automated reminders and timelines to keep your planning on track.</p>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold-foil/30 to-transparent"></div>
      </section>

  {/* Elegant Footer */}
  <footer className="bg-[#1D3557] text-[#ffffff] py-16 relative overflow-hidden border-t border-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12">
            {/* Brand Section */}
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
            
            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="font-playfair-display text-xl mb-4">Quick Links</h4>
              <nav className="space-y-2">
                <Link href="/features" className="block text-pure-white/80 hover:text-gold-foil transition-colors duration-300">Features</Link>
                <Link href="/templates" className="block text-pure-white/80 hover:text-gold-foil transition-colors duration-300">Templates</Link>
                <Link href="/pricing" className="block text-pure-white/80 hover:text-gold-foil transition-colors duration-300">Pricing</Link>
              </nav>
            </div>
            
            {/* Support */}
            <div className="space-y-4">
              <h4 className="font-playfair-display text-xl mb-4">Support</h4>
              <nav className="space-y-2">
                <Link href="/help" className="block text-pure-white/80 hover:text-gold-foil transition-colors duration-300">Help Center</Link>
                <Link href="/contact" className="block text-pure-white/80 hover:text-gold-foil transition-colors duration-300">Contact Us</Link>
                <Link href="/faq" className="block text-pure-white/80 hover:text-gold-foil transition-colors duration-300">FAQs</Link>
              </nav>
            </div>
            
            {/* Legal */}
            <div className="space-y-4">
              <h4 className="font-playfair-display text-xl mb-4">Legal</h4>
              <nav className="space-y-2">
                <Link href="/privacy" className="block text-pure-white/80 hover:text-gold-foil transition-colors duration-300">Privacy Policy</Link>
                <Link href="/terms" className="block text-pure-white/80 hover:text-gold-foil transition-colors duration-300">Terms of Service</Link>
                <Link href="/cookies" className="block text-pure-white/80 hover:text-gold-foil transition-colors duration-300">Cookie Policy</Link>
              </nav>
            </div>
          </div>
          
          {/* Footer Bottom */}
          <div className="border-t border-[#ffffff] mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-pure-white/60 font-inter">
              &copy; {new Date().getFullYear()} Elivra. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0 items-center">
              <a href="#" className="text-pure-white/60 hover:text-gold-foil transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gold-foil/40 rounded">
                <span className="sr-only">Instagram</span>
                <Instagram className="h-6 w-6" aria-hidden="true" />
              </a>
              <a href="#" className="text-pure-white/60 hover:text-gold-foil transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gold-foil/40 rounded">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-6 w-6" aria-hidden="true" />
              </a>
              <a href="#" className="text-pure-white/60 hover:text-gold-foil transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gold-foil/40 rounded">
                <span className="sr-only">Share</span>
                <Share2 className="h-6 w-6" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('/patterns/footer-pattern.svg')] opacity-5"></div>
      </footer>
    </div>
  );
}