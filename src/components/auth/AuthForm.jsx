import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { FiShield, FiArrowLeft, FiMail, FiCheckCircle } from 'react-icons/fi';
import { login, register as registerThunk, googleLogin, verifyTwoFactor, enrollVerifyTwoFactor } from '@/store/authSlice';
import { authService } from '@/services/auth.service';
import { GOOGLE_CLIENT_ID } from '@/constants';
import GoogleButton from './GoogleButton';

/**
 * Formulaire d'authentification unifié : connexion / inscription, connexion
 * Google, et étape 2FA. Utilisé dans les pages Login/Register et la modale.
 * @param {'login'|'register'} initialMode
 * @param {(user)=>void} onSuccess
 */
export default function AuthForm({ initialMode = 'login', onSuccess }) {
  const dispatch = useDispatch();
  // 'forgot' comme mode initial → on ouvre directement l'étape « mot de passe oublié ».
  const [mode, setMode] = useState(initialMode === 'forgot' ? 'login' : initialMode);
  const [step, setStep] = useState(initialMode === 'forgot' ? 'forgot' : 'form'); // 'form' | 'twofa' | 'setup' | 'forgot'
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [code, setCode] = useState('');
  const [tempToken, setTempToken] = useState(null);
  const [enroll, setEnroll] = useState(null); // { qr, secret }
  const [setupLoading, setSetupLoading] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const set = (patch) => { setF((p) => ({ ...p, ...patch })); setError(''); };
  const isLogin = mode === 'login';

  const finish = useCallback(
    async (result) => {
      // Admin sans 2FA → enrôlement obligatoire (scan du QR) avant d'entrer.
      if (result.twoFactorSetupRequired) {
        setTempToken(result.tempToken);
        setStep('setup');
        setSetupLoading(true);
        try {
          const r = await authService.enroll2fa(result.tempToken);
          setEnroll(r.data);
        } catch {
          setError('Impossible de démarrer la configuration 2FA.');
        } finally {
          setSetupLoading(false);
        }
        return;
      }
      if (result.twoFactorRequired) {
        setTempToken(result.tempToken);
        setStep('twofa');
        return;
      }
      onSuccess?.(result.user);
    },
    [onSuccess]
  );

  async function submitForm(e) {
    e.preventDefault();
    setError('');
    if (!f.email || !f.password) return setError('Email et mot de passe requis');
    if (!isLogin && !f.name) return setError('Nom requis');
    if (!isLogin && f.password.length < 6) return setError('Mot de passe : 6 caractères minimum');
    if (!isLogin && f.password !== f.confirmPassword) return setError('Les mots de passe ne correspondent pas');
    setLoading(true);
    try {
      const result = isLogin
        ? await dispatch(login({ email: f.email, password: f.password })).unwrap()
        : await dispatch(registerThunk({ name: f.name, email: f.email, phone: f.phone, password: f.password })).unwrap();
      finish(result);
    } catch (err) {
      setError(err.message || (isLogin ? 'Identifiants incorrects' : 'Inscription impossible'));
    } finally {
      setLoading(false);
    }
  }

  async function submitForgot(e) {
    e.preventDefault();
    setError('');
    if (!f.email.trim()) return setError('Entrez votre adresse e-mail.');
    setLoading(true);
    try {
      await authService.forgotPassword(f.email.trim());
      setForgotSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  }

  const onGoogle = useCallback(
    async (credential) => {
      setError('');
      setLoading(true);
      try {
        const result = await dispatch(googleLogin(credential)).unwrap();
        finish(result);
      } catch (err) {
        setError(err.message || 'Connexion Google impossible');
      } finally {
        setLoading(false);
      }
    },
    [dispatch, finish]
  );

  async function submitCode(e) {
    e.preventDefault();
    setError('');
    if (code.length < 6) return setError('Entrez le code à 6 chiffres');
    setLoading(true);
    try {
      const result = await dispatch(verifyTwoFactor({ tempToken, code })).unwrap();
      onSuccess?.(result.user);
    } catch {
      setError('Code invalide ou expiré');
    } finally {
      setLoading(false);
    }
  }

  async function submitEnroll(e) {
    e.preventDefault();
    setError('');
    if (code.length < 6) return setError('Entrez le code à 6 chiffres');
    setLoading(true);
    try {
      const result = await dispatch(enrollVerifyTwoFactor({ tempToken, code })).unwrap();
      onSuccess?.(result.user);
    } catch {
      setError('Code invalide — réessayez');
    } finally {
      setLoading(false);
    }
  }

  // ---- Étape enrôlement 2FA (1re connexion admin) ----
  if (step === 'setup') {
    return (
      <div>
        <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-accent-light text-accent">
          <FiShield size={22} />
        </div>
        <h2 className="text-xl font-extrabold dark:text-white">Sécurisez votre compte</h2>
        <p className="mt-1 text-sm text-muted">
          La double authentification est <strong>obligatoire</strong> pour les administrateurs. Scannez ce QR code
          avec Google Authenticator, puis saisissez le code à 6 chiffres.
        </p>
        {setupLoading || !enroll ? (
          <p className="mt-6 text-center text-sm text-muted">Préparation…</p>
        ) : (
          <>
            <div className="mt-5 flex flex-col items-center gap-3">
              <div className="rounded-2xl bg-white p-3 ring-1 ring-line">
                <img src={enroll.qr} alt="QR code 2FA" className="h-44 w-44" />
              </div>
              <p className="w-full break-all rounded-lg bg-surface px-3 py-2 text-center font-mono text-xs dark:bg-primary-800 dark:text-white">
                {enroll.secret}
              </p>
            </div>
            <form onSubmit={submitEnroll} className="mt-4 space-y-3">
              <input
                className="input text-center text-2xl font-bold tracking-[0.4em]"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="••••••"
                value={code}
                onChange={(e) => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                autoFocus
              />
              {error && <p className="text-sm text-danger">{error}</p>}
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Activation…' : 'Activer et se connecter'}
              </button>
            </form>
          </>
        )}
      </div>
    );
  }

  // ---- Étape « mot de passe oublié » (flottante, dans la modale) ----
  if (step === 'forgot') {
    return (
      <div>
        {forgotSent ? (
          <div className="text-center">
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-success/10 text-success">
              <FiCheckCircle size={24} />
            </div>
            <h2 className="text-xl font-extrabold dark:text-white">Vérifiez votre boîte mail</h2>
            <p className="mt-2 text-sm text-muted">
              Si un compte existe pour <strong className="text-primary dark:text-white">{f.email}</strong>, vous recevrez
              un lien pour réinitialiser votre mot de passe. Pensez à vérifier vos spams.
            </p>
            <button
              onClick={() => { setStep('form'); setForgotSent(false); setError(''); }}
              className="btn-primary mt-6 w-full"
            >
              Retour à la connexion
            </button>
          </div>
        ) : (
          <>
            <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-accent-light text-accent">
              <FiMail size={22} />
            </div>
            <h2 className="text-xl font-extrabold dark:text-white">Mot de passe oublié</h2>
            <p className="mt-1 text-sm text-muted">
              Entrez l'adresse e-mail de votre compte : nous vous enverrons un lien de réinitialisation.
            </p>
            <form onSubmit={submitForgot} className="mt-5 space-y-4">
              <input
                className="input"
                type="email"
                placeholder="Votre e-mail"
                value={f.email}
                onChange={(e) => set({ email: e.target.value })}
                autoFocus
              />
              {error && <p className="text-sm text-danger">{error}</p>}
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Envoi…' : 'Envoyer le lien'}
              </button>
            </form>
            <button
              onClick={() => { setStep('form'); setError(''); }}
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-primary dark:hover:text-white"
            >
              <FiArrowLeft size={14} /> Retour à la connexion
            </button>
          </>
        )}
      </div>
    );
  }

  // ---- Étape 2FA ----
  if (step === 'twofa') {
    return (
      <div>
        <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-accent-light text-accent">
          <FiShield size={22} />
        </div>
        <h2 className="text-xl font-extrabold dark:text-white">Vérification en deux étapes</h2>
        <p className="mt-1 text-sm text-muted">Saisissez le code à 6 chiffres de votre application d'authentification.</p>
        <form onSubmit={submitCode} className="mt-5 space-y-4">
          <input
            className="input text-center text-2xl font-bold tracking-[0.4em]"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="••••••"
            value={code}
            onChange={(e) => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
            autoFocus
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Vérification…' : 'Valider'}
          </button>
        </form>
        <button
          onClick={() => { setStep('form'); setCode(''); setError(''); }}
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-primary dark:hover:text-white"
        >
          <FiArrowLeft size={14} /> Retour
        </button>
      </div>
    );
  }

  // ---- Étape connexion / inscription ----
  return (
    <div>
      <h2 className="text-xl font-extrabold dark:text-white">{isLogin ? 'Connexion' : 'Créer un compte'}</h2>
      <p className="mt-1 text-sm text-muted">
        {isLogin ? 'Accédez à votre compte' : 'Rejoignez Cheikh Tidiane Apple'}
      </p>

      {GOOGLE_CLIENT_ID && (
        <div className="mt-5">
          <GoogleButton onCredential={onGoogle} text={isLogin ? 'signin_with' : 'signup_with'} />
          <div className="my-4 flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-line dark:bg-white/10" /> ou <span className="h-px flex-1 bg-line dark:bg-white/10" />
          </div>
        </div>
      )}

      <form onSubmit={submitForm} className={GOOGLE_CLIENT_ID ? 'space-y-4' : 'mt-5 space-y-4'}>
        {!isLogin && (
          <input className="input" placeholder="Nom complet" value={f.name} onChange={(e) => set({ name: e.target.value })} />
        )}
        <input className="input" type="email" placeholder="Email" value={f.email} onChange={(e) => set({ email: e.target.value })} />
        {!isLogin && (
          <input className="input" placeholder="Téléphone (optionnel)" value={f.phone} onChange={(e) => set({ phone: e.target.value })} />
        )}
        <input className="input" type="password" placeholder="Mot de passe" value={f.password} onChange={(e) => set({ password: e.target.value })} />
        {!isLogin && (
          <input className="input" type="password" placeholder="Confirmer le mot de passe" value={f.confirmPassword} onChange={(e) => set({ confirmPassword: e.target.value })} />
        )}
        {isLogin && (
          <div className="-mt-1 text-right">
            <button
              type="button"
              onClick={() => { setStep('forgot'); setForgotSent(false); setError(''); }}
              className="text-sm font-semibold text-accent hover:underline"
            >
              Mot de passe oublié ?
            </button>
          </div>
        )}
        {error && <p className="text-sm text-danger">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? '…' : isLogin ? 'Se connecter' : "S'inscrire"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        {isLogin ? 'Pas encore de compte ?' : 'Déjà un compte ?'}{' '}
        <button
          onClick={() => { setMode(isLogin ? 'register' : 'login'); setError(''); }}
          className="font-semibold text-accent hover:underline"
        >
          {isLogin ? "S'inscrire" : 'Se connecter'}
        </button>
      </p>
    </div>
  );
}
