import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Font,
} from "@react-pdf/renderer";

// Registering local font for Rupee symbol support 
// Note: Ensure the path matches your public folder structure
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 2,
        borderBottomColor: '#F59E0B',
        paddingBottom: 20,
        marginBottom: 30,
    },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
    quoteId: { fontSize: 10, color: '#64748b', marginTop: 4 },

    // Info Section
    infoSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
    },
    infoBox: { width: '30%' },
    label: {
        fontSize: 8,
        color: '#64748b',
        textTransform: 'uppercase',
        marginBottom: 4,
        fontWeight: 'bold'
    },
    value: { fontSize: 10, color: '#1e293b', marginBottom: 2 },
    valueBold: { fontSize: 11, fontWeight: 'bold', color: '#0f172a' },

    // Table
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#1e293b',
        padding: 10,
        borderRadius: 4,
    },
    tableHeaderText: { fontSize: 9, color: '#FFFFFF', fontWeight: 'bold' },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        padding: 12,
        alignItems: 'center',
    },

    // Totals/Terms
    footerSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 30,
    },
    termsBox: { width: '60%' },
    totalBox: {
        width: '35%',
        backgroundColor: '#fffbeb',
        padding: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#fef3c7'
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    grandTotal: {
        borderTopWidth: 1,
        borderTopColor: '#fde68a',
        paddingTop: 8,
        marginTop: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    footerText: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        fontSize: 8,
        color: '#94a3b8',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingTop: 10
    }
});

export const VendorQuotationPDF = ({ data }: { data: any }) => {
    const formatINR = (amt: any) => `₹${Number(amt).toLocaleString('en-IN')}`;

    return (
        <Document title={`Quotation-${data.quotation_id}`}>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>VENDOR QUOTATION</Text>
                        <Text style={styles.quoteId}>Document ID: {data.quotation_id}</Text>
                    </View>
                    <View style={{ textAlign: 'right' }}>
                        <Text style={styles.label}>Date Received</Text>
                        <Text style={styles.value}>{new Date(data.created_at).toLocaleDateString()}</Text>
                    </View>
                </View>

                {/* Vendor & Company Info */}
                <View style={styles.infoSection}>
                    <View style={styles.infoBox}>
                        <Text style={styles.label}>Vendor Details</Text>
                        <Text style={styles.valueBold}>{data.vendor_name}</Text>
                        <Text style={styles.value}>Commercial Bid Entry</Text>
                        <Text style={styles.value}>Ref RFQ: {data.rfq_ref}</Text>
                    </View>

                    <View style={styles.infoBox}>
                        <Text style={styles.label}>Logistic Terms</Text>
                        <Text style={styles.value}>Lead Time: {data.delivery_lead_time.toLocaleString()} Days</Text>
                        <Text style={styles.value}>Payment Terms: {data.payment_terms}</Text>
                    </View>

                    <View style={styles.infoBox}>
                        <Text style={styles.label}>Validity</Text>
                        <Text style={styles.value}>Valid Until: {new Date(data.validity_date).toLocaleDateString()}</Text>
                        <Text style={styles.value}>Status: {data.status}</Text>
                    </View>
                </View>

                {/* Material Table */}
                <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderText, { width: '50%' }]}>Material Description</Text>
                    <Text style={[styles.tableHeaderText, { width: '25%', textAlign: 'right' }]}>Unit Price</Text>
                    <Text style={[styles.tableHeaderText, { width: '25%', textAlign: 'right' }]}>Quantity</Text>
                    <Text style={[styles.tableHeaderText, { width: '25%', textAlign: 'right' }]}>Total Amount</Text>
                </View>

                <View style={styles.tableRow}>
                    <View style={{ width: '50%' }}>
                        <Text style={{ fontSize: 11, fontWeight: 'bold' }}>{data.material_name}</Text>
                        <Text style={{ fontSize: 8, color: '#64748b', marginTop: 2 }}>Procurement against RFQ Reference {data.rfq_ref}</Text>
                    </View>
                    <Text style={{ width: '25%', textAlign: 'right', fontSize: 10 }}>{formatINR(data.unit_price)}</Text>
                    {/* <Text style={{ width: '25%', textAlign: 'right', fontSize: 10 }}>{data?.quantity}{data?.unit}</Text> */}

                    <View
                        style={{
                            width: '25%',
                            flexDirection: 'row',
                            justifyContent: 'flex-end',
                            alignItems: 'flex-end',
                        }}
                    >
                        <Text style={{ fontSize: 10 }}>{data?.quantity}</Text>

                        <Text style={{ fontSize: 7, color: '#64748b', marginLeft: 2 }}>
                            {data?.unit}
                        </Text>
                    </View>
                    <Text style={{ width: '25%', textAlign: 'right', fontSize: 10, fontWeight: 'bold' }}>{formatINR(data.total_amount)}</Text>
                </View>

                {/* Summary */}
                <View style={styles.footerSection}>
                    <View style={styles.termsBox}>
                        <Text style={styles.label}>General Terms</Text>
                        <Text style={{ fontSize: 8, color: '#475569', lineHeight: 1.5 }}>
                            1. This quotation is subject to the terms mentioned in the linked RFQ.{"\n"}
                            2. Prices are inclusive of standard packaging unless specified.{"\n"}
                            3. Delivery schedules are subject to immediate order confirmation.
                        </Text>
                    </View>

                    <View style={styles.totalBox}>
                        <View style={styles.totalRow}>
                            <Text style={{ fontSize: 9, color: '#92400e' }}>Subtotal</Text>
                            <Text style={{ fontSize: 9, fontWeight: 'bold' }}>{formatINR(data.total_amount)}</Text>
                        </View>
                        <View style={styles.totalRow}>
                            <Text style={{ fontSize: 9, color: '#92400e' }}>Tax (Estimated)</Text>
                            <Text style={{ fontSize: 9, fontWeight: 'bold' }}>₹0.00</Text>
                        </View>
                        <View style={styles.grandTotal}>
                            <Text style={{ fontSize: 11, fontWeight: 'bold' }}>Net Amount</Text>
                            <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#F59E0B' }}>{formatINR(data.total_amount)}</Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.footerText}>
                    This is a formal system-generated Quotation Record. Page 1 of 1
                </Text>
            </Page>
        </Document>
    );
};