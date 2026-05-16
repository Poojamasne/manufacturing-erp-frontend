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
        padding: 40,
        backgroundColor: '#FFFFFF',
        fontFamily: "NotoSans"
    },
    // Top Brand Accent
    brandBar: {
        height: 4,
        backgroundColor: '#F59E0B',
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 30,
    },
    title: {
        fontSize: 24,
        fontWeight: 'extrabold',
        color: '#0f172a',
        letterSpacing: 1
    },
    poId: {
        fontSize: 12,
        color: '#F59E0B',
        fontWeight: 'bold',
        marginTop: 4
    },

    // Reference Grid
    infoSection: {
        flexDirection: 'row',
        marginBottom: 30,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        paddingBottom: 20,
    },
    infoBox: { flex: 1 },
    label: {
        fontSize: 8,
        color: '#64748b',
        textTransform: 'uppercase',
        marginBottom: 4,
        fontWeight: 'bold',
        letterSpacing: 0.5
    },
    value: { fontSize: 10, color: '#1e293b', marginBottom: 2 },
    valueBold: { fontSize: 10, fontWeight: 'bold', color: '#0f172a' },

    // Table Style
    table: {
        marginTop: 10,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#0f172a',
        padding: 8,
        borderRadius: 4,
    },
    tableHeaderText: {
        fontSize: 8,
        color: '#FFFFFF',
        fontWeight: 'bold',
        textTransform: 'uppercase'
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        paddingVertical: 12,
        paddingHorizontal: 8,
        alignItems: 'center',
    },

    // Financials
    summarySection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    termsArea: { width: '60%' },
    calculationArea: {
        width: '35%',
        backgroundColor: '#f8fafc',
        padding: 12,
        borderRadius: 8,
    },
    calcRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    grandTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 2,
        borderTopColor: '#F59E0B',
    },

    // Signature Area
    signatureSection: {
        marginTop: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    signatureBox: {
        width: '40%',
        borderTopWidth: 1,
        borderTopColor: '#cbd5e1',
        paddingTop: 8,
        textAlign: 'center'
    },

    footerText: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        fontSize: 7,
        color: '#94a3b8',
        textTransform: 'uppercase'
    }
});

