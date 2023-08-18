<script lang="ts">
import { defineComponent } from 'vue';
import axios, { AxiosResponse, AxiosError } from 'axios';
import store from '@/store';
import router from '@/router';
import socket from "@/utils/socket"

export default defineComponent ({
  name: "LogoutCompon",
  methods: {
    async LogoutPost() {
      console.log("LogoutPost")
      
      await axios.post("api/auth/logout", {}, {
          timeout: 1000,
          headers: {"Authorization": `Bearer ${store.state.user.hash}`}
      })
      .then((response: AxiosResponse) => {
          console.log(response)
          store.commit("setHash", "");
          store.commit("setHashRt", "");
          store.commit("setLogged", false);
          store.commit("setUsername", "");
          store.commit("delUser", false);
          if (socket.connected)
            socket.disconnect();
          console.log(store.state.user) // -> empty
          router.push("/");
      })
      .catch((error: AxiosError) => {
          console.log(error)
          throw new Error("Logout failed: " + error);
      })
    },
  },
});
</script>