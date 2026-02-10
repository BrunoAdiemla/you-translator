// Script para gerar ícones PNG a partir dos SVGs
// Execute: node generate-icons.js

const fs = require('fs');
const path = require('path');

console.log('📱 Gerando ícones PWA...\n');

// Criar placeholder PNGs (você pode usar uma ferramenta online para converter os SVGs)
const sizes = [192, 512];

sizes.forEach(size => {
  const svgPath = path.join(__dirname, 'public', 'icons', `icon-${size}x${size}.svg`);
  const pngPath = path.join(__dirname, 'public', 'icons', `icon-${size}x${size}.png`);
  
  if (fs.existsSync(svgPath)) {
    console.log(`✅ SVG encontrado: icon-${size}x${size}.svg`);
    console.log(`   Para converter para PNG:`);
    console.log(`   1. Abra: public/icons/convert-icons.html no navegador`);
    console.log(`   2. Clique em "Download PNG" para cada tamanho`);
    console.log(`   3. Salve os arquivos nesta pasta\n`);
  }
});

console.log('📝 Instruções alternativas:');
console.log('   - Use https://cloudconvert.com/svg-to-png');
console.log('   - Ou use Figma/Photoshop para exportar os SVGs como PNG');
console.log('   - Ou abra os SVGs no navegador e tire screenshot\n');

console.log('⚠️  IMPORTANTE: Os ícones PNG são necessários para o PWA funcionar!');
console.log('   Após gerar os PNGs, delete os arquivos SVG e este script.\n');
