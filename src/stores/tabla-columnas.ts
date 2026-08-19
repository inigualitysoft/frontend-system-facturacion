import { defineStore } from 'pinia';

/**
 * Columnas ocultas de cada listado.
 *
 * Va en un store aparte del de sesión a propósito: `auth/user` se guarda en
 * sessionStorage (el token no debe sobrevivir al cierre del navegador), pero la
 * preferencia de columnas sí tiene que quedarse, así que este usa localStorage
 * — el mismo comportamiento que ISPMAX.
 *
 * Se guarda lo OCULTO y no lo visible: si mañana se agrega una columna al
 * listado, aparece sola. Guardando lo visible, quien ya tuviera la preferencia
 * grabada nunca vería las columnas nuevas.
 */

interface ColumnasState {
  hiddenColumnsCliente:   string[];
  hiddenColumnsProveedor: string[];
}

export const useColumnasStore = defineStore('tabla/columnas', {
  state: (): ColumnasState => ({
    hiddenColumnsCliente:   [],
    hiddenColumnsProveedor: []
  }),
  persist: {
    storage: localStorage,
  },
});
