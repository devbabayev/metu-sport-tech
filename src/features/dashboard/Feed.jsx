import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Zap, Camera, Lock, MapPin, Plus } from 'lucide-react';
import BottomNav from '../../components/layout/BottomNav';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

const Feed = () => {
  const [profile, setProfile] = useState(null);
  const [missions, setMissions] = useState([]);
  const [userRank, setUserRank] = useState('--');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // 1. Fetch Profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*, cities(name)')
          .eq('id', user.id)
          .single();
        if (profileData) setProfile(profileData);

        // 2. Fetch All Missions & User Progress
        const { data: missionData } = await supabase.from('missions').select('*').order('created_at', { ascending: true });
        const { data: progressData } = await supabase
          .from('user_missions')
          .select('*')
          .eq('user_id', user.id);

        const mergedMissions = missionData.map(m => {
          const prog = progressData?.find(p => p.mission_id === m.id);
          return {
            ...m,
            current_value: prog?.current_value || 0,
            is_completed: prog?.is_completed || false
          };
        });
        setMissions(mergedMissions);

        // 3. Calculate Real Rank (based on balance)
        const { count } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .gt('balance', profileData?.balance || 0);
        setUserRank((count || 0) + 1);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const updateProgress = async (missionId, increment) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !profile) return;

    const mission = missions.find(m => m.id === missionId);
    const newValue = mission.current_value + increment;
    const isCompleted = newValue >= mission.target_value;

    const { error } = await supabase
      .from('user_missions')
      .upsert({
        user_id: user.id,
        mission_id: missionId,
        current_value: newValue,
        is_completed: isCompleted,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,mission_id' });

    if (!error) {
      setMissions(prev => prev.map(m => 
        m.id === missionId ? { ...m, current_value: newValue, is_completed: isCompleted } : m
      ));

      if (isCompleted && !mission.is_completed) {
         // Real update in DB
         await supabase.rpc('increment_balance', { user_id: user.id, amount: mission.points });
         await supabase.rpc('increment_city_points', { city_id: profile.city_id, amount: mission.points });
         
         // Update local profile balance too
         setProfile(prev => ({ ...prev, balance: prev.balance + mission.points }));
      }
    }
  };

  const [isTracking, setIsTracking] = useState(false);
  const [sessionSteps, setSessionSteps] = useState(0);

  useEffect(() => {
    let lastStepTime = 0;
    const stepThreshold = 12; // Adjust sensitivity
    const stepCooldown = 350; // ms between steps

    const handleMotion = (event) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;

      const magnitude = Math.sqrt(acc.x ** 2 + acc.y ** 2 + acc.z ** 2);
      const now = Date.now();

      if (magnitude > stepThreshold && now - lastStepTime > stepCooldown) {
        lastStepTime = now;
        setSessionSteps(prev => prev + 1);
        
        // Find the cardio mission and update it
        const cardioMission = missions.find(m => m.category === 'cardio');
        if (cardioMission) {
          updateProgress(cardioMission.id, 1);
        }
      }
    };

    if (isTracking) {
      window.addEventListener('devicemotion', handleMotion);
    }

    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [isTracking, missions]);

  const requestPermission = async () => {
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
      const permission = await DeviceMotionEvent.requestPermission();
      if (permission === 'granted') {
        setIsTracking(true);
      }
    } else {
      // Non-iOS or older devices
      setIsTracking(true);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontWeight: 'bold' }}>Loading...</div>;

  return (
    <div style={{ background: '#F8F9FA', minHeight: '100vh', padding: '15px 20px 100px 20px' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ 
            width: '45px', height: '45px', borderRadius: '50%', border: '2px solid #EB8911', overflow: 'hidden'
          }}>
            <img src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.full_name}`} style={{ width: '100%' }} alt="avatar" />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '900', fontStyle: 'italic', color: '#8B4513', lineHeight: '1.1' }}>MoveUp</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '700', color: '#10B981' }}>
              <MapPin size={12} fill="#10B981" /> {profile?.cities?.name || 'Local'} Team
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontWeight: '800', color: '#EB8911', fontSize: '16px' }}>{profile?.balance || 0} pts</span>
          <Bell size={24} color="#333" />
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
           <div>
              <h1 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '5px' }}>Ready for action, {profile?.full_name?.split(' ')[0] || 'User'}?</h1>
              <p style={{ color: '#666', fontSize: '15px' }}>Move to lead the {profile?.cities?.name || ''} team!</p>
           </div>
           {!isTracking && (
             <button 
               onClick={requestPermission}
               style={{ background: '#EB8911', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '12px', fontWeight: '800', fontSize: '12px', boxShadow: '0 4px 10px rgba(235,137,17,0.3)' }}
             >
               Start Tracking 🚶
             </button>
           )}
        </div>

        {isTracking && (
          <div style={{ background: '#FFF7ED', border: '1px solid #FFEDD5', padding: '10px', borderRadius: '15px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
             <div style={{ width: '8px', height: '8px', background: '#10B981', borderRadius: '50%' }} />
             <span style={{ fontSize: '12px', fontWeight: '800', color: '#C2410C' }}>Tracking Steps: {sessionSteps} detected</span>
          </div>
        )}

        {/* AI Daily Mission Card (Integrated with ai_generate.py logic) */}
        <div style={{ 
          background: 'linear-gradient(135deg, #2D2D2D, #1A1A1A)', borderRadius: '24px', padding: '24px', color: 'white', marginBottom: '25px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
               <span style={{ background: '#00FF64', color: 'black', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase' }}>AI DAILY CHALLENGE</span>
               <span style={{ fontSize: '24px' }}>🤖</span>
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px' }}>Jumping Jacks & Squats</h3>
            <p style={{ fontSize: '13px', color: '#AAA', fontWeight: '600', marginBottom: '15px', lineHeight: '1.4' }}>
              Build your core strength with a mix of squats, planks, and jumping jacks to improve flexibility and endurance.
            </p>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '15px', border: '1px dashed rgba(255,255,255,0.2)' }}>
               <p style={{ fontSize: '11px', color: '#00FF64', fontWeight: '800', marginBottom: '4px' }}>COACH TIP:</p>
               <p style={{ fontSize: '11px', color: '#EEE', fontWeight: '600' }}>Focus on controlled movements for maximum effectiveness.</p>
            </div>
          </div>
          <Zap size={80} style={{ position: 'absolute', right: '-20px', bottom: '-10px', opacity: 0.1, color: '#00FF64' }} />
        </div>


        {/* Quest List from Database */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
          {missions.map((mission) => {
            const progressPercent = Math.min(100, Math.round((mission.current_value / mission.target_value) * 100));
            return (
              <div key={mission.id} style={{ background: 'white', padding: '20px', borderRadius: '24px', border: '1px solid #EEE', display: 'flex', alignItems: 'center', gap: '15px' }}>
                 <div style={{ fontSize: '28px' }}>
                    {mission.category === 'cardio' ? '🏃' : mission.category === 'strength' ? '💪' : '🧗'}
                 </div>
                 <div style={{ flex: 1 }}>
                   <h4 style={{ fontWeight: '800', fontSize: '14px', color: '#333' }}>{mission.title}</h4>
                   <p style={{ fontSize: '12px', color: '#888', fontWeight: '600' }}>
                     {mission.current_value} / {mission.target_value} {mission.category === 'cardio' ? 'steps' : 'reps'}
                   </p>
                   <div style={{ width: '100%', height: '10px', background: '#F0F0F0', borderRadius: '10px', marginTop: '10px', overflow: 'hidden' }}>
                     <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} style={{ height: '100%', background: 'linear-gradient(90deg, #EB8911, #94216E)', borderRadius: '10px' }} />
                   </div>
                 </div>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'center' }}>
                   {mission.category === 'strength' || mission.category === 'core' ? (
                     <button 
                        onClick={() => navigate('/move')}
                        style={{ background: '#8B4513', border: 'none', width: '40px', height: '40px', borderRadius: '10px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                     >
                       <Camera size={18} />
                     </button>
                   ) : (
                     <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
                       <Zap size={18} />
                     </div>
                   )}
                   <span style={{ fontWeight: '800', color: '#F97316', fontSize: '12px' }}>{progressPercent}%</span>
                 </div>

              </div>
            );
          })}
        </div>

        {/* Real Stats Row */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '35px' }}>
          <div style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '20px', border: '1px solid #EEE', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', fontWeight: '800', color: '#999', textTransform: 'uppercase', marginBottom: '8px' }}>Current Rank</p>
            <h3 style={{ fontSize: '24px', fontWeight: '900' }}>#{userRank}</h3>
          </div>
          <div style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '20px', border: '1px solid #EEE', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', fontWeight: '800', color: '#999', textTransform: 'uppercase', marginBottom: '8px' }}>Total Points</p>
            <h3 style={{ fontSize: '24px', fontWeight: '900' }}>{profile?.balance || 0}</h3>
          </div>
        </div>
      </motion.div>

      <BottomNav />
    </div>
  );
};

export default Feed;
