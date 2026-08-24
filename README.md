# Black Monkey — Widget "Últimos vistos"

Widget flotante que muestra los últimos productos que el visitante vio en la tienda.
Sin backend, sin apps pagas: usa `localStorage` del navegador.

## Qué hace

- Trackea automáticamente cada ficha de producto que se visita (título, imagen, precio, URL).
- Muestra un widget flotante en el borde derecho, **solo en la home**, con las últimas
  visitas del visitante.
- Colapsado por defecto: un botón cuadrado con el ícono del ojo. Al hacer clic despliega
  el panel con las miniaturas.
- Estética: negro, gris `#999999`, off-white `#f2ede3` — sin bordes curvos, acorde a la marca.

## Archivos

- `recently-viewed.js` — todo el widget (CSS inyectado + lógica de tracking y render).
- `eye-icon.png` — ícono del botón colapsado.

## Instalación

### 1. Subir a GitHub

Subí ambos archivos a un repo (público, o privado con jsDelivr habilitado para privados
según tu plan). Hacé commit y copiá el hash del commit.

### 2. Editar la URL del ícono

En `recently-viewed.js`, la constante `BM_EYE_ICON` apunta a un placeholder:

```js
var BM_EYE_ICON = 'https://cdn.jsdelivr.net/gh/USUARIO/REPO@COMMIT_HASH/eye-icon.png';
```

Reemplazá `USUARIO`, `REPO` y `COMMIT_HASH` por los datos reales de tu repo, y volvé a
commitear.

### 3. Obtener el link de jsDelivr para el JS

Con el mismo esquema que usás para el Social Proof badge y "Sumalo a tu compra": pineá
el script al hash del commit (no a `main`, para que no cambie sin que vos lo decidas):

```
https://cdn.jsdelivr.net/gh/USUARIO/REPO@COMMIT_HASH/recently-viewed.js
```

### 4. Pegar en Tienda Nube

Panel de administración → **Configuración → Códigos de tracking → Para la tienda**,
reemplazando lo que haya ahí por:

```html
<script src="https://cdn.jsdelivr.net/gh/USUARIO/REPO@COMMIT_HASH/recently-viewed.js"></script>
```

Guardar.

### 5. Actualizaciones futuras

Cada vez que edites `recently-viewed.js` o el ícono:
1. Commiteá el cambio en GitHub.
2. Actualizá el hash del commit en el `<script src="...">` pegado en Tienda Nube
   (o en `BM_EYE_ICON` si tocaste el ícono, y volvé a commitear).

No hace falta tocar nada más del lado de Tienda Nube salvo ese hash.

## Notas técnicas

- Detección de página de producto: busca `[itemtype="http://schema.org/Product"]`
  (datos estructurados que Tienda Nube expone en el tema Idea), con fallback a
  `#single-product` y meta tags `og:*`.
- Historial: hasta 12 productos guardados en `localStorage`, se muestran los últimos 6.
- Si cambiás de dominio o el visitante borra el navegador, el historial se pierde
  (es esperable, no hay persistencia server-side).
