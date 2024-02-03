var express = require('express');

var utils = require('./../inc/utils');
var account = require('./../inc/account');

var about = require('./../inc/about');
var blog = require('./../inc/blog');
var dash = require('./../inc/dash');
var design = require('./../inc/design');
var dev = require('./../inc/dev');
var edit = require('./../inc/edit');
const { response } = require('express');

var router = express.Router();


router.use(function(req, res, next){
  if(req.session.manager){
    req.email = req.session.manager.email;
    req.name = req.session.manager.name;
    req.avatar = req.session.manager.avatar;
  }
  else{
    req.email = "";
    req.name = "";
    req.avatar = "";    
  }
  if(['/login'].indexOf(req.url) === -1 && !req.session.manager){    
    res.redirect('/dashbrd/login');
  }
  else{    
    next();
  }
});


router.get('/', function(req, res, next) {
  res.render('dashbrd/index', { 
    title: 'Home',
    email: req.email,
    name: req.name,
    avatar: req.avatar
  });
});

router.get('/attempts/:page', function(req, res, next){
  req.params.page = (parseInt(req.params.page) > 0) ? parseInt(req.params.page) : 1;
  dash.getAttempts(req.params.page).then(results =>{
    res.send(results);
  });
});

router.get('/stats', function(req, res, next){
  dash.getStats().then(results =>{
    res.send(results);
  });
});

/**************************************************
 **************************************************
 *ABOUT ROUTES
 **************************************************
 **************************************************/
router.get('/about', function(req, res, next){
  about.retrieve().then(result =>{
    let data = {
      status: false
    };    
    if(result.status){
      data = result;      
    }
    res.render('dashbrd/about', {      
      title: 'Sobre',
      email: req.email,
      name: req.name,
      avatar: req.avatar,
      body: data
    });
  });
  
});

router.post('/about', function(req, res, next){
  about.save(req.fields, req.files).then(results=>{
    console.log(`A2Dlog - INSERT/UPDATE VIA POST ON ROUTE: : "${req.url}":  ${results}`);
    res.send(results);
  }).catch(rejection =>{
    console.log(`A2Dlog - ERROR ON INSERT/UPDATE VIA POST ON ROUTE: : "${req.url}":  ${rejection}`);
    res.send(rejection);
  });
});

/**************************************************
 **************************************************
 *BLOG ROUTES
 **************************************************
 **************************************************/

router.get('/blog', function(req, res, next){
  res.render('dashbrd/blog', {
      title: 'Blog',
      email: req.email,
      name: req.name,
      avatar: req.avatar
  });
});

router.get('/blog/:page', function(req, res, next){
  req.params.page = (parseInt(req.params.page) > 0) ? parseInt(req.params.page) : 1;
  blog.getData(req.params.page).then(data =>{
    res.send(data);
  })
});

router.post('/blog', function(req, res, next){  
  blog.save(req.fields, req.files).then(results =>{
    console.log(`A2Dlog - INSERT/UPDATE VIA POST ON ROUTE: "${req.url}": ${results}`);
    res.send(results);
  }).catch(rejection =>{
    console.log(`A2Dlog - ERROR ON INSERT/UPDATE VIA POST ON ROUTE: : "${req.url}":  ${rejection}`);
    res.send(rejection);
  });
});

router.delete('/blog/:id', function(req, res, next){
  blog.delete(req.params.id).then(response =>{
    console.log(`A2Dlog - Deleting post ${req.params.id} from BLOG.`);
    res.send(response);
  }).catch(rejection =>{
    console.log(`A2Dlog - Erro while deleting post ${req.params.id} from BLOG.`);
    res.send(rejection);
  });
});

router.get('/blogcategories', function(req, res, next){
  blog.getCategories(true, true).then(result =>{
    res.send(result);
  }).catch(error =>{
    res.send(error);
  });
});

/**************************************************
 **************************************************
 *DESIGN ROUTES
 **************************************************
 **************************************************/

router.get('/design', function(req, res, next){    
  res.render('dashbrd/design', {
    title: 'Design',
    email: req.email,
    name: req.name,
    avatar: req.avatar,
    designaction: null
  });
});

router.get('/design/logo/:page', function(req, res, next){ 
  req.params.page = (parseInt(req.params.page) > 0) ? parseInt(req.params.page) : 1;
  design.getData('logo', req.params.page).then(data => {    
    res.send(data);
  });
});

router.get('/design/print/:page', function(req, res, next){  
  design.getData('print', req.params.page).then(data => {    
    res.send(data);
  });
});

router.get('/design/art/:page', function(req, res, next){  
  design.getData('art', req.params.page).then(data => {    
    res.send(data);
  });
});

router.get('/design/vid/:page', function(req, res, next){  
  design.getData('vid', req.params.page).then(data => {    
    res.send(data);
  });
});

router.post('/design/logo', function(req, res, next){
  design.save(req.fields, req.files, 'logo').then(results=>{    
    console.log(`A2Dlog - UPLOAD/UPDATE VIA POST ON ROUTE: "${req.url}":  ${results.msg}`);
    res.send({okay: results.msg});
  }).catch(err =>{
    console.log(`A2Dlog - ERROR VIA POST ON ROUTE: "${req.url}": ${err.msg}`);    
    res.send({error: err.msg});
  });
});

router.post('/design/print', function(req, res, next){
  design.save(req.fields, req.files, 'print').then(results=>{
    console.log(`A2Dlog - UPLOAD/UPDATE VIA POST ON ROUTE: : "${req.url}":  ${results.msg}`);
    res.send({okay: results.msg});
  }).catch(err =>{
    console.log(`A2Dlog - ERROR VIA POST ON ROUTE: :  "${req.url}": ${err.msg}`);
    res.send({error: err.msg});
  });
});

router.post('/design/art', function(req, res, next){
  design.save(req.fields, req.files, 'art').then(results=>{
    console.log(`A2Dlog - UPLOAD/UPDATE VIA POST ON ROUTE: : "${req.url}":  ${results.msg}`);
    res.send({okay: results.msg});    
  }).catch(err =>{
    console.log(`A2Dlog - ERROR VIA POST ON ROUTE: :  "${req.url}": ${err.msg}`);
    res.send({error: err.msg});
  });
});

router.post('/design/vid', function(req, res, next){
  design.save(req.fields, req.files, 'vid').then(results=>{
    console.log(`A2Dlog - UPLOAD/UPDATE VIA POST ON ROUTE: : "${req.url}":  ${results.msg}`);
    res.send({okay: results.msg});
  }).catch(err =>{
    console.log(`A2Dlog - ERROR VIA POST ON ROUTE:  "${req.url}": ${err.msg}`);
    res.send({error: err.msg});
  });
});

router.delete('/design/:type/:id', function(req, res, next){
  design.delete(req.params.id, req.params.type).then(results =>{
    console.log(`A2Dlog - DELETING ITEM ${req.params.id} FROM COLLECTION ${req.params.type} OF DESIGN ON ROUTE "${req.url}": ${results.msg}`);
    res.send({okay: results.msg});
  }).catch(err =>{
    console.log(`A2Dlog - ERROR WHILE DELETING ITEM ${req.params.id} FROM COLLECTION ${req.params.type} OF DESIGN ON ROUTE "${req.url}": ${err}`);
    res.send({error: err.msg});
  })
});

/**************************************************
 **************************************************
 *DEV ROUTES
 **************************************************
 **************************************************/
router.get('/dev', function(req, res, next){
  res.render('dashbrd/dev', {
    title: 'Dev',
    email: req.email,
    name: req.name,
    avatar: req.avatar
  })
});

router.get('/dev/:page', function(req, res, next){
  req.params.page = (parseInt(req.params.page) > 0)? parseInt(req.params.page) : 1;  
  dev.getData(req.params.page).then(data =>{    
    res.send(data);
  });
});

