import axiosInstance from "../../../axios";
import React, { useEffect, useState } from "react";
import { FaFilter } from "react-icons/fa";
import swal from "sweetalert";
import Select from "react-select";

type Customer = {
  id: number;
  sender_name: string;
  sender_mobile: string;
  sender_email: string;
  leads_count: number;
};

type Opportunity = {
  opportunity_id: string;
  lead_id: number;
  customer_id: number;
  sender_name: string;
  sender_mobile: string;
  sender_email: string;
  platform: string;
  created_at: string;
};

type OpportunitiesResponse = {
  opportunities: Opportunity[];
  total_count: number;
};

const OpportunityTimeline = () => {
  const [showFilter, setShowFilter] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingOpportunities, setLoadingOpportunities] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [opportunityDetailsData, setOpportunityDetailsData] = useState<any>(null);
  const [products, setProducts] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      const token = localStorage.getItem('token');
      const cleanToken = token && token.split('|')[1];

      try {
        setLoading(true);

        const response = await axiosInstance.get("/sales_customer_list", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cleanToken}`,
          },
        });

        const data = response.data;
        // Sort customers alphabetically by sender_name
        const sortedCustomers = data.customer_list.sort((a: Customer, b: Customer) => {
          const nameA = a.sender_name || '';
          const nameB = b.sender_name || '';
          return nameA.localeCompare(nameB);
        });
        setCustomers(sortedCustomers);

      } catch (error) {
        console.error("Error :", error);

      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const handleCustomerChange = async (customerId: number) => {
    setSelectedCustomerId(customerId);
    // Clear previous opportunity data immediately when customer changes
    setOpportunities([]);
    setSelectedOpportunity(null);
    setOpportunityDetailsData(null);

    try {
      setLoadingOpportunities(true);
      const token = localStorage.getItem('token');
      const cleanToken = token && token.split('|')[1];

      // Get the customer name from the customers array
      const selectedCustomer = customers.find(c => c.id === customerId);
      if (!selectedCustomer) {
        throw new Error("Customer not found");
      }

      const response = await axiosInstance.get(`/getOpportunityId`, {
        params: { sender_name: selectedCustomer.sender_name },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cleanToken}`,
        },
      });

      const data: OpportunitiesResponse = response.data;
      setOpportunities(data.opportunities);
      console.log("Opportunity Data:", data);
    } catch (error) {
      // Clear opportunity data on error
      swal("Error", "No opportunity found for this customer", "error");
      setOpportunities([]);
      setSelectedOpportunity(null);
      setOpportunityDetailsData(null);
    } finally {
      setLoadingOpportunities(false);
    }
  };

  const handleOpportunityChange = async (opportunity: Opportunity | null) => {
    setSelectedOpportunity(opportunity);
    setOpportunityDetailsData(null);
    setProducts([]);
    setSelectedProduct(null);

    if (opportunity) {
      try {
        setLoadingProducts(true);
        const token = localStorage.getItem('token');
        const cleanToken = token && token.split('|')[1];

        const response = await axiosInstance.get(`/getProductsAgainstOpportunityId`, {
          params: { opportunity_id: opportunity.opportunity_id },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cleanToken}`,
          },
        });

        setProducts(response.data.products || []);
      } catch (error) {
        setProducts([]);
        swal("Error", "Failed to fetch products for this opportunity", "error");
      } finally {
        setLoadingProducts(false);
      }
    }
  };

  const handleApply = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!selectedOpportunity) {
      swal("Error", "Please select an opportunity", "error");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const cleanToken = token && token.split('|')[1];

      let response;
      if (selectedProduct) {
        // Call the new API with product
        response = await axiosInstance.get(`/getOpportunityDetailsByProduct`, {
          params: {
            opportunity_id: selectedOpportunity.opportunity_id,
            product: selectedProduct,
          },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cleanToken}`,
          },
        });
      } else {
        // Call the original API
        response = await axiosInstance.get(`/getOpportunityDetails`, {
          params: {
            opportunity_id: selectedOpportunity.opportunity_id,
          },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cleanToken}`,
          },
        });
      }

      setOpportunityDetailsData(response.data);
      setShowFilter(false); // Close the filter box after applying

    } catch (error) {
      console.error("Failed to fetch opportunity data:", error);
      swal("Error", "Failed to fetch opportunity details", "error");
    }
  };

  // Function to clear all filters and reset state
  const handleClearFilter = () => {
    setSelectedCustomerId(null);
    setSelectedOpportunity(null);
    setSelectedProduct(null);
    setOpportunities([]);
    setProducts([]);
    setOpportunityDetailsData(null);
    setShowFilter(false);
  };

  const formatDateAndTime = (dateString: string | null | undefined) => {
    if (!dateString) return { date: '', time: '' };
    const dateObj = new Date(dateString);

    const formattedDate = dateObj.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const formattedTime = dateObj.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    return { date: formattedDate, time: formattedTime };
  };

  const inquiryDate = formatDateAndTime(opportunityDetailsData?.inquiry_received_date);
  const leadAckDate = formatDateAndTime(opportunityDetailsData?.lead_acknowledgment_date);
  const sourcingDate = formatDateAndTime(opportunityDetailsData?.product_sourcing_date);
  const priceDate = formatDateAndTime(opportunityDetailsData?.price_shared_date);
  const quoteDate = formatDateAndTime(opportunityDetailsData?.quotation_sent_date);
  const followupDate = formatDateAndTime(opportunityDetailsData?.followup_date);
  const victoryDate = formatDateAndTime(opportunityDetailsData?.victory_stage_date);

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
        <div className="d-flex flex-wrap gap-4">
          <span className="fw-bold d-flex align-items-center gap-1">
            Customer Name -{" "}
            <a href="#" className="text-decoration-none" style={{ color: "#9d9fa3" }}>
              {
                customers.find(c => c.id === selectedCustomerId)?.sender_name || "N/A"
              }
            </a>
          </span>

          <span className="fw-bold d-flex align-items-center gap-1">
            Opportunity ID -{" "}
            <a href="#" className="text-decoration-none" style={{ color: "#9d9fa3" }}>
              {selectedOpportunity?.opportunity_id || "N/A"}
            </a>
          </span>

        </div>

        <button
          className="btn btn-outline-secondary d-flex align-items-center gap-2"
          onClick={() => setShowFilter(!showFilter)}
        >
          <FaFilter style={{ color: "#0d6efd" }} />
        </button>
      </div>

      {/* Filter Box */}
      {showFilter && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 1050 }}
        >
          <div className="bg-white p-4 rounded shadow" style={{ width: "400px", maxWidth: "90%" }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <button className="btn-close" onClick={() => setShowFilter(false)}></button>
            </div>
            <form>
              <div className="mb-3">
                <label htmlFor="customerDropdown" className="form-label">Select Customer</label>
                <Select
                  id="customerDropdown"
                  classNamePrefix="react-select"
                  options={customers.map((customer) => ({
                    value: customer.id,
                    label: customer.sender_name,
                  }))}
                  value={
                    selectedCustomerId
                      ? customers
                          .filter((c) => c.id === selectedCustomerId)
                          .map((customer) => ({
                            value: customer.id,
                            label: customer.sender_name,
                          }))[0]
                      : null
                  }
                  onChange={(option) => {
                    if (option && option.value !== undefined) {
                      handleCustomerChange(option.value);
                    } else {
                      setSelectedCustomerId(null);
                      setOpportunities([]);
                      setSelectedOpportunity(null);
                      setOpportunityDetailsData(null);
                    }
                  }}
                  isSearchable
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  }}
                  placeholder="-- Select a customer --"
                />
              </div>

              {loadingOpportunities && (
                <div className="mb-3">
                  <label className="form-label">Loading Opportunities...</label>
                  <div className="text-muted">Please wait while we fetch opportunities for this customer.</div>
                </div>
              )}

              {!loadingOpportunities && opportunities.length > 0 && (
                <div className="mb-3">
                  <label htmlFor="opportunityDropdown" className="form-label">Select Opportunity</label>
                  <Select
                    id="opportunityDropdown"
                    classNamePrefix="react-select"
                    options={opportunities.map((opportunity) => ({
                      value: opportunity,
                      label: `${opportunity.opportunity_id}`,
                    }))}
                    value={
                      selectedOpportunity
                        ? {
                            value: selectedOpportunity,
                            label: `${selectedOpportunity.opportunity_id}`,
                          }
                        : null
                    }
                    onChange={async (option) => {
                      await handleOpportunityChange(option?.value || null);
                    }}
                    isSearchable
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    }}
                    placeholder="-- Select an opportunity --"
                  />
                </div>
              )}

              {!loadingOpportunities && opportunities.length === 0 && selectedCustomerId && (
                <div className="mb-3">
                  <div className="alert alert-info">
                    No opportunities found for this customer.
                  </div>
                </div>
              )}

              {/* Product Dropdown - always render */}
              <div className="mb-3">
                <label htmlFor="productDropdown" className="form-label">Select Product</label>
                <Select
                  id="productDropdown"
                  classNamePrefix="react-select"
                  options={
                    products.length > 0
                      ? products.map((product) => ({ value: product, label: product }))
                      : [{ value: '', label: 'No products available', isDisabled: true }]
                  }
                  value={
                    selectedProduct && products.includes(selectedProduct)
                      ? { value: selectedProduct, label: selectedProduct }
                      : products.length === 0
                        ? { value: '', label: 'No products available', isDisabled: true }
                        : null
                  }
                  onChange={(option) => setSelectedProduct(option?.value || null)}
                  isSearchable
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  }}
                  placeholder="-- Select a product --"
                  isDisabled={products.length === 0}
                />
              </div>
              {loadingProducts && (
                <div className="mb-3">
                  <label className="form-label">Loading Products...</label>
                  <div className="text-muted">Please wait while we fetch products for this opportunity.</div>
                </div>
              )}

              {/* <div className="mb-2">
                <label className="form-label">Opportunity ID</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter ID"
                  value={selectedOpportunity?.opportunity_id || ""}
                  readOnly
                />
              </div> */}

              <button 
                type="button" 
                className="btn btn-primary mt-2 me-2" 
                onClick={handleApply}
                disabled={!selectedOpportunity}
              >
                Apply
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary mt-2"
                onClick={handleClearFilter}
              >
                Clear Filter
              </button>
            </form>
          </div>
        </div>
      )}

      {/*  Image */}
      {/* <div className="text-center">
        <img
          src="/timeline.png"
          alt="Timeline"
          className="img-fluid"
          style={{ maxWidth: "100%", height: "auto" }}
        />

      </div> */}
      <div className="text-center position-relative" style={{ width: "90%", margin: "0 auto" }}>
        <img
          src="/timeline.png"
          alt="Timeline"
          className="img-fluid"
          style={{ width: "100%", height: "auto" }}
        />


        <div className="position-absolute text-center" style={{ top: "3%", left: "8%", color: "#FF6600" }}>
          <div className="fw-bold">Inquiry Received</div>
          <div style={{ fontSize: "0.8rem", color: "#555" }}>{inquiryDate.date}</div>
          <div style={{ fontSize: "0.8rem", color: "#555" }}>{inquiryDate.time}</div>
        </div>

        <div className="position-absolute text-center" style={{ top: "85%", left: "17.5%", color: "#2eb5a2" }}>
          <div className="fw-bold">Lead Acknowledgment</div>
          <div style={{ fontSize: "0.8rem", color: "#555" }}>{leadAckDate.date}</div>
          <div style={{ fontSize: "0.8rem", color: "#555" }}>{leadAckDate.time}</div>
        </div>

        <div className="position-absolute text-center" style={{ top: "3%", left: "30%", color: "#4ca3e0" }}>
          <div className="fw-bold">Product Sourcing</div>
          <div style={{ fontSize: "0.8rem", color: "#555" }}>{sourcingDate.date}</div>
          <div style={{ fontSize: "0.8rem", color: "#555" }}>{sourcingDate.time}</div>
        </div>

        <div className="position-absolute text-center" style={{ top: "85%", left: "42%", color: "#947dd7" }}>
          <div className="fw-bold">Price Shared</div>
          <div style={{ fontSize: "0.8rem", color: "#555" }}>{priceDate.date}</div>
          <div style={{ fontSize: "0.8rem", color: "#555" }}>{priceDate.time}</div>
        </div>

        <div className="position-absolute text-center" style={{ top: "3%", left: "53%", color: "#73c750" }}>
          <div className="fw-bold">Quotation Shared</div>
          <div style={{ fontSize: "0.8rem", color: "#555" }}>{quoteDate.date}</div>
          <div style={{ fontSize: "0.8rem", color: "#555" }}>{quoteDate.time}</div>
        </div>

        <div className="position-absolute text-center" style={{ top: "85%", left: "65%", color: "#f4b847" }}>
          <div className="fw-bold">Follow Up</div>
          <div style={{ fontSize: "0.8rem", color: "#555" }}>{followupDate.date}</div>
          <div style={{ fontSize: "0.8rem", color: "#555" }}>{followupDate.time}</div>
        </div>

        <div className="position-absolute text-center" style={{ top: "3%", left: "76%", color: "#a36b2f" }}>
          <div className="fw-bold">Victory Stage</div>
          <div style={{ fontSize: "0.8rem", color: "#555" }}>{victoryDate.date}</div>
          <div style={{ fontSize: "0.8rem", color: "#555" }}>{victoryDate.time}</div>
        </div>
      </div>

    </div>
  );
};

export default OpportunityTimeline;
