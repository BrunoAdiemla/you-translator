# Design Document: PWA Configuration

## Overview

Este documento descreve o design técnico para transformar o You Translator em uma Progressive Web App (PWA) completa. A implementação utilizará o `vite-plugin-pwa` com Workbox para automatizar a geração do Service Worker e Web App Manifest, garantindo instalabilidade, funcionamento offline e uma experiência nativa em dispositivos móveis.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser/Device                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                   You Translator App                    │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │ │
│  │  │   React UI   │  │ Offline      │  │  Update      │ │ │
│  │  │  Components  │  │ Indicator    │  │  Notifier    │ │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
│                              ↕                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                   Service Worker                        │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │ │
│  │  │ Cache-First  │  │Network-First │  │   Update     │ │ │
│  │  │  (Static)    │  │   (API)      │  │   Handler    │ │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
│                              ↕                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                    Cache Storage                        │ │
│  │  • Static Assets Cache                                  │ │
│  │  • API Response Cache                                   │ │
│  │  • Image Cache                                          │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                      External Services                       │
│  • Supabase API                                             │
│  • Gemini API                                               │
│  • CDN (Tailwind, Fonts)                                    │
└─────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

1. **Initial Load (Online)**:
   - Browser requests app → Service Worker intercepts
   - Service Worker checks cache → Falls back to network
   - Assets cached for future use

2. **Subsequent Loads (Online)**:
   - Service Worker serves static assets from cache (Cache-First)
   - API requests go to network first (Network-First)
   - Responses cached for offline use

3. **Offline Access**:
   - Service Worker serves all resources from cache
   - UI displays offline indicator
   - User can view cached data (profile, history)

4. **Update Flow**:
   - New Service Worker detected
   - Update notification shown to user
   - User accepts → New SW activated → Page reloads

## Components and Interfaces

### 1. Vite PWA Plugin Configuration

**Location**: `vite.config.ts`

**Configuration Structure**:
```typescript
interface VitePWAConfig {
  registerType: 'autoUpdate' | 'prompt';
  includeAssets: string[];
  manifest: ManifestOptions;
  workbox: WorkboxOptions;
  devOptions: DevOptions;
}
```

**Key Options**:
- `registerType: 'prompt'` - Permite controle manual de atualizações
- `includeAssets` - Lista de assets a serem incluídos (ícones, favicon)
- `manifest` - Configuração do Web App Manifest
- `workbox` - Configuração de estratégias de cache
- `devOptions` - Habilita PWA em desenvolvimento

### 2. Web App Manifest

**Location**: Auto-gerado em `dist/manifest.json`

**Structure**:
```typescript
interface WebAppManifest {
  name: string;
  short_name: string;
  description: string;
  theme_color: string;
  background_color: string;
  display: 'standalone' | 'fullscreen' | 'minimal-ui';
  orientation: 'portrait' | 'landscape' | 'any';
  scope: string;
  start_url: string;
  icons: Icon[];
}

interface Icon {
  src: string;
  sizes: string;
  type: string;
  purpose?: 'any' | 'maskable' | 'monochrome';
}
```

**Values for You Translator**:
- `name`: "You Translator"
- `short_name`: "YouTranslator"
- `description`: "Aprenda inglês traduzindo frases do dia a dia"
- `theme_color`: "#4F46E5" (indigo-600)
- `background_color`: "#FFFFFF"
- `display`: "standalone"
- `orientation`: "portrait"
- `start_url`: "/"
- `scope`: "/"

### 3. Service Worker (Workbox)

**Location**: Auto-gerado em `dist/sw.js`

**Cache Strategies**:

```typescript
interface CacheStrategy {
  urlPattern: RegExp | string;
  handler: 'CacheFirst' | 'NetworkFirst' | 'StaleWhileRevalidate';
  options?: CacheOptions;
}

interface CacheOptions {
  cacheName: string;
  expiration?: {
    maxEntries: number;
    maxAgeSeconds: number;
  };
  cacheableResponse?: {
    statuses: number[];
  };
}
```

**Strategies Defined**:

1. **Static Assets (Cache-First)**:
   - Pattern: `\.(?:js|css|html)$`
   - Cache: `static-assets-cache`
   - Max Age: 30 days
   - Max Entries: 60

