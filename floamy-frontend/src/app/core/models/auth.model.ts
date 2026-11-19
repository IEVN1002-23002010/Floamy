export type Role = 'Administrador' | 'Empleado' | 'Cocina' | 'Cliente';

export interface AuthUser {
  id: number;
  nombre: string;
  correo: string;
  rol: Role;
  token?: string;
}