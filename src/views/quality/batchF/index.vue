<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!--用户数据-->
      <el-col :span="24" :xs="24">
        <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
          <el-form-item label="批次名称" prop="batchName">
            <el-input
              v-model="queryParams.batchName"
              placeholder="请输入零件批次名称"
              clearable
              style="width: 240px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="数量" prop="quantity">
            <el-input
              v-model="queryParams.quantity"
              placeholder="请输入零件数量"
              clearable
              style="width: 240px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="零件类型" prop="partTypeName">
            <el-select
              v-model="queryParams.partTypeName"
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
          <el-form-item label="生产产线" prop="productionLine">
            <el-input
              v-model="queryParams.productionLine"
              placeholder="请输入零件生产产线"
              clearable
              style="width: 240px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="生产设备" prop="devName">
            <el-input
              v-model="queryParams.devName"
              placeholder="请输入零件生产设备"
              clearable
              style="width: 240px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="预计检测时间" label-width="98px" >
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
              v-hasPermi="['quality:batchF:add']"
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
              v-hasPermi="['quality:batchF:edit']"
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
              v-hasPermi="['quality:batchF:remove']"
            >删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="warning"
              plain
              icon="el-icon-download"
              size="mini"
              @click="handleExport"
              v-hasPermi="['quality:batchF:export']"
            >导出</el-button>
          </el-col>
          <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="UnDetectBatchList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="零件批次编号" align="center" key="batchId" prop="batchId" v-if="columns[0].visible" />
          <el-table-column label="零件批次名称" align="center" key="batchName" prop="batchName" v-if="columns[1].visible" :show-overflow-tooltip="true" />
          <el-table-column label="零件类型" align="center" key="partTypeName" prop="partTypeName" v-if="columns[2].visible" :show-overflow-tooltip="true" />
          <el-table-column label="零件数量" align="center" key="quantity" prop="quantity" v-if="columns[3].visible" width="60" />
          <el-table-column label="零件生产产线" align="center" key="productionLine" prop="productionLine" v-if="columns[4].visible" width="120" />
          <el-table-column label="零件生产设备" align="center" key="devName" prop="devName" v-if="columns[5].visible" width="120" />
          <el-table-column label="预计检测开始时间" align="center" prop="expectedStartTime" v-if="columns[6].visible" width="150">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.expectedStartTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="预计检测结束时间" align="center" prop="expectedEndTime" v-if="columns[7].visible" width="150">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.expectedEndTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            align="center"
            width="200"
            class-name="small-padding fixed-width"
          >
            <template slot-scope="scope" v-if="scope.row.batchId !== 0 ">
              <el-button
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleUpdate(scope.row)"
                v-hasPermi="['quality:batchF:edit']"
              >修改</el-button>
              <el-button
                size="mini"
                type="text"
                icon="el-icon-delete"
                @click="handleDelete(scope.row)"
                v-hasPermi="['quality:batchF:remove']"
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
      </el-col>
    </el-row>

    <!-- 添加或修改用户配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="批次名称" prop="batchName">
              <el-input v-model="form.batchName" placeholder="请输入零件批次名称" maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="零件类型" prop="partTypeName">
              <el-input v-model="form.partTypeName" placeholder="请输入批次零件类型" maxlength="15" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="零件数量" prop="quantity">
              <el-input v-model="form.quantity" placeholder="请输入批次零件数量" maxlength="15" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="生产产线" prop="productionLine">
              <el-input v-model="form.productionLine" placeholder="请输入零件生产产线" maxlength="11" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="生产设备" prop="devName">
              <el-input v-model="form.devName" placeholder="请输入生产设备" maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="预计检测开始时间" prop="expectedStartTime"  label-width="140px">
              <el-date-picker
                v-model="form.expectedStartTime"
                style="width: 240px"
                value-format="yyyy-MM-dd HH:mm:ss"
                type="datetime"
                placeholder="选择预计检测开始时间"
              ></el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="预计检测结束时间" prop="expectedEndTime" label-width="140px">
              <el-date-picker
                v-model="form.expectedEndTime"
                style="width: 240px"
                value-format="yyyy-MM-dd HH:mm:ss"
                type="datetime"
                placeholder="选择预计检测结束时间"
              ></el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark" label-width="80px">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { getToken } from "@/utils/auth";
import { listBatchF, getBatchF , updateBatchF, delBatchF, addBatchF} from "@/api/quality/batchF";


export default {
  name: "batchF",
  dicts: ['quality_part_type'],

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
      UnDetectBatchList: null,
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 默认密码
      initPassword: undefined,
      // 开始日期范围
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
        batchName:undefined,
        partTypeName:undefined,
        quantity:undefined,
        productionLine:undefined,
        devName:undefined,
      },
      // 列信息
      columns: [
        { key: 0, label: `零件批次编号`, visible: true },
        { key: 1, label: `零件批次名称`, visible: true },
        { key: 2, label: `零件类型`, visible: true },
        { key: 3, label: `零件数量`, visible: true },
        { key: 4, label: `零件生产产线`, visible: true },
        { key: 5, label: `零件生产设备`, visible: true },
        { key: 6, label: `预计检测开始时间`, visible: true },
        { key: 7, label: `预计检测结束时间`, visible: true }
      ],

      // 表单校验
      rules: {
        batchName: [
          { required: true, message: "零件名称不能为空", trigger: "blur" },
          { min: 2, max: 20, message: '零件名称长度必须介于 2 和 20 之间', trigger: 'blur' }
        ],
        partTypeName: [
          { required: true, message: "零件类型名称不能为空", trigger: "blur" },
          { min: 2, max: 20, message: '零件类型名称长度必须介于 2 和 20 之间', trigger: 'blur' }
        ],
        quantity: [
          { required: true, message: "零件数量不能为空", trigger: "blur" },
        ],
      }
    };
  },
  watch: {
  },
  created() {
    this.getList();
    this.fn()
    this.getConfigKey("sys.user.initPassword").then(response => {
      this.initPassword = response.msg;
    });
  },
  methods: {
    /** 查询用户列表 */
    getList() {
      this.loading = true;
      listBatchF(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
          this.UnDetectBatchList = response.rows;
          this.total = response.rows.length;
          this.loading = false;
          console.log(this.total)
          console.log(this.UnDetectBatchList)
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
        batchId: undefined,
        // deptId: undefined,
        batchName: undefined,
        partTypeName: undefined,
        quantity: undefined,
        productionLine: undefined,
        devName:undefined,
        expectedStartTime:undefined,
        expectedEndTime:undefined,
        status: "0",
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
      this.ids = selection.map(item => item.batchId);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
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
      const batchId = row.batchId || this.ids;
      getBatchF(batchId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改批次信息";
      });
    },


    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.batchId != undefined) {
            updateBatchF(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addBatchF(this.form).then(response => {
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
      const batchIds = row.batchId || this.ids;
      this.$modal.confirm('是否确认删除用户编号为"' + batchIds + '"的数据项？').then(function() {
        return delBatchF(batchIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },


    /** 导出按钮操作 */
    handleExport() {
      this.download('/quality/batchF/export', {
        ...this.queryParams
      }, `batchF_${new Date().getTime()}.xlsx`)
    },

  }
};
</script>
