import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Camera, 
  Users, 
  Calendar, 
  MessageSquare, 
  CreditCard, 
  Wand2, 
  BarChart3, 
  Search,
  Bell,
  Settings,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Layout = ({ children, currentPage, onPageChange }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const menuItems = [
    { id: 'dashboard', icon: BarChart3, label: 'Dashboard', notifications: 0 },
    { id: 'customers', icon: Users, label: 'Customers', notifications: 0 },
    { id: 'events', icon: Calendar, label: 'Events & Bookings', notifications: 3 },
    { id: 'whatsapp', icon: MessageSquare, label: 'WhatsApp', notifications: 0 },
    { id: 'payments', icon: CreditCard, label: 'Payments', notifications: 2 },
    { id: 'ai-tools', icon: Wand2, label: 'AI Tools', notifications: 0 },
  ];

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Menu Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-50 transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-hero rounded-xl flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-foreground">PhotoStudio Pro</h2>
              <p className="text-sm text-muted-foreground">Management System</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  onPageChange(item.id);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-smooth
                  ${isActive 
                    ? 'gradient-primary text-white shadow-md' 
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {item.notifications > 0 && (
                  <Badge className="ml-auto bg-secondary text-secondary-foreground">
                    {item.notifications}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="p-4 gradient-card rounded-lg border border-border">
            <h4 className="font-semibold text-sm mb-2 text-foreground">WhatsApp Credits</h4>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-primary">450</span>
              <Button size="sm" variant="secondary">
                Buy More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-md border-b border-border">
          <div className="px-4 lg:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers, events..."
                  className="w-64 bg-background"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={toggleTheme}>
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-4 h-4" />
                <Badge className="absolute -top-1 -right-1 w-5 h-5 text-xs bg-destructive text-destructive-foreground">
                  5
                </Badge>
              </Button>
              
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>

              <div className="w-8 h-8 gradient-hero rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">PS</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* Mobile Close Button */}
      {sidebarOpen && (
        <Button
          variant="ghost"
          size="sm"
          className="fixed top-4 right-4 z-60 lg:hidden bg-card"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
};

export default Layout;