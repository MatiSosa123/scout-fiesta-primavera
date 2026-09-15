import { useState, useEffect } from 'react';
import { Search, UserPlus, Trash2, CheckCircle2, Circle, Copy, Check, Download } from 'lucide-react';
// Importamos la base de datos y las funciones de Firestore
import { db } from './firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

function App() {
  // Estado principal: la lista de asistentes
  const [asistentes, setAsistentes] = useState([]);
  const [cargando, setCargando] = useState(true); // Para saber si está conectando a la DB

  // Estado para el buscador
  const [busqueda, setBusqueda] = useState('');
  
  // Estado para el ordenamiento
  const [orden, setOrden] = useState('default');

  // Estado para el botón de copiar alias
  const [copiado, setCopiado] = useState(false);

  // Estado para el formulario de nuevo ingreso
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    tipo: 'Scout',
    pago: 'Preventa'
  });

  // EFECTO: Conectar con Firestore en tiempo real
  useEffect(() => {
    // onSnapshot escucha cualquier cambio en la colección "asistentes"
    const unsubscribe = onSnapshot(collection(db, "asistentes"), (snapshot) => {
      const datos = snapshot.docs.map(doc => ({
        id: doc.id, // El ID único que genera Firebase
        ...doc.data()
      }));
      setAsistentes(datos);
      setCargando(false);
    });

    // Limpiamos la conexión cuando el componente se desmonta
    return () => unsubscribe();
  }, []);

  const copiarAlias = () => {
    navigator.clipboard.writeText("matias-sosa.mp");
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const exportarACSV = () => {
    if (asistentes.length === 0) {
      alert("No hay asistentes para exportar.");
      return;
    }
    const cabeceras = ["Nombre", "Apellido", "DNI", "Tipo", "Pago", "Asistio"];
    const filas = asistentes.map(a => [
      `"${a.nombre}"`, `"${a.apellido}"`, `"${a.dni}"`, `"${a.tipo}"`, `"${a.pago}"`, a.asistio ? "SI" : "NO"
    ]);
    const contenidoCSV = [cabeceras.join(","), ...filas.map(f => f.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + contenidoCSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const fecha = new Date().toLocaleDateString('es-AR').replace(/\//g, '-');
    link.setAttribute("download", `Lista_Fiesta_Primavera_${fecha}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- OPERACIONES CON FIRESTORE (CRUD) ---

  const agregarAsistente = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.apellido || !form.dni) return;

    try {
      await addDoc(collection(db, "asistentes"), {
        ...form,
        asistio: false
      });
      setForm({ nombre: '', apellido: '', dni: '', tipo: 'Scout', pago: 'Preventa' });
    } catch (error) {
      console.error("Error al agregar: ", error);
      alert("Hubo un error al guardar en la base de datos.");
    }
  };

  const eliminarAsistente = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar a esta persona?')) {
      try {
        await deleteDoc(doc(db, "asistentes", id));
      } catch (error) {
        console.error("Error al eliminar: ", error);
      }
    }
  };

  const toggleAsistio = async (id, estadoActual) => {
    try {
      await updateDoc(doc(db, "asistentes", id), {
        asistio: !estadoActual
      });
    } catch (error) {
      console.error("Error al actualizar asistencia: ", error);
    }
  };

  const cambiarPago = async (id, nuevoPago) => {
    try {
      await updateDoc(doc(db, "asistentes", id), {
        pago: nuevoPago
      });
    } catch (error) {
      console.error("Error al actualizar pago: ", error);
    }
  };

  // --- LÓGICA DE FILTRADO Y ORDENAMIENTO ---
  const asistentesFiltradosYOrdenados = asistentes
    .filter(a => {
      const texto = busqueda.toLowerCase();
      return (
        a.nombre.toLowerCase().includes(texto) ||
        a.apellido.toLowerCase().includes(texto) ||
        a.dni.includes(texto)
      );
    })
    .sort((a, b) => {
      if (orden === 'nombre') return a.nombre.localeCompare(b.nombre);
      if (orden === 'apellido') return a.apellido.localeCompare(b.apellido);
      return 0;
    });

  const calcularTotal = () => {
    let total = 0;
    asistentes.forEach(a => {
      if (a.tipo === 'Padre') return; 
      if (a.pago === 'Preventa') total += 6000;
      if (a.pago === 'Puerta') total += 7000;
    });
    return total;
  };

  if (cargando) {
    return <div className="min-h-screen flex items-center justify-center text-xl text-blue-600 font-bold">Cargando datos de la nube... ☁️</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Encabezado */}
        <div className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">🌸 Fiesta de la Primavera</h1>
            <p className="text-slate-500">Control de Entradas - Manada y Tropa</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500 uppercase font-semibold">Recaudación Total</p>
            <p className="text-3xl font-bold text-green-600">${calcularTotal().toLocaleString('es-AR')}</p>
          </div>
        </div>

        {/* Zona de Pagos / Mercado Pago */}
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-700 flex items-center gap-2">💳 Datos para Transferir</h2>
            <p className="text-slate-500 text-sm mt-1">Los chicos pueden transferir directamente a este Alias.</p>
          </div>
          <div className="flex items-center gap-3 bg-slate-50 border p-3 rounded-lg">
            <span className="font-mono text-lg font-bold text-blue-600 select-all">matias-sosa.mp</span>
            <button onClick={copiarAlias} className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold transition-colors ${copiado ? 'bg-green-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
              {copiado ? <Check size={16} /> : <Copy size={16} />}
              {copiado ? '¡Copiado!' : 'Copiar Alias'}
            </button>
          </div>
        </div>

        {/* Formulario de Carga */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-slate-700 flex items-center gap-2"><UserPlus size={20} /> Agregar Asistente</h2>
          <form onSubmit={agregarAsistente} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input type="text" placeholder="Nombre" required className="border p-2 rounded focus:outline-blue-500" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
            <input type="text" placeholder="Apellido" required className="border p-2 rounded focus:outline-blue-500" value={form.apellido} onChange={e => setForm({...form, apellido: e.target.value})} />
            <input type="number" placeholder="DNI" required className="border p-2 rounded focus:outline-blue-500" value={form.dni} onChange={e => setForm({...form, dni: e.target.value})} />
            <select className="border p-2 rounded focus:outline-blue-500" value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})}>
              <option value="Scout">Scout (Manada/Tropa)</option>
              <option value="Invitado">Invitado del Scout</option>
              <option value="Padre">Padre/Madre (Gratis)</option>
            </select>
            <select className="border p-2 rounded focus:outline-blue-500" value={form.pago} onChange={e => setForm({...form, pago: e.target.value})} disabled={form.tipo === 'Padre'}>
              <option value="Preventa">Pagó Preventa ($6.000)</option>
              <option value="Puerta">Pagó en Puerta ($7.000)</option>
              <option value="Debe">Debe</option>
            </select>
            <button type="submit" className="md:col-span-5 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">Agregar a la lista</button>
          </form>
        </div>

        {/* Buscador, Ordenamiento y Tabla */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex items-center gap-2 flex-1 bg-slate-50 p-2 rounded border">
              <Search className="text-slate-400" size={20} />
              <input type="text" placeholder="Buscar por nombre, apellido o DNI..." className="w-full bg-transparent focus:outline-none" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
            </div>
            <select value={orden} onChange={e => setOrden(e.target.value)} className="border p-2 rounded bg-slate-50 text-sm font-medium focus:outline-blue-500">
              <option value="default">Orden de carga</option>
              <option value="nombre">Ordenar por Nombre (A-Z)</option>
              <option value="apellido">Ordenar por Apellido (A-Z)</option>
            </select>
            <button onClick={exportarACSV} className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition-colors text-sm">
              <Download size={18} /> Exportar a Excel
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200 text-slate-600">
                  <th className="p-3">Asistió</th>
                  <th className="p-3">Nombre</th>
                  <th className="p-3">DNI</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Pago</th>
                  <th className="p-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {asistentesFiltradosYOrdenados.length === 0 ? (
                  <tr><td colSpan="6" className="text-center p-6 text-slate-400">No hay asistentes cargados o no coinciden con la búsqueda.</td></tr>
                ) : (
                  asistentesFiltradosYOrdenados.map(a => (
                    <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-3">
                        <button onClick={() => toggleAsistio(a.id, a.asistio)} className="text-slate-400 hover:text-green-500 transition-colors">
                          {a.asistio ? <CheckCircle2 className="text-green-500" size={24} /> : <Circle size={24} />}
                        </button>
                      </td>
                      <td className="p-3 font-medium text-slate-800">{a.nombre} {a.apellido}</td>
                      <td className="p-3 text-slate-600">{a.dni}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${a.tipo === 'Padre' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{a.tipo}</span>
                      </td>
                      <td className="p-3">
                        <select value={a.pago} onChange={(e) => cambiarPago(a.id, e.target.value)} disabled={a.tipo === 'Padre'} className={`p-1 rounded border text-sm font-semibold ${a.pago === 'Debe' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                          {a.tipo === 'Padre' ? (<option value="Gratis">Gratis</option>) : (
                            <><option value="Preventa">Preventa ($6.000)</option><option value="Puerta">Puerta ($7.000)</option><option value="Debe">Debe</option></>
                          )}
                        </select>
                      </td>
                      <td className="p-3 text-center">
                        <button onClick={() => eliminarAsistente(a.id)} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 size={20} /></button>
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

export default App;