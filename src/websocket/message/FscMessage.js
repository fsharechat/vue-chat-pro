import ProtoMessageContent from "./protomessageContent";
export default class FscMessage {
    conversationType;
    target;
    line;
    from = '';
    content = {}; 
    messageId = '0';
    direction = 0;
    status = 0;
    localMessageId = '0';
    timestamp = 0;
    tos = '';


     /***
     * 转为即将发送的Fscmessage
     */
     static convertToFscMessage(message){
        var fscMessage = new FscMessage();
        fscMessage.conversationType = message.conversation.type;
        fscMessage.target = message.conversation.target;
        fscMessage.line = message.conversation.line;
        fscMessage.from = message.from;
        fscMessage.tos = message.tos;
        fscMessage.direction = message.direction;
        fscMessage.status = message.status;
        fscMessage.messageId = message.messageId;
        fscMessage.localMessageId = message.messageId;
        fscMessage.timestamp = message.timestamp;
        console.log("fscmessage content "+message.content)
        var payload = message.content.encode();
        fscMessage.content = ProtoMessageContent.toProtoMessageContent(payload);
        return fscMessage;
    }

}