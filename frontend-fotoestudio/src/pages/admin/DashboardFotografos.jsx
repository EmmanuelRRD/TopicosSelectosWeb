import { useState, useEffect } from 'react';

const DashboardFotografos = () => {
    const [fotografos, setFotografos] = useState([]);
    const [fotografoSeleccionado, setFotografoSeleccionado] = useState(null); // Consulta unitaria
    const [buscar, setBuscar] = useState('');
    const [error, setError] = useState(null);

    const API_FOTOGRAFOS = 'http://127.0.0.1:8000/api/fotografos/';

    const getHeaders = () => {
        const token = localStorage.getItem('access_token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    // 1. CONSULTA GENERAL (GET ALL)
    const obtenerFotografos = () => {
        fetch(API_FOTOGRAFOS, { method: 'GET', headers: getHeaders() })
            .then(res => res.ok ? res.json() : Promise.reject("Error al conectar con el servidor de MySQL."))
            .then(data => {
                // Soportamos si viene paginado (.results) o si es un array plano directo
                const lista = data.results || data;
                if (Array.isArray(lista)) {
                    setFotografos(lista);
                }
            })
            .catch(err => setError(err.message));
    };

    useEffect(() => {
        obtenerFotografos();
    }, []);

    // 2. CONSULTA UNITARIA (GET INDIVIDUAL)
    const verDetalleFotografo = (id) => {
        fetch(`${API_FOTOGRAFOS}${id}/`, { method: 'GET', headers: getHeaders() })
            .then(res => res.ok ? res.json() : Promise.reject("No se encontró el registro de este fotógrafo."))
            .then(data => setFotografoSeleccionado(data))
            .catch(err => alert("❌ Error en Django:\n" + err));
    };

    // Filtro dinámico en memoria para la barra de búsqueda
    const fotografosFiltrados = fotografos.filter(f => 
        `${f.first_name} ${f.last_name}`.toLowerCase().includes(buscar.toLowerCase()) ||
        f.username.toLowerCase().includes(buscar.toLowerCase()) ||
        f.email.toLowerCase().includes(buscar.toLowerCase())
    );

    return (
        <div className="space-y-6">
            
            {/* Encabezado del Módulo */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-900 p-6 border border-zinc-800 rounded-3xl">
                <div>
                    <h3 className="text-2xl font-black text-white">📸 Plantilla de Fotógrafos</h3>
                    <p className="text-xs text-zinc-400 mt-1">Directorio de colaboradores activos y asignación de personal</p>
                </div>
                <input 
                    type="text"
                    placeholder="Buscar por nombre, usuario o email..."
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-600 w-full sm:w-80 font-medium"
                    value={buscar}
                    onChange={(e) => setBuscar(e.target.value)}
                />
            </div>

            {error && (
                <div className="p-4 bg-red-900/30 border border-red-500 rounded-xl text-red-200 text-sm font-semibold">
                    ⚠️ {error}
                </div>
            )}

            {/* Grid de Tarjetas de Fotógrafos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {fotografosFiltrados.length > 0 ? (
                    fotografosFiltrados.map(f => (
                        <div 
                            key={f.id} 
                            className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl relative overflow-hidden group hover:border-zinc-700 transition-all flex flex-col justify-between"
                        >
                            <div className="space-y-4">
                                {/* Avatar con iniciales */}
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-tr from-amber-600 to-orange-500 rounded-2xl flex items-center justify-center font-black text-white text-lg shadow-md">
                                        {f.first_name[0]}{f.last_name[0]}
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                                            {f.first_name} {f.last_name}
                                        </h4>
                                        <p className="text-xs text-zinc-500 font-mono">@{f.username}</p>
                                    </div>
                                </div>

                                {/* Datos de contacto en el catálogo */}
                                <div className="bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/80 space-y-1.5 text-xs font-medium">
                                    <div className="text-zinc-400 truncate">
                                        <span className="text-zinc-600">✉️</span> {f.email}
                                    </div>
                                    <div className="text-zinc-400">
                                        <span className="text-zinc-600">🏷️</span> Rol: <span className="text-amber-500 font-bold uppercase text-[10px] bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">{f.tipo_usuario}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Botón de Consulta Unitaria */}
                            <div className="mt-6 pt-4 border-t border-zinc-800/60">
                                <button 
                                    onClick={() => verDetalleFotografo(f.id)}
                                    className="w-full bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    <span>👁️</span> Ver Ficha del Colaborador
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-16 bg-zinc-900 border border-zinc-800 border-dashed rounded-3xl text-zinc-500 italic">
                        No se encontraron fotógrafos registrados con esos criterios.
                    </div>
                )}
            </div>

            {/* ========================================================
                🔍 MODAL OSCURO: DETALLE UNITARIO DEL FOTÓGRAFO 🔍
               ======================================================== */}
            {fotografoSeleccionado && (
                <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fadeIn">
                    <div className="bg-zinc-900 border border-zinc-800 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden text-zinc-200">
                        
                        {/* Encabezado del Modal */}
                        <div className="bg-zinc-950 p-4 border-b border-zinc-800 flex justify-between items-center">
                            <span className="text-xs font-black uppercase tracking-wider text-amber-500">Ficha Técnica de Personal</span>
                            <button 
                                onClick={() => setFotografoSeleccionado(null)} 
                                className="text-zinc-500 hover:text-white font-bold text-sm"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Cuerpo del Modal */}
                        <div className="p-6 space-y-5">
                            <div className="text-center space-y-2">
                                <div className="w-16 h-16 bg-gradient-to-tr from-amber-600 to-orange-500 rounded-2xl flex items-center justify-center font-black text-white text-2xl mx-auto shadow-lg">
                                    {fotografoSeleccionado.first_name[0]}{fotografoSeleccionado.last_name[0]}
                                </div>
                                <h4 className="text-xl font-black text-white">{`${fotografoSeleccionado.first_name} ${fotografoSeleccionado.last_name}`}</h4>
                                <p className="text-xs text-zinc-500 font-mono">ID de Empleado MySQL: #{fotografoSeleccionado.id}</p>
                            </div>

                            {/* Datos del Servidor Django */}
                            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800/80 space-y-3 font-medium text-xs">
                                <div className="flex justify-between border-b border-zinc-900 pb-2">
                                    <span className="text-zinc-500">Username:</span>
                                    <span className="text-zinc-200 font-mono">@{fotografoSeleccionado.username}</span>
                                </div>
                                <div className="flex justify-between border-b border-zinc-900 pb-2">
                                    <span className="text-zinc-500">Correo Corporativo:</span>
                                    <span className="text-zinc-200">{fotografoSeleccionado.email}</span>
                                </div>
                                <div className="flex justify-between border-b border-zinc-900 pb-2">
                                    <span className="text-zinc-500">Clasificación de Puesto:</span>
                                    <span className="text-amber-400 font-bold uppercase">{fotografoSeleccionado.tipo_usuario}</span>
                                </div>
                                <div className="flex justify-between pt-1">
                                    <span className="text-zinc-500">Estado en Servidor:</span>
                                    <span className="text-green-400 font-bold uppercase text-[10px] bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20">
                                        Conectado vía JWT
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Botón de Salida */}
                        <div className="p-4 bg-zinc-950 border-t border-zinc-800">
                            <button 
                                onClick={() => setFotografoSeleccionado(null)} 
                                className="w-full bg-amber-600 hover:bg-amber-500 text-zinc-950 font-black text-xs py-3 rounded-xl transition-colors tracking-wider uppercase"
                            >
                                Cerrar Ficha del Staff
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardFotografos;