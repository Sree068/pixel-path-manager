import { useState } from 'react';
import Layout from '@/components/Layout';
import Dashboard from '@/components/Dashboard';
import Customers from '@/components/Customers';
import Events from '@/components/Events';
import WhatsApp from '@/components/WhatsApp';
import Payments from '@/components/Payments';
import AITools from '@/components/AITools';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'customers':
        return <Customers />;
      case 'events':
        return <Events />;
      case 'whatsapp':
        return <WhatsApp />;
      case 'payments':
        return <Payments />;
      case 'ai-tools':
        return <AITools />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
};

export default Index;