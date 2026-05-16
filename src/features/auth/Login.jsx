import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Error: " + error.message);
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };


  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      style={{ padding: '60px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ 
          fontSize: '42px', 
          fontWeight: '900', 
          fontStyle: 'italic',
          color: '#8B4513',
          marginBottom: '5px'
        }}>MoveUp</h1>
        <p style={{ letterSpacing: '3px', fontSize: '14px', fontWeight: '700', color: '#444', textTransform: 'uppercase' }}>Welcome Back</p>
      </div>

      <form onSubmit={handleLogin} style={{ width: '100%' }}>
        <div className="input-group">
          <label className="input-label">Email</label>
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
          <label className="input-label">Password</label>
          <input 
            type="password" 
            className="premium-input" 
            placeholder="........"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="premium-button" style={{ marginTop: '20px' }} disabled={loading}>
          {loading ? 'Logging in...' : 'Login to Your Team'} <Zap size={20} fill="white" />
        </button>

      </form>

      <p style={{ marginTop: '30px', fontWeight: '600', color: '#444' }}>
        Don't have an account? <span 
          onClick={() => navigate('/signup')}
          style={{ color: '#94216E', cursor: 'pointer' }}
        >Sign Up</span>
      </p>
    </motion.div>
  );
};

export default Login;
