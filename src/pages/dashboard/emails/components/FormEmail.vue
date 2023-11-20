<script setup lang="ts">
  import { useEmail } from "../composables/useEmail";
  import { useSucursal } from "./../../sucursales/composables/useSucursal";
  import { useRoute } from "vue-router";

  const props = defineProps<{ edit: boolean }>();
  const route = useRoute();

  const { 
    api,
    formEmail, 
    loadingTesting,
    onSubmit,
    mostrarNotify,
    isPwd,
    prompt
  } = useEmail();

  let { cargarCompanies, listCompanies } = useSucursal();
  cargarCompanies();

  const getConfigEmail = async () => {
    const { data } = await api.get(`/email/${ route.params.email_id }`);
    formEmail.value = { 
      ...data,
      empresa: data.company_id.id 
    }
  }

  const testingEmail = async () => {
    try {
      loadingTesting.value = true;
      const { data } = await api.post('/email/testing', { 
        ...formEmail.value,
        puerto: parseInt(formEmail.value.puerto)
      });
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

  const allowOnlyNumber = () => {
    formEmail.value.puerto = formEmail.value.puerto.replace(/\D/g, '');
  }

  getConfigEmail();

</script>

<template>
    <q-form @submit="onSubmit()">
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
          <q-input :type="$q.platform.is.mobile ? 'number' : 'text'"
            v-model.trim="formEmail.puerto" 
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

        <div class="col-xs-11 col-md-2 flex items-center q-mt-lg" 
          :class="[ $q.screen.width < 1022 ? 'justify-center' : 'justify-end']">
          <label for="">Empresa:</label>
        </div>
        <div class="col-xs-11 col-md-3 q-ml-md" 
          :class="[ $q.screen.width < 1022 ? 'q-mt-sm' : 'q-mt-lg']">

          <q-select outlined dense v-model="formEmail.empresa" readonly
              emit-value map-options :options="listCompanies">
          </q-select>
        </div>

        <div class="col-xs-11 col-md-11 q-ml-md text-center q-pb-xl q-pt-lg" 
          :class="[ $q.screen.width < 1022 ? 'q-mt-sm' : 'q-mt-lg']">

          <q-btn @click="prompt = !prompt" label="Probar Configuración"
          :class="[ $q.screen.width > 600 || 'q-mb-md']" 
          icon-right="send" outline rounded class="q-mr-lg" 
            style="color: #696cff;" 
            :style="!$q.platform.is.mobile || 'font-size: 12px'" />

          <q-btn type="submit" label="Guardar"
          icon-right="save" outline rounded class="q-mr-lg" style="color: #696cff" />
              
        </div>

      </div>
    </q-form>

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
  font-size: 18px;
  text-align: center;
  color: #313131;
  font-weight: 500;
}
.centrarTextoInput{
  text-align: center;
}
</style>