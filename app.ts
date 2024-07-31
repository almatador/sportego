import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import admin from './route/admin/adminAuth';
import adminperm from './route/admin/adminperm';

const app = express();
const port = 3000;
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());  
app.use("/adminAuth", admin)
app.use("/adminperm", adminperm)

app.get('/', async (req, res) => {
    res.status(200).send('Server Is Online');
});
app.listen(port, () => {
    console.log(`🚀 Server ready at: http://localhost:${port}`);
});

export default app;