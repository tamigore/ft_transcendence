import { ref } from 'vue';
import { createStore } from 'vuex';

const store = createStore({
    state: {
        socketMessage: '',
        status: '',
        isConnected: false,
        isLoggedIn: false,
        guest: false, 
        isEnterCode: false,
        user: {
            id: '',
            login42: '',
            avatar42: '',
            wins: 0,
            losses: 0,
            total_games: 0,
            score: 0,
            ladderpos: 0,
            status: '',
            isTwoFactorAuthentificationEnabled: false,
            access_token: '',
            refresh_token: '',
            username: '',
            avatarId: '',
            qrcode: ref(null),
            avatar: ref(null),
            watchGame: '',
        },
        allUsers: [
            { id: '', username: '', status: ''}
        ],
        friendsList: [
            {username: '', status: ''}
        ],
        matchHistory: [
            '',
        ],
        avatarProfile: ref(null),
    },
    mutations: {
        SOCKET_CONNECT(state) {
            state.isConnected = true;
        },
        SOCKET_DISCONNECT(state) {
            state.isConnected = false;
        },
        SOCKET_MESSAGECHANNEL(state, message) {
            state.socketMessage = message
        },
        updateWatchGame: function (state, game) {
            state.user.watchGame = game;
        },
        isEnterCodecommit: function (state, code) {
            state.isEnterCode = code;
        },
        clearMatchHistory: function (state) {
            state.matchHistory = [];
        },
        addMatchHistory: function (state, match) {
            state.matchHistory.push(match);
        },
        clearFriends: function (state) {
            state.friendsList = [];
        },
        addFriend: function (state, user ) {
            state.friendsList.push(user);
        },
        clearUsers: function ( state) {
            state.allUsers = [];
        },
        addUsers: function (state, user) {
            state.allUsers.push(user);
        },
        logoutUser: function (state) {
            if (state.guest == false)
                localStorage.clear();
            state.user.id = '';
            state.user.login42 = '';
            state.user.avatar42 = '';
            state.user.wins = 0;
            state.user.losses = 0;
            state.user.total_games = 0;
            state.user.score = 0;
            state.user.ladderpos = 0;
            state.user.status = '';
            state.user.isTwoFactorAuthentificationEnabled = false;
            state.user.access_token = '';
            state.user.refresh_token = '';
            state.user.username = '';
            state.user.avatarId = '';
            state.user.qrcode = ref(null);
        },
        setStatus: function (state, status) {
            state.status = status;
        },
        logUserGuest(state, user ) {
            state.user = user;
            state.guest = true;
        },
        logUser: function (state, user) {
            localStorage.setItem('user', JSON.stringify(user));
            state.user = user;
        },
        isLogged: function (state, islog) {
            state.isLoggedIn = islog;
        },
        updateUsername: function (state, username) {
            state.user.username = username;
        },
        update2Factor: function (state, TwoFactor) {
            state.user.isTwoFactorAuthentificationEnabled = TwoFactor;
        },
        updateQrCode: function (state, qrcode) {
            const test = ref(null);
            test.value = qrcode;
            state.user.qrcode = test;
        },
        updateAvatarId: function(state, avatarID) {
            state.user.avatarId = avatarID;
        },
        updateavatarProfile: function(state, avatar) {
            const test = ref(null);
            test.value = avatar;
            state.avatarProfile = test;
        },
        updateVictory: function(state, victory) {
            state.user.wins = victory;
        },
        updateLoose: function(state, losses) {
            state.user.losses = losses;
        },
        updateGamesPlayed: function(state, games) {
            state.user.total_games = games;
        },
        updateLadderPos: function (state, pos) {
            state.user.ladderpos = pos;
        },
        updateScore: function (state, score) {
            state.user.score = score;
        },
        updateStatus: function (state, status) {
            state.user.status = status;
        }
    },
})

export default store;