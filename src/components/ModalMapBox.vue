<script setup>
  import mapboxgl from 'mapbox-gl';
  import { ref, onMounted, watch } from 'vue';
  import useHelpers from "../composables/useHelpers";
  import apiSearchPlaces from "../boot/apiSearchPlaces";

  const props = defineProps(['objMap'])

  const { mostrarNotify } = useHelpers();
  const coordenadas       = ref([]);
  const ubicacionUser     = ref([]);
  const places            = ref([]);
  const place_selected    = ref("");
  const map               = ref(null); 
  const loadingPlaces     = ref( false ); 
  const zoom              = ref( 14 ); 
  const marker            = ref( null ); 

  mapboxgl.accessToken = 'pk.eyJ1IjoiZmVyamViYXkiLCJhIjoiY2xwOG81djFhMjY0OTJpbnJrbGdobTg3aSJ9.sF33F2cBAjv0YCfYf7EEMQ';
  
  onMounted( async() => {

    if( !navigator.geolocation ) {
      return mostrarNotify('negative', 'Tu Navegador no soporta la Geolocalización');
    }else{
      navigator.geolocation.getCurrentPosition( async ({ coords }) => {

        if( props.objMap.edit )
          coordenadas.value = [ props.objMap.coords.split(',')[0], props.objMap.coords.split(',')[1] ]
        else
          coordenadas.value = [ coords.longitude, coords.latitude ];

        ubicacionUser.value = [ coords.longitude, coords.latitude ];

        await Promise.resolve();
    
        setTimeout(() => {

          map.value = new mapboxgl.Map({
            container: 'map', // container ID
            style: 'mapbox://styles/mapbox/streets-v12', // style URL
            center: coordenadas.value, // starting position [lng, lat]
            zoom: zoom.value, // starting zoom    
          });

          marker.value = new mapboxgl.Marker()
                          .setLngLat( coordenadas.value )
                          .addTo( map.value );

          map.value.on('click', function (e) {
            marker.value.remove();

            var coordinates = e.lngLat;

            marker.value = new mapboxgl.Marker()
                              .setLngLat(coordinates)
                              .addTo(map.value);
          });

        }, 500)
      },
      ( err ) => { 
        console.log( err ); 
      })

    }
  })

  const irAUbicacion = async () => {
    zoom.value = 14;

    map.value?.flyTo({
      center: ubicacionUser.value,
      zoom: zoom.value
    })
  }

  const searchUbicacion = async (val, update, abort) => {
    if (val === '') {
      update(() => {})
      return
    }

    update(async () => {
      loadingPlaces.value = true;
      places.value = []

      const { data } = await apiSearchPlaces.get(`/${ val.toLowerCase() }.json`, {
        params: { proximity: coordenadas.value.join(',') }
      })

      data.features.forEach(place => {
        places.value.push({
          label: place.text,
          value: place.center,
          place_name: place.place_name
        })
      });

      loadingPlaces.value = false;
    })
  }

  const goToPlace = () => {
    if ( place_selected.value != null) 
      map.value?.flyTo({
        center: place_selected.value,
        zoom: 14
      })      
    else
      places.value = []
  }

  const setZoom = ( estado ) => {

    let valorZoom = estado == 'aumentar' ? ( zoom.value + 1 ) : ( zoom.value - 1 )
    if ( valorZoom > 0 && valorZoom < 20 ) {
      zoom.value = valorZoom;
  
      map.value.setZoom( valorZoom );      
    }

  }

  watch( marker, ( new_val, old_val ) => {
    
    marker.value.getElement().style.cursor = 'pointer';

    marker.value.getElement().addEventListener('click', function(e) {
      e.stopPropagation();
    });
  })

</script>

<template>
  <q-card style="width: 1000px; max-width: 80vw;">
    <q-card-section>
      <div class="text-h6 text-center">
        Coordenadas Seleccionada
        <q-btn round flat dense icon="close" class="float-right" color="grey-8" v-close-popup></q-btn>
      </div>
      <div class="text-subtitle1 text-center">
        Lng:&nbsp; <q-badge outline :color="$q.dark.isActive ? 'deep-orange-12' : 'deep-orange-14'" 
          class="text-subtitle2" :label="marker?._lngLat.lng" /> &nbsp;&nbsp;&nbsp; 
        Lat:&nbsp; <q-badge outline :color="$q.dark.isActive ? 'deep-orange-12' : 'deep-orange-14'" 
          class="text-subtitle2" :label="marker?._lngLat.lat" />
      </div>
    </q-card-section>

    <q-separator inset></q-separator>

    <q-card-section class="q-pa-none" id="box-map">   

      <div class="container-input">
        <q-select filled v-model="place_selected"
          input-style="width: 100px;" id="busqueda"    
          color="blue-grey-10" bg-color="blue-grey-9" label-color="text-deep-orange"
          options-selected-class="text-deep-orange"   
          :loading="loadingPlaces" emit-value map-options
          @filter="searchUbicacion" dark
          @update:model-value="goToPlace"
          :options="places" dense use-input input-debounce="1100">

          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section>
                <q-item-label>{{ scope.opt.label }}</q-item-label>
                <q-item-label caption>{{ scope.opt.place_name }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>

        </q-select>
      </div>
      
      <div id="map" class="map-container" ref="mapElement"></div>

      <q-btn id="btn-ubicacion" color="primary" @click="irAUbicacion">
        Ir a mi ubicación
      </q-btn>
      
      <q-btn-group class="group-btn">
        <q-btn @click="setZoom('aumentar')"
        color="blue-grey-9" icon="zoom_in" square />
        <q-btn @click="setZoom('disminuir')"
        color="blue-grey-9" class="q-mt-sm" icon="zoom_out" square />
      </q-btn-group>
      
      <q-btn @click="$emit('coordenadasSelected', marker?._lngLat)"
        id="btn-coordenadas" color="teal-10" icon-right="location_on">
        Agregar Coordenadas &nbsp;
      </q-btn>

    </q-card-section>
  </q-card>
</template>

<style>
.map-container{
  height: 75vh;
}
#box-map{
  position: relative;
}
#btn-ubicacion{
  position: absolute;
  top: 20px;
  right: 15px;
}
#btn-coordenadas{
  position: absolute;
  bottom: 20px;
  right: 15px;
}
.container-input{
  position: absolute;
  top: 20px;
  left: 15px;
  width: 30%;
  z-index: 1000;  
}
.group-btn{
  position: absolute;
  bottom: 20px;
  left: 25px;
  display: inline-grid !important;
  z-index: 1000;  
}
</style>

  