import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Home, Users, Calendar, Settings } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-gray-100/40 lg:block dark:bg-gray-800/40">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-[60px] items-center border-b px-6">
            <a href="/" className="flex items-center gap-2 font-semibold font-display text-royal-navy">
              <Calendar className="h-6 w-6" />
              <span>WedVite</span>
            </a>
            <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Toggle notifications</span>
            </Button>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-4 text-sm font-medium">
              <a href="#" className="flex items-center gap-3 rounded-lg bg-gray-100 px-3 py-2 text-gray-900 transition-all hover:text-gray-900 dark:bg-gray-800 dark:text-gray-50">
                <Home className="h-4 w-4" />
                Dashboard
              </a>
              <a href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50">
                <Calendar className="h-4 w-4" />
                Events
              </a>
              <a href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50">
                <Users className="h-4 w-4" />
                Guests
              </a>
              <a href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50">
                <Settings className="h-4 w-4" />
                Settings
              </a>
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40">
          <a href="#" className="lg:hidden">
            <Calendar className="h-6 w-6" />
            <span className="sr-only">Home</span>
          </a>
          <div className="w-full flex-1">
            <h1 className="text-lg font-semibold">My Events</h1>
          </div>
          <Button>Create New Event</Button>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 bg-pearl-beige">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Sarah & John's Wedding</CardTitle>
                <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">150 Guests</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">80% Accepted</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Emily's Bridal Shower</CardTitle>
                <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">50 Guests</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">95% Accepted</p>
              </CardContent>
            </Card>
            <Card className="flex items-center justify-center border-2 border-dashed">
              <CardContent className="text-center">
                <Button variant="outline" size="lg">+ Create New Event</Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
