import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Pose } from '@mediapipe/pose';
import * as cam from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { POSE_CONNECTIONS } from '@mediapipe/pose';
import { motion } from 'framer-motion';
import { ArrowLeft, Zap, Trophy, Timer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MoveCam = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState('Get Ready'); // 'up' or 'down'
  const [feedback, setFeedback] = useState('Position yourself');
  const [progress, setProgress] = useState(0);

  // Counter logic variables (refs to avoid re-renders)
  const dir = useRef(0); // 0 for down, 1 for up
  const lastCount = useRef(0);

  const calculateAngle = (a, b, c) => {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180.0) angle = 360 - angle;
    return angle;
  };

  const onResults = (results) => {
    if (!results.poseLandmarks) return;

    const canvasCtx = canvasRef.current.getContext('2d');
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Draw skeleton
    drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#EB8911', lineWidth: 4 });
    drawLandmarks(canvasCtx, results.poseLandmarks, { color: '#94216E', lineWidth: 2, radius: 4 });

    // Push-up Detection Logic
    const landmarks = results.poseLandmarks;
    // Right arm landmarks: shoulder(12), elbow(14), wrist(16)
    const shoulder = landmarks[12];
    const elbow = landmarks[14];
    const wrist = landmarks[16];

    const angle = calculateAngle(shoulder, elbow, wrist);
    
    // Feedback & Counting
    // Percentage logic (0-100)
    let per = Math.max(0, Math.min(100, ((angle - 45) / (160 - 45)) * 100));
    setProgress(Math.round(100 - per));

    if (angle > 160) {
      if (dir.current === 1) {
        setCount(c => c + 1);
        dir.current = 0;
      }
      setStatus('UP');
      setFeedback('Lower down...');
    }
    if (angle < 70) {
      if (dir.current === 0) {
        dir.current = 1;
      }
      setStatus('DOWN');
      setFeedback('Push UP!');
    }

    canvasCtx.restore();
  };

  useEffect(() => {
    const pose = new Pose({
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
      const camera = new cam.Camera(webcamRef.current.video, {
        onFrame: async () => {
          await pose.send({ image: webcamRef.current.video });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }
  }, []);

  return (
    <div style={{ position: 'relative', height: '100vh', background: 'black', overflow: 'hidden' }}>
      {/* Header Overlay */}
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        padding: '20px', 
        zIndex: 10,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)'
      }}>
        <button 
          onClick={() => navigate('/dashboard')}
          style={{ background: 'rgba(255,255,255,0.2)', border: 'none', padding: '10px', borderRadius: '12px', color: 'white' }}
        >
          <ArrowLeft size={24} />
        </button>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: 'white', fontSize: '18px', fontWeight: '800' }}>PUSH-UPS</h2>
          <p style={{ color: '#EB8911', fontSize: '12px', fontWeight: '700' }}>MISSION: 20 REPS</p>
        </div>
        <div style={{ width: '44px' }} /> {/* Spacer */}
      </div>

      {/* Camera Feed */}
      <Webcam
        ref={webcamRef}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 5
        }}
      />

      {/* Bottom Stats Overlay */}
      <div style={{ 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        padding: '30px 20px', 
        zIndex: 10,
        background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px'
      }}>
        <div style={{ color: '#EB8911', fontWeight: '800', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '2px' }}>
          {feedback}
        </div>

        <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
             <p style={{ color: '#888', fontSize: '10px', fontWeight: '800' }}>PROGRESS</p>
             <h3 style={{ color: 'white', fontSize: '24px', fontWeight: '900' }}>{progress}%</h3>
          </div>
          
          {/* Big Counter Circle */}
          <div style={{ 
            width: '100px', 
            height: '100px', 
            borderRadius: '50%', 
            border: '4px solid #EB8911',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(235, 137, 17, 0.1)',
            boxShadow: '0 0 20px rgba(235, 137, 17, 0.4)'
          }}>
            <h1 style={{ color: 'white', fontSize: '48px', fontWeight: '900' }}>{count}</h1>
          </div>

          <div style={{ textAlign: 'center' }}>
             <p style={{ color: '#888', fontSize: '10px', fontWeight: '800' }}>STATUS</p>
             <h3 style={{ color: status === 'DOWN' ? '#EB8911' : '#10B981', fontSize: '24px', fontWeight: '900' }}>{status}</h3>
          </div>
        </div>

        {/* Action Button (Optional) */}
        <button style={{ 
          background: 'linear-gradient(45deg, #EB8911, #94216E)', 
          color: 'white', 
          border: 'none', 
          width: '100%', 
          padding: '15px', 
          borderRadius: '16px',
          fontWeight: '800',
          fontSize: '16px',
          marginTop: '10px'
        }}>
          FINISH SESSION
        </button>
      </div>
    </div>
  );
};

export default MoveCam;
