# Demo en vivo — "Enciende tu idea" (Bedrock + deploy)

Prompt → **Amazon Bedrock** genera una web → **deploy en AWS** → URL viva + QR.
Todo aislado en TU cuenta y desechable. El paso en vivo es un solo comando.

## Arquitectura (a prueba de fallos)
```
tú (prompt en la terminal)
   → Bedrock InvokeModel (genera HTML completo)
   → S3 (web estática)  → CloudFront (HTTPS)  → URL fija + QR
```
Todo lo lento (bucket, CloudFront ~10 min) queda **pre-provisionado**. En vivo solo:
generar (Bedrock, ~seg) + subir 1 archivo (~seg) + invalidar caché (~seg).

## Requisitos previos (ANTES de la charla)
1. **Perfil AWS de tu cuenta** (no essionix):
   - keys: `aws configure --profile charla`  · SSO: `aws sso login --profile <tuperfil>`
2. `cp config.env.example config.env` y ajusta `PROFILE`, `BUCKET` (nombre único), `MODEL_ID`.
3. **Habilitar acceso al modelo** en consola Bedrock → *Model access* (Claude o Nova).
   Verifica: `./check-bedrock.sh` (lista perfiles de inferencia y hace una invocación de prueba).
4. **Provisionar infra**: `./provision.sh` → copia `DISTRIBUTION_ID` y `CF_DOMAIN` a `config.env`.
5. **Generar el QR** apuntando a `https://$CF_DOMAIN` y pegarlo en el slide del QR.
6. **Ensayo cronometrado**: corre `./enciende.sh "..."` 2-3 veces y anota el tiempo total.

## En vivo
```bash
./enciende.sh "una landing para mi panadería artesanal en Pereira"
```
Imprime la URL viva y `IA: Xs · deploy: Ys · total: Zs`. El público escanea el QR.

## Plan B (si el deploy en vivo falla)
- Ten una **URL ya desplegada** de respaldo (corre `enciende.sh` una vez antes; esa versión queda viva).
- Si Bedrock/red falla, el QR igual apunta al respaldo. Guion: *"la nube ya lo dejó encendido — ábranlo igual"*.

## Después
`./cleanup.sh` — borra bucket + CloudFront para no dejar nada corriendo (ni costos).

La demo de la diapositiva (`server.py`) usa el MISMO bucket y la MISMA distribución
que creó `provision.sh` (CloudFront tarda 5-15 min en propagarse, por eso no se crea en
vivo). En la corrida, cada fila del panel es una llamada real e idempotente (crear el
bucket, reaplicar la política, consultar la distribución = Deployed, verificar Bedrock);
la página se sube al bucket y la URL viva + QR son `https://$CF_DOMAIN/`. La distribución
usa la política de caché CachingDisabled: cada visita va al origen, sin invalidaciones.
Si `DISTRIBUTION_ID` falta o aún no está Deployed, la URL viva cae a la de S3.

## Costo
Centavos: Bedrock por tokens de unas pocas llamadas + S3/CloudFront de un archivo. Free tier cubre casi todo.
