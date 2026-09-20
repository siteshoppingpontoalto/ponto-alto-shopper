import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIAS, brl, isAdminUnlocked, lockAdmin, parseFotos, unlockAdmin, useMerchants, useProducts, type Product } from "@/lib/shop";
import { supabase, SUPABASE_BUCKET } from "@/lib/supabase";
import { Pencil, Trash2, Upload, Youtube, Instagram, Store, UserPlus, ExternalLink, Copy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [
    { title: "Painel administrativo — Shopping Ponto Alto" },
    { name: "description", content: "Gerencie produtos, fotos, vídeos e lojistas do Shopping Ponto Alto." },
    { property: "og:title", content: "Painel administrativo — Shopping Ponto Alto" },
    { property: "og:description", content: "Gerencie produtos, fotos, vídeos e lojistas do Shopping Ponto Alto." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ]}),
  component: Admin,
});

const vazio = { nome:"", lojistaId:"", loja:"", whatsapp:"", breveDescricao:"", descricao:"", modelo:"", cores:"", tamanhos:"", preco:"", categoria:CATEGORIAS[0] ?? "", fotos:"", youtubeUrl:"", instagramVideoUrl:"" };
const vazioLojista = { nomeLoja:"", responsavel:"", whatsapp:"", email:"", instagram:"", descricao:"", categoria:CATEGORIAS[0] ?? "" };

