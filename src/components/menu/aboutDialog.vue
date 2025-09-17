<template>
  <el-dialog
    title="关于"
    :visible.sync="visible"
    width="400px"
    :lock-scroll="false"
    :modal-append-to-body="false"
    :before-close="handleClose">
    <div class="about-content">
      <div class="app-info">
        <h3>{{ appName }}</h3>
        <p class="version">版本号: {{ version }}</p>
      </div>
    </div>
    
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import packageInfo from '../../../package.json'

export default {
  name: 'AboutDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      appName: packageInfo.name,
      version: packageInfo.version
    }
  },
  methods: {
    handleClose() {
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style lang="stylus" scoped>
.about-content
  .app-info
    text-align: center
    padding: 20px 0
    
    h3
      margin: 0 0 15px 0
      color: #333
      font-size: 20px
      
    .version
      margin: 0
      color: #666
      font-size: 16px
</style>