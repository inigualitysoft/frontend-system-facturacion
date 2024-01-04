<script setup>
  import { useRedIpv4 } from './composables/useRedIpv4';
  import FormRedIpv4 from "./components/FormRedIpv4.vue";

  const { api, quitarErrores, formRed, route } = useRedIpv4();

  const getRedIPv4 = async () => {
    const { data } = await api.get('/red-ipv4/find/' + route.params.id);
    formRed.value = { ...data, router_id: data.router_id.id }
  }
  
  quitarErrores();
  getRedIPv4();

</script>

<template>
  <div class="q-ma-lg q-pt-md">
    <div class="row q-col-gutter-md" style="justify-content: center;">
      
      <div class="col-xs-12 q-pl-none" :class="[ $q.screen.width < 1022 ? 'q-pt-sm col-md-6' : 'col-md-6']">
        <q-breadcrumbs class="row q-mr-xs"         
          :class="[ $q.screen.width < 1022 ? 'justify-center q-pt-sm' : 'justify-start ']">
          <q-breadcrumbs-el label="Inicio" icon="home" to="/" />
          <q-breadcrumbs-el label="Redes" icon="fa-solid fa-list" to="/redes-ipv4" />
          <q-breadcrumbs-el label="Editar" icon="add_circle" />
        </q-breadcrumbs>
      </div>

      <div class="col-xs-12" 
        :class="[ $q.screen.width < 1022 
            ? 'text-center q-pt-sm col-md-6 q-pl-none' 
            : 'text-right col-md-5']">
        <label class="text-h6 text-center" style="position: relative;top: -8px;left: 17px">
          Editar Red IPv4
        </label>
      </div>
    </div>
  </div>

  <div class="row q-col-gutter-md" style="justify-content: center;">
    <div class="col-xs-11 col-md-11 q-pt-xs">
      <q-card flat class="shadow_custom">
        <FormRedIpv4 :edit="true" />     
      </q-card>     
    </div>
  </div>
</template>
  

  