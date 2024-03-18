<template>
  <div ref="chartContainer" :class="className" :style="{ height: height, width: width }"  />
</template>

<script>
import * as echarts from 'echarts';
import 'echarts/theme/macarons';
import resize from "@/views/dashboard/mixins/resize";

export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '400px'
    },
    data: {
      type: Array,
      required: true,

    }
  },

  data() {
    return {
      chart: null
    };
  },
  watch: {
    data: {
      deep: true,
      handler(val) {
        this.setOption(val)
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart();
      setTimeout(() => {
        this.setOption();
      }, 0);
    });
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose();
      this.chart = null;
    }
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$refs.chartContainer, 'macarons');
      this.chart.on('updateAxisPointer', this.updateAxisPointer);
    },
    setOption() {
      const option = {
        legend: {
          top:"0%"
        },
        tooltip: {
          trigger: 'axis',
          showContent: false
        },
        dataset: {
          source: this.data
        },
        xAxis: { type: 'category' },
        yAxis: { gridIndex: 0 },
        grid: { top: '50%' },
        series: [
          /*{
            type: 'line',
            smooth: true,
            seriesLayoutBy: 'row',
            emphasis: { focus: 'series' }
          },
          {
            type: 'line',
            smooth: true,
            seriesLayoutBy: 'row',
            emphasis: { focus: 'series' }
          },
          {
            type: 'line',
            smooth: true,
            seriesLayoutBy: 'row',
            emphasis: { focus: 'series' }
          },
          {
            type: 'line',
            smooth: true,
            seriesLayoutBy: 'row',
            emphasis: { focus: 'series' }
          },*/
          {
            type: 'pie',
            id: 'pie',
            radius: '25%',
            center: ['50%', '25%'],
            emphasis: {
              focus: 'self'
            },
            label: {
              formatter: '{b}: {@Wen} ({d}%)'
            },
            encode: {
              itemName: 'Time',
              value: 'Wen',
              tooltip: 'Wen'
            }
          }
        ]


      };

      for (let i = 0; i < this.data.length ; i++) {
        option.series.push({
          type: 'line',
          smooth: true,
          seriesLayoutBy: 'row',
          emphasis: { focus: 'series' }
        });
      }


      this.chart.setOption(option);
    },
    updateAxisPointer(event) {
      const xAxisInfo = event.axesInfo[0];
      if (xAxisInfo) {
        const dimension = xAxisInfo.value + 1;
        this.chart.setOption({
          series: {
            id: 'pie',
            label: {
              formatter: '{b}: {@[' + dimension + ']} ({d}%)'
            },
            encode: {
              value: dimension,
              tooltip: dimension
            }
          }
        });
      }
    }
  }
};
</script>

<style>
.chart-container {
  transform-origin: top left;
  transform: scale(1);
}
</style>
