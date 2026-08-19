// Catálogos de impuestos del SRI (Ecuador) usados en el formulario de
// productos/servicios. Mismos valores que maneja ISPMAX.

// Tarifas de IVA vigentes e históricas. Se dejan las anteriores porque un
// producto viejo puede seguir facturándose con la tarifa con la que se creó.
export const IVA_OPCIONES = [0, 12, 14, 15].map(( v ) => ({ label: `${ v }%`, value: v }))

// Modo de cálculo del ICE.
export const ICE_OPCIONES = [
  { label: 'No aplica',      value: null },
  { label: 'Por porcentaje', value: 'tarifa' },
  { label: 'Por valor fijo', value: 'valor' }
]

// Códigos del catálogo de ICE del SRI.
export const CODIGOS_ICE = [
  { label: 'ICE NO ESPECIFICADO', value: 3000 },
  { label: 'ICE-CIGARRILLOS RUBIOS', value: 3011 },
  { label: 'ICE-CIGARRILLOS NEGROS', value: 3021 },
  { label: 'ICE-PRODUCTOS DEL TABACO Y SUCEDÁNEOS DEL TABACO EXCEPTO CIGARRILLOS', value: 3023 },
  { label: 'ICE-BEBIDAS ALCOHÓLICAS', value: 3031 },
  { label: 'HIELO-ALCOHOL', value: 3033 },
  { label: 'ICE-CERVEZA INDUSTRIAL', value: 3041 },
  { label: 'ICE-CERVEZA ARTESANAL', value: 3043 },
  { label: 'ICE-GASEOSAS', value: 3051 },
  { label: 'ICE BEBIDAS GASEOSAS CON BAJO CONTENIDO DE AZUCAR', value: 3054 },
  { label: 'ICE-AGUAS MINERALES', value: 3061 },
  { label: 'ICE-CAMIONETAS Y FURGONES CUYO PVP SEA HASTA DE 30000 USD', value: 3072 },
  { label: 'ICE-VEHÍCULOS MOTORIZADOS CUYO PVP SEA HASTA DE 20000 USD', value: 3073 },
  { label: 'ICE-VEHÍCULOS MOTORIZADOS EXCEPTO CAMIONETAS Y FURGONETAS ENTRE 20000 Y 30000', value: 3074 },
  { label: 'ICE-VEHÍCULOS MOTORIZADOS PVP ENTRE 30000 Y 40000', value: 3075 },
  { label: 'ICE-VEHÍCULOS MOTORIZADOS CUYO PVP SEA SUPERIOR A 40000 USD', value: 3076 },
  { label: 'ICE-VEHÍCULOS MOTORIZADOS CUYO PVP SUPERIOR USD 40.000 HASTA 50.000', value: 3077 },
  { label: 'ICE-VEHÍCULOS MOTORIZADOS CUYO PVP SUPERIOR USD 50.000 HASTA 60.000', value: 3078 },
  { label: 'ICE-VEHÍCULOS MOTORIZADOS CUYO PVP SUPERIOR USD 60.000 HASTA 70.000', value: 3079 },
  { label: 'ICE-VEHÍCULOS MOTORIZADOS CUYO PVP SUPERIOR USD 70.000', value: 3080 },
  { label: 'ICE-AVIONES, TRICARES, YATES, BARCOS DE REC', value: 3081 },
  { label: 'ICE-SERVICIOS DE TELEVISIÓN PREPAGADA', value: 3092 },
  { label: 'ICE-SERVICIOS TELEFONÍA', value: 3093 },
  { label: 'ICE BEBIDAS ENERGIZANTES', value: 3101 },
  { label: 'ICE BEBIDAS NO ALCOHÓLICAS', value: 3111 },
  { label: 'ICE VEHÍCULOS HÍBRIDOS O ELÉCTRICOS CUYO PVP SEA DE HASTA USD. 35.000', value: 3171 },
  { label: 'ICE VEHIC HÍBRIDOS O ELÉCTRICOS CUYO PVP MAYOR A USD. 35.000 HASTA USD 40.000', value: 3172 },
  { label: 'ICE VEHIC HÍBRIDOS O ELÉCTRICOS CUYO PVP MAYOR A USD. 40.000 HASTA USD 50.000', value: 3173 },
  { label: 'ICE VEHIC HÍBRIDOS O ELÉCTRICOS CUYO PVP MAYOR A USD. 60.000 HASTA USD 70.000', value: 3175 },
  { label: 'ICE VEHIC HÍBRIDOS O ELÉCTRICOS CUYO PVP MAYOR A USD. 70.000', value: 3176 },
  { label: 'ICE IMPOR. BEBIDAS ALCOHÓLICAS SENAE', value: 3533 },
  { label: 'ICE CERVEZA INDUSTRIAL', value: 3541 },
  { label: 'ICE CIGARRILLOS RUBIOS SENAE', value: 3542 },
  { label: 'ICE CIGARRILLOS NEGROS SENAE', value: 3543 },
  { label: 'ICE PRODUCTOS DEL TABACO Y SUCEDÁNEOS DEL TABACO EXCEPTO CIGARRILLOS CAE', value: 3544 },
  { label: 'ICE CERVEZA ARTESANAL SENAE', value: 3545 },
  { label: 'ICE BEBIDAS GASEOSAS CAE', value: 3551 },
  { label: 'ICE BEBIDAS GASEOSAS CON ALTO CONTENIDO DE AZÚCAR SENAE', value: 3552 },
  { label: 'ICE BEBIDAS GASEOSAS CON BAJO CONTENIDO DE AZÚCAR SENAE', value: 3553 },
  { label: 'ICE PERFUMES Y AGUAS DE TOCADOR', value: 3610 },
  { label: 'ICE-VIDEOJUEGOS', value: 3620 },
  { label: 'ICE-ARMAS DE FUEGO, ARMAS DEPORTIVAS Y MUNICIONES', value: 3630 },
  { label: 'FOCOS INCANDESCENTES DE HIELO', value: 3640 },
  { label: 'ICE-SERVICIOS DE CASINOS, SALAS DE JUEGO Y OTROS JUEGOS DE AZAR', value: 3650 },
  { label: 'ICE-CUOTAS MEMBRESÍAS AFILIACIONES ACCIONES', value: 3660 },
  { label: 'ICE COCINAS, CALEFONES Y OTROS DE USO DOMÉSTICO A GAS SRI', value: 3670 },
  { label: 'ICE FUNDAS PLÁSTICAS', value: 3680 },
  { label: 'ICE SERVICIOS DE TELEFONÍA MÓVIL PERSONAS NATURALES', value: 3681 },
  { label: 'ICE CONSUMIBLES TABACO CALENTADO Y LÍQUIDOS CON NICOTINA SRI', value: 3682 },
  { label: 'ICE CONSUMIBLES TABACO CALENTADO Y LÍQUIDOS CON NICOTINA SENAE', value: 3683 },
  { label: 'ICE VEHÍCULOS MOTORIZADOS CAMIONETAS Y DE RESCATE CUYO PVP SEA HASTA DE 30000 USD', value: 3684 },
  { label: 'ICE VEHÍCULOS MOTORIZADOS EXCEPTO CAMIONETAS Y FURGONETAS ENTRE 20000 Y 30000 SENAE', value: 3872 },
  { label: 'ICE VEHÍCULOS MOTORIZADOS PVP ENTRE 30000 Y 40000 SENAE', value: 3873 },
  { label: 'ICE VEHÍCULOS MOTORIZADOS CUYO PVP SUPERIOR USD 70.000 SENAE', value: 3877 },
  { label: 'ICE VEH HÍBRID O ELÉCTRICOS CUYO PVP MAYOR A USD. 60.000 HASTA USD. 70.000 SENAE', value: 3884 }
]
