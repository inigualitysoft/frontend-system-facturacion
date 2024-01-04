import { ref } from "vue";
import useHelpers from "../../../../composables/useHelpers";
import { api } from "boot/axios";

const servicios = ref([]);
const factura = ref();
const showModalPago = ref( false );
const pagos = ref([]);

export const useEditCliente = () => {

  return {
    api,
    servicios,
    showModalPago,
    factura,
    pagos
  }
}
