<template>
	<div>
		<Chat />
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import axios, { AxiosResponse, AxiosError } from 'axios';
import { server } from "@/utils/helper";
import store from '@/store';
import Chat from '@/components/Chat.vue';

export default defineComponent ({
	components: {
		Chat
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
	methods: {
		async fetchUsers() {
			this.updatingData = true;
			const author = "Bearer " + store.state.user.hash;
			axios.defaults.baseURL = server.nestUrl;
			await axios.get('/api/user/', {
				headers: { 'Authorization': + author },
			})
			.then((response: AxiosResponse) => {
				this.updatingData = false;
				this.users = response.data;
				console.log("fetchUsers response users: ", this.users);
			})
			.catch((error: AxiosError) => {
				console.log("fetchUsers error: ", error);
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
