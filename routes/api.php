
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FfdController;
use App\Http\Controllers\IrmController;
use App\Http\Controllers\ItcController;
use App\Http\Controllers\KpiController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EbrcController;
use App\Http\Controllers\LeadController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\StageController;
use App\Http\Controllers\AssetsController;
use App\Http\Controllers\MasterController;
use App\Http\Controllers\VendorController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\HsnCodeController;
use App\Http\Controllers\MeetingController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\SegmentController;
use App\Http\Controllers\SubTaskController;
use App\Http\Controllers\VictoryController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CurrencyController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\FeedbackController;
use App\Http\Controllers\IncoTermController;
use App\Http\Controllers\ReminderController;
use App\Http\Controllers\AssetTypeController;
use App\Http\Controllers\CheckListController;
use App\Http\Controllers\ConsigneeController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\QuotationController;
use App\Http\Controllers\WarehouseController;
use App\Http\Controllers\AttachmentController;
use App\Http\Controllers\CredentialController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\EntityTypeController;
use App\Http\Controllers\FfdContactController;
use App\Http\Controllers\FfdPaymentController;
use App\Http\Controllers\GstPercentController;
use App\Http\Controllers\SbKnockOffController;
use App\Http\Controllers\TasksGraphController;
use App\Http\Controllers\VendorTypeController;
use App\Http\Controllers\BankAccountController;
use App\Http\Controllers\BankDetailsController;
use App\Http\Controllers\DesignationController;
use App\Http\Controllers\DirectoriesController;
use App\Http\Controllers\OwnpickupBtController;
use App\Http\Controllers\PriceSharedController;
use App\Http\Controllers\ProcurementController;
use App\Http\Controllers\ProductTypeController;
use App\Http\Controllers\RecruitmentController;
use App\Http\Controllers\BusinessTaskController;
use App\Http\Controllers\CustomerBaseController;
use App\Http\Controllers\CustomerTypeController;
use App\Http\Controllers\LeadfollowupController;
use App\Http\Controllers\WarehousePsdController;
use App\Http\Controllers\ContactPersonController;
use App\Http\Controllers\ExportAgentBtController;
use App\Http\Controllers\PmWorksheetBtController;
use App\Http\Controllers\ProductVendorController;
use App\Http\Controllers\PurchaseOrderController;
use App\Http\Controllers\QuotationsentController;
use App\Http\Controllers\AcAttachmentBtController;
use App\Http\Controllers\AceAndGoalController;
use App\Http\Controllers\AuthGoogleController;
use App\Http\Controllers\CompanyDetailsController;
use App\Http\Controllers\ImportPickupBtController;
use App\Http\Controllers\InquiryReceiveController;
use App\Http\Controllers\PmAttachmentBtController;
use App\Http\Controllers\TaskAttachmentController;
use App\Http\Controllers\VendorBehaviorController;
use App\Http\Controllers\LocationDetailsController;
use App\Http\Controllers\PortOfLandingBtController;
use App\Http\Controllers\ProductSourcingController;
use App\Http\Controllers\SdeAttachmentBtController;
use App\Http\Controllers\TasksAdminGraphController;
use App\Http\Controllers\BusinessTaskTeamController;
use App\Http\Controllers\PaymentHistoryBtController;
use App\Http\Controllers\ProcurementGraphController;
use App\Http\Controllers\ProductConditionController;
use App\Http\Controllers\RecruitmentGraphController;
use App\Http\Controllers\SubTaskCheckListController;
use App\Http\Controllers\VendorAttachmentController;
use App\Http\Controllers\WarehouseOutwardController;
use App\Http\Controllers\WarehouseProductController;
use App\Http\Controllers\ProcurementVendorController;
use App\Http\Controllers\ProductAttachmentController;
use App\Http\Controllers\SubTaskAttachmentController;
use App\Http\Controllers\UnitOfMeasurementController;
use App\Http\Controllers\CustomerAttachmentController;
use App\Http\Controllers\LeadAcknowledgmentController;
use App\Http\Controllers\SupplierScrutinyBtController;
use App\Http\Controllers\TermsAndConditionsController;
use App\Http\Controllers\UserPagePermissionController;
use App\Http\Controllers\DashboardPermissionController;
use App\Http\Controllers\ServedBySuppliersBtController;
use App\Http\Controllers\BusinessTaskTimelineController;
use App\Http\Controllers\RecruitmentCandidateController;
use App\Http\Controllers\FreightCostSourcingBtController;
use App\Http\Controllers\InternationalTreadingController;
use App\Http\Controllers\VendorPurchaseInvoiceController;
use App\Http\Controllers\InternationalTreadingPdfController;
use App\Http\Controllers\TwoFactorAuthController;
use App\Http\Controllers\LeadPageIndexController;

Route::post('/two-factor-challenge-submit', [TwoFactorAuthController::class, 'store'])->middleware(['web','throttle:login'])
    ->name('two-factor-fortify.login');

Route::post('/login', [AuthController::class, 'store'])->middleware(['web','throttle:login']);
Route::post('/logout', [AuthController::class, 'destroy'])->middleware(['web']);
Route::get('auth/google/redirect', [AuthGoogleController::class, 'redirectToGoogle'])->name('login.google');
Route::get('oauth/google/callback', [AuthGoogleController::class, 'processGoogleCallback'])->name('oauth.google.callback');
// Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');;



Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


// Route::resource('purchase-order', PurchaseOrderController::class);


