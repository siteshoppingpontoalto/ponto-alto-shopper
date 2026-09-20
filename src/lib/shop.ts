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
  youtubeUrl: string;
  instagramVideoUrl: string;
};

export type Merchant = {
  id: string;
  nomeLoja: string;
  responsavel: string;
  whatsapp: string;
  email: string;
  instagram: string;
  descricao: string;
  categoria?: string;
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
const MERCHANTS_KEY = "spa_lojistas_v1";
const CART_KEY = "spa_carrinho_v1";
const EVENT = "spa_store_change";

export const DEMO_PRODUCTS: Product[] = [
  { id:"p1", nome:"Vestido Midi Plissado", loja:"Bella Moda", whatsapp:"5511987650001", breveDescricao:"Vestido leve e elegante para o dia a dia.", descricao:"Vestido midi em tecido plissado com caimento fluido, forro interno e cinto removível. Ideal para eventos e trabalho.", modelo:"Midi Plissado 2024", cores:["Preto","Verde Oliva","Vinho"], tamanhos:["P","M","G","GG"], preco:219.9, categoria:"Moda Feminina", fotos:["https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80"], youtubeUrl:"", instagramVideoUrl:"" },
  { id:"p2", nome:"Camisa Social Slim", loja:"Don Alberto", whatsapp:"5511987650002", breveDescricao:"Algodão egípcio com toque macio.", descricao:"Camisa social slim fit confeccionada em algodão egípcio, com botões em madrepérola e punho duplo.", modelo:"Slim Premium", cores:["Branco","Azul Claro"], tamanhos:["1","2","3","4"], preco:179, categoria:"Moda Masculina", fotos:["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80"], youtubeUrl:"", instagramVideoUrl:"" },
  { id:"p3", nome:"Tênis Urbano Confort", loja:"Passo Certo Calçados", whatsapp:"5511987650003", breveDescricao:"Solado em memory foam para o dia inteiro.", descricao:"Tênis casual com cabedal em couro sintético, palmilha em memory foam e solado antiderrapante.", modelo:"Confort Max", cores:["Branco","Preto"], tamanhos:["37","38","39","40","41","42"], preco:289.9, categoria:"Calçados", fotos:["https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80"], youtubeUrl:"", instagramVideoUrl:"" },
  { id:"p4", nome:"Bolsa Transversal Couro", loja:"Atelier Luna", whatsapp:"5511987650004", breveDescricao:"Couro legítimo com alça ajustável.", descricao:"Bolsa transversal em couro legítimo, com dois compartimentos, bolso interno com zíper e alça ajustável.", modelo:"Luna Cross", cores:["Caramelo","Preto"], tamanhos:["Único"], preco:349, categoria:"Acessórios", fotos:["https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80"], youtubeUrl:"", instagramVideoUrl:"" },
  { id:"p5", nome:"Fone Bluetooth Studio", loja:"TecPonto", whatsapp:"5511987650005", breveDescricao:"Cancelamento de ruído e 30h de bateria.", descricao:"Fone over-ear com cancelamento ativo de ruído, bluetooth 5.3, microfone integrado e até 30 horas de bateria.", modelo:"Studio ANC", cores:["Preto","Prata"], tamanhos:["Único"], preco:459.9, categoria:"Eletrônicos", fotos:["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"], youtubeUrl:"", instagramVideoUrl:"" },
  { id:"p6", nome:"Conjunto Infantil Verão", loja:"Mundo Kids", whatsapp:"5511987650006", breveDescricao:"Camiseta e bermuda em algodão.", descricao:"Conjunto infantil com camiseta estampada e bermuda em moletinho leve, confortável para o verão.", modelo:"Verão Kids", cores:["Amarelo","Azul"], tamanhos:["2","4","6","8"], preco:89.9, categoria:"Infantil", fotos:["https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=800&q=80"], youtubeUrl:"", instagramVideoUrl:"" },
];

export const DEMO_MERCHANTS: Merchant[] = [
  { id:"m1", nomeLoja:"Bella Moda", responsavel:"Atendimento Bella Moda", whatsapp:"5511987650001", email:"", instagram:"", descricao:"Moda feminina.", categoria:"Moda Feminina" },
  { id:"m2", nomeLoja:"Don Alberto", responsavel:"Atendimento Don Alberto", whatsapp:"5511987650002", email:"", instagram:"", descricao:"Moda masculina.", categoria:"Moda Masculina" },
  { id:"m3", nomeLoja:"Passo Certo Calçados", responsavel:"Atendimento Passo Certo", whatsapp:"5511987650003", email:"", instagram:"", descricao:"Calçados.", categoria:"Calçados" },
  { id:"m4", nomeLoja:"Atelier Luna", responsavel:"Atendimento Atelier Luna", whatsapp:"5511987650004", email:"", instagram:"", descricao:"Acessórios.", categoria:"Acessórios" },
  { id:"m5", nomeLoja:"TecPonto", responsavel:"Atendimento TecPonto", whatsapp:"5511987650005", email:"", instagram:"", descricao:"Eletrônicos.", categoria:"Eletrônicos" },
  { id:"m6", nomeLoja:"Mundo Kids", responsavel:"Atendimento Mundo Kids", whatsapp:"5511987650006", email:"", instagram:"", descricao:"Moda infantil.", categoria:"Infantil" },
];

export function parseFotos(v: string): string[] {
  return v
    .split(/\r?\n/)
    .flatMap((line) => (line.includes("data:") ? [line] : line.split(",")))
    .map((s) => s.trim())
    .filter(Boolean);
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch { return fallback; }
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
    sync(); setHydrated(true);
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener(EVENT, sync); window.removeEventListener("storage", sync); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const save = useCallback((next: T) => write(key, next), [key]);
  return { value, save, hydrated };
}

export function useProducts() {
  const { value, save, hydrated } = useStored<Product[]>(PRODUCTS_KEY, DEMO_PRODUCTS);
  useEffect(() => {
    if (typeof window !== "undefined" && !window.localStorage.getItem(PRODUCTS_KEY)) write(PRODUCTS_KEY, DEMO_PRODUCTS);
  }, []);
  const addProduct = (p: Omit<Product, "id">) => save([{ ...p, id: crypto.randomUUID() }, ...value]);
  const updateProduct = (p: Product) => save(value.map((x) => x.id === p.id ? p : x));
  const removeProduct = (id: string) => save(value.filter((x) => x.id !== id));
  return { products: value, hydrated, addProduct, updateProduct, removeProduct };
}

export function useMerchants() {
  const { value, save, hydrated } = useStored<Merchant[]>(MERCHANTS_KEY, DEMO_MERCHANTS);
  useEffect(() => {
    if (typeof window !== "undefined" && !window.localStorage.getItem(MERCHANTS_KEY)) write(MERCHANTS_KEY, DEMO_MERCHANTS);
  }, []);
  const addMerchant = (m: Omit<Merchant, "id">) => save([{ ...m, id: crypto.randomUUID() }, ...value]);
  const updateMerchant = (m: Merchant) => save(value.map((x) => (x.id === m.id ? m : x)));
  const removeMerchant = (id: string) => save(value.filter((x) => x.id !== id));
  return { merchants: value, hydrated, addMerchant, updateMerchant, removeMerchant };
}

export function useCart() {
  const { value, save, hydrated } = useStored<CartItem[]>(CART_KEY, []);
  const addItem = (item: Omit<CartItem, "id">) => {
    const existing = value.find((x) => x.productId === item.productId && x.cor === item.cor && x.tamanho === item.tamanho);
    if (existing) save(value.map((x) => x.id === existing.id ? { ...x, quantidade: x.quantidade + item.quantidade } : x));
    else save([...value, { ...item, id: crypto.randomUUID() }]);
  };
  const setQty = (id: string, quantidade: number) => save(quantidade <= 0 ? value.filter((x) => x.id !== id) : value.map((x) => x.id === id ? { ...x, quantidade } : x));
  const removeItem = (id: string) => save(value.filter((x) => x.id !== id));
  const clear = () => save([]);
  const count = value.reduce((s, x) => s + x.quantidade, 0);
  return { items: value, hydrated, addItem, setQty, removeItem, clear, count };
}

export const ADMIN_KEYWORD = "pontinho";
const ADMIN_SESSION = "spa_admin_ok";
export function unlockAdmin(word: string) { const ok = word.trim().toLowerCase() === ADMIN_KEYWORD; if (ok && typeof window !== "undefined") window.sessionStorage.setItem(ADMIN_SESSION, "1"); return ok; }
export function isAdminUnlocked() { return typeof window !== "undefined" && window.sessionStorage.getItem(ADMIN_SESSION) === "1"; }
export function lockAdmin() { if (typeof window !== "undefined") window.sessionStorage.removeItem(ADMIN_SESSION); }
export function brl(value: number) { return value.toLocaleString("pt-BR", { style:"currency", currency:"BRL" }); }
export function onlyDigits(v: string) { return v.replace(/\D/g, ""); }
