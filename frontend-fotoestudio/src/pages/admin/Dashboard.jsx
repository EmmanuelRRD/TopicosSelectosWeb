import { Link } from 'react-router-dom';

const Dashboard = () => {
  // Datos simulados
  const stats = [
    { 
      name: 'Citas Hoy', 
      value: '4', 
      icon: <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> 
    },
    { 
      name: 'Galería', 
      value: '124 fotos', 
      icon: <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> 
    },
    { 
      name: 'Clientes', 
      value: '58', 
      icon: <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> 
    },
    { 
      name: 'Sesiones Mes', 
      value: '12', 
      icon: <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg> 
    },
  ];

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col hidden lg:flex">
        <div className="p-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-blue-900/20">F</div>
            <span className="text-xl font-bold tracking-tighter uppercase">Jerez Admin</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold mb-4 px-4">Menú</p>
          
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-900/20 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            <span className="text-sm font-semibold">Dashboard</span>
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span className="text-sm font-semibold">Agenda</span>
          </button>
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <Link to="/login" className="flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-red-400 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            <span className="text-sm font-bold">Salir</span>
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black text-white">Panel de Control</h1>
            <p className="text-zinc-500 text-sm italic">8vo Semestre - Ingeniería en Sistemas</p>
          </div>
          <div className="w-10 h-10 bg-zinc-800 rounded-full border border-zinc-700"></div>
        </header>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl">
              <div className="mb-4">{stat.icon}</div>
              <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest">{stat.name}</p>
              <h3 className="text-2xl font-black text-white">{stat.value}</h3>
            </div>
          ))}
        </div>

        {/* WORK AREA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
              <h3 className="text-lg font-bold mb-4 text-blue-500">Sesiones Próximas</h3>
              <div className="space-y-4">
                 <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 flex justify-between">
                    <span className="text-sm font-medium">Boda García</span>
                    <span className="text-xs text-zinc-500">25/04/2026</span>
                 </div>
                 <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 flex justify-between">
                    <span className="text-sm font-medium">XV de María</span>
                    <span className="text-xs text-zinc-500">27/04/2026</span>
                 </div>
              </div>
           </div>

           <div className="bg-blue-600 rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xl font-black mb-2 text-white">Acciones Rápidas</h3>
                <p className="text-blue-100 text-xs mb-6">Gestionar inventario y clientes</p>
                <div className="grid grid-cols-2 gap-3">
                  <button className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl text-xs font-bold transition-all">Nueva Cita</button>
                  <button className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl text-xs font-bold transition-all">Subir Foto</button>
                </div>
              </div>
              <div className="absolute -right-8 -bottom-8 opacity-10">
                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;