Route::middleware('auth:sanctum')->group(function() {

    //customer start
    Route::apiResource('customers', CustomerController::class);
    Route::controller(CustomerController::class)->group(function () {
        Route::get('/customerList', 'customerList');
    });
    Route::get('/get-contact-person', [CustomerController::class, 'getContactPerson']);

    //customer-base start

    //customer-base start
    Route::controller(CustomerBaseController::class)->group(function () {
        Route::get('/customer-base', 'index');
        Route::post('/addCustomerBase', 'addCustomerBase')->name('addCustomerBase');
        Route::get('/customerBaseListing', 'customerBaseListing')->name('customerBaseListing');
        Route::get('/editCustomerBase', 'editCustomerBase')->name('editCustomerBase');
        Route::post('/updateCustomerBase', 'updateCustomerBase')->name('updateCustomerBase');
        Route::delete('/deleteCustomerBase', 'deleteCustomerBase')->name('deleteCustomerBase');
    });
    Route::apiResource('contact-persons', ContactPersonController::class);
    Route::controller(ContactPersonController::class)->group(function () {
        Route::get('/customers/contacts/{id}', 'contactPersons');
    });
    Route::apiResource('consignees', ConsigneeController::class);
    Route::controller(ConsigneeController::class)->group(function () {
        Route::get('/customers/consignees/{id}', 'Consignees');
        Route::get('getConsignees/{id}', 'getConsignees');
    });
    Route::apiResource('customer-attachments', CustomerAttachmentController::class);
    Route::controller(CustomerAttachmentController::class)->group(function () {
        Route::get('/customers/attachments/{id}', 'attachments');
        Route::post('/updateCustomerAttachment', 'updateCustomerAttachment')->name('updateCustomerAttachment');
    });
    //customer end

    // master customer-type start
    Route::apiResource('customer-type', CustomerTypeController::class);
    Route::controller(CustomerTypeController::class)->group(function () {
        Route::get('/customerTypeListing', 'customerTypeListing');
    });
    // master customer-type end
    // master segment start
    Route::apiResource('segment', SegmentController::class);
    Route::controller(SegmentController::class)->group(function () {
        Route::get('/segmentListing', 'segmentListing');
    });
    // master segment end
    // master entity-type start
    Route::apiResource('entity-type', EntityTypeController::class);
    Route::controller(EntityTypeController::class)->group(function () {
        Route::get('/entityTypeListing', 'entityTypeListing')->name('entityTypeListing');
    });
    // master entity-type end
    // master vendor-type start
    Route::apiResource('vendor-type', VendorTypeController::class);
    Route::controller(VendorTypeController::class)->group(function () {
        Route::get('/vendorTypeListing', 'vendorTypeListing')->name('vendorTypeListing');
    });
    // master vendor-type end
    // master vendor-behavior start
    Route::apiResource('vendor-behavior', VendorBehaviorController::class);
    Route::controller(VendorBehaviorController::class)->group(function () {
        Route::get('/vendorBehaviorListing', 'vendorBehaviorListing')->name('vendorBehaviorListing');
    });
    // master category start
    Route::apiResource('category', CategoryController::class);
    Route::controller(CategoryController::class)->group(function () {
        Route::get('/getCategories', 'getCategories')->name('getCategories');
        Route::get('/getCategoriesSegmentName', 'getCategoriesSegmentName')->name('getCategoriesSegmentName');
    });
    // master category end
    // master product-type start
    Route::apiResource('product-type', ProductTypeController::class);
    Route::controller(ProductTypeController::class)->group(function () {
        Route::get('/productTypeListing', 'productTypeListing')->name('productTypeListing');
    });
    // master product-type end
    // master product-conditions start
    Route::apiResource('product-condition', ProductConditionController::class);
    Route::controller(ProductConditionController::class)->group(function () {
        Route::get('/productConditionListing', 'productConditionListing')->name('productConditionListing');
    });
    // master product-conditions end
    // master unit-of-measurements start
    Route::apiResource('unit-of-measurements', UnitOfMeasurementController::class);
    Route::controller(UnitOfMeasurementController::class)->group(function () {
        Route::get('/unitOfMeasurementListing', 'unitOfMeasurementListing')->name('unitOfMeasurementListing');
    });
    // master unit-of-measurements end
    // master department start
    Route::apiResource('department', DepartmentController::class);
    Route::controller(DepartmentController::class)->group(function () {
        Route::get('/departmentListing', 'departmentListing')->name('departmentListing');
    });
    // master department end
    // master role start
    Route::apiResource('role', RoleController::class);
    Route::controller(RoleController::class)->group(function () {
        Route::get('/roleListing', 'roleListing')->name('roleListing');
    });
    // master role end
    // master designation start
    Route::apiResource('designation', DesignationController::class);
    Route::controller(DesignationController::class)->group(function () {
        Route::get('/designationListing', 'designationListing')->name('designationListing');
    });
    // master designation end
    // master hsn-code start
    Route::apiResource('hsn-code', HsnCodeController::class);
    Route::controller(HsnCodeController::class)->group(function () {
        Route::get('/hsnCodeTypeListing', 'hsnCodeTypeListing')->name('hsnCodeTypeListing');
    });
    // master hsn-code end
    // master gst-percent start
    Route::apiResource('gst-percent', GstPercentController::class);
    Route::controller(GstPercentController::class)->group(function () {
        Route::get('/gstPercentListing', 'gstPercentListing')->name('gstPercentListing');
    });
    // master gst-percent end
    // master terms-and-conditions start
    Route::apiResource('terms-and-conditions', TermsAndConditionsController::class);
    // master terms-and-conditions end
    // master asset-type start
    Route::apiResource('asset-type', AssetTypeController::class);
    // master asset-type end
    // master assets start
    Route::apiResource('assets', AssetsController::class);
    Route::controller(AssetsController::class)->group(function () {
        Route::get('/asset/list_asset/{empId}', 'listAssignedAssets')->name('listAssignedAssets');
        Route::get('/getAssetID', 'getAssetID')->name('getAssetID');
        Route::get('/fetchUnassignedAssets', 'fetchUnassignedAssets')->name('fetchUnassignedAssets');
        Route::get('/fetchAssignedAssetsToEmp', 'fetchAssignedAssetsToEmp')->name('fetchAssignedAssetsToEmp');
        Route::post('/assignAssetToEmployee', 'assignAssetToEmployee')->name('assignAssetToEmployee');
        Route::post('/unAssignAsset', 'unAssignAsset')->name('unAssignAsset');
        Route::post('/fetchAssetHistory', 'fetchAssetHistory')->name('fetchAssetHistory');
        Route::post('/updateAssets', 'updateAssets')->name('updateAssets');
        Route::get('/fetchAssetsCount', 'fetchAssetsCount')->name('fetchAssetsCount');
    });
    // master assets end
    // master inco-terms start
    Route::apiResource('inco-terms', IncoTermController::class);
    Route::controller(IncoTermController::class)->group(function () {
        Route::get('/incoTermsListing', 'incoTermsListing');
    });
    // master inco-terms end
    // master location-detail start
    Route::apiResource('location-detail', LocationDetailsController::class);
    Route::controller(LocationDetailsController::class)->group(function () {
        Route::get('/locationDetailListing', 'locationDetailListing');
    });
    // master location-detail end
    // master location-detail start
    Route::apiResource('stages', StageController::class);
    Route::controller(StageController::class)->group(function () {
        Route::get('/stagesListing', 'stagesListing');
    });
    // master location-detail end
    // master ffds start
    Route::apiResource('ffds', FfdController::class);
    Route::controller(FfdController::class)->group(function () {
        Route::get('/ffdListing', 'ffdListing');
        Route::get('/ffdListingAll', 'ffdListingAll');
    });
    // master ffds end
    // master ffd contact start
    Route::apiResource('ffd-contacts', FfdContactController::class);
    Route::controller(FfdContactController::class)->group(function () {
        Route::get('/ffds/contacts/{ffdId}', 'index');
    });
    // master ffd contact end
    //master attachment start
    Route::apiResource('attachments', AttachmentController::class);
    Route::controller(AttachmentController::class)->group(function () {
        Route::get('/getAttachmentByName/{name}', 'getAttachmentByName')->name('getAttachmentByName');
    });
    //master attachment end
    // master ffd contact start
    // master currency start
    Route::apiResource('currency', CurrencyController::class);
    Route::controller(CurrencyController::class)->group(function () {
        Route::get('/currencyListing', 'currencyListing')->name('currencyListing');
    });
    // master currency end
    // master business-task-team start
    Route::apiResource('business-task-team', BusinessTaskTeamController::class);
    Route::controller(BusinessTaskTeamController::class)->group(function () {
        Route::get('/getBTteamByName/{name}', 'getBTteamByName')->name('getBTteamByName');
        Route::get('/bTteamcreate', 'bTteamcreate')->name('bTteamcreate');
    });
    // master business-task-team end
    //bank-accounts start
    Route::apiResource('bank-accounts', BankAccountController::class);
    Route::controller(BankAccountController::class)->group(function () {
        Route::get('/bankAccountList', 'bankAccountList');
        Route::get('/getBankById', 'getBankById')->name('getBankById');
    });
    //bank-accounts end
    //bank-details start
    Route::controller(BankDetailsController::class)->group(function () {
        Route::get('/bank-details', 'index');
        Route::post('/updateBankDetails', 'updateBankDetails')->name('updateBankDetails');
    });
    //bank-details end
    //company-details start
    Route::controller(CompanyDetailsController::class)->group(function () {
        Route::get('/company-details', 'index');
        Route::get('/getCompanies', 'getCompanies')->name('getCompanies');
        Route::get('/companyDropdown', 'companyDropdown')->name('companyDropdown');
        Route::post('/fetchCompanyDetails', 'fetchCompanyDetails')->name('fetchCompanyDetails');
        Route::post('/updateCompanyDetails', 'updateCompanyDetails')->name('updateCompanyDetails');
    });
    //company-details end
    // kpi start
    Route::apiResource('kpis', KpiController::class);
    //  kpi end

    // master use credentials start
    Route::apiResource('credentials', CredentialController::class);
    Route::controller(CredentialController::class)->group(function () {
        Route::post('/fetchCredentialHistory', 'fetchCredentialHistory')->name('fetchCredentialHistory');
        Route::get('/credential/list_credential/{empId}', 'listAssignedCredential')->name('listAssignedCredential');
        Route::get('/fetchUnassignedCredential', 'fetchUnassignedCredential')->name('fetchUnassignedCredential');
        Route::get('/fetchAssignedCredentialToEmp', 'fetchAssignedCredentialToEmp')->name('fetchAssignedCredentialToEmp');
        Route::post('/assignCredentialsToEmployee', 'assignCredentialsToEmployee')->name('assignCredentialsToEmployee');
        Route::post('/unAssignCredential', 'unAssignCredential')->name('unAssignCredential');
        Route::get('/fetchCredentialsCount', 'fetchCredentialsCount')->name('fetchCredentialsCount');
    });
    // master use credentials end

    //Vendors start
    Route::apiResource('vendors', VendorController::class);
    Route::controller(VendorController::class)->group(function () {
        Route::get('/vendorsList/{sort?}', 'vendorsList');
    });
    //Vendors end

    //product start
    Route::apiResource('products', ProductController::class);
    Route::controller(ProductController::class)->group(function () {
        Route::get('/productList', 'productList');
        Route::get('/productWithVendors', 'productWithVendors');
        Route::get('/viewProduct', 'viewProduct')->name('viewProduct');
        Route::get('/getProductById', 'getProductById')->name('getProductById');
        Route::get('/exportProjects', 'exportProjects')->name('exportProjects');
        Route::get('/getProductRate/{id}', 'getProductRate')->name('getProductRate');
    });
    //product ends

    //product vendors start
    Route::controller(ProductVendorController::class)->group(function () {
        Route::get('/products/vendors/{id}', 'index');
        Route::get('/getProductsByVendor', 'getProductsByVendor')->name('getProductsByVendor');
    });
    Route::apiResource('products-vendors', ProductVendorController::class);
    //product vendors ends

    //product attachments starts
    Route::apiResource('products-attachments', ProductAttachmentController::class);
    Route::controller(ProductAttachmentController::class)->group(function () {
        Route::get('/products/attachments/{id}', 'attachments');
        Route::post('/updateProductAttachment', 'updateProductAttachment')->name('updateProductAttachment');
    });
    //product attachments end

    //business-task start
    Route::apiResource('business-task', BusinessTaskController::class);
    Route::controller(BusinessTaskController::class)->group(function () {
        Route::get('/btDropdownListing', 'btDropdownListing');
        Route::post('/createBTfromSalesMatrix', 'createBTfromSalesMatrix')->name('createBTfromSalesMatrix');
        Route::post('/updateSdeWorksheetBt', 'updateSdeWorksheetBt')->name('updateSdeWorksheetBt');
        Route::post('/updateEnquiryDetailsBt', 'updateEnquiryDetailsBt')->name('updateEnquiryDetailsBt');
        Route::post('/updateLogisticsInstructionBt', 'updateLogisticsInstructionBt')->name('updateLogisticsInstructionBt');
        Route::get('/acWorksheetEdit/{id}', 'acWorksheetEdit')->name('acWorksheetEdit');
        Route::get('/vendorPurchaseHistory/{id}', 'vendorPurchaseHistory')->name('vendorPurchaseHistory');
        Route::get('/lmWorksheetEdit/{id}', 'lmWorksheetEdit')->name('lmWorksheetEdit');
        Route::get('/fetchBusinessTaskCount', 'fetchBusinessTaskCount')->name('fetchBusinessTaskCount');
        Route::get('/checkBTcreated', 'checkBTcreated')->name('checkBTcreated');
    });
    //business-task ends

    //business-task-timeline-start
    Route::controller(BusinessTaskTimelineController::class)->group(function() {
        Route::get('/getBusinessTaskById', 'getBusinessTaskById')->name('getBusinessTaskById');
    });
    //business-task-timeline-end

    //SDE business-task starts
    Route::controller(SdeAttachmentBtController::class)->group(function () {
        Route::get('/sdeAttachmentListing/{id}', 'sdeAttachmentListing')->name('sdeAttachmentListing');
        Route::post('/storeSdeAttachmentBt', 'storeSdeAttachmentBt')->name('storeSdeAttachmentBt');
        Route::post('/updateSdeAttachmentBt', 'updateSdeAttachmentBt')->name('updateSdeAttachmentBt');
        Route::get('/showSdeAttachmentBt/{id}', 'showSdeAttachmentBt')->name('showSdeAttachmentBt');
        Route::delete('/deleteSdeAttachment', 'deleteSdeAttachment')->name('deleteSdeAttachment');
    });
    //business-task SDE ends

    //supplier-scrutiny start
    Route::controller(SupplierScrutinyBtController::class)->group(function () {
        Route::get('/getSupplierScrutinyBt/{btId}', 'getSupplierScrutinyBt')->name('getSupplierScrutinyBt');
        Route::post('/storeSupplierScrutinyBt', 'storeSupplierScrutinyBt')->name('storeSupplierScrutinyBt');
        Route::get('/editSupplierScrutinyBt/{supId}', 'editSupplierScrutinyBt')->name('editSupplierScrutinyBt');
        Route::put('/updateSupplierScrutinyBt', 'updateSupplierScrutinyBt')->name('updateSupplierScrutinyBt');
    });
    //supplier-scrutiny ends
    Route::controller(AcAttachmentBtController::class)->group(function () {
        Route::post('/storeAcAttachmentBt', 'storeAcAttachmentBt')->name('storeAcAttachmentBt');
        Route::get('/showAcAttachmentBt/{id}', 'showAcAttachmentBt')->name('showAcAttachmentBt');
        Route::delete('/deleteAcAttachment/{id}', 'deleteAcAttachment')->name('deleteAcAttachment');
    });

    Route::controller(PmAttachmentBtController::class)->group(function () {
        Route::post('/storePmAttachmentBt', 'storePmAttachmentBt')->name('storePmAttachmentBt');
        Route::get('/showPmAttachmentBt/{id}', 'showPmAttachmentBt')->name('showPmAttachmentBt');
        Route::delete('/deletePmAttachment/{id}', 'deletePmAttachment')->name('deletePmAttachment');
    });

    Route::controller(PaymentHistoryBtController::class)->group(function () {
        Route::get('/getPaymentHistoryBt/{btId}', 'getPaymentHistoryBt')->name('getPaymentHistoryBt');
        Route::post('/storePaymentHistoryBt', 'storePaymentHistoryBt')->name('storePaymentHistoryBt');
        Route::get('/getPaidAmountBt', 'getPaidAmountBt')->name('getPaidAmountBt');
        Route::get('/editPaymentHistoryBt', 'editPaymentHistoryBt')->name('editPaymentHistoryBt');
        Route::post('/updatePaymentHistoryBt', 'updatePaymentHistoryBt')->name('updatePaymentHistoryBt');
        Route::post('/storePaidAmountBt', 'storePaidAmountBt')->name('storePaidAmountBt');
    });

    Route::controller(PmWorksheetBtController::class)->group(function () {
        Route::get('/getPmWorksheetBt/{id}', 'getPmWorksheetBt')->name('getPmWorksheetBt');
        Route::get('/pmWorksheetEdit/{id}', 'pmWorksheetEdit')->name('pmWorksheetEdit');
        Route::post('/addPmWorksheetBt', 'addPmWorksheetBt')->name('addPmWorksheetBt');
        Route::put('/updatePmWorksheetBt/{id}', 'updatePmWorksheetBt')->name('updatePmWorksheetBt');
    });
    Route::controller(FreightCostSourcingBtController::class)->group(function () {
        Route::get('/getFreightcostSourcingBt/{bTid}', 'getFreightcostSourcingBt');
        Route::post('/storeFreightcostSourcingBt', 'storeFreightcostSourcingBt');
        Route::get('/editFreightcostSourcingBt/{bTid}', 'editFreightcostSourcingBt');
        Route::post('/updateFreightcostSourcingBt/{id}', 'updateFreightcostSourcingBt');
        Route::get('/getWinnerFFD', 'getWinnerFFD');
    });
    Route::controller(OwnpickupBtController::class)->group(function () {
        Route::get('/getOwnpickupBt/{btId}', 'getOwnpickupBt');
        Route::post('/storeOwnpickupBt', 'storeOwnpickupBt');
        Route::get('/editOwnpickupBt/{pickId}', 'editOwnpickupBt');
        Route::put('/updateOwnpickupBt/{pickId}', 'updateOwnpickupBt');
    });
    Route::controller(ServedBySuppliersBtController::class)->group(function () {
        Route::get('/getServeBySuppliersBt/{btId}', 'getServeBySuppliersBt');
        Route::post('/storeServeBySuppliersBt', 'storeServeBySuppliersBt');
        Route::get('/editServeBySuppliersBt/{supplierId}', 'editServeBySuppliersBt');
        Route::put('/updateServeBySuppliersBt/{supplierId}', 'updateServeBySuppliersBt');
    });
    Route::controller(ImportPickupBtController::class)->group(function () {
        Route::get('/getImportPickupBt/{btId}', 'getImportPickupBt');
        Route::post('/storeImportPickupBt', 'storeImportPickupBt');
        Route::get('/editImportPickupBt/{importId}', 'editImportPickupBt');
        Route::put('/updateImportPickupBt/{importId}', 'updateImportPickupBt');
    });
    Route::controller(ExportAgentBtController::class)->group(function () {
        Route::get('/getExportAgentBt/{btId}', 'getExportAgentBt');
        Route::post('/storeExportAgentBt', 'storeExportAgentBt');
        Route::get('/editExportAgentBt/{eaId}', 'editExportAgentBt');
        Route::put('/updateExportAgentBt/{eaId}', 'updateExportAgentBt');
    });
    Route::controller(PortOfLandingBtController::class)->group(function () {
        Route::get('/getPortOfLandingBt/{btId}', 'getPortOfLandingBt');
        Route::post('/storePortOfLandingBt', 'storePortOfLandingBt');
        Route::get('/editPortOfLandingBt/{polId}', 'editPortOfLandingBt');
        Route::put('/updatePortOfLandingBt/{polId}', 'updatePortOfLandingBt');
    });

    //purchase-order start
    Route::controller(PurchaseOrderController::class)->group(function () {
        Route::get('/po_listing', 'po_listing');
        Route::get('/po_vendor_only_listing', 'po_vendor_only_listing');
        Route::get('/getNextPOId', 'getNextPOId');
        Route::get('/pdfWithSignature/{id}', 'pdfWithSignature');
        Route::get('/pdfWithOutSignature/{id}', 'pdfWithOutSignature');
        Route::get('/getProductWithVendorAmount', 'getProductWithVendorAmount')->name('getProductWithVendorAmount');
        Route::post('/updatePo', 'updatePo')->name('updatePo');
        Route::delete('/deletePOProduct', 'deletePOProduct')->name('deletePOProduct');
        Route::get('/getPOVendorName', 'getPOVendorName')->name('getPOVendorName');
        Route::get('/getPOPaymentHistory', 'getPOPaymentHistory')->name('getPOPaymentHistory');
        Route::post('/link_PO_to_BT', 'link_PO_to_BT')->name('link_PO_to_BT');
        Route::post('/addPayment', 'addPayment')->name('addPayment');
        Route::post('/addHistory', 'addHistory')->name('addHistory');
        Route::get('/getPaymentHistories', 'getPaymentHistories')->name('getPaymentHistories');
        Route::post('/link_BT_TO_PO', 'link_BT_TO_PO')->name('link_BT_TO_PO');
        Route::post('/addQuotationAttachmentPO', 'addQuotationAttachmentPO')->name('addQuotationAttachmentPO');
        Route::delete('/deletePOQuotationsAttachment', 'deletePOQuotationsAttachment')->name('deletePOQuotationsAttachment');
    });
    Route::apiResource('purchase-order', PurchaseOrderController::class);
    //purchase-order start

    // employee start
    Route::apiResource('employees', EmployeeController::class);
    Route::controller(EmployeeController::class)->group(function () {
        Route::get('/employees_list', 'employees_list');
        Route::get('/activityLogs', 'activityLogs');
        Route::get('/employee/fetchEmpData', 'fetchEmpData')->name('fetchEmpData');
        Route::get('/editEmployeePassword', 'editEmployeePassword')->name('editEmployeePassword');
        Route::get('/editTaskIsUnder', 'editTaskIsUnder')->name('editTaskIsUnder');
        Route::post('/updateEmployeePassword', 'updateEmployeePassword')->name('updateEmployeePassword');
        Route::post('/updateTaskIsUnder', 'updateTaskIsUnder')->name('updateTaskIsUnder');
        Route::post('/changeIsClickUpOn', 'changeIsClickUpOn')->name('changeIsClickUpOn');
        Route::post('/disableEmployeeMfa', 'disableEmployeeMfa')->name('disableEmployeeMfa');
        Route::get('/showEmpMFA/{userId}', 'showEmpMFA')->name('showEmpMFA');
        Route::post('/enableEmpMFA', 'enableEmpMFA')->name('enableEmpMFA');
        Route::post('/deleteEmployeeTasks', 'deleteEmployeeTasks')->name('deleteEmployeeTasks');
        Route::get('/isUnderEmployeeList', 'isUnderEmployeeList')->name('isUnderEmployeeList');
        Route::get('/fetchEmployeeCounts', 'fetchEmployeeCounts')->name('fetchEmployeeCounts');
        Route::get('/getHierarchyAceAndGoal', 'getHierarchyAceAndGoal')->name('getHierarchyAceAndGoal');

    });
    // employee end
    Route::controller(UserPagePermissionController::class)->group(function () {
        Route::get('/editPermission', 'editPermission')->name('editPermission');
        Route::post('/updatePermission', 'updatePermission')->name('updatePermission');
    });
    Route::controller(DashboardPermissionController::class)->group(function () {
        Route::get('/editDashboardPermission', 'editDashboardPermission')->name('editDashboardPermission');
        Route::post('/updateDashboardPermission', 'updateDashboardPermission')->name('updateDashboardPermission');
    });

    // recruitment start
    Route::apiResource('recruitment', RecruitmentController::class);
    Route::controller(RecruitmentController::class)->group(function () {
        Route::get('/editRecruitment', 'editRecruitment')->name('editRecruitment');
        Route::post('/updateRecruitment', 'updateRecruitment')->name('updateRecruitment');
        Route::delete('/deleteRecruitment', 'deleteRecruitment')->name('deleteRecruitment');
        Route::get('/fetchRecruitmentCount', 'fetchRecruitmentCount')->name('fetchRecruitmentCount');
        Route::get('/fetchRecruitmentDashboardData', 'fetchRecruitmentDashboardData')->name('fetchRecruitmentDashboardData');
        Route::get('/fetchRecruitmentEmployeesDropdown', 'fetchRecruitmentEmployeesDropdown')->name('fetchRecruitmentEmployeesDropdown');
        Route::post('/fetchDashboardRecruitmentCandidates', 'fetchDashboardRecruitmentCandidates')->name('fetchDashboardRecruitmentCandidates');
    });
    // recruitment end

    // recruitment candidates start
    Route::apiResource('recruitment-candidates', RecruitmentCandidateController::class);
    Route::controller(RecruitmentCandidateController::class)->group(function () {
        Route::get('/recruitmentCandidates/{id}', 'recruitmentCandidates')->name('recruitmentCandidates');
        Route::post('/updateCandidate', 'updateCandidate')->name('updateCandidate');
    });
    // recruitment candidates end
    //Recruitment Graphs start
    Route::controller(RecruitmentGraphController::class)->group(function () {
        Route::post('/fetchIndividualGraphData', 'fetchIndividualGraphData')->name('fetchIndividualGraphData');
        Route::post('/fetchSelfCreatedGraphData', 'fetchSelfCreatedGraphData')->name('fetchSelfCreatedGraphData');
        Route::post('/fetchAssignedGraphData', 'fetchAssignedGraphData')->name('fetchAssignedGraphData');
    });
    //Recruitment Graphs end

    Route::controller(MasterController::class)->group(function () {
        Route::get('/countryListing', 'countryListing')->name('countryListing');
        Route::get('/getStates', 'getStates')->name('getStates');
        Route::get('/getStatesByName', 'getStatesByName')->name('getStatesByName');
        Route::get('/getTimezoneList', 'getTimezoneList');
        Route::get('/getFileDownload', 'getFileDownload');

        Route::get('/getProductsCount', 'getProductsCount');
        Route::get('/getCustomersCount', 'getCustomersCount');
        Route::get('/getVendorsCount', 'getVendorsCount');
        Route::get('/getDirectoriesCount', 'getDirectoriesCount');
        Route::get('/getLogisticsCount', 'getLogisticsCount');
    });

    //Vendors contacts start
    Route::apiResource('vendors-contacts', ContactController::class);
    Route::controller(ContactController::class)->group(function () {
        Route::get('/vendors/contacts/{id}', 'contacts');
    });
    //Vendors contacts end
    //Vendors attachments start
    Route::apiResource('vendors-attachments', VendorAttachmentController::class);
    Route::controller(VendorAttachmentController::class)->group(function () {
        Route::get('/vendors/attachments/{id}', 'attachments');
        Route::post('/updateVendorAttachment', 'updateVendorAttachment')->name('updateVendorAttachment');
    });
    //Vendors attachments end

    //Procurement start
    Route::apiResource('procurements', ProcurementController::class);
    Route::controller(ProcurementController::class)->group(function () {
        Route::get('/fetchProcurementCount', 'fetchProcurementCount')->name('fetchProcurementCount');
        Route::get('/fetchProcurementProducts/{id}', 'fetchProcurementProducts')->name('fetchProcurementProducts');
    });
    //Procurement end
    //Procurement vendors start
    Route::apiResource('procurement-vendors', ProcurementVendorController::class);
    Route::controller(ProcurementVendorController::class)->group(function () {
        Route::get('/procurement/vendors/{id}', 'index');
        Route::post('/updateProcurementVendor', 'updateProcurementVendor');
    });
    //Procurement vendors end

    //Procurement graph end
    Route::controller(ProcurementGraphController::class)->group(function () {
        Route::get('/procurementTotalSourcing', 'procurementTotalSourcing')->name('procurementTotalSourcing');
        Route::get('/procurementClosedAdminGraph', 'procurementClosedAdminGraph')->name('procurementClosedAdminGraph');
        Route::get('/procurementOpenAdminGraph', 'procurementOpenAdminGraph')->name('procurementOpenAdminGraph');
        Route::post('/procurementProductIndividual', 'procurementProductIndividual')->name('procurementProductIndividual');
        Route::get('/procurementPieChart', 'procurementPieChart')->name('procurementPieChart');
        Route::post('/procurementClosedIndividualChart', 'procurementClosedIndividualChart')->name('procurementClosedIndividualChart');
        Route::post('/procurementOpenedIndividualChart', 'procurementOpenedIndividualChart')->name('procurementOpenedIndividualChart');
    });
    //Procurement graph end

    //Quotations start
    Route::apiResource('quotations', QuotationController::class);
    Route::controller(QuotationController::class)->group(function () {
        Route::get('/piListing', 'piListing');
        Route::get('/createNextQuotationId', 'createNextQuotationId');
        Route::delete('/deleteQuotationProduct', 'deleteQuotationProduct');
        Route::get('/pdfWithSignatureQuotation/{id}', 'pdfWithSignatureQuotation');
        Route::get('/pdfWithOutSignatureQuotation/{id}', 'pdfWithOutSignatureQuotation');
        Route::get('/quotation_pdfTPA/{id}', 'quotation_pdfTPA');
        Route::get('/quotation_pdfBD/{id}', 'quotation_pdfBD');
        Route::get('/quotation_pdfCD/{id}', 'quotation_pdfCD');
        Route::get('/quotation_pdfSC/{id}', 'quotation_pdfSC');
    });
    //Quotations end

    //irm start
    Route::controller(IrmController::class)->group(function () {
        Route::get('/irms', 'index');
        Route::get('/fetchIrm', 'fetchIrm')->name('fetchIrm');
        Route::post('/addIrm', 'addIrm')->name('addIrm');
        Route::get('/editIrm/{irmId}', 'editIrm')->name('editIrm');
        Route::post('/updateIrm', 'updateIrm')->name('updateIrm');
        Route::get('/irmHavingOutstandingAmount', 'irmHavingOutstandingAmount')->name('irmHavingOutstandingAmount');
        Route::post('/updateIrmConsignee', 'updateIrmConsignee')->name('updateIrmConsignee');
        Route::get('/getIrmById/{id}', 'getIrmById')->name('getIrmById');
        Route::get('/removeIrmById', 'removeIrmById')->name('removeIrmById');
        Route::get('/getIrmSelectedById', 'getIrmSelectedById')->name('getIrmSelectedById');
        Route::post('/historyIrm', 'historyIrm')->name('historyIrm');
        Route::get('/getTaskIdBuyer/{id}', 'getTaskIdBuyer')->name('getTaskIdBuyer');
        Route::delete('/deleteIrmAttachment', 'deleteIrmAttachment')->name('deleteIrmAttachment');
    });
    //irm end
    // international treading start
    Route::apiResource('invoices', InternationalTreadingController::class);
    Route::controller(InternationalTreadingController::class)->group(function () {
        Route::post('/updateInvoice', 'updateInvoice')->name('updateInvoice');
        Route::get('/getNextInvoiceId', 'getNextInvoiceId')->name('getNextInvoiceId');
        Route::get('/getInvoiceByNumberBt', 'getInvoiceByNumberBt')->name('getInvoiceByNumberBt');
        Route::get('/fetchITHistory', 'fetchITHistory')->name('fetchITHistory');
        Route::get('/getEDocsTimelineByBtId', 'getEDocsTimelineByBtId')->name('getEDocsTimelineByBtId');
        Route::delete('/deleteInvoiceProduct', 'deleteInvoiceProduct')->name('deleteInvoiceProduct');
        Route::delete('/deleteInvoiceWt', 'deleteInvoiceWt')->name('deleteInvoiceWt');
        Route::delete('/deleteInvoicePiAttachment', 'deleteInvoicePiAttachment')->name('deleteInvoicePiAttachment');
        Route::delete('/deleteInvoiceTpAttachment', 'deleteInvoiceTpAttachment')->name('deleteInvoiceTpAttachment');
        Route::delete('/deleteInvoiceFiAttachment', 'deleteInvoiceFiAttachment')->name('deleteInvoiceFiAttachment');
        Route::delete('/deleteInvoicePoAttachment', 'deleteInvoicePoAttachment')->name('deleteInvoicePoAttachment');
        Route::delete('/deleteInvoiceLcAttachment', 'deleteInvoiceLcAttachment')->name('deleteInvoiceLcAttachment');
        Route::delete('/deleteInvoiceBeAttachment', 'deleteInvoiceBeAttachment')->name('deleteInvoiceBeAttachment');
        Route::delete('/deleteInvoiceVeAttachment', 'deleteInvoiceVeAttachment')->name('deleteInvoiceVeAttachment');
    });
    // international treading end
    // international treading pdf start
    Route::controller(InternationalTreadingPdfController::class)->group(function () {
        Route::get('/pdfInvoice/{id}', 'pdfInvoice')->name('pdfInvoice');
        Route::get('/pdfInvoiceWithSign/{id}', 'pdfInvoiceWithSign')->name('pdfInvoiceWithSign');
        Route::get('/pdfPackingList/{id}', 'pdfPackingList')->name('pdfPackingList');
        Route::get('/pdfPackingListWithSign/{id}', 'pdfPackingListWithSign')->name('pdfPackingListWithSign');
        Route::get('/pdfShipperLetter/{id}', 'pdfShipperLetter')->name('pdfShipperLetter');
        Route::get('/pdfNonHazardousCargo/{id}', 'pdfNonHazardousCargo')->name('pdfNonHazardousCargo');
        Route::get('/pdfAnnexureA/{id}', 'pdfAnnexureA')->name('pdfAnnexureA');
        Route::get('/pdfAppendixI/{id}', 'pdfAppendixI')->name('pdfAppendixI');
        Route::get('/pdfDeliveryChallan/{id}', 'pdfDeliveryChallan')->name('pdfDeliveryChallan');
        Route::get('/pdfAP/{id}', 'pdfAP')->name('pdfAP');
        Route::get('/pdfIRS/{id}', 'pdfIRS')->name('pdfIRS');
        Route::get('/pdfTPA/{id}', 'pdfTPA')->name('pdfTPA');
        Route::get('/pdfBD/{id}', 'pdfBD')->name('pdfBD');
        Route::get('/pdfCD/{id}', 'pdfCD')->name('pdfCD');
        Route::get('/pdfAWB_BL/{id}', 'pdfAWB_BL')->name('pdfAWB_BL');
        Route::get('/getScometPDF/{inv_id}/{use_of_goods}', 'getScometPDF')->name('getScometPDF');
    });
    // international treading pdf end
    // directories start
    Route::apiResource('directories', DirectoriesController::class);
    Route::controller(DirectoriesController::class)->group(function () {
        Route::post('/updateDirectories', 'updateDirectories')->name('updateDirectories');
    });
    // directories end

    //WMS Routes
    Route::controller(WarehouseController::class)->group(function () {
        Route::get('/inwardListing', 'inwardListing')->name('inwardListing');
        Route::post('/storeInward', 'storeInward')->name('storeInward');
        Route::get('/edit-inward/{id}', 'editInward')->name('edit-inward');
        Route::post('/updateInwardDetails', 'updateInwardDetails')->name('updateInwardDetails');
        Route::delete('/deleteInward', 'deleteInward')->name('deleteInward');

        Route::get('/getGrnDetails', 'getGrnDetails')->name('getGrnDetails');
        Route::post('/addGrnToInward', 'addGrnToInward')->name('addGrnToInward');
        Route::post('/editPODetailsWMS', 'editPODetailsWMS')->name('editPODetailsWMS');
        Route::get('/getBoxById', 'getBoxById')->name('getBoxById');
        Route::post('/addBoxToGrn', 'addBoxToGrn')->name('addBoxToGrn');
        Route::delete('/deleteBoxDetails', 'deleteBoxDetails')->name('deleteBoxDetails');
        //attachments against inward
        Route::post('/addShipmentAttachments', 'addShipmentAttachments')->name('addShipmentAttachments');
        Route::delete('/deleteInwardAttachment', 'deleteInwardAttachment')->name('deleteInwardAttachment');
        //p&l routes
        Route::get('/packagingListing', 'packagingListing');
        Route::get('/createPackaging', 'createPackaging');
        Route::get('/complete-packaging/{id}', 'completePackaging')->name('complete-packaging');
        Route::get('/getInwardGRNs', 'getInwardGRNs')->name('getInwardGRNs');
        Route::get('getBoxesByGrnId', 'getBoxesByGrnId')->name('getBoxesByGrnId');
        Route::post('/addPackagingDetails', 'addPackagingDetails')->name('addPackagingDetails');
        Route::delete('/deletePackagingLabeling', 'deletePackagingLabeling')->name('deletePackagingLabeling');
        Route::get('/create-packaging-sticker/{id}/{box_id?}', 'createPackingSticker')->name('create-packaging-sticker');

        //PDF routes
        Route::post('/getFreightEnquiryPDF', 'getFreightEnquiryPDF')->name('getFreightEnquiryPDF');
        Route::get('/pdfInward/{id}/{box_id?}', 'pdfInward')->name('pdfInward');

        //reporting routes
        Route::get('/wmsReporting', 'wmsReporting')->name('wmsReporting');
        Route::post('/getReportingDetails', 'getReportingDetails');
    });

    //WMS Products Routes
    Route::apiResource('warehouse-products', WarehouseProductController::class);
    Route::controller(WarehouseProductController::class)->group(function () {
        Route::delete('/deleteBoxProduct', 'deleteBoxProduct')->name('deleteBoxProduct');
    });

    //Warehouse Outward related routes Start
    Route::apiResource('warehouse-outward', WarehouseOutwardController::class);
    Route::controller(WarehouseOutwardController::class)->group(function () {
        Route::get('/createOutward', 'createOutward')->name('createOutward');
        Route::get('getInvoiceDetailsOnOutward', 'getInvoiceDetailsOnOutward')->name('getInvoiceDetailsOnOutward');
        Route::get('/create-outward-sticker/{id}', 'createOutwardSticker')->name('create-outward-sticker');
        Route::post('updateOutward', 'updateOutward')->name('updateOutward');
    });
    //Warehouse Outward related routes End
    //Warehouse PSD related routes Start
    Route::apiResource('warehouse-psd', WarehousePsdController::class);
    Route::controller(WarehousePsdController::class)->group(function () {
        Route::get('createPsd', 'createPsd')->name('createPsd');
        Route::get('getInvoiceDetailsOnPsd', 'getInvoiceDetailsOnPsd')->name('getInvoiceDetailsOnPsd');
    });
    //Warehouse PSD related routes End
    //ebrc start
    Route::controller(EbrcController::class)->group(function () {
        Route::get('/ebrcPendingInvoiceListing', 'ebrcPendingInvoiceListing')->name('ebrcPendingInvoiceListing');
        Route::get('/getEbrcInvoiceDetails', 'getEbrcInvoiceDetails')->name('getEbrcInvoiceDetails');
        Route::post('/updateEbrc', 'updateEbrc')->name('updateEbrc');
    });
    Route::resource('ebrc', EbrcController::class);
    //ebrc end

    //Vendor Purchase Invoice
    Route::apiResource('vendor-purchase-invoice', VendorPurchaseInvoiceController::class);
    Route::controller(VendorPurchaseInvoiceController::class)->group(function () {
        Route::get('getVendorPurchaseAttachments', 'getVendorPurchaseAttachments')->name('getVendorPurchaseAttachments');
        Route::get('getVendorPayment', 'getVendorPayment')->name('getVendorPayment');
        Route::post('updateVendorPurchaseInvoice', 'updateVendorPurchaseInvoice')->name('updateVendorPurchaseInvoice');
    });

    //FFD Payment related Routes
    Route::controller(FfdPaymentController::class)->group(function () {
        Route::get('ffd-payment', 'index')->name('ffd-payment');
    });

    //ITC Routes
    Route::controller(ItcController::class)->group(function () {
        // Route::get('itc', 'itc')->name('itc');
        Route::post('get-itc-data', 'getItcData')->name('get-itc-data');
    });
    //Shipping Bill Knock related Routes
    Route::controller(SbKnockOffController::class)->group(function () {
        // Route::get('sb-knockoff', 'sb_knockoff')->name('sb-knockoff');
        Route::post('sb-knockoff', 'getKnockoff');
    });

    //Ace and Goal API
    Route::controller(AceAndGoalController::class)->group(function () {
        Route::post('getEmployeesKpiList', 'index');
        Route::post('aceAndGoalAllIsUnderUsers', 'aceAndGoalAllIsUnderUsers');
        Route::post('aceAndGoalIsUnderUsersByRole', 'aceAndGoalIsUnderUsersByRole');
        Route::post('toggleAceAndGoalPreferences', 'toggleAceAndGoalPreferences');
    });

    //Routes for Project Navigator
    // task start
    Route::controller(TaskController::class)->group(function () {
        Route::post('/createTask', 'createTask')->name('createTask');
        Route::post('/updateKanbanStatus', 'updateKanbanStatus')->name('updateKanbanStatus');

        Route::get('/tasks/employee_task/{id}/{isAdmin}', 'getEmployeeTasks')->name('getEmployeeTasks');
        Route::post('/updateTask', 'updateTask')->name('updateTask');
        Route::post('/updateStageNext', 'updateStageNext')->name('updateStageNext');
        Route::post('/updateSprintPoint', 'updateSprintPoint')->name('updateSprintPoint');
        Route::post('/updateAssigneeTask', 'updateAssigneeTask')->name('updateAssigneeTask');
        Route::post('/storeCommentTask', 'storeCommentTask')->name('storeCommentTask');
        Route::post('/addMultipleTask', 'addMultipleTask')->name('addMultipleTask');
        Route::post('/updateTarget', 'updateTarget')->name('updateTarget');
        Route::post('/addTargetReport', 'addTargetReport')->name('addTargetReport');
        Route::get('/makeDoneReport', 'makeDoneReport')->name('makeDoneReport');
        Route::get('/editTask', 'editTask')->name('editTask');
        Route::get('/fetchTask', 'fetchTask')->name('fetchTask');
        Route::get('/targetList', 'targetList')->name('targetList');
        Route::get('/timelineTask', 'timelineTask')->name('timelineTask');
        Route::delete('/deleteTask', 'deleteTask')->name('deleteTask');
        Route::get('/kpiListing', 'kpiListing')->name('kpiListing');
        Route::get('/getReportsToName', 'getReportsToName')->name('getReportsToName');
    });
    Route::apiResource('tasks', TaskController::class);

    Route::controller(TaskAttachmentController::class)->group(function () {
        Route::get('/fetchAllTaskAttachments', 'fetchAllTaskAttachments')->name('fetchAllTaskAttachments');
        Route::post('/addTaskAttachment', 'addTaskAttachment')->name('addTaskAttachment');
        Route::delete('/deleteTaskAttachment', 'deleteTaskAttachment')->name('deleteTaskAttachment');
    });

    Route::controller(TasksGraphController::class)->group(function () {
        Route::get('/objectiveStageGraph', 'objectiveStageGraph')->name('objectiveStageGraph');
        Route::get('/objectiveStageColleagueGraph', 'objectiveStageColleagueGraph')->name('objectiveStageColleagueGraph');
        Route::get('/objectivePriorityGraph', 'objectivePriorityGraph')->name('objectivePriorityGraph');
        Route::get('/objectiveCreatedByMeGraph', 'objectiveCreatedByMeGraph')->name('objectiveCreatedByMeGraph');
        Route::get('/objectiveAssignedByMeGraph', 'objectiveAssignedByMeGraph')->name('objectiveAssignedByMeGraph');
        Route::get('/objectiveAssignedToMeGraph', 'objectiveAssignedToMeGraph')->name('objectiveAssignedToMeGraph');
        Route::get('/objectiveTargetTrackerGraph', 'objectiveTargetTrackerGraph')->name('objectiveTargetTrackerGraph');
        Route::get('/objectiveCautionListGraph', 'objectiveCautionListGraph')->name('objectiveCautionListGraph');
        Route::get('/objectiveCalendarView', 'objectiveCalendarView')->name('objectiveCalendarView');

        // kpi graph routes
        Route::get('/kpiStageGraph', 'kpiStageGraph')->name('kpiStageGraph');
        Route::get('/kpiPriorityGraph', 'kpiPriorityGraph')->name('kpiPriorityGraph');
        Route::get('/kpiTargetGraph', 'kpiTargetGraph')->name('kpiTargetGraph');
        Route::get('/allTeamSummary', 'allTeamSummary')->name('allTeamSummary');
        Route::get('/kpiDistributionAcrossDept', 'kpiDistributionAcrossDept')->name('kpiDistributionAcrossDept');
        Route::get('/roleBasedKpiDistribution', 'roleBasedKpiDistribution')->name('roleBasedKpiDistribution');
        Route::get('/kpiPerformanceSummary', 'kpiPerformanceSummary')->name('kpiPerformanceSummary');
        Route::get('/kpiTargetWiseDistribution', 'kpiTargetWiseDistribution')->name('kpiTargetWiseDistribution');
        Route::get('/kpiDistributionDetails', 'kpiDistributionDetails')->name('kpiDistributionDetails');
        Route::get('/roleWiseAndCompletionRateGraph', 'roleWiseAndCompletionRateGraph')->name('roleWiseAndCompletionRateGraph');
        Route::get('/firstLineTeamDashboard', 'firstLineTeamDashboard')->name('firstLineTeamDashboard');

        //kpi graph L-0
        Route::get('/kpiGraphsLevelZero', 'kpiGraphsLevelZero')->name('kpiGraphsLevelZero');

    });

    // sub task start
    Route::controller(SubTaskController::class)->group(function () {
        Route::get('/fetchSubtaskList', 'fetchSubtaskList')->name('fetchSubtaskList');
        Route::get('/editSubtask', 'editSubtask')->name('editSubtask');
        Route::get('/timelineSubTask', 'timelineSubTask')->name('timelineSubTask');
        Route::post('/addSubtaskList', 'addSubtaskList')->name('addSubtaskList');
        Route::post('/updateSubtaskStage', 'updateSubtaskStage')->name('updateSubtaskStage');
        Route::post('/updateStageNextSubtask', 'updateStageNextSubtask')->name('updateStageNextSubtask');
    Route::post('/updateSubTask', 'updateSubTask')->name('updateSubTask');
        Route::post('/updateSubtaskSprintPoint', 'updateSubtaskSprintPoint')->name('updateSubtaskSprintPoint');
        Route::post('/updateAssigneeSubTask', 'updateAssigneeSubTask')->name('updateAssigneeSubTask');
        Route::post('/storeCommentSubTask', 'storeCommentSubTask')->name('storeCommentSubTask');
        Route::delete('/deleteSubtask', 'deleteSubtask')->name('deleteSubtask');
    });
    Route::controller(SubTaskCheckListController::class)->group(function () {
        Route::get('/fetchSubTaskTodoList', 'fetchSubTaskTodoList')->name('fetchSubTaskTodoList');
        Route::get('/editSubTaskCheckList', 'editSubTaskCheckList')->name('editSubTaskCheckList');
        Route::get('/fetchSubTaskCompleteList', 'fetchSubTaskCompleteList')->name('fetchSubTaskCompleteList');
        Route::post('/addSubTaskCheckList', 'addSubTaskCheckList')->name('addSubTaskCheckList');
        Route::post('/updateSubTaskCheckList', 'updateSubTaskCheckList')->name('updateSubTaskCheckList');
        Route::post('/markSubTaskCompleted', 'markSubTaskCompleted')->name('markSubTaskCompleted');
        Route::post('/markSubTaskTodo', 'markSubTaskTodo')->name('markSubTaskTodo');
        Route::delete('/deleteSubTaskCheckList', 'deleteSubTaskCheckList')->name('deleteSubTaskCheckList');
    });
    Route::controller(SubTaskAttachmentController::class)->group(function () {
        Route::get('/fetchAllSubTaskAttachments', 'fetchAllSubTaskAttachments')->name('fetchAllSubTaskAttachments');
        Route::post('/addSubTaskAttachment', 'addSubTaskAttachment')->name('addSubTaskAttachment');
        Route::delete('/deleteSubTaskAttachment', 'deleteSubTaskAttachment')->name('deleteSubTaskAttachment');
    });

    Route::controller(CheckListController::class)->group(function () {
        Route::get('/fetchTodoList', 'fetchTodoList')->name('fetchTodoList');
        Route::get('/editTaskCheckList', 'editTaskCheckList')->name('editTaskCheckList');
        Route::get('/fetchCompleteList', 'fetchCompleteList')->name('fetchCompleteList');
        Route::post('/addCheckList', 'addCheckList')->name('addCheckList');
        Route::post('/updateCheckList', 'updateCheckList')->name('updateCheckList');
        Route::post('/markCompleted', 'markCompleted')->name('markCompleted');
        Route::post('/markTodo', 'markTodo')->name('markTodo');
        Route::delete('/deleteCheckList', 'deleteCheckList')->name('deleteCheckList');
    });

    Route::controller(TasksAdminGraphController::class)->group(function () {
        Route::get('/admin-graph-dashboard', 'adminGraphDashboard')->name('admin-graph-dashboard');
        Route::get('/fetchAdminObjectiveGraphData', 'fetchAdminObjectiveGraphData')->name('fetchAdminObjectiveGraphData');
        Route::get('/fetchAdminKPIGraphData', 'fetchAdminKPIGraphData')->name('fetchAdminKPIGraphData');
    });
});


