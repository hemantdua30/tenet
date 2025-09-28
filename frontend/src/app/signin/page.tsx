'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './signin.module.css';
import { useAuth } from '../contexts/auth-context';

// Static particles to avoid hydration mismatch
const staticParticles = [
  { top: '15%', left: '10%', animationDelay: '0.5s', animationDuration: '8s' },
  { top: '25%', left: '20%', animationDelay: '1.2s', animationDuration: '12s' },
  { top: '35%', left: '80%', animationDelay: '0.8s', animationDuration: '10s' },
  { top: '50%', left: '50%', animationDelay: '2.0s', animationDuration: '15s' },
  { top: '65%', left: '30%', animationDelay: '1.5s', animationDuration: '9s' },
  { top: '75%', left: '70%', animationDelay: '0.7s', animationDuration: '11s' },
  { top: '85%', left: '40%', animationDelay: '1.0s', animationDuration: '13s' },
  { top: '10%', left: '60%', animationDelay: '1.8s', animationDuration: '7s' },
  { top: '40%', left: '15%', animationDelay: '0.3s', animationDuration: '14s' },
  { top: '60%', left: '85%', animationDelay: '1.3s', animationDuration: '10s' },
  { top: '20%', left: '45%', animationDelay: '0.9s', animationDuration: '9s' },
  { top: '70%', left: '25%', animationDelay: '1.7s', animationDuration: '12s' },
  { top: '30%', left: '65%', animationDelay: '0.4s', animationDuration: '11s' },
  { top: '55%', left: '5%', animationDelay: '1.1s', animationDuration: '8s' },
  { top: '80%', left: '55%', animationDelay: '0.6s', animationDuration: '13s' },
  { top: '45%', left: '35%', animationDelay: '2.2s', animationDuration: '7s' },
  { top: '90%', left: '75%', animationDelay: '1.4s', animationDuration: '10s' },
  { top: '5%', left: '90%', animationDelay: '0.2s', animationDuration: '14s' },
  { top: '25%', left: '40%', animationDelay: '1.9s', animationDuration: '9s' },
  { top: '60%', left: '60%', animationDelay: '1.6s', animationDuration: '11s' }
];

export default function SignIn() {
  const router = useRouter();
  const { signIn, error: authError, userRole } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Set mounted state once component is mounted
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Watch for userRole changes to redirect
  useEffect(() => {
    if (mounted && userRole) {
      if (userRole === 'inspector') {
        router.push('/dashboard/inspector');
      } else if (userRole === 'company' || userRole === 'admin') {
        router.push('/dashboard/company');
      } else {
        router.push('/dashboard');
      }
    }
  }, [userRole, router, mounted]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      // Sign in with custom auth
      await signIn(username, password);
      // Redirect will happen via the useEffect that watches userRole
      
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.particles}>
        {staticParticles.map((particle, i) => (
          <div 
            key={i} 
            className={styles.particle} 
            style={{
              top: particle.top,
              left: particle.left,
              animationDelay: particle.animationDelay,
              animationDuration: particle.animationDuration
            }}
          />
        ))}
      </div>
      
      <div className={styles.circles3D}>
        <div className={`${styles.circle3D} ${styles.circle1}`}></div>
        <div className={`${styles.circle3D} ${styles.circle2}`}></div>
        <div className={`${styles.circle3D} ${styles.circle3}`}></div>
      </div>
      
      <div className={styles.authContainer}>
        <div className={styles.authHeader}>
          <Link href="/" className={styles.logoLink}>
            <h1 className={styles.logo}>TENET</h1>
          </Link>
          <h2 className={styles.authTitle}>Sign In</h2>
          <p className={styles.authSubtitle}>Access your AI-powered inspection dashboard</p>
        </div>
        
        {(error || authError) && <div className={styles.errorMessage}>{error || authError}</div>}
        
        <form className={styles.authForm} onSubmit={handleSignIn}>
          <div className={styles.formGroup}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              className={styles.authInput}
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <div className={styles.passwordHeader}>
              <label htmlFor="password">Password</label>
              <a href="#" className={styles.forgotPassword}>Forgot Password?</a>
            </div>
            <input
              id="password"
              type="password"
              className={styles.authInput}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className={styles.authButton}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className={styles.authFooter}>
          <p className="text-sm text-gray-600 mt-4">
            If you cannot login, contact admin for access
          </p>
        </div>
      </div>
    </div>
  );
} 