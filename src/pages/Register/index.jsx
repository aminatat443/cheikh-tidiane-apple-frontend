import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { register as registerThunk } from '@/store/authSlice';

const schema = yup.object({
  name: yup.string().required('Nom requis'),
  email: yup.string().email('Email invalide').required('Email requis'),
  phone: yup.string().optional(),
  password: yup.string().min(6, '6 caractères minimum').required('Mot de passe requis'),
});

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (values) => {
    try {
      await dispatch(registerThunk(values)).unwrap();
      navigate('/');
    } catch (e) {
      setError('root', { message: e.message || 'Inscription impossible' });
    }
  };

  return (
    <div className="container-page flex justify-center py-16">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-2xl font-extrabold">Créer un compte</h1>
        <p className="mt-1 text-sm text-muted">Rejoignez Cheikh Tidiane Apple</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <input className="input" placeholder="Nom complet" {...register('name')} />
            {errors.name && <p className="mt-1 text-xs text-danger">{errors.name.message}</p>}
          </div>
          <div>
            <input className="input" placeholder="Email" {...register('email')} />
            {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
          </div>
          <div>
            <input className="input" placeholder="Téléphone (optionnel)" {...register('phone')} />
          </div>
          <div>
            <input className="input" type="password" placeholder="Mot de passe" {...register('password')} />
            {errors.password && <p className="mt-1 text-xs text-danger">{errors.password.message}</p>}
          </div>
          {errors.root && <p className="text-sm text-danger">{errors.root.message}</p>}
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? 'Création…' : "S'inscrire"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Déjà un compte ?{' '}
          <Link to="/login" className="font-semibold text-accent hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
