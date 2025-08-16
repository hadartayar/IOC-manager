import express from 'express';
import { db } from '../db.js';
import { authRequired } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { sanitizeSearch } from '../middleware/sanitize.js';
import { validateIndicator } from '../utils/normalizer.js';
import { VERDICTS, TYPES } from '../utils/constants.js';

const router=express.Router();
router.get('/', authRequired, sanitizeSearch, (req,res)=>{
  const { q='', type, verdict, sourceId, tag, from, to, limit=50, offset=0, sort='created_at:desc' } = req.query;
  const where=[]; const params=[];
  if(q){ where.push('(value LIKE ? OR normalized_value LIKE ?)'); const like=`%${q}%`; params.push(like, like); }
  if(type && TYPES.includes(type)){ where.push('type=?'); params.push(type); }
  if(verdict && VERDICTS.includes(verdict)){ where.push('verdict=?'); params.push(verdict); }
  if(sourceId){ where.push('source_id=?'); params.push(Number(sourceId)); }
  if(tag){ where.push(`id IN (SELECT indicator_id FROM indicator_tags it JOIN tags t ON t.id=it.tag_id WHERE t.name = ?)`); params.push(tag); }
  if(from){ where.push('datetime(created_at) >= datetime(?)'); params.push(from); }
  if(to){ where.push('datetime(created_at) <= datetime(?)'); params.push(to); }
  const [col,dirRaw]=String(sort).split(':');
  const allowed=['created_at','updated_at','type','verdict','value'];
  const sortCol=allowed.includes(col)?col:'created_at';
  const sortDir=(String(dirRaw).toLowerCase()==='asc')?'ASC':'DESC';
  const sql=`SELECT id,value,normalized_value,type,verdict,source_id,created_at,updated_at FROM indicators` +
            (where.length?` WHERE ${where.join(' AND ')}`:'') + ` ORDER BY ${sortCol} ${sortDir} LIMIT ? OFFSET ?`;
  params.push(Number(limit), Number(offset));
  db.all(sql, params, (err, rows)=>{
    if(err) return res.status(500).json({error:'DB error'});
    res.json(rows);
  });
});
router.post('/', authRequired, requireRole('admin','analyst'), (req,res)=>{
  const { value, type, verdict, source_id, tags=[] } = req.body || {};
  if(!value || !source_id || !verdict) return res.status(400).json({error:'value, source_id, verdict required'});
  if(!VERDICTS.includes(verdict)) return res.status(400).json({error:'Invalid verdict'});
  const v=validateIndicator({value,type}); if(!v.ok) return res.status(400).json({error:v.error});
  const norm=v.normalized; const t=v.type;
  db.serialize(()=>{
    db.run(`INSERT INTO indicators(value,normalized_value,type,verdict,source_id) VALUES (?,?,?,?,?)`,
      [value, norm, t, verdict, Number(source_id)], function(err){
        if(err) return res.status(400).json({error:'Bad input or source not found'});
        const id=this.lastID;
        if(Array.isArray(tags)&&tags.length){
          const placeholders=tags.map(_=>'(?, (SELECT id FROM tags WHERE name=?))').join(',');
          const tagParams=tags.flatMap(name=>[id,name]);
          db.run(`INSERT OR IGNORE INTO indicator_tags(indicator_id, tag_id) VALUES ${placeholders}`, tagParams, (e2)=>{
            if(e2) console.error(e2);
            res.status(201).json({id, value, normalized_value:norm, type:t, verdict, source_id});
          });
        }else{
          res.status(201).json({id, value, normalized_value:norm, type:t, verdict, source_id});
        }
      });
  });
});
router.patch('/:id', authRequired, requireRole('admin','analyst'), (req,res)=>{
  const id=Number(req.params.id);
  const { value, type, verdict, source_id, tags } = req.body || {};
  const updates=[]; const params=[];
  if(value){
    const v=validateIndicator({value,type}); if(!v.ok) return res.status(400).json({error:v.error});
    updates.push('value=?','normalized_value=?','type=?'); params.push(value, v.normalized, v.type);
  }
  if(verdict){ if(!['malicious','suspicious','benign'].includes(verdict)) return res.status(400).json({error:'Invalid verdict'}); updates.push('verdict=?'); params.push(verdict); }
  if(source_id){ updates.push('source_id=?'); params.push(Number(source_id)); }
  if(!updates.length && !Array.isArray(tags)) return res.status(400).json({error:'No updates'});
  db.serialize(()=>{
    if(updates.length){
      db.run(`UPDATE indicators SET ${updates.join(', ')} WHERE id=?`, [...params, id], function(err){
        if(err) return res.status(400).json({error:'Bad input'});
      });
    }
    if(Array.isArray(tags)){
      db.run(`DELETE FROM indicator_tags WHERE indicator_id=?`, [id], (e1)=>{
        if(e1) console.error(e1);
        if(tags.length){
          const placeholders=tags.map(_=>'(?, (SELECT id FROM tags WHERE name=?))').join(',');
          const tagParams=tags.flatMap(name=>[id,name]);
          db.run(`INSERT OR IGNORE INTO indicator_tags(indicator_id, tag_id) VALUES ${placeholders}`, tagParams);
        }
      });
    }
    db.get(`SELECT * FROM indicators WHERE id=?`, [id], (e2,row)=>{
      if(e2||!row) return res.status(404).json({error:'Not found'});
      res.json(row);
    });
  });
});
router.delete('/:id', authRequired, requireRole('admin'), (req,res)=>{
  const id=Number(req.params.id);
  db.run(`DELETE FROM indicators WHERE id=?`, [id], function(err){
    if(err) return res.status(500).json({error:'DB error'});
    if(this.changes===0) return res.status(404).json({error:'Not found'});
    res.status(204).send();
  });
});
export default router;
