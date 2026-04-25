import { useState } from 'react';
import { Link } from 'react-router-dom';

function Login() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Intentando conectar con Django...", credentials);
    // Aquí irá tu lógica de autenticación más adelante
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Logo / Regreso */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 bg-blue-600 rounded-full italic flex items-center justify-center font-black text-white group-hover:bg-blue-500 transition-colors">F</div>
            <span className="text-2xl font-bold tracking-tighter uppercase">Estudio Jerez</span>
          </Link>
          <h2 className="text-zinc-400 mt-4 font-medium">Panel Administrativo</h2>
        </div>

        {/* Card de Login */}
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold mb-2 text-zinc-300">Correo Electrónico</label>
              <input 
                type="email" 
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600 transition-colors text-white"
                placeholder="nombre@ejemplo.com"
                onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 text-zinc-300">Contraseña</label>
              <input 
                type="password" 
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600 transition-colors text-white"
                placeholder="••••••••"
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                required
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/20 cursor-pointer"
            >
              Iniciar Sesión
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-zinc-500">
            <p>¿Olvidaste tu acceso? Contacta al administrador de Sistemas.</p>
          </div>
        </div>

        {/* Botón para volver */}
        <div className="text-center mt-8">
          <Link to="/" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">
            ← Volver a la página principal
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;