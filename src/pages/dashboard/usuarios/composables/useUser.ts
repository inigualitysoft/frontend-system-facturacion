import { ref } from "vue"
import useHelpers from "../../../../composables/useHelpers";
import { api } from "boot/axios";
import { useRouter } from "vue-router";

export interface User {
  id?:                  string;
  usuario:              string;
  email:                string;
  cedula:               string;
  celular:              string;
  fullName:             string;
  facebook:             string;
  twitter:              string;
  roles:                string[];
  permisos:             string[];
  horarios_dias:        string[];
  horarios_time:        string[];
  receiveSupportEmail:  boolean;
  company:              string;
  sucursales:           string[];
  password?:            string;
  confirmPassword?:     string;
  created_at?:          Date;
  updated_at?:          Date;
  isActive?:            boolean;
}

const loading = ref( false );   

const formUser = ref<User>({
  usuario: '',
  email: '',
  cedula: '',
  celular: '',
  fullName: '',
  facebook: '',
  twitter: '',
  roles: [''],
  permisos: [],
  horarios_dias: [],
  horarios_time: ['', ''],
  receiveSupportEmail: false,
  company: '',
  sucursales: [],
  password: '',
  confirmPassword: '',
  isActive: true
})

const getCompanies = async () => {
  const { data } = await api.get('/companies');
  return data;
}

export const useUser = () => {

    const { mostrarNotify } = useHelpers();
    const router = useRouter();

    const limpiarFormulario = () => {
      formUser.value.email = '';
      formUser.value.password = '';
      formUser.value.cedula = '';
      formUser.value.celular = '';
      formUser.value.fullName = '';
      formUser.value.usuario = '';
      formUser.value.company = '';
      formUser.value.facebook = '';
      formUser.value.twitter = '';
      formUser.value.roles = [''];
      formUser.value.permisos = [];
      formUser.value.horarios_dias = [];
      formUser.value.horarios_time = [];
      formUser.value.receiveSupportEmail = false;
    }

    const onSubmit = async ( edit: boolean ) => {
      if( formUser.value.password !== formUser.value.confirmPassword )
        return mostrarNotify( 'warning', 'Las contraseñas no coinciden, por favor verificar' );
      if( formUser.value.company.length === 0 )
        return mostrarNotify( 'warning', 'Debes elegir una empresa' );
      if( formUser.value.roles[0] === '' &&  formUser.value.company !== 'Nuevo')
        return mostrarNotify( 'warning', 'Debes elegir un rol' );

      if( formUser.value.roles[0] !== 'Administrador' && 
          formUser.value.sucursales.length === 0 )
        return mostrarNotify( 'warning', 'Debes elegir alguna sucursal' );

      if ( formUser.value.roles[0] == 'Administrador' || 
          formUser.value.roles[0] == 'Super-Administrador' ) {
        formUser.value.sucursales = [];
      }

      if( formUser.value.permisos.length === 0 )
        return mostrarNotify( 'warning', 'Debes elegir al menos un permiso' );
  
      try {
        loading.value = true;
        
        if ( !edit ) 
          await api.post('/auth/register', formUser.value);
        else
          await api.patch('/auth/edit/' + formUser.value.id, formUser.value);
    
        mostrarNotify( 'positive', `Usuario ${ edit ? 'editado' : 'creado' } exitosamente.` )
    
        loading.value = false;
        router.push({ name: 'Ver Usuarios' });
      } catch (error: any) {
        loading.value = false;
        mostrarNotify( 'warning', error.response.data.message )
      }
    }

    const allowOnlyNumber = () => {
      formUser.value.celular = formUser.value.celular.replace(/\D/g, '');
		}

    const transformToUpperCase = () => {
      formUser.value.fullName = formUser.value.fullName.toUpperCase()
		}

    return {
      getCompanies,
      formUser,
      loading,
      limpiarFormulario,
      expanded: ref(['Seleccionar todos los permisos']),
      allowOnlyNumber,
      transformToUpperCase,
      onSubmit,
      validateNumCelular: [ (val: any) => val.length >= 10 || 'Debes completar 10 digitos' ],
      showPass: ref( true ),
      showConfirmPass: ref( true ),
    }
}
