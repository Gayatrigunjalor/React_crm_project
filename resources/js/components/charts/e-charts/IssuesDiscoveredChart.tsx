import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { useAppContext } from '../../../providers/AppProvider';
import { TooltipComponent } from 'echarts/components';
import { PieChart } from 'echarts/charts';
import React from 'react';
echarts.use([TooltipComponent, PieChart]);



const IssuesDiscoveredChart = ({customerBreakdown}) => {

  const getDefaultOptions = (
    getThemeColor: (name: string) => string,
    isDark: boolean
  ) => ({
    // color: [
    //   // !isDark ? getThemeColor('info-light') : getThemeColor('info-dark'),
    //   // !isDark ? getThemeColor('warning-light') : getThemeColor('warning-dark'),
    //   !isDark ? getThemeColor('danger-light') : getThemeColor('danger-dark'), 
    
    //   !isDark ? getThemeColor('success-light') : getThemeColor('success-dark'),
    //   !isDark ? getThemeColor('primary') : getThemeColor('primary'),
    //   getThemeColor('primary'),
     
    // ],
    color: [
      !isDark ? '#6AC47E' : '#6AC47E', // Green for VIP Customers
      !isDark ? '#457EFF' : '#457EFF', // Blue for Customers
      !isDark ? '#710a0aff' : '#710a0aff', // Red for Blacklisted Customers
      !isDark ? '#f18509ff' : '#f18509ff', // Gray for Customer Status Not Assigned
    ],
    
    tooltip: {
      trigger: 'item'
    },
    responsive: true,
    maintainAspectRatio: false,
  
    series: [
      {
        // name: 'Tasks assigned to me',
        type: 'pie',
        radius: ['48%', '90%'],
        startAngle: 30,
        avoidLabelOverlap: false,
        // label: {
        //   show: false,
        //   position: 'center'
        // },
  
        label: {
          show: false,
          position: 'center',
          formatter: '{x|{d}%} \n {y|{b}}',
          rich: {
            x: {
              fontSize: 20,
              fontWeight: 800,
              color: getThemeColor('tertiary-color'),
              padding: [0, 0, 5, 15]
            },
            y: {
              fontSize: 10,
              color: getThemeColor('tertiary-color'),
              fontWeight: 600
            }
          }
        },
        emphasis: {
          label: {
            show: true
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: customerBreakdown ? customerBreakdown.vip : 0, name: 'VIP Customers' },
          { value: customerBreakdown ? customerBreakdown.genuine : 0, name: 'Genuine Customers' },
          { value: customerBreakdown ? customerBreakdown.blacklisted : 0, name: 'Blacklisted Customers' },
          { value: customerBreakdown ? customerBreakdown.remaining : 0, name: 'Customer Status Not Assigned' },
        ]
        
      }
    ],
    grid: {
      bottom: 0,
      top: 0,
      left: 0,
      right: 0,
      containLabel: false
    }
  });
  const {
    getThemeColor,
    config: { isDark }
  } = useAppContext();

  return (
    <ReactEChartsCore
    echarts={echarts}
    option={getDefaultOptions(getThemeColor, isDark)}
    style={{
      height: '200px',
      width: '100%',
      maxWidth: '310px',
      margin: '0 auto'
    }}
    className="d-block"
  />
  
  );
};

export default IssuesDiscoveredChart;
