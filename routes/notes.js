const express = require('express');
const Notes = require('../models/Notes');
const router =  express.Router();
const { body, validationResult } = require('express-validator');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const jwt_SECRET = "precaution is btter than the cure";
const fetchUser = require('../middleware/fetchUser')


// Route 1: get the all notes from database GET: "/api/notes/fetchallnotes" . login required 
router.get('/fetchallnotes',fetchUser,async (req,res)=>{
    try {
        const allnotes  = await Notes.find({user:req.user.id});
        res.json(allnotes);
    } catch (error) {
        console.error(error.message);
        return res.status(500).send({error:"Some error occurred"});
    }
});

// Route 2: add new notes  POST: "/api/notes/addnote" . login required 
router.post('/addnote',fetchUser,
[body('title',"please enter valid title").isLength({ min: 3 }),
body('description',"description must be contain atleast 5 char").isLength({ min:5})],
async (req,res)=>{
    // if any error send bad response 
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });      
    }
    try {
        const {title,description,tag}=req.body;
        const note = new Notes({
            title,description,tag,user:req.user.id
        }) 
        const savedNote = await note.save();
        res.json(savedNote);       
    } catch (error) {
        console.error(error.message);
        return res.status(500).send({error:"Some error occurred"});
    }
});


// Route 3: Update an existing notes  PUT: "/api/notes/updatenotes" . login required 
router.put('/updatenotes/:id',fetchUser,
async (req,res)=>{
    try {
        const {title,description,tag} = req.body;
        const newnote={};
        if(title){newnote.title=title}
        if(description){newnote.description=description}
        if(tag){newnote.tag=tag}
        let note = await Notes.findById(req.params.id);
        if(!note){return res.status(404).send("Not found")}
        if(note.user.toString() !== req.user.id){return res.status(401).send("Not allowed")}
        note = await Notes.findByIdAndUpdate(req.params.id,{$set:newnote},{new:true});
        res.json({note});       
    } catch (error) {
        console.error(error.message);
        return res.status(500).send({error:"Some error occurred"});
    }
});
// Route 4: Delete an existing notes  DELETE: "/api/notes/deletenote" . login required 
router.delete('/deletenote/:id',fetchUser,
async (req,res)=>{
    try {
        let note = await Notes.findById(req.params.id);
        if(!note){return res.status(404).send("Not found")}
        if(note.user.toString() !== req.user.id){return res.status(401).send("Not allowed")}
        note = await Notes.findByIdAndDelete(req.params.id);
        res.json({"Seccess":"Note has seccessfully deleted",note});       
    } catch (error) {
        console.error(error.message);
        return res.status(500).send({error:"Some error occurred"});
    }
});

module.exports =router;

