export type Role = 'Administrador' | 'Empleado' | 'Cocina' | 'Cliente';

export interface UserItem {
  id?: number;
  nombre: string;
  correo: string;
  rol: Role;
  rol_id?: number;
  activo?: boolean | number;
  permisos?: Record<string, boolean>;
}