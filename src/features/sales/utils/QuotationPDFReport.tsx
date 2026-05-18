import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Font,
} from "@react-pdf/renderer";
import NotoSans from '/fonts/NotoSans-Regular.ttf';

// Registering local font for Rupee symbol support
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
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 25,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25,
        borderBottomWidth: 2,
        borderBottomColor: '#F59E0B',
        paddingBottom: 15,
    },
    title: { fontSize: 22, color: '#1e293b', letterSpacing: -0.5 },
    quoteId: { fontSize: 10, color: '#64748b', marginTop: 2 },

    // Status Badge
    badge: {
        padding: '5 12',
        borderRadius: 8,
        fontSize: 8,
        textTransform: 'uppercase',
        borderWidth: 1,
    },

    // Info Grid
    grid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 25,
    },
    col: { width: '30%' },
    label: {
        fontSize: 12,
        color: '#64748b',
        textTransform: 'uppercase',
        fontWeight: '900',
        marginBottom: 4
    },
    value: { fontSize: 10, color: '#1e293b', lineHeight: 1.4 },
    valueBold: { fontSize: 10, color: '#0f172a', fontWeight: 'bold' },

    // Table
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#1e293b', // Dark Slate
        padding: 10,
        borderRadius: 6,
        marginBottom: 5,
    },
    tableHeaderText: { fontSize: 8, color: '#FFFFFF', textTransform: 'uppercase' },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        padding: 10,
        alignItems: 'center',
    },
    productName: { fontSize: 9, color: '#1e293b', fontWeight: 'bold' },
    productDesc: { fontSize: 7, color: '#64748b', marginTop: 2 },

    // Summary Area
    summaryWrapper: {
        flexDirection: 'row',
        marginTop: 20,
        justifyContent: 'space-between',
        alignItems: 'flex-start'
    },
    termsBox: {
        width: '55%',
        padding: 12,
        backgroundColor: '#f1f5f9',
        borderRadius: 12
    },
    calcBox: {
        width: '38%',
        backgroundColor: '#fffbeb',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#fef3c7'
    },
    calcRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6
    },
    grandTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#fde68a'
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
        borderTopColor: '#e2e8f0',
        paddingTop: 10,
    }
});

