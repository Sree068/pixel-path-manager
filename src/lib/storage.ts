// Photography Studio Data Storage and Management

import { StudioData, Customer, Event, Payment, WhatsAppMessage, CreditTransaction, AIProcessingJob } from './types';

const STORAGE_KEY = 'studioData';

// Default data structure
const defaultStudioData: StudioData = {
  customers: [],
  events: [],
  payments: [],
  creditTransactions: [],
  messages: [],
  aiProcessingJobs: [],
  whatsappCredits: 500,
  settings: {
    studioName: 'PhotoStudio Pro',
    studioPhone: '+91-9876543210',
    studioEmail: 'info@photostudiopro.in',
    gstNumber: '27AABCU9603R1ZX',
  }
};

// Load data from localStorage
export const loadStudioData = (): StudioData => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsedData = JSON.parse(data);
      // Merge with default to ensure all fields exist
      return { ...defaultStudioData, ...parsedData };
    }
    return defaultStudioData;
  } catch (error) {
    console.error('Error loading studio data:', error);
    return defaultStudioData;
  }
};

// Save data to localStorage
export const saveStudioData = (data: StudioData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving studio data:', error);
  }
};

// Generate unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Customer operations
export const addCustomer = (customer: Omit<Customer, 'id' | 'createdAt'>): Customer => {
  const newCustomer: Customer = {
    ...customer,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };

  const data = loadStudioData();
  data.customers.push(newCustomer);
  saveStudioData(data);

  return newCustomer;
};

export const updateCustomer = (customerId: string, updates: Partial<Customer>): Customer | null => {
  const data = loadStudioData();
  const customerIndex = data.customers.findIndex(c => c.id === customerId);
  
  if (customerIndex === -1) return null;

  data.customers[customerIndex] = { ...data.customers[customerIndex], ...updates };
  saveStudioData(data);

  return data.customers[customerIndex];
};

export const deleteCustomer = (customerId: string): boolean => {
  const data = loadStudioData();
  const initialLength = data.customers.length;
  data.customers = data.customers.filter(c => c.id !== customerId);
  
  if (data.customers.length < initialLength) {
    saveStudioData(data);
    return true;
  }
  return false;
};

// Event operations
export const addEvent = (event: Omit<Event, 'id' | 'createdAt'>): Event => {
  const newEvent: Event = {
    ...event,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };

  const data = loadStudioData();
  data.events.push(newEvent);
  saveStudioData(data);

  return newEvent;
};

export const updateEvent = (eventId: string, updates: Partial<Event>): Event | null => {
  const data = loadStudioData();
  const eventIndex = data.events.findIndex(e => e.id === eventId);
  
  if (eventIndex === -1) return null;

  data.events[eventIndex] = { ...data.events[eventIndex], ...updates };
  saveStudioData(data);

  return data.events[eventIndex];
};

// Payment operations
export const addPayment = (payment: Omit<Payment, 'id'>): Payment => {
  const newPayment: Payment = {
    ...payment,
    id: generateId(),
  };

  const data = loadStudioData();
  data.payments.push(newPayment);
  
  // Update event balance
  const event = data.events.find(e => e.id === payment.eventId);
  if (event) {
    event.balanceDue = event.totalAmount - data.payments
      .filter(p => p.eventId === payment.eventId)
      .reduce((sum, p) => sum + p.amount, 0);
  }

  saveStudioData(data);
  return newPayment;
};

// WhatsApp operations
export const sendWhatsAppMessage = (message: Omit<WhatsAppMessage, 'id' | 'sentAt'>): WhatsAppMessage => {
  const newMessage: WhatsAppMessage = {
    ...message,
    id: generateId(),
    sentAt: new Date().toISOString(),
  };

  const data = loadStudioData();
  data.messages.push(newMessage);
  data.whatsappCredits -= message.creditsUsed;
  saveStudioData(data);

  return newMessage;
};

