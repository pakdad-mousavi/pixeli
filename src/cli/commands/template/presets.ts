import instagramGrid from './presets/instagramGrid.js';
import dashboardShot from './presets/dashboardShot.js';
import horizontalBookSpread from './presets/horizontalBookSpread.js';
import verticalBookSpread from './presets/verticalBookSpread.js';
import artGallery from './presets/artGallery.js';

export const PRESETS = {
  'instagram-grid': instagramGrid,
  'dashboard-shot': dashboardShot,
  'horizontal-book-spread': horizontalBookSpread,
  'vertical-book-spread': verticalBookSpread,
  'art-gallery': artGallery,
};

export const isValidPreset = (presetId: string) => {
  return presetId in PRESETS;
};
