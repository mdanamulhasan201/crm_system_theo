import { ApiHistoryEntry, HistoryEntry } from './types';

// Helper function to parse change details from text field
export const parseChangeDetails = (text: string | null): Array<{field: string, oldValue: string, newValue: string}> => {
  if (!text) return [];
  
  // Split by comma to get individual changes
  const changes = text.split(',').map(change => change.trim());
  const parsedChanges: Array<{field: string, oldValue: string, newValue: string}> = [];

  changes.forEach(change => {
    // Handle format like "field: old → new"
    if (change.includes('→')) {
      const parts = change.split('→').map(p => p.trim());
      const fieldPart = parts[0];
      const newValue = parts[1];

      // Extract field name and old value
      const fieldParts = fieldPart.split(':');
      let fieldName = fieldParts[0].trim();
      const oldValue = fieldParts[1]?.trim() || '';
      
      // Translate field names to German
      const fieldTranslations: { [key: string]: string } = {
        'produktname': 'Produktname',
        'hersteller': 'Hersteller',
        'artikelnummer': 'Artikelnummer',
        'lagerort': 'Lagerort',
        'mindestbestand': 'Mindestbestand',
        'purchase_price': 'Einkaufspreis',
        'selling_price': 'Verkaufspreis',
        'groessenMengen': 'Größenmengen'
      };

      // Handle groessenMengen format (e.g., "groessenMengen.35.quantity: 3 → 7")
      if (fieldName.startsWith('groessenMengen')) {
        const sizeMatch = fieldName.match(/groessenMengen\.(\d+)\.(quantity|length)/);
        if (sizeMatch) {
          const size = sizeMatch[1];
          const property = sizeMatch[2] === 'quantity' ? 'Menge' : 'Länge';
          fieldName = `Größe ${size} (${property})`;
        }
      } else {
        // Translate other field names
        const baseField = fieldName.toLowerCase();
        fieldName = fieldTranslations[baseField] || fieldName;
      }

      parsedChanges.push({
        field: fieldName,
        oldValue: oldValue,
        newValue: newValue
      });
    }
  });

  return parsedChanges;
};

// Helper function to map API entry to HistoryEntry
export const mapApiEntryToHistoryEntry = (entry: ApiHistoryEntry): HistoryEntry => {
  // Handle STOCK_UPDATE entries differently
  if (entry.changeType === 'updateStock' || entry.status === 'STOCK_UPDATE') {
    return {
      id: entry.id,
      date: entry.createdAt,
      type: 'stockUpdate',
      quantity: null,
      size: 'N/A',
      previousStock: null,
      newStock: null,
      user: entry.user?.name || entry.user?.email || 'Unknown',
      notes: entry.reason || '',
      status: entry.status,
      changeDetails: parseChangeDetails(entry.text),
      customer: entry.customer,
      order: entry.order
    };
  }

  // Extract size from reason (e.g., "Order size 43" -> "43")
  const sizeMatch = entry.reason?.match(/size\s+(\d+)/i) || entry.reason?.match(/(\d+)/);
  const size = sizeMatch ? sizeMatch[1] : 'N/A';

  // Map changeType to our type
  let type: 'delivery' | 'sale' | 'correction' | 'transfer' = 'correction';
  if (entry.changeType === 'sales') {
    type = 'sale';
  } else if (entry.changeType === 'delivery') {
    type = 'delivery';
  } else if (entry.changeType === 'transfer') {
    type = 'transfer';
  } else if (entry.changeType === 'correction') {
    type = 'correction';
  }

  // Calculate previous stock
  let previousStock = entry.newStock || 0;
  if (entry.quantity !== null) {
    const absQuantity = Math.abs(entry.quantity);
    if (type === 'sale') {
      previousStock = (entry.newStock || 0) + absQuantity;
    } else {
      previousStock = Math.max(0, (entry.newStock || 0) - absQuantity);
    }
  }

  return {
    id: entry.id,
    date: entry.createdAt,
    type,
    quantity: entry.quantity || 0,
    size,
    previousStock: Math.max(0, previousStock),
    newStock: entry.newStock || 0,
    user: entry.user?.name || entry.user?.email || 'Unknown',
    notes: entry.text || entry.reason || '',
    status: entry.status,
    customer: entry.customer,
    order: entry.order
  };
};

// Function to get the type label in German
export const getTypeLabel = (type: string, status: string | null = null): string => {
  if (status === 'STOCK_UPDATE' || type === 'stockUpdate') {
    return 'Bestandsaktualisierung';
  }
  switch (type) {
    case 'delivery':
      return 'Lieferung';
    case 'sale':
      return 'Verkauf';
    case 'correction':
      return 'Korrektur';
    case 'transfer':
      return 'Transfer';
    default:
      return type;
  }
};

// Function to get the type styling
export const getTypeStyling = (type: string, status: string | null = null): string => {
  if (status === 'STOCK_UPDATE' || type === 'stockUpdate') {
    return 'bg-blue-100 text-blue-700 border border-blue-300';
  }
  if (status === 'SELL_OUT' || type === 'sale') {
    return 'bg-red-100 text-red-700 border border-red-300';
  }
  switch (type) {
    case 'delivery':
      return 'bg-green-100 text-green-700 border border-green-300';
    case 'correction':
      return 'bg-yellow-100 text-yellow-700 border border-yellow-300';
    case 'transfer':
      return 'bg-purple-100 text-purple-700 border border-purple-300';
    default:
      return 'bg-gray-100 text-gray-700 border border-gray-300';
  }
};

