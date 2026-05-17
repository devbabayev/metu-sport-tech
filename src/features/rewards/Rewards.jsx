import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Zap, Star, ChevronRight, ShoppingBag, Coins, ArrowRight, CheckCircle, X } from 'lucide-react';
import BottomNav from '../../components/layout/BottomNav';
import { supabase } from '../../lib/supabaseClient';

const Rewards = () => {
  const [profile, setProfile] = useState(null);
  const [isCryptoModalOpen, setIsCryptoModalOpen] = useState(false);
  const [cryptoAmount, setCryptoAmount] = useState('');
  const [conversionSuccess, setConversionSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleCryptoConversion = async () => {
    const points = Number(cryptoAmount);
    if (!points || points < 100 || points % 100 !== 0) {
      alert("Lütfen 100-ün qatları olan düzgün bir məbləğ daxil edin!");
      return;
    }
    if (points > (profile?.balance || 0)) {
      alert("Kifayət qədər xalınız yoxdur!");
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Subtract points using increment_balance RPC with negative points
      const { error } = await supabase.rpc('increment_balance', { 
        user_id: user.id, 
        amount: -points 
      });

      if (!error) {
        // Update profile state locally
        setProfile(prev => ({ ...prev, balance: prev.balance - points }));
        setConversionSuccess(true);
      } else {
        alert("Dönüşüm xətası: " + error.message);
      }
    }
    setLoading(false);
  };

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
          boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <div>
            <p style={{ fontSize: '12px', fontWeight: '800', color: '#888', textTransform: 'uppercase', marginBottom: '5px' }}>Bakiyeniz</p>
            <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#EB8911' }}>{profile?.balance || 0} <span style={{ fontSize: '14px', color: 'white' }}>PUAN</span></h2>
          </div>
          <div style={{ background: 'rgba(235, 137, 17, 0.2)', padding: '12px', borderRadius: '15px' }}>
            <Zap size={24} fill="#EB8911" color="#EB8911" />
          </div>
        </div>

        {/* Crypto Conversion Card */}
        <div 
          onClick={() => setIsCryptoModalOpen(true)}
          style={{ 
            background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)', 
            borderRadius: '24px', 
            padding: '20px', 
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 10px 25px rgba(6, 182, 212, 0.25)',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ zIndex: 1 }}>
            <h3 style={{ fontWeight: '900', fontSize: '18px', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Puanları Kriptoya Çevir 🪙
            </h3>
            <p style={{ fontSize: '12px', fontWeight: '700', color: '#E0F7FA' }}>
              100 PUAN = 1 $MOVE Token. Hemen dönüştür!
            </p>
          </div>
          <Coins size={48} style={{ opacity: 0.2, position: 'absolute', right: '15px', top: '15px' }} />
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

      {/* Crypto Bottom Sheet Modal */}
      <AnimatePresence>
        {isCryptoModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              zIndex: 100,
              backdropFilter: 'blur(5px)'
            }}
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 20 }}
              style={{
                width: '100%',
                maxWidth: '480px',
                background: 'white',
                borderTopLeftRadius: '30px',
                borderTopRightRadius: '30px',
                padding: '30px 24px 40px 24px',
                color: '#333',
                boxShadow: '0 -10px 25px rgba(0,0,0,0.1)',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#8B4513' }}>Kriptoya Dönüştür</h3>
                <button 
                  onClick={() => {
                    setIsCryptoModalOpen(false);
                    setConversionSuccess(false);
                    setCryptoAmount('');
                  }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}
                >
                  <X size={24} />
                </button>
              </div>

              {!conversionSuccess ? (
                <div>
                  <p style={{ fontSize: '13px', color: '#666', marginBottom: '20px', fontWeight: '600', lineHeight: '1.4' }}>
                    MoveUp puanlarınızı anında <strong>$MOVE Token</strong>-ə çevirin və Web3 cüzdanınıza köçürün.
                  </p>

                  <div style={{ background: '#F8F9FA', padding: '15px', borderRadius: '15px', marginBottom: '20px', border: '1px solid #EEE' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px', fontWeight: '800', color: '#888' }}>
                      <span>Cari Məzənnə</span>
                      <span>Mövcud Balans</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '900' }}>
                      <span style={{ color: '#06B6D4' }}>100 Puan = 1 $MOVE</span>
                      <span style={{ color: '#EB8911' }}>{profile?.balance || 0} PUAN</span>
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Çevriləcək Puan Mqdarı</label>
                    <input 
                      type="number" 
                      className="premium-input" 
                      placeholder="Məsələn: 500"
                      value={cryptoAmount}
                      onChange={(e) => setCryptoAmount(e.target.value)}
                      min="100"
                      step="100"
                    />
                    <span style={{ fontSize: '11px', color: '#888', marginTop: '6px', display: 'block', fontWeight: '600' }}>
                      Qeyd: Minimum çevrilmə məbləği 100 puandır (100-ün qatları olmalıdır).
                    </span>
                  </div>

                  <div style={{ margin: '20px 0', textAlign: 'center', fontSize: '18px', fontWeight: '900', color: '#4F46E5' }}>
                    Alacağınız: {cryptoAmount ? Math.floor(Number(cryptoAmount) / 100) : 0} $MOVE 🪙
                  </div>

                  <button 
                    onClick={handleCryptoConversion}
                    className="premium-button"
                    style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)', boxShadow: '0 4px 15px rgba(6, 182, 212, 0.3)' }}
                    disabled={loading}
                  >
                    {loading ? 'Dönüşdürülür...' : 'Dönüşümü Təsdiqlə'} <ArrowRight size={20} />
                  </button>
                </div>
              ) : (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  style={{ textAlign: 'center', padding: '20px 0' }}
                >
                  <div style={{ background: '#E6FBF7', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', color: '#10B981' }}>
                    <CheckCircle size={48} />
                  </div>
                  <h4 style={{ fontSize: '22px', fontWeight: '900', color: '#10B981', marginBottom: '10px' }}>Uğurlu Dönüşüm!</h4>
                  <p style={{ fontSize: '14px', color: '#666', fontWeight: '600', marginBottom: '25px', lineHeight: '1.4' }}>
                    Puanlarınız uğurla kriptovalyutaya çevrildi. <br />
                    <strong>{Math.floor(Number(cryptoAmount) / 100)} $MOVE</strong> cüzdanınıza göndərildi.
                  </p>
                  <button 
                    onClick={() => {
                      setIsCryptoModalOpen(false);
                      setConversionSuccess(false);
                      setCryptoAmount('');
                    }}
                    className="premium-button"
                    style={{ background: '#333', boxShadow: 'none' }}
                  >
                    Bağla
                  </button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Rewards;
