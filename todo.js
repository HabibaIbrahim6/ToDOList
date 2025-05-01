const express = require('express');
const mysql = require('mysql');
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());
const sql = mysql.createPool(
    {
        host:'localhost',
        connectionLimit:10,
        user:'root',
        password:'',
        database:'todalist'
    }
);

app.get('/',(req,res)=>{
    sql.query('SELECT * FROM todos',(err,result)=>{
        if(err){
            console.log(err);
        }
        res.send(result);
    })
})
app.post('/add', (req, res) => {
    const { title } = req.body;
    if (!title || title.trim() === '') {
        return res.status(400).json({ error: 'Title is required' });
    }

    sql.query('INSERT INTO todos (title) values (?)', [title.trim()], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Task added', id: result.insertId });
    });
});

app.delete('/:id', (req, res) => {
    const ID = req.params.id;
    sql.query('DELETE FROM todos WHERE id = ?', [ID], (err, result) => {
        if (err) {
            console.log(err);
        }
        res.send(result);
    });
});
app.patch('/:id/status', (req, res) => {
    const id = req.params.id;
    
    sql.query(`
        UPDATE todos 
        SET status = CASE WHEN status = 1 THEN 0 ELSE 1 END 
        WHERE id = ?
    `, [id], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to update task status' });
        }
        
        sql.query('SELECT * FROM todos WHERE id = ?', [id], (err, task) => {
            if (err) return res.status(500).json({ error: 'Failed to fetch updated task' });
            res.json(task[0]);
        });
    });
});

app.listen(3002,(err)=>{
    if(err){
        console.log(err);
    }
    else {
        console.log('server is running');
    }
})


 


