import { boot } from 'quasar/wrappers';
import axios, { AxiosInstance } from 'axios';
import JWT from 'jwt-client'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

const api = axios.create({
  baseURL: `${import.meta.env.VITE_BASE_URL}/api`,
  headers: {'Content-Type': 'application/json'}
});

api.interceptors.request.use(async function(config) {
	let token = await JSON.parse(sessionStorage.getItem('auth/user') as string);
  let claim: any = null;

  claim = (token != null && token.token != '' ) ? JWT.read( token.token ) : null;
  token =  token != null ? token.token : '';

	config.headers.Authorization = token ? `${token}` : null;
	config.headers['rol-name'] = claim != null ? `${ claim.claim.roles[0] }` : null;

  if ( claim != null && claim.claim.roles[0] != 'SUPER-ADMINISTRADOR' &&
  claim.claim.roles[0] != 'ADMINISTRADOR')
      config.headers['sucursal-id'] = (claim != null && claim.claim.sucursales.length != 0 )
                                    ? `${ claim.claim.sucursales[0] }`
                                    : null;

  if ( claim != null && claim.claim.roles[0] != 'SUPER-ADMINISTRADOR' &&
  claim.claim.roles[0] != 'ADMINISTRADOR')
      config.headers['company-id'] = (claim != null && claim.claim.company )
                                    ? `${ claim.claim.company.id }`
                                    : null;
  // else
  //   config.headers.company_id = claim.claim.company.id
  // console.log(config.headers.NotSetHeaderCompany);
  // if ( claim != null ){
  //   if(!config.headers.NotSetHeaderCompany )
  //     config.headers.company_id = claim != null ? `${ claim.claim.company.id }` : null;
  // }

	return config;
});

export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
});

export { api };