//************************** sales_crm routes **************************************************
// Fetch roles and permissions for the authenticated user
Route::middleware('auth:sanctum')->get('/user/roles-permissions', [AuthController::class, 'getPermissions']);
Route::middleware('auth:sanctum')->post('/assignLeadToSalesperson', [LeadController::class,'assignLeadToSalesperson']);
Route::middleware('auth:sanctum')->post('/assignLeadToSalesperson2', [LeadController::class,'assignLeadToSalesperson2']);
Route::get('/getAssignedLeadDates', [LeadController::class, 'getAssignedLeadDates']);

Route::get('/getLeadsBySalesperson', [LeadController::class, 'getLeadsBySalesperson']);
Route::get('/Salesperson_List', [LeadController::class, 'Salesperson_List']);
Route::get('/Salesperson_List_new', [LeadController::class, 'Salesperson_List_new']);
Route::post('/store-lead', [LeadController::class, 'store_lead']);
Route::post('/convert_to_qualified', [LeadController::class, 'convert_to_qualified']);
Route::post('/convert_to_disqualified', [LeadController::class, 'convert_to_disqualified']);
Route::get('/salesperson/platforms', [LeadController::class, 'getPlatformBySalesperson']);



Route::middleware('auth:sanctum')->get('/lead', [LeadController::class, 'index']);
Route::get('/showlead', [LeadController::class, 'showLead']);
Route::post('/update-lead-customer', [LeadController::class, 'updateLeadCustomer']);
Route::get('/getSender', [LeadController::class, 'getSender']);

