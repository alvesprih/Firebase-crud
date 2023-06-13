const express = require("express")
const app = express()
const handlebars = require("express-handlebars").engine
const bodyParser = require("body-parser")
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app')
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore')

const serviceAccount = require('./webfatec-90c26-firebase-adminsdk-dlcu1-4dc925a4b0.json')


initializeApp({
  credential: cert(serviceAccount)
})

const db = getFirestore()

app.engine("handlebars", handlebars({defaultLayout: "main"}))
app.set("view engine", "handlebars")

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.get("/", function(req, res){
    res.render("primeira_pagina")
})

app.get("/consulta", function(req, res){
    const arr = []
    let obj = {}

    db.collection('listaTarefas').get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                obj = {
                    id: doc.id,
                    dataValues: doc.data()
                }
                arr.push(obj)
            });
            console.log(arr);
            res.render("consulta", {
                arr: arr
            })
    }).catch((error) => {
        console.error('Erro ao ler documentos: ', error);
    });
    
    
})

app.get("/editar/:id", (req, res) => {
    const {id} = req.params
    const arr = []
    let obj = {}

    db.collection('listaTarefas').get(id)
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                obj = {
                    id: doc.id,
                    dataValues: doc.data()
                }
                arr.push(obj)
            });
            res.render("editar", {
                data: arr
            })
    }).catch((error) => {
        console.error('Erro ao ler documentos: ', error);
    });
    
    
})

app.post("/atualizar/:id", function(req, res){
    const {id} = req.params
    console.log(id);
    db.collection('listaTarefas').doc(id).update({
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
    })
    .then(() => {
        console.log('Documento atualizado com sucesso!');
        res.render("/consulta")
    })
      .catch((error) => {
        console.error('Erro ao atualizar documento: ', error);
    });
})

app.get("/excluir/:id", function(req, res){
    const {id} = req.params

    db.collection('listaTarefas').doc(id).delete()
        .then(() => {
            console.log('Documento excluído com sucesso!');
            res.render("/consulta")
        })
})

app.post("/cadastrar", function(req, res){
    db.collection('listaTarefas').add({
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
    }).then(function(){
        console.log('Added document');
        res.send("Cadastrado no Firebase")
    })
})

app.listen(8081, function(){
    console.log("Servidor ativo! http://localhost:" + 8081)
})