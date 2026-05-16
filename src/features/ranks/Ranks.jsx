import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, TrendingUp, TrendingDown, Minus, User, MapPin } from 'lucide-react';
import BottomNav from '../../components/layout/BottomNav';
import { supabase } from '../../lib/supabaseClient';

const Ranks = () => {
  const [activeTab, setActiveTab] = useState('global'); // 'global' or 'local'
  const [cities, setCities] = useState([]);
  const [localUsers, setLocalUsers] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // 1. Fetch Global Cities
      const { data: cityData } = await supabase
        .from('cities')
        .select('*')
        .order('total_points', { ascending: false });
      if (cityData) setCities(cityData);

      // 2. Fetch Current User's Profile & Local Members
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*, cities(name)')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setUserProfile(profile);
          // Fetch members of the SAME city
          const { data: localData } = await supabase
            .from('profiles')
            .select('*')
            .eq('city_id', profile.city_id)
            .order('balance', { ascending: false })
            .limit(10);
          if (localData) setLocalUsers(localData);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div style={{ background: '#FDFCFD', minHeight: '100vh', padding: '15px 20px 100px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#eee', overflow: 'hidden', border: '2px solid #EB8911' }}>
          <img src={userProfile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile?.full_name}`} alt="avatar" />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '900', fontStyle: 'italic', color: '#8B4513' }}>MoveUp</h2>
        <Bell size={24} color="#333" />
      </div>

      {/* Custom Tabs */}
      <div style={{ 
        display: 'flex', 
        background: '#F1F1F1', 
        padding: '5px', 
        borderRadius: '12px', 
        marginBottom: '30px' 
      }}>
        <button 
          onClick={() => setActiveTab('global')}
          style={{ 
            flex: 1, 
            padding: '12px', 
            borderRadius: '10px', 
            border: 'none',
            background: activeTab === 'global' ? 'white' : 'transparent',
            color: activeTab === 'global' ? '#8B4513' : '#888',
            fontWeight: '800',
            fontSize: '14px',
            boxShadow: activeTab === 'global' ? '0 4px 10px rgba(0,0,0,0.05)' : 'none'
          }}
        >
          Global City Rank
        </button>
        <button 
          onClick={() => setActiveTab('local')}
          style={{ 
            flex: 1, 
            padding: '12px', 
            borderRadius: '10px', 
            border: 'none',
            background: activeTab === 'local' ? 'white' : 'transparent',
            color: activeTab === 'local' ? '#8B4513' : '#888',
            fontWeight: '800',
            fontSize: '14px',
            boxShadow: activeTab === 'local' ? '0 4px 10px rgba(0,0,0,0.05)' : 'none'
          }}
        >
          Local Top Members
        </button>
      </div>

      {/* Conditional Rendering based on Tab */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {activeTab === 'global' ? (
          cities.map((city, index) => (
            <CityRankCard 
              key={city.id}
              rank={index + 1}
              name={city.name}
              points={city.total_points}
              change={index === 0 ? '+1 rank' : index === 1 ? '0 change' : '-1 rank'}
              trend={index === 0 ? 'up' : index === 1 ? 'neutral' : 'down'}
              img={city.name === 'Istanbul' ? 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=100&h=100&fit=crop' : null}
            />
          ))
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
             <h4 style={{ fontWeight: '800', color: '#888', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Top Athletes in {userProfile?.cities?.name || 'Your City'}
             </h4>
             {localUsers.map((member, index) => (
               <MemberRankCard 
                 key={member.id}
                 rank={index + 1}
                 name={member.full_name}
                 points={member.balance}
                 avatar={member.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.full_name}`}
               />
             ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

const CityRankCard = ({ rank, name, points, change, trend, img }) => {
  const getRankColor = (r) => {
    if (r === 1) return '#EAB308';
    if (r === 2) return '#94A3B8';
    if (r === 3) return '#D97706';
    return '#CCC';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ 
        background: 'white', 
        borderRadius: '24px', 
        padding: '20px', 
        border: '1px solid #F0F0F0',
        boxShadow: '0 8px 20px rgba(0,0,0,0.03)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
        <div style={{ 
          width: '45px', height: '45px', borderRadius: '50%', border: `2px solid ${getRankColor(rank)}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '800', color: getRankColor(rank), fontStyle: 'italic'
        }}>
          #{rank}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#333' }}>{name}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: '700' }}>
            {trend === 'up' && <TrendingUp size={14} color="#10B981" />}
            {trend === 'down' && <TrendingDown size={14} color="#EF4444" />}
            {trend === 'neutral' && <Minus size={14} color="#666" />}
            <span style={{ color: trend === 'up' ? '#10B981' : trend === 'down' ? '#EF4444' : '#666' }}>{change}</span>
          </div>
        </div>
        <div style={{ width: '55px', height: '55px', borderRadius: '12px', background: '#F5F5F5', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {img ? <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="city" /> : <div style={{ fontSize: '24px' }}>🏙️</div>}
        </div>
      </div>
      <div style={{ marginBottom: '5px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#8B4513', textTransform: 'uppercase' }}>Total Collective Points</span>
          <span style={{ fontSize: '16px', fontWeight: '900', color: '#8B4513' }}>{points.toLocaleString()}</span>
        </div>
        <div style={{ width: '100%', height: '10px', background: '#F0F0F0', borderRadius: '10px', overflow: 'hidden' }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(20, 100 - rank * 15)}%` }} style={{ height: '100%', background: 'linear-gradient(90deg, #F97316, #94216E)', borderRadius: '10px' }} />
        </div>
      </div>
    </motion.div>
  );
};

const MemberRankCard = ({ rank, name, points, avatar }) => (
  <motion.div 
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    style={{ 
      background: 'white', 
      padding: '15px 20px', 
      borderRadius: '20px', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '15px',
      border: '1px solid #EEE'
    }}
  >
    <span style={{ fontWeight: '900', color: rank <= 3 ? '#EB8911' : '#AAA', width: '25px', fontStyle: 'italic' }}>#{rank}</span>
    <div style={{ width: '45px', height: '45px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #F5F5F5' }}>
      <img src={avatar} style={{ width: '100%' }} alt={name} />
    </div>
    <div style={{ flex: 1 }}>
      <h4 style={{ fontWeight: '800', fontSize: '16px' }}>{name}</h4>
      <p style={{ fontSize: '11px', color: '#999', fontWeight: '700' }}>Active Member</p>
    </div>
    <div style={{ textAlign: 'right' }}>
      <span style={{ fontWeight: '900', color: '#EB8911', fontSize: '16px' }}>{points.toLocaleString()}</span>
      <p style={{ fontSize: '10px', fontWeight: '800', color: '#CCC' }}>PTS</p>
    </div>
  </motion.div>
);

export default Ranks;
