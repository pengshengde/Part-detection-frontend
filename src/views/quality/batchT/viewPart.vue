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

      <el-form-item label="是否合格" prop="detectResult">
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
          @click="openSelectPart"
          v-hasPermi="['quality:batchT:add']"
        >添加零件</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-circle-close"
          size="mini"
          :disabled="multiple"
          @click="cancelAuthPartAll"
          v-hasPermi="['quality:batchT:remove']"
        >批量取消零件</el-button>
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
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-close"
          size="mini"
          @click="handleClose"
        >关闭</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="partList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="零件名称" prop="partName" :show-overflow-tooltip="true" />
      <el-table-column label="零件类型" prop="partTypeName" :show-overflow-tooltip="true" />
      <el-table-column label="是否合格" prop="detectResult" :show-overflow-tooltip="true" />
      <el-table-column label="检测时间" align="center" prop="detectTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.detectTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-circle-close"
            @click="cancelAuthPart(scope.row)"
            v-hasPermi="['quality:batchT:remove']"
          >取消零件</el-button>
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
    <select-part ref="select" :batchId="queryParams.batchId" @ok="handleQuery" />
  </div>
</template>

<script>
import selectPart from "./selectPart.vue";
import { allocatedPartList, authPartCancelAll, authPartCancel } from "@/api/quality/batchT";

export default {
  name: "ViewPart",
  dicts: ['quality_part_type', 'quality_detect_result'],
  components: { selectPart },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中用户组
      partIds: [],
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 用户表格数据
      partList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        batchId: undefined,
        partName: undefined,
        partTypeName: undefined,
        detectResult: undefined,
      }
    };
  },
  created() {
    const batchId = this.$route.params && this.$route.params.batchId;
    console.log(batchId)
    if (batchId) {
      this.queryParams.batchId = batchId;
      this.getList();
    }
  },
  methods: {
    /** 查询授权用户列表 */
    getList() {
      this.loading = true;
      allocatedPartList(this.queryParams).then(response => {
          this.partList = response.rows;
          this.total = response.total;
          this.loading = false;
        }
      );
    },
    // 返回按钮
    handleClose() {
      const obj = { path: "/quality/batchT" };
      this.$tab.closeOpenPage(obj);
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.partIds = selection.map(item => item.partId)
      this.multiple = !selection.length
    },
    /** 打开授权用户表弹窗 */
    openSelectPart() {
      this.$refs.select.show();
    },
    /** 取消授权按钮操作 */
    cancelAuthPart(row) {
      const batchId = this.queryParams.batchId;
      this.$modal.confirm('确认要取消该"' + row.partName + '"零件吗？').then(function() {
        return authPartCancel({ partId: row.partId, batchId: batchId });
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("取消授权成功");
      }).catch(() => {});
    },
    /** 批量取消授权按钮操作 */
    cancelAuthPartAll(row) {
      const batchId = this.queryParams.batchId;
      const partIds = this.partIds.join(",");
      this.$modal.confirm('是否取消选中的零件？').then(function() {
        return authPartCancelAll({ batchId: batchId, partIds: partIds });
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("取消授权成功");
      }).catch(() => {});
    },

    /** 导出按钮操作 */
    handleExport() {

      this.download('/quality/batchT/authPart/export', {
        ...this.queryParams
      }, `batch-part_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
