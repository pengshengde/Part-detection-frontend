<template>
  <div class="app-container home">
    <el-row display:flex justify-content:space-between>
<!--      <el-col :span="4" class="card-box">
        <el-card>
          <div slot="header">
            <span><i class="el-icon-s-marketing"></i>产线1检测</span>
            <span style="float: right">
            <el-icon :name="getIconName(status)" :color="getIconColor(status)" style="padding: 3px 0;"></el-icon>
            </span>
          </div>

          <div class="card-box-content text-success">
            <span>{{detectResult.day}}</span>
          </div>
        </el-card>
      </el-col>-->
      <el-col :span="12" class="card-box" >
        <el-card shadow="hover">
          <div slot="header" style="display: flex; justify-content: space-between; align-items: center;">
              <i class="el-icon-s-marketing">检测设备1</i>
              <span style="display: inline; align-items: center; position: relative; justify-content: flex-end; ">
                <i :class="getIconName('running')" :style="{ color: getIconColor('running'), textAlign: 'center' ,fontSize: '24px' }"></i>
                <i :style="{disabled:'flex', color: getIconColor('running'), alignItems:'center', fontStyle:'normal',fontSize:'24px' }">运行中</i>
              </span>
          </div>
          <div  class="card-box-content">
            <el-table v-loading="loading" :data="partList1" :row-class-name="tableRowClassName" :show-header="showHeader" height="210" >
              <el-table-column label="零件名称" align="center" prop="partName"  key="partName"  />
              <el-table-column label="零件类型" align="center" prop="partTypeName" key="partTypeName"  width="100"/>
              <el-table-column label="是否合格" align="center" prop="detectResult" key="detectResult" width="80" >
                <template slot-scope="scope">
                  <el-switch
                    active-color="#13ce66"
                    inactive-color="#ff4949"
                    v-model="scope.row.detectResult"
                    active-value="合格"
                    inactive-value="不合格"
                    :disabled = true
                  ></el-switch>
                </template>
              </el-table-column>
              <el-table-column label="零件缺陷" align="center" key="defectTypeName" prop="defectTypeName"/>
              <el-table-column label="检测时间" align="center" prop="detectTime">
                <template slot-scope="scope">
                  <span>{{ parseTime(scope.row.detectTime) }}</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12" class="card-box" >
        <el-card shadow="hover">
          <div slot="header" style="display: flex; justify-content: space-between; align-items: center;">
            <i class="el-icon-s-marketing">检测设备2</i>
            <span style="display: inline; align-items: center; position: relative; justify-content: flex-end; ">
                <i :class="getIconName('standby')" :style="{ color: getIconColor('standby'), textAlign: 'center' ,fontSize: '24px' }"></i>
                <i :style="{disabled:'flex', color: getIconColor('standby'), alignItems:'center', fontStyle:'normal',fontSize:'24px' }">待机</i>
              </span>
          </div>
          <div class="card-box-content">
            <el-table v-loading="loading" :data="partList2" :row-class-name="tableRowClassName" :show-header="showHeader" height="210" >
              <el-table-column label="零件名称" align="center" prop="partName"  key="partName"  />
              <el-table-column label="零件类型" align="center" prop="partTypeName" key="partTypeName"  width="100"/>
              <el-table-column label="是否合格" align="center" prop="detectResult" key="detectResult" width="80" >
                <template slot-scope="scope">
                  <el-switch
                    active-color="#13ce66"
                    inactive-color="#ff4949"
                    v-model="scope.row.detectResult"
                    active-value="合格"
                    inactive-value="不合格"
                    :disabled = true
                  ></el-switch>
                </template>
              </el-table-column>
              <el-table-column label="零件缺陷" align="center" key="defectTypeName" prop="defectTypeName"/>
              <el-table-column label="检测时间" align="center" prop="detectTime">
                <template slot-scope="scope">
                  <span>{{ parseTime(scope.row.detectTime) }}</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row style="background:#fff;padding:16px 16px 0; margin-bottom:20px;">
      <el-col>
        <el-card shadow="hover">
          <div slot="header"><span><i class="el-icon-data-analysis"></i> 检测数据统计</span></div>
          <div>
            <line-chart :chart-data="lineChartData"  :x-aixs-data="xAixsData" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row style="background:#fff;padding:16px 16px 0; margin-bottom:20px;">
      <el-col>
        <el-card shadow="hover">
          <div slot="header"><span><i class="el-icon-data-analysis"></i> 缺陷数据统计</span></div>
          <div>
            <line-pie-chart :data="LinePieChartData"  />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row>
      <el-col  class="card-box">
        <el-card shadow="hover">
          <div slot="header"><span><i class="el-icon-view"></i> 设备状态</span></div>
          <div style="height: 350px; background:#fff;padding:16px 16px 0; margin-bottom:32px;">
            <div ref="ganttChart" style="height: 100%;"></div>
          </div>
        </el-card>
      </el-col>

    </el-row>



  </div>
</template>

<script>
import {getDetectResult, getEquipmentStatus} from "@/api/system/dashboard";
import * as echarts from "echarts";
import LineChart from './dashboard/LineChart'
import {getStatisticInfo, listDevPart} from "@/api/statistic";
import {listBatchT} from "@/api/quality/batchT";
import LinePieChart from "@/views/dashboard/LinePieChart.vue";
import dict from "@/utils/dict";
import {listDefectType} from "@/api/quality/defect";

export default {

  dicts: ['detect_type_name'],

  name: "Index",
  components: {
    LinePieChart,
    LineChart,
  },
  data() {
    return {
      // 遮罩层
      loading: true,

      showHeader:true,

      // 图片检测的结果
      detectResult:{detectDay: 200, commonDay: 1000, day: 1200},


      // 各个设备的一些数据配置
      lines: [
        { id: 1, name: '检测设备1', status: 'running', show: '运行中' },
        { id: 2, name: '检测设备2', status: 'standby', show: '待机' },
      ],
      partList1: [], // 第一个设备的检测数据
      partList2: [], // 第二个设备的检测数据,

      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        orderByColumn: "detectTime",
        isAsc:"desc",
        defectTypeName:undefined,
        devName:undefined,
      },
      // 批次信息统计的查询参数
      batchQueryParams:{
        pageNum: 1,
        pageSize: 10,
        orderByColumn:"detectEndTime",
        isAsc: "desc",
      },
      defectTypeQueryParams:{
        pageNum: 1,
        pageSize: 10,
      },
      // 日期范围
      dateRange: [],

      defectTypeList:["划伤","积屑瘤","划痕","腐蚀","振刀纹","过切","杂色"],


      // 折线图的数据
      lineChartData:{
        // 折线图的数据
        qualifiedData: [],
        unqualifiedData: [],
      },
      // 折线图的x轴数据
      xAixsData:[],

      // 表与折线图的数据
      LinePieChartData:[
        ['Time', 'Wen', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat','Sun'],
      ],


      // 甘特图的一些参数
      data: [],
      dataCount: 5,
      startTime: new Date().setHours(0,0,0,0),
      types: [
        { name: '运行', color: '#75d874' },
        { name: '故障', color: '#bd6d6c' },
        { name: '等待', color: '#e0bc78' },
        // { name: '备用', color: '#7b9ce1' },
      ],
      categories: ['设备1', '设备2', '设备3','设备4', '设备5', '设备6'],


      equipmentStatusList:null,

    };
  },

  mounted() {
/*
    this.qualifiedRate = echarts.init(this.$refs.qualifiedRate)
    const qualifiedRateValue = this.qualifiedRateValue
    this.qualifiedRate.setOption({
      series: [
        {
          name: '合格率',
          type: 'gauge',
          center: ['50%', '55%'],
          radius: '75%',
          min: 0,
          max: 1,
          itemStyle: {
            color: '#4FC3F7',
            shadowColor: 'rgba(0,138,255,0.45)'
          },
          // 进度条
          progress: {
            show: true,
            width: 20,
            roundCap: true
          },
          // 坐标轴线
          axisLine: {
            show: true,
            roundCap: true,
            lineStyle: {
              width: 20
            }
          },
          // 仪表盘指针
          pointer: {
            show: false
          },
          // 刻度标签
          axisLabel: {
            show: false
          },
          // 刻度
          axisTick: {
            show: false
          },
          // 分隔线
          splitLine: {
            show: false
          },
          title: {
            offsetCenter: [0, '20%'],
            fontSize: 20
          },
          detail: {
            offsetCenter: [0, '-10%'],
            valueAnimation: true,
            textStyle: {
              fontSize: 30
            },
            formatter: '{value}'
          },
          data: [
            { value: qualifiedRateValue, name: "合格率" }
          ]
        }
      ]
    })

    this.unqualifiedRate = echarts.init(this.$refs.unqualifiedRate)
    const unqualifiedRateValue = this.unqualifiedRateValue
    this.unqualifiedRate.setOption({
      series: [
        {
          name: '评价',
          type: 'gauge',
          center: ['50%', '55%'],
          radius: '75%',
          min: 0,
          max: 1,
          itemStyle: {
            color: '#ed5565',
            shadowColor: 'rgba(255,0,132,0.45)'
          },
          // 进度条
          progress: {
            show: true,
            width: 20,
            roundCap: true
          },
          // 坐标轴线
          axisLine: {
            show: true,
            roundCap: true,
            lineStyle: {
              width: 20
            }
          },
          // 仪表盘指针
          pointer: {
            show: false
          },
          // 刻度标签
          axisLabel: {
            show: false
          },
          // 刻度
          axisTick: {
            show: false
          },
          // 分隔线
          splitLine: {
            show: false
          },
          title: {
            offsetCenter: [0, '20%'],
            fontSize: 20
          },
          detail: {
            offsetCenter: [0, '-10%'],
            valueAnimation: true,
            textStyle: {
              fontSize: 30
            },
            formatter: '{value}'
          },
          data: [
            { value: unqualifiedRateValue, name: "不合格率" }
          ]
        }
      ]
    })
*/

/*    this.lineChart = echarts.init(this.$refs.lineChart)
    this.lineChart.setOption({
      title: {
        text: '数据分析'
      },
      // 提示框
      tooltip: {
        trigger: 'axis'
      },
      // 图例
      legend: {
        icon: 'circle',
        left: 'center',
        top: 0,
        data: ['合格', '不合格']
      },
      grid: {
        left: '3%',
        right: '3%',
        bottom: '3%',
        containLabel: true
      },
      // 工具栏
      toolbox: {
        feature: {
          saveAsImage: {
            type: 'png'
          },
          magicType: {
            type: ['line', 'bar', 'stack']
          }
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '合格',
          type: 'line',
          // smooth: true, // 平滑曲线显示
          data: [120, 132, 101, 134, 190, 230, 210, 201, 234, 290, 230, 210]
        },
        {
          name: '不合格',
          type: 'line',
          stack: '总量',
          // smooth: true,
          data: [10, 22, 21, 14, 19, 13, 20, 11, 34, 29, 20, 10]
        }
      ]
    })*/

    this.ganttChart = echarts.init(this.$refs.ganttChart)
    this.ganttChart.setOption(
      {
        //鼠标提示
        tooltip: {
          formatter: function (params) {
            var duration = params.value[3];
            var hours = Math.floor(duration / (60 * 60 * 1000));
            var minutes = Math.floor((duration % (60 * 60 * 1000)) / (60 * 1000));
            var seconds = Math.floor((duration % (60 * 1000)) / 1000);
            var milliseconds = duration % 1000;
            var formattedDuration = '';
            if (hours > 0) {
              formattedDuration += hours + 'h ';
            }
            if (minutes > 0) {
              formattedDuration += minutes + 'm ';
            }
            if (seconds > 0) {
              formattedDuration += seconds + 's ';
            }
            if (milliseconds > 0) {
              formattedDuration += milliseconds + 'ms ';
            }
            return params.marker + params.name + ': ' + formattedDuration.trim();
          }
        },
        //标题
        title: {
          show: false,
          text: '甘特图-设备运行状态',
          left: 'center'
        },
        legend: {
          show: true,
          data: ['运行', '故障', '等待'],
          right: 80,
          top: 'auto', // 取消 top 属性的设置
          bottom: 0, // 设置底部距离为 0
          left: 'center'
        },
        //缩放
        dataZoom: [{
          type: 'slider',
          show : false,
          filterMode: 'weakFilter',
          showDataShadow: false,
          top: 400,
          height: 10,
          borderColor: 'transparent',
          backgroundColor: '#e2e2e2',
          handleIcon: 'M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7v-1.2h6.6z M13.3,22H6.7v-1.2h6.6z M13.3,19.6H6.7v-1.2h6.6z', //jshint ignore:line
          handleSize: 20,
          handleStyle: {
            shadowBlur: 6,
            shadowOffsetX: 1,
            shadowOffsetY: 2,
            shadowColor: '#aaa'
          },
          labelFormatter: '',
          start: 0,
          end: 70,
        }, {
          type: 'inside',
          filterMode: 'weakFilter'

        }],
        grid: {
          top: 0,
          height: '80%'
        },
        xAxis: {
          min: this.startTime,
          max: this.startTime + 24 * 60 * 60 * 1000 - 1,
          scale: true,
          axisLabel: {
            formatter: function (val) {
              var date = new Date(val);
              var hours = date.getHours().toString().padStart(2, '0');
              var minutes = date.getMinutes().toString().padStart(2, '0');
              return hours + ':' + minutes;
            }
          }
        },
        yAxis: {
          data: this.categories
        },

        series: [
          {
          name:'运行',
          type: 'custom',
          renderItem: renderItem,
          itemStyle: {
            opacity: 0.8,
            color: "#75d874"
          },
          encode: {
            x: [1, 2],
            y: 0
          },
          data: this.data
          },
          {
            name:'故障',
            type: 'custom',
            renderItem: renderItem,
            itemStyle: {
              opacity: 0.8,
              color: "#bd6d6c",
              borderWidth: 2
            },
            encode: {
              x: [1, 2],
              y: 0
            },
            data: this.data
          },
          {
            name:'等待',
            type: 'custom',
            renderItem: renderItem,
            itemStyle: {
              opacity: 0.8,
              color: "#e0bc78",
              borderWidth: 2
            },
            encode: {
              x: [1, 2],
              y: 0
            },
            data: this.data
          },
          {
            name:'备用',
            type: 'custom',
            renderItem: renderItem,
            itemStyle: {
              opacity: 0.8,
              color: "#7b9ce1",
              borderWidth: 2
            },
            encode: {
              x: [1, 2],
              y: 0
            },
            data: this.data
          }
        ]
      }
    )
    function renderItem(params, api) {
      var categoryIndex = api.value(0);
      var start = api.coord([api.value(1), categoryIndex]);
      var end = api.coord([api.value(2), categoryIndex]);
      var height = api.size([0, 1])[1] * 0.6;

      var rectShape = echarts.graphic.clipRectByRect({
        x: start[0],
        y: start[1] - height / 2,
        width: end[0] - start[0],
        height: height
      }, {
        x: params.coordSys.x,
        y: params.coordSys.y,
        width: params.coordSys.width,
        height: params.coordSys.height
      });
      return rectShape && {
        type: 'rect',
        shape: rectShape,
        style: api.style()
      };
    }
  },

  created() {
    this.generateData()
    this.getEquipmentStatusList()

    this.getList()
    this.getLinePieChartData()
  },
  methods: {
    goTarget(href) {
      window.open(href, "_blank");
    },

    // 显示表是否为危险行
    tableRowClassName({row, rowIndex}) {
      if (rowIndex === 0) {
        return 'warning-row';
      } else if (rowIndex === 1) {
        return 'success-row';
      }
      return '';
    },

    // 查询检测结果
    /** 查询零件列表 */
    getList() {
      this.loading = true;
      this.queryParams.devName = "CK61100"
      listDevPart(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
          this.partList1 = response.rows;
          this.loading = false;
        }
      );

      this.queryParams.devName = "HK63"
      listDevPart(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
          this.partList2 = response.rows;
          this.loading = false;
        }
      );


      listBatchT(this.addDateRange(this.batchQueryParams, this.dateRange)).then(response => {
        for (const row of response.rows){
          this.xAixsData.push(row.batchName)
          this.lineChartData.qualifiedData.push(row.qualifiedQuantity)
          this.lineChartData.unqualifiedData.push(row.unqualifiedQuantity)
        }
          this.loading = false;
        }
      );
    },

    getLinePieChartData(){
      this.loading = true;
      getStatisticInfo().then(response => {
        for (const row of response.data){
          if (!row.slice(1).every(element => element === 0)){
            this.LinePieChartData.push(row)
          }
        }
        this.loading = false;
      })
    },

    /*getLinePieChartData() {
      this.defectTypeList.forEach(d =>{
        const array = []
        array.push(d)
        this.resetQuery()
        this.queryParams.defectTypeName = d
        this.formattedDates.forEach(date => {
          this.dateRange = [date, date]
          listDevPart(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
              console.log(response.total)
              array.push(response.total)
          });
        })
        console.log(array)
        if (!array.slice(1).every(element => element === 0)){
          this.LinePieChartData.push(array)
        }
      })

    },*/



    getCurrentDate() {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      this.currentDate = `${year}-${month}-${day}`;
      this.dateRange= [this.currentDate, this.currentDate];
    },

    /*iterateWeekDates(){
      const currentDate = new Date(); // 获取当前日期
      const currentDay = currentDate.getDay(); // 获取当前是星期几（0 - 周日，1 - 周一，...，6 - 周六）
      const startOfWeek = new Date(currentDate); // 创建一个新的日期对象，用于存储本周的周一日期

      // 计算本周的周一日期
      startOfWeek.setDate(currentDate.getDate() - currentDay + 1);

      for (let i = startOfWeek.getDate(); i <= currentDate.getDate(); i++) {
        const date = new Date(startOfWeek);
        date.setDate(i);

        // 格式化日期为 yyyy-mm-dd
        const formattedDate = date.toISOString().slice(0, 10);
        this.formattedDates.push(formattedDate);

      }
    },*/

    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        orderByColumn: "detectTime",
        isAsc:"desc",
        defectTypeName:undefined,
        devName: undefined
      }
    },



    getEquipmentStatusList(){
      this.loading = true;
      getEquipmentStatus(this.addDateRange(this.queryParams, this.dateRange)).then(response =>{
          response.rows.map(item => {
            const index = item.devId;
            const baseTime = new Date(item.startTime).getTime();
            const endTime = new Date(item.endTime).getTime();
            const duration = endTime - baseTime;

            const typeItem = this.types.find(type => type.name === item.statusName);

            this.data.push({
              name: item.statusName,
              value: [index, baseTime, endTime, duration],
              itemStyle: {
                color: typeItem ? typeItem.color : 'white'// 根据实际需求设置颜色值
              }
            });
            });

          this.total = response.total;
          this.loading = false;

          console.log(this.data)
        }
      );
    },

    generateData() {
      // 产生模拟数据的代码
      echarts.util.each(this.categories, function (category, index) {
        var baseTime = this.startTime;
        for (var i = 0; i < this.dataCount; i++) {
          var typeItem = this.types[Math.round(Math.random() * (this.types.length - 1))];
          var duration = Math.round(Math.random() * 3600 * 2000);
          this.data.push({
            name: typeItem.name,
            value: [
              index,
              baseTime,
              baseTime += duration,
              duration
            ],
            itemStyle: {
              color: typeItem.color
            }
          });
          baseTime += Math.round(Math.random() * 6000000);
        }
      }.bind(this));
      console.log(this.data)
    },

    getIconName(status) {
      // 根据状态返回不同的图标名称
      if (status === 'running') {
        return 'el-icon-video-play';
      } else if (status === 'standby') {
        return 'el-icon-loading';
      } else if (status === 'fault') {
        return 'el-icon-warning-outline';
      }
    },
    getIconColor(status) {
      // 根据状态返回不同的图标颜色
      if (status === 'running') {
        return '#1c84c6';
      } else if (status === 'standby') {
        return '#f8ac59';
      } else if (status === 'fault') {
        return '#ed5565';
      }
    },

    handleSetLineChartData(type) {
      this.lineChartData = lineChartData[type]
    }
  }
};
</script>

<style scoped lang="scss">

.el-table .warning-row {
  background: oldlace;
}

.el-table .success-row {
  background: #f0f9eb;
}

.card-box-head{
  font-size: 20px;
  font-weight: bold;
  font-style: normal
}

.card-box {
  padding-right: 15px;
  padding-left: 15px;
  margin-bottom: 10px;
}

.card-box-content{
  font-size: 27px;
  font-weight: bold;
  text-align: center;
}

.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  position: relative;

  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}

@media (max-width:1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>

