<script setup lang="ts">
  import FormSucursal from "./components/FormSucursal.vue";   
  import { useSucursal } from './composables/useSucursal';
  
  const { api, route, formSucursal } = useSucursal();

  const getSucursal = async () => {
    const { data } = await api.get(`/sucursal/find/${ route.params.sucursal_id }/sucursal`);
    formSucursal.value = { 
      ...data[0],
      company_id: data[0].company_id.id
    }
  }
  getSucursal();
</script>

<template>
  <div class="q-ma-lg q-pt-md">
    <div class="row q-col-gutter-md" style="justify-content: center;">
      
      <div class="col-xs-12 q-pl-none" :class="[ $q.screen.width < 1022 ? 'q-pt-sm col-md-6' : 'col-md-6']">
        <q-breadcrumbs class="row q-mr-xs"         
          :class="[ $q.screen.width < 1022 ? 'justify-center q-pt-sm' : 'justify-start ']">
          <q-breadcrumbs-el label="Inicio" icon="home" to="/" />
          <q-breadcrumbs-el label="Sucursales" icon="fa-solid fa-list" to="/sucursales" />
          <q-breadcrumbs-el label="Agregar" icon="add_circle" />
        </q-breadcrumbs>
      </div>

      <div class="col-xs-12" :class="[ $q.screen.width < 1022 ? 'text-center q-pt-sm col-md-6' : 'text-right col-md-5']">
        <label class="text-h6 text-center" style="position: relative;top: -8px;left: 17px">
          Editar Sucursal
        </label>
      </div>
    </div>
  </div>

  <div class="row q-col-gutter-md" style="justify-content: center;">
    <div class="col-xs-11 col-md-11 q-pt-xs">
      <q-card flat class="shadow_custom">
        <FormSucursal :edit="true" />     
      </q-card>     
    </div>
  </div> 
</template>
  

  