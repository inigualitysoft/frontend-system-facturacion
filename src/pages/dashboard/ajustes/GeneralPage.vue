<script setup lang="ts">
  import { ref } from 'vue'
  import { useQuasar } from 'quasar'
  
  const options = ['America/Guayaquil'];
  const $q = useQuasar()

  const formConfigBasic = ref({
    validIdentification : true,
    zonaHoraria: ''
  })

  const model = ref(null)

</script>

<template>
  <q-page>
    <div class="row q-py-lg q-pl-md" :class="$q.screen.xs ? 'justify-center' : 'justify-between'">
      <div class="col-md-6">
        <label class="text-h6">Ajustes Generales</label>
      </div>        
    </div>

    <div class="q-px-md">
      <div class="row q-col-gutter-md">

        <div class="col-xs-12 col-md-6">
          <q-card class="my-card">
            <q-card-section class="bg-blue-grey-10 text-white q-py-sm">
              <div class="text-h6">Datos de la empresa</div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              <div class="row q-pt-lg">
                <div class="col-4 flex justify-end items-center">
                  <label for="">Empresa:</label>
                </div>
                <div class="col-6 q-ml-md">
                  <q-input v-model="formConfigBasic.zonaHoraria" dense outlined required />
                </div>

                <div class="col-4 flex justify-end items-center q-mt-md">
                  <label for="">Dirección:</label>
                </div>
                <div class="col-6 q-ml-md q-mt-md">
                  <q-input v-model="formConfigBasic.zonaHoraria" dense outlined required />
                </div>

                <div class="col-4 flex justify-end items-center q-mt-md">
                  <label for="">Teléfono:</label>
                </div>
                <div class="col-6 q-ml-md q-mt-md">
                  <q-input v-model="formConfigBasic.zonaHoraria" dense outlined required />
                </div>

                <div class="col-4 flex justify-end items-center q-mt-md">
                  <label for="">Identificación:</label>
                </div>
                <div class="col-6 q-ml-md q-mt-md">
                  <q-input v-model="formConfigBasic.zonaHoraria" dense label="RUC, DNI, PASAPORTE" outlined required />
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

        <div class="col-xs-12 col-md-6">
          <q-card class="my-card">
            <q-card-section class="bg-blue-grey-10 text-white q-py-sm">
              <div class="text-h6">Configuración Basica</div>
            </q-card-section>

            <q-card-section class="q-pt-none" style="padding-bottom: 21px;">
              <div class="row q-pt-lg">
                <div class="col-4 flex justify-end items-center">
                  <label for="">Zona Horaria:</label>
                </div>
                <div class="col-6 q-ml-md">
                  <q-select outlined dense 
                    v-model="formConfigBasic.zonaHoraria" :options="options" />
                </div>

                <div class="col-4 flex justify-end items-center q-mt-md">
                  <label for="">Email Backup:</label>
                </div>
                <div class="col-6 q-ml-md q-mt-md">
                  <q-input v-model="formConfigBasic.zonaHoraria" dense outlined required />
                </div>

                <div class="col-4 flex justify-end items-center q-mt-md">
                  <label for="">Email Soporte:</label>
                </div>
                <div class="col-6 q-ml-md q-mt-md">
                  <q-input v-model="formConfigBasic.zonaHoraria" dense outlined required />
                </div>

                <div class="col-4 flex justify-end items-center q-mt-md">
                  <label for="">Email Facturación:</label>
                </div>
                <div class="col-6 q-ml-md q-mt-md">
                  <q-input v-model="formConfigBasic.zonaHoraria" dense outlined required label="*Email remitente" />
                </div>

                <div class="col-4 flex justify-end items-center q-mt-md">
                  <label for="">Validar Cedula/DNI/RUT:</label>
                </div>
                <div class="col-6 q-ml-md q-mt-md">
                  <q-toggle color="green" dark v-model="formConfigBasic.validIdentification"/>

                  <q-btn icon="mail" outline rounded class="q-ml-lg" color="primary" 
                    style="position: relative;left: 60px;">
                  &nbsp; Guardar Cambios
                </q-btn>
                </div>

              </div>
            </q-card-section>

            <!-- <q-card-actions class="justify-end q-pb-md">
              <q-btn icon="mail" outline rounded class="q-mr-lg" color="primary">
                &nbsp; Guardar Cambios
              </q-btn>
            </q-card-actions> -->

          </q-card>
        </div>
      
        <div class="col-xs-12 col-md-6">
          <q-card class="my-card">
            <q-card-section class="bg-blue-grey-10 text-white q-py-sm">
              <div class="text-h6">Notificaciones del sistema</div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              <div class="row q-pt-lg">
                <div class="col-4 flex justify-end items-center">
                  <label for="">Correo Emisor/Router Caido:</label>
                </div>
                <div class="col-6 q-ml-md">
                  <q-input v-model="formConfigBasic.zonaHoraria" dense outlined required input-class="test"
                    hint="Puede indicar varios correos" />
                </div>

                <div class="col-4 flex justify-end items-center q-mt-md">
                  <label for="">N° móvil Emisor/Router Caido:</label>
                </div>
                <div class="col-6 q-ml-md q-mt-md">
                  <q-input v-model="formConfigBasic.zonaHoraria" dense outlined required hint="Puede indicar varios numeros" />
                </div>

                <div class="col-4 flex justify-end items-center q-mt-md">
                  <label for="">Correo reporte pago:</label>
                </div>
                <div class="col-6 q-ml-md q-mt-md">
                  <q-input v-model="formConfigBasic.zonaHoraria" dense outlined required hint="Puede indicar varios correos" />
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

        <div class="col-xs-12 col-md-6 ">
          <q-card class="my-card">
            <q-card-section class="bg-blue-grey-10 text-white q-py-sm">
              <div class="text-h6">Logo (.png)</div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              <div class="row q-pt-lg">

                <div class="col-12 flex justify-center items-center q-mt-md">

                  <q-file v-model="model" filled bottom-slots label="Subir Logo Principal">                     
                    <template v-slot:prepend>
                      <q-btn round dense flat icon="add" @click.stop.prevent />
                    </template>
                    <template v-slot:hint>
                      <div style="color: rgb(196 72 72);text-align: center;margin-top: 9px;">
                        *Maximo: <span class="text-weight-bold">20M</span>
                      </div>
                    </template>
                  </q-file>
                </div>

                <div class="col-12 flex justify-center items-center q-mt-md">
                  <q-file v-model="model" filled bottom-slots label="Subir Logo Facturas & Recibo">                     
                    <template v-slot:prepend>
                      <q-btn round dense flat icon="add" @click.stop.prevent />
                    </template>
                    <template v-slot:hint>
                      <div style="color: rgb(196 72 72);text-align: center;margin-top: 9px;">
                        *Maximo: <span class="text-weight-bold">20M</span>
                      </div>
                    </template>
                  </q-file>
                  <br>
                </div>

                <div class="col-12 flex justify-center items-center q-mt-xl">
                  <label class="text-center text-orange-9">
                    * Se recomienda que el logo no deba pesar mas de <span class="text-weight-bold">500kb</span> y un ancho no mayor de 400px.
                  </label>
                </div>

              </div>
            </q-card-section>

            <!-- <q-card-actions class="justify-end q-pb-md">
              <q-btn icon="mail" outline rounded class="q-mr-lg" color="primary">
                &nbsp; Guardar Cambios
              </q-btn>
            </q-card-actions> -->

          </q-card>
        </div>

        <div class="col-xs-12 col-md-6 offset-md-3 q-mb-xl">
          <q-card class="my-card">
            <q-card-section class="bg-blue-grey-10 text-white q-py-sm">
              <div class="text-h6">Imagen login administrador</div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              <div class="row q-pt-lg">

                <div class="col-12 q-mt-md">

                <div class="row">
                  <div class="col-4 flex justify-end items-center">
                    <label for="">Seleccionar Imagen:</label>
                  </div>
                  <div class="col-7 q-ml-md">
                    <q-select outlined v-model="formConfigBasic.validIdentification" dense :options="['logo-base.png']" />
                  </div>
                  <div class="col-12 text-left q-mt-sm">
                    <label class="text-light-blue-10" style="font-size: 11px;">
                      Para subir nuevas imagenes debe subirlos al servidor ruta :/var/www/html/admin/images/login-bg
                    </label>
                  </div>
                </div>

                </div>

                <div class="col-12 flex justify-center items-center q-mt-md">
                  
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
  

  