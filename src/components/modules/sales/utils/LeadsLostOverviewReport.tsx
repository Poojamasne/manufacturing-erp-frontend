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
    borderBottomColor: '#e11d48', // Red for "Lost" theme
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
    backgroundColor: '#fff1f2',
    color: '#e11d48',
    borderColor: '#ffe4e6',
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
    backgroundColor: '#fff1f2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffe4e6',
  },
  totalLabel: { 
    fontSize: 9, 
    color: '#9f1239', 
    textAlign: 'right',
    textTransform: 'uppercase'
  },
  totalValue: { 
    fontSize: 16, 
    color: '#e11d48', 
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

export const LostLeadsPDFReport = ({ leads }: { leads: any[] }) => {
  // 1. Filter for "Lost" leads
  const lostLeads = leads.filter(lead => lead.status === "Lost");

  // 2. Format Currency Helper
  const formatINR = (amt: any) => 
    `₹${Number(amt).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  // 3. Calculation Helpers
  const calculateLeadTotal = (products: any[]) => {
    return products?.reduce((sum, p) => sum + Number(p.total_price || 0), 0) || 0;
  };

  const totalPotentialLost = lostLeads.reduce((sum, lead) => {
    return sum + calculateLeadTotal(lead.products);
  }, 0);

  return (
    <Document title="Lost Leads Overview Report">
      <Page size="A4" style={styles.page}>
        <View style={styles.mainCard}>
          
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>LOST LEADS OVERVIEW</Text>
              <Text style={styles.subtitle}>Churn Analysis & Potential Revenue Loss</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text>Total Lost: {lostLeads.length}</Text>
            </View>
          </View>

          {/* Quick Stats Summary Grid */}
          <View style={styles.infoGrid}>
            <View style={styles.infoCol}>
              <Text style={styles.label}>Report Category</Text>
              <Text style={styles.value}>Lost Opportunities</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.label}>Potential Revenue Lost</Text>
              <Text style={[styles.value, { color: '#e11d48' }]}>{formatINR(totalPotentialLost)}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.label}>Avg. Opportunity Value</Text>
              <Text style={styles.value}>
                {lostLeads.length > 0 ? formatINR(totalPotentialLost / lostLeads.length) : '₹0.00'}
              </Text>
            </View>
          </View>

          {/* Leads Table */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { width: '15%' }]}>ID</Text>
            <Text style={[styles.tableHeaderText, { width: '35%' }]}>Company / Source</Text>
            <Text style={[styles.tableHeaderText, { width: '25%' }]}>Sales Executive</Text>
            <Text style={[styles.tableHeaderText, { width: '25%', textAlign: 'right' }]}>Lost Value</Text>
          </View>

          {lostLeads.length > 0 ? (
            lostLeads.map((lead, i) => (
              <View key={i} style={styles.tableRow}>
                <View style={{ width: '15%' }}>
                  <Text style={styles.tableCell}>{lead.lead_id}</Text>
                  <Text style={{ fontSize: 6, color: '#94a3b8' }}>
                    {new Date(lead.created_at).toLocaleDateString('en-IN')}
                  </Text>
                </View>
                
                <View style={{ width: '35%' }}>
                  <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>{lead.company_name}</Text>
                  <Text style={{ fontSize: 7, color: '#64748b' }}>Source: {lead.lead_source || "N/A"}</Text>
                </View>

                <View style={{ width: '25%' }}>
                  <Text style={styles.tableCell}>{lead.assigned_to_name || "Unassigned"}</Text>
                  <Text style={{ fontSize: 7, color: '#64748b' }}>{lead.city || lead.state}</Text>
                </View>

                <Text style={[styles.tableCell, { width: '25%', textAlign: 'right', fontWeight: 'bold', color: '#475569' }]}>
                  {formatINR(calculateLeadTotal(lead.products))}
                </Text>
              </View>
            ))
          ) : (
            <View style={{ padding: 20, textAlign: 'center' }}>
              <Text style={{ fontSize: 10, color: '#94a3b8' }}>No "Lost" leads recorded in this dataset.</Text>
            </View>
          )}

          {/* Grand Summary */}
          <View style={styles.summaryContainer}>
            <View style={{ width: '50%', padding: 10 }}>
              <Text style={styles.label}>Analysis Summary</Text>
              <Text style={{ fontSize: 8, color: '#64748b', lineHeight: 1.5 }}>
                This report identifies leads that did not convert. Reviewing these deals can help identify gaps in the sales process, pricing issues, or competitor strengths. The "Lost Value" represents the total potential contract value at the time the lead was closed as lost.
              </Text>
            </View>

            <View style={styles.totalBox}>
              <Text style={styles.totalLabel}>Total Potential Revenue Lost</Text>
              <Text style={styles.totalValue}>{formatINR(totalPotentialLost)}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.footer}>
          Lost Leads Analysis • Confidential Internal Document • Generated on {new Date().toLocaleString('en-IN')}
        </Text>
      </Page>
    </Document>
  );
};