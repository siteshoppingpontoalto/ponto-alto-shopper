import { useCallback, useEffect, useState } from "react";

export type Product = {
  id: string;
  nome: string;
  loja: string;
  whatsapp: string;
  breveDescricao: string;
  descricao: string;
  modelo: string;
  cores: string[];
  tamanhos: string[];
  preco: number;
  categoria: string;
  fotos: string[];
};

export type CartItem = {
  id: string;
  productId: string;
  quantidade: number;
  cor: string;
  tamanho: string;
};

export const CATEGORIAS = [
  "Moda Feminina",
  "Moda Masculina",
  "Calçados",
  "Acessórios",
  "Eletrônicos",
  "Casa e Decoração",
  "Infantil",
  "Beleza",
];

const PRODUCTS_KEY = "spa_produtos_v1";
const CART_KEY = "spa_carrinho_v1";
const EVENT = "spa_store_change";

export const DEMO_PRODUCTS: Product[] = [
  {
    id: "p1",
    nome: "Vestido Midi Plissado",
    loja: "Bella Moda",
    whatsapp: "5511987650001",
    breveDescricao: "Vestido leve e elegante para o dia a dia.",
    descricao:
      "Vestido midi em tecido plissado com caimento fluido, forro interno e cinto removível. Ideal para eventos e trabalho.",
    modelo: "Midi Plissado 2024",
    cores: ["Preto", "Verde Oliva", "Vinho"],
    tamanhos: ["P", "M", "G", "GG"],
    preco: 219.9,
    categoria: "Moda Feminina",
    fotos: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    id: "p2",
    nome: "Camisa Social Slim",
    loja: "Don Alberto",
    whatsapp: "5511987650002",
    breveDescricao: "Algodão egípcio com toque macio.",
    descricao:
      "Camisa social slim fit confeccionada em algodão egípcio, com botões em madrepérola e punho duplo.",
    modelo: "Slim Premium",
    cores: ["Branco", "Azul Claro"],
    tamanhos: ["1", "2", "3", "4"],
    preco: 179.0,
    categoria: "Moda Masculina",
    fotos: [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    id: "p3",
    nome: "Tênis Urbano Confort",
    loja: "Passo Certo Calçados",
    whatsapp: "5511987650003",
    breveDescricao: "Solado em memory foam para o dia inteiro.",
    descricao:
      "Tênis casual com cabedal em couro sintético, palmilha em memory foam e solado antiderrapante.",
    modelo: "Confort Max",
    cores: ["Branco", "Preto"],
    tamanhos: ["37", "38", "39", "40", "41", "42"],
    preco: 289.9,
    categoria: "Calçados",
    fotos: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    id: "p4",
    nome: "Bolsa Transversal Couro",
    loja: "Atelier Luna",
    whatsapp: "5511987650004",
    breveDescricao: "Couro legítimo com alça ajustável.",
    descricao:
      "Bolsa transversal em couro legítimo, com dois compartimentos, bolso interno com zíper e alça ajustável.",
    modelo: "Luna Cross",
    cores: ["Caramelo", "Preto"],
    tamanhos: ["Único"],
    preco: 349.0,
    categoria: "Acessórios",
    fotos: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    id: "p5",
    nome: "Fone Bluetooth Studio",
    loja: "TecPonto",
    whatsapp: "5511987650005",
    breveDescricao: "Cancelamento de ruído e 30h de bateria.",
    descricao:
      "Fone over-ear com cancelamento ativo de ruído, bluetooth 5.3, microfone integrado e até 30 horas de bateria.",
    modelo: "Studio ANC",
    cores: ["Preto", "Prata"],
    tamanhos: ["Único"],
    preco: 459.9,
    categoria: "Eletrônicos",
    fotos: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    id: "p6",
    nome: "Conjunto Infantil Verão",
    loja: "Mundo Kids",
    whatsapp: "5511987650006",
    breveDescricao: "Camiseta e bermuda em algodão.",
    descricao:
      "Conjunto infantil com camiseta estampada e bermuda em moletinho leve, confortável para o verão.",
    modelo: "Verão Kids",
    cores: ["Amarelo", "Azul"],
    tamanhos: ["2", "4", "6", "8"],
    preco: 89.9,
    categoria: "Infantil",
    fotos: [
      "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=800&q=80",
    ],
  },
];

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(EVENT));
}

function useStored<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const sync = () => setValue(read(key, fallback));
    sync();
    setHydrated(true);
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const save = useCallback((next: T) => write(key, next), [key]);

  return { value, save, hydrated };
}

export function useProducts() {
  const { value, save, hydrated } = useStored<Product[]>(PRODUCTS_KEY, DEMO_PRODUCTS);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.localStorage.getItem(PRODUCTS_KEY)) {
      write(PRODUCTS_KEY, DEMO_PRODUCTS);
    }
  }, []);

  const addProduct = (p: Omit<Product, "id">) =>
    save([{ ...p, id: crypto.randomUUID() }, ...value]);
  const updateProduct = (p: Product) => save(value.map((x) => (x.id === p.id ? p : x)));
  const removeProduct = (id: string) => save(value.filter((x) => x.id !== id));

  return { products: value, hydrated, addProduct, updateProduct, removeProduct };
}

export function useCart() {
  const { value, save, hydrated } = useStored<CartItem[]>(CART_KEY, []);

  const addItem = (item: Omit<CartItem, "id">) => {
    const existing = value.find(
      (x) =>
        x.productId === item.productId && x.cor === item.cor && x.tamanho === item.tamanho,
    );
    if (existing) {
      save(
        value.map((x) =>
          x.id === existing.id ? { ...x, quantidade: x.quantidade + item.quantidade } : x,
        ),
      );
      return;
    }
    save([...value, { ...item, id: crypto.randomUUID() }]);
  };

  const setQty = (id: string, quantidade: number) =>
    save(
      quantidade <= 0
        ? value.filter((x) => x.id !== id)
        : value.map((x) => (x.id === id ? { ...x, quantidade } : x)),
    );

  const removeItem = (id: string) => save(value.filter((x) => x.id !== id));
  const clear = () => save([]);
  const count = value.reduce((s, x) => s + x.quantidade, 0);

  return { items: value, hydrated, addItem, setQty, removeItem, clear, count };
}

export const ADMIN_KEYWORD = "pontinho";
const ADMIN_SESSION = "spa_admin_ok";

export function unlockAdmin(word: string) {
  const ok = word.trim().toLowerCase() === ADMIN_KEYWORD;
  if (ok && typeof window !== "undefined") {
    window.sessionStorage.setItem(ADMIN_SESSION, "1");
  }
  return ok;
}

export function isAdminUnlocked() {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(ADMIN_SESSION) === "1";
}

export function lockAdmin() {
  if (typeof window !== "undefined") window.sessionStorage.removeItem(ADMIN_SESSION);
}

export function brl(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function onlyDigits(v: string) {
  return v.replace(/\D/g, "");
}
