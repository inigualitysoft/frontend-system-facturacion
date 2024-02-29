import { ref, onMounted, watch } from "vue"
import useHelpers from "../../../../composables/useHelpers";

const loading = ref( false );  
const formRol = ref({
  nombre: '',
  permisos: []
})

const modalAgregarRol  = ref(false);
const modalEditarRol   = ref(false);
const actualizarLista  = ref(false);
const permisosSelected = ref([]);

export const useRol = () => {

  const { api, mostrarNotify, confirmDelete, isDeleted } = useHelpers();

  const limpiarFormulario = () => {
    formRol.value.nombre = ''
    formRol.value.permisos = [];
    permisosSelected.value = [];
  }

  onMounted(() => {
    watch(formRol.value, (currentValue, _) => {
      formRol.value.nombre = currentValue.nombre.toUpperCase();  
    });      
  })

  const onSubmit = async( edit ) => {
    
    if ( permisosSelected.value.length == 0 ) 
      return mostrarNotify( 'warning', 'Debes seleccionar al menos 1 permiso', 'top');

    try {
      loading.value = true;
      formRol.value.permisos = permisosSelected.value.map( permiso => permiso)
      
      if ( !edit )
        await api.post('/roles-and-permisos', formRol.value);
      else
        await api.patch(`/roles-and-permisos/${ formRol.value.id }`, formRol.value)
      
      mostrarNotify( 'positive', `Rol ${ edit ? 'editado' : 'agregado' } exitosamente`);
      
      permisosSelected.value = [];
      modalAgregarRol.value = false;
      modalEditarRol.value  = false;
      actualizarLista.value = true

      loading.value = false;
    } catch (error) {
      mostrarNotify( 'warning', error.response.data.message )
      loading.value = false;
    }
  }

  return {
    api, 
    mostrarNotify, 
    confirmDelete, 
    isDeleted,
    actualizarLista,
    formRol,
    loading,
    limpiarFormulario,
    expanded: ref(['Seleccionar todos los permisos']),
    modalEditarRol,
    modalAgregarRol,
    permisosSelected,
    onSubmit
  }
}
