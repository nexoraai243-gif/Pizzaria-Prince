import React, { useState, useEffect } from 'react';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Benefits } from './components/Benefits';
import { CategorySection } from './components/CategorySection';
import { MenuGrid } from './components/MenuGrid';
import { CartDrawer } from './components/CartDrawer';
import { OrderCheckout } from './components/OrderCheckout';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { AboutAndContact } from './components/AboutAndContact';
import { Footer } from './components/Footer';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminMenu } from './components/admin/AdminMenu';
import { AdminSettings } from './components/admin/AdminSettings';
import { AdminAuditLogs } from './components/admin/AdminAuditLogs';
import { Product, RestaurantSettings } from './types';
import { INITIAL_PRODUCTS, DEFAULT_SETTINGS } from './data/menuProducts';

function MainApp() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { items, setDeliveryFeeAmount } = useCart();

  // App routing / view state: 'storefront' | 'admin'
  const [currentView, setCurrentView] = useState<'storefront' | 'admin'>('storefront');
  const [adminSubView, setAdminSubView] = useState<'dashboard' | 'menu' | 'settings' | 'audit'>('dashboard');

  // Storefront category & data states - initialized with instant products for 100% of visitors
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [settings, setSettings] = useState<RestaurantSettings>(DEFAULT_SETTINGS);
  const [isProductsLoading, setIsProductsLoading] = useState<boolean>(false);

  // Order confirmation modal state
  const [confirmedOrderData, setConfirmedOrderData] = useState<any | null>(null);

  // Load public settings and products from server
  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const [settingsRes, menuRes] = await Promise.all([
          fetch('/api/settings'),
          fetch('/api/menu'),
        ]);

        if (settingsRes.ok) {
          const sData = await settingsRes.json();
          if (sData.success) {
            setSettings(sData.settings);
            if (typeof sData.settings.deliveryFee === 'number') {
              setDeliveryFeeAmount(sData.settings.deliveryFee);
            }
          }
        }

        if (menuRes.ok) {
          const mData = await menuRes.json();
          if (mData.success) {
            setProducts(mData.products);
          }
        }
      } catch (err) {
        console.error('Error fetching initial public data:', err);
      } finally {
        setIsProductsLoading(false);
      }
    };

    fetchPublicData();
  }, [setDeliveryFeeAmount]);

  // Sync routing from pathname or hash (e.g. /admin, #admin, /encomendar, etc.)
  useEffect(() => {
    const handleLocationChange = () => {
      const hash = window.location.hash.toLowerCase();
      const pathname = window.location.pathname.toLowerCase();

      if (hash === '#admin' || pathname === '/admin' || pathname.startsWith('/admin/')) {
        setCurrentView('admin');
      } else {
        setCurrentView('storefront');
        if (hash === '#encomendar' || pathname === '/encomendar') {
          setTimeout(() => {
            document.getElementById('encomendar')?.scrollIntoView({ behavior: 'smooth' });
          }, 150);
        } else if (hash === '#pizzas' || pathname === '/pizzas') {
          setSelectedCategory('Todos');
          setTimeout(() => {
            document.getElementById('menu-pizzas')?.scrollIntoView({ behavior: 'smooth' });
          }, 150);
        } else if (hash === '#combos' || pathname === '/combos') {
          setSelectedCategory('Combos');
          setTimeout(() => {
            document.getElementById('menu-pizzas')?.scrollIntoView({ behavior: 'smooth' });
          }, 150);
        } else if (hash === '#acompanhamentos' || pathname === '/acompanhamentos') {
          setSelectedCategory('Acompanhamentos');
          setTimeout(() => {
            document.getElementById('menu-pizzas')?.scrollIntoView({ behavior: 'smooth' });
          }, 150);
        } else if (hash === '#sobre-nos' || pathname === '/sobre-nos') {
          setTimeout(() => {
            document.getElementById('sobre-nos')?.scrollIntoView({ behavior: 'smooth' });
          }, 150);
        } else if (hash === '#contactos' || pathname === '/contactos') {
          setTimeout(() => {
            document.getElementById('contactos')?.scrollIntoView({ behavior: 'smooth' });
          }, 150);
        }
      }
    };

    handleLocationChange();
    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    setCurrentView('storefront');
    if (sectionId.startsWith('menu-')) {
      const categoryMap: { [key: string]: string } = {
        'menu-pizzas': 'Todos',
        'menu-combos': 'Combos',
        'menu-acompanhamentos': 'Acompanhamentos',
      };
      setSelectedCategory(categoryMap[sectionId] || 'Todos');
      setTimeout(() => {
        document.getElementById('menu-pizzas')?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
      return;
    }

    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleStartOrder = () => {
    setCurrentView('storefront');
    if (items.length > 0) {
      const el = document.getElementById('encomendar');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      setSelectedCategory('Todos');
      const el = document.getElementById('menu-pizzas');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleProceedToCheckout = () => {
    const el = document.getElementById('encomendar');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // -------------------------------------------------------------
  // ADMIN VIEW RENDERING
  // -------------------------------------------------------------
  if (currentView === 'admin') {
    if (!isAuthenticated) {
      return (
        <AdminLogin
          onSuccess={() => {
            setAdminSubView('dashboard');
          }}
          onBackToSite={() => {
            window.location.hash = '';
            setCurrentView('storefront');
          }}
        />
      );
    }

    if (adminSubView === 'menu') {
      return <AdminMenu onBackToDashboard={() => setAdminSubView('dashboard')} />;
    }

    if (adminSubView === 'settings') {
      return (
        <AdminSettings
          onBackToDashboard={() => setAdminSubView('dashboard')}
          onSettingsUpdated={(updated) => {
            setSettings(updated);
            if (typeof updated.deliveryFee === 'number') {
              setDeliveryFeeAmount(updated.deliveryFee);
            }
          }}
        />
      );
    }

    if (adminSubView === 'audit') {
      return <AdminAuditLogs onBackToDashboard={() => setAdminSubView('dashboard')} />;
    }

    return (
      <AdminDashboard
        onOpenMenuManagement={() => setAdminSubView('menu')}
        onOpenSettings={() => setAdminSubView('settings')}
        onOpenAuditLogs={() => setAdminSubView('audit')}
        onBackToSite={() => {
          window.location.hash = '';
          setCurrentView('storefront');
        }}
      />
    );
  }

  // -------------------------------------------------------------
  // STOREFRONT VIEW RENDERING
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#F5F1EA] flex flex-col">
      {/* Sticky Header with Logo & Cart */}
      <Navbar
        settings={settings}
        onNavigate={scrollToSection}
        onOpenAdmin={() => {
          window.location.hash = 'admin';
          setCurrentView('admin');
        }}
        onStartOrder={handleStartOrder}
      />

      {/* Hero Section */}
      <Hero
        onOrderClick={handleStartOrder}
        onMenuClick={() => {
          setSelectedCategory('Todos');
          const el = document.getElementById('menu-pizzas');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Benefits Cards */}
      <Benefits />

      {/* Visual Category Cards */}
      <CategorySection
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          const el = document.getElementById('menu-pizzas');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Interactive Menu Grid */}
      <MenuGrid
        products={products}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        isLoading={isProductsLoading}
      />

      {/* Dedicated Customer Order Form */}
      <OrderCheckout
        products={products}
        onOrderSuccess={(data) => {
          setConfirmedOrderData(data);
        }}
        onBrowseMenu={() => {
          setSelectedCategory('Todos');
          const el = document.getElementById('menu-pizzas');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* About Us & Contact Section */}
      <AboutAndContact settings={settings} />

      {/* Footer */}
      <Footer
        settings={settings}
        onNavigate={scrollToSection}
        onOpenAdmin={() => {
          window.location.hash = 'admin';
          setCurrentView('admin');
        }}
      />

      {/* Shopping Cart Slide-over Drawer */}
      <CartDrawer onProceedToCheckout={handleProceedToCheckout} />

      {/* Order Confirmation Screen */}
      <OrderConfirmationModal
        orderData={confirmedOrderData}
        onClose={() => setConfirmedOrderData(null)}
      />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
