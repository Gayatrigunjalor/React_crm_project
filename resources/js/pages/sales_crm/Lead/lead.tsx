import {
    faPlus,
    faEye,
    faUserPlus,
    faFileExport

} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Pagination from "react-bootstrap/Pagination";
import FifthMain from "../QuotationSend/QuotationSend";
import AddLeadForm from "./AddLeadForm";
import {
    DropdownButton,
    Form,
    Button,
    Col,
    Dropdown,
    Nav,
    Row,
    Tab,
    Table,
    Modal,
    Spinner,
} from "react-bootstrap";
import { useEffect, useState, useRef } from "react";
import axiosInstance from "../../../axios";
import { useNavigate, Link } from "react-router-dom";
import { FaFilter, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import LeadDetailsModal from "./LeadDetailsModal";
import Badge from "../../../components/base/Badge";
import DatePicker from "../../../components/base/DatePicker";
import SearchBox from '../../../../js/components/common/SearchBox';
import Select from 'react-select';
import { ColumnDef } from '@tanstack/react-table';
import AdvanceTable from '../../../../js/components/base/AdvanceTable';
import AdvanceTableFooter from '../../../../js/components/base/AdvanceTableFooter';
import useAdvanceTable from '../../../../js/hooks/useAdvanceTable';
import AdvanceTableProvider from '../../../../js/providers/AdvanceTableProvider';
import { format } from 'date-fns';
import { FaTimes } from 'react-icons/fa';
import { useAuth } from '../../../AuthContext';

interface Lead {
    id: number;
    unique_query_id: string;
    sender_name: string;
    sender_mobile: string;
    sender_email: string;
    query_product_name: string;
    sender_company: string;
    sender_country_iso: string;
    platform: string;
    qualified: number;
    query_time: string;
    disqualified: number;
    created_at: string;
    query_type: string;
}

type Customer = {
    id: number;
    sender_name: string;
    sender_mobile: string;
    sender_email: string;
};
type Contact = {
    id: number;
    contact_person_name: string;
};

interface LeadDetail {
    assigned_date: string;
    salesperson_name: string;
    platform: string;
    total_leads: number;
}

const LeadManagement = () => {
    const [qualifiedLeads, setQualifiedLeads] = useState<Lead[]>([]);
    const [disqualifiedLeads, setDisqualifiedLeads] = useState<Lead[]>([]);
    const [allLeads, setAllLeads] = useState<Lead[]>([]);
    const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
    const [qualified, setQualified] = useState<Lead[]>([]);
    const [disqualified, setDisqualified] = useState<Lead[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedPlatform, setSelectedPlatform] = useState<string>("");
    const [selectedCountry, setSelectedCountry] = useState<string>("");
    const [selectedLeadType, setSelectedLeadType] = useState<string>("");
    const [showPopup, setShowPopup] = useState(false);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [dataReady, setDataReady] = useState(false);
    const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedContactPerson, setSelectedContactPerson] = useState(null);
    const [alertMessage, setAlertMessage] = useState("");
    const [activeTab, setActiveTab] = useState("all"); // State to track the active tab
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1); // Tracks the current page
    const [availableCountries, setAvailableCountries] = useState<string[]>([]);
    const [availableLeadTypes, setAvailableLeadTypes] = useState<string[]>([]);
    const [filteredLeadsByDate, setFilteredLeadsByDate] = useState<Lead[]>([]);
    const [selectedStartDate, setSelectedStartDate] = useState(null);
    const [selectedEndDate, setSelectedEndDate] = useState(null);
    const [dateRangeText, setDateRangeText] = useState("Filter by Date");
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [contactPersons, setContactPersons] = useState<Contact[]>([]);
    const [exportType, setExportType] = useState('all');
    const [loadingLeads, setLoadingLeads] = useState(true);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<{ value: string; label: string; }[]>([]);
    const [selectedDates, setSelectedDates] = useState([]);
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [qualifiedLen, setQualifyLen] = useState(null);
    const [disqualifiedLen, setDisqualifyLen] = useState(null);
    const [allLeadsLen, setallLeadsLen] = useState(null);
    const [leadDetails, setLeadDetails] = useState<Record<string, LeadDetail[]>>({});
    const { userPermission } = useAuth();
    console.log("userPermission", userPermission.customer_view_list);
    const userRole = localStorage.getItem('user_role');
  const isAdmin = userRole !== null && userRole.replace(/"/g, '') === "ADMIN";
    const pageSize = 10;
    const totalPages = Math.ceil(allLeads.length / pageSize);
    const paginatedLeads = allLeads.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const [filteredQualifiedCount, setFilteredQualifiedCount] = useState(0);
    const [filteredDisqualifiedCount, setFilteredDisqualifiedCount] = useState(0);
    const [filteredAllCount, setFilteredAllCount] = useState(0);




    const formatDate = (dateString: string | undefined | null) => {
        if (!dateString) return ""; // Handle null or undefined values

        const date = new Date(dateString);
        return date.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const handleExport = async (type) => {
        setExportType(type);
        const token = localStorage.getItem('token');
        const cleanToken = token && token.split('|')[1];

        try {
            const params = {};
            if (type === 'qualified') {
                params.type = 'qualified';
            } else if (type === 'disqualified') {
                params.type = 'disqualified';
            } else if (type === 'all') {
                params.type = 'all';
            }

            const queryString = new URLSearchParams(params).toString();
            const url = `/leads/export${queryString ? `?${queryString}` : ''}`;

            const response = await axiosInstance.get(url, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${cleanToken}`,
                },
                responseType: 'blob',
            });

            // Generate dynamic file name with the current date and time
            const now = new Date();
            const formattedDate = now.toISOString().replace(/T/, '_').replace(/\..+/, '');

            let fileName = 'leads_';
            if (type === 'qualified') {
                fileName += `qualified_${formattedDate}.xlsx`;
            } else if (type === 'disqualified') {
                fileName += `disqualified_${formattedDate}.xlsx`;
            } else {
                fileName += `all_${formattedDate}.xlsx`;
            }

            // Create a URL for the blob data
            const fileURL = window.URL.createObjectURL(new Blob([response.data]));
            const a = document.createElement('a');
            a.href = fileURL;
            a.download = fileName; // Use the dynamic file name
            a.click();

        } catch (error) {
            console.error('Error exporting:', error);
            // Handle error, e.g., display an error message
        }
    };

    const platformDisplayMap = {
        "TradeIndia": "TradeInquiry",
        "Purvee": "CH-i7PRV",
        "Vortex": "CH-i7VX",
        "Inorbvict": "CH-i7IRB",

    };

    const fetchLeads = async () => {
        setLoading(true);
        setDataReady(false);
        try {
            const response = await axiosInstance.get("/lead", {
                // timeout: 15000, 
            });
            const data = response.data;
            setQualifyLen(data.qualifiedLeads.length);
            setDisqualifyLen(data.disqualifiedLeads.length);
            setallLeadsLen(data.allLeads.length);
            // Process data safely
            const allLeads = data.allLeads || [];
            setAllLeads(allLeads);
            setQualifiedLeads(allLeads.filter((lead) => lead.qualified));
            setDisqualifiedLeads(allLeads.filter((lead) => lead.disqualified));

            // Extract unique countries
            const uniqueCountries = [...new Set(allLeads.map((lead: Lead) => lead.sender_country_iso).filter(Boolean))];
            setAvailableCountries(uniqueCountries);

            // const uniqueLeadTypes = [...new Set(allLeads.map((lead: Lead) => lead.query_type).filter(Boolean))];
            const uniqueLeadTypes = [...new Set(
                allLeads.map((lead: Lead) => {
                    return lead.query_type === "BUY" || lead.query_type === "B" ? "Buy" : lead.query_type;
                }).filter(Boolean)
            )];
            setAvailableLeadTypes(uniqueLeadTypes);

            filterLeadsByTab(allLeads);
            setDataReady(true);
        } catch (err: any) {
            setError("Error fetching leads: " + err.message);
        } finally {
            // Only set loading to false if data is ready
            if (dataReady) {
                setLoading(false);
            }
        }
    };
    useEffect(() => {
        fetchLeads();
    }, []);

    useEffect(() => {
        const fetchCustomers = async () => {
            setLoading(true);
            const token = localStorage.getItem('token');
            const cleanToken = token && token.split('|')[1];

            // Define the body content


            try {
                const response = await axiosInstance.get("/sales_customer_list", {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${cleanToken}`,
                    },
                });


                const data = response.data;
                setCustomers(data.customer_list);

            } catch (error) {
                console.error("Error :", error);

            } finally {
                setLoading(false);
            }
        };

        fetchCustomers();
    }, []);

    const columns: ColumnDef<Lead>[] = [
        {
            accessorKey: 'query_type',
            header: 'Lead Type',
            meta: {
                headerProps: {
                    style: { fontWeight: '700' }
                },
                cellProps: {
                    style: { fontFamily: 'Nunito Sans, sans-serif' },
                },
            },
            // Custom rendering of cell content
            cell: ({ row }) => {
                const value = row.getValue('query_type');

                switch (value) {
                    case 'W':
                        return 'Direct Enquiries';
                    case 'B':
                    case 'BUY':
                        return 'Buy-Leads';
                    case 'P':
                        return 'PNS Calls';
                    case 'V':
                    case 'BIZ':
                        return 'Catalog-view Leads';
                    case 'WA':
                        return 'WhatsApp Enquiries';
                    default:
                        return value || 'No Data'; // Default to 'No Data' if value is empty
                }
            }
        },



        {
            accessorKey: 'unique_query_id', header: 'Opportunity ID', meta: {
                headerProps: {
                    style: { fontWeight: '700' }
                },
                cellProps: {
                    style: { fontFamily: 'Nunito Sans, sans-serif' },
                }

            }
        },
        {
            accessorKey: 'sender_name', header: 'Customer Name', meta: {
                headerProps: {
                    style: { fontWeight: '700' }
                },
                cellProps: {
                    style: { fontFamily: 'Nunito Sans, sans-serif' },
                }
            }
        },
        {
            accessorKey: 'sender_mobile', header: 'Customer Mobile', meta: {
                headerProps: {
                    style: { fontWeight: '700' }
                },
                cellProps: {
                    style: { fontFamily: 'Nunito Sans, sans-serif' },
                }
            }
        },
        {
            accessorKey: 'sender_email', header: 'Customer Email', meta: {
                headerProps: {
                    style: { fontWeight: '700' }
                },
                cellProps: {
                    style: { fontFamily: 'Nunito Sans, sans-serif' },
                }
            }
        },
        {
            accessorKey: 'query_product_name', header: 'Product Name', meta: {
                headerProps: {
                    style: { fontWeight: '700' }
                },
                cellProps: {
                    style: { fontFamily: 'Nunito Sans, sans-serif' },
                }
            }
        },
        {
            accessorKey: 'sender_company', header: 'Company Name', meta: {
                headerProps: {
                    style: { fontWeight: '700' }
                },
                cellProps: {
                    style: { fontFamily: 'Nunito Sans, sans-serif' },
                }
            }
        },
        {
            accessorKey: 'sender_country_iso', header: 'Country',
            meta: {
                headerProps: {
                    style: { fontWeight: '700' }
                },
                cellProps: {
                    style: { fontFamily: 'Nunito Sans, sans-serif' },
                }
            }
        },
        {
            accessorKey: 'platform', header: 'Lead Source',
            meta: {
                headerProps: {
                    style: { fontWeight: '700' }
                },
                cellProps: {
                    style: { fontFamily: 'Nunito Sans, sans-serif' },
                }
            },
            cell: ({ getValue }) => {
                const platform = getValue();
                if (platform === 'Purvee') return 'CH-i7PRV';
                if (platform === 'Vortex') return 'CH-i7VX';
                if (platform === 'Inorbvict') return 'CH-i7IRB';
                if (platform === 'TradeIndia') return 'TradeInquiry';
                return platform; // fallback to original if no match
            }
        },
        {
            accessorKey: 'query_time', header: 'Date',
            cell: ({ row }) => {
                const createdAt = row.original.query_time;
                return formatDate(createdAt); // Call formatTime utility function

            },
            meta: {
                headerProps: {
                    style: { fontWeight: '700' }
                },
                cellProps: {
                    style: { fontFamily: 'Nunito Sans, sans-serif' },
                }
            }
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row: { original } }) => (
                <div className="d-flex gap-2">
                    <Button
                        variant="link"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(original.id);
                        }}
                    >
                        <FontAwesomeIcon icon={faEye} />
                    </Button>

                    <Button
                        variant="link"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleButtonClick(original.id);
                        }}
                    >
                        <FontAwesomeIcon icon={faUserPlus} />
                    </Button>
                    {activeTab !== 'qualified' && (
                        <Button
                            variant="link"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleConvertToQuality(String(original.id)); // Convert to string
                            }}

                        >
                            CTQ
                        </Button>
                    )}



                </div>
            ),
            meta: {
                headerProps: {
                    style: { fontWeight: '700' }
                },
                cellProps: {
                    style: { fontFamily: 'Nunito Sans, sans-serif' },
                }
            }
        },
    ];

    const table = useAdvanceTable({
        data: filteredLeads,
        columns,
        pageSize: pageSize,
        pagination: true,
        selection: false,
        sortable: true,
    });

    const handlePageChange = (page: number): void => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };


    const handleBadgeClick = () => {
        navigate('/viewCustomer'); // Navigate to the viewCustomer route
    };

    const handleLeadsBadgeClick = () => {
        navigate('/viewAssigneeLeads');
    };
    const handleAssignBadgeClick = () => {
        setShowAssignModal(true); // Show the modal when badge is clicked
    };

    const handleCloseModal = () => {
        setShowAssignModal(false); // Close the modal
    };

    const [markedDates, setMarkedDates] = useState([]);

    const [popupDate, setPopupDate] = useState<string | null>(null);
    const [showPopup2, setShowPopup2] = useState(false);
    const datePickerRef = useRef<any>(null);
    useEffect(() => {
        if (!selectedAccount || !selectedAccount.label || !leadDetails) return;

        const filteredMarked = {};

        Object.entries(leadDetails).forEach(([date, leads]) => {
            // Map the selected account label to the corresponding platform value
            let platformValue = selectedAccount.value;
            switch (selectedAccount.label) {
                case 'CH-i7PRV':
                    platformValue = 'Purvee';
                    break;
                case 'CH-i7VX':
                    platformValue = 'Vortex';
                    break;
                case 'CH-i7IRB':
                    platformValue = 'Inorbvict';
                    break;
                case 'CH-T9IM':
                    platformValue = 'IndiaMart';
                    break;
                case 'TradeInquiry':
                    platformValue = 'TradeIndia';
                    break;
                default:
                    platformValue = selectedAccount.value;
            }

            const filteredLeads = leads.filter(
                (lead) => lead.platform === platformValue
            );

            if (filteredLeads.length > 0) {
                filteredMarked[date] = filteredLeads.map((lead) => {
                    let platformLabel = lead.platform;
                    switch (lead.platform) {
                        case 'purvee':
                            platformLabel = 'CH-i7PRV';
                            break;
                        case 'Vortex':
                            platformLabel = 'CH-i7VX';
                            break;
                        case 'Inorbvict':
                            platformLabel = 'CH-i7IRB';
                            break;
                        case 'IndiaMart':
                            platformLabel = 'CH-T9IM';
                            break;
                        case 'TradeIndia':
                            platformLabel = 'TradeInquiry';
                            break;
                        default:
                            platformLabel = lead.platform;
                    }
                    return `Platform: ${platformLabel}\nSalesperson: ${lead.salesperson_name}\nLeads: ${lead.total_leads}`;
                });
            }
        });

        setMarkedDates(filteredMarked);
        setSelectedDates([]); // Reset selected dates
    }, [selectedAccount, leadDetails]);
    useEffect(() => {
        const calendarElement = document.querySelector(".flatpickr-calendar");
        if (calendarElement) {
            calendarElement.style.display = showPopup2 ? "none" : "block";
        }
    }, [showPopup2]);
    const fetchAssigneLeadDates = async () => {
        if (!showAssignModal) return;

        try {
            const response = await axiosInstance.get("/getAssignedLeadDates");
            const rawData = response.data.data;
            console.log("Response date data*****", response.data.data);

            // Group by date
            const groupedByDate: Record<string, LeadDetail[]> = {};
            const marked: Record<string, string[]> = {};

            rawData.forEach((entry: LeadDetail) => {
                const date = entry.assigned_date;
                if (!groupedByDate[date]) {
                    groupedByDate[date] = [];
                }
                groupedByDate[date].push(entry);
            });

            // Create formatted tooltip data
            Object.entries(groupedByDate).forEach(([date, leads]) => {
                marked[date] = leads.map(lead => {
                    // Map the platform to the correct label
                    let platformLabel = lead.platform;
                    switch (lead.platform) {
                        case 'Purvee':
                            platformLabel = 'CH-i7PRV';
                            break;
                        case 'Vortex':
                            platformLabel = 'CH-i7VX';
                            break;
                        case 'Inorbvict':
                            platformLabel = 'CH-i7IRB';
                            break;
                        case 'IndiaMart':
                            platformLabel = 'CH-T9IM';
                            break;
                        case 'TradeIndia':
                            platformLabel = 'TradeInquiry';
                            break;
                        default:
                            platformLabel = lead.platform;
                    }
                    return `Platform: ${platformLabel}\nSalesperson: ${lead.salesperson_name}\nLeads: ${lead.total_leads}`;
                });
            });
            setMarkedDates(marked);
            setLeadDetails(groupedByDate);

        } catch (err: any) {
            setError("Error fetching leads: " + err.message);
        }
    };
    useEffect(() => {
        fetchAssigneLeadDates();
    }, [showAssignModal]);

    const handleAssignLeads = async () => {
        const token = localStorage.getItem('token');
        const cleanToken = token && token.split('|')[1];

        // Debug logs
        console.log("Selected dates before validation:", selectedDates);
        console.log("Selected dates type:", typeof selectedDates);
        console.log("Is array?", Array.isArray(selectedDates));

        // Validate required fields
        if (!selectedAccount) {
            toast.error("Please select an account");
            return;
        }

        if (!selectedDates || !Array.isArray(selectedDates) || selectedDates.length === 0) {
            toast.error("Please select at least one date");
            return;
        }

        if (!selectedEmployees) {
            toast.error("Please select a sales person");
            return;
        }

        const platform = selectedAccount ? [selectedAccount.value] : [];
        console.log("Selected platform:", platform);

        // Ensure dates are properly formatted and valid
        const dates = selectedDates
            .filter(date => date instanceof Date && !isNaN(date.getTime()))
            .map(date => {
                try {
                    return format(new Date(date), 'yyyy-MM-dd');
                } catch (error) {
                    console.error("Error formatting date:", error);
                    return null;
                }
            })
            .filter(date => date !== null);

        console.log("Final formatted dates:", dates); // Debug log

        if (dates.length === 0) {
            toast.error("Invalid date selection");
            return;
        }

        const salesperson_id = selectedEmployees ? selectedEmployees.value : null;

        try {
            const response = await axiosInstance.post('/assignLeadToSalesperson2',
                {
                    dates: dates,
                    platforms: platform,
                    salesperson_id: salesperson_id
                },
                {
                    headers: {
                        'Authorization': `Bearer ${cleanToken}`,
                    }
                }
            );

            console.log('Leads assigned successfully:', response.data);
            toast.success(response.data.message);
            handleCloseModal();

        } catch (error) {
            console.log("Caught Error:", error);
            console.log("Error Response:", error.data.message);
            toast.error(error.data.message || "Something went wrong!");
        }
    };

    useEffect(() => {
        filterLeadsByTab(allLeads);
        setFilteredQualifiedCount(getFilteredCount(allLeads, "qualified"));
        setFilteredDisqualifiedCount(getFilteredCount(allLeads, "disqualified"));
        setFilteredAllCount(getFilteredCount(allLeads, "all"));
    }, [allLeads, activeTab, searchQuery, selectedPlatform, selectedCountry, selectedStartDate, selectedEndDate, selectedCustomer, selectedLeadType]);


    const filterLeadsByTab = (leads: Lead[]) => {
        let leadsToFilter = leads;

        switch (activeTab) {
            case "qualified":
                leadsToFilter = qualifiedLeads;
                break;
            case "disqualified":
                leadsToFilter = disqualifiedLeads;
                break;
            case "all":
            default:
                leadsToFilter = leads;
                break;
        }

        leadsToFilter = filterLeads(leadsToFilter); // Apply search filter
        leadsToFilter = filterByPlatform(leadsToFilter); // Apply platform filter
        leadsToFilter = filterByCountry(leadsToFilter); // Apply country filter
        leadsToFilter = filterByDate(leadsToFilter);
        leadsToFilter = filterByCustomer(leadsToFilter);
        leadsToFilter = filterByLeadType(leadsToFilter);

        setFilteredLeads(leadsToFilter);

        setCurrentPage(1);
    };

    const filterLeads = (leads: Lead[]) => {
        if (!searchQuery) return leads;

        const query = searchQuery.toLowerCase();

        return leads.filter((lead) => {
            return (
                (lead.sender_name?.toLowerCase().includes(query)) || // Use optional chaining (?.)
                (lead.query_product_name?.toLowerCase().includes(query)) ||
                (lead.sender_email?.toLowerCase().includes(query)) ||
                (lead.sender_mobile?.toLowerCase().includes(query)) ||
                (lead.sender_company?.toLowerCase().includes(query)) ||
                (lead.unique_query_id?.toLowerCase().includes(query)) ||
                (lead.sender_country_iso?.toLowerCase().includes(query))
            );
        });
    };

    const filterByPlatform = (leads: Lead[]) => {
        return selectedPlatform ? leads.filter((lead) => lead.platform === selectedPlatform) : leads;
    };

    const filterByCountry = (leads: Lead[]) => {
        return selectedCountry ? leads.filter((lead) => lead.sender_country_iso === selectedCountry) : leads;
    };

    // const filterByLeadType = (leads: Lead[]) => {
    //     return selectedLeadType ? leads.filter((lead) => lead.query_type === selectedLeadType) : leads;
    // };
    const filterByLeadType = (leads: Lead[]) => {
        if (!selectedLeadType) return leads; // No filter applied

        return leads.filter((lead) => {
            if (selectedLeadType === "Buy") {
                return lead.query_type === "BUY" || lead.query_type === "B"; // Include both
            }
            return lead.query_type === selectedLeadType; // Default filter
        });
    };

    const filterByDate = (leads: Lead[]) => {
        if (!selectedStartDate || !selectedEndDate) {
            return leads;
        }

        const startDate = new Date(selectedStartDate);
        const endDate = new Date(selectedEndDate);
        endDate.setHours(23, 59, 59, 999); // Set end of day

        return leads.filter((lead) => {
            // const leadDate = new Date(lead.created_at);custo
               const leadDate = new Date(lead.query_time);
            return leadDate >= startDate && leadDate <= endDate;
        });
    };


    // const handleDateRangeChange = (startDate, endDate) => {
    //     setSelectedStartDate(startDate);
    //     setSelectedEndDate(endDate);
    //     setDateRangeText(
    //         startDate && endDate
    //             ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
    //             : "Filter by Date"
    //     );
    // };


    // Handle date changes
    const handleDateRangeChange = (start: Date | null, end: Date | null) => {
        setSelectedStartDate(start);
        setSelectedEndDate(end);
    };

    // Clear both dates
    const clearDateFilter = () => {
        setSelectedStartDate(null);
        setSelectedEndDate(null);
    };
    const handleFilter = (platform: string) => {
        setSelectedPlatform(platform);
    };

    // const handleCountrySelect = (country: string) => {
    //     setSelectedCountry(country);
    //     setShowCountryModal(false);
    // };
    const handleCountrySelect = (selectedOption) => {
        setSelectedCountry(selectedOption ? selectedOption.value : null); // Extract value
        setShowCountryModal(false); // Close the modal *after* setting the state
    };
    // const handleLeadTypeSelect = (selectedOption) => {
    //     setSelectedLeadType(selectedOption ? selectedOption.value : null); // Extract value
    //     setShowCountryModal(false); // Close the modal *after* setting the state
    // };
    const handleLeadTypeSelect = (selectedOption) => {
        if (selectedOption) {
            // Normalize the value: if "BUY" or "B" is selected, treat it as "Buy"
            const normalizedValue = selectedOption.value === "BUY" || selectedOption.value === "B" ? "Buy" : selectedOption.value;
            setSelectedLeadType(normalizedValue);
        } else {
            setSelectedLeadType(null);
        }
        setShowCountryModal(false);
    };
    const handleRowClick = (leadId: number, customerId: number, salespersonId: string,unique_query_id:string) => {
        localStorage.setItem('salesperson_id', salespersonId);
        navigate(`/sales_crm/inquiryRecived/MainSection/${leadId}/${customerId}/${unique_query_id}`);
    };
    const tableContainerRef = useRef<HTMLDivElement>(null); // Ref for the table container


    // handl ctq

    const handleQualifyLead = (leadId: number) => {
        setDisqualifiedLeads(
            disqualifiedLeads.filter((lead) => lead.id !== leadId)
        );
        const leadToQualify = disqualifiedLeads.find(
            (lead) => lead.id === leadId
        );
        if (leadToQualify) {
            setQualifiedLeads([...qualifiedLeads, leadToQualify]);
        }
        setDisqualifiedLeads(
            disqualifiedLeads.filter((lead) => lead.id !== leadId)
        );
    };

    const handleSubmit = () => {
        console.log("request send");


    };

    const handlePopupToggle = () => {
        setShowPopup(!showPopup);
    };

    const handleButtonClick = (leadId: number) => {
        console.log("Button clicked! Opening popup...");
        setSelectedLeadId(leadId);
        setShowPopup(true);
    };


    const handleClosePopup = () => {
        console.log("Closing popup...");
        setShowPopup(false);
    };

    const handleViewDetails = (leadId: number) => {
        console.log("called");
        setSelectedLeadId(leadId);
        setShowDetailsModal(true);
    };

    const handleCloseDetailsModal = () => {
        setShowDetailsModal(false);
        setSelectedLeadId(null);
    };


    const [showCountryModal, setShowCountryModal] = useState(false);

    const handleShowCountry = () => setShowCountryModal(true);
    const handleCloseCountry = () => setShowCountryModal(false);


    const [showModal, setShowModal] = useState(false);
    const handleShow = () => setShowModal(true);
    const handleClose = () => setShowModal(false);
    const closeModal = () => setShowModal(false);
    const openModal = () => setShowModal(true);


    const [showAddLeadModal, setShowAddLeadModal] = useState(false);
    const handleAddLeadModalClose = () => setShowAddLeadModal(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [showMoreFilters, setShowMoreFilters] = useState(true);


    const handleShowCustomer = () => {
        setShowCustomerModal(true);
    };


    const handleCloseCustomer = () => {
        setShowCustomerModal(false);
    };

    const filterByCustomer = (leads: Lead[]) => {
        return selectedCustomer ? leads.filter((lead) => lead.sender_name === selectedCustomer) : leads;
    };

    const handleCustomerSelect = async (customer, id: string) => {
        console.log('customer is', customer);
        console.log('id', id);
        setSelectedCustomer(customer);
        setSelectedContactPerson(null);

        try {

            const token = localStorage.getItem('token');
            const cleanToken = token && token.split('|')[1];
            const body = JSON.stringify({ customer_id: id });
            const response = await axiosInstance.post("/customer_contact_person_list", body,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${cleanToken}`,
                    },
                });

            const data = response.data;

            setContactPersons(data.leads || []);

        } catch (error) {
            console.error("Error fetching contact persons:", error);
        }
    };


    const handleContactPersonClick = (selectedOption) => {
        setShowCustomerModal(false);
        if (selectedOption) {
            setSelectedContactPerson({
                id: selectedOption.value,
                contact_person_name: selectedOption.label,
            });
        }
    };




    //CONVERT TO QUALIFY 

    const handleConvertToQuality = async (leadId: string) => {
        const token = localStorage.getItem('token');
        const cleanToken = token && token.split('|')[1];

        // Define the body content
        const body = JSON.stringify({ id: leadId });

        try {
            setLoading(true);

            const response = await axiosInstance.post("/convert_to_qualified", body, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${cleanToken}`,
                },
            });

            toast.success("Lead converted to Qualified Succesfully");
            await fetchLeads();

        } catch (error) {
            console.error("Error :", error);
            toast.error("Failed to Convert into Qualified");
        } finally {
            setLoading(false);
        }
    };


    const [hoveredItem, setHoveredItem] = useState(null);
    const handleMouseEnter = (item) => {
        setHoveredItem(item);
    };

    const handleMouseLeave = () => {
        setHoveredItem(null);
    };

    const defaultStyle = {
        backgroundColor: 'transparent',
        color: 'black',
    };

    const hoverStyle = {
        backgroundColor: '#666EE8',
        color: 'white',
    };
    //FILTER TABLE WITH PAGINATION
    // const renderLeadsTable = (
    //     leads: Lead[],
    //     {
    //         onRowClick,
    //         onQualify,
    //     }: {
    //         onRowClick: (leadId: number) => void;
    //         onQualify?: (leadId: number) => void;
    //     }
    // ) => {

    //     const pageSize = 10;
    //     const totalPages = Math.ceil(leads.length / pageSize); 
    //     const paginatedLeads = leads.slice( 
    //         (currentPage - 1) * pageSize,
    //         currentPage * pageSize
    //     );

    //     const tableContainerRef = useRef<HTMLDivElement>(null);

    //     const handleScrollRight = (scrollAmount) => {
    //         console.log("*", tableContainerRef.current);
    //         if (tableContainerRef.current) {
    //             console.log("Before Scroll:", tableContainerRef.current.scrollLeft);


    //             tableContainerRef.current.scrollLeft += scrollAmount;

    //             console.log("After Scroll:", tableContainerRef.current.scrollLeft);
    //         }
    //     };

    //     return (
    //         <div className="table-responsive-container">



    //             <div
    //                 className="d-flex justify-content-between gap-3"
    //                 style={{ float: "right", marginTop: "-4.2rem" }}
    //             >
    //                 <Button
    //                     variant="primary"
    //                     onClick={() => handleScrollRight(-200)}
    //                     style={{
    //                         width: "22px",
    //                         height: "22px",
    //                         display: "flex",
    //                         alignItems: "center",
    //                         justifyContent: "center",
    //                         padding: "0",
    //                     }}
    //                 >
    //                     <FaArrowLeft size={12} />
    //                 </Button>
    //                 <Button
    //                     variant="primary"
    //                     onClick={() => handleScrollRight(200)}
    //                     style={{
    //                         width: "22px",
    //                         height: "22px",
    //                         display: "flex",
    //                         alignItems: "center",
    //                         justifyContent: "center",
    //                         padding: "0",
    //                     }}
    //                 >
    //                     <FaArrowRight size={12} />
    //                 </Button>
    //             </div>



    //             <div
    //                 ref={tableContainerRef}
    //                 style={{
    //                     marginTop: "3.5rem",
    //                     overflowX: "auto",
    //                     scrollBehavior: "smooth",
    //                     // whiteSpace: "nowrap",
    //                     // maxWidth: "100%",
    //                 }}
    //             >
    //                 {/* <Table striped bordered hover responsive></Table> */}
    //                 <Table striped bordered hover>
    //                     <thead>
    //                         <tr>
    //                             <th>Sr. No.</th>
    //                             <th>Query ID</th>
    //                             <th>Customer Name</th>
    //                             <th>Customer Mobile</th>
    //                             <th>Customer Email</th>
    //                             <th>Product Name</th>
    //                             <th>Company Name</th>
    //                             <th>Country</th>
    //                             <th>Lead Source</th>
    //                             <th>Actions</th>
    //                         </tr>
    //                     </thead>
    //                     <tbody>
    //                         {loading ? (
    //                             <tr>
    //                                 <td colSpan={10} className="text-center">
    //                                     <Spinner animation="border" />
    //                                 </td>
    //                             </tr>
    //                         ) : paginatedLeads.length === 0 ? (
    //                             <tr>
    //                                 <td colSpan={10} className="text-center">
    //                                     No leads available.
    //                                 </td>
    //                             </tr>
    //                         ) : (
    //                             paginatedLeads.map((lead, index) => (
    //                                 <tr
    //                                     key={lead.id}
    //                                     onClick={() => handleRowClick(lead.id)}
    //                                     style={{ cursor: "pointer" }}
    //                                 >
    //                                     <td>
    //                                         {(currentPage - 1) * pageSize + index + 1}
    //                                     </td>
    //                                     <td>{lead.unique_query_id}</td>
    //                                     <td>{lead.sender_name}</td>
    //                                     <td>{lead.sender_mobile}</td>
    //                                     <td>{lead.sender_email}</td>
    //                                     <td>{lead.query_product_name}</td>
    //                                     <td>{lead.sender_company}</td>
    //                                     <td>{lead.sender_country_iso}</td>
    //                                     <td>{lead.platform}</td>
    //                                     <td>
    //                                         <div className="d-flex gap-2">
    //                                             <Button
    //                                                 variant="link"
    //                                                 size="sm"
    //                                                 onClick={(e) => {
    //                                                     e.stopPropagation();
    //                                                     handleViewDetails(lead.id);
    //                                                 }}
    //                                             >
    //                                                 <FontAwesomeIcon icon={faEye} />
    //                                             </Button>

    //                                             <Button
    //                                                 variant="link"
    //                                                 size="sm"
    //                                                 onClick={(e) => {
    //                                                     e.stopPropagation();
    //                                                     handleButtonClick();
    //                                                 }}
    //                                             >
    //                                                 <FontAwesomeIcon
    //                                                     icon={faUserPlus}
    //                                                 />
    //                                             </Button>
    //                                             {onQualify && (

    //                                                 <Button
    //                                                     variant="link"
    //                                                     size="sm"
    //                                                     onClick={(e) => {
    //                                                         e.stopPropagation();
    //                                                         handleConvertToQuality(lead.id);

    //                                                     }}
    //                                                 >
    //                                                     CTQ
    //                                                 </Button>
    //                                             )}
    //                                         </div>
    //                                     </td>
    //                                 </tr>
    //                             ))
    //                         )}
    //                     </tbody>
    //                 </Table>
    //             </div>

    //             <Pagination>
    //                 <Pagination.First
    //                     onClick={() => handlePageChange(1)}
    //                     disabled={currentPage === 1}
    //                 />
    //                 <Pagination.Prev
    //                     onClick={() => handlePageChange(currentPage - 1)}
    //                     disabled={currentPage === 1}
    //                 />
    //                 {[...Array(totalPages).keys()]
    //                     .slice(
    //                         Math.max(0, currentPage - 3),
    //                         Math.min(totalPages, currentPage + 2)
    //                     )
    //                     .map((page) => (
    //                         <Pagination.Item
    //                             key={page + 1}
    //                             active={page + 1 === currentPage}
    //                             onClick={() => handlePageChange(page + 1)}
    //                         >
    //                             {page + 1}
    //                         </Pagination.Item>
    //                     ))}
    //                 <Pagination.Next
    //                     onClick={() => handlePageChange(currentPage + 1)}
    //                     disabled={currentPage === totalPages}
    //                 />
    //                 <Pagination.Last
    //                     onClick={() => handlePageChange(totalPages)}
    //                     disabled={currentPage === totalPages}
    //                 />
    //             </Pagination>

    //             <LeadDetailsModal
    //                 show={showDetailsModal}
    //                 onClose={handleCloseDetailsModal}
    //                 leadId={selectedLeadId}
    //             />
    //         </div>
    //     );
    // };


    const [salesPersons, setSalesPersons] = useState([]);
    const [selectedSalespersonId, setSelectedSalespersonId] = useState(null);
    const [accountPersons, setAccountPersons] = useState([]);
    useEffect(() => {
        const fetchSalesPersons = async () => {
            try {
                const response = await axiosInstance.get("/Salesperson_List");
                // const data = await response.data.json();
                const data = response.data;
                console.log(data);
                // setSalesPersons(data);
                setSalesPersons(data.employee_list || []);
            } catch (error) {
                console.error("Error fetching sales person data:", error);
            }
        };

        fetchSalesPersons();
    }, []);


    const salesPersonOptions = salesPersons.map(person => ({
        label: person.name, // The name will appear in the dropdown
        value: person.user_id,   // The id will be used as the value when selected
    }));

    const accounts = [
        { value: 'Purvee', label: 'CH-i7PRV' },
        { value: 'Vortex', label: 'CH-i7VX' },
        { value: 'Inorbvict', label: 'CH-i7IRB' },
        { value: 'Chatbot', label: 'Chatbot' },
        { value: 'IndiaMart', label: 'CH-T9IM' },
        { value: 'TradeIndia', label: 'TradeInquiry' },
    { value: 'Offline', label: 'Offline' },
    ];

    // Map over the accounts array to create accountOptions
    const accountOptions = accounts.map(account => ({
        value: account.value,
        label: account.label,
    }));

    async function assignLeadToSalesperson() {
        if (!selectedSalespersonId) {
            toast("Please select a salesperson.");
            return;
        }
        console.log('assigning lead to salesperson', selectedLeadId);
        console.log("assigning lead ", selectedSalespersonId);
        const salespersonIdAsInt = parseInt(selectedSalespersonId, 10);

        try {
            const data = {
                id: selectedLeadId,
                salesperson_id: salespersonIdAsInt,
            };

            const response = await axiosInstance.post(
                "/assignLeadToSalesperson",
                data,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 200) {
                toast("Lead successfully assigned");
                setShowPopup(false);
            } else {
                console.error("Failed to assign lead:", response.data);
            }
        } catch (error) {
            toast.error("Lead is Allready assigned to another Salesperson");
        }
    }
    const FetchLead = async () => {
        try {
            const response = await axiosInstance.post("/lead_store");
            const data = response.data;

            toast.success(data.message || "Leads fetched successfully!");
        } catch (err: any) {
            setError("Error fetching leads: " + err.message);
            toast.error("Failed to fetch leads!");
        }
    };

    // Add this helper function for validation
    const isValidDateRange = (startDate: Date | null, endDate: Date | null): boolean => {
        if (!startDate || !endDate) return true;
        const start = new Date(startDate).setHours(0, 0, 0, 0);
        const end = new Date(endDate).setHours(0, 0, 0, 0);
        return start <= end;
    };
    console.log(salesPersons);
    const placeholderStyle = `
    .badgeContent {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: start;
      margin-right: 10px;
      gap : 10px;
    }
        .badgeContent Badge {
      font-size: 14px;
      padding: 8px 12px;
    }
    .moreFilterBtn Button {
      padding: 5px 10px;
      font-size: 14px;
    }
  
    @media (max-width: 772px) {
      .badgeContent {
        margin-top: 1rem;
        flex-direction: row !important;
        align-items: flex-start !important;
        gap: 5px;
      }
    .moreFilterBtn{
      margin-top: 1rem;
    }
    }

     @media (max-width: 540px) {
    .moreFilterBtn{
      margin-top: 0;
     }

     .badgeContent Badge {
        font-size: 12px;
        padding: 6px 10px;
      }

      .moreFilterBtn Button {
        padding: 4px 8px;
        font-size: 12px;
      }
    }
     }

     @media (max-width: 380px) {
      .moreFilterBtn Button {
        padding: 3px 5px;
        font-size: 10px;
      }
          .badgeContent Badge {
        font-size: 10px;
        padding: 4px 8px;
      }
    .custom-nav {
        flex-direction: column !important;
        align-items: center !important;
        gap: 10px;
        width: 100%;
    }
}
  `;

    // Add LoadingRow component
    const LoadingRow = () => (
        <tr>
            <td colSpan={10} className="text-center py-4">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </td>
        </tr>
    );

    const [showFiltersModal, setShowFiltersModal] = useState(false);

    const handleShowFilters = () => setShowFiltersModal(true);
    const handleCloseFilters = () => setShowFiltersModal(false);


    // const markedDates = {
    //     "2025-04-16": ["BUYING THE PRODUCT", "hi", "jhs"],
    //     "2025-04-18": ["Meeting with team", "Prepare report"]
    //   };


    const [popupData, setPopupData] = useState<LeadDetail[] | null>(null);

    // Helper to get filtered count for each tab
    const getFilteredCount = (leads: Lead[], type: string) => {
        let filtered = leads;
        filtered = filterLeads(filtered);
        filtered = filterByPlatform(filtered);
        filtered = filterByCountry(filtered);
        filtered = filterByDate(filtered);
        filtered = filterByCustomer(filtered);
        filtered = filterByLeadType(filtered);
        if (type === "qualified") {
            filtered = filtered.filter(lead => lead.qualified);
        } else if (type === "disqualified") {
            filtered = filtered.filter(lead => lead.disqualified);
        }
        return filtered.length;
    };

    return (
        <>
            <style>{placeholderStyle}</style>
            <div className="main-content-container" >
                <Row className="mb-2">
                    <Col>
                        <h3 className="mt-4" style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700' }}>Leads Management</h3>
                    </Col>
                    <Col className="text-end d-flex align-items-center justify-content-end">
                        <div className="d-flex align-items-center">
                            {/* <Button variant="link" className="text-body px-0 me-2 d-inline-flex align-items-center">
                                <FontAwesomeIcon icon={faFileExport} className="fs-19 me-1" />
                                <span className="fs-8">Export</span>
                            </Button> */}
                            <Dropdown>
                                <Dropdown.Toggle variant="link" className="text-body px-0 me-2 d-inline-flex align-items-center">
                                    <FontAwesomeIcon icon={faFileExport} className="fs-19 me-1" />
                                    <span className="fs-8" style={{ fontFamily: 'Nunito Sans, sans-serif' }}>{exportType === 'all' ? 'Export' : `Export ${exportType.charAt(0).toUpperCase() + exportType.slice(1)}`}</span> {/* Dynamic button text */}
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    <Dropdown.Item onClick={() => handleExport('all')} style={{ fontFamily: 'Nunito Sans, sans-serif' }}>Export All</Dropdown.Item>
                                    <Dropdown.Item onClick={() => handleExport('qualified')} style={{ fontFamily: 'Nunito Sans, sans-serif' }}>Export Qualified</Dropdown.Item>
                                    <Dropdown.Item onClick={() => handleExport('disqualified')} style={{ fontFamily: 'Nunito Sans, sans-serif' }}>Export Disqualified</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                            {/* <Dropdown className="me-2">
                                <Dropdown.Toggle variant="outline-secondary">
                                    <FaFilter className="me-2" />
                                    {selectedPlatform || "Filter by Platform"}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item onClick={() => handleFilter("")}>
                                        All Platforms
                                    </Dropdown.Item>
                                    <Dropdown.Item onClick={() => handleFilter("TradeIndia")}>
                                        TradeIndia
                                    </Dropdown.Item>
                                    <Dropdown.Item onClick={() => handleFilter("Chatbot")}>
                                        Chatbot
                                    </Dropdown.Item>
                                    <Dropdown>
                                        <Dropdown.Toggle as="div" className="dropdown-item">
                                            IndiaMart
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item onClick={() => handleFilter("Purvee")}>
                                                Purvee
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={() => handleFilter("Vortex")}>
                                                Vortex
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={() => handleFilter("Inorbvict")}>
                                                Inorbvict
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </Dropdown.Menu>
                            </Dropdown> */}
                        </div>

                        {isAdmin && (
                            <Button
                                variant="outline-primary"
                                className="me-2"
                                onClick={FetchLead}
                                style={{ fontFamily: 'Nunito Sans, sans-serif' }}
                            >
                                <FontAwesomeIcon icon={faPlus} className="me-2" />
                                Fetch Leads from APIs
                            </Button>
                        )}
                    </Col>
                </Row>

                <div className="card mb-4">
                    <div className="card-header d-flex flex-wrap justify-content-between align-items-center">
                        {/* Search Box */}
                        <SearchBox
                            size="sm"
                            placeholder="Search by Name, Product, Email, etc."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="me-auto"
                            style={{ fontSize: '14px', width: '100%', maxWidth: '350px', fontFamily: 'Nunito Sans, sans-serif' }}

                        />

                        {/* Badge Section */}
                        <div className="d-flex">
                            <div
                                className="badgeContent"
                            >
                                <Badge
                                    bg="primary"
                                    className="px-3 py-2 cursor-pointer"
                                    style={{ fontFamily: 'Nunito Sans, sans-serif', marginRight: '10px' }}
                                    onClick={() => setShowAddLeadModal(true)}
                                     
                                >
                                    Add New Leads
                                </Badge>

                                {userPermission.assign_lead_list === 1 && (
                                    <Badge
                                        bg="primary"
                                        className="px-3 py-2 cursor-pointer"
                                        onClick={handleAssignBadgeClick}
                                        style={{ fontFamily: 'Nunito Sans, sans-serif' }}
                                    >
                                        Assign Leads
                                    </Badge>
                                )}

                                {userPermission.customer_view_list === 1 && (
                                    <Badge
                                        bg="primary"
                                        className="px-3 py-2 cursor-pointer"
                                        onClick={handleBadgeClick}
                                        style={{ fontFamily: 'Nunito Sans, sans-serif' }}
                                    >
                                        Customer View
                                    </Badge>
                                )}

                                {userPermission.assignee_lead_list === 1 && (
                                    <Badge
                                        bg="primary"
                                        className="px-3 py-2 cursor-pointer"
                                        onClick={handleLeadsBadgeClick}
                                        style={{ fontFamily: 'Nunito Sans, sans-serif' }}
                                    >
                                        Assignee Leads
                                    </Badge>
                                )}

                            </div>

                            <AddLeadForm
                                show={showAddLeadModal}
                                onClose={() => setShowAddLeadModal(false)}
                                onLeadAdded={fetchLeads}
                            />
                            {/* More Filters Button */}
                            <div className="d-flex gap-3 ms-auto align-items-center flex-wrap moreFilterBtn">
                                <Button
                                    variant="outline-primary"
                                    // onClick={() => setShowMoreFilters(!showMoreFilters)}
                                    onClick={handleShowFilters}
                                    className="d-flex align-items-center gap-2"
                                    style={{ whiteSpace: 'nowrap', padding: '5px 10px' }}
                                >
                                    <FaFilter />
                                    {/* More Filters */}
                                </Button>
                            </div>
                            <style>
                                {`
    .filter-button:hover {
        background-color: #007bff !important; /* Change background color on hover */
        color: white !important; /* Change text color on hover */
        border-color: #007bff !important; /* Change border color on hover */
    }
`}
                            </style>

                        </div>

                        {/* Popup form on filter btn */}
                        <Modal show={showFiltersModal} onHide={handleCloseFilters} width>
                            <Modal.Header closeButton>
                                <Modal.Title style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: '600', fontSize: '16px' }}>
                                    Filters
                                </Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                {/* Filter by Platform */}
                                <div>
                                    <h6 style={{ marginLeft: "0.6rem", fontFamily: 'Nunito Sans, sans-serif', fontWeight: '600', fontSize: '14px' }}>
                                        Filter by Platform
                                    </h6>
                                    <div style={{ position: "relative", width: "100%" }}>
                                        <Dropdown style={{ width: "100%" }}>
                                            <Dropdown.Toggle
                                                variant="light"
                                                className="text-start"
                                                style={{
                                                    width: "100%",
                                                    border: "1px solid #ccc",
                                                    fontFamily: 'Nunito Sans, sans-serif',
                                                    fontWeight: '400',
                                                    fontSize: '14px',
                                                    paddingRight: "2.5rem",
                                                    position: "relative",
                                                }}
                                            >
                                                {selectedPlatform ? platformDisplayMap[selectedPlatform] || selectedPlatform : "Filter by Platform"}
                                                {selectedPlatform && (
                                                    <FaTimes
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleFilter("");
                                                        }}
                                                        style={{
                                                            position: "absolute",
                                                            right: "2.5rem",
                                                            top: "50%",
                                                            transform: "translateY(-50%)",
                                                            cursor: "pointer",
                                                            color: "#888",
                                                        }}
                                                    />
                                                )}
                                                <span
                                                    style={{
                                                        position: "absolute",
                                                        right: "0.5rem",
                                                        top: "50%",
                                                        transform: "translateY(-50%)",
                                                        pointerEvents: "none",
                                                        fontSize: "14px",
                                                        color: "#888",
                                                    }}
                                                >
                                                    ▼
                                                </span>
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu
                                                style={{
                                                    width: "95%",
                                                    border: "1px solid #ccc",
                                                    fontFamily: 'Nunito Sans, sans-serif',
                                                    fontWeight: '400',
                                                    fontSize: '14px',
                                                }}
                                            >
                                                <Dropdown.Item
                                                    onClick={() => handleFilter("")}
                                                    style={hoveredItem === "AllPlatforms" ? hoverStyle : defaultStyle}
                                                    onMouseEnter={() => handleMouseEnter("AllPlatforms")}
                                                    onMouseLeave={handleMouseLeave}
                                                >
                                                    All Platforms
                                                </Dropdown.Item>
                                                <Dropdown.Item
                                                    onClick={() => handleFilter("TradeIndia")}
                                                    style={hoveredItem === "TradeIndia" ? hoverStyle : defaultStyle}
                                                    onMouseEnter={() => handleMouseEnter("TradeIndia")}
                                                    onMouseLeave={handleMouseLeave}
                                                >
                                                    TradeInquiry
                                                </Dropdown.Item>
                                                  <Dropdown.Item
                                                    onClick={() => handleFilter("Offline")}
                                                    style={hoveredItem === "Offline" ? hoverStyle : defaultStyle}
                                                    onMouseEnter={() => handleMouseEnter("Offline")}
                                                    onMouseLeave={handleMouseLeave}
                                                >
                                                    Offline
                                                </Dropdown.Item>
                                                <Dropdown.Item
                                                    onClick={() => handleFilter("Chatbot")}
                                                    style={hoveredItem === "Chatbot" ? hoverStyle : defaultStyle}
                                                    onMouseEnter={() => handleMouseEnter("Chatbot")}
                                                    onMouseLeave={handleMouseLeave}
                                                >
                                                    Chatbot
                                                </Dropdown.Item>
                                                <Dropdown>
                                                    <Dropdown.Toggle
                                                        as="div"
                                                        className="dropdown-item"
                                                        style={{
                                                            fontFamily: 'Nunito Sans, sans-serif',
                                                            fontWeight: '400',
                                                            marginLeft: "-0.5rem",
                                                            fontSize: '14px',
                                                            color: "black",
                                                        }}
                                                    >
                                                        CH-T9IM
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu style={{ width: "95%", border: "1px solid #ccc" }}>
                                                        <Dropdown.Item
                                                            onClick={() => handleFilter("Purvee")}
                                                            style={hoveredItem === "Purvee" ? hoverStyle : defaultStyle}
                                                            onMouseEnter={() => handleMouseEnter("Purvee")}
                                                            onMouseLeave={handleMouseLeave}
                                                        >
                                                            CH-i7PRV
                                                        </Dropdown.Item>
                                                        <Dropdown.Item
                                                            onClick={() => handleFilter("Vortex")}
                                                            style={hoveredItem === "Vortex" ? hoverStyle : defaultStyle}
                                                            onMouseEnter={() => handleMouseEnter("Vortex")}
                                                            onMouseLeave={handleMouseLeave}
                                                        >
                                                            CH-i7VX
                                                        </Dropdown.Item>
                                                        <Dropdown.Item
                                                            onClick={() => handleFilter("Inorbvict")}
                                                            style={hoveredItem === "Inorbvict" ? hoverStyle : defaultStyle}
                                                            onMouseEnter={() => handleMouseEnter("Inorbvict")}
                                                            onMouseLeave={handleMouseLeave}
                                                        >
                                                            CH-i7IRB
                                                        </Dropdown.Item>
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </div>
                                </div>

                                {/* Filter by Lead Type */}
                                <div className="mt-3" style={{ marginLeft: "0.6rem" }}>
                                    <h6 className="mb-2" style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: '600', fontSize: '14px' }}>
                                        Filter by Lead Type
                                    </h6>
                                    <Select
                                        options={availableLeadTypes.map(type => {
                                            let label, value;
                                            switch (type) {
                                                case 'BUY':
                                                    label = 'Buy Leads';
                                                    value = 'Buy';
                                                    break;
                                                case 'P':
                                                    label = 'PNS Calls';
                                                    value = type;
                                                    break;
                                                case 'W':
                                                    label = 'Direct Enquiries';
                                                    value = type;
                                                    break;
                                                case 'BIZ':
                                                    label = 'Catalog-View Leads';
                                                    value = type;
                                                    break;
                                                case 'Product Inquiry':
                                                    label = 'Product Inquiry';
                                                    value = type;
                                                    break;
                                                default:
                                                    label = type;
                                                    value = type;
                                            }
                                            return { value, label };
                                        })}
                                        onChange={handleLeadTypeSelect}
                                        value={selectedLeadType ? { value: selectedLeadType, label: selectedLeadType } : null}
                                        isClearable={true}
                                        placeholder="Select a Lead Type"
                                        styles={{
                                            control: (provided) => ({
                                                ...provided,
                                                backgroundColor: "transparent",
                                                border: "1px solid #ccc",
                                                boxShadow: "none",
                                                fontFamily: 'Nunito Sans, sans-serif',
                                                fontWeight: '400',
                                                fontSize: '14px',
                                            }),
                                            menu: (provided) => ({
                                                ...provided,
                                                backgroundColor: "white",
                                                fontFamily: 'Nunito Sans, sans-serif',
                                                fontWeight: '400',
                                                fontSize: '14px',
                                            }),
                                            placeholder: (provided) => ({
                                                ...provided,
                                                fontFamily: 'Nunito Sans, sans-serif',
                                                fontWeight: '400',
                                                fontSize: '14px',
                                            }),
                                            option: (provided, state) => ({
                                                ...provided,
                                                backgroundColor: state.isFocused ? "#666EE8" : "transparent",
                                                color: state.isFocused ? "white" : "black",
                                                fontFamily: 'Nunito Sans, sans-serif',
                                                fontWeight: '400',
                                                fontSize: '14px',
                                            }),
                                        }}
                                    />
                                </div>

                                {/* Filter by Country */}
                                <div className="mt-3" style={{ marginLeft: "0.6rem" }}>
                                    <h6 className="mb-2" style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: '600', fontSize: '14px' }}>
                                        Filter by Country
                                    </h6>
                                    <Select
                                        options={availableCountries.map(country => ({ value: country, label: country }))}
                                        onChange={handleCountrySelect}
                                        value={selectedCountry ? { value: selectedCountry, label: selectedCountry } : null}
                                        isClearable={true}
                                        placeholder="Select a Country"
                                        styles={{
                                            control: (provided) => ({
                                                ...provided,
                                                backgroundColor: "transparent",
                                                border: "1px solid #ccc",
                                                boxShadow: "none",
                                                fontFamily: 'Nunito Sans, sans-serif',
                                                fontWeight: '400',
                                                fontSize: '14px',
                                            }),
                                            menu: (provided) => ({
                                                ...provided,
                                                backgroundColor: "white",
                                                fontFamily: 'Nunito Sans, sans-serif',
                                                fontWeight: '400',
                                                fontSize: '14px',
                                            }),
                                            placeholder: (provided) => ({
                                                ...provided,
                                                fontFamily: 'Nunito Sans, sans-serif',
                                                fontWeight: '400',
                                                fontSize: '14px',
                                            }),
                                            option: (provided, state) => ({
                                                ...provided,
                                                backgroundColor: state.isFocused ? "#666EE8" : "transparent",
                                                color: state.isFocused ? "white" : "black",
                                                fontFamily: 'Nunito Sans, sans-serif',
                                                fontWeight: '400',
                                                fontSize: '14px',
                                            }),
                                        }}
                                    />
                                </div>

                                {/* Filter by Date */}
                                {/* <div className="mt-3" style={{ marginLeft: "0.6rem" }}>
                                    <div className="d-flex align-items-center justify-content-between">
                                        <h6 className="mb-2" style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: '600', fontSize: '14px' }}>
                                            Filter by Date
                                        </h6>
                                        {(selectedStartDate || selectedEndDate) && (
                                            <button
                                                onClick={clearDateFilter}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    fontSize: '14px',
                                                    cursor: 'pointer',
                                                    color: '#dc3545',
                                                    marginLeft: '1rem',
                                                }}
                                                title="Clear Filter"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <div className="me-3">
                                            <DatePicker
                                                id="startDate"
                                                selected={selectedStartDate || null}
                                                onChange={(date) => handleDateRangeChange(date, selectedEndDate)}
                                                selectsStart
                                                startDate={selectedStartDate}
                                                endDate={selectedEndDate}
                                                maxDate={selectedEndDate || null}
                                                dateFormat="yyyy-MM-dd"
                                                placeholderText="Select start date"
                                                style={{ fontSize: '14px' }}
                                            />
                                        </div>
                                        <div>
                                            <DatePicker
                                                id="endDate"
                                                selected={selectedEndDate || null}
                                                onChange={(date) => handleDateRangeChange(selectedStartDate, date)}
                                                selectsEnd
                                                startDate={selectedStartDate}
                                                endDate={selectedEndDate}
                                                minDate={selectedStartDate || null}
                                                dateFormat="yyyy-MM-dd"
                                                placeholderText="Select end date"
                                                style={{ fontSize: '14px' }}
                                            />
                                        </div>
                                    </div>
                                    {selectedStartDate && selectedEndDate && selectedEndDate < selectedStartDate && (
                                        <p style={{ color: 'red', fontSize: '12px', marginTop: '0.5rem' }}>
                                            End date cannot be earlier than the start date.
                                        </p>
                                    )}
                                </div> */}
                                <div className="mt-3" style={{ marginLeft: "0.6rem" }}>
                                    <div className="d-flex align-items-center justify-content-between">
                                        <h6 className="mb-2" style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: '600', fontSize: '14px' }}>
                                            Filter by Date
                                        </h6>
                                        {(selectedStartDate || selectedEndDate) && (
                                            <button
                                                onClick={clearDateFilter}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    fontSize: '14px',
                                                    cursor: 'pointer',
                                                    color: '#dc3545',
                                                    marginLeft: '1rem'
                                                }}
                                                title="Clear Filter"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <div className="me-3">
                                            <DatePicker
                                                id="startDate"
                                                selected={selectedStartDate || null}
                                                onChange={(date) => handleDateRangeChange(date, selectedEndDate)}
                                                selectsStart
                                                startDate={selectedStartDate}
                                                endDate={selectedEndDate}
                                                maxDate={selectedEndDate || null} // Prevent selecting a date after the End Date
                                                dateFormat="yyyy-MM-dd"
                                                render={({ defaultValue, ...props }, ref) => (
                                                    <input
                                                        ref={ref}
                                                        {...props}
                                                        placeholder="Select start date"
                                                        defaultValue={defaultValue}
                                                    />
                                                )}
                                                style={{ fontSize: '14px' }}
                                            />
                                        </div>
                                        <div>
                                            <DatePicker
                                                id="endDate"
                                                selected={selectedEndDate || null}
                                                onChange={(date) => handleDateRangeChange(selectedStartDate, date)}
                                                selectsEnd
                                                startDate={selectedStartDate}
                                                endDate={selectedEndDate}
                                                minDate={selectedStartDate || null}
                                                dateFormat="yyyy-MM-dd"
                                                render={({ defaultValue, ...props }, ref) => (
                                                    <input
                                                        ref={ref}
                                                        {...props}
                                                        placeholder="Select end date"
                                                        defaultValue={defaultValue}
                                                    />
                                                )}
                                                style={{ fontSize: '14px' }}
                                            />
                                        </div>
                                    </div>
                                    {/* Validation message */}
                                    {selectedStartDate && selectedEndDate && !isValidDateRange(selectedStartDate, selectedEndDate) && (
                                        <p style={{ color: 'red', fontSize: '12px', marginTop: '0.5rem' }}>
                                            End date cannot be earlier than the start date.
                                        </p>
                                    )}
                                </div>


                                {/* Filter by Customer */}
                                <div className="mt-3">
                                    <h6
                                        className="mb-2"
                                        style={{
                                            marginLeft: "0.6rem",
                                            fontFamily: "Nunito Sans, sans-serif",
                                            fontWeight: "600",
                                            fontSize: '14px',
                                        }}
                                    >
                                        Filter by Customer
                                    </h6>
                                    <div className="container">
                                        <div className="row gap-3">
                                            <Select
                                                options={customers.map((customer) => ({
                                                    value: customer.id,
                                                    label: customer.sender_name,
                                                }))}
                                                onChange={(selectedOption) => {
                                                    if (selectedOption) {
                                                        handleCustomerSelect(selectedOption.label, selectedOption.value);
                                                    } else {
                                                        setSelectedCustomer(null);
                                                        setSelectedContactPerson(null);
                                                    }
                                                }}
                                                value={
                                                    selectedCustomer
                                                        ? { value: selectedCustomer, label: selectedCustomer }
                                                        : null
                                                }
                                                isClearable={true}
                                                placeholder="Select a Customer"
                                                styles={{
                                                    control: (provided) => ({
                                                        ...provided,
                                                        backgroundColor: "transparent",
                                                        border: "1px solid #ccc",
                                                        boxShadow: "none",
                                                        fontFamily: "Nunito Sans, sans-serif",
                                                        fontWeight: "400",
                                                        fontSize: "14px",
                                                    }),
                                                    menu: (provided) => ({
                                                        ...provided,
                                                        backgroundColor: "white",
                                                        fontFamily: "Nunito Sans, sans-serif",
                                                        fontWeight: "400",
                                                        fontSize: "14px",
                                                    }),
                                                    placeholder: (provided) => ({
                                                        ...provided,
                                                        fontFamily: "Nunito Sans, sans-serif",
                                                        fontWeight: "400",
                                                        fontSize: "14px",
                                                    }),
                                                    option: (provided, state) => ({
                                                        ...provided,
                                                        backgroundColor: state.isFocused ? "#666EE8" : "transparent",
                                                        color: state.isFocused ? "white" : "black",
                                                        fontFamily: "Nunito Sans, sans-serif",
                                                        fontWeight: "400",
                                                        fontSize: "14px",
                                                    }),
                                                }}
                                            />
                                            <Select
                                                options={
                                                    selectedCustomer
                                                        ? contactPersons.map((person) => ({
                                                            value: person.id,
                                                            label: person.contact_person_name,
                                                        }))
                                                        : []
                                                }
                                                onChange={(selectedOption) => {
                                                    if (selectedOption) {
                                                        setSelectedContactPerson({
                                                            id: selectedOption.value,
                                                            contact_person_name: selectedOption.label,
                                                        });
                                                    } else {
                                                        setSelectedContactPerson(null);
                                                    }
                                                }}
                                                value={
                                                    selectedContactPerson
                                                        ? {
                                                            value: selectedContactPerson.id,
                                                            label: selectedContactPerson.contact_person_name,
                                                        }
                                                        : null
                                                }
                                                isClearable
                                                isSearchable
                                                placeholder={
                                                    selectedCustomer
                                                        ? "Select a Contact Person"
                                                        : "Select a Customer First"
                                                }
                                                isDisabled={!selectedCustomer}
                                                styles={{
                                                    control: (provided) => ({
                                                        ...provided,
                                                        backgroundColor: "transparent",
                                                        border: "1px solid #ccc",
                                                        boxShadow: "none",
                                                        fontFamily: "Nunito Sans, sans-serif",
                                                        fontWeight: "400",
                                                        fontSize: "14px",
                                                    }),
                                                    menu: (provided) => ({
                                                        ...provided,
                                                        backgroundColor: "white",
                                                        fontFamily: "Nunito Sans, sans-serif",
                                                        fontWeight: "400",
                                                        fontSize: "14px",
                                                    }),
                                                    placeholder: (provided) => ({
                                                        ...provided,
                                                        fontFamily: "Nunito Sans, sans-serif",
                                                        fontWeight: "400",
                                                        fontSize: "14px",
                                                    }),
                                                    option: (provided, state) => ({
                                                        ...provided,
                                                        backgroundColor: state.isFocused ? "#666EE8" : "transparent",
                                                        color: state.isFocused ? "white" : "black",
                                                        fontFamily: "Nunito Sans, sans-serif",
                                                        fontWeight: "400",
                                                        fontSize: "14px",
                                                    }),
                                                }}
                                            />
                                        </div>
                                    </div>
                                    {alertMessage && (
                                        <div className="alert alert-warning mt-4">{alertMessage}</div>
                                    )}
                                </div>
                            </Modal.Body>
                        </Modal>

                        {/* Dropdown for Filters */}
                        {/* {showMoreFilters && (
                            <div className="mt-3" style={{ position: 'relative' }}>
                                <div className="d-flex flex-wrap gap-3">
                                    <Button
                                        variant="outline-secondary"
                                        onClick={handleShowCountry}
                                        className="d-flex align-items-center w-auto"
                                        style={{ whiteSpace: 'nowrap', padding: '4px 8px', fontSize: '12px' }}
                                    >
                                        <FaFilter className="me-2" />
                                        {selectedCountry || "Filter by Country"}
                                    </Button>

                                    <Button
                                        variant="outline-secondary"
                                        onClick={handleShow}
                                        className="d-flex align-items-center w-auto"
                                        style={{ whiteSpace: 'nowrap', padding: '4px 8px', fontSize: '12px' }}
                                    >
                                        <FaFilter className="me-2" />
                                        {dateRangeText || "Filter by Date"}
                                    </Button>

                                    <Button
                                        variant="outline-secondary"
                                        onClick={handleShowCustomer}
                                        className="d-flex align-items-center w-auto"
                                        style={{ whiteSpace: 'nowrap', padding: '4px 8px', fontSize: '12px' }}
                                    >
                                        <FaFilter className="me-2" />
                                        {selectedCustomer || "Filter by Customer"}
                                    </Button>
                                </div>
                            </div>
                        )} */}
                    </div>
                    <div className="card-body">
                        <div className="d-flex   mb-3">
                            <h4 className="m-0 float-start" style={{ fontFamily: 'Nunito Sans, sans-serif' }}>Received Inquiries</h4>
                        </div>

                        {/* <hr className="mb-4" style={{ borderColor: "#ddd" }} /> */}

                        {/* <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
                            <Nav variant="tabs" className=" mb-2">
                                {["qualified", "disqualified", "all"].map((tab) => (
                                    <Nav.Item key={tab} className="border border-secondary-subtle" style={{ marginTop: "0.5rem" }}>
                                        <Nav.Link
                                            eventKey={tab}
                                            className={`btn btn-sm px-7 py-1 fw-semibold w-100 
                        ${activeTab === tab ? "bg-light text-dark" : "btn-outline-light"}`}
                                            style={{
                                                transition: "background-color 0.2s ease-in-out",
                                                backgroundColor: activeTab === tab ? "#f8f9fa" : "transparent",
                                                display: "block",
                                            }}
                                            onMouseEnter={(e) => {
                                                if (activeTab !== tab) {
                                                    e.target.style.backgroundColor = "#f0f0f0";
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.backgroundColor = activeTab === tab ? "#f8f9fa" : "transparent";
                                            }}
                                        >
                                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                        </Nav.Link>
                                    </Nav.Item>
                                ))}
                            </Nav>

                            <Tab.Content>
                             
                            </Tab.Content>
                        </Tab.Container> */}

                        <div className="d-flex justify-content-between">
                            <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
                                <Nav
                                    variant="tabs"
                                    className="mb-2 d-flex"
                                    style={{
                                        borderBottom: "1px solid transparent",
                                        gap: "10px",
                                        fontFamily: "Nunito Sans, sans-serif",
                                    }}
                                >
                                    {[
                                        { key: "qualified", label: "Qualified", length: filteredQualifiedCount },
                                        { key: "disqualified", label: "Disqualified", length: filteredDisqualifiedCount },
                                        { key: "all", label: "ALL", length: filteredAllCount },
                                    ].map(({ key, label, length }) => (
                                        <Nav.Item key={key} className="px-2 position-relative">
                                            <Nav.Link
                                                eventKey={key}
                                                className={`fw-semibold ${activeTab === key ? "text-primary fw-bold" : ""}`}
                                                style={{
                                                    color: activeTab === key ? "#007bff" : "#636664",
                                                    fontSize: "14px",
                                                    padding: "4px 8px",
                                                    display: "inline-block",
                                                    position: "relative",
                                                }}
                                            >
                                                {label} ({length !== null ? length : 0})
                                            </Nav.Link>
                                            {activeTab === key && (
                                                <div
                                                    style={{
                                                        position: "absolute",
                                                        bottom: "-3px",
                                                        left: "5%",
                                                        width: "90%",
                                                        height: "3px",
                                                        backgroundColor: "#007bff",
                                                    }}
                                                ></div>
                                            )}
                                        </Nav.Item>
                                    ))}
                                </Nav>

                                <Tab.Content>
                                    {/* Your Tab Content Here */}
                                </Tab.Content>
                            </Tab.Container>



                            <div className="d-flex justify-content-between gap-2"
                                style={{ float: "right" }}
                            >

                                <Button
                                    variant="primary"
                                    onClick={() => {
                                        // Get the table container and scroll
                                        const tableContainer = document.querySelector('.scrollbar'); // Or use a ref if you prefer
                                        if (tableContainer) {
                                            tableContainer.scrollLeft -= 200;
                                        }
                                    }}
                                    style={{
                                        width: "22px",
                                        height: "22px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        padding: "0",
                                    }}
                                >
                                    <FaArrowLeft size={10} />
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={() => {
                                        const tableContainer = document.querySelector('.scrollbar');
                                        if (tableContainer) {
                                            tableContainer.scrollLeft += 200;
                                        }
                                    }}
                                    style={{
                                        width: "22px",
                                        height: "22px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        padding: "0",
                                    }}
                                >
                                    <FaArrowRight size={10} />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className=" border-translucent px-3 " style={{ overflowX: 'auto' }}>
                        <AdvanceTableProvider {...table}>
                            {loading || !dataReady ? (
                                <Table className="phoenix-table fs-10 " striped bordered>
                                    <thead>
                                        <tr>
                                            {columns.map((column, index) => (
                                                <th key={index} >{column.header?.toString() || ''}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <LoadingRow />
                                    </tbody>
                                </Table>
                            ) : (
                                <>
                                    <AdvanceTable
                                        tableProps={{
                                            className: 'phoenix-table fs-9 ',
                                            striped: true,
                                            bordered: true,
                                            style: { cursor: 'pointer', fontFamily: 'Nunito Sans, sans-serif' }
                                        }}
                                        rowClassName="hover-actions-trigger btn-reveal-trigger"
                                        onRowClick={(row) => handleRowClick(row.original.id, row.original.customer_id, row.original.salesperson_id,row.original.unique_query_id)}
                                    />
                                    <AdvanceTableFooter pagination />
                                </>
                            )}
                        </AdvanceTableProvider>
                    </div>


                    <LeadDetailsModal
                        show={showDetailsModal}
                        onClose={handleCloseDetailsModal}
                        leadId={selectedLeadId}
                    />
                </div>

                <div className="card mb-4">
                    {/* <div className="card-header d-flex flex-wrap justify-content-between align-items-center">

                  
                    <SearchBox
                        size="sm"
                        placeholder="Search by Name, Product, Email, etc."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="me-auto"
                        style={{ fontSize: '14px', width: '100%', maxWidth: '350px' }} 
                    />

                    <div className="d-flex gap-3 flex-wrap ms-auto" style={{ marginRight: '10px' }}>
                        <Badge
                            bg="secondary"
                            className="px-3 py-2 cursor-pointer"
                            onClick={handleBadgeClick}
                            style={{ fontSize: '14px' }}
                        >
                            Customer View
                        </Badge>
                        <Badge
                            bg="secondary"
                            className="px-3 py-2 cursor-pointer"
                            style={{ fontSize: '14px' }}
                        >
                            Assign (List of Inquiry)
                        </Badge>
                    </div>

                    <div className="d-flex gap-3 ms-auto align-items-center flex-wrap">
                        <div>
                            <Button
                                variant="outline-primary"
                                onClick={() => setShowMoreFilters(!showMoreFilters)}
                                className="d-flex align-items-center gap-2"
                                style={{ whiteSpace: 'nowrap', padding: '5px 10px' }}
                            >
                                <FaFilter /> More Filters
                            </Button>
                        </div>
                    </div>

                    
                    {showMoreFilters && (
                        <div className="mt-3" style={{ position: 'relative' }}>
                            <div className="d-flex flex-wrap gap-3">
                                <Button
                                    variant="outline-secondary"
                                    onClick={handleShowCountry}
                                    className="d-flex align-items-center w-auto"
                                    style={{ whiteSpace: 'nowrap', padding: '4px 8px', fontSize: '12px' }}
                                >
                                    <FaFilter className="me-2" />
                                    {selectedCountry || "Filter by Country"}
                                </Button>

                                <Button
                                    variant="outline-secondary"
                                    onClick={handleShow}
                                    className="d-flex align-items-center w-auto"
                                    style={{ whiteSpace: 'nowrap', padding: '4px 8px', fontSize: '12px' }}
                                >
                                    <FaFilter className="me-2" />
                                    {dateRangeText || "Filter by Date"}
                                </Button>

                                <Button
                                    variant="outline-secondary"
                                    onClick={handleShowCustomer}
                                    className="d-flex align-items-center w-auto"
                                    style={{ whiteSpace: 'nowrap', padding: '4px 8px', fontSize: '12px' }}
                                >
                                    <FaFilter className="me-2" />
                                    {selectedCustomer || "Filter by Customer"}
                                </Button>
                            </div>
                        </div>
                    )}

                </div> */}

                    {/* <Modal show={showCountryModal} onHide={handleCloseCountry}>
                        <Modal.Header closeButton>
                            <Modal.Title>Filter by Country</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Select
                                options={availableCountries.map(country => ({ value: country, label: country }))}
                                onChange={handleCountrySelect}
                                value={selectedCountry ? { value: selectedCountry, label: selectedCountry } : null}
                                isClearable={true}
                                placeholder="Select a Country"
                            />
                        </Modal.Body>
                    </Modal>

                    <Modal show={showModal} onHide={closeModal}>
                        <Modal.Header closeButton>
                            <Modal.Title>Filter by Date</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="d-flex justify-content-center">
                            <div className="d-flex align-items-center">
                                <div className="me-3">
                                    <label htmlFor="startDate" className="form-label">Start Date</label>
                                    <DatePicker
                                        id="startDate"
                                        selected={selectedStartDate}
                                        onChange={(date) => handleDateRangeChange(date, selectedEndDate)}
                                        selectsStart
                                        startDate={selectedStartDate}
                                        endDate={selectedEndDate}
                                        minDate={new Date()}
                                        dateFormat="yyyy-MM-dd"
                                        placeholder="Select start date"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="endDate" className="form-label">End Date</label>
                                    <DatePicker
                                        id="endDate"
                                        selected={selectedEndDate}
                                        onChange={(date) => handleDateRangeChange(selectedStartDate, date)}
                                        selectsEnd
                                        startDate={selectedStartDate}
                                        endDate={selectedEndDate}
                                        minDate={selectedStartDate || new Date()}
                                        dateFormat="yyyy-MM-dd"
                                        placeholder="Select end date"
                                    />
                                </div>
                            </div>
                        </Modal.Body>

                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleClose}>
                                Close
                            </Button>
                            <Button variant="primary" onClick={handleClose}>
                                Apply Filters
                            </Button>
                        </Modal.Footer>
                    </Modal>

                    <Modal show={showCustomerModal} onHide={handleCloseCustomer}>
                        <Modal.Header closeButton>
                            <Modal.Title>Filter by Customer</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="container">
                                <div className="row gap-3">
                                    <Select
                                        options={customers.map((customer) => ({
                                            value: customer.id,
                                            label: customer.sender_name,
                                        }))}
                                        onChange={(selectedOption) => {
                                            if (selectedOption) {
                                                handleCustomerSelect(selectedOption.label, selectedOption.value);
                                            }
                                        }}
                                        value={selectedCustomer ? { value: selectedCustomer, label: selectedCustomer } : null}
                                        isClearable={true}
                                        placeholder="Select a Customer"
                                    />
                                    <Select

                                        options={
                                            selectedCustomer
                                                ? contactPersons.map((person) => ({
                                                    value: person.id,
                                                    label: person.contact_person_name,
                                                }))
                                                : []
                                        }
                                        onChange={handleContactPersonClick}
                                        value={
                                            selectedContactPerson
                                                ? { value: selectedContactPerson.id, label: selectedContactPerson.contact_person_name }
                                                : null
                                        }
                                        isClearable
                                        isSearchable
                                        placeholder={selectedCustomer ? 'Select a contact person' : 'Select a customer first'}
                                        isDisabled={!selectedCustomer}
                                    />
                                </div>
                            </div>
                            {alertMessage && <div className="alert alert-warning mt-4">{alertMessage}</div>}
                        </Modal.Body>


                    </Modal> */}


                    {/* Modal and Card Body Section */}
                    {/* <div className="card-body">
                    <div className="d-flex justify-content-center align-items-center mb-3">
                        <h5 className="m-0 text-center flex-grow-1">Received Inquiries</h5>
                    </div>

                    <hr className="mb-4" style={{ borderColor: "#ddd" }} />

                    <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
                        <Nav variant="tabs" className="justify-content-center mb-4">
                            {["qualified", "disqualified", "all"].map((tab) => (
                                <Nav.Item key={tab} className="border border-secondary-subtle">
                                    <Nav.Link
                                        eventKey={tab}
                                        className={`btn btn-sm px-7 py-1 fw-semibold w-100 ${activeTab === tab ? "bg-light text-dark" : "btn-outline-light"
                                            }`}
                                        style={{
                                            transition: "background-color 0.2s",
                                        }}
                                        onMouseEnter={(e) => {

                                            if (activeTab !== tab) {
                                                e.target.style.backgroundColor = "#f0f0f0";
                                            }
                                        }}
                                        onMouseLeave={(e) => {

                                            e.target.style.backgroundColor = activeTab === tab ? "#f8f9fa" : "transparent";
                                        }}
                                    >
                                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                    </Nav.Link>

                                </Nav.Item>
                            ))}
                        </Nav>

                        <Tab.Content>
                            <Tab.Pane eventKey="all">
                                {renderLeadsTable(filteredLeads, {
                                    onRowClick: handleRowClick,
                                    onQualify: handleQualifyLead,
                                })}
                            </Tab.Pane>
                            <Tab.Pane eventKey="qualified">
                                {renderLeadsTable(filteredLeads, {
                                    onRowClick: handleRowClick,
                                })}
                            </Tab.Pane>
                            <Tab.Pane eventKey="disqualified">
                                {renderLeadsTable(filteredLeads, {
                                    onRowClick: handleRowClick,
                                    onQualify: handleQualifyLead,
                                })}
                            </Tab.Pane>
                        </Tab.Content>
                    </Tab.Container>
                </div> */}
                </div>



                <>
                    <Modal show={showPopup} onHide={handleClosePopup}>
                        <Modal.Header closeButton>
                            <Modal.Title>Assign Lead to User</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="dropdown-container">
                                <div className="name">
                                    <div className="col-md-12">
                                        <h6>Sales Status</h6>
                                        <label htmlFor="customer-status">
                                            Sales Person Name Dropdown List
                                        </label>
                                        <select
                                            id="customer-status"
                                            className="dropdown"
                                            onChange={(e) => setSelectedSalespersonId(e.target.value)}
                                        >
                                            <option value="" disabled selected>
                                                Select a Sales Person
                                            </option>
                                            {salesPersons?.length > 0 ? (
                                                salesPersons?.map((person) => (
                                                    <option key={person?.id} value={person?.user_id}>
                                                        {person?.name}
                                                    </option>
                                                ))
                                            ) : (
                                                <option value="" disabled>
                                                    Loading sales persons...
                                                </option>
                                            )}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button
                                variant="primary"
                                onClick={assignLeadToSalesperson}
                            >
                                Submit
                            </Button>
                        </Modal.Footer>
                    </Modal>


                    <Modal show={showAssignModal} onHide={handleCloseModal}>
                        <Modal.Header closeButton>
                            <Modal.Title>Assign Leads</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form>
                                {/* Account Name Dropdown */}
                                <Form.Group controlId="selectAccount">
                                    <Form.Label>Select Account</Form.Label>

                                    <Select
                                        // isMulti
                                        options={accountOptions}  // Use the accountOptions here
                                        value={selectedAccount}
                                        onChange={(selectedOpt) => setSelectedAccount(selectedOpt || null)}
                                        placeholder="Select an account"
                                    />


                                </Form.Group>

                                {/* Date Picker for Multiple Dates */}
                                <Form.Group controlId="selectDates">
                                    <Form.Label>Select Dates</Form.Label>
                                    {!showPopup2 && (
                                        <DatePicker
                                            ref={datePickerRef}
                                            options={{
                                                mode: "multiple",
                                                dateFormat: "Y-m-d",
                                                onDayCreate: (dObj, dStr, fp, dayElem) => {
                                                    const date = fp.formatDate(dayElem.dateObj, "Y-m-d");

                                                    if (markedDates[date]) {
                                                        dayElem.classList.add("clickable-day");
                                                        dayElem.style.backgroundColor = "yellow";
                                                        dayElem.style.borderRadius = "50%";
                                                        dayElem.classList.add("non-selectable");
                                                        dayElem.style.pointerEvents = "auto";

                                                        dayElem.addEventListener("click", (e) => {
                                                            e.stopPropagation();

                                                            if (datePickerRef.current?.flatpickr) {
                                                                datePickerRef.current.flatpickr.close();
                                                            }

                                                            setTimeout(() => {
                                                                setPopupData(leadDetails[date] || []);
                                                                setPopupDate(date);
                                                                setShowPopup2(true);
                                                            }, 100);
                                                        });
                                                    }
                                                },
                                            }}
                                            value={selectedDates}
                                            onChange={(dates) => {
                                                console.log("Raw selected dates:", dates); // Debug log
                                                // Ensure dates are properly converted to Date objects
                                                const formattedDates = dates.map(date => {
                                                    if (typeof date === 'string') {
                                                        return new Date(date);
                                                    }
                                                    return date;
                                                });
                                                console.log("Formatted dates:", formattedDates); // Debug log
                                                setSelectedDates(formattedDates);
                                            }}
                                            placeholder="Select multiple date"
                                        />
                                    )}
                                </Form.Group>


                                {showPopup2 && popupData && (
                                    <div className="popup-backdrop" onClick={() => setShowPopup2(false)}>
                                        <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                                            {/* Close Button */}
                                            <button className="popup-close" onClick={() => setShowPopup2(false)}>×</button>

                                            <div className="mt-2">
                                                <h5>Leads on {popupDate}</h5>
                                                <ul>
                                                    {popupData.map((lead, idx) => (
                                                        <li key={idx}>
                                                            <strong>Platform:</strong> {lead.platform} <br />
                                                            <strong>Salesperson:</strong> {lead.salesperson_name} <br />
                                                            <strong>Leads:</strong> {lead.total_leads}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                )}



                                <style>{`
.popup-content {
  position: relative;
  padding: 20px;
  background: white;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.popup-close {
  position: absolute;
  top: 10px;
  right: 12px;
  background: transparent;
  border: none;
  font-size: 20px;
  font-weight: bold;
  color: #555;
  cursor: pointer;
  transition: color 0.2s ease-in-out;
}

.popup-close:hover {
  color: #000;
}

// for popup
  .popup-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    .popup-backdrop {
  z-index: 99999 !important; /* increase further */
}

  }
//   .popup-content {
//     background: white;
//     padding: 20px;
//     border-radius: 12px;
//     max-width: 400px;
//     width: 90%;
//     box-shadow: 0 10px 30px rgba(0,0,0,0.2);
//   }

.flatpickr-weekdays{
  width : 127% !important;
}
  .flatpickr-innerContainer .flatpickr-rContainer .flatpickr-days {
    width: 127% !important;
}
.flatpickr-calendar {
  width: 400px !important; /* or any desired width */
  max-width: none !important;
  .flatpickr-calendar {
//   z-index: 1000 !important;
}

}

.flatpickr-calendar {
  left: 50% !important;
  transform: translateX(-50%) !important;
}

.has-tooltip {
  position: relative;
  overflow: visible;
  z-index: 1000;
}


 .has-tooltip {
  position: relative;
  cursor: pointer;
}

.has-tooltip::after {
  content: attr(data-tooltip);
  white-space: pre-line;
  position: absolute;
  bottom: 100%; /* Position above the element */
  left: 50%;
  transform: translateX(-50%) translateY(-8px);
  background: #fffbe6;
  color: #333;
  padding: 8px 12px;
  border: 1px solid #f0d000;
  border-radius: 8px;
  font-size: 14px;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 9999;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  pointer-events: none;
  max-width: 250px;
  width: max-content;
}


.has-tooltip:hover::after {
  opacity: 1;
}

`}</style>

                                {/* Employee Multiselect */}
                                <Form.Group controlId="selectEmployees">
                                    <Form.Label>Select Employees</Form.Label>
                                    <Select
                                        // isMulti
                                        options={salesPersonOptions}
                                        value={selectedEmployees}
                                        onChange={(selected) => setSelectedEmployees(selected || [])}
                                        placeholder="Select Sales Person"
                                    />
                                </Form.Group>
                            </Form>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleCloseModal}>
                                Close
                            </Button>
                            <Button variant="primary" onClick={handleAssignLeads}>
                                Assign Leads
                            </Button>
                        </Modal.Footer>
                    </Modal>
                    <ToastContainer />
                    <style>{`
    .dropdown-container {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        gap: 15px;
    }

    .name, .status {
        flex: 1;
        margin-bottom: 15px;
    }

    .col-md-12 {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    h6 {
        margin: 0;
        font-size: 1rem;
        font-weight: bold;
        color: #333;
    }

    label {
        font-size: 0.875rem;
        color: #666;
    }

    .dropdown {
        width: 100%;
        padding: 10px;
        //border: 1px solid #ccc;
        border-radius: 5px;
        font-size: 1rem;
        color: #333;
    }

    button {
        font-size: 1rem;
        padding: 8px 16px;
    }

    .user-details-input {
        width: 100%;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 5px;
        font-size: 1rem;
        color: #333;
    }
`}</style>
                </>
            </div>
        </>
    );
};

export default LeadManagement;