"use client"

import React from "react"
import { faDownload, faPlus, faRefresh } from '@fortawesome/free-solid-svg-icons';
import { Form, Card, Row, Col, Nav, Tab } from 'react-bootstrap';
import Button from '../../components/base/Button';
import ReactSelect from '../../components/base/ReactSelect';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axiosInstance from '../../axios';
import { downloadFile } from '../../helpers/utils';
import swal from 'sweetalert';
import { ToastContainer, toast } from "react-toastify";
import { useEffect, useState, type FormEvent } from 'react';
import "./timeline.css"
import { handlePDFclicked as handleProformaDownload } from '../productivity/business-task/EnquiryDetails';
import { handlePOdownload } from '../purchase/purchase_order/PurchaseOrder';

interface InwardListingData {
    id: number
    inward_sys_id: string
}

interface BTListingData {
    id: number
    customer_name: string
}

interface InvoicesData {
    id: number
    invoice_number: string
}

interface FormData {
    inward: InwardListingData | null
    inward_id: number | undefined;
    business_task: BTListingData | null
    business_task_id: number | undefined;
    invoice: InvoicesData | null
    invoice_id: number | undefined;
}

interface ReportData {
    invoices: any[]
    selected_id: number
    inward: any
    show_report: boolean
    boxes_by_grn: Record<string, any[]>
    logistics_array: any[]
    regulatory_array: any[]
    row: any
    q_nos: any[]
    q_products: any[]
    irms: any[]
    irm_payment_histories: any[]
    payment_histories: any[]
    scrutinyRows: any[]
    vendor_invoices: any[]
    pmDeptScrutinyRows: any[]
    freightCostRows: any[]
    ownPickupRows: any[]
    servedByRows: any[]
    importerRows: any[]
    exportAgentRows: any[]
    portOfLoadingRows: any[]
}