function Admin() {
  const navigate = useNavigate();
  const { products, addProduct, updateProduct, removeProduct } = useProducts();
  const { merchants, addMerchant, updateMerchant, removeMerchant } = useMerchants();
  const [liberado,setLiberado]=useState(false), [pronto,setPronto]=useState(false), [palavra,setPalavra]=useState("");
  const [form,setForm]=useState({...vazio}), [lojista,setLojista]=useState({...vazioLojista}), [editando,setEditando]=useState<string|null>(null);
  const [editandoLojista,setEditandoLojista]=useState<string|null>(null);
  const [aba,setAba]=useState<"produtos"|"lojistas"|"editarLojista">("produtos");

  useEffect(()=>{ setLiberado(isAdminUnlocked()); setPronto(true); },[]);
  if(!pronto) return null;

  if(!liberado) return <div className="flex min-h-screen items-center justify-center bg-background px-4"><div className="w-full max-w-sm space-y-4 rounded-2xl border border-border bg-card p-6">
    <h1 className="text-lg font-semibold">Acesso restrito</h1><p className="text-sm text-muted-foreground">Digite a palavra-chave para acessar o painel administrativo.</p>
    <Input type="password" autoFocus value={palavra} onChange={e=>setPalavra(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){if(unlockAdmin(palavra))setLiberado(true);else toast.error("Palavra-chave incorreta.")}}} placeholder="Palavra-chave"/>
    <Button className="w-full" onClick={()=>{if(unlockAdmin(palavra))setLiberado(true);else toast.error("Palavra-chave incorreta.")}}>Entrar</Button>
    <Button variant="ghost" className="w-full" asChild><Link to="/">Voltar à loja</Link></Button>
  </div></div>;

  const preencher=(p:Product,id:string|null)=>{const merchant=merchants.find(m=>m.nomeLoja===p.loja&&m.whatsapp===p.whatsapp);setEditando(id);setAba("produtos");setForm({nome:id?p.nome:`${p.nome} (cópia)`,lojistaId:merchant?.id??"",loja:p.loja,whatsapp:p.whatsapp,breveDescricao:p.breveDescricao,descricao:p.descricao,modelo:p.modelo,cores:p.cores.join(", "),tamanhos:p.tamanhos.join(", "),preco:String(p.preco),categoria:p.categoria,fotos:p.fotos.join("\n"),youtubeUrl:p.youtubeUrl||"",instagramVideoUrl:p.instagramVideoUrl||""});window.scrollTo({top:0,behavior:"smooth"});};
  const carregar=(p:Product)=>preencher(p,p.id);
  const duplicar=(p:Product)=>{preencher(p,null);toast.success("Produto duplicado no formulário. Ajuste e clique em Cadastrar produto.");};

  const fotosSelecionadas=async(e:React.ChangeEvent<HTMLInputElement>)=>{
    const files=Array.from(e.target.files??[]);
    if(!files.length)return;
    const invalid=files.find(f=>!f.type.startsWith("image/")||f.size>3*1024*1024);
    if(invalid){toast.error("Use imagens de até 3 MB cada.");e.target.value="";return;}
    try {
      const urls=await Promise.all(files.map(async(file)=>{
        const ext=(file.name.split(".").pop()||"jpg").toLowerCase().replace(/[^a-z0-9]/g,"")||"jpg";
        const path="products/"+crypto.randomUUID()+"."+ext;
        const { error }=await supabase.storage.from(SUPABASE_BUCKET).upload(path,file,{cacheControl:"3600",upsert:false,contentType:file.type});
        if(error) throw error;
        return supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(path).data.publicUrl;
      }));
      setForm(f=>({...f,fotos:[...parseFotos(f.fotos),...urls].join("\n")}));
      toast.success(urls.length+" foto(s) enviada(s) para o Supabase.");
    } catch(error) {
      console.error(error);
      toast.error("Não foi possível enviar a foto. Verifique o bucket product-images e as políticas do Supabase.");
    } finally { e.target.value=""; }
  };

  const salvar=()=>{
    if(!form.nome.trim()||!form.loja.trim()||!form.whatsapp.trim()||!form.preco){toast.error("Preencha nome, loja, WhatsApp e preço.");return;}
    const dados={nome:form.nome.trim(),loja:form.loja.trim(),whatsapp:form.whatsapp.trim(),breveDescricao:form.breveDescricao.trim(),descricao:form.descricao.trim(),modelo:form.modelo.trim(),cores:form.cores.split(",").map(s=>s.trim()).filter(Boolean),tamanhos:form.tamanhos.split(",").map(s=>s.trim()).filter(Boolean),preco:Number(form.preco.replace(",","."))||0,categoria:form.categoria,fotos:parseFotos(form.fotos),youtubeUrl:form.youtubeUrl.trim(),instagramVideoUrl:form.instagramVideoUrl.trim()};
    if(editando){updateProduct({...dados,id:editando});toast.success("Produto atualizado.");}else{addProduct(dados);toast.success("Produto cadastrado.");}
    setForm({...vazio});setEditando(null);
  };

  const cadastrarLojista=()=>{if(!lojista.nomeLoja.trim()||!lojista.responsavel.trim()||!lojista.whatsapp.trim()){toast.error("Preencha loja, responsável e WhatsApp.");return;}addMerchant({...lojista,nomeLoja:lojista.nomeLoja.trim(),responsavel:lojista.responsavel.trim(),whatsapp:lojista.whatsapp.trim(),email:lojista.email.trim(),instagram:lojista.instagram.trim(),descricao:lojista.descricao.trim(),categoria:lojista.categoria});toast.success("Lojista cadastrado.");setLojista({...vazioLojista});};

  const carregarLojista=(id:string)=>{const m=merchants.find(x=>x.id===id);if(!m)return;setEditandoLojista(id);setLojista({nomeLoja:m.nomeLoja,responsavel:m.responsavel,whatsapp:m.whatsapp,email:m.email,instagram:m.instagram,descricao:m.descricao,categoria:m.categoria??CATEGORIAS[0]??""});};

  const salvarEdicaoLojista=()=>{
    if(!editandoLojista)return;
    const anterior=merchants.find(x=>x.id===editandoLojista);if(!anterior)return;
    if(!lojista.nomeLoja.trim()||!lojista.responsavel.trim()||!lojista.whatsapp.trim()){toast.error("Preencha loja, responsável e WhatsApp.");return;}
    const atualizado={...anterior,nomeLoja:lojista.nomeLoja.trim(),responsavel:lojista.responsavel.trim(),whatsapp:lojista.whatsapp.trim(),email:lojista.email.trim(),instagram:lojista.instagram.trim(),descricao:lojista.descricao.trim(),categoria:lojista.categoria};
    updateMerchant(atualizado);
    products.filter(p=>p.loja===anterior.nomeLoja&&p.whatsapp===anterior.whatsapp).forEach(p=>updateProduct({...p,loja:atualizado.nomeLoja,whatsapp:atualizado.whatsapp}));
    toast.success("Lojista atualizado.");
    setEditandoLojista(null);setLojista({...vazioLojista});
  };


  return <div className="min-h-screen bg-background"><Header/><div className="mx-auto max-w-6xl px-4 py-8">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-semibold tracking-tight">Painel administrativo</h1><p className="text-sm text-muted-foreground">Produtos, mídia e cadastro de lojistas</p></div><Button variant="outline" size="sm" onClick={()=>{lockAdmin();navigate({to:"/"})}}>Sair do painel</Button></div>
    <div className="mt-6 flex gap-2 border-b border-border"><Button variant={aba==="produtos"?"default":"ghost"} onClick={()=>setAba("produtos")}><Store className="mr-2 size-4"/>Produtos</Button><Button variant={aba==="lojistas"?"default":"ghost"} onClick={()=>{setAba("lojistas");setEditandoLojista(null);setLojista({...vazioLojista});}}><UserPlus className="mr-2 size-4"/>Novo lojista</Button><Button variant={aba==="editarLojista"?"default":"ghost"} onClick={()=>{setAba("editarLojista");setLojista({...vazioLojista});}}><Pencil className="mr-2 size-4"/>Editar lojista</Button></div>

    {aba==="editarLojista" ? <section className="mt-6 grid gap-8 lg:grid-cols-[400px_1fr]">
      <div className="h-fit space-y-3 rounded-2xl border border-border bg-card p-4"><h2 className="text-sm font-semibold">Editar lojista</h2>
        {!editandoLojista ? <p className="text-sm text-muted-foreground">Selecione um lojista ao lado para editar suas informações.</p> : <>
        <Field label="Nome da loja *"><Input value={lojista.nomeLoja} onChange={e=>setLojista({...lojista,nomeLoja:e.target.value})}/></Field>
        <Field label="Responsável *"><Input value={lojista.responsavel} onChange={e=>setLojista({...lojista,responsavel:e.target.value})}/></Field>
        <Field label="WhatsApp *"><Input value={lojista.whatsapp} onChange={e=>setLojista({...lojista,whatsapp:e.target.value})}/></Field>
        <Field label="E-mail"><Input type="email" value={lojista.email} onChange={e=>setLojista({...lojista,email:e.target.value})}/></Field>
        <Field label="Instagram da loja"><Input value={lojista.instagram} onChange={e=>setLojista({...lojista,instagram:e.target.value})}/></Field>
        <Field label="Categoria do lojista"><Select value={lojista.categoria} onValueChange={v=>setLojista({...lojista,categoria:v})}><SelectTrigger><SelectValue placeholder="Selecione a categoria"/></SelectTrigger><SelectContent>{CATEGORIAS.map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></Field>
        <Field label="Descrição"><Textarea value={lojista.descricao} onChange={e=>setLojista({...lojista,descricao:e.target.value})}/></Field>
        <div className="flex gap-2"><Button className="flex-1" onClick={salvarEdicaoLojista}>Salvar alterações</Button><Button variant="outline" onClick={()=>{setEditandoLojista(null);setLojista({...vazioLojista});}}>Cancelar</Button></div>
        </>}
      </div>
      <div className="space-y-3"><h2 className="text-sm font-semibold">Lojistas cadastrados ({merchants.length})</h2>
        {merchants.length===0?<p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">Nenhum lojista cadastrado ainda.</p>:merchants.map(m=><div key={m.id} className={`flex items-start gap-3 rounded-xl border bg-card p-4 ${editandoLojista===m.id?"ring-2 ring-primary":""}`}><Store className="mt-1 size-5"/><div className="min-w-0 flex-1"><p className="font-medium">{m.nomeLoja}</p><p className="text-xs text-muted-foreground">{m.responsavel} · {m.whatsapp}</p>{m.email&&<p className="text-xs text-muted-foreground">{m.email}</p>}{m.instagram&&<p className="text-xs text-muted-foreground">{m.instagram}</p>}{m.categoria&&<p className="mt-1 inline-block rounded-full bg-muted px-2 py-0.5 text-[11px]">{m.categoria}</p>}<p className="mt-1 text-sm">{m.descricao}</p></div><Button variant={editandoLojista===m.id?"default":"outline"} size="icon" onClick={()=>carregarLojista(m.id)}><Pencil className="size-4"/></Button></div>)}
      </div>
    </section> : aba==="lojistas" ? <section className="mt-6 grid gap-8 lg:grid-cols-[400px_1fr]">
      <div className="h-fit space-y-3 rounded-2xl border border-border bg-card p-4"><h2 className="text-sm font-semibold">Cadastro de novo lojista</h2>
        <Field label="Nome da loja *"><Input value={lojista.nomeLoja} onChange={e=>setLojista({...lojista,nomeLoja:e.target.value})} placeholder="Ex.: Bella Moda"/></Field>
        <Field label="Responsável *"><Input value={lojista.responsavel} onChange={e=>setLojista({...lojista,responsavel:e.target.value})}/></Field>
        <Field label="WhatsApp *"><Input value={lojista.whatsapp} onChange={e=>setLojista({...lojista,whatsapp:e.target.value})}/></Field>
        <Field label="E-mail"><Input type="email" value={lojista.email} onChange={e=>setLojista({...lojista,email:e.target.value})}/></Field>
        <Field label="Instagram da loja"><Input value={lojista.instagram} onChange={e=>setLojista({...lojista,instagram:e.target.value})} placeholder="@nomedaloja ou URL"/></Field>
        <Field label="Categoria do lojista"><Select value={lojista.categoria} onValueChange={v=>setLojista({...lojista,categoria:v})}><SelectTrigger><SelectValue placeholder="Selecione a categoria"/></SelectTrigger><SelectContent>{CATEGORIAS.map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></Field>
        <Field label="Descrição"><Textarea value={lojista.descricao} onChange={e=>setLojista({...lojista,descricao:e.target.value})}/></Field>
        <Button className="w-full" onClick={cadastrarLojista}><UserPlus className="mr-2 size-4"/>Cadastrar lojista</Button>
      </div>
      <div className="space-y-3"><h2 className="text-sm font-semibold">Lojistas cadastrados ({merchants.length})</h2>
        {merchants.length===0?<p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">Nenhum lojista cadastrado ainda.</p>:merchants.map(m=><div key={m.id} className="flex items-start gap-3 rounded-xl border bg-card p-4"><Store className="mt-1 size-5"/><div className="min-w-0 flex-1"><p className="font-medium">{m.nomeLoja}</p><p className="text-xs text-muted-foreground">{m.responsavel} · {m.whatsapp}</p>{m.email&&<p className="text-xs text-muted-foreground">{m.email}</p>}{m.instagram&&<p className="text-xs text-muted-foreground">{m.instagram}</p>}{m.categoria&&<p className="mt-1 inline-block rounded-full bg-muted px-2 py-0.5 text-[11px]">{m.categoria}</p>}<p className="mt-1 text-sm">{m.descricao}</p></div><Button variant="ghost" size="icon" className="text-destructive" onClick={()=>{removeMerchant(m.id);toast.success("Lojista removido.")}}><Trash2 className="size-4"/></Button></div>)}
      </div>
    </section> : <section className="mt-6 grid gap-8 lg:grid-cols-[420px_1fr]">
      <div className="h-fit space-y-3 rounded-2xl border border-border bg-card p-4 lg:sticky lg:top-24"><h2 className="text-sm font-semibold">{editando?"Editar produto":"Novo produto"}</h2>
        <Field label="Nome do produto *"><Input value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})}/></Field>
        <Field label="Nome da loja / lojista *"><Select value={form.lojistaId} onValueChange={id=>{const merchant=merchants.find(m=>m.id===id);if(!merchant)return;setForm({...form,lojistaId:id,loja:merchant.nomeLoja,whatsapp:merchant.whatsapp});}}><SelectTrigger><SelectValue placeholder="Selecione um lojista"/></SelectTrigger><SelectContent>{merchants.map(m=><SelectItem key={m.id} value={m.id}>{m.nomeLoja}</SelectItem>)}</SelectContent></Select>{merchants.length===0&&<p className="text-[11px] text-destructive">Cadastre um lojista antes de adicionar produtos.</p>}</Field>
        <Field label="WhatsApp do lojista *"><Input value={form.whatsapp} readOnly placeholder="Preenchido ao selecionar o lojista" className="bg-muted"/></Field>
        <Field label="Breve descrição"><Input value={form.breveDescricao} onChange={e=>setForm({...form,breveDescricao:e.target.value})}/></Field>
        <Field label="Descrição detalhada"><Textarea value={form.descricao} onChange={e=>setForm({...form,descricao:e.target.value})}/></Field>
        <Field label="Modelo"><Input value={form.modelo} onChange={e=>setForm({...form,modelo:e.target.value})}/></Field>
        <Field label="Cores (separadas por vírgula)"><Input value={form.cores} onChange={e=>setForm({...form,cores:e.target.value})}/></Field>
        <Field label="Tamanhos (separados por vírgula)"><Input value={form.tamanhos} onChange={e=>setForm({...form,tamanhos:e.target.value})}/></Field>
        <Field label="Preço (R$) *"><Input value={form.preco} onChange={e=>setForm({...form,preco:e.target.value})} placeholder="199,90"/></Field>
        <Field label="Categoria"><Select value={form.categoria} onValueChange={v=>setForm({...form,categoria:v})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{CATEGORIAS.map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></Field>
        <Field label="Fotos do produto"><Input type="file" accept="image/*" multiple onChange={fotosSelecionadas}/><p className="text-[11px] text-muted-foreground">Selecione várias fotos, até 3 MB cada.</p><Textarea rows={3} placeholder="Ou cole URLs, uma por linha" value={form.fotos} onChange={e=>setForm({...form,fotos:e.target.value})}/>{parseFotos(form.fotos).length>0&&<div className="grid grid-cols-4 gap-2">{parseFotos(form.fotos).slice(0,8).map((src,i)=><img key={i} src={src} alt="" className="aspect-square rounded-lg object-cover border"/>)}</div>}</Field>
        <div className="rounded-xl border border-border p-3 space-y-3"><p className="text-sm font-medium">Vídeos do produto</p><Field label="Link do vídeo no YouTube"><div className="relative"><Youtube className="absolute left-3 top-2.5 size-4 text-muted-foreground"/><Input className="pl-9" type="url" placeholder="https://youtube.com/watch?v=..." value={form.youtubeUrl} onChange={e=>setForm({...form,youtubeUrl:e.target.value})}/></div></Field><Field label="Link do vídeo no Instagram"><div className="relative"><Instagram className="absolute left-3 top-2.5 size-4 text-muted-foreground"/><Input className="pl-9" type="url" placeholder="https://instagram.com/reel/..." value={form.instagramVideoUrl} onChange={e=>setForm({...form,instagramVideoUrl:e.target.value})}/></div></Field></div>
        <div className="flex gap-2 pt-2"><Button className="flex-1" onClick={salvar}>{editando?"Salvar alterações":"Cadastrar produto"}</Button>{editando&&<Button variant="outline" onClick={()=>{setEditando(null);setForm({...vazio})}}>Cancelar</Button>}</div>
      </div>
      <div className="space-y-3"><h2 className="text-sm font-semibold">Produtos cadastrados ({products.length})</h2>{products.map(p=><div key={p.id} className="flex gap-3 rounded-xl border bg-card p-3"><div className="size-16 shrink-0 overflow-hidden rounded-lg bg-muted">{p.fotos[0]&&<img src={p.fotos[0]} alt={p.nome} className="size-full object-cover"/>}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{p.nome}</p><p className="text-xs text-muted-foreground">{p.loja} · {p.categoria} · WhatsApp {p.whatsapp}</p><p className="text-xs text-muted-foreground">Cores: {p.cores.join(", ")||"-"} | Tamanhos: {p.tamanhos.join(", ")||"-"}</p><p className="text-sm font-semibold">{brl(p.preco)}</p><div className="mt-1 flex flex-wrap gap-2 text-xs">{p.youtubeUrl&&<a href={p.youtubeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary"><Youtube className="size-3"/>YouTube<ExternalLink className="size-3"/></a>}{p.instagramVideoUrl&&<a href={p.instagramVideoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary"><Instagram className="size-3"/>Instagram<ExternalLink className="size-3"/></a>}</div></div><div className="flex items-start gap-1"><Button variant="outline" size="icon" onClick={()=>carregar(p)}><Pencil className="size-4"/></Button><Button variant="outline" size="icon" title="Duplicar produto" onClick={()=>duplicar(p)}><Copy className="size-4"/></Button><Button variant="ghost" size="icon" className="text-destructive" onClick={()=>{removeProduct(p.id);toast.success("Produto excluído.")}}><Trash2 className="size-4"/></Button></div></div>)}</div>
    </section>}
  </div></div>;
}

function Field({label,children}:{label:string;children:React.ReactNode}){return <div className="space-y-1"><Label className="text-xs">{label}</Label>{children}</div>;}
