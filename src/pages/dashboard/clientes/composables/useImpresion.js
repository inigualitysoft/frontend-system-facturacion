
export const useImpresion = () => {

  const imprimirAbono = ( data, dataCliente, userName, tipo ) => {
    return `
    <html>
    <head>
      <meta http-equiv="Content-type" content="text/html; charset=utf-8" />
      <meta name="viewport" content="width=device-width, initial" />
      <style>
        th, td {
          text-align: center;
          white-space: nowrap; /* Omitir espacios en blanco */
        }
      </style>
    </head>
      <body>
        <table border="0" align="center" style="font-size: 8px; width: 230px;">
          <tbody>
            <tr>
              <td>
                <pre>    ${ data.company_name }         -</pre>
              </td>
            </tr>
            <tr>
              <td>
                <pre>       R.U.C.: ${ data.ruc }         </pre>
              </td>
            </tr>
            <tr>
              <td>
                <pre>Direccion: ${ data.direccion }</pre>
              </td>
            </tr>
            <tr>
              <td>
                <pre>Fecha: ${ data.fecha_abono }          Hora: ${ data.hora_abono }</pre>
              </td>
            </tr>
            <tr>
              <td>
                <pre>Cliente: ${ dataCliente.cliente }</pre>
              </td>
            </tr>
            <tr>
              <td>
                <pre>${ dataCliente.tipo_documento == '05' ? 'Cedula:' : 'R.U.C:' }: ${ dataCliente.num_doc }</pre>
              </td>
            </tr>
            <tr>
              <td>
                <pre>Correo: ${ dataCliente.email }</pre>
              </td>
            </tr>
            <tr>
              <td>
                <pre>----------------------------------------</pre>
              </td>
            </tr>
            <tr>
              <td>
                <pre>Cant.         Servicio             Total</pre>
              </td>
            </tr>
            <tr>
              <td>
                <pre>----------------------------------------</pre>
              </td>
            </tr>
            <tr>
              <td>
                <pre>1     Servicio de Internet        $${ (parseFloat( data.monto_pendiente ) + parseFloat( data.totalAbonado )).toFixed(2) }</pre>
              </td>
            </tr>
            <tr>
              <td>
                <pre>                        IVA(12%): $00.00</pre>
              </td>
            </tr>
            <tr>
              <td>
                <pre>                       Descuento: $00.00</pre>
              </td>
            </tr>
            <tr>
              <td>
                <pre>                   Valor Abonado: $${ parseFloat(data.valor).toFixed(2) }</pre>
              </td>
            </tr>
            <tr>
              <td>
                <pre>                   Total Abonado: $${ parseFloat(data.totalAbonado).toFixed(2) }</pre>
              </td>
            </tr>
            <tr>
              <td>
                <pre>                 Valor pendiente: $${ parseFloat(data.monto_pendiente).toFixed(2) }</pre>
              </td>
            </tr>
            <tr>
              <td>
                <pre>      Forma de Pago:</pre>
              </td>
            </tr>
            <tr>
              <td>
                <pre>  ${ data.forma_pago }</pre>
              </td>
            </tr>
            <tr>
              <td>
                <pre>Atentido Por: ${ userName }</pre>
              </td>
            </tr>
            <tr>
              <td>
                <pre>Gracias por su Compra</pre>
              </td>
            </tr>
            <tr>
              <td>
                <pre>-</pre>
              </td>
            </tr>
        </table>
      </body>
    </html>
    `
  }

  const imprimirFactura = ( data, dataCliente, userName, tipo ) => {
    let plantilla = ''
    plantilla = `
    <html>
    <head>
      <meta http-equiv="Content-type" content="text/html; charset=utf-8" />
      <meta name="viewport" content="width=device-width, initial" />
      <style>
        th, td {
          text-align: center;
          white-space: nowrap; /* Omitir espacios en blanco */
        }
        .container {
          width: 100%x; /* Ancho total para las etiquetas */
        }

        .content-articulo {
          display: inline-block;
          max-width: 100%; /* Ancho máximo para cada etiqueta */
          margin-bottom: 5px; /* Espacio entre etiquetas */
          word-wrap: break-word;
        }
      </style>
    </head>
      <body>
        <table border="0" align="center" style="font-size: 8px; width: 230px;">
          <tbody>
            <tr>
              <td>
                <pre>    ${ data.company_name }         -</pre>
              </td>
            </tr>
            <tr>
              <td>
                <pre>       R.U.C.: ${ data.ruc }         </pre>
              </td>
            </tr>
            <tr>
              <td>
                <pre>Direccion: ${ data.direccion }</pre>
              </td>
            </tr>
            <tr>
              <td>
                <pre>Ambiente: PRUEBA         Emision: NORMAL</pre>
              </td>
            </tr>
            <tr>
              <td>
                <pre>Fecha: ${ data.created_at }</pre>
              </td>
            </tr>
            <tr>
              <td>
                <pre>Num. Comprobante: ${ data.numero_comprobante }</pre>
              </td>
            </tr>
            <tr>
              <td>
                <pre>Clave Acceso:</pre>
              </td>
            </tr>
            <tr>
              <td>
                <pre>${ data.clave_acceso }</pre>
              </td>
            </tr>
            <tr>
              <td>
                <pre>Cliente: ${ dataCliente.cliente }</pre>
              </td>
            </tr>
            <tr>
              <td>
                <pre>${ dataCliente.tipo_documento == '05' ? 'Cedula:' : 'R.U.C:' }: ${ dataCliente.num_doc }</pre>
              </td>
            </tr>
            <tr>
              <td>
                <pre>Correo: ${ dataCliente.email }</pre>
              </td>
            </tr>
            <tr>
              <td>
                <pre>----------------------------------------</pre>
              </td>
            </tr>
            <tr>
              <td>
                <pre>Cant.         Servicio             Total</pre>
              </td>
            </tr>
            <tr>
              <td>
                <pre>----------------------------------------</pre>
              </td>
            </tr>`

            data.invoiceToProduct.forEach(element => {
              plantilla += `
              <tr>
                <td style="white-space: unset;">
                  <div class="container">
                    <div class="content-articulo" style="width: 30px;">
                      ${ element.cantidad }
                    </div>
                    <div class="content-articulo" style="width: 110px;">
                      ${ element.product_id.nombre }
                    </div>
                    <div class="content-articulo" style="width: 40px;">
                      $${ element.v_total }
                    </div>
                  </div>
                </td>
              </tr>
              `
            });

            plantilla +=`
            <tr>
              <td>
              <pre>                        Subtotal: $${data.subtotal}</pre>
              </td>
            </tr>
            <tr>
              <td>
                <pre>                         IVA(${ data.porcentaje_iva }%): $${ data.iva }</pre>
              </td>
            </tr>
            <tr>
              <td>
                <pre>                        Descuento: $${ data.descuento }</pre>
              </td>
            </tr>
            <tr>
              <td>
              <pre>                           Total: $${ data.total }</pre>
              </td>
            </tr>
            <tr>
              <td>
                <pre>      Forma de Pago:</pre>
              </td>
            </tr>
            <tr>
              <td>
                <pre>  ${ data.forma_pago }</pre>
              </td>
            </tr>
            <tr>
              <td>
                <pre>Atentido Por: ${ userName }</pre>
              </td>
            </tr>
            <tr>
              <td>
                <pre>Gracias por su Compra</pre>
              </td>
            </tr>
            <tr>
              <td>
                <pre>-</pre>
              </td>
            </tr>
        </table>
      </body>
    </html>
    `
    return plantilla
  }

  return {
    imprimirAbono,
    imprimirFactura
  }

}