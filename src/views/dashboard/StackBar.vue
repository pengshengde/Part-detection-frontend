
<template>
  <div ref="chartContainer" :class="className" :style="{ height: height, width: width }"  />
</template>

<script>
import * as echarts from 'echarts';
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
    stackBarData: {
      type: Array,
      required: true,
    },
    // x轴的名称
    xAixsData: {
      type: Array,
      default: () => []
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
        this.initChart(val)
      }
    }
  },

  mounted() {
    this.$nextTick(() => {
      this.initChart()
    })
  },

  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },

  methods:{
    initChart() {
      const chartDom = this.$refs.chartContainer;
      this.chart = echarts.init(chartDom, null, {
        renderer: 'auto'
      });
      this.setOptions()
    },

    setOptions(){
      const rawData = this.stackBarData;
      const totalData = [];
      for (let i = 0; i < rawData[0].length; ++i) {
        let sum = 0;
        for (let j = 0; j < rawData.length; ++j) {
          sum += rawData[j][i];
        }
        totalData.push(sum);
      }

      const color = ['#91cc75', '#fac858'];
      const grid = {
        left: 100,
        right: 100,
        top: 50,
        bottom: 50
      };

      const series = ['合格', '不合格'].map((name, index) => {
        return {
          name,
          type: 'bar',
          stack: 'total',
          barWidth: '60%',
          label: {
            show: true,
            formatter: (params) => Math.round(params.value * 1000) / 10 + '%'
          },
          data: rawData[index].map((d, did) =>
            totalData[did] <= 0 ? 0 : d / totalData[did]
          )
        };
      });

      const gridWidth = this.chart.getWidth() - grid.left - grid.right;
      const gridHeight = this.chart.getHeight() - grid.top - grid.bottom;
      const categoryWidth = gridWidth / rawData[0].length;
      const barWidth = categoryWidth * 0.6;
      const barPadding = (categoryWidth - barWidth) / 2;


      const elements = [];

      for (let j = 1, jlen = rawData[0].length; j < jlen; ++j) {
        const leftX = grid.left + categoryWidth * j - barPadding;
        const rightX = leftX + barPadding * 2;
        let leftY = grid.top + gridHeight;
        let rightY = leftY;
        for (let i = 0, len = series.length; i < len; ++i) {
          const points = [];
          const leftBarHeight = (rawData[i][j - 1] / totalData[j - 1]) * gridHeight;
          points.push([leftX, leftY]);
          points.push([leftX, leftY - leftBarHeight]);
          const rightBarHeight = (rawData[i][j] / totalData[j]) * gridHeight;
          points.push([rightX, rightY - rightBarHeight]);
          points.push([rightX, rightY]);
          points.push([leftX, leftY]);
          leftY -= leftBarHeight;
          rightY -= rightBarHeight;
          elements.push({
            type: 'polygon',
            shape: {
              points
            },
            style: {
              fill: color[i],
              opacity: 0.4
            }
          });
        }
      }

      this.chart.setOption({
        legend: {
          selectedMode: true
        },
        grid: grid,
        yAxis: {
          type: 'value'
        },
        xAxis: {
          type: 'category',
          data: this.xAixsData,
        },
        series: series,
        graphic: {
          elements
        },
        color:['#91cc75', '#fac858']
      })
    }
  }
}
</script>

<style scoped>

</style>
