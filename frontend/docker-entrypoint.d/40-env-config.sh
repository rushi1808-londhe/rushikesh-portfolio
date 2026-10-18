#!/bin/sh
# Writes runtime config consumed by the SPA (window.__ENV__) so flags can change without a rebuild.
set -eu
case "$(echo "${USE_VIDEO_HERO:-false}" | tr '[:upper:]' '[:lower:]')" in
  true|1|yes) VIDEO=true ;;
  *) VIDEO=false ;;
esac
cat > /usr/share/nginx/html/env-config.js <<JS
window.__ENV__ = { USE_VIDEO_HERO: "${VIDEO}" };
JS
echo "env-config.js written (USE_VIDEO_HERO=${VIDEO})"
