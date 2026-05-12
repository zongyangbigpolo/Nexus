---
name: docker-container-diagnostics
description: Docker and container runtime troubleshooting — container status, logs, resource usage, image issues, networking, volume mounts, and daemon health. Supports Docker Engine, containerd, and Podman.
---

# Docker Container Diagnostics Skill

Systematic container-level troubleshooting for Docker, containerd, and Podman environments.

## When to Use

- Container failing to start or repeatedly restarting
- Docker daemon unresponsive or high resource usage
- Image pull failures or registry authentication issues
- Container networking problems
- Volume mount or storage issues
- Container runtime (containerd/CRI-O) problems on Kubernetes nodes

---

## Phase DC-1: Container Runtime Health

### Docker Engine
```bash
# Daemon status
systemctl status docker
docker info
docker version

# Daemon logs
journalctl -u docker --since "1h ago" --no-pager | tail -50

# Disk usage
docker system df
docker system df -v
```

### containerd
```bash
# Status
systemctl status containerd
crictl info

# Version
crictl version

# Logs
journalctl -u containerd --since "1h ago" --no-pager | tail -50
```

### Podman
```bash
# Status
podman info
podman version

# System check
podman system connection list
```

## Phase DC-2: Container Status and Inspection

```bash
# List all containers (including stopped)
docker ps -a
# or: crictl ps -a

# Detailed container info
docker inspect <container-id>
# or: crictl inspect <container-id>

# Container processes
docker top <container-id>

# Container resource usage
docker stats --no-stream
docker stats <container-id> --no-stream
```

## Phase DC-3: Container Logs

```bash
# Recent logs
docker logs <container-id> --tail 200
# or: crictl logs <container-id> --tail 200

# Logs with timestamps
docker logs <container-id> --timestamps --tail 200

# Logs since time
docker logs <container-id> --since 1h

# Follow logs (interactive)
docker logs <container-id> -f
```

## Phase DC-4: Image Diagnostics

```bash
# List images
docker images
# or: crictl images

# Image details
docker image inspect <image>

# Check image layers
docker history <image>

# Pull test
docker pull <image>

# Prune unused images
docker image prune --dry-run
```

### Common Image Issues

| Issue | Symptom | Fix |
|-------|---------|-----|
| Image not found | `ErrImagePull` | Verify image name, tag, and registry |
| Auth failure | `ImagePullBackOff` with 401/403 | Check pull secrets / docker login |
| Disk full | `no space left on device` | `docker system prune` or expand disk |
| Manifest mismatch | `no matching manifest for linux/amd64` | Use correct platform/arch tag |

## Phase DC-5: Container Networking

```bash
# Container network settings
docker inspect <container-id> --format='{{json .NetworkSettings}}' | jq .

# List networks
docker network ls
docker network inspect <network>

# DNS resolution inside container
docker exec <container-id> nslookup <hostname>
docker exec <container-id> cat /etc/resolv.conf

# Port mappings
docker port <container-id>

# Connectivity test
docker exec <container-id> wget -qO- http://<target>:<port>/health
```

## Phase DC-6: Volume and Storage

```bash
# List volumes
docker volume ls

# Volume details
docker volume inspect <volume>

# Container mounts
docker inspect <container-id> --format='{{json .Mounts}}' | jq .

# Check disk usage of volumes
du -sh /var/lib/docker/volumes/*
```

## Phase DC-7: Docker Compose Diagnostics

```bash
# Service status
docker compose ps

# Service logs
docker compose logs <service> --tail 100

# Config validation
docker compose config

# Rebuild and restart
docker compose up -d --build <service>
```
