import forge from "node-forge";
import { onMounted, ref } from "vue"
import useHelpers from "../../../../composables/useHelpers";
import { api } from "boot/axios";
import { useRouter } from "vue-router";

const formEmpresa = ref({
  id: '',
  ruc: '',
  nombre_comercial: '',
  razon_social: '',
  direccion_matriz: '',
  obligado_contabilidad: false,
  email: '',
  telefono: '',
  clave_certificado: '',
  archivo_certificado: null,
  archivo_certificado_old: null,
  logo: null,
  logo_old: null
})

const validaciones = ref({
  id:                       { message: '', isValid: true },
  ruc:                      { message: '', isValid: true },
  nombre_comercial:         { message: '', isValid: true },
  razon_social:             { message: '', isValid: true },
  direccion_matriz:         { message: '', isValid: true },
  obligado_contabilidad:    { message: '', isValid: true },
  email:                    { message: '', isValid: true },
  telefono:                 { message: '', isValid: true },
  clave_certificado:        { message: '', isValid: true },
  archivo_certificado:      { message: '', isValid: true },
  archivo_certificado_old:  { message: '', isValid: true },
  logo:                     { message: '', isValid: true },
  logo_old:                 { message: '', isValid: true }
})

const loading  = ref( false );  
const isPwd = ref( true );
const isValid = ref( false );

