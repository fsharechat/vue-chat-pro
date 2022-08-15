<!-- 消息框 -->
<template>
	<div class="message">
		<header class="header">
			<div class="friendname">{{selectedChat.name}}</div>
            <div class="friend-group-info">
                <i title="用户信息" class="icon iconfont icon-pengyou1 show-group-info" v-if="isSingleConversation" @click="changeShowCreateGroup"></i>
                <i title="群组信息" class="icon iconfont icon-pengyou show-group-info" v-if="!isSingleConversation" @click="changeShowGroupInfo"></i>
                <groupInfo v-bind:targetId="selectedChat.target" v-if="showGroupInfo"></groupInfo>
            </div>
		</header>
		<div class="message-wrapper" ref="list" @scroll="scrollEvent" @click="messageBoxClick" :style="{height: (appHeight * 0.75-60) + 'px'}">
		    <div v-if="isLoading" class="loading"><img src="../../assets/img/loading.gif" />{{loadingDes}}</div>
            <ul v-if="selectedChat">
		    	<li v-bind:key = index v-for="(item, index) in selectedChat.protoMessages" class="message-item">
		    		<div v-if="isShowTime(index,selectedChat.protoMessages)" class="time"><span>{{item.timestamp | getTimeStringAutoShort2}}</span></div>
                    <div v-if="isGroupNotification(item)" class="time"><span>{{notificationContent(item)}}</span></div>
                    <div v-if="isRecallNotification(item)" class="time"><span>{{notificationContent(item)}}</span></div>
                    <div v-if="item.content.type === 90" class="time"><span>{{item.content.content}}</span></div>
		    		<div v-if="!isNotification(item.content.type)" class="main" :class="{ self: item.direction == 0 ? true : false }">
                        <img class="avatar" width="36" height="36" :src="avatarSrc(item)"
                        onerror="this.src='static/images/vue.jpg'"/>
                        <div class="content">
                            <div class="display-name" v-if="!isSingleConversation && item.direction != 0">{{showUserName(item.from)}}</div>

                            <div class="content-message-right-menu">
                                <div class="report-status" v-if="item.direction == 0">
                                    <div v-if="messageReportStatus(item) == 1"><span class="unread">已送达</span></div>
                                    <div v-if="messageReportStatus(item) == 2"><span class="allread">已读</span></div>
                                    <div v-if="messageReportStatus(item) == 3"><span class="unread">未读</span></div>
                                    <div v-if="messageReportStatus(item) == 4"><span v-bind:class="{allread : computeReadCount(item) == '全部已读', unread : computeReadCount(item) != '全部已读'}">{{computeReadCount(item)}}</span></div>
                                </div>
                                <div class="send-status" v-if="item.direction == 0">
                                    <i title = "发送中" class="icon iconfont icon-loading-solid" v-if="isSending(item)"></i>
                                    <i title = "发送失败" class="icon iconfont icon-fasongshibai" v-if="isSendFail(item)"></i>
                                </div>
                                <div class="content-message" @contextmenu.prevent="handleMsgCtxMenu($event,item)">
                                    <!-- <div v-if="item.content.type === 1 && isfaceMessage(item.content.searchableContent)" class="text" v-html="replaceFace(item.content.searchableContent)"></div> -->
                                    <!-- <div v-if="item.content.type === 1 && !isfaceMessage(item.content.searchableContent)" class="text" v-text="item.content.searchableContent"></div>     -->
                                    
                                    <div v-if="isfaceMessage(item)" class="text" v-html="replaceFace(item.content.searchableContent)"></div>
                                    <div v-if="isLinkTextMessage(item)" class="text" v-html="textLinkMessage(item)" @click="handleMsgClicked"></div>
                                    <div v-if="isPureTextMessage(item)" class="text" v-text="textMessage(item)"></div>

                                    <div v-if="item.content.type === 2">
                                        <div :id="'audio-div-'+item.messageId" class="auido-message-receive" v-if="item.direction == 1">
                                            <span class="duration">{{audioDuration(item)}}</span>
                                            <i :id="item.messageId" class="voice-gray" @click="palyAMR(item)"></i>
                                        </div>
                                        <div :id="'audio-div-'+item.messageId" class="auido-message-send" v-if="item.direction == 0">
                                            <span class="duration">{{audioDuration(item)}}</span>
                                            <i :id="item.messageId" class="voice-green" @click="palyAMR(item)"></i>
                                        </div>
                                    </div>
                                    <div v-if="item.content.type === 3" v-viewer="options">
                                        <img :src="imageThumnailSrc(item)" :data-src="item.content.remoteMediaUrl" class="receive-image">
                                    </div>
                                    <div v-if="item.content.type === 4">
                                        <el-card :body-style="{ padding: '0px' }" class="location-card">
                                            <div class="location-title">
                                                <span>{{locationTitle(item)}}</span>
                                            </div>
                                            <img class="location-img" :src="locationthumnailSrc(item)" @click="changeLocationDialogVisible(item,true)">
                                        </el-card>
                                        <!--:lock-scroll="false" 解决dialog弹框抖动 -->
                                        <el-dialog :visible="isLocationDialogVisible(item)" width="640px" center :lock-scroll="false"  @close="changeLocationDialogVisible(item,false)">
                                            <div class="amap-page-container" style="margin-top:-20px;" v-if="isLocationDialogVisible(item)">
                                                <div class="toolbar">
                                                    <span>{{locationTitle(item)}}</span>
                                                </div>
                                                <el-amap :vid="item.messageId+''" zoom="14" :center="locationCenter(item)" style="height:400px;">
                                                    <el-amap-marker v-bind:key="index" v-for="(marker, index) in locationMarkers(item)" 
                                                                    :position="marker.position" :events="marker.events" 
                                                                    :visible="marker.visible" :draggable="marker.draggable" :vid="index">
                                                    </el-amap-marker>
                                                </el-amap>
                                                <!-- <el-amap vid="amap" :center="center" :map-manager="amapManager" zoom="12" :events="events" style="height:450px;"> -->
                                                <!-- </el-amap> -->
                                            </div> 
                                        </el-dialog>
                                    </div>
                                    <div v-if="item.content.type === 5">
                                        <div class="attachment"> 
                                            <div class="flexbox flex-alignc"> 
                                                <i class="ico-bg"></i> 
                                                    <div class="file-info flex1"> 
                                                        <p class="name">{{fileMessageConfig(item).name}}</p>
                                                        <p class="size">{{fileSize(item)}}</p>
                                                    </div> 
                                                <a class="btn-down" :href="fileMessageConfig(item).remotePath" target="_blank"></a>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-if="item.content.type === 6" >
                                        <Xgplayer :config="videoConfig(item,false,imageThumnailSrc(item))" @player="Player = $event"/>
                                        <!-- <xgplayer :options="videoConfig(item,false,imageThumnailSrc(item))"></xgplayer> -->
                                    </div>
                                    <div v-if="item.content.type === 7">
                                        [表情消息]
                                    </div>
                                    <div v-if="item.content.type === 8">
                                        [图片表情]
                                    </div>
                                    <div v-if="item.content.type === 400">
                                        [网络电话]
                                    </div>
                                </div>
                                <!-- <rightMenu v-if="isShowMessageMenu(item)" v-bind:message="item"></rightMenu> -->
                            </div>
                            
                        </div>
                        
                    </div>
		    	</li>
		    </ul>
		</div>
	</div>
