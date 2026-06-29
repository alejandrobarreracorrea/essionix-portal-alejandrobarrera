# Portal personal `alejandrobarrera.net` — Diseño

**Fecha:** 2026-06-29
**Repo:** `essionix-portal-alejandrobarrera`
**Cuenta AWS:** Essionix `484005000536` (perfil `essionix`)
**Patrón base:** `essionix-portal-solucionesanteladian` (S3 privado + OAC + CloudFront + ACM + Route53, pipeline GitHub Actions OIDC).

## 1. Objetivo

Reemplazar **totalmente** el sitio personal de Alejandro Barrera (hoy una plantilla "Maha"
estática de 2020 con testimonios placeholder) por un sitio **moderno de marca personal**,
estilo creator/influencer de EE. UU. con foco en *networking*, y publicarlo con un **pipeline
idéntico** al del portal de Soluciones ante la DIAN.

## 2. Estado actual de la infraestructura (inventario)

Verificado el 2026-06-29 en la cuenta `484005000536`:

| Recurso | Valor | Nota |
|---|---|---|
| Bucket S3 | `alejandrobarrera.net` | **Público**, website hosting, root `home.html`. Legacy 2020. |
| CloudFront | `EZ6LM98O6TRNJ` → `d10q8apimk7bcp.cloudfront.net` | Alias `alejandrobarrera.net` (sin `www`), **sin OAC** (origin bucket público), root `home.html`. |
| ACM | `arn:aws:acm:us-east-1:484005000536:certificate/72da98e5-4c68-4d03-aaf7-e2d33c39e313` | Ya emitido y válido para el dominio. **Se reutiliza.** |
| Route53 | zona `alejandrobarrera.net.` | **Ya existe en esta cuenta**; el DNS ya vive aquí. |

**Diferencias clave vs. solucionesanteladian:**
1. La zona Route53 y el cert ACM **ya existen** → se referencian con `data` sources, no se crean.
2. El DNS ya está en la cuenta → no hay migración de nameservers; el cutover es solo de alias/distribución.
3. Restricción CloudFront: **un alias CNAME no puede estar en dos distribuciones a la vez**. La distro
   vieja debe **liberar** `alejandrobarrera.net` antes de que la nueva lo reclame.

## 3. Decisiones tomadas

| Tema | Decisión |
|---|---|
| Propósito | Portafolio personal **con proyectos reales** (sin testimonios falsos). |
| Idioma | **Bilingüe ES/EN** con toggle (persistido en `localStorage`), sin recarga. |
| Infra | **Infra nueva por Terraform** (bucket privado + OAC + CloudFront), reapuntando el dominio. |
| Cert ACM | **Reutilizar el existente** por ARN (`data "aws_acm_certificate"`). Sin esperar validación. |
| Proyectos destacados | **Portales corporativos AWS** (S3+CloudFront+Terraform+OIDC) y **Automatización / pipelines IA** (Claude Agent SDK, jobfinder/scorers). |
| Contacto | Reutilizar `alejandro.barrera.correa@gmail.com`, `+57 310-249-4886`, Bogotá. LinkedIn `https://www.linkedin.com/in/alejobarrera/`; GitHub: hueco opcional. |
| Certificaciones AWS | Sección dedicada con los badges/certs de AWS. **Origen:** LinkedIn (`/in/alejobarrera/`). **Pendiente:** el perfil está tras login y se decidió avanzar sin los datos por ahora → la sección se construye con **placeholders** y se rellena cuando Alejandro inicie sesión en Chrome (lectura vía Claude-in-Chrome) o pegue la lista. |
| Habilidades | Sección de **aptitudes/skills** ampliada (técnicas + cloud + datos). Origen: LinkedIn + las ya conocidas. Placeholders hasta confirmar lista final. |
| Asesoría / formación | Nuevo eje de oferta: además de ejecutar, Alejandro **asesora y forma a profesionales y empresas** en estas habilidades (mentoría / advisory / upskilling). Va en "Qué hago" y como CTA. |

## 4. Dirección visual

Marca personal estilo creator/influencer de EE. UU., *networking-first*:

