<div className="col-12 d-flex justify-content-end align-items-end" style={{ gap: "1rem" }}>

                                                    <button
                                                        type="button"
                                                        onClick={() => removeInputGroup(groupIndex)}

                                                        className="btn btn-danger p-1  setFont"
                                                        style={{ backgroundColor: "#FA3B1D", width: "3rem", height: "2rem", fontSize: "0.8rem" }}
                                                    >
                                                        <MdDeleteForever />
                                                    </button>

                                                </div>
  <table
                                        className="table setFont table-striped"
                                        style={{
                                            width: "100%",
                                            minWidth: "100%",
                                            maxWidth: "100%",
                                            borderCollapse: "collapse"
                                        }}
                                    >
                                        <thead>
                                            <tr className="setFont" style={{ fontWeight: "700", padding: "10px", border: "1px solid #ccc" }}>
                                                <th><h6 className="setFont">Sr. No.</h6></th>
                                                <th><h6 className="setFont">Product Name</h6></th>
                                                <th><h6 className="setFont">Make</h6></th>
                                                <th><h6 className="setFont">Model</h6></th>
                                                <th><h6 className="setFont">Quantity</h6></th>
                                                <th><h6 className="setFont">Target Price</h6></th>
                                                <th><h6 className="setFont">Edit</h6></th>
                                                <th><h6 className="setFont">Remove</h6></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loadingProducts ? (
                                                <tr>
                                                    <td colSpan="8" className="text-center setFont">
                                                        <Spinner animation="border" /> Loading...
                                                    </td>
                                                </tr>
                                            ) : Array.isArray(productDirectory) && productDirectory.length > 0 ? (
                                                productDirectory.map((product, index) => (
                                                    <tr key={index} style={{ fontSize: "0.8rem" }}>
                                                        <td className="setFont">{index + 1}</td>
                                                        <td className="setFont">{product.product}</td>
                                                        <td className="setFont">{product.make}</td>
                                                        <td className="setFont">{product.model}</td>
                                                        <td className="setFont">{product.quantity}</td>
                                                        <td className="setFont">{product.target_price}</td>
                                                        <td className="setFont">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    handleEdit(product);
                                                                }}
                                                                className="btn btn-primary p-1 setFont"
                                                                style={{
                                                                    backgroundColor: "#0292E3",
                                                                    width: "3rem",
                                                                    height: "2rem",
                                                                    fontSize: "0.8rem"
                                                                }}
                                                            >
                                                                <MdModeEdit />
                                                            </button>
                                                        </td>
                                                        <td className="setFont">
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    handleDeletePopup(product.id);
                                                                }}
                                                                className="btn btn-danger p-1 setFont"
                                                                style={{
                                                                    backgroundColor: "#FA3B1D",
                                                                    width: "3rem",
                                                                    height: "2rem",
                                                                    fontSize: "0.8rem"
                                                                }}
                                                            >
                                                                <MdDeleteForever />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="8" className="text-center setFont">No products available.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                      {/* Delete Modal */}
                                {showDeleteModal && (
                                    <div
                                        className="modal show"
                                        style={{
                                            display: "block",
                                            background: "rgba(0,0,0,0.5)",
                                            alignContent: "center"
                                        }}
                                    >
                                        <div className="modal-dialog">
                                            <div className="modal-content">
                                                <div className="modal-header">
                                                    <h5 className="modal-title setFont">Confirm Delete</h5>
                                                </div>
                                                <div className="modal-body">
                                                    <p className="setFont">Are you sure you want to delete this product?</p>
                                                </div>
                                                <div className="modal-footer">
                                                    <button
                                                        className="setFont btn btn-outline-secondary"
                                                        onClick={() => setShowDeleteModal(false)}
                                                    >
                                                        No
                                                    </button>
                                                    <button
                                                        className="setFont btn btn-danger"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleRemove();
                                                        }}
                                                    >
                                                        Yes
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
   {/* <div className="d-flex mb-3" style={{ gap: "1rem" }}>
                                    <button
                                        className="btn p-1 setFont"
                                        type="button"
                                        onClick={() => handleSave()}
                                        disabled={isSaving}
                                        style={{
                                            backgroundColor: "#0292E3",
                                            color: "white",
                                            width: "9rem",
                                            height: "2rem",
                                            fontSize: "1rem"
                                        }}
                                    >
                                        {isSaving ? "Saving..." : "Save"}
                                    </button>
                                </div> */}
  {/* <div>
                    <div>
                        <h5 className="setFont">Opportunity Details</h5>
                        <div className="Details d-flex align-items-center gap-3 mt-2 flex-wrap">
                            <div className="col-6">
                                <label className="form-label setFont">Buying Plan</label>
                                <input
                                    type="date"
                                    className="form-control setFont"
                                    name="buying_plan"
                                    value={formData.buying_plan}
                                    onChange={handleInput_Change}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>

                            {attachmentFields.map((field, index) => (
                                <div
                                    className="col-6 d-flex align-items-center gap-2"
                                    key={field.id}
                                >
                                    <input
                                        type="file"
                                        className="form-control setFont custom-file-input"
                                        onChange={(e) => handleFile_Change(e, field.id)}
                                        style={{ fontFamily: 'Nunito Sans, sans-serif', width: "14rem" }}
                                    />

                                    {files[field.id] && (
                                        <img
                                            src={main}
                                            alt="phoenix"
                                            width={32}
                                            height={32}
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => downloadFile(field.id)}
                                        />
                                    )}

                                    {index !== 0 && (
                                        <button
                                            type="button"
                                            className="btn p-1 btn-danger setFont"
                                            onClick={(e) => removeAttachmentField(e, field.id)}
                                            style={{ width: "7rem", height: "2rem", fontSize: "1rem" }}
                                        >
                                            Remove
                                        </button>
                                    )}

                                    {index === attachmentFields.length - 1 && files[field.id] && (
                                        <button
                                            type="button"
                                            className="btn p-1 btn-success setFont"
                                            onClick={addAttachment_Field}
                                            style={{ width: "7rem", height: "2rem", fontSize: "1rem" }}
                                        >
                                            Add
                                        </button>
                                    )}
                                </div>
                            ))}



                        </div>

                        <br />
                        <h5 className="setFont">Purchase Decision Maker <span style={{ color: 'red' }}>*</span></h5>


                        <div className="purchase d-flex gap-2">
                            <div className="form-group">
                                <label className="form-label setFont" htmlFor="name">
                                    Name<span style={{ color: 'red' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-control small-input setFont"
                                    placeholder="Name"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInput_Change}
                                    onPaste={handleInput_Change}
                                />
                            </div>

                            <div className="form-group">
                                <label
                                    className="form-label setFont"
                                    htmlFor="mobile_number"
                                >
                                    Mobile Number<span style={{ color: 'red' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-control small-input setFont"
                                    placeholder="Mobile Number"
                                    id="mobile_number"
                                    name="mo_no"
                                    value={formData.mo_no}
                                    onChange={handleInput_Change}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label setFont" htmlFor="email">
                                    Email<span style={{ color: 'red' }}>*</span>
                                </label>
                                <input
                                    type="email"
                                    className="form-control small-input setFont"
                                    placeholder="E-mail"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInput_Change}
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        className=" setFont btn p-1 btn-primary mt-3"
                        type="button"
                        onClick={handleSaveOpportunity}
                        style={{ backgroundColor: "#0292E3", width: "9rem", height: "2rem", fontSize: "1rem" }}
                    >
                        Save
                    </button>
                </div> */}

                {/* <div>
                    <br />
                  
                    <div className="customer container-fluid">
                        <h6 className="setFont">Customer Specific Need</h6>
                        <div className="d-flex  align-items-center gap-2 w-100">
                            <input
                                type="text"
                                className="form-control setFont  inputfield"
                                value={customerSpecificNeed}
                                onChange={(e) => setCustomerSpecificNeed(e.target.value)}
                            />
                            <button
                                className="btn p-1 btn-primary setFont customerbtn"
                                type="button"
                                onClick={() => saveCustomerSpecificNeed(customerSpecificNeed)}
                                style={{
                                    backgroundColor: "#0292E3",
                                    width: "100%",
                                    height: "2rem",
                                    fontSize: "1rem",
                                }}
                            >
                                Save
                            </button>
                        </div>
                        <br />
                        <h6 className="setFont">Customer Specific Need Record</h6>
                        <div className="d-flex flex-wrap gap-2">
                            <input
                                type="text"
                                className="form-control setFont w-100 w-md-75"
                                readOnly
                                placeholder="Customer Specific Need Record"
                                value={formData.customer_specific_need || ""}
                            />
                        </div>
                    </div>

                    <br />
                    <div className="inorbvict container-fluid">
                        <h6 className="setFont">Inorbvict Commitment</h6>
                        <div className="d-flex  align-items-center gap-2 w-100">
                            <input
                                type="text"
                                className="form-control setFont inputfield"
                                value={inorbvictCommitment}
                                onChange={(e) =>
                                    setInorbvictCommitment(e.target.value)
                                } // Update state on input change
                            />
                            <button
                                className="btn p-1 btn-primary setFont customerbtn"
                                type="button"
                                onClick={() =>
                                    saveInorbvictCommitment(inorbvictCommitment)
                                }
                                style={{
                                    backgroundColor: "#0292E3",
                                    width: "100%",
                                    height: "2rem",
                                    fontSize: "1rem",
                                }}
                            >
                                Save
                            </button>
                        </div>
                        <br />
                        <h6 className="setFont">Inorbvict Commitment Record</h6>
                        <div className="d-flex gap-2">
                            <input
                                type="text"
                                className="form-control setFont w-100 w-md-75"
                                readOnly
                                placeholder="Inorbvict Commitment Record"
                                value={formData.inorbvict_commitment || ""}
                                style={{ width: "28rem" }}
                            />
                        </div>
                    </div>
                    <br />
                    <div className="remark container-fluid">
                        <h6 className="setFont">Remark</h6>
                        <div className="d-flex align-items-center gap-2 ">
                            <input
                                type="text"
                                className="form-control setFont inputfield"
                                value={remark}
                                onChange={(e) => setRemark(e.target.value)} // Update state on input change
                            />
                            <button
                                className="setFont btn p-1 btn-primary customerbtn"
                                type="button"
                                onClick={() => saveRemark(remark)}
                                style={{
                                    backgroundColor: "#0292E3",
                                    width: "100%",
                                    height: "2rem",
                                    fontSize: "1rem",
                                }}
                            >
                                Save
                            </button>
                        </div>
                        <br />
                        <h6 className="setFont">Remark Record</h6>
                        <div className="d-flex gap-2">
                            <input
                                type="text"
                                className="form-control setFont w-100 w-md-75"
                                readOnly
                                placeholder="Remark"
                                value={formData.remark || ""}
                                style={{ width: "28rem" }}
                            />
                        </div>
                    </div>
                </div> */}
                   {/* Product Details */}
                {/* <hr></hr> */}
                {/* <legend className="h6 d-flex align-items-center gap-2 mb-2 ">
                    <h5 style={{ fontFamily: 'Nunito Sans, sans-serif' }}>Product Details</h5>
                    <Button variant="success" style={{ width: "7rem", height: "2rem", fontSize: "0.9rem", fontFamily: 'Nunito Sans, sans-serif' }} className="p-1 setFont" onClick={addInputGroup}>
                        <FaPlus style={{ marginRight: '5px' }} />Add More
                    </Button>
                </legend> */}
                
                {/* <div className="d-flex" style={{ gap: "1rem" }}>
                    <button
                        className="btn p-1  setFont"
                        type="button"
                        onClick={() => handleSave()}
                        style={{ backgroundColor: "#0292E3", color: "white", width: "9rem", height: "2rem", fontSize: "1rem" }}
                    >
                        Save
                    </button>


                </div> */}
                {/* <div className="d-flex" style={{ gap: "1rem" }}>
                    <button
                        className="btn p-1 setFont"
                        type="button"
                        onClick={() => handleSave()}
                        disabled={isSaving}
                        style={{ backgroundColor: "#0292E3", color: "white", width: "9rem", height: "2rem", fontSize: "1rem" }}
                    >
                        {isSaving ? "Saving..." : "Save"}
                    </button>


                </div> */}
                
            {/* <div className="d-flex justify-content-end mt-3">
                <button
                    className="btn btn-primary setFont"
                    type="button"
                    onClick={handleSaveOpportunity}
                    style={{ backgroundColor: "#0292E3", width: "9rem", height: "2rem", fontSize: "1rem" }}
                >
                    Save
                </button>
            </div> */}