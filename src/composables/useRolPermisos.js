import JWT from 'jwt-client'
import { useAuthUserStore } from "stores/auth-user"

const useRolPermisos = () => {

    const authUserStore = useAuthUserStore();

    /**
     * El SUPER-ADMINISTRADOR no se valida contra la lista guardada en su rol: si
     * dependiera de ella, cada permiso nuevo (el de un módulo que se agrega)
     * quedaría oculto hasta que alguien reeditara y volviera a guardar el rol.
     */
    const esSuperAdministrador = () => {
      try {
        const { claim } = JWT.read( authUserStore.token );

        return claim?.roles?.[0] === 'SUPER-ADMINISTRADOR';
      } catch (error) {
        // Token vacío o ilegible: se resuelve por la lista de permisos.
        return false;
      }
    }

    const validarPermisos = ( permiso ) => {
      if ( permiso == 'sin-permiso' ) return true;

      if ( esSuperAdministrador() ) return true;

      return authUserStore.permisos !== null
        && authUserStore.permisos.includes( permiso );
    }

    return{
      validarPermisos,
      esSuperAdministrador
    }
}

export default useRolPermisos
