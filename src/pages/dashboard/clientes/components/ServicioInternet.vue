<script setup>
  import ModalMapBox from '../../../../components/ModalMapBox.vue'
  import { useCliente } from '../composables/useCliente';
  import { ref } from 'vue';

  const ipsUsadas = [];
  let puertosUsados = [];
  const { 
    api, 
    claim, 
    formInternet, 
    listIps,
    listCajasNap,
    listPuertosCajaNap,
    groupedIpsByRed,
    listRedes,
    optionsListIps,
    listRouter,
    listServicionsInternet,
    obtenerListaSubred,
    validacionesInternet, 
    mostrarNotify, 
    validDecimal,
    step
  } = useCliente();

  const modalAgregarCoordenadas = ref( false );
  const objMap = ref({ edit: false, coords: '' });
  const props = defineProps(['edit'])

  const showModalMap = () => {
    if ( props.edit ) 
      objMap.value = { edit: true, coords: formInternet.value.coordenadas }

    modalAgregarCoordenadas.value = true;
  }

  const cargarRouter = async () => {
    const { data } = await api.get(`/router/find/${ claim.company.id }`);
    
    data.forEach(router => {
      listRouter.value.push({ label: router.nombre, value: router.id })
    });    
  }

  const getServiciosInternet = async () => {   
    validacionesInternet.value.router_id.isValid = true;
    
    formInternet.value.perfil_internet = ''
    formInternet.value.precio = 0.00
    listServicionsInternet.value = [];

    let headers = { headers: { router_id: formInternet.value.router_id } };
    
    const { data } = await api.get('/internet', headers);
    
    if ( data.length == 0 ) mostrarNotify( 'warning', 'Por favor agrega un perfil de internet' )
    else
      data.forEach(internet => {
        listServicionsInternet.value.push({ 
          label: internet.nombre_plan, 
          value: internet.id,
          precio_plan: internet.precio_plan 
        })
      });

    cargarRedesIPv4();
    getCajasNap();
  }

  const getIpsUsadasPorRed = ( objeto, ip ) => {
    const partesIp = ip.split('.');
  
    for (const clave in objeto) {
      if (objeto.hasOwnProperty(clave)) {
        const partesClave = clave.split('.');

        // Verificar si la parte de red de la clave coincide con la parte de red de la IP
        if (partesClave.every((valor, indice) => valor === partesIp[indice])) {
          return objeto[`${ clave }`].length // Coincidencia encontrada
        }
      }
    }
    return 0; // No se encontraron coincidencias
  }

  const cargarRedesIPv4 = async () => {
    listRedes.value = [];  
    puertosUsados = [];  
    let headers = { headers: { router_id: formInternet.value.router_id } };

    const resp = await api.get(`/customers/get-ips/${ formInternet.value.router_id }`);
    resp.data.forEach( x => { 
      if ( x.puerto_id ) puertosUsados.push( x.puerto_id.id ) 
      ipsUsadas.push( x.ipv4 )  
    })

    await Promise.resolve();

    const groupedIps = groupedIpsByRed( ipsUsadas );
    
    const { data } = await api.get('/red-ipv4', headers);

    data.forEach((x) => {
      const red  = x.red;
      const cidr = x.cidr.split(' ')[0]
      const rangoIps = x.cidr.split('-')[1].split(',')[1].split(' ')[1];

      const listIps = obtenerListaSubred(`${ red }/${ cidr }`)
      const groupedRedes = groupedIpsByRed( listIps );
      
      let totalIps;
      if ( parseInt(cidr) >= 25 && parseInt(cidr) <= 32 ) 
        totalIps = (2 ** (32 - cidr));
      else
        totalIps = 256;

      let children = [];
    
      let claves = Object.keys(groupedRedes); 
      for(let i = 0; i < claves.length; i++){
        const ipUsadas = getIpsUsadasPorRed( groupedIps, claves[i] );
        
        let restarGatewayAndBroadcast;
        if (claves.length == 1) restarGatewayAndBroadcast = 2;
        else if (claves.length > 1 && i == 0) restarGatewayAndBroadcast = 1;
        else if (claves.length > 1 && (i + 1) == claves.length) restarGatewayAndBroadcast = 1;
        else restarGatewayAndBroadcast = 0;

        listRedes.value.push({
          value: `${ x.id }|${ i }`,
          label: `${ claves[i] }.0 
          (${ totalIps - ( restarGatewayAndBroadcast + ipUsadas ) } Ips disponibles) ${ x.nombre }`,
          red_name: x.nombre,
          cidr
        })    

      }
    });
  }

  const obtenerIps = () => {
    formInternet.value.ipv4 = '';
    const red = listRedes.value.find( red => red.value == formInternet.value.red_id)

    const subRedes = listRedes.value.filter( x => x.red_name == red.red_name )

    let prefijo;
    if ( parseInt(red.cidr) >= 25 && parseInt(red.cidr) <= 32 ) 
      prefijo = red.cidr;
    else
      prefijo = '24';

    listIps.value = obtenerListaSubred(`${ red.label.split(' ')[0] }/${ prefijo }`);

    if (subRedes.length == 1) {
      listIps.value.shift();
      listIps.value.pop();
    }else{
      if ( formInternet.value.red_id == subRedes[0].value) listIps.value.shift();
      else if( formInternet.value.red_id == subRedes[ subRedes.length - 1 ].value) listIps.value.pop();      
    }

    optionsListIps.value = listIps.value;

    validacionesInternet.value.red_id.isValid = true;

    ipsUsadas.forEach(ip => { //Quitar IPS usadas de clientes
      const index = listIps.value.findIndex( x =>  x == ip);
      if( index != -1 ) listIps.value.splice(index, 1);
    })

    if ( listIps.value.length > 0 ) { 
      formInternet.value.ipv4 = listIps.value[0];
      validacionesInternet.value.ipv4.isValid = true;
    }
  }

  const getCajasNap = async () => {
    let headers = { headers: { router_id: formInternet.value.router_id } };

    const { data } = await api.get('/caja-nap', headers);
    data.forEach((x) => { 
      listCajasNap.value.push({
        value: `${ x.id }`,
        label: `${ x.nombre }`,
        puertos: x.puertos
      })  
    });
  }

  const getPuertosCajaNap = () => {
    listPuertosCajaNap.value = []
    listCajasNap.value.find( c => c.value == formInternet.value.caja_id ).puertos.forEach( p => {
      if( !puertosUsados.includes(p.id) ){
        listPuertosCajaNap.value.push({
          value: `${ p.id }`,
          label: `Puerto ${ p.puerto }`
        })        
      }
    })  
    listPuertosCajaNap.value.unshift({ value: 'Ninguno', label: 'Ninguno' })  
  }

  const cargarPrecioInternet = () => {
    validacionesInternet.value.perfil_internet.isValid = true;
    validacionesInternet.value.precio.isValid = true;

    const servicio = listServicionsInternet.value.find( x => x.value == formInternet.value.perfil_internet )
    formInternet.value.precio = servicio.precio_plan
  }

  const filtrarRed = (val = '', update ) => { 
    if (val === '') {
      update(() => { listIps.value = optionsListIps.value })
      return
    }

    update(() => {
      const needle = val.toLowerCase()
      listIps.value = listIps.value.filter(v => v.toLowerCase().indexOf(needle) > -1)
    })
  }

  const coordenadasSelected = ( coords ) => {
    formInternet.value.coordenadas = `${ coords.lng }, ${ coords.lat }`;
    modalAgregarCoordenadas.value = false
  }

  if ( listRouter.value.length == 0 ) cargarRouter();

