#!/bin/bash
# Daemon que ejecuta el monitor constantemente

while true; do
  cd /home/ubuntu/.openclaw/workspace/agents-dashboard
  node scripts/monitor-comms.mjs
  sleep 3  # Actualiza cada 3 segundos
done
