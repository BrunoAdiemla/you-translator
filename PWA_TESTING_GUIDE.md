# Guia de Testes PWA - You Translator

## 🚀 Preparação

### 1. Build de Produção
```bash
npm run build
```

### 2. Servir Build Localmente
```bash
npm run preview
```

Ou use um servidor HTTP simples:
```bash
npx serve dist
```

**IMPORTANTE**: PWA só funciona em:
- ✅ HTTPS (produção)
- ✅ localhost (desenvolvimento/testes)

---

## ✅ Checklist de Testes

### 📱 Teste 1: Manifest e Ícones

**Objetivo**: Verificar se o manifest está correto

**Passos**:
1. Abra o app no Chrome/Edge
2. Abra DevTools (F12)
3. Vá em **Application → Manifest**
4. Verifique:
   - [ ] Nome: "You Translator"
   - [ ] Short name: "You Translator"
   - [ ] Theme color: #4F46E5 (indigo)
   - [ ] Display: standalone
   - [ ] Ícones 192x192 e 512x512 aparecem
   - [ ] Ícones têm o logo correto

---

### 🔧 Teste 2: Service Worker

**Objetivo**: Verificar se o SW está registrado

**Passos**:
1. DevTools → **Application → Service Workers**
2. Verifique:
   - [ ] Service Worker está ativo
   - [ ] Status: "activated and is running"
   - [ ] Scope: "/"

---

### 💾 Teste 3: Cache

**Objetivo**: Verificar se recursos estão sendo cacheados

**Passos**:
1. DevTools → **Application → Cache Storage**
2. Verifique:
   - [ ] Existe cache "workbox-precache-v2-..." com assets
   - [ ] Existe cache "google-fonts-cache"
   - [ ] Existe cache "supabase-api-cache"
3. Navegue pelo app
4. Verifique se novos recursos aparecem no cache

---

### 📥 Teste 4: Instalação Desktop (Chrome/Edge)

**Objetivo**: Instalar o app no desktop

**Passos**:
1. Abra o app no Chrome/Edge
2. Procure o ícone de instalação na barra de endereço (⊕)
3. Clique para instalar
4. Verifique:
   - [ ] Prompt de instalação aparece
   - [ ] App é instalado
   - [ ] Ícone aparece no menu iniciar/aplicativos
   - [ ] App abre em janela standalone (sem barra do navegador)
   - [ ] Theme color é aplicado na barra de título

**Alternativa**: Use o banner de instalação na HomeView

---

### 📱 Teste 5: Instalação Android

**Objetivo**: Instalar o app no Android

**Passos**:
1. Abra o app no Chrome Android
2. Toque no menu (⋮) → "Instalar app" ou "Adicionar à tela inicial"
3. Verifique:
   - [ ] Prompt de instalação aparece
   - [ ] App é instalado na tela inicial
   - [ ] Ícone correto aparece
   - [ ] App abre em modo standalone
   - [ ] Splash screen aparece ao abrir

---

### 🍎 Teste 6: Instalação iOS

**Objetivo**: Adicionar à tela inicial no iOS

**Passos**:
1. Abra o app no Safari iOS
2. Toque no botão de compartilhar
3. Selecione "Adicionar à Tela de Início"
4. Verifique:
   - [ ] Ícone é adicionado à tela inicial
   - [ ] Nome "You Translator" aparece
   - [ ] App abre em modo standalone
   - [ ] Status bar é estilizada corretamente

---

### 🔌 Teste 7: Funcionalidade Offline

**Objetivo**: Verificar se o app funciona offline

**Passos**:
1. Navegue por várias páginas do app (Home, Practice, History, etc.)
2. DevTools → **Network** → Marque "Offline"
3. Recarregue a página (F5)
4. Verifique:
   - [ ] Página carrega do cache
   - [ ] Banner "Você está offline" aparece no topo
   - [ ] Conteúdo visitado anteriormente é exibido
5. Tente acessar página não visitada
6. Verifique:
   - [ ] Página offline.html é exibida
   - [ ] Mensagem amigável aparece
7. Desmarque "Offline"
8. Verifique:
   - [ ] Banner offline desaparece
   - [ ] App volta a funcionar normalmente

---

### 🔄 Teste 8: Atualização do App

**Objetivo**: Verificar notificação de atualização

**Passos**:
1. Faça uma pequena mudança no código (ex: mude um texto)
2. Faça novo build: `npm run build`
3. Mantenha o app aberto (não recarregue)
4. Faça deploy da nova versão
5. Aguarde alguns segundos
6. Verifique:
   - [ ] Banner verde "Nova versão disponível" aparece
   - [ ] Botão "Atualizar" está presente
7. Clique em "Atualizar"
8. Verifique:
   - [ ] Página recarrega automaticamente
   - [ ] Nova versão está ativa

---

### 🎨 Teste 9: Theme Color

**Objetivo**: Verificar se a cor do tema é aplicada

**Passos**:
1. Instale o app
2. Abra o app instalado
3. Verifique:
   - [ ] Barra de título/status bar tem cor indigo (#4F46E5)
   - [ ] Cor é consistente em todas as páginas

---

### 🌐 Teste 10: Estratégias de Cache

**Objetivo**: Verificar se as estratégias de cache funcionam

**Passos**:
1. DevTools → **Network**
2. Navegue pelo app
3. Verifique:
   - [ ] Assets estáticos (JS, CSS) vêm do Service Worker
   - [ ] Google Fonts vêm do cache (após primeira carga)
   - [ ] Chamadas API Supabase tentam network primeiro
4. Vá offline
5. Verifique:
   - [ ] Assets estáticos ainda carregam
   - [ ] Fontes ainda carregam
   - [ ] API calls falham graciosamente

---

## 🐛 Troubleshooting

### Service Worker não registra
- Verifique se está em HTTPS ou localhost
- Limpe cache e recarregue
- Verifique console por erros

### Ícones não aparecem
- Verifique se os PNGs foram gerados corretamente
- Verifique paths no manifest
- Limpe cache do navegador

### App não instala
- Verifique se manifest está correto
- Verifique se Service Worker está ativo
- Verifique se está em HTTPS

### Offline não funciona
- Verifique se navegou pelas páginas antes de ir offline
- Verifique se Service Worker está ativo
- Verifique cache storage no DevTools

---

## 📊 Resultados Esperados

Após completar todos os testes, você deve ter:

- ✅ App instalável em desktop e mobile
- ✅ Funciona offline para conteúdo visitado
- ✅ Cache inteligente de recursos
- ✅ Notificações de atualização
- ✅ Ícones e cores corretos
- ✅ Experiência standalone (sem barra do navegador)

---

## 🎉 Próximos Passos

Após validar localmente:

1. **Deploy para produção** (HTTPS obrigatório)
2. **Teste em dispositivos reais** (Android e iOS)
3. **Monitore métricas PWA** no Google Analytics
4. **Ajuste cache strategies** conforme necessário

---

## 📝 Notas

- PWA features só funcionam em produção (build)
- Service Worker é desabilitado em desenvolvimento
- Sempre teste em HTTPS ou localhost
- Limpe cache entre testes para resultados consistentes
