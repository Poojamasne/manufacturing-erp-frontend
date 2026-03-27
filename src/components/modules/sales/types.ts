export interface SalesOrder { id: string; customerId: string; total: number; status: string; }
export interface Lead { id: string; name: string; company: string; status: string; }
export interface Quotation { id: string; customerId: string; total: number; validTill: Date; }
