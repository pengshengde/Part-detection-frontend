<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="AppId" prop="appId">
        <el-input
          v-model="queryParams.appId"
          placeholder="请输入软件Id"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="设备名称" prop="devName">
        <el-input
          v-model="queryParams.devName"
          placeholder="请输入设备名称"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="软件地址" prop="ipadrr">
        <el-input
          v-model="queryParams.ipaddr"
          placeholder="请输入软件地址"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="签名截止时间">
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
          v-hasPermi="['quality:defect:add']"
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
          v-hasPermi="['quality:defect:edit']"
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
          v-hasPermi="['quality:defect:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['quality:defect:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="signList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column label="签名编号" prop="signId" width="100" key="signId" v-if="columns[0].visible" />
      <el-table-column label="AppId" align="center" prop="appId"  key="appId" :show-overflow-tooltip="true"  v-if="columns[1].visible" />
      <el-table-column label="设备名称" align="center" prop="devName" key="devName" :show-overflow-tooltip="true"  v-if="columns[2].visible"/>
      <el-table-column label="签名信息" align="center" prop="sign" key="sign" :show-overflow-tooltip="true"  v-if="columns[3].visible" />
      <el-table-column label="签名使用次数" align="center" key="signUsageCount" prop="signUsageCount" width="100" v-if="columns[4].visible" />
      <el-table-column label="签名到期时间" align="center" prop="signExpireTime" key="signExpireTime" :show-overflow-tooltip="true" width="200"  v-if="columns[5].visible">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.signExpireTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="设备IP" align="center" prop="ipaddr"   key="ipaddr"  v-if="columns[6].visible" />
      <el-table-column label="登陆地点" align="center" prop="loginLocation"   key="loginLocation"  v-if="columns[7].visible" />
      <el-table-column label="创建时间" align="center" prop="createTime" v-if="columns[8].visible" width="200">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope" v-if="scope.row.signId !== 1">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['quality:defect:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['quality:defect:remove']"
          >删除</el-button>
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

    <!-- 添加或修改角色配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item prop="appId">
          <span slot="label">
            <el-tooltip content="应用的唯一标识" placement="top">
              <i class="el-icon-question"></i>
            </el-tooltip>
            AppId
          </span>
          <el-input v-model="form.appId" placeholder="请输入AppId" />
        </el-form-item>

        <el-form-item prop="devName">
          <span slot="label">
            <el-tooltip content="指定软件使用设备的名称" placement="top">
              <i class="el-icon-question"></i>
            </el-tooltip>
            设备名称
          </span>
          <el-input v-model="form.devName" placeholder="请输入设备名称" />
        </el-form-item>

        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import {addAppId, delAppId, getSign, listSign, updateAppId} from "@/api/quality/sign";

export default {
  name: "DefectType",
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
      // 角色表格数据
      signList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否显示弹出层（数据权限）
      menuExpand: false,
      menuNodeAll: false,
      // 日期范围
      dateRange: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        appId: undefined,
        devName: undefined,
        ipaddr:undefined,
      },
      // 表单参数
      form: {},

      defaultProps: {
        children: "children",
        label: "label"
      },

      // 列信息
      columns: [
        { key: 0, label: `签名编号`, visible: true },
        { key: 1, label: `AppId`, visible: true },
        { key: 2, label: `设备名称`, visible: true },
        { key: 3, label: `签名信息`, visible: false },
        { key: 4, label: `签名使用次数`, visible: true },
        { key: 5, label: `签名到期时间`, visible: true },
        { key: 6, label: `设备IP`, visible: true },
        { key: 7, label: `登录地点`, visible: true },
        { key: 8, label: `创建时间`, visible: true }
      ],

      // 表单校验
      rules: {
        appId: [
          { required: true, message: "AppId不能为空", trigger: "blur" }
        ],
        devName: [
          { required: false, message: "缺陷描述不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询角色列表 */
    getList() {
      this.loading = true;
      listSign(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
          this.signList = response.rows;
          console.log(this.signList)
          this.total = response.total;
          this.loading = false;
        }
      );
    },

    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },

    // 表单重置
    reset() {
      this.form = {
        signId: undefined,
        appId: undefined,
        devName: undefined,
        remark: undefined
      };
      this.resetForm("form");
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
      this.handleQuery();
    },

    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.signId)
      this.single = selection.length!=1
      this.multiple = !selection.length
    },

    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加缺陷类型";
    },


    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const signIds = row.signId || this.ids
      getSign(signIds).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改签名信息";
      });
    },

    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.signId != undefined) {
            updateAppId(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addAppId(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },

    /** 删除按钮操作 */
    handleDelete(row) {
      const signIds = row.signId || this.ids;
      this.$modal.confirm('是否确认删除角色编号为"' + signIds + '"的数据项？').then(function() {
        return delAppId(signIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },


    /** 导出按钮操作 */
    handleExport() {
      this.download('/quality/sign/export', {
        ...this.queryParams
      }, `defect_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
