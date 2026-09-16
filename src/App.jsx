import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

import PublicPage from './pages/PublicPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';

// Componente para proteger la ruta /admin
function RutaProtegida({ children }) {
  const [user, setUser] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usuario) => {
      setUser(usuario);
      setCargando(false);
    });
    return () => unsubscribe();
  }, []);

  if (cargando) return <div className="min-h-screen flex items-center justify-center font-bold text-blue-600">Verificando acceso... 🔐</div>;
  
  // Si hay usuario, muestra el panel. Si no, lo manda al login.
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route 
          path="/admin" 
          element={
            <RutaProtegida>
              <AdminPage />
            </RutaProtegida>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;