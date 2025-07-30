import { CSSProperties } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { useAppContext } from '../../../providers/AppProvider';
import { TooltipComponent, LegendComponent } from 'echarts/components';
import { BarChart } from 'echarts/charts';
import { CallbackDataParams } from 'echarts/types/dist/shared';
import React from 'react';
import { Card } from 'react-bootstrap';

// Register the required components
echarts.use([TooltipComponent, LegendComponent, BarChart]);

interface SourcingStats {
  sourcing_required: number;
  sourcing_not_required: number;
  sourcing_done: number;
  sourcing_not_done: number;
  total_product_sourcing: number;
}

interface TeamMember {
  employee_name: string;
  employee_id: number;
  sourcing_stats: SourcingStats;
}

interface ProductSourcingTrackerTeamProps {
  teamSourcingData: TeamMember[];
}

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase();
};

const getDefaultOptions = (getThemeColor: (name: string) => string, teamSourcingData: TeamMember[]) => {
//  const total = teamSourcingData.map(member => member.sourcing_stats.total_product_sourcing);
  const dataRequired = teamSourcingData.map(member => member.sourcing_stats.sourcing_required);
  const dataNotRequired = teamSourcingData.map(member => member.sourcing_stats.sourcing_not_required);
  const yAxisLabels = teamSourcingData.map(member => getInitials(member.employee_name));
  const fullNames = teamSourcingData.map(member => member.employee_name); // <-- Added
  const remaining = teamSourcingData.map(member => member.sourcing_stats.total_product_sourcing - (member.sourcing_stats.sourcing_required + member.sourcing_stats.sourcing_not_required));
  console.log('Remaining Data:', remaining);
  
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: CallbackDataParams[]) => {
        const dataIndex = params[0]?.dataIndex ?? 0;
        const employeeName = fullNames[dataIndex];
        const req = params.find(p => p.seriesName === 'Product Sourcing Required');
        const notReq = params.find(p => p.seriesName === 'Product Sourcing Not-Required');
        const remaining = params.find(p => p.seriesName === 'Remaining');
        return `<b>${employeeName}</b><br/>
          Product Sourcing Required : ${req?.value} <br/>
          Product Sourcing Not-Required : ${notReq?.value}  <br/>
          Remaining Product Sourcing : ${remaining?.value}`;
      }
    },
    legend: {
      data: ['Product Sourcing Required', 'Product Sourcing Not-Required', 'Remaining'],
      top: 20,
      left: 'center',
      textStyle: {
        color: getThemeColor('body-color')
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      axisLabel: {
        color: getThemeColor('quaternary-color')
      },
      axisLine: {
        lineStyle: {
          color: getThemeColor('tertiary-bg')
        }
      }
    },
    yAxis: {
      type: 'category',
      data: yAxisLabels,
      axisLabel: {
        color: getThemeColor('body-color')
      },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: [
      {
        name: 'Product Sourcing Required',
        type: 'bar',
        stack: 'total',
        barWidth: 20,
        itemStyle: {
          borderRadius: [5, 5, 0, 0],
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#6C63FF' }, // light
              { offset: 1, color: '#3B2FDB' }  // dark
            ]
          },
          shadowColor: 'rgba(0, 0, 0, 0.2)',
          shadowBlur: 10,
          shadowOffsetX: -2,
          shadowOffsetY: 2
        },
        data: dataRequired
      },
      {
        name: 'Product Sourcing Not-Required',
        type: 'bar',
        stack: 'total',
        barWidth: 20,
        itemStyle: {
          borderRadius: [5, 5, 0, 0],
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#E0BBFF' }, // light
              { offset: 1, color: '#C17CFF' }  // dark
            ]
          },
          shadowColor: 'rgba(0, 0, 0, 0.2)',
          shadowBlur: 10,
          shadowOffsetX: -2,
          shadowOffsetY: 2
        },
        data: dataNotRequired
      },
       {
        name: 'Remaining',
        type: 'bar',
        stack: 'total',
        barWidth: 20,
        itemStyle: {
          borderRadius: [5, 5, 0, 0],
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#ffbbdbff' }, // light
              { offset: 1, color: '#ff7cf0ff' }  // dark
            ]
          },
          shadowColor: 'rgba(0, 0, 0, 0.2)',
          shadowBlur: 10,
          shadowOffsetX: -2,
          shadowOffsetY: 2
        },
        data: remaining
      }


    ]
  };
};

const ProductSourcingTrackerTeam: React.FC<ProductSourcingTrackerTeamProps> = ({ teamSourcingData }) => {
  const { getThemeColor } = useAppContext();

  return (
    <Card className="shadow-sm border-0 p-4 mt-3">
      <h5 className="fw-bold mb-4 text-center">Product Sourcing Tracker</h5>
      <ReactEChartsCore
        echarts={echarts}
        option={getDefaultOptions(getThemeColor, teamSourcingData)}
      />
    </Card>
  );
};

export default ProductSourcingTrackerTeam;
