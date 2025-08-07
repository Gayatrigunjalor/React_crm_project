import React, { useState, useEffect } from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import axiosInstance from "../../../axios";

const AddProductForm = ({ onClose, lead_id, customer_id }) => {
  const [useDropdown, setUseDropdown] = useState(false);
  const [productList, setProductList] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    product: '',
    make: '',
    model: '',
    quantity: '',
    target_price: '',
    currency: '',
    mobile_number: ''
  });

  const currencyOptions = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' },
    { value: 'INR', label: 'INR (₹)' },
    { value: 'JPY', label: 'JPY (¥)' },
    { value: 'CAD', label: 'CAD (C$)' },
    { value: 'AUD', label: 'AUD (A$)' },
  ];

  // Fetch products when dropdown is enabled
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await axiosInstance.get('/products');
      if (response.data) {
        setProductList(response.data.map(product => ({
          value: product.product_name,
          label: product.product_name,
          model: product.model_name,
          make: product.make,
          no_of_product_vendor: product.vendor_count_count,
          product_code: product.product_code,
        })));
      } else {
        console.error('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast?.error?.('Error fetching products');
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    if (useDropdown) {
      fetchProducts();
    }
  }, [useDropdown]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProductSelect = (value) => {
    const product = productList.find(p => p.value === value);
    if (product) {
      setSelectedProduct(product);
      setFormData(prev => ({
        ...prev,
        product: product.value,
        make: product.make || '',
        model: product.model || ''
      }));
    } else {
      handleInputChange('product', value);
    }
  };

  //  const handleSave = async () => {
  //     if (isSaving) return; // Prevent multiple rapid clicks
  //     setIsSaving(true);

  //     console.log("Form Data:", formData);

  //     try {
  //         // Validation for single product form
  //         if (!formData.product || !formData.make || !formData.model || !formData.quantity || Number(formData.quantity) <= 0) {
  //             toast?.error?.('Please fill all required fields (Product, Make, Model, and Quantity)');
  //             setIsSaving(false);
  //             return;
  //         }

  //         // Currency validation if target price is provided
  //         const numericPrice = formData.target_price ? formData.target_price.toString().replace(/^[^\d]+/, "").trim() : "";
  //         const hasTargetPrice = numericPrice && numericPrice !== "" && Number(numericPrice) > 0;

  //         console.log('Target price validation:', {
  //             originalPrice: formData.target_price,
  //             numericPrice: numericPrice,
  //             hasTargetPrice: hasTargetPrice,
  //             currency: formData.currency
  //         });

  //         if (hasTargetPrice && !formData.currency) {
  //             toast?.error?.('Please select currency for the target price');
  //             setIsSaving(false);
  //             return;
  //         }

  //         // Prepare request data (note: product is an array with single object)
  //         const requestData = {
  //             lead_id: lead_id,
  //             customer_id: customer_id,
  //             status: "1",
  //             product: [formData], // Wrap formData in array as expected by API
  //         };

  //         console.log("Request Data being sent:", requestData);

  //         // Make API call
  //         const response = await axiosInstance.post("/inquiry_recive", requestData);

  //         console.log("API Response:", response);

  //         // Success handling
  //         toast?.success?.('Product added successfully!');

  //         // Call any additional functions if they exist
  //         if (typeof fetchProductDirectory === 'function') {
  //             fetchProductDirectory();
  //         }

  //         // Close the form
  //         onClose?.();

  //     } catch (error) {
  //         console.error("API Error Details:", error);

  //         // Enhanced error handling
  //         if (error.response) {
  //             // Server responded with error status
  //             const status = error.response.status;
  //             const errorData = error.response.data;

  //             console.error("Server Error Response:", {
  //                 status: status,
  //                 data: errorData,
  //                 headers: error.response.headers
  //             });

  //             let errorMessage = "Error submitting inquiry";

  //             if (errorData?.message) {
  //                 errorMessage = errorData.message;
  //             } else if (errorData?.error) {
  //                 errorMessage = errorData.error;
  //             } else if (status === 400) {
  //                 errorMessage = "Invalid data provided";
  //             } else if (status === 401) {
  //                 errorMessage = "Authentication required";
  //             } else if (status === 403) {
  //                 errorMessage = "Access denied";
  //             } else if (status === 404) {
  //                 errorMessage = "API endpoint not found";
  //             } else if (status >= 500) {
  //                 errorMessage = "Server error occurred";
  //             }

  //             toast?.error?.(errorMessage);

  //         } else if (error.request) {
  //             // Request was made but no response received
  //             console.error("Network Error - No response received:", error.request);
  //             toast?.error?.("Network error - please check your connection");

  //         } else {
  //             // Something else happened in setting up the request
  //             console.error("Request Setup Error:", error.message);
  //             toast?.error?.(error.message || "Error submitting inquiry");
  //         }

  //     } finally {
  //         setIsSaving(false);
  //     }
  // };


  const handleSave = async () => {
    if (isSaving) return; // Prevent multiple rapid clicks
    setIsSaving(true);

    console.log("Form Data:", formData);

    try {
      // Validation for single product form
      if (!formData.product || !formData.make || !formData.model || !formData.quantity || Number(formData.quantity) <= 0) {
        toast?.error?.('Please fill all required fields (Product, Make, Model, and Quantity)');
        setIsSaving(false);
        return;
      }

      // Currency validation if target price is provided
        const numericPrice = formData.target_price
        ? formData.target_price.toString().replace(/^[^\d]+/, "").trim()
        : "";
      // const numericPrice = formData.target_price ? formData.target_price.toString().replace(/^[^\d]+/, "").trim() : "";
      const hasTargetPrice = numericPrice && numericPrice !== "" && Number(numericPrice) > 0;

      console.log('Target price validation:', {
        originalPrice: formData.target_price,
        numericPrice: numericPrice,
        hasTargetPrice: hasTargetPrice,
        currency: formData.currency
      });

      if (hasTargetPrice && !formData.currency) {
        toast?.error?.('Please select currency for the target price');
        setIsSaving(false);
        return;
      }

      // Prepare request data with concatenated target_price and currency
      // const requestData = {
      //   lead_id: lead_id,
      //   customer_id: customer_id,
      //   status: "1",
      //   product: [{
      //     ...formData,
      //     target_price: hasTargetPrice
      //       ? `${formData.target_price} ${formData.currency}`
      //       : formData.target_price
      //   }],
      // };

      // const requestData = {
      //   lead_id,
      //   customer_id,
      //   status: "1",
      //   product: [{
      //     ...formData,
      //     target_price: formData.target_price && formData.currency
      //       ? `${formData.target_price} ${formData.currency}`
      //       : formData.target_price
      //   }],
      // };
    

      const formattedTargetPrice = numericPrice && formData.currency
        ? `${numericPrice} ${formData.currency}`
        : formData.target_price;

      const requestData = {
        lead_id,
        customer_id,
        status: "1",
        product: [{
          ...formData,
          target_price: formattedTargetPrice,
        }],
      };

      console.log("Request Data being sent:", requestData);

      // Make API call
      const response = await axiosInstance.post("/inquiry_recive", requestData);

      console.log("API Response:", response);

      // Success handling
      toast?.success?.('Product added successfully!');

      // Call any additional functions if they exist
      if (typeof fetchProductDirectory === 'function') {
        fetchProductDirectory();
      }

      // Close the form
      onClose?.();

    } catch (error) {
      console.error("API Error Details:", error);

      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;

        let errorMessage = "Error submitting inquiry";

        if (errorData?.message) {
          errorMessage = errorData.message;
        } else if (errorData?.error) {
          errorMessage = errorData.error;
        } else if (status === 400) {
          errorMessage = "Invalid data provided";
        } else if (status === 401) {
          errorMessage = "Authentication required";
        } else if (status === 403) {
          errorMessage = "Access denied";
        } else if (status === 404) {
          errorMessage = "API endpoint not found";
        } else if (status >= 500) {
          errorMessage = "Server error occurred";
        }

        toast?.error?.(errorMessage);

      } else if (error.request) {
        toast?.error?.("Network error - please check your connection");
      } else {
        toast?.error?.(error.message || "Error submitting inquiry");
      }

    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <style>{`
        .form-label {
          font-size: 13px;
          font-weight: 500;
          color: #2E467A;
        }

        .form-container {
          border-radius: 15px;
          padding: 1.5rem;
          background: #fff;
          height: auto;
          max-width: 800px;
          margin: auto;
        }

        .form-heading {
          text-align: center;
          font-size: 20px;
          font-weight: 600; 
          margin-bottom: 1.5rem;
          position: relative;
        }

        .form-heading::before,
        .form-heading::after {
          content: "";
          position: absolute;
          top: 50%;
          width: 35%;
          height: 1px;
          background-color: #ccc;
        }

        .form-heading::before {
          left: 0;
        }

        .form-heading::after {
          right: 0;
        }

        .compact-field {
          display: flex;
          align-items: center;
          margin-bottom: 0.75rem;
          gap: 4px;
        }

        .compact-label {
          margin-bottom: 0;
          font-size: 14px;
          font-weight: 600;
          color: #2E467A;
          white-space: nowrap;
          min-width: 100px;
        }

        .input-wrapper {
          position: relative;
          flex: 1;
          margin-bottom: 0;
        }

        .input-field {
          border: none;
          border-bottom: 1px solid #aaa;
          border-radius: 0;
          padding-right: 28px;
          padding-left: 2px;
          padding-bottom: 2px;
          color: #000;
          background-color: transparent;
          font-size: 14px;
          height: 30px;
          width: 100%;
        }

        .input-field:focus {
          outline: none;
          border-bottom-color: #2E467A;
          box-shadow: none;
        }

        .form-icon {
          position: absolute;
          top: 50%;
          right: 5px;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          cursor: pointer;
        }

        .action-buttons {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 1.5rem;
        }

        .btn-cancel {
          background: linear-gradient(to right, #a30707, #720101);
          color: #fff;
          border: none;
          padding: 6px 24px;
          border-radius: 15px;
        }

        .btn-save {
          background: linear-gradient(to right, #111A2E, #375494);
          color: #fff;
          border: none;
          padding: 12px 34px;
          border-radius: 15px;
        }

        .checkbox-label {
          font-size: 16px;
          font-weight: 600;
          color: #111A2E;
          margin-left: 10px;
        }

        .checkbox-container {
          display: flex;
          align-items: center;
          margin-bottom: 1rem;
        }

        .dropdown-select {
          border: none;
          border-bottom: 1px solid #aaa;
          border-radius: 0;
          padding-right: 28px;
          padding-left: 2px;
          padding-bottom: 2px;
          color: #000;
          background-color: transparent;
          font-size: 14px;
          height: 30px;
          width: 100%;
        }

        .dropdown-select:focus {
          outline: none;
          border-bottom-color: #2E467A;
          box-shadow: none;
        }
      `}</style>

      <div className="form-container">
        <div className="form-heading">Add Product</div>

        <div className="checkbox-container">
          <Form.Check
            type="checkbox"
            checked={useDropdown}
            onChange={(e) => setUseDropdown(e.target.checked)}
          />
          <label className="checkbox-label">Use Product Dropdown</label>
          {loadingProducts && <span style={{ marginLeft: '10px', fontSize: '12px', color: '#666' }}>Loading...</span>}
        </div>

        <Row>
          <Col md={12}>
            <div className="compact-field">
              <label className="compact-label">Product Name:</label>
              <div className="input-wrapper">
                {useDropdown ? (
                  <Form.Select
                    className="dropdown-select"
                    value={formData.product}
                    onChange={(e) => handleProductSelect(e.target.value)}
                  >
                    <option value="">Select Product</option>
                    {productList.map((product, index) => (
                      <option key={index} value={product.value}>
                        {product.label}
                      </option>
                    ))}
                  </Form.Select>
                ) : (
                  <Form.Control
                    type="text"
                    className="input-field"
                    value={formData.product}
                    onChange={(e) => handleInputChange('product', e.target.value)}
                  />
                )}
                <svg className="form-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
            </div>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <div className="compact-field">
              <label className="compact-label">Make:</label>
              <div className="input-wrapper">
                <Form.Control
                  type="text"
                  className="input-field"
                  value={formData.make}
                  onChange={(e) => handleInputChange('make', e.target.value)}
                />
                <svg className="form-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
            </div>
          </Col>
          <Col md={6}>
            <div className="compact-field">
              <label className="compact-label">Mobile Number:</label>
              <div className="input-wrapper">
                <Form.Control
                  type="text"
                  className="input-field"
                  value={formData.mobile_number}
                  onChange={(e) => handleInputChange('mobile_number', e.target.value)}
                />
                <svg className="form-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
            </div>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <div className="compact-field">
              <label className="compact-label">Quantity:</label>
              <div className="input-wrapper">
                <Form.Control
                  type="number"
                  className="input-field"
                  min="1"
                  step="1"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                />
                <svg className="form-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
            </div>
          </Col>
          <Col md={6}>
            <div className="compact-field">
              <label className="compact-label">Target Price:</label>
              <div className="input-wrapper">
                <Form.Control
                  type="text"
                  className="input-field"
                  value={formData.target_price}
                  onChange={(e) => handleInputChange('target_price', e.target.value)}
                />
                <svg className="form-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
            </div>
          </Col>
        </Row>

        {/* Add Model and Currency fields */}
        <Row>
          <Col md={6}>
            <div className="compact-field">
              <label className="compact-label">Model:</label>
              <div className="input-wrapper">
                <Form.Control
                  type="text"
                  className="input-field"
                  value={formData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                />
                <svg className="form-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
            </div>
          </Col>
          {formData.target_price && (
            <Col md={6}>
              <div className="compact-field">
                <label className="compact-label">Currency:</label>
                <div className="input-wrapper">
                  <Form.Select
                    className="dropdown-select"
                    value={formData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                  >
                    <option value="">Select Currency</option>
                    {currencyOptions.map((currency) => (
                      <option key={currency.value} value={currency.value}>
                        {currency.label}
                      </option>
                    ))}
                  </Form.Select>
                  <svg className="form-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
              </div>
            </Col>
          )}
        </Row>

        <div className="action-buttons">
          <Button className="btn-cancel" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button className="btn-save" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </>
  );
};

export default AddProductForm;