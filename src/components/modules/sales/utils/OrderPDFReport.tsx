import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { 
    padding: 30, 
    backgroundColor: '#f4f7f6', // Matches your app's min-h-screen background
    fontFamily: 'Helvetica' 
  },
  // Main Rounded Container (matches your .bg-white.rounded-[2.5rem])
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 25,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  // Header section
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b', // Slate 800
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 10,
    color: '#64748b', // Slate 500
    marginTop: 2,
  },
  
  // Status Badges (Matching your getStatusStyle function)
  badge: {
    padding: '4 10',
    borderRadius: 8,
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
    borderWidth: 1,
  },
  // Dynamic badge styles logic will be applied in the component

  // Info Section
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  infoGroup: { width: '30%' },
  label: { 
    fontSize: 8, 
    color: '#64748b', 
    textTransform: 'uppercase', 
    letterSpacing: 1,
    marginBottom: 4,
    fontWeight: 'bold' 
  },
  value: { fontSize: 11, color: '#0f172a', lineHeight: 1.4 },

  // Table Styling (Matching your <table> structure)
  table: {
    marginTop: 10,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc', // Matches bg-slate-50/50
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  tableHeaderText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1e293b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    alignItems: 'center',
  },
  tableCell: { fontSize: 10, color: '#334155' },

  // Footer / Totals (Matches your Footer Pagination style)
  summaryContainer: {
    marginTop: 20,
    backgroundColor: '#f8fafc', // bg-slate-50/50
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e293b',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F59E0B', // Your Amber theme color
  },

  signature: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
  }
});

export const OrderPDFReport = ({ order }: { order: any }) => {
  // Helper to match your exact app status colors
  const getBadgeStyle = (status: string) => {
    switch (status) {
      case "Pending":
        return { backgroundColor: '#fffbeb', color: '#d97706', borderColor: '#fef3c7' };
      case "Processing":
        return { backgroundColor: '#eff6ff', color: '#2563eb', borderColor: '#dbeafe' };
      case "Delivered":
        return { backgroundColor: '#ecfdf5', color: '#059669', borderColor: '#d1fae5' };
      case "Cancelled":
        return { backgroundColor: '#fff1f2', color: '#e11d48', borderColor: '#ffe4e6' };
      default:
        return { backgroundColor: '#f8fafc', color: '#64748b', borderColor: '#f1f5f9' };
    }
  };

  const badgeTheme = getBadgeStyle(order.status);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          {/* HEADER */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Order Report</Text>
              <Text style={styles.subtitle}>Reference: {order.order_id}</Text>
            </View>
            <View style={[styles.badge, badgeTheme]}>
              <Text>{order.status}</Text>
            </View>
          </View>

          {/* INFO GRID */}
          <View style={styles.infoSection}>
            <View style={styles.infoGroup}>
              <Text style={styles.label}>Customer</Text>
              <Text style={[styles.value, { fontWeight: 'bold' }]}>{order.customer_name}</Text>
              <Text style={styles.value}>{order.email}</Text>
              <Text style={styles.value}>{order.phone}</Text>
            </View>
            <View style={styles.infoGroup}>
              <Text style={styles.label}>Shipping Address</Text>
              <Text style={styles.value}>{order.shipping_address || "N/A"}</Text>
            </View>
            <View style={styles.infoGroup}>
              <Text style={styles.label}>Sales Representative</Text>
              <Text style={styles.value}>{order.sales_rep_name}</Text>
              <Text style={[styles.label, { marginTop: 8 }]}>Order Date</Text>
              <Text style={styles.value}>
                {order.order_date ? new Date(order.order_date).toLocaleDateString('en-GB') : '-'}
              </Text>
            </View>
          </View>

          {/* TABLE */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { width: '50%' }]}>Product</Text>
              <Text style={[styles.tableHeaderText, { width: '10%', textAlign: 'center' }]}>Qty</Text>
              <Text style={[styles.tableHeaderText, { width: '20%', textAlign: 'right' }]}>Unit Price</Text>
              <Text style={[styles.tableHeaderText, { width: '20%', textAlign: 'right' }]}>Total</Text>
            </View>

            {order.items?.map((item: any, i: number) => (
              <View key={i} style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: '50%', fontWeight: 'bold' }]}>{item.product_name}</Text>
                <Text style={[styles.tableCell, { width: '10%', textAlign: 'center' }]}>{item.quantity}</Text>
                <Text style={[styles.tableCell, { width: '20%', textAlign: 'right' }]}>
                  ₹{Number(item.unit_price).toLocaleString('en-IN')}
                </Text>
                <Text style={[styles.tableCell, { width: '20%', textAlign: 'right', color: '#1e293b', fontWeight: 'bold' }]}>
                  ₹{Number(item.total_price).toLocaleString('en-IN')}
                </Text>
              </View>
            ))}
          </View>

          {/* TOTALS SUMMARY */}
          <View style={styles.summaryContainer}>
            <View>
              <Text style={styles.label}>Notes</Text>
              <Text style={[styles.value, { fontSize: 9, color: '#64748b', maxWidth: 250 }]}>
                {order.notes || "No additional notes for this order."}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>
                ₹{Number(order.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>
        </View>

        {/* FOOTER */}
        <Text style={styles.signature}>
          Generated on {new Date().toLocaleString()} • Professional Sales Fulfillment Report
        </Text>
      </Page>
    </Document>
  );
};