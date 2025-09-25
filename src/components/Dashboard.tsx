import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Calendar, 
  CreditCard, 
  MessageSquare, 
  TrendingUp, 
  Clock,
  IndianRupee,
  Camera,
  Plus,
  Bell,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { loadStudioData, initializeSampleData } from '@/lib/storage';
import { StudioData, DashboardStats } from '@/lib/types';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

const Dashboard = ({ onNavigate }: DashboardProps) => {
  const [data, setData] = useState<StudioData | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    initializeSampleData();
    const studioData = loadStudioData();
    setData(studioData);

    // Calculate dashboard statistics
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getMonth();
    
    const dashboardStats: DashboardStats = {
      todaysEvents: studioData.events.filter(e => e.eventDate === today).length,
      pendingPayments: studioData.events.reduce((sum, event) => sum + event.balanceDue, 0),
      whatsappCredits: studioData.whatsappCredits,
      monthlyRevenue: studioData.payments
        .filter(p => new Date(p.date).getMonth() === currentMonth)
        .reduce((sum, p) => sum + p.amount, 0),
      totalCustomers: studioData.customers.length,
      activeEvents: studioData.events.filter(e => 
        ['booked', 'confirmed', 'shot', 'editing'].includes(e.status)
      ).length,
    };

    setStats(dashboardStats);
  }, []);

  if (!data || !stats) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="skeleton h-32 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  const recentActivities = [
    { action: 'New booking received', customer: 'Rajesh Kumar', time: '2 hours ago', type: 'event' },
    { action: 'Payment received', customer: 'Priya Sharma', time: '4 hours ago', type: 'payment' },
    { action: 'Photo delivery completed', customer: 'Amit Patel', time: '1 day ago', type: 'delivery' },
    { action: 'WhatsApp message sent', customer: 'Sneha Reddy', time: '2 days ago', type: 'message' },
  ];

  const upcomingEvents = data.events
    .filter(e => new Date(e.eventDate) >= new Date())
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening at your studio.</p>
        </div>
        
        <div className="flex gap-3">
          <Button onClick={() => onNavigate('customers')} variant="secondary">
            <Users className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
          <Button onClick={() => onNavigate('events')} className="gradient-primary text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Booking
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-hover gradient-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Today's Events</CardTitle>
              <Calendar className="w-5 h-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.todaysEvents}</div>
            <div className="flex items-center text-sm text-success mt-2">
              <ArrowUp className="w-4 h-4 mr-1" />
              +12% from yesterday
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payments</CardTitle>
              <CreditCard className="w-5 h-5 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">₹{stats.pendingPayments.toLocaleString('en-IN')}</div>
            <div className="flex items-center text-sm text-destructive mt-2">
              <Clock className="w-4 h-4 mr-1" />
              3 overdue payments
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">WhatsApp Credits</CardTitle>
              <MessageSquare className="w-5 h-5 text-secondary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.whatsappCredits}</div>
            <Button 
              size="sm" 
              variant="secondary" 
              className="mt-2"
              onClick={() => onNavigate('whatsapp')}
            >
              Buy More
            </Button>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
              <IndianRupee className="w-5 h-5 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">₹{stats.monthlyRevenue.toLocaleString('en-IN')}</div>
            <div className="flex items-center text-sm text-success mt-2">
              <TrendingUp className="w-4 h-4 mr-1" />
              +24% from last month
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-4 p-3 rounded-lg hover:bg-accent transition-smooth">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'event' ? 'bg-primary' :
                    activity.type === 'payment' ? 'bg-success' :
                    activity.type === 'delivery' ? 'bg-secondary' :
                    'bg-warning'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.customer}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="p-3 rounded-lg border border-border hover:bg-accent transition-smooth cursor-pointer">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-foreground">{event.customerName}</h4>
                    <Badge variant={
                      event.status === 'confirmed' ? 'default' :
                      event.status === 'booked' ? 'secondary' :
                      'outline'
                    }>
                      {event.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{event.eventType}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(event.eventDate).toLocaleDateString('en-IN')}
                  </p>
                </div>
              ))}
              
              {upcomingEvents.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <Camera className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No upcoming events</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="gradient-card">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => onNavigate('customers')}
            >
              <Users className="w-6 h-6" />
              Add Customer
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => onNavigate('events')}
            >
              <Calendar className="w-6 h-6" />
              New Event
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => onNavigate('payments')}
            >
              <CreditCard className="w-6 h-6" />
              Record Payment
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => onNavigate('whatsapp')}
            >
              <MessageSquare className="w-6 h-6" />
              Send Message
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;