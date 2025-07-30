import { IconProp } from "@fortawesome/fontawesome-svg-core";
import {
    Icon,
    UilFilesLandscapesAlt,
    UilBag,
    UilShop,
    UilPuzzlePiece,
} from "@iconscout/react-unicons";
import { useAuth } from './AuthContext';

// const user_role = localStorage.getItem("user_role");
//const user_permission = localStorage.getItem("user_permission");


// Helper function to check if user has any permission for a module
const hasModulePermission = (permissions: any, moduleName: string): boolean => {
    if (!permissions) return false;

    // Convert module name to lowercase and snake case for comparison
    const modulePrefix = moduleName.toLowerCase().replace(/[\s-]+/g, '_');

    // Special case handling for specific modules
    const moduleMapping: { [key: string]: string[] } = {
        // Sales related
        'customers': ['customer', 'contact_person', 'consignee', 'customer_attachment'],
        'quotations': ['quotation'],
        'proforma invoice': ['quotation'], // Added mapping for Proforma Invoice
        'sales': ['customer', 'quotation'], // Added mapping for sales module
        'sales crm': ['lead'], // Added mapping for Sales CRM
        // 'sales crm dashboard': ['lead'],
        'dashboard': ['lead'],
        'lead user': ['lead'],
        'lead ack_master': ['lead'],
        'ace features': ['lead'],

        // Purchase related
        'vendors': ['vendor', 'vendor_contact', 'vendor_attachment', 'vendor_type', 'vendor_behavior', 'vendor_purchase'],
        'products': ['product', 'product_vendor', 'product_attachment', 'product_type', 'product_condition'],
        'purchase_order': ['purchase_order'],
        'procurements': ['procurement', 'procurement_vendor', 'procurement_attachment'],
        'smart view': ['purchase_order'],

        // HR related
        'employees': ['employee'],
        'recruitment': ['recruitment', 'recruitment_attachment', 'recruitment_candidate'],

        // Business Tasks
        'business_task': ['business_task', 'business_task_team', 'business_task_view', 'business_task_edit'],

        // Finance & Accounting
        'bank': ['bank_account', 'bank_details'],
        'e_docs': ['edoc'],
        'invoice': ['invoice'],
        'ffd': ['ffd', 'ffd_contact'],

        // Warehouse & Logistics
        'wms': ['warehouse'], // Added mapping for WMS module
        'inward': ['warehouse'],
        'packaging & labeling': ['warehouse'],
        'outward': ['warehouse'],
        'psd': ['warehouse'],
        'e-brc': ['warehouse'],
        'wms efficiency report': ['warehouse'],

        // Master Data
        'assets': ['assets', 'asset_type'],
        'directories': ['directory'],
        'credentials': ['credentials'],
        'department': ['department'],
        'role': ['role'],
        'bank_account': ['bank_account'],
        'designation': ['designation'],
        'segment': ['segment'],
        'category': ['category'],
        'customer_type': ['customer_type'],
        'customer_base': ['customer_base'],
        'entity_type': ['entity_type'],
        'attachment': ['attachment'],
        'hsn_code': ['hsn_code'],
        'unit_of_measurement': ['unit_of_measurement'],
        'gst_percent': ['gst_percent'],
        'terms_and_conditions': ['terms_and_conditions'],
        'company_details': ['company_details'],
        'currency': ['currency'],
        'inco_terms': ['inco_terms'],
        'irm': ['irm'],
        'compliance': ['compliance'],
        'examine': ['examine'],
        'regulatory': ['regulatory'],
        'kpi': ['kpi'],
        'location_detail': ['location_detail'],
        'stages': ['stages'],
        'ffds': ['ffd'],
        'vendor_behaviour': ['vendor_behavior'],
        'business_task_team_selection': ['business_task_team']
    };

    // Get the permission prefixes to check
    const prefixesToCheck = moduleMapping[modulePrefix] || [modulePrefix];

    // Special handling for Sales CRM and its submodules
    if (modulePrefix.includes('sales_crm') ||
        modulePrefix === 'lead_user' ||
        modulePrefix === 'lead_acknowledgement' ||
        modulePrefix === 'ace_features') {
        return Object.entries(permissions).some(([key, value]) =>
            key.startsWith('lead_') && value === 1
        );
    }

    // Special handling for sales module and Proforma Invoice
    if (modulePrefix === 'sales' || modulePrefix === 'proforma_invoice') {
        return Object.entries(permissions).some(([key, value]) =>
            key.startsWith('quotation_') && value === 1
        );
    }

    // Special handling for WMS module and its submodules
    if (modulePrefix === 'wms' ||
        modulePrefix === 'inward' ||
        modulePrefix === 'packaging_&_labeling' ||
        modulePrefix === 'outward' ||
        modulePrefix === 'psd' ||
        modulePrefix === 'e-brc' ||
        modulePrefix === 'wms_efficiency_report') {
        return Object.entries(permissions).some(([key, value]) =>
            key.startsWith('warehouse_') && value === 1
        );
    }

    // Check if any permission key that starts with the module prefix has value 1
    return prefixesToCheck.some(prefix =>
        Object.entries(permissions).some(([key, value]) => {
            // Skip id, created_at, updated_at, and user_id fields
            if (['id', 'created_at', 'updated_at', 'user_id'].includes(key)) {
                return false;
            }
            const permKey = key.toLowerCase();
            return (permKey.startsWith(prefix + '_') || permKey === prefix) && value === 1;
        })
    );
};

