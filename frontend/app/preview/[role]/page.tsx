import Link from "next/link";
import {notFound} from "next/navigation";
import {ModuleLibrary} from "@/components/ModuleLibrary";
import {portalNames, type Persona} from "@/data/modules";
const samples={student:["Learning snapshot","72% overall mastery","Next assessment","Operating systems lab"],faculty:["Section B","68 enrolled","Pending review","3 flagged questions"],admin:["Facilities inbox","6 open work orders","Next inspection","Library cooling system"]};
export default function Preview({params}:{params:{role:string}}){if(!Object.prototype.hasOwnProperty.call(portalNames,params.role))notFound();const role=params.role as Persona;const [a,b,c,d]=samples[role];return <main className="nx"><div className="nx-wrap"><Link href="/">&lt;- Campus Nexus</Link><section className="nx-section"><small>DEMO - fictitious records</small><h1>{portalNames[role]}</h1><div className="nx-grid"><article className="nx-card"><small>{a}</small><h2>{b}</h2></article><article className="nx-card"><small>{c}</small><h2>{d}</h2></article></div><Link href={'/login?demo='+role}>Open dashboard with demo login -&gt;</Link></section><ModuleLibrary role={role}/></div></main>}
