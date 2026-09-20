import { createFileRoute } from "@tanstack/react-router";

const API = "https://api.github.com";
type ServerConfig = { repo: string; token: string; adminKey: string };

function getServerConfig(): ServerConfig {
  const repo = process.env.GITHUB_REPO || "siteshoppingpontoalto/ponto-alto-shopper";
  const token = process.env.GITHUB_TOKEN || "";
  const adminKey = process.env.ADMIN_KEYWORD || "pontinho";
  if (!token) throw new Error("GITHUB_TOKEN não configurado no servidor do Lovable.");
  return { repo, token, adminKey };
}

function headers(token: string) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };
}

function json(status:number, body:unknown){return Response.json(body,{status});}

async function github(path:string, token:string, repo:string, init:RequestInit={}) {
  const r=await fetch(`${API}/repos/${repo}/contents/${path}`,{...init,headers:{...headers(token),...(init.headers||{})}});
  const body=await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(body?.message || `GitHub HTTP ${r.status}`);
  return body as any;
}
function b64Text(value:string){const bytes=new TextEncoder().encode(value);let binary="";for(let i=0;i<bytes.length;i+=0x8000)binary+=String.fromCharCode(...bytes.subarray(i,i+0x8000));return btoa(binary);}
function b64Bytes(value:string){const raw=value.replace(/^data:[^;]+;base64,/,"");return raw;}
async function readJson(path:string, token:string, repo:string){
  const r=await github(path,token,repo,{method:"GET"});
  const decoded=atob(String(r.content||"").replace(/\n/g,""));
  const bytes=Uint8Array.from(decoded,c=>c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}
async function writeFile(path:string,contentBase64:string,message:string, token:string, repo:string){
  let sha:string|undefined;
  try{sha=(await github(path,token,repo,{method:"GET"})).sha;}catch{}
  return github(path,token,repo,{method:"PUT",body:JSON.stringify({message,content:contentBase64,sha,branch:"main"})});
}

export const Route = createFileRoute("/api/admin/catalog")({
  server:{
    handlers:{
      POST:async({request})=>{
        try{
          const config=getServerConfig();
          const supplied=request.headers.get("x-admin-key")||"";
          if(supplied!==config.adminKey)return json(401,{error:"Não autorizado."});
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
            await writeFile(path,b64Bytes(body.imageBase64),`Adicionar imagem de produto ${safe}`,config.token,config.repo);
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
