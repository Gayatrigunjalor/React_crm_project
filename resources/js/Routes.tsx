import MainLayout from "./layouts/MainLayout";
import { Outlet } from "react-router-dom";
import { RouteObject, createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import SignIn from "./pages/auth/SignIn";
import Error404 from "./pages/error/Error404";
import Error403 from "./pages/error/Error403";
import Error500 from "./pages/error/Error500";
import MainLayoutProvider from "./providers/MainLayoutProvider";
import App from "./App";
import { Suspense, lazy } from "react";
import PhoenixLoader from "./components/common/PhoenixLoader";
const CustomerPage = lazy(() => import("./pages/sales/customers/Customers"));
const QuotationsPage = lazy(() => import("./pages/sales/quotations/Quotations"));
const VendorPage = lazy(
    () => import('./pages/purchase/vendor/Vendors')
);
const ProductPage = lazy(
    () => import('./pages/purchase/products/Products')
);
const EmployeePage = lazy(
    () => import('./pages/human_resource/employee/Employees')
);
const BusinessTaskPage = lazy(
    () => import('./pages/productivity/business-task/BusinessTask')
);
const ProcurementPage = lazy(
    () => import('./pages/purchase/procurements/Procurements')
);
const PurchaseOrderPage = lazy(
    () => import('./pages/purchase/purchase_order/PurchaseOrder')
);
const PurchaseOrderFormPage = lazy(
    () => import('./pages/purchase/purchase_order/PurchaseOrderForm')
);
const ActivityLogPage = lazy(
    () => import('./pages/activity-logs/ActivityLogs')
);
import UserTwoFactorAuthenticate from "./pages/human_resource/employee/UserTwoFactorAuthenticate";
import EmployeesAssignAsset from "./pages/human_resource/employee/EmployeesAssignAsset";
import EmployeesAssignCredential from "./pages/human_resource/employee/EmployeesAssignCredential";
import Recruitment from "./pages/human_resource/recruitment/Recruitment";
import RecruitmentCandidates from "./pages/human_resource/recruitment/RecruitmentCandidates";
import EnquiryDetails from "./pages/productivity/business-task/EnquiryDetails";
import SdeAttachment from "./pages/productivity/business-task/SdeAttachment";
import LmWorksheet from "./pages/productivity/business-task/LmWorksheet";
import LogisticsInstruction from "./pages/productivity/business-task/LogisticsInstruction";
import PmWorksheet from "./pages/productivity/business-task/PmWorksheet";
import AccountsWorksheet from "./pages/productivity/business-task/AccountsWorksheet";
import BusinessTaskTimeline from "./pages/productivity/business-task/BusinessTaskTimeline";
import CustomerContacts from "./pages/sales/customers/CustomerContacts";
import CustomerConsignees from "./pages/sales/customers/CustomerConsignees";
import CustomerAttachments from "./pages/sales/customers/CustomerAttachments";
import QuotationCreate from "./pages/sales/quotations/QuotationCreate";
import VendorContacts from "./pages/purchase/vendor/VendorContacts";
import VendorAttachments from "./pages/purchase/vendor/VendorAttachments";
import ProductVendors from "./pages/purchase/products/ProductVendors";
import ProductAttachments from "./pages/purchase/products/ProductAttachments";
import ProcurementVendors from "./pages/purchase/procurements/ProcurementVendors";
import Edocs from "./pages/e_docs/Edocs";
import EdocsTimeline from "./pages/e_docs/EdocsTimeline";
import Irms from "./pages/e_docs/irm/Irms";
import Invoices from "./pages/e_docs/international_trade/Invoices";
import Inward from "./pages/wms/inward/Inward";
import InwardForm from "./pages/wms/inward/InwardForm";
import InwardEdit from "./pages/wms/inward/InwardEdit";
import InvoiceForm from "./pages/e_docs/international_trade/InvoiceForm";
import PackagingLabeling from "./pages/wms/pl/PackagingLabeling";
import PackagingForm from "./pages/wms/pl/PackagingForm";
import Outward from "./pages/wms/outward/Outward";
import OutwardForm from "./pages/wms/outward/OutwardForm";
import Psd from "./pages/wms/psd/Psd";
import PsdForm from "./pages/wms/psd/PsdForm";
import Ebrc from "./pages/wms/eBrc/Ebrc";
import EbrcForm from "./pages/wms/eBrc/EbrcForm";
import WmsEfficiencyReport from "./pages/wms/wms-efficiency-report";
import Directories from "./pages/record_management/Directories";
import Department from "./pages/master/department/Department";
import Designation from "./pages/master/designation/Designation";
import Role from "./pages/master/role/Role";
import CustomerBase from "./pages/master/customer-base/CustomerBase";
import CustomerType from "./pages/master/customer-type/CustomerType";
import Assets from './pages/master/assets/Assets';
import AssetType from './pages/master/asset-type/AssetType';
import Attachments from './pages/master/attachments/Attachments';
import BankAccounts from './pages/master/bank-accounts/BankAccounts';
import BankDetails from './pages/master/bank-details/BankDetails';
import BusinessTaskTeam from './pages/master/business-task-team/BusinessTaskTeam';
import CompanyDetails from './pages/master/company-details/CompanyDetails';
import Credentials from './pages/master/credentials/Credentials';
import Segment from "./pages/master/segment/Segment";
import EntityType from "./pages/master/entity-type/EntityType";
import Ffds from "./pages/master/ffds/Ffds";
import FfdContact from "./pages/master/ffds/FfdContact";
import Currency from "./pages/master/currency/Currency";
import VendorType from "./pages/master/vendor-type/VendorType";
import VendorBehavior from "./pages/master/vendor-behavior/VendorBehavior";
import Category from "./pages/master/category/Category";
import ProductType from "./pages/master/product-type/ProductType";
import ProductCondition from "./pages/master/product-condition/ProductCondition";
import UnitOfMeasurement from "./pages/master/unit-of-measurement/UnitOfMeasurement";
import TermsCondition from "./pages/master/terms-conditions/TermsCondition";
import IncoTerm from './pages/master/inco-term/IncoTerm';
import HsnCode from "./pages/master/hsn-code/HsnCode";
import GstPercent from "./pages/master/gst-percent/GstPercent";
import KpiList from "./pages/master/kpi-list/KpiList";
import LocationDetail from "./pages/master/location-detail/LocationDetail";
import Stages from "./pages/master/stages/Stages";
import VendorPurchaseInvoice from "./pages/purchase/vendor-purchase-invoice/VendorPurchaseInvoice";
import VendorPurchaseForm from "./pages/purchase/vendor-purchase-invoice/VendorPurchaseForm";
import VendorPurchaseInvoiceEdit from "./pages/purchase/vendor-purchase-invoice/VendorPurchaseInvoiceEdit";
import ItcView from "./pages/smart-view/ItcView";
import SbKnockOff from "./pages/smart-view/SbKnockOff";
import FfdPayment from "./pages/smart-view/FfdPayment";
import VendorPayment from "./pages/smart-view/VendorPayment";
import Lead from "./pages/sales_crm//Lead/lead";
import LeftColumn from "./pages/sales_crm/leftNavBar/LeftColumn";
import rightNavBar from "./pages/sales_crm/rightNavbar/RightColumn";
import TopNavBar from "./pages/sales_crm/TopNavBar/Navbar";
import DecisionAwaited from "./pages/sales_crm/DecisionAwaited/DecisionAwaited";
import MainSection from "./pages/sales_crm/inquiryRecived/MainSection";
import SalesCrmDashboard from "./pages/sales_crm/Dashboard/SalesCrmDashboard";
import SecondMain from "./pages/sales_crm/leadAcknowlegement/SecondMain";
import PriceShared from "./pages/sales_crm/PriceShared/PriceShared";
import QuotationSend from "./pages/sales_crm/QuotationSend/QuotationSend";
import VictoryStage from "./pages/sales_crm/VictoryStage/VictoryStage";
import ProductSourcing from "./pages/sales_crm/productSourcing/productSourcing";
import sectionMenu from "./pages/sales_crm/SectionMenu/sectionMenu"
import ViewCustomerPage from "./pages/sales_crm/Lead/ViewCustomerPage";
import ViewEnquiry from "./pages/sales_crm/Lead/ViewEnquiry";
import ViewLeads from "./pages/sales_crm/Lead/viewLeads";
import ViewAssigneeLeads from "./pages/sales_crm/Lead/ViewAssigneeLeads";
import LeaAck from "./pages/sales_crm/LeadAcknowledgement/LeadAck"
import LeadAck from "./pages/sales_crm/LeadAcknowledgement/LeadAck";
import Kanban from "./pages/kanban/Kanban";
import Colleaguetask from "./pages/kanban/Colleaguetask"
import ObjectiveDashboard from "./pages/kanban/ObjectiveDashboard";
import KpiDashboard from "./pages/kanban/KpiDashboard";
import KanbanHeader from "./components/modules/kanban/KanbanHeader";
import AceFeaturesReport from "./pages/sales_crm/AceFeaturesForms/AceFeaturesReport";
import GoalManager from "./pages/sales_crm/AceFeaturesForms/GoalManager";
import TargetDashboard from "./pages/sales_crm/AceFeaturesForms/DashboardHeader";
import TreeStructure from "./pages/sales_crm/AceFeaturesForms/TreeStructure";
import EmployeeList from "./pages/kanban/EmployeeList";
import Widgets from "./pages/dashboard/Widgets";
import FeedbackFormModal from "./pages/sales_crm/leftNavBar/FeedbackFormModal";
import ComplainForm from "./pages/sales_crm/leftNavBar/ComplainForm";
import InorbvictHierarchy from "./pages/kanban/InorbvictHierarchy";
import SetAceGoals from "./pages/kanban/SetAceGoals";
import InorbvictHierarchyKPI from "./pages/kanban/InorbvictHierarchyKPI";
import LeadList from "./pages/sales_crm/SectionMenu/LeadList";

const routes: RouteObject[] = [
    {
        element: <App />,
        children: [
            {
                path: "/login",
                element: <SignIn />,
            },
            {
                path: "/",
                element: (
                    <ProtectedRoute>
                        <MainLayoutProvider>
                            <MainLayout />
                        </MainLayoutProvider>
                    </ProtectedRoute>
                ),
                children: [
                    {
                        path: "/stage/:customer_id/:id",
                        element: <LeadList />,
                    },
                    {
                        path: "/activityLogs",
                        element: (
                            <ProtectedRoute>
                                <Suspense fallback={<PhoenixLoader />}>
                                    <ActivityLogPage />
                                </Suspense>
                            </ProtectedRoute>
                        )
                    },
                    {
                        path: "/crm",
                        element: (
                            <ProtectedRoute>
                                <Suspense fallback={<PhoenixLoader />}>
                                    <Widgets />
                                </Suspense>
                            </ProtectedRoute>
                        )
                    },
                    {
                        path: "/employees",
                        element: (
                            <ProtectedRoute>
                                <Suspense fallback={<PhoenixLoader />}>
                                    <EmployeePage />
                                </Suspense>
                            </ProtectedRoute>
                        )
                    },
                    {
                        path: "/two-factor-authenticate/:userId",
                        element: (
                            <ProtectedRoute>
                                <Suspense fallback={<PhoenixLoader />}>
                                    <UserTwoFactorAuthenticate />
                                </Suspense>
                            </ProtectedRoute>
                        )
                    },
                    {
                        path: "/assign-asset/:empId",
                        element: (
                            <ProtectedRoute>
                                <Suspense fallback={<PhoenixLoader />}>
                                    <EmployeesAssignAsset />
                                </Suspense>
                            </ProtectedRoute>
                        )
                    },
                    {
                        path: "/assign-credentials/:empId",
                        element: (
                            <ProtectedRoute>
                                <Suspense fallback={<PhoenixLoader />}>
                                    <EmployeesAssignCredential />
                                </Suspense>
                            </ProtectedRoute>
                        )
                    },
                    {
                        path: "/recruitment",
                        element: (
                            <ProtectedRoute>
                                <Suspense fallback={<PhoenixLoader />}>
                                    <Recruitment />
                                </Suspense>
                            </ProtectedRoute>
                        )
                    },
                    {
                        path: "/recruitment/candidates/:recId",
                        element: (
                            <ProtectedRoute>
                                <Suspense fallback={<PhoenixLoader />}>
                                    <RecruitmentCandidates />
                                </Suspense>
                            </ProtectedRoute>
                        )
                    },
                    {
                        path: "/sales",
                        children: [
                            {
                                path: "customers",
                                element: (
                                    <ProtectedRoute>
                                        <Suspense fallback={<PhoenixLoader />}>
                                            <CustomerPage />
                                        </Suspense>
                                    </ProtectedRoute>
                                ),
                            },
                            {
                                path: "customers/contacts/:customerId",
                                element: (
                                    <ProtectedRoute>
                                        <Suspense fallback={<PhoenixLoader />}>
                                            <CustomerContacts />
                                        </Suspense>
                                    </ProtectedRoute>
                                ),
                            },
                            {
                                path: "customers/consignees/:customerId",
                                element: (
                                    <ProtectedRoute>
                                        <Suspense fallback={<PhoenixLoader />}>
                                            <CustomerConsignees />
                                        </Suspense>
                                    </ProtectedRoute>
                                ),
                            },
                            {
                                path: "customers/attachments/:customerId",
                                element: (
                                    <ProtectedRoute>
                                        <Suspense fallback={<PhoenixLoader />}>
                                            <CustomerAttachments />
                                        </Suspense>
                                    </ProtectedRoute>
                                ),
                            }
                        ],
                    },
                    {
                        path: "/sales/quotations",
                        element: (
                            <ProtectedRoute>
                                <Suspense fallback={<PhoenixLoader />}>
                                    <QuotationsPage />
                                </Suspense>
                            </ProtectedRoute>
                        ),
                    },
                    {
                       
                         path: "/sales/quotations/create/:quoteId?/:leadId?/:customer_id?",
                        
                        element: (
                            <ProtectedRoute>
                                <Suspense fallback={<PhoenixLoader />}>
                                    <QuotationCreate />
                                </Suspense>
                            </ProtectedRoute>
                        ),
                    },
                    // {
                    //      path: "/sales/quotations/create/:quoteId?",
                    //     element: (
                    //         <ProtectedRoute>
                    //             <Suspense fallback={<PhoenixLoader />}>
                    //                 <QuotationCreate />
                    //             </Suspense>
                    //         </ProtectedRoute>
                    //     ),
                    // },
                    {
                        path: '/purchase',
                        children: [
                            {
                                path: 'vendors',
                                element: (
                                    <ProtectedRoute>
                                        <Suspense fallback={<PhoenixLoader />}>
                                            <VendorPage />
                                        </Suspense>
                                    </ProtectedRoute>
                                )
                            },
                            {
                                path: 'vendors/contacts/:vendorId',
                                element: (
                                    <ProtectedRoute>
                                        <Suspense fallback={<PhoenixLoader />}>
                                            <VendorContacts />
                                        </Suspense>
                                    </ProtectedRoute>
                                )
                            },
                            {
                                path: "vendors/attachments/:vendorId",
                                element: (
                                    <ProtectedRoute>
                                        <Suspense fallback={<PhoenixLoader />}>
                                            <VendorAttachments />
                                        </Suspense>
                                    </ProtectedRoute>
                                ),
                            }
                        ]
                    },
                    {
                        path: '/products',
                        element: (
                            <ProtectedRoute>
                                <Suspense fallback={<PhoenixLoader />}>
                                    <ProductPage />
                                </Suspense>
                            </ProtectedRoute>
                        )
                    },
                    {
                        path: '/products/vendors/:prodId',
                        element: (
                            <ProtectedRoute>
                                <Suspense fallback={<PhoenixLoader />}>
                                    <ProductVendors />
                                </Suspense>
                            </ProtectedRoute>
                        )
                    },
                    {
                        path: '/products/attachments/:productId',
                        element: (
                            <ProtectedRoute>
                                <Suspense fallback={<PhoenixLoader />}>
                                    <ProductAttachments />
                                </Suspense>
                            </ProtectedRoute>
                        )
                    },
                    {
                        path: '/purchase-order',
                        element: (
                            <ProtectedRoute>
                                <Suspense fallback={<PhoenixLoader />}>
                                    <PurchaseOrderPage />
                                </Suspense>
                            </ProtectedRoute>
                        )
                    },
                    {
                        path: '/purchase-order/create/:poId?',
                        element: (
                            <ProtectedRoute>
                                <Suspense fallback={<PhoenixLoader />}>
                                    <PurchaseOrderFormPage />
                                </Suspense>
                            </ProtectedRoute>
                        )
                    },
                    {
                        path: '/procurements',
                        element: (
                            <ProtectedRoute>
                                <Suspense fallback={<PhoenixLoader />}>
                                    <ProcurementPage />
                                </Suspense>
                            </ProtectedRoute>
                        )
                    },
                    {
                        path: '/procurement/vendors/:procId',
                        element: (
                            <ProtectedRoute>
                                <Suspense fallback={<PhoenixLoader />}>
                                    <ProcurementVendors />
                                </Suspense>
                            </ProtectedRoute>
                        )
                    },
                    {
                        path: '/vendor-purchase-invoice',
                        element: (
                            <ProtectedRoute>
                                <Suspense fallback={<PhoenixLoader />}>
                                    <VendorPurchaseInvoice />
                                </Suspense>
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/vendor-purchase-invoice/create',
                        element: (
                            <ProtectedRoute>
                                <Suspense fallback={<PhoenixLoader />}>
                                    <VendorPurchaseForm />
                                </Suspense>
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/vendor-purchase-invoice/edit/:vpiId',
                        element: (
                            <ProtectedRoute>
                                <Suspense fallback={<PhoenixLoader />}>
                                    <VendorPurchaseInvoiceEdit />
                                </Suspense>
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/business-task',
                        element: (
                            <ProtectedRoute>
                                <Suspense fallback={<PhoenixLoader />}>
                                    <BusinessTaskPage />
                                </Suspense>
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/business-task-timeline',
                        element: (
                            <ProtectedRoute>
                                <Suspense fallback={<PhoenixLoader />}>
                                    <BusinessTaskTimeline />
                                </Suspense>
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/bt/enquiryDetails/:btId',
                        element: (
                            <ProtectedRoute>
                                <Suspense fallback={<PhoenixLoader />}>
                                    <EnquiryDetails />
                                </Suspense>
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/bt/sdeWorksheetEdit/:btId',
                        element: (
                            <ProtectedRoute>
                                <Suspense fallback={<PhoenixLoader />}>
                                    <SdeAttachment />
                                </Suspense>
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/bt/lmWorksheetEdit/:btId',
                        element: (
                            <ProtectedRoute>
                                <Suspense fallback={<PhoenixLoader />}>
                                    <LmWorksheet />
                                </Suspense>
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/bt/logisticsInstructionEdit/:btId',
                        element: (
                            <ProtectedRoute>
                                <Suspense fallback={<PhoenixLoader />}>
                                    <LogisticsInstruction />
                                </Suspense>
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/bt/pmWorksheetEdit/:btId',
                        element: (
                            <ProtectedRoute>
                                <Suspense fallback={<PhoenixLoader />}>
                                    <PmWorksheet />
                                </Suspense>
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/bt/acWorksheetEdit/:btId',
                        element: (
                            <ProtectedRoute>
                                <Suspense fallback={<PhoenixLoader />}>
                                    <AccountsWorksheet />
                                </Suspense>
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/e-docs',
                        element: (
                            <ProtectedRoute>
                                <Suspense fallback={<PhoenixLoader />}>
                                    <Edocs />
                                </Suspense>
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/edocs-timeline',
                        element: (
                            <ProtectedRoute>
                                <Suspense fallback={<PhoenixLoader />}>
                                    <EdocsTimeline />
                                </Suspense>
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/irms',
                        element: (
                            <ProtectedRoute>
                                <Suspense fallback={<PhoenixLoader />}>
                                    <Irms />
                                </Suspense>
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/invoices',
                        element: (
                            <ProtectedRoute>
                                <Suspense fallback={<PhoenixLoader />}>
                                    <Invoices />
                                </Suspense>
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/invoices/international-trade/:invId?',
                        element: (
                            <ProtectedRoute>
                                <Suspense fallback={<PhoenixLoader />}>
                                    <InvoiceForm />
                                </Suspense>
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/warehouse-inward',
                        element: (
                            <ProtectedRoute>
                                <Suspense fallback={<PhoenixLoader />}>
                                    <Inward />
                                </Suspense>
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/warehouse-inward/edit/:inwardId',
                        element: (
                            <ProtectedRoute>
                                <Suspense fallback={<PhoenixLoader />}>
                                    <InwardEdit />
                                </Suspense>
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/inward/create/:inwardId?',
                        element: (
                            <ProtectedRoute>
                                <Suspense fallback={<PhoenixLoader />}>
                                    <InwardForm />
                                </Suspense>
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/packaging-labeling/create/:inwardId?',
                        element: (
                            <ProtectedRoute>
                                <Suspense fallback={<PhoenixLoader />}>
                                    <PackagingForm />
                                </Suspense>
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/packaging-labeling',
                        element: (
                            <ProtectedRoute>
                                <Suspense fallback={<PhoenixLoader />}>
                                    <PackagingLabeling />
                                </Suspense>
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/warehouse-outward',
                        element: (
                            <ProtectedRoute>
                                <Suspense fallback={<PhoenixLoader />}>
                                    <Outward />
                                </Suspense>
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/warehouse-outward/create/:outwardId?',
                        element: (
                            <ProtectedRoute>
                                <Suspense fallback={<PhoenixLoader />}>
                                    <OutwardForm />
                                </Suspense>
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/warehouse-psd',
                        element: (
                            <ProtectedRoute>
                                <Suspense fallback={<PhoenixLoader />}>
                                    <Psd />
                                </Suspense>
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/warehouse-psd/create/:inwardId?',
                        element: (
                            <ProtectedRoute>
                                <Suspense fallback={<PhoenixLoader />}>
                                    <PsdForm />
                                </Suspense>
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/ebrc',
                        element: (
                            <ProtectedRoute>
                                <Suspense fallback={<PhoenixLoader />}>
                                    <Ebrc />
                                </Suspense>
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/ebrc/create/:ebrcId?',
                        element: (
                            <ProtectedRoute>
                                <Suspense fallback={<PhoenixLoader />}>
                                    <EbrcForm />
                                </Suspense>
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/wms-reporting',
                        element: (
                            <ProtectedRoute>
                                <Suspense fallback={<PhoenixLoader />}>
                                    <WmsEfficiencyReport />
                                </Suspense>
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/itc',
                        element: (
                            <ProtectedRoute>
                                <Suspense fallback={<PhoenixLoader />}>
                                    <ItcView />
                                </Suspense>
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/sb-knockoff',
                        element: (
                            <ProtectedRoute>
                                <Suspense fallback={<PhoenixLoader />}>
                                    <SbKnockOff />
                                </Suspense>
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/ffd-payment',
                        element: (
                            <ProtectedRoute>
                                <Suspense fallback={<PhoenixLoader />}>
                                    <FfdPayment />
                                </Suspense>
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/vendor-payment',
                        element: (
                            <ProtectedRoute>
                                <Suspense fallback={<PhoenixLoader />}>
                                    <VendorPayment />
                                </Suspense>
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '/directories',
                        element: (
                            <ProtectedRoute>
                                <Suspense fallback={<PhoenixLoader />}>
                                    <Directories />
                                </Suspense>
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: "/master",
                        children: [
                            {
                                path: "attachments",
                                element: (
                                    <ProtectedRoute>
                                        <Suspense fallback={<PhoenixLoader />}>
                                            <Attachments />
                                        </Suspense>
                                    </ProtectedRoute>
                                ),
                            },
                            {
                                path: "department",
                                element: (
                                    <ProtectedRoute>
                                        <Suspense fallback={<PhoenixLoader />}>
                                            <Department />
                                        </Suspense>
                                    </ProtectedRoute>
                                ),
                            },
                            {
                                path: "designation",
                                element: (
                                    <ProtectedRoute>
                                        <Suspense fallback={<PhoenixLoader />}>
                                            <Designation />
                                        </Suspense>
                                    </ProtectedRoute>
                                ),
                            },
                            {
                                path: "role",
                                element: (
                                    <ProtectedRoute>
                                        <Suspense fallback={<PhoenixLoader />}>
                                            <Role />
                                        </Suspense>
                                    </ProtectedRoute>
                                ),
                            },
                            {
                                path: "customer-base",
                                element: (
                                    <ProtectedRoute>
                                        <Suspense fallback={<PhoenixLoader />}>
                                            <CustomerBase />
                                        </Suspense>
                                    </ProtectedRoute>
                                ),
                            },
                            {
                                path: "customer-type",
                                element: (
                                    <ProtectedRoute>
                                        <Suspense fallback={<PhoenixLoader />}>
                                            <CustomerType />
                                        </Suspense>
                                    </ProtectedRoute>
                                ),
                            },
                            {
                                path: "segment",
                                element: (
                                    <ProtectedRoute>
                                        <Suspense fallback={<PhoenixLoader />}>
                                            <Segment />
                                        </Suspense>
                                    </ProtectedRoute>
                                ),
                            },
                            {
                                path: "entity-type",
                                element: (
                                    <ProtectedRoute>
                                        <Suspense fallback={<PhoenixLoader />}>
                                            <EntityType />
                                        </Suspense>
                                    </ProtectedRoute>
                                ),
                            },
                            {
                                path: "ffds",
                                element: (
                                    <ProtectedRoute>
                                        <Suspense fallback={<PhoenixLoader />}>
                                            <Ffds />
                                        </Suspense>
                                    </ProtectedRoute>
                                ),
                            },
                            {
                                path: "ffds/contacts/:ffdId",
                                element: (
                                    <ProtectedRoute>
                                        <Suspense fallback={<PhoenixLoader />}>
                                            <FfdContact />
                                        </Suspense>
                                    </ProtectedRoute>
                                ),
                            },
                            {
                                path: "currency",
                                element: (
                                    <ProtectedRoute>
                                        <Suspense fallback={<PhoenixLoader />}>
                                            <Currency />
                                        </Suspense>
                                    </ProtectedRoute>
                                ),
                            },
                            {
                                path: "bank-accounts",
                                element: (
                                    <ProtectedRoute>
                                        <Suspense fallback={<PhoenixLoader />}>
                                            <BankAccounts />
                                        </Suspense>
                                    </ProtectedRoute>
                                ),
                            },
                            {
                                path: "bank-details",
                                element: (
                                    <ProtectedRoute>
                                        <Suspense fallback={<PhoenixLoader />}>
                                            <BankDetails />
                                        </Suspense>
                                    </ProtectedRoute>
                                ),
                            },
                            {
                                path: "business-task-team",
                                element: (
                                    <ProtectedRoute>
                                        <Suspense fallback={<PhoenixLoader />}>
                                            <BusinessTaskTeam />
                                        </Suspense>
                                    </ProtectedRoute>
                                ),
                            },
                            {
                                path: 'assets',
                                element: (
                                    <ProtectedRoute>
                                        <Suspense fallback={<PhoenixLoader />}>
                                            <Assets />
                                        </Suspense>
                                    </ProtectedRoute>
                                )
                            },
                            {
                                path: 'asset-type',
                                element: (
                                    <ProtectedRoute>
                                        <Suspense fallback={<PhoenixLoader />}>
                                            <AssetType />
                                        </Suspense>
                                    </ProtectedRoute>
                                )
                            },
                            {
                                path: 'company-details',
                                element: (
                                    <ProtectedRoute>
                                        <Suspense fallback={<PhoenixLoader />}>
                                            <CompanyDetails />
                                        </Suspense>
                                    </ProtectedRoute>
                                )
                            },
                            {
                                path: 'credentials',
                                element: (
                                    <ProtectedRoute>
                                        <Suspense fallback={<PhoenixLoader />}>
                                            <Credentials />
                                        </Suspense>
                                    </ProtectedRoute>
                                )
                            },
                            {
                                path: "vendor-type",
                                element: (
                                    <ProtectedRoute>
                                        <Suspense fallback={<PhoenixLoader />}>
                                            <VendorType />
                                        </Suspense>
                                    </ProtectedRoute>
                                ),
                            },
                            {
                                path: "vendor-behavior",
                                element: (
                                    <ProtectedRoute>
                                        <Suspense fallback={<PhoenixLoader />}>
                                            <VendorBehavior />
                                        </Suspense>
                                    </ProtectedRoute>
                                ),
                            },
                            {
                                path: "category",
                                element: (
                                    <ProtectedRoute>
                                        <Suspense fallback={<PhoenixLoader />}>
                                            <Category />
                                        </Suspense>
                                    </ProtectedRoute>
                                ),
                            },
                            {
                                path: "product-type",
                                element: (
                                    <ProtectedRoute>
                                        <Suspense fallback={<PhoenixLoader />}>
                                            <ProductType />
                                        </Suspense>
                                    </ProtectedRoute>
                                ),
                            },
                            {
                                path: "product-condition",
                                element: (
                                    <ProtectedRoute>
                                        <Suspense fallback={<PhoenixLoader />}>
                                            <ProductCondition />
                                        </Suspense>
                                    </ProtectedRoute>
                                ),
                            },
                            {
                                path: "terms-and-conditions",
                                element: (
                                    <ProtectedRoute>
                                        <Suspense fallback={<PhoenixLoader />}>
                                            <TermsCondition />
                                        </Suspense>
                                    </ProtectedRoute>
                                ),
                            },
                            {
                                path: "unit-of-measurement",
                                element: (
                                    <ProtectedRoute>
                                        <Suspense fallback={<PhoenixLoader />}>
                                            <UnitOfMeasurement />
                                        </Suspense>
                                    </ProtectedRoute>
                                ),
                            },
                            {
                                path: "hsn-code",
                                element: (
                                    <ProtectedRoute>
                                        <Suspense fallback={<PhoenixLoader />}>
                                            <HsnCode />
                                        </Suspense>
                                    </ProtectedRoute>
                                ),
                            },
                            {
                                path: 'inco-term',
                                element: (
                                    <ProtectedRoute>
                                        <Suspense fallback={<PhoenixLoader />}>
                                            <IncoTerm />
                                        </Suspense>
                                    </ProtectedRoute>
                                )
                            },
                            {
                                path: "gst-percent",
                                element: (
                                    <ProtectedRoute>
                                        <Suspense fallback={<PhoenixLoader />}>
                                            <GstPercent />
                                        </Suspense>
                                    </ProtectedRoute>
                                ),
                            },
                            {
                                path: "kpis",
                                element: (
                                    <ProtectedRoute>
                                        <Suspense fallback={<PhoenixLoader />}>
                                            <KpiList />
                                        </Suspense>
                                    </ProtectedRoute>
                                ),
                            },
                            {
                                path: "location-detail",
                                element: (
                                    <ProtectedRoute>
                                        <Suspense fallback={<PhoenixLoader />}>
                                            <LocationDetail />
                                        </Suspense>
                                    </ProtectedRoute>
                                ),
                            },
                            {
                                path: "stages",
                                element: (
                                    <ProtectedRoute>
                                        <Suspense fallback={<PhoenixLoader />}>
                                            <Stages />
                                        </Suspense>
                                    </ProtectedRoute>
                                ),
                            },
                        ],
                    },

                    {
                        path: "/sales_crm",
                        children: [
                            {
                                path: "lead",
                                element: (
                                    <ProtectedRoute>
                                        <Suspense fallback={<PhoenixLoader />}>
                                            <Lead />
                                        </Suspense>
                                    </ProtectedRoute>
                                ),
                                children: [
                                    {
                                        path: ":leadId",
                                        element: (
                                            <ProtectedRoute>
                                                <Suspense fallback={<PhoenixLoader />}>
                                                    <MainSection />
                                                </Suspense>
                                            </ProtectedRoute>
                                        ),
                                    },
                                ],
                            },

                            {
                                path: "salesdashboard",
                                element: (
                                    <ProtectedRoute>
                                        <Suspense fallback={<PhoenixLoader />}>
                                            <SalesCrmDashboard />
                                        </Suspense>
                                    </ProtectedRoute>
                                ),

                            },
                            {
                                path: "inquiryRecived",
                                children: [
                                    {
                                        path: "MainSection/:leadId/:customerId/:uniqueQueryId",
                                        element: (
                                            <ProtectedRoute>
                                                <Suspense fallback={<PhoenixLoader />}>
                                                    <MainSection />
                                                </Suspense>
                                            </ProtectedRoute>
                                        ),
                                    },
                                ],
                            },
                            {
                                path: "leadack",
                                element: (
                                    <ProtectedRoute>
                                        <Suspense fallback={<PhoenixLoader />}>
                                            <LeadAck />
                                        </Suspense>
                                    </ProtectedRoute>
                                ),

                            },
                            {
                                path: "/sales_crm/AceFeature/TargetDashboard",
                                element: (
                                    <ProtectedRoute>
                                        <Suspense fallback={<PhoenixLoader />}>
                                            {/* <AceFeaturesReport /> */}
                                            <TargetDashboard />
                                        </Suspense>
                                    </ProtectedRoute>
                                ),

                            },
                            {
                                path: "/sales_crm/AceFeature/TreeStructure",
                                element: (
                                    <ProtectedRoute>
                                        <Suspense fallback={<PhoenixLoader />}>
                                            {/* <AceFeaturesReport /> */}
                                            <TreeStructure />
                                        </Suspense>
                                    </ProtectedRoute>
                                ),

                            },
                            {
                                path: "/sales_crm/AceFeature/AssignGoal",
                                element: (
                                    <ProtectedRoute>
                                        <Suspense fallback={<PhoenixLoader />}>
                                            <GoalManager />
                                        </Suspense>
                                    </ProtectedRoute>
                                ),

                            },
                            {
                                path: "/sales_crm/AceFeature/AcefeatureReport",
                                element: (
                                    <ProtectedRoute>
                                        <Suspense fallback={<PhoenixLoader />}>
                                            <AceFeaturesReport />
                                        </Suspense>
                                    </ProtectedRoute>
                                ),

                            },
                        ],
                    },


                    {
                        path: '/viewCustomer',
                        element: (
                            <ProtectedRoute>
                                <Suspense fallback={<PhoenixLoader />}>
                                    <ViewCustomerPage />
                                </Suspense>
                            </ProtectedRoute>
                        ),
                    },

                    {
                        path: '/viewAssigneeLeads',
                        element: (
                            <ProtectedRoute>
                                <Suspense fallback={<PhoenixLoader />}>
                                    <ViewAssigneeLeads />
                                </Suspense>
                            </ProtectedRoute>
                        ),
                    },

                    //  VIEW LEADS
                    {
                        path: '/view-leads/:id',
                        element: (
                            <ProtectedRoute>
                                <Suspense fallback={<PhoenixLoader />}>
                                    <ViewLeads />
                                </Suspense>
                            </ProtectedRoute>
                        ),
                    },

                    {
                        path: '/view-enquiry/:id',
                        element: (
                            <ProtectedRoute>
                                <Suspense fallback={<PhoenixLoader />}>
                                    <ViewEnquiry />
                                </Suspense>
                            </ProtectedRoute>
                        ),
                    },

                    {
                        path: "/kanban",
                        element: (
                            <ProtectedRoute>
                                <KanbanHeader /> {/* Constant header */}
                                <Outlet /> {/* Dynamic content */}
                            </ProtectedRoute>
                        ),
                        children: [
                            {
                                index: true, // Default route for `/kanban`
                                element: <Kanban />, // Tasks page
                            },
                            {
                                path: "kanban/:userId",
                                element: <Kanban />,
                            },
                            {
                                path: "colleaguetask",
                                element: <Colleaguetask />,
                            },
                            {
                                path: "kpiDashboard",
                                element: <KpiDashboard />,
                            },
                            {
                                path: "objectiveDashboard",
                                element: <ObjectiveDashboard />,

                            },


                        ],
                    },
                    {
                        path: "employeeList",
                        element: <EmployeeList />,
                    },
                    {
                        path: "inorbvictHierarchy",
                        element: <InorbvictHierarchy />
                    },
                    {
                        path: "inorbvictHierarchyKPI",
                        element: <InorbvictHierarchyKPI />
                    },
                    {
                        path: "setacegoals",
                        element: <SetAceGoals />
                    }
                ],
            },

            {
                path: "/pages/errors/",
                children: [
                    {
                        path: "404",
                        element: (
                            <ProtectedRoute>
                                <Error404 />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: "403",
                        element: (
                            <ProtectedRoute>
                                <Error403 />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: "500",
                        element: <Error500 />,
                    },
                ],
            },
            {
                path: "*",
                element: <Error404 />,
            },

            // {
            //     path: "/FeedbackForm",
            //     element: <FeedbackFormModal />

            // },

            {
                path: "/FeedbackForm/:leadid/:customerid",
                element: <FeedbackFormModal />
            },


            {
                path: "/ComplainForm/:leadid/:customerid",
                element: < ComplainForm />
            }
            // {
            //     path: "/kanban",
            //     element: (
            //       <ProtectedRoute>
            //         <KanbanHeader /> {/* Constant header */}
            //         <Outlet /> {/* Dynamic content */}
            //       </ProtectedRoute>
            //     ),
            //     children: [
            //       {
            //         index: true, // Default route for `/kanban`
            //         element: <Kanban />, // Tasks page
            //       },
            //       {
            //         path: "kanban", // Explicit route for `/kanban/kanban`
            //         element: <Kanban />,
            //       },
            //       {
            //         path: "colleaguetask",
            //         element: <Colleaguetask />,
            //       },
            //       {
            //         path: "kpiDashboard",
            //         element: <KpiDashboard />,
            //       },
            //       {
            //         path: "objectiveDashboard",
            //         element: <ObjectiveDashboard />,

            //       },

            //     ],
            //   },

        ],
    },
]



export const router = createBrowserRouter(routes);

export default routes;
