<template>
  <div class="app-container">
    <el-row :gutter="40">
      <el-col :span="24" :xs="24" >
        <div slot="header"><span><i class="el-icon-data-analysis"></i> 检测数据统计</span></div>
        <div>
          <div ref="lineChart" style=" height: 400px; background-color: #ffffff; padding: 20px; border-radius: 20px;"></div>
        </div>
      </el-col>

    </el-row>

    <div style="height: 30px;"></div> <!-- 添加间距 -->

    <el-row :gutter="40">
      <!--用户数据-->
      <el-col :span="24" :xs="24">
        <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
          <el-form-item label="零件名称" prop="userName">
            <el-input
              v-model="queryParams.userName"
              placeholder="请输入零件名称"
              clearable
              style="width: 240px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select
              v-model="queryParams.status"
              placeholder="用户状态"
              clearable
              style="width: 240px"
            >
              <el-option
                v-for="dict in dict.type.line_detect_type"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="创建时间">
            <el-date-picker
              v-model="dateRange"
              style="width: 240px"
              value-format="yyyy-MM-dd"
              type="daterange"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            ></el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
              type="primary"
              plain
              icon="el-icon-plus"
              size="mini"
              @click="handleAdd"
              v-hasPermi="['system:user:add']"
            >新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="success"
              plain
              icon="el-icon-edit"
              size="mini"
              :disabled="single"
              @click="handleUpdate"
              v-hasPermi="['system:user:edit']"
            >修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="danger"
              plain
              icon="el-icon-delete"
              size="mini"
              :disabled="multiple"
              @click="handleDelete"
              v-hasPermi="['system:user:remove']"
            >删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="info"
              plain
              icon="el-icon-upload2"
              size="mini"
              @click="handleImport"
              v-hasPermi="['system:user:import']"
            >导入</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="warning"
              plain
              icon="el-icon-download"
              size="mini"
              @click="handleExport"
              v-hasPermi="['system:user:export']"
            >导出</el-button>
          </el-col>
          <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="equipmentStatusList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="设备状态编号" align="center" key="devStatusId" prop="devStatusId" v-if="columns[0].visible" />
          <el-table-column label="设备名称" align="center" key="devName" prop="devName" v-if="columns[1].visible"  />
          <el-table-column label="状态名称" align="center" key="statusName" prop="statusName" v-if="columns[2].visible"  />
          <el-table-column label="开始时间" align="center" key="startTime" prop="startTime" v-if="columns[3].visible" width="200" />
          <el-table-column label="结束时间" align="center" key="endTime" prop="endTime" v-if="columns[4].visible" width="200"/>

          <el-table-column label="创建时间" align="center" prop="createTime" v-if="columns[5].visible" width="200">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            align="center"
            width="200"
            class-name="small-padding fixed-width"
          >
            <template slot-scope="scope" v-if="scope.row.userId !== 1">
              <el-button
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleUpdate(scope.row)"
                v-hasPermi="['system:user:edit']"
              >修改</el-button>
              <el-button
                size="mini"
                type="text"
                icon="el-icon-delete"
                @click="handleDelete(scope.row)"
                v-hasPermi="['system:user:remove']"
              >删除</el-button>
              <el-dropdown size="mini" @command="(command) => handleCommand(command, scope.row)" v-hasPermi="['system:user:resetPwd', 'system:user:edit']">
                <el-button size="mini" type="text" icon="el-icon-d-arrow-right">更多</el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="handleResetPwd" icon="el-icon-key"
                                    v-hasPermi="['system:user:resetPwd']">重置密码</el-dropdown-item>
                  <el-dropdown-item command="handleAuthRole" icon="el-icon-circle-check"
                                    v-hasPermi="['system:user:edit']">分配角色</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>

        <pagination
          v-show="total>0"
          :total="total"
          :page.sync="queryParams.pageNum"
          :limit.sync="queryParams.pageSize"
          @pagination="getList"
        />
      </el-col>
    </el-row>

  </div>
</template>

<script>
import { listUser, getUser, delUser, addUser, updateUser, resetUserPwd, changeUserStatus } from "@/api/system/user";
import { getToken } from "@/utils/auth";
import * as echarts from "echarts";
import {getEquipmentStatus} from "@/api/system/dashboard";

export default {
  name: "User",
  dicts: ['sys_normal_disable'],

  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 用户表格数据
      userList: null,
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 默认密码
      initPassword: undefined,
      // 日期范围
      dateRange: [],
      // 角色选项
      roleOptions: [],
      // 表单参数
      form: {},
      defaultProps: {
        children: "children",
        label: "label"
      },
      // 用户导入参数
      upload: {
        // 是否显示弹出层（用户导入）
        open: false,
        // 弹出层标题（用户导入）
        title: "",
        // 是否禁用上传
        isUploading: false,
        // 是否更新已经存在的用户数据
        updateSupport: 0,
        // 设置上传的请求头部
        headers: { Authorization: "Bearer " + getToken() },
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + "/system/user/importData"
      },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userName: undefined,
        phonenumber: undefined,
        status: undefined,
      },
      // 列信息
      columns: [
        { key: 0, label: `设备状态编号`, visible: true },
        { key: 1, label: `设备名称`, visible: true },
        { key: 2, label: `状态名称`, visible: true },
        { key: 3, label: `开始时间`, visible: true },
        { key: 4, label: `结束时间`, visible: true },
        { key: 5, label: `创建时间`, visible: true }
      ],
      // 表单校验
      rules: {
        userName: [
          { required: true, message: "用户名称不能为空", trigger: "blur" },
          { min: 2, max: 20, message: '用户名称长度必须介于 2 和 20 之间', trigger: 'blur' }
        ],
        nickName: [
          { required: true, message: "用户昵称不能为空", trigger: "blur" }
        ],
        password: [
          { required: true, message: "用户密码不能为空", trigger: "blur" },
          { min: 5, max: 20, message: '用户密码长度必须介于 5 和 20 之间', trigger: 'blur' }
        ],
        email: [
          {
            type: "email",
            message: "请输入正确的邮箱地址",
            trigger: ["blur", "change"]
          }
        ],
        phonenumber: [
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: "请输入正确的手机号码",
            trigger: "blur"
          }
        ],

        equipmentStatusList:null,


      }
    };
  },

  mounted() {
    this.lineChart = echarts.init(this.$refs.lineChart)
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
    })
  },

  created() {
    this.getList();
    this.getEquipmentStatusList()
    this.getConfigKey("sys.user.initPassword").then(response => {
      this.initPassword = response.msg;
    });
  },
  methods: {
    goTarget(href) {
      window.open(href, "_blank");
    },

    getEquipmentStatusList(){
      this.loading = true;
      getEquipmentStatus(this.addDateRange(this.queryParams, this.dateRange)).then(response =>{
          this.equipmentStatusList = response.rows;
          this.total = response.total;
          this.loading = false;
        }
      );
    },

    /** 查询用户列表 */
    getList() {
      this.loading = true;
      listUser(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
          this.userList = response.rows;
          this.total = response.total;
          this.loading = false;
        }
      );
      console.log(this.dict)
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      // this.queryParams.deptId = undefined;
      this.$refs.tree.setCurrentKey(null);
      this.handleQuery();
    },

  }
};
</script>

<style scoped lang="scss">

.card-box-content{
  font-size: 30px;
  font-weight: bold;
  font-weight: bold;
  text-align: center;
}
</style>

