import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import styles from '../styles/Login.module.css';

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in via the current Supabase session
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          setIsLoggedIn(true);
          // Redirect to dashboard if already logged in
          router.push('/dashboard');
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <Layout>
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
          <div style={{ fontSize: '24px', color: '#22c55e' }}>
            Loading...
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.loginContainer}>
        <div className={styles.loginBox}>
          {/* School Logo/Header */}
          <div className={styles.schoolHeader}>
            <h1 style={{ color: '#22c55e', marginBottom: '5px' }}>
              🏫 GPS Shagi Hindkian
            </h1>
            <p style={{ color: '#84cc16', fontSize: '14px' }}>
              Teacher Document Archive System
            </p>
          </div>

          {/* Welcome Message */}
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '40px',
            padding: '30px',
            backgroundColor: '#f0fdf4',
            borderRadius: '8px',
            border: '2px solid #22c55e'
          }}>
            <h2 style={{ color: '#22c55e', marginBottom: '15px' }}>
              Welcome to Teacher DATA App
            </h2>
            <p style={{ color: '#333', fontSize: '16px', lineHeight: '1.6' }}>
              Secure digital document management system for teachers and administrative staff.
            </p>
            <p style={{ color: '#666', fontSize: '14px', marginTop: '10px' }}>
              Peshawar, Pakistan
            </p>
          </div>

          {/* Features Grid */}
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ 
              color: '#22c55e', 
              textAlign: 'center',
              marginBottom: '20px',
              fontSize: '18px'
            }}>
              Key Features
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '15px',
              marginBottom: '20px'
            }}>
              <div style={{
                padding: '15px',
                backgroundColor: '#fef3c7',
                borderRadius: '8px',
                borderLeft: '4px solid #84cc16'
              }}>
                <div style={{ fontSize: '20px', marginBottom: '5px' }}>📄</div>
                <div style={{ fontWeight: 'bold', color: '#333', fontSize: '14px' }}>
                  Upload Documents
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  Organize by category
                </div>
              </div>

              <div style={{
                padding: '15px',
                backgroundColor: '#dcfce7',
                borderRadius: '8px',
                borderLeft: '4px solid #22c55e'
              }}>
                <div style={{ fontSize: '20px', marginBottom: '5px' }}>🔒</div>
                <div style={{ fontWeight: 'bold', color: '#333', fontSize: '14px' }}>
                  Secure Access
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  Role-based control
                </div>
              </div>

              <div style={{
                padding: '15px',
                backgroundColor: '#fef3c7',
                borderRadius: '8px',
                borderLeft: '4px solid #84cc16'
              }}>
                <div style={{ fontSize: '20px', marginBottom: '5px' }}>📊</div>
                <div style={{ fontWeight: 'bold', color: '#333', fontSize: '14px' }}>
                  Track History
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  Access logs & audit trail
                </div>
              </div>

              <div style={{
                padding: '15px',
                backgroundColor: '#dcfce7',
                borderRadius: '8px',
                borderLeft: '4px solid #22c55e'
              }}>
                <div style={{ fontSize: '20px', marginBottom: '5px' }}>📱</div>
                <div style={{ fontWeight: 'bold', color: '#333', fontSize: '14px' }}>
                  Mobile Ready
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  Works on all devices
                </div>
              </div>
            </div>
          </div>

          {/* Document Categories */}
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ 
              color: '#22c55e', 
              textAlign: 'center',
              marginBottom: '15px',
              fontSize: '16px'
            }}>
              Document Categories
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px'
            }}>
              <div style={{ padding: '10px', backgroundColor: '#f3f4f6', borderRadius: '6px', fontSize: '13px' }}>
                ✓ Personal Documents
              </div>
              <div style={{ padding: '10px', backgroundColor: '#f3f4f6', borderRadius: '6px', fontSize: '13px' }}>
                ✓ Education & Certificates
              </div>
              <div style={{ padding: '10px', backgroundColor: '#f3f4f6', borderRadius: '6px', fontSize: '13px' }}>
                ✓ Employment Records
              </div>
              <div style={{ padding: '10px', backgroundColor: '#f3f4f6', borderRadius: '6px', fontSize: '13px' }}>
                ✓ Training Materials
              </div>
              <div style={{ padding: '10px', backgroundColor: '#f3f4f6', borderRadius: '6px', fontSize: '13px', gridColumn: '1 / -1' }}>
                ✓ Additional Files & Archives
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div style={{
            display: 'flex',
            gap: '15px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => router.push('/auth?tab=login')}
              style={{
                padding: '12px 30px',
                backgroundColor: '#22c55e',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#16a34a';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#22c55e';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              🔐 Login
            </button>

            <button
              onClick={() => router.push('/auth?tab=signup')}
              style={{
                padding: '12px 30px',
                backgroundColor: '#84cc16',
                color: '#333',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#65a30d';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#84cc16';
                e.currentTarget.style.color = '#333';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              ➕ Sign Up
            </button>
          </div>

          {/* School Info */}
          <div style={{
            marginTop: '40px',
            paddingTop: '30px',
            borderTop: '2px solid #e5e7eb',
            textAlign: 'center',
            fontSize: '13px',
            color: '#666'
          }}>
            <p>
              <strong>GPS Shagi Hindkian School</strong><br />
              Peshawar, Khyber Pakhtunkhwa<br />
              <br />
              📧 <a href="mailto:gpsshagihindkian@proton.me" style={{ color: '#22c55e', textDecoration: 'none' }}>
                gpsshagihindkian@proton.me
              </a>
            </p>
          </div>

          {/* Footer Note */}
          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#f0fdf4',
            borderRadius: '6px',
            textAlign: 'center',
            fontSize: '12px',
            color: '#666'
          }}>
            <p style={{ margin: '0' }}>
              📱 This system is fully responsive and works on all devices<br />
              🔒 Your data is encrypted and secure
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
