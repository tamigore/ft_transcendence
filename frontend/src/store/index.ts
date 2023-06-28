import { createStore } from 'vuex';

const store = createStore({
    state: {
        user: {
            id: 0 as number,
            email: "" as string,
            username: "" as string,
            description: "" as string,
            hash: "" as string,
            hashRT: "" as string,
            chatSocket: "" as string,
            gameSocket: "" as string,
            avatar: "" as string,
            logged: false as boolean,
        },
        chat: {
            connected: false as boolean,
            socket: "" as string,
            messages: [] as {username: string, text: string, object: string, channel: string}[],
            channels: [] as string[],
            channel: "general" as string,
        },
    },
    mutations: {
        setUser: function (state, user){
            state.user.id = user.id;
            state.user.email = user.email;
            state.user.username = user.username;
            state.user.description = user.description;
            state.user.hash = user.hash;
            state.user.hashRT = user.hashRT;
            state.user.chatSocket = user.chatSocket;
            state.user.gameSocket = user.gameSocket;
            state.user.avatar = user.avatar;
            state.user.logged = user.logged;
        },
        setLogged: function (state, islog: boolean) {
            state.user.logged = islog;
        },
        setUsername: function (state, username: string) {
            state.user.username = username;
        },
        setHash: function (state, hash: string) {
            state.user.hash = hash;
        },
        setHashRT: function (state, hashRT: string) {
            state.user.hashRT = hashRT;
        },
        setChatConnect : function (state, chatConnect: boolean) {
            state.chat.connected = chatConnect;
        },
        setChatSocket : function (state, chatSocket: string) {
            state.chat.socket = chatSocket;
            state.user.chatSocket = chatSocket;
        },
        setChatMessages : function (state, chatMessage: {username: string, text: string, object: string, channel: string}) {
            state.chat.messages.push(chatMessage);
        },
        setChatChannels : function (state, chatChannel: string) {
            state.chat.channels.push(chatChannel);
        },
        setChatChannel : function (state, chatChannel: string) {
            state.chat.channel = chatChannel;
        },
    },
})

export default store;