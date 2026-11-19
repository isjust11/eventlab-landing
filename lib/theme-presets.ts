/** Material-inspired color palettes for invite theme tokens. */

export type ThemeColorTokens = {
  accent: string;
  accentSoft: string;
  ink: string;
  muted: string;
  bg: string;
  bgSoft: string;
  onAccent: string;
};

export type ThemeColorPreset = {
  id: string;
  name: string;
  colors: ThemeColorTokens;
};

export const THEME_COLOR_KEYS: Array<{ key: keyof ThemeColorTokens; label: string }> = [
  { key: 'accent', label: 'Màu chính' },
  { key: 'accentSoft', label: 'Màu phụ' },
  { key: 'ink', label: 'Chữ đậm' },
  { key: 'muted', label: 'Chữ nhạt' },
  { key: 'bg', label: 'Nền' },
  { key: 'bgSoft', label: 'Nền phụ' },
  { key: 'onAccent', label: 'Chữ trên màu chính' },
];

export const THEME_COLOR_PRESETS: ThemeColorPreset[] = [
  {
    id: 'rose',
    name: 'Hồng rose',
    colors: {
      accent: '#E91E63',
      accentSoft: '#F8BBD0',
      ink: '#880E4F',
      muted: '#C2185B',
      bg: '#FCE4EC',
      bgSoft: '#F8BBD0',
      onAccent: '#FFFFFF',
    },
  },
  {
    id: 'blush',
    name: 'Blush',
    colors: {
      accent: '#ef4065',
      accentSoft: '#ffb3c3',
      ink: '#a82046',
      muted: '#c9244d',
      bg: '#fff5f7',
      bgSoft: '#fff0f4',
      onAccent: '#FFFFFF',
    },
  },
  {
    id: 'mocha',
    name: 'Mocha',
    colors: {
      accent: '#8b5e45',
      accentSoft: '#d8c3b1',
      ink: '#1f1c19',
      muted: '#6f655c',
      bg: '#f5f1ea',
      bgSoft: '#ebe4d8',
      onAccent: '#f9f6f1',
    },
  },
  {
    id: 'amber',
    name: 'Amber',
    colors: {
      accent: '#FFC107',
      accentSoft: '#FFECB3',
      ink: '#FF6F00',
      muted: '#FFA000',
      bg: '#FFF8E1',
      bgSoft: '#FFECB3',
      onAccent: '#3E2723',
    },
  },
  {
    id: 'sage',
    name: 'Xanh sage',
    colors: {
      accent: '#4CAF50',
      accentSoft: '#C8E6C9',
      ink: '#1B5E20',
      muted: '#388E3C',
      bg: '#E8F5E9',
      bgSoft: '#C8E6C9',
      onAccent: '#FFFFFF',
    },
  },
  {
    id: 'teal',
    name: 'Teal',
    colors: {
      accent: '#009688',
      accentSoft: '#B2DFDB',
      ink: '#004D40',
      muted: '#00796B',
      bg: '#E0F2F1',
      bgSoft: '#B2DFDB',
      onAccent: '#FFFFFF',
    },
  },
  {
    id: 'blue',
    name: 'Xanh dương',
    colors: {
      accent: '#2196F3',
      accentSoft: '#BBDEFB',
      ink: '#0D47A1',
      muted: '#1976D2',
      bg: '#E3F2FD',
      bgSoft: '#BBDEFB',
      onAccent: '#FFFFFF',
    },
  },
  {
    id: 'indigo',
    name: 'Indigo',
    colors: {
      accent: '#3F51B5',
      accentSoft: '#C5CAE9',
      ink: '#1A237E',
      muted: '#303F9F',
      bg: '#E8EAF6',
      bgSoft: '#C5CAE9',
      onAccent: '#FFFFFF',
    },
  },
  {
    id: 'purple',
    name: 'Tím',
    colors: {
      accent: '#9C27B0',
      accentSoft: '#E1BEE7',
      ink: '#4A148C',
      muted: '#7B1FA2',
      bg: '#F3E5F5',
      bgSoft: '#E1BEE7',
      onAccent: '#FFFFFF',
    },
  },
  {
    id: 'brown',
    name: 'Nâu',
    colors: {
      accent: '#795548',
      accentSoft: '#D7CCC8',
      ink: '#3E2723',
      muted: '#5D4037',
      bg: '#EFEBE9',
      bgSoft: '#D7CCC8',
      onAccent: '#FFFFFF',
    },
  },
];

export function matchThemePresetId(theme: Record<string, unknown>): string | null {
  const accent = String(theme.accent || '').toLowerCase();
  if (!accent) return null;
  return THEME_COLOR_PRESETS.find((p) => p.colors.accent.toLowerCase() === accent)?.id ?? null;
}
