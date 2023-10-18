<template>
  <q-page class="container">
    <div class="q-pa-md">   

      <div class="row q-col-gutter-md">
  
        <div class="col-xs-12 col-sm-6 col-md-3 cardInfo">
          <q-card class="my-card text-white" style="background-color: #DC3545;">

            <q-card-section>
              <div class="row q-py-sm">
                <div class="col-8">
                  <div class="text-h4 text-weight-bold">
                    23
                  </div>
                  <div class="text-subtitle1">
                    Facturas Vencidas
                  </div>
                </div>
                <div class="col-4 flex flex-center">
                  <!-- <i class="fa-solid fa-file-circle-xmark"></i> -->
                  <i class="fa-solid fa-file-circle-xmark iconCard"
                    style="font-size: 45px;color: rgb(169 44 55);margin-left: 16px;">                    
                  </i>
                </div>
              </div>
            </q-card-section>

            <q-card-actions class="justify-center q-py-none" 
              style="background-color: #C6303E;">
              <q-btn flat>
                Mas Info 
                <i class="fa-solid fa-circle-arrow-right q-ml-sm iconTest" style="font-size: 18px;">                  
                </i>
              </q-btn>
            </q-card-actions>

          </q-card>
        </div>  

        <div class="col-xs-12 col-sm-6 col-md-3 cardInfo">
          <q-card class="my-card text-white" style="background-color: #FFC107;">

            <q-card-section>
              <div class="row q-py-sm">
                <div class="col-8">
                  <div class="text-h4 text-blue-grey-10 text-weight-bold">
                    23
                  </div>
                  <div class="text-subtitle1 text-blue-grey-10 text-weight-medium">
                    Facturas Pendientes
                  </div>
                </div>
                <div class="col-4 flex flex-center">
                  <i class="fa-solid fa-file-invoice iconCard"
                    style="font-size: 45px;color: rgb(191 145 9);margin-left: 16px;">                    
                  </i>
                </div>
              </div>
            </q-card-section>

            <q-card-actions class="justify-center q-py-none text-blue-grey-10 text-weight-medium" 
              style="background-color: #D9A406;">
              <q-btn flat>
                Mas Info 
                <i class="fa-solid fa-circle-arrow-right q-ml-sm iconTest" style="font-size: 18px;">                  
                </i>
              </q-btn>
            </q-card-actions>

          </q-card>
        </div>  
        
        <div class="col-xs-12 col-sm-6 col-md-3 cardInfo">
          <q-card class="my-card text-white" style="background-color: #28A745;">

            <q-card-section>
              <div class="row q-py-sm">
                <div class="col-8">
                  <div class="text-h4 text-weight-bold">
                    55
                  </div>
                  <div class="text-subtitle1">
                    Total de Clientes
                  </div>
                </div>
                <div class="col-4 flex flex-center">
                  <i class="fa-solid fa-users iconCard" 
                  style="font-size: 45px;color: #228E3B;margin-left: 16px;">                    
                  </i>
                  <!-- <i class="fa-solid fa-file-invoice iconCard"
                    style="font-size: 45px;color: #228E3B;margin-left: 16px;">                    
                  </i> -->
                </div>
              </div>
            </q-card-section>

            <q-card-actions class="justify-center q-py-none" 
              style="background-color: #228E3B;">
              <q-btn flat>
                Mas Info                 
                <i class="fa-solid fa-circle-arrow-right q-ml-sm iconTest" style="font-size: 18px;">                  
                </i>
              </q-btn>
            </q-card-actions>

          </q-card>
        </div>  

        <div class="col-xs-12 col-sm-6 col-md-3 cardInfo">
          <q-card class="my-card text-white" style="background-color: #17A2B8;">

            <q-card-section>
              <div class="row q-py-sm">
                <div class="col-8">
                  <div class="text-h4 text-weight-bold">
                    87
                  </div>
                  <div class="text-subtitle1">
                    Ingreso de Valores
                  </div>
                </div>
                <div class="col-4 flex flex-center">
                  <i class="fa-solid fa-file-invoice iconCard"
                    style="font-size: 45px;color: #148A9D;margin-left: 16px;">                    
                  </i>
                </div>
              </div>
            </q-card-section>

            <q-card-actions class="justify-center q-py-none" 
              style="background-color: #148A9D;">
              <q-btn flat>
                Mas Info 
                <i class="fa-solid fa-circle-arrow-right q-ml-sm iconTest" style="font-size: 18px;">                  
                </i>
              </q-btn>
            </q-card-actions>

          </q-card>
        </div>  
  
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">

</script>

<style>
.cardInfo:hover .iconCard{
  font-size: 56px !important;
  transition: font-size .1s linear;
}
.cardInfo{
  margin-top: 8px;
}
</style>
