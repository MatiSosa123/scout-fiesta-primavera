import { useState, useEffect } from 'react';
import { Search, UserPlus, Trash2, CheckCircle2, Circle, Download, Users, UserCheck, AlertCircle, LogOut } from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

function AdminPage() {
  const [asistentes, setAsistentes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState('default');

  const [form, setForm] = useState({
    nombre: '', apellido: '', dni: '', tipo: 'Scout', pago: 'Preventa'
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "asistentes"), (snapshot) => {
      const datos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAsistentes(datos);
      setCargando(false);
    });
    return () => unsubscribe();
  }, []);

  const exportarACSV = () => {
    if (asistentes.length === 0) return alert("No hay asistentes para exportar.");
    const cabeceras = ["Nombre", "Apellido", "DNI", "Tipo", "Pago", "Asistio"];
    const filas = asistentes.map(a => [`"${a.nombre}"`, `"${a.apellido}"`, `"${a.dni}"`, `"${a.tipo}"`, `"${a.pago}"`, a.asistio ? "SI" : "NO"]);
    const contenidoCSV = [cabeceras.join(","), ...filas.map(f => f.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + contenidoCSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const fecha = new Date().toLocaleDateString('es-AR').replace(/\//g, '-');
    link.setAttribute("download", `Lista_Fiesta_Primavera_${fecha}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const agregarAsistente = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.apellido || !form.dni) return;
    try { 
      await addDoc(collection(db, "asistentes"), { ...form, asistio: false }); 
      setForm({ nombre: '', apellido: '', dni: '', tipo: 'Scout', pago: 'Preventa' }); 
    } catch (error) { console.error(error); }
  };

  const eliminarAsistente = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar a esta persona?')) { 
      try { await deleteDoc(doc(db, "asistentes", id)); } catch (error) { console.error(error); } 
    }
  };

  const toggleAsistio = async (id, estadoActual) => {
    try { await updateDoc(doc(db, "asistentes", id), { asistio: !estadoActual }); } catch (error) { console.error(error); }
  };

  const cambiarPago = async (id, nuevoPago) => {
    try { await updateDoc(doc(db, "asistentes", id), { pago: nuevoPago }); } catch (error) { console.error(error); }
  };

  const asistentesFiltradosYOrdenados = asistentes.filter(a => {
    const texto = busqueda.toLowerCase();
    return a.nombre.toLowerCase().includes(texto) || a.apellido.toLowerCase().includes(texto) || a.dni.includes(texto);
  }).sort((a, b) => {
    if (orden === 'nombre') return a.nombre.localeCompare(b.nombre);
    if (orden === 'apellido') return a.apellido.localeCompare(b.apellido);
    return 0;
  });

  const calcularTotal = () => {
    let total = 0;
    asistentes.forEach(a => { if (a.tipo === 'Padre') return; if (a.pago === 'Preventa') total += 6000; if (a.pago === 'Puerta') total += 7000; });
    return total;
  };

  const stats = {
    scouts: asistentes.filter(a => a.tipo === 'Scout').length,
    invitados: asistentes.filter(a => a.tipo === 'Invitado').length,
    padres: asistentes.filter(a => a.tipo === 'Padre').length,
    deudores: asistentes.filter(a => a.pago === 'Debe' && a.tipo !== 'Padre').length
  };

  if (cargando) return (
    <div className="min-h-screen bg-blue-900 flex items-center justify-center text-xl text-white font-bold">
      Cargando datos de la nube... ☁️
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-4 md:space-y-6">
        
        {/* Encabezado */}
        <div className="bg-blue-900 text-white p-4 md:p-6 rounded-lg shadow-md flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold">🌸 Panel de Administración</h1>
            <p className="text-blue-200 text-sm md:text-base">Control de Entradas - Manada y Tropa</p>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <div className="text-center md:text-right w-full md:w-auto bg-green-500 p-3 rounded-lg shadow-inner">
              <p className="text-xs text-green-100 uppercase font-bold">Recaudación Total</p>
              <p className="text-2xl md:text-3xl font-bold text-white">${calcularTotal().toLocaleString('es-AR')}</p>
            </div>
            <button 
              onClick={() => signOut(auth)} 
              className="flex items-center justify-center gap-2 bg-white hover:bg-orange-100 text-blue-900 font-semibold px-4 py-2 rounded-lg transition-colors w-full md:w-auto border-2 border-orange-500"
            >
              <LogOut size={18} />
              Salir
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border-l-4 border-blue-900 flex items-center justify-between">
            <div><p className="text-[10px] md:text-xs text-slate-500 font-semibold uppercase">Scouts</p><p className="text-xl md:text-2xl font-bold text-blue-900">{stats.scouts}</p></div>
            <Users className="text-blue-900" size={24} />
          </div>
          <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border-l-4 border-orange-500 flex items-center justify-between">
            <div><p className="text-[10px] md:text-xs text-slate-500 font-semibold uppercase">Invitados</p><p className="text-xl md:text-2xl font-bold text-orange-600">{stats.invitados}</p></div>
            <UserCheck className="text-orange-500" size={24} />
          </div>
          <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border-l-4 border-blue-900 flex items-center justify-between">
            <div><p className="text-[10px] md:text-xs text-slate-500 font-semibold uppercase">Padres</p><p className="text-xl md:text-2xl font-bold text-blue-900">{stats.padres}</p></div>
            <Users className="text-blue-900" size={24} />
          </div>
          <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border-l-4 border-red-400 flex items-center justify-between">
            <div><p className="text-[10px] md:text-xs text-slate-500 font-semibold uppercase">Deben Plata</p><p className="text-xl md:text-2xl font-bold text-red-600">{stats.deudores}</p></div>
            <AlertCircle className="text-red-400" size={24} />
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md border-t-4 border-blue-900">
          <h2 className="text-lg md:text-xl font-semibold mb-4 text-blue-900 flex items-center gap-2"><UserPlus size={20} /> Agregar Asistente</h2>
          <form onSubmit={agregarAsistente} className="grid grid-cols-1 md:grid-cols-5 gap-3 md:gap-4">
            <input type="text" placeholder="Nombre" required className="border p-2 rounded focus:outline-orange-500 text-sm" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
            <input type="text" placeholder="Apellido" required className="border p-2 rounded focus:outline-orange-500 text-sm" value={form.apellido} onChange={e => setForm({...form, apellido: e.target.value})} />
            <input type="number" placeholder="DNI" required className="border p-2 rounded focus:outline-orange-500 text-sm" value={form.dni} onChange={e => setForm({...form, dni: e.target.value})} />
            <select className="border p-2 rounded focus:outline-orange-500 text-sm" value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})}>
              <option value="Scout">Scout (Manada/Tropa)</option>
              <option value="Invitado">Invitado del Scout</option>
              <option value="Padre">Padre/Madre (Gratis)</option>
            </select>
            <select className="border p-2 rounded focus:outline-orange-500 text-sm" value={form.pago} onChange={e => setForm({...form, pago: e.target.value})} disabled={form.tipo === 'Padre'}>
              <option value="Preventa">Pagó Preventa ($6.000)</option>
              <option value="Puerta">Pagó en Puerta ($7.000)</option>
              <option value="Debe">Debe</option>
            </select>
            <button type="submit" className="md:col-span-5 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded transition-colors text-sm shadow-lg shadow-orange-200">
              Agregar a la lista
            </button>
          </form>
        </div>

        {/* Tabla */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-4">
            <div className="flex items-center gap-2 flex-1 bg-slate-50 p-2 rounded border focus-within:border-orange-500 transition-colors">
              <Search className="text-slate-400" size={18} />
              <input type="text" placeholder="Buscar..." className="w-full bg-transparent focus:outline-none text-sm" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <select value={orden} onChange={e => setOrden(e.target.value)} className="border p-2 rounded bg-slate-50 text-xs md:text-sm font-medium focus:outline-orange-500 flex-1 md:flex-none">
                <option value="default">Orden de carga</option>
                <option value="nombre">Nombre (A-Z)</option>
                <option value="apellido">Apellido (A-Z)</option>
              </select>
              <button onClick={exportarACSV} className="flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold py-2 px-3 md:px-4 rounded transition-colors text-xs md:text-sm flex-1 md:flex-none">
                <Download size={16} /> <span className="hidden md:inline">Exportar a Excel</span><span className="md:hidden">Excel</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-blue-900 text-white text-xs md:text-sm">
                  <th className="p-2 md:p-3 rounded-tl-lg">Asistió</th>
                  <th className="p-2 md:p-3">Nombre</th>
                  <th className="p-2 md:p-3 hidden md:table-cell">DNI</th>
                  <th className="p-2 md:p-3 hidden md:table-cell">Tipo</th>
                  <th className="p-2 md:p-3">Pago</th>
                  <th className="p-2 md:p-3 text-center rounded-tr-lg">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {asistentesFiltradosYOrdenados.length === 0 ? (
                  <tr><td colSpan="6" className="text-center p-6 text-slate-400 text-sm">No hay asistentes cargados o no coinciden con la búsqueda.</td></tr>
                ) : (
                  asistentesFiltradosYOrdenados.map(a => (
                    <tr key={a.id} className="border-b border-slate-100 hover:bg-orange-50 transition-colors text-sm">
                      <td className="p-2 md:p-3">
                        <button onClick={() => toggleAsistio(a.id, a.asistio)} className="text-slate-400 hover:text-orange-500 transition-colors">
                          {a.asistio ? <CheckCircle2 className="text-green-500" size={22} /> : <Circle size={22} />}
                        </button>
                      </td>
                      <td className="p-2 md:p-3 font-medium text-blue-900">{a.nombre} {a.apellido}</td>
                      <td className="p-2 md:p-3 text-slate-600 hidden md:table-cell">{a.dni}</td>
                      <td className="p-2 md:p-3 hidden md:table-cell">
                        <span className={`px-2 py-1 rounded text-[10px] font-semibold ${a.tipo === 'Padre' ? 'bg-blue-900 text-white' : 'bg-orange-100 text-orange-700'}`}>{a.tipo}</span>
                      </td>
                      <td className="p-2 md:p-3">
                        <select value={a.pago} onChange={(e) => cambiarPago(a.id, e.target.value)} disabled={a.tipo === 'Padre'} className={`p-1 rounded border text-xs font-semibold ${a.pago === 'Debe' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                          {a.tipo === 'Padre' ? (<option value="Gratis">Gratis</option>) : (<><option value="Preventa">Preventa</option><option value="Puerta">Puerta</option><option value="Debe">Debe</option></>)}
                        </select>
                      </td>
                      <td className="p-2 md:p-3 text-center">
                        <button onClick={() => eliminarAsistente(a.id)} className="text-red-400 hover:text-red-600 transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;