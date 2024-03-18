<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
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
      <el-form-item label="合格率" prop="qualifiedRate">
        <el-input-number
          v-model="queryParams.qualifiedRate"
          clearable
          :precision="2" :step="0.1" :min="0" :max="1"
          style="width: 120px"
          @keyup.enter.native="handleQuery"/>
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
      <el-form-item label="检测时间">
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
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['quality:batchT:edit']"
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
          v-hasPermi="['quality:batchT:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['quality:batchT:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="batchTList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="零件批次编号" align="center" key="batchId" prop="batchId" v-if="columns[0].visible" />
      <el-table-column label="零件批次名称" align="center" key="batchName" prop="batchName" v-if="columns[1].visible" :show-overflow-tooltip="true" />
      <el-table-column label="零件类型" align="center" key="partTypeName" prop="partTypeName" v-if="columns[2].visible" :show-overflow-tooltip="true" />
      <el-table-column label="零件数量" align="center" key="quantity" prop="quantity" v-if="columns[3].visible"  />
      <el-table-column label="生产产线" align="center" key="productionLine" prop="productionLine" v-if="columns[4].visible" width="120" />
      <el-table-column label="生产设备" align="center" key="devName" prop="devName" v-if="columns[5].visible" width="120" />
      <el-table-column label="合格数量" align="center" key="qualifiedQuantity" prop="qualifiedQuantity" v-if="columns[6].visible"  />
      <el-table-column label="不合格数量" align="center" key="unqualifiedQuantity" prop="unqualifiedQuantity" v-if="columns[7].visible" />
      <el-table-column label="合格率" align="center" key="qualifiedRate" prop="qualifiedRate" v-if="columns[8].visible" width="100" />
      <el-table-column label="检测开始时间" align="center" prop="detectStartTime" v-if="columns[9].visible" width="150">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.detectStartTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="检测结束时间" align="center" prop="detectEndTime" v-if="columns[10].visible" width="150">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.detectEndTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope" v-if="scope.row.batchId !== 1">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['quality:batchT:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['quality:batchT:remove']"
          >删除</el-button>
          <el-dropdown size="mini" @command="(command) => handlePart(command, scope.row)" v-hasPermi="['quality:batchT:edit']">
            <el-button size="mini" type="text" icon="el-icon-d-arrow-right">更多</el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="viewParts" icon="el-icon-user"
                v-hasPermi="['quality:batchT:edit']">查看零件</el-dropdown-item>
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

    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
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
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="零件数量" prop="quantity">
              <el-input v-model="form.quantity" placeholder="请输入批次零件数量" maxlength="15" />
            </el-form-item>
          </el-col>
<!--          <el-col :span="12">
            <el-form-item label="合格数量" prop="qualifiedQuantity">
              <el-input v-model="form.qualifiedQuantity" placeholder="请输入批次零件合格数量" maxlength="15" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="不合格数量" prop="unqualifiedQuantity">
              <el-input v-model="form.unqualifiedQuantity" placeholder="请输入批次零件不合格数量" maxlength="15" />
            </el-form-item>
          </el-col>-->
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
            <el-form-item label="检测开始时间" prop="detectStartTime" >
              <el-date-picker
                v-model="form.detectStartTime"
                style="width: 240px"
                value-format="yyyy-MM-dd HH:mm:ss"
                type="datetime"
                placeholder="检测开始时间"
              ></el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="检测结束时间" prop="detectEndTime" >
              <el-date-picker
                v-model="form.detectEndTime"
                style="width: 240px"
                value-format="yyyy-MM-dd HH:mm:ss"
                type="datetime"
                placeholder="检测结束时间"
              ></el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark" >
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
import { listBatchT, updateBatchT, getBatchT, delBatchT} from "@/api/quality/batchT";

export default {
  name: "batchT",
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
      // 角色表格数据
      batchTList: [],
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
        batchName:undefined,
        partTypeName:undefined,
        quantity:undefined,
        qualifiedRate: 0,
      },

      // 表单参数
      form: {},
      defaultProps: {
        children: "children",
        label: "label"
      },

      // 列信息
      columns: [
        { key: 0, label: `零件批次编号`, visible: true },
        { key: 1, label: `零件批次名称`, visible: true },
        { key: 2, label: `零件类型`, visible: true },
        { key: 3, label: `零件数量`, visible: true },
        { key: 4, label: `零件生产产线`, visible: false },
        { key: 5, label: `零件生产设备`, visible: false },
        { key: 6, label: `零件合格数量`, visible: true },
        { key: 7, label: `零件不合格数量`, visible: true },
        { key: 8, label: `零件合格率`, visible: true },
        { key: 9, label: `检测开始时间`, visible: true },
        { key: 10, label: `检测结束时间`, visible: true }
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
        qualifiedQuantity: [
          { required: true, message: "合格零件数量不能为空", trigger: "blur" },
        ],
        unqualifiedQuantity: [
          { required: true, message: "不合格零件数量不能为空", trigger: "blur" },
        ],
      }
    };
  },
  created() {
    this.getList();
  },

  methods: {
    /** 查询零件批次列表 */
    getList() {
      this.loading = true;
      listBatchT(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.batchTList = response.rows;
        this.total = response.rows.length;
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
        batchId: undefined,
        batchName: undefined,
        partTypeName: undefined,
        quantity: undefined,
        qualifiedQuantity: undefined,
        unqualifiedQuantity: undefined,
        qualifiedRate: undefined,
        detectStartTime:undefined,
        detectEndTime:undefined,
        remark: undefined,
        type:[]
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
      this.ids = selection.map(item => item.batchId)
      this.single = selection.length!=1
      this.multiple = !selection.length
    },

    // 更多操作触发
    handlePart(command, row) {
      switch (command) {
        case "viewParts":
          this.viewParts(row);
          break;
        default:
          break;
      }
    },

    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加角色";
    },

    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const batchId = row.batchId || this.ids
      getBatchT(batchId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改角已检测批次信息";
      });
    },

    /** 分配零件操作 */
    viewParts: function(row) {
      const batchId = row.batchId;
      this.$router.push("/quality/batch-part/part/" + batchId);
    },

    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.batchId != undefined) {
            this.form.qualifiedRate = (this.form.qualifiedQuantity / this.form.quantity).toFixed(6)
            updateBatchT(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            console.log(this.form)
            /*addRole(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });*/
          }
        }
      });
    },

    /** 删除按钮操作 */
    handleDelete(row) {
      const batchIds = row.batchId || this.ids;
      this.$modal.confirm('是否确认删除角色编号为"' + batchIds + '"的数据项？').then(function() {
        return delBatchT(batchIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },

    /** 导出按钮操作 */
    handleExport() {
      this.download('/quality/batchT/export', {
        ...this.queryParams
      }, `batchT_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