//customer_person_directory
Route::post('/storeCustomerContacts', [LeadController::class, 'storeCustomerContacts']);
Route::post('/updateCustomerContacts_directory', [LeadController::class, 'updateCustomerContacts_directory']);
Route::post('/updateCustomerContacts_directory_id', [LeadController::class, 'updateCustomerContacts_directory_id']);
Route::get('/showCustomerContactsDirectory', [LeadController::class, 'showCustomerContactsDirectory']);
Route::post('/deleteCustomerContacts_directory_id', [LeadController::class, 'deleteCustomerContacts_directory_id']);


// customer_consignee_directory
Route::post('/storeCustomerConsignees', [LeadController::class, 'storeCustomerConsignees']);
Route::post('/updateCustomerConsignees_directory', [LeadController::class, 'updateCustomerConsignees_directory']);
Route::post('/updateCustomerConsignees_directory_id', [LeadController::class, 'updateCustomerConsignees_directory_id']);
Route::get('/showCustomerConsigneeDirectory', [LeadController::class, 'showCustomerConsigneeDirectory']);
Route::post('/deleteCustomerConsignees_directory_id', [LeadController::class, 'deleteCustomerConsignees_directory_id']);



Route::post('/lead_store', [LeadController::class, 'store'])->name('lead.store');
Route::post('/check_existing_user', [LeadController::class, 'checkExistingUser']);
Route::post('/deleteUser_temporary', [LeadController::class, 'deleteUser_temporary']);


