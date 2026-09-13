(function(root){
  'use strict';
  const valid = values => Array.isArray(values) && values.length === 12 && Array.from(values).every(v => Number.isInteger(v) && v >= 1 && v <= 5);
  function summarize(values){
    if(!valid(values)) return null;
    const capability = values.filter((_,i)=>i!==10);
    return {capabilityMean:capability.reduce((a,b)=>a+b,0)/11, attitude:values[10], count:12};
  }
  function compare(before,after){
    const a=summarize(before), b=summarize(after);
    if(!a||!b) return null;
    return {before:a,after:b,change:b.capabilityMean-a.capabilityMean,itemChanges:after.map((v,i)=>v-before[i])};
  }
  function safeDiscussionUrl(value){
    try{const u=new URL(value);return u.protocol==='https:'&&u.hostname==='github.com'&&/^\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/discussions\/?$/.test(u.pathname)&&!u.search&&!u.hash?u.href:null;}catch{return null;}
  }
  function projectIdFromSearch(search){
    const value=new URLSearchParams(search||'').get('project');
    return typeof value==='string'&&/^E[1-6]$/.test(value)?value:null;
  }
  const api={valid,summarize,compare,safeDiscussionUrl,projectIdFromSearch};
  root.EduCore=api;
  if(typeof module!=='undefined'&&module.exports) module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
