import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIAS, brl, isAdminUnlocked, lockAdmin, unlockAdmin, useMerchants, useProducts, type Product } from "@/lib/shop";
import { Pencil, Trash2, Upload, Youtube, Instagram, Store, UserPlus, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [
    { title: "Painel administrativo — Shopping Ponto Alto" },
    { name: "description", content: "Gerencie produtos, fotos, vídeos e lojistas do Shopping Ponto Alto." },
    { name: "robots", content: "noindex" },
  ]}),
  component: Admin,
});

const vazio = { nome:"", loja:"", whatsapp:"", breveDescricao:"", descricao:"", modelo:"", cores:"", tamanhos:"", preco:"", categoria:CATEGORIAS[0] ?? "", fotos:"", youtubeUrl:"", instagramVideoUrl:"" };
const vazioLojista = { nomeLoja:"", responsavel:"", whatsapp:"", email:"", instagram:"", descricao:"" };

function Admin() {
  const navigate = useNavigate();
  const { products, addProduct, updateProduct, removeProduct } = useProducts();
  const { merchants, addMerchant, removeMerchant } = useMerchants();
  const [liberado,setLiberado]=useState(false), [pronto,setPronto]=useState(false), [palavra,setPalavra]=useState("");
  const [form,setForm]=useState({...vazio}), [lojista,setLojista]=useState({...vazioLojista}), [editando,setEditando]=useState<string|null>(null);
  const [aba,setAba]=useState<"produtos"|"lojistas">("produtos");

  useEffect(()=>{ setLiberado(isAdminUnlocked()); setPronto(true); },[]);
  if(!pronto) return null;

  if(!liberado) return <div className="flex min-h-screen items-center justify-center bg-background px-4"><div className="w-full max-w-sm space-y-4 rounded-2xl border border-border bg-card p-6">
    <h1 className="text-lg font-semibold">Acesso restrito</h1><p className="text-sm text-muted-foreground">Digite a palavra-chave para acessar o painel administrativo.</p>
    <Input type="password" autoFocus value={palavra} onChange={e=>setPalavra(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){if(unlockAdmin(palavra))setLiberado(true);else toast.error("Palavra-chave incorreta.")}}} placeholder="Palavra-chave"/>
    <Button className="w-full" onClick={()=>{if(unlockAdmin(palavra))setLiberado(true);else toast.error("Palavra-chave incorreta.")}}>Entrar</Button>
    <Button variant="ghost" className="w-full" asChild><Link to="/">Voltar à loja</Link></Button>
  </div></div>;

  const carregar=(p:Product)=>{setEditando(p.id);setAba("produtos");setForm({nome:p.nome,loja:p.loja,whatsapp:p.whatsapp,breveDescricao:p.breveDescricao,descricao:p.descricao,modelo:p.modelo,cores:p.cores.join(", "),tamanhos:p.tamanhos.join(", "),preco:String(p.preco),categoria:p.categoria,fotos:p.fotos.join(", "),youtubeUrl:p.youtubeUrl||"",instagramVideoUrl:p.instagramVideoUrl||""});window.scrollTo({top:0,behavior:"smooth"});};

  const fotosSelecionadas=async(e:React.ChangeEvent<HTMLInputElement>)=>{
    const files=Array.from(e.target.files??[]);
    if(!files.length)return;
    const invalid=files.find(f=>!f.type.startsWith("image/")||f.size>3*1024*1024);
    if(invalid){toast.error("Use imagens de até 3 MB cada.");return;}
    const urls=await Promise.all(files.map(file=>new Promise<string>((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=reject;r.readAsDataURL(file);})));
    setForm(f=>({...f,fotos:[...f.fotos.split(",").map(s=>s.trim()).filter(Boolean),...urls].join(", ")}));
    e.target.value="";
  };

  const salvar=()=>{
    if(!form.nome.trim()||!form.loja.trim()||!form.whatsapp.trim()||!form.preco){toast.error("Preencha nome, loja, WhatsApp e preço.");return;}
    const dados={nome:form.nome.trim(),loja:form.loja.trim(),whatsapp:form.whatsapp.trim(),breveDescricao:form.breveDescricao.trim(),descricao:form.descricao.trim(),modelo:form.modelo.trim(),cores:form.cores.split(",").map(s=>s.trim()).filter(Boolean),tamanhos:form.tamanhos.split(",").map(s=>s.trim()).filter(Boolean),preco:Number(form.preco.replace(",","."))||0,categoria:form.categoria,fotos:form.fotos.split(",").map(s=>s.trim()).filter(Boolean),youtubeUrl:form.youtubeUrl.trim(),instagramVideoUrl:form.instagramVideoUrl.trim()};
    if(editando){updateProduct({...dados,id:editando});toast.success("Produto atualizado.");}else{addProduct(dados);toast.success("Produto cadastrado.");}
    setForm({...vazio});setEditando(null);
  };

  const cadastrarLojista=()=>{if(!lojista.nomeLoja.trim()||!lojista.responsavel.trim()||!lojista.whatsapp.trim()){toast.error("Preencha loja, responsável e WhatsApp.");return;}addMerchant({...lojista,nomeLoja:lojista.nomeLoja.trim(),responsavel:lojista.responsavel.trim(),whatsapp:lojista.whatsapp.trim(),email:lojista.email.trim(),instagram:lojista.instagram.trim(),descricao:lojista.descricao.trim()});toast.success("Lojista cadastrado.");setLojista({...vazioLojista});};

  return <div className="min-h-screen bg-background"><Header/><div className="mx-auto max-w-6xl px-4 py-8">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-semibold tracking-tight">Painel administrativo</h1><p className="text-sm text-muted-foreground">Produtos, mídia e cadastro de lojistas</p></div><Button variant="outline" size="sm" onClick={()=>{lockAdmin();navigate({to:"/"})}}>Sair do painel</Button></div>
    <div className="mt-6 flex gap-2 border-b border-border"><Button variant={aba==="produtos"?"default":"ghost"} onClick={()=>setAba("produtos")}><Store className="mr-2 size-4"/>Produtos</Button><Button variant={aba==="lojistas"?"default":"ghost"} onClick={()=>setAba("lojistas")}><UserPlus className="mr-2 size-4"/>Novo lojista</Button></div>

    {aba==="lojistas" ? <section className="mt-6 grid gap-8 lg:grid-cols-[400px_1fr]">
      <div className="h-fit space-y-3 rounded-2xl border border-border bg-card p-4"><h2 className="text-sm font-semibold">Cadastro de novo lojista</h2>
        <Field label="Nome da loja *"><Input value={lojista.nomeLoja} onChange={e=>setLojista({...lojista,nomeLoja:e.target.value})} placeholder="Ex.: Bella Moda"/></Field>
        <Field label="Responsável *"><Input value={lojista.responsavel} onChange={e=>setLojista({...lojista,responsavel:e.target.value})}/></Field>
        <Field label="WhatsApp *"><Input value={lojista.whatsapp} onChange={e=>setLojista({...lojista,whatsapp:e.target.value})}/></Field>
        <Field label="E-mail"><Input type="email" value={lojista.email} onChange={e=>setLojista({...lojista,email:e.target.value})}/></Field>
        <Field label="Instagram da loja"><Input value={lojista.instagram} onChange={e=>setLojista({...lojista,instagram:e.target.value})} placeholder="@nomedaloja ou URL"/></Field>
        <Field label="Descrição"><Textarea value={lojista.descricao} onChange={e=>setLojista({...lojista,descricao:e.target.value})}/></Field>
        <Button className="w-full" onClick={cadastrarLojista}><UserPlus className="mr-2 size-4"/>Cadastrar lojista</Button>
      </div>
      <div className="space-y-3"><h2 className="text-sm font-semibold">Lojistas cadastrados ({merchants.length})</h2>
        {merchants.length===0?<p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">Nenhum lojista cadastrado ainda.</p>:merchants.map(m=><div key={m.id} className="flex items-start gap-3 rounded-xl border bg-card p-4"><Store className="mt-1 size-5"/><div className="min-w-0 flex-1"><p className="font-medium">{m.nomeLoja}</p><p className="text-xs text-muted-foreground">{m.responsavel} · {m.whatsapp}</p>{m.email&&<p className="text-xs text-muted-foreground">{m.email}</p>}{m.instagram&&<p className="text-xs text-muted-foreground">{m.instagram}</p>}<p className="mt-1 text-sm">{m.descricao}</p></div><Button variant="ghost" size="icon" className="text-destructive" onClick={()=>{removeMerchant(m.id);toast.success("Lojista removido.")}}><Trash2 className="size-4"/></Button></div>)}
      </div>
    </section> : <section className="mt-6 grid gap-8 lg:grid-cols-[420px_1fr]">
      <div className="h-fit space-y-3 rounded-2xl border border-border bg-card p-4 lg:sticky lg:top-24"><h2 className="text-sm font-semibold">{editando?"Editar produto":"Novo produto"}</h2>
        <Field label="Nome do produto *"><Input value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})}/></Field>
        <Field label="Nome da loja / lojista *"><Input value={form.loja} onChange={e=>setForm({...form,loja:e.target.value})}/></Field>
        <Field label="WhatsApp do lojista *"><Input value={form.whatsapp} onChange={e=>setForm({...form,whatsapp:e.target.value})}/></Field>
        <Field label="Breve descrição"><Input value={form.breveDescricao} onChange={e=>setForm({...form,breveDescricao:e.target.value})}/></Field>
        <Field label="Descrição detalhada"><Textarea value={form.descricao} onChange={e=>setForm({...form,descricao:e.target.value})}/></Field>
        <Field label="Modelo"><Input value={form.modelo} onChange={e=>setForm({...form,modelo:e.target.value})}/></Field>
        <Field label="Cores (separadas por vírgula)"><Input value={form.cores} onChange={e=>setForm({...form,cores:e.target.value})}/></Field>
        <Field label="Tamanhos (separados por vírgula)"><Input value={form.tamanhos} onChange={e=>setForm({...form,tamanhos:e.target.value})}/></Field>
        <Field label="Preço (R$) *"><Input value={form.preco} onChange={e=>setForm({...form,preco:e.target.value})} placeholder="199,90"/></Field>
        <Field label="Categoria"><Select value={form.categoria} onValueChange={v=>setForm({...form,categoria:v})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{CATEGORIAS.map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></Field>
        <Field label="Fotos do produto"><Input type="file" accept="image/*" multiple onChange={fotosSelecionadas}/><p className="text-[11px] text-muted-foreground">Selecione várias fotos, até 3 MB cada.</p><Textarea placeholder="Ou cole URLs separadas por vírgula" value={form.fotos} onChange={e=>setForm({...form,fotos:e.target.value})}/>{form.fotos&&<div className="grid grid-cols-4 gap-2">{form.fotos.split(",").map(s=>s.trim()).filter(Boolean).slice(0,8).map((src,i)=><img key={i} src={src} alt="" className="aspect-square rounded-lg object-cover border"/>)}</div>}</Field>
        <div className="rounded-xl border border-border p-3 space-y-3"><p className="text-sm font-medium">Vídeos do produto</p><Field label="Link do vídeo no YouTube"><div className="relative"><Youtube className="absolute left-3 top-2.5 size-4 text-muted-foreground"/><Input className="pl-9" type="url" placeholder="https://youtube.com/watch?v=..." value={form.youtubeUrl} onChange={e=>setForm({...form,youtubeUrl:e.target.value})}/></div></Field><Field label="Link do vídeo no Instagram"><div className="relative"><Instagram className="absolute left-3 top-2.5 size-4 text-muted-foreground"/><Input className="pl-9" type="url" placeholder="https://instagram.com/reel/..." value={form.instagramVideoUrl} onChange={e=>setForm({...form,instagramVideoUrl:e.target.value})}/></div></Field></div>
        <div className="flex gap-2 pt-2"><Button className="flex-1" onClick={salvar}>{editando?"Salvar alterações":"Cadastrar produto"}</Button>{editando&&<Button variant="outline" onClick={()=>{setEditando(null);setForm({...vazio})}}>Cancelar</Button>}</div>
      </div>
      <div className="space-y-3"><h2 className="text-sm font-semibold">Produtos cadastrados ({products.length})</h2>{products.map(p=><div key={p.id} className="flex gap-3 rounded-xl border bg-card p-3"><div className="size-16 shrink-0 overflow-hidden rounded-lg bg-muted">{p.fotos[0]&&<img src={p.fotos[0]} alt={p.nome} className="size-full object-cover"/>}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{p.nome}</p><p className="text-xs text-muted-foreground">{p.loja} · {p.categoria} · WhatsApp {p.whatsapp}</p><p className="text-xs text-muted-foreground">Cores: {p.cores.join(", ")||"-"} | Tamanhos: {p.tamanhos.join(", ")||"-"}</p><p className="text-sm font-semibold">{brl(p.preco)}</p><div className="mt-1 flex flex-wrap gap-2 text-xs">{p.youtubeUrl&&<a href={p.youtubeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary"><Youtube className="size-3"/>YouTube<ExternalLink className="size-3"/></a>}{p.instagramVideoUrl&&<a href={p.instagramVideoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary"><Instagram className="size-3"/>Instagram<ExternalLink className="size-3"/></a>}</div></div><div className="flex items-start gap-1"><Button variant="outline" size="icon" onClick={()=>carregar(p)}><Pencil className="size-4"/></Button><Button variant="ghost" size="icon" className="text-destructive" onClick={()=>{removeProduct(p.id);toast.success("Produto excluído.")}}><Trash2 className="size-4"/></Button></div></div>)}</div>
    </section>}
  </div></div>;
}

function Field({label,children}:{label:string;children:React.ReactNode}){return <div className="space-y-1"><Label className="text-xs">{label}</Label>{children}</div>;}
