import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trophy, CheckCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { getSecureTurkeyTime } from '../../utils/timeUtils';

const MoveCam = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const TARGET_REPS = location.state?.targetReps || 20;
  const initialReps = location.state?.currentReps || 0;
  
  const [count, setCount] = useState(initialReps);
  const [stage, setStage] = useState('Wait...');
  const [feedback, setFeedback] = useState('Position yourself');
  const [progress, setProgress] = useState(Math.min(100, Math.round((initialReps / TARGET_REPS) * 100)));
  const [isCompleted, setIsCompleted] = useState(false);

  const [backFeedback, setBackFeedback] = useState('BACK: OK');
  const audioRef = useRef(null);

  const ANGLE_UP = 155;
  const ANGLE_DOWN = 75;

  const currentStage = useRef(null);
  const currentCounter = useRef(initialReps);
  const hasFinished = useRef(false);

  const saveProgressAndExit = async () => {
    // Save partial progress if any reps were done in this session
    if (currentCounter.current > initialReps && !hasFinished.current) {
      const targetMissionId = location.state?.missionId;
      if (targetMissionId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('user_missions').upsert({
            user_id: user.id,
            mission_id: targetMissionId,
            current_value: currentCounter.current,
            is_completed: false,
            updated_at: getSecureTurkeyTime().toISOString()
          }, { onConflict: 'user_id,mission_id' });
        }
      }
    }
    navigate('/dashboard');
  };

  const calculateAngle = (a, b, c) => {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180.0) angle = 360 - angle;
    return angle;
  };

  const onResults = (results) => {
    // Check if components are ready and if we haven't finished yet
    if (!results.poseLandmarks || !canvasRef.current || hasFinished.current) return;

    const canvasCtx = canvasRef.current.getContext('2d');
    const { width, height } = canvasRef.current;
    
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, width, height);
    
    // Draw Dark Overlay Filter
    canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    canvasCtx.fillRect(0, 0, width, height);

    // Draw Skeleton using global MediaPipe utils
    if (window.drawConnectors && window.drawLandmarks) {
      window.drawConnectors(canvasCtx, results.poseLandmarks, window.POSE_CONNECTIONS, { color: '#00FF64', lineWidth: 4 });
      window.drawLandmarks(canvasCtx, results.poseLandmarks, { color: '#FFFFFF', lineWidth: 2, radius: 4 });
    }

    const landmarks = results.poseLandmarks;
    const p1 = landmarks[11];
    const p2 = landmarks[13];
    const p3 = landmarks[15];

    const s = landmarks[11];
    const h = landmarks[23];
    const k = landmarks[25];

    // Counting Logic & Posture Check
    if (p1 && p2 && p3 && s && h && k) {
      const elbowAngle = calculateAngle(p1, p2, p3);
      const backAngle = calculateAngle(s, h, k);
      
      const backOk = backAngle > 160 && backAngle < 190;
      setBackFeedback(backOk ? 'BACK: OK' : 'BACK: FIX!');
      
      if (elbowAngle > ANGLE_UP) {
        if (currentStage.current === "down" && !backOk) {
           if (audioRef.current) {
             audioRef.current.currentTime = 0;
             audioRef.current.play().catch(e => console.log('Audio error:', e));
           }
        }
        currentStage.current = "up";
        setStage("UP");
        setFeedback("Lower down...");
      }
      
      if (elbowAngle < ANGLE_DOWN && currentStage.current === "up") {
        currentStage.current = "down";
        currentCounter.current += 1;
        setCount(currentCounter.current);
        setStage("DOWN");
        setFeedback("Push UP!");
        
        const prog = (currentCounter.current / TARGET_REPS) * 100;
        setProgress(Math.min(100, Math.round(prog)));

        if (currentCounter.current >= TARGET_REPS) {
          hasFinished.current = true;
          setIsCompleted(true);
          
          // 🚀 Update Database in background
          const updateDB = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            const targetMissionId = location.state?.missionId;
            if (!targetMissionId) return; // Prevent updating random missions
            
            const { data: missions } = await supabase.from('missions').select('*').eq('id', targetMissionId);
            
            if (profile && missions && missions.length > 0) {
               const mission = missions[0];
               
               // Mark as completed
               await supabase.from('user_missions').upsert({
                 user_id: user.id,
                 mission_id: mission.id,
                 current_value: TARGET_REPS,
                 is_completed: true,
                 updated_at: getSecureTurkeyTime().toISOString()
               }, { onConflict: 'user_id,mission_id' });

               // Award points
               await supabase.rpc('increment_balance', { user_id: user.id, amount: mission.points });
               await supabase.rpc('increment_city_points', { city_id: profile.city_id, amount: mission.points });
            }
          };

          updateDB();

          // Redirect after a delay
          setTimeout(() => navigate('/dashboard'), 4000);
        }
      }
    }

    canvasCtx.restore();
  };

  useEffect(() => {
    let camera = null;
    let pose = null;

    const initMediaPipe = async () => {
      if (!window.Pose || !window.Camera) {
         setTimeout(initMediaPipe, 500); // Retry if not loaded yet
         return;
      }

      pose = new window.Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });

      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      pose.onResults(onResults);

      if (webcamRef.current && webcamRef.current.video) {
        camera = new window.Camera(webcamRef.current.video, {
          onFrame: async () => {
            if (webcamRef.current && webcamRef.current.video && !hasFinished.current) {
              await pose.send({ image: webcamRef.current.video });
            }
          },
          width: 640,
          height: 480,
        });
        camera.start();
      }
    };

    initMediaPipe();

    return () => {
      if (camera) camera.stop();
      if (pose) pose.close();
    };
  }, []);

  return (
    <div style={{ position: 'relative', height: '100vh', background: 'black', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '20px', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={saveProgressAndExit} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '12px', borderRadius: '15px', color: 'white' }}><ArrowLeft size={24} /></button>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: 'white', fontSize: '18px', fontWeight: '900', letterSpacing: '1px' }}>AI Fit Challenge</h2>
          <p style={{ color: '#00FF64', fontSize: '12px', fontWeight: '800' }}>{!isCompleted ? feedback.toUpperCase() : 'GOAL REACHED!'}</p>
        </div>
        <div style={{ width: '48px' }} />
      </div>

      <Webcam ref={webcamRef} mirrored={true} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      <canvas ref={canvasRef} width="640" height="480" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 5, transform: 'scaleX(-1)' }} />

      <AnimatePresence>
        {isCompleted && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '30px', backdropFilter: 'blur(10px)' }}>
            <motion.div initial={{ rotate: -20, scale: 0 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring', damping: 10 }} style={{ background: '#EB8911', width: '100px', height: '100px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Trophy size={60} color="white" />
            </motion.div>
            <h1 style={{ color: 'white', fontSize: '32px', fontWeight: '900', marginBottom: '10px' }}>MISSION COMPLETED!</h1>
            <p style={{ color: '#00FF64', fontSize: '18px', fontWeight: '800', marginBottom: '30px' }}>You earned +500 PTS for your city</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#AAA', fontSize: '14px', fontWeight: '700' }}><CheckCircle size={18} color="#00FF64" /> Redirecting to Dashboard...</div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ position: 'absolute', top: '100px', left: '20px', zIndex: 10, background: 'rgba(0,0,0,0.6)', padding: '20px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', textAlign: 'center', minWidth: '120px' }}>
        <h1 style={{ color: '#00FF64', fontSize: '64px', fontWeight: '900', margin: 0, lineHeight: 1 }}>{count}</h1>
        <p style={{ color: '#AAA', fontSize: '12px', fontWeight: '800', marginTop: '5px' }}>REPS</p>
        <div style={{ marginTop: '10px', padding: '4px 8px', background: stage === 'UP' ? 'rgba(0,255,100,0.2)' : 'rgba(255,100,0,0.2)', color: stage === 'UP' ? '#00FF64' : '#FF6400', borderRadius: '8px', fontSize: '10px', fontWeight: '900', marginBottom: '5px' }}>{stage}</div>
        <div style={{ padding: '4px 8px', background: backFeedback === 'BACK: OK' ? 'rgba(0,255,100,0.2)' : 'rgba(255,0,0,0.2)', color: backFeedback === 'BACK: OK' ? '#00FF64' : '#FF4444', borderRadius: '8px', fontSize: '10px', fontWeight: '900' }}>{backFeedback}</div>
      </div>

      <div style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', width: '80%', zIndex: 10, textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'white', fontSize: '12px', fontWeight: '800', marginBottom: '8px' }}><span>PROGRESS</span><span>{count} / {TARGET_REPS}</span></div>
        <div style={{ width: '100%', height: '16px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}><motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} style={{ height: '100%', background: '#00FF64', boxShadow: '0 0 15px rgba(0,255,100,0.5)' }} /></div>
      </div>
      
      {/* Hidden Audio Player for Feedback */}
      <audio ref={audioRef} src="/sound.mp3" preload="auto" />
    </div>
  );
};

export default MoveCam;
