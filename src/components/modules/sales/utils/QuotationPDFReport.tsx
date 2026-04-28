import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { 
    padding: 30, 
    backgroundColor: '#f4f7f6', 
    fontFamily: 'Helvetica' 
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 25,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  titleGroup: { width: '60%' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b', letterSpacing: -0.5 },
  quoteId: { fontSize: 12, color: '#F59E0B', fontWeight: 'bold', marginTop: 4 },
  
  // Badge
  badge: {
    padding: '4 12',
    borderRadius: 8,
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    borderWidth: 1,
    textAlign: 'center',
  },

  // Info Grid
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 15,
  },
  col: { width: '30%' },
  label: { fontSize: 8, color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: 4 },
  value: { fontSize: 10, color: '#1e293b', lineHeight: 1.4 },
  valueBold: { fontSize: 10, color: '#0f172a', fontWeight: 'bold' },

  // Table
  table: { marginTop: 10, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#f1f5f9' },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    padding: 10,
  },
  tableHeaderText: { fontSize: 8, fontWeight: 'bold', color: '#FFFFFF', textTransform: 'uppercase' },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    padding: 10,
    backgroundColor: '#FFFFFF',
  },
  productName: { fontSize: 10, color: '#1e293b', fontWeight: 'bold' },
  productDesc: { fontSize: 8, color: '#64748b', marginTop: 2 },

  // Calculation Area
  summaryWrapper: { flexDirection: 'row', marginTop: 20, justifyContent: 'space-between' },
  termsBox: { width: '55%', paddingRight: 20 },
  calcBox: { width: '40%', backgroundColor: '#f8fafc', borderRadius: 15, padding: 15 },
  calcRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  grandTotalRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 10, 
    paddingTop: 10, 
    borderTopWidth: 1, 
    borderTopColor: '#e2e8f0' 
  },

  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#94a3b8',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
  }
});

export const QuotationPDFReport = ({ data }: { data: any }) => {
  const formatCurr = (val: any) => 
    `₹${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Rejected": return { bg: '#fff1f2', text: '#e11d48', border: '#ffe4e6' };
      case "Approved": return { bg: '#ecfdf5', text: '#059669', border: '#d1fae5' };
      default: return { bg: '#fffbeb', text: '#d97706', border: '#fef3c7' };
    }
  };

  const statusStyle = getStatusColor(data.status);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleGroup}>
              <Text style={styles.title}>Quotation</Text>
              <Text style={styles.quoteId}>{data.quote_id}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: statusStyle.bg, color: statusStyle.text, borderColor: statusStyle.border }]}>
              <Text>{data.status}</Text>
            </View>
          </View>

          {/* Customer & Quote Info */}
          <View style={styles.grid}>
            <View style={styles.col}>
              <Text style={styles.label}>Customer Details</Text>
              <Text style={styles.valueBold}>{data.company_name}</Text>
              <Text style={styles.value}>{data.contact_person}</Text>
              <Text style={styles.value}>{data.email}</Text>
              <Text style={styles.value}>{data.phone}</Text>
              <Text style={[styles.label, { marginTop: 8 }]}>GST Number</Text>
              <Text style={styles.value}>{data.gst_number}</Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>Billing Address</Text>
              <Text style={styles.value}>{data.billing_address}</Text>
              <Text style={[styles.label, { marginTop: 15 }]}>Terms</Text>
              <Text style={styles.value}>Payment: {data.payment_terms}</Text>
              <Text style={styles.value}>Delivery: {data.delivery_terms}</Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>Dates</Text>
              <Text style={styles.value}>Date: {data.quotation_date}</Text>
              <Text style={styles.value}>Valid Until: {data.valid_until}</Text>
              <Text style={[styles.label, { marginTop: 15 }]}>Sales Executive</Text>
              <Text style={styles.valueBold}>{data.created_by_name}</Text>
            </View>
          </View>

          {/* Product Table */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { width: '40%' }]}>Product & Description</Text>
              <Text style={[styles.tableHeaderText, { width: '10%', textAlign: 'center' }]}>Qty</Text>
              <Text style={[styles.tableHeaderText, { width: '15%', textAlign: 'right' }]}>Price</Text>
              <Text style={[styles.tableHeaderText, { width: '15%', textAlign: 'center' }]}>Tax %</Text>
              <Text style={[styles.tableHeaderText, { width: '20%', textAlign: 'right' }]}>Total</Text>
            </View>

            {data.products?.map((p: any, i: number) => (
              <View key={i} style={styles.tableRow}>
                <View style={{ width: '40%' }}>
                  <Text style={styles.productName}>{p.product_name}</Text>
                  <Text style={styles.productDesc}>{p.description}</Text>
                </View>
                <Text style={{ width: '10%', textAlign: 'center', fontSize: 10 }}>{p.quantity}</Text>
                <Text style={{ width: '15%', textAlign: 'right', fontSize: 10 }}>{Number(p.unit_price).toLocaleString()}</Text>
                <Text style={{ width: '15%', textAlign: 'center', fontSize: 10 }}>{p.tax}%</Text>
                <Text style={{ width: '20%', textAlign: 'right', fontSize: 10, fontWeight: 'bold' }}>{formatCurr(p.total_price)}</Text>
              </View>
            ))}
          </View>

          {/* Terms and Financials */}
          <View style={styles.summaryWrapper}>
            <View style={styles.termsBox}>
              <Text style={styles.label}>Terms & Conditions</Text>
              <Text style={{ fontSize: 8, color: '#475569', lineHeight: 1.5 }}>{data.terms_conditions}</Text>
              {data.notes && (
                <View style={{ marginTop: 10 }}>
                  <Text style={styles.label}>Note</Text>
                  <Text style={{ fontSize: 8, color: '#475569' }}>{data.notes}</Text>
                </View>
              )}
            </View>

            <View style={styles.calcBox}>
              <View style={styles.calcRow}>
                <Text style={{ fontSize: 9, color: '#64748b' }}>Subtotal</Text>
                <Text style={{ fontSize: 9, color: '#1e293b' }}>{formatCurr(data.subtotal)}</Text>
              </View>
              <View style={styles.calcRow}>
                <Text style={{ fontSize: 9, color: '#64748b' }}>Tax Total</Text>
                <Text style={{ fontSize: 9, color: '#1e293b' }}>{formatCurr(data.tax)}</Text>
              </View>
              <View style={styles.calcRow}>
                <Text style={{ fontSize: 9, color: '#64748b' }}>Discount</Text>
                <Text style={{ fontSize: 9, color: '#e11d48' }}>- {formatCurr(data.discount)}</Text>
              </View>
              <View style={styles.grandTotalRow}>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#1e293b' }}>Grand Total</Text>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#F59E0B' }}>{formatCurr(data.total)}</Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.footer}>
          This is a system generated Quotation valid until {data.valid_until}. 
          Currency: {data.currency} • Generated by: {data.created_by_name}
        </Text>
      </Page>
    </Document>
  );
};