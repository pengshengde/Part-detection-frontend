<template>
  <!-- 授权零件 -->
  <el-dialog title="选择零件" :visible.sync="visible" width="800px" top="5vh" append-to-body>
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true">
      <el-form-item label="零件名称" prop="partName">
        <el-input
          v-model="queryParams.partName"
          placeholder="请输入零件名称"
          clearable
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
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row>
      <el-table @row-click="clickRow" ref="table" :data="partList" @selection-change="handleSelectionChange" height="260px">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column label="零件名称" prop="partName" :show-overflow-tooltip="true" />
        <el-table-column label="零件类型" prop="partTypeName" :show-overflow-tooltip="true" />
        <el-table-column label="是否合格" prop="detectResult" :show-overflow-tooltip="true" />
        <el-table-column label="检测时间" align="center" prop="detectTime" width="180">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.detectTime) }}</span>
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
    </el-row>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="handleSelectPart">确 定</el-button>
      <el-button @click="visible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { unallocatedUserList, authUserSelectAll } from "@/api/system/role";
import {unallocatedPartList, authPartSelectAll} from "@/api/quality/batchT"
export default {
  dicts: ['quality_part_type'],
  props: {
    // 零件批次
    batchId: {
      type: [Number, String]
    }
  },
  data() {
    return {
      // 遮罩层
      visible: false,
      // 选中数组值
      partIds: [],
      // 总条数
      total: 0,
      // 不属于零件批次的零件
      partList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        batchId: undefined,
        partName: undefined,
        partTypeName: undefined,
        detectResult: undefined,
        detectTime: undefined,
      }
    };
  },

  methods: {
    // 显示弹框
    show() {
      this.queryParams.batchId = this.batchId;
      this.getList();
      this.visible = true;
    },

    clickRow(row) {
      this.$refs.table.toggleRowSelection(row);
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.partIds = selection.map(item => item.partId);
    },
    // 查询表数据
    getList() {
      unallocatedPartList(this.queryParams).then(res => {
        this.partList = res.rows;
        this.total = res.total;
      });
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
    /** 选择授权零件操作 */
    handleSelectPart() {
      const batchId = this.queryParams.batchId;
      const partIds = this.partIds.join(",");
      if (partIds == "") {
        this.$modal.msgError("请选择要分配的用户");
        return;
      }
      authPartSelectAll({ batchId: batchId, partIds: partIds }).then(res => {
        this.$modal.msgSuccess(res.msg);
        if (res.code === 200) {
          this.visible = false;
          this.$emit("ok");
        }
      });
    }
  }
};
</script>
