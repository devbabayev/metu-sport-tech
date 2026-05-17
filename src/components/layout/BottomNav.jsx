import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, BarChart2, Gift, User, Camera } from 'lucide-react';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: <Home size={24} />, label: 'Feed', path: '/dashboard' },
    { icon: <BarChart2 size={24} />, label: 'Ranks', path: '/ranks' },
    { icon: <Gift size={24} />, label: 'Rewards', path: '/rewards' },
    { icon: <User size={24} />, label: 'Me', path: '/profile' },
  ];


  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '80px',
      background: 'white',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      borderTop: '1px solid #eee',
      paddingBottom: '20px',
      zIndex: 1000,
      maxWidth: '480px',
      margin: '0 auto'
    }}>
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <div 
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              color: isActive ? '#EB8911' : '#888',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            <div style={{
              background: isActive ? 'rgba(235, 137, 17, 0.1)' : 'transparent',
              padding: '8px 16px',
              borderRadius: '20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px'
            }}>
              {item.icon}
              <span style={{ fontSize: '12px', fontWeight: isActive ? '700' : '500' }}>{item.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BottomNav;
