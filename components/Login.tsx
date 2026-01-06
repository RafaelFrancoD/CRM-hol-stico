import React, { useState } from 'react';
import { apiService } from '../services/apiService';
import { ArrowRight, Lock, Mail, UserPlus, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('mirellisilva@gmail.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isRegisterMode) {
        await apiService.register(email, password);
        setSuccess('Usuário registrado com sucesso! Agora você pode fazer o login.');
        setIsRegisterMode(false); // Volta para a tela de login
      } else {
        const response = await apiService.login(email, password);
        if (response.ok) {
          onLogin();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50">
      {/* Left Side */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-slate-900">
        <img 
          src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80" 
          alt="Ambiente de Terapia Holística" 
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-900/40 to-transparent"></div>
        <div className="relative z-10 w-full h-full flex flex-col justify-end p-16 text-white">
          <h1 className="text-5xl font-serif font-bold mb-4 leading-tight">
            Terapia Holística <br/> Mirelli Silva
          </h1>
          <p className="text-emerald-100 text-lg max-w-md font-light">
            Gerencie seu espaço de cura, conecte-se com seus pacientes e harmonize sua rotina profissional.
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white/50 backdrop-blur-sm">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-serif font-bold text-slate-800">
              {isRegisterMode ? 'Criar Conta' : 'Acesso'}
            </h2>
            <p className="text-slate-500 mt-2">
              {isRegisterMode ? 'Crie uma nova conta para acessar o sistema.' : 'Insira suas credenciais para continuar.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Login</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Senha de Acesso</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  placeholder={isRegisterMode ? "Min 8 caracteres, maiúsculas, números e símbolos" : "Digite sua senha"}
                  required
                  minLength={isRegisterMode ? 8 : 6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm text-center">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-600 text-sm text-center">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-emerald-500/20 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                isRegisterMode ? 'Registrando...' : 'Acessando...'
              ) : (
                <>
                  {isRegisterMode ? 'Registrar' : 'Entrar no Sistema'} 
                  {isRegisterMode ? <UserPlus className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                </>
              )}
            </button>
            
            <div className="pt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(!isRegisterMode);
                  setError('');
                  setSuccess('');
                }}
                className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
              >
                {isRegisterMode ? 'Já tem uma conta? Fazer Login' : 'Não tem uma conta? Registre-se'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};