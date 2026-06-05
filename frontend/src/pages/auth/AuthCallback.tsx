import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function AuthCallback() {
  const [params] = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    if (!token) return navigate('/login');
    // Temporarily set token so fetchMe can use it
    localStorage.setItem('auth', JSON.stringify({ state: { token } }));
    fetchMe().then(() => {
      const user = useAuthStore.getState().user;
      if (user) setAuth(user, token);
      navigate('/admin');
    }).catch(() => navigate('/login'));
  }, []);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-white/50">Completing sign in...</div>
    </div>
  );
}
