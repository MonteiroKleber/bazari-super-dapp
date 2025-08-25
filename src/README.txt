Bazari — Módulo de Controle de Acesso (refatorado, mesmo fluxo/telas, UX polida)
===============================================================================
O que está incluso
------------------
- features/auth/store/authStore.ts
- features/auth/components/* (AccountTerms, SeedReveal, SeedConfirm, ImportSeed, ImportJson, CreateAccountFlow, ExistingAccountLogin, ImportAccountFlow)
- features/auth/services/bazarichainAuth.ts (suporte a extensão Polkadot opcional)
- pages/LoginPage.tsx (orquestra os fluxos)
- shared/guards/AuthGuard.tsx

Como integrar (drop‑in)
-----------------------
1) Copie o conteúdo de `src/` deste pacote para o `src/` do seu projeto.
   Não substituí componentes globais; todas as dependências usam seus aliases (`@shared/ui`, `@app/providers/I18nProvider`, etc.).

2) Garanta que já existam:
   - @shared/ui/Button, @shared/ui/Input, @shared/ui/Card, @shared/ui/LoadingSpinner
   - @shared/layout/Header
   - providers/I18nProvider com hook useI18n()
   - services da wallet: @features/wallet/services/localKeystore.ts (usado pelo store)

3) Rotas (src/app/routes/AppRoutes.tsx):
   - Público: <Route path="/login" element={<LoginPage />} />
   - Protegido: envolva com <AuthGuard> onde precisar (Dashboard, Wallet, etc.)

4) Persistência:
   - O store usa Zustand + persist (chave `bazari-auth`).

5) Fluxo/telas:
   - Mantém exatamente o mesmo fluxo: Seleção -> Criar (Termos → Revelear Seed → Confirmar Seed → Finalizar) /
     Entrar (conta local) / Importar (Seed/JSON) / Convidado.

6) Melhorias de UX aplicadas (mínimas, sem quebrar o design):
   - Validação clara de senhas (mín. 8) e confirmação.
   - Avisos e estados de carregamento coerentes.
   - Confirmação de seed por 3 posições aleatórias com feedback visual.
   - Botão de convidado opcional (pode remover se não usar).

7) Produção:
   - Todo o código é Typescript/React compatível com Vite + Tailwind 3.4.3.
   - Não depende de bibliotecas não presentes no projeto base.

Dúvidas comuns
--------------
- Já tenho componentes de auth: pode substituir apenas os arquivos que deseja.
- Quero bloquear o modo convidado: remova o card “Entrar como convidado” no LoginPage.
- Precisa de i18n: há chaves com fallback; adicione-as ao seu JSON se quiser traduções 100%.
