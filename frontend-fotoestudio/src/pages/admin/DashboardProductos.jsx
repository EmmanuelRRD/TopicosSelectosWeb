import { useState, useEffect } from 'react';

const DashboardProductos = () => {
    const [productos, setProductos] = useState([]);
    const [error, setError] = useState(null);
    const [buscar, setBuscar] = useState('');

    // --- ESTADOS PARA EL ABCC ---
    const [editandoId, setEditandoId] = useState(null);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null); // Para consulta unitaria
    const [formulario, setFormulario] = useState({
        nombre: '',
        medida: '',
        precio: '',
        stock: 0
    });

    const API_PRODUCTOS = 'http://127.0.0.1:8000/api/productos/';

    const getHeaders = () => {
        const token = localStorage.getItem('access_token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    // 1. LEER TODO (Read Catalogo)
    const obtenerProductos = () => {
        fetch(API_PRODUCTOS, { method: 'GET', headers: getHeaders() })
            .then(res => res.ok ? res.json() : Promise.reject("Error al conectar con MySQL."))
            .then(data => {
                const lista = data.results || data;
                if (Array.isArray(lista)) setProductos(lista);
            })
            .catch(err => setError(err.message));
    };

    useEffect(() => { obtenerProductos(); }, []);

    // 2. CONSULTA UNITARIA (Read Individual)
    const verDetalleUnitario = (id) => {
        fetch(`${API_PRODUCTOS}${id}/`, { method: 'GET', headers: getHeaders() })
            .then(res => res.ok ? res.json() : Promise.reject("No se encontró el producto."))
            .then(data => setProductoSeleccionado(data))
            .catch(err => alert("❌ Error: " + err));
    };

    // 3. ENVIAR FORMULARIO (Alta / Cambio)
    const manejarEnvio = (e) => {
        e.preventDefault();
        const esEdicion = editandoId !== null;
        const url = esEdicion ? `${API_PRODUCTOS}${editandoId}/` : API_PRODUCTOS;
        const metodo = esEdicion ? 'PATCH' : 'POST';

        const datosAEnviar = {
            nombre: formulario.nombre.trim(),
            medida: formulario.medida.trim(),
            precio: parseFloat(formulario.precio) || 0,
            stock: parseInt(formulario.stock) || 0
        };

        fetch(url, {
            method: metodo,
            headers: getHeaders(),
            body: JSON.stringify(datosAEnviar)
        })
            .then(async res => {
                if (res.ok) {
                    obtenerProductos();
                    cancelarEdicion();
                    alert(esEdicion ? "✅ Producto actualizado" : "✅ Producto dado de alta");
                } else {
                    const err = await res.json();
                    alert("❌ Error en la DB:\n" + JSON.stringify(err));
                }
            });
    };

    // 4. ELIMINAR (Baja)
    const eliminarProducto = (id, nombre) => {
        if (window.confirm(`¿Seguro que deseas eliminar permanentemente: ${nombre}?`)) {
            fetch(`${API_PRODUCTOS}${id}/`, { method: 'DELETE', headers: getHeaders() })
                .then(res => {
                    if (res.ok) {
                        obtenerProductos();
                        alert("🗑️ Producto removido de MySQL.");
                    }
                });
        }
    };

    const prepararEdicion = (p) => {
        setEditandoId(p.id);
        setFormulario({ nombre: p.nombre, medida: p.medida, precio: p.precio, stock: p.stock });
    };

    const cancelarEdicion = () => {
        setEditandoId(null);
        setFormulario({ nombre: '', medida: '', precio: '', stock: 0 });
    };

    // Filtro rápido
    const productosFiltrados = productos.filter(p =>
        p.nombre.toLowerCase().includes(buscar.toLowerCase()) || p.medida.toLowerCase().includes(buscar.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Encabezado y Barra de Búsqueda */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-zinc-900 p-6 border border-zinc-800 rounded-3xl">
                <div>
                    <h3 className="text-2xl font-black text-white">📦 Almacén e Inventario General</h3>
                    <p className="text-xs text-zinc-400 mt-1">Módulo exclusivo de altas, bajas y cambios de insumos físicos</p>
                </div>
                <input
                    type="text"
                    placeholder="Buscar por descripción o medida..."
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-600 w-full lg:w-72"
                    value={buscar}
                    onChange={(e) => setBuscar(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* FORMULARIO DE ACCIONES (Lado Izquierdo) */}
                <div className="lg:col-span-4 bg-zinc-900 border border-zinc-800 p-6 rounded-3xl h-fit">
                    <h4 className={`text-lg font-bold mb-4 ${editandoId ? 'text-orange-400' : 'text-blue-500'}`}>
                        {editandoId ? '🔧 Modificar Insumo' : '➕ Registrar Producto'}
                    </h4>
                    <form onSubmit={manejarEnvio} className="space-y-4 text-sm">
                        <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Nombre del Insumo</label>
                            <input type="text" required placeholder="ej. Marco de Madera Rústico" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-600"
                                value={formulario.nombre} onChange={e => setFormulario({ ...formulario, nombre: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Dimensión / Medida</label>
                            <select
                                required
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-200 outline-none focus:border-blue-600 font-medium cursor-pointer"
                                value={formulario.medida}
                                onChange={e => setFormulario({ ...formulario, medida: e.target.value })}
                            >
                                <option value="" disabled>-- Selecciona una medida --</option>
                                <option value="8x10 pulg">8x10 pulgadas</option>
                                <option value="11x14 pulg">11x14 pulgadas</option>
                                <option value="16x20 pulg">16x20 pulgadas</option>
                                <option value="20x24 pulg">20x24 pulgadas</option>
                                <option value="34x40 pulg">34x40 pulgadas</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Precio ($)</label>
                                <input type="number" step="0.01" required placeholder="0.00" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-600 font-mono"
                                    value={formulario.precio} onChange={e => setFormulario({ ...formulario, precio: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Stock Físico</label>
                                <input type="number" required placeholder="0" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-600"
                                    value={formulario.stock} onChange={e => setFormulario({ ...formulario, stock: e.target.value })} />
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button type="submit" className={`flex-1 py-3 rounded-xl font-bold text-white transition-all ${editandoId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-500'}`}>
                                {editandoId ? 'Guardar' : 'Dar de Alta'}
                            </button>
                            {editandoId && <button type="button" onClick={cancelarEdicion} className="px-4 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-xl font-bold">X</button>}
                        </div>
                    </form>
                </div>

                {/* TABLA DE PRODUCTOS (Lado Derecho) */}
                <div className="lg:col-span-8 bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead className="bg-zinc-950/60 border-b border-zinc-800">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Descripción del Artículo</th>
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Costo e Inventario</th>
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {productosFiltrados.length > 0 ? (
                                productosFiltrados.map(p => (
                                    <tr key={p.id} className="hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-white text-base">{p.nombre}</div>
                                            <div className="text-zinc-400 text-xs mt-0.5">📏 Medida: <span className="font-semibold text-zinc-300">{p.medida}</span></div>
                                        </td>
                                        <td className="px-6 py-4 font-mono">
                                            <div className="text-green-400 font-bold text-base">${p.precio}</div>
                                            <div className={`text-xs mt-0.5 ${p.stock <= 10 ? 'text-orange-400 font-bold' : 'text-zinc-500'}`}>
                                                📦 Stock: {p.stock} u.
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => verDetalleUnitario(p.id)} className="p-2 bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-xl hover:bg-zinc-800 transition" title="Consulta Unitaria">👁️</button>
                                                <button onClick={() => prepararEdicion(p)} className="p-2 bg-orange-950/40 border border-orange-900 text-orange-400 rounded-xl hover:bg-orange-900/40 transition" title="Editar">✏️</button>
                                                <button onClick={() => eliminarProducto(p.id, p.nombre)} className="p-2 bg-red-950/40 border border-red-900 text-red-400 rounded-xl hover:bg-red-900/40 transition" title="Eliminar">🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="text-center py-10 text-zinc-500 font-medium italic">No hay registros cargados.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </div>

            {/* ========================================================
                🔍 MODAL OSCURO: CONSULTA UNITARIA (GET INDIVIDUAL) 🔍
               ======================================================== */}
            {productoSeleccionado && (
                <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fadeIn">
                    <div className="bg-zinc-900 border border-zinc-800 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden text-zinc-200">
                        <div className="bg-zinc-950 p-4 border-b border-zinc-800 flex justify-between items-center">
                            <span className="text-xs font-black uppercase tracking-wider text-blue-500">Consulta Unitaria SQL</span>
                            <button onClick={() => setProductoSeleccionado(null)} className="text-zinc-500 hover:text-white font-bold">✕</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="text-center">
                                <span className="text-4xl">📦</span>
                                <h4 className="text-xl font-black text-white mt-2">{productoSeleccionado.nombre}</h4>
                                <p className="text-xs text-zinc-400 mt-1">ID de registro confirmado por DRF</p>
                            </div>
                            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800/80 space-y-2 font-medium text-sm">
                                <div className="flex justify-between border-b border-zinc-900 pb-2"><span className="text-zinc-500">Medida:</span><span className="text-zinc-300">{productoSeleccionado.medida}</span></div>
                                <div className="flex justify-between border-b border-zinc-900 pb-2"><span className="text-zinc-500">Precio Unitario:</span><span className="text-green-400 font-mono font-bold">${productoSeleccionado.precio}</span></div>
                                <div className="flex justify-between border-b border-zinc-900 pb-2"><span className="text-zinc-500">Existencia Física:</span><span className={`${productoSeleccionado.stock <= 10 ? 'text-orange-400 font-bold' : 'text-zinc-300'}`}>{productoSeleccionado.stock} unidades</span></div>
                                <div className="flex justify-between pt-1"><span className="text-zinc-500">Responsable:</span><span className="text-blue-400">@{productoSeleccionado.creado_por}</span></div>
                            </div>
                        </div>
                        <div className="p-4 bg-zinc-950 border-t border-zinc-800">
                            <button onClick={() => setProductoSeleccionado(null)} className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-2.5 rounded-xl transition-colors">
                                Cerrar Ficha Técnica
                                Suffice
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardProductos;