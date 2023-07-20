import { createStore } from 'vuex';
import { User, Room, Message } from '../utils/interfaces';

const store = createStore({
    state: {
        user: {} as User,
        messages: [{}] as Message[],
        rooms: [{}] as Room[],
        connected: false as boolean,
        last_room: {} as Room,
    },
    mutations: {
        setUser: function (state, user) {
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
        setChatConnect : function (state, chatConnect: boolean) {
            state.connected = chatConnect;
        },
        setChatSocket : function (state, chatSocket: string) {
            state.user.chatSocket = chatSocket;
        },
        setMessages : function (state, chatMessage: Message) {
            state.messages.push(chatMessage);
        },
        setAvatarId : function (state, avatarId: string) {
            state.user.img = avatarId;
        },
        setDescription : function (state, description: string) {
            state.user.bio = description;
        },
    },
})

export default store;