import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Citas from '../citas/citas-all';
import DashboardProductos from './DashboardProductos';
import DashboardFotografos from './DashboardFotografos';
import DashboardPaquetes from './DashboardPaquetes';
import DashboardUsuarios from './DashboardUsuarios';


function Dashboard() {
    const navigate = useNavigate();
    const [pestanaActiva, setPestanaActiva] = useState('inicio');
    const nombreAdmin = localStorage.getItem('nombre_completo') || 'Administrador';

    const cerrarSesion = () => {
        if (window.confirm("¿Deseas salir del panel administrativo?")) {
            localStorage.clear();
            navigate('/login');
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col md:flex-row">

            {/* BARRA LATERAL (Sidebar) */}
            <aside className="w-full md:w-64 bg-zinc-900 border-b md:border-b-0 md:border-r border-zinc-800 flex flex-col p-6 shrink-0">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-blue-600 rounded-full italic flex items-center justify-center font-black text-white text-lg">F</div>
                    <div>
                        <span className="text-xl font-black tracking-tight block uppercase">Estudio Jerez</span>
                        <span className="text-[10px] text-blue-500 uppercase tracking-widest font-bold">Panel de Control</span>
                    </div>
                </div>

                {/* MENÚ DE SECCIONES */}
                <nav className="space-y-2 flex-1">
                    <button
                        onClick={() => setPestanaActiva('inicio')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${pestanaActiva === 'inicio' ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/40' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}`}
                    >
                        <span>📊</span> Métricas Generales
                    </button>

                    <button
                        onClick={() => setPestanaActiva('productos')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${pestanaActiva === 'productos' ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/40' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}`}
                    >
                        <span>📦</span> Inventario e Insumos
                    </button>

                    <button
                        onClick={() => setPestanaActiva('fotografos')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${pestanaActiva === 'fotografos' ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}`}
                    >
                        <span>📸</span> Plantilla de Staff
                    </button>

                    <button
                        onClick={() => setPestanaActiva('paquetes')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${pestanaActiva === 'paquetes' ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}`}
                    >
                        <span>🏷️</span> Paquetes de Estudio
                    </button>

                    <button
                        onClick={() => setPestanaActiva('usuarios')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${pestanaActiva === 'usuarios' ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}`}
                    >
                        <span>👥</span> Control de Usuarios
                    </button>

                    <button
                        onClick={() => setPestanaActiva('citasAdmin')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${pestanaActiva === 'citasAdmin' ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}`}
                    >
                        <span>📅</span> Citas de la Sucursal
                    </button>


                </nav>

                {/* FOOTER DEL SIDEBAR */}
                <div className="mt-auto pt-6 border-t border-zinc-800 flex items-center justify-between gap-2">
                    <div className="truncate">
                        <p className="text-xs font-bold text-white truncate">{nombreAdmin}</p>
                        <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Root Admin</p>
                    </div>
                    <button
                        onClick={cerrarSesion}
                        className="p-2.5 bg-zinc-800 hover:bg-red-950/40 border border-zinc-700 hover:border-red-900 text-zinc-400 hover:text-red-400 rounded-xl transition-colors text-sm"
                        title="Cerrar sesión"
                    >
                        🚪
                    </button>
                </div>
            </aside>

            {/* CONTENIDO PRINCIPAL */}
            <main className="flex-1 p-6 md:p-10 overflow-y-auto">

                {/* 1. SECCIÓN: INICIO (Métricas de negocio rápidas) */}
                {pestanaActiva === 'inicio' && (
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-3xl font-black text-white tracking-tight">Bienvenido de vuelta, {nombreAdmin.split(' ')[0]}</h2>
                            <p className="text-sm text-zinc-400 mt-1">Este es el estado operativo de tu sucursal en tiempo real.</p>
                        </div>

                        {/* Tarjetas de Datos de MySQL simuladas */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl shadow-xl">
                                <div className="flex justify-between items-center">
                                    <span className="text-2xl">💰</span>
                                    <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 border border-green-500/20 rounded font-black font-mono">Este mes</span>
                                </div>
                                <p className="text-2xl font-mono font-black text-white mt-4">$24,500.00</p>
                                <p className="text-xs text-zinc-500 mt-1 font-medium">Ingresos Totales en Caja</p>
                            </div>

                            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl shadow-xl">
                                <div className="flex justify-between items-center">
                                    <span className="text-2xl">📸</span>
                                    <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 border border-blue-500/20 rounded font-black uppercase font-mono">Activos</span>
                                </div>
                                p.text-2xl.font-mono.font-black.text-white.mt-4 3 Citas hoy
                                <p className="text-xs text-zinc-500 mt-1 font-medium">Agenda del estudio activa</p>
                            </div>

                            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl shadow-xl">
                                <div className="flex justify-between items-center">
                                    <span className="text-2xl">📦</span>
                                    <span className="text-[10px] bg-orange-500/10 text-orange-400 px-2 py-0.5 border border-orange-500/20 rounded font-black uppercase font-mono">Alerta</span>
                                </div>
                                <p className="text-2xl font-mono font-black text-white mt-4">2 Insumos bajos</p>
                                <p className="text-xs text-zinc-500 mt-1 font-medium">Productos con stock crítico</p>
                            </div>

                            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl shadow-xl">
                                <div className="flex justify-between items-center">
                                    <span className="text-2xl">👥</span>
                                    <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 border border-purple-500/20 rounded font-black uppercase font-mono">Total</span>
                                </div>
                                <p className="text-2xl font-mono font-black text-white mt-4">124 Clientes</p>
                                <p className="text-xs text-zinc-500 mt-1 font-medium">Usuarios registrados en DB</p>
                            </div>
                        </div>

                        {/* Banner publicitario o de aviso del sistema */}
                        <div className="p-6 bg-gradient-to-r from-blue-900/30 to-indigo-900/10 border border-blue-800/40 rounded-3xl flex items-center justify-between">
                            <div className="max-w-md">
                                <h4 className="text-lg font-bold text-blue-200">¿Listo para auditar la base de datos?</h4>
                                <p className="text-xs text-blue-300/80 mt-1">Recuerda que tienes los privilegios del superusuario para modificar catálogos globales del servidor.</p>
                            </div>
                            <button
                                onClick={() => setPestanaActiva('productos')}
                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 font-bold rounded-xl text-xs transition-colors shadow-md shadow-blue-950/50 cursor-pointer"
                            >
                                Revisar Almacén →
                            </button>
                        </div>
                    </div>
                )}

                {/* Secciones del dash */}
                {pestanaActiva === 'productos' && <DashboardProductos />}
                {pestanaActiva === 'fotografos' && <DashboardFotografos />}
                {pestanaActiva === 'paquetes' && <DashboardPaquetes />}
                {pestanaActiva === 'usuarios' && <DashboardUsuarios />}
                {pestanaActiva === 'citasAdmin' && <Citas esComponenteAdmin={true} />}

            </main>
        </div>
    );
}

export default Dashboard;