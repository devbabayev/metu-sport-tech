import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignUp from './features/auth/SignUp';
import Login from './features/auth/Login';
import Feed from './features/dashboard/Feed';
import Ranks from './features/ranks/Ranks';
import Rewards from './features/rewards/Rewards';
import Profile from './features/profile/Profile';
import MoveCam from './features/move/MoveCam';
import { initSecureTime } from './utils/timeUtils';

function App() {
  useEffect(() => {
    initSecureTime();
  }, []);

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Feed />} />
          <Route path="/ranks" element={<Ranks />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/move" element={<MoveCam />} />
          <Route path="/" element={<Navigate to="/signup" replace />} />
        </Routes>
      </div>
    </Router>
  );
}









export default App;
