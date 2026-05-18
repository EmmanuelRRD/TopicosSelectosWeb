import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [sexo, setSexo] = useState('M'); 

  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [exito, setExito] = useState(false);

  const enviarRegistro = async (e) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    const datosUsuario = {
      username: username.trim(),
      email: email.trim(),
      password: password,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      sexo: sexo,
      tipo_usuario: 'cliente' 
    };

    console.log("Mandando datos al endpoint /registro/:", datosUsuario);

    try {
      // USAMOS LA URL REAL DE TU URLS.PY (Sin el api/)
      const response = await fetch('http://127.0.0.1:8000/registro/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosUsuario),
      });

      const esJson = response.headers.get('content-type')?.includes('application/json');
      const data = esJson ? await response.json() : null;

      if (response.ok) {
        setExito(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        if (data) {
          let erroresTraducidos = [];
          Object.keys(data).forEach(campo => {
            erroresTraducidos.push(`${campo}: ${data[campo]}`);
          });
          setError(erroresTraducidos.join(' | '));
        } else {
          setError(`Error del servidor (${response.status}). Revisa tus rutas de Django.`);
        }
      }
    } catch (err) {
      console.error("Error de conexión:", err);
      setError("Error de red: No se pudo conectar con Django.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 bg-blue-600 rounded-full italic flex items-center justify-center font-black text-white group-hover:bg-blue-500 transition-colors">F</div>
            <span className="text-2xl font-bold tracking-tighter uppercase">Estudio Jerez</span>
          </Link>
          <h2 className="text-zinc-400 mt-2 font-medium">Crear Cuenta de Cliente</h2>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl">
          
          {error && (
            <div className="mb-5 bg-red-900/40 border border-red-500 text-red-200 text-xs p-3 rounded-xl font-medium">
              ⚠️ {error}
            </div>
          )}

          {exito && (
            <div className="mb-5 bg-green-900/40 border border-green-500 text-green-200 text-xs p-3 rounded-xl font-medium">
              🎉 ¡Registro exitoso! Redirigiendo al Login...
            </div>
          )}

          <form onSubmit={enviarRegistro} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Nombre(s)</label>
              <input type="text" required className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-600"
                placeholder="Juan" value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={cargando || exito} />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Apellido(s)</label>
              <input type="text" required className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-600"
                placeholder="Pérez" value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={cargando || exito} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Usuario</label>
                <input type="text" required className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-600"
                  placeholder="ej. emmanuel" value={username} onChange={(e) => setUsername(e.target.value)} disabled={cargando || exito} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Sexo</label>
                <select className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-300 text-sm focus:outline-none focus:border-blue-600"
                  value={sexo} onChange={(e) => setSexo(e.target.value)} disabled={cargando || exito}>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="N">Sin especificar</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Correo Electrónico</label>
              <input type="email" required className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-600"
                placeholder="ejemplo@ez.mx" value={email} onChange={(e) => setEmail(e.target.value)} disabled={cargando || exito} />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Contraseña</label>
              <input type="password" required className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-600"
                placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} disabled={cargando || exito} />
            </div>

            <button type="submit" disabled={cargando || exito}
              className={`w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg text-sm mt-2 ${cargando || exito ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
              {cargando ? 'Guardando en Base de Datos...' : 'Crear Cuenta'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-zinc-500">
            <p>¿Ya tienes cuenta? <Link to="/login" className="text-white hover:underline font-bold">Inicia Sesión.</Link></p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-zinc-500 hover:text-zinc-300 text-xs transition-colors">
            ← Volver al inicio
          </Link>
        </div>

      </div>
    </div>
  );
}

export default Register;