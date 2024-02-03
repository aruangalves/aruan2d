var express = require('express');
var router = express.Router();

var about = require('./../inc/about');
var blog = require('./../inc/blog');
var design = require('./../inc/design');
var dev = require('./../inc/dev');
var search = require('./../inc/search');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { 
    title: 'Home',
    desc: 'Portfólio de Aruan Galves Amaral. Web dev, design, desenvolvimento full stack. Acompanhe o blog e veja os tutoriais.' 
  });
});

router.get('/about', function(req, res, next){
  about.retrieve().then(result =>{
    let data = result;
    delete data._id;
    delete data.images;
    res.render('about', { 
      title: 'Sobre',
      desc: 'Conheça mais sobre mim, minhas formações acadêmicas, experiências profissionais e demais interesses.',
      body: data
    });
  });
});

router.get('/blog', function(req, res, next){
  res.render('blog', {
    title: 'Blog',
    desc: 'Blog com tutoriais, dicas e relatos sobre meus projetos de desenvolvimento web e demais áreas de interesse.'
  });
});

router.get('/blog/categories', function(req, res, next){
  blog.getCategories(false, true).then(result =>{
    res.send(result);
  }).catch(error =>{
    res.send(error);
  });
});

router.get('/blog/categories/:url', function(req, res, next){
  let header = "";    
  blog.getCategoryName(req.params.url).then(result =>{
    header = result;
    res.render('blog', {
      title: 'Blog : : ' +header,
      desc: 'Blog com tutoriais, dicas e relatos sobre meus projetos de desenvolvimento web e demais áreas de interesse.',      
      header
    });
  }).catch(error =>{
    res.render('blog', {
      title: 'Blog',
      desc: 'Blog com tutoriais, dicas e relatos sobre meus projetos de desenvolvimento web e demais áreas de interesse.',      
      header
    });    
  });
});

router.get('/blog/categories/:url/:page', function(req, res, next){
  let page = parseInt(req.params.page);
  if(isNaN(page) || page < 1){
    page = 1;
  }
  blog.getCategoryPosts(req.params.url, page).then(result =>{    
    res.send(result);    
  }).catch(error =>{
    res.send(error);
  });
});

router.get('/blog/history', function(req, res, next){
  blog.getHistory().then(results =>{
    res.send(results);
  }).catch(error =>{
    res.send(error);
  });
});

router.get('/blog/history/:year/:month', function(req, res, next){
  let year = parseInt(req.params.year, 10);
  let month = parseInt(req.params.month, 10);
  let response = {
    okay: false,
    msg: "Erro: o ano ou mês contém um valor inválido ou não-numérico."
  };
  if(isNaN(year) || isNaN(month)){
    res.send(response);
  }
  else if(month < 0 || month > 11){
    res.send(response);
  }
  else{
    blog.getHistoryPosts(year, month).then(result =>{
      res.send(result);
    }).catch(error =>{
      res.send(error);
    });
  }
  
});

router.get('/blog/post/:url', function(req, res, next){
  blog.getPost(req.params.url).then(result =>{
    res.render('post', {
      title: result.doc.title,
      desc: result.doc.abstract,
      body: result
    });
  });
});

router.get('/blog/:page', function(req, res, next){
  req.params.page = (parseInt(req.params.page) > 0) ? parseInt(req.params.page) : 1;
  blog.getData(req.params.page, 10, true).then(results =>{
      res.send(results);
  }).catch(error =>{
    console.log("A2Dlog - Error while sending BLOG posts to the public section of the site: ");
    console.log(error);
  });
});

router.get('/design', function(req, res, next){
  res.render('design', {
    title: 'Design',
    desc: 'Portfólio com meus projetos de design gráfico: logos, materiais gráficos, artes para redes sociais e vídeos.'
  });
});

