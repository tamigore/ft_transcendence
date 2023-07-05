// import { OnModuleInit } from "@nestjs/common";
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayInit,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
// import { Message } from "@prisma/client";
import { ChatService } from "./chat.service";
// import { RtGuard } from "../common/guards";

// import {
//   getUserDeviceRoom,
//   stopTimerForUserDevice,
//   startTimerForUserDevice,
// } from "./socket/room";
// import { TimerEvents } from "./socket/events";

@WebSocketGateway(8082)
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private chatService: ChatService) {}

  @WebSocketServer()
  server: Server;

  afterInit() {
    console.log("ChatGateway afterInit");
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log("ChatGateway handleConnection args: ", args);
    console.log(`user with socket ${client.id}`);
    client.join(client.id);
  }

  handleDisconnect(client: Socket) {
    console.log("ChatGateway handleDisconnect clientid: ", client.id);
    client.disconnect();
  }

  // @SubscribeMessage(TimerEvents.timerStart.toString())
  // startMyTimer(@ConnectedSocket() client: any, @MessageBody() body: any): void {
  //   // Stop any existing timer for this user device.
  //   stopTimerForUserDevice(
  //     client.user.id,
  //     client.handshake.query.deviceId.toString()
  //   );

  //   // Start a new timer for this user device.
  //   startTimerForUserDevice(
  //     this.server,
  //     client.user.id,
  //     client.handshake.query.deviceId.toString(),
  //     body.dur // Timer duration
  //   );
  // }

  // @SubscribeMessage(TimerEvents.timerStop.toString())
  // stopMyTimer(@ConnectedSocket() client: any): void {
  //   // Stop current timer for this user device.
  //   stopTimerForUserDevice(
  //     client.user.id,
  //     client.handshake.query.deviceId.toString()
  //   );
  // }

  @SubscribeMessage("cliMessage")
  async onMessage(@ConnectedSocket() client: Socket, @MessageBody() body: any) {
    console.log("onMessage in chat gateway: body = ", body);
    console.log("Socket ID: ", client.id);
    console.log("User hash: ", client.handshake.auth.token);
    // const user = await this.userService.getHash(client.handshake.auth.token);
    // if (!user) console.log("No user find onMessage");
    // this.chatService.createMessage(body);
    if (body.channel === "general") {
      this.server.emit("servMessage", {
        username: body.username,
        text: body.text,
        object: body.object,
        channel: body.channel,
      });
    } else {
      // if (user.rooms.indexOf(body.channel)) {
      //   console.log("Room was find");
      // } else {
      //   console.log("Room wasn't find");
      // }
      this.server.to(body.channel).emit("servMessage", {
        username: body.username,
        text: body.text,
        object: body.object,
        channel: body.channel,
      });
    }
  }

  @SubscribeMessage("joinChan")
  async onChannel(@ConnectedSocket() client: Socket, @MessageBody() body: any) {
    console.log("joinChan : body = ", body);
    client.join(body.chan);
    // this.server.socketsJoin(body.channel);
    client.to(body.chan).emit("roomCreated", { room: body.channel });
    // const user = await this.userService.getHash(client.handshake.auth.token);
    // if (!user) console.log("No user find onMessage");
    // user.rooms.push(body.channel);
  }
}
