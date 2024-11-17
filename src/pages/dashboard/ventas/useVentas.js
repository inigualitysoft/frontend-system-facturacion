import ExcelJS from 'exceljs';
import useHelpers from 'src/composables/useHelpers';
import { ref } from 'vue';
import { date } from 'quasar'

const dateOne = ref('');
const dateTwo = ref('');
const sucursal_selected = ref([]);
const tipoComprobantes = ref('FACTURAS');
const filter = ref('');
const rows = ref([]);
const loading = ref( false )
const pagination = ref({
  sortBy: 'desc',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 15
})

export const useVentas = ( ) => {

  const { api, claim, route } = useHelpers();

  const getVentas = async (page = 1, limit = 10, download_excel = false) => {
    try {
      loading.value = true;

      let headers = {
        tipo: tipoComprobantes.value,
        'company-id': claim.company.id,
        'sucursal-id': sucursal_selected.value,
        desde: dateOne.value,
        hasta: dateTwo.value
      };

      if (download_excel) limit = 100000

      const { data } = await api.get('/invoices', {
        params: { page, limit, busqueda: filter.value },
        headers: headers
      });

      pagination.value.rowsNumber = data.meta.totalItems;

      data.items.map( ( venta ) => {
        venta.created_at = date.formatDate(venta.created_at, 'DD/MM/YYYY HH:mm a'),
        venta.loading = false;
      });

      if (download_excel) {
        return data.items
      }

      rows.value = data.items;
      // loading.value = false;
    } catch (error) {
      console.log(error)
      // loading.value = false;
    } finally {
      loading.value = false;
    }
  }

  const generarExcel = async () => {

    const facturas = await getVentas(1, 1, true)

    let filas = facturas.map( row => {
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
    generarExcel,
    sucursal_selected,
    dateOne,
    getVentas,
    tipoComprobantes,
    loading,
    pagination,
    rows,
    filter,
    dateTwo
  }
}