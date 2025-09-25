import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  CreditCard,
  MessageSquare,
  Filter,
  SortAsc,
  MoreVertical,
  Cake,
  Heart
} from 'lucide-react';
import { loadStudioData, addCustomer, updateCustomer, deleteCustomer } from '@/lib/storage';
import { Customer } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Customer>>({});
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'totalSpent' | 'creditBalance'>('name');
  const [filterBy, setFilterBy] = useState<'all' | 'hasCredit' | 'highValue'>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = () => {
    const data = loadStudioData();
    setCustomers(data.customers);
  };

  const filteredAndSortedCustomers = customers
    .filter(customer => {
      const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = 
        filterBy === 'all' || 
        (filterBy === 'hasCredit' && customer.creditBalance > 0) ||
        (filterBy === 'highValue' && customer.totalSpent > 30000);
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'createdAt': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'totalSpent': return b.totalSpent - a.totalSpent;
        case 'creditBalance': return b.creditBalance - a.creditBalance;
        default: return 0;
      }
    });

  const handleAddCustomer = () => {
    if (!formData.name || !formData.phone) {
      toast({
        title: "Error",
        description: "Name and phone are required fields",
        variant: "destructive"
      });
      return;
    }

    const newCustomer = addCustomer({
      name: formData.name,
      phone: formData.phone,
      email: formData.email || '',
      address: formData.address || '',
      birthday: formData.birthday,
      anniversary: formData.anniversary,
      creditBalance: 0,
      totalSpent: 0,
      eventHistory: [],
      notes: formData.notes
    });

    loadCustomers();
    setIsAddDialogOpen(false);
    setFormData({});
    
    toast({
      title: "Success",
      description: "Customer added successfully",
    });
  };

  const handleEditCustomer = () => {
    if (!selectedCustomer || !formData.name || !formData.phone) {
      toast({
        title: "Error",
        description: "Name and phone are required fields",
        variant: "destructive"
      });
      return;
    }

    const updated = updateCustomer(selectedCustomer.id, formData);
    if (updated) {
      loadCustomers();
      setIsEditDialogOpen(false);
      setSelectedCustomer(null);
      setFormData({});
      
      toast({
        title: "Success",
        description: "Customer updated successfully",
      });
    }
  };

  const handleDeleteCustomer = (customer: Customer) => {
    if (window.confirm(`Are you sure you want to delete ${customer.name}?`)) {
      const deleted = deleteCustomer(customer.id);
      if (deleted) {
        loadCustomers();
        toast({
          title: "Success",
          description: "Customer deleted successfully",
        });
      }
    }
  };

  const openEditDialog = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData(customer);
    setIsEditDialogOpen(true);
  };

  const formatPhoneNumber = (phone: string) => {
    if (phone.startsWith('+91-')) return phone;
    if (phone.startsWith('+91')) return phone.replace('+91', '+91-');
    if (phone.startsWith('91')) return `+${phone.substring(0, 2)}-${phone.substring(2)}`;
    return `+91-${phone}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground">Manage your customer database and relationships</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Customer name"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+91-9876543210"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="customer@email.com"
                />
              </div>
              
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Full address"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="birthday">Birthday</Label>
                  <Input
                    id="birthday"
                    type="date"
                    value={formData.birthday || ''}
                    onChange={(e) => setFormData({...formData, birthday: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="anniversary">Anniversary</Label>
                  <Input
                    id="anniversary"
                    type="date"
                    value={formData.anniversary || ''}
                    onChange={(e) => setFormData({...formData, anniversary: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional notes about the customer"
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleAddCustomer} className="flex-1">Add Customer</Button>
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
            placeholder="Search customers by name, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
          >
            <option value="name">Sort by Name</option>
            <option value="createdAt">Sort by Date Added</option>
            <option value="totalSpent">Sort by Total Spent</option>
            <option value="creditBalance">Sort by Credit Balance</option>
          </select>
          
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as any)}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
          >
            <option value="all">All Customers</option>
            <option value="hasCredit">Has Credits</option>
            <option value="highValue">High Value (₹30K+)</option>
          </select>
        </div>
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedCustomers.map((customer) => (
          <Card key={customer.id} className="card-hover">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{customer.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Member since {new Date(customer.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => openEditDialog(customer)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => handleDeleteCustomer(customer)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{formatPhoneNumber(customer.phone)}</span>
                </div>
                
                {customer.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                )}
                
                {customer.address && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="truncate">{customer.address}</span>
                  </div>
                )}
                
                {customer.birthday && (
                  <div className="flex items-center gap-2 text-sm">
                    <Cake className="w-4 h-4 text-muted-foreground" />
                    <span>{new Date(customer.birthday).toLocaleDateString('en-IN')}</span>
                  </div>
                )}
                
                {customer.anniversary && (
                  <div className="flex items-center gap-2 text-sm">
                    <Heart className="w-4 h-4 text-muted-foreground" />
                    <span>{new Date(customer.anniversary).toLocaleDateString('en-IN')}</span>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t border-border">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="font-semibold">₹{customer.totalSpent.toLocaleString('en-IN')}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Credits</p>
                  <p className="font-semibold text-success">₹{customer.creditBalance.toLocaleString('en-IN')}</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  WhatsApp
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Calendar className="w-4 h-4 mr-1" />
                  Book Event
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Customer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">Phone *</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={formData.address || ''}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-birthday">Birthday</Label>
                <Input
                  id="edit-birthday"
                  type="date"
                  value={formData.birthday || ''}
                  onChange={(e) => setFormData({...formData, birthday: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-anniversary">Anniversary</Label>
                <Input
                  id="edit-anniversary"
                  type="date"
                  value={formData.anniversary || ''}
                  onChange={(e) => setFormData({...formData, anniversary: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes || ''}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleEditCustomer} className="flex-1">Update Customer</Button>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Empty State */}
      {filteredAndSortedCustomers.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No customers found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'Try adjusting your search or filters' : 'Get started by adding your first customer'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Customer
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Customers;