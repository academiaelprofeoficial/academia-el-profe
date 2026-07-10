// ============================================================
// Utilidad de formato — Academia El Profe Oficial
// ============================================================

/**
 * Formatea un precio numérico al formato de Soles peruanos.
 * @param monto - Valor numérico del precio
 * @returns Cadena formateada (ej: "S/ 100")
 */
export function formatoSoles(monto: number): string {
  return `S/ ${monto.toLocaleString('es-PE')}`;
}

/**
 * Formatea un precio numérico al formato de Dólares americanos.
 * @param monto - Valor numérico del precio
 * @returns Cadena formateada (ej: "$30")
 */
export function formatoUSD(monto: number): string {
  return `$${monto.toLocaleString('en-US')}`;
}