# essionix-portal-alejandrobarrera

Sitio personal de **Alejandro Barrera** (Cloud Architect, Bogotá). One-page estático
**bilingüe ES/EN**, estilo marca personal/creator, desplegado en **AWS (cuenta Essionix
`484005000536`)** vía **Terraform + CloudFront + S3 privado (OAC)**, con pipeline de
**GitHub Actions (OIDC)**. Mismo patrón que `essionix-portal-solucionesanteladian`.

## Estructura
```
site/                  Sitio estático (HTML/CSS/JS vanilla, sin build)
terraform/             Infra: S3 privado + OAC + CloudFront (reusa zona Route53 y cert ACM existentes)
.github/workflows/     deploy.yml — provisiona infra y publica el sitio
docs/superpowers/specs Diseño del proyecto
```

## Arquitectura
- **S3 privado dedicado** `alejandrobarrera-pdn-484005000536` (sin acceso público), versionado.
- **CloudFront** con OAC sirviendo el bucket por HTTPS (SPA: 403/404 → `index.html`).
- **Zona Route53 `alejandrobarrera.net`**: **ya existe** en la cuenta → se referencia con `data`
  source, no se crea. El DNS ya vive aquí.
- **Certificado ACM** ya emitido para el dominio → se **reutiliza** con `data` source.

## Diferencia clave vs. solucionesanteladian
Allí la zona y el cert se creaban desde cero (DNS migrando). Aquí **ya existen**, así que el
Terraform los consume con `data` sources. El único cutover es de **alias de CloudFront**, no de DNS.

## Estado del dominio y cutover (importante)
Hoy `alejandrobarrera.net` lo sirve una distribución **legacy** (`EZ6LM98O6TRNJ`, bucket público
`alejandrobarrera.net`, sitio de 2020). CloudFront **no permite el mismo alias CNAME en dos
distribuciones a la vez**, por eso el despliegue es en dos fases vía `enable_custom_domain`:

| Fase | `ENABLE_CUSTOM_DOMAIN` | Resultado |
|------|------------------------|-----------|
| **1 — revisión** | `false` (default) | Distro nueva **sin** aliases (cert por defecto). Sitio revisable por la URL `*.cloudfront.net`. La distro/dominio legacy siguen intactos. |
| **2 — cutover** | `true` | La distro nueva toma el alias del dominio con el cert ACM existente y Route53 (apex) apunta a ella. |

### Runbook de cutover
1. Push a `main` con `ENABLE_CUSTOM_DOMAIN="false"` → revisar por la URL `*.cloudfront.net`
   (output `review_url`).
2. Aprobado: **liberar** el alias `alejandrobarrera.net` de la distro legacy `EZ6LM98O6TRNJ`
   (quitarlo de su config en consola/CLI) y esperar a que CloudFront termine de desplegar.
3. Poner `ENABLE_CUSTOM_DOMAIN: "true"` en `deploy.yml` y push → la distro nueva reclama el
   alias y Route53 apunta a ella.
4. Verificar `https://alejandrobarrera.net/`. Estable → **decomisionar** la distro legacy
   `EZ6LM98O6TRNJ` y el bucket público `alejandrobarrera.net` (fuera de Terraform).

## Despliegue
- **Automático:** push a `main` dispara `deploy.yml` (infra + sync + invalidación).
- **Manual / local:**
  ```bash
  cd terraform
  terraform init \
    -backend-config="bucket=essionix-s3-pdn-us-east-1-remotestates" \
    -backend-config="key=essionix-portal-alejandrobarrera/pdn/terraform.tfstate" \
    -backend-config="region=us-east-1"
  terraform apply
  aws s3 sync ../site s3://$(terraform output -raw bucket_name)/ --delete --profile essionix
  aws cloudfront create-invalidation --distribution-id $(terraform output -raw distribution_id) --paths "/*" --profile essionix
  ```

## Sitio
- **Bilingüe ES/EN**: toggle en el nav (atributos `data-es`/`data-en`, persistido en `localStorage`).
- **Estilo creator/personal brand**: dark-first, alto contraste, color **solo por tokens CSS**.
- **SEO / GEO**: title único, meta/OG, JSON-LD (`Person` + `WebSite`), `robots.txt` pro-IA,
  `llms.txt`, `sitemap.xml`. Scroll suave **sin `#` en la URL**.

## Pendientes de contenido
- **Certificaciones AWS**: la sección está maquetada con placeholders. Cargar las reales
  (nombre, emisor, año, credential ID) desde `linkedin.com/in/alejobarrera/`.
- **Habilidades**: confirmar lista final.
- **Foto** de alta resolución para el hero (hoy usa un avatar con monograma "AB").
- **GitHub** (opcional) y **CV** descargable (`#cv-link` apunta a `#`).
