import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CATEGORIAS, brl, useCart, useProducts, useMerchants, type Product } from "@/lib/shop";
import { Store, ShoppingCart, MapPin, Clock, Phone, Sparkles, Tag, Compass, Navigation, Gift, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({["meta"]:[{"title":"Shopping Ponto Alto — O maior Outlet e Shopping de Salvador"},{"name":"description","content":"Descubra as melhores marcas, descontos incríveis e compre online direto no WhatsApp das lojas do Shopping Ponto Alto."},{"property":"og:title","content":"Shopping Ponto Alto — Lojas e Ofertas"},{"property":"og:description","content":"Moda, calçados, eletrônicos e gastronomia no Shopping Ponto Alto."}]}),
  component: Index,
});

function Index() {
  const { products } = useProducts();
  const { merchants } = useMerchants();
  const { addItem } = useCart();
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState<string>("Todas");
  const [abaSecao, setAbaSecao] = useState<"produtos" | "lojas" | "experiencia">("produtos");
  const [aberto, setAberto] = useState<Product | null>(null);
  const [cor, setCor] = useState("");
  const [tamanho, setTamanho] = useState("");

  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return products.filter((p) => {
      const catOk = categoria === "Todas" || p.categoria === categoria;
      const qOk = !q || [p.nome, p.loja, p.modelo, p.categoria, p.breveDescricao].join(" ").toLowerCase().includes(q);
      return catOk && qOk;
    });
  }, [products, busca, categoria]);

  const lojistasFiltrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return merchants.filter((m) => {
      const catOk = categoria === "Todas" || m.categoria === categoria;
      const qOk = !q || [m.nomeLoja, m.descricao, m.responsavel].join(" ").toLowerCase().includes(q);
      return catOk && qOk;
    });
  }, [merchants, busca, categoria]);

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
    <div className="min-h-screen bg-background text-foreground">
      <Header busca={busca} onBusca={setBusca} />

      {/* Hero estilo Outlet Premium */}
      <section className="shopping-hero relative overflow-hidden text-white">
        <div className="shopping-hero__overlay">
          <div className="mx-auto w-full max-w-6xl px-4">
            <div className="shopping-hero__eyebrow inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1 text-xs font-semibold backdrop-blur">
              <Sparkles className="size-3.5 text-amber-300" /> O MELHOR SHOPPING E OUTLET DE SALVADOR
            </div>
            <h1 className="mt-3">Grandes marcas, descontos imperdíveis e experiência única</h1>
            <p>
              Explore o melhor do Shopping Ponto Alto. Compre online direto com os lojistas via WhatsApp ou venha nos visitar hoje mesmo.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button size="lg" className="bg-primary text-primary-foreground font-semibold hover:opacity-90" onClick={() => setAbaSecao("produtos")}>
                <Tag className="size-4 mr-2" /> Ver Ofertas e Produtos
              </Button>
              <Button size="lg" variant="outline" className="border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20" onClick={() => setAbaSecao("lojas")}>
                <Store className="size-4 mr-2" /> Nossas Lojas ({merchants.length})
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Barra de utilidades do shopping */}
      <div className="border-b border-border/60 bg-card shadow-xs">
        <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-border/60 md:grid-cols-4">
          <div className="flex items-center gap-3 p-4">
            <Clock className="size-5 text-primary shrink-0" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Horário</p>
              <p className="text-sm font-medium">Seg a Sáb: 9h às 21h · Dom: 14h às 20h</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4">
            <MapPin className="size-5 text-primary shrink-0" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Localização</p>
              <p className="text-sm font-medium">Av. Principal, 1000 - Salvador, BA</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4">
            <Phone className="size-5 text-primary shrink-0" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Central de Atendimento</p>
              <p className="text-sm font-medium">(71) 3000-4000</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4">
            <Gift className="size-5 text-primary shrink-0" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Vantagens</p>
              <p className="text-sm font-medium">Estacionamento Amplo & Pet Friendly</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Abas principais do site */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex gap-2">
            <Button variant={abaSecao === "produtos" ? "default" : "outline"} onClick={() => setAbaSecao("produtos")}>
              <Tag className="size-4 mr-1.5" /> Vitrine & Ofertas
            </Button>
            <Button variant={abaSecao === "lojas" ? "default" : "outline"} onClick={() => setAbaSecao("lojas")}>
              <Store className="size-4 mr-1.5" /> Lojas e Marcas
            </Button>
            <Button variant={abaSecao === "experiencia" ? "default" : "outline"} onClick={() => setAbaSecao("experiencia")}>
              <Compass className="size-4 mr-1.5" /> O Shopping
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            Exibindo <span className="font-semibold text-foreground">{abaSecao === "produtos" ? lista.length : lojistasFiltrados.length}</span> itens
          </div>
        </div>

        {/* Categorias */}
        <div className="mt-6 flex flex-wrap gap-2">
          {["Todas", ...CATEGORIAS].map((c) => (
            <Button key={c} variant={categoria === c ? "secondary" : "ghost"} size="sm" onClick={() => setCategoria(c)} className="rounded-full border border-border/80">
              {c}
            </Button>
          ))}
        </div>

        {/* Conteúdo da aba Vitrine / Produtos */}
        {abaSecao === "produtos" && (
          <div className="mt-8">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {lista.map((p) => (
                <button key={p.id} onClick={() => abrir(p)} className="group overflow-hidden rounded-2xl border border-border bg-card text-left transition hover:shadow-xl">
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    {p.fotos[0] ? <img src={p.fotos[0]} alt={p.nome} className="size-full object-cover transition group-hover:scale-105" /> : null}
                    <span className="absolute inset-x-3 bottom-3 flex translate-y-2 items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground opacity-0 shadow-lg transition group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                      <ShoppingCart className="size-4" /> Ver detalhes
                    </span>
                  </div>
                  <div className="space-y-2 p-4">
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium"><Store className="size-3 text-primary" /> {p.loja}</div>
                    <h3 className="line-clamp-2 text-sm font-semibold">{p.nome}</h3>
                    <p className="line-clamp-1 text-xs text-muted-foreground">{p.breveDescricao}</p>
                    <div className="pt-1 flex items-center justify-between">
                      <span className="text-base font-bold text-primary">{brl(p.preco)}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {p.tamanhos.slice(0, 4).map((t) => (
                        <Badge key={t} variant="secondary" className="text-[10px] px-1.5 py-0">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {lista.length === 0 && (
              <div className="py-20 text-center">
                <p className="text-sm text-muted-foreground">Nenhum produto encontrado com os filtros selecionados.</p>
              </div>
            )}
          </div>
        )}

        {/* Conteúdo da aba Lojas */}
        {abaSecao === "lojas" && (
          <div className="mt-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {lojistasFiltrados.map((m) => (
                <div key={m.id} className="rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-lg">
                        {m.nomeLoja.charAt(0)}
                      </div>
                      {m.categoria && (
                        <Badge variant="outline" className="text-xs">
                          {m.categoria}
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold">{m.nomeLoja}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{m.descricao || "Loja oficial associada ao Shopping Ponto Alto."}</p>
                    <div className="text-xs space-y-1 pt-2 border-t border-border/60 text-muted-foreground">
                      <p><span className="font-medium text-foreground">Responsável:</span> {m.responsavel}</p>
                      <p><span className="font-medium text-foreground">WhatsApp:</span> {m.whatsapp}</p>
                      {m.instagram && <p><span className="font-medium text-foreground">Instagram:</span> {m.instagram}</p>}
                    </div>
                  </div>
                  <div className="mt-6 pt-3">
                    <Button className="w-full" variant="outline" size="sm" onClick={() => {
                      setCategoria(m.categoria || "Todas");
                      setBusca(m.nomeLoja);
                      setAbaSecao("produtos");
                    }}>
                      Ver produtos desta loja <ChevronRight className="size-4 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {lojistasFiltrados.length === 0 && (
              <div className="py-20 text-center">
                <p className="text-sm text-muted-foreground">Nenhuma loja encontrada.</p>
              </div>
            )}
          </div>
        )}

        {/* Conteúdo da aba Experiência / Sobre o Shopping */}
        {abaSecao === "experiencia" && (
          <div className="mt-8 space-y-8">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Navigation className="size-5 text-primary" /> Como Chegar
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Localizado estrategicamente na Av. Principal, 1000, em Salvador - BA, o Shopping Ponto Alto oferece fácil acesso pelas principais vias da região, com amplo estacionamento seguro e rotas facilitadas.
                </p>
                <div className="rounded-xl bg-muted p-4 text-xs space-y-2">
                  <p className="font-semibold text-foreground">Transporte e Acesso:</p>
                  <p>• Estacionamento coberto e descoberto com vagas prioritárias.</p>
                  <p>• Linhas de ônibus regulares passando em frente ao empreendimento.</p>
                  <p>• Praça de táxi e pontos de embarque para aplicativos.</p>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Gift className="size-5 text-primary" /> Serviços e Benefícios
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Pensando no seu conforto, o Shopping Ponto Alto disponibiliza uma infraestrutura completa para você e sua família aproveitarem o dia com comodidade total.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="rounded-xl border p-3 text-xs font-medium bg-background">Wi-Fi Gratuito</div>
                  <div className="rounded-xl border p-3 text-xs font-medium bg-background">Pet Friendly</div>
                  <div className="rounded-xl border p-3 text-xs font-medium bg-background">Caixas Eletrônicos</div>
                  <div className="rounded-xl border p-3 text-xs font-medium bg-background">Achados e Perdidos</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rodapé institucional do Shopping Ponto Alto */}
      <footer className="border-t border-border/80 bg-card mt-16 text-foreground">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="space-y-3">
              <h3 className="text-base font-bold text-primary flex items-center gap-2">
                <Store className="size-5" /> Shopping Ponto Alto
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                O maior Outlet e Shopping de Salvador. As melhores marcas, descontos imperdíveis e atendimento direto via WhatsApp com os lojistas.
              </p>
              <div className="pt-2 text-xs font-medium">
                <p className="text-foreground">Central: (71) 3000-4000</p>
                <p className="text-muted-foreground">contato@shoppingpontoalto.com.br</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold uppercase tracking-wider">Departamentos & Lojas</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><button onClick={() => { setCategoria("Moda Feminina"); setAbaSecao("produtos"); }} className="hover:text-primary transition">Moda Feminina</button></li>
                <li><button onClick={() => { setCategoria("Moda Masculina"); setAbaSecao("produtos"); }} className="hover:text-primary transition">Moda Masculina</button></li>
                <li><button onClick={() => { setCategoria("Calçados"); setAbaSecao("produtos"); }} className="hover:text-primary transition">Calçados e Tênis</button></li>
                <li><button onClick={() => { setCategoria("Eletrônicos"); setAbaSecao("produtos"); }} className="hover:text-primary transition">Eletrônicos e Gadgets</button></li>
                <li><button onClick={() => { setCategoria("Casa e Decoração"); setAbaSecao("produtos"); }} className="hover:text-primary transition">Casa e Decoração</button></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold uppercase tracking-wider">Serviços ao Cliente</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><button onClick={() => setAbaSecao("experiencia")} className="hover:text-primary transition">Estacionamento Seguro</button></li>
                <li><button onClick={() => setAbaSecao("experiencia")} className="hover:text-primary transition">Wi-Fi Gratuito</button></li>
                <li><button onClick={() => setAbaSecao("experiencia")} className="hover:text-primary transition">Pet Friendly</button></li>
                <li><button onClick={() => setAbaSecao("experiencia")} className="hover:text-primary transition">Achados e Perdidos</button></li>
                <li><button onClick={() => setAbaSecao("experiencia")} className="hover:text-primary transition">Como Chegar</button></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold uppercase tracking-wider">Horário de Funcionamento</h4>
              <div className="text-xs text-muted-foreground space-y-2">
                <p><strong className="text-foreground">Lojas e Quiosques:</strong><br />Segunda a Sábado: 09h às 21h<br />Domingos e Feriados: 14h às 20h</p>
                <p><strong className="text-foreground">Praça de Alimentação:</strong><br />Todos os dias: 10h às 22h</p>
                <p className="pt-1 font-medium text-primary">Av. Principal, 1000 - Salvador, BA</p>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-border/60 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} Shopping Ponto Alto. Todos os direitos reservados.</p>
            <p className="mt-2 md:mt-0">Desenvolvido para oferecer a melhor experiência de compras em Salvador.</p>
          </div>
        </div>
      </footer>

      {/* Modal de detalhes do produto */}
      <Dialog open={!!aberto} onOpenChange={(o) => !o && setAberto(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          {aberto && (
            <>
              <DialogHeader>
                <DialogTitle>{aberto.nome}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="aspect-square overflow-hidden rounded-xl bg-muted">
                    {aberto.fotos[0] ? <img src={aberto.fotos[0]} alt={aberto.nome} className="size-full object-cover" /> : null}
                  </div>
                  {aberto.fotos.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {aberto.fotos.slice(1).map((f) => (
                        <img key={f} src={f} alt={aberto.nome} className="aspect-square rounded-lg object-cover border" />
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="text-xs text-muted-foreground font-medium">
                    Loja: <span className="text-foreground font-semibold">{aberto.loja}</span> · {aberto.categoria}
                  </div>
                  <p className="text-2xl font-bold text-primary">{brl(aberto.preco)}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{aberto.descricao}</p>
                  {aberto.modelo && (
                    <p className="text-xs">
                      <span className="text-muted-foreground">Modelo: </span>
                      <span className="font-medium">{aberto.modelo}</span>
                    </p>
                  )}
                  {aberto.cores.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-semibold">Cor:</p>
                      <div className="flex flex-wrap gap-2">
                        {aberto.cores.map((c) => (
                          <Button key={c} size="sm" variant={cor === c ? "default" : "outline"} onClick={() => setCor(c)}>
                            {c}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  {aberto.tamanhos.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-semibold">Tamanho:</p>
                      <div className="flex flex-wrap gap-2">
                        {aberto.tamanhos.map((t) => (
                          <Button key={t} size="sm" variant={tamanho === t ? "default" : "outline"} onClick={() => setTamanho(t)}>
                            {t}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  <Button className="w-full font-semibold" size="lg" onClick={adicionar}>
                    <ShoppingCart className="size-4 mr-2" /> Adicionar ao carrinho
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
