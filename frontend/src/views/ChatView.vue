<template>
	<div>
		<div
			class="chat-container"
			:class="{ 'chat-mobile': isSmallDevice, 'chat-mobile-dark': theme === 'dark' }"
		>
			<span
				v-if="showOptions"
				class="user-logged"
				:class="{ 'user-logged-dark': theme === 'dark' }"
			>
				Logged as
			</span>
			<select v-if="showOptions" v-model="currentUserId">
				<option v-for="user in users" :key="user.id" :value="user.id">
					{{ user.username }}
				</option>
			</select>

			<div v-if="showOptions" class="button-theme">
				<button class="button-light" @click="theme = 'light'">
					Light
				</button>
				<button class="button-dark" @click="theme = 'dark'">
					Dark
				</button>
			</div>

			<MessagesDisplay />

		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import axios, { AxiosResponse, AxiosError } from 'axios';
import { server } from "@/utils/helper";
import store from '@/store';
import MessagesDisplay from '@/components/MessagesDisplay.vue';

export default defineComponent ({
	components: {
		MessagesDisplay
	},

	data() {
		return {
			theme: 'dark',
			showChat: true,
			users: null,
			currentUserId: store.state.user.id,
			isSmallDevice: false,
			updatingData: false
		}
	},

    created() {
        this.fetchUsers()
    },

	computed: {
		showOptions() {
			return !this.isSmallDevice
		}
	},

	watch: {
		currentUserId() {
			this.showChat = false
			setTimeout(() => (this.showChat = true), 150)
		}
	},

	mounted() {
		this.isSmallDevice = window.innerWidth < 500
		window.addEventListener('resize', ev => {
			if (ev.isTrusted)
                this.isSmallDevice = window.innerWidth < 500
		})
	},

	methods: {
        async fetchUsers() {
            this.updatingData = true;
            axios.defaults.baseURL = server.nestUrl;
            await axios.get('/api/user', {
                // headers: {'access-control-allow-origin': '*'},
                params: { loggedIn: true },
            })
            .then((response: AxiosResponse) => {
                this.updatingData = false;
                this.users = response.data;
            })
            .catch((error: AxiosError) => {
                console.log(error);
                window.alert("No users registered");
            })
        },
    },
});
</script>

<style lang="scss">
body {
	background: #fafafa;
	margin: 0;
}

.chat-container {
	font-family: 'Quicksand', sans-serif;
	padding: 20px 30px 30px;
}

.chat-mobile {
	padding: 0;

	&.chat-mobile-dark {
		background: #131415;
	}

	.user-logged {
		margin: 10px 5px 0 10px;
	}

	select {
		margin: 10px 0;
	}

	.button-theme {
		margin: 10px 10px 0 0;

		.button-github {
			height: 23px;

			img {
				height: 23px;
			}
		}
	}
}

.user-logged {
	font-size: 12px;
	margin-right: 5px;
	margin-top: 10px;

	&.user-logged-dark {
		color: #fff;
	}
}

select {
	height: 20px;
	outline: none;
	border: 1px solid #e0e2e4;
	border-radius: 4px;
	background: #fff;
	margin-bottom: 20px;
}

.button-theme {
	float: right;
	display: flex;
	align-items: center;

	.button-light {
		background: #fff;
		border: 1px solid #46484e;
		color: #46484e;
	}

	.button-dark {
		background: #1c1d21;
		border: 1px solid #1c1d21;
	}

	button {
		color: #fff;
		outline: none;
		cursor: pointer;
		border-radius: 4px;
		padding: 6px 12px;
		margin-left: 10px;
		border: none;
		font-size: 14px;
		transition: 0.3s;
		vertical-align: middle;

		&.button-github {
			height: 30px;
			background: none;
			padding: 0;
			margin-left: 20px;

			img {
				height: 30px;
			}
		}

		&:hover {
			opacity: 0.8;
		}

		&:active {
			opacity: 0.6;
		}

		@media only screen and (max-width: 768px) {
			padding: 3px 6px;
			font-size: 13px;
		}
	}
}

.version-container {
	padding-top: 20px;
	text-align: right;
	font-size: 14px;
	color: grey;
}
</style>
