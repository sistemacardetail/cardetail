#!/bin/sh
set -e

# Remove espaços acidentais (causa do "invalid number of arguments")
PORT=$(echo "${PORT:-80}" | tr -d ' \t\r\n')
BACKEND_URL=$(echo "${BACKEND_URL}" | tr -d ' \t\r\n')

# Fallback se BACKEND_URL estiver vazia após limpeza
if [ -z "$BACKEND_URL" ]; then
    BACKEND_URL="http://localhost:8080"
fi

echo "=== nginx config ==="
echo "PORT:        $PORT"
echo "BACKEND_URL: $BACKEND_URL"
echo "===================="

export PORT BACKEND_URL

envsubst '${PORT} ${BACKEND_URL}' \
    < /etc/nginx/conf.d/default.conf.template \
    > /etc/nginx/conf.d/default.conf

echo "=== nginx.conf gerado ==="
cat /etc/nginx/conf.d/default.conf
echo "========================="

exec nginx -g 'daemon off;'
