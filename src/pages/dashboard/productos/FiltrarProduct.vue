<template>
    <div class="col-md-10 col-xs-12 flex items-center" :class="$q.screen.xs ? 'justify-center' : ''">
  
      <q-select filled required dense emit-value map-options
        style="width: 36%;margin-left: 27px;"
        :style="$q.screen.xs ? 'width: 52%; margin-right: 0px; margin-top:30px' : ''"
          v-model="formFiltrarArticulo.pv_id" :options="listPV" label="Filtar por punto de Venta">
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                No hay resultados
              </q-item-section>
            </q-item>
          </template>
      </q-select>
  
      <q-btn round color="black" icon="search" :loading="loading"
      :style="$q.screen.xs ? 'margin-top:30px;' : ''"
        class="q-ml-md" @click="contarArticulos" />
    </div>
  </template>
  
  <script>
  import { defineComponent, ref, watch } from 'vue'
  import { api } from "boot/axios";
  import useHelpers from "../../../composables/useHelpers";
  
  export default defineComponent({
    name: 'FiltrarArticulo',
    props: ['pagination', 'formFiltrarArticulo', 'user'],
    setup(props,  { emit }) {
      const loading = ref( false );
      const listPV = ref([]);
  
      const getPV = async () => {
        try {
          const { data: { puntos_ventas } } = await api.get('/puntos_ventas/true');
          listPV.value = [];
  
          listPV.value.push({ label: "Todos", value: 0 })
  
          puntos_ventas.forEach(pv => {
            if ( pv.estado == '1' && pv.nombre != 'OTROS-JEFE' )
            listPV.value.push({ label: pv.nombre, value: pv.id })
          });
        } catch (error) {
          console.log(error)
        }
        loading.value = false;
      }
  
      const contarArticulos = async() => {
        props.formFiltrarArticulo.page        = (props.pagination.page - 1) * props.pagination.rowsPerPage;
        props.formFiltrarArticulo.rowsPerPage = props.pagination.rowsPerPage;
  
        loading.value = true;
  
        const { data } = await api.post(`/articulos/contarArticulos`, props.formFiltrarArticulo);
  
        loading.value = false;
  
        emit('actualizarLista', data);
      }
  
      getPV();
  
      return {
        contarArticulos,
        listPV,
        loading
      }
    }
  })
  </script>
  
  