import { defineStore } from 'pinia';

export const useAuthUserStore = defineStore('auth/user', {
  state: (): { token: string, modeDark: boolean } => ({
    token: '',
    modeDark: true
  }),
  persist: {
    storage: sessionStorage,
  },
  getters: { },
  actions: {
    setToken(token: string) {
      this.token = token;
    },
    setModeDark(mode: boolean) {
      this.modeDark = mode;
    }
  },
});
