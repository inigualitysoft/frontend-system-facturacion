<script setup>
import { useEditCliente } from "../../composables/useEditCliente.js";

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

const { servicios } = useEditCliente();
const rows = servicios.value;

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
                      {{ props.rowIndex + 1 }} 
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