- **Hero de impacto:** nombre `ALEJANDRO BARRERA` en display gigante, foto a gran escala
  (split o full-bleed), tagline punchy (*"Cloud Architect · 7+ años construyendo en AWS"*),
  CTA primario **"Conversemos / Let's connect"**.
- **Dark-first, alto contraste**, un color de acento eléctrico. Color **solo por tokens CSS**.
- **Tipografía display** moderna (Space Grotesk / Sora) + sans legible de cuerpo. Stats con números enormes.
- **Scroll-reveal sutil**, nav sticky, scroll suave **sin `#` en la URL**.
- **CTA de networking siempre visible** (barra social + botón flotante "Conversemos" → `mailto:`/WhatsApp).
- **Toggle ES/EN** en el nav.

## 5. Estructura del sitio (one-page bilingüe)

1. **Hero** — nombre, rol, tagline, CTAs (Conversemos / Ver proyectos).
2. **Sobre mí** — bio real reescrita (cloud architect, AWS, 7+ años, Bogotá), foto, "Descargar CV".
3. **Stats / stack** — números grandes (+7 años, N proyectos, 100% serverless) + stack
   (AWS, Kubernetes, Terraform, Azure, OCI, SQL Server, Oracle).
4. **Certificaciones AWS** — grid de badges/credenciales (nombre + emisor + año + credential ID
   cuando exista). **Datos pendientes** de LinkedIn → se maqueta con placeholders y se rellena luego.
5. **Habilidades / aptitudes** — skills agrupadas (Cloud & DevOps · Datos & DB · Lenguajes/Tooling),
   con énfasis en que estas mismas habilidades son las que Alejandro **enseña y asesora**.
6. **Qué hago** — servicios: Arquitectura cloud · Migraciones a la nube · Plataformas serverless/IaC,
   **+ Asesoría y formación** a profesionales y empresas en estas habilidades (mentoría / advisory / upskilling).
7. **Proyectos destacados** — Portales corporativos AWS · Automatización / pipelines IA.
8. **Contacto / Let's connect** — email, teléfono, Bogotá, LinkedIn (`/in/alejobarrera/`), + hueco GitHub.

Cada bloque de texto tiene su variante `data-es` / `data-en` (o equivalente) para el toggle.

## 6. Tecnología

- **Sitio estático sin build**: HTML + CSS + JS vanilla (mismo enfoque que solucionesanteladian).
  Rápido, barato, mantenible. Color exclusivamente por tokens CSS (`:root`).
- **SEO / GEO:** `<title>` único, meta description, canonical, Open Graph, JSON-LD
  (`Person` + `WebSite`), `lang` dinámico según idioma, `robots.txt` pro-IA
  (GPTBot, PerplexityBot, ClaudeBot, Google-Extended…), `llms.txt`, `sitemap.xml`.
- **i18n:** diccionario en `script.js`; el toggle intercambia textos por atributo `data-i18n`
  y actualiza `<html lang>`. Idioma por defecto: `es`. Persistencia en `localStorage`.

## 7. Infraestructura (Terraform)

Recursos nuevos en `484005000536`, backend remoto S3
(`essionix-s3-pdn-us-east-1-remotestates`, key `essionix-portal-alejandrobarrera/pdn/terraform.tfstate`):

- `aws_s3_bucket.site` → `alejandrobarrera-pdn-484005000536`, **privado** (public access block total), versionado.
- `aws_cloudfront_origin_access_control` + `aws_cloudfront_distribution` (OAC, redirect-to-https,
  CachingOptimized, SPA 403/404 → `index.html`, `default_root_object = index.html`).
- `aws_s3_bucket_policy` restrictiva: solo esta distro (condición `AWS:SourceArn`) puede `s3:GetObject`.
- **`data "aws_route53_zone"`** para `alejandrobarrera.net` (zona existente).
- **`data "aws_acm_certificate"`** para reusar el cert existente (por dominio, status `ISSUED`, región `us-east-1`).

### Toggle `enable_custom_domain` (default `false`) — por conflicto de alias

| Fase | `enable_custom_domain` | Resultado |
|---|---|---|
| **1 — revisión** | `false` | Distro nueva **sin** aliases, cert por defecto de CloudFront. Se revisa por la URL `*.cloudfront.net`. La distro/dominio viejos siguen sirviendo el sitio legacy intactos. |
| **2 — cutover** | `true` | La distro nueva toma `aliases = [alejandrobarrera.net]` con el cert ACM reutilizado, y los registros A/AAAA del apex de Route53 apuntan (alias) a la distro nueva. |

