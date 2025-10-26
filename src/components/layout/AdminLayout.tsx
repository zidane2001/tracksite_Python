import React, { useEffect, useState } from 'react';
import { LayoutDashboard, Package, DollarSign, Map, Settings, Users, ChevronDown, ChevronRight, LogOut, Menu, X, Search, Bell, User, HelpCircle, BarChart2, Truck, Globe, FileText, Home, Sun, Moon } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
interface SidebarItemProps {
  icon: React.ReactNode;
  title: string;
  to: string;
  active: boolean;
  hasSubmenu?: boolean;
  isSubmenuOpen?: boolean;
  toggleSubmenu?: () => void;
  children?: React.ReactNode;
  badge?: string | number;
}
const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  title,
  to,
  active,
  hasSubmenu = false,
  isSubmenuOpen = false,
  toggleSubmenu,
  children,
  badge
}) => {
  return <div className="mb-1.5">
      <Link to={to} className={`flex items-center p-3 text-sm rounded-lg ${active ? 'bg-primary text-primary-content shadow-md' : 'text-base-content hover:bg-primary/10 hover:text-primary'} transition-colors duration-200`} onClick={hasSubmenu && toggleSubmenu ? e => {
      e.preventDefault();
      toggleSubmenu();
    } : undefined}>
        <div className={`${active ? 'text-primary-content' : 'text-primary'} mr-3`}>
          {icon}
        </div>
        <span className="flex-1">{title}</span>
        {badge && <div className={`badge badge-sm ${active ? 'badge-primary-content' : 'badge-primary'}`}>
            {badge}
          </div>}
        {hasSubmenu && <div className="ml-auto">
            {isSubmenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </div>}
      </Link>
      <AnimatePresence>
        {hasSubmenu && isSubmenuOpen && <motion.div className="pl-10 mt-1 space-y-1 overflow-hidden" initial={{
        height: 0,
        opacity: 0
      }} animate={{
        height: 'auto',
        opacity: 1
      }} exit={{
        height: 0,
        opacity: 0
      }} transition={{
        duration: 0.2
      }}>
            {children}
          </motion.div>}
      </AnimatePresence>
    </div>;
};
export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openSubmenus, setOpenSubmenus] = useState<{
    [key: string]: boolean;
  }>({
    rates: false,
    settings: false
  });
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('adminDarkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([{
    id: 1,
    title: 'Nouveau colis',
    message: 'Un nouveau colis a été enregistré',
    time: 'Il y a 5 min',
    read: false
  }, {
    id: 2,
    title: 'Mise à jour de statut',
    message: 'Le colis CS-12345678 est en transit',
    time: 'Il y a 30 min',
    read: false
  }, {
    id: 3,
    title: 'Alerte système',
    message: 'Maintenance planifiée ce soir à 22h',
    time: 'Il y a 2h',
    read: true
  }]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  useEffect(() => {
    // Count unread notifications
    setUnreadCount(notifications.filter(n => !n.read).length);

    // Initialize theme on mount
    const savedDarkMode = localStorage.getItem('adminDarkMode');
    if (savedDarkMode) {
      const isDark = JSON.parse(savedDarkMode);
      setDarkMode(isDark);
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    }
  }, [notifications]);
  const toggleSubmenu = (submenu: string) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [submenu]: !prev[submenu]
    }));
  };
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('adminDarkMode', JSON.stringify(newDarkMode));
    document.documentElement.setAttribute('data-theme', newDarkMode ? 'dark' : 'light');
  };
  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? {
      ...n,
      read: true
    } : n));
  };
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({
      ...n,
      read: true
    })));
  };
  return <div className={`flex h-screen ${darkMode ? 'bg-base-300 text-base-content' : 'bg-base-200 text-base-content'}`}>
      {/* Sidebar */}
      <motion.div className={`fixed inset-y-0 left-0 z-30 w-64 ${darkMode ? 'bg-base-100' : 'bg-base-100'} shadow-lg transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`} initial={false}>
        <div className="flex items-center justify-between p-4 border-b border-base-300">
          <div className="flex items-center">
            <div className="avatar mr-3">
              <div className="w-10 rounded-lg bg-gradient-to-br from-primary to-primary-focus">
                <span className="text-primary-content font-bold text-xl">CS</span>
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-base-content">
                ColisSelect
              </h1>
              <span className="text-xs text-base-content/60">
                Admin Portal
              </span>
            </div>
          </div>
          <button onClick={toggleSidebar} className="btn btn-ghost btn-sm lg:hidden">
            <X size={20} />
          </button>
        </div>
        <div className="p-4 overflow-y-auto h-[calc(100%-64px)] bg-base-100">
          <div className="mb-6">
            <div className="form-control mb-4">
              <div className="input-group">
                <input type="text" placeholder="Rechercher..." className="input input-bordered input-sm w-full" />
                <button className="btn btn-square btn-sm">
                  <Search size={16} />
                </button>
              </div>
            </div>
            <div className="space-y-1 mb-6">
              <SidebarItem icon={<Home size={20} />} title="Accueil" to="/" active={location.pathname === '/'} />
              <SidebarItem icon={<LayoutDashboard size={20} />} title="Dashboard" to="/admin" active={location.pathname === '/admin'} />
            </div>
            <div className="mb-6 text-base-content/60 uppercase text-xs font-semibold pl-3">
              Gestion
            </div>
          </div>
          <div className="space-y-1">
            <SidebarItem icon={<Package size={20} />} title="Gestion des Colis" to="/admin/shipments" active={location.pathname.includes('/admin/shipments')} badge="12" />
            <SidebarItem icon={<Truck size={20} />} title="Livraisons" to="/admin/deliveries" active={location.pathname.includes('/admin/deliveries')} />
            <SidebarItem icon={<Globe size={20} />} title="Suivi International" to="/admin/international" active={location.pathname.includes('/admin/international')} />
            <SidebarItem icon={<DollarSign size={20} />} title="Tarifs d'Expédition" to="/admin/rates" active={location.pathname.includes('/admin/rates')} hasSubmenu={true} isSubmenuOpen={openSubmenus.rates} toggleSubmenu={() => toggleSubmenu('rates')}>
              <Link to="/admin/rates/locations" className={`block p-2 pl-3 text-sm rounded-lg ${location.pathname === '/admin/rates/locations' ? 'text-primary font-medium' : 'text-base-content/70 hover:text-primary'}`}>
                Emplacements
              </Link>
              <Link to="/admin/rates/zones" className={`block p-2 pl-3 text-sm rounded-lg ${location.pathname === '/admin/rates/zones' ? 'text-primary font-medium' : 'text-base-content/70 hover:text-primary'}`}>
                Zones
              </Link>
              <Link to="/admin/rates/shipping" className={`block p-2 pl-3 text-sm rounded-lg ${location.pathname === '/admin/rates/shipping' ? 'text-primary font-medium' : 'text-base-content/70 hover:text-primary'}`}>
                Tarifs d'Expédition
              </Link>
              <Link to="/admin/rates/pickup" className={`block p-2 pl-3 text-sm rounded-lg ${location.pathname === '/admin/rates/pickup' ? 'text-primary font-medium' : 'text-base-content/70 hover:text-primary'}`}>
                Tarifs de Ramassage
              </Link>
            </SidebarItem>
            <SidebarItem icon={<Map size={20} />} title="Paramètres Carte" to="/admin/map-settings" active={location.pathname === '/admin/map-settings'} />
            <SidebarItem icon={<BarChart2 size={20} />} title="Rapports" to="/admin/reports" active={location.pathname === '/admin/reports'} />
            <SidebarItem icon={<FileText size={20} />} title="Factures" to="/admin/invoices" active={location.pathname === '/admin/invoices'} />
            <div className="my-6 border-t border-gray-200 dark:border-gray-700"></div>
            <SidebarItem icon={<Settings size={20} />} title="Paramètres" to="/admin/settings" active={location.pathname.includes('/admin/settings')} hasSubmenu={true} isSubmenuOpen={openSubmenus.settings} toggleSubmenu={() => toggleSubmenu('settings')}>
              <Link to="/admin/settings/general" className={`block p-2 pl-3 text-sm rounded-lg ${location.pathname === '/admin/settings/general' ? 'text-primary font-medium' : 'text-base-content/70 hover:text-primary'}`}>
                Paramètres Généraux
              </Link>
              <Link to="/admin/settings/custom-fields" className={`block p-2 pl-3 text-sm rounded-lg ${location.pathname === '/admin/settings/custom-fields' ? 'text-primary font-medium' : 'text-base-content/70 hover:text-primary'}`}>
                Champs Personnalisés
              </Link>
              <Link to="/admin/settings/integrations" className={`block p-2 pl-3 text-sm rounded-lg ${location.pathname === '/admin/settings/integrations' ? 'text-primary font-medium' : 'text-base-content/70 hover:text-primary'}`}>
                Intégrations API
              </Link>
            </SidebarItem>
            <SidebarItem icon={<Users size={20} />} title="Gestion Utilisateurs" to="/admin/users" active={location.pathname === '/admin/users'} />
          </div>
          <div className="mt-auto pt-4 border-t border-base-300 mt-6">
            <div className="card bg-primary/10 mb-4">
              <div className="card-body p-4">
                <div className="flex items-center mb-3">
                  <div className="avatar">
                    <div className="w-8 rounded-full bg-primary">
                      <HelpCircle size={16} className="text-primary-content" />
                    </div>
                  </div>
                  <div className="text-base-content font-medium ml-3">
                    Besoin d'aide ?
                  </div>
                </div>
                <p className="text-base-content/60 text-xs mb-3">
                  Accédez à notre centre d'assistance ou contactez le support
                  technique
                </p>
                <button className="link link-primary text-sm">
                  Centre d'aide
                </button>
              </div>
            </div>
            <Link to="/logout" className="flex items-center p-3 text-sm rounded-lg text-base-content hover:bg-error/10 hover:text-error transition-colors duration-200">
              <LogOut size={20} className="mr-3 text-error" />
              <span>Déconnexion</span>
            </Link>
          </div>
        </div>
      </motion.div>
      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Header */}
        <header className="bg-base-100 shadow-lg z-10">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center">
              <button onClick={toggleSidebar} className="btn btn-ghost btn-sm lg:hidden">
                <Menu size={20} />
              </button>
              <div className="ml-4 hidden md:block text-base-content">
                <h2 className="text-lg font-semibold">Bonjour, Admin</h2>
                <p className="text-sm text-base-content/70">
                  Bienvenue dans votre espace d'administration
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={toggleDarkMode} className="btn btn-circle btn-ghost">
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <div className="relative">
                <button className="btn btn-ghost btn-circle" onClick={() => setShowNotifications(!showNotifications)}>
                  <Bell size={20} />
                  {unreadCount > 0 && <div className="badge badge-error badge-sm absolute -top-1 -right-1">
                      {unreadCount}
                    </div>}
                </button>
                <AnimatePresence>
                  {showNotifications && <motion.div className="dropdown-content menu bg-base-100 rounded-box z-50 w-80 p-2 shadow-lg" initial={{
                  opacity: 0,
                  y: -10
                }} animate={{
                  opacity: 1,
                  y: 0
                }} exit={{
                  opacity: 0,
                  y: -10
                }} transition={{
                  duration: 0.2
                }}>
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium text-base-content">
                          Notifications
                        </h3>
                        <button className="link link-primary text-xs" onClick={markAllAsRead}>
                          Tout marquer comme lu
                        </button>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length > 0 ? notifications.map(notification => <div key={notification.id} className={`p-3 hover:bg-base-200 ${notification.read ? '' : 'bg-primary/10'} cursor-pointer border-b border-base-300`} onClick={() => markAsRead(notification.id)}>
                              <div className="flex justify-between mb-1">
                                <h4 className="font-medium text-sm text-base-content">
                                  {notification.title}
                                </h4>
                                <span className="text-xs text-base-content/60">
                                  {notification.time}
                                </span>
                              </div>
                              <p className="text-xs text-base-content/70">
                                {notification.message}
                              </p>
                            </div>) : <div className="p-4 text-center text-base-content/60">
                            Aucune notification
                          </div>}
                      </div>
                      <div className="text-center border-t border-base-300 pt-2 mt-2">
                        <Link to="/admin/notifications" className="link link-primary text-xs">
                          Voir toutes les notifications
                        </Link>
                      </div>
                    </motion.div>}
                </AnimatePresence>
              </div>
              <div className="dropdown dropdown-end">
                <button className="btn btn-ghost btn-circle">
                  <div className="avatar">
                    <div className="w-8 rounded-full bg-primary">
                      <User size={16} className="text-primary-content" />
                    </div>
                  </div>
                </button>
                <ul className="dropdown-content menu bg-base-100 rounded-box z-50 w-52 p-2 shadow-lg">
                  <li><span className="text-base-content">Admin</span></li>
                  <li><Link to="/profile">Profil</Link></li>
                  <li><Link to="/settings">Paramètres</Link></li>
                  <li><Link to="/logout" className="text-error">Déconnexion</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </header>
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-base-200 p-4">
          <Outlet />
        </main>
      </div>
    </div>;
};