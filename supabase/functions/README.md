# Supabase Edge Functions - Deploy Manual

## 📋 Funções Criadas:

1. **generate-phrase** - Gera frases para tradução
2. **evaluate-translation** - Avalia traduções do usuário

## 🚀 Como fazer Deploy:

### Opção 1: Via Supabase Dashboard (Recomendado)

1. Acesse o Supabase Dashboard: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Edge Functions** no menu lateral
4. Clique em **Create a new function**

#### Para `generate-phrase`:
- **Function name**: `generate-phrase`
- **Code**: Copie todo o conteúdo de `supabase/functions/generate-phrase/index.ts`
- Clique em **Deploy**

#### Para `evaluate-translation`:
- **Function name**: `evaluate-translation`
- **Code**: Copie todo o conteúdo de `supabase/functions/evaluate-translation/index.ts`
- Clique em **Deploy**

### Opção 2: Via Supabase CLI (Alternativa)

Se você conseguir instalar o Supabase CLI:

```bash
# Login
supabase login

# Link ao projeto
supabase link --project-ref seu-project-ref

# Deploy das funções
supabase functions deploy generate-phrase
supabase functions deploy evaluate-translation
```

## 🔐 Configurar Secrets (IMPORTANTE):

Após fazer o deploy, você precisa configurar a API Key do Gemini:

1. No Supabase Dashboard, vá em **Edge Functions**
2. Clique em **Manage secrets**
3. Adicione um novo secret:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: Sua chave da API do Gemini

## 🧪 Testar as Funções:

Após o deploy, você pode testar diretamente no Dashboard:

### Testar generate-phrase:
```json
{
  "language": "Portuguese",
  "level": "Basic"
}
```

### Testar evaluate-translation:
```json
{
  "originalPhrase": "Olá, como vai você?",
  "userTranslation": "Hello, how are you?",
  "level": "Basic",
  "language": "Portuguese"
}
```

## 📝 URLs das Funções:

Após o deploy, as URLs serão:
- `https://[seu-project-ref].supabase.co/functions/v1/generate-phrase`
- `https://[seu-project-ref].supabase.co/functions/v1/evaluate-translation`

Substitua `[seu-project-ref]` pelo ID do seu projeto.
