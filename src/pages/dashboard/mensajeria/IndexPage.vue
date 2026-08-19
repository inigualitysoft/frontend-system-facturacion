<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  import { Dialog } from 'quasar';
  import useHelpers from "../../../composables/useHelpers";
  import ModalWhatsapp from "./components/ModalWhatsapp.vue";
  import WhatsappCloudApi from "./components/WhatsappCloudApi.vue";
  import FormEmail from "../emails/components/FormEmail.vue";

  const { api, claim, mostrarNotify } = useHelpers();

  const gateway = import.meta.env.VITE_API_WHATSAPP;

  const modalAsociarWhatsApp = ref( false );

  // Sub-canal dentro del card de WhatsApp: 'no_oficial' (QR) | 'oficial' (Cloud API)
  const waTab = ref('no_oficial');

  // Canal por el que realmente salen los envíos, que no es lo mismo que la
  // pestaña abierta: se puede tener el oficial configurado y seguir enviando
  // por el no oficial.
  const canalActivo = ref('baileys');

  // Ojo con los dos: `sesionWhatsapp` es el id de la sesión en el gateway (lo que
  // se guarda en la columna numero_whatsApp) y `numeroVinculado` es el teléfono
  // real, que solo se sabe preguntándole al gateway.
  const sesionWhatsapp   = ref('');
  const numeroVinculado  = ref('');
  const conectado        = ref( false );
  const preparandoSesion = ref( false );
  const whatsappActivo   = ref( true );
  const guardandoCanal   = ref( false );

  const configEmail      = ref<any>( null );
  const correoActivo     = ref( true );
  const guardandoCorreo  = ref( false );

  // `inicial` solo en la primera carga: al recargar tras guardar no se puede
  // mover la pestaña o se le cierra en la cara al que está configurando.
  const getEmpresa = async ( inicial = false ) => {
    try {
      const { data } = await api.get('/cloud-api/config', {
        headers: { 'company-id': claim.company.id }
      });

      sesionWhatsapp.value = data.numero_whatsApp ?? '';
      // Las empresas creadas antes de esta pantalla no tienen el campo: se asume
      // encendido, que es como venían comportándose.
      whatsappActivo.value = data.whatsapp_activo !== false;
      canalActivo.value    = data.wa_provider ?? 'baileys';

      if ( inicial )
        waTab.value = canalActivo.value === 'cloud_api' ? 'oficial' : 'no_oficial';

      if ( sesionWhatsapp.value ) comprobarEstadoSesion();
    } catch (error) {
      console.log( error );
    }
  }

  /** Le pregunta al gateway si la sesión guardada sigue vinculada y a qué número. */
  const comprobarEstadoSesion = async () => {
    try {
      const { data } = await axios.get(
        `${ gateway }/api/whatsapp/session/${ sesionWhatsapp.value }/info`
      );

      conectado.value       = !!data.connected;
      numeroVinculado.value = data.info?.number ?? '';
    } catch (error) {
      conectado.value       = false;
      numeroVinculado.value = '';
    }
  }

  /**
   * El gateway necesita una sesión creada antes de poder pintar un QR. Si la
   * empresa no tiene ninguna se crea al vuelo y su sessionId queda guardado en
   * la empresa: es el identificador con el que después se envía y se cierra.
   */
  const abrirVinculacion = async () => {
    if ( sesionWhatsapp.value ) return modalAsociarWhatsApp.value = true;

    preparandoSesion.value = true;
    try {
      const sufijo = Math.floor( 100 + Math.random() * 900 );
      const nombre = ( claim.company.nombre_comercial ?? 'EMPRESA' )
        .toString().trim().replace(/\s+/g, '_').toUpperCase();

      const { data } = await axios.post(`${ gateway }/api/session`, {
        nameSession: `${ nombre }_${ sufijo }`
      });

      await api.patch(`/companies/config/whatsapp/${ claim.company.id }`, {
        numero_whatsApp: data.sessionId
      });

      sesionWhatsapp.value = data.sessionId;
      modalAsociarWhatsApp.value = true;
    } catch (error: any) {
      mostrarNotify('negative',
        error.response?.data?.message ?? 'No se pudo crear la sesión en el servicio de WhatsApp.');
    } finally {
      preparandoSesion.value = false;
    }
  }

  const cerrarSesion = () => {
    Dialog.create({
      title: '¿Cerrar la sesión de WhatsApp?',
      message: 'El número dejará de estar vinculado y no se enviarán comprobantes por este canal.',
      ok:     { push: true, label: 'Cerrar sesión', color: 'negative' },
      cancel: { push: true, label: 'Cancelar', color: 'blue-grey-8' }
    }).onOk( async () => {
      try {
        await axios.delete(`${ gateway }/api/whatsapp/session/${ sesionWhatsapp.value }`);

        conectado.value       = false;
        numeroVinculado.value = '';
        mostrarNotify('positive', 'Dispositivo desvinculado.');
      } catch (error: any) {
        mostrarNotify('negative', error.response?.data?.message ?? 'No se pudo cerrar la sesión');
      }
    })
  }

  /** Vuelve a dejar el canal no oficial como el que envía. */
  const activarNoOficial = async () => {
    try {
      await api.post(`/cloud-api/credentials/${ claim.company.id }`, { wa_provider: 'baileys' });

      canalActivo.value = 'baileys';
      mostrarNotify('positive', 'Canal no oficial activado.');
    } catch (error: any) {
      mostrarNotify('negative', error.response?.data?.message ?? 'No se pudo cambiar el canal');
    }
  }

  const getConfigEmail = async () => {
    try {
      const { data } = await api.get('/email', {
        headers: { 'company-id': claim.company.id }
      });

      configEmail.value  = data[0] ?? null;
      correoActivo.value = data[0]?.activo !== false;
    } catch (error) {
      console.log( error );
    }
  }

  /** Interruptor del canal WhatsApp. Se revierte en pantalla si el guardado falla. */
  const guardarCanalWhatsapp = async ( activo: boolean ) => {
    guardandoCanal.value = true;
    try {
      await api.patch(`/companies/config/whatsapp/${ claim.company.id }`, {
        whatsapp_activo: activo
      });

      mostrarNotify('positive', activo
        ? 'WhatsApp activado como canal.'
        : 'WhatsApp desactivado: no se enviará por este canal.');
    } catch (error: any) {
      whatsappActivo.value = !activo;
      mostrarNotify('negative', error.response?.data?.message ?? 'No se pudo guardar el cambio');
    } finally {
      guardandoCanal.value = false;
    }
  }

  const guardarCanalCorreo = async ( activo: boolean ) => {
    if ( !configEmail.value ) return;

    guardandoCorreo.value = true;
    try {
      await api.patch(`/email/${ configEmail.value.id }`, { activo });

      mostrarNotify('positive', activo
        ? 'Correo activado como canal.'
        : 'Correo desactivado: no se enviará por este canal.');
    } catch (error: any) {
      correoActivo.value = !activo;
      mostrarNotify('negative', error.response?.data?.message ?? 'No se pudo guardar el cambio');
    } finally {
      guardandoCorreo.value = false;
    }
  }

  const dispositivoVinculado = ( numero: string ) => {
    numeroVinculado.value = String( numero ?? '' ).split(':')[0];
    conectado.value       = true;

    mostrarNotify('positive', 'Dispositivo vinculado.');

    // Se deja ver el "listo" del modal antes de cerrarlo.
    setTimeout(() => modalAsociarWhatsApp.value = false, 1500);
  }

  onMounted(() => {
    getEmpresa( true );
    getConfigEmail();
  })
