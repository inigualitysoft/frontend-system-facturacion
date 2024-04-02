import { ref } from "vue"
import useHelpers from "../../../../composables/useHelpers";

const loading = ref( false );

const formUser = ref({
  usuario: '',
  email: '',
  cedula: '',
  celular: '',
  fullName: '',
  roles: [''],
  permisos: [''],
  horarios_dias: [],
  horarios_time: ['', ''],
  receiveSupportEmail: false,
  company: '',
  sucursales: [''],
  password: '',
  confirmPassword: '',
  foto: null,
  foto_old: null,
  isActive: true
})

const validaciones = ref({
  usuario:             { message: '', isValid: true },
  email:               { message: '', isValid: true },
  cedula:              { message: '', isValid: true },
  celular:             { message: '', isValid: true },
  fullName:            { message: '', isValid: true },
  roles:               { message: '', isValid: true },
  permisos:            { message: '', isValid: true },
  horarios_dias:       { message: '', isValid: true },
  foto:                { message: '', isValid: true },
  horarios_time:       { message: '', isValid: true },
  company:             { message: '', isValid: true },
  sucursales:          { message: '', isValid: true },
  password:            { message: '', isValid: true },
  confirmPassword:     { message: '', isValid: true }
})

export const useUser = () => {

    const { api, claim, mostrarNotify, router, route } = useHelpers();

    const getCompanies = async () => {
      let data;

      if (claim.roles[0] == 'SUPER-ADMINISTRADOR')
        data = await api.get('/companies');
      else
        data = await api.get(`/companies/find/${ claim.company.id }`);

      return data.data;
    }

    const limpiarFormulario = () => {
      formUser.value.email = '';
      formUser.value.password = '';
      formUser.value.cedula = '';
      formUser.value.celular = '';
      formUser.value.fullName = '';
      formUser.value.usuario = '';
      formUser.value.company = '';
      formUser.value.roles = [''];
      formUser.value.permisos = [];
      formUser.value.horarios_dias = [];
      formUser.value.horarios_time = [];
      formUser.value.receiveSupportEmail = false;
      formUser.value.foto = null
      formUser.value.foto_old = null
    }

    const onRejected = () => {
      mostrarNotify( 'negative', `El tipo de archivo es invalido` );
    }

    const validarCampos = ( edit ) => {
      let existError = false;
      var validEmail =  /^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/;

      const camposRequeridos = ['fullName', 'usuario', 'celular', 'company', 'confirmPassword', 'password', 'email']

      camposRequeridos.forEach( campo => {
        if ( ( !edit && ( campo != 'password' || campo != 'confirmPassword') ) && formUser.value[campo].length == 0 ) {
          validaciones.value[campo].message = 'Debes completar este campo'
          validaciones.value[campo].isValid = false;
          existError = true;
        }
      })

      if ( formUser.value.company.length != 0 && formUser.value.roles[0].length == 0 ) {
        validaciones.value.roles.message = 'Debes elegir un Rol'
        validaciones.value.roles.isValid = false
        existError = true;
      }

      if( formUser.value.company.length !== 0 &&
        formUser.value.roles[0] !== 'SUPER-ADMINISTRADOR' &&
        formUser.value.roles[0] !== 'ADMINISTRADOR' &&
        formUser.value.sucursales[0].length === 0 ){
        validaciones.value.sucursales.message = 'Debes elegir una sucursal'
        validaciones.value.sucursales.isValid = false
        existError = true;
      }

      if ( formUser.value.roles[0] == 'SUPER-ADMINISTRADOR' || formUser.value.roles[0] == 'ADMINISTRADOR' )
        formUser.value.sucursales = [];

      if (!edit) {
        if( validaciones.value.password.isValid && formUser.value.password.length < 8 ){
          validaciones.value.password.message = 'La contraseña debe tener minimo 8 caracter'
          validaciones.value.password.isValid = false
          existError = true;
        }

        if( validaciones.value.password.isValid && formUser.value.confirmPassword.length < 8 ){
          validaciones.value.confirmPassword.message = 'La contraseña debe tener minimo 8 caracter'
          validaciones.value.confirmPassword.isValid = false
          existError = true;
        }else if( formUser.value.password.length !== 0 && formUser.value.confirmPassword != formUser.value.password ){
          validaciones.value.confirmPassword.message = 'Las contraseñas no coinciden, verificar'
          validaciones.value.confirmPassword.isValid = false
          existError = true;
        }
      }else if(formUser.value.password != undefined){
        if( formUser.value.password.length > 0 && formUser.value.password.length < 8){
          validaciones.value.password.message = 'La contraseña debe tener minimo 8 caracter'
          validaciones.value.password.isValid = false
          existError = true;
        }
        if( formUser.value.confirmPassword.length > 0 && formUser.value.confirmPassword.length < 8){
          validaciones.value.confirmPassword.message = 'La contraseña debe tener minimo 8 caracter'
          validaciones.value.confirmPassword.isValid = false
          existError = true;
        }else if( formUser.value.confirmPassword != formUser.value.password ){
          validaciones.value.confirmPassword.message = 'Las contraseñas no coinciden, verificar'
          validaciones.value.confirmPassword.isValid = false
          existError = true;
        }
      }

      if( validaciones.value.email.isValid && !validEmail.test(formUser.value.email) ){
        validaciones.value.email.message = 'Ingresa un email valido'
        validaciones.value.email.isValid = false
        existError = true;
      }

      if ( formUser.value.permisos.length == 0 ) {
        validaciones.value.permisos.message = '*Debes elegir al menos un permiso'
        validaciones.value.permisos.isValid = false
        existError = true;
      }

      return existError;
    }

    const onSubmit = async ( edit ) => {

      if ( validarCampos( edit ) ) return

      try {
        loading.value = true;

        let formData = new FormData();
        formData.append('usuario', formUser.value.usuario);
        formData.append('email', formUser.value.email);
        formData.append('celular', formUser.value.celular);
        formData.append('fullName', formUser.value.fullName);
        formData.append('roles', JSON.stringify(formUser.value.roles));
        formData.append('permisos', JSON.stringify(formUser.value.permisos));
        formData.append('horarios_dias', JSON.stringify(formUser.value.horarios_dias));
        formData.append('horarios_time', JSON.stringify(formUser.value.horarios_time));
        formData.append('receiveSupportEmail', JSON.stringify(formUser.value.receiveSupportEmail));
        formData.append('company', formUser.value.company);
        formData.append('sucursales', JSON.stringify(formUser.value.sucursales));
        formData.append('password', formUser.value.password);
        formData.append('confirmPassword', JSON.stringify(formUser.value.confirmPassword));
        formData.append('foto', formUser.value.foto);
        formData.append('foto_old', formUser.value.foto_old);
        formData.append('isActive', JSON.stringify(formUser.value.isActive));

        if ( !edit )
          await api.post('/auth/register', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        else
          await api.patch('/auth/edit/' + formUser.value.id, formData, { headers: { 'Content-Type': 'multipart/form-data' } });

        mostrarNotify( 'positive', `Usuario ${ edit ? 'editado' : 'creado' } exitosamente.` )

        loading.value = false;
        router.push({ name: 'Ver Usuarios' });
      } catch (error) {
        console.log( error );
        loading.value = false;
        mostrarNotify( 'warning', error.response.data.message )
      }
    }

    return {
      api,
      getCompanies,
      formUser,
      loading,
      onRejected,
      limpiarFormulario,
      expanded: ref(['Seleccionar todos los permisos']),
      onSubmit,
      validaciones,
      route,
      showPass: ref( true ),
      showConfirmPass: ref( true ),
    }
}
