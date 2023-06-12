import { OnModuleInit } from "@nestjs/common";
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server } from "socket.io";
// import { Message } from "@prisma/client";
import { ChatService } from "./chat.service";

@WebSocketGateway(8082)
export class ChatGateway implements OnModuleInit {
  constructor(private chatService: ChatService) {}

  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.server.on("connection", (socket) => {
      console.log("Connected to: ", socket.id);
      // console.log(socket);
    });
  }

  @SubscribeMessage("cliMessage")
  onMessage(@MessageBody() body: any) {
    console.log("onMessage in chat gateway: body = ");
    console.log(body);
    // const obj = JSON.parse(body);
    this.chatService.createMessage(body);
    this.server.emit("servMessage", {
      user: body.user,
      text: body.text,
      object: body.object,
      channel: body.channel,
    });
    this.server.to(body.channel).emit("servMessage", body);
    console.log("OK ?");
  }

  @SubscribeMessage("create")
  create(@MessageBody() body: any) {
    console.log("create in chat gateway: body = ");
    console.log(body);
  }
}
