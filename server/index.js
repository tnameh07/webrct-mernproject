import express from "express";
import bodyParser from "body-parser";
import { Server } from "socket.io";

const io = new Server({
    cors:true,
});
const app = express();

app.use(bodyParser.json());

const emailToSocektMapping = new Map();
const socketToEmailMapping = new Map();

io.on("connection", (socket) => {
  console.log("New connection ");

  socket.on("join-room", (data) => {
    const { roomID, emailID } = data;
    console.log("requesting for joinng room" ,data);
    
    console.log(`user ${emailID}  joined room ${ roomID}`);
    emailToSocektMapping.set(emailID, socket.id);
    socketToEmailMapping.set(socket.id, emailID)
    console.log("emailToSocketIdMapping :", emailToSocektMapping);
    console.log("socketToEmailMapping :", socketToEmailMapping);
    
    socket.join(roomID);
console.log("added");

    socket.emit("joined-room", { roomID} )
    socket.broadcast.to(roomID).emit("user-joined", { emailID });
  });

  socket.on("call-user", data =>{
    const {emailID, offer} = data;
      const fromEmail = socketToEmailMapping.get(socket.id);
      const socketID = emailToSocektMapping.get(emailID);

      console.log("CAll users : ", data , "from Emaild id : ", fromEmail , "and socket id",socketID , " offer ", offer);
      console.log( "data offer :", offer);
      
socket.to(socketID).emit("incoming-call", {from: fromEmail, offer})
    
  })
  socket.on('call-accepted', (data)=>{
    const { emailID, answer}  = data

    const socketID= emailToSocektMapping.get(emailID);
    socket.to(socketID).emit("call-accepted", {answer});

  })
});

app.listen(8000, () => console.log(`backend server running port 8000`));
io.listen(8001);