// inquiry_recive
Route::post('/inquiry_recive', [InquiryReceiveController::class, 'inquiry_recive']);
Route::post('/updateproduct_directory', [InquiryReceiveController::class, 'updateproduct_directory']);
Route::post('/updateproduct_directory_id', [InquiryReceiveController::class, 'updateproduct_directory_id']);
Route::post('/deleteProduct_directory_id', [InquiryReceiveController::class, 'deleteProduct_directory_id']);
Route::get('/showProductsDirectory', [InquiryReceiveController::class, 'showProductsDirectory']);

// opportunity-details
Route::post('/storeOpportunityDetails', [InquiryReceiveController::class, 'storeOpportunityDetails']);
Route::post('/showOpportunityDetails', [InquiryReceiveController::class, 'showOpportunityDetails']);
Route::post('/updateKeyOpportunity', [InquiryReceiveController::class, 'updateKeyOpportunity']);
Route::get('/getKeyOpportunities', [InquiryReceiveController::class, 'getKeyOpportunities']);
Route::get('/get_deal_won', [InquiryReceiveController::class, 'get_deal_won']);
Route::post('/update_order_value', [InquiryReceiveController::class, 'update_order_value']);

//Re-mark
Route::post('/storeRemark', [InquiryReceiveController::class, 'storeRemark']);
Route::get('/showRemark', [InquiryReceiveController::class, 'showRemark']);

