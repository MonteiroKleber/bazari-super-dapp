// src/shared/events/auth.ts
// Contrato de eventos neutros para integração solta (Opção A - Event Bus)

export const AUTH_LOGGED_IN = 'auth:logged_in';
export const AUTH_LOGGED_OUT = 'auth:logged_out';

export type AuthLoggedInDetail = {
  address: string;
  name?: string;
};

export type AuthLoggedOutDetail = {};
