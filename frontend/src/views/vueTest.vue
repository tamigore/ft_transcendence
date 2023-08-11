async ModifyUserAvatarId(image) 
{
    this.ModifyStoreAvatarId(image.id);
    const user = store.state.user;
    axios.defaults.baseURL = server.nestUrl;
    await axios.post('/api/user/update', user,
      { headers: {"Authorization": `Bearer ${store.state.user.hash}`}})
    .then((response: AxiosResponse) => {
      console.log(response);
    })
    .catch((error: AxiosError) => {
      console.log(error);
    })
    this.showPopup = false;
},