export const QuotationPDFReport = ({ data }: { data: any }) => {
    const formatINR = (amt: any) =>
        `₹${Number(amt).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    return (
        <Document title={`Quotation-${data.quote_id}`}>
            <Page size="A4" style={styles.page}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.title}>QUOTATION</Text>
                            <Text style={styles.quoteId}>Ref: {data.quote_id}</Text>
                        </View>
                    </View>

                    {/* Info Grid */}
                    <View style={styles.grid}>
                        <View style={styles.col}>
                            <Text style={styles.label}>Customer Details</Text>
                            <Text style={styles.valueBold}>{data.company_name}</Text>
                            <Text style={styles.value}>{data.contact_person}</Text>
                            <Text style={styles.value}>{data.email}</Text>
                            <Text style={styles.value}>{data.phone}</Text>
                            {data.gst_number && (
                                <View style={{ marginTop: 5 }}>
                                    <Text style={styles.label}>GSTIN</Text>
                                    <Text style={styles.value}>{data.gst_number}</Text>
                                </View>
                            )}
                        </View>

                        <View style={styles.col}>
                            <Text style={styles.label}>Billing Address</Text>
                            <Text style={styles.value}>{data.billing_address}</Text>
                            <Text style={[styles.label, { marginTop: 12 }]}>Terms</Text>
                            <Text style={styles.value}>Payment: {data.payment_terms}</Text>
                            <Text style={styles.value}>Delivery: {data.delivery_terms}</Text>
                        </View>

                        <View style={styles.col}>
                            <Text style={styles.label}>Dates</Text>
                            <Text style={styles.value}>Date: {data.quotation_date}</Text>
                            <Text style={styles.value}>Valid Until: {data.valid_until}</Text>
                            <Text style={[styles.label, { marginTop: 12 }]}>Sales Representative</Text>
                            <Text style={styles.valueBold}>{data.created_by_name}</Text>
                        </View>
                    </View>

                    {/* Product Table */}
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableHeaderText, { width: '40%' }]}>Product & Description</Text>
                        <Text style={[styles.tableHeaderText, { width: '10%', textAlign: 'center' }]}>Qty</Text>
                        <Text style={[styles.tableHeaderText, { width: '15%', textAlign: 'right' }]}>Price</Text>
                        <Text style={[styles.tableHeaderText, { width: '15%', textAlign: 'center' }]}>Tax %</Text>
                        <Text style={[styles.tableHeaderText, { width: '15%', textAlign: 'center' }]}>Discount %</Text>
                        <Text
                            style={[
                                styles.tableHeaderText,
                                { width: '20%', textAlign: 'right', lineHeight: 1.2 }
                            ]}
                        >
                            {"Total\n(without tax)"}
                        </Text>                    </View>

                    {data.products?.map((p: any, i: number) => (
                        <View key={i} style={styles.tableRow}>
                            <View style={{ width: '40%' }}>
                                <Text style={styles.productName}>{p.product_name}</Text>
                                <Text style={styles.productDesc}>{p.description}</Text>
                            </View>
                            <Text style={{ width: '10%', textAlign: 'center', fontSize: 9 }}>{p.quantity}</Text>
                            <Text style={{ width: '15%', textAlign: 'right', fontSize: 9 }}>{Number(p.unit_price).toLocaleString()}</Text>
                            <Text style={{ width: '15%', textAlign: 'center', fontSize: 9 }}>{p.tax}%</Text>
                            <Text style={{ width: '15%', textAlign: 'center', fontSize: 9 }}>{p.discount}%</Text>
                            <Text style={{ width: '20%', textAlign: 'right', fontSize: 9, fontWeight: 'bold' }}>{formatINR(p.total_price)}</Text>
                        </View>
                    ))}

                    {/* Bottom Summary */}
                    <View style={styles.summaryWrapper}>
                        <View style={styles.termsBox}>
                            <Text style={styles.label}>Terms & Conditions</Text>
                            <Text style={{ fontSize: 7, color: '#475569', lineHeight: 1.5 }}>
                                {data.terms_conditions || "Standard terms and conditions apply to this quotation."}
                            </Text>
                            {data.notes && (
                                <View style={{ marginTop: 8 }}>
                                    <Text style={styles.label}>Note</Text>
                                    <Text style={{ fontSize: 7, color: '#475569' }}>{data.notes}</Text>
                                </View>
                            )}
                        </View>

                        <View style={styles.calcBox}>
                            <View style={styles.calcRow}>
                                <Text style={{ fontSize: 8, color: '#92400e' }}>Subtotal</Text>
                                <Text style={{ fontSize: 8, color: '#1e293b' }}>{formatINR(data.subtotal)}</Text>
                            </View>
                            <View style={styles.calcRow}>
                                <Text style={{ fontSize: 8, color: '#92400e' }}>Tax Total</Text>
                                <Text style={{ fontSize: 8, color: '#1e293b' }}>{formatINR(data.tax)}</Text>
                            </View>
                            <View style={styles.calcRow}>
                                <Text style={{ fontSize: 8, color: '#92400e' }}>Discount</Text>
                                <Text style={{ fontSize: 8, color: '#e11d48' }}>- {formatINR(data.discount)}</Text>
                            </View>
                            <View style={styles.grandTotalRow}>
                                <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#1e293b' }}>Grand Total</Text>
                                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#F59E0B' }}>{formatINR(data.total)}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <Text style={styles.footer}>
                    This is a system generated Quotation valid until {data.valid_until}.
                    Currency: {data.currency} • Generated via Sales Management System
                </Text>
            </Page>
        </Document>
    );
};