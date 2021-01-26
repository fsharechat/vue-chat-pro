<!-- @tpl 导航条模板（右上角按钮） -->

<template>
 <div class="elv-winbar flexbox flex-alignc elv__drag">
    <div class="elv-winbar__title flex1">{{title}}</div>
    <div class="elv-winbar__actions elv__nodrag" v-show="false">
        <a v-if="showAlwaysOnTop" class="wbtn" :class="isAlwaysOnTop && 'wbtn-ding'" @click="handleFixTop" :title="isAlwaysOnTop ? '取消置顶' : '置顶'">
            <i class="iconfont icon-Ding"></i>
        </a>
        <a v-if="isMinimizable" class="wbtn" @click="handleMin" title="最小化"><i class="iconfont icon-min"></i></a>
        <a v-if="isMaximizable" class="wbtn" @click="handleMax" :title="isWinMaxed ? '向下还原' : '最大化'"><i class="iconfont" :class="isWinMaxed ? 'icon-max1' : 'icon-max'"></i></a>
        <a class="wbtn wbtn-close" @click="handleQuit" title="关闭"><i class="iconfont icon-quit"></i></a>
    </div>
 </div>
</template>

<script>
    // import { app, remote, ipcRenderer } from 'electron'
    import { mapState, mapMutations } from 'vuex'
    // let currentWin = remote.getCurrentWindow()
    export default {
        props: { title: String,
        },
        data () {
            return { 
                showAlwaysOnTop: false, 
                isAlwaysOnTop: false,
                isMinimizable: true,
                // 窗口是否可以最大化
                isMaximizable: true,
            }
        },
        computed: { ...mapState(['isWinMaxed'])
        },
        mounted() {
        //   ipcRenderer.on('isLogged', (e, isLogged) => {
        //        this.showAlwaysOnTop = isLogged
        //        this.isMaximizable = isLogged
        //     })
        //  if(!currentWin.isMinimizable()) {
        //      this.isMinimizable = false
        //     }
        //  if(!currentWin.isMaximizable()) {
        //      this.isMaximizable = false
        //     }
        // if(this.isWinMaxed && currentWin.isMaximizable()) {
        //      currentWin.maximize()
        //     }
        //  currentWin.on('maximize', () => {
        //      this.SET_WINMAXIMIZE(true)
        //     })
        //  currentWin.on('unmaximize', () => {
        //       this.SET_WINMAXIMIZE(false)
        //     })
        },
        methods: {
          ...mapMutations(['SET_WINMAXIMIZE']),
            handleFixTop() {
             this.isAlwaysOnTop = !this.isAlwaysOnTop
            //  currentWin.setAlwaysOnTop(this.isAlwaysOnTop)
            },
         handleMin() {
            //   currentWin.minimize()
            },
            // 最大化
         handleMax() {
             //mac 上始终为flase linux 始终未true 注释处理
            //  if(!currentWin.isMaximizable()) return
            // if(currentWin.isMaximized()) {
            //     currentWin.unmaximize()
            //     this.SET_WINMAXIMIZE(false)
            //  }else {
            //     currentWin.maximize()
            //     this.SET_WINMAXIMIZE(true)
            //     }
          },
         handleQuit() { 
            //  currentWin.close()
            }
        }
    }
</script>

<style scoped>
.elv-winbar__actions .wbtn .iconfont{
    font-size: 13px;
}
</style>