// InorbvictCommitment
Route::post('/storeInorbvictCommitment', [InquiryReceiveController::class, 'storeInorbvictCommitment']);
Route::get('/showInorbvictCommitment', [InquiryReceiveController::class, 'showInorbvictCommitment']);

//CustomerSpecificNeed
Route::post('/storeCustomerSpecificNeed', [InquiryReceiveController::class, 'storeCustomerSpecificNeed']);
Route::get('/showCustomerSpecificNeed', [InquiryReceiveController::class, 'showCustomerSpecificNeed']);

//
Route::get('/qualified-opportunities', [InquiryReceiveController::class, 'getQualifiedOpportunities']);
Route::get('/clarity-pending', [InquiryReceiveController::class, 'getClarityPendingGroupedByStatusMode']);
Route::get('/disqualifiedopportunities', [InquiryReceiveController::class, 'disqualifiedopportunities']);
Route::post('/storeQualifiedOpportunity', [InquiryReceiveController::class, 'storeQualifiedOpportunity']);
Route::post('/storeClarityPending', [InquiryReceiveController::class, 'storeClarityPending']);
Route::post('/storeDisqualifiedOpportunity', [InquiryReceiveController::class, 'storeDisqualifiedOpportunity']);

Route::post('/qualified-opportunity/update',  [InquiryReceiveController::class, 'updateQualifiedOpportunity']);
Route::post('/qualified-opportunity/delete', [InquiryReceiveController::class, 'deleteQualifiedOpportunity']);

