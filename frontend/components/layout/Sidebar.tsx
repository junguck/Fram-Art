import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Search, Megaphone, Star, User, Users, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { Notification } from '../../types/notification';
import logo from '../../assets/images/logo.png'

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  const navItems = [
    { icon: <Search size={28} />, path: '/search', label: 'Recherche' },
    { icon: <Megaphone size={28} />, path: '/notifications', label: 'Notifications' },
    { icon: <Star size={28} />, path: '/fav', label: 'Favoris' },
    ...(user?.role === 'administrateur'
      ? [{ icon: <Users size={28} />, path: '/admin', label: 'Admin' }]
      : []),
  ];

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const loadUnreadNotifications = async () => {
      try {
        const result = await api.getNotifications();
        const notifications = (result.notifications as Notification[]) || [];
        setUnreadCount(notifications.filter((notification) => !notification.est_lue).length);
      } catch (error) {
        console.error('Erreur chargement badge notifications', error);
      }
    };

    void loadUnreadNotifications();
  }, [user]);

  return (
    <aside className="w-24 flex flex-col items-center py-10 bg-gradient-to-b from-white/80 to-white/40 backdrop-blur-md border-r border-white/20 shadow-lg relative">
      <div className="mb-12">
        <img src={logo} alt="" className='hover:shadow-[0px_8px_8px_8px_rgba(100,100,100,1)]' onClick={() => {navigate('/home')}}/>
      </div>

      {/* Navigation Principale */}
      <nav className="flex flex-col gap-10 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `relative transition-all duration-300 ${isActive ? 'text-black scale-125' : 'text-gray-400 hover:text-black'}`
            }
          >
            <div className="relative inline-flex">
              {item.icon}
              {item.label === 'Notifications' && unreadCount > 0 && (
                <span className="absolute -top-2 -right-3 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-black text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
          </NavLink>
        ))}
      </nav>

      {/* Actions Utilisateur Bas de page */}
      <div className="flex flex-col gap-8 mt-auto">
        <NavLink to="/profiles" className={({ isActive }) => isActive ? 'text-black' : 'text-gray-400'}>
          <User size={30} strokeWidth={2.5} />
        </NavLink>
        <button className="text-gray-400 hover:text-red-500 transition-colors"
        onClick={() => navigate('/login')}>
          <LogOut size={28}/>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