</script>

<template>
  <div class="row q-col-gutter-md" :class="$q.screen.width < 1022 || 'q-col-gutter-y-lg q-pt-md'">

    <div class="col-12 q-pt-none" :class="$q.screen.width < 1022 || 'q-pl-none'">
      <div class="row justify-center">
        <div class="col-xs-12 col-md-6" :class="$q.screen.width < 1022 ? 'q-pt-xs' : 'q-pt-xs'">
          <div class="row">
            <div class="col-xs-12 col-md-4 flex items-center justify-end" 
              :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'texto-rigth q-pb-md']">
              <label :class="$q.screen.width < 1022 || 'q-pr-md'">
                Router:
              </label>
            </div>
            <div class="col-xs-12 col-md-7 justify-center">
              <q-select dense v-model.trim="formInternet.router_id" filled 
                @update:model-value="getServiciosInternet"
                :error="!validacionesInternet.router_id.isValid" 
                emit-value map-options
                :options="listRouter">
                  <template v-slot:error>
                    <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                      {{ validacionesInternet.router_id.message }}
                    </label>
                  </template>
              </q-select>
            </div>
          </div>
        </div>   
      </div>
    </div>

    <template v-if="formInternet.router_id.length != 0">
      <div class="col-xs-12 col-md-6 q-pt-none">
        <div class="row">
          <div class="col-xs-12 col-md-4 flex items-center justify-end" 
            :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'texto-rigth q-pb-md']">
            <label :class="$q.screen.width < 1022 || 'q-pr-md'">
              Dirección:
            </label>
          </div>
          <div class="col-xs-12 col-md-7">
            <q-input v-model.trim="formInternet.direccion"
            input-style="width: 81%"
            :error="!validacionesInternet.direccion.isValid"           
            dense outlined>
              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ validacionesInternet.direccion.message }}
                </label>
              </template>
              <template v-slot:append>
                <q-badge filled color="blue-grey-6" 
                  style="height: 100%;width: 19%;position: absolute;right: 0px;justify-content: center;font-size:14px; cursor: pointer;">
                  <q-icon name="fa-solid fa-street-view" size="xs" />
                </q-badge>
              </template>
            </q-input>
          </div>
        </div>
      </div>

      <div class="col-xs-12 col-md-6 q-pt-none" :class="$q.screen.width < 1022 || 'q-pl-none'">
        <div class="row">
          <div class="col-xs-12 col-md-4 flex items-center justify-end" 
            :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'texto-rigth q-pb-md']">
            <label :class="$q.screen.width < 1022 || 'q-pr-md'">
              Coordenadas:
            </label>
          </div>        
          <div class="col-xs-12 col-md-7">
            <q-input v-model.trim="formInternet.coordenadas"
            placeholder="Coordenadas Longitud, Latitud" input-style="width: 81%"
            :error="!validacionesInternet.coordenadas.isValid"           
             dense outlined>
              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ validacionesInternet.coordenadas.message }}
                </label>
              </template>
              <template v-slot:append>
                <q-badge filled color="blue-grey-6" 
                  @click="showModalMap"
                  style="height: 100%;width: 19%;position: absolute;right: 0px;justify-content: center;font-size:14px; cursor: pointer;">
                  <q-icon name="fa-solid fa-location-dot" size="xs" />
                </q-badge>
              </template>
            </q-input>
          </div>
        </div>
      </div>

      <div class="col-xs-12 col-md-6" :class="$q.screen.width < 1022 ? 'q-pt-xs' : 'q-pt-xs'">
        <div class="row">
          <div class="col-xs-12 col-md-4 flex items-center justify-end" 
            :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'texto-rigth q-pb-md']">
            <label :class="$q.screen.width < 1022 || 'q-pr-md'">
              Perfil Internet:
            </label>
          </div>
          <div class="col-xs-12 col-md-7 justify-center">
            <q-select dense v-model.trim="formInternet.perfil_internet" filled 
              @update:model-value="cargarPrecioInternet"
              :error="!validacionesInternet.perfil_internet.isValid" 
              emit-value map-options
              :options="listServicionsInternet">
                <template v-slot:error>
                  <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                    {{ validacionesInternet.perfil_internet.message }}
                  </label>
                </template>
            </q-select>
          </div>
        </div>
      </div>  

      <div class="col-xs-12 col-md-6 q-pt-none" :class="$q.screen.width < 1022 || 'q-pl-none'">
        <div class="row">
          <div class="col-xs-12 col-md-4 flex items-center justify-end" 
            :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'texto-rigth q-pb-md']">
            <label :class="$q.screen.width < 1022 || 'q-pr-md'">
              Precio:
            </label>
          </div>        
          <div class="col-xs-12 col-md-7">
            <q-input v-model.trim="formInternet.precio"
            type="number" step="0.01" 
            @update:model-value="validDecimal('precio')"  
            :error="!validacionesInternet.precio.isValid"           
            input-class="resaltarTextoInput" dense outlined>
              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ validacionesInternet.precio.message }}
                </label>
              </template>
            </q-input>
          </div>
        </div>
      </div>
      <div class="col-xs-12 col-md-6 q-pt-none">
        <div class="row">
          <div class="col-xs-12 col-md-4 flex items-center justify-end" 
            :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'texto-rigth q-pb-md']">
            <label :class="$q.screen.width < 1022 || 'q-pr-md'">
              Fecha Instalación:
            </label>
          </div>
          <div class="col-xs-12 col-md-7">
            <q-input filled dense v-model="formInternet.fecha_instalacion" 
              :input-style="{textAlign: 'center'}"
                mask="date" :rules="['date']">
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="formInternet.fecha_instalacion">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Close" color="primary" flat />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
          </div>
        </div>
      </div>

      <div class="col-xs-12 col-md-6 q-pt-none" :class="$q.screen.width < 1022 || 'q-pl-none'">
        <div class="row">
          <div class="col-xs-12 col-md-4 flex items-center justify-end" 
            :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'texto-rigth q-pb-md']">
            <label :class="$q.screen.width < 1022 || 'q-pr-md'">
              MAC:
            </label>
          </div>        
          <div class="col-xs-12 col-md-7">
            <q-input v-model.trim="formInternet.mac"
            mask="XX:XX:XX:XX:XX:XX" unmasked-value
            :error="!validacionesInternet.mac.isValid"           
            input-class="resaltarTextoInput" dense outlined>
              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ validacionesInternet.mac.message }}
                </label>
              </template>
            </q-input>
          </div>
        </div>
      </div>

      <div class="col-xs-12 col-md-6" :class="$q.screen.width < 1022 ? 'q-pt-xs' : 'q-pt-xs'">
        <div class="row">
          <div class="col-xs-12 col-md-4 flex items-center justify-end" 
            :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'texto-rigth q-pb-md']">
            <label :class="$q.screen.width < 1022 || 'q-pr-md'">
              Redes IPv4:
            </label>
          </div>
          <div class="col-xs-12 col-md-7 justify-center">
            <q-select dense v-model.trim="formInternet.red_id" filled 
              @update:model-value="obtenerIps" 
              :error="!validacionesInternet.red_id.isValid" 
              emit-value map-options
              :options="listRedes">
                <template v-slot:error>
                  <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                    {{ validacionesInternet.red_id.message }}
                  </label>
                </template>
            </q-select>
          </div>
        </div>
      </div>  

      <div v-if="formInternet.red_id != ''"
        class="col-xs-12 col-md-6 q-pt-none" :class="$q.screen.width < 1022 || 'q-pl-none'">
        <div class="row">
          <div class="col-xs-12 col-md-4 flex items-center justify-end" 
            :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'texto-rigth q-pb-md']">
            <label :class="$q.screen.width < 1022 || 'q-pr-md'">
              IPv4:
            </label>
          </div>        
          <div class="col-xs-12 col-md-7">
            <q-select dense v-model.trim="formInternet.ipv4" filled 
              :error="!validacionesInternet.ipv4.isValid" 
              emit-value map-options use-input
              input-debounce="10"
              @filter="filtrarRed"
              :options="listIps">
                <template v-slot:error>
                  <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                    {{ validacionesInternet.ipv4.message }}
                  </label>
                </template>
            </q-select>
          </div>
        </div>
      </div>

      <div class="col-xs-12 col-md-6" :class="$q.screen.width < 1022 ? 'q-pt-xs' : 'q-pt-xs'">
        <div class="row">
          <div class="col-xs-12 col-md-4 flex items-center justify-end" 
            :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'texto-rigth q-pb-md']">
            <label :class="$q.screen.width < 1022 || 'q-pr-md'">
              Caja(s) Nap:
            </label>
          </div>
          <div class="col-xs-12 col-md-7 justify-center">
            <q-select dense v-model.trim="formInternet.caja_id" filled 
              @update:model-value="getPuertosCajaNap" 
              :error="!validacionesInternet.caja_id.isValid" 
              emit-value map-options
              :options="listCajasNap">
                <template v-slot:error>
                  <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                    {{ validacionesInternet.caja_id.message }}
                  </label>
                </template>
                <template v-slot:append>
                  <q-icon v-if="formInternet.caja_id.length > 0"
                    name="close" @click.stop.prevent="formInternet.caja_id = '', formInternet.puerto_id = ''" 
                      class="cursor-pointer" />
                </template>
            </q-select>
          </div>
        </div>
      </div>  

      <div v-if="formInternet.caja_id != ''"
        class="col-xs-12 col-md-6 q-pt-none" :class="$q.screen.width < 1022 || 'q-pl-none'">
        <div class="row">
          <div class="col-xs-12 col-md-4 flex items-center justify-end" 
            :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'texto-rigth q-pb-md']">
            <label :class="$q.screen.width < 1022 || 'q-pr-md'">
              Puerto Nap:
            </label>
          </div>        
          <div class="col-xs-12 col-md-7">
            <q-select dense v-model.trim="formInternet.puerto_id" filled 
              :error="!validacionesInternet.puerto_id.isValid" 
              @update:model-value="validacionesInternet.puerto_id.isValid = true"
              emit-value map-options
              :options="listPuertosCajaNap">
                <template v-slot:error>
                  <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                    {{ validacionesInternet.puerto_id.message }}
                  </label>
                </template>
            </q-select>
          </div>
        </div>
      </div>

    </template>

    <div class="col-xs-12 col-md-12 flex q-py-md" 
      style="padding-bottom: 0px;"
      :class="[ $q.screen.width < 600 
          ? 'justify-center q-pt-none q-ml-md' 
          : 'justify-between']">

        <q-btn v-if="$q.screen.width > 600"
          icon="arrow_back" @click="step = 2"
          outline rounded class="q-ml-md" 
          :color="!$q.dark.isActive ? 'blue-grey-10' : 'blue-grey-2'">
          &nbsp; Anterior
        </q-btn>

        <q-btn type="submit"
          icon-right="save" 
          outline rounded class="q-mr-lg" style="color: #696cff">
          &nbsp; Guardar&nbsp;
        </q-btn>
    </div>
  </div>

  <q-dialog v-model="modalAgregarCoordenadas">
    <ModalMapBox :objMap="objMap"
      @coordenadasSelected="coordenadasSelected" />
  </q-dialog>
  
</template>
