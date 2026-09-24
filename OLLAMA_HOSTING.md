# Hosting Ollama on a separate server

Render/Railway/Vercel-style hosts run your app in short-lived containers with
no way to install or keep a background process like Ollama running, and their
free/cheap tiers don't have enough RAM for an LLM anyway. Ollama needs an
always-on machine you control — a small VPS is the standard way to do this.

This gives your Render backend a real LLM to call at
`OLLAMA_BASE_URL=https://ollama.yourdomain.com` instead of `127.0.0.1`.

## 1. Get a VPS

`qwen2.5:3b` (the model this app defaults to) needs about 2–3 GB of RAM to
run comfortably. Pick a plan with **at least 4 GB RAM**, Ubuntu 22.04:

- Hetzner Cloud CX22 (~€4/mo, 4 GB RAM) — cheapest option that works well.
- DigitalOcean Basic Droplet, 4 GB RAM (~$24/mo).
- Any other Ubuntu 22.04 VPS with 4 GB+ RAM works the same way.

You'll also want a domain (or subdomain, e.g. `ollama.yourdomain.com`)
pointed at the VPS's IP address via an `A` record — needed for step 4 (HTTPS).

## 2. Install Ollama and pull the model

SSH into the VPS, then:

```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama pull qwen2.5:3b
```

By default Ollama listens only on `127.0.0.1:11434` (not reachable from the
internet) — leave it that way. We'll expose it through nginx instead, so we
can put authentication in front of it (Ollama itself has no login/API-key
system, so a locally-only bind plus a reverse proxy is what makes it safe to
use from Render).

## 3. Generate a shared secret

This is the key your Render backend will send on every request so random
strangers scanning the internet can't use your server:

```bash
openssl rand -hex 32
```

Save this value — you'll paste it into both the nginx config below and
Render's `OLLAMA_API_KEY` environment variable.

## 4. Install nginx + HTTPS and add the auth check

```bash
sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx
```

Create `/etc/nginx/sites-available/ollama`:

```nginx
server {
    listen 80;
    server_name ollama.yourdomain.com;

    location / {
        # Require: Authorization: Bearer <the secret from step 3>
        if ($http_authorization != "Bearer REPLACE_WITH_YOUR_SECRET") {
            return 401;
        }

        proxy_pass http://127.0.0.1:11434;
        proxy_set_header Host $host;
        proxy_read_timeout 120s;
    }
}
```

Replace `ollama.yourdomain.com` and `REPLACE_WITH_YOUR_SECRET`, then:

```bash
sudo ln -s /etc/nginx/sites-available/ollama /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d ollama.yourdomain.com
```

Certbot rewrites the config to serve HTTPS on 443 and redirect 80 → 443
automatically.

## 5. Lock down the firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

This blocks direct access to port 11434 from outside the VPS — nginx (with
the auth check) is the only way in.

## 6. Point the backend at it

In Render's dashboard, on the `samadhan-setu-backend` service → Environment:

| Variable          | Value                                    |
|--------------------|-------------------------------------------|
| `AI_ENGINE`        | `ollama`                                   |
| `OLLAMA_BASE_URL`  | `https://ollama.yourdomain.com`            |
| `OLLAMA_MODEL`     | `qwen2.5:3b`                               |
| `OLLAMA_API_KEY`   | the secret from step 3                     |

Redeploy the backend. `backend/ai_engine.py` now sends
`Authorization: Bearer <OLLAMA_API_KEY>` on every request when that variable
is set — matching the nginx check above.

## 7. Test it

```bash
curl -X POST https://ollama.yourdomain.com/api/generate \
  -H "Authorization: Bearer REPLACE_WITH_YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"model":"qwen2.5:3b","prompt":"Say hello in one word.","stream":false}'
```

You should get a JSON response with a `"response"` field. A request without
the header should get `401 Unauthorized`. If both check out, submit a test
problem from the citizen portal on your live site — it will now be
classified by this Ollama server instead of the deterministic fallback.

## Keeping it running

Ollama installs itself as a systemd service, so it survives reboots and
restarts automatically if it crashes:

```bash
sudo systemctl status ollama   # check it's running
sudo systemctl enable ollama   # ensure it starts on boot (usually default)
```
