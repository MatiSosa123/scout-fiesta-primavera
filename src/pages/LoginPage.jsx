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
      navigate('/admin'); // Si el login es exitoso, va al panel
    } catch (err) {
      setError('Email o contraseña incorrectos.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full text-center">
        <div className="flex justify-center mb-4 text-blue-600">
          <Lock size={48} />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Acceso Administrador</h1>
        
        {error && <p className="bg-red-100 text-red-600 p-2 rounded mb-4 text-sm">{error}</p>}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="email" placeholder="Email" required 
            className="w-full border p-3 rounded-lg focus:outline-blue-500"
            value={email} onChange={e => setEmail(e.target.value)}
          />
          <input 
            type="password" placeholder="Contraseña" required 
            className="w-full border p-3 rounded-lg focus:outline-blue-500"
            value={password} onChange={e => setPassword(e.target.value)}
          />
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors">
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;