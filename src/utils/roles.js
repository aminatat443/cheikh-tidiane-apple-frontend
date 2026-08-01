/** Helpers de rôle — le super-admin a tous les droits admin. */
export const isAdmin = (user) => user?.role === 'admin' || user?.role === 'superadmin';
export const isSuperAdmin = (user) => user?.role === 'superadmin';
