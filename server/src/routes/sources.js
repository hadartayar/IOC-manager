import express from 'express';
import { db } from '../db.js';
import { authRequired } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router=express.Router();
router.get('/', authRequired, (req,res)=>{
  db.all(`SELECT * FROM sources ORDER BY name ASC`, [], (err,rows)=>{
    if(err) return res.status(500).json({error:'DB error'});
    res.json(rows);
  });
});
router.post('/', authRequired, requireRole('admin'), (req,res)=>{
  const { name, reliability, url, description } = req.body || {};
  if(!name || reliability===undefined) return res.status(400).json({error:'name and reliability required'});
  const rel=Number(reliability); if(!(rel>=0 && rel<=100)) return res.status(400).json({error:'reliability 0-100'});
  db.run(`INSERT INTO sources(name,reliability,url,description) VALUES (?,?,?,?)`, [name.trim(), rel, url||null, description||null], function(err){
    if(err) return res.status(400).json({error:'Source exists or bad input'});
    res.status(201).json({id:this.lastID, name, reliability:rel, url, description});
  });
});
router.patch('/:id', authRequired, requireRole('admin'), (req,res)=>{
  const id=Number(req.params.id);
  const { name, reliability, url, description } = req.body || {};
  const updates=[]; const params=[];
  if(name){ updates.push('name=?'); params.push(name.trim()); }
  if(reliability!==undefined){ const rel=Number(reliability); if(!(rel>=0 && rel<=100)) return res.status(400).json({error:'reliability 0-100'}); updates.push('reliability=?'); params.push(rel); }
  if(url!==undefined){ updates.push('url=?'); params.push(url||null); }
  if(description!==undefined){ updates.push('description=?'); params.push(description||null); }
  if(!updates.length) return res.status(400).json({error:'No updates'});
  db.run(`UPDATE sources SET ${updates.join(', ')} WHERE id=?`, [...params, id], function(err){
    if(err) return res.status(400).json({error:'Bad input'});
    if(this.changes===0) return res.status(404).json({error:'Not found'});
    db.get(`SELECT * FROM sources WHERE id=?`, [id], (e2,row)=>res.json(row));
  });
});
router.delete('/:id', authRequired, requireRole('admin'), (req,res)=>{
  const id=Number(req.params.id);
  db.run(`DELETE FROM sources WHERE id=?`, [id], function(err){
    if(err) return res.status(500).json({error:'DB error'});
    if(this.changes===0) return res.status(404).json({error:'Not found'});
    res.status(204).send();
  });
});
export default router;
