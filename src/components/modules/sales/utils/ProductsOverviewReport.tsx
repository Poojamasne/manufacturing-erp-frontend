import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import NotoSans from '/fonts/NotoSans-Regular.ttf';

// Registering local font
Font.register({
  family: 'NotoSans',
  src: NotoSans,
});

const styles = StyleSheet.create({
  page: { 
    padding: 30, 
    backgroundColor: '#f8fafc', 
    fontFamily: "NotoSans" 
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 25,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#F59E0B', // Amber for Product theme
    paddingBottom: 15,
  },
  title: { 
    fontSize: 20, 
    color: '#1e293b', 
    letterSpacing: -0.5,
    fontWeight: 'bold'
  },
  subtitle: { 
    fontSize: 10, 
    color: '#64748b', 
    marginTop: 2 
  },
  statusBadge: {
    padding: '5 12',
    borderRadius: 8,
    fontSize: 8,
    textTransform: 'uppercase',
    borderWidth: 1,
    backgroundColor: '#fffbeb',
    color: '#b45309',
    borderColor: '#fef3c7',
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  infoCol: { width: '30%' },
  label: { 
    fontSize: 7, 
    color: '#64748b', 
    textTransform: 'uppercase', 
    marginBottom: 5,
  },
  value: { 
    fontSize: 10, 
    color: '#1e293b', 
    lineHeight: 1.4,
    fontWeight: 'bold'
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
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
    fontSize: 8, 
    color: '#334155' 
  },
  summaryContainer: {
    marginTop: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  totalBox: {
    width: '45%',
    padding: 12,
    backgroundColor: '#fffbeb',
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
    fontSize: 16, 
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

export const ProductPDFReport = ({ products }: { products: any[] }) => {
  // Format Currency Helper
  const formatINR = (amt: any) => 
    `₹${Number(amt).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  // Calculation Helpers
  const calculateTotals = () => {
    let totalQty = 0;
    let totalPotentialValue = 0;
    let totalWonRevenue = 0;

    products.forEach(p => {
      p.variants?.forEach((v: any) => {
        totalQty += Number(v.quantity || 0);
        totalPotentialValue += Number(v.total_price || 0);
        if (v.status === "Won") {
          totalWonRevenue += Number(v.total_price || 0);
        }
      });
    });

    return { totalQty, totalPotentialValue, totalWonRevenue };
  };

  const stats = calculateTotals();

  return (
    <Document title="Product Performance Report">
      <Page size="A4" style={styles.page}>
        <View style={styles.mainCard}>
          
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>PRODUCT PERFORMANCE</Text>
              <Text style={styles.subtitle}>Inventory Valuation & Sales Conversion</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text>Catalog Size: {products.length}</Text>
            </View>
          </View>

          {/* KPI Summary Grid */}
          <View style={styles.infoGrid}>
            <View style={styles.infoCol}>
              <Text style={styles.label}>Total Units In Pipeline</Text>
              <Text style={styles.value}>{stats.totalQty} Units</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.label}>Actual Revenue (Won)</Text>
              <Text style={[styles.value, { color: '#10b981' }]}>{formatINR(stats.totalWonRevenue)}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.label}>Potential Valuation</Text>
              <Text style={styles.value}>{formatINR(stats.totalPotentialValue)}</Text>
            </View>
          </View>

          {/* Product Table */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { width: '40%' }]}>Product & Category</Text>
            <Text style={[styles.tableHeaderText, { width: '15%', textAlign: 'center' }]}>Variants</Text>
            <Text style={[styles.tableHeaderText, { width: '15%', textAlign: 'center' }]}>Total Qty</Text>
            <Text style={[styles.tableHeaderText, { width: '30%', textAlign: 'right' }]}>Pipeline Value</Text>
          </View>

          {products.map((product, i) => {
            const productQty = product.variants?.reduce((sum: number, v: any) => sum + Number(v.quantity), 0);
            const productVal = product.variants?.reduce((sum: number, v: any) => sum + Number(v.total_price), 0);
            
            return (
              <View key={i} style={styles.tableRow}>
                <View style={{ width: '40%' }}>
                  <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>{product.product_name}</Text>
                  <Text style={{ fontSize: 7, color: '#64748b' }}>{product.category}</Text>
                </View>
                
                <Text style={[styles.tableCell, { width: '15%', textAlign: 'center' }]}>
                  {product.variants?.length || 0}
                </Text>

                <Text style={[styles.tableCell, { width: '15%', textAlign: 'center' }]}>
                  {productQty}
                </Text>

                <View style={{ width: '30%', textAlign: 'right' }}>
                  <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>
                    {formatINR(productVal)}
                  </Text>
                  <Text style={{ fontSize: 6, color: '#94a3b8' }}>
                    Base: {formatINR(product.base_price)}
                  </Text>
                </View>
              </View>
            );
          })}

          {/* Summary Section */}
          <View style={styles.summaryContainer}>
            <View style={{ width: '50%', padding: 10 }}>
              <Text style={styles.label}>Report Methodology</Text>
              <Text style={{ fontSize: 8, color: '#64748b', lineHeight: 1.5 }}>
                Pipeline value represents the total sum of all quoted variants across all leads (New, Won, Lost, etc.). Actual Revenue is strictly calculated from leads marked as 'Won'. This report assists in identifying high-demand product categories.
              </Text>
            </View>

            <View style={styles.totalBox}>
              <Text style={styles.totalLabel}>Total Potential Valuation</Text>
              <Text style={styles.totalValue}>{formatINR(stats.totalPotentialValue)}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.footer}>
          Product Inventory Analysis • Generated on {new Date().toLocaleString('en-IN')}
        </Text>
      </Page>
    </Document>
  );
};