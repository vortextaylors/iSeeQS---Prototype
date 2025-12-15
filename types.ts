export interface Project {
  id: string;
  title: string;
  description: string;
  date: string;
  componentCount: number;
}

export enum ComponentType {
  PAD_FOOTING = 'Pad Footing',
  STRIP_FOUNDATION = 'Strip Foundation',
  COLUMN_STUMP = 'Column Stump',
  GROUND_BEAM = 'Ground Beam',
  FLOOR_SLAB = 'Floor Slab',
  COLUMN = 'Column',
  FLOOR_BEAM = 'Floor Beam'
}

export interface QSComponent {
  id: string;
  type: ComponentType;
  label: string;
  status: 'Draft' | 'AR Ready';
  lastEdited: string;
}
