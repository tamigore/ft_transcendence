import { OnModuleInit } from "@nestjs/common";
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
// import { Message } from "@prisma/client";
import { ChatService } from "./chat.service";

@WebSocketGateway(8082)
export class ChatGateway implements OnModuleInit {
  constructor(private chatService: ChatService) {}

  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.server.on("connection", (socket: Socket) => {
      console.log("Connected to: ", socket.id);
      socket.join(socket.id);
      socket.on("disconnecting", () => {
        console.log(socket.rooms); // the Set contains at least the socket ID
      });
    });
  }

  @SubscribeMessage("cliMessage")
  onMessage(@MessageBody() body: any) {
    console.log("onMessage in chat gateway: body = ", body);
    this.chatService.createMessage(body);
    if (body.channel === "general") {
      this.server.emit("servMessage", {
        username: body.username,
        text: body.text,
        object: body.object,
        channel: body.channel,
      });
    } else {
      this.server.to(body.channel).emit("servMessage", {
        username: body.username,
        text: body.text,
        object: body.object,
        channel: body.channel,
      });
    }
  }

  @SubscribeMessage("joinChan")
  onChannel(@MessageBody() body: any) {
    console.log("joinChan : body = ", body);
    this.server.socketsJoin(body.channel);
    // this.server.socketsJoin(socket.id);
  }
}