export const PurchaseOrderPDF = ({ data }: { data: any }) => {
    const formatINR = (amt: any) => `₹${Number(amt).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    const subtotal = data.quantity * data.unit_price;

    return (
        <Document title={`PurchaseOrder-${data.po_id}`}>
            <Page size="A4" style={styles.page}>
                <View style={styles.brandBar} />

                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>PURCHASE ORDER</Text>
                        <Text style={styles.poId}>#{data.po_id}</Text>
                    </View>
                    <View style={{ textAlign: 'right' }}>
                        <Text style={styles.label}>Order Date</Text>
                        <Text style={styles.value}>{new Date(data.created_at).toLocaleDateString()}</Text>
                        <Text style={[styles.label, { marginTop: 8 }]}>Status</Text>
                        <Text style={[styles.valueBold, { color: '#059669' }]}>{data.status}</Text>
                    </View>
                </View>

                {/* Entities & References */}
                <View style={styles.infoSection}>
                    <View style={styles.infoBox}>
                        <Text style={styles.label}>Vendor / Supplier</Text>
                        <Text style={styles.valueBold}>{data.vendor_name}</Text>
                        <Text style={styles.value}>Authorized Distribution</Text>
                        <Text style={styles.value}>Subject to Contract Terms</Text>
                    </View>

                    <View style={styles.infoBox}>
                        <Text style={styles.label}>Shipping / Delivery To</Text>
                        <Text style={styles.valueBold}>Central Warehouse</Text>
                        <Text style={styles.value}>Production Unit 01</Text>
                        <Text style={styles.value}>Industrial Area, Phase II</Text>
                    </View>

                    <View style={styles.infoBox}>
                        <Text style={styles.label}>References</Text>
                        <Text style={styles.value}>RFQ Ref: {data.rfq_ref}</Text>
                        <Text style={styles.value}>PR Ref: {data.pr_ref}</Text>
                        <Text style={styles.value}>Delivery By: {data.delivery_date}</Text>
                    </View>
                </View>

                {/* Line Items Table */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableHeaderText, { width: '45%' }]}>Material Description</Text>
                        <Text style={[styles.tableHeaderText, { width: '15%', textAlign: 'center' }]}>Quantity</Text>
                        <Text style={[styles.tableHeaderText, { width: '20%', textAlign: 'right' }]}>Unit Rate</Text>
                        <Text style={[styles.tableHeaderText, { width: '20%', textAlign: 'right' }]}>Total</Text>
                    </View>

                    <View style={styles.tableRow}>
                        <View style={{ width: '45%' }}>
                            <Text style={{ fontSize: 10, fontWeight: 'bold' }}>{data.material_name}</Text>
                            <Text style={{ fontSize: 7, color: '#64748b', marginTop: 2 }}>Specifications as per RFQ {data.rfq_ref}</Text>
                        </View>
                        <Text style={{ width: '15%', textAlign: 'center', fontSize: 10 }}>{data.quantity}</Text>
                        <Text style={{ width: '20%', textAlign: 'right', fontSize: 10 }}>{formatINR(data.unit_price)}</Text>
                        <Text style={{ width: '20%', textAlign: 'right', fontSize: 10, fontWeight: 'bold' }}>{formatINR(subtotal)}</Text>
                    </View>
                </View>

                {/* Commercial Summary */}
                <View style={styles.summarySection}>
                    <View style={styles.termsArea}>
                        <Text style={styles.label}>Terms & Conditions</Text>
                        <Text style={{ fontSize: 7, color: '#475569', lineHeight: 1.6 }}>
                            1. Please acknowledge receipt of this PO within 24 hours.{"\n"}
                            2. Material must be accompanied by a Delivery Challan and Invoice.{"\n"}
                            3. Payment terms: {data.payment_terms || "As per master agreement"}.{"\n"}
                            4. Quality check (QC) will be performed at the time of receipt.
                        </Text>
                    </View>

                    <View style={styles.calculationArea}>
                        <View style={styles.calcRow}>
                            <Text style={{ fontSize: 8, color: '#64748b' }}>Subtotal</Text>
                            <Text style={{ fontSize: 8, fontWeight: 'bold' }}>{formatINR(subtotal)}</Text>
                        </View>
                        <View style={styles.calcRow}>
                            <Text style={{ fontSize: 8, color: '#64748b' }}>Tax ({data.tax_percentage}%)</Text>
                            <Text style={{ fontSize: 8, fontWeight: 'bold' }}>{formatINR(data.tax_amount)}</Text>
                        </View>
                        <View style={styles.grandTotalRow}>
                            <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#0f172a' }}>Grand Total</Text>
                            <Text style={{ fontSize: 12, fontWeight: 'black', color: '#F59E0B' }}>{formatINR(data.total_amount)}</Text>
                        </View>
                    </View>
                </View>

                {/* Signatures */}
                <View style={styles.signatureSection}>
                    <View style={styles.signatureBox}>
                        <Text style={{ fontSize: 8, color: '#64748b' }}>Prepared By</Text>
                        <Text style={{ fontSize: 9, fontWeight: 'bold', marginTop: 4 }}>Procurement Dept</Text>
                    </View>
                    <View style={styles.signatureBox}>
                        <Text style={{ fontSize: 8, color: '#64748b' }}>Authorized Signatory</Text>
                        <Text style={{ fontSize: 9, fontWeight: 'bold', marginTop: 4 }}>Purchase Manager</Text>
                    </View>
                </View>

                <Text style={styles.footerText}>
                    This is a computer-generated Purchase Order and does not require a physical stamp for digital transmission.
                </Text>
            </Page>
        </Document>
    );
};