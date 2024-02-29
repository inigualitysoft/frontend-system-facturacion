<script setup>
import ServicioInternet from '../ServicioInternet.vue'
import { useEditCliente } from "../../composables/useEditCliente.js";
import { useCliente } from "../../composables/useCliente.js";
import { Dialog } from 'quasar'
import { ref } from 'vue';

const columns = [
  { name: 'cont', label: '#', align: 'center' },
  { name: 'nombre_plan', align: 'center', label: 'Plan', field: 'nombre_plan' },
  { name: 'precio', label: 'Costo', field: 'precio', align: 'center' },
  { name: 'ipv4', label: 'IP', field: 'ipv4', align: 'center' },
  { name: 'router', label: 'Router', field: 'router', align: 'center' },
  { name: 'fecha_instalacion', label: 'Instalado', field: 'fecha_instalacion', align: 'center' },
  { name: 'direccion', label: 'Dirección', field: 'direccion', align: 'center' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
]

const { api, client_name, route, servicios, mostrarNotify } = useEditCliente();
const { formCliente }       = useCliente();
const rows                = ref( [] );
const modalEditarServicio = ref( false );
const servicio            = ref( null );

rows.value = servicios.value;

const getServicio = async () => {
  modalEditarServicio.value = false
  servicio.value = null;

  servicios.value = [];
  const { data } = await api.get('/customers/find/' + route.params.client_id);
  
  data[0].planInternet.forEach(x => {
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
  rows.value = servicios.value
}

const activarSuspenderServicio = async ( cliente, estado ) => {
  Dialog.create({
    title: `<div class="text-center">
              <i class="fa-regular fa-circle-question"></i>
                ${ estado == 'activar' ? 'Activar Servicio' : 'Suspender Servicio' }
            </div>`,
    message: `<div class="text-center">                  
                  ¿Estas seguro que deseas ${ estado == 'activar' ? 'activar' : 'suspender'} el servicio al cliente?
              </div>
              <div class="text-center">                  
                ${ cliente.detalles.cliente }
              </div>`,
    html: true,
    ok: { 
      push: true, 
      label:`Si, ${ estado == 'activar' ? 'Activar' : 'Suspender'}`, 
      color: 'teal-7' 
    },
    cancel: { push: true, color: 'blue-grey-8', label: 'Cancelar' }
  }).onOk( async () => {
    try {
      const { data } = await api.put(`/customers/activeOrSuspendService/${ cliente.detalles.id }`, {
        router: cliente.detalles.router_id,
        address_list: cliente.detalles.perfil_internet.address_list,
        ipv4: cliente.detalles.ipv4,
        estado
      })   
      mostrarNotify('positive', `El cliente fue ${ estado == 'activar' ? ' activado' : 'suspendido'}`);
      getServicio();
    } catch (error) {
      mostrarNotify('negative', error.response.data.message);
    }
  })
}

</script>
<template>
  <q-form @submit="">
    <div class="my-card">
      <div class="q-pt-none">
        <div class="row q-pt-sm">
          <div class="col-12">
            <div class="row">

              <div class="col-12 flex items-center" 
                :class="!$q.screen.xs ? 'justify-between' : 'justify-center'">
                <label class="text-h6 text-weight-medium"> >> Servicios de Internet:</label>
                <label class="text-h6 text-weight-medium">
                  <q-btn outline color="primary" label="Agregar Servicio" 
                    class="q-mr-xs" :class="!$q.screen.xs || 'q-mt-sm'" />
                </label>
              </div>

              <div class="col-12 q-mt-md">
                <q-table :rows="rows" :columns="columns"
                  :class="[$q.dark.isActive ? '' : 'my-sticky-header-table3']"
                  :hide-pagination="true" :rows-per-page-options="[50]"
                  row-key="name">

                  <template v-slot:body-cell-cont="props">
                    <q-td :props="props"> {{ props.rowIndex + 1 }} </q-td>
                  </template>

                  <template v-slot:body-cell-estado="props">
                    <q-td :props="props">
                      <template v-if="props.row.estado == 'Activo'">
                          <q-badge outline color="positive" label="Activo" class="q-pa-sm" />
                      </template>
                      <template v-else>
                          <q-badge outline color="red" label="Inactivo" class="q-pa-sm" />
                      </template>
                    </q-td>
                  </template>

                  <template v-slot:body-cell-acciones="props">

                    <q-td :props="props"> 
                      <q-btn v-if="props.row.estado !== 'Inactivo'"
                        round color="blue-grey"     
                        @click="servicio = { ...props.row.detalles, estado: props.row.estado }, 
                            modalEditarServicio = true"                   
                        icon="edit" class="q-mr-sm" size="10px" />

                        <q-btn v-if="props.row.estado !== 'Inactivo'"
                          round color="blue-grey"
                          @click="activarSuspenderServicio( props.row, 'inactivar' )"
                          icon="power_settings_new" class="q-mr-sm" size="10px">
                          <q-tooltip class="bg-indigo" anchor="top middle" self="center middle">
                            Suspender
                          </q-tooltip>
                        </q-btn>

                        <q-btn v-else round color="blue-grey"
                          @click="activarSuspenderServicio( props.row, 'activar' )"
                          icon="check_circle" class="q-mr-sm" size="10px">
                          <q-tooltip class="bg-indigo" anchor="top middle" self="center middle">
                            Activar
                          </q-tooltip>
                        </q-btn>

                    </q-td>
                  </template>

                </q-table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-form>

  <q-dialog v-model="modalEditarServicio">
    <q-card style="width: 900px; max-width: 80vw;">
      <q-card-section>
        <div class="text-h6 text-center">
          Editar Servicio
          <q-btn round flat dense icon="close" class="float-right" color="grey-8" v-close-popup></q-btn>
        </div>
      </q-card-section>

      <q-separator class="q-mb-md" inset></q-separator>

      <q-card-section class="q-pt-none">
        <ServicioInternet :servicio="servicio" :edit="true" 
          @actualizarDatos="getServicio" />
      </q-card-section>
    </q-card>
  </q-dialog> 

</template>

<style>
  .my-sticky-header-table3 .q-table__top,
  .my-sticky-header-table3 thead tr:first-child th {
    /* bg color is important for th; just specify one */
    background-color: #3d403d;
    color: rgb(245, 241, 241);
  }
  .my-sticky-header-table3 tbody tr:nth-child(even) {
      background-color: rgb(243, 235, 245);
  }
</style>