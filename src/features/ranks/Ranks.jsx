import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, TrendingUp, TrendingDown, Minus, Building2 } from 'lucide-react';
import BottomNav from '../../components/layout/BottomNav';
import { supabase } from '../../lib/supabaseClient';

const Ranks = () => {
  const [activeTab, setActiveTab] = useState('global'); // 'global' or 'local'
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCities = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('cities')
        .select('*')
        .order('total_points', { ascending: false });
      
      if (data) setCities(data);
      setLoading(false);
    };
    fetchCities();
  }, []);

  return (
    <div style={{ background: '#FDFCFD', minHeight: '100vh', padding: '15px 20px 100px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#eee', overflow: 'hidden' }}>
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Nurlan" alt="avatar" />
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

      {/* City List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {cities.map((city, index) => (
          <CityRankCard 
            key={city.id}
            rank={index + 1}
            name={city.name}
            points={city.total_points}
            change={index === 0 ? '+1 rank' : index === 1 ? '0 change' : '-1 rank'}
            trend={index === 0 ? 'up' : index === 1 ? 'neutral' : 'down'}
            img={city.name === 'Istanbul' ? 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=100&h=100&fit=crop' : null}
          />
        ))}
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
        position: 'relative'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
        {/* Rank Circle */}
        <div style={{ 
          width: '45px', 
          height: '45px', 
          borderRadius: '50%', 
          border: `2px solid ${getRankColor(rank)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          fontWeight: '800',
          color: getRankColor(rank),
          fontStyle: 'italic'
        }}>
          #{rank}
        </div>

        {/* City Info */}
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#333' }}>{name}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: '700' }}>
            {trend === 'up' && <TrendingUp size={14} color="#10B981" />}
            {trend === 'down' && <TrendingDown size={14} color="#EF4444" />}
            {trend === 'neutral' && <Minus size={14} color="#666" />}
            <span style={{ color: trend === 'up' ? '#10B981' : trend === 'down' ? '#EF4444' : '#666' }}>
              {change}
            </span>
          </div>
        </div>

        {/* City Icon */}
        <div style={{ 
          width: '55px', 
          height: '55px', 
          borderRadius: '12px', 
          background: '#F5F5F5',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {img ? <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="city" /> : <Building2 size={24} color="#CCC" />}
        </div>
      </div>

      {/* Points & Progress */}
      <div style={{ marginBottom: '5px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: '800', color: '#8B4513', textTransform: 'uppercase' }}>Total Collective Points</span>
          <span style={{ fontSize: '16px', fontWeight: '900', color: '#8B4513' }}>{points.toLocaleString()}</span>
        </div>
        <div style={{ width: '100%', height: '12px', background: '#F0F0F0', borderRadius: '10px', overflow: 'hidden' }}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(30, 100 - rank * 15)}%` }}
            transition={{ duration: 1 }}
            style={{ 
              height: '100%', 
              background: 'linear-gradient(90deg, #F97316, #94216E)',
              borderRadius: '10px'
            }} 
          />
        </div>
      </div>
    </motion.div>
  );
};

export default Ranks;
