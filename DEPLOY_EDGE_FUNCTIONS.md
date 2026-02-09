# 🚀 Guia de Deploy - Supabase Edge Functions

## ✅ O que foi feito:

1. ✅ Criadas 2 Edge Functions no diretório `supabase/functions/`
2. ✅ Atualizado `geminiService.ts` para chamar as Edge Functions
3. ✅ Removida a dependência `@google/genai` (não é mais necessária)
4. ✅ API Key do Gemini agora ficará segura no backend

---

## 📋 Próximos Passos (VOCÊ PRECISA FAZER):

### Passo 1: Fazer Deploy das Edge Functions

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Edge Functions** no menu lateral
4. Clique em **Create a new function**

#### Deploy da função `generate-phrase`:
- **Function name**: `generate-phrase`
- **Code**: Copie todo o conteúdo do arquivo `supabase/functions/generate-phrase/index.ts`
- Clique em **Deploy**

#### Deploy da função `evaluate-translation`:
- **Function name**: `evaluate-translation`
- **Code**: Copie todo o conteúdo do arquivo `supabase/functions/evaluate-translation/index.ts`
- Clique em **Deploy**

---

### Passo 2: Configurar a API Key do Gemini (IMPORTANTE!)

1. No Supabase Dashboard, vá em **Edge Functions**
2. Clique em **Manage secrets** (ou **Settings** → **Secrets**)
3. Adicione um novo secret:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: Cole sua chave da API do Gemini (a mesma que estava no `.env.local`)

---

### Passo 3: Testar as Funções

Após o deploy, teste diretamente no Dashboard:

#### Testar `generate-phrase`:
```json
{
  "language": "Portuguese",
  "level": "Basic"
}
```

#### Testar `evaluate-translation`:
```json
{
  "originalPhrase": "Olá, como vai você?",
  "userTranslation": "Hello, how are you?",
  "level": "Basic",
  "language": "Portuguese"
}
```

Se retornar dados corretos, está funcionando! ✅

---

### Passo 4: Atualizar o Frontend (Já está pronto!)

O código do frontend já foi atualizado automaticamente. Agora ele chama as Edge Functions ao invés do Gemini diretamente.

---

## 🔒 Benefícios de Segurança:

✅ **API Key protegida** - Não está mais exposta no frontend
✅ **Controle de acesso** - Apenas usuários autenticados podem chamar
✅ **Rate limiting** - Supabase controla automaticamente
✅ **Logs seguros** - Você pode monitorar uso no Dashboard
✅ **Custos controlados** - Você vê exatamente quantas chamadas são feitas

---

## 🧪 Como Testar Localmente:

Após fazer o deploy, teste no seu app:

1. Faça login no app
2. Vá na página "Praticar"
3. Deve gerar uma frase normalmente
4. Traduza e envie
5. Deve receber a avaliação

Se funcionar, está tudo certo! 🎉

---

## ❓ Problemas Comuns:

**Erro: "Failed to invoke function"**
- Verifique se o secret `GEMINI_API_KEY` foi configurado
- Verifique se as funções foram deployadas corretamente

**Erro: "CORS"**
- As funções já têm CORS configurado, mas verifique se está acessando do domínio correto

**Erro: "Invalid API Key"**
- Verifique se a chave do Gemini está correta no secret

---

## 📞 Precisa de Ajuda?

Se tiver algum problema, me avise e eu te ajudo a resolver!
