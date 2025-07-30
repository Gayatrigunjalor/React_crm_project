import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { useAppContext } from '../../../providers/AppProvider';
import { TooltipComponent } from 'echarts/components';
import { PieChart } from 'echarts/charts';
import { CallbackDataParams } from 'echarts/types/dist/shared';
import React from 'react';

echarts.use([TooltipComponent, PieChart]);

// Modify the chart options to accept data as props
const getDefaultOptions = (getThemeColor: (name: string) => string, totalCount:number) => ({
  color: [
    getThemeColor('primary'),
    getThemeColor('primary-lighter'),
    getThemeColor('info-dark')
  ],

  tooltip: {
    trigger: 'item',
    padding: [7, 10],
    backgroundColor: getThemeColor('body-highlight-bg'),
    borderColor: getThemeColor('border-color'),
    textStyle: { color: getThemeColor('light-text-emphasis') },
    borderWidth: 1,
    transitionDuration: 0,
    formatter: (params: CallbackDataParams) =>
      `<strong>${params.name}:</strong> ${params.value}`
  },
  legend: { show: false },
  series: [
    {
      name: '',
      type: 'pie',
      radius: ['10%', '87%'],
      avoidLabelOverlap: false,
      emphasis: {
        scale: false,
        itemStyle: {
          color: 'inherit'
        }
      },
      itemStyle: {
        borderWidth: 2,
        borderColor: getThemeColor('body-bg')
      },
      label: {
        show: true,
        position: 'center',
        formatter: `{a}`,
        fontSize: 23,
        color: getThemeColor('light-text-emphasis')
      },
      data: [
        { value: totalCount, name: 'Total Directories' },
        
      ]
    }
  ],
  grid: { containLabel: true }
});

const DirectoriesCountTopChart = ({ totalCount }) => {
  const { getThemeColor } = useAppContext();

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={getDefaultOptions(getThemeColor,  totalCount)}
      style={{ height: '115px', width: '100%' }}
    />
  );
};

export default DirectoriesCountTopChart;
