export interface IngredientItem {
  id?: number;
  name: string;
  current: number;
  minimum: number;
  unit: string;
}

export interface MovementItem {
  id?: number;
  date: string;
  type: 'Entrada' | 'Producción' | 'Merma';
  ingredient: string;
  amount: string;
  responsible: string;
}