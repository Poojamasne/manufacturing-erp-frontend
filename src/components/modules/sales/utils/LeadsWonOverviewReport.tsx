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
    borderBottomColor: '#10b981', // Green for "Won" theme
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
    backgroundColor: '#ecfdf5',
    color: '#059669',
    borderColor: '#d1fae5',
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
    width: '40%',
    padding: 12,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  totalLabel: { 
    fontSize: 9, 
    color: '#166534', 
    textAlign: 'right',
    textTransform: 'uppercase'
  },
  totalValue: { 
    fontSize: 16, 
    color: '#10b981', 
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

export const WonLeadsPDFReport = ({ leads }: { leads: any[] }) => {
  // 1. Filter for "Won" leads
  const wonLeads = leads.filter(lead => lead.status === "Won");

  // 2. Format Currency Helper
  const formatINR = (amt: any) => 
    `₹${Number(amt).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  // 3. Calculation Helpers
  const calculateLeadTotal = (products: any[]) => {
    return products?.reduce((sum, p) => sum + Number(p.total_price || 0), 0) || 0;
  };

  const totalRevenue = wonLeads.reduce((sum, lead) => {
    return sum + calculateLeadTotal(lead.products);
  }, 0);

  return (
    <Document title="Won Leads Overview Report">
      <Page size="A4" style={styles.page}>
        <View style={styles.mainCard}>
          
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>WON LEADS OVERVIEW</Text>
              <Text style={styles.subtitle}>Sales Performance & Conversion Report</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text>Total Won: {wonLeads.length}</Text>
            </View>
          </View>

          {/* Quick Stats Summary Grid */}
          <View style={styles.infoGrid}>
            <View style={styles.infoCol}>
              <Text style={styles.label}>Report Type</Text>
              <Text style={styles.value}>Won Leads Filtered</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.label}>Total Closed Value</Text>
              <Text style={[styles.value, { color: '#059669' }]}>{formatINR(totalRevenue)}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.label}>Avg. Deal Size</Text>
              <Text style={styles.value}>
                {wonLeads.length > 0 ? formatINR(totalRevenue / wonLeads.length) : '₹0.00'}
              </Text>
            </View>
          </View>

          {/* Leads Table */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { width: '15%' }]}>ID</Text>
            <Text style={[styles.tableHeaderText, { width: '35%' }]}>Company / Contact</Text>
            <Text style={[styles.tableHeaderText, { width: '25%' }]}>Executive</Text>
            <Text style={[styles.tableHeaderText, { width: '25%', textAlign: 'right' }]}>Deal Value</Text>
          </View>

          {wonLeads.length > 0 ? (
            wonLeads.map((lead, i) => (
              <View key={i} style={styles.tableRow}>
                <View style={{ width: '15%' }}>
                  <Text style={styles.tableCell}>{lead.lead_id}</Text>
                  <Text style={{ fontSize: 6, color: '#94a3b8' }}>
                    {new Date(lead.created_at).toLocaleDateString('en-IN')}
                  </Text>
                </View>
                
                <View style={{ width: '35%' }}>
                  <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>{lead.company_name}</Text>
                  <Text style={{ fontSize: 7, color: '#64748b' }}>{lead.contact_person}</Text>
                </View>

                <View style={{ width: '25%' }}>
                  <Text style={styles.tableCell}>{lead.assigned_to_name || "Unassigned"}</Text>
                  <Text style={{ fontSize: 7, color: '#64748b' }}>{lead.city}</Text>
                </View>

                <Text style={[styles.tableCell, { width: '25%', textAlign: 'right', fontWeight: 'bold' }]}>
                  {formatINR(calculateLeadTotal(lead.products))}
                </Text>
              </View>
            ))
          ) : (
            <View style={{ padding: 20, textAlign: 'center' }}>
              <Text style={{ fontSize: 10, color: '#94a3b8' }}>No "Won" leads found in the current selection.</Text>
            </View>
          )}

          {/* Grand Summary */}
          <View style={styles.summaryContainer}>
            <View style={{ width: '55%', padding: 10 }}>
              <Text style={styles.label}>Report Description</Text>
              <Text style={{ fontSize: 8, color: '#64748b', lineHeight: 1.5 }}>
                This report summarizes all successful conversions. It includes total deal value calculated from individual product quantities and unit prices associated with each won lead.
              </Text>
            </View>

            <View style={styles.totalBox}>
              <Text style={styles.totalLabel}>Total Revenue</Text>
              <Text style={styles.totalValue}>{formatINR(totalRevenue)}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.footer}>
          Won Leads Summary • Confidential Sales Document • Generated on {new Date().toLocaleString('en-IN')}
        </Text>
      </Page>
    </Document>
  );
};