import { useQuasar } from 'quasar'
import { api } from "boot/axios";
import { ref } from "vue";
import { Loading } from 'quasar'

const useHelpers = () => {

  const $q = useQuasar();
  const isDeleted = ref(false);

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
        mostrarNotify('negative', error.response.data.message);
      }
    })
  }

  const mostrarNotify = (type, messages, position = 'top-right') => {

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

  const showLoading = ( active = true ) => {
    if ( active ) 
      Loading.show({ message: 'Cargando...' });      
    else
    Loading.hide();
  }

  return{
    confirmDelete,
    mostrarNotify,
    isDeleted,
    showLoading
  }
}

export default useHelpers
