import { Buffer } from 'buffer/'   // <- versão browser

;(globalThis as any).Buffer ??= Buffer