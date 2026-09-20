import { useCallback, useEffect, useState } from "react";

export type Product = {
  id:string; nome:string; loja:string; whatsapp:string; breveDescricao:string; descricao:string;
  modelo:string; cores:string[]; tamanhos:string[]; preco:number; categoria:string; fotos:string[];
  youtubeUrl:string; instagramVideoUrl:string;
};
export type Merchant = {
  id:string; nomeLoja:string; responsavel:string; whatsapp:string; email:string; instagram:string;
  descricao:string; categoria?:string;
};
export type CartItem={id:string;productId:string;quantidade:number;cor:string;tamanho:string};

export const CATEGORIAS=["Moda Feminina","Moda Masculina","Calçados","Acessórios","Eletrônicos","Casa e Decoração","Infantil","Beleza"];
const CART_KEY="spa_carrinho_v1", EVENT="spa_store_change";

export function parseFotos(v:string):string[]{return v.split(/\r?\n/).flatMap(line=>line.includes("data:")?[line]:line.split(",")).map(x=>x.trim()).filter(Boolean);}
function write(key:string,value:unknown){if(typeof window==="undefined")return;localStorage.setItem(key,JSON.stringify(value));window.dispatchEvent(new Event(EVENT));}
function useStored<T>(key:string,fallback:T){const [value,setValue]=useState<T>(fallback);const [hydrated,setHydrated]=useState(false);useEffect(()=>{const sync=()=>{try{const raw=localStorage.getItem(key);setValue(raw?JSON.parse(raw) as T:fallback);}catch{setValue(fallback);}setHydrated(true)};sync();window.addEventListener(EVENT,sync);window.addEventListener("storage",sync);return()=>{window.removeEventListener(EVENT,sync);window.removeEventListener("storage",sync)}},[key]);const save=useCallback((next:T)=>write(key,next),[key]);return{value,save,hydrated};}

async function loadJson<T>(path:string,fallback:T):Promise<T>{try{const r=await fetch(path,{cache:"no-store"});if(!r.ok)throw new Error("HTTP "+r.status);return await r.json() as T}catch(error){console.error("Falha ao carregar",path,error);return fallback;}}
async function githubSave(action:"save-products"|"save-merchants",data:unknown){
  const key=typeof window!=="undefined"?sessionStorage.getItem("spa_admin_secret")||"":"";
  const r=await fetch("/api/admin/catalog",{method:"POST",headers:{"Content-Type":"application/json","x-admin-key":key},body:JSON.stringify({action,data})});
  const body=await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(body?.error||"Não foi possível gravar no GitHub.");
  return body;
}
export async function uploadProductImage(file:File){
  const dataUrl=await new Promise<string>((resolve,reject)=>{const fr=new FileReader();fr.onload=()=>resolve(String(fr.result));fr.onerror=reject;fr.readAsDataURL(file)});
  const key=typeof window!=="undefined"?sessionStorage.getItem("spa_admin_secret")||"":"";
  const r=await fetch("/api/admin/catalog",{method:"POST",headers:{"Content-Type":"application/json","x-admin-key":key},body:JSON.stringify({action:"upload-image",imageBase64:dataUrl,filename:file.name})});
  const body=await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(body?.error||"Não foi possível enviar a imagem.");
  return body.path as string;
}

export function useProducts(){
 const [products,setProducts]=useState<Product[]>([]); const [hydrated,setHydrated]=useState(false);
 const reloadProducts=useCallback(async()=>{setProducts(await loadJson<Product[]>("/data/products.json",[]));setHydrated(true)},[]);
 useEffect(()=>{reloadProducts()},[reloadProducts]);
 const addProduct=async(p:Omit<Product,"id">)=>{const next={...p,id:crypto.randomUUID()};const updated=[next,...products];await githubSave("save-products",updated);setProducts(updated);};
 const updateProduct=async(p:Product)=>{const updated=products.map(x=>x.id===p.id?p:x);await githubSave("save-products",updated);setProducts(updated);};
 const removeProduct=async(id:string)=>{const updated=products.filter(x=>x.id!==id);await githubSave("save-products",updated);setProducts(updated);};
 return{products,hydrated,addProduct,updateProduct,removeProduct,reloadProducts};
}
export function useMerchants(){
 const [merchants,setMerchants]=useState<Merchant[]>([]); const [hydrated,setHydrated]=useState(false);
 const reloadMerchants=useCallback(async()=>{setMerchants(await loadJson<Merchant[]>("/data/merchants.json",[]));setHydrated(true)},[]);
 useEffect(()=>{reloadMerchants()},[reloadMerchants]);
 const addMerchant=async(m:Omit<Merchant,"id">)=>{const next={...m,id:crypto.randomUUID()};const updated=[next,...merchants];await githubSave("save-merchants",updated);setMerchants(updated);};
 const updateMerchant=async(m:Merchant)=>{const updated=merchants.map(x=>x.id===m.id?m:x);await githubSave("save-merchants",updated);setMerchants(updated);};
 const removeMerchant=async(id:string)=>{const updated=merchants.filter(x=>x.id!==id);await githubSave("save-merchants",updated);setMerchants(updated);};
 return{merchants,hydrated,addMerchant,updateMerchant,removeMerchant,reloadMerchants};
}
export function useCart(){const{value,save,hydrated}=useStored<CartItem[]>(CART_KEY,[]);const addItem=(item:Omit<CartItem,"id">)=>{const existing=value.find(x=>x.productId===item.productId&&x.cor===item.cor&&x.tamanho===item.tamanho);if(existing)save(value.map(x=>x.id===existing.id?{...x,quantidade:x.quantidade+item.quantidade}:x));else save([...value,{...item,id:crypto.randomUUID()}])};const setQty=(id:string,quantidade:number)=>save(quantidade<=0?value.filter(x=>x.id!==id):value.map(x=>x.id===id?{...x,quantidade}:x));const removeItem=(id:string)=>save(value.filter(x=>x.id!==id));const clear=()=>save([]);const count=value.reduce((s,x)=>s+x.quantidade,0);return{items:value,hydrated,addItem,setQty,removeItem,clear,count};}
export const ADMIN_KEYWORD="pontinho";const ADMIN_SESSION="spa_admin_ok";
export function unlockAdmin(word:string){const ok=word.trim().toLowerCase()===ADMIN_KEYWORD;if(ok&&typeof window!=="undefined"){sessionStorage.setItem(ADMIN_SESSION,"1");sessionStorage.setItem("spa_admin_secret",word.trim())}return ok}
export function isAdminUnlocked(){return typeof window!=="undefined"&&sessionStorage.getItem(ADMIN_SESSION)==="1"}
export function lockAdmin(){if(typeof window!=="undefined"){sessionStorage.removeItem(ADMIN_SESSION);sessionStorage.removeItem("spa_admin_secret")}}
export function brl(value:number){return value.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}
export function onlyDigits(v:string){return v.replace(/\D/g,"")}
