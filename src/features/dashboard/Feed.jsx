import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Zap, Camera, Lock, MapPin } from 'lucide-react';
import BottomNav from '../../components/layout/BottomNav';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

const Feed = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*, cities(name)')
          .eq('id', user.id)
          .single();
        
        if (data) setProfile(data);
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontWeight: 'bold' }}>Loading...</div>;

  return (
    <div style={{ background: '#F8F9FA', minHeight: '100vh', padding: '15px 20px 100px 20px' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ 
            width: '45px', 
            height: '45px', 
            borderRadius: '50%', 
            border: '2px solid #EB8911',
            overflow: 'hidden'
          }}>
            <img src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.full_name}`} style={{ width: '100%' }} alt="avatar" />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '900', fontStyle: 'italic', color: '#8B4513', lineHeight: '1.1' }}>MoveUp</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '700', color: '#10B981' }}>
              <MapPin size={12} fill="#10B981" /> {profile?.cities?.name || 'Baku'} Team
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontWeight: '800', color: '#EB8911', fontSize: '16px' }}>{profile?.balance || 0} pts</span>
          <Bell size={24} color="#333" />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '5px' }}>Ready for action, {profile?.full_name?.split(' ')[0] || 'User'}?</h1>
        <p style={{ color: '#666', fontSize: '15px', marginBottom: '25px' }}>Your momentum is peaking today.</p>

        {/* AI Daily Mission Card */}
        <div style={{ 
          background: '#2D2D2D', 
          borderRadius: '24px', 
          padding: '24px', 
          color: 'white',
          marginBottom: '25px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
             <span style={{ background: '#EB8911', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase' }}>Active Mission</span>
             <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '12px' }}>
               <span style={{ fontSize: '20px' }}>🤖</span>
             </div>
          </div>
          <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '5px' }}>🤖 AI Daily Mission</h3>
          <p style={{ fontSize: '15px', color: '#FF69B4', fontWeight: '700' }}>(Earn 2x City Points)</p>
        </div>

        {/* Quest List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
          {/* Cardio Card */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '24px', border: '1px solid #EEE', display: 'flex', alignItems: 'center', gap: '15px' }}>
             <div style={{ fontSize: '28px' }}>🏃</div>
             <div style={{ flex: 1 }}>
               <h4 style={{ fontWeight: '800', fontSize: '14px', color: '#333' }}>Cardio: 5,000 Steps Tracker</h4>
               <p style={{ fontSize: '12px', color: '#888', fontWeight: '600' }}>3,000 / 5,000 steps</p>
               <div style={{ width: '100%', height: '10px', background: '#F0F0F0', borderRadius: '10px', marginTop: '10px', overflow: 'hidden' }}>
                 <div style={{ width: '60%', height: '100%', background: 'linear-gradient(90deg, #F97316, #EC4899)', borderRadius: '10px' }} />
               </div>
             </div>
             <span style={{ fontWeight: '800', color: '#F97316' }}>60%</span>
          </div>

          {/* Strength Card */}
          <div style={{ 
            background: 'white', 
            padding: '20px', 
            borderRadius: '24px', 
            border: '2px solid #EB8911', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '15px' 
          }}>
             <div style={{ fontSize: '28px' }}>💪</div>
             <div style={{ flex: 1 }}>
               <h4 style={{ fontWeight: '800', fontSize: '14px', color: '#333' }}>Strength: 20 Push-Ups</h4>
               <p style={{ fontSize: '12px', color: '#888', fontWeight: '600' }}>Status: <span style={{ color: '#8B4513' }}>Ready via AI Cam</span></p>
             </div>
             <button 
               onClick={() => navigate('/move')}
               style={{ 
                background: '#8B4513', 
                color: 'white', 
                border: 'none', 
                width: '50px', 
                height: '50px', 
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(139, 69, 19, 0.3)',
                cursor: 'pointer'
              }}>
                <Camera size={24} />
             </button>
          </div>

          {/* Core Card (Locked) */}
          <div style={{ background: '#F5F5F5', padding: '20px', borderRadius: '24px', border: '1px solid #EEE', display: 'flex', alignItems: 'center', gap: '15px', opacity: 0.6 }}>
             <div style={{ fontSize: '28px', filter: 'grayscale(1)' }}>🧗</div>
             <div style={{ flex: 1 }}>
               <h4 style={{ fontWeight: '800', fontSize: '14px', color: '#888' }}>Core: 10 Pull-Ups</h4>
               <p style={{ fontSize: '12px', color: '#AAA', fontWeight: '600' }}>Status: Locked</p>
             </div>
             <Lock size={20} color="#AAA" />
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '35px' }}>
          <div style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '20px', border: '1px solid #EEE', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', fontWeight: '800', color: '#999', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Current Streak</p>
            <h3 style={{ fontSize: '26px', fontWeight: '900', fontStyle: 'italic' }}>12 <span style={{ fontSize: '14px', fontStyle: 'normal', color: '#666' }}>DAYS</span></h3>
          </div>
          <div style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '20px', border: '1px solid #EEE', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', fontWeight: '800', color: '#999', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Global Rank</p>
            <h3 style={{ fontSize: '26px', fontWeight: '900', fontStyle: 'italic' }}>#42 <span style={{ fontSize: '14px', fontStyle: 'normal', color: '#10B981' }}>↑ 3</span></h3>
          </div>
        </div>

        {/* Team Activity Section */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#333', textTransform: 'uppercase' }}>Team Activity</h3>
            <span style={{ fontSize: '13px', color: '#94216E', fontWeight: '800', cursor: 'pointer' }}>See All</span>
          </div>
          <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px' }}>
            <ActivityCard name="Yusif M." action="5KM RUN COMPLETE" img="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&h=600&fit=crop" />
            <ActivityCard name="Ayla S." action="PR REACHED" img="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=600&fit=crop" />
            <ActivityCard name="Team Baku" action="12 ACTIVE NOW" img="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=600&fit=crop" />
          </div>
        </div>
      </motion.div>

      <BottomNav />
    </div>
  );
};

const ActivityCard = ({ name, action, img }) => (
  <div style={{ 
    minWidth: '150px', 
    height: '210px', 
    borderRadius: '24px', 
    position: 'relative',
    overflow: 'hidden',
    flexShrink: 0,
    background: '#333'
  }}>
    <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} alt={name} />
    <div style={{ 
      position: 'absolute', 
      bottom: '0', 
      left: '0', 
      right: '0', 
      padding: '20px', 
      background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' 
    }}>
      <h5 style={{ color: 'white', fontWeight: '800', fontSize: '14px', marginBottom: '2px' }}>{name}</h5>
      <p style={{ color: '#EB8911', fontWeight: '800', fontSize: '10px', textTransform: 'uppercase' }}>{action}</p>
    </div>
  </div>
);

export default Feed;
