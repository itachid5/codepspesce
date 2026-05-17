# Domain and Cloudflare Tunnel

This project is served locally by FastAPI/Uvicorn on port `6000` and exposed publicly through a Cloudflare Tunnel.

## Public domain

The configured public domain is:

```text
https://www.theorbit.tech
```

Health check:

```bash
curl https://www.theorbit.tech/health
```

Expected response:

```json
{"status":"ok"}
```

## Local app startup

From the project root:

```bash
cd /workspaces/codepspesce/blog
python -m uvicorn app.main:app --host 127.0.0.1 --port 6000
```

Local URLs:

```text
http://127.0.0.1:6000
http://127.0.0.1:6000/health
```

The app reads environment variables from `.env`. Make sure `.env` exists and includes the required database and admin settings before starting the server.

## Cloudflare Tunnel startup

This machine already has a Cloudflare tunnel config at:

```text
/home/codespace/.cloudflared/config.yml
```

Current config:

```yaml
tunnel: 4e146be8-037d-4f07-809b-e53b37344750
credentials-file: /home/codespace/.cloudflared/4e146be8-037d-4f07-809b-e53b37344750.json

ingress:
  - hostname: www.theorbit.tech
    service: http://127.0.0.1:6000
  - service: http_status:404
```

Start the named tunnel with:

```bash
cloudflared tunnel --config /home/codespace/.cloudflared/config.yml run
```

Keep both commands running:

1. `python -m uvicorn app.main:app --host 127.0.0.1 --port 6000`
2. `cloudflared tunnel --config /home/codespace/.cloudflared/config.yml run`

## Quick verification

In another terminal, run:

```bash
curl http://127.0.0.1:6000/health
curl https://www.theorbit.tech/health
```

Both should return:

```json
{"status":"ok"}
```

## Troubleshooting

- If `https://www.theorbit.tech` returns Cloudflare error `1033`, the named tunnel is not running or is not connected.
- If the local health check fails, start or restart the Uvicorn app on port `6000`.
- If the public health check fails but the local health check works, restart the tunnel command.
- Do not use a temporary quick tunnel for the production domain. The command `cloudflared tunnel --url http://127.0.0.1:6000` creates a temporary `trycloudflare.com` URL and does not serve `www.theorbit.tech`.