</template>

<script>
import { mapGetters,mapActions, mapState } from 'vuex'
import TimeUtils from '../../websocket/utils/timeUtils'
import Utils from '../../websocket/utils/utils'
import Xgplayer from 'xgplayer-vue';
import 'viewerjs/dist/viewer.css'
import Viewer from 'v-viewer'
import Vue from 'vue'
Vue.use(Viewer)
import CryptoJS from 'crypto-js'
import groupInfo from '../menu/groupInfo'
import rightMenu from '../menu/rightMenu'
import MessageConfig from '../../websocket/message/messageConfig';
import NotificationMessageContent from '../../websocket/message/notification/notificationMessageContent';
import GroupNotificationContent from '../../websocket/message/notification/groupNotification';
import MessageStatus from '../../websocket/message/messageStatus';
import RecallMessageNotification from '../../websocket/message/notification/recallMessageNotification';
import webSocketClient from '../../websocket/websocketcli';
import { SUCCESS_CODE } from '../../constant';
import LocalStore from '../../websocket/store/localstore';
import Conversation from '../../websocket/model/conversation';
import ConversationType from '../../websocket/model/conversationType';
import ProtoMessage from '../../websocket/message/protomessage'
import TextMessageContent from '../../websocket/message/textMessageContent'
// import linkifyUrls from 'linkify-urls'
import Clipboard from 'clipboard';
import streamSaver from 'streamsaver'
import BenzAMRRecorder from 'benz-amr-recorder'
// import electron from 'electron'
// import downloader from '../../../main/utils/downloader'
export default {
    components:{
        Xgplayer,
        groupInfo,
        rightMenu
    },

    data(){
        return {
            Player: null,
            amrPlayer: null,
            isAudioPlaying: false,
            options: {
                url: 'data-src'
            },
            messageDatalistHeight:0,
            isLoading: false,
            loadingDes: '数据载入中...',
            clipboard: null,
            locationDialogVisible: []
        }
    },
    
    computed: {
        ...mapGetters([
            'selectedChat',
            'messages',
            'isSingleConversation',
            'currentGroupMemberCount'
        ]),
        ...mapState([
            'user',
            'emojis',
            'appHeight',
            'userInfoList',
            'showGroupInfo',
            'showMessageRightMenu',
            'groupMemberMap',
            'isLoadRemoteMessage',
            'fileDownloadStatus',
            'stateMessageReports'
        ]),
        showGroupInfo: {
           get() {
               return this.$store.state.showGroupInfo;
           },

           set(value){
                this.$store.state.showGroupInfo = value
           }
        },
        
    },
    mounted() {
        this.amrPlayer = new BenzAMRRecorder();
         //  在页面加载时让信息滚动到最下面
        setTimeout(() => this.$refs.list.scrollTop = this.$refs.list.scrollHeight, 0);
        // document.addEventListener("click", e => {
        //     var isString = typeof(e.target.className) == 'string'
        //     let groupInfoDom = document.getElementById("group-info-id");
        //     //注意点击显示按钮事件的处理，防止状态发生反转
		// 	if (isString && e.target.className.search('show-group-info') == -1 && groupInfoDom && !groupInfoDom.contains(event.target) && this.showGroupFriendInfo) {
        //         this.showGroupFriendInfo = false;
        //     }
        // });
        
    },
    destroyed(){
        this.clipboard = null
        if(this.amrPlayer){
            this.amrPlayer.stop()
        }
        this.amrPlayer = null
    },
    watch: {
        // 发送信息后,让信息滚动到最下面
        messages() {
          setTimeout(() => {
              if(!this.isLoadRemoteMessage){
                this.$refs.list.scrollTop = this.$refs.list.scrollHeight
              } else {
                  var currentListheight = this.$refs.list.scrollHeight;
                  console.log("currentListheight "+currentListheight+" messageDatalistHeight "+this.messageDatalistHeight)
                  this.$refs.list.scrollTop = currentListheight - this.messageDatalistHeight
                  this.messageDatalistHeight = currentListheight
              }
          }, 0)
        },
        //切换会话关闭语音播放
        selectedChat(){
            if(this.amrPlayer){
               this.amrPlayer.stop()
            }
        },
        stateMessageReports(){
            console.log("report changed")
        } 
    },
    methods: {
        ...mapActions([
             'addOldMessage',
        ]),

        messageReportStatus(item){
            //表示无状态,接收消息不显示状态
           var status = 0;
           if(item.direction == 0){
              if(this.isSingleConversation){
                status = 3
                var stateMessageReport = this.stateMessageReports.find(stateMessageReport => stateMessageReport.target == item.target)
                if(stateMessageReport){
                    for(var messageReport of stateMessageReport.messageReports){
                        if(messageReport.date > item.timestamp){
                            if(messageReport.reportType == 2){
                                status = 2;
                                break;
                            } else if(messageReport.reportType == 1){
                                status = 1;
                            }
                        }
                    }
                }
              } else {
                  //群聊状态统一为4
                  status = 4
              }
              
           }
        //    console.log("item messageId "+item.messageId +" status "+status)
           return status
        },

        computeReadCount(item){
            var totalReadCount = this.currentGroupMemberCount - 1;
            //console.log("current target "+item.target+" member count "+totalReadCount)
            if(item.direction == 0 && !this.isSingleConversation){
                var stateMessageReport = this.stateMessageReports.find(stateMessageReport => stateMessageReport.target == item.target)
                if(stateMessageReport){
                    for(var messageReport of stateMessageReport.messageReports){
                        if(messageReport.reportType == 2 && messageReport.date > item.timestamp){
                            totalReadCount -= 1
                        }
                    }
                }
                
            }
            if(totalReadCount == 0){
               return "全部已读"
            }
            return totalReadCount +"人未读"
        },

        changeShowGroupInfo(){
            if(this.showGroupInfo){
                this.showGroupInfo = false
                return
            }
            webSocketClient.getGroupMember(this.selectedChat.target).then(data => {
                var isGroupMember = false;

                if(data.code == SUCCESS_CODE){

                    if(data.result.length == 0){
                        this.$message.error("该群组已经解散,即将删除该会话");
                        this.$store.dispatch('deleteConversation',this.selectedChat.target)
                    } else {
                        this.groupMemberMap.set(this.selectedChat.target,data.result);

                        for(var groupMember of data.result){
                            if(groupMember.memberId == LocalStore.getUserId()){
                                isGroupMember = true;
                                break;
                            }
                            
                        }

                        if(!isGroupMember){
                            this.$message.error("您不是群组成员，无法查看群组信息,即将删除该会话");
                            this.$store.dispatch('deleteConversation',this.selectedChat.target)
                        } else {
                            this.showGroupInfo = !this.showGroupInfo ;
                            if(this.showGroupInfo){
                                this.$store.dispatch("getGroupInfo",this.selectedChat.target);
                            }
                        }
                    }
                    
                }
            })
        },
        changeShowCreateGroup(){
            this.showGroupInfo = !this.showGroupInfo;
        },
        avatarSrc(item){
            var avarimgUrl = 'static/images/vue.jpg';
            if(item.direction == 0){
                avarimgUrl = this.user.img;
            } else {
                var user = this.userInfoList.find(user => user.uid == item.from);
                if(user){
                   avarimgUrl = user.portrait;
                }
            }
            return avarimgUrl;
        },
        showUserName(from){
            var displayName = webSocketClient.getDisplayName(from);;
            return displayName;
        },
        //  在发送信息之后，将输入的内容中属于表情的部分替换成emoji图片标签
        //  再经过v-html 渲染成真正的图片
        replaceFace (con) {
            if(con.includes('/:')) {
                var emojis=this.emojis;
                for(var i=0;i<emojis.length;i++){
                    con = con.replace(emojis[i].reg, '<img src="static/emoji/' + emojis[i].file +'"  alt="" style="vertical-align: middle; width: 24px; height: 24px" />');
                }   
                return con;
            }
            return con;
        },

        // isfaceMessage(con){
        //     return con.includes('/:');
        // },

        isShowTime(index,protoMessages){
           var msgTime = protoMessages[index].timestamp;
           if(index > 0){
               var preProtoMessage = protoMessages[index - 1];
               var preMsgTime = preProtoMessage.timestamp;
               if(msgTime - preMsgTime > ( 5 * 60 * 1000)){
                   return true;
               }
           }
           return false;
        },

        videoConfig(protoMessage,paly = false,posterBase64){
           return {
            id: 'vs'+protoMessage.messageId,
            // url 为空,可能导致不显示,这里强制写入poster
            url: protoMessage.content.remoteMediaUrl == ''? posterBase64: protoMessage.content.remoteMediaUrl,
            height: 330,
            width: 250,
            // fitVideoSize: 'auto',
            poster:posterBase64,
            autoplay: false,
            download: true
           }
        },
        // 参考资料 https://blog.csdn.net/qq449736038/article/details/80769507
        scrollEvent(e){
            let listheight= this.$refs.list.offsetHeight;
            //console.log('scroll event top->'+e.srcElement.scrollTop+ ' scrollheight '+e.srcElement.scrollHeight+" list height->"+listheight);
             if(e.srcElement.scrollHeight - e.srcElement.scrollTop > listheight){
                 this.$store.dispatch('clearUnreadStatus', '')
             }
             if(e.srcElement.scrollTop == 0){
                 this.isLoading = true
                 this.loadingDes = "数据载入中..."
                 this.messageDatalistHeight = e.srcElement.scrollHeight;
                 console.log("scroll height "+listheight)
                 var conversationType = this.isSingleConversation ? ConversationType.Single : ConversationType.Group
                 var conversation = new Conversation(conversationType,this.selectedChat.target,0)
                 var beforeUid = 0;
                 if(this.selectedChat.protoMessages && this.selectedChat.protoMessages.length > 0){
                     beforeUid = this.selectedChat.protoMessages[0].messageUid
                     console.log("beforeUid "+beforeUid)
                 }
                 webSocketClient.getRemoteMessages(conversation,beforeUid,20).then(data => {
                     this.isLoading = false;
                     //console.log('code '+data.code+' result '+data.result)
                     if(data.result){
                        var remoteMessage = JSON.parse(data.result)
                        var count = remoteMessage.count
                        console.log("message count "+count)
                        if(count > 0){
                           var messageList = remoteMessage.messageResponseList;
                           for(var originProtoMessage of messageList ){
                               var protoMessage = ProtoMessage.toProtoMessage(originProtoMessage);
                               this.addOldMessage(protoMessage)
                           }
                        }
                     }
                 })
             }
        },

        messageBoxClick(e){
            this.$store.dispatch('clearUnreadStatus', '')
            console.log('message box click');
        },

        handleMsgClicked(e){
            let target = e.target
                // 链接
            if(target.tagName === 'A') {
                 e.preventDefault()
                 window.open(target.href, '', 'frame=true,width=650,height=700')
            }
        },

        isGroupNotification(protoMessage){
           var contentClass = MessageConfig.getMessageContentClazz(protoMessage.content.type);
           var content = new contentClass();
           return content instanceof GroupNotificationContent;
        },

        isRecallNotification(protoMessage){
           var contentClass = MessageConfig.getMessageContentClazz(protoMessage.content.type);
           var content = new contentClass();
           return content instanceof RecallMessageNotification;
        },

        notificationContent(protoMessage){
            var displayContent;
            var messageContent = MessageConfig.convert2MessageContent(protoMessage.from,protoMessage.content);
            return messageContent.formatNotification();
        },

        fileMessageConfig(protoMessage){
           var fileMessageContent = MessageConfig.convert2MessageContent(protoMessage.from,protoMessage.content)
           return fileMessageContent;
        },

        fileSize(protoMessage){
           var fileMessageContent = MessageConfig.convert2MessageContent(protoMessage.from,protoMessage.content)
           return Utils.formateSize(fileMessageContent.size)
        },

        isfaceMessage(protoMessage){
           if(this.isTextMessage(protoMessage)){
             var message = this.textMessage(protoMessage)
             return message.includes('/:');
           } 
           return false
        },

        isLinkTextMessage(protoMessage){
            // if(this.isTextMessage(protoMessage)){
            //     var message = this.textMessage(protoMessage)
            //     var linkMessage = linkifyUrls(message,{
            //         value: url => url
            //     })
            //     return linkMessage.includes('<a href')
            // }
            return false;
        },

        isPureTextMessage(protoMessage){
            if(this.isTextMessage(protoMessage)){
               return !this.isfaceMessage(protoMessage) && !this.isLinkTextMessage(protoMessage)
            }
            return false
        },

        isTextMessage(protoMessage) {
            var contentClass = MessageConfig.getMessageContentClazz(
                protoMessage.content.type
            );
            var content = new contentClass();
            return content instanceof TextMessageContent;
        },

        textLinkMessage(protoMessage){
            var message = this.textMessage(protoMessage)
            return linkifyUrls(message,{
                    value: url => url
                })
        },

        textMessage(protoMessage) {
            var messageContent = MessageConfig.convert2MessageContent(
                protoMessage.from,
                protoMessage.content
            );
            return messageContent.digest();
        },

        audioDuration(protoMessage){
            var soundMessage = MessageConfig.convert2MessageContent(protoMessage.from,protoMessage.content)
            setTimeout(() =>{
                //延时设置,防止初始加载id没有初始化
                this.audioPlayWidth(protoMessage.messageId,soundMessage.duration)
            },100)
            return soundMessage.duration+"\"";
        },

        palyAMR(protoMessage){
           var soundMessage = MessageConfig.convert2MessageContent(protoMessage.from,protoMessage.content)
           var soundUrl = soundMessage.remotePath
           console.log("sound url "+soundUrl)
          

           if(this.isAudioPlaying){
             this.amrPlayer.stop();
             this.isAudioPlaying = false
             this.audioPlaystatus(protoMessage,false)
           } else {
            this.amrPlayer = new BenzAMRRecorder();
            this.amrPlayer.initWithUrl(soundUrl).then(() =>{
                this.amrPlayer.play();
            });
            this.amrPlayer.onPlay(() => {
                console.log("开始播放")
                this.isAudioPlaying = true
                this.audioPlaystatus(protoMessage,true)
            })
            this.amrPlayer.onEnded(() => {
                console.log('播放完毕');
                this.isAudioPlaying = false
                this.audioPlaystatus(protoMessage,false)
            })
           }
           
        },

        audioPlayWidth(messageId,duration){
           var audioDiv = document.getElementById('audio-div-'+messageId);
           if(audioDiv){
               audioDiv.style.width = 40 + duration * 7 +"px"
           }
        },

        audioPlaystatus(protoMessage,isPlaying){
            var audioPlay = document.getElementById(protoMessage.messageId)
            if(audioPlay){
               if(protoMessage.direction == 0){
                  audioPlay.setAttribute("class",isPlaying ? "voice-green-playing voice-green": "voice-green")
               } else {
                  audioPlay.setAttribute("class",isPlaying ? "voice-gray-playing voice-gray": "voice-gray")
               }
            }
        },

        downloadFile(item){
        //    var url = this.fileMessageConfig(item).remotePath
        //    var name = this.fileMessageConfig(item).name
        //    var size = this.fileMessageConfig(item).size
        //    var _this = this;
        //    const path = require('path')

        //    const win = electron.remote.getCurrentWindow()
        //    const downloadPath = electron.remote.app.getPath('downloads')
        //    const opts = {
        //         title: '保存文件',
        //         defaultPath: path.join(downloadPath,name),
        //         filters: [
        //             { name: 'All Files', extensions: ['*'] }
        //         ]
        //     }

        //     // const fileStream = streamSaver.createWriteStream(name)
        //     // var loaded = 0
        //     // var progress = new TransformStream({
        //     //     transform(chunk, controller) {
        //     //         loaded += chunk.length;
        //     //         var percent = Math.floor(loaded / size * 100)
        //     //         _this.setDownloadStatus(item,1,percent)
        //     //         // console.log("download "+loaded+" size "+ size +" percent "+percent)
        //     //         controller.enqueue(chunk);
        //     //     }
        //     //     })
        //     // fetch(url).then(res => {
        //     //     res.body
        //     //             .pipeThrough(progress)
        //     //             .pipeTo(fileStream)
        //     //             .then(() => {
        //     //                 _this.setDownloadStatus(item,2)
        //     //                 console.log("download success")
        //     //             }).catch( error => {
        //     //                 _this.setDownloadStatus(item,0)
        //     //                 console.error(error)
        //     //             })
        //     // })

        //     // electron.remote.dialog.showSaveDialog(win, opts, function (savePath) {
        //     //     console.log('Saving file ' + ' to ' + savePath)
        //     //     if (!savePath) return // They clicked Cancel
        //     //     const fileStream = streamSaver.createWriteStream(savePath)
        //     //     // var fs = require('fs');
        //     //     // const fileStream = fs.createReadStream(savePath, {flags: 'w'});
        //     //     var loaded = 0
        //     //     var progress = new TransformStream({
        //     //         transform(chunk, controller) {
        //     //             loaded += chunk.length;
        //     //             var percent = Math.floor(loaded / size * 100)
        //     //             _this.setDownloadStatus(item,1,percent)
        //     //             // console.log("download "+loaded+" size "+ size +" percent "+percent)
        //     //             controller.enqueue(chunk);
        //     //         }
        //     //         })
        //     //     fetch(url).then(res => {
        //     //         res.body
        //     //                 .pipeThrough(progress)
        //     //                 .pipeTo(fileStream)
        //     //                 .then(() => {
        //     //                     _this.setDownloadStatus(item,2)
        //     //                     console.log("download success")
        //     //                 }).catch( error => {
        //     //                     _this.setDownloadStatus(item,0)
        //     //                     console.error(error)
        //     //                 })
        //     //     })
                
        //     // })

        //     electron.remote.dialog.showSaveDialog(win, opts, function (savePath) {
        //         console.log('Saving file ' + ' to ' + savePath)
        //         if (!savePath) return // They clicked Cancel
        //         downloader.download(url,savePath,(bytes, percent) => {
        //             _this.setDownloadStatus(item,1,percent)
        //             if(percent == 100){
        //                 _this.setDownloadStatus(item,2)
        //             }
        //             console.log(`Downloaded ${bytes} (${percent})`)
        //         })
                
        //     })
        },

        downloadStatus(item){
            var fileItem = this.fileDownloadStatus.find(fileItem => fileItem.messageId == item.messageId)
            if(fileItem){
                return fileItem.downloadStatus
            } else {
                return 0;
            }
        },

        downloadPercent(item){
            var fileItem = this.fileDownloadStatus.find(fileItem => fileItem.messageId == item.messageId)
            if(fileItem){
                console.log("downloadPercent "+fileItem.downloadPercent)
                if(fileItem.downloadPercent){
                    return Number(fileItem.downloadPercent)
                } else {
                    return 0
                }
            } else {
                return 0;
            }
        },

        setDownloadStatus(item,downloadStatus,percent = 100){
           var fileItem = this.fileDownloadStatus.find(fileItem => fileItem.messageId == item.messageId)
           if(fileItem){
                fileItem.downloadStatus = downloadStatus
                fileItem.downloadPercent = percent
           } else {
               this.fileDownloadStatus.push({
                   "messageId": item.messageId,
                   "downloadStatus": downloadStatus,
                   "downloadPercent": percent
               })
           }
        },

        isNotification(type){
            return type >= 80 && type <= 117 
        },

        isSending(protoMessage){
            //兼容以前没有更新messageUid的发送消息
            return protoMessage.status == MessageStatus.Sending
            // && protoMessage.messageUid != 0;
        },

        isSendFail(protoMessage){
            return protoMessage.status == MessageStatus.SendFailure
        },

        handleMsgCtxMenu(e,item) {
                let points = [e.pageX, e.pageY]
                var _this = this;
                wcPop({
                 skin: 'contextmenu', opacity: 0, follow: points,
                 btns: [
                    {   text: '撤回消息',
                        onTap() {
                           _this.recallMessage(item)
                           wcPop.close()
                        }
                    },
                    {   text: '转发',
                        onTap() {
                           _this.relayMessage(item)
                           wcPop.close()
                        }
                    },
                    {   text: '复制文本',
                        onTap() {
                          _this.copyMessage(item)  
                          wcPop.close()
                       }
                    },
                    { text: '删除',
                      onTap() {
                          _this.deleteMessage(item)
                          wcPop.close()
                       }
                     },
                    ]
                })
        },

        recallMessage(message){
            webSocketClient.recallMessage(message.messageUid).then(data => {
				if(data.code == SUCCESS_CODE){
					if(data.result == 200){
						var recallMessageContent = new RecallMessageNotification(LocalStore.getUserId(),message.messageUid);
						message.content = recallMessageContent.encode();
						console.log("recall message "+message.messageId);
					} else {
						this.$message.error('非管理员只能撤回自己发送的消息');
					}
					
				}
			});
        },

        relayMessage(message){
			this.$store.state.currentRightMenuMessage = message
			this.$store.state.showRelayMessageDialog = true;
        },
        
        deleteMessage(message){
			console.log("delete message id "+message.messageId)
			this.$store.dispatch('deleteMessage',message.messageId)
        },
        
        copyMessage(message){
            var _this = this;
            this.clipboard = new Clipboard('.btn', {
                text: function() {
                    console.log("message"+message)
                    if(_this.isTextMessage(message)){
                         return _this.textMessage(message)
                    }
                    return '';
                }
            });
            this.clipboard.on('success', function(e) {
                console.log(e);
            });
            this.clipboard.on('error', function(e) {
                console.log(e)
            });
            // clipboard.destroy();
        },

        messageRigthClick(messageId){
            var menuSetting = this.showMessageRightMenu.find(setting => setting.messageId == messageId)
            if(menuSetting){
               menuSetting.show = true
            } else {
                this.showMessageRightMenu.push({
                    messageId: messageId,
                    show: true
                })
            }
        },
        isShowMessageMenu(item){
            var menuSetting = this.showMessageRightMenu.find(setting => setting.messageId == item.messageId)
            if(menuSetting){
                return menuSetting.show;
            } else {
                return false;
            }
           
        },
        imageThumnailSrc(item){
            var thumbnail = item.content.binaryContent;
            if(thumbnail && thumbnail != ''){
                thumbnail = "data:image/png;base64," +item.content.binaryContent;
            } else {
                thumbnail = ''
            }
            return thumbnail 
        },
        locationthumnailSrc(protoMessage){
            var locationMessage = MessageConfig.convert2MessageContent(protoMessage.from,protoMessage.content)
            var thumbnail = "data:image/png;base64," + locationMessage.thumbnail
            return thumbnail
        },
        locationTitle(protoMessage){
            var locationMessage = MessageConfig.convert2MessageContent(protoMessage.from,protoMessage.content)
            return locationMessage.title
        },
        locationCenter(protoMessage){
            var locationMessage = MessageConfig.convert2MessageContent(protoMessage.from,protoMessage.content)
            return [locationMessage.long,locationMessage.lat]
        },
        locationMarkers(protoMessage){
            var locationMessage = MessageConfig.convert2MessageContent(protoMessage.from,protoMessage.content)
            // console.log("lat "+locationMessage.lat+" long "+locationMessage.long)
            var marker = {
              position: [locationMessage.long,locationMessage.lat],
              events: {
                click: () => {
                    console.log("click marker")
                },
                dragend: (e) => {
                  console.log('---event---: dragend')
                  this.markers[0].position = [e.lnglat.lng, e.lnglat.lat];
                }
              },
              visible: true,
              draggable: false,
              template: '<span>1</span>',
            }
            return [marker]
        },
        isLocationDialogVisible(protoMessage){
            var visible = false
            var visibleItem = this.locationDialogVisible.find(item => item.messageId == protoMessage.messageId);
            if(visibleItem){
                visible = visibleItem.visible
            }
            // console.log("messageId "+protoMessage.messageId+" visible "+visible)
            return visible
        },
        changeLocationDialogVisible(protoMessage,visible){
            // console.log("messageId "+protoMessage.messageId +" change visible "+visible)
            var visibleItem = this.locationDialogVisible.find(item => item.messageId == protoMessage.messageId);
            if(visibleItem){
                visibleItem.visible = visible
            } else {
                this.locationDialogVisible.push({
                    messageId: protoMessage.messageId,
                    visible: visible
                })
            }
        },
    },
    filters: {
            // 将日期过滤为 hour:minutes
            time (date) {
                if (typeof date === 'string') {
                    date = new Date(date);
                }
                if(typeof date === 'number'){
                   date = new Date(date);
                }
                if(date.getMinutes()<10){
                  return date.getHours() + ':0' +date.getMinutes();
                }else{
                  return date.getHours() + ':' + date.getMinutes();
                }
            },

            getTimeStringAutoShort2(timestamp){
                return TimeUtils.getTimeStringAutoShort2(timestamp,true);
            }


    }
}
</script>

