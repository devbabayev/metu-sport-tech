import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Settings, LogOut, Shield, Award, Activity } from 'lucide-react';
import BottomNav from '../../components/layout/BottomNav';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*, cities(name)')
          .eq('id', user.id)
          .single();
        setProfile(data);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div style={{ background: '#F8F9FA', minHeight: '100vh', padding: '20px 20px 100px 20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '900' }}>My Profile</h1>
        <Settings size={24} color="#666" />
      </header>

      {/* User Info Card */}
      <div style={{ 
        background: 'white', 
        borderRadius: '24px', 
        padding: '30px', 
        textAlign: 'center', 
        border: '1px solid #EEE',
        marginBottom: '25px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
      }}>
        <div style={{ 
          width: '100px', 
          height: '100px', 
          borderRadius: '50%', 
          border: '4px solid #EB8911',
          margin: '0 auto 15px auto',
          overflow: 'hidden'
        }}>
           <img src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.full_name}`} alt="avatar" />
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: '900' }}>{profile?.full_name || 'User'}</h2>
        <p style={{ color: '#888', fontWeight: '700', fontSize: '14px' }}>{profile?.cities?.name || 'Baku'} Athlete</p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '15px' }}>
          <span style={{ background: '#FFF7ED', color: '#EB8911', padding: '6px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '800' }}>LEVEL {profile?.level || 1}</span>
          <span style={{ background: '#F5F3FF', color: '#7C3AED', padding: '6px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '800' }}>PRO ATHLETE</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
        <StatCard icon={<Activity color="#3B82F6" />} label="Total Move" value="12.5 km" />
        <StatCard icon={<Award color="#F59E0B" />} label="Badges" value="8" />
      </div>

      {/* Menu List */}
      <div style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', border: '1px solid #EEE' }}>
        <MenuItem icon={<User size={20} />} label="Edit Profile" />
        <MenuItem icon={<Shield size={20} />} label="Privacy & Security" />
        <MenuItem 
          icon={<LogOut size={20} color="#EF4444" />} 
          label="Sign Out" 
          color="#EF4444" 
          onClick={handleLogout}
        />
      </div>

      <BottomNav />
    </div>
  );
};

const StatCard = ({ icon, label, value }) => (
  <div style={{ background: 'white', padding: '20px', borderRadius: '20px', border: '1px solid #EEE', textAlign: 'center' }}>
    <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'center' }}>{icon}</div>
    <p style={{ fontSize: '11px', fontWeight: '800', color: '#999', textTransform: 'uppercase', marginBottom: '4px' }}>{label}</p>
    <h3 style={{ fontSize: '18px', fontWeight: '900' }}>{value}</h3>
  </div>
);

const MenuItem = ({ icon, label, color = '#333', onClick }) => (
  <div 
    onClick={onClick}
    style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '15px', 
      padding: '20px', 
      borderBottom: '1px solid #F5F5F5',
      cursor: 'pointer'
    }}
  >
    <div style={{ color }}>{icon}</div>
    <span style={{ flex: 1, fontWeight: '700', fontSize: '15px', color }}>{label}</span>
    <div style={{ color: '#CCC' }}>
      <ArrowRight />
    </div>
  </div>
);

const ArrowRight = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
);

export default Profile;
