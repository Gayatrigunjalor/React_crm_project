import { CSSProperties } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { useAppContext } from '../../../providers/AppProvider';
import { TooltipComponent } from 'echarts/components';
import { PieChart } from 'echarts/charts'; 
import { contactSourceData } from '../../../data/crm/dashboardData';

const ContactsBySourceChart = ({
  height,
  width,
}: {
  height: string;
  width: string;
}) => {
  const { getThemeColor, config: { isDark } } = useAppContext();

  // ✅ Register PieChart
  echarts.use([TooltipComponent, PieChart]);

  const getDefaultOptions = (
    getThemeColor: (name: string) => string,
    isDark: boolean
  ) => ({
    color: [
      getThemeColor('primary'),
      getThemeColor('success'),
      getThemeColor('info'),
      !isDark ? getThemeColor('info-light') : getThemeColor('info-dark'),
      !isDark ? getThemeColor('danger-lighter') : getThemeColor('danger-darker'),
      !isDark ? getThemeColor('warning-light') : getThemeColor('warning-dark')
    ],
    tooltip: {
      trigger: 'item',
      borderWidth: 0
    },
    series: [
      {
        name: 'Contacts by Source',
        type: 'pie',
        radius: ['55%', '90%'],
        startAngle: 90,
        itemStyle: {
          borderColor: getThemeColor('body-bg'),
          borderWidth: 3
        },
        label: { show: false },
        emphasis: { label: { show: false } },
        labelLine: { show: false },
        data: contactSourceData
      }
    ]
  });

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={getDefaultOptions(getThemeColor, isDark)}
      style={{ height: "300px", width: "100%" }} // ✅ Use fixed height & width
    />
  );
};

export default ContactsBySourceChart;
