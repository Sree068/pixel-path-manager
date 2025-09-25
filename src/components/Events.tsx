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
  Calendar, 
  MapPin, 
  IndianRupee, 
  User, 
  Camera,
  Clock,
  Edit,
  Trash2,
  Filter,
  Search,
  ArrowRight
} from 'lucide-react';
import { loadStudioData, addEvent, updateEvent } from '@/lib/storage';
import { Event, Customer } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Event>>({});
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = () => {
    const data = loadStudioData();
    setEvents(data.events);
    setCustomers(data.customers);
  };

  const eventTypes = ['Wedding', 'Birthday', 'Corporate', 'Anniversary', 'Pre-Wedding', 'Baby Shower', 'Engagement', 'Other'];
  const photographers = ['Amit Sharma', 'Rahul Verma', 'Neha Joshi', 'Kiran Patel', 'Ravi Kumar'];
  const packages = ['Basic Package', 'Premium Wedding Package', 'Corporate Event Coverage', 'Birthday Special', 'Anniversary Package'];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'booked': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'confirmed': return 'bg-green-500/10 text-green-600 border-green-200';
      case 'shot': return 'bg-orange-500/10 text-orange-600 border-orange-200';
      case 'editing': return 'bg-purple-500/10 text-purple-600 border-purple-200';
      case 'ready': return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
      case 'delivered': return 'bg-gray-500/10 text-gray-600 border-gray-200';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const handleAddEvent = () => {
    if (!formData.customerId || !formData.eventType || !formData.eventDate) {
      toast({
        title: "Error",
        description: "Customer, event type, and date are required",
        variant: "destructive"
      });
      return;
    }

    const customer = customers.find(c => c.id === formData.customerId);
    if (!customer) return;

    const advancePaid = formData.advancePaid || 0;
    const totalAmount = formData.totalAmount || 0;

    const newEvent = addEvent({
      customerId: formData.customerId,
      customerName: customer.name,
      eventType: formData.eventType as 'Wedding' | 'Birthday' | 'Corporate' | 'Anniversary' | 'Pre-Wedding' | 'Baby Shower' | 'Engagement' | 'Other',
      eventDate: formData.eventDate,
      venue: formData.venue || '',
      status: 'booked',
      totalAmount: totalAmount,
      advancePaid: advancePaid,
      balanceDue: totalAmount - advancePaid,
      assignedPhotographer: formData.assignedPhotographer || '',
      packageType: formData.packageType || '',
      notes: formData.notes
    });

    loadEvents();
    setIsAddDialogOpen(false);
    setFormData({});
    
    toast({
      title: "Success",
      description: "Event created successfully",
    });
  };

  const handleEditEvent = () => {
    if (!selectedEvent) return;

    const advancePaid = formData.advancePaid || 0;
    const totalAmount = formData.totalAmount || 0;

    const updated = updateEvent(selectedEvent.id, {
      ...formData,
      balanceDue: totalAmount - advancePaid
    });

    if (updated) {
      loadEvents();
      setIsEditDialogOpen(false);
      setSelectedEvent(null);
      setFormData({});
      
      toast({
        title: "Success",
        description: "Event updated successfully",
      });
    }
  };

  const openEditDialog = (event: Event) => {
    setSelectedEvent(event);
    setFormData(event);
    setIsEditDialogOpen(true);
  };

  const updateEventStatus = (eventId: string, newStatus: string) => {
    const updated = updateEvent(eventId, { status: newStatus as any });
    if (updated) {
      loadEvents();
      toast({
        title: "Success",
        description: `Event status updated to ${newStatus}`,
      });
    }
  };

  const EventCard = ({ event }: { event: Event }) => (
    <Card className="card-hover">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{event.customerName}</CardTitle>
            <p className="text-sm text-muted-foreground">{event.eventType}</p>
          </div>
          <Badge className={getStatusColor(event.status)}>
            {event.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>{new Date(event.eventDate).toLocaleDateString('en-IN')}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="truncate">{event.venue}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Camera className="w-4 h-4 text-muted-foreground" />
            <span>{event.assignedPhotographer}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
          <div>
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="font-semibold">₹{event.totalAmount.toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Balance Due</p>
            <p className={`font-semibold ${event.balanceDue > 0 ? 'text-warning' : 'text-success'}`}>
              ₹{event.balanceDue.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => openEditDialog(event)}>
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
          
          <Select value={event.status} onValueChange={(value) => updateEventStatus(event.id, value)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="booked">Booked</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="shot">Shot</SelectItem>
              <SelectItem value="editing">Editing</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Events & Bookings</h1>
          <p className="text-muted-foreground">Manage your photography events and bookings</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Customer *</Label>
                <Select value={formData.customerId} onValueChange={(value) => setFormData({...formData, customerId: value})}>
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
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Event Type *</Label>
                  <Select value={formData.eventType} onValueChange={(value) => setFormData({...formData, eventType: value as 'Wedding' | 'Birthday' | 'Corporate' | 'Anniversary' | 'Pre-Wedding' | 'Baby Shower' | 'Engagement' | 'Other'})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Event Date *</Label>
                  <Input
                    type="date"
                    value={formData.eventDate || ''}
                    onChange={(e) => setFormData({...formData, eventDate: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <Label>Venue</Label>
                <Input
                  value={formData.venue || ''}
                  onChange={(e) => setFormData({...formData, venue: e.target.value})}
                  placeholder="Event venue"
                />
              </div>
              
              <div>
                <Label>Package</Label>
                <Select value={formData.packageType} onValueChange={(value) => setFormData({...formData, packageType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select package" />
                  </SelectTrigger>
                  <SelectContent>
                    {packages.map((pkg) => (
                      <SelectItem key={pkg} value={pkg}>{pkg}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Photographer</Label>
                <Select value={formData.assignedPhotographer} onValueChange={(value) => setFormData({...formData, assignedPhotographer: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Assign photographer" />
                  </SelectTrigger>
                  <SelectContent>
                    {photographers.map((photographer) => (
                      <SelectItem key={photographer} value={photographer}>{photographer}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Total Amount</Label>
                  <Input
                    type="number"
                    value={formData.totalAmount || ''}
                    onChange={(e) => setFormData({...formData, totalAmount: parseInt(e.target.value) || 0})}
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <Label>Advance Paid</Label>
                  <Input
                    type="number"
                    value={formData.advancePaid || ''}
                    onChange={(e) => setFormData({...formData, advancePaid: parseInt(e.target.value) || 0})}
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Event details and requirements"
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleAddEvent} className="flex-1">Create Event</Button>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search events by customer, type, or venue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="booked">Booked</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="shot">Shot</SelectItem>
            <SelectItem value="editing">Editing</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Event Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {/* Edit Event Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Event Type</Label>
              <Select value={formData.eventType} onValueChange={(value) => setFormData({...formData, eventType: value as 'Wedding' | 'Birthday' | 'Corporate' | 'Anniversary' | 'Pre-Wedding' | 'Baby Shower' | 'Engagement' | 'Other'})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
              
              <div>
                <Label>Event Date</Label>
                <Input
                  type="date"
                  value={formData.eventDate || ''}
                  onChange={(e) => setFormData({...formData, eventDate: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <Label>Venue</Label>
              <Input
                value={formData.venue || ''}
                onChange={(e) => setFormData({...formData, venue: e.target.value})}
              />
            </div>
            
            <div>
              <Label>Photographer</Label>
              <Select value={formData.assignedPhotographer} onValueChange={(value) => setFormData({...formData, assignedPhotographer: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {photographers.map((photographer) => (
                    <SelectItem key={photographer} value={photographer}>{photographer}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Total Amount</Label>
                <Input
                  type="number"
                  value={formData.totalAmount || ''}
                  onChange={(e) => setFormData({...formData, totalAmount: parseInt(e.target.value) || 0})}
                />
              </div>
              
              <div>
                <Label>Advance Paid</Label>
                <Input
                  type="number"
                  value={formData.advancePaid || ''}
                  onChange={(e) => setFormData({...formData, advancePaid: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
            
            <div>
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value as 'booked' | 'confirmed' | 'shot' | 'editing' | 'ready' | 'delivered'})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="booked">Booked</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="shot">Shot</SelectItem>
                  <SelectItem value="editing">Editing</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Notes</Label>
              <Textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleEditEvent} className="flex-1">Update Event</Button>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No events found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'Try adjusting your search or filters' : 'Create your first event to get started'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Event
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Events;