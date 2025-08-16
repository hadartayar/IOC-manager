import express from 'express';
import { db } from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authRequired } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router=express.Router();
router.post('/login',(req,res)=>{
  const {username,password}=req.body||{};
  if(!username||!password) return res.status(400).json({error:'Username and password required'});
  db.get(`SELECT * FROM users WHERE username=?`,[username],(err,user)=>{
    if(err) return res.status(500).json({error:'DB error'});
    if(!user) return res.status(401).json({error:'Invalid credentials'});
    if(!bcrypt.compareSync(password,user.password_hash)) return res.status(401).json({error:'Invalid credentials'});
    const token=jwt.sign({id:user.id,username:user.username,role:user.role}, process.env.JWT_SECRET || 'dev_super_secret_change_me', {expiresIn:'8h'});
    res.json({token,user:{id:user.id,username:user.username,role:user.role}});
  });
});
router.post('/register', authRequired, requireRole('admin'), (req,res)=>{
  const {username,password,role}=req.body||{};
  if(!username||!password||!role) return res.status(400).json({error:'username, password, role required'});
  if(!['admin','analyst','viewer'].includes(role)) return res.status(400).json({error:'invalid role'});
  const hash=bcrypt.hashSync(password,10);
  db.run(`INSERT INTO users(username,password_hash,role) VALUES (?,?,?)`,[username,hash,role], function(err){
    if(err) return res.status(400).json({error:'User exists or bad input'});
    res.status(201).json({id:this.lastID,username,role});
  });
});
export default router;
