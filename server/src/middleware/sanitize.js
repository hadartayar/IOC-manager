const SAFE_Q=/[^\w\.\-:@%]/g; export function sanitizeSearch(req,res,next){ if(req.query.q){ req.query.q=String(req.query.q).replace(SAFE_Q,' ').trim(); } next(); }
