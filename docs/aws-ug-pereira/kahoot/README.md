# Rifa de créditos AWS con Kahoot — AWS UG Pereira (28-sep-2026)

Dinámica de cierre: un Kahoot de **9 preguntas sobre la charla** (≈4 min). **El 1.er lugar gana USD 50 en créditos de AWS** (un premio por Kahoot).
En el deck es la diapositiva **17** ("¿Estabas prestando atención?"), justo antes del "Gracias" (`slides.html#17`).

## 1. Montar el Kahoot — ✅ YA MONTADO (28-sep)
Kahoot **"De tu cabeza al mundo · Rifa AWS UG Pereira"**, en la carpeta **AWS UG Pereira** de la cuenta compartida de líderes LATAM (privado, 9 preguntas, 20 s c/u, respuestas verificadas):
https://create.kahoot.it/details/45172261-fb12-4c27-9e8c-b96911fcd71d

Si hubiera que rehacerlo:
1. Entra a **kahoot.com** con la cuenta de líderes que te dio AWS (la sesión la inicias tú; la clave no va en el repo).
2. **Crear → Kahoot** → en la primera pregunta, **Añadir pregunta → Importar hoja de cálculo** → sube `rifa-kahoot.xlsx`.
3. Revisa que queden las 9 preguntas con la respuesta correcta marcada; título: *De tu cabeza al mundo · Rifa AWS UG Pereira*.
4. Guarda. Si el importador rechaza el archivo: descarga la plantilla oficial desde ese mismo diálogo y pega las filas 9–17 (columnas B–H).

## 2. En vivo (al llegar a la diapositiva 17)
1. En otra pestaña: tu Kahoot → **Iniciar → Modo clásico**. Opciones: *nickname generator* apagado (que pongan su nombre real para entregar el premio).
2. **Pon el PIN en la diapositiva 17:** estando en ella presiona **P**, escribe el PIN y **Enter** → aparece grande con un QR que abre `kahoot.it/?pin=…` (se recuerda en el navegador; para cambiarlo, P otra vez). Hazlo ~15 min antes: el PIN vive mientras el lobby de Kahoot siga abierto.
3. Cuando llegues a la rifa, cambia a la pestaña de Kahoot (lobby) para ver quién entra y dale Iniciar.
4. Espera ~1 min a que entren y dale **Iniciar**. 20 s por pregunta.
5. Al final Kahoot muestra el **podio**: el **1.er lugar** gana los USD 50.

## 3. Entregar los créditos
- Anota el nombre del 1.er lugar y pídele **su correo en privado** (no en voz alta ni en el repo).
- Envía los códigos de créditos por el canal que indique AWS para líderes (Centro para Líderes: s12d.com/latam-ug-center).
- Regla: **un premio por Kahoot**. Si el 1.er lugar no está presente, pasa al 2.º.

## Preguntas (respuesta correcta en **negrita**)
1. En la nube, como con la luz de tu casa, ¿qué pagas? → **Solo lo que tienes encendido**
2. ¿Cuántas regiones tiene AWS en el mundo, según la charla? → **39**
3. ¿En qué ciudad de Colombia hay una AWS Local Zone? → **Bogotá**
4. En la responsabilidad compartida, ¿qué te toca cuidar a TI? → **Tus llaves, datos y accesos**
5. ¿Qué hay detrás de cada botón de la consola de AWS? → **Una llamada a la API**
6. En el demo, ¿qué servicio creó la página con IA? → **Amazon Bedrock**
7. ¿Dónde quedó guardada la página del demo? → **En un bucket de Amazon S3**
8. ¿Qué pasó al intentar entrar directo al bucket S3? → **403: bloqueado, solo entra CloudFront**
9. ¿Qué servicio entrega tu página desde 600+ puntos cerca de ti? → **Amazon CloudFront**
