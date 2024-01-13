
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
                <pre>Ambiente: PRUEBA         Emision: NORMAL</pre>
              </td>
            </tr>   
            <tr>
              <td>
                <pre>Fecha: ${ data.pagos[ data.pagos.length - 1 ].fecha_abono }          Hora: ${ data.pagos[ data.pagos.length - 1 ].hora_abono }</pre>
              </td>
            </tr>     
            <tr>
              <td>
                <pre>Num. Comprobante: ${ data.num_comprobante }</pre>
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
            </tr>
            <tr>
              <td>
                <pre>1     Servicio de Internet        $${ parseFloat(data.precio).toFixed(2)  }</pre>
              </td>
            </tr>
            <tr>
              <td>
              <pre>                        Subtotal: $${data.precio}</pre>
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
              <pre>                           Total: $${ data.precio }</pre>
              </td>
            </tr>
            <tr>
              <td>
                <pre>      Forma de Pago:</pre>
              </td>
            </tr>
            <tr>
              <td>
                <pre>SIN UTILIZACION DEL SISTEMA FINANCIERO</pre>
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

  return {
    imprimirAbono,
    imprimirFactura
  }

}