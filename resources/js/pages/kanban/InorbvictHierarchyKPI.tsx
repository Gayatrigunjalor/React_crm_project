import React, { useState, useEffect, useRef } from "react";
import { Tree, TreeNode } from "react-organizational-chart";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaRegCalendarAlt } from "react-icons/fa";
import ReactSelect from "../../../js/components/base/ReactSelect";
import axiosInstance from "../../../js/axios";
import { Link } from "react-router-dom";
import { Col, Row } from "react-bootstrap";

interface KPI {
  id: number;
  title: string;
  target_completed: string;
  target_remaining: string;
  role_id: number;
  target_type?: string;
}

interface TreeNodeData {
  id: number;
  user_id: number;
  name: string;
  designation: string;
  role_id: number;
  role: string;
  department: string;
  email: string;
  children: TreeNodeData[];
  kpis: KPI[];
}

interface TransformedNode {
  title: string;
  key: string;
  department: string;
  children: TransformedNode[];
  kpis: KPI[];
}

const InorbvictHierarchyKPI = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDate2, setSelectedDate2] = useState<Date | null>(null);
  const [treeData, setTreeData] = useState<TransformedNode[]>([]);
  const [nodeSize, setNodeSize] = useState(130);
  const userId = localStorage.getItem('emp_id');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [showPopupMap, setShowPopupMap] = useState<Record<string, number | null>>({});
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const fetchHierarchyWithKpi = async () => {
    if (!selectedDate || !selectedDate2) return;

    const token = localStorage.getItem("token");
    const cleanToken = token && token.split("|")[1];

    try {
      const startDate = selectedDate.toLocaleDateString('en-CA');
      const endDate = selectedDate2.toLocaleDateString('en-CA');

      console.log('Fetching data with params:', {
        userId,
        startDate,
        endDate
      });

      const response = await axiosInstance.get(`/getHierarchyWithKpi?id=${userId}&start_date=${startDate}&end_date=${endDate}`, {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
        },
      });

      console.log('API Response:', response.data);

      const responseData = Array.isArray(response.data) ? response.data : [response.data];

      const transformData = (node: TreeNodeData): TransformedNode => {
        const transformed = {
          title: `${node.name} (${node.designation})`,
          key: node.id.toString(),
          department: node.department,
          children: node.children ? node.children.map(transformData) : [],
          kpis: node.kpis || []
        };
        console.log('Transformed node:', transformed);
        return transformed;
      };

      const transformedData = responseData.map(transformData);
      console.log('Final transformed data:', transformedData);
      setTreeData(transformedData);
      adjustNodeSize(transformedData);
    } catch (error) {
      console.error("Error fetching hierarchy data with KPI", error);
    }
  };

  useEffect(() => {
    if (selectedDate && selectedDate2) {
      fetchHierarchyWithKpi();
    }
  }, [selectedDate, selectedDate2]);

  useEffect(() => {
    console.log('Selected dates changed:', {
      startDate: selectedDate,
      endDate: selectedDate2
    });
  }, [selectedDate, selectedDate2]);

  const adjustNodeSize = (data: TransformedNode[]) => {
    const totalNodes = countNodes(data);
    const maxDepth = getMaxDepth(data);

    let newSize = 120;
    if (totalNodes > 50) newSize = 100;
    if (totalNodes > 100) newSize = 110;
    if (totalNodes > 200) newSize = 70;
    if (totalNodes > 500) newSize = 50;

    setNodeSize(newSize);
  };

  const countNodes = (nodes: TransformedNode[]): number =>
    nodes.reduce((acc, node) => acc + 1 + countNodes(node.children), 0);

  const getMaxDepth = (nodes: TransformedNode[], depth = 0): number =>
    nodes.length
      ? Math.max(...nodes.map((node) => getMaxDepth(node.children, depth + 1)))
      : depth;

  const handleClick = (nodeKey: string, roleId: number) => {
    setShowPopupMap((prev) => ({
      ...prev,
      [nodeKey]: prev[nodeKey] === roleId ? null : roleId,
    }));
    setSelectedRole(roleId);
  };

  // Add pagination for KPIs
  const getPaginatedKPIs = (kpis: KPI[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return kpis.slice(startIndex, endIndex);
  };

  const totalPages = (kpis: KPI[]) => Math.ceil(kpis.length / itemsPerPage);

  const handlePageChange = (page: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPage(page);
  };

  const renderNode = (node: TransformedNode, isRoot = false) => {
    console.log('Rendering node:', node);
    return (
      <TreeNode
        label={
          <div
            className="card mx-auto my-1"
            style={{
              maxWidth: `150px`,
              border: "1px solid rgb(187, 179, 179)",
              fontSize: nodeSize * 0.07 + "px",
              padding: "5px",
            }}
          >
            <div className="card-body text-center p-1">
              <strong className="card-title" style={{ fontSize: nodeSize * 0.1 + "px" }}>
                {node.title}
              </strong>
              <div className="d-flex gap-1 mt-1">
                <strong style={{ fontSize: nodeSize * 0.1 + "px" }}>Department</strong>
                <p style={{ fontSize: "0.8rem" }}>{node.department}</p>
              </div>

              <div className="mt-2">
                {isRoot && (
                  <div className="d-flex flex-column align-items-center">
                    <div className="d-flex justify-content-center mt-1">
                      <button
                        style={{
                          width: "80px",
                          fontSize: "11px",
                          padding: "2px",
                          height: "22px",
                          margin: "1px",
                          whiteSpace: "nowrap",
                          backgroundColor: "#007bff",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer"
                        }}
                        onClick={() => handleClick(node.key, 1)}
                      >
                        My KPI
                      </button>
                    </div>

                    {showPopupMap[node.key] && (
                      <div
                        ref={popupRef}
                        className="card mt-3 p-1 shadow-sm"
                        style={{
                          width: "370px",
                          position: "absolute",
                          top: "100%",
                          left: "50%",
                          transform: "translateX(-50%)",
                          padding: "5px",
                          zIndex: 1000,
                          maxHeight: "500px",
                          overflowY: "auto"
                        }}
                      >
                        <h6 className="fw-bold text-center mt-2" style={{ fontSize: "17px" }}>KPI List</h6>
                        <ul className="list-group list-group-flush">
                          {getPaginatedKPIs(node.kpis).map((kpi, index) => (
                            <li key={kpi.id} className="list-group-item small">
                              <div className="d-flex justify-content-between align-items-center">
                                <span style={{ fontSize: "11px" }}>
                                  {index + 1 + (currentPage - 1) * itemsPerPage}.{" "}
                                  <strong style={{ fontSize: "11px" }}>{kpi.title}</strong>
                                </span>
                              </div>
                              <div className="progress mt-1" style={{ height: "15px", cursor: "pointer" }}>
                                {kpi.target_type === "Done/Not Done" ? (
                                  <div
                                    className={`progress-bar ${parseInt(kpi.target_completed) === 1 ? 'bg-success' : 'bg-danger'}`}
                                    role="progressbar"
                                    style={{ width: "100%" }}
                                    title={parseInt(kpi.target_completed) === 1 ? "Done" : "Not Done"}
                                  />
                                ) : (
                                  <>
                                    <div
                                      className="progress-bar bg-success"
                                      role="progressbar"
                                      style={{ width: `${kpi.target_completed}%` }}
                                      title={`Completed: ${kpi.target_completed}`}
                                    />
                                    <div
                                      className="progress-bar bg-danger"
                                      role="progressbar"
                                      style={{ width: `${kpi.target_remaining}%` }}
                                      title={`Remaining: ${kpi.target_remaining}`}
                                    />
                                  </>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>

                        {/* Pagination Controls */}
                        {node.kpis.length > itemsPerPage && (
                          <div className="d-flex justify-content-center mt-2 mb-2 flex-wrap" style={{ gap: "2px" }}>
                            <button
                              className="btn btn-sm btn-outline-secondary px-2 py-1"
                              style={{ fontSize: "11px", borderRadius: "4px", minWidth: "45px" }}
                              onClick={(e) => handlePageChange(currentPage - 1, e)}
                              disabled={currentPage === 1}
                            >
                              Prev
                            </button>
                            {Array.from({ length: totalPages(node.kpis) }, (_, i) => (
                              <button
                                key={i + 1}
                                className={`btn btn-sm ${currentPage === i + 1 ? "btn-primary" : "btn-outline-secondary"}`}
                                style={{ 
                                  fontSize: "11px", 
                                  borderRadius: "4px", 
                                  minWidth: "25px",
                                  padding: "2px 4px"
                                }}
                                onClick={(e) => handlePageChange(i + 1, e)}
                              >
                                {i + 1}
                              </button>
                            ))}
                            <button
                              className="btn btn-sm btn-outline-secondary px-2 py-1"
                              style={{ fontSize: "11px", borderRadius: "4px", minWidth: "45px" }}
                              onClick={(e) => handlePageChange(currentPage + 1, e)}
                              disabled={currentPage === totalPages(node.kpis)}
                            >
                              Next
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        }
        key={node.key}
      >
        {node.children.map((child) => renderNode(child))}
      </TreeNode>
    );
  };

  return (
    <div className="container-fluid">
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px",
          marginBottom: "10px",
        }}
      >
        <div style={{ position: "relative" }}>
          <p style={{ marginBottom: "3px", fontSize: "12px" }}>Start Date</p>
          <div style={{ width: "120px", height: "30px", fontSize: "12px" }}>
            <DatePicker
              selected={selectedDate}
              maxDate={selectedDate2 || null} 
              onChange={(date: Date | null) => {
                console.log('Start date selected:', date);
                setSelectedDate(date);
              }}
              placeholderText="Select Date"
              className="form-control"
              dateFormat="yyyy-MM-dd"
            />
          </div>
          <FaRegCalendarAlt
            style={{
              position: "absolute",
              right: "3px",
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
              color: "#6c757d",
              fontSize: "12px",
            }}
          />
        </div>
        <div style={{ position: "relative" }}>
          <p style={{ marginBottom: "3px", fontSize: "12px" }}>End Date</p>
          <div style={{ width: "120px", height: "30px", fontSize: "12px" }}>
            <DatePicker
              selected={selectedDate2}
              onChange={(date: Date | null) => {
                console.log('End date selected:', date);
                setSelectedDate2(date);
              }}
              minDate={selectedDate || null}
              placeholderText="Select Date"
              className="form-control"
              dateFormat="yyyy-MM-dd"
            />
          </div>
          <FaRegCalendarAlt
            style={{
              position: "absolute",
              right: "3px",
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
              color: "#6c757d",
              fontSize: "12px",
            }}
          />
        </div>
      </div>

      <div className="container-fluid" style={{ marginLeft: "-3rem" }}>
        <div className="row justify-content-center">
          <div className="col-12">
            <div style={{ overflowX: "auto", paddingBottom: "20px" }}>
              {treeData.length > 0 ? (
                <Tree
                  lineWidth={"1px"}
                  lineColor={"#bbb"}
                  lineBorderRadius={"8px"}
                  nodePadding={"5px"}
                  label="Organization Hierarchy"
                >
                  {treeData.map((node, index) => renderNode(node, index === 0))}
                </Tree>
              ) : (
                <div className="text-center">
                  <p>Please select dates to view the hierarchy</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InorbvictHierarchyKPI;
