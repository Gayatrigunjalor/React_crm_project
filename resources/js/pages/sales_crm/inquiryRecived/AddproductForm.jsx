import React, { useState } from 'react';
import edit from "../../../assets/img/newIcons/edit.svg"; 

const AddProductForm = () => {
  const [useDropdown, setUseDropdown] = useState(false);
  const [formData, setFormData] = useState({
    productName: '',
    make: '',
    mobileNumber: '',
    quantity: '',
    targetPrice: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCancel = () => {
    console.log('Cancel clicked');
  };

  const handleSave = () => {
    console.log('Save clicked', formData);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="border-t border-dotted border-gray-400 w-full mb-6"></div>
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Add Product</h1>
          <div className="border-t border-dotted border-gray-400 w-full"></div>
        </div>

        {/* Checkbox */}
        <div className="mb-12">
          <label className="flex items-center space-x-4 cursor-pointer">
            <div 
              className={`w-7 h-7 border-2 border-blue-600 rounded ${useDropdown ? 'bg-blue-600' : 'bg-white'} flex items-center justify-center transition-colors`}
              onClick={() => setUseDropdown(!useDropdown)}
            >
              {useDropdown && (
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <span className="text-xl font-semibold text-blue-700">Use Product Dropdown</span>
          </label>
        </div>

        {/* Form Fields */}
        <div className="space-y-10">
          {/* Product Name Row */}
          <div className="flex items-center">
            <label className="text-xl font-semibold text-blue-700 w-52">Product Name:</label>
            <div className="flex-1 relative">
              <input
                type="text"
                value={formData.productName}
                onChange={(e) => handleInputChange('productName', e.target.value)}
                className="w-full border-b-2 border-gray-300 bg-transparent px-3 py-3 text-lg focus:outline-none focus:border-blue-500 transition-colors"
              />
              <img src={edit} alt="" />
            </div>
          </div>

          {/* Make and Mobile Number Row */}
          <div className="flex items-center space-x-12">
            <div className="flex items-center flex-1">
              <label className="text-xl font-semibold text-blue-700 w-20">Make:</label>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={formData.make}
                  onChange={(e) => handleInputChange('make', e.target.value)}
                  className="w-full border-b-2 border-gray-300 bg-transparent px-3 py-3 text-lg focus:outline-none focus:border-blue-500 transition-colors"
                />
                             <img src={edit} alt="" />

              </div>
            </div>
            <div className="flex items-center flex-1">
              <label className="text-xl font-semibold text-blue-700 w-44">Mobile Number:</label>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={formData.mobileNumber}
                  onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                  className="w-full border-b-2 border-gray-300 bg-transparent px-3 py-3 text-lg focus:outline-none focus:border-blue-500 transition-colors"
                />
                            <img src={edit} alt="" />

              </div>
            </div>
          </div>

          {/* Quantity and Target Price Row */}
          <div className="flex items-center space-x-12">
            <div className="flex items-center flex-1">
              <label className="text-xl font-semibold text-blue-700 w-24">Quantity:</label>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  className="w-full border-b-2 border-gray-300 bg-transparent px-3 py-3 text-lg focus:outline-none focus:border-blue-500 transition-colors"
                />
                              <img src={edit} alt="" />

              </div>
            </div>
            <div className="flex items-center flex-1">
              <label className="text-xl font-semibold text-blue-700 w-36">Target Price:</label>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={formData.targetPrice}
                  onChange={(e) => handleInputChange('targetPrice', e.target.value)}
                  className="w-full border-b-2 border-gray-300 bg-transparent px-3 py-3 text-lg focus:outline-none focus:border-blue-500 transition-colors"
                />
                              <img src={edit} alt="" />

              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-center space-x-8 mt-16">
          <button
            onClick={handleCancel}
            className="px-14 py-4 rounded-full text-white text-xl font-semibold shadow-lg transform transition-all hover:scale-105 hover:shadow-xl"
            style={{
              background: 'linear-gradient(135deg, #7f1d1d, #dc2626)'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-16 py-4 rounded-full text-white text-xl font-semibold shadow-lg transform transition-all hover:scale-105 hover:shadow-xl"
            style={{
              background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)'
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProductForm;