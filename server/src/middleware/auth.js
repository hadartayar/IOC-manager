import jwt from 'jsonwebtoken';
export function authRequired(req,res,next){
  const auth=req.headers.authorization||'';
  const token=auth.startsWith('Bearer ')?auth.slice(7):null;
  if(!token) return res.status(401).json({error:'Missing token'});
  try{
    const payload=jwt.verify(token, process.env.JWT_SECRET || 'dev_super_secret_change_me');
    req.user={id:payload.id,username:payload.username,role:payload.role};
    next();
  }catch{
    return res.status(401).json({error:'Invalid token'});
  }
}
