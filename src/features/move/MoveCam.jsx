import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { motion } from 'framer-motion';
import { ArrowLeft, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MoveCam = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  
  const [count, setCount] = useState(0);
  const [stage, setStage] = useState('Wait...');
  const [feedback, setFeedback] = useState('Position yourself');
  const [progress, setProgress] = useState(0);

  // Constants from counter.py
  const ANGLE_UP = 155;
  const ANGLE_DOWN = 75;
  const TARGET_REPS = 20;

  const currentStage = useRef(null);
  const currentCounter = useRef(0);

  const calculateAngle = (a, b, c) => {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180.0) angle = 360 - angle;
    return angle;
  };

  const onResults = (results) => {
    if (!results.poseLandmarks || !canvasRef.current) return;

    const canvasCtx = canvasRef.current.getContext('2d');
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Draw Dark Overlay Filter
    canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    canvasCtx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Use global MediaPipe drawing utils from window
    if (window.drawConnectors && window.drawLandmarks) {
      window.drawConnectors(canvasCtx, results.poseLandmarks, window.POSE_CONNECTIONS, { color: '#00FF64', lineWidth: 4 });
      window.drawLandmarks(canvasCtx, results.poseLandmarks, { color: '#FFFFFF', lineWidth: 2, radius: 4 });
    }

    const landmarks = results.poseLandmarks;
    const p1 = landmarks[11];
    const p2 = landmarks[13];
    const p3 = landmarks[15];

    if (p1 && p2 && p3) {
      const angle = calculateAngle(p1, p2, p3);
      
      if (angle > ANGLE_UP) {
        currentStage.current = "up";
        setStage("UP");
        setFeedback("Lower down...");
      }
      
      if (angle < ANGLE_DOWN && currentStage.current === "up") {
        currentStage.current = "down";
        currentCounter.current += 1;
        setCount(currentCounter.current);
        setStage("DOWN");
        setFeedback("Push UP!");
        
        const prog = (currentCounter.current / TARGET_REPS) * 100;
        setProgress(Math.min(100, Math.round(prog)));
      }
    }

    canvasCtx.restore();
  };

  useEffect(() => {
    if (!window.Pose) {
      console.error("MediaPipe Pose not loaded yet");
      return;
    }

    const pose = new window.Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults(onResults);

    if (webcamRef.current && webcamRef.current.video) {
      const camera = new window.Camera(webcamRef.current.video, {
        onFrame: async () => {
          if (webcamRef.current && webcamRef.current.video) {
            await pose.send({ image: webcamRef.current.video });
          }
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }
  }, []);

  return (
    <div style={{ position: 'relative', height: '100vh', background: 'black', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '20px', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '12px', borderRadius: '15px', color: 'white' }}><ArrowLeft size={24} /></button>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: 'white', fontSize: '18px', fontWeight: '900', letterSpacing: '1px' }}>AI Fit Challenge</h2>
          <p style={{ color: '#00FF64', fontSize: '12px', fontWeight: '800' }}>{feedback.toUpperCase()}</p>
        </div>
        <div style={{ width: '48px' }} />
      </div>

      <Webcam ref={webcamRef} mirrored={true} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      <canvas 
        ref={canvasRef} 
        width="640" 
        height="480" 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          zIndex: 5,
          transform: 'scaleX(-1)' // This mirrors the skeleton to match the video
        }} 
      />

      <div style={{ position: 'absolute', top: '100px', left: '20px', zIndex: 10, background: 'rgba(0,0,0,0.6)', padding: '20px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', textAlign: 'center', minWidth: '120px' }}>
        <h1 style={{ color: '#00FF64', fontSize: '64px', fontWeight: '900', margin: 0, lineHeight: 1 }}>{count}</h1>
        <p style={{ color: '#AAA', fontSize: '12px', fontWeight: '800', marginTop: '5px' }}>REPS</p>
        <div style={{ marginTop: '10px', padding: '4px 8px', background: stage === 'UP' ? 'rgba(0,255,100,0.2)' : 'rgba(255,100,0,0.2)', color: stage === 'UP' ? '#00FF64' : '#FF6400', borderRadius: '8px', fontSize: '10px', fontWeight: '900' }}>{stage}</div>
      </div>

      <div style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', width: '80%', zIndex: 10, textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'white', fontSize: '12px', fontWeight: '800', marginBottom: '8px' }}><span>PROGRESS</span><span>{count} / {TARGET_REPS}</span></div>
        <div style={{ width: '100%', height: '16px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}><motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} style={{ height: '100%', background: '#00FF64', boxShadow: '0 0 15px rgba(0,255,100,0.5)' }} /></div>
      </div>
    </div>
  );
};

export default MoveCam;