export const purchaseWhatsAppCredits = (credits: number, amount: number): void => {
  const data = loadStudioData();
  data.whatsappCredits += credits;
  
  // Add credit transaction
  const transaction: CreditTransaction = {
    id: generateId(),
    type: 'purchase',
    amount: credits,
    description: `Purchased ${credits} WhatsApp credits for ₹${amount}`,
    date: new Date().toISOString(),
  };
  
  data.creditTransactions.push(transaction);
  saveStudioData(data);
};

// Initialize with sample data if empty
export const initializeSampleData = (): void => {
  const data = loadStudioData();
  
  if (data.customers.length === 0) {
    // Add sample customers
    const sampleCustomers: Omit<Customer, 'id' | 'createdAt'>[] = [
      {
        name: "Rajesh Kumar",
        phone: "+91-9876543210",
        email: "rajesh.kumar@gmail.com",
        address: "123 MG Road, Bandra, Mumbai - 400050",
        birthday: "1985-06-15",
        anniversary: "2010-12-20",
        creditBalance: 2500,
        totalSpent: 45000,
        eventHistory: [],
        notes: "Prefers outdoor shoots"
      },
      {
        name: "Priya Sharma",
        phone: "+91-9876543211",
        email: "priya.sharma@gmail.com",
        address: "456 Park Street, Pune - 411001",
        birthday: "1990-03-22",
        anniversary: "2015-11-28",
        creditBalance: 1800,
        totalSpent: 32000,
        eventHistory: [],
        notes: "Likes traditional photography"
      },
      {
        name: "Amit Patel",
        phone: "+91-9876543212",
        email: "amit.patel@gmail.com",
        address: "789 Ring Road, Ahmedabad - 380001",
        birthday: "1988-09-10",
        creditBalance: 0,
        totalSpent: 28000,
        eventHistory: [],
        notes: "Corporate event specialist"
      },
      {
        name: "Sneha Reddy",
        phone: "+91-9876543213",
        email: "sneha.reddy@gmail.com",
        address: "321 Jubilee Hills, Hyderabad - 500033",
        birthday: "1992-12-05",
        anniversary: "2018-02-14",
        creditBalance: 3200,
        totalSpent: 67000,
        eventHistory: [],
        notes: "Regular customer, high-value events"
      },
      {
        name: "Vikram Singh",
        phone: "+91-9876543214",
        email: "vikram.singh@gmail.com",
        address: "567 Civil Lines, Delhi - 110054",
        birthday: "1983-07-18",
        creditBalance: 500,
        totalSpent: 18000,
        eventHistory: [],
        notes: "Destination weddings"
      }
    ];

    sampleCustomers.forEach(customer => addCustomer(customer));

    // Add sample events
    const customers = loadStudioData().customers;
    const sampleEvents: Omit<Event, 'id' | 'createdAt'>[] = [
      {
        customerId: customers[0].id,
        customerName: customers[0].name,
        eventType: 'Wedding',
        eventDate: '2025-02-15',
        venue: 'Hotel Taj, Mumbai',
        status: 'confirmed',
        totalAmount: 75000,
        advancePaid: 30000,
        balanceDue: 45000,
        assignedPhotographer: 'Amit Sharma',
        packageType: 'Premium Wedding Package',
        notes: '150 guests expected, 2-day event'
      },
      {
        customerId: customers[1].id,
        customerName: customers[1].name,
        eventType: 'Birthday',
        eventDate: '2025-01-28',
        venue: 'Home - Pune',
        status: 'shot',
        totalAmount: 15000,
        advancePaid: 15000,
        balanceDue: 0,
        assignedPhotographer: 'Rahul Verma',
        packageType: 'Birthday Special',
        notes: 'Kids birthday party'
      },
      {
        customerId: customers[2].id,
        customerName: customers[2].name,
        eventType: 'Corporate',
        eventDate: '2025-02-08',
        venue: 'Conference Hall, Ahmedabad',
        status: 'editing',
        totalAmount: 25000,
        advancePaid: 12500,
        balanceDue: 12500,
        assignedPhotographer: 'Neha Joshi',
        packageType: 'Corporate Event Coverage',
        notes: 'Annual company meet'
      }
    ];

    sampleEvents.forEach(event => addEvent(event));

    console.log('Sample data initialized');
  }
};