"use client";
import {useState} from "react";
type RecordItem={title:string,context:string,action:string};
const faculty:RecordItem[]=[
{title:"Course & section rosters",context:"CS201 · Section B · 68 enrolled. Section A has 64 enrolled.",action:"Confirm roster review"},
{title:"Import review",context:"Sheet B · Row 2 lists 6 + 7 as 14. Check the source and correct the total to 13.",action:"Flag total for correction"},
{title:"Exam participation",context:"CS201 and OS301 share a cohort on Tuesday morning. Review the proposed Wednesday slot.",action:"Recommend alternate slot"},
{title:"Approval history",context:"Grade boundary revision 2 is pending a second faculty review.",action:"Record review"}];
const admin:RecordItem[]=[
{title:"Ticket inbox & SLA",context:"Lab 3 cooling · 2 similar reports · 4 hours remaining. Check the room and asset tag.",action:"Assign inspection"},
{title:"Scheduling oversight",context:"A room conflict affects CS201 and OS301. A second room is available.",action:"Request revised schedule"},
{title:"Restricted committee",context:"Only synthetic case counts are available. Confidential case content requires independent access review.",action:"Acknowledge access boundary"},
{title:"Event approval",context:"Robotics workshop · Lab B · capacity 24. Source and venue have been checked in this example.",action:"Approve example draft"},
{title:"Campus roles & settings",context:"North campus · faculty roster update pending review. Real permissions require an authorized administrator.",action:"Record demo review"}];
export function ReviewWorkspace({role}:{role:"faculty"|"admin"}){
const items=role==="faculty"?faculty:admin;
const [filter,setFilter]=useState("all");const [reviewed,setReviewed]=useState<string[]>([]);const [notice,setNotice]=useState("");
const visible=items.filter(i=>filter==="all"||(filter==="reviewed")===reviewed.includes(i.title));
return <section className="nx-section"><small>DEMO · changes last for this visit</small><h2>{role==="faculty"?"Studio review queue":"Operations review queue"}</h2><label>Show <select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All items</option><option value="pending">Pending</option><option value="reviewed">Reviewed</option></select></label><p role="status">{notice}</p><div className="nx-grid">{visible.map(i=><article key={i.title} className="nx-card"><small>{reviewed.includes(i.title)?"Reviewed":"Pending"}</small><h3>{i.title}</h3><p>{i.context}</p><button className="nx-button" disabled={reviewed.includes(i.title)} onClick={()=>{setReviewed(prev=>[...new Set([...prev,i.title])]);setNotice(i.title+" reviewed in this demo.")}}>{i.action}</button></article>)}</div>{!visible.length&&<p>No items match this filter.</p>}</section>
}