<style lang="stylus" scoped>
   .receive-image
      max-width : 115px;
      max-height : 330px;
      text-align: center
      border-radius: 3px
      
   .message
      position: relative
      width: 100%
      height: calc(75% - 25px);
      .header
        height: 14%
        max-height: 35px
        min-height: 35px 
        padding: 0px 0 0 30px
        box-sizing: border-box
        display:flex
        .friendname
            display: flex
            align-items: center
            font-size: 18px
        .friend-group-info
            padding: 0px 20px 0px 0px
            display: flex
            align-items: center
            margin-left : auto
            .icon
                font-size: 24px
                cursor: pointer 
      .message-wrapper
        -webkit-user-select: text;
        height: 86%
        padding: 10px 15px
        box-sizing: border-box
        overflow-y: auto
        border-top: 1px solid #e7e7e7
        border-bottom: 1px solid #e7e7e7
        background: #f2f2f2
        .loading
            color: #9ea0a3;
            font-size: 12px;
            font-family: arial;
            text-align: center;
            line-height: 30px;
            img
                display: inline-block;
                vertical-align: top;
                margin: 6px 3px 0 0;
                height: 18px;
        .message
            margin-bottom: 15px
        .time
            width: 100%
            font-size: 12px
            margin: 7px auto
            text-align: center
            span
                display: inline-block
                padding: 4px 6px
                color: #fff
                border-radius: 3px
                background-color: #dcdcdc
        .main
            margin-top: 10px
            .avatar 
                float: left
                margin-left: 15px
                border-radius: 3px
            .content 
                display:inline-block
                width: 65%   
                .display-name
                    margin-left: 10px
                    margin-bottom: 5px
                    font-size: 11px
                    color: #999
                .content-message-right-menu
                    position: relative    
                    .content-message
                        display: inline-block
                        margin-left: 10px
                        position: relative
                        padding: 6px 10px
                        max-width: 90%
                        min-height: 36px
                        line-height: 24px
                        box-sizing: border-box
                        font-size: 14px
                        text-align: left
                        word-break: break-all
                        background-color: #fafafa
                        border-radius: 4px
                        .location-card
                            max-width: 100%
                            height: 300px
                            .location-title
                                padding: 14px
                            .location-img
                                width: 100%
                                display: block   
                        .auido-message-send
                            text-align: left
                            zoom: 1
                            cursor: pointer
                            min-width: 40px
                            .voice-green
                                width: 23px
                                height: 23px
                                display: inline-block;
                                vertical-align: middle;
                                background: url("http://res.wx.qq.com/a/wx_fed/webwx/res/static/css/5af37c4a880a95586cd41c5b251d5562@1x.png") no-repeat;
                                background-position: -464px -398px;
                                background-size: 487px 462px; 
                                float: right
                            .voice-green-playing
                                background: url('http://res.wx.qq.com/a/wx_fed/webwx/res/static/img/3Oeq2i3.gif');    
                        .auido-message-receive
                            text-align: right
                            zoom: 1
                            cursor: pointer
                            min-width: 40px
                            .voice-gray
                                width: 23px
                                height: 23px
                                display: inline-block;
                                vertical-align: middle;
                                background: url("http://res.wx.qq.com/a/wx_fed/webwx/res/static/css/5af37c4a880a95586cd41c5b251d5562@1x.png") no-repeat;
                                background-position: -200px -432px;
                                background-size: 487px 462px;
                                float:left
                            .voice-gray-playing
                                background: url('http://res.wx.qq.com/a/wx_fed/webwx/res/static/img/1Rw0-Kq.gif'); 
                        .attachment
                            min-width: 200px
                            max-width: 350px
                            .ico-bg
                                background: url(/static/images/icon__attachment-white.png) no-repeat center #3aa4dd;
                                background-size: 20px; 
                                display: inline-block; 
                                vertical-align: top; 
                                height: 40px; 
                                width: 40px;
                            .file-info
                                font-size: 14px;
                                font-family: "Micrsofot Yahei";
                                margin-left: 10px;
                            .name
                                overflow: hidden;
                                white-space: nowrap; 
                                text-overflow: ellipsis; 
                                max-width: 248px;
                            .size
                                color: #666;
                                font-size: 12px;
                            .btn-down
                                background: url(/static/images/icon__download.png) no-repeat center; 
                                background-size: 15px; 
                                display: inline-block; 
                                vertical-align: top; 
                                height: 30px; 
                                width: 20px;
                        .text
                            white-space: pre-wrap;
                        &:before
                            content: " "
                            position: absolute
                            top: 12px
                            right: 100%
                            border: 6px solid transparent
                            border-right-color: #fafafa
        .self
            text-align: right
            .avatar
                float: right
                margin:0 15px
            .content
                .report-status
                    display: flex
                    justify-content: end;
                    text-align: justify;
                    align-items: flex-end;
                    .allread
                        color: #777
                    .unread
                        color: #78bd32
                    span
                        display: inline-block
                        border-radius: 3px
                        text-align: center;
                .send-status
                    height: 100%
                    display: inline-block
                    .icon
                        display: block
                        font-size: 16px 
                    .icon-fasongshibai
                        color: red
                    .icon-loading-solid
                        animation: changeright 1s linear infinite
                .content-message-right-menu
                    justify-content: flex-end;
                    display: flex;
                    .content-message
                        margin-left: 5px
                        background-color: #b2e281
                        &:before 
                            right: -12px
                            vertical-align: middle
                            border-right-color: transparent
                            border-left-color: #b2e281
    @keyframes changeright     
    0% 
        -webkit-transform:rotate(0deg)
    50%
        -webkit-transform:rotate(180deg)
    100%
        -webkit-transform:rotate(360deg)                      
                    
</style>
