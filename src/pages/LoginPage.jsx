import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Lock } from 'lucide-react';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin');
    } catch (err) {
      setError('Email o contraseña incorrectos.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-800 flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* FONDO: Logo gigante sutil (blanco para que se vea en el fondo oscuro) */}
      <img 
        src="/logo.png" 
        alt="" 
        className="absolute inset-0 w-full h-full object-contain opacity-[0.06] pointer-events-none select-none invert"
      />

      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center border-t-4 border-orange-500 relative z-10">
        
        {/* Logo chiquito */}
        <div className="flex justify-center mb-2">
          <img src="/logo.png" alt="Logo del Grupo" className="h-20 w-20 object-contain" />
        </div>

        <div className="flex justify-center mb-4">
          <div className="bg-orange-100 p-4 rounded-full">
            <Lock className="text-orange-500" size={32} />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-blue-900 mb-2">Acceso Administrador</h1>
        <p className="text-slate-500 text-sm mb-6">Solo para el tesorero del grupo</p>
        
        {error && <p className="bg-red-100 text-red-600 p-2 rounded mb-4 text-sm font-medium">{error}</p>}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="email" placeholder="Email" required 
            className="w-full border-2 border-slate-200 p-3 rounded-lg focus:outline-none focus:border-blue-900 transition-colors"
            value={email} onChange={e => setEmail(e.target.value)}
          />
          <input 
            type="password" placeholder="Contraseña" required 
            className="w-full border-2 border-slate-200 p-3 rounded-lg focus:outline-none focus:border-blue-900 transition-colors"
            value={password} onChange={e => setPassword(e.target.value)}
          />
          <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-orange-200">
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;