2. **Images (Cache-First)**:
   - Pattern: `\.(?:png|jpg|jpeg|svg|gif|webp)$`
   - Cache: `image-cache`
   - Max Age: 30 days
   - Max Entries: 60

3. **Supabase API (Network-First)**:
   - Pattern: `^https://.*\.supabase\.co/.*`
   - Cache: `api-cache`
   - Max Age: 5 minutes
   - Max Entries: 50

4. **Gemini API (Network-First)**:
   - Pattern: `^https://generativelanguage\.googleapis\.com/.*`
   - Cache: `gemini-cache`
   - Max Age: 1 hour
   - Max Entries: 20

5. **External CDN (Stale-While-Revalidate)**:
   - Pattern: `^https://cdn\.tailwindcss\.com/.*|^https://fonts\.googleapis\.com/.*|^https://esm\.sh/.*`
   - Cache: `cdn-cache`
   - Max Age: 7 days
   - Max Entries: 30

### 4. PWA Assets (Icons)

**Location**: `public/` directory

**Required Icons**:
- `icon-192x192.png` - Standard icon (192x192)
- `icon-512x512.png` - High-res icon (512x512)
- `icon-192x192-maskable.png` - Maskable icon for Android (192x192)
- `icon-512x512-maskable.png` - Maskable icon for Android (512x512)
- `apple-touch-icon.png` - iOS icon (180x180)
- `favicon.ico` - Browser favicon

