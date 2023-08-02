import { Prisma } from "@prisma/client";

const roomwithall = Prisma.validator<Prisma.RoomArgs>()({
  include: {
    owner: true,
    admins: true,
    users: true,
    ban: true,
    mute: true,
    messages: true,
  },
});

const roomWithOwner = Prisma.validator<Prisma.RoomArgs>()({
  include: {
    owner: true,
  },
});

const roomWithAdmins = Prisma.validator<Prisma.RoomArgs>()({
  include: {
    admins: true,
  },
});

const roomWithUsers = Prisma.validator<Prisma.RoomArgs>()({
  include: {
    users: true,
  },
});

const roomWithBan = Prisma.validator<Prisma.RoomArgs>()({
  include: {
    ban: true,
  },
});

const roomWithMute = Prisma.validator<Prisma.RoomArgs>()({
  include: {
    mute: true,
  },
});

const roomWithMessages = Prisma.validator<Prisma.RoomArgs>()({
  include: {
    messages: true,
  },
});

export type RoomWithAll = Prisma.RoomGetPayload<typeof roomwithall>;
export type RoomWihtOwner = Prisma.RoomGetPayload<typeof roomWithOwner>;
export type RoomWithAdmins = Prisma.RoomGetPayload<typeof roomWithAdmins>;
export type RoomWithUsers = Prisma.RoomGetPayload<typeof roomWithUsers>;
export type RoomWithBan = Prisma.RoomGetPayload<typeof roomWithBan>;
export type RoomWithMute = Prisma.RoomGetPayload<typeof roomWithMute>;
export type RoomWithMessages = Prisma.RoomGetPayload<typeof roomWithMessages>;