Route::post('/disqualified-opportunity/update', [InquiryReceiveController::class, 'updateDisqualifiedOpportunity']);
Route::post('/disqualified-opportunity/delete', [InquiryReceiveController::class, 'deleteDisqualifiedOpportunity']);

Route::post('/clarity-pending/update', [InquiryReceiveController::class, 'updateClarityPending']);
Route::post('/clarity-pending/delete', [InquiryReceiveController::class, 'deleteClarityPending']);


Route::post('/lead_acknowledgment', [LeadAcknowledgmentController::class, 'Lead_Acknowledgment']);
Route::get('/leadAcknowledgment_show', [LeadAcknowledgmentController::class, 'leadAcknowledgment_show']);

//
Route::post('/product-sourcings', [ProductSourcingController::class, 'store']);
Route::post('/show_product_sourcing', [ProductSourcingController::class, 'show_product_sourcing']);
Route::post('/updateProductCode', [ProductSourcingController::class, 'updateProductCode']);
Route::get('/procurement_show', [ProductSourcingController::class, 'procurement_show']);
Route::get('/getProductPriceDetails', [ProductSourcingController::class, 'getProductPriceDetails']);



//
Route::post('/price-shared', [PriceSharedController::class, 'store']);
Route::get('/price_shared_show', [PriceSharedController::class, 'price_shared_show']);
Route::delete('/price-shared', [PriceSharedController::class, 'destroy']);
//
Route::post('/quotation_sent_store', [QuotationsentController::class, 'quotation_sent_store']);
Route::get('/quotation_sent_show', [QuotationsentController::class, 'quotation_sent_show']);
Route::get('/get_pi_number', [QuotationsentController::class, 'get_pi_number']);
Route::get('/get_pi_number_all', [QuotationsentController::class, 'get_pi_number_all']);