router.get('/devcategories', function(req, res, next){
  dev.getCategories(true, true).then(result =>{
    res.send(result);
  }).catch(error =>{
    res.send(error);
  })
});

router.post('/dev', function(req, res, next){
  dev.save(req.fields, req.files).then(results =>{
    console.log(`A2Dlog - INSERT/UPDATE VIA POST ON ROUTE: "${req.url}": ${results}`);
    res.send(results);
  }).catch(rejection =>{
    console.log(`A2Dlog - ERRO NO INSERT/UPDATE VIA POST ON ROUTE: : "${req.url}":  ${rejection}`);
    res.send(rejection);
  });
});

router.delete('/dev/:id', function(req, res, next){
  dev.delete(req.params.id).then(response =>{
    console.log(`A2Dlog - DEV project ${req.params.id} deleted.`);
    res.send(response);
  }).catch(rejection =>{
    console.log(`A2Dlog - Error while deleting DEV project ${req.params.id}.`);
    res.send(rejection);
  });
});

/**************************************************
 **************************************************
 *LEARN ROUTES
 **************************************************
 **************************************************/
router.get('/learn', function(req, res, next){
  res.render('dashbrd/learn', {
    title: 'Ensino',
    email: req.email,
    name: req.name,
    avatar: req.avatar
  })
});

/**************************************************
 **************************************************
 *EDITOR.JS ROUTES
 **************************************************
 **************************************************/
router.post('/fetchimage', function(req, res, next){
  edit.saveFromURL(req.fields.url).then(result =>{
    res.send(result);
  }).catch(error =>{
    res.send(error);
  });
});

router.post('/uploadimage',function(req, res, next){
  edit.saveFromUpload(req.files.image).then(result =>{
    res.send(result);
  }).catch(error =>{
    res.send(error);
  });
});

/**************************************************
 **************************************************
 *LOGON ROUTES
 **************************************************
 **************************************************/
router.get('/login', function(req, res, next){
  res.render('dashbrd/login', {
    title: 'Login',
    body: req.body,
    msg: null
  });
});

router.post('/login', function(req, res, next){    
  let title = 'Login';
  let fields = req.fields;
  let page = 'dashbrd/login';
  if(!req.fields.email){
    res.render(page, { title, body: fields, msg: 'Digite o e-mail.'});    
  }
  else if(!req.fields.password){
    res.render(page, { title, body: fields, msg: 'Digite a senha.'});    
  }
  else{
    if(utils.validateEmail(req.fields.email)){
      account.login(req.fields.email, req.fields.password)
      .then(suc =>{
        console.log('A2Dlog - Successful login, session data is: ', suc);
        req.session.manager = suc;
        res.redirect('/dashbrd');

      })
      .catch(err =>{
        res.render(page, {title, body: fields, msg: err.msg});        
      });
    }
    else{
      res.render(page, { title, body: fields, msg: 'Digite um e-mail válido.\n\rExemplo: email@exemplo.com'});      
    }
  }
});

router.post('/passchange', function(req, res, next){
  account.changePassword(req.fields.email, req.fields.oldpassword, req.fields.newpassword, req.fields.confpassword).then(result =>{
    res.send(result);
    req.session.destroy();
  }).catch(rejection =>{
    res.send(rejection);
  });
});

router.post('/profilechange', function(req, res, next){
  account.changeProfile(req.fields, req.files).then(result =>{
    let response = {
      okay: result.okay,
      msg: result.msg
    }
    res.send(response);
    if(result.newAvatar){
      req.session.manager.avatar = result.avatar;
    }
    if(result.newEmail){
      req.session.manager.email = result.email;
    }
    if(result.newName){
      req.session.manager.name = result.name;
    }
  }).catch(error =>{
    res.send(error);
  });
})

router.get('/logout', function(req, res, next){  
  req.session.destroy();
  res.redirect('/dashbrd/login');
});

module.exports = router;
