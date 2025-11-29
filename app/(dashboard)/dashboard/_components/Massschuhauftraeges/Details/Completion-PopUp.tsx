 
// import '../assets/css/completion-popup.css';
import { CloseIcon } from './Icons';

 const CompletionPopUp = ({ onClose, onConfirm , productName,value }: { onClose: () => void; onConfirm: () => void; productName:string ; value:string }) => {
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
  const availableBalance =localStorage.getItem('availableBalance')|| "00,00 €" ;
 const calculateRemainingBalance = (available: string, cost: string | null) => {
    if (!cost) return available;
    const availableNum = parseFloat(available.replace(',', '.'));
    const costNum = parseFloat(cost);
    const remaining = availableNum - costNum;
    return remaining.toFixed(2).replace('.', ',') + ' €';
  }
  return (
    <div className="completion-popup-overlay">
      <div className="completion-popup"> 
        <div className="popup-header">
          <div className="header-content2">
            <h1 className="popup-title">Bestellung prüfen & bestätigen</h1>
            <p className="popup-subtitle">
              Sie bestellen verbindlich die folgende Konfiguration:
            </p>
          </div>
          <div className="close-icon"
          onClick={onClose}
          >
                  <CloseIcon />
          </div>
        </div>

        {/* Content Section */}
        <div className="popup-content">
          <div className="order-details">
            <div className="detail-row">
              <span className="detail-label">Produkt:</span>
              <span className="detail-value">{productName}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Kunde:</span>
              <span className="detail-value">Brugger Theo</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Preis:</span>
              <span className="detail-value">{formatBalance(value2)}</span>
            </div>
            
            <div className="balance-info">
              <p>
                Wird von Ihrer FeetFirst Balance abgerechnet.<br />
                Verfügbares Guthaben: <strong>{availableBalance} €</strong> – Restguthaben nach Kauf: <strong>{calculateRemainingBalance(availableBalance, value2)} </strong>
              </p>
            </div>
            
            <div className="custom-notice">
              Individuelle Anfertigung – vom Widerruf ausgeschlossen.
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="popup-footer">
          <div className="footer-actions">
            <button className="cancel-btn" onClick={onClose}>
              Abbrechen
            </button>
            <button className="confirm-btn" onClick={onConfirm}>
              Verbindlich bestellen
            </button>
          </div>
        </div>

       
      </div>
    </div>
  );
};

export default CompletionPopUp;