import { createFileRoute } from "@tanstack/react-router";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/github";
type ServerConfig = { repo: string; connectionKey: string; lovableKey: string; adminKey: string };

function getServerConfig(): ServerConfig {
  const repo = process.env["GITHUB_REPO"] || "siteshoppingpontoalto/ponto-alto-shopper";
  const connectionKey = process.env["GITHUB_API_KEY"] || "";
  const lovableKey = process.env["LOVABLE_API_KEY"] || "";
  const adminKey = process.env["ADMIN_KEYWORD"] || "pontinho";
  if (!connectionKey || !lovableKey) throw new Error("Conexão com o GitHub não configurada no servidor.");
  return { repo, connectionKey, lovableKey, adminKey };
}

function headers(config: ServerConfig) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${config.lovableKey}`,
    "X-Connection-Api-Key": config.connectionKey,
    "Content-Type": "application/json",
  };
}

function json(status: number, body: unknown) {
  return Response.json(body, { status });
}

async function github(config: ServerConfig, path: string, init: RequestInit = {}) {
  const response = await fetch(`${GATEWAY_URL}/repos/${config.repo}/contents/${path}`, {
    ...init,
    headers: { ...headers(config), ...(init.headers || {}) },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = typeof body?.message === "string" ? body.message : `GitHub HTTP ${response.status}`;
    console.error(`GitHub request failed [${response.status}]: ${detail}`);
    throw new Error(detail);
  }
  return body as any;
}

function b64Text(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}

function b64Bytes(value: string) {
  return value.replace(/^data:[^;]+;base64,/, "");
}

async function readJson(path: string, config: ServerConfig) {
  const file = await github(config, path, { method: "GET" });
  const decoded = atob(String(file.content || "").replace(/\n/g, ""));
  const bytes = Uint8Array.from(decoded, (c) => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

async function writeFile(path: string, contentBase64: string, message: string, config: ServerConfig) {
  let sha: string | undefined;
  try {
    sha = (await github(config, path, { method: "GET" })).sha;
  } catch {
    sha = undefined;
  }
  return github(config, path, {
    method: "PUT",
    body: JSON.stringify({ message, content: contentBase64, sha, branch: "main" }),
  });
}

export const Route = createFileRoute("/api/admin/catalog")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const config = getServerConfig();
          const supplied = request.headers.get("x-admin-key") || "";
          if (supplied !== config.adminKey) return json(401, { error: "Não autorizado." });
          const body = (await request.json()) as {
            action: "save-products" | "save-merchants" | "upload-image";
            data?: unknown;
            imageBase64?: string;
            filename?: string;
          };
          if (body.action === "upload-image") {
            if (!body.imageBase64) return json(400, { error: "Imagem ausente." });
            const safe = (body.filename || "imagem.jpg").toLowerCase().replace(/[^a-z0-9._-]/g, "-");
            const path = `public/products/${Date.now()}-${safe}`;
            await writeFile(path, b64Bytes(body.imageBase64), `Adicionar imagem de produto ${safe}`, config);
            return json(200, { path: `/products/${path.split("/").pop()}` });
          }
          if (body.action === "save-products") {
            if (!Array.isArray(body.data)) return json(400, { error: "Produtos inválidos." });
            const result = await writeFile(
              "public/data/products.json",
              b64Text(JSON.stringify(body.data, null, 2) + "\n"),
              "Atualizar catálogo de produtos",
              config,
            );
            return json(200, { ok: true, commit: result.commit?.sha });
          }
          if (body.action === "save-merchants") {
            if (!Array.isArray(body.data)) return json(400, { error: "Lojistas inválidos." });
            const result = await writeFile(
              "public/data/merchants.json",
              b64Text(JSON.stringify(body.data, null, 2) + "\n"),
              "Atualizar catálogo de lojistas",
              config,
            );
            return json(200, { ok: true, commit: result.commit?.sha });
          }
          return json(400, { error: "Ação inválida." });
        } catch (error) {
          console.error(error);
          return json(500, { error: error instanceof Error ? error.message : "Falha ao gravar no GitHub." });
        }
      },
    },
  },
});
