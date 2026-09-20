import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Minus, Plus, Trash2 } from "lucide-react";
import { brl, onlyDigits, useCart, useProducts, type Product } from "@/lib/shop";
import { toast } from "sonner";

export const Route = createFileRoute("/carrinho")({
  head: () => ({
    meta: [
      { title: "Carrinho — Shopping Ponto Alto" },
      {
        name: "description",
        content:
          "Revise seus itens, informe seus dados e envie o pedido direto para o WhatsApp do lojista do Shopping Ponto Alto.",
      },
      { property: "og:title", content: "Carrinho — Shopping Ponto Alto" },
      {
        property: "og:description",
        content: "Finalize seu pedido pelo WhatsApp do lojista.",
      },
    ],
  }),
  component: Carrinho,
});

function Carrinho() {
  const { items, setQty, removeItem, clear } = useCart();
  const { products } = useProducts();
  const [cliente, setCliente] = useState({
    nome: "",
    telefone: "",
    endereco: "",
    obs: "",
  });

  const grupos = useMemo(() => {
    const map = new Map<
      string,
      { loja: string; whatsapp: string; linhas: { p: Product; qtd: number; cor: string; tam: string; id: string }[] }
    >();
    for (const item of items) {
      const p = products.find((x) => x.id === item.productId);
      if (!p) continue;
      const key = p.whatsapp || p.loja;
      if (!map.has(key)) map.set(key, { loja: p.loja, whatsapp: p.whatsapp, linhas: [] });
      map.get(key)!.linhas.push({
        p,
        qtd: item.quantidade,
        cor: item.cor,
        tam: item.tamanho,
        id: item.id,
      });
    }
    return [...map.values()];
  }, [items, products]);

  const total = grupos.reduce(
    (s, g) => s + g.linhas.reduce((a, l) => a + l.p.preco * l.qtd, 0),
    0,
  );

  const dadosOk = cliente.nome.trim().length > 2 && onlyDigits(cliente.telefone).length >= 10;

  const enviar = (grupo: (typeof grupos)[number]) => {
    if (!dadosOk) {
      toast.error("Informe seu nome completo e telefone antes de realizar o pedido.");
      return;
    }
    const subtotal = grupo.linhas.reduce((a, l) => a + l.p.preco * l.qtd, 0);
    const linhas = grupo.linhas
      .map(
        (l) =>
          `• ${l.qtd}x ${l.p.nome} (${l.p.modelo})\n   Cor: ${l.cor || "-"} | Tamanho: ${
            l.tam || "-"
          }\n   Valor: ${brl(l.p.preco * l.qtd)}`,
      )
      .join("\n");

    const msg =
      `Olá, ${grupo.loja}! Fiz um pedido pela loja virtual do Shopping Ponto Alto.\n\n` +
      `*Dados do cliente*\n` +
      `Nome: ${cliente.nome}\n` +
      `Telefone: ${cliente.telefone}\n` +
      `Entrega/Retirada: ${cliente.endereco || "Retirada no shopping"}\n` +
      (cliente.obs ? `Observações: ${cliente.obs}\n` : "") +
      `\n*Itens*\n${linhas}\n\n` +
      `*Total desta loja:* ${brl(subtotal)}`;

    const fone = onlyDigits(grupo.whatsapp);
    const numero = fone.startsWith("55") ? fone : `55${fone}`;
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">Seu carrinho</h1>

        {grupos.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm text-muted-foreground">Seu carrinho está vazio.</p>
            <Button asChild className="mt-4">
              <Link to="/">Ver produtos</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-6">
              {grupos.map((g) => (
                <div key={g.loja} className="rounded-2xl border border-border bg-card p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-semibold">Loja: {g.loja}</h2>
                    <span className="text-xs text-muted-foreground">
                      {brl(g.linhas.reduce((a, l) => a + l.p.preco * l.qtd, 0))}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {g.linhas.map((l) => (
                      <div key={l.id} className="flex gap-3">
                        <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                          {l.p.fotos[0] ? (
                            <img
                              src={l.p.fotos[0]}
                              alt={l.p.nome}
                              className="size-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{l.p.nome}</p>
                          <p className="text-xs text-muted-foreground">
                            Cor: {l.cor || "-"} · Tam: {l.tam || "-"}
                          </p>
                          <p className="text-sm font-semibold">{brl(l.p.preco * l.qtd)}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="size-8"
                            onClick={() => setQty(l.id, l.qtd - 1)}
                          >
                            <Minus className="size-3" />
                          </Button>
                          <span className="w-6 text-center text-sm">{l.qtd}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="size-8"
                            onClick={() => setQty(l.id, l.qtd + 1)}
                          >
                            <Plus className="size-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-destructive"
                            onClick={() => removeItem(l.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button className="mt-4 w-full" onClick={() => enviar(g)}>
                    Realizar pedido ({g.loja})
                  </Button>
                </div>
              ))}
              <Button variant="ghost" className="text-destructive" onClick={clear}>
                Limpar carrinho
              </Button>
            </div>

            <aside className="h-fit space-y-4 rounded-2xl border border-border bg-card p-4 lg:sticky lg:top-24">
              <h2 className="text-sm font-semibold">Seus dados</h2>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="nome">Nome completo</Label>
                  <Input
                    id="nome"
                    value={cliente.nome}
                    onChange={(e) => setCliente({ ...cliente, nome: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="tel">Telefone</Label>
                  <Input
                    id="tel"
                    value={cliente.telefone}
                    placeholder="(11) 90000-0000"
                    onChange={(e) => setCliente({ ...cliente, telefone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="end">Endereço de entrega ou retirada</Label>
                  <Input
                    id="end"
                    placeholder="Rua, nº, bairro ou 'retirar no shopping'"
                    value={cliente.endereco}
                    onChange={(e) => setCliente({ ...cliente, endereco: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="obs">Observações</Label>
                  <Textarea
                    id="obs"
                    value={cliente.obs}
                    onChange={(e) => setCliente({ ...cliente, obs: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-sm text-muted-foreground">Total geral</span>
                <span className="text-lg font-semibold">{brl(total)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                O pedido é enviado por WhatsApp para cada lojista responsável pelos itens.
              </p>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
