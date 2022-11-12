<!-- 聊天列表 -->
<template>
  <div class="conversationlist" :style="{height: (appHeight-60) + 'px'}">
    <ul v-loading="isEmptyConversation" style="min-height: 60px">
        <li v-bind:key = index v-for="(item,index) in searchedConversationList" class="sessionlist" :class="{ active: item.conversationInfo.target === selectTarget }" @click="selectConversation(item.conversationInfo.target)" @contextmenu.prevent="handleMsgCtxMenu($event,item)">
            <div class="ding" >
                <!-- <i class="icon iconfont icon-zhiding"></i> -->
                <img width="15" height="15" src="static/images/zhiding.png" v-show="item.conversationInfo.isTop">
            </div>
            <div class="list-left">
            	<img class="avatar"  width="42" height="42" alt="static/images/vue.jpg" :src="item.img" onerror="this.src='static/images/vue.jpg'">
            </div>
            <div class="list-right">
                <div class="title-info">
                   <p class="name">{{item.name ? item.name : ""}}</p>
                   <span class="time">{{item.conversationInfo.timestamp | getTimeStringAutoShort2}}</span>
                </div>
                <div class="lastmsg-info">
                    <p class="lastmsg">{{processageGroupMessage(item)}}</p>
                    <div class="slient" v-if="isShowSient(item)">
                        <i class="iconfont icon-miandarao"></i>
                    </div>
                    <span v-if="isShowUnReadNum(item)" class="unread-num">
                        <span class="unread-num-show">{{item.conversationInfo.unreadCount ? item.conversationInfo.unreadCount.unread : 0}}</span>
                    </span>
                </div>

            </div>
            
        </li>
    </ul>
  </div>
</template>

<script>
import { mapState, mapActions ,mapGetters } from 'vuex'
import ConversationType from '../../websocket/model/conversationType';
import LocalStore from '../../websocket/store/localstore';
import TimeUtils from '../../websocket/utils/timeUtils';
import MessageConfig from '../../websocket/message/messageConfig';
import NotificationMessageContent from '../../websocket/message/notification/notificationMessageContent';
import Logger from '../../websocket/utils/logger';
import webSocketClient from '../../websocket/websocketcli';
export default {
    data(){
        return {
            loading: true
        }
    },
    computed: {
   	    ...mapState([
            'selectId',
            'selectTarget',
            'searchText',
            'appHeight',
            'userInfoList',
            'emptyMessage'
        ]),
        ...mapGetters([
            'searchedConversationList'
        ]),
        isEmptyConversation(){
            return this.searchedConversationList.length == 0 && !this.emptyMessage;
        }
    },
    methods: {
    	...mapActions([
             'selectSession',
             'selectConversation',
             'topConversation',
             'unTopConversation',
             'deleteConversation',
             'silentConversation',
             'unSlientConversation',
             'clearConversationMessages'
        ]),
        processageGroupMessage(item){
            var protoConversationInfo = item.conversationInfo;
            var displayContent;
            if(protoConversationInfo.lastMessage){
                var messageContent = MessageConfig.convert2MessageContent(protoConversationInfo.lastMessage.from,protoConversationInfo.lastMessage.content);
                if(messageContent && messageContent instanceof NotificationMessageContent){
                    displayContent = messageContent.formatNotification();
                } else {
                    displayContent = protoConversationInfo.lastMessage.content.searchableContent;
                    if(protoConversationInfo.lastMessage.content.type === 400){
                        displayContent = '[网络电话]';
                    }
                    var isCurrentUser = protoConversationInfo.lastMessage.from === LocalStore.getUserId();
                    if(protoConversationInfo.conversationType == ConversationType.Group && !isCurrentUser){
                        var from = protoConversationInfo.lastMessage.from;
                        var displayName = this.getDisplayName(from);
                        displayContent = displayName +":"+protoConversationInfo.lastMessage.content.searchableContent;
                    }
                }
                
            }
           return displayContent;
        },
        getDisplayName(from){
            var displayName = from;
            displayName = webSocketClient.getDisplayName(from);
            return displayName;
        },
        isShowSient(stateConverstaion){
            return stateConverstaion.conversationInfo.isSilent
        },
        isShowUnReadNum(stateConverstaion){
            return !this.isShowSient(stateConverstaion) && stateConverstaion.conversationInfo.unreadCount && stateConverstaion.conversationInfo.unreadCount.unread > 0
        },
        /* ---------- { 右键菜单模块 } ---------- */
        // 右键：消息
        handleMsgCtxMenu(e,stateConverstaion) {
            let _this = this;
            let points = [e.pageX, e.pageY]
            let isTop = stateConverstaion.conversationInfo.isTop
            let topConversationText = isTop ? "取消置顶" : "置顶聊天"
            let isSilent = stateConverstaion.conversationInfo.isSilent
            let silentConversationText = isSilent ? "取消免打扰" : "消息免打扰"
            let target = stateConverstaion.conversationInfo.target
             wcPop({
                skin: 'contextmenu',opacity: 0,follow: points,
                btns: [
                    {
                        text: topConversationText,
                        onTap() {
                            if(isTop){
                                _this.unTopConversation(target)
                            } else {
                                _this.topConversation(target)
                            }
                            wcPop.close()
                        }
                    },
                    {   text: silentConversationText,
                        onTap() {
                            if(isSilent){
                               _this.unSlientConversation(target)
                            } else {
                                _this.silentConversation(target)
                            }
                            wcPop.close()
                        }
                    },
                    {
                        text: '删除',
                        onTap() {
                          _this.deleteConversation(target)
                          wcPop.close()
                        }
                    },
                    {   text: '清空聊天记录',
                        onTap() {
                            _this.clearConversationMessages(target)
                            wcPop.close()
                        }
                    },
                        
                    ]
                })
        },	
    },
    filters: {
            // 将日期过滤为 hour:minutes
            time (date) {
                if (typeof date === 'string') {
                    date = new Date(date);
                }
                if( typeof date === 'number'){
                    date = new Date(date);
                }
                if(date.getMinutes()<10){
                  return date.getHours() + ':0' +date.getMinutes();
                }else{
                  return date.getHours() + ':' + date.getMinutes();
                }
            },
            getTimeStringAutoShort2(timestamp){
                return TimeUtils.getTimeStringAutoShort2(timestamp,false);
            }
    },
}
</script>

