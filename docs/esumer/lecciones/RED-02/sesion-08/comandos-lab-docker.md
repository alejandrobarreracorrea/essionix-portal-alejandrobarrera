# LAB Docker · 3 sitios + balanceador en tu EC2 (copiar y pegar en el chat)

_Probado de punta a punta con Docker + nginx:alpine (2026-10-02): reparto A→B→C, failover sin B y regreso de B._

**Paso 1 · Instalar Docker**
```
sudo dnf install -y docker
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user && newgrp docker
docker run --rm hello-world
```

**Paso 2 · Crear los 3 sitios (A rojo, B verde, C azul)**
```
for p in A:tomato B:seagreen C:royalblue; do s=${p%%:*}; c=${p##*:}; mkdir -p ~/sitios/$s; echo "<body style='background:$c;color:#fff;font:40px sans-serif;text-align:center;padding-top:20vh'><h1>Sitio $s</h1><p>contenedor web-$s</p></body>" > ~/sitios/$s/index.html; done
```

**Paso 3 · Red y contenedores**
```
docker network create red-web
for s in A B C; do docker run -d --name web-$s --network red-web -v ~/sitios/$s:/usr/share/nginx/html:ro nginx:alpine; done
docker ps
```

**Paso 4 · El balanceador**
```
mkdir -p ~/lb
cat > ~/lb/default.conf <<'EOF'
upstream sitios {
    zone sitios 64k;
    server web-A:80;
    server web-B:80;
    server web-C:80;
}
server {
    listen 80;
    location / {
        proxy_pass http://sitios;
        add_header X-Atendido-Por $upstream_addr always;
    }
}
EOF
sudo systemctl stop nginx && sudo systemctl disable nginx
docker run -d --name balanceador --network red-web -p 80:80 -v ~/lb/default.conf:/etc/nginx/conf.d/default.conf:ro nginx:alpine
```
Abre `http://TU-IP-PÚBLICA` y recarga con **Ctrl+F5**.

**Paso 5 · Prueba de fuego**
```
for i in 1 2 3 4 5 6; do curl -s localhost | grep -o "Sitio ."; done
docker stop web-B
for i in 1 2 3 4; do curl -s localhost | grep -o "Sitio ."; done
docker start web-B        # vuelve al reparto en ~10 s
docker logs balanceador --tail 5
```

**Limpieza (al final)**
```
docker rm -f balanceador web-A web-B web-C
docker network rm red-web
sudo systemctl enable --now nginx
curl -I localhost
```

> Si algo dice *permission denied* con Docker: `newgrp docker` (o antepón `sudo`).
> Si web-B no vuelve al reparto tras `docker start web-B`: `docker restart balanceador`.
> Si siempre sale "Sitio A": falta la línea `zone sitios 64k;` en el upstream.
> Si el balanceador no arranca: ¿quedó el NGINX viejo usando el puerto 80? → `sudo systemctl stop nginx`.
