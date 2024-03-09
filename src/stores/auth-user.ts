import { defineStore } from 'pinia';

export const useAuthUserStore = defineStore('auth/user', {
  state: (): { token: string, permisos: string[], modeDark: boolean } => ({
    token: '',
    permisos: [],
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
    setPermisos(permisos: string[]) {
      this.permisos = permisos;
    },
    setModeDark(mode: boolean) {
      this.modeDark = mode;
    }
  },
});
