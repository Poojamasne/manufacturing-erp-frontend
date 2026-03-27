// src/types/auth.ts

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  module: ModuleType;
  avatar?: string;
  department: string;
  permissions: string[];
}

export type UserRole = 
  | 'super_admin'
  | 'plant_manager'
  | 'sales_manager'
  | 'sales_executive'
  | 'purchase_manager'
  | 'purchase_executive'
  | 'inventory_manager'
  | 'warehouse_staff'
  | 'production_manager'
  | 'production_supervisor'
  | 'operator'
  | 'production_planner'
  | 'quality_manager'
  | 'quality_inspector'
  | 'hr_manager'
  | 'hr_executive'
  | 'finance_manager'
  | 'accountant'
  | 'reports_viewer';

export type ModuleType = 
  | 'admin'
  | 'sales'
  | 'purchase'
  | 'inventory'
  | 'production'
  | 'planner'
  | 'operator'
  | 'quality'
  | 'hrms'
  | 'finance'
  | 'reports'
  | 'all'
  | 'dashboard';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// Add ModuleUser export
export interface ModuleUser {
  id: string;
  username: string;
  password: string;
  fullName: string;
  role: string;
  module: string;
  department: string;
  email: string;
  avatar?: string;
  permissions: string[];
  color: string;
  icon: string;
  description: string;
}