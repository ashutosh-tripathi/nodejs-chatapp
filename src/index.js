const path=require('path')
const express=require('express')
const http=require('http')
const { ppid } = require('process')
const socketio=require('socket.io')
const Filter=require('bad-words')
const {generatemessage,generateLocationMessage}=require('./utils/messages.js')
    
    const {addUser,removeUser,getUser,getUsersInRoom}=require('./utils/users')

const app=express()
const server=http.createServer(app)
const io=socketio(server)

const port=process.env.PORT||3000

const publicDirectoryPath=path.join(__dirname,'../public')
app.use(express.static(publicDirectoryPath))
app.get('/test',async (request,response)=>{
    await response.send('testing app')
})
let count=0
io.on('connection',(socket)=>{
    console.log('New Websocket Connected')
    // socket.emit('countUpdated',count)
    // socket.on('increment',()=>{
        // count++
        // socket.emit('countUpdated',count)
        // io.emit('countUpdated',count)
    // })
  
   
   
    socket.on('sendMessage',(message,callback)=>{
        const filter=new Filter()
        if(filter.isProfane(message))
        {
            return callback('Profanity not allowed')
        }
        const user=getUser(socket.id)
        console.log("found user"+user)
        io.to(user.room).emit('message',generatemessage(user.username,message))
        callback()
    })
    socket.on('join',(options,callback)=>{
        const {error,user}=addUser({id:socket.id,...options})
        if(error)
        return callback(error)
        socket.emit('message',generatemessage('Admin','Welcome!!'))
       
        socket.join(user.room)
        socket.broadcast.to(user.room).emit('message',generatemessage(user.username+' has joined'))
        
        io.to(user.room).emit('roomdata',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })

    })
    socket.on('sendLocation',(message)=>{
        const user=getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,`https://google.com/maps?q=${message.latitude},${message.longitude}`))
    })
    socket.on('disconnect',()=>{
       const user= removeUser(socket.id)
       if(user)
        {io.to(user.room).emit('message',generatemessage(user.username+'has disconnected!!'))
        io.to(user.room).emit('roomdata',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })    
    }
    })
        
})



server.listen(port,()=>{
    console.log("app started on port",port)
})