import { useQuasar } from 'quasar'
import { api } from "boot/axios";
import { ref } from "vue";
import { Loading, Screen } from 'quasar'
import { useAuthUserStore } from "stores/auth-user"
import JWT from 'jwt-client'
import { useRouter, useRoute } from "vue-router";

const useHelpers = () => {

  const $q = useQuasar();
  const isDeleted = ref(false);
  const authUserStore = useAuthUserStore();
  const router = useRouter();
  const route = useRoute();

  let claim = null;

  if(authUserStore.token !== ''){
    const data = JWT.read( authUserStore.token );
    claim = data.claim
  }

  const confirmDelete = ( message, ruta ) => {
    isDeleted.value = false;
    $q.dialog({
      title: 'Confirmar',
      message,
      ok: { push: true, label:'Eliminar', color: 'teal-7' },
      cancel: { push: true, color: 'blue-grey-8', label: 'Cancelar' }
    }).onOk( async () => {
      try {
        await api.delete( ruta );
        mostrarNotify('positive', 'Registro eliminado exitosamente');
        isDeleted.value = true;
      } catch (error) {
        if( error.response.data.code == '23503' )
          return mostrarNotify('negative', "No es posible borrar este registro, se encuentra en uso.");

        mostrarNotify('negative', error.response.data.message);
      }
    })
  }

  const mostrarNotify = (type, messages, position = 'top-right') => {

    if(Screen.xs) position = 'top';

    let template = ''

    let isArray = Array.isArray( messages );
    if ( isArray ) {
      template += '<ul>'
      messages.forEach(message => {
        template += `<li> ${ message }</li>`
      });
      template += '</ul>'
    }else{
      template = messages
    }

    $q.notify({
      type,
      message: template,
      position,
      html: true
    })
  }

  const formatearNumero = (numero) => {
    let partes = numero.toString().split('.');
    let numeroFormateado = parseFloat(partes[0]);

    if (partes.length > 1) {
        numeroFormateado += parseFloat('.' + partes[1].substring(0, 2));
    } else {
        numeroFormateado += parseFloat('.00');
    }

    return parseFloat(numeroFormateado.toFixed(2));
  }

  const showLoading = ( active = true ) => {
    if ( active )
      Loading.show({ message: 'Cargando...' });
    else
    Loading.hide();
  }

  return{
    api,
    claim,
    confirmDelete,
    mostrarNotify,
    isDeleted,
    formatearNumero,
    showLoading,
    router,
    route
  }
}

export default useHelpers
