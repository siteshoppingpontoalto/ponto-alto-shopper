import { createFileRoute } from "@tanstack/react-router";

const REPO = process.env.GITHUB_REPO || "siteshoppingpontoalto/ponto-alto-shopper";
const TOKEN = process.env.GITHUB_TOKEN;
const ADMIN_KEY = process.env.ADMIN_KEYWORD || "pontinho";
const API = "https://api.github.com";
const headers = () => ({
  Accept: "application/vnd.github+json",
  Authorization: `Bearer ${TOKEN}`,
  "X-GitHub-Api-Version": "2026-03-10",
  "Content-Type": "application/json",
});

function json(status:number, body:unknown){return Response.json(body,{status});}

async function github(path:string, init:RequestInit={}) {
  if(!TOKEN) throw new Error("GITHUB_TOKEN não configurado no servidor.");
  const r=await fetch(`${API}/repos/${REPO}/contents/${path}`,{...init,headers:{...headers(),...(init.headers||{})}});
  const body=await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(body?.message || `GitHub HTTP ${r.status}`);
  return body as any;
}
function b64Text(value:string){const bytes=new TextEncoder().encode(value);let binary="";for(let i=0;i<bytes.length;i+=0x8000)binary+=String.fromCharCode(...bytes.subarray(i,i+0x8000));return btoa(binary);}
function b64Bytes(value:string){const raw=value.replace(/^data:[^;]+;base64,/,"");return raw;}
async function readJson(path:string){
  const r=await github(path,{method:"GET"});
  const decoded=atob(String(r.content||"").replace(/\n/g,""));
  const bytes=Uint8Array.from(decoded,c=>c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}
async function writeFile(path:string,contentBase64:string,message:string){
  let sha:string|undefined;
  try{sha=(await github(path,{method:"GET"})).sha;}catch{}
  return github(path,{method:"PUT",body:JSON.stringify({message,content:contentBase64,sha,branch:"main"})});
}

export const Route = createFileRoute("/api/admin/catalog")({
  server:{
    handlers:{
      POST:async({request})=>{
        try{
          const supplied=request.headers.get("x-admin-key")||"";
          if(supplied!==ADMIN_KEY)return json(401,{error:"Não autorizado."});
          const body=await request.json() as {
            action:"save-products"|"save-merchants"|"upload-image";
            data?:unknown;
            imageBase64?:string;
            filename?:string;
          };
          if(body.action==="upload-image"){
            if(!body.imageBase64)return json(400,{error:"Imagem ausente."});
            const safe=(body.filename||"imagem.jpg").toLowerCase().replace(/[^a-z0-9._-]/g,"-");
            const path=`public/products/${Date.now()}-${safe}`;
            await writeFile(path,b64Bytes(body.imageBase64),`Adicionar imagem de produto ${safe}`);
            return json(200,{path:`/products/${path.split("/").pop()}`});
          }
          if(body.action==="save-products"){
            if(!Array.isArray(body.data))return json(400,{error:"Produtos inválidos."});
            const result=await writeFile("public/data/products.json",b64Text(JSON.stringify(body.data,null,2)+"\n"),"Atualizar catálogo de produtos");
            return json(200,{ok:true,commit:result.commit?.sha});
          }
          if(body.action==="save-merchants"){
            if(!Array.isArray(body.data))return json(400,{error:"Lojistas inválidos."});
            const result=await writeFile("public/data/merchants.json",b64Text(JSON.stringify(body.data,null,2)+"\n"),"Atualizar catálogo de lojistas");
            return json(200,{ok:true,commit:result.commit?.sha});
          }
          return json(400,{error:"Ação inválida."});
        }catch(error){
          console.error(error);
          return json(500,{error:error instanceof Error?error.message:"Falha ao gravar no GitHub."});
        }
      }
    }
  }
});
