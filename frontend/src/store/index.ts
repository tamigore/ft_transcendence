import { createStore } from 'vuex';
import { User, Room, Message, Game } from '../utils/interfaces';

const store = createStore({
    state: {
        user: {} as User,
		game: {} as Game,
        messages: [{}] as Message[],
        rooms: [{}] as Room[],
        connected: false as boolean,
        ingame: false as boolean,
        gameParam: {
            multi: false as boolean,
            boxe: false as boolean,
            solo: false as boolean,
            wall: false as boolean,
            noPlayer: false as boolean,
            score: [0, 0] as number[],
        },
        last_room: {} as Room,
        last_message: {} as Message,
    },
    mutations: {
        setGame : function (state, game: Game) {
            state.game = game;
        },
        setGameParam : function (state, gameParam: {
            multi: boolean,
            boxe: boolean,
            solo: boolean,
            wall: boolean,
            noPlayer: boolean,
            score: number[],
        }) {
            state.gameParam = gameParam;
        },
        resetGameParam : function (state) {
            state.gameParam = {
                multi: false as boolean,
                boxe: false as boolean,
                solo: false as boolean,
                wall: false as boolean,
                noPlayer: false as boolean,
                score: [0, 0] as number[],
            }
        },
        setChatConnect : function (state, chatConnect: boolean) {
            state.connected = chatConnect;
        },
		setGameConnect : function (state, ingame: boolean) {
            state.ingame = ingame;
        },
        setLastRoom: function (state, room: Room) {
            console.log('setLastRoom: ', room);
            state.last_room.id = room.id;
            state.last_room.name = room.name;
            state.last_room.ownerId = room.ownerId;
            state.last_room.description = room.description;
        },
        setRooms: function (state, rooms: Room[]) {
            console.log('setRooms: ', rooms);
            state.rooms = rooms;
        },
        addRoom: function (state, room: Room) {
            console.log('addRoom: ', room);
            state.rooms.push(room);
        },
        setUser: function (state, user: User) {
            console.log('setUser: ', user);
            state.user.id = user.id;
            state.user.created_at = user.created_at;
            state.user.updated_at = user.updated_at;
            state.user.email = user.email;
            state.user.username = user.username;
            // state.user.hash = user.hash;
            // state.user.hashRt = user.hashRt;
            state.user.chatSocket = user.chatSocket;
            state.user.gameSocket = user.gameSocket;
            state.user.loggedIn = user.loggedIn;
            state.user.bio = user.bio;
            state.user.img = user.img;
        },
        delUser: function (state) {
            console.log('delUser');
            state.user = {} as User;
        },
        setUserID: function (state, id: number) {
            state.user.id = id;
        },
        setLogged: function (state, islog: boolean) {
            state.user.loggedIn = islog;
        },
        setUsername: function (state, username: string) {
            state.user.username = username;
        },
        setEmail: function (state, email: string) {
            state.user.email = email;
        },
        setHash: function (state, hash: string) {
            state.user.hash = hash;
        },
        setHashRt: function (state, hashRt: string) {
            state.user.hashRt = hashRt;
        },
        setChatSocket : function (state, chatSocket: string) {
            state.user.chatSocket = chatSocket;
        },
		setGameSocket : function (state, gameSocket: string) {
            state.user.gameSocket = gameSocket;
        },
        setAvatarId : function (state, avatarId: string) {
            state.user.img = avatarId;
        },
        setBio : function (state, description: string) {
            state.user.bio = description;
        },
        addMessage : function (state, chatMessage: Message) {
            state.messages.push(chatMessage);
        },
        setMessages : function (state, chatMessages: Message[]) {
            state.messages = chatMessages;
        },
        setLastMessage : function (state, chatMessages: Message) {
            state.last_message = chatMessages;
        },
    },
})

export default store;