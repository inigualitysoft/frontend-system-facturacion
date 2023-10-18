<template>
    <q-page>

      <div class="row q-py-lg q-pl-md" :class="$q.screen.xs ? 'justify-center' : 'justify-between'">
        <div class="col-md-6">
          <label class="text-h6">Configuración correo</label>
        </div>        
      </div>
  
      <div class="q-px-md">
        <div class="row q-col-gutter-xs">

          <div class="col-xs-12">
            <q-card class="my-card">
              <q-card-section class="bg-blue-grey-10 text-white q-py-sm">
                <div class="text-h6">Datos del servidor de correo</div>
              </q-card-section>

              <q-card-section class="q-pt-none">
                <div class="row q-pt-lg">
                  <div class="col-xs-12 col-md-6">
                    <div class="row">

                      <div class="col-4 flex justify-end items-center">
                        <label for="">Tipo de autenticación:</label>
                      </div>
                      <div class="col-6 q-ml-md">
                        <q-input v-model="formTest.test" dense outlined required />
                      </div>

                      <div class="col-4 flex justify-end items-center q-mt-lg">
                        <label for="">Host/servidor:</label>
                      </div>
                      <div class="col-6 q-ml-md q-mt-lg">
                        <q-input v-model="formTest.test" type="number" dense outlined required />
                      </div>

                      <div class="col-4 flex justify-end items-center q-mt-lg">
                        <label for="">Seguridad:</label>
                      </div>
                      <div class="col-6 q-ml-md q-mt-lg">
                        <q-select v-model="formTest.test" outlined dense :options="['SSL']" />
                      </div>

                      <div class="col-4 flex justify-end items-center q-mt-lg">
                        <label for="">Usuario/Correo:</label>
                      </div>
                      <div class="col-6 q-ml-md q-mt-lg">
                        <q-input v-model="formTest.test" type="text" dense outlined required />
                      </div>

                      <div class="col-4 flex justify-end items-center q-mt-lg">
                        <label for="">Contraseña:</label>
                      </div>
                      <div class="col-6 q-ml-md q-mt-lg">
                        <q-input v-model="formTest.test" type="password" dense outlined required />
                      </div>

                    </div>
                  </div>

                  <div class="col-xs-12 col-md-6">
                    <div class="row">

                      <div class="col-4 flex justify-end items-center">
                        <label for="">Puerto:</label>
                      </div>
                      <div class="col-6 q-ml-md">
                        <q-input v-model="formTest.test" type="number" dense outlined required />
                      </div>

                      <div class="col-4 flex justify-end items-center q-mt-lg">
                        <label for="">Autenticación:</label>
                      </div>
                      <div class="col-6 q-ml-md q-mt-lg">
                        <q-select v-model="formTest.test" outlined dense :options="['SI', 'NO']" />
                      </div>

                      <div class="col-4 flex justify-end items-center q-mt-lg">
                        <label for="">Limite de envio:</label>
                      </div>
                      <div class="col-6 q-ml-md q-mt-lg">
                        <q-select v-model="formTest.test" outlined dense :options="['Limite por dia']" />
                      </div>

                      <div class="col-4 flex justify-end items-center q-mt-lg">
                        <label for="limit">Limite de correos:</label>
                      </div>
                      <div class="col-6 q-ml-md q-mt-lg">
                        <q-input v-model="formTest.test" type="number" id="limit" dense outlined required />
                      </div>

                    </div>
                  </div>

                  <div class="col-xs-12 col-md-6 offset-md-1">
                    <div class="row q-mt-md">
                      <div class="col-xs-4 col-md-2 flex justify-end items-center">
                        <label for="">Logo Correo:</label>
                      </div>
                      <div class=" col-xs-7 col-md-9 q-ml-md">
                        <q-input v-model="formTest.test" dense outlined required />
                      </div>
                    </div>
                  </div>

                </div>
              </q-card-section>

              <q-card-actions class="justify-end q-pb-md">
                <q-btn icon="mail" outline rounded class="q-mr-lg" color="primary">
                  &nbsp; Guardar Cambios
                </q-btn>
              </q-card-actions>

            </q-card>
          </div>
        </div>
      </div>
    </q-page>
  </template>
  
<script setup lang="ts">
  import { ref } from 'vue'
  import useRolPermisos from "../../../composables/useRolPermisos";
  
  const { validarPermisos } = useRolPermisos();
  const loading = ref( false );

  const formTest = ref({
      test: ''
  })

  const options = ['America/Guayaquil']
     
</script>

  