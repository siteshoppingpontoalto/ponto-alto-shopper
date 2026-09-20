import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Lock, Search, ShoppingBag, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCart, unlockAdmin } from "@/lib/shop";
import { toast } from "sonner";

export function Header({
  busca,
  onBusca,
}: {
  busca?: string;
  onBusca?: (v: string) => void;
}) {
  const { count } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [palavra, setPalavra] = useState("");

  const tentar = () => {
    if (unlockAdmin(palavra)) {
      setOpen(false);
      setPalavra("");
      navigate({ to: "/admin" });
    } else {
      toast.error("Palavra-chave incorreta.");
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="size-5" />
          </span>
          <span className="leading-tight">
            <span className="block text-base font-semibold tracking-tight">
              Shopping Ponto Alto
            </span>
            <span className="block text-[11px] text-muted-foreground">
              Lojistas reunidos em um só lugar
            </span>
          </span>
        </Link>

        <div className="order-3 w-full md:order-2 md:ml-6 md:w-auto md:flex-1">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={busca ?? ""}
              onChange={(e) => onBusca?.(e.target.value)}
              placeholder="Buscar produtos, lojas ou modelos..."
              className="pl-9"
              disabled={!onBusca}
            />
          </div>
        </div>

        <div className="order-2 ml-auto flex items-center gap-2 md:order-3 md:ml-0">
          <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
            <Lock className="size-4" /> Admin
          </Button>
          <Button size="sm" onClick={() => navigate({ to: "/carrinho" })}>
            <ShoppingBag className="size-4" />
            Carrinho
            <span className="ml-1 rounded-full bg-primary-foreground/20 px-2 text-xs">
              {count}
            </span>
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Área administrativa</DialogTitle>
            <DialogDescription>
              Digite a palavra-chave para liberar o cadastro de produtos.
            </DialogDescription>
          </DialogHeader>
          <Input
            type="password"
            value={palavra}
            autoFocus
            onChange={(e) => setPalavra(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && tentar()}
            placeholder="Palavra-chave"
          />
          <Button onClick={tentar}>Entrar</Button>
        </DialogContent>
      </Dialog>
    </header>
  );
}
