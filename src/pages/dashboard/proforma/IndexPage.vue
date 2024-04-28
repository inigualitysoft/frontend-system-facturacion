<script setup>
  import { ref } from 'vue';
  import ModalProforma from "./ModalProforma.vue";
  import ModalAceptacionPropuesta from "./ModalAceptacionPropuesta.vue";
  import useHelpers from "src/composables/useHelpers";
  import { useQuasar } from 'quasar'

  const { api, claim, mostrarNotify, showLoading } = useHelpers();
  const clausulas = ref([]);
  const aceptacion = ref('');
  const proforma_id = ref('');
  const loading = ref(false);
  const showModalProforma = ref( false );
  const showModalAceptacion = ref( false );
  const $q = useQuasar();

  const columns = [
    {
      name: 'nombre',
      label: 'Nombre',
      align: 'center'
    },
    {
      name: 'descripcion',
      align: 'center',
      label: 'Descripción'
    }
  ];

  const getProforma = async () => {
    showLoading(true)
    const { data } = await api.get(`/proforma/${ claim.company.id }`);

    proforma_id.value = data.id
    clausulas.value   = data.clausulas ? data.clausulas : []
    aceptacion.value  = data.aceptacion_proforma ? data.aceptacion_proforma : ''

    showLoading(false)
  }

  const edit = async () => {
    setTimeout(async () => {
      await api.patch(`/proforma/${ proforma_id.value }`, {
        clausulas: clausulas.value,
        aceptacion_proforma: aceptacion.value
      });
    }, 1000)
  }

  const deleteClausula = ( index ) => {
    $q.dialog({
      title: 'Confirmar',
      message: 'Deseas quitar esta clausula?',
      ok: { push: true, label:'Quitar', color: 'teal-7' },
      cancel: { push: true, color: 'blue-grey-8', label: 'Cancelar' }
    }).onOk( async () => {
      try {
        clausulas.value.splice(index, 1);
        edit();
      } catch (error) {
        mostrarNotify('negative', error.response.data.message);
      }
    })
  }

  const quitarAceptacion = () => {
    $q.dialog({
      title: 'Confirmar',
      message: 'Deseas quitar esta aceptación?',
      ok: { push: true, label:'Quitar', color: 'teal-7' },
      cancel: { push: true, color: 'blue-grey-8', label: 'Cancelar' }
    }).onOk( async () => {
      try {
        await api.patch(`/proforma/${ proforma_id.value }`, {
          clausulas: clausulas.value,
          aceptacion_proforma: ''
        });
        getProforma()
      } catch (error) {
        mostrarNotify('negative', error.response.data.message);
      }
    })
  }

  getProforma()

</script>

<template>
  <div class="q-ma-lg q-pt-md">
    <div class="row q-col-gutter-lg">
      <div class="col-xs-12 col-sm-7">
        <q-card class="my-card">
          <q-card-section class="text-white flex justify-between q-pt-sm q-pb-sm">
            <div class="text-h6 q-pt-sm">Clausulas de la propuesta</div>
            <q-btn @click="showModalProforma = true"
              round color="primary" icon="add" />
          </q-card-section>

          <q-separator />

          <q-card-section class="q-pa-none">
            <q-list bordered class="rounded-borders q-pt-sm">

              <template v-if="clausulas?.length > 0">
                <q-item v-for="(clausula, index) in clausulas" :key="index">

                  <q-item-section top class="col-2 gt-sm flex flex-center">
                    <span class="text-weight-medium text-left">
                      {{ clausula.nombre }}
                      <q-popup-edit v-model="clausula.nombre" buttons
                        @save="edit" label-set="Guardar" label-cancel="Cancelar"
                        auto-save v-slot="scope">
                        <q-input v-model="scope.value" dense autofocus counter @keyup.enter="scope.set" />
                      </q-popup-edit>
                    </span>
                  </q-item-section>

                  <q-item-section top>
                    <span class="text-weight-medium text-justify">
                      {{ clausula.descripcion }}
                      <q-popup-edit v-model="clausula.descripcion" buttons
                        @save="edit" label-set="Guardar" label-cancel="Cancelar"
                        auto-save v-slot="scope">
                        <q-input type="textarea" rows="4" v-model="scope.value" dense autofocus counter @keyup.enter="scope.set" />
                      </q-popup-edit>
                    </span>
                  </q-item-section>

                  <q-item-section top side class="flex flex-center">
                    <div class="text-grey-8 q-gutter-xs">
                      <q-btn class="gt-xs" @click="deleteClausula( index )"
                          size="12px" flat dense round icon="delete" />
                    </div>
                  </q-item-section>
                </q-item>
              </template>
              <template v-else>
                <q-item class="text-center">
                  <q-item-section top class="col-12 gt-sm">
                    <q-item-label class="q-mt-sm">
                      No hay clausulas
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>

            </q-list>

          </q-card-section>
        </q-card>
      </div>
      <div class="col-xs-12 col-sm-5">
        <q-card class="my-card">
          <q-card-section class="text-white flex justify-between q-pt-sm q-pb-sm">
            <div class="text-h6 q-pt-sm">Aceptación de la propuesta</div>
            <q-btn v-if="aceptacion?.length == 0"
              @click="showModalAceptacion = true"
              round color="primary" icon="add" />
          </q-card-section>

          <q-separator />

          <q-card-section class="q-pa-none">
            <q-list bordered class="rounded-borders q-pt-sm">

              <template v-if="aceptacion?.length > 0">
                <q-item>

                  <q-item-section top>
                    <span class="text-weight-medium text-justify" id="text-aceptacion">
                      {{ aceptacion }}
                      <q-popup-edit v-model="aceptacion" buttons
                        @save="edit" label-set="Guardar" label-cancel="Cancelar"
                        auto-save v-slot="scope">
                        <q-input type="textarea" rows="4" v-model="scope.value" dense autofocus counter @keyup.enter="scope.set" />
                      </q-popup-edit>
                    </span>
                    </q-item-section>

                  <q-item-section top side>
                    <div class="text-grey-8 q-gutter-xs">
                      <q-btn class="gt-xs" @click="quitarAceptacion"
                          size="12px" flat dense round icon="delete" />
                    </div>
                  </q-item-section>
                </q-item>
              </template>
              <template v-else>
                <q-item class="text-center">
                  <q-item-section top class="col-12 gt-sm">
                    <q-item-label class="q-mt-sm">
                      No hay clausulas
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>

            </q-list>

          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>

  <q-dialog v-model="showModalProforma">
    <ModalProforma
      :clausulas="clausulas"
      :aceptacion="aceptacion"
      @hideModal="showModalProforma = false, getProforma()" />
  </q-dialog>

  <q-dialog v-model="showModalAceptacion">
    <ModalAceptacionPropuesta
      :clausulas="clausulas"
      :aceptacion="aceptacion"
      :proforma_id="proforma_id"
      @hideModal="showModalAceptacion = false, getProforma()" />
  </q-dialog>
</template>




