import forge from "node-forge";
import { ref } from "vue"
import useHelpers from "../../../../composables/useHelpers";
import { api } from "boot/axios";

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

const loading  = ref( false );  
const modalAgregarEmpresa = ref(false);
const modalEditarEmpresa  = ref(false);
const actualizarLista     = ref(false);
const isPwd = ref( true );
const isValid = ref( false );

export const useEmpresa = () => {

    const { mostrarNotify }   = useHelpers();

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

    const allowOnlyNumber = () => {
      formEmpresa.value.ruc = formEmpresa.value.ruc.replace(/\D/g, '');
    }
    const validateNumRuc = [ (val: any) => val.length >= 13 || 'Debes completar 13 digitos' ];
    const validateNumCelular = [ (val: any) => val.length >= 10 || 'Debes completar 10 digitos' ];
  
    const transformToUpperCase = () => {
      formEmpresa.value.nombre_comercial = formEmpresa.value.nombre_comercial.toUpperCase()
      formEmpresa.value.razon_social = formEmpresa.value.razon_social.toUpperCase()
    }
  
    const onRejected = () => {
      mostrarNotify( 'negative', `El tipo de archivo es invalido` );
    }

    const validarCertificadoPass = ( file: any ) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onloadend = async function ( e: any ) {
          var buffer = forge.util.decode64(e.target.result.split(',')[1]);

          try { 
            var p12Asn1 = forge.asn1.fromDer(buffer);
            forge.pkcs12.pkcs12FromAsn1(p12Asn1, formEmpresa.value.clave_certificado);

            resolve( true );
          } catch (error) {
            reject( false );
          }            
        }

        reader.readAsDataURL(file);
      });
    }

    const onSubmit = async ( edit: boolean ) => {
      loading.value = true;

      if ( !edit && !formEmpresa.value.archivo_certificado)
        return mostrarNotify( 'warning', 'Debes adjuntar el certificado');

      if ( formEmpresa.value.archivo_certificado ) {
        try {
          await validarCertificadoPass( formEmpresa.value.archivo_certificado );
        } catch (error) {
          loading.value = false;
          return mostrarNotify( 'warning', 'La clave del certificado esta incorrecta');
        }        
      }

      let formData:any = new FormData();
      formData.append('id', formEmpresa.value.id);
      formData.append('ruc', formEmpresa.value.ruc);
      formData.append('nombre_comercial', formEmpresa.value.nombre_comercial);
      formData.append('razon_social', formEmpresa.value.razon_social);
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
        modalAgregarEmpresa.value  = false;
        modalEditarEmpresa.value   = false;
        actualizarLista.value      = true

        loading.value = false;
      } catch (error: any) {
        isValid.value = true;
        mostrarNotify( 'warning', error.response.data.message );   
        loading.value = false;   
      }
    }
    
    return {
      api,
      actualizarLista,
      formEmpresa,
      loading,
      limpiarFormulario,
      allowOnlyNumber,
      validateNumRuc,
      validateNumCelular,
      transformToUpperCase,
      onRejected,
      onSubmit,
      modalAgregarEmpresa,
      modalEditarEmpresa,
      isPwd,
      isValid
    }
}
