import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GestionCitas = ({ esComponenteAdmin = false }) => {
    const navigate = useNavigate();
    const [citas, setCitas] = useState([]);
    const [paquetes, setPaquetes] = useState([]);
    const [fotografos, setFotografos] = useState([]);
    const [editandoId, setEditandoId] = useState(null);
    const [error, setError] = useState(null);

    // --- ESTADOS PARA TABLA Y BUSCADOR ---
    const [buscar, setBuscar] = useState('');
    const [pagina, setPagina] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);

    // --- ESTADO PARA EL MODAL DE DETALLES (FOTÓGRAFO) ---
    const [citaSeleccionada, setCitaSeleccionada] = useState(null);

    // --- ROLES DESDE LOCALSTORAGE ---
    const isAdmin = localStorage.getItem('is_staff') === 'true';
    const esFotografo = localStorage.getItem('tipo_usuario') === 'fotografo';
    const nombreUsuarioLogueado = localStorage.getItem('nombre_completo') || 'Usuario';

    const [nuevaCita, setNuevaCita] = useState({
        paquete: '',
        cliente: '',
        fotografo: '',
        fecha_cita: '',
        precio_total: '',
        abono: 0,
        lugar: 'Estudio Jerez',
        notas: ''
    });

    const API_URL = 'http://127.0.0.1:8000/api/citas/';
    const API_PAQUETES = 'http://127.0.0.1:8000/api/paquetes-fotografo/';
    const API_FOTOGRAFOS = 'http://127.0.0.1:8000/api/fotografos/';

    const getHeaders = () => {
        const token = localStorage.getItem('access_token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    const obtenerCitas = () => {
        const headers = getHeaders();
        let urlFiltrada = `${API_URL}?page=${pagina}`;

        if (buscar.trim() !== '') {
            urlFiltrada += `&search=${encodeURIComponent(buscar.trim())}`;
        }

        fetch(urlFiltrada, { method: 'GET', headers })
            .then(res => {
                if (res.status === 401) throw new Error("Sesión vencida. Inicia sesión de nuevo.");
                if (!res.ok) throw new Error("Error al cargar la agenda.");
                return res.json();
            })
            .then(data => {
                if (data && data.results && Array.isArray(data.results)) {
                    setCitas(data.results);
                    setTotalPaginas(Math.ceil(data.count / 5) || 1);
                    setError(null);
                } else {
                    setCitas([]);
                }
            })
            .catch(err => {
                setError(err.message);
                setCitas([]);
            });
    };

    useEffect(() => {
        obtenerCitas();
    }, [pagina, buscar]);

    useEffect(() => {
        const headers = getHeaders();
        fetch(API_PAQUETES, { method: 'GET', headers }).then(res => res.ok ? res.json() : []).then(data => setPaquetes(data));
        fetch(API_FOTOGRAFOS, { method: 'GET', headers }).then(res => res.ok ? res.json() : []).then(data => setFotografos(data));
    }, []);

    const manejarCambioPaquete = (idSeleccionado) => {
        const paqueteEncontrado = paquetes.find(p => p.id === parseInt(idSeleccionado));
        setNuevaCita({
            ...nuevaCita,
            paquete: idSeleccionado,
            precio_total: paqueteEncontrado ? paqueteEncontrado.precio_paquete : ''
        });
    };

    const prepararEdicion = (cita) => {
        setEditandoId(cita.id);
        setNuevaCita({
            paquete: cita.paquete || '',
            cliente: cita.cliente || '',
            fotografo: cita.fotografo || '',
            fecha_cita: cita.fecha_cita ? cita.fecha_cita.substring(0, 16) : '',
            precio_total: cita.precio_total || '',
            abono: cita.abono || 0,
            lugar: cita.lugar || 'Estudio Jerez',
            notas: cita.notas || ''
        });
    };

    const manejarEnvio = (e) => {
        e.preventDefault();

        const esEdicion = editandoId !== null;
        const url = esEdicion ? `${API_URL}${editandoId}/` : API_URL;
        const metodo = esEdicion ? 'PATCH' : 'POST';

        // --- 🔑 EL TRUCO: EXTRACCIÓN DEL ID DESDE EL TOKEN 🔑 ---
        let clienteId = null;

        if (isAdmin) {
            // Si eres Administrador, mandas el ID manual que escribiste en el input
            clienteId = parseInt(nuevaCita.cliente);
        } else {
            // Si eres un Cliente común, leemos el token guardado en tu navegador
            try {
                const token = localStorage.getItem('access_token');
                if (token) {
                    // El JWT se divide por puntos (header.payload.signature)
                    // Sacamos el payload [1] y lo decodificamos de Base64 con atob()
                    const payloadBase64 = token.split('.')[1];
                    const payloadDecodificado = JSON.parse(atob(payloadBase64));

                    // SimpleJWT mete el ID del usuario logueado en la propiedad 'user_id'
                    clienteId = parseInt(payloadDecodificado.user_id);
                }
            } catch (err) {
                console.error("No se pudo decodificar el ID desde el JWT:", err);
            }
        }

        // Armamos el cuerpo del JSON con los tipos de datos correctos para MySQL
        const datosAEnviar = {
            paquete: parseInt(nuevaCita.paquete),
            fecha_cita: nuevaCita.fecha_cita,
            precio_total: parseFloat(nuevaCita.precio_total) || 0,
            abono: parseFloat(nuevaCita.abono) || 0,
            lugar: nuevaCita.lugar,
            notas: nuevaCita.notas,
            cliente: clienteId, // <-- Mandamos el ID real de Emmanuel recuperado del Token
            fotografo: nuevaCita.fotografo ? parseInt(nuevaCita.fotografo) : null
        };

        console.log("Enviando JSON seguro a Django:", datosAEnviar);

        fetch(url, {
            method: metodo,
            headers: getHeaders(),
            body: JSON.stringify(datosAEnviar)
        })
            .then(async res => {
                if (res.ok) {
                    obtenerCitas();
                    cancelarEdicion();
                    alert(esEdicion ? "✅ Cita modificada" : "✅ Cita creada con éxito");
                } else {
                    const erroresBackend = await res.json();
                    console.error("Django rechazó los datos:", erroresBackend);
                    alert("❌ Error de validación en Django:\n" + JSON.stringify(erroresBackend));
                }
            })
            .catch(err => console.error("Error en operación:", err));
    };

    const cancelarEdicion = () => {
        setEditandoId(null);
        setNuevaCita({ paquete: '', cliente: '', fotografo: '', fecha_cita: '', precio_total: '', abono: 0, lugar: 'Estudio Jerez', notas: '' });
    };

    const eliminarCita = (id) => {
        if (window.confirm(`¿Seguro que deseas eliminar la cita #${id}?`)) {
            fetch(`${API_URL}${id}/`, { method: 'DELETE', headers: getHeaders() })
                .then(res => {
                    if (res.ok) {
                        obtenerCitas();
                        alert("🗑️ Cita eliminada.");
                    }
                });
        }
    };

    const cerrarSesion = () => {
        if (window.confirm("¿Seguro que deseas cerrar sesión en el sistema?")) {
            // 1. Limpiamos por completo el almacenamiento del navegador
            localStorage.clear();

            console.log("Sesión purgada correctamente. Redirigiendo...");

            // 2. Mandamos al usuario directo al Login
            navigate('/login');
        }
    };

    // Abre el modal de visualización si es fotógrafo
    const manejarClickFila = (cita) => {
        if (esFotografo) {
            setCitaSeleccionada(cita);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto">

                {/* HEADER */}
                {/* HEADER OPTIMIZADO CON BOTÓN DE SALIDA */}
                <header className="mb-10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-4xl font-black text-gray-900 tracking-tight">
                        📸 Panel <span className="text-indigo-600">Estudio Jerez</span>
                    </h2>

                    {/* Contenedor del Perfil y Botón */}
                    <div className="flex items-center gap-3">
                        {/* Badge Informativo de Usuario */}
                        <div className="bg-white border px-5 py-2.5 rounded-2xl shadow-sm text-sm font-bold text-gray-700 flex items-center gap-2">
                            👤 {nombreUsuarioLogueado}
                            <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full font-black ${isAdmin ? 'bg-blue-100 text-blue-700' : esFotografo ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                                {isAdmin ? 'Admin' : esFotografo ? 'Fotógrafo' : 'Cliente'}
                            </span>
                        </div>

                        {/* Botón de Cerrar Sesión Estilizado */}
                        <button
                            onClick={cerrarSesion}
                            className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-2xl text-sm font-black transition-all active:scale-95 shadow-sm cursor-pointer flex items-center gap-1.5"
                            title="Salir del sistema"
                        >
                            <span>🚪</span>
                            <span className="hidden sm:inline">Salir</span>
                        </button>
                    </div>
                </header>

                {error && (
                    <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-2xl font-bold">
                        ⚠️ {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* COLUMNA FORMULARIO: Sólo se renderiza si NO es fotógrafo */}
                    {!esFotografo && (
                        <div className="lg:col-span-4 bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 h-fit">
                            <h3 className={`text-2xl font-bold mb-6 ${editandoId ? 'text-orange-500' : 'text-indigo-600'}`}>
                                {editandoId ? '🔧 Editar Registro' : '➕ Nueva Cita'}
                            </h3>

                            <form onSubmit={manejarEnvio} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Paquete Fotográfico</label>
                                    <select className="w-full mt-1 p-3 bg-gray-50 border rounded-xl outline-none font-medium text-gray-700"
                                        value={nuevaCita.paquete} onChange={e => manejarCambioPaquete(e.target.value)} required>
                                        <option value="">-- Selecciona un Paquete --</option>
                                        {paquetes.map(p => <option key={p.id} value={p.id}>{p.nombre} (${p.precio_paquete})</option>)}
                                    </select>
                                </div>

                                {isAdmin && (
                                    <div>
                                        <label className="text-xs font-bold text-blue-600 uppercase tracking-widest">ID Cliente (Admin)</label>
                                        <input type="number" className="w-full mt-1 p-3 bg-blue-50/40 border border-blue-200 rounded-xl outline-none font-bold text-gray-700"
                                            value={nuevaCita.cliente} onChange={e => setNuevaCita({ ...nuevaCita, cliente: e.target.value })} required />
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Precio Total ($)</label>
                                        <input type="number" step="0.01" className="w-full mt-1 p-3 bg-gray-100 border rounded-xl outline-none font-mono font-bold text-gray-500 cursor-not-allowed"
                                            value={nuevaCita.precio_total} readOnly required />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Abono ($)</label>
                                        <input type="number" step="0.01" className="w-full mt-1 p-3 bg-gray-50 border rounded-xl outline-none"
                                            value={nuevaCita.abono} onChange={e => setNuevaCita({ ...nuevaCita, abono: e.target.value })} />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Fotógrafo Asignado</label>
                                    <select className="w-full mt-1 p-3 bg-gray-50 border rounded-xl outline-none font-medium text-gray-700"
                                        value={nuevaCita.fotografo || ''} onChange={e => setNuevaCita({ ...nuevaCita, fotografo: e.target.value })}>
                                        <option value="">-- Sin fotógrafo asignado (NULL) --</option>
                                        {fotografos.map(f => <option key={f.id} value={f.id}>{f.first_name} {f.last_name}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Fecha y Hora</label>
                                    <input type="datetime-local" className="w-full mt-1 p-3 bg-gray-50 border rounded-xl outline-none"
                                        value={nuevaCita.fecha_cita} onChange={e => setNuevaCita({ ...nuevaCita, fecha_cita: e.target.value })} required />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Lugar</label>
                                    <input type="text" className="w-full mt-1 p-3 bg-gray-50 border rounded-xl outline-none"
                                        value={nuevaCita.lugar} onChange={e => setNuevaCita({ ...nuevaCita, lugar: e.target.value })} />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Notas Adicionales</label>
                                    <textarea className="w-full mt-1 p-3 bg-gray-50 border rounded-xl h-20 outline-none"
                                        value={nuevaCita.notas} onChange={e => setNuevaCita({ ...nuevaCita, notas: e.target.value })}></textarea>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button type="submit" className={`flex-1 py-4 rounded-2xl text-white font-bold shadow-lg transition-all ${editandoId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                                        {editandoId ? 'Guardar Cambios' : 'Confirmar Alta'}
                                    </button>
                                    {editandoId && <button type="button" onClick={cancelarEdicion} className="px-6 py-4 bg-gray-200 text-gray-600 rounded-2xl font-bold">Cancelar</button>}
                                </div>
                            </form>
                        </div>
                    )}

                    {/* COLUMNA TABLA: Si es fotógrafo ocupa todo el ancho (lg:col-span-12), si no, usa 8 espacios */}
                    <div className={`${esFotografo ? 'lg:col-span-12' : 'lg:col-span-8'} space-y-4`}>

                        {/* BUSCADOR */}
                        <div className="bg-white p-4 rounded-3xl shadow-md border border-gray-100 flex items-center gap-3">
                            <span className="text-xl">🔍</span>
                            <input type="text" className="w-full outline-none text-gray-700 font-medium placeholder-gray-400 bg-transparent"
                                placeholder="Buscar citas por lugar, notas, cliente o paquete..." value={buscar}
                                onChange={(e) => { setBuscar(e.target.value); setPagina(1); }} />
                            {buscar && (
                                <button onClick={() => setBuscar('')} className="text-gray-400 hover:text-gray-600 text-sm font-bold bg-gray-100 px-2 py-1 rounded-lg">Limpiar</button>
                            )}
                        </div>

                        {/* TABLA */}
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Información de Sesión</th>
                                        <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Finanzas</th>
                                        {/* La columna de acciones sólo se muestra si NO es fotógrafo */}
                                        {!esFotografo && <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Acciones</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {citas.length > 0 ? (
                                        citas.map(cita => {
                                            const paqueteCita = paquetes.find(p => p.id === cita.paquete);
                                            const fotografoCita = fotografos.find(f => f.id === cita.fotografo);

                                            return (
                                                <tr
                                                    key={cita.id}
                                                    onClick={() => manejarClickFila(cita)}
                                                    className={`transition duration-150 ${esFotografo ? 'hover:bg-indigo-50 cursor-pointer' : 'hover:bg-indigo-50/50'}`}
                                                >
                                                    <td className="px-6 py-6">
                                                        <div className="font-bold text-gray-900 text-lg">{cita.cliente_nombre || `Cliente #${cita.cliente}`}</div>
                                                        <div className="text-indigo-600 font-semibold italic">
                                                            📦 {paqueteCita ? paqueteCita.nombre : `Paquete #${cita.paquete}`}
                                                        </div>
                                                        <div className="text-zinc-500 text-xs mt-1 font-semibold">
                                                            📸 Fotógrafo: {fotografoCita ? `${fotografoCita.first_name} ${fotografoCita.last_name}` : 'Ninguno'}
                                                        </div>
                                                        <div className="text-gray-400 text-xs mt-1 font-medium">📍 {cita.lugar}</div>
                                                        <div className="text-gray-400 text-[11px] mt-1">📅 {new Date(cita.fecha_cita).toLocaleString()}</div>
                                                    </td>
                                                    <td className="px-6 py-6">
                                                        <div className="text-sm font-bold text-gray-700 font-mono">Total: ${cita.precio_total}</div>
                                                        <div className="text-sm text-green-600 font-semibold font-mono font-bold">Abono: ${cita.abono}</div>
                                                        <div className="mt-2">
                                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${cita.pagado ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                                {cita.pagado ? 'Liquidado' : 'Pendiente'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    {/* Botones ocultos completamente para el fotógrafo */}
                                                    {!esFotografo && (
                                                        <td className="px-6 py-6">
                                                            <div className="flex justify-center gap-3">
                                                                <button onClick={(e) => { e.stopPropagation(); prepararEdicion(cita); }} className="p-3 bg-orange-50 text-orange-600 rounded-2xl hover:bg-orange-100 transition shadow-sm">✏️</button>
                                                                <button onClick={(e) => { e.stopPropagation(); eliminarCita(cita.id); }} className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition shadow-sm">🗑️</button>
                                                            </div>
                                                        </td>
                                                    )}
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={esFotografo ? "2" : "3"} className="text-center py-10 text-gray-400 font-medium">
                                                No se encontraron citas con esos filtros de búsqueda.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {/* PAGINACIÓN */}
                            <div className="bg-gray-50 border-t px-6 py-4 flex items-center justify-between">
                                <span className="text-sm text-gray-500 font-medium">
                                    Página <strong className="text-gray-900">{pagina}</strong> de <strong className="text-gray-900">{totalPaginas}</strong>
                                </span>
                                <div className="flex gap-2">
                                    <button disabled={pagina === 1} onClick={() => setPagina(pagina - 1)}
                                        className="px-4 py-2 bg-white border rounded-xl text-sm font-bold text-gray-600 shadow-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">◀ Anterior</button>
                                    <button disabled={pagina === totalPaginas} onClick={() => setPagina(pagina + 1)}
                                        className="px-4 py-2 bg-white border rounded-xl text-sm font-bold text-gray-600 shadow-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">Siguiente ▶</button>
                                </div>
                            </div>
                        </div>
                    </div>



                </div>
            </div>

            {/* ========================================================
                🔥 MODAL OSCURO DE DETALLES PARA EL FOTÓGRAFO 🔥
               ======================================================== */}
            {citaSeleccionada && (
                <div className="fixed inset-0 bg-zinc-950/70 backdrop-blur-md flex items-center justify-center p-6 z-50 transition-all animate-fadeIn">
                    <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden text-zinc-100">

                        {/* Cabecera del Modal */}
                        <div className="bg-zinc-950 p-6 border-b border-zinc-800 flex justify-between items-center">
                            <div>
                                <h4 className="text-xl font-black tracking-tight text-white">Detalles Completos de la Sesión</h4>
                                <p className="text-xs text-zinc-400 mt-0.5">Vista exclusiva de consulta de la agenda</p>
                            </div>
                            <button
                                onClick={() => setCitaSeleccionada(null)}
                                className="w-8 h-8 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-full flex items-center justify-center transition-colors text-sm font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Cuerpo del Modal (Ocultando ID por completo) */}
                        <div className="p-6 space-y-6">

                            {/* Bloque Cliente y Paquete */}
                            <div className="grid grid-cols-2 gap-4 border-b border-zinc-800/60 pb-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Cliente registrado</p>
                                    <p className="text-lg font-bold text-white mt-0.5">{citaSeleccionada.cliente_nombre || 'Cliente Interno'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Paquete Fotográfico</p>
                                    <p className="text-lg font-bold text-indigo-400 mt-0.5">
                                        {paquetes.find(p => p.id === citaSeleccionada.paquete)?.nombre || `Paquete #${citaSeleccionada.paquete}`}
                                    </p>
                                </div>
                            </div>

                            {/* Bloque Logística */}
                            <div className="space-y-4 border-b border-zinc-800/60 pb-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">📍 Ubicación / Lugar de Cita</p>
                                    <p className="text-sm font-semibold text-zinc-200 mt-1">{citaSeleccionada.lugar}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">📅 Fecha y Hora Programada</p>
                                    <p className="text-sm font-mono text-zinc-200 mt-1">{new Date(citaSeleccionada.fecha_cita).toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">📸 Fotógrafo Responsable</p>
                                    <p className="text-sm font-semibold text-zinc-200 mt-1">
                                        {fotografos.find(f => f.id === citaSeleccionada.fotografo)
                                            ? `${fotografos.find(f => f.id === citaSeleccionada.fotografo).first_name} ${fotografos.find(f => f.id === citaSeleccionada.fotografo).last_name}`
                                            : 'Sin fotógrafo asignado'}
                                    </p>
                                </div>
                            </div>

                            {/* Bloque Notas */}
                            <div className="border-b border-zinc-800/60 pb-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">📝 Notas Adicionales del Estudio</p>
                                <p className="text-sm text-zinc-300 mt-1.5 italic bg-zinc-950 p-3 rounded-xl border border-zinc-800 min-h-[50px]">
                                    {citaSeleccionada.notas || 'Sin anotaciones particulares para esta sesión.'}
                                </p>
                            </div>

                            {/* Bloque Finanzas */}
                            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 flex justify-between items-center">
                                <div>
                                    <p className="text-xs text-zinc-400 font-medium">Estado de Cita</p>
                                    <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${citaSeleccionada.pagated || citaSeleccionada.pagado ? 'bg-green-950 text-green-400 border border-green-800' : 'bg-red-950 text-red-400 border border-red-800'}`}>
                                        {citaSeleccionada.pagado ? 'Liquidado' : 'Saldo Pendiente'}
                                    </span>
                                </div>
                                <div className="text-right font-mono">
                                    <p className="text-xs text-zinc-400">Total: <strong className="text-zinc-200">${citaSeleccionada.precio_total}</strong></p>
                                    <p className="text-sm font-bold text-green-400">Abono: ${citaSeleccionada.abono}</p>
                                </div>
                            </div>

                        </div>

                        {/* Footer del Modal */}
                        <div className="bg-zinc-950 p-4 border-t border-zinc-800 text-center">
                            <button
                                onClick={() => setCitaSeleccionada(null)}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors text-sm cursor-pointer"
                            >
                                Entendido, Volver a la Agenda
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionCitas;