<script setup lang="ts">
  import { ref } from 'vue'
  import { api } from "boot/axios";
  import useHelpers from "../../../composables/useHelpers.js";
  
  const loading           = ref( false );
  const loadingTesting    = ref( false );
  const isPwd             = ref( true );
  const prompt            = ref(false);
  const { mostrarNotify } = useHelpers();

  const formEmail = ref({
    host: '',
    usuario: '',
    puerto: 0,
    password: '',
    email_client: ''
  });

  const allowOnlyNumber = () => {
    formEmail.value.puerto = formEmail.value.puerto.replace(/\D/g, '');
  }

  const getEmail = async () => {
    const { data } = await api.get('/email');
    formEmail.value = { ...data[0] }
  }

  const testingEmail = async () => {
    try {
      loadingTesting.value = true;
      const { data } = await api.post('/email/testing', formEmail.value);
      mostrarNotify('positive', data)

      loadingTesting.value = false;      
      prompt.value = false;
    } catch (error) {
      console.log( error );
      let msgError = ''
      loadingTesting.value = false;

      if (error.response.data.response) 
        msgError = error.response.data.response
      else
        msgError = `${error.response.data.code} - ${error.response.data.command} `
      
      mostrarNotify('negative', msgError)
      prompt.value = false;
    }
  }

  const updataInfoEmail = async () => {
    try {
      loading.value = true;
      const { id, puerto, created_at, updated_at, ...rest } = formEmail.value
      const { data } = await api.patch(`/email/${ id }`, { ...rest, puerto: parseInt( puerto ) });
      mostrarNotify( 'positive', data.msg );
      loading.value = false;
      getEmail();      
    } catch (error) {
      loading.value = false;
      mostrarNotify( 'warning', error.response.data.message );      
    }
  }

  getEmail();
   
</script>
<template>
  <div class="q-ma-lg q-pt-md">
    <div class="row q-col-gutter-lg">
      <div class="col-xs-12">
        <q-card class="my-card">
          <q-card-section class="text-white q-py-sm text-center" 
          :class="[!$q.dark.isActive ? 'bg-blue-grey-10' : '']">
            <div class="text-h6">Datos del servidor de correo</div>
          </q-card-section>
    
          <q-card-section class="q-pt-none">
            <div class="row q-pt-md">
              <div class="col-xs-12 col-md-12">
                <div class="row">
    
                  <div class="col-xs-11 col-md-2 flex items-center" 
                    :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-lg' : 'justify-end']">
                    <label for="">Host/servidor:</label>
                  </div>
                  <div class="col-xs-11 col-md-3 q-ml-md" 
                    :class="[ $q.screen.width < 1022 ? 'q-mt-sm' : 'q-mt-lg']">
                    <q-input v-model.trim="formEmail.host" input-class="resaltarTextoInput" dense outlined required />
                  </div>
    
                  <div class="col-xs-11 col-md-2 flex items-center q-mt-lg" 
                    :class="[ $q.screen.width < 1022 ? 'justify-center' : 'justify-end']">
                    <label for="">Puerto:</label>
                  </div>
                  <div class="col-xs-11 col-md-3 q-ml-md" 
                    :class="[ $q.screen.width < 1022 ? 'q-mt-sm' : 'q-mt-lg']">
                    <q-input v-model.trim="formEmail.puerto" 
                      input-class="resaltarTextoInput" @keyup="allowOnlyNumber"
                      dense outlined required />
                  </div>
    
                  <div class="col-xs-11 col-md-2 flex items-center q-mt-lg" 
                    :class="[ $q.screen.width < 1022 ? 'justify-center' : 'justify-end']">
                    <label for="">Usuario/Correo:</label>
                  </div>
                  <div class="col-xs-11 col-md-3 q-ml-md" 
                    :class="[ $q.screen.width < 1022 ? 'q-mt-sm' : 'q-mt-lg']">
                    <q-input v-model.trim="formEmail.usuario" input-class="resaltarTextoInput" dense outlined required />
                  </div>
    
                  <div class="col-xs-11 col-md-2 flex items-center q-mt-lg" 
                    :class="[ $q.screen.width < 1022 ? 'justify-center' : 'justify-end']">
                    <label for="">Contraseña:</label>
                  </div>
                  <div class="col-xs-11 col-md-3 q-ml-md" 
                    :class="[ $q.screen.width < 1022 ? 'q-mt-sm' : 'q-mt-lg']">

                    <q-input input-class="resaltarTextoInput"
                      :type="isPwd ? 'password' : 'text'" label-color="blue-grey-3"
                      outlined dense v-model.trim="formEmail.password" required>
                      <template v-slot:append>
                        <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" color="blue-grey"
                          class="cursor-pointer" @click="isPwd = !isPwd" />
                      </template>
                      <template v-slot:prepend>
                        <q-icon name="key" />
                      </template>
                    </q-input>
                  </div>
    
                </div>
              </div>
    
            </div>
          </q-card-section>
    
          <q-card-actions class="justify-center q-pb-lg q-pt-lg">
            <q-btn @click="prompt = !prompt"
              icon="send" outline rounded class="q-mr-lg" color="secondary">
              &nbsp; Probar Configuración
            </q-btn>
            <q-btn @click="updataInfoEmail" 
              icon="mail" outline rounded class="q-mr-lg" color="secondary">
              &nbsp; Guardar Cambios
            </q-btn>
          </q-card-actions>
    
        </q-card>
      </div>      
    </div>
  </div>

  <q-dialog v-model="prompt">
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">Correo del cliente</div>
      </q-card-section>
        <q-form @submit="testingEmail">
          <q-card-section class="q-pt-none">
            <q-input type="email" dense v-model="formEmail.email_client" 
              autofocus required />
          </q-card-section>
    
          <q-card-actions align="right" class="text-primary">
            <q-btn flat label="Cancelar" v-close-popup />
            <q-btn type="submit" :loading="loadingTesting" flat label="Enviar" />
          </q-card-actions>
        </q-form>
      </q-card>
  </q-dialog>

</template>
<style>
.resaltarTextoInput{
  font-size: 16px;
  text-align: center;
  color: #313131;
  font-weight: 500;
}
</style>

  