import React, { useState, useEffect } from "react";
import { Tree, TreeNode } from "react-organizational-chart";
import axiosInstance from "../../../js/axios";

const InorbvictHierarchy = () => {
    const [treeData, setTreeData] = useState([]);
    const [nodeSize, setNodeSize] = useState(80);
    const userId = localStorage.getItem('emp_id');

    // useEffect(() => {
    //     const token = localStorage.getItem("token");
    //     const cleanToken = token && token.split("|")[1];
    //     const fetchHierarchy = async () => {
    //         try {
    //             const response = await axiosInstance.get(`/getHierarchy?id=${userId}`, {
    //                 headers: {
    //                     Authorization: `Bearer ${cleanToken}`,
    //                 },
    //             });

    //             const transformData = (node, isFirstNode = false) => {
    //                 let title;
    //                 if (isFirstNode) {
    //                     title = `${node.name} (${node.designation})`;
    //                 } else {
    //                     title = `${node.name} - (Indicated by: ${node.indicating_name})\nRole: ${node.role}\nDepartment: ${node.department}\nDesignation: ${node.designation}`;
    //                 }

    //                 return {
    //                     title: title,
    //                     progress: { done: 0, notDone: 0 },
    //                     key: node.id.toString(),
    //                     children: node.children ? node.children.map((child) => transformData(child)) : [],
    //                 };
    //             };

    //             const transformedData = transformData(response.data, true); // Pass true for the first node
    //             setTreeData([transformedData]);
    //             adjustNodeSize([transformedData]);
    //         } catch (error) {
    //             console.error("Error fetching hierarchy data", error);
    //         }
    //     };

    //     fetchHierarchy();
    // }, []);
    useEffect(() => {
        const token = localStorage.getItem("token");
        const cleanToken = token && token.split("|")[1];
    
        const fetchHierarchy = async () => {
            try {
                const response = await axiosInstance.get(`/getHierarchy?id=${userId}`, {
                    headers: {
                        Authorization: `Bearer ${cleanToken}`,
                    },
                });
    
                const transformData = (node, isFirstNode = false) => {
                    let title;
                    if (isFirstNode) {
                        title = `${node.name} (${node.designation})`;
                    } else {
                        title = `${node.name} - (Indicated by: ${node.indicating_name})`;
                    }
    
                    return {
                        nodeData: title,
                        indicating_name: node.indicating_name,
                        role: node.role,
                        department: node.department,
                        designation: node.designation,
                        key: node.id.toString(),
                        children: node.children ? node.children.map((child) => transformData(child)) : [],
                    };
                };
    
                const transformedData = transformData(response.data, true); // Pass true for the first node
                setTreeData([transformedData]);
                adjustNodeSize([transformedData]);
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

    // const renderNode = (node) => (
    //     <TreeNode
    //         label={
    //             <div
    //                 className="card mx-auto my-1"
    //                 style={{
    //                     maxWidth: `${nodeSize}px`,
    //                     border: "1px solid rgb(187, 179, 179)",
    //                     fontSize: nodeSize * 0.07 + "px",
    //                     padding: "5px",
    //                 }}
    //             >
    //                 <div className="card-body text-center p-1">
    //                     <strong className="card-title" style={{ fontSize: nodeSize * 0.1 + "px" }}>
    //                         {node.title}
    //                     </strong>
    //                     {/* <div className="progress mt-1" style={{ height: "6px" }}>
    //                         <div
    //                             className="progress-bar progress-bar-striped progress-bar-animated bg-primary"
    //                             role="progressbar"
    //                             style={{ width: `${node.progress.done}%`, fontSize: "6px" }}
    //                             aria-valuenow={node.progress.done}
    //                             aria-valuemin="0"
    //                             aria-valuemax="100"
    //                         >
    //                             {node.progress.done}%
    //                         </div>
    //                         <div
    //                             className="progress-bar"
    //                             role="progressbar"
    //                             style={{
    //                                 width: `${node.progress.notDone}%`,
    //                                 backgroundColor: "transparent",
    //                                 border: "1px solid rgb(187, 179, 179)",
    //                                 color: "rgb(158, 154, 154)",
    //                                 fontWeight: "500",
    //                                 fontSize: "6px",
    //                             }}
    //                             aria-valuenow={node.progress.notDone}
    //                             aria-valuemin="0"
    //                             aria-valuemax="100"
    //                         >
    //                             {node.progress.notDone}%
    //                         </div>
    //                     </div> */}
    //                 </div>
    //             </div>
    //         }
    //         key={node.key}
    //     >
    //         {node.children && node.children.map((child) => renderNode(child))}
    //     </TreeNode>
    // );
    const renderNode = (node) => (
        <TreeNode
            label={
                <div
                    className="card mx-auto my-1 shadow-sm"
                    style={{
                        maxWidth: `${nodeSize}px`,
                        border: "1px solid #ccc",
                        // backgroundColor: "#f8f9fa",
                        borderRadius: "8px",
                        padding: "8px",
                        textAlign: "left",
                    }}
                >
                    <div className="card-body p-2">
                        <strong className="card-title d-block mb-1" style={{ fontSize:"0.6rem"}}>
                            {node.nodeData}
                        </strong>
                        <hr />
                        {node.indicating_name && (
                            <p className="mb-1" style={{ fontSize: nodeSize * 0.08 + "px",  }}>
                                <strong>Indicated by : </strong> {node.indicating_name}
                            </p>
                        )}
                      
                        {node.role && (
                            <p className="mb-1" style={{ fontSize: nodeSize * 0.08 + "px",  }}>
                                <strong>Role : </strong> {node.role}
                            </p>
                        )}
                        {node.department && (
                            <p className="mb-1" style={{ fontSize: nodeSize * 0.08 + "px",  }}>
                                <strong>Department : </strong> {node.department}
                            </p>
                        )}
                        {node.designation && (
                            <p className="mb-1" style={{ fontSize: nodeSize * 0.08 + "px",  }}>
                                <strong>Designation : </strong> {node.designation}
                            </p>
                        )}
                    </div>
                </div>
            }
            key={node.key}
        >
            {node.children && node.children.map((child) => renderNode(child))}
        </TreeNode>
    );
    
    
    return (
        <div className="container-fluid" style={{ marginLeft: "-3rem" }}>
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
    );
};

export default InorbvictHierarchy;