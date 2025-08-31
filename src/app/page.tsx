import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  return (
    <div className="bg-pearl-beige font-body text-slate-gray">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-10 bg-transparent">
        <div className="container mx-auto flex justify-between items-center p-6">
          <h1 className="font-display text-2xl text-royal-navy">WedVite</h1>
          <nav>
            <Button variant="ghost">Sign In</Button>
            <Button className="bg-royal-navy text-white hover:bg-royal-navy/90">Sign Up</Button>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section id="hero" className="relative h-screen flex items-center justify-center text-center bg-cover bg-center" style={{ backgroundImage: "url('/wedding-bg.jpg')" }}>
          <div className="absolute inset-0 bg-royal-navy/50"></div>
          <div className="relative z-10 text-white px-4">
            <h2 className="font-script text-5xl md:text-7xl text-gold-foil mb-4">Sarah & John</h2>
            <h1 className="font-display text-4xl md:text-6xl mb-2">You're Invited</h1>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">Join us in celebrating our special day. Your presence is the greatest gift of all.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <p className="text-lg">Scan QR Code to RSVP</p>
              {/* Placeholder for QR Scanner */}
              <div className="w-48 h-48 bg-white/80 rounded-lg flex items-center justify-center">
                <p className="text-royal-navy">QR Scanner Here</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 bg-white">
          <div className="container mx-auto text-center">
            <h2 className="font-display text-4xl text-royal-navy mb-12">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-12 text-left">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-champagne rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl">1</span>
                </div>
                <h3 className="font-display text-2xl text-royal-navy mb-2">Create Your Event</h3>
                <p>Sign up and create your wedding event in minutes. Add details, dates, and locations.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-champagne rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl">2</span>
                </div>
                <h3 className="font-display text-2xl text-royal-navy mb-2">Send Invitations</h3>
                <p>Add your guests and send beautiful, personalized digital invitations with unique QR codes.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-champagne rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl">3</span>
                </div>
                <h3 className="font-display text-2xl text-royal-navy mb-2">Manage RSVPs</h3>
                <p>Guests scan their QR code to RSVP instantly. Track responses and manage your guest list with ease.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-pearl-beige">
          <div className="container mx-auto text-center">
            <h2 className="font-display text-4xl text-royal-navy mb-12">Elegant Features</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-lg">
                <h3 className="font-display text-2xl text-royal-navy mb-4">Customizable Templates</h3>
                <p>Choose from a variety of stunning, professionally designed invitation templates.</p>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-lg">
                <h3 className="font-display text-2xl text-royal-navy mb-4">QR Code Check-in</h3>
                <p>Effortlessly manage guest arrivals with a simple scan, ensuring a smooth event experience.</p>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-lg">
                <h3 className="font-display text-2xl text-royal-navy mb-4">Real-time Analytics</h3>
                <p>Keep track of your RSVPs and guest engagement with our intuitive dashboard.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-royal-navy text-white py-12">
        <div className="container mx-auto text-center">
          <p>&copy; 2025 WedVite. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-4">
            <a href="#" className="hover:text-gold-foil">Privacy Policy</a>
            <a href="#" className="hover:text-gold-foil">Terms of Service</a>
            <a href="#" className="hover:text-gold-foil">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}