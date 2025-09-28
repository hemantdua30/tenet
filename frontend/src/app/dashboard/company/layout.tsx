'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Home, BarChart2, Layers, 
  FileText, ChevronRight,
  Menu, CheckSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RoleBasedRoute from '../../components/RoleBasedRoute';
import { useAuth } from '../../contexts/auth-context';
import styles from './company.module.css';

interface CompanyDashboardLayoutProps {
  children: React.ReactNode;
}

export default function CompanyDashboardLayout({ children }: CompanyDashboardLayoutProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  // const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [particles, setParticles] = useState<{ top: string; left: string; delay: string; duration: string }[]>([]);

  useEffect(() => {
    // Generate random particles
    const newParticles = Array.from({ length: 15 }).map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${Math.random() * 10 + 10}s`
    }));
    setParticles(newParticles);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const sidebarVariants = {
    open: { 
      width: '280px',
      transition: { 
        type: 'spring', 
        stiffness: 300, 
        damping: 30
      }
    },
    closed: { 
      width: '80px',
      transition: { 
        type: 'spring', 
        stiffness: 300, 
        damping: 30
      }
    }
  };

  const contentVariants = {
    open: { 
      marginLeft: '280px',
      width: 'calc(100% - 280px)',
      transition: { 
        type: 'spring', 
        stiffness: 300, 
        damping: 30
      }
    },
    closed: { 
      marginLeft: '80px',
      width: 'calc(100% - 80px)',
      transition: { 
        type: 'spring', 
        stiffness: 300, 
        damping: 30
      }
    }
  };

  const navigationItems = [
    { name: 'Dashboard', icon: <Home size={20} />, path: '/dashboard/company' },
    { name: 'Fleet', icon: <Layers size={20} />, path: '/dashboard/company/plants' },
    { name: 'APU Reports', icon: <FileText size={20} />, path: '/dashboard/company/reports' },
    { name: 'Analytics', icon: <BarChart2 size={20} />, path: '/dashboard/company/analytics' },
    { name: 'Schedule', icon: <CheckSquare size={20} />, path: '/dashboard/company/schedule' },
  ];

  // const handleSignOut = async () => {
  //   try {
  //     await signOut();
  //     router.push('/signin');
  //   } catch (error) {
  //     console.error('Error signing out:', error);
  //   }
  // };

  return (
    <RoleBasedRoute allowedRoles={['admin']} redirectTo="/dashboard">
      <div className={`h-screen overflow-hidden relative flex bg-[#0f0f1a] ${styles.rootVariables}`}>
        {/* Particles */}
        {particles.map((particle, i) => (
          <div 
            key={i} 
            className="absolute w-1.5 h-1.5 rounded-full bg-purple-500 opacity-20 pointer-events-none"
            style={{
              top: particle.top,
              left: particle.left,
              animationDelay: particle.delay,
              animationDuration: particle.duration,
              boxShadow: '0 0 10px rgba(139, 92, 246, 0.5), 0 0 20px rgba(139, 92, 246, 0.3)',
              animation: 'float 15s infinite ease-in-out'
            }}
          />
        ))}

        {/* Sidebar */}
        <motion.div
          className="fixed top-0 left-0 h-full bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] shadow-xl z-20 overflow-hidden"
          animate={isSidebarOpen ? 'open' : 'closed'}
          variants={sidebarVariants}
          initial="open"
        >
          <div className="relative h-full p-4">
            <div className="flex items-center h-16 relative">
              <Link href="/dashboard/company" className="flex items-center">
                <div className="bg-gradient-to-tr from-purple-600 to-purple-500 w-10 h-10 rounded-md flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">H</span>
                </div>
                <AnimatePresence>
                  {isSidebarOpen && (
                    <motion.span
                      className="ml-3 text-white font-semibold text-xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      Honeywell
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
              <button 
                className="absolute right-0 text-gray-400 hover:text-white transition-colors"
                onClick={toggleSidebar}
              >
                {isSidebarOpen ? <ChevronRight size={20} /> : <Menu size={20} />}
              </button>
            </div>

            <div className="mt-8 space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  className="flex items-center h-12 px-3 rounded-lg text-gray-300 hover:bg-purple-500/10 hover:text-purple-400 transition-colors group relative"
                >
                  <div className={`min-w-[40px] flex items-center justify-center ${!isSidebarOpen ? 'mx-auto' : ''}`}>
                    {item.icon}
                  </div>
                  <AnimatePresence>
                    {isSidebarOpen && (
                      <motion.span
                        className="text-sm font-medium ml-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              ))}
            </div>

            <div className="absolute bottom-4 left-4 right-4">
              <div className="px-3 py-2 rounded-lg bg-purple-900/20 backdrop-blur-sm border border-purple-500/10">
                <AnimatePresence>
                  {isSidebarOpen && (
                    <motion.div
                      className="mb-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="text-sm text-gray-400">Logged in as</p>
                      <p className="text-sm font-medium text-purple-300">{user?.name || 'Hemant Dua'}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
                <button
                  onClick={async () => {
                    try {
                      await signOut();
                      router.push('/signin');
                    } catch (err) {
                      console.error('Sign out error:', err);
                    }
                  }}
                  className="flex items-center w-full text-gray-300 hover:text-purple-300 transition-colors group"
                >
                  <div className={`min-w-[40px] flex items-center justify-center ${!isSidebarOpen ? 'mx-auto' : ''}`}>
                    <ChevronRight size={20} />
                  </div>
                  <AnimatePresence>
                    {isSidebarOpen && (
                      <motion.span
                        className="text-sm font-medium ml-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        Sign Out
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          className="flex-1 h-screen overflow-y-auto"
          animate={isSidebarOpen ? 'open' : 'closed'}
          variants={contentVariants}
          initial="open"
        >
          {/* Content area */}
          <div className="p-4 w-full h-full">
            {children}
          </div>
        </motion.div>
      </div>
    </RoleBasedRoute>
  );
} 