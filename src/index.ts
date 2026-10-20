import express from 'express';
import urlRoute from './routes/URL'


const app = express();
const port = 3000;

app.use(express.json());

app.use('/v1', urlRoute);


app.listen(port, ()=>{
    console.log('Server Started');
})