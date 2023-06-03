import { OnModuleInit } from "@nestjs/common";
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server } from "socket.io";

@WebSocketGateway(8082)
export class ChatGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.server.on("connection", (socket) => {
      console.log("Connected to: ", socket.id);
    });
  }

  @SubscribeMessage("newMessage")
  onMessage(@MessageBody() body: any) {
    console.log("onMessage in chat gateway: body = ");
    console.log(body);
    // this.server.emit("onMessage", body);
    this.server.emit("onMessage", {
      user: "user",
      text: body,
      object: "object",
      channel: "channel",
    });
  }

  @SubscribeMessage("create")
  create(@MessageBody() body: any) {
    console.log("create in chat gateway: body = ");
    console.log(body);
  }

  // getMessages(): string[] {
  //   return this.messages;
  // }
}