// updateKeyOpportunity
Route::post('/lead_followup', [LeadfollowupController::class, 'sendFollowup']);
Route::post('/filter_by_platform', [LeadController::class, 'filter_by_platform']);
Route::middleware('auth:sanctum')->get('/sales_customer_list', [LeadController::class, 'sales_customer_list']);
Route::post('/customer_list_lead', [LeadController::class, 'customer_list_lead']);
Route::post('/customer_contact_person_list', [LeadController::class, 'customer_contact_person_list']);

Route::get('/leads/export', [LeadController::class, 'exportToExcel']);
Route::post('/leads/qualified', [LeadController::class, 'addQualifiedLead']);
Route::middleware('auth:sanctum')->get('/getHierarchy', [EmployeeController::class, 'getHierarchy']);
Route::middleware('auth:sanctum')->get('/getHierarchyWithKpi', [EmployeeController::class, 'getHierarchyWithKpi']);
Route::middleware('auth:sanctum')->get('/getHierarchy_ImmediateHierarchy', [EmployeeController::class, 'getHierarchy_ImmediateHierarchy']);
Route::middleware('auth:sanctum')->get('/getHierarchy_auth', [EmployeeController::class, 'getHierarchy_auth']);
Route::post('/feedback', [FeedbackController::class, 'store']);
Route::get('/feedback_show', [FeedbackController::class, 'index']);
Route::post('/complaint', [FeedbackController::class, 'complaint']);
Route::post('/complaint_show', [FeedbackController::class, 'complaint_index']);

Route::get('/follow-ups', [LeadfollowupController::class, 'index']);
Route::post('/follow-ups', [LeadfollowupController::class, 'store']);
Route::get('/follow-ups/{id}', [LeadfollowupController::class, 'show']);
Route::put('/follow-ups/{id}', [LeadfollowupController::class, 'update']);
Route::delete('/follow-ups/{id}', [LeadfollowupController::class, 'destroy']);

Route::post('/follow-up-details', [LeadfollowupController::class, 'store_followup_details']);
Route::get('/getFollowupDetails', [LeadfollowupController::class, 'getFollowupDetails']);
Route::middleware('auth:sanctum')->get('/getTodayTasks', [LeadfollowupController::class, 'getTodayTasks']);
Route::post('/tasks_update', [LeadfollowupController::class, 'getTodayTasks_update']);
Route::middleware('auth:sanctum')->get('/todays_task_done', [LeadfollowupController::class, 'todays_task_done']);
Route::post('/deal_won', [VictoryController::class, 'deal_won']);
Route::get('/is_deal_won', [VictoryController::class, 'isDealWon']);
Route::middleware('auth:sanctum')->get('/todays_tasks_monthly', [LeadfollowupController::class, 'getTodayTasksMonthly']);
Route::middleware('auth:sanctum')->get('/todays_tasks_weekly', [LeadfollowupController::class, 'getTodayTasksWeekly']);

Route::post('/reminder_store', [ReminderController::class, 'reminder_store']);
Route::get('/reminder_done', [ReminderController::class, 'reminder_done']);
Route::get('/reminder_progress', [ReminderController::class, 'reminder_progress']);
Route::post('/reminder_update', [ReminderController::class, 'reminder_update']);
Route::post('/reminder_delete', [ReminderController::class, 'reminder_destroy']);
Route::get('/reminder_monthly', [ReminderController::class, 'reminder_monthly']);
Route::get('/reminder_weekly', [ReminderController::class, 'reminder_weekly']);

Route::post('/meeting_store', [MeetingController::class, 'meeting_store']);
Route::get('/meeting_done', [MeetingController::class, 'meeting_done']);
Route::get('/meeting_progress', [MeetingController::class, 'meeting_progress']);
Route::post('/meeting_update', [MeetingController::class, 'meeting_update']);
Route::post('/meeting_status_update', [MeetingController::class, 'meeting_status_update']);
Route::post('/meeting_delete', [MeetingController::class, 'meeting_delete']);
Route::get('/meeting_monthly', [MeetingController::class, 'meeting_monthly']);
Route::get('/meeting_weekly', [MeetingController::class, 'meeting_weekly']);


Route::middleware('auth:sanctum')->get('/getDashboardSummary', [DashboardController::class, 'getDashboardSummary']);
Route::middleware('auth:sanctum')->get('/getSalesFunnelCount', [DashboardController::class, 'getSalesFunnelCount']);
Route::middleware('auth:sanctum')->get('/getTeamDashboard', [DashboardController::class, 'getTeamDashboard']);
Route::get('/showAcceptedInquiries', [inquiryReceiveController::class, 'showAcceptedInquiries']);
Route::get('/showAcceptedLeadAcknowledgment', [LeadAcknowledgmentController::class, 'showAcceptedLeadAcknowledgment']);
Route::get('/showAcceptedProductSourcings', [ProductSourcingController::class, 'showAcceptedProductSourcings']);
Route::get('/showAcceptedPriceShareds', [PriceSharedController::class, 'showAcceptedPriceShareds']);
Route::get('/showAcceptedQuotationSents', [QuotationsentController::class, 'showAcceptedQuotationSents']);
Route::get('/showAcceptedFollowups', [LeadfollowupController::class, 'showAcceptedFollowups']);


Route::get('/getOpportunityId', [DashboardController::class, 'getOpportunityId']);
Route::get('/getOpportunityDetails', [DashboardController::class, 'getOpportunityDetails']);
Route::get('/getOpportunityDetailsByProduct', [DashboardController::class, 'getOpportunityDetailsByProduct']);
Route::get('/salesperson/platform-stats', [DashboardController::class, 'getPlatformStats']);
Route::get('/getCnsEmployees', [DashboardController::class, 'getCnsEmployees']);
Route::get('/getSalesSourcingDataFromCNS', [DashboardController::class, 'getSalesSourcingDataFromCNS']);
Route::get('/getSalesEmployees', [DashboardController::class, 'getSalesEmployees']);
Route::get('/getCnsSourcingDataFromSales', [DashboardController::class, 'getCnsSourcingDataFromSales']);
Route::get('/getTATDataFromSales', [DashboardController::class, 'getTATDataFromSales']);
Route::get('/getTargetCostDataFromSales', [DashboardController::class, 'getTargetCostDataFromSales']);
Route::get('/getProductsAgainstOpportunityId', [DashboardController::class, 'getProductsAgainstOpportunityId']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/lead-page-index', [LeadPageIndexController::class, 'save']);
    Route::get('/lead-page-index', [LeadPageIndexController::class, 'get']);
});
