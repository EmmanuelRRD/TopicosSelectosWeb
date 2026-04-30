import { useState, useEffect } from 'react';

/**
 * COMPONENTE: GestionCitas
 * Descripción: Maneja el ABCC (Altas, Bajas, Cambios, Consultas) de citas 
 * conectándose a una API de Django REST Framework.
 */
const GestionCitas = () => {
    // --- ESTADOS (Hooks) ---
    
    // Almacena la lista de citas que vienen del servidor
    const [citas, setCitas] = useState([]);
    
    // Controla si estamos editando (guarda el ID) o creando (null)
    const [editandoId, setEditandoId] = useState(null);
    
    // Objeto que vincula los campos del formulario con el estado de React
    const [nuevaCita, setNuevaCita] = useState({ 
        paquete: '', 
        fecha_cita: '', 
        precio_total: '',
        abono: 0,
        lugar: 'Estudio Jerez', // Valor por defecto
        notas: ''
    });

    // API en Django
    const API_URL = 'http://127.0.0.1:8000/api/citas/';

    // --- FUNCIONES DE LÓGICA (CRUD) ---


    /**
     * 1. CONSULTA (Read): Trae todas las citas de la base de datos MySQL
     */
    const obtenerCitas = () => {
        fetch(API_URL)
            .then(res => res.json()) // Convierte la respuesta a formato JSON
            .then(data => setCitas(data)) // Guarda los datos en el estado 'citas'
            .catch(err => console.error("Error al conectar con la API:", err));
    };

    // useEffect se ejecuta una sola vez cuando el componente se carga en pantalla
    useEffect(() => { 
        obtenerCitas(); 
    }, []);

    /**
     * 2. PREPARAR EDICIÓN: Pasa los datos de una cita de la tabla al formulario
     */
    const prepararEdicion = (cita) => {
        setEditandoId(cita.id); // Al cambiar a un ID, el formulario entra en "Modo Edición"
        setNuevaCita({
            paquete: cita.paquete,
            // Recortamos la fecha (ISO) para que el input datetime-local la acepte
            fecha_cita: cita.fecha_cita ? cita.fecha_cita.substring(0, 16) : '',
            precio_total: cita.precio_total,
            abono: cita.abono,
            lugar: cita.lugar,
            notas: cita.notas || ''
        });
    };

    /**
     * 3. ALTA Y CAMBIO (Create & Update): Envía los datos del formulario al servidor
     */
    const manejarEnvio = (e) => {
        e.preventDefault(); // Evita que la página se recargue al enviar el form
        
        const esEdicion = editandoId !== null;
        // Si editamos, la URL lleva el ID al final: /api/citas/5/
        const url = esEdicion ? `${API_URL}${editandoId}/` : API_URL;
        // Si editamos usamos PATCH (actualizar), si no, POST (crear)
        const metodo = esEdicion ? 'PATCH' : 'POST';

        fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            // Enviamos el objeto nuevaCita convertido a texto JSON
            body: JSON.stringify({ ...nuevaCita, cliente: 1 }) 
        })
        .then(res => {
            if(res.ok) {
                obtenerCitas(); // Refrescamos la tabla con los nuevos datos
                cancelarEdicion(); // Limpiamos el formulario
            }
        });
    };

    /**
     * Función para limpiar el formulario y volver al "Modo Alta"
     */
    const cancelarEdicion = () => {
        setEditandoId(null);
        setNuevaCita({ paquete: '', fecha_cita: '', precio_total: '', abono: 0, lugar: 'Estudio Jerez', notas: '' });
    };

    // --- RENDERIZADO (Interfaz con Tailwind CSS) ---
    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                
                {/* Encabezado Principal */}
                <header className="mb-10 text-center md:text-left">
                    <h2 className="text-4xl font-black text-gray-900 tracking-tight">
                        📸 Panel <span className="text-indigo-600">Estudio Jerez</span>
                    </h2>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* COLUMNA 1: FORMULARIO (4 de 12 espacios) */}
                    <div className="lg:col-span-4 bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 h-fit">
                        <h3 className={`text-2xl font-bold mb-6 ${editandoId ? 'text-orange-500' : 'text-indigo-600'}`}>
                            {editandoId ? 'Editar Registro' : 'Nueva Cita'}
                        </h3>
                        
                        <form onSubmit={manejarEnvio} className="space-y-4">
                            {/* Inputs en cuadrícula de 2 columnas */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">ID Paquete</label>
                                    <input type="number" className="w-full mt-1 p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none" 
                                        value={nuevaCita.paquete} onChange={e => setNuevaCita({...nuevaCita, paquete: e.target.value})} required />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Precio Total</label>
                                    <input type="number" className="w-full mt-1 p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none" 
                                        value={nuevaCita.precio_total} onChange={e => setNuevaCita({...nuevaCita, precio_total: e.target.value})} />
                                </div>
                            </div>

                            {/* Input de Fecha y Hora */}
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Fecha y Hora</label>
                                <input type="datetime-local" className="w-full mt-1 p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none" 
                                    value={nuevaCita.fecha_cita} onChange={e => setNuevaCita({...nuevaCita, fecha_cita: e.target.value})} required />
                            </div>

                            {/* Inputs de Abono y Lugar */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Abono ($)</label>
                                    <input type="number" className="w-full mt-1 p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none" 
                                        value={nuevaCita.abono} onChange={e => setNuevaCita({...nuevaCita, abono: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Lugar</label>
                                    <input type="text" className="w-full mt-1 p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none" 
                                        value={nuevaCita.lugar} onChange={e => setNuevaCita({...nuevaCita, lugar: e.target.value})} />
                                </div>
                            </div>

                            {/* Área de texto para Notas */}
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Notas Adicionales</label>
                                <textarea className="w-full mt-1 p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-indigo-400 h-24 outline-none" 
                                    value={nuevaCita.notas} onChange={e => setNuevaCita({...nuevaCita, notas: e.target.value})} placeholder="Detalles de la sesión..."></textarea>
                            </div>

                            {/* Botones de Acción */}
                            <div className="flex gap-3 pt-4">
                                <button type="submit" className={`flex-1 py-4 rounded-2xl text-white font-bold shadow-lg transition-all active:scale-95 ${editandoId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                                    {editandoId ? 'Actualizar Cita' : 'Confirmar Cita'}
                                </button>
                                {editandoId && (
                                    <button type="button" onClick={cancelarEdicion} className="px-6 py-4 bg-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-300">
                                        Cancelar
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* COLUMNA 2: TABLA (8 de 12 espacios) */}
                    <div className="lg:col-span-8 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Información de Sesión</th>
                                    <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Finanzas</th>
                                    <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {citas.map(cita => (
                                    <tr key={cita.id} className="hover:bg-indigo-50/50 transition duration-150">
                                        {/* Datos de la Cita */}
                                        <td className="px-6 py-6">
                                            <div className="font-bold text-gray-900 text-lg">{cita.cliente_nombre}</div>
                                            <div className="text-indigo-600 font-medium italic">{cita.paquete_nombre}</div>
                                            <div className="text-gray-400 text-xs mt-1 font-medium">📍 {cita.lugar}</div>
                                            <div className="text-gray-400 text-[11px] mt-1">📅 {new Date(cita.fecha_cita).toLocaleString()}</div>
                                        </td>
                                        {/* Datos Económicos */}
                                        <td className="px-6 py-6">
                                            <div className="text-sm font-bold text-gray-700 font-mono">Total: ${cita.precio_total}</div>
                                            <div className="text-sm text-green-600 font-semibold font-mono font-bold">Abono: ${cita.abono}</div>
                                            <div className="mt-2">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${cita.pagado ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {cita.pagado ? 'Liquidado' : 'Pendiente'}
                                                </span>
                                            </div>
                                        </td>
                                        {/* Botones de Editar/Eliminar */}
                                        <td className="px-6 py-6">
                                            <div className="flex justify-center gap-3">
                                                <button onClick={() => prepararEdicion(cita)} className="p-3 bg-orange-50 text-orange-600 rounded-2xl hover:bg-orange-100 transition shadow-sm" title="Editar">
                                                    ✏️
                                                </button>
                                                <button onClick={() => { 
                                                    if(window.confirm("¿Seguro que deseas eliminar esta cita?")) 
                                                        fetch(`${API_URL}${cita.id}/`, {method:'DELETE'}).then(()=>obtenerCitas())
                                                }} className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition shadow-sm" title="Eliminar">
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default GestionCitas;