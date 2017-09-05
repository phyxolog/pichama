var User = require('models/mongo/User');
var _ = require('lodash');
var crypto = require('crypto');
var fileUpload = require('express-fileupload');
var mime = require('mime-types');
var mkdirp = require('mkdirp');
var mongoose = require('mongoose');

class MainController {
  static get(req, res) {
    var token = req.params.token;

    User.findOne({token}, (err, user) => {
      if (_.isNull(user)) {
        res.status(404).json({status: 'User not found'});
      } else {
        user.password = '[filtered]';
        res.status(200).send(user);
      }
    });
  }

  static login(req, res) {
    var login = req.body.login;
    var password = req.body.password;

    User.findOne({login}, (err, user) => {
      if (!_.isNull(user)) {
        if (!_.isNull(user.token)) {
          res.status(200).json({token: user.token});
        } else {
          user.token = crypto.randomBytes(24).toString('hex');
          user.save((err) => res.status(200).json({token: user.token}));
        }
      } else {
        res.status(404).json({status: 'User not found'});
      }
    });
  }

  static logout(req, res) {
    var token = req.body.token;

    User.findOne({token}, (err, user) => {
      if (_.isNull(user)) {
        res.status(404).json({status: 'Not auth'});
      } else {
        user.token = '';
        user.save();
        res.status(200).json({status: 'success'});
      }
    });
  }

  static addProject(req, res) {
    var projectName = req.body.name, token = req.body.token;

    User.findOne({token}, (err, user) => {
      if (_.isNull(user)) {
        res.status(404).json({status: 'User not found'});
      } else {
        user.projects.push({title: projectName});
        user.save();
        res.status(200).json({status: 'success'});
      }
    });
  }

  static deleteProject(req, res) {
    var id = req.body.id, token = req.body.token;

    User.findOne({token}, (err, user) => {
      if (_.isNull(user)) {
        res.status(404).json({status: 'User not found'});
      } else {
        user.projects = user.projects.filter((project) => !project._id.equals(id));
        user.save();
        res.status(200).json({status: 'success'});
      }
    });
  }

  static mvFile(file, dir, path) {
    mkdirp(dir, () => {
      file.mv(path, () => {});
    });
  }

  static uploadLayout(req, res) {
    var files = req.files;
    var { token, id, version } = req.params;
    var error = false;

    if (!files) {
      res.status(500).json({status: 'No files were uploaded'});
    } else {
      Object.keys(files).map((objectKey, index) => {
        var file = files[objectKey];
        var sha256 = crypto.createHash('sha256').update(file.data).digest('hex');
        var ext = mime.extension(file.mimetype);
        var path = `public/layouts/${id}/${version}`;
        MainController.mvFile(file, path, `${path}/${sha256}.${ext}`);

        User.findOne({token}, (err, user) => {
          if (_.isNull(user)) {
            res.status(404).json({status: 'User not found'});
            error = true;
          } else {
            User.findOneAndUpdate(
              { "_id": user._id, "projects._id": id },
              {$push: {
                [`projects.$.path.${version}`]: {path: `${sha256}.${ext}`}
              }},
              (err, doc) => {
                if (err) {
                  if (!error) {
                    // res.status(500).json({status: 'error'});
                    error = true;
                  }
                }
              }
            );
          }
        });
      });

      if (!error) {
        res.status(200).json({status: 'success'});
      }
    }
  }

  static addLink(req, res) {
    var { values, id, lid, token, version, path } = req.body;

    User.findOne({token}, (err, user) => {
      if (_.isNull(user)) {
        res.status(404).json({status: 'User not found'});
      } else {
        var dbpath = user.projects.id(id).path;
        var layoutIdx = -1;

        dbpath[version].forEach((layout, i) => {
          if (layout.path === path) {
            layoutIdx = i;
            return;
          }
        });

        dbpath[version][layoutIdx].links.push({targetId: mongoose.Types.ObjectId(lid), coord: values});

        User.findOneAndUpdate(
          { "_id": user._id, "projects._id": id },
          {$set: {
            'projects.$.path': dbpath
          }},
          (err, doc) => {
            if (err) {
              res.status(500).json({status: 'error'});
            } else {
              res.status(200).json({status: 'success'});
            }
          }
        );
      }
    });
  }

  static addComment(req, res) {
    var { values, id, token, version, path, text } = req.body;

    User.findOne({token}, (err, user) => {
      if (_.isNull(user)) {
        res.status(404).json({status: 'User not found'});
      } else {
        var dbpath = user.projects.id(id).path;
        var layoutIdx = -1;

        dbpath[version].forEach((layout, i) => {
          if (layout.path === path) {
            layoutIdx = i;
            return;
          }
        });

        dbpath[version][layoutIdx].comments.push({body: text, coord: values});

        User.findOneAndUpdate(
          { "_id": user._id, "projects._id": id },
          {$set: {
            'projects.$.path': dbpath
          }},
          (err, doc) => {
            if (err) {
              res.status(500).json({status: 'error'});
            } else {
              res.status(200).json({status: 'success'});
            }
          }
        );
      }
    });
  }