<style lang="stylus" scoped>
.conversationlist::-webkit-scrollbar {
    width:4px!important;
    height:4px!important;
    -webkit-appearance:none;
    appearance:none;
} 
.conversationlist::-webkit-scrollbar-track,.conversationlist::-webkit-scrollbar-thumb  {
    border-radius: 2px;
    visibility: hidden;
}
.conversationlist:hover::-webkit-scrollbar-track,.conversationlist:hover::-webkit-scrollbar-thumb   {
    border-radius: 2px;
    visibility: visible;
}
.conversationlist
  height: 87%
  overflow: auto 
  
  box-sizing: border-box
  border-top: 1px solid #e7e7e7
  border-right: 1px solid #e7e7e7
  background: #f2f2f2
  .sessionlist
    display: flex
    padding: 0 0
    transition: background-color .1s
    font-size: 0
    &:hover 
        background-color: rgb(220,220,220)
    &.active 
        background-color: #c4c4c4
    .ding
        align-items: flex-start
        text-align: center;
        display:block;
        width: 10px;
        height: 10px
    .list-left
        padding: 12px 0        
        .avatar
            border-radius: 2px
    .list-right
        padding: 12px 6px 0 12px 
        position: relative
        flex: 1
        margin-top: 4px
        .title-info
            display: flex
            .name
                flex: 1 1 auto
                display: inline-block
                width: 130px
                height: 15px
                line-height: 15px
                font-size: 14px
                overflow: hidden
                white-space:nowrap
                text-overflow:ellipsis
            .time
                flex: 0 0 auto
                float: right
                width: 60px
                height: 15px
                text-align: right
                overflow: hidden
                white-space:nowrap
                text-overflow:ellipsis
                line-height: 15px
                color: #999
                font-size: 12px
                vertical-align: center
        .lastmsg-info
            display: flex
            margin-top: 8px    
            .lastmsg
                flex: 1 1 auto 
                font-size: 12px
                width: 130px
                height: 15px
                line-height: 15px
                color: #999
                bottom: 4px
                overflow: hidden
                white-space:nowrap
                text-overflow:ellipsis
            .slient
                flex: 0 0 auto
                vertical-align:bottom
                margin-top: 0px
                display: inline-block;
                min-width: 16px;
                height: 16px;
                border-radius: 8px;
                text-align: center;
                font-size: 12px;
                color: gray 
                line-height: 16px;    
            .unread-num
                flex: 0 0 auto
                vertical-align:bottom
                margin-top: 0px
                display: inline-block;
                min-width: 15px;
                height: 15px;
                background-color: red;
                border-radius: 8px;
                text-align: center;
                font-size: 12px;
                color: #fff;
                line-height: 15px;
                .unread-num-show
                   text-align: center;
                   font-size:10px;
                   -webkit-transform:scale(0.8);
                   display:block;
          
</style>
