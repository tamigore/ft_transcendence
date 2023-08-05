import { createStore } from 'vuex';
import { User, Room, Message } from '../utils/interfaces';

const store = createStore({
    state: {
        user: {} as User,
        messages: [] as Message[],
        rooms: [] as Room[],
        private: [] as Room[],
        lastRoom: {} as Room,
        lastPrivate: {} as Room,
        lastMessage: {} as Message,
    },
    getters: {
        userInRoom: function (state, room: Room) {
            return room.users.find(user => user.id === state.user.id) ? true : false;
        },
    },
    mutations: {
        addMessage : function (state, chatMessage: Message) {
            state.messages.push(chatMessage);
        },
        setMessages : function (state, chatMessages: Message[]) {
            state.messages = chatMessages;
        },
        setLastMessage : function (state, chatMessages: Message) {
            state.lastMessage = chatMessages;
        },
        setLastPrivate: function (state, room: Room) {
            console.log('setLastPrivate: ', room);
            state.lastPrivate.id = room.id;
            state.lastPrivate.name = room.name;
            state.lastPrivate.ownerId = room.ownerId;
            state.lastPrivate.description = room.description;
        },
        setLastRoom: function (state, room: Room) {
            console.log('setLastRoom: ', room);
            state.lastRoom.id = room.id;
            state.lastRoom.name = room.name;
            state.lastRoom.ownerId = room.ownerId;
            state.lastRoom.description = room.description;
        },
        setRooms: function (state, rooms: Room[]) {
            console.log('setRooms: ', rooms);
            state.rooms = rooms;
        },
        addRoom: function (state, room: Room) {
            console.log('addRoom: ', room);
            state.rooms.push(room);
        },
        setPrivate: function (state, rooms: Room[]) {
            console.log('setRooms: ', rooms);
            state.private = rooms;
        },
        addPrivate: function (state, room: Room) {
            console.log('addRoom: ', room);
            state.private.push(room);
        },
        setUser: function (state, user: User) {
            console.log('setUser: ', user);
            state.user.id = user.id;
            state.user.created_at = user.created_at;
            state.user.updated_at = user.updated_at;
            state.user.email = user.email;
            state.user.username = user.username;
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
        setAvatarId : function (state, avatarId: string) {
            state.user.img = avatarId;
        },
        setBio : function (state, description: string) {
            state.user.bio = description;
        },
    },
})

export default store;