</script>

<template>
  <div class="q-ma-lg q-pt-md">

    <q-breadcrumbs class="q-mb-lg">
      <q-breadcrumbs-el label="Inicio" icon="home" to="/" />
      <q-breadcrumbs-el label="Ajustes" icon="list" />
      <q-breadcrumbs-el label="Mensajeria" icon="send" />
    </q-breadcrumbs>

    <div class="row q-col-gutter-lg">

      <!-- WhatsApp -->
      <div class="col-xs-12 col-md-5">
        <q-card flat class="shadow_custom full-height">
          <q-card-section class="bg-primary text-white">
            <div class="text-h6 text-center">WhatsApp</div>
          </q-card-section>

          <q-item class="q-py-sm">
            <q-item-section>
              <q-item-label>Usar WhatsApp para notificaciones</q-item-label>
              <q-item-label caption>
                Si lo apagas, ninguna acción intenta enviar por WhatsApp.
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle
                v-model="whatsappActivo"
                color="teal-7"
                :disable="guardandoCanal"
                @update:model-value="guardarCanalWhatsapp" />
            </q-item-section>
          </q-item>

          <q-separator />

          <q-tabs v-model="waTab" dense align="justify" narrow-indicator
            active-color="teal-7" indicator-color="teal-7">
            <q-tab name="no_oficial" no-caps icon="fa-brands fa-whatsapp">
              <q-badge v-if="canalActivo === 'baileys'" color="teal-7" floating>Activo</q-badge>
              <div class="q-ml-xs">No oficial</div>
            </q-tab>
            <q-tab name="oficial" no-caps icon="verified">
              <q-badge v-if="canalActivo === 'cloud_api'" color="teal-7" floating>Activo</q-badge>
              <div class="q-ml-xs">Oficial</div>
            </q-tab>
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="waTab" animated>

            <q-tab-panel name="no_oficial" class="q-pt-lg q-pb-md">
              <q-banner dense class="q-mb-md rounded-borders text-body2"
                :class="$q.dark.isActive ? 'bg-grey-9 text-grey-3' : 'bg-grey-2 text-grey-8'">
                <template v-slot:avatar>
                  <q-icon name="info_outline" :color="$q.dark.isActive ? 'blue-grey-3' : 'blue-grey-6'" />
                </template>
                Canal no oficial: al no estar aprobado por WhatsApp, un uso inadecuado
                (envíos masivos o mensajes muy seguidos) puede provocar restricciones en
                el número. Úsalo con moderación.
              </q-banner>

              <label>Vincular WhatsApp:</label>
              <q-input v-model="numeroVinculado" outlined dense readonly filled
                label="Numero vinculado" class="q-mt-xs">
                <template v-slot:prepend>
                  <q-icon name="fa-brands fa-whatsapp" class="q-mr-xs" size="30px"
                    :color="conectado ? 'green-7' : 'blue-grey-3'" />
                </template>
              </q-input>

              <q-btn v-if="conectado" class="full-width q-mt-lg" color="negative" push
                icon="logout" label="Cerrar sesión" @click="cerrarSesion" />

              <q-btn v-else class="full-width q-mt-lg" color="teal-7" push
                icon="qr_code_2" label="Vincular WhatsApp"
                :loading="preparandoSesion" @click="abrirVinculacion" />

              <q-btn v-if="canalActivo !== 'baileys'" flat no-caps dense color="teal-8"
                icon="swap_horiz" label="Usar este canal para enviar"
                class="full-width q-mt-sm" @click="activarNoOficial" />
            </q-tab-panel>

            <q-tab-panel name="oficial" class="q-pt-lg q-pb-md">
              <WhatsappCloudApi
                @saved="getEmpresa"
                @cleared="getEmpresa" />
            </q-tab-panel>

          </q-tab-panels>
        </q-card>
      </div>

      <!-- Correo -->
      <div class="col-xs-12 col-md-7">
        <q-card flat class="shadow_custom full-height">
          <q-card-section class="bg-primary text-white">
            <div class="text-h6 text-center">Datos del servidor correo</div>
          </q-card-section>

          <q-item class="q-py-sm">
            <q-item-section>
              <q-item-label>Usar correo para notificaciones</q-item-label>
              <q-item-label caption>
                Si lo apagas, ninguna acción intenta enviar por correo.
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle
                v-model="correoActivo"
                color="teal-7"
                :disable="guardandoCorreo || !configEmail"
                @update:model-value="guardarCanalCorreo" />
            </q-item-section>
          </q-item>

          <q-separator />

          <q-card-section class="q-pt-none q-pb-md">
            <FormEmail v-if="configEmail" :edit="true" :config="configEmail" />

            <div v-else class="text-center q-pa-lg text-blue-grey">
              Esta empresa todavía no tiene configuración de correo.
            </div>
          </q-card-section>
        </q-card>
      </div>

    </div>
  </div>

  <q-dialog v-model="modalAsociarWhatsApp">
    <ModalWhatsapp :session-id="sesionWhatsapp" @vinculado="dispositivoVinculado" />
  </q-dialog>
</template>