> **Pre-requisito de Fase 2:** liberar el alias `alejandrobarrera.net` de la distro vieja
> `EZ6LM98O6TRNJ` (quitarlo de su config y esperar el deploy de CloudFront) **antes** de
> aplicar con `enable_custom_domain=true`; si no, AWS rechaza el alias por conflicto (`CNAMEAlreadyExists`).

### Outputs
`bucket_name`, `distribution_id`, `distribution_domain_name`, `review_url`, `custom_domain_enabled`.

## 8. Pipeline (`.github/workflows/deploy.yml`)

Copia del de solucionesanteladian, OIDC role `arn:aws:iam::484005000536:role/essionix-role-pdn-us-east-1-oidc`:

- **Job `infra`:** checkout → credenciales OIDC → setup Terraform 1.8.0 →
  `terraform init` (backend remoto, key por nombre de repo) → `validate` → `apply -auto-approve`
  (`TF_VAR_enable_custom_domain` desde env `ENABLE_CUSTOM_DOMAIN`) → exporta `bucket_name`, `distribution_id`.
- **Job `deploy`:** cache-busting (`styles.css?v=<sha8>`, `script.js?v=<sha8>`) →
  `s3 sync` de assets con `max-age=3600` (excluye html/xml/txt) →
  `s3 sync` de html/xml/txt con `max-age=300` → invalidación CloudFront `"/*"`.
- Disparo: push a `main` + `workflow_dispatch`.
- `ENABLE_CUSTOM_DOMAIN: "false"` hasta hacer el cutover.

## 9. Estructura del repo

```
site/
  index.html
  styles.css
  script.js            (i18n + scroll-reveal + toggle idioma)
  img/                 (foto, escudos/íconos de proyectos)
  favicon.svg, favicon-*.png, apple-touch-icon-180.png
  robots.txt
  llms.txt
  sitemap.xml
terraform/
  backend.tf
  main.tf              (data zone + data cert + S3 privado + OAC + CloudFront + policy)
  variables.tf         (environment, aws_region, domain_name, enable_custom_domain)
  outputs.tf
.github/workflows/
  deploy.yml
README.md              (arquitectura, runbook de cutover de alias, despliegue)
docs/superpowers/specs/2026-06-29-portal-alejandrobarrera-design.md  (este doc)
```

## 10. Runbook de cutover (resumen)

1. Push a `main` con `ENABLE_CUSTOM_DOMAIN="false"` → revisar el sitio nuevo por la URL `*.cloudfront.net` (output `review_url`).
2. Aprobado: quitar el alias `alejandrobarrera.net` de la distro vieja `EZ6LM98O6TRNJ`
   (CLI/console) y esperar a que CloudFront termine de desplegar.
3. Poner `ENABLE_CUSTOM_DOMAIN="true"` en `deploy.yml`, push → la distro nueva reclama el alias
   y Route53 apunta a ella.
4. Verificar `https://alejandrobarrera.net/`. Una vez estable, **decomisionar** la distro vieja
   `EZ6LM98O6TRNJ` y el bucket público `alejandrobarrera.net` (fuera de Terraform).

## 10.b Datos pendientes de confirmar (no bloquean la implementación)

- **Certificaciones AWS:** lista exacta (nombre, emisor, año, credential ID) — extraer de
  `linkedin.com/in/alejobarrera/` con sesión iniciada, o que Alejandro las pegue. Hasta entonces, placeholders.
- **Habilidades:** lista final de aptitudes a mostrar.
- **GitHub:** URL (opcional).
- **Foto** de alta resolución para el hero.

## 11. Fuera de alcance (YAGNI)

- Backend / formulario con servidor (el contacto es `mailto:`/tel/WhatsApp).
- Blog o CMS.
- `www.alejandrobarrera.net` (la distro vieja no lo sirve; se puede añadir luego como SAN si se quiere).
- Migración automática de los assets viejos (`home.html`/`assets/`): el sitio se rehace desde cero.
