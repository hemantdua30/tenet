'use client';

import Link from 'next/link';
import styles from './page.module.css';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  // Generate random data points for the 3D machine visualization
  const dataPoints = Array.from({ length: 12 }).map((_, i) => ({
    x: 20 + Math.random() * 200,
    y: 20 + Math.random() * 80,
    size: 4 + Math.random() * 3,
    pulseDelay: Math.random() * 4
  }));

  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    router.push('/signin');
  }, []);

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      const demoSection = document.getElementById('demo');
      if (demoSection) {
        demoSection.scrollIntoView({ behavior: 'smooth' });
      }
    };
    
    // Initialize Three.js scene
    const initThreeScene = async () => {
      if (typeof window !== 'undefined') {
        // Only execute this on client-side
        const heroContainer = document.getElementById('hero-3d-container');
        if (heroContainer) {
          // Add parallax effect on mouse move
          document.addEventListener('mousemove', (e) => {
            if (heroContainer) {
              const x = (window.innerWidth - e.pageX * 2) / 100;
              const y = (window.innerHeight - e.pageY * 2) / 100;
              
              heroContainer.style.transform = `translateX(${x}px) translateY(${y}px)`;
            }
          });
        }
      }
    };
    
    initThreeScene();
    
    return () => {
      // Cleanup event listeners
      document.removeEventListener('mousemove', () => {});
    };
  }, []);

  // Generate random glowing orbs
  const orbs = Array.from({ length: 30 }).map((_, i) => ({
    size: 5 + Math.random() * 15,
    top: Math.random() * 100,
    left: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 5 + Math.random() * 10
  }));

  return (
    <div className={styles.landingPage}>
      <div className={styles.backgroundGrid}></div>
      
      {/* Modern 3D hero particles */}
      <div className={styles.heroParticlesContainer}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div 
            key={i}
            className={styles.heroParticle}
            style={{
              '--particle-delay': `${i * 0.2}s`,
              '--particle-size': `${5 + Math.random() * 10}px`,
              '--particle-top': `${Math.random() * 100}%`,
              '--particle-left': `${Math.random() * 100}%`,
            } as React.CSSProperties}
          />
        ))}
      </div>
      
      {/* Static particles instead of dynamic ones */}
      <div className={styles.particles}>
        <div className={styles.particle} style={{ top: '15%', left: '10%' }}></div>
        <div className={styles.particle} style={{ top: '25%', left: '30%' }}></div>
        <div className={styles.particle} style={{ top: '45%', left: '15%' }}></div>
        <div className={styles.particle} style={{ top: '65%', left: '35%' }}></div>
        <div className={styles.particle} style={{ top: '85%', left: '25%' }}></div>
        <div className={styles.particle} style={{ top: '10%', left: '70%' }}></div>
        <div className={styles.particle} style={{ top: '30%', left: '80%' }}></div>
        <div className={styles.particle} style={{ top: '50%', left: '65%' }}></div>
        <div className={styles.particle} style={{ top: '70%', left: '75%' }}></div>
        <div className={styles.particle} style={{ top: '90%', left: '85%' }}></div>
      </div>
      
      {/* Static orbs */}
      <div className={styles.orbsContainer}>
        <div className={styles.floatingOrb} style={{ width: '15px', height: '15px', top: '20%', left: '30%' }}></div>
        <div className={styles.floatingOrb} style={{ width: '20px', height: '20px', top: '40%', left: '70%' }}></div>
        <div className={styles.floatingOrb} style={{ width: '12px', height: '12px', top: '70%', left: '20%' }}></div>
        <div className={styles.floatingOrb} style={{ width: '18px', height: '18px', top: '30%', left: '50%' }}></div>
        <div className={styles.floatingOrb} style={{ width: '10px', height: '10px', top: '60%', left: '80%' }}></div>
      </div>
      
      <div className={styles.content}>
        {/* Header/Navigation */}
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <Link href="/" className={styles.logo}>
              <span className={styles.logoGlow}>
                <span className={styles.logoLetter}>A</span>
                <span className={styles.logoLetter}>N</span>
                <span className={styles.logoLetter}>G</span>
                <span className={styles.logoLetter}>U</span>
                <span className={styles.logoLetter}>L</span>
                <span className={styles.logoLetter}>A</span>
                <span className={styles.logoLetter}>R</span>
                <span className={styles.logoLetter}>I</span>
                <span className={styles.logoLetter}>S</span>
              </span>
            </Link>
            <div className={styles.authContainer}>
              <Link href="/signin" className={styles.authButton}>
                Sign In
              </Link>
            </div>
          </div>
        </header>

        {/* Enhanced 3D Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroOverlay}></div>
          
          {/* Floating 3D elements */}
          <div className={styles.floatingElements}>
            <div className={`${styles.floatingElement} ${styles.cube}`}></div>
            <div className={`${styles.floatingElement} ${styles.sphere}`}></div>
            <div className={`${styles.floatingElement} ${styles.pyramid}`}></div>
            <div className={`${styles.floatingElement} ${styles.ring}`}></div>
          </div>
          
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <div className={styles.heroTitleContainer}>
                <h1 className={styles.heroTitle}>
                  <span className={styles.heroWord}>AI-Powered</span>
                  <span className={styles.heroWord}><span className={styles.heroHighlight}>Machine</span></span>
                  <span className={styles.heroWord}><span className={styles.heroHighlight}>Inspection</span></span>
                  <span className={styles.heroWord}>for Industries</span>
                </h1>
              </div>
              
              <div className={styles.heroSubtitleContainer}>
                <p className={styles.heroSubtitle}>
                Optimize your maintenance operations with our cutting-edge AI system—identifying potential issues before they escalate into costly problems.                </p>
              </div>
              
              <div className={styles.ctaContainer}>
                <Link href="/signin" className={styles.ctaButton}>
                  <span>Access Dashboard</span>
                  <div className={styles.ctaGlow}></div>
                </Link>
                <Link href="#demo" className={styles.secondaryButton}>
                  <span>See It in Action</span>
                  <div className={styles.btnParticles}></div>
                </Link>
              </div>
              
              <div className={styles.statsRow}>
                <div className={`${styles.statItem} ${styles.statItemAnimated}`}>
                  <div className={styles.statValue}>87%</div>
                  <div className={styles.statLabel}>Downtime Reduction</div>
                </div>
                <div className={`${styles.statItem} ${styles.statItemAnimated}`} style={{ animationDelay: '0.2s' }}>
                  <div className={styles.statValue}>5x</div>
                  <div className={styles.statLabel}>Faster Inspections</div>
                </div>
                <div className={`${styles.statItem} ${styles.statItemAnimated}`} style={{ animationDelay: '0.4s' }}>
                  <div className={styles.statValue}>$100K+</div>
                  <div className={styles.statLabel}>Savings in Maintenance Costs</div>
                </div>
              </div>
            </div>
            
            <div className={styles.heroVisual}>
              <div className={styles.hero3dContainer} id="hero-3d-container">
                <div className={styles.hero3dScene}>
                  <div className={styles.machineModel}>
                    <div className={styles.machinePart1}></div>
                    <div className={styles.machinePart2}></div>
                    <div className={styles.machinePart3}></div>
                    <div className={styles.machineScreen}>
                      <div className={styles.screenGlow}></div>
                      <div className={styles.scanLine}></div>
                    </div>
                    <div className={styles.machineControls}>
                      <div className={styles.controlButton}></div>
                      <div className={styles.controlButton}></div>
                      <div className={styles.controlButton}></div>
                    </div>
                    <div className={styles.machineCamera}>
                      <div className={styles.cameralens}></div>
                    </div>
                    <div className={styles.scanningBeam}></div>
                  </div>
                  
                  <div className={styles.hologramProjection}>
                    <div className={styles.hologramRing}></div>
                    <div className={styles.hologramCore}></div>
                    <div className={styles.hologramBeam}></div>
                  </div>
                  
                  <div className={styles.dataPoints}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div 
                        key={i}
                        className={styles.dataConnection}
                        style={{ 
                          '--connection-delay': `${i * 0.5}s`,
                          '--connection-x': `${-50 + i * 25}%`,
                          '--connection-y': `${-30 + i * 15}%`
                        } as React.CSSProperties}
                      >
                        <div className={styles.dataNode}></div>
                        <div className={styles.dataLine}></div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className={styles.heroImageCaption}>
                  <span>AI-powered machine inspection system</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Radial gradient beneath the hero */}
          <div className={styles.heroGradient}></div>
        </section>

        {/* Demo Section */}
        <section id="demo" className={styles.demoSection}>
          <div className={styles.demoBackground}>
            <div className={styles.demoGradient}></div>
            <div className={styles.circles3D}>
              <div className={`${styles.circle3D} ${styles.circle1}`}></div>
              <div className={`${styles.circle3D} ${styles.circle2}`}></div>
              <div className={`${styles.circle3D} ${styles.circle3}`}></div>
            </div>
          </div>
          <div className={styles.demoContainer}>
            <h2 className={`${styles.demoTitle} neon-text`}>See How It Works</h2>
            <p className={styles.demoSubtitle}>
            Our AI system analyzes periodic machine data to detect anomalies and anticipate potential failures before they happen.           </p>
            <div className={styles.demoVisual}>
              <div className={`${styles.demoScreen} edge-highlight`}>
                <div className={`${styles.visualizer3D} scanner-effect`}>
                  <div className={styles.demoUI}>
                    <div className={styles.demoHeader}>
                      <div className={`${styles.demoLogo} typing-effect`}>
                        ANGULARIS<span>AI</span> Dashboard
                      </div>
                      <div className={styles.demoControls}>
                        <div className={`${styles.demoControl} ripple-effect`}>⚙️</div>
                        <div className={`${styles.demoControl} ripple-effect`}>📊</div>
                        <div className={`${styles.demoControl} ripple-effect`}>🔔</div>
                      </div>
                    </div>
                    <div className={styles.demoSidebar}>
                      <div className={`${styles.demoMenuItem} ${styles.active}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="3" y1="9" x2="21" y2="9"></line>
                          <line x1="9" y1="21" x2="9" y2="9"></line>
                        </svg>
                        Dashboard
                      </div>
                      <div className={styles.demoMenuItem}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                          <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                        Reports
                      </div>
                      <div className={styles.demoMenuItem}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                        </svg>
                        Analytics
                      </div>
                      <div className={styles.demoMenuItem}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="8" x2="12" y2="12"></line>
                          <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        Alerts
                      </div>
                      <div className={styles.demoMenuItem}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        Team
                      </div>
                      <div className={styles.demoMenuItem}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="3"></circle>
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                        </svg>
                        Settings
                      </div>
                    </div>
                    <div className={`${styles.demoContent} retro-grid`}>
                      <div className={styles.demoMachine}>
                        <div className={`${styles.machine3D} hologram`}>
                          <div className={`${styles.machinePart} ${styles.base}`}></div>
                          <div className={`${styles.machinePart} ${styles.column1}`}></div>
                          <div className={`${styles.machinePart} ${styles.column2}`}></div>
                          <div className={`${styles.machinePart} ${styles.top}`}></div>
                          <div className={`${styles.machinePart} ${styles.screen} scanner-effect`}>
                            <div className={styles.screenContent}>
                              <div className={styles.scanLine}></div>
                              <div className={styles.dataPoints}>
                                {dataPoints.map((point, i) => (
                                  <div 
                                    key={i} 
                                    className={styles.dataPoint} 
                                    style={{ 
                                      top: `${point.y}px`, 
                                      left: `${point.x}px`,
                                      width: `${point.size}px`,
                                      height: `${point.size}px`,
                                      animationDelay: `${point.pulseDelay}s`
                                    }}
                                  >
                                    {i === 2 && (
                                      <div 
                                        className={`${styles.dataAnnotation} edge-highlight code-highlight`}
                                        style={{
                                          top: '-40px',
                                          left: '-70px'
                                        }}
                                      >
                                        Anomaly detected: Bearing wear
                                      </div>
                                    )}
                                    {i === 5 && (
                                      <div 
                                        className={styles.sensorData}
                                        style={{
                                          top: '10px',
                                          left: '10px'
                                        }}
                                      >
                                        Temp: 78.3°C
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.demoFeatures}>
              <div className="flex">
                <div className={`${styles.demoFeature} edge-highlight`}>
                  <div className={`${styles.demoFeatureIcon} hologram`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                      <line x1="2" y1="12" x2="22" y2="12"></line>
                    </svg>
                  </div>
                  <h3 className={styles.demoFeatureTitle}>Trend Analysis</h3>
                </div>

                <div className={`${styles.demoFeature} edge-highlight`}>
                  <div className={`${styles.demoFeatureIcon} hologram`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      <polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline>
                      <polyline points="7.5 19.79 7.5 14.6 3 12"></polyline>
                      <polyline points="21 12 16.5 14.6 16.5 19.79"></polyline>
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                      <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                  </div>
                  <h3 className={styles.demoFeatureTitle}>Faster Inspections</h3>
                </div>
                <div className={`${styles.demoFeature} edge-highlight`}>
                  <div className={`${styles.demoFeatureIcon} hologram`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                      <polyline points="2 17 12 22 22 17"></polyline>
                      <polyline points="2 12 12 17 22 12"></polyline>
                    </svg>
                  </div>
                  <h3 className={styles.demoFeatureTitle}>Report Generation and Optimization</h3>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="cta" className={styles.cta}>
          <div className={styles.ctaGradient}></div>
          <div className={styles.container}>
            <div className={styles.ctaContent}>
              <h2 className={styles.ctaTitle}>Ready to Transform Your Inspection Process?</h2>

              <div className={styles.ctaButtons}>
                <Link href="/signin" className={styles.ctaButton}>
                  <span>Access Dashboard</span>
                  <div className={styles.ctaGlow}></div>
                </Link>
                <Link href="/signin" className={styles.secondaryButton}>
                  <span>Sign In</span>
                  <div className={styles.btnParticles}></div>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <div className={styles.footerContent}>
            <div className={styles.footerLogo}>
              ANGULARIS
            </div>
            <Link href="/signin" className={styles.footerCta}>
              Sign In
            </Link>
            <div className={styles.copyright}>
              © {new Date().getFullYear()} ANGULARIS. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

