// src/config/users.ts

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

export const MODULE_USERS: ModuleUser[] = [
  // SUPER ADMIN
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    fullName: 'Rajesh Sharma',
    role: 'super_admin',
    module: 'admin',
    department: 'IT Administration',
    email: 'admin@erp.com',
    color: '#8b5cf6',
    icon: '👑',
    description: 'Full system access, user management, audit logs',
    permissions: ['all']
  },
  
  // PLANT MANAGER
  {
    id: '2',
    username: 'manager',
    password: 'manager123',
    fullName: 'Amit Patel',
    role: 'plant_manager',
    module: 'all',
    department: 'Plant Management',
    email: 'manager@erp.com',
    color: '#3b82f6',
    icon: '🏭',
    description: 'Complete plant operations, all modules access',
    permissions: ['sales', 'purchase', 'inventory', 'production', 'quality', 'hrms', 'finance', 'reports']
  },
  
  // SALES MODULE USERS
  {
    id: '3',
    username: 'salesmanager',
    password: 'sales123',
    fullName: 'Priya Mehta',
    role: 'sales_manager',
    module: 'sales',
    department: 'Sales',
    email: 'salesmanager@erp.com',
    color: '#10b981',
    icon: '💰',
    description: 'Sales team management, order approval, reports',
    permissions: ['sales', 'reports']
  },
  {
    id: '4',
    username: 'salesexec',
    password: 'sales123',
    fullName: 'Rahul Gupta',
    role: 'sales_executive',
    module: 'sales',
    department: 'Sales',
    email: 'salesexec@erp.com',
    color: '#10b981',
    icon: '📝',
    description: 'Create leads, quotations, sales orders',
    permissions: ['sales']
  },
  
  // PURCHASE MODULE USERS
  {
    id: '5',
    username: 'purchasemanager',
    password: 'purchase123',
    fullName: 'Vikram Singh',
    role: 'purchase_manager',
    module: 'purchase',
    department: 'Purchase',
    email: 'purchasemanager@erp.com',
    color: '#f59e0b',
    icon: '🛒',
    description: 'Vendor management, PO approval, procurement',
    permissions: ['purchase', 'inventory']
  },
  {
    id: '6',
    username: 'purchaseexec',
    password: 'purchase123',
    fullName: 'Anjali Desai',
    role: 'purchase_executive',
    module: 'purchase',
    department: 'Purchase',
    email: 'purchaseexec@erp.com',
    color: '#f59e0b',
    icon: '📋',
    description: 'Create purchase orders, vendor communication',
    permissions: ['purchase']
  },
  
  // INVENTORY MODULE USERS
  {
    id: '7',
    username: 'inventorymanager',
    password: 'inventory123',
    fullName: 'Suresh Kumar',
    role: 'inventory_manager',
    module: 'inventory',
    department: 'Inventory',
    email: 'inventorymanager@erp.com',
    color: '#ef4444',
    icon: '📦',
    description: 'Stock management, warehouse operations',
    permissions: ['inventory', 'purchase']
  },
  {
    id: '8',
    username: 'warehouse',
    password: 'inventory123',
    fullName: 'Manoj Verma',
    role: 'warehouse_staff',
    module: 'inventory',
    department: 'Warehouse',
    email: 'warehouse@erp.com',
    color: '#ef4444',
    icon: '🏚️',
    description: 'Receive goods, issue materials, stock movements',
    permissions: ['inventory']
  },
  
  // PRODUCTION MODULE USERS
  {
    id: '9',
    username: 'productionmanager',
    password: 'production123',
    fullName: 'Deepak Joshi',
    role: 'production_manager',
    module: 'production',
    department: 'Production',
    email: 'productionmanager@erp.com',
    color: '#8b5cf6',
    icon: '🏭',
    description: 'Production planning, work orders, BOM management',
    permissions: ['production', 'inventory', 'quality']
  },
  {
    id: '10',
    username: 'supervisor',
    password: 'production123',
    fullName: 'Kiran Patil',
    role: 'production_supervisor',
    module: 'production',
    department: 'Production',
    email: 'supervisor@erp.com',
    color: '#8b5cf6',
    icon: '👔',
    description: 'Shop floor supervision, operator management',
    permissions: ['production', 'operator', 'quality']
  },
  {
    id: '11',
    username: 'operator',
    password: 'operator123',
    fullName: 'Ramesh Kumar',
    role: 'operator',
    module: 'operator',
    department: 'Production',
    email: 'operator@erp.com',
    color: '#14b8a6',
    icon: '👷',
    description: 'Record production, report downtime, defects',
    permissions: ['operator']
  },
  
  // PLANNER MODULE
  {
    id: '12',
    username: 'planner',
    password: 'planner123',
    fullName: 'Neha Sharma',
    role: 'production_planner',
    module: 'planner',
    department: 'Planning',
    email: 'planner@erp.com',
    color: '#ec489a',
    icon: '📅',
    description: 'Capacity planning, MRP, production scheduling',
    permissions: ['planner', 'production', 'inventory']
  },
  
  // QUALITY MODULE USERS
  {
    id: '13',
    username: 'qualitymanager',
    password: 'quality123',
    fullName: 'Sanjay Mehta',
    role: 'quality_manager',
    module: 'quality',
    department: 'Quality Assurance',
    email: 'qualitymanager@erp.com',
    color: '#06b6d4',
    icon: '✅',
    description: 'Quality standards, NCR, CAPA management',
    permissions: ['quality', 'production', 'reports']
  },
  {
    id: '14',
    username: 'inspector',
    password: 'quality123',
    fullName: 'Pooja Singh',
    role: 'quality_inspector',
    module: 'quality',
    department: 'Quality Assurance',
    email: 'inspector@erp.com',
    color: '#06b6d4',
    icon: '🔍',
    description: 'Incoming, in-process, final inspection',
    permissions: ['quality']
  },
  
  // HRMS MODULE USERS
  {
    id: '15',
    username: 'hrmanager',
    password: 'hr123',
    fullName: 'Kavita Reddy',
    role: 'hr_manager',
    module: 'hrms',
    department: 'Human Resources',
    email: 'hrmanager@erp.com',
    color: '#84cc16',
    icon: '👥',
    description: 'Employee management, attendance, leave policies',
    permissions: ['hrms', 'finance']
  },
  {
    id: '16',
    username: 'hrexec',
    password: 'hr123',
    fullName: 'Vijay Nair',
    role: 'hr_executive',
    module: 'hrms',
    department: 'Human Resources',
    email: 'hrexec@erp.com',
    color: '#84cc16',
    icon: '📋',
    description: 'Employee records, attendance tracking',
    permissions: ['hrms']
  },
  
  // FINANCE MODULE USERS
  {
    id: '17',
    username: 'financemanager',
    password: 'finance123',
    fullName: 'Arun Gupta',
    role: 'finance_manager',
    module: 'finance',
    department: 'Finance',
    email: 'financemanager@erp.com',
    color: '#a855f7',
    icon: '💵',
    description: 'Financial reports, budgeting, approvals',
    permissions: ['finance', 'reports', 'hrms']
  },
  {
    id: '18',
    username: 'accountant',
    password: 'finance123',
    fullName: 'Seema Joshi',
    role: 'accountant',
    module: 'finance',
    department: 'Finance',
    email: 'accountant@erp.com',
    color: '#a855f7',
    icon: '💰',
    description: 'Payroll processing, invoicing, payments',
    permissions: ['finance']
  },
  
  // REPORTS MODULE
  {
    id: '19',
    username: 'reports',
    password: 'reports123',
    fullName: 'Rajiv Malhotra',
    role: 'reports_viewer',
    module: 'reports',
    department: 'Management',
    email: 'reports@erp.com',
    color: '#3b82f6',
    icon: '📊',
    description: 'View all reports, dashboards, analytics',
    permissions: ['reports']
  }
];

export function validateUser(username: string, password: string): ModuleUser | null {
  const user = MODULE_USERS.find(
    u => u.username === username && u.password === password
  );
  return user || null;
}

export function getUserByRole(role: string): ModuleUser | undefined {
  return MODULE_USERS.find(u => u.role === role);
}

export function getUsersByModule(module: string): ModuleUser[] {
  return MODULE_USERS.filter(u => u.module === module || u.module === 'all');
}