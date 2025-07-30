import dayjs from 'dayjs';
import { CallbackDataParams } from 'echarts/types/dist/shared';

export const tooltipFormatterDefault = (
  params: CallbackDataParams[],
  dateFormatter = 'MMM DD',
  colorProperty: 'borderColor' | 'color' = 'borderColor'
) => {
  let tooltipItem = ``;
  params.forEach(el => {
    tooltipItem += `<div class='ms-1'>
        <h6 class="text-body-tertiary">
        <span class="d-inline-block rounded-circle me-2" style="height: 0.5rem; width: 0.5rem; background:${
          el[colorProperty] || el.color
        }"></span>
          ${el.seriesName} : ${el.value}
        </h6>
      </div>`;
  });
  return `<div>
            <p class='mb-2 text-body-tertiary'>
              ${
                dayjs(params[0].name).isValid()
                  ? dayjs(params[0].name).format(dateFormatter)
                  : params[0].name
              }
            </p>
            ${tooltipItem}
          </div>`;
};

export const tooltipFormatterList = (params: CallbackDataParams[]) => {
  const result = params.map((param, index) => {
    let label = '';
    if (dayjs(params[0].name).isValid()) {
      if (index > 0) {
        label = dayjs(params[0].name).subtract(1, 'month').format('MMM DD');
      } else {
        label = dayjs(params[0].name).format('MMM DD');
      }
    } else {
      label = params[0].name;
    }
    return {
      value: param.value,
      label,
      color: param.color
    };
  });

  let tooltipItem = ``;
  result.forEach((el, index: number) => {
    tooltipItem += `<h6 class="text-body-tertiary ${
      (result.length === 1 || index > 0) && 'mb-0'
    }"><span class="d-inline-block rounded-circle me-2" style="height: 0.5rem; width: 0.5rem; background:${
      el.color
    }"></span>
    ${el.label} : ${el.value}
  </h6>`;
  });

  return `<div class='ms-1'>
            ${tooltipItem}
          </div>`;
};
