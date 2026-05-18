import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Font,
} from "@react-pdf/renderer";

Font.register({
    family: 'NotoSans',
    src: 'https://fonts.gstatic.com/s/notosans/v27/o-0IIpQlx3QUlC5A4PNr5TRG.ttf', 
});

const styles = StyleSheet.create({
    page: { padding: 40, backgroundColor: '#FFFFFF', fontFamily: "NotoSans" },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 3,
        borderBottomColor: '#F59E0B',
        paddingBottom: 15,
        marginBottom: 25,
    },
    title: { fontSize: 22, fontWeight: 'black', color: '#0f172a' },
    grnId: { fontSize: 10, color: '#F59E0B', fontWeight: 'bold', marginTop: 2 },
    
    // Info Grid
    section: { flexDirection: 'row', marginBottom: 30 },
    infoBox: { flex: 1 },
    label: { fontSize: 8, color: '#64748b', textTransform: 'uppercase', marginBottom: 3, fontWeight: 'bold' },
    value: { fontSize: 10, color: '#1e293b', marginBottom: 5 },
    valueBold: { fontSize: 10, fontWeight: 'bold', color: '#0f172a' },

    // Table
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#1e293b',
        padding: 8,
        borderRadius: 4,
    },
    tableHeaderText: { fontSize: 8, color: '#FFFFFF', fontWeight: 'bold', textTransform: 'uppercase' },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        paddingVertical: 10,
        paddingHorizontal: 8,
        alignItems: 'center',
    },

    // QC Status Block
    statusBox: {
        marginTop: 20,
        padding: 15,
        borderRadius: 8,
        borderWidth: 1,
        backgroundColor: '#f8fafc',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },

    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        fontSize: 7,
        color: '#94a3b8',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingTop: 10
    }
});

export const GoodsReceiptPDF = ({ data }: { data: any }) => {
    return (
        <Document title={`GRN-${data.grn_id}`}>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>GOODS RECEIPT NOTE</Text>
                        <Text style={styles.grnId}>GRN Entry: {data.grn_id}</Text>
                    </View>
                    <View style={{ textAlign: 'right' }}>
                        <Text style={styles.label}>Received Date</Text>
                        <Text style={styles.value}>{data.received_date}</Text>
                    </View>
                </View>

                {/* References Section */}
                <View style={styles.section}>
                    <View style={styles.infoBox}>
                        <Text style={styles.label}>Supplier Name</Text>
                        <Text style={styles.valueBold}>{data.supplier_name}</Text>
                        <Text style={styles.value}>Inbound Delivery</Text>
                    </View>
                    <View style={styles.infoBox}>
                        <Text style={styles.label}>Logistics Ref</Text>
                        <Text style={styles.value}>PO Number: {data.po_ref}</Text>
                        <Text style={styles.value}>Batch No: {data.batch_number}</Text>
                    </View>
                    <View style={styles.infoBox}>
                        <Text style={styles.label}>Warehouse Mapping</Text>
                        <Text style={styles.valueBold}>{data.warehouse_location || "Central Store"}</Text>
                    </View>
                </View>

                {/* Material Table */}
                <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderText, { width: '50%' }]}>Item Description</Text>
                    <Text style={[styles.tableHeaderText, { width: '25%', textAlign: 'center' }]}>Ordered Qty</Text>
                    <Text style={[styles.tableHeaderText, { width: '25%', textAlign: 'center' }]}>Received Qty</Text>
                </View>

                <View style={styles.tableRow}>
                    <View style={{ width: '50%' }}>
                        <Text style={{ fontSize: 10, fontWeight: 'bold' }}>{data.material_name}</Text>
                        <Text style={{ fontSize: 7, color: '#64748b' }}>Item Code: {data.material_code || "N/A"}</Text>
                    </View>
                    <Text style={{ width: '25%', textAlign: 'center', fontSize: 10 }}>{data.quantity_ordered}</Text>
                    <Text style={{ width: '25%', textAlign: 'center', fontSize: 10, fontWeight: 'bold' }}>{data.quantity_received}</Text>
                </View>

                {/* QC Verification Block (SRS 3.10) */}
                <View style={[styles.statusBox, { borderColor: data.qc_status === 'Approved' ? '#10b981' : '#f59e0b' }]}>
                    <View>
                        <Text style={styles.label}>Quality Verification Status</Text>
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: data.qc_status === 'Approved' ? '#059669' : '#d97706' }}>
                            MATERIAL {data.qc_status.toUpperCase()}
                        </Text>
                        {data.rejection_reason && (
                            <Text style={{ fontSize: 8, marginTop: 4, color: '#e11d48' }}>Reason: {data.rejection_reason}</Text>
                        )}
                    </View>
                    <View style={{ textAlign: 'right' }}>
                        <Text style={styles.label}>Logged By</Text>
                        <Text style={styles.valueBold}>{data.received_by}</Text>
                    </View>
                </View>

                {/* Footer Signature */}
                <View style={{ marginTop: 40, flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ width: '40%', borderTopWidth: 1, borderTopColor: '#cbd5e1', paddingTop: 5 }}>
                        <Text style={{ fontSize: 8, textAlign: 'center' }}>Receiver's Signature</Text>
                    </View>
                    <View style={{ width: '40%', borderTopWidth: 1, borderTopColor: '#cbd5e1', paddingTop: 5 }}>
                        <Text style={{ fontSize: 8, textAlign: 'center' }}>QC Inspector's Signature</Text>
                    </View>
                </View>

                <Text style={styles.footer}>
                    This is an automated system-generated GRN Document. Generated via Purchase Management System.
                </Text>
            </Page>
        </Document>
    );
};