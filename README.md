# ByB Soul Jewelry — Catálogo Virtual

Catálogo web responsive en React + Vite, con Supabase Auth, Database y Storage. Preparado para desplegar en Cloudflare Pages.

## Incluye

- Catálogo público con búsqueda y filtros por categoría.
- Tarjetas de producto con foto, precio en CLP, descripción y disponibilidad.
- Panel privado en `/admin` con inicio de sesión.
- Crear y editar productos sin volver a publicar toda la web.
- Subir fotografías al almacenamiento de Supabase.
- Ocultar productos no disponibles sin eliminarlos y volver a publicarlos después.
- Eliminar productos de forma permanente con confirmación.
- Diseño responsive con estética elegante en rosa, borgoña y púrpura.
- Políticas de seguridad RLS; solo los usuarios incluidos en `admin_users` pueden modificar productos o subir imágenes.

## Requisitos

- Node.js 20 o superior recomendado.
- Cuenta gratuita de Supabase.
- Cuenta de GitHub y Cloudflare para publicar el sitio.

## 1. Crear el proyecto de Supabase

1. Crea un proyecto en [Supabase](https://supabase.com/).
2. Abre **SQL Editor** y ejecuta el contenido completo de `supabase/schema.sql`.
3. Ve a **Project Settings → API** (o Connect, según la interfaz) y copia la URL del proyecto y la clave pública `anon`/`publishable`.
4. No uses ni expongas la clave `service_role` en el navegador.

## 2. Crear la cuenta administradora

1. En Supabase abre **Authentication → Users** y crea/invita el usuario que administrará el catálogo.
2. Copia el UUID de ese usuario.
3. En SQL Editor ejecuta, sustituyendo el UUID por el real:

```sql
insert into public.admin_users (user_id)
values ('PEGA-AQUI-EL-UUID-DEL-USUARIO');
```

La cuenta debe estar autorizada en `admin_users`. Crear una cuenta en Authentication por sí solo no concede permisos de administración. No añadas el UUID de usuarios que no deban gestionar la tienda.

## 3. Configurar la aplicación

Copia `.env.example` a un archivo llamado `.env` en la raíz del proyecto y rellena:

```env
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_CLAVE_PUBLICA_ANON_O_PUBLISHABLE
VITE_WHATSAPP_NUMBER=56912345678
```

- `VITE_WHATSAPP_NUMBER`: número con código de país, solo dígitos. Para Chile, normalmente comienza por `56`; reemplázalo por el número de atención real. Si se deja vacío, la aplicación avisa que falta configurarlo.
- Las variables `VITE_` son visibles en el navegador. Usa únicamente la clave pública/anon, nunca la `service_role`.

## 4. Ejecutar localmente

Desde la carpeta del proyecto:

```bash
npm install
npm run dev
```

Vite mostrará una dirección local, normalmente `http://localhost:5173`.

Para verificar la compilación de producción:

```bash
npm run build
npm run preview
```

## 5. Publicar en Cloudflare Pages

1. Sube todos los archivos del proyecto a un repositorio de GitHub.
2. En Cloudflare abre **Workers & Pages → Create → Pages → Connect to Git** y elige el repositorio.
3. Configura:
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Build output directory: `dist`
4. En las variables de entorno del proyecto añade `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` y, si se usará WhatsApp, `VITE_WHATSAPP_NUMBER`.
5. Guarda y despliega. Cada push a la rama conectada podrá generar un nuevo despliegue automáticamente.

### Rutas de la aplicación

- Catálogo: `/`
- Administración: `/admin`

El proyecto incluye `public/_redirects` para que la ruta de administración funcione con el enrutado de una SPA en Cloudflare Pages.

## Seguridad y operación

- RLS limita la lectura pública a productos con `available = true`.
- Solo los usuarios autorizados en `admin_users` pueden crear, modificar o eliminar productos y subir imágenes.
- No se ofrece registro público dentro de la aplicación. Como endurecimiento adicional, desactiva los registros públicos en Authentication si no los necesitas.
- Ocultar un producto cambia `available` a `false`; no borra el registro ni su imagen.
- La eliminación definitiva de un producto no elimina automáticamente el archivo de imagen de Storage. Si decides borrar productos permanentemente, puedes limpiar las imágenes huérfanas desde Storage.
- La subida está limitada a imágenes de hasta 8 MB y tipos JPEG, PNG, WEBP o GIF.
- Para cambiar el logo, tipografía, colores, textos y secciones, edita `src/styles.css` y `src/App.jsx`.

## Nota

Este repositorio contiene el código y el esquema. No incluye credenciales ni un proyecto Supabase creado por ti; para guardar datos reales y publicar en tu dominio, hay que completar la configuración de las cuentas externas indicada arriba.
