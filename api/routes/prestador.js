/* API REST dos prestadores */
import express from 'express'
import { connectToDatabase } from '../utils/mongodb.js'
import { check, validationResult } from 'express-validator'

const router = express.Router()
const {db, ObjectId} = await connectToDatabase()
const nomeCollection = 'prestadores'

const validaPrestador = [
    check ('cnpj')
    .not().isEmpty().trim().withMessage('É obrigatório informar o CNPJ')
    .isNumeric().withMessage('O CNPJ só deve conter números')
    .isLength({min: 14, max: 14}).withMessage('O CNPJ deve conter 14 números'),
    check('razao_social')
    .not().isEmpty().trim().withMessage('É obrigatório informar a razãoo social')
    .isAlphanumeric('pt-BR', {ignore: '/.'})
    .withMessage('A razão social não deve ter caracteres especiais')
    .isLength({min: 5}).withMessage('A razão é muito curta. Mínimo 5')
    .isLength({max: 200}).withMessage('A razão é muito longa. Máximo 200'),
    check('cnae_fiscal')
    .isNumeric().withMessage('O código do CNAE deve ser um número'),
    check('nome_fantasia').optional({nullable: true})

    
]

/**
 * GET /api/prestadores
 * Lista todos os prestadores de serviço
*/ 
router.get('/', async (req,res)=> {
    try{
        db.collection(nomeCollection).find().sort({razao_social: 1}).toArray((err,docs) => {
            if(!err){
                res.status(200).json(docs)
            }
        })
    } catch (err){
        res.status(500).json({
            errors: [{
                value: `${err.message}`,
                msg: 'Erro ao obter a listagem dos prestadores',
                param: '/'
            }]
        })
    }
})

/**
 * DELETE /api/prestadores
 * Apaga o prestador de serviço pelo ID
*/ 

router.delete('/:id', async(req, res) => {
    await db.collection(nomeCollection)
    .deleteOne({"_id":{ $eq: ObjectId(req.params.id)}})
    .then(result => res.status(200).send(result))
    .catch(err => res.status(400).json(err))
})

/**
 * POST /api/prestadores
 * Insire um novo prestador de serviço
*/ 

router.post('/', validaPrestador, async(req, res) => {
    const errors = validaPrestador(req)
    if(!errors.isEmpty()){
        return res.status(400).json(({
            errors : errors.arrays()
        }))
    } else{
        await db.collection(nomeCollection)
        .insertOne(req.body)
        .then(result => res.status(200).send(result))
        .catch(err => res.status(400).json(err))
    }
})

/**
 * PUT /api/prestadores
 * Altera um prestador de serviço
*/ 

router.put('/', validaPrestador, async(req, res) => {
    let idDocumento = req.body.id //  armazenando o id do documento
    delete req.body._id // iremos remover o id do body
    const errors = validaPrestador(req)
    if (!errors.isEmpty()){
        return res.status(400).json(({
            errors: errors.array()
        }))
    } else {
        await db.collection(nomeCollection)
        .updateOne({'_id': {$eq:ObjectId(idDocumento)}},{ $set: req.body})
        .then(result => res.status(200).send(result))
        .catch(err => res.status(400).json(err))
    }
})

/**

 * GET /api/prestadores/id

 * Lista por id Dos prestadores de serviço

 */

 

router.get('/id/:id',async(req,res) => {

    try{

        db.collection(nomeColletion).find({'id':{$eq: ObjectId(req.params.id)}})

            .toArray((err, docs) => {

                if(err){

                    res.status(400).json(err) //bad request

                }

                else{

                    res.status(200).json(docs)

                }

            })

    }catch(err){

        res.status(500).json({"error": err.message})

    }

})

/**

 * GET /api/prestadores/razao/:razao

 * Lista por razao Dos prestadores de serviço

 */

 

router.get('/razao/:razao',async(req,res) => {

    try{

        db.collection(nomeColletion).find({'id':{$eq: ObjectId(req.params.id)}})
            .find({'razao_social': {$regex: req.params.razao, $options: "i"}})
            .toArray((err, docs) => {

                if(err){

                    res.status(400).json(err) //bad request

                }

                else{

                    res.status(200).json(docs)

                }

            })

    }catch(err){

        res.status(500).json({"error": err.message})

    }

})

export default router 