// Helper function to filter routes based on permissions
const filterRoutesByPermission = (routes: Route[], permissions: any): Route[] => {

    if (!permissions) return [];
    const userRole = localStorage.getItem('user_role');
    const isAdmin = userRole !== null && userRole.replace(/"/g, '') === "ADMIN";
    console.log(isAdmin);

    return routes.filter(route => {
        // Special cases - always show these routes
        if (route.name === "Dashboard" ||
            route.name === "Project Navigator") {
            if (route.name === "Project Navigator") {
                // Get empData from localStorage
                let empDataRaw = localStorage.getItem('emp_data');
                let empData: any = null;
                try {
                    empData = empDataRaw ? JSON.parse(empDataRaw) : null;
                } catch (e) {
                    empData = null;
                }
                // Only show if is_click_up_on === 1
                return empData && empData.is_click_up_on === 1;
            }
            return true;
        }
        if (route.name === "Activity Logins") {
            return isAdmin; // Return true if the user is an admin, otherwise false
        }



        // Check if the user has 'IRM' or 'Invoice' permission to show 'Accounts' module
        if (route.name === "Accounts") {
            const hasIrmPermission = Object.entries(permissions).some(([key, value]) =>
                key.startsWith('irm_') && value === 1
            );
            const hasInvoicePermission = Object.entries(permissions).some(([key, value]) =>
                key.startsWith('invoice_') && value === 1
            );
            if (hasIrmPermission || hasInvoicePermission) {
                return true;  // Show Accounts if the user has IRM or Invoice permission
            }
            return false;  // Otherwise, do not show Accounts
        }

        // Check if the user has 'directory' permission to show 'Record Management' module
        if (route.name === "Record Management") {
            const hasDirectoryPermission = Object.entries(permissions).some(([key, value]) =>
                key.startsWith('directory_') && value === 1
            );
            if (hasDirectoryPermission) {
                return true;  // Show Record Management if the user has directory permission
            }
            return false;  // Otherwise, do not show Record Management
        }

        const hasBusinessTaskTeamPermission = Object.entries(permissions).some(([key, value]) =>
            key.startsWith('business_task_team_') && value === 1
        );


        // Special handling for the "Productivity" module (add Business Task Timeline)
        if (hasBusinessTaskTeamPermission) {
            // Ensure "Business Task Timeline" appears under "Productivity"
            const productivityModule = routes.find(route => route.name === "Productivity");
            if (productivityModule) {
                // Ensure 'pages' is defined
                if (!productivityModule.pages) {
                    productivityModule.pages = [];  // Initialize pages if it's undefined
                }

                // If "Productivity" exists, ensure "Business Task Timeline" is included
                if (!productivityModule.pages.some(page => page.name === "Business Task Timeline")) {
                    productivityModule.pages.push({ name: "Business Task Timeline", path: "/business-task-timeline", active: true });
                }
            }
        }


        // Special handling for Sales CRM module and its submodules
        if (route.name === "Sales CRM" ||
            // route.name === "Sales CRM Dashboard" ||
            route.name === "Dashboard" ||
            route.name === "Lead Worksheet" ||
            route.name === "Lead Ack_master" ||
            route.name === "Ace Features") {
            // Check if any lead permission is 1
            return Object.entries(permissions).some(([key, value]) =>
                key.startsWith('lead_') && value === 1
            );
        }

        // Special handling for sales module and Proforma Invoice
        if (route.name === "sales" || route.name === "Proforma Invoice") {
            return Object.entries(permissions).some(([key, value]) =>
                key.startsWith('quotation_') && value === 1
            );
        }

        // Special handling for WMS module and its submodules
        if (route.name === "WMS" ||
            route.name === "Inward" ||
            route.name === "Packaging & Labeling" ||
            route.name === "Outward" ||
            route.name === "PSD" ||
            route.name === "e-BRC" ||
            route.name === "WMS Efficiency Report") {
            // Check if any warehouse permission is 1
            return Object.entries(permissions).some(([key, value]) =>
                key.startsWith('warehouse_') && value === 1
            );
        }

        // Special handling for Smart View module and its submodules
        if (route.name === "Smart View" ||
            route.name === "ITC" ||
            route.name === "SB Knock off" ||
            route.name === "FFD Payment" ||
            route.name === "Vendor Payment") {
            // Check if user has either purchase_order_list or vendor_purchase_list permission
            return Object.entries(permissions).some(([key, value]) =>
                (key === 'purchase_order_list' || key === 'vendor_purchase_list') && value === 1
            );
        }

        // Special handling for Vendor Purchase Invoice
        if (route.name === "Vendor Purchase Invoice") {
            return Object.entries(permissions).some(([key, value]) =>
                key.startsWith('vendor_purchase_') && value === 1
            );
        }

        // Special handling for master module items
        if (route.name === "master") {
            const masterPermissions = [
                'ffd_', 'inco_terms_', 'vendor_behavior_', 'attachment_',
                'bank_account_', 'business_task_team_'
            ];

            // Check if user has any of the master permissions
            const hasAnyMasterPermission = masterPermissions.some(prefix =>
                Object.entries(permissions).some(([key, value]) =>
                    key.startsWith(prefix) && value === 1
                )
            );

            if (hasAnyMasterPermission) {
                return true;
            }
        }

        // Check if route has pages (submodules)
        if (route.pages) {
            // If this is Project Navigator's submodules, show them all
            if (route.name === "Project Navigator") {
                return true;
            }
            const filteredPages = filterRoutesByPermission(route.pages, permissions);
            if (filteredPages.length > 0) {
                route.pages = filteredPages;
                return true;
            }
            return false;
        }

        // Check permissions for the route
        return hasModulePermission(permissions, route.name);
    });
};

// Helper function to filter route items based on permissions
const filterRouteItems = (routeItems: RouteItems[], permissions: any): RouteItems[] => {
    return routeItems.map(item => ({
        ...item,
        pages: filterRoutesByPermission(item.pages, permissions)
    })).filter(item => item.pages.length > 0);
};

export interface Route {
    name: string;
    icon?: IconProp | string | string[];
    iconSet?: "font-awesome" | "unicons";
    pages?: Route[];
    path?: string;
    pathName?: string;
    flat?: boolean;
    topNavIcon?: string;
    dropdownInside?: boolean;
    active?: boolean;
    new?: boolean;
    hasNew?: boolean;
    next?: boolean;
}

export interface RouteItems {
    label: string;
    horizontalNavLabel?: string;
    icon: Icon;
    labelDisabled?: boolean;
    pages: Route[];
    megaMenu?: boolean;
    active?: boolean;
}

const baseRoutes: RouteItems[] = [
    {
        label: "pages",
        icon: UilFilesLandscapesAlt,
        pages: [
            {
                name: "Dashboard",
                icon: "pie-chart",
                path: "/crm",
                pathName: "/crm",
                active: true,
            },
            {
                name: "Activity Logins",
                icon: "lock",
                path: "activityLogs",
                pathName: "activityLogs",
                active: true,
            },
            {
                "name": "Project Navigator",
                "icon": "star",
                "active": true,
                "pages": [
                    //   {
                    //     "name": "Tasks",
                    //     "path": "/kanban/kanban",
                    //     "pathName": "Kanban",
                    //     "active": true
                    //   },
                    {
                        "name": "Employees",
                        "path": "/employeeList",
                        "pathName": "employeeList",
                        "active": true
                    },
                    {
                        "name": "Ace & Goals",
                        "path": "/setacegoals",
                        "pathName": "setacegoals",
                        "active": true
                    },
                    //   {
                    //     "name": "Colleague Tasks",
                    //     "path": "/kanban/colleaguetask",
                    //     "pathName": "ColleagueTasks",
                    //     "active": true
                    //   },
                    //   {
                    //     "name": "KPI Dashboard",
                    //     "path": "/kanban/kpiDashboard",
                    //     "pathName": "KPIDashboard",
                    //     "active": true
                    //   },
                    //   {
                    //     "name": "Objective Dashboard",
                    //     "path": "/kanban/objectiveDashboard",
                    //     "pathName": "ObjectiveDashboard",
                    //     "active": true
                    //   }
                ]
            },
            {
                name: "Inhpl Mindmap",
                icon: "git-merge",
                path: "#",
                pathName: "#",
                active: false,
            },
            {
                name: "Human Resources",
                icon: "users",
                active: true,
                pages: [
                    {
                        name: "Employee",
                        path: "employees",
                        pathName: "employees",
                        active: true
                    },
                    {
                        name: "Recruitment",
                        path: "recruitment",
                        pathName: "recruitment",
                        active: true
                    }
                ]
            },
            {
                name: "sales",
                icon: "inbox",
                active: true,
                pages: [
                    {
                        name: "customers",
                        path: "sales/customers",
                        pathName: "customers",
                        active: true,
                    },
                    {
                        name: "Proforma Invoice",
                        path: "sales/quotations",
                        pathName: "quotations",
                        active: true,
                    },
                  {
                                name: "Sales CRM",
                                icon: "layers",
                                active: true,
                                pages: [
                                    {
                                        name: "Dashboard",
                                        path: "sales_crm/salesdashboard",
                                        pathName: "salesdashboard",
                                        active: true,
                                    },
                                    {
                                        name: "Lead Worksheet",
                                        path: "sales_crm/Lead",
                                        pathName: "lead",
                                        active: true,
                                    },
                                    {
                                        name: "Lead Ack_master",
                                        path: "sales_crm/LeadAck",
                                        pathName: "leadack",
                                        active: true,
                                    },
                                    // {
                                    //     name: "Ace Features",
                                    //     path: "sales_crm/AceFeature",
                                    //     pathName: "acefeature",
                                    //     active: true,
                                    //     pages: [
                                    //         // {
                                    //         //     name: "AceFeature Dashboard",
                                    //         //     path: "/sales_crm/AceFeature/TreeStructure",
                                    //         //     pathName: "TreeStructure",
                                    //         //     active: true,
                                    //         // },
                                    //         // {
                                    //         //     name: "Target Dashboard",
                                    //         //     path: "/sales_crm/AceFeature/TargetDashboard",
                                    //         //     pathName: "targetdashboard",
                                    //         //     active: true,
                                    //         // },
                                    //         // {
                                    //         //   name: "Assign Goals",
                                    //         //   path: "/sales_crm/AceFeature/AssignGoal",
                                    //         //   pathName: "assigngoal",
                                    //         //   active: true,
                                    //         // },
                                    //         // {
                                    //         //     name: "AceFeature Report",
                                    //         //     path: "/sales_crm/AceFeature/AcefeatureReport",
                                    //         //     pathName: "acefeaturereport",
                                    //         //     active: true,
                                    //         // },


                                    //     ],
                                    // },
                                ],
                            },
                ],
            },
            {
                name: "Purchase",
                icon: "grid",
                active: true,
                pages: [
                    {
                        name: "Vendor",
                        path: "purchase/vendors",
                        pathName: "vendors",
                        active: true
                    },
                    {
                        name: "Products",
                        path: "products",
                        pathName: "products",
                        active: true
                    },
                    {
                        name: "Purchase Order",
                        path: "purchase-order",
                        pathName: "purchase-order",
                        active: true
                    },
                    {
                        name: "Procurements",
                        path: "procurements",
                        pathName: "procurements",
                        active: true
                    },
                    {
                        name: "Vendor Purchase Invoice",
                        path: "vendor-purchase-invoice",
                        pathName: "vendor-purchase-invoice",
                        active: true
                    },

                ]
            },
            {
                name: "Productivity",
                icon: "globe",
                active: true,
                pages: [
                    {
                        name: "Business Task",
                        path: "business-task",
                        pathName: "business-task",
                        active: true
                    },
                    {
                        name: "Business Task Timeline",
                        path: "business-task-timeline",
                        pathName: "business-task-timeline",
                        active: true
                    }
                ]
            },
            {
                name: "Accounts",
                icon: "dollar-sign",
                active: true,
                pages: [
                    {
                        name: "E-Docs",
                        path: "e-docs",
                        pathName: "e-docs",
                        active: true
                    },
                    {
                        name: "E-Docs Timeline",
                        path: "edocs-timeline",
                        pathName: "edocs-timeline",
                        active: true
                    }
                ]
            },
            {
                name: "WMS",
                icon: "layout",
                active: true,
                pages: [
                    {
                        name: "Inward",
                        path: "warehouse-inward",
                        pathName: "warehouse-inward",
                        active: true,
                    },
                    {
                        name: "Packaging & Labeling",
                        path: "packaging-labeling",
                        pathName: "packaging-labeling",
                        active: true,
                    },
                    {
                        name: "Outward",
                        path: "warehouse-outward",
                        pathName: "warehouse-outward",
                        active: true,
                    },
                    {
                        name: "PSD",
                        path: "warehouse-psd",
                        pathName: "warehouse-psd",
                        active: true,
                    },
                    {
                        name: "e-BRC",
                        path: "ebrc",
                        pathName: "ebrc",
                        active: true,
                    },
                    {
                        name: "WMS Efficiency Report",
                        path: "wms-reporting",
                        pathName: "wms-reporting",
                        active: true,
                    },
                ],
            },
            {
                name: "Smart View",
                icon: "git-merge",
                active: true,
                pages: [
                    {
                        name: "ITC",
                        path: "itc",
                        pathName: "itc",
                        active: true,
                    },
                    {
                        name: "SB Knock off",
                        path: "sb-knockoff",
                        pathName: "sb-knockoff",
                        active: true,
                    },
                    {
                        name: "FFD Payment",
                        path: "ffd-payment",
                        pathName: "ffd-payment",
                        active: true,
                    },
                    {
                        name: "Vendor Payment",
                        path: "vendor-payment",
                        pathName: "vendor-payment",
                        active: true,
                    },

                ],
            },
            {
                name: "Record Management",
                icon: "alert-triangle",
                active: true,
                pages: [
                    {
                        name: "Directories/Contact Person",
                        path: "directories",
                        pathName: "directories",
                        active: true,
                    },

                ],
            },
        ],
    },
    {
        label: "master",
        icon: UilPuzzlePiece,
        pages: [
            {
                name: "master",
                icon: "layers",
                active: true,
                pages: [
                    {
                        name: "Assets",
                        path: "master/assets",
                        pathName: "assets",
                        active: true
                    },
                    {
                        name: "Asset Type",
                        path: "master/asset-type",
                        pathName: "asset-type",
                        active: true
                    },
                    {
                        name: "Attachments",
                        path: "master/attachments",
                        pathName: "attachments",
                        active: true
                    },
                    {
                        name: "Bank Accounts",
                        path: "master/bank-accounts",
                        pathName: "bank-accounts",
                        active: true
                    },
                    {
                        name: "Bank Details",
                        path: "master/bank-details",
                        pathName: "bank-details",
                        active: true
                    },
                    {
                        name: "Business Task Team Selection",
                        path: "master/business-task-team",
                        pathName: "business-task-team",
                        active: true
                    },
                    {
                        name: "Category",
                        path: "master/category",
                        pathName: "category",
                        active: true
                    },
                    {
                        name: "Company Details",
                        path: "master/company-details",
                        pathName: "company-details",
                        active: true
                    },
                    {
                        name: "Credentials",
                        path: "master/credentials",
                        pathName: "credentials",
                        active: true
                    },
                    {
                        name: "Currency",
                        path: "master/currency",
                        pathName: "currency",
                        active: true
                    },
                    {
                        name: "Customer Base",
                        path: "master/customer-base",
                        pathName: "customer-base",
                        active: true
                    },
                    {
                        name: "Customer Type",
                        path: "master/customer-type",
                        pathName: "customer-type",
                        active: true
                    },
                    {
                        name: "Department",
                        path: "master/department",
                        pathName: "department",
                        active: true
                    },
                    {
                        name: "Designation",
                        path: "master/designation",
                        pathName: "designation",
                        active: true
                    },
                    {
                        name: "Entity Type",
                        path: "master/entity-type",
                        pathName: "entity-type",
                        active: true
                    },
                    {
                        name: "FFDs",
                        path: "master/ffds",
                        pathName: "ffds",
                        active: true
                    },
                    {
                        name: "GST percent",
                        path: "master/gst-percent",
                        pathName: "gst-percent",
                        active: true
                    },
                    {
                        name: "HSN code",
                        path: "master/hsn-code",
                        pathName: "hsn-code",
                        active: true
                    },
                    {
                        name: "Inco Term",
                        path: "master/inco-term",
                        pathName: "inco-term",
                        active: true
                    },
                    {
                        name: "KPI List",
                        path: "master/kpis",
                        pathName: "kpis",
                        active: true
                    },
                    {
                        name: "Location Detail",
                        path: "master/location-detail",
                        pathName: "location-detail",
                        active: true
                    },
                    {
                        name: "Product Type",
                        path: "master/product-type",
                        pathName: "product-type",
                        active: true
                    },
                    {
                        name: "Product Condition",
                        path: "master/product-condition",
                        pathName: "product-condition",
                        active: true
                    },
                    {
                        name: "Role",
                        path: "master/role",
                        pathName: "role",
                        active: true
                    },
                    {
                        name: "Segment",
                        path: "master/segment",
                        pathName: "segment",
                        active: true
                    },
                    {
                        name: "Stages",
                        path: "master/stages",
                        pathName: "stages",
                        active: true
                    },
                    {
                        name: "Terms And Conditions",
                        path: "master/terms-and-conditions",
                        pathName: "terms-and-conditions",
                        active: true
                    },
                    {
                        name: "Unit Of Measurement",
                        path: "master/unit-of-measurement",
                        pathName: "unit-of-measurement",
                        active: true
                    },
                    {
                        name: "Vendor Type",
                        path: "master/vendor-type",
                        pathName: "vendor-type",
                        active: true
                    },
                    {
                        name: "Vendor Behaviour",
                        path: "master/vendor-behavior",
                        pathName: "vendor-behavior",
                        active: true
                    },
                ]
            }
        ]
    },
    // ...(user_role === "ADMIN" || user_role === "Sales" || user_role ==="undefined"
    //     ? [


    // {
    //     label: "Sales MATRIX",
    //     icon: UilPuzzlePiece,
    //     pages: [
    //         {
    //             name: "Sales CRM",
    //             icon: "layers",
    //             active: true,
    //             pages: [
    //                 {
    //                     name: "Sales CRM Dashboard",
    //                     path: "sales_crm/salesdashboard",
    //                     pathName: "salesdashboard",
    //                     active: true,
    //                 },
    //                 {
    //                     name: "Lead",
    //                     path: "sales_crm/Lead",
    //                     pathName: "lead",
    //                     active: true,
    //                 },
    //                 {
    //                     name: "Lead Ack_master",
    //                     path: "sales_crm/LeadAck",
    //                     pathName: "leadack",
    //                     active: true,
    //                 },
    //                 // {
    //                 //     name: "Ace Features",
    //                 //     path: "sales_crm/AceFeature",
    //                 //     pathName: "acefeature",
    //                 //     active: true,
    //                 //     pages: [
    //                 //         // {
    //                 //         //     name: "AceFeature Dashboard",
    //                 //         //     path: "/sales_crm/AceFeature/TreeStructure",
    //                 //         //     pathName: "TreeStructure",
    //                 //         //     active: true,
    //                 //         // },
    //                 //         // {
    //                 //         //     name: "Target Dashboard",
    //                 //         //     path: "/sales_crm/AceFeature/TargetDashboard",
    //                 //         //     pathName: "targetdashboard",
    //                 //         //     active: true,
    //                 //         // },
    //                 //         // {
    //                 //         //   name: "Assign Goals",
    //                 //         //   path: "/sales_crm/AceFeature/AssignGoal",
    //                 //         //   pathName: "assigngoal",
    //                 //         //   active: true,
    //                 //         // },
    //                 //         // {
    //                 //         //     name: "AceFeature Report",
    //                 //         //     path: "/sales_crm/AceFeature/AcefeatureReport",
    //                 //         //     pathName: "acefeaturereport",
    //                 //         //     active: true,
    //                 //         // },


    //                 //     ],
    //                 // },
    //             ],
    //         },
    //     ],
    // },

];

// Export the filtered routes
export const routes = (): RouteItems[] => {
    try {
        const permissions = JSON.parse(localStorage.getItem('user_permission') || '{}');
        return filterRouteItems(baseRoutes, permissions);
    } catch (error) {
        console.error('Error parsing user permissions:', error);
        return [];
    }
};