router.get('/design/logo/:page', function(req, res, next){ 
  req.params.page = (parseInt(req.params.page) > 0) ? parseInt(req.params.page) : 1;
  design.getData('logo', req.params.page, 8, true).then(data => {    
    res.send(data);
  });
});

router.get('/design/print/:page', function(req, res, next){  
  design.getData('print', req.params.page, 8, true).then(data => {    
    res.send(data);
  });
});

router.get('/design/art/:page', function(req, res, next){  
  design.getData('art', req.params.page, 16, true).then(data => {    
    res.send(data);
  });
});

router.get('/design/vid/:page', function(req, res, next){  
  design.getData('vid', req.params.page, 8, true).then(data => {    
    res.send(data);
  });
});

router.get('/dev', function(req, res, next){
  res.render('dev', {
    title: 'Dev',
    desc: 'Portfólio de projetos de programação e desenvolvimento web desenvolvidos por Aruan Galves Amaral.'
  });
});

router.get('/dev/categories', function(req, res, next){
  dev.getCategories(false, true).then(result =>{
    res.send(result);
  }).catch(rejection =>{
    res.send(rejection);
  });
});

router.get('/dev/categories/:url', function(req, res, next){
  let header = "";    
  dev.getCategoryName(req.params.url).then(result =>{
    header = result;
    res.render('dev', {
      title: 'Dev : : ' +header,
      desc: 'Portfólio de projetos de programação e desenvolvimento web desenvolvidos por Aruan Galves Amaral.',
      header
    });
  }).catch(rejection =>{
    res.render('dev', {
      title: 'Dev',
      desc: 'Portfólio de projetos de programação e desenvolvimento web desenvolvidos por Aruan Galves Amaral.',
      header
    });
  });
});

router.get('/dev/categories/:url/:page', function(req, res, next){
  let page = parseInt(req.params.page);
  if(isNaN(page) || page < 1){
    page = 1;
  }
  dev.getCategoryProjects(req.params.url, page).then(result =>{
    res.send(result);
  }).catch(rejection =>{
    res.send(rejection);
  });
});

router.get('/dev/listing', function(req, res, next){
  dev.getProjectListing().then(result =>{
    res.send(result);
  }).catch(rejection =>{
    res.send(rejection);
  });
});

router.get('/dev/project/:url', function(req, res, next){
  dev.getProject(req.params.url).then(result =>{
    res.render('project', {
      title: result.doc.title,
      desc: result.doc.abstract,
      body: result
    });
  });
})

router.get('/dev/:page', function(req, res, next){
  req.params.page = (parseInt(req.params.page) > 0) ? parseInt(req.params.page) : 1;
  dev.getLiteData(req.params.page, 10).then(results =>{
    res.send(results);
  }).catch(rejection =>{
    console.log("A2Dlog - Error while sending DEV projects to the public section of the site: ");
    console.log(rejection);
    res.send(rejection);
  });
})

router.get('/learn', function(req, res, next){
  res.render('learn', {
    title: 'Learn',
    desc: 'Página em construção'
  });
});

router.get('/recent', function(req, res, next){
  let results = {};
  dev.getLiteData(1, 3, false).then(devcontents =>{
    blog.getLiteData(1, 5).then(blogcontents =>{
      results["blog"] = blogcontents.rows;
      results["dev"] = devcontents.rows;
      results["okay"] = true;
      res.send(results);
    }).catch(rejection =>{
      console.log("A2Dlog - Error while retrieving most recent posts from BLOG: ");
      console.log(rejection);
      res.send(rejection);
    });
  }).catch(rejection =>{
    console.log("A2Dlog - Error while retrieving most recent projects from DEV: ");
    console.log(rejection);
    res.send(rejection);
  })
});

router.post('/search', function(req, res, next){
  search.search(req.fields).then(results =>{
    res.send(results)
  }).catch(rejection =>{
    console.log("A2Dlog - Error while performing search: ");
    console.log(rejection);
    res.send(rejection);
  })
});

module.exports = router;
