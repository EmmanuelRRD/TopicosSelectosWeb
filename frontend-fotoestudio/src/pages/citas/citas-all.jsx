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

    // --- ESTADO PARA EL MODAL DE DETALLES ---
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
                    setTotalPaginas(Math.ceil(data.count / 10) || 1);
                    setError(null);
                } else if (Array.isArray(data)) {
                    setCitas(data);
                    setTotalPaginas(1);
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
        fetch(API_PAQUETES, { method: 'GET', headers })
            .then(res => res.ok ? res.json() : [])
            .then(data => setPaquetes(data.results || data));

        fetch(API_FOTOGRAFOS, { method: 'GET', headers })
            .then(res => res.ok ? res.json() : [])
            .then(data => setFotografos(data.results || data));
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

        let clienteId = null;
        if (isAdmin) {
            clienteId = parseInt(nuevaCita.cliente);
        } else {
            try {
                const token = localStorage.getItem('access_token');
                if (token) {
                    const payloadBase64 = token.split('.')[1];
                    const payloadDecodificado = JSON.parse(atob(payloadBase64));
                    clienteId = parseInt(payloadDecodificado.user_id);
                }
            } catch (err) {
                console.error("No se pudo decodificar el ID desde el JWT:", err);
            }
        }

        const datosAEnviar = {
            paquete: parseInt(nuevaCita.paquete),
            fecha_cita: nuevaCita.fecha_cita,
            precio_total: parseFloat(nuevaCita.precio_total) || 0,
            abono: parseFloat(nuevaCita.abono) || 0,
            lugar: nuevaCita.lugar,
            notas: nuevaCita.notas,
            cliente: clienteId,
            fotografo: nuevaCita.fotografo ? parseInt(nuevaCita.fotografo) : null
        };

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
                        alert("🗑️ Cita eliminada de la base de datos.");
                    }
                });
        }
    };

    const cerrarSesion = () => {
        if (window.confirm("¿Seguro que deseas cerrar sesión en el sistema?")) {
            localStorage.clear();
            navigate('/login');
        }
    };

    const manejarClickFila = (cita) => {
        if (esFotografo || isAdmin) {
            setCitaSeleccionada(cita);
        }
    };

    return (
        <div className={esComponenteAdmin ? "text-zinc-100" : "min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8 font-sans"}>
            <div className={esComponenteAdmin ? "space-y-6" : "max-w-7xl mx-auto space-y-6"}>

                {/* HEADER PANTALLA COMPLETA */}
                {!esComponenteAdmin && (
                    <header className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-full italic flex items-center justify-center font-black text-white text-lg">F</div>
                            <div>
                                <h2 className="text-xl font-black text-white uppercase tracking-tight">Estudio Jerez</h2>
                                <p className="text-[10px] text-blue-500 uppercase tracking-widest font-bold">Portal de Agenda Digital</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="bg-zinc-950 border border-zinc-800 px-4 py-2 rounded-xl text-xs font-bold text-zinc-300 flex items-center gap-2">
                                👤 {nombreUsuarioLogueado}
                                <span className={`text-[9px] uppercase px-2 py-0.5 rounded font-black ${esFotografo ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' : 'bg-green-500/10 border border-green-500/20 text-green-400'}`}>
                                    {esFotografo ? 'Fotógrafo' : 'Cliente'}
                                </span>
                            </div>

                            <button
                                onClick={cerrarSesion}
                                className="p-2.5 bg-zinc-950 border border-zinc-800 hover:border-red-900 text-zinc-400 hover:text-red-400 rounded-xl transition-colors cursor-pointer"
                                title="Cerrar Sesión"
                            >
                                🚪
                            </button>
                        </div>
                    </header>
                )}

                {/* ENCABEZADO EXCLUSIVO PARA COMPONENTE ADMIN */}
                {esComponenteAdmin && (
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-xl">
                        <h3 className="text-2xl font-black text-white">📅 Agenda General de Sesiones</h3>
                        <p className="text-xs text-zinc-400 mt-1">Control ABCC del calendario operativo e ingresos por anticipos</p>
                    </div>
                )}

                {error && <div className="p-4 bg-red-900/30 border border-red-500 rounded-xl text-red-200 text-sm">⚠️ {error}</div>}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LADO IZQUIERDO: FORMULARIO */}
                    {!esFotografo && (
                        <div className="lg:col-span-4 bg-zinc-900 border border-zinc-800 p-6 rounded-3xl h-fit shadow-xl">
                            <h4 className={`text-lg font-bold mb-4 ${editandoId ? 'text-orange-400' : 'text-blue-500'}`}>
                                {editandoId ? '🔧 Modificar Reserva' : '➕ Agendar Cita'}
                            </h4>

                            <form onSubmit={manejarEnvio} className="space-y-4 text-sm">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Paquete Comercial</label>
                                    <select className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-200 outline-none focus:border-blue-600 font-medium cursor-pointer"
                                        value={nuevaCita.paquete} onChange={e => manejarCambioPaquete(e.target.value)} required>
                                        <option value="" disabled>-- Elige un Paquete --</option>
                                        {paquetes.map(p => <option key={p.id} value={p.id}>{p.nombre} (${p.precio_paquete})</option>)}
                                    </select>
                                </div>

                                {isAdmin && (
                                    <div>
                                        <label className="block text-xs font-bold text-blue-400 uppercase mb-1">ID Cliente (Llave SQL)</label>
                                        <input type="number" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-600 font-mono font-bold"
                                            value={nuevaCita.cliente} onChange={e => setNuevaCita({ ...nuevaCita, cliente: e.target.value })} required />
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Costo Neto ($)</label>
                                        <input type="number" step="0.01" className="w-full bg-zinc-950 border border-zinc-800/60 text-zinc-500 rounded-xl px-4 py-2.5 outline-none font-mono font-bold cursor-not-allowed"
                                            value={nuevaCita.precio_total} readOnly required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Monto Abono ($)</label>
                                        <input type="number" step="0.01" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-green-400 outline-none focus:border-blue-600 font-mono font-bold"
                                            value={nuevaCita.abono} onChange={e => setNuevaCita({ ...nuevaCita, abono: e.target.value })} />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Fotógrafo Asignado</label>
                                    <select className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-200 outline-none focus:border-blue-600 font-medium cursor-pointer"
                                        value={nuevaCita.fotografo || ''} onChange={e => setNuevaCita({ ...nuevaCita, fotografo: e.target.value })}>
                                        <option value="">-- Sin asignar (NULL) --</option>
                                        {fotografos.map(f => <option key={f.id} value={f.id}>{f.first_name} {f.last_name}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Fecha y Hora Programada</label>
                                    <input type="datetime-local" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-300 outline-none focus:border-blue-600 font-medium"
                                        value={nuevaCita.fecha_cita} onChange={e => setNuevaCita({ ...nuevaCita, fecha_cita: e.target.value })} required />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Ubicación / Locación</label>
                                    <input type="text" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-600 font-medium"
                                        value={nuevaCita.lugar} onChange={e => setNuevaCita({ ...nuevaCita, lugar: e.target.value })} />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Notas del Registro</label>
                                    <textarea className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-600 h-16 resize-none"
                                        value={nuevaCita.notas} onChange={e => setNuevaCita({ ...nuevaCita, notas: e.target.value })}></textarea>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button type="submit" className={`flex-1 py-3 rounded-xl font-bold text-white transition-all cursor-pointer ${editandoId ? 'bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-950/20' : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-950/20'}`}>
                                        {editandoId ? 'Guardar Cambios' : 'Confirmar Cita'}
                                    </button>
                                    {editandoId && <button type="button" onClick={cancelarEdicion} className="px-4 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-xl font-bold cursor-pointer">X</button>}
                                </div>
                            </form>
                        </div>
                    )}

                    {/* LADO DERECHO: BUSCADOR Y TABLA */}
                    <div className={`${esFotografo ? 'lg:col-span-12' : 'lg:col-span-8'} space-y-4`}>

                        {/* BUSCADOR */}
                        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-3xl shadow-md flex items-center gap-3">
                            <span className="text-zinc-500 text-lg">🔍</span>
                            <input type="text" className="w-full outline-none text-white font-medium placeholder-zinc-500 bg-transparent text-sm"
                                placeholder="Filtrar por locación, notas, cliente o folio..." value={buscar}
                                onChange={(e) => { setBuscar(e.target.value); setPagina(1); }} />
                            {buscar && (
                                <button onClick={() => setBuscar('')} className="text-zinc-400 hover:text-white text-xs font-bold bg-zinc-950 border border-zinc-800 px-2.5 py-1 rounded-lg transition">Limpiar</button>
                            )}
                        </div>

                        {/* TABLA OSCURA */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead className="bg-zinc-950/60 border-b border-zinc-800">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Información de Sesión</th>
                                        <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Finanzas</th>
                                        {!esFotografo && <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-center">Acciones</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800/50">
                                    {citas.length > 0 ? (
                                        citas.map(cita => {
                                            const paqueteCita = paquetes?.find(p => p.id === cita.paquete);
                                            const fotografoCita = fotografos?.find(f => f.id === cita.fotografo);

                                            return (
                                                <tr
                                                    key={cita.id}
                                                    onClick={() => manejarClickFila(cita)}
                                                    className={`transition-colors duration-150 ${esFotografo || isAdmin ? 'hover:bg-zinc-800/60 cursor-pointer' : 'hover:bg-zinc-800/20'}`}
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-white text-base">{cita.cliente_nombre || `Cliente #${cita.cliente}`}</div>
                                                        <div className="text-blue-400 font-semibold text-xs mt-0.5">
                                                            Box 📦 {paqueteCita ? paqueteCita.nombre : `Paquete #${cita.paquete}`}
                                                        </div>
                                                        <div className="text-zinc-500 text-xs mt-1 font-medium">
                                                            📸 Staff: <span className="text-zinc-300">{fotografoCita ? `${fotografoCita.first_name} ${fotografoCita.last_name}` : 'No asignado'}</span>
                                                        </div>
                                                        <div className="text-zinc-500 text-xs mt-0.5 font-medium">📍 Lugar: <span className="text-zinc-400">{cita.lugar}</span></div>
                                                        <div className="text-zinc-500 text-[11px] font-mono mt-1">📅 {cita.fecha_cita ? new Date(cita.fecha_cita).toLocaleString() : 'Sin fecha'}</div>
                                                    </td>
                                                    <td className="px-6 py-4 font-mono vertical-align-middle">
                                                        <div className="text-zinc-300 font-bold text-sm">Total: ${cita.precio_total}</div>
                                                        <div className="text-green-400 font-bold text-sm">Abono: ${cita.abono}</div>
                                                        <div className="mt-2">
                                                            <span className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-wider ${cita.pagado ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                                                                {cita.pagado ? 'Liquidado' : 'Pendiente'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    {!esFotografo && (
                                                        <td className="px-6 py-4">
                                                            <div className="flex justify-center gap-2">
                                                                <button onClick={(e) => { e.stopPropagation(); setCitaSeleccionada(cita); }} className="p-2 bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-xl hover:bg-zinc-800 transition cursor-pointer" title="Ver Ficha">👁️</button>
                                                                <button onClick={(e) => { e.stopPropagation(); prepararEdicion(cita); }} className="p-2 bg-orange-950/40 border border-orange-900 text-orange-400 rounded-xl hover:bg-orange-900/40 transition cursor-pointer" title="Editar">✏️</button>
                                                                <button onClick={(e) => { e.stopPropagation(); eliminarCita(cita.id); }} className="p-2 bg-red-950/40 border border-red-900 text-red-400 rounded-xl hover:bg-red-900/40 transition cursor-pointer" title="Eliminar">🗑️</button>
                                                            </div>
                                                        </td>
                                                    )}
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={esFotografo ? "2" : "3"} className="text-center py-10 text-zinc-500 font-medium italic">
                                                No se encontraron registros de citas vigentes.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {/* PAGINACIÓN */}
                            <div className="bg-zinc-950 border-t border-zinc-800 px-6 py-4 flex items-center justify-between">
                                <span className="text-xs text-zinc-500 font-medium">
                                    Instancia <strong className="text-zinc-300">{pagina}</strong> de <strong className="text-zinc-300">{totalPaginas}</strong>
                                </span>
                                <div className="flex gap-2">
                                    <button disabled={pagina === 1} onClick={() => setPagina(pagina - 1)}
                                        className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-300 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer">◀ Prev</button>
                                    <button disabled={pagina === totalPaginas} onClick={() => setPagina(pagina + 1)}
                                        className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-300 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer">Next ▶</button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* MODAL OSCURO PREMIUM */}
            {citaSeleccionada && (
                <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fadeIn">
                    <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden text-zinc-200">
                        <div className="bg-zinc-950 p-4 border-b border-zinc-800 flex justify-between items-center">
                            <span className="text-xs font-black uppercase tracking-wider text-blue-500">Consulta Completa de Reserva</span>
                            <button onClick={() => setCitaSeleccionada(null)} className="text-zinc-500 hover:text-white font-bold text-sm">✕</button>
                        </div>
                        
                        <div className="p-6 space-y-5">
                            <div className="text-center">
                                <span className="text-4xl">📅</span>
                                <h4 className="text-xl font-black text-white mt-2">{citaSeleccionada.cliente_nombre || `Cliente #${citaSeleccionada.cliente}`}</h4>
                                <p className="text-xs text-zinc-500 font-mono">ID de Transacción confirmado por Django</p>
                            </div>

                            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800/80 space-y-3 font-medium text-xs">
                                <div className="flex justify-between border-b border-zinc-900 pb-2">
                                    <span className="text-zinc-500">Paquete Contratado:</span>
                                    <span className="text-blue-400 font-bold">{paquetes?.find(p => p.id === citaSeleccionada.paquete)?.nombre || `Paquete #${citaSeleccionada.paquete}`}</span>
                                </div>
                                <div className="flex justify-between border-b border-zinc-900 pb-2">
                                    <span className="text-zinc-500">Locación / Destino:</span>
                                    <span className="text-zinc-200">{citaSeleccionada.lugar}</span>
                                </div>
                                <div className="flex justify-between border-b border-zinc-900 pb-2">
                                    <span className="text-zinc-500">Fecha y Hora:</span>
                                    <span className="text-zinc-200 font-mono">{citaSeleccionada.fecha_cita ? new Date(citaSeleccionada.fecha_cita).toLocaleString() : 'Sin fecha'}</span>
                                </div>
                                <div className="flex justify-between border-b border-zinc-900 pb-2">
                                    <span className="text-zinc-500">Fotógrafo del Evento:</span>
                                    <span className="text-zinc-200">{fotografos?.find(f => f.id === citaSeleccionada.fotografo) ? `${fotografos.find(f => f.id === citaSeleccionada.fotografo).first_name} ${fotografos.find(f => f.id === citaSeleccionada.fotografo).last_name}` : 'Sin fotógrafo asignado'}</span>
                                </div>
                                <div className="flex flex-col pt-1 space-y-1">
                                    <span className="text-zinc-500">Notas Internas de Production:</span>
                                    <p className="text-zinc-300 italic bg-zinc-900 p-2.5 rounded-xl border border-zinc-800/60 leading-relaxed">
                                        “{citaSeleccionada.notas || 'Sin especificaciones añadidas por el solicitante.'}”
                                    </p>
                                </div>
                            </div>

                            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800/80 flex justify-between items-center font-medium text-xs">
                                <div>
                                    <span className="text-zinc-500 block">Estado de Auditoría:</span>
                                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-black uppercase ${citaSeleccionada.pagado ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                        {citaSeleccionada.pagado ? 'Liquidado / Completo' : 'Saldo Pendiente'}
                                    </span>
                                </div>
                                <div className="text-right font-mono">
                                    <p className="text-zinc-500">Costo: ${citaSeleccionada.precio_total}</p>
                                    <p className="text-green-400 font-bold text-sm">Abonado: ${citaSeleccionada.abono}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-zinc-950 border-t border-zinc-800">
                            <button onClick={() => setCitaSeleccionada(null)} className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-3 rounded-xl transition-colors tracking-wider uppercase cursor-pointer">
                                Cerrar Agenda de Auditoría
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionCitas;