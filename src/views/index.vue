<template>
  <div class="app-container home">
    <el-row display:flex justify-content:space-between>
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
            <!-- 第一部分：下拉选择框 -->
            <div style="padding: 20px;display: flex; justify-content: center;" >
              <el-form :model="lineQueryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" >
                <el-form-item label="零件类型" prop="partTypeName">
                  <el-select
                    v-model="lineQueryParams.partTypeName"
                    placeholder="请输入零件类型"
                    clearable
                    style="width: 240px"
                  >
                    <el-option
                      v-for="dict in dict.type.quality_part_type"
                      :key="dict.value"
                      :label="dict.label"
                      :value="dict.value"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="检测时间">
                  <el-date-picker
                    v-model="lineDataRange"
                    style="width: 240px"
                    value-format="yyyy-MM-dd"
                    type="daterange"
                    range-separator="-"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                  ></el-date-picker>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" icon="el-icon-search" size="mini" @click="handleLineQuery">搜索</el-button>
                  <el-button icon="el-icon-refresh" size="mini" @click="handleLineReset">重置</el-button>
                </el-form-item>
              </el-form>
            </div>
            <line-chart :chart-data="lineChartData"  :x-aixs-data="xAixsData" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row style="background:#fff;padding:16px 16px 0; margin-bottom:20px;">
      <el-col>
        <el-card shadow="hover">
          <div slot="header">
            <span>
              <div style="display: flex; align-items: center;">
                  <i class="el-icon-data-analysis" style="margin-right: 10px; width: 20px;"></i>
                  <span>缺陷数据统计</span>
              </div>
            </span>

          </div>

          <div>
            <!-- 第一部分：下拉选择框 -->
            <div style="padding: 20px;display: flex; justify-content: center;" >
              <el-form :model="defectQueryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" >
                <el-form-item label="零件类型" prop="partTypeName">
                  <el-select
                    v-model="defectQueryParams.partTypeName"
                    placeholder="请输入零件类型"
                    clearable
                    style="width: 240px"
                  >
                    <el-option
                      v-for="dict in dict.type.quality_part_type"
                      :key="dict.value"
                      :label="dict.label"
                      :value="dict.value"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="检测时间">
                  <el-date-picker
                    v-model="defectDateRange"
                    style="width: 240px"
                    value-format="yyyy-MM-dd"
                    type="daterange"
                    range-separator="-"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                  ></el-date-picker>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" icon="el-icon-search" size="mini" @click="handleLinePieQuery">搜索</el-button>
                  <el-button icon="el-icon-refresh" size="mini" @click="handleLinePieReset">重置</el-button>
                </el-form-item>
              </el-form>
            </div>
            <!-- 第二部分：图表 -->
            <line-pie-chart :data="linePieChartData" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row style="background:#fff;padding:16px 16px 0; margin-bottom:20px;">
      <el-col>
        <el-card shadow="hover">
          <div slot="header">
            <span>
              <div style="display: flex; align-items: center;">
                  <i class="el-icon-data-analysis" style="margin-right: 10px; width: 20px;"></i>
                  <span>合格率数据统计</span>
              </div>
            </span>
          </div>

          <div>
            <!-- 第一部分：下拉选择框 -->
            <div style="padding: 20px;display: flex; justify-content: center;" >
              <el-form :model="defectQueryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" >
                <el-form-item label="零件类型" prop="partTypeName">
                  <el-select
                    v-model="defectQueryParams.partTypeName"
                    placeholder="请输入零件类型"
                    clearable
                    style="width: 240px"
                  >
                    <el-option
                      v-for="dict in dict.type.quality_part_type"
                      :key="dict.value"
                      :label="dict.label"
                      :value="dict.value"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="检测时间">
                  <el-date-picker
                    v-model="stackBarDataRange"
                    style="width: 240px"
                    value-format="yyyy-MM-dd"
                    type="daterange"
                    range-separator="-"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                  ></el-date-picker>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" icon="el-icon-search" size="mini" @click="handleLinePieQuery">搜索</el-button>
                  <el-button icon="el-icon-refresh" size="mini" @click="handleLinePieReset">重置</el-button>
                </el-form-item>
              </el-form>
            </div>
            <!-- 第二部分：图表 -->
            <stack-bar :stack-bar-data="data" :x-aixs-data="stackBarTime" />
          </div>
        </el-card>
      </el-col>
    </el-row>


  </div>
</template>

<script>

import LineChart from './dashboard/LineChart'
import {getStatisticInfo, listBatch, listBatchLine, listDevPart} from "@/api/statistic";
import LinePieChart from "@/views/dashboard/LinePieChart.vue";
import moment from "moment";
import StackBar from "@/views/dashboard/StackBar.vue";

export default {

  dicts: ['detect_type_name','quality_part_type'],

  name: "Index",
  components: {
    StackBar,
    LinePieChart,
    LineChart,
  },
  data() {
    return {
      // 遮罩层
      loading: true,

      // 显示搜索条件
      showSearch: true,
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
        partTypeName:undefined,
      },
      dateRange: [],
      // 批次信息统计的查询参数
      lineQueryParams:{
/*        orderByColumn:"detectEndTime",
        isAsc: "desc",*/
        partTypeName:undefined,
      },
      lineDataRange:[],
      // 日期范围


      defectQueryParams:{
        partTypeName: undefined,
      },
      // 查看缺陷排行的时间范围
      defectDateRange: [],

      // 折线图的数据
      lineChartData:{
        // 折线图的数据
        qualifiedData: [],
        unqualifiedData: [],
      },
      // 折线图的x轴数据
      xAixsData:[],

      // 表与折线图的数据
      linePieChartData:[
      ],


      data:[
        [100, 302, 301, 334, 390, 330, 320],
        [320, 132, 101, 134, 90, 230, 210],
      ],
      stackBarTime:['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      stackBarDataRange:[],

    };
  },


  created() {
    this.getList()
    this.getLineChartData()
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
    },

    getLineChartData(){
      this.loading = true;
      this.getLineTime()
      listBatchLine(this.addDateRange(this.lineQueryParams, this.lineDataRange)).then(response => {
          for (const row of response.rows){
            this.xAixsData.push(row.batchName)
            this.lineChartData.qualifiedData.push(row.qualifiedQuantity)
            this.lineChartData.unqualifiedData.push(row.unqualifiedQuantity)
          }
          this.loading = false;
        }
      );

      console.log(this.xAixsData)
    },


    getLinePieChartData(){
      this.loading = true;
      this.getLinePieTime()
      getStatisticInfo(this.addDateRange(this.defectQueryParams,this.defectDateRange)).then(response => {
        for (const row of response.data){
          if (!row.slice(1).every(element => element === 0)){
            this.linePieChartData.push(row)
          }
        }
        this.loading = false;
      })
    },

    handleLineQuery(){
      this.xAixsData = []
      this.lineChartData.qualifiedData = []
      this.lineChartData.unqualifiedData = []
      this.getLineChartData();
    },

    handleLineReset() {
      this.lineDataRange = [];
      this.lineQueryParams = {
        partTypeName: undefined,
      }
      this.handleLineQuery();
    },

    /** 搜索按钮操作 */
    handleLinePieQuery() {
      this.linePieChartData = []
      this.getLinePieChartData();
    },

    handleLinePieReset() {
      this.defectDateRange = [];
      this.defectQueryParams = {
        partTypeName: undefined,
      }
      this.handleLinePieQuery();
    },

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


    getLineTime(){
      if (this.lineDataRange.length === 0){
        const today = moment();
        this.lineDataRange = [today.format('YYYY-MM-DD'), today.format('YYYY-MM-DD')]
      }
    },

    getLinePieTime(){

      if(this.defectDateRange.length === 0){
        const today = moment();
        const sevenDaysAgo = moment().subtract(6, 'days');

        this.defectDateRange = [sevenDaysAgo.format('YYYY-MM-DD'), today.format('YYYY-MM-DD')];
      }

      const row = ['Time'];
      const startDate = moment(this.defectDateRange[0]);
      const endDate = moment(this.defectDateRange[1]);
      while (startDate <= endDate) {
        const formattedDate = startDate.format('YYYY-MM-DD');
        row.push(formattedDate);
        startDate.add(1, 'day');
      }
      this.linePieChartData.push(row);
    },

    getStackBarTime(){
      if(this.stackBarTime.length === 0){
        const today = moment();
        const sevenDaysAgo = moment().subtract(6, 'days');

        while (sevenDaysAgo <= today){
          this.stackBarTime.push(sevenDaysAgo.format('MM-DD'));
          sevenDaysAgo.add(1, 'day');
        }
      }


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

