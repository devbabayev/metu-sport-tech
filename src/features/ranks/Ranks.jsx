import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, MapPin, Building2, User } from 'lucide-react';
import BottomNav from '../../components/layout/BottomNav';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

const Ranks = () => {
  const [activeTab, setActiveTab] = useState('global'); // 'global' or 'local'
  const [cities, setCities] = useState([]);
  const [localUsers, setLocalUsers] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      // 1. Fetch Global Cities
      const { data: cityData } = await supabase
        .from('cities')
        .select('*')
        .order('total_points', { ascending: false });
      if (cityData) setCities(cityData);

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*, cities(name)')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setUserProfile(profile);
          // 2. Fetch Local Members
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

  const maxCityPoints = cities.length > 0 ? cities[0].total_points : 1;
  const maxUserPoints = localUsers.length > 0 ? localUsers[0].balance : 1;

  return (
    <div style={{ background: '#FDFCFD', minHeight: '100vh', padding: '15px 20px 100px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div 
          onClick={() => navigate('/profile')}
          style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#eee', overflow: 'hidden', border: '2px solid #EB8911', cursor: 'pointer' }}
        >
          <img src={userProfile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userProfile?.full_name || 'U')}&radius=50&backgroundType=gradientLinear&backgroundRotation=45&backgroundColor=eb8911,94216e`} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '900', fontStyle: 'italic', color: '#8B4513' }}>MoveUp</h2>
        <div style={{ width: '40px' }} />
      </div>

      {/* Custom Tabs */}
      <div style={{ display: 'flex', background: '#F1F1F1', padding: '5px', borderRadius: '12px', marginBottom: '30px' }}>
        <button 
          onClick={() => setActiveTab('global')}
          style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: activeTab === 'global' ? 'white' : 'transparent', color: activeTab === 'global' ? '#8B4513' : '#888', fontWeight: '800', fontSize: '14px', boxShadow: activeTab === 'global' ? '0 4px 10px rgba(0,0,0,0.05)' : 'none' }}
        >
          Genel Şehir Sıralaması
        </button>
        <button 
          onClick={() => setActiveTab('local')}
          style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: activeTab === 'local' ? 'white' : 'transparent', color: activeTab === 'local' ? '#8B4513' : '#888', fontWeight: '800', fontSize: '14px', boxShadow: activeTab === 'local' ? '0 4px 10px rgba(0,0,0,0.05)' : 'none' }}
        >
          Şehir İçi Üyeler
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {activeTab === 'global' ? (
          cities.map((city, index) => (
            <CityRankCard 
              key={city.id}
              rank={index + 1}
              name={city.name}
              points={city.total_points}
              maxPoints={maxCityPoints}
              isUserCity={city.id === userProfile?.city_id}
            />
          ))
        ) : (
          localUsers.map((member, index) => (
            <MemberRankCard 
              key={member.id}
              rank={index + 1}
              name={member.full_name}
              points={member.balance}
              maxPoints={maxUserPoints}
              isCurrentUser={member.id === userProfile?.id}
              avatar={member.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.full_name || 'U')}&radius=50&backgroundType=gradientLinear&backgroundRotation=45&backgroundColor=eb8911,94216e`}
            />
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
};

const CityRankCard = ({ rank, name, points, maxPoints, isUserCity }) => {
  const getRankColor = (r) => {
    if (r === 1) return '#EAB308';
    if (r === 2) return '#94A3B8';
    if (r === 3) return '#D97706';
    return '#CCC';
  };

  const progressPercent = Math.max(5, (points / (maxPoints || 1)) * 100);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'white', borderRadius: '24px', padding: '20px', border: isUserCity ? '2px solid #EB8911' : '1px solid #F0F0F0', boxShadow: '0 8px 20px rgba(0,0,0,0.03)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
        <div style={{ width: '45px', height: '45px', borderRadius: '50%', border: `2px solid ${getRankColor(rank)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '800', color: getRankColor(rank), fontStyle: 'italic' }}>
          #{rank}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#333' }}>{name} {isUserCity && '🏠'}</h3>
          <p style={{ fontSize: '12px', fontWeight: '700', color: '#999' }}>Aktif Şehir Takımı</p>
        </div>
        <div style={{ width: '55px', height: '55px', borderRadius: '12px', background: '#FDFCFD', border: '1px solid #EEE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
          🏙️
        </div>
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#8B4513', textTransform: 'uppercase' }}>Toplam Kolektif Puan</span>
          <span style={{ fontSize: '16px', fontWeight: '900', color: '#8B4513' }}>{points.toLocaleString()}</span>
        </div>
        <div style={{ width: '100%', height: '10px', background: '#F0F0F0', borderRadius: '10px', overflow: 'hidden' }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} style={{ height: '100%', background: 'linear-gradient(90deg, #F97316, #94216E)', borderRadius: '10px' }} />
        </div>
      </div>
    </motion.div>
  );
};

const MemberRankCard = ({ rank, name, points, maxPoints, isCurrentUser, avatar }) => {
  const progressPercent = Math.max(5, (points / (maxPoints || 1)) * 100);
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} style={{ background: 'white', padding: '20px', borderRadius: '24px', border: isCurrentUser ? '2px solid #EB8911' : '1px solid #EEE', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <span style={{ fontWeight: '900', color: rank <= 3 ? '#EB8911' : '#AAA', width: '25px', fontStyle: 'italic' }}>#{rank}</span>
        <div style={{ width: '45px', height: '45px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #F5F5F5' }}>
          <img src={avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={name} />
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontWeight: '800', fontSize: '16px' }}>{name} {isCurrentUser && '(Sen)'}</h4>
          <span style={{ fontSize: '14px', fontWeight: '900', color: '#EB8911' }}>{points.toLocaleString()} PUAN</span>
        </div>
      </div>
      <div style={{ width: '100%', height: '6px', background: '#F0F0F0', borderRadius: '10px', overflow: 'hidden' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} style={{ height: '100%', background: '#EB8911', borderRadius: '10px' }} />
      </div>
    </motion.div>
  );
};

export default Ranks;
