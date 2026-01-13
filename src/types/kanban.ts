export type ColumnId = string;

// Now supports any hex color string
export type ColumnColor = string;

export interface Task {
  id: string;
  title: string;
  description?: string;
  columnId: ColumnId;
  createdAt: Date;
  priority?: 'low' | 'medium' | 'high';
}

export interface Column {
  id: ColumnId;
  title: string;
  color: ColumnColor;
}

// Preset colors for quick selection
export const PRESET_COLORS: { label: string; hex: string }[] = [
  { label: 'Yellow', hex: '#EAB308' },
  { label: 'Blue', hex: '#3B82F6' },
  { label: 'Green', hex: '#22C55E' },
  { label: 'Red', hex: '#EF4444' },
  { label: 'Purple', hex: '#A855F7' },
  { label: 'Orange', hex: '#F97316' },
  { label: 'Pink', hex: '#EC4899' },
  { label: 'Cyan', hex: '#06B6D4' },
];
