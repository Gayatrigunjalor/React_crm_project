import { CSSProperties } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { useAppContext } from '../../../providers/AppProvider';
import { TooltipComponent } from 'echarts/components';
import { BarChart } from 'echarts/charts';
import { CallbackDataParams } from 'echarts/types/dist/shared';
import { tooltipFormatterDefault } from '../../../helpers/echart-utils';
import Modal from "react-bootstrap/Modal";
import React, { useEffect, useState } from "react";
import Button from "../../../components/base/Button";

import axiosInstance from '../../../axios';
echarts.use([TooltipComponent, BarChart]);


const data1 = [42000, 35000, 35000, 40000, 15000];
const data2 = [30644, 33644, 28644, 38644, 14000];

const getDefaultOptions = (getThemeColor: (name: string) => string) => ({
  color: [getThemeColor('primary'), getThemeColor('tertiary-bg'), getThemeColor('victory-color')], // Add a color for Victory
  tooltip: {
    trigger: 'axis',
    padding: [7, 10],
    backgroundColor: getThemeColor('body-highlight-bg'),
    borderColor: getThemeColor('border-color'),
    textStyle: { color: getThemeColor('light-text-emphasis') },
    borderWidth: 1,
    transitionDuration: 0,
    axisPointer: {
      type: 'none'
    },
    formatter: (params: CallbackDataParams[]) =>
      tooltipFormatterDefault(params, 'MMM DD', 'color')
  },
  xAxis: {
    type: 'value',
    axisLabel: {
      show: true,
      interval: 3,
      showMinLabel: true,
      showMaxLabel: false,
      color: getThemeColor('quaternary-color'),
      align: 'left',
      fontFamily: 'Nunito Sans',
      fontWeight: 400,
      fontSize: 12.8,
      margin: 10,
      formatter: (value: number) => `${value / 1000}k`
    },
    show: true,
    axisLine: {
      lineStyle: {
        color: getThemeColor('tertiary-bg')
      }
    },
    axisTick: false,
    splitLine: {
      show: false
    }
  },
  yAxis: {
    data: ['Victory', 'Key Opportunity', 'Meetings Target', 'New Customer Conversion', 'Revenue'], // Add "Victory"
    type: 'category',
    axisPointer: { type: 'none' },
    axisTick: 'none',
    splitLine: {
      interval: 5,
      lineStyle: {
        color: getThemeColor('secondary-bg')
      }
    },
    axisLine: { show: false },
    axisLabel: {
      show: true,
      margin: 21,
      color: getThemeColor('body-color')
    }
  },
  series: [
    {
      name: 'Total',
      type: 'bar',
      label: {
        show: false
      },
      emphasis: {
        disabled: true
      },
      showBackground: true,
      backgroundStyle: {
        color: getThemeColor('body-highlight-bg')
      },
      barWidth: '30px',
      barGap: '-100%',
      data: data1,
      itemStyle: {
        borderWidth: 4,
        color: getThemeColor('secondary-bg'),
        bordercolor: getThemeColor('secondary-bg')
      }
    },
    {
      name: 'Done',
      type: 'bar',
      emphasis: {
        disabled: true
      },
      label: {
        show: true,
        color: getThemeColor('white'),
        fontWeight: 700,
        fontFamily: 'Nunito Sans',
        fontSize: 12.8,
        formatter: (value: CallbackDataParams) =>
          `$${value.value.toLocaleString()}`
      },
      backgroundStyle: {
        color: getThemeColor('body-highlight-bg')
      },
      barWidth: '30px',
      data: data2,
      itemStyle: {
        borderWidth: 4,
        color: getThemeColor('primary-light'),
        bordercolor: getThemeColor('secondary-bg')
      }
    },
    // {
    //   name: 'Victory', // New series for Victory
    //   type: 'bar',
    //   label: {
    //     show: true,
    //     color: getThemeColor('white'),
    //     fontWeight: 700,
    //     fontFamily: 'Nunito Sans',
    //     fontSize: 12.8,
    //     formatter: (value: CallbackDataParams) =>
    //       `$${value.value.toLocaleString()}`
    //   },
    //   backgroundStyle: {
    //     color: getThemeColor('body-highlight-bg')
    //   },
    //   barWidth: '30px',
    //   data: [38000, 41000, 39000, 45000, 47000], // Replace with your actual Victory data
    //   itemStyle: {
    //     borderWidth: 4,
    //     color: getThemeColor('victory-color'), // Assign a color for the Victory bar
    //     bordercolor: getThemeColor('secondary-bg')
    //   }
    // }
  ],
  grid: {
    right: 0,
    left: '10%',
    bottom: 8,
    top: 0,
    containLabel: true
  },
  animation: false
});

