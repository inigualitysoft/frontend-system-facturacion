<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import useHelpers from "../../../../composables/useHelpers";

  const emit = defineEmits(['saved', 'cleared']);

  const { api, claim, mostrarNotify } = useHelpers();

  const cabecera = { headers: { 'company-id': claim.company.id } };

  const form = ref({
    phoneNumberId: '',
    wabaId:        '',
    accessToken:   ''
  });

  const verToken  = ref( false );
  const guardando = ref( false );
  const probando  = ref( false );
  const conectado = ref( false );

  const estado = ref<any>( null );

  const cargarConfig = async () => {
    try {
      const { data } = await api.get('/cloud-api/config', cabecera);

      form.value.phoneNumberId = data.phoneNumberId ?? '';
      form.value.wabaId        = data.wabaId ?? '';
      conectado.value          = data.conectado;

      if ( data.conectado ) probarCredenciales( true );
    } catch (error) {
      console.log( error );
    }
  }


  const probarCredenciales = async ( silencioso = false ) => {
    probando.value = true;
    try {
      const { data } = await api.get('/cloud-api/verify', cabecera);
      estado.value = data;

      if ( !silencioso )
        mostrarNotify( data.valid ? 'positive' : 'negative',
          data.valid ? `Conectado como ${ data.name ?? data.phone }` : data.error );
    } catch (error: any) {
      mostrarNotify('negative', error.response?.data?.message ?? 'No se pudo verificar');
    } finally {
      probando.value = false;
    }
  }

  const guardar = async () => {
    guardando.value = true;
    try {
      // El token solo se manda si se escribió uno nuevo: el backend no lo
      // devuelve nunca, así que el campo vacío significa "déjalo como está".
      const payload: any = { ...form.value };
      if ( !payload.accessToken ) delete payload.accessToken;

      const { data } = await api.post(`/cloud-api/credentials/${ claim.company.id }`, payload);

      estado.value          = data;
      conectado.value       = data.valid;
      form.value.accessToken = '';

      if ( data.valid ) {
        mostrarNotify('positive', `Credenciales guardadas. Conectado como ${ data.name ?? data.phone }`);
      } else {
        mostrarNotify('warning', data.error ?? 'Credenciales guardadas, pero Meta no las validó.');
      }

      emit('saved');
    } catch (error: any) {
      mostrarNotify('negative', error.response?.data?.message ?? 'No se pudo guardar');
    } finally {
      guardando.value = false;
    }
  }

  /** Deja este canal como el que se usa para enviar. */
  const activarCanal = async () => {
    try {
      await api.post(`/cloud-api/credentials/${ claim.company.id }`, { wa_provider: 'cloud_api' });
      mostrarNotify('positive', 'Canal oficial activado.');
      emit('saved');
    } catch (error: any) {
      mostrarNotify('negative', error.response?.data?.message ?? 'No se pudo activar el canal');
    }
  }

  const borrar = async () => {
    try {
      await api.post(`/cloud-api/clear/${ claim.company.id }`, {});

      form.value      = { phoneNumberId: '', wabaId: '', accessToken: '' };
      estado.value    = null;
      conectado.value = false;

      mostrarNotify('positive', 'Credenciales borradas. Los envíos vuelven al canal no oficial.');
      emit('cleared');
    } catch (error: any) {
      mostrarNotify('negative', error.response?.data?.message ?? 'No se pudo borrar');
    }
  }

  defineExpose({ cargarConfig });

  onMounted( cargarConfig );
</script>

<template>
  <q-banner dense class="q-mb-md rounded-borders text-body2"
    :class="$q.dark.isActive ? 'bg-grey-9 text-grey-3' : 'bg-grey-2 text-grey-8'">
    <template v-slot:avatar>
      <q-icon name="verified" color="teal-7" />
    </template>
    Canal oficial: los comprobantes salen con una plantilla aprobada por Meta y el
    PDF adjunto. El XML seguirá yendo solo por correo, porque WhatsApp no acepta
    ese tipo de archivo. Las plantillas se elegirán desde su propio módulo.
  </q-banner>

  <div v-if="estado" class="q-mb-md">
    <q-chip :color="estado.valid ? 'green-7' : 'red-6'" text-color="white" dense
      :icon="estado.valid ? 'check_circle' : 'error'">
      {{ estado.valid ? (estado.name ?? 'Conectado') : 'Sin conexión' }}
    </q-chip>
    <q-chip v-if="estado.phone" dense outline>{{ estado.phone }}</q-chip>
    <q-chip v-if="estado.quality" dense outline>Calidad: {{ estado.quality }}</q-chip>
    <div v-if="estado.error" class="text-negative text-caption q-mt-xs">{{ estado.error }}</div>
  </div>

  <q-form @submit="guardar">
    <label>Phone Number ID:</label>
    <q-input v-model.trim="form.phoneNumberId" outlined dense class="q-mb-sm"
      hint="Identificador del número en Meta" />

    <label>WhatsApp Business Account (WABA) ID:</label>
    <q-input v-model.trim="form.wabaId" outlined dense class="q-mb-sm"
      hint="Necesario para las plantillas de Meta" />

    <label>Access Token:</label>
    <q-input v-model.trim="form.accessToken" outlined dense class="q-mb-sm"
      :type="verToken ? 'text' : 'password'"
      :placeholder="conectado ? 'Guardado — escribe uno nuevo para reemplazarlo' : ''">
      <template v-slot:prepend><q-icon name="key" /></template>
      <template v-slot:append>
        <q-icon :name="verToken ? 'visibility_off' : 'visibility'" class="cursor-pointer"
          @click="verToken = !verToken" />
      </template>
    </q-input>

    <q-btn type="submit" class="full-width" color="teal-7" push
      icon="save" label="Guardar y verificar" :loading="guardando" />

    <div class="row q-col-gutter-sm q-mt-sm">
      <div class="col-6">
        <q-btn class="full-width" outline color="teal-8" icon="wifi_tethering" no-caps
          label="Probar" :loading="probando" @click="probarCredenciales(false)" />
      </div>
      <div class="col-6">
        <q-btn class="full-width" outline color="negative" icon="delete" no-caps
          label="Borrar" @click="borrar" />
      </div>
    </div>

    <q-btn v-if="conectado" flat no-caps dense color="teal-8" icon="swap_horiz"
      label="Usar este canal para enviar" class="full-width q-mt-sm" @click="activarCanal" />
  </q-form>
</template>
