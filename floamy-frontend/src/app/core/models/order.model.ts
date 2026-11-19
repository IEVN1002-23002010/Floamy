export interface OrderItem {
  id: string;
  dbId?: number;
  customer: string;
  canal?: string;
  time: string;
  isoDate?: string;
  isoMonth?: string;
  dayLabel?: string;
  monthLabel?: string;
  total: number;
  stage: number;
  items: string[];
  payment: string;
  folio: string;
}