<template>
  <div class="app-container">
     <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="图片名称" prop="imageName">
        <el-input
          v-model="queryParams.imageName"
          placeholder="请输入图片名称"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
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
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="openSelectImage"
          v-hasPermi="['quality:part:add']"
        >添加图片</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-circle-close"
          size="mini"
          :disabled="multiple"
          @click="cancelAuthPartAll"
          v-hasPermi="['quality:part:remove']"
        >批量取消图片</el-button>
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

    <el-table v-loading="loading" :data="imageList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="图片名称" prop="imageName" :show-overflow-tooltip="true" />
      <el-table-column label="图片类型" prop="imageType" :show-overflow-tooltip="true" />
      <el-table-column label="检测结果" prop="defectTypeName" :show-overflow-tooltip="true" />
      <el-table-column label="原图" prop="originalImageUrl" :show-overflow-tooltip="true" />
      <el-table-column label="检测后图片" prop="resultImageUrl" :show-overflow-tooltip="true" />
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
            icon="el-icon-picture-outline"
            @click="handleShowImage(scope.row)"
            v-hasPermi="['quality:part:query']"
          >图片展示</el-button>
          <el-button
              size="mini"
              type="text"
              icon="el-icon-circle-close"
              @click="cancelAuthImage(scope.row)"
              v-hasPermi="['quality:part:remove']"
          >取消图片</el-button>
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
    <select-image ref="select" :partId="queryParams.partId" @ok="handleQuery" />


    <el-dialog :title="title" :visible.sync="open" width="900px" append-to-body>
      <el-form ref="form"  :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-image
              :src = "form.originalImageUrl"
              :preview-src-list="[form.originalImageUrl]"
            >
            </el-image>
          </el-col>
          <el-col :span="12">
            <el-image
              :src = "form.resultImageUrl"
              :preview-src-list="[form.resultImageUrl]"
            >
            </el-image>
          </el-col>
        </el-row>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import selectImage from "./selectImage.vue";
import showPart from "./showImage.vue";
import {allocatedImageList, authImageCancel, authImageCancelAll, getImage} from "@/api/quality/part";

export default {
  name: "ViewImage",
  dicts: ['quality_part_type', 'detect_type_name'],
  components: { selectImage },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中用户组
      imageIds: [],
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 用户表格数据
      imageList: [],
      // 日期范围
      dateRange: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        partId: undefined,
        imageName: undefined,
        partTypeName: undefined,
        defectTypeName: undefined
      },

      // 表单参数
      form: {},
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
    };
  },
  created() {
    const partId = this.$route.params && this.$route.params.partId;
    console.log(partId)
    if (partId) {
      this.queryParams.partId = partId;
      this.getList();
    }
  },
  methods: {
    /** 查询授权图片列表 */
    getList() {
      this.loading = true;
      allocatedImageList(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
          this.imageList = response.rows;
          this.total = response.total;
          this.loading = false;
        }
      );
    },

    // 表单重置
    reset() {
      this.form = {
        imageId : undefined,
        imageName : undefined,
        imageType : undefined,
        partTypeName : undefined,
        originalImageUrl : undefined,
        resultImageUrl : undefined
      };
      this.resetForm("form");
    },

    handleShowImage(row){
      this.reset();
      const imageId = row.imageId
      getImage(imageId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "查看图片";
      });

    },

    // 返回按钮
    handleClose() {
      const obj = { path: "/quality/part" };
      this.$tab.closeOpenPage(obj);
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
      this.imageIds = selection.map(item => item.imageId)
      this.multiple = !selection.length
    },
    /** 打开授权用户表弹窗 */
    openSelectImage() {
      this.$refs.select.show();
    },


    /** 取消授权按钮操作 */
    cancelAuthImage(row) {
      const partId = this.queryParams.partId;
      this.$modal.confirm('确认要取消该"' + row.imageName + '"图片吗？').then(function() {
        return authImageCancel({ imageId: row.imageId, partId: partId });
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("取消授权成功");
      }).catch(() => {});
    },

    /** 批量取消授权按钮操作 */
    cancelAuthPartAll(row) {
      const partId = this.queryParams.partId;
      const imageIds = this.imageIds.join(",");
      this.$modal.confirm('是否取消选中的图片？').then(function() {
        return authImageCancelAll({ partId: partId, imageIds: imageIds });
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("取消授权成功");
      }).catch(() => {});
    },

    /** 导出按钮操作 */
    handleExport() {

      this.download('/quality/part/authImage/export', {
        ...this.queryParams
      }, `part-image_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
