const generatemessage=(username,messagetext)=>{
    return {
        username,
        text:messagetext,
        createdAt:new Date().getTime()
    }
}
const generateLocationMessage=(username,url)=>{
    return {
        username,
        url,
        createdAt:new Date().getTime()
    }
}
module.exports={generatemessage,generateLocationMessage}
