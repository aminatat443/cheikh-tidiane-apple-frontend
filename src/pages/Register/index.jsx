import { useNavigate } from 'react-router-dom';
import AuthForm from '@/components/auth/AuthForm';
import { isAdmin } from '@/utils/roles';

export default function Register() {
  const navigate = useNavigate();
  return (
    <div className="container-page flex justify-center py-16">
      <div className="card w-full max-w-md p-8">
        <AuthForm initialMode="register" onSuccess={(u) => navigate(isAdmin(u) ? '/admin' : '/')} />
      </div>
    </div>
  );
}
