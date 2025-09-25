// Photography Studio Management System Types

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  birthday?: string;
  anniversary?: string;
  creditBalance: number;
  totalSpent: number;
  eventHistory: string[];
  createdAt: string;
  notes?: string;
}

export interface Event {
  id: string;
  customerId: string;
  customerName: string;
  eventType: 'Wedding' | 'Birthday' | 'Corporate' | 'Anniversary' | 'Pre-Wedding' | 'Baby Shower' | 'Engagement' | 'Other';
  eventDate: string;
  venue: string;
  status: 'booked' | 'confirmed' | 'shot' | 'editing' | 'ready' | 'delivered';
  totalAmount: number;
  advancePaid: number;
  balanceDue: number;
  assignedPhotographer: string;
  packageType: string;
  notes?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  eventId: string;
  customerId: string;
  amount: number;
  method: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | 'Cheque';
  transactionId?: string;
  date: string;
  notes?: string;
  invoiceGenerated: boolean;
}

export interface WhatsAppMessage {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  messageType: 'birthday' | 'anniversary' | 'reminder' | 'custom' | 'event_update';
  content: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  creditsUsed: number;
  sentAt?: string;
  scheduledFor?: string;
}

export interface CreditTransaction {
  id: string;
  customerId?: string;
  type: 'credit' | 'debit' | 'purchase' | 'refund';
  amount: number;
  eventId?: string;
  description: string;
  date: string;
}

export interface AIProcessingJob {
  id: string;
  type: 'background_removal' | 'face_detection' | 'enhancement';
  fileName: string;
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  createdAt: string;
  completedAt?: string;
}

export interface StudioData {
  customers: Customer[];
  events: Event[];
  payments: Payment[];
  creditTransactions: CreditTransaction[];
  messages: WhatsAppMessage[];
  aiProcessingJobs: AIProcessingJob[];
  whatsappCredits: number;
  settings: {
    studioName: string;
    studioPhone: string;
    studioEmail: string;
    gstNumber?: string;
  };
}

export interface DashboardStats {
  todaysEvents: number;
  pendingPayments: number;
  whatsappCredits: number;
  monthlyRevenue: number;
  totalCustomers: number;
  activeEvents: number;
}