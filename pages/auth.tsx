import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase, AuthService } from '@/lib/supabase';
import styles from '@/styles/Auth.module.css';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.push('/dashboard');
      }
    };

    checkAuth();

    // If redirected here because the account isn't approved yet, explain why
    if (router.query.status === 'pending') {
      setError('Your account is still pending admin approval.');
    } else if (router.query.status === 'rejected') {
      setError('Your account request was not approved. Please contact the school office.');
    } else if (router.query.status === 'inactive') {
      setError('Your account is inactive. Please contact the admin.');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (isLogin) {
        // Sign in
        const signInData = await AuthService.signIn(email, password);

        // Check approval status before letting them into the dashboard
        const { data: profile, error: profileFetchError } = await supabase
          .from('gsh_users')
          .select('status')
          .eq('id', signInData.user!.id)
          .maybeSingle();

        if (profileFetchError) throw profileFetchError;

        if (profile?.status === 'pending') {
          await supabase.auth.signOut();
          setError(
            'Your account is still pending admin approval. Please check back soon.'
          );
          setLoading(false);
          return;
        }

        if (profile?.status === 'rejected') {
          await supabase.auth.signOut();
          setError(
            'Your account request was not approved. Please contact the school office.'
          );
          setLoading(false);
          return;
        }

        if (profile?.status === 'inactive') {
          await supabase.auth.signOut();
          setError('Your account is inactive. Please contact the admin.');
          setLoading(false);
          return;
        }

        setMessage('Login successful! Redirecting...');
        setTimeout(() => router.push('/dashboard'), 1000);
      } else {
        // Sign up
        const signUpData = await AuthService.signUp(email, password, fullName);

        if (signUpData.user) {
          // Create user profile in database - starts as "pending" until
          // an admin approves the account
          const { error: profileError } = await supabase
            .from('gsh_users')
            .insert([
              {
                id: signUpData.user.id,
                email: email,
                full_name: fullName,
                role: 'teacher', // Default role
                status: 'pending',
              },
            ]);

          if (profileError) throw profileError;

          // Sign out immediately - pending accounts shouldn't hold a
          // live session until approved
          await supabase.auth.signOut();

          setMessage(
            'Signup successful! Your account is pending admin approval. ' +
              'You will be able to log in once an admin approves your account.'
          );
          setEmail('');
          setPassword('');
          setFullName('');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.background}>
        <div className={styles.shape1}></div>
        <div className={styles.shape2}></div>
        <div className={styles.shape3}></div>
      </div>

      <div className={styles.formContainer}>
        <div className={styles.header}>
          <h1>📚 GPS Shagi Hindkian</h1>
          <p>Document Archive System</p>
          <small>Peshawar</small>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${isLogin ? styles.activeTab : ''}`}
            onClick={() => {
              setIsLogin(true);
              setError('');
              setMessage('');
            }}
          >
            Login
          </button>
          <button
            className={`${styles.tab} ${!isLogin ? styles.activeTab : ''}`}
            onClick={() => {
              setIsLogin(false);
              setError('');
              setMessage('');
            }}
          >
            Signup
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}
        {message && <div className={styles.success}>{message}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          {!isLogin && (
            <div className={styles.formGroup}>
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required={!isLogin}
                disabled={loading}
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className={styles.button}
            disabled={loading}
          >
            {loading ? 'Processing...' : isLogin ? 'Login' : 'Signup'}
          </button>
        </form>

        <div className={styles.footer}>
          <p>
            © 2024 GPS Shagi Hindkian School<br />
            <small>Developed and Designed by Jamal Abdul Nasir</small>
          </p>
        </div>
      </div>
    </div>
  );
}
