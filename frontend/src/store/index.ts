import { createStore } from 'vuex';
import { User, Room, Message, Game } from '../utils/interfaces';

const store = createStore({
    state: {
        user: {} as User,
        messages: [] as Message[],
        rooms: [] as Room[],
        private: [] as Room[],
        lastRoom: {} as Room,
        lastPrivate: {} as Room,
        lastMessage: {} as Message,
        ingame: false as boolean,
        inQueue: false as boolean,
        playerNum: 0 as number,
        gameRoom: "" as string,
        game: {} as Game,
        specGames: [] as Game[],
    },
    mutations: {
        setSpecGames : function(state, games: Game[]) {
            state.specGames = games.filter(game =>game.historic == null || game.historic == undefined);
        },
        setGameConnect : function(state, gameConnect: boolean) {
            state.ingame = gameConnect;
        },
        setUserGameSocket : function (state, gameSocket: string) {
            state.user.gameSocket = gameSocket;
        },
        setGameRoom : function (state, gameRoom: string) {
            state.gameRoom = gameRoom;
        },
        setInQueue : function (state, inQueue: boolean) {
            state.inQueue = inQueue;
        },
        setPlayerNum : function (state, num: number) {
            state.playerNum = num;
        },
        setPlayer2Game : function (state, player2: User) {
            state.game.player2Id = player2.id;
            state.game.player2 = player2;
        },
        setGame : function (state, game: Game) {
            state.game = game;
        },
        addMessage : function (state, chatMessage: Message) {
            state.messages.push(chatMessage);
        },
        setMessages(state, chatMessages: Message[]) {
            state.messages = chatMessages;
        },
        setLastMessage(state, chatMessages: Message) {
            state.lastMessage = chatMessages;
        },
        setLastPrivate(state, room: Room) {
            console.log('setLastPrivate: ', room);
            state.lastPrivate.id = room.id;
            state.lastPrivate.name = room.name;
            state.lastPrivate.ownerId = room.ownerId;
        },
        setLastRoom(state, room: Room) {
            console.log('setLastRoom: ', room);
            state.lastRoom.id = room.id;
            state.lastRoom.name = room.name;
            state.lastRoom.ownerId = room.ownerId;
        },
        setRooms(state, rooms: Room[]) {
            console.log('setRooms: ', rooms);
            state.rooms = rooms;
        },
        addRoom(state, room: Room) {
            console.log('addRoom: ', room);
            state.rooms.push(room);
        },
        delRoom(state, room: Room) {
            console.log('delRoom: ', room);
            const index = state.rooms.indexOf(room);
            if (index >= 0) {
                state.rooms.splice(index, index);
            }
        },
        setPrivate(state, rooms: Room[]) {
            console.log('setRooms: ', rooms);
            state.private = rooms;
        },
        addPrivate(state, room: Room) {
            console.log('addPrivate: ', room);
            state.private.push(room);
        },
        setFriend(state, users: User[]) {
            console.log('setFriend: ', users);
            state.user.friend = users;
            state.user.friendBy = users;
        },
        setBlocked(state, users: User[]) {
            console.log('setBlocked: ', users);
            state.user.friend = users;
            state.user.friendBy = users;
        },
        setUser(state, user: User) {
            console.log('setUser: ', user);
            // state.user.id = user.id;
            // state.user.created_at = user.created_at;
            state.user.updated_at = user.updated_at;
            state.user.email = user.email;
            state.user.username = user.username;
            state.user.chatSocket = user.chatSocket;
            state.user.gameSocket = user.gameSocket;
            state.user.loggedIn = user.loggedIn;
            state.user.bio = user.bio;
            state.user.img = user.img;
            state.user.twoFA = user.twoFA;
            if (user.blocked)
                state.user.blocked = user.blocked;
            if (user.friend)
                state.user.friend = user.friend;
            if (user.rooms) {
                state.user.rooms = user.rooms;
            }
        },
        delUser(state) {
            state.user = {} as User;
        },
        setUserID(state, id: number) {
            state.user.id = id;
        },
        setLogged(state, islog: boolean) {
            state.user.loggedIn = islog;
        },
        setUsername(state, username: string) {
            state.user.username = username;
        },
        setEmail(state, email: string) {
            state.user.email = email;
        },
        setHash(state, hash: string) {
            state.user.hash = hash;
        },
        setHashRt(state, hashRt: string) {
            state.user.hashRt = hashRt;
        },
        setChatSocket (state, chatSocket: string) {
            state.user.chatSocket = chatSocket;
        },
        setAvatarId (state, avatarId: string) {
            state.user.img = avatarId;
        },
        setBio (state, description: string) {
            state.user.bio = description;
        },
    },
})

export default store;