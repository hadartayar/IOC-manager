const HEX_RE=/^[0-9a-fA-F]+$/;
const DOMAIN_RE=/^(?=.{1,253}$)(?!-)[A-Za-z0-9-]{1,63}(?<!-)\.(?:[A-Za-z]{2,63}|[A-Za-z0-9-]{2,63}\.[A-Za-z]{2,63})$/;
const IPV4_RE=/^(25[0-5]|2[0-4]\d|[01]?\d\d?)(\.(25[0-5]|2[0-4]\d|[01]?\d\d?)){3}$/;
const IPV6_RE=/^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::1)$/;

export function detectType(value){
  const v=value.trim();
  if(IPV4_RE.test(v)||IPV6_RE.test(v)) return 'ip';
  if(DOMAIN_RE.test(v.toLowerCase())) return 'domain';
  if(HEX_RE.test(v)&&v.length===32) return 'md5';
  if(HEX_RE.test(v)&&v.length===40) return 'sha1';
  if(HEX_RE.test(v)&&v.length===64) return 'sha256';
  return null;
}
export function normalize(value,type){
  const v=value.trim();
  if(['md5','sha1','sha256','domain'].includes(type)) return v.toLowerCase();
  return v;
}
export function validateIndicator({value,type}){
  const t=type||detectType(value);
  if(!t) return {ok:false,error:'Could not detect indicator type or unsupported format.'};
  const norm=normalize(value,t);
  if(t==='md5'&&norm.length!==32) return {ok:false,error:'MD5 must be 32 hex chars.'};
  if(t==='sha1'&&norm.length!==40) return {ok:false,error:'SHA1 must be 40 hex chars.'};
  if(t==='sha256'&&norm.length!==64) return {ok:false,error:'SHA256 must be 64 hex chars.'};
  return {ok:true,type:t,normalized:norm};
}
