import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  CreditCard, 
  IndianRupee, 
  Calendar,
  User,
  Receipt,
  AlertCircle,
  CheckCircle,
  Filter,
  Search,
  TrendingUp,
  Download,
  Clock,
  Wallet
} from 'lucide-react';
import { loadStudioData, addPayment } from '@/lib/storage';
import { Event, Payment, Customer } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const Payments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddPaymentDialogOpen, setIsAddPaymentDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Payment>>({});
  const [filterBy, setFilterBy] = useState<'all' | 'overdue' | 'recent'>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadPaymentData();
  }, []);

  const loadPaymentData = () => {
    const data = loadStudioData();
    setPayments(data.payments);
    setEvents(data.events);
    setCustomers(data.customers);
  };

  const paymentMethods = ['Cash', 'UPI', 'Card', 'Bank Transfer', 'Cheque'];

  const pendingEvents = events.filter(event => event.balanceDue > 0);
  const overdueEvents = pendingEvents.filter(event => new Date(event.eventDate) < new Date());

  const filteredPayments = payments
    .filter(payment => {
      const event = events.find(e => e.id === payment.eventId);
      const customer = customers.find(c => c.id === payment.customerId);
      
      const matchesSearch = 
        customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.method.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter = 
        filterBy === 'all' || 
        (filterBy === 'recent' && new Date(payment.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
        (filterBy === 'overdue' && event && event.balanceDue > 0);

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const monthlyRevenue = payments
    .filter(p => new Date(p.date).getMonth() === new Date().getMonth())
    .reduce((sum, payment) => sum + payment.amount, 0);

  const handleAddPayment = () => {
    if (!formData.eventId || !formData.amount || !formData.method || !formData.date) {
      toast({
        title: "Error",
        description: "Event, amount, method, and date are required",
        variant: "destructive"
      });
      return;
    }

    const event = events.find(e => e.id === formData.eventId);
    if (!event) return;

    const newPayment = addPayment({
      eventId: formData.eventId,
      customerId: event.customerId,
      amount: formData.amount,
      method: formData.method as 'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | 'Cheque',
      transactionId: formData.transactionId,
      date: formData.date,
      notes: formData.notes,
      invoiceGenerated: formData.invoiceGenerated || false
    });

    loadPaymentData();
    setIsAddPaymentDialogOpen(false);
    setFormData({});
    
    toast({
      title: "Payment Recorded",
      description: `Payment of ₹${formData.amount?.toLocaleString('en-IN')} recorded successfully`,
    });
  };

  const generateInvoice = (payment: Payment) => {
    const event = events.find(e => e.id === payment.eventId);
    const customer = customers.find(c => c.id === payment.customerId);
    
    if (!event || !customer) return;

    // In a real application, this would generate a PDF
    const invoiceData = {
      invoiceNumber: `INV-${payment.id.toUpperCase()}`,
      date: new Date(payment.date).toLocaleDateString('en-IN'),
      customer: customer.name,
      event: event.eventType,
      amount: payment.amount,
      method: payment.method,
      transactionId: payment.transactionId
    };

    console.log('Invoice Data:', invoiceData);
    
    toast({
      title: "Invoice Generated",
      description: `Invoice ${invoiceData.invoiceNumber} generated successfully`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payments & Invoices</h1>
          <p className="text-muted-foreground">Track payments, generate invoices, and manage finances</p>
        </div>
        
        <Dialog open={isAddPaymentDialogOpen} onOpenChange={setIsAddPaymentDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-white">
              <Plus className="w-4 h-4 mr-2" />
              Record Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Record New Payment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Event *</Label>
                <Select value={formData.eventId} onValueChange={(value) => setFormData({...formData, eventId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.customerName} - {event.eventType} (Due: ₹{event.balanceDue.toLocaleString('en-IN')})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Amount *</Label>
                  <Input
                    type="number"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({...formData, amount: parseInt(e.target.value) || 0})}
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <Label>Date *</Label>
                  <Input
                    type="date"
                    value={formData.date || ''}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <Label>Payment Method *</Label>
                <Select value={formData.method} onValueChange={(value) => setFormData({...formData, method: value as 'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | 'Cheque'})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method} value={method}>{method}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Transaction ID</Label>
                <Input
                  value={formData.transactionId || ''}
                  onChange={(e) => setFormData({...formData, transactionId: e.target.value})}
                  placeholder="Transaction reference number"
                />
              </div>
              
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Payment notes or remarks"
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleAddPayment} className="flex-1">Record Payment</Button>
                <Button variant="outline" onClick={() => setIsAddPaymentDialogOpen(false)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="gradient-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">₹{totalRevenue.toLocaleString('en-IN')}</div>
            <div className="flex items-center text-sm text-success mt-2">
              <TrendingUp className="w-4 h-4 mr-1" />
              All time earnings
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
              <IndianRupee className="w-5 h-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">₹{monthlyRevenue.toLocaleString('en-IN')}</div>
            <div className="flex items-center text-sm text-primary mt-2">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payments</CardTitle>
              <Clock className="w-5 h-5 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              ₹{pendingEvents.reduce((sum, event) => sum + event.balanceDue, 0).toLocaleString('en-IN')}
            </div>
            <div className="flex items-center text-sm text-warning mt-2">
              <AlertCircle className="w-4 h-4 mr-1" />
              {pendingEvents.length} events pending
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
              <AlertCircle className="w-5 h-5 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              ₹{overdueEvents.reduce((sum, event) => sum + event.balanceDue, 0).toLocaleString('en-IN')}
            </div>
            <div className="flex items-center text-sm text-destructive mt-2">
              <Clock className="w-4 h-4 mr-1" />
              {overdueEvents.length} overdue payments
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Payments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Outstanding Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pendingEvents.slice(0, 5).map((event) => {
              const customer = customers.find(c => c.id === event.customerId);
              const isOverdue = new Date(event.eventDate) < new Date();
              
              return (
                <div key={event.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{customer?.name}</h4>
                      {isOverdue && (
                        <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                          Overdue
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{event.eventType} - {event.venue}</p>
                    <p className="text-sm text-muted-foreground">
                      Event Date: {new Date(event.eventDate).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">₹{event.balanceDue.toLocaleString('en-IN')}</p>
                    <Button 
                      size="sm" 
                      className="mt-1"
                      onClick={() => {
                        setFormData({
                          eventId: event.id,
                          amount: event.balanceDue,
                          date: new Date().toISOString().split('T')[0]
                        });
                        setIsAddPaymentDialogOpen(true);
                      }}
                    >
                      Record Payment
                    </Button>
                  </div>
                </div>
              );
            })}
            
            {pendingEvents.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>All payments are up to date!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Payment History
            </CardTitle>
            
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="recent">Last 7 Days</SelectItem>
                  <SelectItem value="overdue">Overdue Events</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredPayments.map((payment) => {
              const event = events.find(e => e.id === payment.eventId);
              const customer = customers.find(c => c.id === payment.customerId);
              
              return (
                <div key={payment.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent transition-smooth">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center">
                        <IndianRupee className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium">{customer?.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {event?.eventType} - {payment.method}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(payment.date).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold text-lg">₹{payment.amount.toLocaleString('en-IN')}</p>
                    {payment.transactionId && (
                      <p className="text-xs text-muted-foreground">ID: {payment.transactionId}</p>
                    )}
                    
                    <div className="flex gap-2 mt-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => generateInvoice(payment)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Invoice
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {filteredPayments.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Receipt className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No payments found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Payments;