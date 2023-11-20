<script setup lang="ts">
  import FormEmail from "./components/FormEmail.vue";  
  import { useEmail } from "./composables/useEmail.ts";

  const { limpiarFormulario } = useEmail();
  
  limpiarFormulario();
</script>

<template>
  <div class="q-ma-lg q-pt-md">
    <div class="row q-col-gutter-lg">
      <div class="col-12">
        <q-card flat class="shadow_custom">

          <div class="row q-py-md q-pl-md" :class="$q.screen.xs ? 'justify-center' : 'justify-between'">
            <div class="col-xs-12 col-sm-12 col-md-6" 
            :class="[ $q.screen.width < 1022 ? 'text-center' : 'text-left']">
              <label class="text-h6">Nuevo Email Config</label>
            </div>
        
            <div class="col-xs-12 col-sm-12 col-md-6">
              <q-breadcrumbs class="row q-mr-lg" 
                :class="[ $q.screen.width < 1022 ? 'justify-center' : 'justify-end']">
                <q-breadcrumbs-el label="Inicio" icon="home" to="/" />
                <q-breadcrumbs-el label="Emails" icon="mail" to="/emails" />
                <q-breadcrumbs-el label="Email" icon="add_circle" />
              </q-breadcrumbs>
            </div>
          </div>

          <div class="q-px-md">
            <div class="row q-col-gutter-md">
              <div class="col-xs-12 col-md-12">
                <FormEmail :edit="false" />        
              </div>
            </div>
          </div>
        </q-card>
      </div>
    </div>
  </div>
</template>

  