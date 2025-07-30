import React, { useEffect, useState } from 'react';
import { Form, Card, Row, Col, Alert } from 'react-bootstrap';
import { faPlus, faCaretLeft, faTrash, faCheck, faDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../../components/base/Button';
import axiosInstance from '../../../axios';
import swal from 'sweetalert';
import { useAuth } from '../../../AuthContext';
import ReactSelect from '../../../components/base/ReactSelect';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify";
import Dropzone from '../../../components/base/Dropzone';
import { downloadFile } from '../../../helpers/utils';

interface ProductOption {
    value: number;
    label: string;
}
interface IncoTermData{
    id: number;
    inco_term: string;
}
interface ConsigneeData{
    id: number;
    contact_person: string;
}
interface IrmOptionType {
    value: string;
    label: string;
}
interface BusinessTaskListingOptions {
    value: string;
    label: string;
}
interface FfdData {
    id: number;
    ffd_name: string;
}
interface BTListingData {
    id: number;
    customer_name: string;
}
interface PiListingData {
    id: number;
    pi_number: string;
    pi_date: string;
}
interface QuotationData {
    id: number;
    pi_number: string;
}
interface IrmConsignees {
    id: number;
    name: string;
    customer_id: number;
}
interface Props {
    id: number;
    consignees: IrmConsignees[];
}
interface ProductsData {
    id: number;
    product_code: string;
    product_name: string;
}
interface IrmsData {
    id: number;
    irm_sys_id: string;
    reference_no: string;
    remittance_date: string;
    currency_id: string;
    received_amount: string;
    outstanding_amount: string;
    buyer_id: string;
    bank_id: string;
    currency: {id: number; name: string; symbol: string; };
    buyer: { id: number; name: string; };
    bank: { id: number; bank_name: string; };
}
interface itemData{
    inv_prod_id: number;
    prod_id: number;
    title: string;
    printable_description: string;
    hsn_code_id: number;
    quantity: number;
    unit: string;
    rate: number;
    amount: number;
}
interface InvoiceWeight{
    id: number;
    invoice_id: number;
    net_wt: number;
    gross_wt: number;
    vol_wt: number;
    noofboxes: number;
    l_wt: number;
    b_wt: number;
    h_wt: number;
}
interface irmDbData {
    irm_pay_history_id: number;
    buyer_id: number;
    invoice_amount: number;
    irm_id: number;
    reference_no: number;
    remittance_date: string;
    currency_id: number;
    currency_name: string;
    received_amount: number;
    outstanding_amount: number;
    buyer_name: string;
    consignee_id: number;
    consignee_name?: string;
}
interface FormData {
    id: number | undefined;
    currency: string;
    total_received_irm_amount: number;
    remmittance_value: number;
    exchange_rate: number | undefined;
    inco_term_id: number | undefined;
    inco_term: IncoTermData | null;
    shipment_type: string;
    invoice_number: string;
    sli_number: string;
    dc_number: string;
    invoice_date: string;
    business_task: BTListingData | null;
    business_task_id: '';
    bank_id: number;
    bank_name: string;
    ad_code: string;
    payment_terms: string;
    nature_of_payment: string;
    quotation_id: number;
    quotation: { id: number; pi_number: string; } | null;
    po_number: string;
    po_date: string;
    port_of_loading: string;
    port_of_discharge: string;
    final_destination: string;
    origin_country: string;
    pre_carriage_by: string;
    placereceiptprecarrier: string;
    vessel_no: string;
    exporter_type: string;
    domestic_ffd_id: number;
    ffd_domestic: { id: number; ffd_name: string; } | null;
    international_ffd_id: number;
    ffd_international: { id: number; ffd_name: string; } | null;
    pickupreferencenumber: string;
    remarks: string;
    tracking_or_awb_number: string;

    exw_value: number;
    insurance: number;
    freight_weight: number;
    total_addition: number;
    discount: number;
    commission: number;
    total_deduction: number;
    grand_total: number;
    volum_range: number;
    total_net_weight: number;
    total_gross_weight: number;
    total_value_weight: number;
    no_of_packages: number;

    lut_export_under_bond: string;
    exportpaymentofigst: string;
    ein_no: string;
    free_trade_sample: string;
    non_drawback: string;
    duty_free_commercial: string;
    under_lut: string;
    eou_shipping_bill: string;
    special_instuction: string;
    duty_drawback: string;
    epcg_shipping_bill: string;
    licenceshippingbill: string;
    rebate_of_state_levies: string;
    repair_and_return: string;
    advance_authorization: string;
    drwaback_or_rosctl: string;
    epcg: string;
    nfei: string;
    evd: string;
    jobbing: string;
    re_export: string;
    sdf_fema_declaration: string;
    drawback_epcg: string;
    eou: string;
    mesi: string;
    any_other: string;
    nature_of_transaction: string;
    method_of_valuation: string;
    buyer_saller_related: string;
    buyersallerprice: string;
    dbk_sl_no: string;
    regnnoanddtofepcglic: string;
    regnnodtepcglicregcopy: string;
    noadditionaldocrequire: string;
    orginable: string;
    invoice_copies: string;
    packing_list_copies: string;
    non_dg_declaration: string;
    lab_analysis_report: string;
    msds: string;
    phytosanitary_cert: string;
    visa_aepc_endorsement: string;
    letter_to_dc: string;
    gspcertificateoforigin: string;
    bank_certificate: string;
    annexure_a: string;
    invitemnumberregno: string;
    invitemnumberregnodate: string;
    authorization_epcg: string;
    preferentialagreement: string;
    standardunitdetails: string;
    state_of_origin_item: string;
    districtoforiginitem: string;
    advathoepcddtlregno: string;
    extratermsconditions: string;
    allSymbol: string;
}

interface InvoiceAttachments {
    id: number;
    invoice_id: string;
    attachment_name: string;
    created_at: string;
    updated_at: string;
}

const InvoiceForm = () => {
    const [custData, setUserData] = useState<FormData>({
        id: undefined,
        currency: '',
        total_received_irm_amount: 0,
        remmittance_value: 0,
        exchange_rate: undefined,
        inco_term_id: undefined,
        inco_term: null,
        shipment_type: '',
        invoice_number: '',
        sli_number: '',
        dc_number: '',
        invoice_date: '',
        business_task: null,
        business_task_id: '',
        bank_id: 0,
        bank_name: '',
        ad_code: '',
        payment_terms: '',
        nature_of_payment: '',
        quotation_id: 0,
        quotation: null,
        po_number: '',
        po_date: '',
        port_of_loading: '',
        port_of_discharge: '',
        final_destination: '',
        origin_country: '',
        pre_carriage_by: '',
        placereceiptprecarrier: '',
        vessel_no: '',
        exporter_type: 'Merchant',
        ffd_domestic: null,
        domestic_ffd_id: 0,
        ffd_international: null,
        international_ffd_id: 0,
        pickupreferencenumber: '',
        remarks: '',
        tracking_or_awb_number: '',

        exw_value: 0,
        insurance: 0,
        freight_weight: 0,
        total_addition: 0,
        discount: 0,
        commission: 0,
        total_deduction: 0,
        grand_total: 0,
        volum_range: 5000,
        total_net_weight: 0,
        total_gross_weight: 0,
        total_value_weight: 0,
        no_of_packages: 0,

        lut_export_under_bond: 'Yes',
        exportpaymentofigst: 'Letter Of Undertaking',
        ein_no: '',
        free_trade_sample: 'No',
        non_drawback: 'No',
        duty_free_commercial: 'No',
        under_lut: 'Yes',
        eou_shipping_bill: 'No',
        special_instuction: 'Dont forget to mention Buyer , Consignee Name on EP Copy , AWB/BL',
        duty_drawback: 'No',
        epcg_shipping_bill: 'No',
        licenceshippingbill: 'No',
        rebate_of_state_levies: 'No',
        repair_and_return: 'No',
        advance_authorization: 'No',
        drwaback_or_rosctl: 'No',
        epcg: 'No',
        nfei: 'No',
        evd: 'Yes',
        jobbing: 'No',
        re_export: 'No',
        sdf_fema_declaration: 'Yes',
        drawback_epcg: 'No',
        eou: 'No',
        mesi: 'No',
        any_other: 'No',
        nature_of_transaction: 'Sale on Consignment',
        method_of_valuation: 'Rule 4',
        buyer_saller_related: 'No',
        buyersallerprice: 'No',
        dbk_sl_no: '',
        regnnoanddtofepcglic: '',
        regnnodtepcglicregcopy: '',
        noadditionaldocrequire: '',
        orginable: '',
        invoice_copies: 'Yes',
        packing_list_copies: 'Yes',
        non_dg_declaration: 'Yes',
        lab_analysis_report: 'No',
        msds: 'No',
        phytosanitary_cert: 'No',
        visa_aepc_endorsement: 'No',
        letter_to_dc: 'No',
        gspcertificateoforigin: 'No',
        bank_certificate: 'No',
        annexure_a: 'Yes',
        invitemnumberregno: '',
        invitemnumberregnodate: '',
        authorization_epcg: '',
        preferentialagreement: '',
        standardunitdetails: '',
        state_of_origin_item: '',
        districtoforiginitem: '',
        advathoepcddtlregno: '',
        extratermsconditions: '',
        allSymbol: '',
    });
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    const [saveTotal, setSaveTotal] = useState(false);
    const [irmData, setIrmData] = useState<IrmsData[]>([]);

    const [pisData, setPisData] = useState<InvoiceAttachments[]>([]);
    const [tpsData, setTpsData] = useState<InvoiceAttachments[]>([]);
    const [fisData, setFisData] = useState<InvoiceAttachments[]>([]);
    const [lcsData, setLcsData] = useState<InvoiceAttachments[]>([]);
    const [besData, setBesData] = useState<InvoiceAttachments[]>([]);
    const [vesData, setVesData] = useState<InvoiceAttachments[]>([]);
    const [posData, setPosData] = useState<InvoiceAttachments[]>([]);

    const [productsData, setProductsData] = useState<ProductsData[]>([]);
    const [incoTermData, setIncoTermData] = useState<IncoTermData[]>([]);
    const [businessTaskListingData, setBusinessTaskListingData] = useState<BusinessTaskListingOptions[]>([]);
    const [selectedBtId, setSelectedBtId] = useState([]);
    const [piListingData, setPiListingData] = useState<PiListingData[]>([]);
    const [domesticFfdData, setDomesticFfdData] = useState<FfdData[]>([]);
    const [internationalFfdData, setInternationalFfdData] = useState<FfdData[]>([]);
    const [consigneeData, setConsigneeData] = useState<ConsigneeData[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedIrm, setSelectedIrm] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    type FileAttachmentKeys = 'proforma_invoice_attachment' | 'tax_purchase_attachment' | 'firc_attachment' | 'purchase_order_attachment' | 'legal_contract_attachment' | 'buyers_email_attachment' | 'vendors_email_attachment';
    const [fileAttachments, setFileAttachments] = useState<Record<FileAttachmentKeys, File[]>>({
        proforma_invoice_attachment: [],
        tax_purchase_attachment: [],
        firc_attachment: [],
        purchase_order_attachment: [],
        legal_contract_attachment: [],
        buyers_email_attachment: [],
        vendors_email_attachment: [],
    });
    const [fileValidations, setFileValidations] = useState<{ proforma_invoice_attachment?: string, tax_purchase_attachment?: string, firc_attachment?: string }>({});
    const [editFetchError, setEditFetchError] = useState<string | null>(null);
    const [items, setItems] = useState<itemData[]>([]);
    const [invWeight, setInvWeight] = useState<InvoiceWeight[]>([]);
    const [irmArray, setIrmArray] = useState({ buyer_id: 0, invoice_amount: 0, irm_id: 0, reference_no: 0, remittance_date: '', currency: { id: 0, name: '', symbol: '' }, currency_name: '', received_amount: 0, outstanding_amount: 0, buyer_name: '', consignees: [{ id: 0, name: '', customer_id: 0 }], consignee_id: 0, bank_id: 0, bank:{ id: 0, bank_name: '', ad_code: '' } });
    const [addedIrm, setAddedIrm] = useState<irmDbData[]>([]);
    const [selectedProduct, setSelectedProduct] = useState({ inv_prod_id: 0, prod_id: 0, title: '', printable_description: '', hsn_code_id: 0, quantity: 1, unit: '', rate: 0, amount: 0 });
    const [selectedWeight, setSelectedWeight] = useState({ id: 0, invoice_id: 0, net_wt: 0, gross_wt: 0, vol_wt: 0, noofboxes: 0, l_wt: 0, b_wt: 0, h_wt: 0 });
    const [packages, setPackages] = useState<InvoiceWeight[]>([]);
    const { empData, userPermission } = useAuth(); //check userRole & permissions
    const { invId } = useParams();
    const navigate = useNavigate();


    //fetch all listing data
    useEffect(() => {
        const today = new Date(); // Get today's date
        const formattedDate = today.toISOString().split('T')[0]; // Format it to YYYY-MM-DD

        const fetchNextInvoiceId = async () => {
            try {
                const response = await axiosInstance.get('/getNextInvoiceId');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data = await response.data;
                setUserData({ ...custData, invoice_number: data, invoice_date: formattedDate});
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };
        const fetchIRM = async () => {
            try {
                const response = await axiosInstance.get('/irmHavingOutstandingAmount');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: IrmsData[] = await response.data;
                setIrmData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };
        const fetchProducts = async () => {
            try {
                const response = await axiosInstance.get('/productList');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: ProductsData[] = await response.data;
                setProductsData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };
        const fetchBusinessTaskListing = async () => {
            try {
                const response = await axiosInstance.get(`/btDropdownListing`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data = response.data;
                const bt_Data = data.map((option: BTListingData) => (
                    { value: Number(option.id), label: `${option.id} - (${option.customer_name})` }
                ))
                // setBtListingData(data);
                setBusinessTaskListingData(bt_Data);
            } catch (err: any) {
                setError(err.data.message);
            }
        };
        const fetchPiListing = async () => {
            try {
                const response = await axiosInstance.get(`/piListing`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: PiListingData[] = response.data;
                setPiListingData(data);
            } catch (err: any) {
                setError(err.data.message);
            }
        };
        const fetchIncoTerms = async () => {
            try {
                const response = await axiosInstance.get(`/incoTermsListing`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: IncoTermData[] = response.data;
                setIncoTermData(data);
            } catch (err: any) {
                setError(err.data.message);
            }
        };
        const fetchFfd = async () => {
            try {
                const response = await axiosInstance.get(`/ffdListing`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data_dom: FfdData[] = response.data.internationalFfds;
                const data_intl: FfdData[] = response.data.domesticFfds;
                setDomesticFfdData(data_dom);
                setInternationalFfdData(data_intl);
            } catch (err: any) {
                setError(err.data.message);
            }
        };

        fetchIRM();
        fetchBusinessTaskListing();
        fetchPiListing();
        fetchProducts();
        fetchIncoTerms();
        fetchFfd();
        if(!isEditing) {
            fetchNextInvoiceId();
        }
    }, []);

    //map IRM data
    const mapIrmDbData = (data: any): irmDbData => {
        return {
            irm_pay_history_id: data.id,
            buyer_id: data.buyer_id,
            invoice_amount: data.invoice_amount,
            irm_id: data.irm_id,
            reference_no: data.reference_no,
            remittance_date: data.remittance_date,
            currency_id: data.currency_id,
            currency_name: data.currency.symbol,
            received_amount: data.received_amount,
            outstanding_amount: data.outstanding_amount,
            buyer_name: data.buyer.name,
            consignee_id: data.consignee_id,
            consignee_name: data.consignee?.name
        };
    };
    //map Products data
    const mapProductsDbData = (data: any): itemData => {
        return {
            inv_prod_id: data.id,
            prod_id: data.product_id,
            title: data.product_name,
            printable_description: data.description,
            hsn_code_id: data.hsn,
            quantity: data.quantity,
            unit: data.unit,
            rate: data.rate,
            amount: data.amount
        };
    };
    //map Weights data
    const mapWeightsDbData = (data: any): InvoiceWeight => {
        return {
            id: data.id,
            invoice_id: data.invoice_id,
            net_wt: data.net_wt,
            gross_wt: data.gross_wt,
            vol_wt: data.vol_wt,
            noofboxes: data.noofboxes,
            l_wt: data.l_wt,
            b_wt: data.b_wt,
            h_wt: data.h_wt
        };
    };

    //in Edit mode this useEffect will fetch all invoice data
    useEffect(() => {
        if(invId){
            const fetchQuotation = async () => {
                try {
                    const response =  await axiosInstance.get(`/invoices/${invId}`);

                    if (response.status !== 200) {
                        throw new Error('Failed to fetch data');
                    }
                    if (response.status === 200) {
                        setIsEditing(true);
                        const data = await response.data;

                        setUserData(data.invoice);
                        setPisData(data.pis);
                        setTpsData(data.tps);
                        setFisData(data.fis);
                        setLcsData(data.lcs);
                        setBesData(data.bes);
                        setVesData(data.ves);
                        setPosData(data.pos);

                        const irm_db_data: irmDbData[] = data.invoiceIrms.map(mapIrmDbData);
                        setAddedIrm(irm_db_data);
                        const prod_db_data: itemData[] = data.invoiceProducts.map(mapProductsDbData);
                        setItems(prod_db_data);
                        const weights_db_data: InvoiceWeight[] = data.invoiceWeights.map(mapWeightsDbData);
                        setPackages(weights_db_data);

                    }
                } catch (error: any) {
                    if(error.status === 404){
                        toast(error.data.message);
                        const timer = setTimeout(() => {
                            navigate(`/invoices`);
                        }, 5000);
                    } else {
                        console.error('Error fetching quotations data:', error)
                    }

                } finally {

                }
            }
            fetchQuotation();
        }
    }, [invId]);

    useEffect(() => {
        if((custData.business_task_id != "" || custData.business_task_id != null) && businessTaskListingData.length > 0){
            const modes = custData.business_task_id.split(',');
            // Map the modes to the corresponding shipment options
            const selected = businessTaskListingData.filter(option => modes.includes(option.value.toString()));
            // Set the selected options state
            setSelectedBtId(selected);
        }
    }, [businessTaskListingData, custData.business_task_id]);

    const handleInvoiceList = () => {
        navigate(`/invoices`);

    }
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserData({ ...custData, [name]: value });
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUserData({ ...custData, [name]: value });
    };

    const handleIrmConsigneeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setIrmArray({ ...irmArray, [name]: value });
    };

    const handleIrmInputChange = (selected: unknown | null) => {
        if (selected !== null) {
            const irm = selected as ProductOption; // Type assertion
            setSelectedIrm(irm.value);
            axiosInstance.get(`/getIrmById/${irm.value}`)
                .then(response => {
                    let irm_resp = response.data;
                    setIrmArray({ buyer_id: irm_resp.buyer_id,
                        invoice_amount: irm_resp.invoice_amount,
                        irm_id: irm_resp.id,
                        reference_no: irm_resp.reference_no,
                        remittance_date: irm_resp.remittance_date,
                        currency: irm_resp.currency,
                        currency_name: irm_resp.currency.symbol,
                        received_amount: irm_resp.received_amount,
                        outstanding_amount: irm_resp.outstanding_amount,
                        buyer_name: irm_resp.buyer.name,
                        consignees: irm_resp.consignees,
                        consignee_id: 0,
                        bank_id: irm_resp.bank_id,
                        bank: irm_resp.bank
                    });
                }).catch(error => {
                    swal("Error!", error.data.message, "error")
                });
        }
        setTimeout(() => {
            setSelectedIrm(null)
        }, 2000);
    }
    const addIrmRow = () => {
        const isRepeatedIrm = addedIrm.some(item => item.irm_id == irmArray.irm_id);
        if (isRepeatedIrm) {
            toast("IRM already added");
            return;
        }
        if(addedIrm.length > 0 && addedIrm[0].currency_name !== irmArray.currency_name){
            toast("All IRMs should be of same currency");
            return;
        }
        if(addedIrm.length > 0 && addedIrm[0].buyer_id !== irmArray.buyer_id){
            toast("Buyer must be same");
            return;
        }
        if(addedIrm.length > 0 && addedIrm[addedIrm.length - 1].received_amount < irmArray.received_amount){
            toast("Received amount cannot be greater than selected IRM received amount. Make sure to add IRMs in decreasing order of received amount.");
            return;
        }

        const consigneeName = getConsigneeNameById({ consignees: irmArray.consignees, id: Number(irmArray.consignee_id) });

        setAddedIrm([...addedIrm, {irm_pay_history_id: 0,
            buyer_id: irmArray.buyer_id,
            invoice_amount: irmArray.invoice_amount,
            irm_id: irmArray.irm_id,
            reference_no: irmArray.reference_no,
            remittance_date: irmArray.remittance_date,
            currency_id: irmArray.currency.id,
            currency_name: irmArray.currency_name,
            received_amount: irmArray.received_amount,
            outstanding_amount: irmArray.outstanding_amount,
            buyer_name: irmArray.buyer_name,
            consignee_id: irmArray.consignee_id,
            consignee_name: consigneeName
        }]);

        setUserData({ ...custData, currency : irmArray.currency.name, bank_id: irmArray.bank.id, bank_name: irmArray.bank.bank_name, ad_code: irmArray.bank.ad_code });
        setIrmArray({ buyer_id: 0,
            invoice_amount: 0,
            irm_id: 0,
            reference_no: 0,
            remittance_date: '',
            currency:{ id:0,
            name: '',
            symbol: '' },
            currency_name: '',
            received_amount: 0,
            outstanding_amount: 0,
            buyer_name: '',
            consignees: [],
            consignee_id: 0,
            bank_id: 0,
            bank:{ id: 0,
            bank_name: '',
            ad_code: ''
        } });
    };

    function getConsigneeNameById({ consignees, id }: Props): string | undefined {
        const consignee = consignees.find((consignee) => {
            return consignee.id === id
        });
        return consignee?.name;
    }

    const removeIrmRow = (index: number) => {
        const newItems = addedIrm.filter((_, i) => i !== index);
        setAddedIrm(newItems);
        if(isEditing){
            toast(`Do not forget to press 'Update' button before leaving this page.`);
        }
    };

    useEffect(() => {
        const totalReceivedAmount = addedIrm.reduce((accumulator, currentValue) => {
            return accumulator + currentValue.received_amount;
        }, 0);

        const totalOutstandingAmount = (isEditing) ? custData.remmittance_value : addedIrm.reduce((accumulator, currentValue) => {
            return accumulator + currentValue.outstanding_amount;
        }, 0);

        if(addedIrm.length == 0){
            setUserData(prev => ({
                ...prev,
                currency: '',
                bank_id: 0,
                bank_name: '',
                ad_code: '',
            }));
        }

        setUserData({ ...custData, total_received_irm_amount: totalReceivedAmount, remmittance_value: totalOutstandingAmount });
    }, [addedIrm]);

    const handleDrop = (acceptedFiles: File[], fileName: FileAttachmentKeys) => {
        // Instead of creating a FileList, just update the files array
        setFileAttachments((prevState) => ({
            ...prevState,
            [fileName]: acceptedFiles, // acceptedFiles is already an array of File objects
        }));

        setFileValidations((prevErrors) => ({ ...prevErrors, [fileName]: undefined }));
    };

    const handleFileRemove = (index: number, fileName: FileAttachmentKeys) => {
        const updatedFiles = fileAttachments[fileName].filter((_, i) => i !== index);

        setFileAttachments((prevState) => ({
            ...prevState,
            [fileName]: updatedFiles, // Update the files with the new array
        }));
    };

    const handleIncoSelect = (selectedOption: any) => {
        if (selectedOption) {
            setUserData(prev => ({
                ...prev,
                inco_term: { id: selectedOption.value, inco_term: selectedOption.label },
                inco_term_id: selectedOption.value
            }));
        }
    };

    const handleDomesticFfdSelect = (selectedOption: any) => {
        if (selectedOption) {
            setUserData(prev => ({
                ...prev,
                ffd_domestic: { id: selectedOption.value, ffd_name: selectedOption.label },
                domestic_ffd_id: selectedOption.value
            }));
        }
    };

    const handleInternationalFfdSelect = (selectedOption: any) => {
        if (selectedOption) {
            setUserData(prev => ({
                ...prev,
                ffd_international: { id: selectedOption.value, ffd_name: selectedOption.label },
                international_ffd_id: selectedOption.value
            }));
        }
    };

    const handleProformaInvoiceSelect = (selectedOption: any) => {
        if (selectedOption) {
            setUserData(prev => ({
                ...prev,
                quotation: { id: selectedOption.value, pi_number: selectedOption.label },
                quotation_id: selectedOption.value,
                po_number: selectedOption.label,
                po_date: selectedOption.q_date
            }));
        } else {
            setUserData({ ...custData, quotation: null, quotation_id: 0 });
        }
    };

    const handleBTselection = (selectedOptions: any) => {
        if(addedIrm.length < 1){
            toast('Add IRM in the Selected IRM list first');
            return;
        }

        let selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
        if ((selectedOptions ? selectedOptions.length > 0 : false)) {

            axiosInstance.get(`/getTaskIdBuyer/${selectedValues[selectedValues.length - 1]}`)
            .then(response => {
                if(addedIrm[0].buyer_id !== response.data.id){
                    toast('BT customer name does not match with selected IRM buyer name');
                    return;
                } else {
                    setSelectedBtId(selectedOptions);
                }
            }).catch(err => {
                toast(err.data.message);
            });
        } else {
            setSelectedBtId([]);
        }
    }

    const handleProductInputChange = (selected: unknown | null, fieldName: string) => {
        // const { name, value } = e.target;
        if (selected !== null) {
            const product = selected as ProductOption; // Type assertion
            axiosInstance.get(`/getProductRate/${product.value}`)
                .then(response => {
                    let qty = 1;
                    let rate = response.data.product_base_price == '' ? 0 : Number(response.data.product_base_price);
                    let tax = response.data.gst_percent_id == '' ? 0 : Number(response.data.gst_percent.percent);
                    let taxAmount = 0;
                    let rateWithTax = 0;
                    let amount = 0;
                    if(rate >= 0) {
                        taxAmount = (rate * tax) / 100;
                    } else {
                        tax = 0;
                        taxAmount = 0;
                    }
                    rateWithTax = Number((rate + taxAmount).toFixed(2));
                    amount = rateWithTax;
                    setSelectedProduct({
                        inv_prod_id: 0,
                        prod_id: product.value,
                        title: product.label,
                        printable_description: response.data.printable_description,
                        hsn_code_id: response.data.hsn_code_id,
                        unit: '',
                        quantity: qty,
                        rate: rate,
                        amount: amount
                    });
                });
        } else {
            console.log('No product selected');
        }
    }

    const addItemRow = () => {
        const isRepeatedProduct = items.some(item => item.prod_id == selectedProduct.prod_id);
        if (isRepeatedProduct) {
            toast("Product already added");
            return;
        }
        if(selectedProduct.rate <= 0) {
            toast.error('Please mention product amount');
            return;
        }
        setItems([...items, { inv_prod_id: 0, prod_id: selectedProduct.prod_id, title: selectedProduct.title, printable_description: selectedProduct.printable_description, hsn_code_id: selectedProduct.hsn_code_id, quantity: selectedProduct.quantity, rate: selectedProduct.rate,  unit: selectedProduct.unit, amount: selectedProduct.amount }]);
        setSelectedProduct({ inv_prod_id: 0, prod_id: 0, title: '', printable_description: '', hsn_code_id: 0, quantity: 1, rate: 0, unit: '', amount: 0 });
        handleProductInputChange(null, 'product_id');
        calculateTotals([...items, {
            inv_prod_id: 0,
            prod_id: selectedProduct.prod_id,
            title: selectedProduct.title,
            printable_description: selectedProduct.printable_description,
            quantity: selectedProduct.quantity,
            unit: selectedProduct.unit,
            rate: selectedProduct.rate,
            hsn_code_id: selectedProduct.hsn_code_id,
            amount: selectedProduct.amount
        }]);
    };

    useEffect(() => {
        if(isEditing) {
            saveTotalsInvoice();
        }
    }, [saveTotal]);

    async function saveTotalsInvoice() {
        const apiCall = axiosInstance.post(`/updateInvoice`, {
            ...custData,
        });
        apiCall.then((response) => {
            toast("Totals updated successfully");
        })
        .catch(error => swal("Error!", error.data.message, "error"));
    }

    //remove products from invoice
    const removeItemRow = (index: number) => {
        //in case of edit mode directly delete product from database with confirmation
        if(isEditing && items[index].inv_prod_id != 0){
            swal({
                title: "Are you sure?",
                text: "Once deleted, you will not be able to recover this record!",
                icon: "warning",
                buttons: {
                    confirm: {
                        text: "Delete",
                        value: true,
                        visible: true,
                        className: "",
                        closeModal: true
                    },
                    cancel: {
                        text: "Cancel",
                        value: null,
                        visible: true,
                        className: "",
                        closeModal: true,
                    }
                },
                dangerMode: true,
            })
            .then((willDelete) => {
                if (willDelete) {
                    axiosInstance.delete(`/deleteInvoiceProduct`, {
                        data: {
                            id: items[index].inv_prod_id
                        }
                    })
                    .then(response => {
                        swal("Success!", response.data.message, "success");
                        const newItems = items.filter((_, i) => i !== index);
                        setItems(newItems);
                        //re-calculate totals after product removed
                        calculateTotals(newItems);
                        setSaveTotal(prev => !prev);
                    })
                    .catch(error => {
                        swal("Error!", error.data.message, "error");
                    });
                } else {
                    swal("Your record is safe!");
                }
            });
        } else {
            const newItems = items.filter((_, i) => i !== index);
            setItems(newItems);
            if(isEditing){
                toast(`Do not forget to press 'Update' button before leaving this page.`);
            }

            calculateTotals(newItems);
        }
    };

    const calculateTotals = (newItems: itemData[]) => {

        let productsTotal = 0;
        let totalAddition = 0;
        let totalDeduction = 0;
        let grandTotal = 0;
        let insurance = Number(custData.insurance);
        let freight_value = Number(custData.freight_weight);
        let discount = Number(custData.discount);
        let commission = Number(custData.commission);
        //calculate total from items array
        newItems.map(item => {
            productsTotal += Number(item.amount);
        });
        totalAddition = productsTotal + insurance + freight_value;
        totalDeduction = discount + commission;
        grandTotal =  totalAddition - totalDeduction;

        let totalIrmReceived = 0;
        addedIrm.map(irmData => {
            totalIrmReceived += Number(irmData.received_amount);
        });

        let shipmentType = (productsTotal >= totalIrmReceived) ? 'Full' : 'Partial';

        setUserData(newTotal =>({
            ...newTotal,
            shipment_type: shipmentType, exw_value: Number(productsTotal.toFixed(2)), total_addition: Number(totalAddition.toFixed(2)), total_deduction: Number(totalDeduction.toFixed(2)), grand_total: Number(grandTotal.toFixed(2))
        }));
    };

    useEffect(()=>{
        calculateTotals(items);
    },[ custData.insurance,custData.freight_weight,custData.discount,custData.commission ]);

    //on Quantity & Rate field change
    const handleItemInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        if(selectedProduct.title == ''){
            toast("Select a product first.");
            return;
        }
        if(name == 'quantity' && Number(value) < 1) {
            toast("Quantity cannot be less than 1.");
            return;
        }
        // Update the selected product state first
        const updatedProduct = { ...selectedProduct, [name]: value };

        // Now do the calculation after updating the state
        let qty = updatedProduct.quantity;
        let rate = updatedProduct.rate;
        let amount = 0;

        amount = Number(((qty * rate)).toFixed(2));

        // Finally, update the state with the new values
        setSelectedProduct({
            ...updatedProduct,
            amount: amount
        });
    };

    //on Weights & Volume Range field change
    const handleWeightInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target
        const numValue = Number.parseFloat(value) || 0

        // Create new state with updated value
        const newWeight = {
            ...selectedWeight,
            [name]: numValue,
        }

        // Validate net weight vs gross weight
        if (name === "net_wt" && numValue > selectedWeight.gross_wt && selectedWeight.gross_wt !== 0) {
            toast("Net weight cannot be greater than gross weight");
            return;
        }

        // Update state
        setSelectedWeight(newWeight)

        // Calculate volume weight if relevant fields are updated
        if (["noofboxes", "l_wt", "b_wt", "h_wt"].includes(name)) {
            calculateVolumeWeight(newWeight)
        }
    };

    const calculateVolumeWeight = (weight: InvoiceWeight) => {
        const volume_range = Number(custData.volum_range)
        const volume_weight = (weight.l_wt * weight.b_wt * weight.h_wt) / volume_range

        setSelectedWeight((prev) => ({
            ...prev,
            vol_wt: Number(volume_weight.toFixed(2)),
        }))
    };


    const addWeightRow = () => {

        setPackages([...packages, { id: 0, invoice_id: selectedWeight.invoice_id, net_wt: selectedWeight.net_wt, gross_wt: selectedWeight.gross_wt, vol_wt: selectedWeight.vol_wt, noofboxes: selectedWeight.noofboxes, l_wt: selectedWeight.l_wt, b_wt: selectedWeight.b_wt, h_wt: selectedWeight.h_wt }]);
        setSelectedWeight({ id: 0, invoice_id: 0, net_wt: 0, gross_wt: 0, vol_wt: 0, noofboxes: 0, l_wt: 0, b_wt: 0, h_wt: 0 });
        calculatePackagesTotal([...packages, {
            id: 0,
            invoice_id: selectedWeight.invoice_id,
            net_wt: selectedWeight.net_wt,
            gross_wt: selectedWeight.gross_wt,
            vol_wt: selectedWeight.vol_wt,
            noofboxes: selectedWeight.noofboxes,
            l_wt: selectedWeight.l_wt,
            b_wt: selectedWeight.b_wt,
            h_wt: selectedWeight.h_wt
        }]);
    };

    const removeWeightRow = (index: number) => {
        //in case of edit mode directly delete product from database with confirmation
        if(isEditing && packages[index].id != 0){
            swal({
                title: "Are you sure?",
                text: "Once deleted, you will not be able to recover this record!",
                icon: "warning",
                buttons: {
                    confirm: {
                        text: "Delete",
                        value: true,
                        visible: true,
                        className: "",
                        closeModal: true
                    },
                    cancel: {
                        text: "Cancel",
                        value: null,
                        visible: true,
                        className: "",
                        closeModal: true,
                    }
                },
                dangerMode: true,
            })
            .then((willDelete) => {
                if (willDelete) {
                    axiosInstance.delete(`/deleteInvoiceWt`, {
                        data: {
                            id: packages[index].id
                        }
                    })
                    .then(response => {
                        swal("Success!", response.data.message, "success");
                        const newPacks = packages.filter((_, i) => i !== index);
                        setPackages(newPacks);
                        //re-calculate totals after product removed
                        calculatePackagesTotal(newPacks);
                        // setSaveTotal(prev => !prev);
                    })
                    .catch(error => {
                        swal("Error!", error.data.message, "error");
                    });
                } else {
                    swal("Your record is safe!");
                }
            });
        } else {
            const newPacks = packages.filter((_, i) => i !== index);
            setPackages(newPacks);

            calculatePackagesTotal(newPacks);
        }
    };

    const calculatePackagesTotal = (newPacks: InvoiceWeight[]) => {
        let total_net_weight = 0;
        let total_gross_weight = 0;
        let total_volume_weight = 0;
        let total_no_packages = 0;
        //calculate total from items array
        newPacks.map(pack => {
            total_net_weight += Number(pack.net_wt * pack.noofboxes);
            total_gross_weight += Number(pack.gross_wt * pack.noofboxes);
            total_volume_weight += Number(pack.vol_wt * pack.noofboxes);
            total_no_packages += Number(pack.noofboxes);
        });

        setUserData({ ...custData, total_net_weight: Number(total_net_weight.toFixed(2)),
            total_gross_weight: Number(total_gross_weight.toFixed(2)),
            total_value_weight: Number(total_volume_weight.toFixed(2)),
            no_of_packages: total_no_packages
        });
    }

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

    //remove product from box
    const handleDelete = async ( deleteId: number, pathName: string) => {
        swal({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover this record!",
            icon: "warning",
            buttons: {
                confirm: {
                    text: "Delete",
                    value: true,
                    visible: true,
                    className: "",
                    closeModal: true
                },
                cancel: {
                    text: "Cancel",
                    value: null,
                    visible: true,
                    className: "",
                    closeModal: true,
                }
            },
            dangerMode: true,
        })
        .then((willDelete) => {
            if (willDelete) {
                axiosInstance.delete(`/${pathName}`, {
                    params: { id: deleteId }
                })
                .then(response => {
                    swal("Success!", response.data.message, "success");
                })
                .catch(error => {
                    swal("Error!", error.data.message, "error");
                });
            } else {
                swal("Your record is safe!");
            }
        });
    };


    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {

        e.preventDefault();
        const form = e.currentTarget;
        if (form.checkValidity() === false) {
            e.preventDefault();
            e.stopPropagation();
            setValidated(true);
            return;
        }
        // Define mandatory attachments
        const mandatoryAttachments: FileAttachmentKeys[] = [
            'proforma_invoice_attachment',
            'tax_purchase_attachment',
            'firc_attachment',
        ];

        if (!isEditing) {
            for (const key of mandatoryAttachments) {
                if (fileAttachments[key].length < 1) {
                    setFileValidations({ [key]: `Please upload at least ${key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())} attachment.` });
                    setValidated(true);
                    return;
                }
            }
        }

        if(addedIrm.length < 1){
            toast.error('Irm not selected');
        }

        if(packages.length < 1){
            toast.error('Please enter Marks & Number of Packages details');
        }

        if(custData.grand_total === 0) {
            toast.error("Invoice Total cannot be 0");
            return;
        }
        let total_received = 0;
        addedIrm.map(irmData => {
            total_received += Number(irmData.received_amount);
        });
        if(custData.exw_value > total_received || custData.grand_total > total_received) {
            toast.error("Invoice Total cannot be greater than received amount");
            return;
        }

        setLoading(true);
        setValidated(true);
        const apiCall = isEditing
        ? axiosInstance.post(`/updateInvoice`, {
            ...custData,
            irms: addedIrm,
            products: items,
            marks_packages: packages,
            business_task: selectedBtId,
            proforma_invoice_attachment: fileAttachments.proforma_invoice_attachment,
            tax_purchase_attachment: fileAttachments.tax_purchase_attachment,
            firc_attachment: fileAttachments.firc_attachment,
            purchase_order_attachment: fileAttachments.purchase_order_attachment,
            legal_contract_attachment: fileAttachments.legal_contract_attachment,
            buyers_email_attachment: fileAttachments.buyers_email_attachment,
            vendors_email_attachment: fileAttachments.vendors_email_attachment,
        }, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        : axiosInstance.post('/invoices',{
            ...custData,
            irms: addedIrm,
            products: items,
            marks_packages: packages,
            business_task: selectedBtId,
            proforma_invoice_attachment: fileAttachments.proforma_invoice_attachment,
            tax_purchase_attachment: fileAttachments.tax_purchase_attachment,
            firc_attachment: fileAttachments.firc_attachment,
            purchase_order_attachment: fileAttachments.purchase_order_attachment,
            legal_contract_attachment: fileAttachments.legal_contract_attachment,
            buyers_email_attachment: fileAttachments.buyers_email_attachment,
            vendors_email_attachment: fileAttachments.vendors_email_attachment,
        }, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        apiCall
            .then((response) => {
                swal("Success!", response.data.message, "success");
                handleInvoiceList();
        })
        .catch(error => {
            if (!error || !error.data) return "An unknown error occurred"

            // Collect all unique error messages
            const uniqueMessages = new Set<string>()

            Object.values(error.data).forEach((fieldErrors: any) => {
                if (Array.isArray(fieldErrors)) {
                fieldErrors.forEach((message) => uniqueMessages.add(message))
                }
            })

            // Convert to bulleted list
            const errorMsgs = Array.from(uniqueMessages)
                .map((message) => `• ${message}`)
                .join("\n")
            console.log(error);
            swal("Error!", errorMsgs, "error");
        })
        .finally(() => { setLoading(false); });
    }

    if (editFetchError) return <div>Error: {editFetchError}</div>;

    return (
        <>
            <Row>
                <Col><h3 className='px-4 mb-2'>{isEditing ? 'Edit International Trade' : 'Add International Trade'}</h3></Col>
            </Row>
            <hr></hr>
            <Card style={{ width: '100%' }}>
                <Card.Body>
                    <Row className='border-bottom border-gray-200'>
                        <Col className="d-flex justify-content-end mb-2">
                            <Button
                                size='sm'
                                variant="primary"
                                className=""
                                startIcon={<FontAwesomeIcon icon={faCaretLeft} className="me-2" />}
                                onClick={() => handleInvoiceList()}
                                >
                                    Invoice List
                            </Button>
                        </Col>
                    </Row>
                    <Row className='py-3 border-bottom border-gray-200'>
                        <Col className='d-flex justify-content-start'><h4 className='text-danger'>Remittance Calculation</h4></Col>
                        <Col className='d-flex justify-content-end'><h4 className='text-danger'>{custData.invoice_number} ({custData.invoice_date})</h4></Col>
                    </Row>
                    <Row>
                        <Form noValidate validated={validated} onSubmit={handleSubmit}>
                            <Form.Control type="hidden" name="id" value={custData.id} />
                            <Row className='mb-2'>
                                <Form.Group as={Col} className="mb-3" controlId="irm_id">
                                    <Form.Label>IRM <span className="text-danger">*</span></Form.Label>
                                    <ReactSelect
                                        options= {irmData.map((option: IrmsData) => (
                                            { value: option.id, label: 'Reference No :' + option.reference_no + ' / Remittance Date : ' + option.remittance_date + ' / ' + option.currency.symbol + ' / Outstanding Amount : ' + option.outstanding_amount + ' / Buyer Name : ' + option.buyer.name + ' / Bank Name : ' + option.bank.bank_name }
                                        ))}
                                        value={selectedIrm}
                                        placeholder="Select highest one outstanding Amount first then add as per increasing order" name="irm_id" onChange={(selected: unknown) => handleIrmInputChange(selected)} />
                                </Form.Group>
                            </Row>
                            <Row className='g-3 px-2' style={{ overflowX: 'auto' }}>
                                <table className="table" style={{ width: '100%', whiteSpace: 'nowrap' }}>
                                    <thead className="thead-dark">
                                        <tr className='w-100'>
                                            <th className=''>Reference No</th>
                                            <th className=''>Remittance Date</th>
                                            <th className=''>Currency Name</th>
                                            <th className=''>Received Amount</th>
                                            <th className=''>Outstanding Amount</th>
                                            <th className=''>Buyer Name</th>
                                            <th className=''>Consignee Name</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {irmArray.irm_id != 0 && (
                                            <tr key={irmArray.irm_id}>
                                                <td>
                                                    <Form.Control type="hidden" value={irmArray.buyer_id}/>
                                                    <Form.Control type="hidden" value={irmArray.invoice_amount}/>
                                                    <Form.Control type="hidden" value={irmArray.irm_id}/>
                                                    <Form.Control type="text" className="form-control" value={irmArray.reference_no} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}}/>
                                                </td>
                                                <td>
                                                    <Form.Control type="text" placeholder="remittance date" value={irmArray.remittance_date} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} />
                                                </td>
                                                <td>
                                                    <Form.Control type="text" value={irmArray.currency_name} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} />
                                                </td>
                                                <td>
                                                    <Form.Control type="text" className="form-control" value={irmArray.received_amount} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} />
                                                </td>
                                                <td>
                                                    <Form.Control type="text" className="form-control" value={irmArray.outstanding_amount} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} />
                                                </td>
                                                <td>
                                                    <Form.Control type="text" className="form-control" value={irmArray.buyer_name} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} />
                                                </td>
                                                <td>
                                                    <Form.Select className="form-control" name="consignee_id" value={irmArray.consignee_id} onChange={handleIrmConsigneeChange} >
                                                        <option value="">Please select consignee</option>
                                                        {irmArray.consignees.length > 0 && irmArray.consignees.map((consignee) => (
                                                            <option key={consignee.id} value={consignee.id}>{consignee.name}</option>
                                                        ))}
                                                    </Form.Select>
                                                </td>
                                                <td className='white-space-nowrap'>
                                                    <Button
                                                        variant="success"
                                                        className=""
                                                        startIcon={<FontAwesomeIcon icon={faPlus} size='lg' className="me-2" />}
                                                        onClick={() => addIrmRow()}
                                                        disabled={irmArray.irm_id != 0 ? false : true}
                                                    >Add</Button>
                                                </td>
                                            </tr>
                                        )}
                                        <tr>
                                            <th colSpan={8}>Selected IRM</th>
                                        </tr>
                                        {addedIrm.length > 0 && addedIrm.map((item, irmIdx) => (
                                            <tr key={irmIdx}>
                                                <td>
                                                    <Form.Control type="hidden" name="buyer_id" value={item.buyer_id}/>
                                                    <Form.Control type="hidden" name="invoice_amount" value={item.invoice_amount}/>
                                                    <Form.Control type="hidden" name="irm_id" value={item.irm_id}/>
                                                    <Form.Control type="text" className="form-control" name="reference_no" value={item.reference_no} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}}/>
                                                </td>
                                                <td>
                                                    <Form.Control type="text" name="remittance_date" value={item.remittance_date} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} />
                                                </td>
                                                <td>
                                                    <Form.Control type="text" name="currency_name" value={item.currency_name} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} />
                                                </td>
                                                <td>
                                                    <Form.Control type="text" className="form-control" name="received_amount" value={item.received_amount} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} />
                                                </td>
                                                <td>
                                                    <Form.Control type="text" className="form-control" name="outstanding_amount" value={item.outstanding_amount} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} />
                                                </td>
                                                <td>
                                                    <Form.Control type="text" className="form-control" name="buyer_name" value={item.buyer_name} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} />
                                                </td>
                                                <td>
                                                    <Form.Control type="hidden" className="form-control" name="consignee_id" value={item.consignee_id} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} />
                                                    <Form.Control type="text" className="form-control" name="consignee_name" value={item.consignee_name} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} />
                                                </td>
                                                <td className='white-space-nowrap'>
                                                    {addedIrm.length > 0 && (
                                                        <Button
                                                            variant="danger"
                                                            className=""
                                                            startIcon={<FontAwesomeIcon icon={faTrash} size='lg' className="me-2" />}
                                                            onClick={() => removeIrmRow(irmIdx)}
                                                        >Remove</Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </Row>
                            <Row className="g-3">
                                <Form.Group as={Col} className="mb-3" controlId="currency">
                                    <Form.Label>Currency <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="text" placeholder="Currency" name="currency" value={custData.currency} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} required />
                                    <Form.Control.Feedback type="invalid">Please enter currency.</Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3" controlId="total_received_irm_amount">
                                    <Form.Label>Received Amount <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="text" placeholder="Received Amount" name="total_received_irm_amount" value={custData.total_received_irm_amount} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} required />
                                    <Form.Control.Feedback type="invalid">Please enter Received Amount.</Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3" controlId="remmittance_value">
                                    <Form.Label>Outstanding Value <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="text" placeholder="Outstanding Value" name="remmittance_value" value={custData.remmittance_value} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} required />
                                    <Form.Control.Feedback type="invalid">Please enter Outstanding Value.</Form.Control.Feedback>
                                </Form.Group>
                            </Row>
                            <Row className="g-3">
                                <Form.Group as={Col} className="mb-3" controlId="exchange_rate">
                                    <Form.Label>Exchange Rate <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="text" placeholder="x-rates.com" name="exchange_rate" value={custData.exchange_rate} onChange={handleChange} required />
                                    {validated && !custData.exchange_rate && (
                                        <div className="invalid-feedback d-block">Please mention exchange rate</div>
                                    )}
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3" controlId="inco_term">
                                    <Form.Label>INCO Term <span className="text-danger">*</span></Form.Label>
                                    <ReactSelect
                                        options= {incoTermData.map((option: IncoTermData) => (
                                            { value: option.id, label: option.inco_term }
                                        ))}
                                        placeholder="Select Inco Term" name="inco_term" value={custData.inco_term ? { value: custData.inco_term.id, label: custData.inco_term.inco_term } : null} onChange={(selectedOption) => handleIncoSelect(selectedOption)} required />
                                    <Form.Control type="hidden" name="inco_term_id" value={custData.inco_term_id} />
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3" controlId="shipment_type">
                                    <Form.Label>Shipment Type <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="text" placeholder="Shipment type" name="shipment_type" value={custData.shipment_type} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} required />
                                    <Form.Control.Feedback type="invalid">Please enter shipment type.</Form.Control.Feedback>
                                </Form.Group>
                            </Row>
                            <Row className='g-2'>
                                <Form.Group as={Col} className="mb-3" controlId="invoice_number">
                                    <Form.Label>Invoice No <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="text" name="invoice_number" value={custData.invoice_number} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} required />
                                    <Form.Control.Feedback type="invalid">Please enter invoice number.</Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3" controlId="invoice_date">
                                    <Form.Label>Invoice Date <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="text" name="invoice_date" value={custData.invoice_date} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} required />
                                    <Form.Control.Feedback type="invalid">Please enter invoice date.</Form.Control.Feedback>
                                </Form.Group>
                            </Row>
                            <Row className='mb-2'>
                                <Form.Group as={Col} className="mb-3" controlId="business_task">
                                    <Form.Label>Business Task ID <span className="text-danger">*</span></Form.Label>
                                    <ReactSelect
                                        options= {businessTaskListingData}
                                        isMulti
                                        placeholder="Select Business Task"
                                        name="business_task"
                                        value={selectedBtId}
                                        onChange={handleBTselection}
                                        required
                                    />
                                    {validated && (selectedBtId.length == 0)  && (
                                        <div className="invalid-feedback d-block">Please mention Business Task ID.</div>
                                    )}
                                </Form.Group>
                            </Row>
                            <Row className='g-2'>
                                <Form.Group as={Col} className="mb-3" controlId="bank_id">
                                    <Form.Label>Bank <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="hidden" name="bank_id" value={custData.bank_id} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} required />
                                    <Form.Control type="text" name="bank_name" value={custData.bank_name} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} required />
                                    <Form.Control.Feedback type="invalid">Please enter bank name.</Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3" controlId="ad_code">
                                    <Form.Label>Ad Code <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="text" name="ad_code" value={custData.ad_code} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}}  />
                                    <Form.Control.Feedback type="invalid">Please enter invoice date.</Form.Control.Feedback>
                                </Form.Group>
                            </Row>
                            <Row className='g-2'>
                                <Form.Group as={Col} className="mb-3" controlId="payment_terms">
                                    <Form.Label>Payment Terms <span className="text-danger">*</span></Form.Label>
                                    <Form.Control as="textarea" rows={3} placeholder="eg. Advance" name="payment_terms" value={custData.payment_terms} onChange={handleChange} required/>
                                    <Form.Control.Feedback type="invalid">Please enter terms and conditions.</Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3" controlId="nature_of_payment">
                                    <Form.Label>Nature Of Payment</Form.Label>
                                    <Form.Select name="nature_of_payment" value={custData.nature_of_payment} onChange={handleSelectChange}>
                                        <option value="">Select</option>
                                        <option value="Document Against Acceptance">Document Against Acceptance</option>
                                        <option value="Cash Against Document">Cash Against Document</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                            </Row>

                            <hr className='border border-danger border-1'/>
                            <Card.Title as="h4" className="text-danger">Attachment Details</Card.Title>

                            <Row className='g-2'>
                                <Col md={6}>
                                    <Form.Label>Inorbvict Proforma Invoice <span className="text-danger">*</span></Form.Label>
                                    <Dropzone onDrop={acceptedFiles => handleDrop(acceptedFiles, 'proforma_invoice_attachment')} onRemove={index => handleFileRemove(index, 'proforma_invoice_attachment')} />
                                    {fileValidations.proforma_invoice_attachment && <div className="text-danger mt-1">{fileValidations.proforma_invoice_attachment}</div>}
                                    {isEditing && (pisData.length > 0) && (
                                        <Row className='px-3'>
                                            <Card>
                                                <h5 className='mt-2'>Inorbvict Proforma Invoice Attachments</h5>

                                                {pisData.map((upload) => (

                                                    <Col className='col-md-12 py-1 px-3 ' key={upload.id}>
                                                        <Button
                                                            key={upload.id}
                                                            className="text-primary p-0"
                                                            variant="link"
                                                            title="Download"
                                                            onClick={() => handleDownload(upload.attachment_name, 'uploads/international-trade/proforma-invoice-attachment/')}
                                                            startIcon={<FontAwesomeIcon icon={faDownload} />}
                                                        >
                                                            {upload.attachment_name}
                                                        </Button>
                                                        {userPermission.invoice_delete == 1 && (
                                                            <Button className='text-danger' variant='link' title='Delete Proforma Invoice' onClick={() => handleDelete(upload.id, 'deleteInvoicePiAttachment')} startIcon={<FontAwesomeIcon icon={faTrash} />}></Button>
                                                        )}
                                                    </Col>

                                                ))}
                                            </Card>
                                        </Row>
                                    )}
                                </Col>
                                <Col md={6}>
                                    <Form.Label>Tax Invoice Purchase <span className="text-danger">*</span></Form.Label>
                                    <Dropzone onDrop={acceptedFiles => handleDrop(acceptedFiles, 'tax_purchase_attachment')} onRemove={index => handleFileRemove(index, 'tax_purchase_attachment')} />
                                    {fileValidations.tax_purchase_attachment && <div className="text-danger mt-1">{fileValidations.tax_purchase_attachment}</div>}
                                    {isEditing && (tpsData.length > 0) && (
                                        <Row className='px-3'>
                                            <Card>
                                                <h5 className='mt-2'>Tax Invoice Purchase Attachments</h5>

                                                {tpsData.map((upload) => (

                                                    <Col className='col-md-12 py-1 px-3 ' key={upload.id}>
                                                        <Button
                                                            key={upload.id}
                                                            className="text-primary p-0"
                                                            variant="link"
                                                            title="Download"
                                                            onClick={() => handleDownload(upload.attachment_name, 'uploads/international-trade/tax-purchase-attachment/')}
                                                            startIcon={<FontAwesomeIcon icon={faDownload} />}
                                                        >
                                                            {upload.attachment_name}
                                                        </Button>
                                                        {userPermission.invoice_delete == 1 && (
                                                            <Button className='text-danger' variant='link' title='Delete Tax Invoice Purchase Attachment' onClick={() => handleDelete(upload.id, 'deleteInvoiceTpAttachment')} startIcon={<FontAwesomeIcon icon={faTrash} />}></Button>
                                                        )}
                                                    </Col>

                                                ))}
                                            </Card>
                                        </Row>
                                    )}
                                </Col>
                                <Col md={6}>
                                    <Form.Label>FIRC <span className="text-danger">*</span></Form.Label>
                                    <Dropzone onDrop={acceptedFiles => handleDrop(acceptedFiles, 'firc_attachment')} onRemove={index => handleFileRemove(index, 'firc_attachment')} />
                                    {fileValidations.firc_attachment && <div className="text-danger mt-1">{fileValidations.firc_attachment}</div>}
                                    {isEditing && (fisData.length > 0) &&(
                                        <Row className='px-3'>
                                            <Card>
                                                <h5 className='mt-2'>FIRC Attachments</h5>

                                                {fisData.map((upload) => (

                                                    <Col className='col-md-12 py-1 px-3 ' key={upload.id}>
                                                        <Button
                                                            key={upload.id}
                                                            className="text-primary p-0"
                                                            variant="link"
                                                            title="Download"
                                                            onClick={() => handleDownload(upload.attachment_name, 'uploads/international-trade/firc-attachment/')}
                                                            startIcon={<FontAwesomeIcon icon={faDownload} />}
                                                        >
                                                            {upload.attachment_name}
                                                        </Button>
                                                        {userPermission.invoice_delete == 1 && (
                                                            <Button className='text-danger' variant='link' title='Delete FIRC Attachment' onClick={() => handleDelete(upload.id, 'deleteInvoiceFiAttachment')} startIcon={<FontAwesomeIcon icon={faTrash} />}></Button>
                                                        )}
                                                    </Col>

                                                ))}
                                            </Card>
                                        </Row>
                                    )}
                                </Col>
                                <Col md={6}>
                                    <Form.Label>Buyers Signed PO </Form.Label>
                                    <Dropzone onDrop={acceptedFiles => handleDrop(acceptedFiles, 'purchase_order_attachment')} onRemove={index => handleFileRemove(index, 'purchase_order_attachment')} />
                                    {isEditing && (posData.length > 0) && (
                                        <Row className='px-3'>
                                            <Card>
                                                <h5 className='mt-2'>Buyers Signed PO Attachments</h5>

                                                {posData.map((upload) => (

                                                    <Col className='col-md-12 py-1 px-3 ' key={upload.id}>
                                                        <Button
                                                            key={upload.id}
                                                            className="text-primary p-0"
                                                            variant="link"
                                                            title="Download"
                                                            onClick={() => handleDownload(upload.attachment_name, 'uploads/international-trade/purchase-order-attachment/')}
                                                            startIcon={<FontAwesomeIcon icon={faDownload} />}
                                                        >
                                                            {upload.attachment_name}
                                                        </Button>
                                                        {userPermission.invoice_delete == 1 && (
                                                            <Button className='text-danger' variant='link' title='Delete Buyers Signed PO' onClick={() => handleDelete(upload.id, 'deleteInvoicePoAttachment')} startIcon={<FontAwesomeIcon icon={faTrash} />}></Button>
                                                        )}
                                                    </Col>

                                                ))}
                                            </Card>
                                        </Row>
                                    )}
                                </Col>
                                <Col md={6}>
                                    <Form.Label>Legal Contract </Form.Label>
                                    <Dropzone onDrop={acceptedFiles => handleDrop(acceptedFiles, 'legal_contract_attachment')} onRemove={index => handleFileRemove(index, 'legal_contract_attachment')} />
                                    {isEditing && (lcsData.length > 0) &&(
                                        <Row className='px-3'>
                                            <Card>
                                                <h5 className='mt-2'>Legal Contract Attachments</h5>

                                                {lcsData.map((upload) => (

                                                    <Col className='col-md-12 py-1 px-3 ' key={upload.id}>
                                                        <Button
                                                            key={upload.id}
                                                            className="text-primary p-0"
                                                            variant="link"
                                                            title="Download"
                                                            onClick={() => handleDownload(upload.attachment_name, 'uploads/international-trade/legal-contract-attachment/')}
                                                            startIcon={<FontAwesomeIcon icon={faDownload} />}
                                                        >
                                                            {upload.attachment_name}
                                                        </Button>
                                                        {userPermission.invoice_delete == 1 && (
                                                            <Button className='text-danger' variant='link' title='Delete Legal Contract Attachment' onClick={() => handleDelete(upload.id, 'deleteInvoiceLcAttachment')} startIcon={<FontAwesomeIcon icon={faTrash} />}></Button>
                                                        )}
                                                    </Col>

                                                ))}
                                            </Card>
                                        </Row>
                                    )}
                                </Col>
                                <Col md={6}>
                                    <Form.Label>Buyers Email Communication </Form.Label>
                                    <Dropzone onDrop={acceptedFiles => handleDrop(acceptedFiles, 'buyers_email_attachment')} onRemove={index => handleFileRemove(index, 'buyers_email_attachment')} />
                                    {isEditing && (besData.length > 0) &&(
                                        <Row className='px-3'>
                                            <Card>
                                                <h5 className='mt-2'>Buyers Email Communication Attachments</h5>

                                                {besData.map((upload) => (

                                                    <Col className='col-md-12 py-1 px-3 ' key={upload.id}>
                                                        <Button
                                                            key={upload.id}
                                                            className="text-primary p-0"
                                                            variant="link"
                                                            title="Download"
                                                            onClick={() => handleDownload(upload.attachment_name, 'uploads/international-trade/buyers-email-attachment/')}
                                                            startIcon={<FontAwesomeIcon icon={faDownload} />}
                                                        >
                                                            {upload.attachment_name}
                                                        </Button>
                                                        {userPermission.invoice_delete == 1 && (
                                                            <Button className='text-danger' variant='link' title='Delete Buyers Email Communication Attachment' onClick={() => handleDelete(upload.id, 'deleteInvoiceBeAttachment')} startIcon={<FontAwesomeIcon icon={faTrash} />}></Button>
                                                        )}
                                                    </Col>

                                                ))}
                                            </Card>
                                        </Row>
                                    )}
                                </Col>
                                <Col md={6}>
                                    <Form.Label>Vendors Email Communication </Form.Label>
                                    <Dropzone onDrop={acceptedFiles => handleDrop(acceptedFiles, 'vendors_email_attachment')} onRemove={index => handleFileRemove(index, 'vendors_email_attachment')} />
                                    {isEditing && (vesData.length > 0) && (
                                        <Row className='px-3'>
                                            <Card>
                                                <h5 className='mt-2'>Vendors Email Communication Attachments</h5>

                                                {vesData.map((upload) => (

                                                    <Col className='col-md-12 py-1 px-3 ' key={upload.id}>
                                                        <Button
                                                            key={upload.id}
                                                            className="text-primary p-0"
                                                            variant="link"
                                                            title="Download"
                                                            onClick={() => handleDownload(upload.attachment_name, 'uploads/international-trade/vendors-email-attachment/')}
                                                            startIcon={<FontAwesomeIcon icon={faDownload} />}
                                                        >
                                                            {upload.attachment_name}
                                                        </Button>
                                                        {userPermission.invoice_delete == 1 && (
                                                            <Button className='text-danger' variant='link' title='Delete Vendors Email Communication Attachment' onClick={() => handleDelete(upload.id, 'deleteInvoiceVeAttachment')} startIcon={<FontAwesomeIcon icon={faTrash} />}></Button>
                                                        )}
                                                    </Col>

                                                ))}
                                            </Card>
                                        </Row>
                                    )}
                                </Col>
                            </Row>

                            <hr className='border border-danger border-1'/>
                            <Card.Title as="h4" className="text-danger">Basic Details</Card.Title>

                            <Row className='g-2'>
                                <Form.Group as={Col} className="mb-3" controlId="quotation">
                                    <Form.Label>Proforma Invoice Number <span className="text-danger">*</span></Form.Label>
                                    <ReactSelect
                                        options= {piListingData.map((option: PiListingData) => (
                                            { value: option.id, label: option.pi_number, q_date: option.pi_date }
                                        ))}
                                        placeholder="Select PI Number" name="quotation" value={custData.quotation ? { value: custData.quotation.id, label: custData.quotation.pi_number } : null} onChange={(selectedOption) => handleProformaInvoiceSelect(selectedOption)} required />
                                    <Form.Control type="hidden" name="quotation_id" value={custData.quotation_id} />
                                    {validated && !custData.quotation_id && (
                                        <div className="invalid-feedback d-block">Please select Proforma Invoice</div>
                                    )}
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3" controlId="po_number">
                                    <Form.Label>PI No <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="text" placeholder="Reference No" name="po_number" value={custData.po_number} onChange={handleChange} required />
                                    <Form.Control.Feedback type="invalid">Please Enter Reference No</Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3" controlId="po_date">
                                    <Form.Label>Pi Date <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="date" name="po_date" value={custData.po_date} onChange={handleChange} required />
                                    <Form.Control.Feedback type="invalid">Please enter Remittance Date.</Form.Control.Feedback>
                                </Form.Group>
                            </Row>
                            <Row className='g-2'>
                                <Form.Group as={Col} className="mb-3" controlId="port_of_loading">
                                    <Form.Label>Port Of Loading <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="text" placeholder="eg. Shar/JNPT etc." name="port_of_loading" value={custData.port_of_loading} onChange={handleChange} required />
                                    <Form.Control.Feedback type="invalid">Please enter port Of Loading.</Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3" controlId="port_of_discharge">
                                    <Form.Label>Port Of Discharge <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="text" placeholder="Nearest Port of Buyer" name="port_of_discharge" value={custData.port_of_discharge} onChange={handleChange} required />
                                    <Form.Control.Feedback type="invalid">Please enter Port Of Discharge.</Form.Control.Feedback>
                                </Form.Group>
                            </Row>
                            <Row className='g-2'>
                                <Form.Group as={Col} className="mb-3" controlId="final_destination">
                                    <Form.Label>Final Destination <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="text" placeholder="City & Country" name="final_destination" value={custData.final_destination} onChange={handleChange} required />
                                    <Form.Control.Feedback type="invalid">Please enter final destination.</Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3" controlId="origin_country">
                                    <Form.Label>Country Of Origin Of Goods <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="text" placeholder="India/Goods MFG Country" name="origin_country" value={custData.origin_country} onChange={handleChange} required />
                                    <Form.Control.Feedback type="invalid">Please enter origin country.</Form.Control.Feedback>
                                </Form.Group>
                            </Row>
                            <Row className='g-2'>
                                <Form.Group as={Col} className="mb-3" controlId="pre_carriage_by">
                                    <Form.Label>Pre-Carriage By</Form.Label>
                                    <Form.Control type="text" placeholder="Movement Before Container Loaded.." name="pre_carriage_by" value={custData.pre_carriage_by} onChange={handleChange} />
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3" controlId="placereceiptprecarrier">
                                    <Form.Label>Place Of Receipt By Pre-Carrier</Form.Label>
                                    <Form.Control type="text" placeholder="Cargo Handover Place by Shipper" name="placereceiptprecarrier" value={custData.placereceiptprecarrier} onChange={handleChange} />
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                            </Row>
                            <Row className='g-2'>
                                <Form.Group as={Col} className="mb-3" controlId="vessel_no">
                                    <Form.Label>Vessel No</Form.Label>
                                    <Form.Control type="text" placeholder="Sea/Air" name="vessel_no" value={custData.vessel_no} onChange={handleChange} />
                                    <Form.Control.Feedback type="invalid">Please enter vessel no.</Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3" controlId="exporter_type">
                                    <Form.Label>Exporter Type</Form.Label>
                                    <Form.Select name="exporter_type" value={custData.exporter_type} onChange={handleSelectChange}>
                                        <option value="Merchant">Merchant</option>
                                        <option value="Manufacturer">Manufacturer</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                            </Row>
                            <Row className='g-2'>
                                <Form.Group as={Col} className="mb-3" controlId="ffd_domestic">
                                    <Form.Label>Domestic FFD <span className="text-danger">*</span></Form.Label>
                                    <ReactSelect
                                        options= {domesticFfdData.map((option: FfdData) => (
                                            { value: option.id, label: option.ffd_name }
                                        ))}
                                        placeholder="Select Domestic Freight Fowarder" name="ffd_domestic" value={custData.ffd_domestic ? { value: custData.ffd_domestic.id, label: custData.ffd_domestic.ffd_name } : null} onChange={(selectedOption) => handleDomesticFfdSelect(selectedOption)} required/>

                                    <Form.Control type="hidden" name="domestic_ffd_id" value={custData.domestic_ffd_id} />
                                    {validated && !custData.domestic_ffd_id && (
                                        <div className="invalid-feedback d-block">Please select Domestic FFD</div>
                                    )}
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3" controlId="ffd_international">
                                    <Form.Label>International FFD <span className="text-danger">*</span></Form.Label>
                                    <ReactSelect
                                        options= {internationalFfdData.map((option: FfdData) => (
                                            { value: option.id, label: option.ffd_name }
                                        ))}
                                        placeholder="Select International Freight Fowarder" name="international_ffd_id" value={custData.ffd_international ? { value: custData.ffd_international.id, label: custData.ffd_international.ffd_name } : null} onChange={(selectedOption) => handleInternationalFfdSelect(selectedOption)} required/>
                                    <Form.Control type="hidden" name="international_ffd_id" value={custData.international_ffd_id} />
                                    {validated && !custData.international_ffd_id && (
                                        <div className="invalid-feedback d-block">Please select International FFD</div>
                                    )}
                                </Form.Group>
                            </Row>
                            <Row className='g-2'>
                                <Form.Group as={Col} className="mb-3" controlId="pickupreferencenumber">
                                    <Form.Label>Pick Up Reference Number</Form.Label>
                                    <Form.Control type="text" placeholder="" name="pickupreferencenumber" value={custData.pickupreferencenumber} onChange={handleChange} />
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3" controlId="remarks">
                                    <Form.Label>Remarks</Form.Label>
                                    <Form.Control as="textarea" rows={3} placeholder="For Packing List" name="remarks" value={custData.remarks} onChange={handleChange} />
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                            </Row>
                            <Row className='g-2'>
                                <Col md={6}>
                                    <Form.Group className="mb-3" controlId="tracking_or_awb_number">
                                        <Form.Label>Tracking /AWB Number</Form.Label>
                                        <Form.Control type="text" placeholder="" name="tracking_or_awb_number" value={custData.tracking_or_awb_number} onChange={handleChange} />
                                        <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <hr className='border border-danger border-1'/>
                            <Card.Title as="h4" className="text-danger">Product Details</Card.Title>

                            <Row className='mb-2'>
                                <Form.Group as={Col} className="mb-3 col-md-6" controlId="product_id">
                                    <Form.Label>Product <span className="text-danger">*</span></Form.Label>
                                    <ReactSelect
                                        options= {productsData.map((option: ProductsData) => (
                                            { value: option.id, label: option.product_name +' (' + option.product_code + ')' }
                                        ))}
                                        placeholder="Select product" name="product_id" onChange={(selected: unknown) => handleProductInputChange(selected, 'product_id')} />
                                </Form.Group>
                            </Row>

                            <Row className='g-3 px-2'>
                                <table className="table" style={{ width: '100%', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                                    <thead className="thead-dark">
                                        <tr  className='w-100'>
                                            <th className=''style={{ width: '20%'}}>Item Details</th>
                                            <th className=''>Description</th>
                                            <th className=''>HSN/SAC</th>
                                            <th className=''>Qty</th>
                                            <th className=''>Unit</th>
                                            <th className=''>Rate</th>
                                            <th className=''>Amount</th>
                                            <th style={{width: '110px'}}>Add</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>
                                                <Form.Control type="hidden" placeholder="prod_id" name="prod_id" value={selectedProduct.prod_id}/>
                                                <input type="text" className="form-control" name="title" value={selectedProduct.title} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}}/>
                                            </td>
                                            <td>
                                                <Form.Control as="textarea" rows={1} name="printable_description" value={selectedProduct.printable_description} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} />
                                            </td>
                                            <td>
                                                <input type="number" className="form-control" name="hsn_code_id" value={selectedProduct.hsn_code_id} min={0} maxLength={12} onChange={handleItemInputChange} />
                                            </td>
                                            <td>
                                                <Form.Control type="number" placeholder="quantity" name="quantity" value={selectedProduct.quantity} onChange={handleItemInputChange} min={1} />
                                            </td>
                                            <td>
                                                <Form.Control type="text" placeholder="unit" name="unit" value={selectedProduct.unit} onChange={handleItemInputChange} />
                                            </td>
                                            <td>
                                                <Form.Control type="number" placeholder="rate" name="rate" value={selectedProduct.rate} onChange={handleItemInputChange} min={0} />
                                            </td>
                                            <td>
                                                <input type="text" className="form-control" name="amount" value={selectedProduct.amount} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} />
                                            </td>
                                            <td className='white-space-nowrap'>
                                                <Button
                                                    variant="success"
                                                    className=""
                                                    startIcon={<FontAwesomeIcon icon={faPlus} size='lg' className="me-2" />}
                                                    onClick={() => addItemRow()}
                                                    disabled={selectedProduct.title != '' ? false : true}
                                                >Add</Button>
                                            </td>
                                        </tr>
                                        {items.length > 0 && items.map((item, prod_idx) => (
                                            <tr key={prod_idx}>
                                                <td>
                                                    <input type="hidden" className="form-control" value={item.prod_id} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}}/>
                                                    <input type="text" className="form-control" title={item.title} value={item.title} readOnly style={{backgroundColor: 'whitesmoke'}}/>
                                                </td>
                                                <td>
                                                    <input type="text" className="form-control" title={item.printable_description} value={item.printable_description} readOnly style={{backgroundColor: 'whitesmoke'}} />
                                                </td>
                                                <td>
                                                    <input type="number" className="form-control" value={item.hsn_code_id} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} />
                                                </td>
                                                <td>
                                                    <input type="number" className="form-control" value={item.quantity} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}}/>
                                                </td>
                                                <td>
                                                    <input type="text" className="form-control" value={item.unit} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} />
                                                </td>
                                                <td>
                                                    <input type="number" className="form-control" value={item.rate} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}}/>
                                                </td>
                                                <td>
                                                    <input type="text" className="form-control" value={item.amount} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} />
                                                </td>
                                                <td className='white-space-nowrap'>
                                                    {items.length > 0 && (
                                                        <Button
                                                            variant="danger"
                                                            className=""
                                                            startIcon={<FontAwesomeIcon icon={faTrash} size='lg' className="me-2" />}
                                                            onClick={() => removeItemRow(prod_idx)}
                                                        >Remove</Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </Row>

                            <Row>
                                <Col md={3}>
                                    <Form.Group as={Col} className="mb-3" controlId="exw_value">
                                        <Form.Label>Total Product Amount/ EXW value <span className="text-danger">*</span></Form.Label>
                                        <Form.Control type="text" name="exw_value" value={custData.exw_value} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} required />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group as={Col} className="mb-3" controlId="insurance">
                                        <Form.Label>Insurance</Form.Label>
                                        <Form.Control type="number" name="insurance" min={0} value={custData.insurance} onChange={handleChange} required />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group as={Col} className="mb-3" controlId="freight_weight">
                                        <Form.Label>Freight Value</Form.Label>
                                        <Form.Control type="number" name="freight_weight" min={0} value={custData.freight_weight} onChange={handleChange} required />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group as={Col} className="mb-3" controlId="total_addition">
                                        <Form.Label>Total Addition</Form.Label>
                                        <Form.Control type="number" name="total_addition" value={custData.total_addition} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} required />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={3}></Col>
                                <Col md={3}>
                                    <Form.Group as={Col} className="mb-3" controlId="discount">
                                        <Form.Label>Discount</Form.Label>
                                        <Form.Control type="number" name="discount" min={0} value={custData.discount} onChange={handleChange} required />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group as={Col} className="mb-3" controlId="commission">
                                        <Form.Label>Commission</Form.Label>
                                        <Form.Control type="number" name="commission" min={0} value={custData.commission} onChange={handleChange} required />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group as={Col} className="mb-3" controlId="total_deduction">
                                        <Form.Label>Total Deduction</Form.Label>
                                        <Form.Control type="number" name="total_deduction" value={custData.total_deduction} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} required />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row className="d-flex justify-content-end">
                                <Col md={3}>
                                    <Form.Group as={Col} className="mb-3" controlId="grand_total">
                                        <Form.Label>Grand Total</Form.Label>
                                        <Form.Control type="number" name="grand_total" value={custData.grand_total} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} required />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <hr className='border border-danger border-1'/>
                            <Card.Title as="h4" className="text-danger">Marks & No. of Packages Details</Card.Title>

                            <Row className='g-2'>
                                <Form.Group as={Col} className="mb-3 col-md-6" controlId="volum_range">
                                    <Form.Label>Volume Range</Form.Label>
                                    <Form.Select name="volum_range" value={custData.volum_range} onChange={handleSelectChange}>
                                        <option value="5000">5000</option>
                                        <option value="6000">6000</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                            </Row>

                            <Row className='g-3 px-2'>
                                <table className="table" style={{ width: '100%', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                                    <thead className="thead-dark">
                                        <tr className='w-100'>
                                            <th className=''>Net WT</th>
                                            <th className=''>Gross WT</th>
                                            <th className=''>Vol WT</th>
                                            <th className=''>No Of Boxes</th>
                                            <th className=''>L</th>
                                            <th className=''>B</th>
                                            <th className=''>H</th>
                                            <th>ACTION</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>
                                                <Form.Control type="hidden" placeholder="invoice_id" name="invoice_id" value={selectedWeight.invoice_id}/>
                                                <Form.Control type="number" className="form-control" name="net_wt" value={selectedWeight.net_wt} onChange={handleWeightInputChange} min={0} onFocus={(e) => e.target.select()}/>
                                            </td>
                                            <td>
                                                <Form.Control type="number" name="gross_wt" value={selectedWeight.gross_wt} onChange={handleWeightInputChange} min={0} onFocus={(e) => e.target.select()}/>
                                            </td>
                                            <td>
                                                <Form.Control type="number" className="form-control" name="vol_wt" value={selectedWeight.vol_wt} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}}/>
                                            </td>
                                            <td>
                                                <Form.Control type="number" name="noofboxes" value={selectedWeight.noofboxes} onChange={handleWeightInputChange} min={0} onFocus={(e) => e.target.select()} />
                                            </td>
                                            <td>
                                                <Form.Control type="number" placeholder="unit" name="l_wt" value={selectedWeight.l_wt} onChange={handleWeightInputChange} min={0} onFocus={(e) => e.target.select()}/>
                                            </td>
                                            <td>
                                                <Form.Control type="number" placeholder="rate" name="b_wt" value={selectedWeight.b_wt} onChange={handleWeightInputChange} min={0} onFocus={(e) => e.target.select()} />
                                            </td>
                                            <td>
                                                <input type="number" className="form-control" name="h_wt" value={selectedWeight.h_wt} onChange={handleWeightInputChange} min={0} onFocus={(e) => e.target.select()} />
                                            </td>
                                            <td className='white-space-nowrap'>
                                                <Button
                                                    variant="success"
                                                    className=""
                                                    startIcon={<FontAwesomeIcon icon={faCheck} size='lg' className="me-0" />}
                                                    onClick={() => addWeightRow()}
                                                    disabled={selectedWeight.vol_wt > 0 ? false : true}
                                                ></Button>
                                            </td>
                                        </tr>
                                        {packages.length > 0 && packages.map((pack, pck_idx) => (
                                            <tr key={pck_idx}>
                                                <td>
                                                    <input type="hidden" className="form-control" value={pack.invoice_id} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}}/>
                                                    <input type="text" className="form-control" value={pack.net_wt} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}}/>
                                                </td>
                                                <td>
                                                    <input type="text" className="form-control" value={pack.gross_wt} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} />
                                                </td>
                                                <td>
                                                    <input type="text" className="form-control" value={pack.vol_wt} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} />
                                                </td>
                                                <td>
                                                    <input type="number" className="form-control" value={pack.noofboxes} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}}/>
                                                </td>
                                                <td>
                                                    <input type="text" className="form-control" value={pack.l_wt} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} />
                                                </td>
                                                <td>
                                                    <input type="number" className="form-control" value={pack.b_wt} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}}/>
                                                </td>
                                                <td>
                                                    <input type="text" className="form-control" value={pack.h_wt} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} />
                                                </td>
                                                <td className='white-space-nowrap'>
                                                    {packages.length > 0 && (
                                                        <Button
                                                            variant="danger"
                                                            className=""
                                                            startIcon={<FontAwesomeIcon icon={faTrash} size='lg' className="me-0" />}
                                                            onClick={() => removeWeightRow(pck_idx)}
                                                        ></Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </Row>

                            <Row className='g-2'>
                                <Form.Group as={Col} className="mb-3" controlId="total_net_weight">
                                    <Form.Label>Total Net Weight <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="text" name="total_net_weight" value={custData.total_net_weight} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} required />
                                    <Form.Control.Feedback type="invalid">.</Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3" controlId="total_gross_weight">
                                    <Form.Label>Total Gross Weight <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="text" name="total_gross_weight" value={custData.total_gross_weight} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} required />
                                    <Form.Control.Feedback type="invalid">.</Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3" controlId="total_value_weight">
                                    <Form.Label>Total Volume Weight <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="text" name="total_value_weight" value={custData.total_value_weight} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} required />
                                    <Form.Control.Feedback type="invalid">.</Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3" controlId="no_of_packages">
                                    <Form.Label>Marks & No. of Packages <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="text" name="no_of_packages" value={custData.no_of_packages} readOnly style={{backgroundColor: 'whitesmoke', pointerEvents: 'none'}} required />
                                    <Form.Control.Feedback type="invalid">.</Form.Control.Feedback>
                                </Form.Group>
                            </Row>

                            <hr className='border border-danger border-1'/>
                            <Card.Title as="h4" className="text-danger">Technical Details</Card.Title>

                            <Row className='g-2'>
                                <Form.Group as={Col} className="mb-3 col-md-6" controlId="lut_export_under_bond">
                                    <Form.Label>LUT Export Under Bond</Form.Label>
                                    <Form.Select name="lut_export_under_bond" value={custData.lut_export_under_bond} onChange={handleSelectChange}>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3 col-md-6" controlId="exportpaymentofigst">
                                    <Form.Label>Export Against</Form.Label>
                                    <Form.Select name="exportpaymentofigst" value={custData.exportpaymentofigst} onChange={handleSelectChange}>
                                        <option value="Letter Of Undertaking">Letter Of Undertaking</option>
                                        <option value="IGST">IGST</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                            </Row>
                            <Row className='g-2'>
                                <Form.Group as={Col} className="mb-3" controlId="ein_no">
                                    <Form.Label>EIN No</Form.Label>
                                    <Form.Control type="text" placeholder="If Applicable" name="ein_no" value={custData.ein_no} onChange={handleChange} />
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3 col-md-6" controlId="free_trade_sample">
                                    <Form.Label>FREE TRADE SAMPLE (NON-COMM)</Form.Label>
                                    <Form.Select name="free_trade_sample" value={custData.free_trade_sample} onChange={handleSelectChange}>
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                            </Row>
                            <Row className='g-2'>
                                <Form.Group as={Col} className="mb-3 col-md-6" controlId="non_drawback">
                                    <Form.Label>NonDrawback</Form.Label>
                                    <Form.Select name="non_drawback" value={custData.non_drawback} onChange={handleSelectChange}>
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3 col-md-6" controlId="duty_free_commercial">
                                    <Form.Label>DUTY FREE COMMERCIAL</Form.Label>
                                    <Form.Select name="duty_free_commercial" value={custData.duty_free_commercial} onChange={handleSelectChange}>
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                            </Row>
                            <Row className='g-2'>
                                <Form.Group as={Col} className="mb-3 col-md-6" controlId="under_lut">
                                    <Form.Label>UNDER LUT</Form.Label>
                                    <Form.Select name="under_lut" value={custData.under_lut} onChange={handleSelectChange}>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3 col-md-6" controlId="eou_shipping_bill">
                                    <Form.Label>EOU Shipping Bill</Form.Label>
                                    <Form.Select name="eou_shipping_bill" value={custData.eou_shipping_bill} onChange={handleSelectChange}>
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                            </Row>
                            <Row className='g-2'>
                                <Form.Group as={Col} className="mb-3 col-md-6" controlId="special_instuction">
                                    <Form.Label>Special Instruction</Form.Label>
                                    <Form.Select name="special_instuction" value={custData.special_instuction} onChange={handleSelectChange}>
                                        <option value="Dont forget to mention Buyer , Consignee Name on EP Copy , AWB/BL">Don't forget to mention Buyer &amp; Consignee Name on EP Copy &amp; AWB/BL</option>
                                        <option value="We intend to claim a reward   under RoDTEP (Remission of Duties or Taxes on Export Products) Scheme">We intend to claim a reward   under RoDTEP (Remission of Duties or Taxes on Export Products) Scheme</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3 col-md-6" controlId="duty_drawback">
                                    <Form.Label>DUTY DRAWBACK</Form.Label>
                                    <Form.Select name="duty_drawback" value={custData.duty_drawback} onChange={handleSelectChange}>
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                            </Row>
                            <Row className='g-2'>
                                <Form.Group as={Col} className="mb-3 col-md-6" controlId="epcg_shipping_bill">
                                    <Form.Label>EPCG SHIPPING BILL</Form.Label>
                                    <Form.Select name="epcg_shipping_bill" value={custData.epcg_shipping_bill} onChange={handleSelectChange}>
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3 col-md-6" controlId="licenceshippingbill">
                                    <Form.Label>ADVANCE LICENCE SHIPPING BILL</Form.Label>
                                    <Form.Select name="licenceshippingbill" value={custData.licenceshippingbill} onChange={handleSelectChange}>
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                            </Row>
                            <Row className='g-2'>
                                <Form.Group as={Col} className="mb-3 col-md-6" controlId="rebate_of_state_levies">
                                    <Form.Label>ROSL (Rebate of State Levies)</Form.Label>
                                    <Form.Select name="rebate_of_state_levies" value={custData.rebate_of_state_levies} onChange={handleSelectChange}>
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3 col-md-6" controlId="repair_and_return">
                                    <Form.Label>REPAIR & RETURN</Form.Label>
                                    <Form.Select name="repair_and_return" value={custData.repair_and_return} onChange={handleSelectChange}>
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                            </Row>
                            <Row className='g-2'>
                                <Form.Group as={Col} className="mb-3 col-md-6" controlId="advance_authorization">
                                    <Form.Label>Advance Authorization (AA)</Form.Label>
                                    <Form.Select name="advance_authorization" value={custData.advance_authorization} onChange={handleSelectChange}>
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3 col-md-6" controlId="drwaback_or_rosctl">
                                    <Form.Label>Drwaback/ ROSCTL</Form.Label>
                                    <Form.Select name="drwaback_or_rosctl" value={custData.drwaback_or_rosctl} onChange={handleSelectChange}>
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                            </Row>
                            <Row className='g-2'>
                                <Form.Group as={Col} className="mb-3 col-md-6" controlId="epcg">
                                    <Form.Label>EPCG (Concesnal or Zero Duty)</Form.Label>
                                    <Form.Select name="epcg" value={custData.epcg} onChange={handleSelectChange}>
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3 col-md-6" controlId="nfei">
                                    <Form.Label>NFEI</Form.Label>
                                    <Form.Select name="nfei" value={custData.nfei} onChange={handleSelectChange}>
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                            </Row>
                            <Row className='g-2'>
                                <Form.Group as={Col} className="mb-3 col-md-6" controlId="evd">
                                    <Form.Label>EVD</Form.Label>
                                    <Form.Select name="evd" value={custData.evd} onChange={handleSelectChange}>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                            </Row>
                            <Row className='g-2'>
                                <Form.Group as={Col} className="mb-3 col-md-6" controlId="jobbing">
                                    <Form.Label>Jobbing</Form.Label>
                                    <Form.Select name="jobbing" value={custData.jobbing} onChange={handleSelectChange}>
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3 col-md-6" controlId="re_export">
                                    <Form.Label>Re-Export</Form.Label>
                                    <Form.Select name="re_export" value={custData.re_export} onChange={handleSelectChange}>
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                            </Row>
                            <Row className='g-2'>
                                <Form.Group as={Col} className="mb-3 col-md-6" controlId="sdf_fema_declaration">
                                    <Form.Label>SDF_FEMA_Declaration</Form.Label>
                                    <Form.Select name="sdf_fema_declaration" value={custData.sdf_fema_declaration} onChange={handleSelectChange}>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                            </Row>
                            <Row className='g-2'>
                                <Form.Group as={Col} className="mb-3 col-md-6" controlId="drawback_epcg">
                                    <Form.Label>Drawback + EPCG</Form.Label>
                                    <Form.Select name="drawback_epcg" value={custData.drawback_epcg} onChange={handleSelectChange}>
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3 col-md-6" controlId="eou">
                                    <Form.Label>EOU</Form.Label>
                                    <Form.Select name="eou" value={custData.eou} onChange={handleSelectChange}>
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                            </Row>
                            <Row className='g-2'>
                                <Form.Group as={Col} className="mb-3 col-md-6" controlId="mesi">
                                    <Form.Label>RoDTEP</Form.Label>
                                    <Form.Select name="mesi" value={custData.mesi} onChange={handleSelectChange}>
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3 col-md-6" controlId="any_other">
                                    <Form.Label>AnyOther</Form.Label>
                                    <Form.Select name="any_other" value={custData.any_other} onChange={handleSelectChange}>
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                            </Row>

                            <hr className='border border-danger border-1'/>
                            <Card.Title as="h4" className="text-danger">Annexure A</Card.Title>

                            <Row className='g-2 border border-dark'>
                                <Form.Group as={Col} className="mb-3 col-md-6 px-2" controlId="nature_of_transaction">
                                    <Form.Label>Nature OF Transaction</Form.Label>
                                    <Form.Select name="nature_of_transaction" value={custData.nature_of_transaction} onChange={handleSelectChange}>
                                        <option value="Sale on Consignment">Sale on Consignment</option>
                                        <option value="Sale">Sale</option>
                                        <option value="Gift">Gift</option>
                                        <option value="Basic Sample">Basic Sample</option>
                                        <option value="Other">Other</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3 col-md-6 px-2" controlId="method_of_valuation">
                                    <Form.Label>Method Of Valuation</Form.Label>
                                    <Form.Select name="method_of_valuation" value={custData.method_of_valuation} onChange={handleSelectChange}>
                                        <option value="Rule 4">Rule 4</option>
                                        <option value="Rule 3">Rule 3</option>
                                        <option value="Rule 5">Rule 5</option>
                                        <option value="Rule 6">Rule 6</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group as={Col} className="mb-3 col-md-6 px-2" controlId="buyer_saller_related">
                                    <Form.Label>Buyer Seller Related</Form.Label>
                                    <Form.Select name="buyer_saller_related" value={custData.buyer_saller_related} onChange={handleSelectChange}>
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3 col-md-6 px-2" controlId="buyersallerprice">
                                    <Form.Label>Buyer Seller Relation Affect Price</Form.Label>
                                    <Form.Select name="buyersallerprice" value={custData.buyersallerprice} onChange={handleSelectChange}>
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                            </Row>

                            <hr className='border border-danger border-1'/>
                            <Card.Title as="h4" className="text-danger">Annexure C1</Card.Title>

                            <Row className='g-2 border border-dark'>
                                <Form.Group as={Col} className="mb-3 col-md-12 px-2" controlId="dbk_sl_no">
                                    <Form.Label>DBK SL NO</Form.Label>
                                    <Form.Control type="text" name="dbk_sl_no" value={custData.dbk_sl_no} onChange={handleChange} />
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3 col-md-12 px-2" controlId="regnnoanddtofepcglic">
                                    <Form.Label>REGN NO. & DT OF EPCG LIC, COPY OF EPCG LIC / REGN COPY</Form.Label>
                                    <Form.Control type="text" name="regnnoanddtofepcglic" value={custData.regnnoanddtofepcglic} onChange={handleChange} />
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3 col-md-12 px-2" controlId="regnnodtepcglicregcopy">
                                    <Form.Label>REGN NO. & DT OF ADV LIC, COPY OF LIC / REGN COPY,CONSUMPTION SHEET</Form.Label>
                                    <Form.Control type="text" name="regnnodtepcglicregcopy" value={custData.regnnodtepcglicregcopy} onChange={handleChange} />
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3 col-md-12 px-2" controlId="noadditionaldocrequire">
                                    <Form.Label>No Additional Doc Required</Form.Label>
                                    <Form.Control type="text" name="noadditionaldocrequire" value={custData.noadditionaldocrequire} onChange={handleChange} />
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3 col-md-12 px-2" controlId="orginable">
                                    <Form.Label>ORGINAL B/E, IMP INV/PKG LIST/GR WAIVER ON GR FORM,CHARTERED ENGG CERTIFICATE, EXPORT INV/PKG LIST</Form.Label>
                                    <Form.Control type="text" name="orginable" value={custData.orginable} onChange={handleChange} />
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                            </Row>

                            <Row className='g-2'>
                                <Form.Group as={Col} className="mb-3 col-md-6" controlId="invoice_copies">
                                    <Form.Label>INVOICE (6 COPIES)</Form.Label>
                                    <Form.Select name="invoice_copies" value={custData.invoice_copies} onChange={handleSelectChange}>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                            </Row>
                            <Row className='g-2'>
                                <Form.Group as={Col} className="mb-3 col-md-6" controlId="packing_list_copies">
                                    <Form.Label>PACKING LIST (4 COPIES)</Form.Label>
                                    <Form.Select name="packing_list_copies" value={custData.packing_list_copies} onChange={handleSelectChange}>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3 col-md-6" controlId="non_dg_declaration">
                                    <Form.Label>NON-DG DECLARATION</Form.Label>
                                    <Form.Select name="non_dg_declaration" value={custData.non_dg_declaration} onChange={handleSelectChange}>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                            </Row>
                            <Row className='g-2'>
                                <Form.Group as={Col} className="mb-3 col-md-6" controlId="lab_analysis_report">
                                    <Form.Label>LAB ANALYSIS REPORT</Form.Label>
                                    <Form.Select name="lab_analysis_report" value={custData.lab_analysis_report} onChange={handleSelectChange}>
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3 col-md-6" controlId="msds">
                                    <Form.Label>MSDS</Form.Label>
                                    <Form.Select name="msds" value={custData.msds} onChange={handleSelectChange}>
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                            </Row>
                            <Row className='g-2'>
                                <Form.Group as={Col} className="mb-3 col-md-6" controlId="phytosanitary_cert">
                                    <Form.Label>PHYTOSANITARY CERT</Form.Label>
                                    <Form.Select name="phytosanitary_cert" value={custData.phytosanitary_cert} onChange={handleSelectChange}>
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3 col-md-6" controlId="visa_aepc_endorsement">
                                    <Form.Label>VISA/AEPC ENDORSEMENT</Form.Label>
                                    <Form.Select name="visa_aepc_endorsement" value={custData.visa_aepc_endorsement} onChange={handleSelectChange}>
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                            </Row>
                            <Row className='g-2'>
                                <Form.Group as={Col} className="mb-3 col-md-6" controlId="letter_to_dc">
                                    <Form.Label>LETTER TO DC</Form.Label>
                                    <Form.Select name="letter_to_dc" value={custData.letter_to_dc} onChange={handleSelectChange}>
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3 col-md-6" controlId="gspcertificateoforigin">
                                    <Form.Label>GSP/ Certificate of origin</Form.Label>
                                    <Form.Select name="gspcertificateoforigin" value={custData.gspcertificateoforigin} onChange={handleSelectChange}>
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                            </Row>
                            <Row className='g-2'>
                                <Form.Group as={Col} className="mb-3 col-md-6" controlId="bank_certificate">
                                    <Form.Label>Bank Certificate (GR waiver)</Form.Label>
                                    <Form.Select name="bank_certificate" value={custData.bank_certificate} onChange={handleSelectChange}>
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3 col-md-6" controlId="annexure_a">
                                    <Form.Label>Annexure A</Form.Label>
                                    <Form.Select name="annexure_a" value={custData.annexure_a} onChange={handleSelectChange}>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                            </Row>
                            <Row className='g-2 border border-dark'>
                                <Form.Group as={Col} className="mb-3 col-md-12 px-2" controlId="invitemnumberregno">
                                    <Form.Label>Inv Item Number REG NO</Form.Label>
                                    <Form.Control type="text" name="invitemnumberregno" value={custData.invitemnumberregno} onChange={handleChange} />
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3 col-md-12 px-2" controlId="invitemnumberregnodate">
                                    <Form.Label>Inv Item Number REG NO Date</Form.Label>
                                    <Form.Control type="text" name="invitemnumberregnodate" value={custData.invitemnumberregnodate} onChange={handleChange} />
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3 col-md-12 px-2" controlId="authorization_epcg">
                                    <Form.Label>Advance Authorization/ EPCG File No. , LIC No. & Date</Form.Label>
                                    <Form.Control type="text" name="authorization_epcg" value={custData.authorization_epcg} onChange={handleChange} />
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                            </Row>
                            <Row className='g-2'>
                                <Form.Group as={Col} className="mb-3" controlId="preferentialagreement">
                                    <Form.Label>Details Of Preferential Agreement Details Wise</Form.Label>
                                    <Form.Control as="textarea" rows={3} placeholder="If Applicable" name="preferentialagreement" value={custData.preferentialagreement} onChange={handleChange} />
                                    <Form.Control.Feedback type="invalid">Please enter terms and conditions.</Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3" controlId="standardunitdetails">
                                    <Form.Label>Standard Unit Quantity Details Wise</Form.Label>
                                    <Form.Control as="textarea" rows={3} placeholder="If Applicable" name="standardunitdetails" value={custData.standardunitdetails} onChange={handleChange} />
                                    <Form.Control.Feedback type="invalid">Please enter terms and conditions.</Form.Control.Feedback>
                                </Form.Group>
                            </Row>
                            <Row className='g-2'>
                                <Form.Group as={Col} className="mb-3" controlId="state_of_origin_item">
                                    <Form.Label>State Of Origin Item Wise</Form.Label>
                                    <Form.Control as="textarea" rows={3} placeholder="If Applicable" name="state_of_origin_item" value={custData.state_of_origin_item} onChange={handleChange} />
                                    <Form.Control.Feedback type="invalid">Please enter terms and conditions.</Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3" controlId="districtoforiginitem">
                                    <Form.Label>District Of Origin Item Wise</Form.Label>
                                    <Form.Control as="textarea" rows={3} placeholder="If Applicable" name="districtoforiginitem" value={custData.districtoforiginitem} onChange={handleChange} />
                                    <Form.Control.Feedback type="invalid">Please enter terms and conditions.</Form.Control.Feedback>
                                </Form.Group>
                            </Row>
                            <Row className='g-2'>
                                <Form.Group as={Col} className="mb-3" controlId="extratermsconditions">
                                    <Form.Label>Extra Terms and Conditions</Form.Label>
                                    <Form.Control as="textarea" rows={3} placeholder="If Applicable" name="extratermsconditions" value={custData.extratermsconditions} onChange={handleChange} />
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3" controlId="advathoepcddtlregno">
                                    <Form.Label>Adv Atho EPCG Dtl REG No</Form.Label>
                                    <Form.Control type="text" placeholder="If Applicable" name="advathoepcddtlregno" value={custData.advathoepcddtlregno} onChange={handleChange} />
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                            </Row>
                            <Row className='d-flex text-center'>
                                <Col className='mb-4'>
                                    <Button variant="secondary" className='mx-2' onClick={handleInvoiceList}>Close</Button>
                                    <Button variant="primary" className='mx-2' loading={loading} loadingPosition="start" type="submit">{isEditing ? 'Update' : 'Add'}</Button>
                                </Col>
                            </Row>
                        </Form>
                    </Row>

                </Card.Body>
            </Card>


            <ToastContainer className='py-0' />
        </>
    );
};

export default InvoiceForm;
