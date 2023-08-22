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
          console.log(`LogoutPost response.data: ${response.data}`);
          store.commit("setHash", "");
          store.commit("setHashRt", "");
          store.commit("setLogged", false);
          store.commit("setUsername", "");
          store.commit("delUser", false);
          if (socket.connected)
            socket.disconnect();
          router.push("/");
      })
      .catch((error: AxiosError) => {
          throw new Error("Logout failed: " + error);
      })
    },
  },
});
</script>