export default function WmsEfficiencyReport() {
    const [formData, setFormData] = useState<FormData>({
        inward: null,
        inward_id: undefined,
        business_task: null,
        business_task_id: undefined,
        invoice: null,
        invoice_id: undefined,
    })

    const [inwardListingData, setInwardListingData] = useState<InwardListingData[]>([])
    const [btListingData, setBtListingData] = useState<BTListingData[]>([])
    const [invoicesData, setInvoicesData] = useState<InvoicesData[]>([])
    const [validated, setValidated] = useState<boolean>(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [reportData, setReportData] = useState<ReportData | null>(null)


    useEffect(() => {
        const fetchListingData = async () => {
            try {
                const response = await axiosInstance.get(`/wmsReporting`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const inward_list: InwardListingData[] = await response.data.inwards;
                const bt_list: BTListingData[] = response.data.business_task;
                const invoice_list: InvoicesData[] = response.data.invoices;

                setInwardListingData(inward_list);
                setBtListingData(bt_list);
                setInvoicesData(invoice_list);
            } catch (err: any) {
                setError(err.data.message);
            }
        };
        fetchListingData();
    }, []);

    const handleReset = () => {
        setFormData({
            inward: null,
            inward_id: undefined,
            business_task: null,
            business_task_id: undefined,
            invoice: null,
            invoice_id: undefined,
        })
        setReportData(null)
    }

    const handleInwardSelect = (selectedOption: any) => {
        if (selectedOption) {
            setFormData(prev => ({
                ...prev,
                inward: { id: selectedOption.value, inward_sys_id: selectedOption.label },
                inward_id: selectedOption.value
            }));
        }
    };

    const handleBTselection = (selectedOption: any) => {
        if (selectedOption) {
            setFormData(prev => ({
                ...prev,
                business_task: { id: selectedOption.value, customer_name: selectedOption.label },
                business_task_id: selectedOption.value
            }));
        }
    };

    const handleInvoiceChange = (selectedOption: any) => {
        if (selectedOption) {
            setFormData(prev => ({
                ...prev,
                invoice: { id: selectedOption.value, invoice_number: selectedOption.label },
                invoice_id: selectedOption.value
            }));
        }
    };

    const handleDownload = async (fileName: string, path: string) => {
        try {
            // Fetch the file from the server using the ID
            const response = await axiosInstance.get(`/getFileDownload?filepath=${path}/${fileName}`, {
                method: 'GET',
                responseType: 'blob',
            });
            if (response.status !== 200) {
                throw new Error('Failed to download the file');
            }
            // Create a Blob from the response data
            const blob = response.data;
            // Retrieve the filename from the response headers or construct it
            const contentDisposition = response.headers['content-disposition'];
            const filename = contentDisposition ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') || 'downloaded-file' : 'downloaded-file';
            //call download file function from utils
            downloadFile(blob, filename); //pass blob data and filename
        } catch (error: any) {
            if (error.status === 404) {
                swal("Error!", 'File not found', "error");
            }
            console.error('Error downloading the file:', error);
        }
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {

        e.preventDefault();
        const form = e.currentTarget;
        if (form.checkValidity() === false) {
            e.preventDefault();
            e.stopPropagation();
            setValidated(true);
            return;
        }

        if (!formData.inward_id && !formData.business_task_id && !formData.invoice_id) {
            setValidated(true)
            toast.error("Select at least one field");
            return
        }

        setLoading(true);
        setValidated(true);

        const apiCall = axiosInstance.post('/getReportingDetails', {
                ...formData,
            }
        );

        apiCall
            .then((response) => {
                const mockResponse = response.data;
                setReportData(mockResponse as ReportData)

        })
        .catch(error => swal("Error!", error.data.message, "error"))
        .finally(() => { setLoading(false); });
    }

    const formatDate = (dateString: string) => {
        if (!dateString) return ""
            const date = new Date(dateString)
            return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    }

    if (error) return <div className="text-red-500">Error: {error}</div>

    return (
        <>
        <div className="container mx-auto py-3">
        <h2 className="text-3xl font-bold mb-5">WMS Efficiency Report</h2>

        <Card className="border border-gray-200">
            <Card.Body className="pt-6">
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Row className='mb-2'>
                        <Form.Group as={Col} className="mb-3">
                            <Form.Label>Select Inward ID <span className="text-danger">*</span></Form.Label>
                            <ReactSelect
                                options= {inwardListingData.map((option: InwardListingData) => (
                                    { value: option.id, label: option.inward_sys_id }
                                ))}
                                placeholder="Select Inward ID" name="inward" value={formData.inward ? { value: formData.inward.id, label: formData.inward.inward_sys_id } : null} onChange={(selectedOption) => handleInwardSelect(selectedOption)} />
                            <Form.Control type="hidden" name="inward_id" value={formData.inward_id} />

                        </Form.Group>
                        <Form.Group as={Col} className="mb-3">
                            <Form.Label>Business Task Id <span className="text-danger">*</span></Form.Label>
                            <ReactSelect
                                options= {btListingData.map((option: BTListingData) => (
                                    { value: option.id, label: `${option.id} (${option.customer_name})` }
                                ))}
                                placeholder="Select Business Task" name="business_task" value={formData.business_task ? { value: formData.business_task.id, label: formData.business_task.customer_name } : null} onChange={(selectedOption) => handleBTselection(selectedOption)} />
                                <Form.Control type="hidden" name="business_task_id" value={formData.business_task_id} />

                        </Form.Group>
                        <Form.Group as={Col} className="mb-3">
                            <Form.Label>Select Invoice <span className="text-danger">*</span></Form.Label>
                            <ReactSelect
                                options= {invoicesData.map((option: InvoicesData) => (
                                    { value: option.id, label: `${option.invoice_number}` }
                                ))}
                                placeholder="Select Invoice" name="invoice" value={formData.invoice ? { value: formData.invoice.id, label: formData.invoice.invoice_number } : null} onChange={(selectedOption) => handleInvoiceChange(selectedOption)} />
                                <Form.Control type="hidden" name="invoice_id" value={formData.invoice_id} />

                        </Form.Group>
                    </Row>
                    <Row className='mt-2'>
                        <Col className='text-center'>
                            <Button variant="primary" loading={loading} loadingPosition="start" type="submit">Generate Report</Button>
                            <Button variant="primary" className="ms-2" startIcon={<FontAwesomeIcon icon={faRefresh} className="me-2" />} onClick={() => { handleReset()}} >Reset</Button>
                        </Col>
                    </Row>
                </Form>

            </Card.Body>
        </Card>

        {reportData && (
            <div className="mt-6">
            <Card className="border border-gray-200">
                <Card.Header className="bg-blue-50">
                <h5 className="text-xl font-semibold">Select ID to generate report</h5>
                </Card.Header>
                <Card.Body className="bg-blue-50">
                <div className="container-fluid">
                    <div className="mt-1 row">
                    <div className="text-center">
                        <h4 className="text-xl font-bold">PRE-EXPORT COMPLIANCE CHECKLIST</h4>
                    </div>
                    </div>

                    <Row className="my-4">
                        <Col>
                            <h5>Selected Inward: <strong>{reportData.inward.inward_sys_id}</strong></h5>
                        </Col>
                        <Col>
                            <h5>Selected BT:{" "}
                                <strong>({reportData.inward.business_task.id}) - {reportData.inward.business_task.customer_name}</strong>
                            </h5>
                        </Col>
                        <Col>
                            <h5>Selected Invoice:{" "}
                                <strong>{reportData.invoices.length > 0 ? reportData.invoices[0].invoice_number : "N/A"}</strong>
                            </h5>
                        </Col>
                    </Row>

                    <div className="mt-6">
                    <div className="timeline timeline-line-solid">
                        <span className="timeline-label">
                        <span className="label">
                            {reportData.row.id} ({reportData.row.customer_name})
                        </span>
                        </span>

                        {/* Sales Department */}
                        <div className="timeline-item">
                        <div className="timeline-point"></div>
                        <div className="timeline-event">
                            <div className="widget has-shadow">
                            <div className="widget-header flex items-center">
                                <div className="mr-auto flex flex-col">
                                <h4 className="timeline-title">Sales Department</h4>
                                </div>
                            </div>
                            <div className="widget-body">
                                <p>
                                <b>Customer</b>: {reportData.row.customer_name}
                                </p>
                                <hr className="border-red-500 my-2" />
                                <h4 className="timeline-title sub-title">Enquiry detail</h4>
                                <p>
                                <b>Date</b>: {formatDate(reportData.row.created_at)}
                                </p>
                                <p>
                                <b>Enquiry</b>: {reportData.row.enquiry}
                                </p>
                                <p>
                                <b>Category</b>: {reportData.row.categories && reportData.row.categories?.name}
                                </p>
                                <p>
                                <b>Task Status</b>: {reportData.row.task_status}
                                </p>
                                <p>
                                <b>PI No</b>:
                                {reportData.q_nos.length > 0
                                    ? reportData.q_nos.map((q, index) => (
                                        <span key={q.id}>
                                            <Button variant='link' size='lg' onClick={() => handleProformaDownload(q.id, 'pdfWithSignatureQuotation')}>{q.pi_number}</Button>
                                        {index < reportData.q_nos.length - 1 ? ", " : ""}
                                        </span>
                                    ))
                                    : "N/A"}
                                </p>
                                <p>
                                <b>PI Products & QTY</b>:
                                {reportData.q_products.length > 0
                                    ? reportData.q_products[0].map((prod, index) => (
                                        <div key={index}>
                                        <strong>{prod.product_name}</strong> &nbsp;&nbsp; Qty:{" "}
                                        <strong>{prod.quantity}</strong>
                                        </div>
                                    ))
                                    : "N/A"}
                                </p>
                            </div>

                            <div className="widget-footer flex items-center">
                                <div className="title">
                                <h4 className="timeline-title">Logistic Instructions</h4>
                                <p>
                                    <b className={!reportData.row.incoTermDetails ? "bg-yellow-200" : ""}>Inco Term</b>:{" "}
                                    {reportData.inward.inco_term.inco_term}
                                </p>
                                <p>
                                    <b className={!reportData.row.freight_target_cost ? "bg-yellow-200" : ""}>
                                    Freight Target Cost
                                    </b>
                                    : {reportData.row.freight_target_cost || ""}
                                </p>
                                <p>
                                    <b className={!reportData.row.port_of_unloading ? "bg-yellow-200" : ""}>
                                    Port Of Unloading
                                    </b>
                                    : {reportData.row.port_of_unloading || ""}
                                </p>
                                <p>
                                    <b className={!reportData.row.shipment_mode ? "bg-yellow-200" : ""}>Shipment Mode</b>:{" "}
                                    {reportData.row.shipment_mode || ""}
                                </p>
                                <p>
                                    <b className={!reportData.row.shipping_liabelity ? "bg-yellow-200" : ""}>
                                    Shipping Liability
                                    </b>
                                    : {reportData.row.shipping_liabelity || ""}
                                </p>
                                <p>
                                    <b className={!reportData.row.cold_chain ? "bg-yellow-200" : ""}>Cold Chain</b>:{" "}
                                    {reportData.row.cold_chain || ""}
                                </p>
                                <p>
                                    <b className={!reportData.row.final_destination ? "bg-yellow-200" : ""}>
                                    Final Destination
                                    </b>
                                    : {reportData.row.final_destination || ""}
                                </p>
                                </div>
                            </div>
                            </div>
                        </div>
                        </div>

                        {/* Purchase Department */}
                        <div className="timeline-item">
                        <div className="timeline-point"></div>
                        <div className="timeline-event">
                            <div className="widget has-shadow">
                            <div className="widget-header flex items-center">
                                <div className="user-image">
                                <h4 className="timeline-title">Purchase Department</h4>
                                </div>
                            </div>

                            <div className="widget-body">
                                <hr className="border-red-500 my-2" />
                                <h4 className="timeline-title sub-title">Purchase Departments Scrutiny</h4>
                                {reportData.pmDeptScrutinyRows.length > 0 ? (
                                reportData.pmDeptScrutinyRows.map((pmdept, index) => (
                                    <div key={index}>
                                    <p className="text-right">
                                        <small className="text-gray-500">
                                        <i>⏱️</i> {formatDate(new Date().toISOString())}
                                        </small>
                                    </p>
                                    <p>
                                        <b className={!pmdept.make1 ? "bg-purple-200" : ""}>Make</b>: {pmdept.make1 || ""}
                                    </p>
                                    <p>
                                        <b className={!pmdept.model1 ? "bg-purple-200" : ""}>Model</b>:{" "}
                                        {pmdept.model1 || ""}
                                    </p>
                                    <p>
                                        <b className={!pmdept.supplier_name2 ? "bg-purple-200" : ""}>Supplier Name</b>:{" "}
                                        {pmdept.supplier_name2 || ""}
                                    </p>
                                    <p>
                                        <b className={!pmdept.ready_stock_quantity ? "bg-purple-200" : ""}>
                                        Ready Stock Qty
                                        </b>
                                        : {pmdept.ready_stock_quantity || ""}
                                    </p>
                                    <p>
                                        <b className={!pmdept.lead_time ? "bg-purple-200" : ""}>Lead time</b>:{" "}
                                        {pmdept.lead_time || ""}
                                    </p>
                                    <p>
                                        <b className={!pmdept.expiry ? "bg-purple-200" : ""}>Expiry</b>:{" "}
                                        {pmdept.expiry || ""}
                                    </p>
                                    <p>
                                        <b className={!pmdept.physical_verification ? "bg-purple-200" : ""}>
                                        Phy Verification
                                        </b>
                                        : {pmdept.physical_verification || ""}
                                    </p>
                                    <p>
                                        <b className={!pmdept.supplier_name2 ? "bg-purple-200" : ""}>Condition</b>:{" "}
                                        {pmdept.supplier_name2 || ""}
                                    </p>
                                    <p>
                                        <b className={!pmdept.condition1 ? "bg-purple-200" : ""}>Product type</b>:{" "}
                                        {pmdept.condition1 || ""}
                                    </p>
                                    <p>
                                        <b className={!pmdept.transportation_cost ? "bg-purple-200" : ""}>Transport cost</b>
                                        : {pmdept.transportation_cost || ""}
                                    </p>
                                    <p>
                                        <b className={!pmdept.year_of_manufacturing1 ? "bg-purple-200" : ""}>
                                        Year of manufacturing
                                        </b>
                                        : {pmdept.year_of_manufacturing1 || ""}
                                    </p>
                                    <p>
                                        <b className={!pmdept.packaging_cost ? "bg-purple-200" : ""}>Packaging cost</b>:{" "}
                                        {pmdept.packaging_cost || ""}
                                    </p>
                                    {index < reportData.pmDeptScrutinyRows.length - 1 && <hr />}
                                    </div>
                                ))
                                ) : (
                                <>
                                    <p>
                                    <b className="bg-purple-200">Make</b>:{" "}
                                    </p>
                                    <p>
                                    <b className="bg-purple-200">Model</b>:{" "}
                                    </p>
                                    <p>
                                    <b className="bg-purple-200">Supplier Name</b>:{" "}
                                    </p>
                                    <p>
                                    <b className="bg-purple-200">Ready Stock Qty</b>:{" "}
                                    </p>
                                    <p>
                                    <b className="bg-purple-200">Lead time</b>:{" "}
                                    </p>
                                    <p>
                                    <b className="bg-purple-200">Expiry</b>:{" "}
                                    </p>
                                    <p>
                                    <b className="bg-purple-200">Phy Verification</b>:{" "}
                                    </p>
                                    <p>
                                    <b className="bg-purple-200">Condition</b>:{" "}
                                    </p>
                                    <p>
                                    <b className="bg-purple-200">Product type</b>:{" "}
                                    </p>
                                    <p>
                                    <b className="bg-purple-200">Transport cost</b>:{" "}
                                    </p>
                                    <p>
                                    <b className="bg-purple-200">Year of manufacturing</b>:{" "}
                                    </p>
                                    <p>
                                    <b className="bg-purple-200">Packaging cost</b>:{" "}
                                    </p>
                                </>
                                )}
                            </div>
                            </div>
                        </div>
                        </div>

                        {/* Accounts Department */}
                        <div className="timeline-item">
                        <div className="timeline-point"></div>
                        <div className="timeline-event">
                            <div className="widget has-shadow">
                            <div className="widget-header flex items-center">
                                <h4 className="timeline-title">Accounts Department</h4>
                            </div>
                            <div className="widget-body">
                                <h4 className="timeline-title sub-title">Supplier Scrutiny</h4>
                                {reportData.scrutinyRows.length > 0 ? (
                                reportData.scrutinyRows.map((scrutiny, index) => (
                                    <div key={index}>
                                    <p className="text-right">
                                        <small className="text-gray-500">
                                        <i>⏱️</i> {formatDate(new Date().toISOString())}
                                        </small>
                                    </p>
                                    <p>
                                        <b>Supplier name</b>: {scrutiny.vendor_details?.name || scrutiny.supplier_name}
                                    </p>
                                    <p>
                                        <b>GST No</b>: {scrutiny.gst_number}
                                    </p>
                                    <p>
                                        <b>Previous Non GST 2A reflected Invoice Number</b>: {scrutiny.gst_status}
                                    </p>
                                    <p>
                                        <b>GST Last filing Date</b>: {formatDate(scrutiny.gst_last_filing_date)}
                                    </p>
                                    {index < reportData.scrutinyRows.length - 1 && <hr />}
                                    </div>
                                ))
                                ) : (
                                <>
                                    <p>
                                    <b className="bg-red-200">Supplier name</b>:{" "}
                                    </p>
                                    <p>
                                    <b className="bg-red-200">GST No</b>:{" "}
                                    </p>
                                    <p>
                                    <b className="bg-red-200">Previous Non GST 2A reflected Invoice Number</b>:{" "}
                                    </p>
                                    <p>
                                    <b className="bg-red-200">GST Last filing Date</b>:{" "}
                                    </p>
                                </>
                                )}

                                <hr className="border-red-500 my-2" />
                                <h4 className="timeline-title sub-title">Payment History - Purchase Order</h4>
                                {reportData.payment_histories.length > 0 ? (
                                reportData.payment_histories.map((history, index) => (
                                    <div key={index}>
                                    <p className="text-right">
                                        <small className="text-gray-500">
                                        <i>⏱️</i> {formatDate(new Date().toISOString())}
                                        </small>
                                    </p>
                                    <p>
                                        <b>PO or Invoice No.</b>:{" "}
                                        <a className="text-blue-500 hover:underline" href="#">
                                        <Button variant='link' size='lg' onClick={() => handlePOdownload(history.po_id, 'pdfWithSignature')}>{history.po_invoice_number}</Button>

                                        </a>
                                    </p>
                                    <p>
                                        <b>Vendor Name</b>: {history.po_details.vendor.name}
                                    </p>
                                    <p>
                                        <b>PO Product(s)</b>:{" "}
                                        {history.po_details.po_products.map((prod, i) => (
                                        <span key={i}>
                                            {prod.product_name} <b>Qty:</b> {prod.quantity}
                                            {i < history.po_details.po_products.length - 1 ? "; " : ""}
                                        </span>
                                        ))}
                                    </p>
                                    <p>
                                        <b>PO Base Amount</b>: {history.po_details.total}
                                    </p>
                                    <p>
                                        <b>PO GST Rate(%)</b>: {history.gst_rate} <b>PO GST Amount</b>: {history.gst_amount}
                                    </p>
                                    <p>
                                        <b>PO TDS Rate(%)</b>: {history.tds_rate} <b>PO TDS Amount</b>: {history.tds_amount}
                                    </p>
                                    <p>
                                        <b>PO or Invoice Amount</b>: {history.po_invoice_amount}
                                    </p>
                                    {index < reportData.payment_histories.length - 1 && <hr />}
                                    </div>
                                ))
                                ) : (
                                <>
                                    <p>
                                    <b className="bg-red-200">PO or Invoice No.</b>:{" "}
                                    </p>
                                    <p>
                                    <b className="bg-red-200">Vendor Name</b>:{" "}
                                    </p>
                                    <p>
                                    <b className="bg-red-200">PO Product(s)</b>:{" "}
                                    </p>
                                    <p>
                                    <b className="bg-red-200">PO Base Amount</b>:{" "}
                                    </p>
                                    <p>
                                    <b className="bg-red-200">PO GST Rate(%)</b>:{" "}
                                    <b className="bg-red-200">PO GST Amount</b>:{" "}
                                    </p>
                                    <p>
                                    <b className="bg-red-200">PO TDS Rate(%)</b>:{" "}
                                    <b className="bg-red-200">PO TDS Amount</b>:{" "}
                                    </p>
                                    <p>
                                    <b className="bg-red-200">PO or Invoice Amount</b>:{" "}
                                    </p>
                                </>
                                )}

                                <hr className="border-red-500 my-2" />
                                <h4 className="timeline-title sub-title">Payment History - Vendor Purchase Invoice</h4>
                                {reportData.vendor_invoices.length > 0 ? (
                                reportData.vendor_invoices.map((vpi, index) => (
                                    <div key={index}>
                                    <p>
                                        <b>PO Num (if present)</b>: {vpi.purchase_order_id != null ? (<Button variant='link' size='lg' onClick={() => handlePOdownload(vpi.purchase_order_id, 'pdfWithSignature')}>{vpi.purchase_order?.purchase_order_number}</Button>) : ""}
                                    </p>
                                    <p>
                                        <b>Purchase Invoice Num</b>: {vpi.purchase_invoice_no}
                                    </p>
                                    <p>
                                        <b>Purchase Invoice Date</b>: {vpi.purchase_invoice_date}
                                    </p>
                                    <p>
                                        <b>Bank Name</b>: {vpi.bank_name}
                                    </p>
                                    <p>
                                        <b>Bank UTR/ Check Number</b>: {vpi.utr_number}
                                    </p>
                                    <p>
                                        <b>UTR Date</b>: {vpi.utr_date}
                                    </p>
                                    <p>
                                        <b>Vendor Name</b>: {vpi.vendor?.name || ""}
                                    </p>
                                    <p>
                                        <b>Base Amount</b>: {vpi.base_amount}
                                    </p>
                                    <p>
                                        <b>GST Rate(%)</b>: {vpi.gst_percent} <b>GST Amount</b>: {vpi.gst_amount}
                                    </p>
                                    <p>
                                        <b>TDS Rate(%)</b>: {vpi.tds_deduction} <b>TDS Amount</b>: {vpi.tds_amount}
                                    </p>
                                    <p>
                                        <b>Net Payable after TDS deduction</b>: {vpi.net_payable}
                                    </p>
                                    {index < reportData.vendor_invoices.length - 1 && <hr />}
                                    </div>
                                ))
                                ) : (
                                <>
                                    <p>
                                    <b className="bg-red-200">PO Num (if present)</b>:{" "}
                                    </p>
                                    <p>
                                    <b className="bg-red-200">Purchase Invoice Num</b>:{" "}
                                    </p>
                                    <p>
                                    <b className="bg-red-200">Bank Name</b>:{" "}
                                    </p>
                                    <p>
                                    <b className="bg-red-200">Bank UTR/ Check Number</b>:{" "}
                                    </p>
                                    <p>
                                    <b className="bg-red-200">UTR Date</b>:{" "}
                                    </p>
                                    <p>
                                    <b className="bg-red-200">Vendor Name</b>:{" "}
                                    </p>
                                    <p>
                                    <b className="bg-red-200">Base Amount</b>:{" "}
                                    </p>
                                    <p>
                                    <b className="bg-red-200">GST Rate(%)</b>: <b className="bg-red-200">GST Amount</b>:
                                    </p>
                                    <p>
                                    <b className="bg-red-200">TDS Rate(%)</b>: <b className="bg-red-200">TDS Amount</b>:
                                    </p>
                                    <p>
                                    <b className="bg-red-200">Net Payable afterTDS Rate(%)</b>:{" "}
                                    </p>
                                </>
                                )}
                            </div>
                            </div>
                        </div>
                        </div>

                        {/* Logistics Department - Ongoing Export */}
                        <div className="timeline-item">
                        <div className="timeline-point"></div>
                        <div className="timeline-event">
                            <div className="widget has-shadow">
                            <div className="widget-header flex items-center">
                                <h4 className="timeline-title">Logistics Department - Ongoing Export</h4>
                            </div>
                            <div className="widget-body">
                                <hr className="border-red-500 my-2" />
                                <h4 className="timeline-title sub-title">Inorbvict Paid Pickup</h4>
                                {reportData.ownPickupRows.length > 0 ? (
                                reportData.ownPickupRows.map((ownPickup, index) => (
                                    <div key={index}>
                                    <p>
                                        <b>FFD Name</b>: {ownPickup.ffd_name?.ffd_name || ""}
                                    </p>
                                    <p>
                                        <b>Pick UP Location</b>: {ownPickup.pick_up_location}
                                    </p>
                                    <p>
                                        <b>OPU Freight cost</b>: {ownPickup.opu_freight_cost}
                                    </p>
                                    <p>
                                        <b>PO Number</b>: {ownPickup.purchase_order?.purchase_order_number || ""}
                                    </p>
                                    <p>
                                        <b>PickUp Refrence Number</b>: {ownPickup.pickup_refrence_number}
                                    </p>
                                    {index < reportData.ownPickupRows.length - 1 && <hr />}
                                    </div>
                                ))
                                ) : (
                                <>
                                    <p>
                                    <b className="bg-yellow-200">FFD Name</b>:{" "}
                                    </p>
                                    <p>
                                    <b className="bg-yellow-200">Pick UP Location</b>:{" "}
                                    </p>
                                    <p>
                                    <b className="bg-yellow-200">OPU Freight cost</b>:{" "}
                                    </p>
                                    <p>
                                    <b className="bg-yellow-200">PO Number</b>:{" "}
                                    </p>
                                    <p>
                                    <b className="bg-yellow-200">PickUp Refrence Number</b>:{" "}
                                    </p>
                                </>
                                )}

                                <hr className="border-red-500 my-2" />
                                <h4 className="timeline-title sub-title">Supplier Paid Dispatch</h4>
                                {reportData.servedByRows.length > 0 ? (
                                reportData.servedByRows.map((serveBy, index) => (
                                    <div key={index}>
                                    <p>
                                        <b>FFD</b>: {serveBy.ffd_name?.ffd_name || ""}
                                    </p>
                                    <p>
                                        <b>POD/Lorry Receipt/Bilti/ LR Number</b>: {serveBy.pod_lorry_receipt}
                                    </p>
                                    <p>
                                        <b>Date</b>: {formatDate(serveBy.booking_date)}
                                    </p>
                                    {index < reportData.servedByRows.length - 1 && <hr />}
                                    </div>
                                ))
                                ) : (
                                <>
                                    <p>
                                    <b className="bg-yellow-200">FFD</b>:{" "}
                                    </p>
                                    <p>
                                    <b className="bg-yellow-200">POD/Lorry Receipt/Bilti/ LR Number</b>:{" "}
                                    </p>
                                    <p>
                                    <b className="bg-yellow-200">Date</b>:{" "}
                                    </p>
                                </>
                                )}

                                <hr className="border-red-500 my-2" />
                                <h4 className="timeline-title sub-title">ExW Shipment</h4>
                                {reportData.importerRows.length > 0 ? (
                                reportData.importerRows.map((importer, index) => (
                                    <div key={index}>
                                    <p>
                                        <b>FFD Name</b>: {importer.ffd?.ffd_name || ""}
                                    </p>
                                    <p>
                                        <b>PickUp Reference Number</b>: {importer.pick_up_reference_number}
                                    </p>
                                    <p>
                                        <b>Date</b>: {importer.kyc_done || ""}
                                    </p>
                                    {index < reportData.importerRows.length - 1 && <hr />}
                                    </div>
                                ))
                                ) : (
                                <>
                                    <p>
                                    <b className="bg-yellow-200">FFD Name</b>:{" "}
                                    </p>
                                    <p>
                                    <b className="bg-yellow-200">PickUp Reference Number</b>:{" "}
                                    </p>
                                    <p>
                                    <b className="bg-yellow-200">Date</b>:{" "}
                                    </p>
                                </>
                                )}

                                <hr className="border-red-500 my-2" />
                                <h4 className="timeline-title sub-title">C&F CIF Shipment</h4>
                                {reportData.exportAgentRows.length > 0 ? (
                                reportData.exportAgentRows.map((exportAgent, index) => (
                                    <div key={index}>
                                    <p>
                                        <b>FFD Name</b>: {exportAgent.ffd_name?.ffd_name || ""}
                                    </p>
                                    {index < reportData.exportAgentRows.length - 1 && <hr />}
                                    </div>
                                ))
                                ) : (
                                <p>
                                    <b className="bg-yellow-200">FFD Name</b>:{" "}
                                </p>
                                )}

                                <hr className="border-red-500 my-2" />
                                <h4 className="timeline-title sub-title">FOB Shipment</h4>
                                {reportData.portOfLoadingRows.length > 0 ? (
                                reportData.portOfLoadingRows.map((portOfLoading, index) => (
                                    <div key={index}>
                                    <p>
                                        <b>FFD Name</b>: {portOfLoading.ffd_name?.ffd_name || ""}
                                    </p>
                                    <p>
                                        <b>Freight Cost</b>: {portOfLoading.freight_cost}
                                    </p>
                                    <p>
                                        <b>PO Number</b>: {portOfLoading.purchase_order?.purchase_order_number || ""}
                                    </p>
                                    <p>
                                        <b>PickUp Reference Number</b>: {portOfLoading.pickup_refrence_number}
                                    </p>
                                    <p>
                                        <b>PickUp Booking Date</b>: {formatDate(portOfLoading.pickup_booking_date)}
                                    </p>
                                    {index < reportData.portOfLoadingRows.length - 1 && <hr />}
                                    </div>
                                ))
                                ) : (
                                <>
                                    <p>
                                    <b className="bg-yellow-200">FFD Name</b>:{" "}
                                    </p>
                                    <p>
                                    <b className="bg-yellow-200">Freight Cost</b>:{" "}
                                    </p>
                                    <p>
                                    <b className="bg-yellow-200">PO Number</b>:{" "}
                                    </p>
                                    <p>
                                    <b className="bg-yellow-200">PickUp Reference Number</b>:{" "}
                                    </p>
                                    <p>
                                    <b className="bg-yellow-200">PickUp Booking Date</b>:{" "}
                                    </p>
                                </>
                                )}
                            </div>
                            </div>
                        </div>
                        </div>

                        {/* Logistics Department - Pre Export */}
                        <div className="timeline-item">
                        <div className="timeline-point"></div>
                        <div className="timeline-event">
                            <div className="widget has-shadow">
                            <div className="widget-header flex items-center">
                                <div className="user-image">
                                <h4 className="timeline-title">Logistics Department - Pre Export</h4>
                                </div>
                            </div>
                            <div className="widget-body">
                                <hr className="border-red-500 my-2" />
                                <h4 className="timeline-title sub-title">Pre export shipment</h4>
                                {reportData.freightCostRows.length > 0 ? (
                                <>
                                    <h5 className="text-green-600 font-semibold">Winner</h5>
                                    {reportData.freightCostRows
                                    .filter((row) => row.tender_status === "Winner")
                                    .map((freightCost, index) => (
                                        <div key={index}>
                                        <p className="text-right">
                                            <small className="text-gray-500">
                                            <i>⏱️</i> {formatDate(new Date().toISOString())}
                                            </small>
                                        </p>
                                        <p>
                                            <b>Freight Agent</b>: {freightCost.ffd_name?.ffd_name || ""}
                                        </p>
                                        <p>
                                            <b>Quoting Price</b>: {freightCost.quoting_price}
                                        </p>
                                        <p>
                                            <b>CP Name</b>: {freightCost.contact_person_name}
                                        </p>
                                        <p>
                                            <b>Email</b>: {freightCost.contact_person_email}
                                        </p>
                                        <p>
                                            <b>Phone</b>: {freightCost.contact_person_phone}
                                        </p>
                                        <p>
                                            <b>Tender Status</b>: {freightCost.tender_status}
                                        </p>
                                        <p>
                                            <b>Vessel Airline Name</b>: {freightCost.vessel_airline_name}
                                        </p>
                                        <p>
                                            <b>Vessel Airline Date</b>: {freightCost.vessel_airline_date}
                                        </p>
                                        </div>
                                    ))}

                                    <hr className="my-2" />
                                    <h5 className="text-red-600 font-semibold">Bidder</h5>
                                    {reportData.freightCostRows
                                    .filter((row) => row.tender_status !== "Winner")
                                    .map((freightCost, index) => (
                                        <div key={index}>
                                        <p className="text-right">
                                            <small className="text-gray-500">
                                            <i>⏱️</i> {formatDate(new Date().toISOString())}
                                            </small>
                                        </p>
                                        <p>
                                            <b>Freight Agent</b>: {freightCost.ffd_name?.ffd_name || ""}
                                        </p>
                                        <p>
                                            <b>Quoting Price</b>: {freightCost.quoting_price}
                                        </p>
                                        <p>
                                            <b>CP Name</b>: {freightCost.contact_person_name}
                                        </p>
                                        <p>
                                            <b>Email</b>: {freightCost.contact_person_email}
                                        </p>
                                        <p>
                                            <b>Phone</b>: {freightCost.contact_person_phone}
                                        </p>
                                        <p>
                                            <b>Tender Status</b>: {freightCost.tender_status}
                                        </p>
                                        <p>
                                            <b>Vessel Airline Name</b>: {freightCost.vessel_airline_name}
                                        </p>
                                        <p>
                                            <b>Vessel Airline Date</b>: {freightCost.vessel_airline_date}
                                        </p>
                                        {index <
                                            reportData.freightCostRows.filter((row) => row.tender_status !== "Winner")
                                            .length -
                                            1 && <hr />}
                                        </div>
                                    ))}
                                </>
                                ) : (
                                <>
                                    <p>
                                    <b className="bg-yellow-200">Freight Agent</b>:{" "}
                                    </p>
                                    <p>
                                    <b className="bg-yellow-200">Quoting Price</b>:{" "}
                                    </p>
                                    <p>
                                    <b className="bg-yellow-200">CP Name</b>:{" "}
                                    </p>
                                    <p>
                                    <b className="bg-yellow-200">Email</b>:{" "}
                                    </p>
                                    <p>
                                    <b className="bg-yellow-200">Phone</b>:{" "}
                                    </p>
                                    <p>
                                    <b className="bg-yellow-200">Tender Status</b>:{" "}
                                    </p>
                                    <p>
                                    <b className="bg-yellow-200">Vessel Airline Name</b>:{" "}
                                    </p>
                                    <p>
                                    <b className="bg-yellow-200">Vessel Airline Date</b>:{" "}
                                    </p>
                                </>
                                )}
                            </div>
                            </div>
                        </div>
                        </div>

                        {/* E-docs */}
                        <span className="timeline-label">
                        <span className="label">E-docs</span>
                        </span>

                        {/* Inward Remittance Management */}
                        <div className="timeline-item">
                        <div className="timeline-point"></div>
                        <div className="timeline-event">
                            <div className="widget has-shadow">
                            <div className="widget-header flex items-center">
                                <h4 className="timeline-title">Inward Remittance Management (IRM)</h4>
                            </div>
                            <div className="widget-body">
                                {reportData.irms.map((irm, index) => (
                                <div key={index}>
                                    <p>
                                    <b>IRM System ID</b>: {irm.irm_sys_id}
                                    </p>
                                    <p>
                                    <b>Reference number</b>: {irm.reference_no}
                                    </p>
                                    <p>
                                    <b>Remittance date</b>: {irm.remittance_date}
                                    </p>
                                    <p>
                                    <b>Currency</b>: USD
                                    </p>
                                    <p>
                                    <b>Received Amount</b>: {irm.received_amount}
                                    </p>
                                    <p>
                                    <b>Final Balance Amount</b>: {irm.buyer?.name || ""}
                                    </p>
                                    <p>
                                    <b>Buyer</b>: {irm.buyer?.name || ""}
                                    </p>
                                    <p>
                                    <b>Bank Name</b>: HDFC Bank
                                    </p>
                                    {index < reportData.irms.length - 1 && <hr />}
                                </div>
                                ))}
                            </div>
                            </div>
                        </div>
                        </div>

                        {/* IRM Payment History */}
                        <div className="timeline-item">
                        <div className="timeline-point" style={{ backgroundColor: "#cc181e", color: "#cc181e" }}></div>
                        <div className="timeline-event">
                            <div className="widget has-shadow">
                            <div className="widget-header flex items-center">
                                <h4 className="timeline-title">IRM Payment History</h4>
                            </div>
                            <div className="widget-body">
                                {reportData.irm_payment_histories.length > 0 &&
                                reportData.irm_payment_histories[0].length > 0 ? (
                                reportData.irm_payment_histories.map((histories, idx) => (
                                    <div key={idx}>
                                    {histories.map((history: any, index: number) => (
                                        <div key={index}>
                                        <p className="text-right">
                                            <small className="text-gray-500">
                                            <i>⏱️</i> {formatDate(history.created_at)}
                                            </small>
                                        </p>
                                        <p>

                                            <span className="bg-blue-500 text-white px-2 py-1 rounded">
                                                <b>Invoice No</b>: {history.invoice_details.invoice_number}
                                            </span>

                                        </p>
                                        <p>
                                            <b>Reference Number</b>: {history.reference_no}
                                        </p>
                                        <p>
                                            <b>Received Amount</b>: {history.received_amount}
                                        </p>
                                        <p>
                                            <b>Previous Outstanding Amount</b>: {history.outstanding_amount}
                                        </p>
                                        <p>
                                            <b>Invoice Amount</b>: {history.invoice_amount}
                                        </p>
                                        <p>
                                            <b>Outstanding Amount</b>: {history.old_outstanding_amount}
                                        </p>
                                        <hr />
                                        </div>
                                    ))}
                                    </div>
                                ))
                                ) : (
                                <p>No payment history available</p>
                                )}
                            </div>
                            </div>
                        </div>
                        </div>

                        {/* Invoices */}
                        <div className="timeline-item">
                        <div className="timeline-point" style={{ backgroundColor: "#cc181e", color: "#cc181e" }}></div>
                        <div className="timeline-event">
                            <div className="widget has-shadow">
                            <div className="widget-header flex items-center">
                                <h4 className="timeline-title">Invoices</h4>
                            </div>
                            <div className="widget-body">
                                <hr className="m-0 border-red-500" />
                                {reportData.invoices.map((inv, index) => (
                                <div key={index}>
                                    <p>

                                        <span className="bg-blue-500 text-white px-2 py-1 rounded">
                                            <b>Invoice No</b>: {inv.invoice_number}
                                        </span>

                                    </p>
                                    <p>
                                    <b>Invoice Date</b>: {formatDate(inv.invoice_date)}
                                    </p>
                                    <p>
                                    <b>Buyer Name</b>: {inv.buyer?.name || ""}
                                    </p>
                                    <p>
                                    <b>Shipment Type</b>: {inv.shipment_type}
                                    </p>
                                    <p>
                                    <b>Exchange Rate</b>: {inv.exchange_rate}
                                    </p>
                                    <p>
                                    <b>Currency</b>: {inv.currency}
                                    </p>
                                    <p>
                                    <b>Received Amount</b>: {inv.received_amount}
                                    </p>
                                    <p>
                                    <b>Outstanding Amount</b>: {inv.received_amount - inv.grand_total}
                                    </p>
                                    <p>
                                    <b>Invoice Value</b>: {inv.grand_total}
                                    </p>
                                    <hr />
                                </div>
                                ))}
                            </div>
                            </div>
                        </div>
                        </div>

                        <span className="timeline-label">
                        <h4 className="text-dark bg-blue-50 p-2 font-bold">END-TO-END EXPORT CHECKLIST</h4>
                        </span>

                        {/* Inward Details */}
                        <div className="timeline-item">
                        <div className="timeline-point"></div>
                        <div className="timeline-event">
                            <div className="widget has-shadow">
                            <div className="widget-header flex items-center">
                                <h4 className="timeline-title">Inward Details</h4>
                            </div>
                            <div className="widget-body">
                                <p>
                                <strong>Inward ID: </strong> {reportData.inward.inward_sys_id}
                                </p>
                                <p>
                                <strong>Inward Date: </strong> {formatDate(reportData.inward.inward_date)}
                                </p>
                                <p>
                                <strong>Proforma Invoice: </strong> ({reportData.inward.proforma_invoice.id}){" "}
                                {reportData.inward.proforma_invoice.pi_number}
                                </p>
                                <p>
                                <strong>Business Task: </strong> ({reportData.inward.business_task.id}){" "}
                                {reportData.inward.business_task.customer_name}
                                </p>
                                <p>
                                <strong>Port of Loading: </strong> {reportData.inward.port_of_loading}
                                </p>
                                <p>
                                <strong>Port of Discharge: </strong> {reportData.inward.port_of_discharge}
                                </p>
                                <p>
                                <strong>INCO Terms: </strong> {reportData.inward.inco_term.inco_term}
                                </p>
                            </div>
                            </div>
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
                </Card.Body>

                {/* GRN & Box Details */}
                <Card.Body className="bg-blue-50">
                <div className="px-2 mb-1">
                    <div className="mb-1 bg-warning">
                    <h3 className="my-1 text-center text-white py-2">GRN & Box Details</h3>
                    </div>
                </div>

                <Tab.Container defaultActiveKey={Object.keys(reportData.boxes_by_grn)[0]}>
                    <Nav className="w-full">
                    {Object.keys(reportData.boxes_by_grn).map((key) => (
                        <Nav.Item>
                            <Nav.Link eventKey={key} className='fs-8'>G-{key}</Nav.Link>
                        </Nav.Item>
                    ))}
                    </Nav>

                    {Object.keys(reportData.boxes_by_grn).map((key) => (
                    <Tab.Content>
                        <Tab.Pane eventKey={key}>
                            <Card className="shadow">
                                <Card.Body className="p-4">
                                    <div className="mt-2">
                                        <Row>
                                            <Col><h5 className="mb-0 text-dark">GRN ID: G-{key}</h5></Col>
                                            <Col>
                                                <h5 className="mb-0 text-dark"> Purchase order:{" "}
                                                    <strong> {reportData.boxes_by_grn[key][0].purchase_order_details.purchase_order_number} </strong>{" "}
                                                </h5>
                                            </Col>
                                            <Col>
                                                <h5 className="mb-0 text-dark"> Vendor Name:{" "}
                                                    <strong>{reportData.boxes_by_grn[key][0].purchase_order_details.vendor.name}</strong>{" "}
                                                </h5>
                                            </Col>
                                            <Col>
                                                <h5 className="mb-0 text-dark">Tax Invoice No:{" "}
                                                    <strong className={ reportData.boxes_by_grn[key][0].grn_number.vendor_tax_invoice_number ? "" : "text-red-500" } >
                                                        {reportData.boxes_by_grn[key][0].grn_number.vendor_tax_invoice_number || "N/A"}
                                                    </strong>
                                                </h5>
                                            </Col>
                                            <Col>
                                                <h5 className="mb-0 text-dark">Date:{" "}
                                                    <strong className={ reportData.boxes_by_grn[key][0].grn_number.vendor_tax_invoice_date ? "" : "text-red-500" } >
                                                        {reportData.boxes_by_grn[key][0].grn_number.vendor_tax_invoice_date || "N/A"}
                                                    </strong>
                                                </h5>
                                            </Col>

                                            <Col>
                                            <h5 className="mb-0 text-dark">Tax Invoice Attachment: </h5>{" "}
                                                {reportData.boxes_by_grn[key][0].grn_number.vendor_tax_invoice_attachment ? (
                                                    <Button className="text-primary py-2 d-flex" variant="link" title="Download Vendor Tax Invoice Attachment" onClick={() => handleDownload(`${reportData.boxes_by_grn[key][0].grn_number.vendor_tax_invoice_attachment}`, 'uploads//wms/vendor_tax_invoice')} startIcon={<FontAwesomeIcon icon={faDownload} />}> {reportData.boxes_by_grn[key][0].grn_number.vendor_tax_invoice_attachment} </Button>
                                                ) : (
                                                    <strong className="text-red-500">N/A</strong>
                                                )}
                                            </Col>
                                        </Row>


                                    <div className="mt-1">
                                        <div className="mb-1 overflow-x-auto">
                                        <table className="w-full border-collapse border border-gray-300">
                                            <thead className="bg-gray-800 text-white">
                                            <tr>
                                                <th className="p-2 border">BOX ID</th>
                                                <th className="p-2 border">Purchase Order</th>
                                                <th className="p-2 border">Location</th>
                                                <th className="p-2 border">Net WT</th>
                                                <th className="p-2 border">Gross WT</th>
                                                <th className="p-2 border">L</th>
                                                <th className="p-2 border">W</th>
                                                <th className="p-2 border">H</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {reportData.boxes_by_grn[key].map((box, index) => (
                                                <React.Fragment key={index}>
                                                <tr className={box.box_packaging_done ? "text-dark" : ""}>
                                                    <td className="p-2 border">{box.box_sys_id}</td>
                                                    <td className="p-2 border">
                                                    ({box.purchase_order_details.id}) -{" "}
                                                    {box.purchase_order_details.purchase_order_number}
                                                    </td>
                                                    <td className="p-2 border">
                                                    {box.location_details.warehouse_name} - {box.location_details.rack_number} -{" "}
                                                    {box.location_details.floor}
                                                    </td>
                                                    <td className="p-2 border">{box.net_weight}</td>
                                                    <td className="p-2 border">{box.gross_weight}</td>
                                                    <td className="p-2 border">{box.length}</td>
                                                    <td className="p-2 border">{box.width}</td>
                                                    <td className="p-2 border">{box.height}</td>
                                                </tr>
                                                <tr>
                                                    <td colSpan={8} className="p-0 border">
                                                    <table className="w-full">
                                                        <thead className="bg-gray-500 text-white">
                                                        <tr>
                                                            <th className="p-2 border">Product name</th>
                                                            <th className="p-2 border">Qty</th>
                                                            <th className="p-2 border">HSN</th>
                                                            <th className="p-2 border">HZ / NZ</th>
                                                            <th className="p-2 border">Mfg Year</th>
                                                            <th className="p-2 border">Box Content</th>
                                                        </tr>
                                                        </thead>
                                                        <tbody>
                                                        {box.products.map((product, prodIndex) => (
                                                            <tr key={prodIndex}>
                                                            <td className="p-2 border">
                                                                ({product.product_details.product_code}) -{" "}
                                                                {product.product_details.product_name}
                                                            </td>
                                                            <td className="p-2 border">{product.product_quantity}</td>
                                                            <td className="p-2 border">{product.product_hsn || ""}</td>
                                                            <td className="p-2 border whitespace-nowrap">
                                                                {product.hazardous_symbol || ""}
                                                            </td>
                                                            <td className="p-2 border">{product.manufacture_year || ""}</td>
                                                            <td className="p-2 border">{product.box_content || ""}</td>
                                                            </tr>
                                                        ))}
                                                        </tbody>
                                                    </table>
                                                    </td>
                                                </tr>
                                                </React.Fragment>
                                            ))}
                                            </tbody>
                                        </table>
                                        </div>
                                    </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Tab.Pane>
                    </Tab.Content>
                    ))}
                </Tab.Container>

                {/* Outward Details */}
                <div className="px-2 mb-1 mt-6">
                    <div className="mb-1 bg-warning">
                    <h3 className="my-1 text-center text-white py-2">Outward Details</h3>
                    </div>
                </div>

                {reportData.logistics_array.length > 0 ? (
                    <Tab.Container defaultActiveKey={reportData.logistics_array[0].outward_sys_id}>
                        <Nav className="w-full">
                            {reportData.logistics_array.map((log) => (
                                <Nav.Item>
                                    <Nav.Link eventKey={log.id} className='fs-8'>{log.outward_sys_id}</Nav.Link>
                                </Nav.Item>
                            ))}
                        </Nav>

                        {reportData.logistics_array.map((log) => (
                        <Tab.Content>
                            <Tab.Pane eventKey={log.id}>
                                <Card className="shadow">
                                    <Card.Body className="p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                        <p>
                                            <strong>Outward Date: </strong> {formatDate(log.outward_date)}
                                        </p>
                                        <p>
                                            <strong>E-way Bill Number: </strong> {log.eway_bill_number}
                                        </p>
                                        <p>
                                            <strong>Invoice Number: </strong> {log.invoice_number}
                                        </p>
                                        <p>
                                            <strong>Invoice Date: </strong> {formatDate(log.invoice_date)}
                                        </p>
                                        <p></p>
                                        <p>
                                            <strong>Marks & No. of Packages: </strong> {log.no_of_packages}
                                        </p>
                                        <p>
                                            <strong>International FFD Details: </strong> {log.ffdInternational_ffd_name} <br />
                                            {log.ffdInternational_address} <br />
                                            {log.ffdInternational_city} Pin: {log.ffdInternational_pin_code}
                                        </p>
                                        </div>
                                        <div>
                                        <p>&nbsp;</p>
                                        <p>
                                            <strong>E-way Bill Date: </strong> {formatDate(log.eway_bill_date)}
                                        </p>
                                        <p>
                                            <strong>Total Net Weight: </strong> {log.total_net_weight}
                                        </p>
                                        <p>
                                            <strong>Total Gross Weight: </strong> {log.total_gross_weight}
                                        </p>
                                        <p>
                                            <strong>Total Volume Weight: </strong> {log.total_value_weight}
                                        </p>
                                        <p>
                                            <strong>Domestic FFD Details: </strong>
                                            {log.ffdDomestic_ffd_name}
                                            <br />
                                            {log.ffdDomestic_address}
                                            <br />
                                            {log.ffdDomestic_city} Pin: {log.ffdDomestic_pin_code}
                                        </p>
                                        </div>

                                        {log.logistics && (
                                        <div className="col-span-2 grid grid-cols-2 md:grid-cols-6 gap-2">
                                            {log.pickup_proof && (
                                            <Button variant="success" className="mt-2">
                                                Pickup Proof &nbsp; &nbsp;<i className="fa fa-download"></i>
                                            </Button>
                                            )}
                                            {log.e_way_bill && (
                                            <Button variant="success" className="mt-2">
                                                E Way Bill &nbsp; &nbsp;<i className="fa fa-download"></i>
                                            </Button>
                                            )}
                                            {log.delivery_challan && (
                                            <Button variant="success" className="mt-2">
                                                Delivery Challan &nbsp; &nbsp;<i className="fa fa-download"></i>
                                            </Button>
                                            )}
                                            {log.id_card && (
                                            <Button variant="success" className="mt-2">
                                                Delivery Boy Id &nbsp; &nbsp;<i className="fa fa-download"></i>
                                            </Button>
                                            )}
                                            {log.delivery_boy_photo && (
                                            <Button variant="success" className="mt-2">
                                                Delivery Boy Photo &nbsp; &nbsp;<i className="fa fa-download"></i>
                                            </Button>
                                            )}
                                            {log.kyc && (
                                            <Button variant="success" className="mt-2">
                                                Delivery Boy Kyc &nbsp; &nbsp;<i className="fa fa-download"></i>
                                            </Button>
                                            )}
                                        </div>
                                        )}
                                    </div>
                                    </Card.Body>
                                </Card>
                            </Tab.Pane>
                        </Tab.Content>
                    ))}
                    </Tab.Container>
                ) : (
                    <div className="mb-2 text-center">
                    <h4 className="text-red-500">Outward details not found</h4>
                    </div>
                )}

                {/* PSD Details */}
                <div className="px-2 mb-1 mt-6">
                    <div className="mb-1 bg-warning">
                    <h3 className="my-1 text-center text-white py-2">PSD Details</h3>
                    </div>
                </div>

                {reportData.regulatory_array.length > 0 ? (
                    <Tab.Container defaultActiveKey={reportData.regulatory_array[0].psd_sys_id}>
                        <Nav className="w-full">
                            {reportData.regulatory_array.map((reg) => (
                                <Nav.Item>
                                    <Nav.Link eventKey={reg.id} className='fs-8'>{reg.psd_sys_id}</Nav.Link>
                                </Nav.Item>
                            ))}
                        </Nav>

                    {reportData.regulatory_array.map((reg) => (
                        <Tab.Content>
                            <Tab.Pane eventKey={reg.id}>
                                <Card className="shadow">
                                    <Card.Body className="p-4">
                                    {reg.regulation ? (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <p>
                                            <strong>AWB No: </strong> {reg.awb_no}
                                            </p>
                                            <p>
                                            <strong>Shipping Bill No: </strong> {reg.shipping_bill_no}
                                            </p>
                                            <p>
                                            <strong>EGM No: </strong> {reg.egm_no}
                                            </p>
                                        </div>
                                        <div>
                                            <p>
                                            <strong>AWB Date: </strong> {reg.awb_date ? formatDate(reg.awb_date) : ""}
                                            </p>
                                            <p>
                                            <strong>Shipping Bill Date: </strong> {formatDate(reg.shipping_bill_date)}
                                            </p>
                                            <p>
                                            <strong>EGM Date: </strong> {formatDate(reg.egm_date)}
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                            {reg.invoice && (
                                            <Button variant="success" className="mt-2">
                                                Invoice &nbsp;&nbsp;<i className="fa fa-download"></i>
                                            </Button>
                                            )}
                                            {reg.awb && (
                                            <Button variant="success" className="mt-2">
                                                AWB / BL &nbsp;&nbsp;<i className="fa fa-download"></i>
                                            </Button>
                                            )}
                                            {reg.shipping_bill && (
                                            <Button variant="success" className="mt-2">
                                                Shipping Bill &nbsp;&nbsp;<i className="fa fa-download"></i>
                                            </Button>
                                            )}
                                            {reg.packing_list && (
                                            <Button variant="success" className="mt-2">
                                                Packing List &nbsp;&nbsp;<i className="fa fa-download"></i>
                                            </Button>
                                            )}
                                            {reg.other && (
                                            <Button variant="success" className="mt-2">
                                                Other &nbsp;&nbsp;<i className="fa fa-download"></i>
                                            </Button>
                                            )}
                                        </div>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                        <h4 className="text-red-500">Regulatory Dashboard details not found</h4>
                                        </div>
                                    )}
                                    </Card.Body>
                                </Card>
                            </Tab.Pane>
                        </Tab.Content>
                    ))}
                    </Tab.Container>
                ) : (
                    <div className="mb-2 text-center">
                    <h4 className="text-red-500">PSD details not found</h4>
                    </div>
                )}

                {/* EBRC Details */}
                <div className="px-2 mb-1 mt-6">
                    <div className="mb-1 bg-warning">
                    <h3 className="my-1 text-center text-white py-2">EBRC Details</h3>
                    </div>
                </div>

                {reportData.invoices.length > 0 && reportData.invoices.some((inv) => inv.ebrc) ? (
                    reportData.invoices.map(
                    (inv, index) =>
                        inv.ebrc && (
                        <div key={index}>
                            <p>
                            <strong>e Brc Number:</strong> {inv.ebrc.e_brc_no}
                            </p>
                            <p>
                            <strong>e Brc Date:</strong> {formatDate(inv.ebrc.e_brc_date)}
                            </p>
                            <br />
                        </div>
                        ),
                    )
                ) : (
                    <div className="mb-2 text-center">
                    <h4 className="text-red-500">EBRC details not found</h4>
                    </div>
                )}
                </Card.Body>
            </Card>
            </div>
        )}
        </div>
        <ToastContainer className='py-0' />
        </>
    )
}

