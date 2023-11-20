<script setup lang="ts">
  import FormEmail from "./components/FormEmail.vue";  
  import { useAuthUserStore } from "stores/auth-user"
  import JWT from 'jwt-client'

  const authUserStore = useAuthUserStore();
  const { claim } = JWT.read( authUserStore.token );
</script>

<template>
  <div class="q-ma-lg q-pt-md">
    <div class="row q-col-gutter-lg">
      <div class="col-12">
        <q-card flat class="shadow_custom">

          <div class="row q-py-md q-pl-md" :class="$q.screen.xs ? 'justify-center' : 'justify-between'">
            <div v-if="claim.roles[0] == 'Super-Administrador'"
                class="col-xs-12 col-sm-12 col-md-6">
                <q-breadcrumbs class="row q-mr-lg" 
                :class="[ $q.screen.width < 1022 ? 'justify-center q-pt-sm' : 'justify-start ']">
                <q-breadcrumbs-el label="Inicio" icon="home" to="/" />
                <q-breadcrumbs-el label="Emails" icon="mail" to="/emails" />
                <q-breadcrumbs-el label="Email" icon="edit" />
              </q-breadcrumbs>
            </div>

            <div class="col-xs-12 col-sm-12 col-md-6 q-mt-sm" 
            :class="[ $q.screen.width < 1022 ? 'text-center' : 'text-right']">
              <label class="text-h6 q-pr-md">Datos del servidor correo</label>
            </div>
          </div>

          <div class="q-px-md">
            <div class="row q-col-gutter-md">
              <div class="col-xs-12 col-md-12 q-pt-xs">
                <FormEmail :edit="true" />    
              </div>
            </div>
          </div>
        </q-card>
      </div>
    </div>
  </div>  
</template>

  