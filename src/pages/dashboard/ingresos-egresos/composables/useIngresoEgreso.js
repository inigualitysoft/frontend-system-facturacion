import { ref, computed } from "vue"
import useHelpers from "../../../../composables/useHelpers";

/** Fecha de hoy en el formato que espera el backend, sin arrastrar zona horaria. */
const hoy = () => {
  const ahora = new Date();
  const mes   = String( ahora.getMonth() + 1 ).padStart(2, '0');
  const dia   = String( ahora.getDate() ).padStart(2, '0');

  return `${ ahora.getFullYear() }-${ mes }-${ dia }`;
}

const formIE = ref({
  id: '',
  tipo: 'egreso',
  referencia: '',
  monto: '',
  fecha: hoy(),
  forma_pago: 'efectivo',
  descripcion: '',
  proveedor_id: '',
  sucursal_id: ''
});

const modalFormIE   = ref( false );

// Contador de cambios guardados. El listado lo observa para recargarse: hacerlo
// con un emit del formulario no era fiable, porque el diálogo se cierra en el
// mismo momento y el hijo se desmonta mientras avisa.
const cambios       = ref( 0 );
const editando      = ref( false );
const loading       = ref( false );
const listProveedores = ref([]);
const listSucursales  = ref([]);
const listFormasPago  = ref([]);
const listUsuarios    = ref([]);

// Filtros del listado. Viven fuera del composable para que las tarjetas, la
// tabla y el reporte lean exactamente los mismos valores.
const filtros = ref({
  tipo: '',
  proveedor_id: '',
  sucursal_id: '',
  user_id: '',
  fechaDesde: '',
  fechaHasta: '',
  busqueda: ''
});

export const useIngresoEgreso = () => {

  const { api, claim, mostrarNotify } = useHelpers();

  const cabecera = computed(() => ({ headers: { 'company-id': claim.company.id } }));

  /** Solo los filtros con valor: los vacíos ensucian la URL y el DTO. */
  const filtrosActivos = () => {
    const params = {};

    Object.entries( filtros.value ).forEach(([ clave, valor ]) => {
      if ( valor !== '' && valor !== null && valor !== undefined ) params[ clave ] = valor;
    });

    return params;
  }

  const limpiarFormulario = () => {
    formIE.value = {
      id: '',
      tipo: 'egreso',
      referencia: '',
      monto: '',
      fecha: hoy(),
      forma_pago: 'efectivo',
      descripcion: '',
      proveedor_id: '',
      sucursal_id: ''
    };
    editando.value = false;
  }

  const abrirFormulario = ( movimiento = null ) => {
    if ( movimiento ) {
      formIE.value = {
        id:           movimiento.id,
        tipo:         movimiento.tipo,
        referencia:   movimiento.referencia,
        monto:        movimiento.monto,
        fecha:        movimiento.fecha || hoy(),
        forma_pago:   movimiento.forma_pago ?? '',
        descripcion:  movimiento.descripcion ?? '',
        proveedor_id: movimiento.proveedor_id?.id ?? '',
        sucursal_id:  movimiento.sucursal_id?.id ?? ''
      };
      editando.value = true;
    } else {
      limpiarFormulario();
    }

    modalFormIE.value = true;
  }

  const cargarCatalogos = async () => {
    try {
      const [ proveedores, sucursales, formas, usuarios ] = await Promise.all([
        api.get('/providers/true', cabecera.value),
        api.get('/sucursal/true', cabecera.value),
        api.get('/ingresos-egresos/formas-pago', cabecera.value),
        api.get('/auth/users', cabecera.value).catch(() => ({ data: [] }))
      ]);

      listProveedores.value = ( proveedores.data ?? [] ).map( p => ({
        label: p.razon_social, value: p.id
      }));

      listSucursales.value = ( sucursales.data?.items ?? sucursales.data ?? [] ).map( s => ({
        label: s.nombre, value: s.id
      }));

      listFormasPago.value = formas.data ?? [];

      listUsuarios.value = ( usuarios.data?.items ?? usuarios.data ?? [] ).map( u => ({
        label: u.fullName ?? u.nombres ?? u.email, value: u.id
      }));
    } catch (error) {
      console.log( error );
    }
  }

  const onSubmit = async () => {
    loading.value = true;
    try {
      const { id, ...datos } = formIE.value;

      const cuerpo = {
        ...datos,
        monto: Number( datos.monto ) || 0,
        // El operador que registra el movimiento sale del usuario en sesión.
        user_id: claim.id ?? claim.user?.id ?? undefined
      };

      if ( editando.value )
        await api.patch(`/ingresos-egresos/${ id }`, cuerpo, cabecera.value);
      else
        await api.post('/ingresos-egresos', cuerpo, cabecera.value);

      mostrarNotify('positive', `Movimiento ${ editando.value ? 'actualizado' : 'registrado' } exitosamente`);

      cambios.value++;
      modalFormIE.value = false;
      limpiarFormulario();

      return true;
    } catch (error) {
      const mensaje = error.response?.data?.message;

      mostrarNotify('warning', Array.isArray( mensaje ) ? mensaje.join(', ') : ( mensaje ?? 'No se pudo guardar' ));

      return false;
    } finally {
      loading.value = false;
    }
  }

  const eliminar = async ( id ) => {
    try {
      await api.delete(`/ingresos-egresos/${ id }`, cabecera.value);
      mostrarNotify('positive', 'Movimiento eliminado exitosamente');

      cambios.value++;

      return true;
    } catch (error) {
      mostrarNotify('warning', error.response?.data?.message ?? 'No se pudo eliminar');
      return false;
    }
  }

  const descargarExcel = async () => {
    try {
      const { data } = await api.get('/ingresos-egresos/download/excel', {
        ...cabecera.value,
        params: filtrosActivos(),
        responseType: 'blob'
      });

      const enlace = document.createElement('a');
      enlace.href = window.URL.createObjectURL( new Blob([ data ]) );
      enlace.download = 'ingresos-egresos.xlsx';
      document.body.appendChild( enlace );
      enlace.click();
      document.body.removeChild( enlace );
    } catch (error) {
      mostrarNotify('negative', 'No se pudo generar el reporte');
    }
  }

  return {
    api,
    claim,
    cabecera,
    mostrarNotify,
    filtros,
    filtrosActivos,
    formIE,
    modalFormIE,
    cambios,
    editando,
    loading,
    listProveedores,
    listSucursales,
    listFormasPago,
    listUsuarios,
    abrirFormulario,
    limpiarFormulario,
    cargarCatalogos,
    onSubmit,
    eliminar,
    descargarExcel
  }
}
