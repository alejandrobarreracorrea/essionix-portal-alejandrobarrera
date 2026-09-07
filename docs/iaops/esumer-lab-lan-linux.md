# Lab: "Tu LAN dentro de Linux" — el homólogo cloud de Packet Tracer

**Curso:** Cloud Computing, Redes y Ciberseguridad · Esumer Ruta TI 2026-2
**Dónde corre:** la instancia EC2 del equipo (Amazon Linux/Ubuntu, free tier) — root vía sudo.
**Licenciamiento:** cero. `iproute2` y `tcpdump` son software libre incluido en Linux.
**Equivalencia:** todo lo que Packet Tracer simula, aquí se construye real:

| Packet Tracer | Linux real |
|---|---|
| PC / host | network namespace (`ip netns`) |
| Switch | bridge (`ip link add ... type bridge`) |
| Cable | par veth (`ip link add ... type veth`) |
| Router | namespace con `ip_forward=1` |
| "Simulation mode" (ver paquetes) | `tcpdump` (los paquetes de verdad) |

---

## Parte 1 · La LAN: dos hosts y un switch (~20 min)

```bash
# EL SWITCH: un bridge llamado sw0
sudo ip link add sw0 type bridge
sudo ip link set sw0 up

# HOST A: un namespace + su "cable" (par veth) conectado al switch
sudo ip netns add hostA
sudo ip link add ethA type veth peer name pA
sudo ip link set ethA netns hostA
sudo ip link set pA master sw0 && sudo ip link set pA up
sudo ip netns exec hostA ip addr add 192.168.50.11/24 dev ethA
sudo ip netns exec hostA ip link set ethA up
sudo ip netns exec hostA ip link set lo up

# HOST B: igual, con .12
sudo ip netns add hostB
sudo ip link add ethB type veth peer name pB
sudo ip link set ethB netns hostB
sudo ip link set pB master sw0 && sudo ip link set pB up
sudo ip netns exec hostB ip addr add 192.168.50.12/24 dev ethB
sudo ip netns exec hostB ip link set ethB up
sudo ip netns exec hostB ip link set lo up

# LA PRUEBA extremo a extremo (el "ping" de Packet Tracer):
sudo ip netns exec hostA ping -c3 192.168.50.12
```

**Ver los paquetes de verdad** (el modo simulación, pero real) — en otra terminal:

```bash
sudo tcpdump -i sw0 -n arp or icmp
# se ve el ARP ("who-has 192.168.50.12") y luego los ICMP echo request/reply
```

**Momento docente:** ese ARP que aparece primero ES la capa 2 encontrando la MAC.
Nadie lo olvida después de verlo en vivo.

## Parte 2 · Subnetting real: dos redes y un router (~25 min)

```bash
# EL ROUTER: otro namespace con dos patas y forwarding activado
sudo ip netns add router
sudo ip link add r1 type veth peer name pR1   # pata hacia la red 50
sudo ip link set r1 netns router
sudo ip link set pR1 master sw0 && sudo ip link set pR1 up
sudo ip netns exec router ip addr add 192.168.50.1/24 dev r1
sudo ip netns exec router ip link set r1 up

# SEGUNDA RED: switch sw1 + hostC en 192.168.60.0/24
sudo ip link add sw1 type bridge && sudo ip link set sw1 up
sudo ip netns add hostC
sudo ip link add ethC type veth peer name pC
sudo ip link set ethC netns hostC
sudo ip link set pC master sw1 && sudo ip link set pC up
sudo ip netns exec hostC ip addr add 192.168.60.11/24 dev ethC
sudo ip netns exec hostC ip link set ethC up && sudo ip netns exec hostC ip link set lo up

# pata del router hacia la red 60
sudo ip link add r2 type veth peer name pR2
sudo ip link set r2 netns router
sudo ip link set pR2 master sw1 && sudo ip link set pR2 up
sudo ip netns exec router ip addr add 192.168.60.1/24 dev r2
sudo ip netns exec router ip link set r2 up
sudo ip netns exec router sysctl -w net.ipv4.ip_forward=1

# GATEWAYS: cada host aprende su puerta de salida
sudo ip netns exec hostA ip route add default via 192.168.50.1
sudo ip netns exec hostC ip route add default via 192.168.60.1

# LA PRUEBA entre subredes + el camino (traceroute muestra el salto por el router)
sudo ip netns exec hostA ping -c3 192.168.60.11
sudo ip netns exec hostA traceroute -n 192.168.60.11
```

**Momento docente:** quitar el `ip_forward` (`=0`) y ver morir el ping = qué hace un router.
Borrar la ruta default de hostA = por qué "hay red pero no sale" (la falla #1 de soporte).

## Parte 3 · El puente al mundo real (~10 min, discusión)

- Lo que acaban de construir a mano es EXACTAMENTE lo que hace la VPC de AWS:
  subredes = sus bridges · route tables = sus `ip route` · el IGW = el router con forwarding.
- Y es lo que Docker hace en cada `docker run` (mismo netns + veth + bridge `docker0`).
- Limpieza: `sudo ip netns del hostA hostB hostC router; sudo ip link del sw0; sudo ip link del sw1`
  (o reiniciar la instancia — todo era efímero: otra lección).

## Producto de la sesión (bitácora)

1. Captura del `ping` entre hosts + el `tcpdump` mostrando ARP e ICMP, comentados.
2. Diagrama de la topología construida (draw.io o foto de papel) con IPs y máscaras.
3. Dos "experimentos de ruptura" documentados: qué rompieron, qué esperaban, qué pasó.

## Notas para el docente

- Probar la secuencia completa en la instancia demo ANTES de clase (10 min) — Amazon Linux 2023
  y Ubuntu 22+ la soportan sin instalar nada (tcpdump: `sudo yum/apt install tcpdump` si falta).
- CloudShell NO sirve para este lab (contenedor sin CAP_NET_ADMIN) — es en la EC2 del equipo.
- Plan B sin internet en el aula: el lab corre igual (es local a la instancia), solo se necesita
  el SSH ya establecido; como último recurso, demo del docente proyectada.
- Para diseño/validación de planos CIDR sin licencias: `ipcalc`/`sipcalc` (libres, en CloudShell)
  y draw.io para diagramas.
- Si algún semestre quieren topologías grandes multi-router: Mininet o Containerlab + FRRouting
  (todo open source) en una sola EC2 — mismo espíritu, más nodos.
