import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import NotoSans from '/fonts/NotoSans-Regular.ttf';

// Registering your working local font
Font.register({
  family: 'NotoSans',
  src: NotoSans,
});

const styles = StyleSheet.create({
  page: { 
    padding: 30, 
    backgroundColor: '#f8fafc', // Light slate background
    fontFamily: "NotoSans" 
  },
  // Main Container
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 25,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  // Header Section
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#F59E0B',
    paddingBottom: 15,
  },
  title: { 
    fontSize: 22, 
    color: '#1e293b', 
    letterSpacing: -0.5 
  },
  refNumber: { 
    fontSize: 10, 
    color: '#64748b', 
    marginTop: 2 
  },
  
  // Status Badge
  statusBadge: {
    padding: '5 12',
    borderRadius: 8,
    fontSize: 8,
    textTransform: 'uppercase',
    borderWidth: 1,
  },

  // Info Grid
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  infoCol: { width: '30%' },
  label: { 
    fontSize: 7, 
    color: '#64748b', 
    textTransform: 'uppercase', 
    marginBottom: 5,
    fontWeight: 'normal'
  },
  value: { 
    fontSize: 10, 
    color: '#1e293b', 
    lineHeight: 1.4 
  },

  // Table Styling
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e293b', // Dark slate header
    padding: 10,
    borderRadius: 6,
    marginBottom: 5,
  },
  tableHeaderText: { 
    fontSize: 8, 
    color: '#FFFFFF', 
    textTransform: 'uppercase' 
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    padding: 10,
    alignItems: 'center',
  },
  tableCell: { 
    fontSize: 9, 
    color: '#334155' 
  },

  // Summary Section
  summaryContainer: {
    marginTop: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  notesBox: {
    width: '55%',
    padding: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
  },
  totalBox: {
    width: '35%',
    padding: 12,
    backgroundColor: '#fffbeb', // Light amber tint
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  totalLabel: { 
    fontSize: 9, 
    color: '#92400e', 
    textAlign: 'right',
    textTransform: 'uppercase'
  },
  totalValue: { 
    fontSize: 18, 
    color: '#F59E0B', 
    textAlign: 'right', 
    marginTop: 5 
  },

  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  },
});

export const OrderPDFReport = ({ order }: { order: any }) => {
  // Helper for Currency
  const formatINR = (amt: any) => 
    `₹${Number(amt).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  // Helper for dynamic status theme
  const getBadgeTheme = (status: string) => {
    switch (status) {
      case "Pending": return { bg: '#fffbeb', text: '#d97706', border: '#fef3c7' };
      case "Processing": return { bg: '#eff6ff', text: '#2563eb', border: '#dbeafe' };
      case "Delivered": return { bg: '#ecfdf5', text: '#059669', border: '#d1fae5' };
      case "Cancelled": return { bg: '#fff1f2', text: '#e11d48', border: '#ffe4e6' };
      default: return { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' };
    }
  };

  const badge = getBadgeTheme(order.status);

  return (
    <Document title={`Order-${order.order_id}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.mainCard}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>ORDER REPORT</Text>
              <Text style={styles.refNumber}>Ref: {order.order_id}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: badge.bg, color: badge.text, borderColor: badge.border }]}>
              <Text>{order.status}</Text>
            </View>
          </View>

          {/* Info Grid */}
          <View style={styles.infoGrid}>
            <View style={styles.infoCol}>
              <Text style={styles.label}>Bill To</Text>
              <Text style={[styles.value, { fontWeight: 'bold' }]}>{order.customer_name}</Text>
              <Text style={styles.value}>{order.email}</Text>
              <Text style={styles.value}>{order.phone}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.label}>Shipping Address</Text>
              <Text style={styles.value}>{order.shipping_address || "N/A"}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.label}>Order Details</Text>
              <Text style={styles.value}>Executive: {order.sales_rep_name}</Text>
              <Text style={[styles.label, { marginTop: 8 }]}>Order Date</Text>
              <Text style={styles.value}>
                {order.order_date ? new Date(order.order_date).toLocaleDateString('en-IN') : '-'}
              </Text>
            </View>
          </View>

          {/* Product Table */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { width: '50%' }]}>Product Description</Text>
            <Text style={[styles.tableHeaderText, { width: '10%', textAlign: 'center' }]}>Qty</Text>
            <Text style={[styles.tableHeaderText, { width: '20%', textAlign: 'right' }]}>Unit Price</Text>
            <Text style={[styles.tableHeaderText, { width: '20%', textAlign: 'right' }]}>Total</Text>
          </View>

          {order.items?.map((item: any, i: number) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: '50%' }]}>{item.product_name}</Text>
              <Text style={[styles.tableCell, { width: '10%', textAlign: 'center' }]}>{item.quantity}</Text>
              <Text style={[styles.tableCell, { width: '20%', textAlign: 'right' }]}>{formatINR(item.unit_price)}</Text>
              <Text style={[styles.tableCell, { width: '20%', textAlign: 'right' }]}>{formatINR(item.total_price)}</Text>
            </View>
          ))}

          {/* Summary */}
          <View style={styles.summaryContainer}>
            <View style={styles.notesBox}>
              <Text style={styles.label}>Notes</Text>
              <Text style={{ fontSize: 8, color: '#64748b', lineHeight: 1.4 }}>
                {order.notes || "No additional instructions provided. This order is subject to standard terms and conditions."}
              </Text>
            </View>

            <View style={styles.totalBox}>
              <Text style={styles.totalLabel}>Grand Total</Text>
              <Text style={styles.totalValue}>{formatINR(order.total_amount)}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.footer}>
          This is a computer-generated document. No signature required. 
          Generated on {new Date().toLocaleString('en-IN')}
        </Text>
      </Page>
    </Document>
  );
};