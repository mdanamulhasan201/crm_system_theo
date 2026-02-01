// Constants for LeatherColorSectionModal

/**
 * Color palette for leather color visualization
 */
export const COLOR_PALETTE: Record<string, string> = {
  'Schwarz': '#000000',
  'Braun': '#8B4513',
  'Beige': '#F5F5DC',
  'Weiß': '#FFFFFF',
  'Grau': '#808080',
  'Blau': '#0000FF',
  'Rot': '#FF0000',
  'Grün': '#008000',
  'Navy': '#000080',
  'Burgundy': '#800020',
  'Tan': '#D2B48C',
  'Cognac': '#9F381D',
};

/**
 * Map leather type values to display names
 */
export const LEATHER_TYPE_DISPLAY: Record<string, string> = {
  'kalbleder-vitello': 'Kalbleder Vitello',
  'nappa': 'Nappa (weiches Glattleder)',
  'nubukleder': 'Nubukleder',
  'softvelourleder': 'Softvelourleder',
  'hirschleder-gemustert': 'Hirschleder Gemustert',
  'performance-textil': 'Performance Textil',
  'fashion-mesh-gepolstert': 'Fashion Mesh Gepolstert',
  'soft-touch-material-gepraegt': 'Soft Touch Material - Geprägt',
  'textil-python-effekt': 'Textil Python-Effekt',
  'glitter': 'Glitter',
  'luxury-glitter-fabric': 'Luxury Glitter Fabric',
  'metallic-finish': 'Metallic Finish',
};

/**
 * Get color hex code from color name
 */
export const getColorHex = (colorName: string): string => {
  if (COLOR_PALETTE[colorName]) {
    return COLOR_PALETTE[colorName];
  }
  const lowerColor = colorName.toLowerCase();
  for (const [key, value] of Object.entries(COLOR_PALETTE)) {
    if (key.toLowerCase() === lowerColor) {
      return value;
    }
  }
  const defaults = ['#8B4513', '#000000', '#F5F5DC'];
  return defaults[0] || '#CCCCCC';
};

/**
 * Get leather type display name
 */
export const getLeatherTypeDisplayName = (value: string): string => {
  return LEATHER_TYPE_DISPLAY[value] || value;
};

/**
 * Available leather types for selection
 */
export const AVAILABLE_LEATHER_TYPES = [
  'kalbleder-vitello',
  'nappa',
  'nubukleder',
  'softvelourleder',
  'hirschleder-gemustert',
  'performance-textil',
  'fashion-mesh-gepolstert',
  'soft-touch-material-gepraegt',
  'textil-python-effekt',
  'glitter',
  'luxury-glitter-fabric',
  'metallic-finish',
] as const;

