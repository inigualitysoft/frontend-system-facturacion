import ExcelJS from 'exceljs';

export const useVentas = ( ) => {

  const generarExcel = ( rows ) => {

    let filas = rows.map( row => {
      return [
        row.created_at.split(' ')[0],
        row.numero_comprobante,
        row.clave_acceso,
        row.customer_id.nombres,
        row.customer_id.numero_documento,
        row.subtotal,
        row.iva,
        row.total,
        row.estadoSRI
      ]
    })

    filas = filas.filter( fila => fila[8] == 'AUTORIZADO' )

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Hoja1');

    worksheet.columns = [
      { header: 'Fecha', key: 'Fecha', width: 15,
        style: {
          font: { bold: true },
          alignment: { horizontal: 'center' }
        }
      },
      { header: '# Documento', key: 'Documento', width: 22,
        style: {
          font: { bold: true },
          alignment: { horizontal: 'center' }
        },
      },
      { header: 'CA/NA', key: 'CA', width: 53,
        style: {
          font: { bold: true },
          alignment: { horizontal: 'center' }
        }
      },
      { header: 'Persona', key: 'Persona', width: 45,
        style: {
          font: { bold: true },
          alignment: { horizontal: 'center' }
        }
      },
      { header: 'Identificación', key: 'Identificación', width: 18,
        style: {
          font: { bold: true },
          alignment: { horizontal: 'center' }
        }
      },
      { header: 'Subtotal', key: 'Subtotal', width: 14,
        style: {
          font: { bold: true },
          alignment: { horizontal: 'center' }
        }
      },
      { header: 'IVA', key: 'IVA', width: 10,
        style: {
          font: { bold: true },
          alignment: { horizontal: 'center' }
        }
      },
      { header: 'Total', key: 'Total', width: 14,
        style: {
          font: { bold: true },
          alignment: { horizontal: 'center' }
        }
      }
    ];

    filas.forEach((fila, index) => {
      Object.assign(worksheet.getCell(`A${ index + 2 }`), {
        value: fila[0],
        font:{ bold: false }
      });
      Object.assign(worksheet.getCell(`B${ index + 2 }`), {
        value: fila[1],
        font:{ bold: false }
      });
      Object.assign(worksheet.getCell(`C${ index + 2 }`), {
        value: fila[2],
        font:{ bold: false }
      });
      Object.assign(worksheet.getCell(`D${ index + 2 }`), {
        value: fila[3],
        font:{ bold: false }
      });
      Object.assign(worksheet.getCell(`E${ index + 2 }`), {
        value: fila[4],
        font:{ bold: false }
      });
      Object.assign(worksheet.getCell(`F${ index + 2 }`), {
        value: fila[5],
        font:{ bold: false }
      });
      Object.assign(worksheet.getCell(`G${ index + 2 }`), {
        value: fila[6],
        font:{ bold: false }
      });
      Object.assign(worksheet.getCell(`H${ index + 2 }`), {
        value: fila[7],
        font:{ bold: false }
      });
    });

    // Generar el archivo Excel y descargarlo
    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = "archivo.xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  }

  return {
    generarExcel
  }
}