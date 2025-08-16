import express from 'express';
import { db } from '../db.js';
import { authRequired } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router=express.Router();
router.get('/', authRequired, (req,res)=>{
  db.all(`SELECT * FROM tags ORDER BY name ASC`, [], (err,rows)=>{
    if(err) return res.status(500).json({error:'DB error'});
    res.json(rows);
  });
});
router.post('/', authRequired, requireRole('admin'), (req,res)=>{
  const { name } = req.body || {};
  if(!name) return res.status(400).json({error:'name required'});
  db.run(`INSERT INTO tags(name) VALUES (?)`, [name.trim()], function(err){
    if(err) return res.status(400).json({error:'Tag exists or bad input'});
    res.status(201).json({id:this.lastID, name});
  });
});
router.patch('/:id', authRequired, requireRole('admin'), (req,res)=>{
  const id=Number(req.params.id);
  const { name } = req.body || {};
  if(!name) return res.status(400).json({error:'name required'});
  db.run(`UPDATE tags SET name=? WHERE id=?`, [name.trim(), id], function(err){
    if(err) return res.status(400).json({error:'Bad input'});
    if(this.changes===0) return res.status(404).json({error:'Not found'});
    res.json({id,name});
  });
});
router.delete('/:id', authRequired, requireRole('admin'), (req,res)=>{
  const id=Number(req.params.id);
  db.run(`DELETE FROM tags WHERE id=?`, [id], function(err){
    if(err) return res.status(500).json({error:'DB error'});
    if(this.changes===0) return res.status(404).json({error:'Not found'});
    res.status(204).send();
  });
});
export default router;
