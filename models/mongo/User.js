var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Coordinaties = new Schema({
  width: Number,
  height: Number,
  x: Number,
  y: Number,
  imgWidth: Number,
  imgHeight: Number
});

var LinkObject = new Schema({
  target: String,
  targetId: Schema.Types.ObjectId,
  coord: Coordinaties
});

var CommentObject = new Schema({
  body: String,
  coord: Coordinaties
});

var ImageObject = new Schema({
  image: String,
  coord: Coordinaties
});

var Image = new Schema({
  path: String,
  links: [LinkObject],
  comments: [CommentObject],
  images: [ImageObject]
});

var Path = new Schema({
  desktopplus: [Image],
  desktop: [Image],
  tablet: [Image],
  mobile: [Image]
});

var Project = new Schema({
  title: String,
  path: Path
});

var UserComment = new Schema({
  body: String,
  targetId: Schema.Types.ObjectId,
  coord: Coordinaties
});

var UserProject = new Schema({
  targetId: Schema.Types.ObjectId
});

var User = new Schema({
  token: {type: String, default: null},
  login: {type: String, default: null},
  password: {type: String, default: null},
  isAdmin: {type: Boolean, default: false},
  projects: [Project],
  userProjects: [UserProject],
  comments: [UserComment]
});

module.exports = mongoose.model('User', User);
