/**
 * @author Joyce Hong
 * @email soja0524@gmail.com
 * @create date 2019-09-02 20:51:10
 * @modify date 2019-09-02 20:51:10
 * @desc socket.io server !
 */

const express = require('express');
const bodyParser = require('body-parser');


const socketio = require('socket.io')
var app = express();

// parse application/x-www-form-urlencoded
// { extended: true } : support nested object
// Returns middleware that ONLY parses url-encoded bodies and 
// This object will contain key-value pairs, where the value can be a 
// string or array(when extended is false), or any type (when extended is true)
app.use(bodyParser.urlencoded({ extended: true }));

//This return middleware that only parses json and only looks at requests where the Content-type
//header matched the type option. 
//When you use req.body -> this is using body-parser cause it is going to parse 
// the request body to the form we want
app.use(bodyParser.json());


var server = app.listen(3000,()=>{
    console.log('Server is running on port number 3000')
})


//Chat Server

var io = socketio.listen(server)

io.on('connection',function(socket) {
    console.log(`Connection : SocketId = ${socket.id}`)   
    var userName = '';
    
    socket.on('subscribe', function(data) {
        console.log('subscribe trigged')
        const room_data = JSON.parse(data)
        userName = room_data.userName;
        const roomNumber = room_data.roomNumber;
        
        socket.join(`${roomNumber}`)
        console.log(`Username : ${userName} joined Room Number : ${roomNumber}`)
        
        // Let the other user get notification that user got into the room;
        // It can be use to indicate that person has read the messages. (Like turns "unread" into "read")
        
        var sendData = {
            userName : userName
        }
        
        //TODO: need to chose
        //io.to : User who has joined can get a event;
        //socket.broadcast.to : all the users except the user who has joined will get the message
        socket.broadcast.to(`${roomNumber}`).emit('newUserToChatRoom',userName);
    })

    socket.on('undescribe',function(data) {
        console.log('undescribe trigged')
        const room_data = JSON.parse(data)
        const userName = room_data.userName;
        const roomNumber = room_data.roomNumber;
        
        socket.leave(`${roomNumber}`)
        console.log(`Username : ${userName} leaved Room Number : ${roomNumber}`)

    })

    socket.on('newMessage',function(data) {
        console.log('newMessage triggered')

        const messageData = JSON.parse(data)
        const messageContent = messageData.messageContent
        const roomNumber = messageData.roomNumber

        console.log(`[Room Number ${roomNumber}] ${userName} : ${messageContent}`)
        // Just pass the data that has been passed from the writer socket

        const chatData = {
            userName : userName,
            messageContent : messageContent,
            roomNumber : roomNumber
        }
        socket.broadcast.to(`${roomNumber}`).emit('updateChat',JSON.stringify(chatData)) // Need to be parsed into Kotlin object in Kotlin
    })

    socket.on('typing',function(roomNumber){ //Only roomNumber is needed here
        console.log('typing triggered')
        socket.broadcast.to(`${roomNumber}`).emit('typing')
    })

    socket.on('stopTyping',function(roomNumber){ //Only roomNumber is needed here
        console.log('stopTyping triggered')
        socket.broadcast.to(`${roomNumber}`).emit('stopTyping')
    })

})

module.exports = server; //Exporting for test