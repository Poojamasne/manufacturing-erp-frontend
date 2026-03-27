export interface AdminUser { id: string; name: string; email: string; role: string; }
export interface AuditLog { id: string; userId: string; action: string; timestamp: Date; }
