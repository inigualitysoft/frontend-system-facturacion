<script setup lang="ts">
  import FormEmpresa from "./components/FormEmpresa.vue";
  import { useEmpresa } from './composables/useEmpresa';
  import { onMounted } from 'vue';
  import { date } from 'quasar'

  const { api, isValid, formEmpresa, route } = useEmpresa();

  const getEmpresa = async () => {
    const { data } = await api.get('/companies/find/' + route.params.empresa_id);
    formEmpresa.value = {
      ...data[0],
      logo: null,
      logo_old: ( data[0].logo == null ) ? null : data[0].logo,
      archivo_certificado: null,
      archivo_certificado_old: data[0].archivo_certificado,
      fecha_caducidad_certificado: date.formatDate(data[0].fecha_caducidad_certificado, 'DD/MM/YYYY HH:mma')
    }
  }

  isValid.value = false;

  onMounted(() => {
    getEmpresa();
  })

</script>

<template>
  <div class="q-ma-lg q-pt-md">
    <div class="row q-col-gutter-md">
      <div v-if="$q.screen.width > 1022"
        class="offset-1"></div>
      <div class="col-xs-12 q-pl-none" :class="[ $q.screen.width < 1022 ? 'q-pt-sm col-md-6' : 'col-md-5']">
        <q-breadcrumbs class="row q-mr-xs"
          :class="[ $q.screen.width < 1022 ? 'justify-center q-pt-sm' : 'justify-start ']">
          <q-breadcrumbs-el label="Inicio" icon="home" to="/" />
          <q-breadcrumbs-el label="Empresas" icon="fa-solid fa-list" to="/empresas" />
          <q-breadcrumbs-el label="Editar" icon="add_circle" />
        </q-breadcrumbs>
      </div>

      <div class="col-xs-12" :class="[ $q.screen.width < 1022 ? 'text-center q-pt-sm col-md-6' : 'text-right col-md-5']">
        <label class="text-h6 text-center" style="position: relative;top: -8px;left: -10px">
          Editar Empresa
        </label>
      </div>
    </div>
  </div>

  <div class="q-px-md">
    <div class="row q-col-gutter-md">
      <div class="col-xs-12 col-md-10 q-pt-xs"
       :class="$q.screen.width < 1022 ? '' : 'offset-1' ">
        <FormEmpresa :edit="true" />
      </div>
    </div>
  </div>
</template>