  static addImage(req, res) {
    var { id, token, version, path, width, height, x, y, imgWidth, imgHeight } = req.body;
    var { image } = req.files;
    var coord = {width, height, x, y, imgWidth, imgHeight};

    var sha256 = crypto.createHash('sha256').update(image.data).digest('hex');
    var ext = mime.extension(image.mimetype);
    var Path = `public/layouts/${id}/${version}/images`;

    mkdirp(Path, (err) => {
      image.mv(`${Path}/${sha256}.${ext}`, () => {});
    });

    User.findOne({token}, (err, user) => {
      if (_.isNull(user)) {
        res.status(404).json({status: 'User not found'});
      } else {
        var dbpath = user.projects.id(id).path;
        var layoutIdx = -1;

        dbpath[version].forEach((layout, i) => {
          if (layout.path === path) {
            layoutIdx = i;
            return;
          }
        });

        dbpath[version][layoutIdx].images.push({image: `${Path}/${sha256}.${ext}`, coord: coord});

        User.findOneAndUpdate(
          {'_id': user._id, 'projects._id': id },
          {$set: {
            'projects.$.path': dbpath
          }},
          (err, doc) => {
            if (err) {
              res.status(500).json({status: 'error'});
            } else {
              res.status(200).json({status: 'success'});
            }
          }
        );
      }
    });
  }

  static addUser(req, res) {
    var { login, password } = req.body;
    var user = new User({login, password, isAdmin: false});

    user.save((err) => {
      if (err) {
        res.status(500).json({status: 'error'});
      } else {
        res.status(200).json({status: 'success'});
      }
    });
  }

  static getProject(req, res) {
    var { projectId } = req.query;

    User.findOne({'projects._id': projectId}, (err, doc) => {
      if (err) {
        res.status(500).json({status: 'error'});
      } else {
        var projects = doc.projects;
        projects = projects.filter((project) => project._id.equals(projectId))[0];
        res.status(200).json(projects);
      }
    });
  }

  static deletePath(req, res) {
    var { projectId, version, filename } = req.body;

    User.findOne({'projects._id': projectId}, (err, doc) => {
      if (err) {
        res.status(500).json({status: 'error'});
      } else {
        doc.projects = doc.projects.map((project) => {
          if (project._id.equals(projectId)) {
            project.path[version] = project.path[version].filter((path) => path.path !== filename);
            return project;
          } else {
            return project;
          }
        })

        User.findOneAndUpdate({'projects._id': projectId},
          {$set: {'projects': doc.projects}}, (err, user) => {
          if (err) {
            res.status(500).json({status: 'error'});
          } else {
            res.status(200).json({status: 'success'});
          }
        });
      }
    });
  }

  static addUserComment(req, res) {
    var { values, id, token, version, path, text } = req.body;

    User.findOneAndUpdate({token}, {$push: {'comments': {body: text, coord: values, targetId: id}}}, (err, user) => {
      if (err) {
        res.status(500).json({status: 'error'});
      } else {
        res.status(200).json({status: 'success'});
      }
    });
  }

  static getComments(req, res) {
    var { id } = req.query;

    User.find({comments: {$exists: true, $not: {$size: 0}}}, 'comments', (err, userComments) => {
      var commentsFull = userComments.map((comment) => comment.comments)[0]
      var comments = commentsFull !== undefined ? commentsFull.filter((comment) => comment.targetId.equals(id)) : [];

      if (comments.length === 0) {
        res.status(404).json({status: 'empty'});
      } else {
        res.status(200).json(comments);
      }
    });
  }

  static bindProject(req, res) {
    var { userId, projectId } = req.body;

    User.findOneAndUpdate({'_id': userId}, {$push: {'userProjects': {targetId: projectId}}}, (err, user) => {
      if (err) {
        res.status(500).json({status: 'error'});
      } else {
        res.status(200).json({status: 'success'});
      }
    })
  }

  static getProjects(req, res) {
    var { list } = req.query;
    var listSplit = list.split(',').map((id) => mongoose.Types.ObjectId(id));

    User.find({'projects._id': { $in: listSplit}}, 'projects', (err, projects) => {
      res.send(projects);
    });
  }

  static userList(req, res) {
    User.find({}, 'login', (err, users) => {
      res.send(users);
    });
  }

  static userDrop(req, res) {
    User.find().remove().exec(() => res.json({status: 'success'}));
  }
}

module.exports = MainController;
