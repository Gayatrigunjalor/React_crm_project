import React, { useState, useEffect } from "react";
import { Tree, TreeNode } from "react-organizational-chart";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaRegCalendarAlt } from "react-icons/fa";
import ReactSelect from "../../../components/base/ReactSelect";
import axiosInstance from "../../../../js/axios";

const TreeStructure = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDate2, setSelectedDate2] = useState(null);
  const [treeData, setTreeData] = useState([]);
  const [nodeSize, setNodeSize] = useState(80); // Default node size

  useEffect(() => {
    const token = localStorage.getItem("token");
    const cleanToken = token && token.split("|")[1];
    const fetchHierarchy = async () => {
      try {
        const response = await axiosInstance.get("/getHierarchy", {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
          },
        });

        const transformData = (node) => ({
          title: `${node.name} (${node.designation})`,
          progress: { done: 0, notDone: 0 },
          key: node.id.toString(),
          children: node.children ? node.children.map(transformData) : [],
        });

        const transformedData = response.data.map(transformData);
        setTreeData(transformedData);
        adjustNodeSize(transformedData);
      } catch (error) {
        console.error("Error fetching hierarchy data", error);
      }
    };

    fetchHierarchy();
  }, []);

  const adjustNodeSize = (data) => {
    const totalNodes = countNodes(data);
    const maxDepth = getMaxDepth(data);

    let newSize = 120; // Default node size
    if (totalNodes > 50) newSize = 100;
    if (totalNodes > 100) newSize = 110;
    if (totalNodes > 200) newSize = 70;
    if (totalNodes > 500) newSize = 50;

    setNodeSize(newSize);
  };

  const countNodes = (nodes) =>
    nodes.reduce((acc, node) => acc + 1 + countNodes(node.children || []), 0);

  const getMaxDepth = (nodes, depth = 0) =>
    nodes.length
      ? Math.max(...nodes.map((node) => getMaxDepth(node.children || [], depth + 1)))
      : depth;

  const renderNode = (node) => (
    <TreeNode
      label={
        <div
          className="card mx-auto my-1"
          style={{
            maxWidth: `${nodeSize}px`,
            border: "1px solid rgb(187, 179, 179)",
            fontSize: nodeSize * 0.07 + "px",
            padding: "5px",
          }}
        >
          <div className="card-body text-center p-1">
            <strong className="card-title" style={{ fontSize: nodeSize * 0.1 + "px" }}>
              {node.title}
            </strong>
            <div className="progress mt-1" style={{ height: "6px" }}>
              <div
                className="progress-bar progress-bar-striped progress-bar-animated bg-primary"
                role="progressbar"
                style={{ width: `${node.progress.done}%`, fontSize: "6px" }}
                aria-valuenow={node.progress.done}
                aria-valuemin="0"
                aria-valuemax="100"
              >
                {node.progress.done}%
              </div>
              <div
                className="progress-bar"
                role="progressbar"
                style={{
                  width: `${node.progress.notDone}%`,
                  backgroundColor: "transparent",
                  border: "1px solid rgb(187, 179, 179)",
                  color: "rgb(158, 154, 154)",
                  fontWeight: "500",
                  fontSize: "6px",
                }}
                aria-valuenow={node.progress.notDone}
                aria-valuemin="0"
                aria-valuemax="100"
              >
                {node.progress.notDone}%
              </div>
            </div>
          </div>
        </div>
      }
      key={node.key}
    >
      {node.children && node.children.map((child) => renderNode(child))}
    </TreeNode>
  );

  return (
    <div className=""  >
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
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            placeholderText="Select Date"
            className="form-control"
            style={{ width: "120px", height: "30px", fontSize: "12px" }}
          />
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
          <DatePicker
            selected={selectedDate2}
            onChange={(date) => setSelectedDate2(date)}
            placeholderText="Select Date"
            className="form-control"
            style={{ width: "120px", height: "30px", fontSize: "12px" }}
          />
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
        <div>
          <p style={{ marginBottom: "3px", fontSize: "12px" }}>Filter By</p>
          <ReactSelect
            options={[
              { value: "Sales Target", label: "Sales Target" },
              { value: "Key Opportunity", label: "Key Opportunity" },
              { value: "Meeting Target", label: "Meeting Target" },
              { value: "Lead Victory", label: "Lead Victory" },
              { value: "New Customer Conversion", label: "New Customer Conversion" },
            ]}
            placeholder="Choose One"
            styles={{ container: (base) => ({ ...base, width: "120px", height: "30px", fontSize: "12px" }) }}
          />
        </div>
      </div>

      <div className="container-fluid"  style={{marginLeft:"-3rem"}}>
        <div className="row justify-content-center">
          <div className="col-12">
            <div style={{ overflowX: "auto", paddingBottom: "20px" }}>
              <Tree
                lineWidth={"1px"}
                lineColor={"#bbb"}
                lineBorderRadius={"8px"}
                nodePadding={"5px"}
                nodeSpacing={"15px"}
              >
                {treeData.map((node) => renderNode(node))}
              </Tree>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreeStructure;
