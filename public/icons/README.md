# Geração de Ícones PWA

## Instruções Rápidas

1. **Abra o arquivo `convert-icons.html` no seu navegador**
   - Navegue até: `public/icons/convert-icons.html`
   - Ou abra diretamente pelo explorador de arquivos

2. **Clique no botão verde "⬇️ Baixar Todos os Ícones"**
   - Isso vai baixar automaticamente:
     - `icon-192x192.png`
     - `icon-512x512.png`

3. **Salve os arquivos baixados nesta pasta** (`public/icons/`)
   - Certifique-se que os nomes estão corretos
   - Os arquivos devem estar em `public/icons/icon-192x192.png` e `public/icons/icon-512x512.png`

4. **Limpe os arquivos temporários** (opcional)
   - Delete `icon-192x192.svg`
   - Delete `icon-512x512.svg`
   - Delete `convert-icons.html`
   - Delete este `README.md`
   - Delete `generate-icons.cjs` na raiz do projeto

## Verificação

Após gerar os ícones, verifique se existem:
- ✅ `public/icons/icon-192x192.png`
- ✅ `public/icons/icon-512x512.png`

## Alternativas

Se preferir usar ferramentas online:
- https://cloudconvert.com/svg-to-png
- https://svgtopng.com/
- Ou use Figma/Photoshop para exportar os SVGs

## Design dos Ícones

Os ícones seguem o design do app:
- Fundo: Gradiente indigo (#4F46E5) para purple (#9333EA)
- Ícone: Globo com linhas (Languages icon) em branco
- Bordas arredondadas (22% radius)
- Tamanhos: 192x192px e 512x512px
