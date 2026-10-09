import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Zap, ChevronDown } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_CITIES, findMatchingCity, groupCitiesByCountry } from '../../data/citiesData';

const SignUp = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cityId, setCityId] = useState('');
  const [cities, setCities] = useState(DEFAULT_CITIES);
  const [detecting, setDetecting] = useState(false);
  const [detectMessage, setDetectMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchCities = async () => {
      try {
        const { data, error } = await supabase.from('cities').select('*');
        if (error) {
          console.warn("Supabase'den şehirler çekilemedi, varsayılan liste kullanılıyor:", error.message);
          return;
        }
        if (data && data.length > 0 && isMounted) {
          // Merge custom database cities with existing default metadata if available
          setCities(data);
        }
      } catch (err) {
        console.warn("Şehirler yüklenirken bağlantı hatası:", err);
      }
    };

    fetchCities();
    return () => { isMounted = false; };
  }, []);

  const groupedCities = useMemo(() => {
    return groupCitiesByCountry(cities);
  }, [cities]);

  const handleDetectCity = () => {
    setDetecting(true);
    setDetectMessage('');

    if (!("geolocation" in navigator)) {
      alert("Cihazınız veya tarayıcınız konum servisini desteklemiyor.");
      setDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await response.json();
          const detectedCityName = data.city || data.principalSubdivision || data.locality || '';
          
          const foundCity = findMatchingCity(detectedCityName, cities);
          if (foundCity) {
            setCityId(foundCity.id);
            setDetectMessage(`📍 Bulunan şehir: ${foundCity.name} ${foundCity.flag || ''}`);
          } else {
            alert(`Bulunan "${detectedCityName || 'Konum'}" şehri listemizde doğrudan eşleşmedi. Lütfen listeden seçin.`);
          }
        } catch (error) {
          console.error("Geocoding hatası:", error);
          alert("Şehir konumu tespit edilemedi. Lütfen listeden manuel seçin.");
        } finally {
          setDetecting(false);
        }
      },
      (error) => {
        console.warn("Konum izni hatası:", error);
        alert("Konum izni alınamadı veya reddedildi. Lütfen şehrinizi manuel seçin.");
        setDetecting(false);
      },
      { timeout: 10000 }
    );
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!cityId) return alert("Lütfen şehrinizi seçin!");

    const selectedCity = cities.find(c => String(c.id) === String(cityId)) || DEFAULT_CITIES.find(c => String(c.id) === String(cityId));

    try {
      const { error } = await supabase.auth.signUp({
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
        // Fallback for offline/demo environment when Supabase server is not configured or offline
        if (
          error.message?.includes('fetch') ||
          error.message?.includes('network') ||
          error.message?.includes('Failed')
        ) {
          console.warn("Supabase çevrimdışı, yerel profil oturumu başlatılıyor:", error.message);
          createLocalSession(selectedCity);
          return;
        }
        alert("Kayıt Hatası: " + error.message);
      } else {
        // Auto-login after signup
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
    } catch (err) {
      console.warn("Kayıt sırasında ağ hatası, demo profili oluşturuluyor:", err);
      createLocalSession(selectedCity);
    }
  };

  const createLocalSession = (cityObj) => {
    const demoProfile = {
      id: 'user_' + Date.now(),
      full_name: fullName,
      city_id: cityId,
      balance: 150,
      level: 1,
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}&radius=50&backgroundType=gradientLinear&backgroundRotation=45&backgroundColor=eb8911,94216e`,
      cities: {
        id: cityId,
        name: cityObj?.name || 'Bakı'
      }
    };
    localStorage.setItem('moveup_local_profile', JSON.stringify(demoProfile));
    localStorage.setItem('moveup_local_user', JSON.stringify({ id: demoProfile.id, email }));
    navigate('/dashboard');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
      {/* Logo Section */}
      <div style={{ textAlign: 'center', marginBottom: '35px' }}>
        <h1 style={{ 
          fontSize: '42px', 
          fontWeight: '900', 
          fontStyle: 'italic',
          color: '#8B4513',
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
            marginBottom: '8px',
            cursor: detecting ? 'wait' : 'pointer'
          }}
        >
          <MapPin size={20} />
          {detecting ? 'Konum Algılanıyor...' : 'Şehrimi Otomatik Bul'}
        </button>

        {detectMessage && (
          <p style={{ textAlign: 'center', fontSize: '13px', color: '#10B981', fontWeight: '700', marginBottom: '8px' }}>
            {detectMessage}
          </p>
        )}

        <p style={{ textAlign: 'center', fontSize: '12px', color: '#666', marginBottom: '8px' }}>
          Veya listeden şehrinizi seçin
        </p>

        {/* City Select Dropdown */}
        <div style={{ position: 'relative', marginBottom: '35px' }}>
          <select 
            className="premium-input"
            value={cityId}
            onChange={(e) => {
              setCityId(e.target.value);
              setDetectMessage('');
            }}
            style={{ 
              appearance: 'none',
              cursor: 'pointer',
              color: cityId ? '#222' : '#666',
              fontWeight: cityId ? '600' : '400',
              paddingRight: '40px'
            }}
            required
          >
            <option value="" disabled>Şehrinizi seçin...</option>
            {groupedCities.azerbaijan.length > 0 && (
              <optgroup label="🇦🇿 Azerbaycan">
                {groupedCities.azerbaijan.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </optgroup>
            )}
            {groupedCities.turkey.length > 0 && (
              <optgroup label="🇹🇷 Türkiye">
                {groupedCities.turkey.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </optgroup>
            )}
            {groupedCities.others.length > 0 && (
              <optgroup label="Diğer Şehirler">
                {groupedCities.others.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </optgroup>
            )}
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
