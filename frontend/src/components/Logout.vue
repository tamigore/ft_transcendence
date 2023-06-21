<script lang="ts">
import { defineComponent } from 'vue';
import axios, { AxiosResponse, AxiosError } from 'axios';
import store from '@/store';
import { server } from "@/helper";
import router from '@/router';

export default defineComponent ({
  name: "LogoutCompon",
  methods: {
    async LogoutPost() {
        axios.defaults.baseURL = server.nestUrl;
        await axios.post("api/auth/logout", {}, {
            timeout: 1000,
            headers: {"Authorization": `Bearer ${store.state.user.hash}`}
        })
        .then((response: AxiosResponse) => {
            console.log(response)
            store.commit("setHash", "");
            store.commit("setHashRT", "");
            store.commit("setLogged", false);
            console.log(store.state.user.logged) // -> 0
            router.push("/");
        })
        .catch((error: AxiosError) => {
            console.log(error)
            throw new Error("Logout failed: " + error);
        })
        store.commit("setUsername", "");
    },
  },
});
</script>