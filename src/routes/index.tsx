import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CATEGORIAS, brl, useCart, useProducts, type Product } from "@/lib/shop";
import { Store, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Shopping Ponto Alto — Loja Virtual dos Lojistas" },
      {
        name: "description",
        content:
          "Compre online os produtos dos lojistas do Shopping Ponto Alto por categoria e finalize o pedido direto no WhatsApp da loja.",
      },
      { property: "og:title", content: "Shopping Ponto Alto — Loja Virtual" },
      {
        property: "og:description",
        content:
          "Moda, calçados, acessórios e eletrônicos dos lojistas do Shopping Ponto Alto.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { products } = useProducts();
  const { addItem } = useCart();
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState<string>("Todas");
  const [aberto, setAberto] = useState<Product | null>(null);
  const [cor, setCor] = useState("");
  const [tamanho, setTamanho] = useState("");

  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return products.filter((p) => {
      const catOk = categoria === "Todas" || p.categoria === categoria;
      const qOk =
        !q ||
        [p.nome, p.loja, p.modelo, p.categoria, p.breveDescricao]
          .join(" ")
          .toLowerCase()
          .includes(q);
      return catOk && qOk;
    });
  }, [products, busca, categoria]);

  const abrir = (p: Product) => {
    setAberto(p);
    setCor(p.cores[0] ?? "");
    setTamanho(p.tamanhos[0] ?? "");
  };

  const adicionar = () => {
    if (!aberto) return;
    addItem({ productId: aberto.id, quantidade: 1, cor, tamanho });
    toast.success(`${aberto.nome} adicionado ao carrinho`);
    setAberto(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header busca={busca} onBusca={setBusca} />

      <section className="border-b border-border/60 bg-secondary/40">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <h1 className="max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
            As lojas do Shopping Ponto Alto agora na palma da sua mão
          </h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            Escolha os produtos, monte seu carrinho e finalize a compra falando direto
            com o lojista pelo WhatsApp.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex flex-wrap gap-2">
          {["Todas", ...CATEGORIAS].map((c) => (
            <Button
              key={c}
              variant={categoria === c ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoria(c)}
            >
              {c}
            </Button>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {lista.map((p) => (
            <button
              key={p.id}
              onClick={() => abrir(p)}
              className="group overflow-hidden rounded-2xl border border-border bg-card text-left transition hover:shadow-lg"
            >
              <div className="aspect-square overflow-hidden bg-muted">
                {p.fotos[0] ? (
                  <img
                    src={p.fotos[0]}
                    alt={p.nome}
                    className="size-full object-cover transition group-hover:scale-105"
                  />
                ) : null}
              </div>
              <div className="space-y-2 p-3">
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Store className="size-3" /> {p.loja}
                </div>
                <h3 className="line-clamp-2 text-sm font-medium">{p.nome}</h3>
                <p className="line-clamp-1 text-xs text-muted-foreground">
                  {p.breveDescricao}
                </p>
                <p className="text-base font-semibold">{brl(p.preco)}</p>
                <div className="flex flex-wrap gap-1">
                  {p.tamanhos.slice(0, 5).map((t) => (
                    <Badge key={t} variant="secondary" className="text-[10px]">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>

        {lista.length === 0 && (
          <p className="py-16 text-center text-sm text-muted-foreground">
            Nenhum produto encontrado.
          </p>
        )}
      </div>

      <Dialog open={!!aberto} onOpenChange={(o) => !o && setAberto(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          {aberto && (
            <>
              <DialogHeader>
                <DialogTitle>{aberto.nome}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="aspect-square overflow-hidden rounded-xl bg-muted">
                    {aberto.fotos[0] ? (
                      <img
                        src={aberto.fotos[0]}
                        alt={aberto.nome}
                        className="size-full object-cover"
                      />
                    ) : null}
                  </div>
                  {aberto.fotos.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {aberto.fotos.slice(1).map((f) => (
                        <img
                          key={f}
                          src={f}
                          alt={aberto.nome}
                          className="aspect-square rounded-lg object-cover"
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="text-xs text-muted-foreground">
                    {aberto.loja} · {aberto.categoria}
                  </div>
                  <p className="text-2xl font-semibold">{brl(aberto.preco)}</p>
                  <p className="text-sm text-muted-foreground">{aberto.descricao}</p>
                  <p className="text-xs">
                    <span className="text-muted-foreground">Modelo: </span>
                    {aberto.modelo}
                  </p>

                  {aberto.cores.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-medium">Cor</p>
                      <div className="flex flex-wrap gap-2">
                        {aberto.cores.map((c) => (
                          <Button
                            key={c}
                            size="sm"
                            variant={cor === c ? "default" : "outline"}
                            onClick={() => setCor(c)}
                          >
                            {c}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {aberto.tamanhos.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-medium">Tamanho</p>
                      <div className="flex flex-wrap gap-2">
                        {aberto.tamanhos.map((t) => (
                          <Button
                            key={t}
                            size="sm"
                            variant={tamanho === t ? "default" : "outline"}
                            onClick={() => setTamanho(t)}
                          >
                            {t}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button className="w-full" onClick={adicionar}>
                    <ShoppingCart className="size-4" /> Adicionar ao carrinho
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
