import { createStore } from 'vuex';

const store = createStore({
    state: {
        user: {
            logged: false as boolean,
            username: "" as string,
            email: "" as string,
            description: "" as string,
            hash: "" as string,
            hashRT: "" as string,
            chatSocket: "" as string,
        },
        chat: {
            messages: [] as string[],
            channels: [] as string[],
            channel: "general" as string,
        }
    },
    mutations: {
        setLogged: function (state, islog: boolean) {
            state.user.logged = islog;
        },
        setChatSocket: function (state, socket: string) {
            state.user.chatSocket = socket;
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
    },
})

export default store;