// import { z } from "zod";


// const User = z.object({
//   id: z.number(),
//   created_at: z.date(),
//   updated_at: z.date(),
  
//   email: z.string().email(),
//   username: z.string().optional(),
//   hash: z.string(),
//   hashRt: z.string().optional(),
//   chatSocket: z.string().optional(),
//   gameSocket: z.string().optional(),
//   loggedIn: z.boolean(),
//   bio: z.string().optional(),
//   img: z.string().optional(), //Path to img src
//   owner: Room[],
//   admin: Room[],
//   rooms: Room[],
//   messages: Message[],
//   win: Historic,
//   loose: Historic,
// });

// const Historic = z.object({
//     id: z.number(),
//     created_at: z.date(),
  
//     winnerID: z.number(),
//     winner: User,
//     looserID: z.number(),
//     looser: User,
//     score: z.string(),
// });

// const Message = z.object({
//     id: z.number(),
//     created_at: z.date(),
  
//     text: z.string(),
//     roomId: z.number(),
//     room: Room,
//     userId: z.number(),
//     user: User,
// });

// const Room = z.object({
//     id: z.number(),
//     created_at: z.date(),
  
//     name: z.string(),
//     ownerId: z.number(),
//     owner: User,
//     admin: User[],
//     users: User[],
//     messages: Message[],
//     description: z.string().optional(),
// });
