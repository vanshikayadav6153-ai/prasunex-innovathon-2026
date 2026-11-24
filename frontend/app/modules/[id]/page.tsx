import Link from "next/link";
import { notFound } from "next/navigation";
import { modules, portalNames } from "@/data/modules";
export function generateStaticParams(){return modules.map(({id})=>({id}))}
export default function Module({params}:{params:{id:string}}){const item=modules.find(m=>m.id===params.id);if(!item)notFound();
return <main className="nx"><div className="nx-wrap"><Link href="/modules">&lt;- Module catalog</Link><section className="nx-section"><small>{portalNames[item.role]} - DEMO</small><h1>{item.name}</h1><p>{item.action}</p><div className="nx-grid">{item.items.map((v,i)=><article className="nx-card" key={v}><small>Example {i+1}</small><h2>{v}</h2></article>)}</div><details className="nx-card"><summary>Review this example</summary><p>{item.note}</p></details><Link href={'/preview/'+item.role}>Explore {portalNames[item.role]} -&gt;</Link></section></div></main>}
