import { useAuthUserStore } from "stores/auth-user"

const useRolPermisos = () => {

    const authUserStore = useAuthUserStore();

    const validarPermisos = ( permiso ) => {
      if(authUserStore.permisos !== null && authUserStore.permisos.includes( permiso ))
        return true;
      else
        return false;
    }

    return{
      validarPermisos
    }
}

export default useRolPermisos
