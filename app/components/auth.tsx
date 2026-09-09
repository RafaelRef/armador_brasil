'use client';
import { useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { CircleDot, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
export function AuthGate({
  children,
}: {
  children: (session: Session) => ReactNode;
}) {
  const [session, S] = useState<Session | null>(null),
    [ready, R] = useState(false),
    [recovery, Recovery] = useState(false);
  useEffect(() => {
    let active = true;
    const { data } = supabase.auth.onAuthStateChange((event, s) => {
      if (!active) return;
      S(s);
      R(true);
      if (event === 'PASSWORD_RECOVERY') Recovery(true);
      if (event === 'SIGNED_OUT') Recovery(false);
    });
    void supabase.auth.getSession().then(({ data }) => {
      if (active) {
        S(data.session);
        R(true);
      }
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);
  if (!ready)
    return (
      <div className="auth-loading">
        <CircleDot />
        Carregando sua conta…
      </div>
    );
  if (session && !recovery) return children(session);
  return <Login recovery={recovery} onRecovered={() => Recovery(false)} />;
}
function Login({
  recovery,
  onRecovered,
}: {
  recovery: boolean;
  onRecovered: () => void;
}) {
  const [mode, M] = useState('login'),
    [email, E] = useState(''),
    [password, P] = useState(''),
    [confirm, C] = useState(''),
    [show, Show] = useState(false),
    [busy, B] = useState(false),
    [error, Err] = useState(''),
    [message, Msg] = useState('');
  const reset = mode === 'reset';
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    B(true);
    Err('');
    Msg('');
    try {
      if ((mode === 'signup' || recovery) && password !== confirm)
        throw new Error('As senhas precisam ser iguais.');
      let error;
      if (recovery) {
        ({ error } = await supabase.auth.updateUser({ password }));
        if (!error) {
          onRecovered();
          return;
        }
      } else if (reset) {
        ({ error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: window.location.origin + '/',
        }));
        if (!error)
          Msg(
            'Se houver uma conta com esse e-mail, você receberá um link para redefinir sua senha.',
          );
      } else if (mode === 'signup') {
        const result = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: window.location.origin + '/' },
        });
        error = result.error;
        if (!error && !result.data.session)
          Msg(
            'Confira seu e-mail para confirmar o cadastro e entrar na sua conta.',
          );
      } else {
        ({ error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        }));
      }
      if (error) {
        if (error.code === 'invalid_credentials')
          throw new Error('E-mail ou senha incorretos.');
        if (error.code === 'email_not_confirmed')
          throw new Error('Confirme seu e-mail antes de entrar.');
        if (error.status === 429)
          throw new Error(
            'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
          );
        throw error;
      }
    } catch (e) {
      Err(
        e instanceof Error
          ? e.message
          : 'Não foi possível concluir. Tente novamente.',
      );
    } finally {
      B(false);
    }
  }
  return (
    <main className="auth-page">
      <section className="auth-brand">
        <div className="brand">
          <CircleDot size={30} />
          <span>
            ARMADOR <b>BRASIL</b>
          </span>
        </div>
        <div className="auth-intro">
          <span className="eyebrow">DO BANCO À ANÁLISE</span>
          <h1>
            Seu time.
            <br />
            Cada lance.
            <br />
            <em>Toda a história.</em>
          </h1>
          <p>
            Registre a partida e transforme o que acontece na quadra em
            estatísticas para sua equipe.
          </p>
          <div className="auth-lines" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>
        <p className="auth-foot">BASQUETE · ESTATÍSTICAS · EVOLUÇÃO</p>
      </section>
      <section className="auth-form">
        <div className="login-card">
          <div className="login-mark">
            <CircleDot size={30} />
          </div>
          <h2>
            {recovery
              ? 'Crie uma nova senha'
              : reset
                ? 'Recuperar acesso'
                : 'Bem-vindo à sua equipe'}
          </h2>
          <p className="muted">
            {recovery
              ? 'Escolha uma senha com pelo menos 8 caracteres.'
              : reset
                ? 'Informe o e-mail usado no seu cadastro.'
                : 'Entre para acessar suas equipes e partidas.'}
          </p>
          {!recovery && !reset && (
            <Tabs
              value={mode}
              onValueChange={(v) => {
                M(String(v));
                Err('');
                Msg('');
              }}
            >
              <TabsList className="auth-tabs">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Criar conta</TabsTrigger>
              </TabsList>
            </Tabs>
          )}
          <form onSubmit={submit}>
            {!recovery && (
              <label>
                E-mail
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="voce@exemplo.com"
                  value={email}
                  required
                  onChange={(e) => E(e.target.value)}
                />
              </label>
            )}
            {!reset && (
              <>
                <label>
                  Senha
                  <div className="password-field">
                    <input
                      type={show ? 'text' : 'password'}
                      minLength={mode === 'signup' || recovery ? 8 : 1}
                      autoComplete={
                        mode === 'signup' || recovery
                          ? 'new-password'
                          : 'current-password'
                      }
                      required
                      value={password}
                      onChange={(e) => P(e.target.value)}
                    />
                    <button
                      type="button"
                      aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
                      onClick={() => Show(!show)}
                    >
                      {show ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </label>
                {(mode === 'signup' || recovery) && (
                  <label>
                    Confirmar senha
                    <input
                      type={show ? 'text' : 'password'}
                      autoComplete="new-password"
                      minLength={8}
                      required
                      value={confirm}
                      onChange={(e) => C(e.target.value)}
                    />
                  </label>
                )}
              </>
            )}
            {error && (
              <p role="alert" className="error">
                {error}
              </p>
            )}
            {message && (
              <p role="status" className="success">
                <CheckCircle2 size={20} />
                {message}
              </p>
            )}
            <button className="primary full" disabled={busy}>
              {busy
                ? 'Aguarde…'
                : recovery
                  ? 'Salvar nova senha'
                  : reset
                    ? 'Enviar link'
                    : mode === 'signup'
                      ? 'Criar minha conta'
                      : 'Entrar na minha conta'}
              {!busy && <ArrowRight size={18} />}
            </button>
          </form>
          {!recovery && (
            <button
              className="text-button forgot"
              onClick={() => {
                M(reset ? 'login' : 'reset');
                Err('');
                Msg('');
              }}
            >
              {reset ? 'Voltar ao login' : 'Esqueci minha senha'}
            </button>
          )}
          <div className="login-note">
            Suas equipes e partidas ficam vinculadas à sua conta.
          </div>
        </div>
      </section>
    </main>
  );
}
