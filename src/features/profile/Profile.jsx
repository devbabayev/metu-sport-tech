import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, LogOut, Award, Zap, MapPin, ChevronRight } from 'lucide-react';
import BottomNav from '../../components/layout/BottomNav';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*, cities(name)')
          .eq('id', user.id)
          .single();
        if (profileData) setProfile(profileData);
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontWeight: 'bold' }}>Loading...</div>;

  return (
    <div style={{ background: '#FDFCFD', minHeight: '100vh', padding: '15px 20px 100px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '900', fontStyle: 'italic', color: '#8B4513' }}>My Profile</h2>
        <button style={{ background: 'none', border: 'none', color: '#333' }}><Settings size={24} /></button>
      </div>

      {/* Profile Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ 
          background: 'linear-gradient(135deg, #2D2D2D, #1A1A1A)', 
          borderRadius: '30px', 
          padding: '30px', 
          color: 'white', 
          marginBottom: '30px',
          boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ 
            width: '80px', height: '80px', borderRadius: '25px', border: '3px solid #EB8911', overflow: 'hidden', background: 'white'
          }}>
            <img src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.full_name}`} style={{ width: '100%' }} alt="avatar" />
          </div>
          <div>
            <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '4px' }}>{profile?.full_name || 'User'}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10B981', fontSize: '13px', fontWeight: '800' }}>
              <MapPin size={14} fill="#10B981" /> {profile?.cities?.name || 'Local'} Team
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', marginTop: '25px', position: 'relative', zIndex: 1 }}>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '15px', textAlign: 'center' }}>
            <p style={{ fontSize: '10px', color: '#AAA', fontWeight: '800', textTransform: 'uppercase', marginBottom: '5px' }}>Balance</p>
            <p style={{ fontSize: '18px', fontWeight: '900', color: '#EB8911' }}>{profile?.balance || 0} pts</p>
          </div>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '15px', textAlign: 'center' }}>
            <p style={{ fontSize: '10px', color: '#AAA', fontWeight: '800', textTransform: 'uppercase', marginBottom: '5px' }}>Level</p>
            <p style={{ fontSize: '18px', fontWeight: '900', color: '#10B981' }}>Lvl {profile?.level || 1}</p>
          </div>
        </div>

        <Zap size={120} style={{ position: 'absolute', right: '-30px', bottom: '-20px', opacity: 0.1, color: '#EB8911' }} />
      </motion.div>

      {/* Menu Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <ProfileMenuItem icon={<Award color="#EB8911" />} label="My Achievements" subLabel="12 Badges unlocked" />
        <ProfileMenuItem icon={<Zap color="#10B981" />} label="Training History" subLabel="View past workouts" />
        <ProfileMenuItem 
          icon={<LogOut color="#EF4444" />} 
          label="Sign Out" 
          subLabel="Securely log out" 
          onClick={handleSignOut}
          isDanger
        />
      </div>

      <BottomNav />
    </div>
  );
};

const ProfileMenuItem = ({ icon, label, subLabel, onClick, isDanger }) => (
  <button 
    onClick={onClick}
    style={{ 
      display: 'flex', alignItems: 'center', gap: '15px', background: 'white', padding: '18px', borderRadius: '20px', border: '1px solid #F0F0F0', cursor: 'pointer', textAlign: 'left', width: '100%',
      boxShadow: '0 4px 10px rgba(0,0,0,0.02)'
    }}
  >
    <div style={{ width: '45px', height: '45px', background: isDanger ? '#FEF2F2' : '#F9FAFB', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <h4 style={{ fontSize: '15px', fontWeight: '800', color: isDanger ? '#EF4444' : '#333' }}>{label}</h4>
      <p style={{ fontSize: '12px', color: '#AAA', fontWeight: '600' }}>{subLabel}</p>
    </div>
    <ChevronRight size={18} color="#CCC" />
  </button>
);

export default Profile;
