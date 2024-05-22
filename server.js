// server.js
import express from 'express';
import bodyParser from 'body-parser';
import { fileURLToPath } from "url";
import path, { resolve, dirname } from "path";
import multer from 'multer';
import  fs  from "fs";

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//define the list array
let users = [];

//set up the view page
app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/public/view/index.html`);
});

//get user list
app.get('/api/users', (req, res) => {
    res.json(users);
});

//get user list by id
app.put('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;

    users = users.map(user => user.id === parseInt(id) ? updatedUser : user);

    res.json({ success: true });
});

// Configure multer for file storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = "public/uploads/images"
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, 'public/uploads/images/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Append the file extension
    }
});
  
const upload = multer({ storage: storage });

//update user
app.post('/api/update-users', upload.single('image'), (req, res) => {
    const userDetails = req.body;
    const file = req.file;
    const  id  = req.body.id;
    const updatedUser = {id: parseInt(req.body.id), name: req.body.name, image: "", address: req.body.address, gender: req.body.edit_gender=='male'?'Male':'Female'};
    const oldusers = users.filter(user => user.id == parseInt(id));
    let oldPath = "";
    if(!file){
       updatedUser.image = oldusers[0].image; 
    } else {
        updatedUser.image = `uploads/images/${file.filename}`;
        oldPath = oldusers[0].image;
    }
    users = users.map(user => user.id === parseInt(id) ? updatedUser : user);
    if (oldPath) {
        fs.unlink(`public/${oldPath}`, function () {});
    }
    res.json({ success: true });
});

//add user
app.post('/api/add-users', upload.single('image'), (req, res) => {
    const userDetails = req.body;
    const file = req.file;
    const maxId = users.reduce((max, user) => (user.id > max ? user.id : max), 0);
    const addUser = {id: maxId==0?1:maxId+1, name: req.body.name, image: "", address: req.body.address, gender: req.body.gender=='male'?'Male':'Female'};
    if(!file){
        addUser.image = ""; 
    } else {
        addUser.image = `uploads/images/${file.filename}`;
    }
    users.push(addUser);
   
    res.json({ success: true });
});

//delete user
app.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;

    users = users.filter(user => user.id !== parseInt(id));

    res.json({ success: true });
});

//creating server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
