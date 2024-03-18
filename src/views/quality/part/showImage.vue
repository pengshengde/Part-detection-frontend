<template>
  <!-- 查看图片 -->
  <el-dialog title="查看图片" :visible.sync="visible" width="1000px" top="5vh" append-to-body>
    <el-row>
      <el-col :span="12">
        <el-image
          :src = "this.form.originalImageUrl"
          :preview-src-list="[this.form.originalImageUrl]"
        >
        </el-image>
      </el-col>
      <el-col :span="12">
        <el-image
          :src = "this.form.resultImageUrl"
          :preview-src-list="[this.form.resultImageUrl]"
        >
        </el-image>
      </el-col>
    </el-row>
  </el-dialog>

</template>

<script>
import {unallocatedPartList} from "@/api/quality/batchT";
import {getImage} from "@/api/quality/part";

export default {
  data() {
    return {
      // 遮罩层
      visible: false,
      // 图片的数据
      form : {}

    }
  },
  methods: {

    // 显示弹框
    showImage(imageId) {
      this.reset();
      // 设置图片id
      getImage(imageId).then(response => {
        this.form = response.data;
      });
      this.visible = true;
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

  }

}

</script>
