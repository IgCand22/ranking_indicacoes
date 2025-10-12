const conn = require('./db/conn')

const express = require('express')
const app = express();

app.use(
    express.urlencoded({
        extended: true
    })
)

app.use(express.json())

app.get('/', (req, res) => {
    res.send('<h1>Olá Mundo!</h1>')
})

app.get('/user', async (req, res) => {
    const [rows] = await conn.execute('SELECT * FROM user;')

    let { nome, nun_indicacao } = rows[0];
    res.send(`<div style="display: block;"><h2>${nome} - ${nun_indicacao}</h2></div>`)
    
})

app.get('/user/:idUser', async (req, res) => {
    const idUser = req.params.idUser;
    const [rows] = await conn.execute('SELECT * FROM user WHERE iduser = ?', [idUser]);
    if(rows.length <= 0){
       return res.status(409).redirect('/user/login');
    }
    res.status(200).send(`<h1>Olá ${rows[0].nome} você indicou ${rows[0].nun_indicacao} pessoas</h1>`)
})

app.post('/user/login', async (req, res) => {
    const { email } = req.body;

    const [rows] = await conn.execute('SELECT * FROM user WHERE email = ?', [email]);
    if(rows.length > 0){
        res.redirect(`/user/${rows[0].iduser}`)
    } else {
        return res.status(409).json({ message: 'Dados de usuário incorretos'});
    }
})

app.post('/user/cadastro', async (req, res) => {
    const { nome, email, indicado_email } = req.body;
    try{
        const [rows1] = await conn.execute('SELECT * FROM user WHERE email = ?', [email]);
        if(rows1.length > 0){
            return res.status(409).json({ message: 'E-mail já está sendo utilizado.' });
        }

        const [rows2] = await conn.execute('SELECT * FROM user WHERE email = ?', [indicado_email]);
        if(rows2.length > 0){
            await conn.execute('UPDATE user SET nun_indicacao = nun_indicacao + 1 WHERE email = ?', [indicado_email]);
        } else {
            return res.status(409).json({ message: 'E-mail de indicação errado.'})
        }

        await conn.execute('INSERT INTO user (nome, email, indicado_email) VALUES (?, ?, ?);', [nome, email, indicado_email])
    } catch (err) {
        if(err){
            return res.status(500).json({ message: "Erro no servidor"})
        }
    }
    res.redirect('/');
});

app.listen(3000, (err) => {
    if(err){
        console.log(err);
    }
    console.log('Servidor conectado')
})
