// Resalta (fondo amarillo + negrita) la parte del texto que coincide con el
// término buscado. Pensado para etiquetas HTML de q-select (options-html) o
// para usarse con v-html. La búsqueda es case-insensitive.
//
// Uso:
//   import { resaltarCoincidencia } from 'src/utils/resaltar-busqueda'
//   <span v-html="resaltarCoincidencia(scope.opt.label, termino)"></span>

const escaparRegex = (str) => String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export const resaltarCoincidencia = (texto, termino) => {
  const valor = String(texto ?? '')
  const buscado = String(termino ?? '').trim()

  if (!buscado) return valor

  const regex = new RegExp(`(${ escaparRegex(buscado) })`, 'gi')

  return valor.replace(
    regex,
    '<span style="background-color:#ffe08a;color:#1d1d1d;font-weight:700;border-radius:3px;padding:0 2px;">$1</span>'
  )
}
