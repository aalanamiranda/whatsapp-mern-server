//import database and backend framework
let express = require('express');
let mongoose = require('mongoose');
const dbMessages = require('./dbMessages');
const Pusher = require("pusher");
const cors = require('cors')

//app configuration
const app = express();
const port = process.env.PORT || 9000;

const pusher = new Pusher({
    appId: "1152086",
    key: "1693ef51485e86ca1e9f",
    secret: "3769ad1fb28dfb01cf2f",
    cluster: "us2",
    useTLS: true
  });

//instantiate json middleware
app.use(express.json());
// this is the same...
app.use(cors());
// ... as this
/* app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
}); */

//db configuration
const connectionURL = 'mongodb+srv://admin:H5iKjByeFbhi6jG8@cluster0.eduqs.mongodb.net/whatsappdb?retryWrites=true&w=majority'

mongoose.connect(connectionURL,{
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db  = mongoose.connection
db.once('open', ()=> {
    console.log('DB Connected!');

    const msgCollection = db.collection('messagecontents');
    const changeStream = msgCollection.watch();

    changeStream.on('change', (change)=> {
        console.log(change);

        if(change.operationType === 'insert') {
            const messageDetails = change.fullDocument;
            pusher.trigger('messages', 'inserted',
                {
                    name: messageDetails.user,
                    message: messageDetails.message,
                    timestamp: messageDetails.timestamp,
                    received: messageDetails.received,
                }
            );
        } else {
            console.log('Error triggering Pusher!');
        }

    });
});

//routes
app.get('/', (req, res)=>res.status(200).send('Hello World!'));

app.get('/messages/sync', (req, res) => {
    dbMessages.find((err, data) => {
        if(err) {
            res.status(500).send(err);
        } else {
            res.status(200).send(data);
        }
    })
})

app.post('/messages/new', (req, res) => {
    const dbMessage = req.body

    dbMessages.create(dbMessage, (err, data) => {
        if(err) {
            res.status(500).send(err)
        } else {
            res.status(201).send(`new message created: \n ${data}`)
        }
    })
})

app.listen(port, ()=>console.log(`Listening on localhost:${port}`));