import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { useState } from 'react';

function PublicPage() {
  const [copiado, setCopiado] = useState(false);

  const copiarAlias = () => {
    navigator.clipboard.writeText("matias-sosa.mp");
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const pagarAhora = () => {
    navigator.clipboard.writeText("matias-sosa.mp");
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
    
    // Abrimos Mercado Pago después de un pequeño delay
    setTimeout(() => {
      window.open("https://www.mercadopago.com.ar/", "_blank");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-6">
        <h1 className="text-3xl font-bold text-slate-800">🌸 Fiesta de la Primavera</h1>
        <p className="text-slate-500 font-medium">Transferí tu entrada a este Alias:</p>
        
        <div className="bg-slate-50 border p-4 rounded-lg flex flex-col items-center gap-4">
          <span className="font-mono text-xl font-bold text-blue-600 select-all">matias-sosa.mp</span>
          
          <button 
            onClick={pagarAhora} 
            className="flex items-center gap-2 px-6 py-4 rounded-lg font-bold transition-colors w-full justify-center bg-blue-600 hover:bg-blue-700 text-white text-lg"
          >
            <ExternalLink size={24} />
            Pagar con Mercado Pago
          </button>
          
          <button 
            onClick={copiarAlias} 
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-colors w-full justify-center text-sm ${copiado ? 'bg-green-500 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'}`}
          >
            {copiado ? <Check size={18} /> : <Copy size={18} />}
            {copiado ? '¡Alias Copiado!' : 'Solo copiar Alias'}
          </button>
        </div>

        <div className="flex flex-col items-center bg-white p-4 border rounded-xl shadow-sm">
          <QRCodeSVG value="matias-sosa.mp" size={180} level="M" includeMargin={true} />
          <p className="text-xs text-slate-500 mt-3 font-semibold">Escaneá desde la app de Mercado Pago</p>
        </div>
        
        <p className="text-xs text-slate-400">Si tenés problemas, pedile el alias a Mati.</p>
      </div>
    </div>
  );
}

export default PublicPage;