**Icon Design**:
- Base: Logo do You Translator (Languages icon + text)
- Background: Gradient indigo-purple (#4F46E5 to #9333EA)
- Maskable: Logo centralizado com safe zone de 20%
- Format: PNG com transparência (exceto maskable)

### 5. Offline Indicator Component

**Location**: `components/OfflineIndicator.tsx`

**Interface**:
```typescript
interface OfflineIndicatorProps {
  className?: string;
}

interface OfflineIndicatorState {
  isOnline: boolean;
  showBanner: boolean;
}
```

**Behavior**:
- Monitora `navigator.onLine`
- Escuta eventos `online` e `offline`
- Exibe banner no topo quando offline
- Remove banner quando volta online
- Persiste estado no localStorage

### 6. Update Notifier Component

**Location**: `components/UpdateNotifier.tsx`

**Interface**:
```typescript
interface UpdateNotifierProps {
  onUpdate: () => void;
}

interface UpdateNotifierState {
  updateAvailable: boolean;
  registration: ServiceWorkerRegistration | null;
}
```

**Behavior**:
- Detecta novo Service Worker via `updatefound` event
- Exibe notificação modal/toast
- Botão "Atualizar" chama `skipWaiting()` e recarrega
- Botão "Depois" fecha notificação

### 7. PWA Registration Hook

**Location**: `hooks/usePWA.ts`

**Interface**:
```typescript
interface UsePWAReturn {
  isOnline: boolean;
  updateAvailable: boolean;
  updateApp: () => void;
  registration: ServiceWorkerRegistration | null;
}

function usePWA(): UsePWAReturn;
```

**Responsibilities**:
- Registra Service Worker
- Monitora status de conexão
- Detecta atualizações disponíveis
- Fornece função para atualizar app

## Data Models

### PWA Configuration Model

```typescript
interface PWAConfig {
  enabled: boolean;
  registerType: 'autoUpdate' | 'prompt';
  manifest: ManifestConfig;
  workbox: WorkboxConfig;
  devOptions: DevConfig;
}

interface ManifestConfig {
  name: string;
  shortName: string;
  description: string;
  themeColor: string;
  backgroundColor: string;
  display: DisplayMode;
  orientation: OrientationMode;
  icons: IconConfig[];
}

interface WorkboxConfig {
  globPatterns: string[];
  runtimeCaching: RuntimeCachingRule[];
  cleanupOutdatedCaches: boolean;
  skipWaiting: boolean;
  clientsClaim: boolean;
}

interface RuntimeCachingRule {
  urlPattern: RegExp | string;
  handler: HandlerType;
  options?: CacheOptions;
}

interface DevConfig {
  enabled: boolean;
  type: 'module';
  navigateFallback: string;
}
```

### Cache Entry Model

```typescript
interface CacheEntry {
  url: string;
  response: Response;
  timestamp: number;
  expiresAt: number;
}

interface CacheMetadata {
  cacheName: string;
  entries: number;
  size: number;
  lastUpdated: number;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Manifest Completeness
*For any* generated Web App Manifest, it should contain all required fields (name, short_name, description, theme_color, background_color, display, orientation, start_url, scope, icons array with at least 2 icons)

**Validates: Requirements 1.4, 1.5**

### Property 2: Icon Files Existence
*For any* icon referenced in the manifest, the corresponding file should exist in the public directory with the correct dimensions

**Validates: Requirements 2.1, 2.5**

### Property 3: Service Worker Registration
*For any* build output, a Service Worker file (sw.js) should be generated and registered in the application entry point

**Validates: Requirements 6.3**

### Property 4: Cache Strategy Configuration
*For any* URL pattern defined in runtime caching, it should have a valid handler (CacheFirst, NetworkFirst, or StaleWhileRevalidate) and appropriate cache options

**Validates: Requirements 3.5, 4.4, 8.1, 8.2, 8.3**

### Property 5: Offline Indicator Visibility
*For any* connection state change, the offline indicator component should be visible when navigator.onLine is false and hidden when true

**Validates: Requirements 9.1, 9.2**

### Property 6: Update Detection
*For any* new Service Worker version, the update notifier should detect it and display a notification to the user

**Validates: Requirements 5.1, 5.2**

### Property 7: Meta Tags Presence
*For any* HTML document, it should contain required PWA meta tags (theme-color, apple-mobile-web-app-capable, viewport, manifest link)

**Validates: Requirements 7.1, 7.2, 7.3, 7.4**

### Property 8: Cache Expiration Limits
*For any* runtime cache configuration, it should define maxEntries and maxAgeSeconds to prevent unlimited cache growth

**Validates: Requirements 8.4, 8.5**

### Property 9: Build Output Completeness
*For any* production build, the dist directory should contain sw.js, manifest.json, and all referenced icon files

**Validates: Requirements 10.1, 10.2, 10.3**

### Property 10: Standalone Display Mode
*For any* Web App Manifest, the display property should be set to "standalone" to enable app-like experience

**Validates: Requirements 1.3**

## Error Handling

### Service Worker Registration Errors

**Scenario**: Service Worker fails to register
**Handling**:
- Log error to console
- Continue app execution (graceful degradation)
- Display warning in dev mode
- No user-facing error (PWA features simply unavailable)

### Cache Storage Errors

**Scenario**: Cache storage quota exceeded
**Handling**:
- Workbox automatically evicts oldest entries
- Log warning to console
- Continue normal operation
- Fallback to network for all requests

### Offline API Requests

**Scenario**: User tries to access API-dependent feature offline
**Handling**:
- Service Worker returns cached response if available
- If no cache, return custom offline response
- UI displays offline indicator
- Show user-friendly message: "Esta funcionalidade requer conexão com internet"

### Update Installation Errors

**Scenario**: New Service Worker fails to install
**Handling**:
- Keep current Service Worker active
- Log error to console
- Retry on next page load
- No user notification (silent failure)

### Icon Loading Errors

**Scenario**: Icon file missing or corrupted
**Handling**:
- Browser uses fallback icon
- Log warning in dev mode
- Build process should validate icon existence
- Fail build if critical icons missing

### Manifest Parsing Errors

**Scenario**: Invalid manifest.json
**Handling**:
- Browser ignores invalid manifest
- PWA features unavailable
- Build process validates manifest schema
- Fail build if manifest invalid

## Testing Strategy

### Unit Tests

**Framework**: Vitest

**Test Coverage**:

1. **PWA Hook Tests** (`hooks/usePWA.test.ts`):
   - Test online/offline detection
   - Test update detection
   - Test Service Worker registration
   - Mock navigator.onLine and Service Worker API

2. **Offline Indicator Tests** (`components/OfflineIndicator.test.tsx`):
   - Test visibility when online/offline
   - Test event listener registration
   - Test localStorage persistence

3. **Update Notifier Tests** (`components/UpdateNotifier.test.tsx`):
   - Test notification display
   - Test update acceptance
   - Test update dismissal

4. **Configuration Validation Tests** (`vite.config.test.ts`):
   - Test manifest structure
   - Test Workbox configuration
   - Test icon paths

### Integration Tests

**Framework**: Playwright / Cypress

**Test Scenarios**:

1. **Installation Flow**:
   - Visit app in Chrome
   - Verify install prompt appears
   - Click install
   - Verify app opens in standalone mode

2. **Offline Functionality**:
   - Load app online
   - Go offline (DevTools)
   - Verify app still loads
   - Verify cached data accessible
   - Verify offline indicator shows

3. **Update Flow**:
   - Deploy new version
   - Reload app
   - Verify update notification
   - Accept update
   - Verify new version loaded

4. **Cache Strategies**:
   - Load static assets
   - Verify cached (DevTools → Application → Cache Storage)
   - Make API request
   - Verify cached with expiration

### Property-Based Tests

**Framework**: fast-check (for TypeScript)

**Configuration**: Minimum 100 iterations per test

**Property Tests**:

1. **Test Manifest Completeness** (Property 1):
   - Generate random manifest configurations
   - Verify all required fields present
   - **Feature: pwa-configuration, Property 1: Manifest Completeness**

2. **Test Cache Strategy Validity** (Property 4):
   - Generate random cache configurations
   - Verify each has valid handler and options
   - **Feature: pwa-configuration, Property 4: Cache Strategy Configuration**

3. **Test Meta Tags Presence** (Property 7):
   - Parse HTML output
   - Verify all required meta tags exist
   - **Feature: pwa-configuration, Property 7: Meta Tags Presence**

### Manual Testing Checklist

- [ ] Install app on Android device
- [ ] Install app on iOS device
- [ ] Test offline mode on mobile
- [ ] Verify splash screen appearance
- [ ] Test update notification
- [ ] Verify icon appearance on home screen
- [ ] Test app in airplane mode
- [ ] Verify cache sizes in DevTools
- [ ] Test on different browsers (Chrome, Safari, Firefox)
- [ ] Verify Lighthouse PWA score (target: 100)

### Testing Tools

- **Lighthouse**: PWA audit and scoring
- **Chrome DevTools**: Service Worker debugging, cache inspection
- **Workbox Window**: Update detection testing
- **PWA Builder**: Manifest validation
- **Web App Manifest Validator**: Online validation tool

## Implementation Notes

### Development Workflow

1. **Local Development**:
   - PWA features enabled via `devOptions`
   - Service Worker updates on every reload
   - Use `http://localhost:3000` (HTTPS not required)

2. **Testing PWA Features**:
   - Use Chrome DevTools → Application tab
   - Inspect Service Worker status
   - View Cache Storage
   - Simulate offline mode

3. **Building for Production**:
   - Run `npm run build`
   - Verify `dist/sw.js` and `dist/manifest.json` generated
   - Test build with `npm run preview`
   - Deploy to HTTPS-enabled hosting

### Browser Compatibility

- **Chrome/Edge**: Full PWA support
- **Safari (iOS)**: Partial support (no install prompt, limited Service Worker)
- **Firefox**: Full PWA support
- **Samsung Internet**: Full PWA support

### Performance Considerations

- **Cache Size**: Limit total cache to ~50MB
- **Cache Expiration**: Balance freshness vs offline availability
- **Precaching**: Only precache critical assets (~2-3MB)
- **Runtime Caching**: Cache on-demand for better initial load

### Security Considerations

- **HTTPS Required**: PWA only works on HTTPS (except localhost)
- **Cache Poisoning**: Validate responses before caching
- **Sensitive Data**: Don't cache authentication tokens or sensitive API responses
- **CSP Headers**: Ensure Content Security Policy allows Service Worker

### Deployment Checklist

- [ ] Generate all required icons
- [ ] Configure manifest with correct URLs
- [ ] Test Service Worker registration
- [ ] Verify HTTPS enabled
- [ ] Test on target devices
- [ ] Run Lighthouse audit
- [ ] Monitor Service Worker errors
- [ ] Set up analytics for PWA installs
