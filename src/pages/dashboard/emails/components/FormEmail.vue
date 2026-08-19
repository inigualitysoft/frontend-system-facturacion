<script setup>
  import { useEmail } from "../composables/useEmail";
  import { useRoute } from "vue-router";

  // `config` permite usar el form fuera de /email/edit/:email_id: Mensajería ya
  // trae la configuración de la empresa y se la pasa hecha.
  const props = defineProps(['edit', 'config']);
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

  const cargarEnFormulario = ( data ) => {
    formEmail.value = {
      ...data,
      empresa: data.company_id.id
    }
  }

  const getConfigEmail = async () => {
    if ( props.config ) return cargarEnFormulario( props.config );

    // Ojo: el :id de este endpoint es el de la EMPRESA, no el del registro de
    // correo (findOne busca por company_id). La ruta vieja pasa justamente eso.
    if ( !route.params.email_id ) return;

    const { data } = await api.get(`/email/${ route.params.email_id }`);
    cargarEnFormulario( data );
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
      let msgError = ''
      loadingTesting.value = false;

      if (error.response) {
        if (error.response.data.message)
          msgError = error.response.data.message
        else
          msgError = `${error.response.data.code} - ${error.response.data.command} `
      }else{
        msgError = `Hubo un error al enviar el email, por favor verique bien sus datos`
      }

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
      <!--
        Antes cada campo era `col-md-2` de etiqueta + `col-md-3` de input: dentro
        del card de Mensajería el input quedaba en un cuarto del ancho. Ahora la
        etiqueta ocupa lo justo y el input se lleva todo el espacio restante.
      -->
      <div class="row q-col-gutter-md q-px-md q-pt-lg">

        <div class="col-12 col-md-6 fila-campo-email">
          <label class="etiqueta-email">Host/servidor:</label>
          <q-input class="col" v-model.trim="formEmail.host"
            input-class="resaltarTextoInput" dense outlined required />
        </div>

        <div class="col-12 col-md-6 fila-campo-email">
          <label class="etiqueta-email">Puerto:</label>
          <q-input class="col" :type="$q.platform.is.mobile ? 'number' : 'text'"
            v-model.trim="formEmail.puerto"
            input-class="resaltarTextoInput" @keyup="allowOnlyNumber"
            dense outlined required />
        </div>

        <div class="col-12 col-md-6 fila-campo-email">
          <label class="etiqueta-email">Usuario/Correo:</label>
          <q-input class="col" v-model.trim="formEmail.usuario"
            input-class="resaltarTextoInput" dense outlined required />
        </div>

        <div class="col-12 col-md-6 fila-campo-email">
          <label class="etiqueta-email">Contraseña:</label>
          <q-input class="col" input-class="resaltarTextoInput"
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

        <div class="col-12 col-md-6 fila-campo-email">
          <label class="etiqueta-email">Seguridad:</label>
          <q-select class="col"
            v-model="formEmail.seguridad"
            :options="['SSL', 'TLS', 'NONE']"
            outlined dense emit-value map-options required
            hint="SSL=465 · TLS/STARTTLS=587 · NONE=sin cifrado"
          />
        </div>

        <div class="col-12 text-center q-mt-md q-pb-lg">
          <q-btn @click="prompt = !prompt" label="Probar Configuración"
            :class="[ $q.screen.width > 600 || 'q-mb-md']"
            icon-right="send" outline rounded class="q-mr-lg"
            style="color: #696cff;"
            :style="!$q.platform.is.mobile || 'font-size: 12px'" />

          <q-btn type="submit" label="Guardar"
            icon-right="save" outline rounded style="color: #696cff" />
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
.fila-campo-email{
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
}
.etiqueta-email{
  min-width: 108px;
  text-align: right;
  padding-right: 12px;
  white-space: nowrap;
}
/* En pantallas chicas la etiqueta pasa arriba: si no, deja al input sin ancho. */
@media (max-width: 599px){
  .fila-campo-email{
    flex-direction: column;
    align-items: stretch;
  }
  .etiqueta-email{
    min-width: 0;
    text-align: left;
    padding: 0 0 4px 0;
  }
  /* En columna el `col` crecería a lo alto y aplastaría el input. */
  .fila-campo-email > .col{
    flex: 1 1 auto;
  }
}
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