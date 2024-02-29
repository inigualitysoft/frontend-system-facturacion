<script setup>
  import { useCliente } from './composables/useCliente';
  import { useEditCliente } from "./composables/useEditCliente";
  import IndexPage from "./components/editar/IndexPage.vue";
  import { date } from 'quasar'

  const { api, route, formCliente, formFacturacion } = useCliente();
  const { client_name, dia_vencimiento, mes_pago, servicios } = useEditCliente();

  const consultarPagos = async () => {
    const { data } = await api.get('/pagos/find/' + servicios.value[0].servicio_id);
    if( data.length > 0 ){

      mes_pago.value.dia_pago = data[0].dia_pago;
      if ( data[0].estadoSRI !== 'PAGADO' && data[0].estadoSRI !== 'AUTORIZADO' ) 
        mes_pago.value.estado = 'pendiente';
      else
        mes_pago.value.estado = 'pagado';
    }

    mes_pago.value.meses_vencidos = data.reduce((cont, x) => 
          cont + (x.estadoSRI == 'NO PAGADO' || x.estadoSRI == 'PENDIENTE'), 0);
      
    data.forEach((x, index) => {
      let diasGracias = parseInt(x.servicio.factura_id.dia_gracia.split(' ')[0]);

      dia_vencimiento.value = date.addToDate(x.dia_pago, { days: ( diasGracias + 1 ) })

      if ( index == 0 ) mes_pago.value.dia_vencimiento = dia_vencimiento.value;
    })
  }

  const getClient = async () => {
    servicios.value = [];
    const { data } = await api.get('/customers/find/' + route.params.client_id);

    client_name.value = data[0].nombres;
    formCliente.value = { ...data[0] }
    
    data[0].planInternet.forEach(x => {

      formFacturacion.value = { ...x.factura_id }

      servicios.value.push({
        detalles: { ...x, cliente: client_name.value },
        servicio_id: x.id,
        precio: x.precio,
        direccion: `${ x.direccion == '' ? '- - - - -' : x.direccion }`,
        fecha_instalacion: x.fecha_instalacion,
        ipv4: x.ipv4,
        nombre_plan: x.perfil_internet.nombre_plan,
        router: x.router_id.nombre,
        estado: `${ x.isActive ? 'Activo' : 'Inactivo' }`
      });

    });   
    
    consultarPagos();    
  }
  
  getClient();

</script>

<template>
  <div class="q-ma-lg q-pt-md">
    <div class="row q-col-gutter-md" style="justify-content: center;">
      
      <div class="col-xs-12 q-pl-none" :class="[ $q.screen.width < 1022 ? 'q-pt-sm col-md-6' : 'col-md-6']">
        <q-breadcrumbs class="row q-mr-xs"         
          :class="[ $q.screen.width < 1022 ? 'justify-center q-pt-sm' : 'justify-start ']">
          <q-breadcrumbs-el label="Inicio" icon="home" to="/" />
          <q-breadcrumbs-el label="Clientes" icon="fa-solid fa-list" to="/clientes" />
          <q-breadcrumbs-el label="Nuevo" icon="add_circle" />
        </q-breadcrumbs>
      </div>

      <div class="col-xs-12" 
        :class="[ $q.screen.width < 1022 
            ? 'text-center q-pt-sm col-md-6 q-pl-none' 
            : 'text-right col-md-5']">
        <label class="text-h6 text-center" style="position: relative;top: -8px;left: 17px">
          {{ client_name }}
        </label>
      </div>
    </div>
  </div>

  <div class="row q-col-gutter-md" style="justify-content: center;">
    <div class="col-xs-11 col-md-11 q-pt-xs">
      <q-card flat class="shadow_custom q-pt-none">
        <IndexPage :edit="true" />     
      </q-card>     
    </div>
  </div>
</template>
  

  
  

  