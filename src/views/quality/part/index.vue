<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="零件名称" prop="partName">
        <el-input
          v-model="queryParams.partName"
          placeholder="请输入零件名称"
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
      <el-form-item label="检测结果" prop="detectResult">
        <el-select
          v-model="queryParams.detectResult"
          placeholder="请输入零件检测结果"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="dict in dict.type.quality_detect_result"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="缺陷类型" prop="defectTypeName">
        <el-select
          v-model="queryParams.defectTypeName"
          placeholder="请输入缺陷类型"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="dict in dict.type.detect_type_name"
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
          v-hasPermi="['quality:part:edit']"
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
          v-hasPermi="['quality:part:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['quality:part:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="partList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="60" align="center" />
      <el-table-column label="零件编号" align="center" key="partId" prop="partId" v-if="columns[0].visible" />
      <el-table-column label="零件名称" align="center" key="partName" prop="partName" v-if="columns[1].visible" :show-overflow-tooltip="true" />
      <el-table-column label="零件类型" align="center" key="partTypeName" prop="partTypeName" v-if="columns[2].visible" :show-overflow-tooltip="true" />
      <el-table-column label="零件是否合格" align="center" key="detectResult" v-if="columns[3].visible"  width="100" >
        <template slot-scope="scope">
          <el-switch
            active-color="#13ce66"
            inactive-color="#ff4949"
            v-model="scope.row.detectResult"
            active-value="合格"
            inactive-value="不合格"
            :disabled = "forbidden"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="零件缺陷" align="center" key="defectTypeName" prop="defectTypeName" v-if="columns[4].visible" />
      <el-table-column label="检测时间" align="center" prop="detectTime" v-if="columns[5].visible" width="150">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.detectTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope" v-if="scope.row.partIds !== 1">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['quality:part:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['quality:part:remove']"
          >删除</el-button>
          <el-dropdown size="mini" @command="(command) => handlePart(command, scope.row)" v-hasPermi="['quality:part:edit']">
            <el-button size="mini" type="text" icon="el-icon-d-arrow-right">更多</el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="viewImages" icon="el-icon-user"
                v-hasPermi="['quality:part:edit']">查看图片</el-dropdown-item>
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
            <el-form-item label="零件名称" prop="partName">
              <el-input v-model="form.partName" placeholder="请输入零件名称" maxlength="20" />
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
            <el-form-item label="零件是否合格">
              <el-radio-group v-model="form.detectResult">
                <el-radio
                  v-for="dict in dict.type.quality_detect_result"
                  :key="dict.value"
                  :label="dict.value"
                >{{dict.label}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-form-item label="零件结果">
            <el-checkbox-group v-model="form.defectTypeNames">
              <el-checkbox :label="normalDefectTypeName" :disabled=" isNormalCheched()" >{{ normalDefectTypeName }}</el-checkbox>
              <el-checkbox v-for="dict in dict.type.detect_type_name" :label="dict.label" :key="dict.value" :disabled= "isUnnormalCheched()">{{ dict.label }}</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="检测时间" prop="detectStartTime" >
              <el-date-picker
                v-model="form.detectTime"
                style="width: 240px"
                value-format="yyyy-MM-dd HH:mm:ss"
                type="datetime"
                placeholder="检测时间"
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
import { listRole, getRole, delRole, addRole, updateRole, changeRoleStatus } from "@/api/system/role";
import {changePartResult, listPart, updatePart, getPart, delPart} from "@/api/quality/part";
import {changeUserStatus} from "@/api/system/user";

export default {
  name: "part",
  dicts: ['quality_part_type', 'quality_detect_result', 'detect_type_name'],

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
      // 零件表格数据
      partList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,

      forbidden: true,

      // 日期范围
      dateRange: [],

      normalDefectTypeName: "正常",

      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        orderByColumn: "partId",
        isAsc:"desc",
        partName:undefined,
        partTypeName:undefined,
        detectResult:undefined,
        defectTypeName:undefined,
      },

      // 表单参数
      form: {
        defectTypeNames: [],
      },
      defaultProps: {
        children: "children",
        label: "label"
      },

      // 列信息
      columns: [
        { key: 0, label: `零件编号`, visible: true },
        { key: 1, label: `零件名称`, visible: true },
        { key: 2, label: `零件类型`, visible: true },
        { key: 3, label: `零件是否合格`, visible: true },
        { key: 4, label: `零件缺陷`, visible: true },
        { key: 5, label: `零件检测时间`, visible: true },
      ],


      // 表单校验
      rules: {
        partName: [
          { required: true, message: "零件名称不能为空", trigger: "blur" },
          { min: 2, max: 20, message: '零件名称长度必须介于 2 和 20 之间', trigger: 'blur' }
        ],
        partTypeName: [
          { required: true, message: "零件类型名称不能为空", trigger: "blur" },
          { min: 2, max: 20, message: '零件类型名称长度必须介于 2 和 20 之间', trigger: 'blur' }
        ],



      }
    };
  },
  created() {
    this.getList();
  },

  methods: {
    /** 查询零件列表 */
    getList() {
      this.loading = true;
      listPart(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.partList = response.rows;
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
        partIds: undefined,
        partName: undefined,
        partTypeName: undefined,
        detectResult:"合格",
        defectTypeNames: [],
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
      this.ids = selection.map(item => item.partId)
      this.single = selection.length!=1
      this.multiple = !selection.length
    },

    // 更多操作触发
    handlePart(command, row) {
      switch (command) {
        case "viewImages":
          this.viewImages(row);
          break;
        default:
          break;
      }
    },

    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加零件";
    },

    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const partId = row.partId || this.ids
      getPart(partId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改已检测批次信息";
      });
    },

    /** 分配用户操作 */
    viewImages: function(row) {
      const partId = row.partId;
      this.$router.push("/quality/part-image/image/" + partId);
    },

    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.partId != undefined) {
            this.form.qualifiedRate = (this.form.qualifiedQuantity / this.form.quantity).toFixed(6)
            console.log(this.form.detectResult)
            updatePart(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addRole(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },

    isNormalCheched()
    {
      if ( !this.form.defectTypeNames.includes(this.normalDefectTypeName) && this.form.defectTypeNames.length > 0)
      {
        return true
      }
      return false
    },

    isUnnormalCheched()
    {
      if (this.form.defectTypeNames.includes(this.normalDefectTypeName))
      {
        return true
      }
      return false
    },

    // 零件检测结果修改
    handleStatusChange(row) {
      let text = row.detectResult === "合格" ? "合格" : "不合格";
      this.$modal.confirm('确认要将零件"' + row.partName + '"修改为"' + text + '"吗？').then(function() {
        return changePartResult(row.partId, row.detectResult);
      }).then(() => {
        this.$modal.msgSuccess('修改成' +text + "成功");
      }).catch(function() {
        row.detectResult = row.detectResult === "合格" ? "不合格" : "合格";
      });
    },


    /** 删除按钮操作 */
    handleDelete(row) {
      const partIds = row.partId || this.ids;
      this.$modal.confirm('是否确认删零件编号为"' + partIds + '"的数据项？').then(function() {
        return delPart(partIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },

    /** 导出按钮操作 */
    handleExport() {
      this.download('/quality/part/export', {
        ...this.queryParams
      }, `part_${new Date().getTime()}.xlsx`)
    }
  },


};
</script>
