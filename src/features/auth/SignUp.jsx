import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Zap, ChevronDown } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cityId, setCityId] = useState('');
  const [cities, setCities] = useState([]);
  const [detecting, setDetecting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCities = async () => {
      const { data, error } = await supabase.from('cities').select('*');
      if (error) {
        console.error("Fetch cities error:", error);
        alert("Veritabanı Hatası: Şehirler yüklenemedi. Lütfen ayarlarınızı kontrol edin.");
      }
      if (data) setCities(data);
    };
    fetchCities();
  }, []);


  const handleDetectCity = () => {
    setDetecting(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          const data = await response.json();
          const cityName = data.city || data.locality;
          
          const foundCity = cities.find(c => c.name.toLowerCase() === cityName.toLowerCase());
          if (foundCity) {
            setCityId(foundCity.id);
          } else {
            alert(`Bulunan "${cityName}" şehri listemizde yok. Lütfen manuel seçin.`);
          }
        } catch (error) {
          console.error("Geocoding error:", error);
          alert("Şehir adı bulunamadı. Lütfen manuel seçin.");
        }
        setDetecting(false);
      }, (error) => {
        alert("Konum izni reddedildi.");
        setDetecting(false);
      });
    }
  };


  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!cityId) return alert("Lütfen şehrinizi seçin!");
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          city_id: cityId,
        }
      }
    });


    if (error) {
      alert("Kayıt Hatası: " + error.message);
    } else {
      // For hackathon: Auto-login after signup
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (signInError) {
        navigate('/login');
      } else {
        navigate('/dashboard');
      }
    }

  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
      {/* Logo Section */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ 
          fontSize: '42px', 
          fontWeight: '900', 
          fontStyle: 'italic',
          color: '#8B4513', // Bronze/Brown color from design
          marginBottom: '5px',
          fontFamily: 'Open Sans'
        }}>MoveUp</h1>
        <p style={{ 
          letterSpacing: '3px', 
          fontSize: '14px', 
          fontWeight: '700', 
          color: '#444',
          textTransform: 'uppercase'
        }}>Şehrin İçin Harekete Geç</p>
      </div>

      <form onSubmit={handleSignUp} style={{ width: '100%' }}>
        <div className="input-group">
          <label className="input-label">Ad Soyad</label>
          <input 
            type="text" 
            className="premium-input" 
            placeholder="Adınızı ve soyadınızı girin"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label className="input-label">E-posta</label>
          <input 
            type="email" 
            className="premium-input" 
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label className="input-label">Şifre</label>
          <input 
            type="password" 
            className="premium-input" 
            placeholder="........"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Detect City Button */}
        <button 
          type="button"
          onClick={handleDetectCity}
          style={{
            width: '100%',
            background: 'white',
            border: '1.5px solid #8B4513',
            borderRadius: '12px',
            padding: '14px',
            color: '#8B4513',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '15px',
            cursor: detecting ? 'wait' : 'pointer'
          }}
        >
          <MapPin size={20} />
          {detecting ? 'Bulunuyor...' : 'Şehrimi Otomatik Bul'}
        </button>

        <p style={{ textAlign: 'center', fontSize: '12px', color: '#666', marginBottom: '10px' }}>
          Veya manuel seçin (örn. İstanbul, Bakü)
        </p>

        {/* City Select Simulation */}
        <div style={{ position: 'relative', marginBottom: '40px' }}>
          <select 
            className="premium-input"
            value={cityId}
            onChange={(e) => setCityId(e.target.value)}
            style={{ appearance: 'none' }}
            required
          >
            <option value="" disabled>Şehrinizi seçin...</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <ChevronDown size={20} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#666' }} />
        </div>


        <button type="submit" className="premium-button">
          Şehir Takımına Katıl <Zap size={20} fill="white" />
        </button>
      </form>

      <p style={{ marginTop: '30px', fontWeight: '600', color: '#444' }}>
        Zaten hesabınız var mı? <span 
          onClick={() => navigate('/login')}
          style={{ color: '#94216E', cursor: 'pointer' }}
        >Giriş Yap</span>
      </p>
    </motion.div>
  );
};

export default SignUp;
