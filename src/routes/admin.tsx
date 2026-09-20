import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CATEGORIAS,
  brl,
  isAdminUnlocked,
  lockAdmin,
  unlockAdmin,
  useProducts,
  type Product,
} from "@/lib/shop";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Painel do Lojista — Shopping Ponto Alto" },
      {
        name: "description",
        content:
          "Área administrativa para cadastrar, editar e excluir produtos dos lojistas do Shopping Ponto Alto.",
      },
      { property: "og:title", content: "Painel do Lojista — Shopping Ponto Alto" },
      {
        property: "og:description",
        content: "Gerencie produtos, fotos, variações e o WhatsApp de cada lojista.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

const vazio = {
  nome: "",
  loja: "",
  whatsapp: "",
  breveDescricao: "",
  descricao: "",
  modelo: "",
  cores: "",
  tamanhos: "",
  preco: "",
  categoria: CATEGORIAS[0] ?? "",
  fotos: "",
};

function Admin() {
  const navigate = useNavigate();
  const { products, addProduct, updateProduct, removeProduct } = useProducts();
  const [liberado, setLiberado] = useState(false);
  const [pronto, setPronto] = useState(false);
  const [palavra, setPalavra] = useState("");
  const [form, setForm] = useState({ ...vazio });
  const [editando, setEditando] = useState<string | null>(null);

  useEffect(() => {
    setLiberado(isAdminUnlocked());
    setPronto(true);
  }, []);

  if (!pronto) return null;

  if (!liberado) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm space-y-4 rounded-2xl border border-border bg-card p-6">
          <h1 className="text-lg font-semibold">Acesso restrito</h1>
          <p className="text-sm text-muted-foreground">
            Digite a palavra-chave para acessar o painel administrativo.
          </p>
          <Input
            type="password"
            autoFocus
            value={palavra}
            onChange={(e) => setPalavra(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              if (unlockAdmin(palavra)) setLiberado(true);
              else toast.error("Palavra-chave incorreta.");
            }}
            placeholder="Palavra-chave"
          />
          <Button
            className="w-full"
            onClick={() => {
              if (unlockAdmin(palavra)) setLiberado(true);
              else toast.error("Palavra-chave incorreta.");
            }}
          >
            Entrar
          </Button>
          <Button variant="ghost" className="w-full" asChild>
            <Link to="/">Voltar à loja</Link>
          </Button>
        </div>
      </div>
    );
  }

  const carregar = (p: Product) => {
    setEditando(p.id);
    setForm({
      nome: p.nome,
      loja: p.loja,
      whatsapp: p.whatsapp,
      breveDescricao: p.breveDescricao,
      descricao: p.descricao,
      modelo: p.modelo,
      cores: p.cores.join(", "),
      tamanhos: p.tamanhos.join(", "),
      preco: String(p.preco),
      categoria: p.categoria,
      fotos: p.fotos.join(", "),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const salvar = () => {
    if (!form.nome.trim() || !form.loja.trim() || !form.whatsapp.trim() || !form.preco) {
      toast.error("Preencha nome, loja, WhatsApp e preço.");
      return;
    }
    const dados = {
      nome: form.nome.trim(),
      loja: form.loja.trim(),
      whatsapp: form.whatsapp.trim(),
      breveDescricao: form.breveDescricao.trim(),
      descricao: form.descricao.trim(),
      modelo: form.modelo.trim(),
      cores: form.cores.split(",").map((s) => s.trim()).filter(Boolean),
      tamanhos: form.tamanhos.split(",").map((s) => s.trim()).filter(Boolean),
      preco: Number(form.preco.replace(",", ".")) || 0,
      categoria: form.categoria,
      fotos: form.fotos.split(",").map((s) => s.trim()).filter(Boolean),
    };
    if (editando) {
      updateProduct({ ...dados, id: editando });
      toast.success("Produto atualizado.");
    } else {
      addProduct(dados);
      toast.success("Produto cadastrado.");
    }
    setForm({ ...vazio });
    setEditando(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Painel de produtos</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              lockAdmin();
              navigate({ to: "/" });
            }}
          >
            Sair do painel
          </Button>
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[400px_1fr]">
          <div className="h-fit space-y-3 rounded-2xl border border-border bg-card p-4 lg:sticky lg:top-24">
            <h2 className="text-sm font-semibold">
              {editando ? "Editar produto" : "Novo produto"}
            </h2>
            <Field label="Nome do produto">
              <Input
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
              />
            </Field>
            <Field label="Nome da loja / lojista">
              <Input
                value={form.loja}
                onChange={(e) => setForm({ ...form, loja: e.target.value })}
              />
            </Field>
            <Field label="WhatsApp do lojista (com DDD)">
              <Input
                placeholder="11987654321"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              />
            </Field>
            <Field label="Breve descrição">
              <Input
                value={form.breveDescricao}
                onChange={(e) => setForm({ ...form, breveDescricao: e.target.value })}
              />
            </Field>
            <Field label="Descrição detalhada">
              <Textarea
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              />
            </Field>
            <Field label="Modelo">
              <Input
                value={form.modelo}
                onChange={(e) => setForm({ ...form, modelo: e.target.value })}
              />
            </Field>
            <Field label="Cores (separadas por vírgula)">
              <Input
                placeholder="Preto, Branco"
                value={form.cores}
                onChange={(e) => setForm({ ...form, cores: e.target.value })}
              />
            </Field>
            <Field label="Tamanhos (separados por vírgula)">
              <Input
                placeholder="P, M, G, GG"
                value={form.tamanhos}
                onChange={(e) => setForm({ ...form, tamanhos: e.target.value })}
              />
            </Field>
            <Field label="Preço (R$)">
              <Input
                placeholder="199,90"
                value={form.preco}
                onChange={(e) => setForm({ ...form, preco: e.target.value })}
              />
            </Field>
            <Field label="Categoria">
              <Select
                value={form.categoria}
                onValueChange={(v) => setForm({ ...form, categoria: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="URLs das fotos (separadas por vírgula)">
              <Textarea
                placeholder="https://..."
                value={form.fotos}
                onChange={(e) => setForm({ ...form, fotos: e.target.value })}
              />
            </Field>
            <div className="flex gap-2 pt-2">
              <Button className="flex-1" onClick={salvar}>
                {editando ? "Salvar alterações" : "Cadastrar produto"}
              </Button>
              {editando && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditando(null);
                    setForm({ ...vazio });
                  }}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-semibold">
              Produtos cadastrados ({products.length})
            </h2>
            {products.map((p) => (
              <div
                key={p.id}
                className="flex gap-3 rounded-xl border border-border bg-card p-3"
              >
                <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {p.fotos[0] ? (
                    <img src={p.fotos[0]} alt={p.nome} className="size-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.nome}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.loja} · {p.categoria} · WhatsApp {p.whatsapp}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Cores: {p.cores.join(", ") || "-"} | Tamanhos:{" "}
                    {p.tamanhos.join(", ") || "-"}
                  </p>
                  <p className="text-sm font-semibold">{brl(p.preco)}</p>
                </div>
                <div className="flex items-start gap-1">
                  <Button variant="outline" size="icon" onClick={() => carregar(p)}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => {
                      removeProduct(p.id);
                      toast.success("Produto excluído.");
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
