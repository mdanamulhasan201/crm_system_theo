import { CloseIcon } from './Icons';

const CompletionPopUp = ({ onClose, onConfirm, productName, value }: { onClose: () => void; onConfirm: () => void; productName: string; value: string }) => {
  const value2 = value || null;
  // Store the value in localStorage under a unique key for each productName
  if (productName && value2 !== null) {
    localStorage.setItem(`completionValue_${productName}`, value2);
  }
  const formatBalance = (balance: string | null) => {
    if (!balance) return "0,00 €";
    const num = parseFloat(balance);
    return num.toFixed(2).replace('.', ',') + ' €';
  };
  const availableBalance = localStorage.getItem('availableBalance') || "00,00 €";
  const calculateRemainingBalance = (available: string, cost: string | null) => {
    if (!cost) return available;
    const availableNum = parseFloat(available.replace(',', '.'));
    const costNum = parseFloat(cost);
    const remaining = availableNum - costNum;
    return remaining.toFixed(2).replace('.', ',') + ' €';
  }
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[1000]">
      <div className="bg-white rounded-xl w-[90%] max-w-[550px] shadow-2xl animate-[slideIn_0.3s_ease-out]">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-slate-200">
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-slate-900 m-0 mb-2">Bestellung prüfen & bestätigen</h1>
            <p className="text-sm text-slate-500 m-0">
              Sie bestellen verbindlich die folgende Konfiguration:
            </p>
          </div>
          <div 
            className="cursor-pointer w-8 h-8 flex items-center justify-center rounded-md transition-colors hover:bg-slate-100"
            onClick={onClose}
          >
            <CloseIcon />
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm text-slate-500 font-medium">Produkt:</span>
              <span className="text-sm text-slate-900 font-semibold">{productName}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm text-slate-500 font-medium">Kunde:</span>
              <span className="text-sm text-slate-900 font-semibold">Brugger Theo</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm text-slate-500 font-medium">Preis:</span>
              <span className="text-sm text-slate-900 font-semibold">{formatBalance(value2)}</span>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-4 mt-4">
              <p className="text-sm text-slate-600 leading-relaxed m-0">
                Wird von Ihrer FeetFirst Balance abgerechnet.<br />
                Verfügbares Guthaben: <strong className="text-slate-900">{availableBalance} €</strong> – Restguthaben nach Kauf: <strong className="text-slate-900">{calculateRemainingBalance(availableBalance, value2)}</strong>
              </p>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
              <p className="text-sm text-amber-700 font-medium m-0">
                Individuelle Anfertigung – vom Widerruf ausgeschlossen.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="flex justify-end gap-3 p-6 border-t border-slate-200">
          <button 
            className="py-2.5 px-6 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 border-none outline-none bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-[0.98]" 
            onClick={onClose}
          >
            Abbrechen
          </button>
          <button 
            className="py-2.5 px-6 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 border-none outline-none bg-[#36A866] text-white hover:bg-[#2d8a55] active:scale-[0.98]" 
            onClick={onConfirm}
          >
            Verbindlich bestellen
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompletionPopUp;