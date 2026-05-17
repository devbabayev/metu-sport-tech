import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, Zap, Star, ChevronRight, ShoppingBag } from 'lucide-react';
import BottomNav from '../../components/layout/BottomNav';
import { supabase } from '../../lib/supabaseClient';

const Rewards = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(data);
      }
    };
    fetchProfile();
  }, []);

  const rewards = [
    { id: 1, name: 'Nike Metcon 9', price: 15000, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', category: 'Ekipman' },
    { id: 2, name: '1 Aylık Spor Salonu Üyeliği', price: 5000, img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400', category: 'Erişim' },
    { id: 3, name: 'Protein Shaker', price: 1200, img: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=400', category: 'Sağlık' },
    { id: 4, name: 'Akıllı Spor Saati', price: 25000, img: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400', category: 'Teknoloji' },
  ];

  return (
    <div style={{ background: '#F8F9FA', minHeight: '100vh', padding: '20px 20px 100px 20px' }}>
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '10px' }}>Mağaza</h1>
        <div style={{ 
          background: 'linear-gradient(135deg, #2D2D2D, #1A1A1A)', 
          padding: '20px', 
          borderRadius: '24px', 
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
        }}>
          <div>
            <p style={{ fontSize: '12px', fontWeight: '800', color: '#888', textTransform: 'uppercase', marginBottom: '5px' }}>Bakiyeniz</p>
            <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#EB8911' }}>{profile?.balance || 0} <span style={{ fontSize: '14px', color: 'white' }}>PUAN</span></h2>
          </div>
          <div style={{ background: 'rgba(235, 137, 17, 0.2)', padding: '12px', borderRadius: '15px' }}>
            <Zap size={24} fill="#EB8911" color="#EB8911" />
          </div>
        </div>
      </header>

      {/* Featured Banner */}
      <div style={{ 
        background: '#EB8911', 
        borderRadius: '24px', 
        padding: '20px', 
        color: 'white',
        marginBottom: '30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ zIndex: 1 }}>
          <h3 style={{ fontWeight: '900', fontSize: '18px', marginBottom: '5px' }}>Hafta Sonu Fırsatı!</h3>
          <p style={{ fontSize: '12px', fontWeight: '700' }}>Tüm teknoloji ürünlerinde %20 indirim</p>
        </div>
        <Star size={60} style={{ position: 'absolute', right: '-10px', opacity: 0.2 }} />
      </div>

      {/* Rewards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        {rewards.map((item) => (
          <motion.div 
            whileHover={{ y: -5 }}
            key={item.id} 
            style={{ 
              background: 'white', 
              borderRadius: '24px', 
              overflow: 'hidden',
              border: '1px solid #EEE',
              boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
            }}
          >
            <div style={{ height: '120px', overflow: 'hidden', position: 'relative' }}>
              <img src={item.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={item.name} />
              <span style={{ 
                position: 'absolute', 
                top: '10px', 
                left: '10px', 
                background: 'white', 
                padding: '4px 8px', 
                borderRadius: '8px', 
                fontSize: '10px', 
                fontWeight: '800',
                color: '#EB8911'
              }}>{item.category}</span>
            </div>
            <div style={{ padding: '15px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '800', marginBottom: '8px', height: '32px', overflow: 'hidden' }}>{item.name}</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '900', fontSize: '14px', color: '#333' }}>{item.price} <span style={{ fontSize: '10px', color: '#999' }}>PUAN</span></span>
                <button style={{ 
                  background: '#F0F0F0', 
                  border: 'none', 
                  width: '30px', 
                  height: '30px', 
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}>
                  <ShoppingBag size={16} color="#EB8911" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default Rewards;