export const useEmpresa = () => {

    const { mostrarNotify } = useHelpers();
    const router = useRouter();
    const existError = ref(false);

    const camposRequeridos = ['ruc', 'razon_social', 'nombre_comercial', 'direccion_matriz', 'email', 'telefono', 'clave_certificado']

    const validarCampos = ( edit ) => {
      existError.value = false;      
      var validEmail =  /^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/;

      camposRequeridos.forEach( campo => {
        if ( formEmpresa.value[campo].length == 0 ) {
          validaciones.value[campo].message = 'Debes completar este campo'
          validaciones.value[campo].isValid = false;
          existError.value = true;
        }
      })

      if( validaciones.value.ruc.isValid && formEmpresa.value.ruc.length < 13 ){
        validaciones.value.ruc.message = 'Ingresa un numero R.U.C valido'
        validaciones.value.ruc.isValid = false
        existError.value = true;        
      }else if( validaciones.value.ruc.isValid ){
        if(formEmpresa.value.ruc.substr(-3, 3) != '001'){
          validaciones.value.ruc.message = 'El numero R.U.C debe terminar en 001'
          validaciones.value.ruc.isValid = false
          existError.value = true;        
        }
      }

      if( validaciones.value.email.isValid && !validEmail.test(formEmpresa.value.email) ){
        validaciones.value.email.message = 'Ingresa un email valido'
        validaciones.value.email.isValid = false
        existError.value = true;        
      }

      if ( !edit && formEmpresa.value.logo !== null ){
        const image = new Image();

        image.onload = function () {
          const width = this.width;
          const height = this.height;

          if (width >= 206 || height >= 206) {
            validaciones.value.logo.message = 'La imagen supera las medidas requeridas(menor a 200px por 200px)'
            validaciones.value.logo.isValid = false
            existError.value = true;        
          }else if( validaciones.value.logo.isValid && (formEmpresa.value.logo.size / 1024) > 105 ){
            validaciones.value.logo.message = 'La imagen supera el tamaño permitido (100KB)'
            validaciones.value.logo.isValid = false
            existError.value = true;   
          }else{
            validaciones.value.logo.isValid = true
            existError.value = false; 
          }          
        }

        // Asignar el archivo a la imagen para obtener las dimensiones
        const reader = new FileReader();
        reader.onload = function (e) {
          image.src = e.target.result;
        };
        reader.readAsDataURL( formEmpresa.value.logo );
      }else{
        validaciones.value.logo.isValid = true
        existError.value = false; 
      } 

      if ( !edit && formEmpresa.value.archivo_certificado == null ){
        validaciones.value.archivo_certificado.message = 'Debes adjuntar el certificado'
        validaciones.value.archivo_certificado.isValid = false
        existError.value = true;        
      } 

      if ( !edit && formEmpresa.value.archivo_certificado !== null && formEmpresa.value.clave_certificado.length !== 0 ){
        const reader = new FileReader();

        reader.onloadend = async function (e) {
          var buffer = forge.util.decode64(e.target.result.split(',')[1]);

          try { 
            var p12Asn1 = forge.asn1.fromDer(buffer);
            forge.pkcs12.pkcs12FromAsn1(p12Asn1, formEmpresa.value.clave_certificado);
          } catch (error) {
            validaciones.value.clave_certificado.message = 'La contraseña del certificado es incorrecta'
            validaciones.value.clave_certificado.isValid = false
            existError.value = true;                      
          }            
        }
        reader.readAsDataURL( formEmpresa.value.archivo_certificado );
      } 

      return existError.value;
    }

    onMounted(() => {
      camposRequeridos.forEach( campo => { validaciones.value[campo].isValid = true; })
      validaciones.value['archivo_certificado'].isValid = true;
    });

    const limpiarFormulario = () => {
      formEmpresa.value.id                      = '';
      formEmpresa.value.ruc                     = '';
      formEmpresa.value.nombre_comercial        = '';
      formEmpresa.value.razon_social            = '';
      formEmpresa.value.direccion_matriz        = '';
      formEmpresa.value.obligado_contabilidad   = false;
      formEmpresa.value.email                   = '';
      formEmpresa.value.telefono                = '';
      formEmpresa.value.clave_certificado       = '';
      formEmpresa.value.archivo_certificado     = null;
      formEmpresa.value.archivo_certificado_old = null;
      formEmpresa.value.logo            = null;
      formEmpresa.value.logo_old        = null;
    }

    const validateNumRuc = [ (val) => val.length >= 13 || 'Debes completar 13 digitos' ];
    const validateNumCelular = [ (val) => val.length >= 10 || 'Debes completar 10 digitos' ];
  
    const onRejected = () => {
      mostrarNotify( 'negative', `El tipo de archivo es invalido` );
    }

    const onSubmit = async ( edit ) => {
      
      if ( validarCampos( edit ) ) return;
      
      loading.value = true;

      let formData = new FormData();
      formData.append('id', formEmpresa.value.id);
      formData.append('ruc', formEmpresa.value.ruc);
      formData.append('nombre_comercial', formEmpresa.value.nombre_comercial.toUpperCase());
      formData.append('razon_social', formEmpresa.value.razon_social.toUpperCase());
      formData.append('direccion_matriz', formEmpresa.value.direccion_matriz)
      formData.append('obligado_contabilidad', formEmpresa.value.obligado_contabilidad);
      formData.append('email', formEmpresa.value.email);
      formData.append('telefono', formEmpresa.value.telefono);
      formData.append('clave_certificado', formEmpresa.value.clave_certificado);
      formData.append('archivo_certificado', formEmpresa.value.archivo_certificado);
      formData.append('archivo_certificado_old', formEmpresa.value.archivo_certificado_old);
      formData.append('logo', formEmpresa.value.logo);
      formData.append('logo_old', formEmpresa.value.logo_old);
  
      try {

        if ( !edit ) 
          await api.post('/companies', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        else
          await api.post(`/companies/${ formEmpresa.value.id }`, 
          formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  
        mostrarNotify( 'positive', `Empresa ${ edit ? 'editado' : 'agregado' } exitosamente` );
        router.push({ name: 'Ver Empresas' });

        loading.value = false;
      } catch ( error ) {
        mostrarNotify( 'warning', error.response.data.message );   
        loading.value = false;   
      }
    }
    
    return {
      api,
      formEmpresa,
      loading,
      limpiarFormulario,
      validaciones,
      validateNumRuc,
      validateNumCelular,
      onRejected,
      onSubmit,
      isPwd,
      isValid
    }
}
