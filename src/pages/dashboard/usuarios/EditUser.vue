<script setup lang="ts">
  import FormUser from "./components/FormUser.vue";
  import { useUser } from './composables/useUser';
  import { api } from "boot/axios";
  import { useRoute } from "vue-router";
  import { onMounted } from 'vue';

  const { formUser, limpiarFormulario } = useUser();
  const route = useRoute();

  const getUser = async () => {
    const { data } = await api.get('/auth/find/' + route.params.term);
    const { password, confirmPassword, company, ...restUser } = data[0];
    formUser.value = { ...restUser, company: company.id }
  }

  onMounted(() => { 
    limpiarFormulario();
    getUser(); 
  })
   
</script>

<template>
  <div class="q-ma-lg q-pt-md">
    <div class="row q-col-gutter-lg">
      <div class="col-12">
        <q-card flat class="shadow_custom">

          <div class="row q-py-md q-pl-md" :class="$q.screen.xs ? 'justify-center' : 'justify-between'">
            <div class="col-xs-12 col-sm-12 col-md-6" 
            :class="[ $q.screen.width < 1022 ? 'text-center' : 'text-left']">
              <label class="text-h6">Editar Usuario</label>
            </div>
        
            <div class="col-xs-12 col-sm-12 col-md-6">
              <q-breadcrumbs class="row q-mr-lg" 
                :class="[ $q.screen.width < 1022 ? 'justify-center' : 'justify-end']">
                <q-breadcrumbs-el label="Inicio" icon="home" to="/" />
                <q-breadcrumbs-el label="Usuarios" icon="group" to="/usuarios" />
                <q-breadcrumbs-el label="Editar Usuario" icon="person" />
              </q-breadcrumbs>
            </div>
          </div>

          <div class="q-px-md">
            <div class="row q-col-gutter-md">
              <div class="col-xs-12 col-md-12">
                <FormUser :edit="true" />          
              </div>
            </div>
          </div>
        </q-card>
      </div>
    </div>
  </div>
</template>
