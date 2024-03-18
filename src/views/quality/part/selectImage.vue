<template>
  <!-- 授权用户 -->
  <el-dialog title="选择图片" :visible.sync="visible" width="900px" top="5vh" append-to-body>
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true">
      <el-form-item label="图片名称" prop="imageName">
        <el-input
          v-model="queryParams.imageName"
          placeholder="请输入图片名称"
          style="width: 200px"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="零件类型" prop="partTypeName">
        <el-select
          v-model="queryParams.partTypeName"
          placeholder="请输入零件类型"
          clearable
          style="width: 200px"
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
          style="width: 200px"
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
    <el-row>
      <el-table @row-click="clickRow" ref="table" :data="imageList" @selection-change="handleSelectionChange" height="260px">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column label="零件名称" prop="imageName" :show-overflow-tooltip="true" />
        <el-table-column label="零件类型" prop="partTypeName" :show-overflow-tooltip="true" />
        <el-table-column label="检测结果" prop="defectTypeName" :show-overflow-tooltip="true" />
        <el-table-column label="检测时间" align="center" prop="detectTime">
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

import {authImageSelectAll, unallocatedImageList} from "@/api/quality/part";
export default {
  dicts: ['quality_part_type'],
  props: {
    // 零件批次
    partId: {
      type: [Number, String]
    }
  },
  data() {
    return {
      // 遮罩层
      visible: false,
      // 选中数组值
      imageIds: [],
      // 总条数
      total: 0,
      // 不属于零件批次的零件
      imageList: [],
      // 时间范围
      dateRange: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        partId: undefined,
        imageName: undefined,
        partTypeName: undefined,
        detectResult: undefined,
        detectTime: undefined,
      }
    };
  },

  methods: {
    // 显示弹框
    show() {
      this.queryParams.partId = this.partId;
      this.getList();
      this.visible = true;
    },

    clickRow(row) {
      this.$refs.table.toggleRowSelection(row);
    },

    // 多选框选中数据
    handleSelectionChange(selection) {
      this.imageIds = selection.map(item => item.imageId);
    },

    // 查询表数据
    getList() {
      unallocatedImageList(this.addDateRange(this.queryParams, this.dateRange)).then(res => {
        this.imageList = res.rows;
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
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 选择授权用户操作 */
    handleSelectPart() {
      const partId = this.queryParams.partId;
      const imageIds = this.imageIds.join(",");
      if (imageIds == "") {
        this.$modal.msgError("请选择要分配的图片");
        return;
      }
      authImageSelectAll({ partId: partId, imageIds: imageIds }).then(res => {
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
