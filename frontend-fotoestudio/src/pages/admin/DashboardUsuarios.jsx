import { useState, useEffect } from 'react';

const DashboardUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [error, setError] = useState(null);
    const [buscar, setBuscar] = useState('');
    const [filtroRol, setFiltroRol] = useState('todos');

    // --- 🔢 ESTADOS PARA LA PAGINACIÓN ---
    const [paginaActual, setPaginaActual] = useState(1);
    const [totalRegistros, setTotalRegistros] = useState(0);
    const [tieneSiguiente, setTieneSiguiente] = useState(false);
    const [tieneAnterior, setTieneAnterior] = useState(false);

    // --- ESTADOS PARA EL ABCC ---
    const [editandoId, setEditandoId] = useState(null);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
    const [formulario, setFormulario] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        tipo_usuario: 'cliente',
        password: '',
        is_staff: false,
        is_active: true
    });

    const API_USUARIOS = 'http://127.0.0.1:8000/api/usuarios/';

    const getHeaders = () => {
        const token = localStorage.getItem('access_token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    // 1. LEER PÁGINA (Read Catálogo con Filtros del Servidor)
    const obtenerUsuarios = () => {
        // Construimos los Query Params dinámicamente para Django
        const params = new URLSearchParams({
            page: paginaActual,
            ...(buscar.trim() && { search: buscar.trim() }), 
            ...(filtroRol !== 'todos' && { tipo_usuario: filtroRol }) 
        });

        fetch(`${API_USUARIOS}?${params.toString()}`, { method: 'GET', headers: getHeaders() })
            .then(res => res.ok ? res.json() : Promise.reject(new Error("Error al conectar con el servidor.")))
            .then(data => {
                // Sincronizado con tu respuesta de Django { count, total_pages, current_page, next, previous, results }
                if (data.results && Array.isArray(data.results)) {
                    setUsuarios(data.results);
                    setTotalRegistros(data.count);
                    setTieneSiguiente(data.next); // Captura el booleano directo del back
                    setTieneAnterior(data.previous); // Captura el booleano directo del back
                } else if (Array.isArray(data)) {
                    setUsuarios(data);
                    setTotalRegistros(data.length);
                    setTieneSiguiente(false);
                    setTieneAnterior(false);
                }
            })
            .catch(err => setError(err.message));
    };

    // Escucha cambios de página o filtros de rol para recargar automáticamente
    useEffect(() => {
        obtenerUsuarios();
    }, [paginaActual, filtroRol]);

    // Manejador del botón buscar / Enter
    const ejecutarBusqueda = (e) => {
        if (e) e.preventDefault();
        setPaginaActual(1); // Reiniciar a la primera página para evitar desfases de rango 404
        obtenerUsuarios();
    };

    // 2. CONSULTA UNITARIA (Read Individual)
    const verDetalleUnitario = (id) => {
        fetch(`${API_USUARIOS}${id}/`, { method: 'GET', headers: getHeaders() })
            .then(res => res.ok ? res.json() : Promise.reject("No se encontró el usuario en el servidor."))
            .then(data => setUsuarioSeleccionado(data))
            .catch(err => alert("❌ Error en Django: " + err));
    };

    // 3. ENVIAR FORMULARIO (Alta / Cambio)
    const manejarEnvio = (e) => {
        e.preventDefault();
        const esEdicion = editandoId !== null;
        const url = esEdicion ? `${API_USUARIOS}${editandoId}/` : API_USUARIOS;
        const metodo = esEdicion ? 'PATCH' : 'POST';

        const datosAEnviar = {
            username: formulario.username.trim(),
            email: formulario.email.trim(),
            first_name: formulario.first_name.trim(),
            last_name: formulario.last_name.trim(),
            tipo_usuario: formulario.tipo_usuario,
            is_staff: formulario.is_staff,
            is_active: formulario.is_active
        };

        if (!esEdicion && formulario.password) {
            datosAEnviar.password = formulario.password;
        }

        fetch(url, {
            method: metodo,
            headers: getHeaders(),
            body: JSON.stringify(datosAEnviar)
        })
            .then(async res => {
                if (res.ok) {
                    alert(esEdicion ? "✅ Cuenta de usuario actualizada" : "✅ Nuevo usuario registrado con éxito");
                    cancelarEdicion();
                    obtenerUsuarios(); 
                } else {
                    const err = await res.json();
                    alert("❌ Error de validación en Django:\n" + JSON.stringify(err));
                }
            })
            .catch(err => alert("❌ Error en la conexión: " + err));
    };

    // 4. ELIMINAR (Baja)
    const eliminarUsuario = (id, username) => {
        if (window.confirm(`¿Seguro que deseas eliminar permanentemente al usuario: @${username}?`)) {
            fetch(`${API_USUARIOS}${id}/`, { method: 'DELETE', headers: getHeaders() })
                .then(res => {
                    if (res.ok) {
                        alert("🗑️ Registro de usuario borrado.");
                        if (usuarios.length === 1 && paginaActual > 1) {
                            setPaginaActual(prev => prev - 1);
                        } else {
                            obtenerUsuarios();
                        }
                    }
                });
        }
    };

    const prepararEdicion = (u) => {
        setEditandoId(u.id);
        setFormulario({
            username: u.username,
            email: u.email,
            first_name: u.first_name,
            last_name: u.last_name,
            tipo_usuario: u.tipo_usuario,
            password: '',
            is_staff: u.is_staff,
            is_active: u.is_active
        });
    };

    const cancelarEdicion = () => {
        setEditandoId(null);
        setFormulario({ username: '', email: '', first_name: '', last_name: '', tipo_usuario: 'cliente', password: '', is_staff: false, is_active: true });
    };

    return (
        <div className="space-y-6">
            {/* Encabezado Principal con Buscador y Filtro Avanzado */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-zinc-900 p-6 border border-zinc-800 rounded-3xl">
                <div>
                    <h3 className="text-2xl font-black text-white">👥 Gestión Global de Usuarios</h3>
                    <p className="text-xs text-zinc-400 mt-1">Módulo ABCC con paginación integrada y filtros de servidor</p>
                </div>

                {/* Contenedor de búsqueda */}
                <form onSubmit={ejecutarBusqueda} className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                    <div className="flex w-full sm:w-64 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden focus-within:border-blue-600">
                        <input
                            type="text"
                            placeholder="Buscar y presionar Enter..."
                            className="bg-transparent px-4 py-3 text-sm text-white focus:outline-none w-full font-medium"
                            value={buscar}
                            onChange={(e) => {
                                setBuscar(e.target.value);
                                if (e.target.value === '') {
                                    setPaginaActual(1); // Si limpian el buscador, regresa a la pág 1
                                    setTimeout(() => obtenerUsuarios(), 10);
                                }
                            }}
                        />
                        <button type="submit" className="px-3 text-zinc-400 hover:text-white">🔍</button>
                    </div>

                    {/* Selector de Rol */}
                    <select
                        className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-blue-600 w-full sm:w-44 font-bold cursor-pointer"
                        value={filtroRol}
                        onChange={(e) => {
                            setFiltroRol(e.target.value);
                            setPaginaActual(1); // Resetea página al cambiar filtro para evitar un 404 del back
                        }}
                    >
                        <option value="todos">👥 Todos los Roles</option>
                        <option value="cliente">🟢 Clientes</option>
                        <option value="fotografo">🟡 Fotógrafos</option>
                        <option value="admin">🔴 Administradores</option>
                    </select>
                </form>
            </div>

            {error && <div className="p-4 bg-red-900/30 border border-red-500 rounded-xl text-red-200 text-sm">⚠️ {error}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* FORMULARIO DE ACCIONES (Izquierda) */}
                <div className="lg:col-span-4 bg-zinc-900 border border-zinc-800 p-6 rounded-3xl h-fit">
                    <h4 className={`text-lg font-bold mb-4 ${editandoId ? 'text-orange-400' : 'text-blue-500'}`}>
                        {editandoId ? '🔧 Modificar Perfil' : '➕ Registrar Usuario'}
                    </h4>
                    <form onSubmit={manejarEnvio} className="space-y-4 text-sm">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Nombre</label>
                                <input type="text" required placeholder="Juan" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-600"
                                    value={formulario.first_name} onChange={e => setFormulario({ ...formulario, first_name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Apellido</label>
                                <input type="text" required placeholder="Pérez" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-600"
                                    value={formulario.last_name} onChange={e => setFormulario({ ...formulario, last_name: e.target.value })} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Username</label>
                                <input type="text" required placeholder="juan_perez" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-600 font-mono"
                                    value={formulario.username} onChange={e => setFormulario({ ...formulario, username: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Rol de Cuenta</label>
                                <select className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-300 outline-none focus:border-blue-600 cursor-pointer font-medium"
                                    value={formulario.tipo_usuario} onChange={e => setFormulario({ ...formulario, tipo_usuario: e.target.value })}>
                                    <option value="cliente">Cliente</option>
                                    <option value="fotografo">Fotógrafo</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Correo Electrónico</label>
                            <input type="email" required placeholder="juan@gmail.com" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-600"
                                value={formulario.email} onChange={e => setFormulario({ ...formulario, email: e.target.value })} />
                        </div>

                        {!editandoId && (
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Contraseña Inicial</label>
                                <input type="password" required placeholder="••••••••" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-600"
                                    value={formulario.password} onChange={e => setFormulario({ ...formulario, password: e.target.value })} />
                            </div>
                        )}

                        <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800/60 space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="block font-bold text-zinc-300 text-xs">Acceso al Staff (is_staff)</label>
                                    <span className="text-[10px] text-zinc-500">Permite entrar al panel de control</span>
                                </div>
                                <input type="checkbox" className="w-4 h-4 accent-blue-600 cursor-pointer"
                                    checked={formulario.is_staff} onChange={e => setFormulario({ ...formulario, is_staff: e.target.checked })} />
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-zinc-900/60">
                                <div>
                                    <label className="block font-bold text-zinc-300 text-xs">Cuenta Activa (is_active)</label>
                                    <span className="text-[10px] text-zinc-500">Habilita el inicio de sesión</span>
                                </div>
                                <input type="checkbox" className="w-4 h-4 accent-green-500 cursor-pointer"
                                    checked={formulario.is_active} onChange={e => setFormulario({ ...formulario, is_active: e.target.checked })} />
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button type="submit" className={`flex-1 py-3 rounded-xl font-bold text-white transition-all cursor-pointer ${editandoId ? 'bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-950/20' : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-950/20'}`}>
                                {editandoId ? 'Guardar Configuración' : 'Registrar Cuenta'}
                            </button>
                            {editandoId && <button type="button" onClick={cancelarEdicion} className="px-4 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-xl font-bold cursor-pointer">X</button>}
                        </div>
                    </form>
                </div>

                {/* TABLA DE CONTROL DE USUARIOS (Derecha) */}
                <div className="lg:col-span-8 space-y-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead className="bg-zinc-950/60 border-b border-zinc-800">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Identidad</th>
                                    <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Permisos / Estado</th>
                                    <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-center">Acciones</th>
                                </tr>
                            </thead> {/* Error JSX corregido previamente mediante </thead> */}
                            <thead className="bg-zinc-950/60 border-b border-zinc-800">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Identidad</th>
                                    <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Permisos / Estado</th>
                                    <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                                {usuarios.length > 0 ? (
                                    usuarios.map(u => (
                                        <tr key={u.id} className="hover:bg-zinc-800/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-white text-base">{u.first_name} {u.last_name}</div>
                                                <div className="text-zinc-400 text-xs mt-0.5 font-mono">@{u.username} • <span className="text-zinc-500">{u.email}</span></div>
                                            </td>
                                            <td className="px-6 py-4 space-y-1.5">
                                                <div>
                                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${u.tipo_usuario === 'admin' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                                        u.tipo_usuario === 'fotografo' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                                                            'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                                        }`}>
                                                        {u.tipo_usuario}
                                                    </span>
                                                </div>
                                                <div className="flex gap-2 text-[10px] font-bold">
                                                    <span className={`px-1.5 py-0.2 rounded ${u.is_active ? 'text-green-400 bg-green-500/5' : 'text-zinc-500 bg-zinc-800'}`}>
                                                        {u.is_active ? '● Activo' : '○ Inactivo'}
                                                    </span>
                                                    {u.is_staff && (
                                                        <span className="text-purple-400 bg-purple-500/5 px-1.5 py-0.2 rounded">⚙️ Staff</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center gap-2">
                                                    <button onClick={() => verDetalleUnitario(u.id)} className="p-2 bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-xl hover:bg-zinc-800 transition cursor-pointer" title="Ficha de Usuario">👁️</button>
                                                    <button onClick={() => prepararEdicion(u)} className="p-2 bg-orange-950/40 border border-orange-900 text-orange-400 rounded-xl hover:bg-orange-900/40 transition cursor-pointer" title="Editar">✏️</button>
                                                    <button onClick={() => eliminarUsuario(u.id, u.username)} className="p-2 bg-red-950/40 border border-red-900 text-red-400 rounded-xl hover:bg-red-900/40 transition cursor-pointer" title="Eliminar">🗑️</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="text-center py-10 text-zinc-500 font-medium italic">No se encontraron cuentas en esta página.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* --- CONTROLES VISUALES DE PAGINACIÓN --- */}
                    <div className="flex sm:flex-row flex-col justify-between items-center gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-xs font-bold text-zinc-400">
                        <div>
                            Total: <span className="text-white">{totalRegistros}</span> usuarios registrados
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={!tieneAnterior}
                                onClick={() => setPaginaActual(prev => Math.max(prev - 1, 1))}
                                className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-800 transition"
                            >
                                ◀ Anterior
                            </button>
                            
                            <span className="bg-zinc-950 border border-zinc-800 px-4 py-2 rounded-xl text-blue-400 font-mono">
                                Pag. {paginaActual}
                            </span>

                            <button
                                type="button"
                                disabled={!tieneSiguiente}
                                onClick={() => setPaginaActual(prev => prev + 1)}
                                className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-800 transition"
                            >
                                Siguiente ▶
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            {/* MODAL DETALLE INDIVIDUAL */}
            {usuarioSeleccionado && (
                <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fadeIn">
                    <div className="bg-zinc-900 border border-zinc-800 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden text-zinc-200">
                        <div className="bg-zinc-950 p-4 border-b border-zinc-800 flex justify-between items-center">
                            <span className="text-xs font-black uppercase tracking-wider text-blue-500">Consulta Unitaria Core</span>
                            <button onClick={() => setUsuarioSeleccionado(null)} className="text-zinc-500 hover:text-white font-bold">✕</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="text-center">
                                <div className="w-14 h-14 bg-gradient-to-tr from-zinc-800 to-zinc-700 rounded-2xl flex items-center justify-center font-black text-white text-xl mx-auto shadow-md">
                                    {usuarioSeleccionado.first_name?.[0] || 'U'}{usuarioSeleccionado.last_name?.[0] || 'X'}
                                </div>
                                <h4 className="text-xl font-black text-white mt-2">{`${usuarioSeleccionado.first_name} ${usuarioSeleccionado.last_name}`}</h4>
                                <p className="text-xs text-zinc-500 font-mono">ID de Instancia MySQL: #{usuarioSeleccionado.id}</p>
                            </div>

                            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800/80 space-y-2.5 font-medium text-xs">
                                <div className="flex justify-between border-b border-zinc-900 pb-2"><span className="text-zinc-500">Nombre de Usuario:</span><span className="text-zinc-300 font-mono">@{usuarioSeleccionado.username}</span></div>
                                <div className="flex justify-between border-b border-zinc-900 pb-2"><span className="text-zinc-500">Correo Electrónico:</span><span className="text-zinc-300 truncate max-w-[180px]">{usuarioSeleccionado.email}</span></div>
                                <div className="flex justify-between border-b border-zinc-900 pb-2"><span className="text-zinc-500">Rol Asignado:</span><span className="text-blue-400 uppercase font-bold">{usuarioSeleccionado.tipo_usuario}</span></div>
                                <div className="flex justify-between border-b border-zinc-900 pb-2"><span className="text-zinc-500">Acceso a Django Staff:</span><span className={usuarioSeleccionado.is_staff ? 'text-purple-400 font-bold' : 'text-zinc-600'}>{usuarioSeleccionado.is_staff ? 'Habilitado' : 'Denegado'}</span></div>
                                <div className="flex justify-between pt-1"><span className="text-zinc-500">Estado de Autenticación:</span><span className={usuarioSeleccionado.is_active ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>{usuarioSeleccionado.is_active ? 'Vigente / Activo' : 'Suspendido'}</span></div>
                            </div>
                        </div>
                        <div className="p-4 bg-zinc-950 border-t border-zinc-800">
                            <button onClick={() => setUsuarioSeleccionado(null)} className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-2.5 rounded-xl transition-colors cursor-pointer">
                                Cerrar Ficha del Usuario
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardUsuarios;