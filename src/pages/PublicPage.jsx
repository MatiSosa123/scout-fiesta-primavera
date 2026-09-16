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
    setTimeout(() => {
      window.open("https://www.mercadopago.com.ar/", "_blank");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 flex flex-col items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center space-y-6 border-t-4 border-orange-500">
        
        <div>
          <div className="text-5xl mb-2">🌸</div>
          <h1 className="text-3xl font-bold text-blue-900">Fiesta de la Primavera</h1>
          <p className="text-slate-500 text-sm mt-1">Manada y Tropa - Grupo Scout</p>
        </div>

        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
          <p className="text-blue-900 font-semibold text-sm mb-3">Transferí tu entrada a este Alias:</p>
          <span className="font-mono text-xl font-bold text-blue-900 select-all block bg-white py-2 rounded border border-blue-200">
            matias-sosa.mp
          </span>
        </div>
        
        <div className="space-y-3">
          <button 
            onClick={pagarAhora} 
            className="flex items-center gap-2 px-6 py-4 rounded-lg font-bold transition-all w-full justify-center bg-orange-500 hover:bg-orange-600 hover:scale-[1.02] text-white text-lg shadow-lg shadow-orange-200"
          >
            <ExternalLink size={24} />
            Pagar con Mercado Pago
          </button>
          
          <button 
            onClick={copiarAlias} 
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-colors w-full justify-center text-sm ${copiado ? 'bg-green-500 text-white' : 'bg-blue-900 hover:bg-blue-800 text-white'}`}
          >
            {copiado ? <Check size={18} /> : <Copy size={18} />}
            {copiado ? '¡Alias Copiado!' : 'Solo copiar Alias'}
          </button>
        </div>

        <div className="flex flex-col items-center bg-white p-4 border-2 border-dashed border-blue-200 rounded-xl">
          <QRCodeSVG value="matias-sosa.mp" size={180} level="M" includeMargin={true} fgColor="#1e3a8a" />
          <p className="text-xs text-blue-900 mt-3 font-semibold">Escaneá desde la app de Mercado Pago</p>
        </div>
        
        <p className="text-xs text-slate-400 italic">Si tenés problemas, pedile el alias a Mati.</p>
      </div>
    </div>
  );
}

export default PublicPage;