require('app-module-path').addPath(__dirname); // absolute path support

var express = require('express');
var router = express.Router();
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var fs = require('fs');
var db = require('utils/db');
var fileUpload = require('express-fileupload');

// use main middlewares
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(fileUpload());

app.use('/assets', express.static('public')); // serve static files
// in production use nginx for serve static files (comment in prod.)

// import controllers
var MainController = require('controllers/MainController');

// users
router.get('/user/:token', MainController.get);
router.get('/user.list', MainController.userList);
router.post('/user.add', MainController.addUser)
// router.get('/user.drop', MainController.userDrop);

// auth
router.post('/login', MainController.login);
router.post('/logout', MainController.logout);

// projects
router.get('/projects.get.by.ids', MainController.getProjects);
router.post('/project.bind', MainController.bindProject);
router.get('/project.comments', MainController.getComments)
router.get('/project.get', MainController.getProject);
router.post('/project.add', MainController.addProject);
router.post('/project.delete', MainController.deleteProject);
router.post('/project.upload.layout/:token/:id/:version', MainController.uploadLayout);
router.post('/link.add', MainController.addLink);
router.post('/comment.add', MainController.addComment);
router.post('/image.add', MainController.addImage);
router.post('/user.comment.add', MainController.addUserComment);

router.post('/path.delete', MainController.deletePath);

app.use('/api', router);

// main
app.get('/*', (req, res) => {
  res.status(200).sendFile('index.html', {root: 'views'});
})

app.listen(3882); // ideally listen socket (comment in production)

// listen socket (uncomment in production)
// var socket = '/tmp/artvision.socket';
// fs.unlink(socket, () => app.listen(socket, () => fs.chmodSync(socket, '777')));
