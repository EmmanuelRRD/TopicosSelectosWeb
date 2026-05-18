import { useState, useEffect } from 'react';

const DashboardPaquetes = () => {
    const [paquetes, setPaquetes] = useState([]);
    const [error, setError] = useState(null);
    const [buscar, setBuscar] = useState('');

    // --- ESTADOS PARA EL ABCC ---
    const [editandoId, setEditandoId] = useState(null);
    const [paqueteSeleccionado, setPaqueteSeleccionado] = useState(null); // Consulta unitaria
    const [formulario, setFormulario] = useState({
        nombre: '',
        descripcion: '',
        precio_paquete: '',
        contenido: [] // Se maneja como array por tu estructura de Django
    });

    const API_PAQUETES = 'http://127.0.0.1:8000/api/paquetes-fotografo/';

    const getHeaders = () => {
        const token = localStorage.getItem('access_token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    // 1. LEER TODO (Read Catálogo)
    const obtenerPaquetes = () => {
        fetch(API_PAQUETES, { method: 'GET', headers: getHeaders() })
        .then(res => res.ok ? res.json() : Promise.reject("Error al conectar con MySQL."))
        .then(data => {
            const lista = data.results || data;
            if (Array.isArray(lista)) setPaquetes(lista);
        })
        .catch(err => setError(err.message));
    };

    useEffect(() => { obtenerPaquetes(); }, []);

    // 2. CONSULTA UNITARIA (Read Individual)
    const verDetalleUnitario = (id) => {
        fetch(`${API_PAQUETES}${id}/`, { method: 'GET', headers: getHeaders() })
        .then(res => res.ok ? res.json() : Promise.reject("No se encontró el paquete fotográfico."))
        .then(data => setPaqueteSeleccionado(data))
        .catch(err => alert("❌ Error en Django: " + err));
    };

    // 3. ENVIAR FORMULARIO (Alta / Cambio)
    const manejarEnvio = (e) => {
        e.preventDefault();
        const esEdicion = editandoId !== null;
        const url = esEdicion ? `${API_PAQUETES}${editandoId}/` : API_PAQUETES;
        const metodo = esEdicion ? 'PATCH' : 'POST';

        const datosAEnviar = {
            nombre: formulario.nombre.trim(),
            descripcion: formulario.descripcion.trim(),
            precio_paquete: parseFloat(formulario.precio_paquete) || 0,
            contenido: formulario.contenido // Mandamos el array plano exigido por DRF
        };

        fetch(url, {
            method: metodo,
            headers: getHeaders(),
            body: JSON.stringify(datosAEnviar)
        })
        .then(async res => {
            if (res.ok) {
                obtenerPaquetes();
                cancelarEdicion();
                alert(esEdicion ? "✅ Paquete modificado" : "✅ Nuevo paquete creado con éxito");
            } else {
                const err = await res.json();
                alert("❌ Error de validación en la DB:\n" + JSON.stringify(err));
            }
        });
    };

    // 4. ELIMINAR (Baja)
    const eliminarPaquete = (id, nombre) => {
        if (window.confirm(`¿Seguro que deseas eliminar permanentemente el: ${nombre}?`)) {
            fetch(`${API_PAQUETES}${id}/`, { method: 'DELETE', headers: getHeaders() })
            .then(res => {
                if (res.ok) {
                    obtenerPaquetes();
                    alert("🗑️ Paquete fotográfico removido de MySQL.");
                }
            });
        }
    };

    const prepararEdicion = (p) => {
        setEditandoId(p.id);
        setFormulario({ 
            nombre: p.nombre, 
            descripcion: p.descripcion, 
            precio_paquete: p.precio_paquete, 
            contenido: p.contenido || [] 
        });
    };

    const cancelarEdicion = () => {
        setEditandoId(null);
        setFormulario({ nombre: '', descripcion: '', precio_paquete: '', contenido: [] });
    };

    // Filtro rápido por nombre o descripción
    const paquetesFiltrados = paquetes.filter(p => 
        p.nombre.toLowerCase().includes(buscar.toLowerCase()) || 
        p.descripcion.toLowerCase().includes(buscar.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Encabezado y Buscador */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-zinc-900 p-6 border border-zinc-800 rounded-3xl">
                <div>
                    <h3 className="text-2xl font-black text-white">📦 Catálogo de Paquetes</h3>
                    <p className="text-xs text-zinc-400 mt-1">Configuración de ofertas comerciales, sesiones y precios del estudio</p>
                </div>
                <input 
                    type="text"
                    placeholder="Buscar paquete o descripción..."
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-600 w-full lg:w-72 font-medium"
                    value={buscar}
                    onChange={(e) => setBuscar(e.target.value)}
                />
            </div>

            {error && <div className="p-4 bg-red-900/30 border border-red-500 rounded-xl text-red-200 text-sm">⚠️ {error}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* FORMULARIO DE ACCIONES (Lado Izquierdo) */}
                <div className="lg:col-span-4 bg-zinc-900 border border-zinc-800 p-6 rounded-3xl h-fit">
                    <h4 className={`text-lg font-bold mb-4 ${editandoId ? 'text-orange-400' : 'text-blue-500'}`}>
                        {editandoId ? '🔧 Modificar Oferta' : '➕ Crear Paquete'}
                    </h4>
                    <form onSubmit={manejarEnvio} className="space-y-4 text-sm">
                        <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Nombre Comercial</label>
                            <input type="text" required placeholder="ej. Paquete Clásico" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-600"
                                value={formulario.nombre} onChange={e => setFormulario({...formulario, nombre: e.target.value})} />
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Precio de Venta ($)</label>
                            <input type="number" step="0.01" required placeholder="0.00" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-600 font-mono font-bold text-green-400"
                                value={formulario.precio_paquete} onChange={e => setFormulario({...formulario, precio_paquete: e.target.value})} />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Descripción y Entregables</label>
                            <textarea required placeholder="ej. Sesión de 2 horas, 20 fotos digitales..." className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-600 h-28 resize-none"
                                value={formulario.descripcion} onChange={e => setFormulario({...formulario, descripcion: e.target.value})}></textarea>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button type="submit" className={`flex-1 py-3 rounded-xl font-bold text-white transition-all cursor-pointer ${editandoId ? 'bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-950/20' : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-950/20'}`}>
                                {editandoId ? 'Guardar Cambios' : 'Confirmar Alta'}
                            </button>
                            {editandoId && <button type="button" onClick={cancelarEdicion} className="px-4 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-xl font-bold cursor-pointer">X</button>}
                        </div>
                    </form>
                </div>

                {/* TABLA DE PAQUETES (Lado Derecho) */}
                <div className="lg:col-span-8 bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead className="bg-zinc-950/60 border-b border-zinc-800">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Servicio / Paquete</th>
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Costo Comercial</th>
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {paquetesFiltrados.length > 0 ? (
                                paquetesFiltrados.map(p => (
                                    <tr key={p.id} className="hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-6 py-4 max-w-xs md:max-w-md">
                                            <div className="font-bold text-white text-base">{p.nombre}</div>
                                            <div className="text-zinc-400 text-xs mt-1 line-clamp-2 italic">“{p.descripcion}”</div>
                                        </td>
                                        <td className="px-6 py-4 font-mono vertical-align-middle">
                                            <div className="text-green-400 font-black text-lg">${p.precio_paquete}</div>
                                            <div className="text-[10px] text-zinc-500 mt-0.5 uppercase tracking-wider font-bold">Servicio Activo</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => verDetalleUnitario(p.id)} className="p-2 bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-xl hover:bg-zinc-800 transition cursor-pointer" title="Consulta Unitaria">👁️</button>
                                                <button onClick={() => prepararEdicion(p)} className="p-2 bg-orange-950/40 border border-orange-900 text-orange-400 rounded-xl hover:bg-orange-900/40 transition cursor-pointer" title="Editar">✏️</button>
                                                <button onClick={() => eliminarPaquete(p.id, p.nombre)} className="p-2 bg-red-950/40 border border-red-900 text-red-400 rounded-xl hover:bg-red-900/40 transition cursor-pointer" title="Eliminar">🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="text-center py-10 text-zinc-500 font-medium italic">No hay paquetes cargados en MySQL.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </div>

            {/* ========================================================
                🔍 MODAL OSCURO: CONSULTA UNITARIA (GET INDIVIDUAL) 🔍
               ======================================================== */}
            {paqueteSeleccionado && (
                <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fadeIn">
                    <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden text-zinc-200">
                        <div className="bg-zinc-950 p-4 border-b border-zinc-800 flex justify-between items-center">
                            <span className="text-xs font-black uppercase tracking-wider text-blue-500">Consulta Unitaria SQL</span>
                            <button onClick={() => setPaqueteSeleccionado(null)} className="text-zinc-500 hover:text-white font-bold">✕</button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="text-center">
                                <span className="text-4xl">📦</span>
                                <h4 className="text-2xl font-black text-white mt-2">{paqueteSeleccionado.nombre}</h4>
                                <p className="text-xs text-zinc-500 mt-1">ID de oferta verificado en catálogo</p>
                            </div>
                            
                            <div className="space-y-1 bg-zinc-950 p-4 rounded-2xl border border-zinc-800/80">
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Detalle de cobertura técnica</p>
                                <p className="text-sm text-zinc-300 mt-1 leading-relaxed italic">
                                    “{paqueteSeleccionado.descripcion}”
                                </p>
                            </div>

                            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800/80 flex justify-between items-center font-medium text-sm">
                                <span className="text-zinc-400">Precio Neto Liquidación:</span>
                                <span className="text-xl font-mono font-black text-green-400">${paqueteSeleccionado.precio_paquete}</span>
                            </div>
                        </div>
                        <div className="p-4 bg-zinc-950 border-t border-zinc-800">
                            <button onClick={() => setPaqueteSeleccionado(null)} className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-3 rounded-xl transition-colors cursor-pointer">
                                Cerrar Ficha del Servicio
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardPaquetes;