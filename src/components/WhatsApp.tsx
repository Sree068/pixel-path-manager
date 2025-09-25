import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageSquare, 
  Plus, 
  Send, 
  Users, 
  CreditCard,
  Calendar,
  Gift,
  Heart,
  Bell,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Search
} from 'lucide-react';
import { loadStudioData, sendWhatsAppMessage, purchaseWhatsAppCredits } from '@/lib/storage';
import { Customer, WhatsAppMessage } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const WhatsApp = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [whatsappCredits, setWhatsappCredits] = useState(0);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [messageText, setMessageText] = useState('');
  const [messageType, setMessageType] = useState('custom');
  const [isComposeDialogOpen, setIsComposeDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [isCreditDialogOpen, setIsCreditDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const data = loadStudioData();
    setCustomers(data.customers);
    setMessages(data.messages);
    setWhatsappCredits(data.whatsappCredits);
  };

  const messageTemplates = {
    birthday: "🎉 Happy Birthday {name}! 🎂 Hope your special day is filled with joy and amazing memories! Thank you for choosing PhotoStudio Pro for your precious moments. 📸",
    anniversary: "💕 Happy Anniversary {name}! 🥳 Wishing you both a lifetime of love and happiness. It was our pleasure capturing your beautiful moments! 📸✨",
    reminder: "📸 Hi {name}! This is a friendly reminder about your upcoming photo session. We're excited to capture your special moments! Contact us if you have any questions.",
    thank_you: "🙏 Thank you {name} for choosing PhotoStudio Pro! We loved capturing your special moments. Don't forget to share your favorite photos with us! 📸",
    custom: ""
  };

  const creditPackages = [
    { credits: 100, price: 120, popular: false },
    { credits: 500, price: 550, popular: true },
    { credits: 1000, price: 1000, popular: false },
    { credits: 2000, price: 1800, popular: false },
  ];

  const calculateCredits = (text: string) => {
    return Math.ceil(text.length / 160); // Standard SMS length
  };

  const getUpcomingBirthdays = () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return customers.filter(customer => {
      if (!customer.birthday) return false;
      const birthday = new Date(customer.birthday);
      const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
      return thisYearBirthday >= today && thisYearBirthday <= nextWeek;
    });
  };

  const getUpcomingAnniversaries = () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return customers.filter(customer => {
      if (!customer.anniversary) return false;
      const anniversary = new Date(customer.anniversary);
      const thisYearAnniversary = new Date(today.getFullYear(), anniversary.getMonth(), anniversary.getDate());
      return thisYearAnniversary >= today && thisYearAnniversary <= nextWeek;
    });
  };

  const handleSendMessage = (customerId: string, customerName: string, customerPhone: string) => {
    if (!messageText.trim()) {
      toast({
        title: "Error",
        description: "Message text is required",
        variant: "destructive"
      });
      return;
    }

    const personalizedMessage = messageText.replace(/\{name\}/g, customerName);
    const creditsRequired = calculateCredits(personalizedMessage);

    if (creditsRequired > whatsappCredits) {
      toast({
        title: "Insufficient Credits",
        description: `You need ${creditsRequired} credits but only have ${whatsappCredits}`,
        variant: "destructive"
      });
      return;
    }

    const message = sendWhatsAppMessage({
      customerId,
      customerName,
      customerPhone,
      messageType: messageType as any,
      content: personalizedMessage,
      status: 'sent',
      creditsUsed: creditsRequired
    });

    loadData();
    setIsComposeDialogOpen(false);
    setMessageText('');
    setMessageType('custom');

    toast({
      title: "Message Sent",
      description: `Message sent to ${customerName} (${creditsRequired} credits used)`,
    });

    // Simulate WhatsApp opening
    const whatsappUrl = `https://wa.me/${customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(personalizedMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleBulkMessage = () => {
    if (selectedCustomers.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one customer",
        variant: "destructive"
      });
      return;
    }

    if (!messageText.trim()) {
      toast({
        title: "Error",
        description: "Message text is required",
        variant: "destructive"
      });
      return;
    }

    const totalCreditsRequired = selectedCustomers.reduce((total, customerId) => {
      const customer = customers.find(c => c.id === customerId);
      if (customer) {
        const personalizedMessage = messageText.replace(/\{name\}/g, customer.name);
        return total + calculateCredits(personalizedMessage);
      }
      return total;
    }, 0);

    if (totalCreditsRequired > whatsappCredits) {
      toast({
        title: "Insufficient Credits",
        description: `You need ${totalCreditsRequired} credits but only have ${whatsappCredits}`,
        variant: "destructive"
      });
      return;
    }

    let sentCount = 0;
    selectedCustomers.forEach(customerId => {
      const customer = customers.find(c => c.id === customerId);
      if (customer) {
        const personalizedMessage = messageText.replace(/\{name\}/g, customer.name);
        sendWhatsAppMessage({
          customerId,
          customerName: customer.name,
          customerPhone: customer.phone,
          messageType: messageType as any,
          content: personalizedMessage,
          status: 'sent',
          creditsUsed: calculateCredits(personalizedMessage)
        });
        sentCount++;
      }
    });

    loadData();
    setIsBulkDialogOpen(false);
    setSelectedCustomers([]);
    setMessageText('');
    setMessageType('custom');

    toast({
      title: "Bulk Messages Sent",
      description: `${sentCount} messages sent successfully (${totalCreditsRequired} credits used)`,
    });
  };

  const handlePurchaseCredits = (credits: number, price: number) => {
    purchaseWhatsAppCredits(credits, price);
    loadData();
    setIsCreditDialogOpen(false);
    
    toast({
      title: "Credits Purchased",
      description: `${credits} WhatsApp credits added to your account`,
    });
  };

  const sendBirthdayMessage = (customer: Customer) => {
    const message = messageTemplates.birthday.replace(/\{name\}/g, customer.name);
    const credits = calculateCredits(message);
    
    if (credits > whatsappCredits) {
      toast({
        title: "Insufficient Credits",
        description: `You need ${credits} credits but only have ${whatsappCredits}`,
        variant: "destructive"
      });
      return;
    }

    sendWhatsAppMessage({
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      messageType: 'birthday',
      content: message,
      status: 'sent',
      creditsUsed: credits
    });

    loadData();
    toast({
      title: "Birthday Message Sent",
      description: `Birthday wish sent to ${customer.name}`,
    });
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">WhatsApp Messaging</h1>
          <p className="text-muted-foreground">Send personalized messages to your customers</p>
        </div>
        
        <div className="flex gap-3">
          <Dialog open={isCreditDialogOpen} onOpenChange={setIsCreditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <CreditCard className="w-4 h-4 mr-2" />
                Buy Credits
              </Button>
            </DialogTrigger>
          </Dialog>
          
          <Dialog open={isComposeDialogOpen} onOpenChange={setIsComposeDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-white">
                <Plus className="w-4 h-4 mr-2" />
                Compose Message
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Credit Balance and Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="gradient-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Available Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{whatsappCredits}</div>
            <Button 
              size="sm" 
              variant="secondary" 
              className="mt-2"
              onClick={() => setIsCreditDialogOpen(true)}
            >
              Buy More
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Messages Sent Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {messages.filter(m => 
                new Date(m.sentAt || '').toDateString() === new Date().toDateString()
              ).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Upcoming Birthdays</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{getUpcomingBirthdays().length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Upcoming Anniversaries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{getUpcomingAnniversaries().length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Birthdays */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Upcoming Birthdays (Next 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getUpcomingBirthdays().map((customer) => (
                <div key={customer.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div>
                    <h4 className="font-medium">{customer.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {customer.birthday && new Date(customer.birthday).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => sendBirthdayMessage(customer)}
                    className="gradient-secondary text-white"
                  >
                    <Gift className="w-4 h-4 mr-1" />
                    Send Wish
                  </Button>
                </div>
              ))}
              
              {getUpcomingBirthdays().length === 0 && (
                <p className="text-center text-muted-foreground py-4">No upcoming birthdays</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Anniversaries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Upcoming Anniversaries (Next 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getUpcomingAnniversaries().map((customer) => (
                <div key={customer.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div>
                    <h4 className="font-medium">{customer.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {customer.anniversary && new Date(customer.anniversary).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    className="gradient-secondary text-white"
                    onClick={() => {
                      const message = messageTemplates.anniversary.replace(/\{name\}/g, customer.name);
                      const credits = calculateCredits(message);
                      
                      if (credits <= whatsappCredits) {
                        sendWhatsAppMessage({
                          customerId: customer.id,
                          customerName: customer.name,
                          customerPhone: customer.phone,
                          messageType: 'anniversary',
                          content: message,
                          status: 'sent',
                          creditsUsed: credits
                        });
                        loadData();
                        toast({
                          title: "Anniversary Message Sent",
                          description: `Anniversary wish sent to ${customer.name}`,
                        });
                      }
                    }}
                  >
                    <Heart className="w-4 h-4 mr-1" />
                    Send Wish
                  </Button>
                </div>
              ))}
              
              {getUpcomingAnniversaries().length === 0 && (
                <p className="text-center text-muted-foreground py-4">No upcoming anniversaries</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Messaging */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Bulk Messaging
            </CardTitle>
            <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Send className="w-4 h-4 mr-2" />
                  Send Bulk Message
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="max-h-64 overflow-y-auto space-y-2">
              {filteredCustomers.map((customer) => (
                <div key={customer.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent">
                  <Checkbox
                    checked={selectedCustomers.includes(customer.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedCustomers([...selectedCustomers, customer.id]);
                      } else {
                        setSelectedCustomers(selectedCustomers.filter(id => id !== customer.id));
                      }
                    }}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-sm text-muted-foreground">{customer.phone}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {selectedCustomers.length > 0 && (
              <div className="p-3 bg-accent rounded-lg">
                <p className="text-sm font-medium">
                  {selectedCustomers.length} customer(s) selected
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Message History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Messages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {messages.slice(0, 10).map((message) => (
              <div key={message.id} className="flex items-start justify-between p-3 rounded-lg border border-border">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{message.customerName}</h4>
                    <Badge variant={message.status === 'sent' ? 'default' : 'secondary'}>
                      {message.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {message.creditsUsed} credit{message.creditsUsed !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{message.content}</p>
                  <p className="text-xs text-muted-foreground">
                    {message.sentAt && new Date(message.sentAt).toLocaleString('en-IN')}
                  </p>
                </div>
                {message.status === 'sent' ? (
                  <CheckCircle className="w-5 h-5 text-success" />
                ) : (
                  <XCircle className="w-5 h-5 text-destructive" />
                )}
              </div>
            ))}
            
            {messages.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No messages sent yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Compose Message Dialog */}
      <Dialog open={isComposeDialogOpen} onOpenChange={setIsComposeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Compose Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Message Template</Label>
              <Select value={messageType} onValueChange={(value) => {
                setMessageType(value);
                setMessageText(messageTemplates[value as keyof typeof messageTemplates] || '');
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="birthday">Birthday Wish</SelectItem>
                  <SelectItem value="anniversary">Anniversary Wish</SelectItem>
                  <SelectItem value="reminder">Appointment Reminder</SelectItem>
                  <SelectItem value="thank_you">Thank You Message</SelectItem>
                  <SelectItem value="custom">Custom Message</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Message Text</Label>
              <Textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message here... Use {name} for personalization"
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Credits required: {calculateCredits(messageText)} • Available: {whatsappCredits}
              </p>
            </div>
            
            <div>
              <Label>Send To</Label>
              <Select onValueChange={(customerId) => {
                const customer = customers.find(c => c.id === customerId);
                if (customer) {
                  handleSendMessage(customer.id, customer.name, customer.phone);
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} - {customer.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Message Dialog */}
      <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Bulk Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Message Template</Label>
              <Select value={messageType} onValueChange={(value) => {
                setMessageType(value);
                setMessageText(messageTemplates[value as keyof typeof messageTemplates] || '');
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="birthday">Birthday Wish</SelectItem>
                  <SelectItem value="anniversary">Anniversary Wish</SelectItem>
                  <SelectItem value="reminder">Appointment Reminder</SelectItem>
                  <SelectItem value="thank_you">Thank You Message</SelectItem>
                  <SelectItem value="custom">Custom Message</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Message Text</Label>
              <Textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message here... Use {name} for personalization"
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Total credits required: {selectedCustomers.reduce((total, customerId) => {
                  const customer = customers.find(c => c.id === customerId);
                  if (customer) {
                    const personalizedMessage = messageText.replace(/\{name\}/g, customer.name);
                    return total + calculateCredits(personalizedMessage);
                  }
                  return total;
                }, 0)} • Available: {whatsappCredits}
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleBulkMessage} className="flex-1" disabled={selectedCustomers.length === 0}>
                Send to {selectedCustomers.length} Customer{selectedCustomers.length !== 1 ? 's' : ''}
              </Button>
              <Button variant="outline" onClick={() => setIsBulkDialogOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Credit Purchase Dialog */}
      <Dialog open={isCreditDialogOpen} onOpenChange={setIsCreditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Purchase WhatsApp Credits</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {creditPackages.map((pkg, index) => (
              <Card key={index} className={`cursor-pointer transition-all ${pkg.popular ? 'ring-2 ring-primary' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{pkg.credits} Credits</h3>
                        {pkg.popular && <Badge className="bg-primary">Most Popular</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">₹{pkg.price}</p>
                      <p className="text-xs text-muted-foreground">₹{(pkg.price / pkg.credits).toFixed(2)} per credit</p>
                    </div>
                    <Button 
                      onClick={() => handlePurchaseCredits(pkg.credits, pkg.price)}
                      variant={pkg.popular ? "default" : "outline"}
                    >
                      Buy Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WhatsApp;