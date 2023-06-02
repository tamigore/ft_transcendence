import { OnModuleInit } from "@nestjs/common";
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  // options
});
io.on("connection", (socket) => {
  console.log("CONNECT ???");
});



@WebSocketGateway(8082)
export class ChatGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  messages: string[];

  onModuleInit() {
    this.server.on("connection", (socket) => {
      console.log("Connected to: ", socket.id);
    });
  }

  @SubscribeMessage("newMessage")
  onMessage(@MessageBody() body: any) {
    console.log("onMessage in chat gateway: body = ");
    console.log(body);
    this.server.emit("onMessage", body);
    // this.server.emit("onMessage", {
    //   msg: "new message",
    //   content: body,
    // });
  }

  @SubscribeMessage("create")
  create(@MessageBody() body: any) {
    console.log("create in chat gateway: body = ");
    console.log(body);
  }

  getMessages(): string[] {
    return this.messages;
  }
}
