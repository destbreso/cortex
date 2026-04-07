/**
 * Utilidad server-side para saber si la base de datos está configurada.
 * Solo importar en Server Components o Route Handlers, nunca en client components.
 */
export const hasDatabase = !!process.env.DATABASE_URL