type Customer = {
  id: number;
  sender_name: string;
  sender_mobile: string;
  sender_email: string;
};
type PiData = {
  pi_number: string;
  pi_date: string;
};

const AceFeatureTargetChart = ({ style }: { style: CSSProperties }) => {
  const { getThemeColor } = useAppContext();
  const [showModal, setShowModal] = useState(false);
  const [formType, setFormType] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [piNumbers, setPiNumbers] = useState<PiData[]>([]);
  const [selectedPiNumber, setSelectedPiNumber] = useState<string>("");
  const [selectedPiDate, setSelectedPiDate] = useState<string>("");

  useEffect(() => {
    const fetchCustomers = async () => {

      const token = localStorage.getItem('token');
      const cleanToken = token && token.split('|')[1];

      // Define the body content


      try {
        setLoading(true);

        const response = await axiosInstance.get("/sales_customer_list", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cleanToken}`,
          },
        });


        const data = response.data;
        setCustomers(data.customer_list);

      } catch (error) {
        console.error("Error :", error);

      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  useEffect(() => {
    const fetchAllPINumbers = async () => {

      const token = localStorage.getItem('token');
      const cleanToken = token && token.split('|')[1];

      // Define the body content


      try {
        setLoading(true);

        const response = await axiosInstance.get("/get_pi_number_all", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cleanToken}`,
          },
        });


        const data = response.data;
        if (data && data.success && Array.isArray(data.data)) {
          setPiNumbers(data.data);
        } else {
          console.error("Invalid PI data format:", data);
        }

      } catch (error) {
        console.error("Error :", error);

      } finally {
        setLoading(false);
      }
    };

    fetchAllPINumbers();
  }, []);

  const handleOpenModal = (type) => {
    setFormType(type);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormType("");
  };

  const handlePiNumberChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    setSelectedPiNumber(selectedValue);
    const selectedPi = piNumbers.find((pi) => pi.pi_number === selectedValue);
    if (selectedPi) {
      setSelectedPiDate(selectedPi.pi_date);
    } else {
      setSelectedPiDate("");
    }
  };

  const name = "Name";


  const renderFormContent = () => {
    switch (formType) {
      case "Add Revenue":
        return (
          <>
            <div
              className="form-group"
              style={{ marginBottom: "16px" }}
            >
              <label>Select Customer</label>
              <select className="form-control" style={{ fontSize: "12px", padding: "6px 10px", marginTop: "6px", borderRadius: "4px" }}>
                <option value="">Select Customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.sender_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label>PI No</label>
              <select
                className="form-control"
                style={{ fontSize: "12px", padding: "6px 10px", marginTop: "6px", borderRadius: "4px" }}
                value={selectedPiNumber}
                onChange={handlePiNumberChange}
              >
                <option value="">Select PI No</option>
                {piNumbers.map((pi) => (
                  <option key={pi.pi_number} value={pi.pi_number}>
                    {pi.pi_number}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label>PI Date</label>
              <input
                type="date"
                className="form-control"
                value={selectedPiDate}
                readOnly
                style={{
                  fontSize: "12px",
                  padding: "6px 10px",
                  marginTop: "6px",
                  borderRadius: "4px",
                }}
              />
            </div>
            <div className="form-group">
              <label>Add Value</label>
              <input
                type="number"
                className="form-control"
                placeholder="Enter Value"
                style={{
                  fontSize: "12px",
                  padding: "6px 10px",
                  marginTop: "6px",
                  borderRadius: "4px",
                }}
              />
            </div>
          </>
        );

      case "Add NCC":
        return (
          <>
            <div
              className="form-group"
              style={{ marginBottom: "16px" }}
            >
              <label>Customer Name</label>
              <select className="form-control" style={{ fontSize: "12px", padding: "6px 10px", marginTop: "6px", borderRadius: "4px" }}>
                <option value="">Select Customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.sender_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Remark</label>
              <textarea
                className="form-control"
                placeholder="Enter Remark"
                rows="4"
                style={{
                  fontSize: "12px",
                  padding: "6px 10px",
                  marginTop: "6px",
                  borderRadius: "4px",
                }}
              />
            </div>
          </>
        );

      case "Add Meeting":
        return (
          <>
            <div
              className="form-group"
              style={{ marginBottom: "16px" }}
            >
              <label>Select Customer</label>
              <select className="form-control" style={{ fontSize: "12px", padding: "6px 10px", marginTop: "6px", borderRadius: "4px" }}>
                <option value="">Select Customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.sender_name}
                  </option>
                ))}
              </select>
            </div>
            <div
              className="form-group"
              style={{ marginBottom: "16px" }}
            >
              <label>Customer Meeting Date</label>
              <input
                type="date"
                className="form-control"
                style={{
                  fontSize: "12px",
                  padding: "6px 10px",
                  marginTop: "6px",
                  borderRadius: "4px",
                }}
              />
            </div>
            <div
              className="form-group"
              style={{ marginBottom: "16px" }}
            >
              <label>Minutes of Meeting</label>
              <textarea
                className="form-control"
                placeholder="Enter Minutes of Meeting"
                rows="4"
                style={{
                  fontSize: "12px",
                  padding: "6px 10px",
                  marginTop: "6px",
                  borderRadius: "4px",
                }}
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div
        className="form-row d-flex align-items-center gap-3"
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div
          className="form-group"
          style={{ marginRight: "8px", marginBottom: "2rem" }}
        >
          <input
            type="text"
            value={`Sales Person ${name}`}
            style={{ fontSize: "0.8rem" }}
            readOnly
            className="p-2 border rounded"
          />
        </div>

        <div
          className="form-group"
          style={{
            // flex: "1",
            marginLeft: "8px",
            marginBottom: "4rem",
          }}
        >
          <label
            htmlFor="date"
            style={{ fontSize: "0.8rem", fontWeight: "500" }}
          >
            Date
          </label>
          <input
            type="date"
            id="date"
            className="form-control"
            style={{
              fontSize: "0.8rem",
              padding: "10px 10px",
              marginTop: "6px",
              borderRadius: "4px",
              width: "100%",
            }}
          />
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', }}>
        <div style={{ flex: 1, }}>
          <ReactEChartsCore
            echarts={echarts}
            option={getDefaultOptions(getThemeColor)}
            style={{ height: '400px', width: '600px'  }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', marginLeft: '10px',marginTop:'15px', gap: '45px' }}>
          <Button
            variant="success"
            size="sm"
            onClick={() =>
              handleOpenModal("Add Revenue")
            }
          >
            Add Revenue
          </Button>
          <Button
            variant="info"
            onClick={() => handleOpenModal("Add NCC")}
            style={{ padding: "0.5rem 1.2rem" }}
          >
            Add NCC
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() =>
              handleOpenModal("Add Meeting")
            }
          >
            Add Meeting
          </Button>
        </div>
      </div>


      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{formType}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{renderFormContent()}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              console.log(`${formType} form submitted!`);
              handleCloseModal();
            }}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>

  );
};

export default AceFeatureTargetChart;
