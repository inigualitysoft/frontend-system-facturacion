import JWT from 'jwt-client'
import { RouteLocationNormalized, NavigationGuardNext } from 'vue-router';

const isAuthenticated = (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
  if ( to.meta.requiresAuth ) {
    const token = JSON.parse(localStorage.getItem('auth/user') as string);
    if (token){
      try{
        var jwtValue = JWT.read(token.token);
        JWT.validate(jwtValue);

        //Validar a que no accedan a rutas no permitidas
        const permisos = JSON.parse(localStorage.getItem('auth/user') as string).permisos
        if(permisos.includes(to.name) || to.name == 'dashboard'){
          return next();
        }else{
          let listRolPermisosByUsuarioFilter: string[] = [];
          permisos.map(function( x: string ){
            if(x.includes('index')){
              listRolPermisosByUsuarioFilter.push(x);
            }
          })
          next({name: listRolPermisosByUsuarioFilter[0]});
        }

      }catch (e) {
        next('/login');
      }
    }else{
      next('/login');
    }
  }else{
    next();
  }
}

export default isAuthenticated;
