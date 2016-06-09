var express = require('express');
var router = express.Router();

var sql = require('../lib/DBConnector');
//var ensureUser = require('../lib/ensureLoggedIn');
var xss = require('xss');

//var defaultSettings = require('../lib/defaultSettings');

////
//HOME PAGE
////

router.get('/', homePage);

//TEMP MEHTOD SOLUTION
function homePage(req, res, next){
  //Initialize tables and then render main screen
  console.log(sql);
  sql.createTables( function(error){
    if( error ){
      console.log(error);
    }
    //res.redirect('/login');
    //res.render('login', { title: 'Log In' });
  });
  console.log("ertu hér");
  res.render('menu',{user: 'dickhead',
                     title: 'test'});
}

////
//AUTHERATION / CREATE USER
////

//SPURNING: eigum við að hafa ensuerUser á post aðgerðum?
/*router.get('/menu', ensureUser, menu);

router.get('/viewFriends', ensureUser, viewFriends);
router.post('/viewFriends', chooseFriend);

router.get('/addFriends', ensureUser,addFriends);
router.post('/addFriends', addFriendsHandler);

router.get('/highscores', ensureUser, highScores);
router.get('/settings', ensureUser, settings);
router.post('/settings',  saveOrRestoreSettings);

router.post('/gameSettings', ensureUser, gameSettings);
router.post('/saveGoBackToGame', ensureUser, startGame, play );

router.get('/highscores', ensureUser, highScores);

router.get('/idleisland', ensureUser, play);
router.get('/logout', ensureUser, logout);

router.post('/refresh', ensureUser, refresh);


router.post('/exit', ensureUser ,exit);


function startGame(req, res, next){
  var action = req.body.action;
  var settings = getSettings( req.body );
  console.log('action');
  console.dir(action);
  if(action==='save'){
    sql.setSettings(req.session.user, settings, function(error, result){
      if(error){
        console.log(error);
      }
      next();
    });
  } else {
    next();
  }
}

function gameSettings(req, res, next){
  var gameState = xss(req.body.submitString);
  var score = xss(req.body.score);

  console.log(gameState)

  sql.setGameState(req.session.user, gameState, score, function(){
    console.log('allt gekk upp');

    sql.getSettings(req.session.user, function(error, settings){
      console.dir(settings);
      res.render('settings', 
        {
          title: 'Change Settings',
          action: '/saveGoBackToGame',
          btnText1:'Back to game', 
          btnText2:'Save and go back to game', 
          settings:settings
        });
    });
  });
}

function getSettings( body ){
  var action = body.action;
  var settings;

  console.log('index.js:body');
  console.dir(body);
  if(action==='save'){
    settings = body;
    delete settings.action;
  } else if(action==='default'){
    settings = defaultSettings();
  }
  return settings;
}

function saveOrRestoreSettings(req, res, next){
  var action = req.body.action;
  var settings = getSettings( req.body );

  sql.setSettings(req.session.user, settings, function(error, result){
    if(error){
      console.log(error);
    }
    console.log('settings');
    console.dir(settings); 
    if(action==='save'){
      res.redirect('/menu');
    } else if(action==='default'){
      res.render('settings', 
      { 
        title: 'Change Settings',
        action: '/settings',
        btnText1:'Restore default settings', 
        btnText2:'Save and go back to menu', 
        settings:settings
      });
    }
      //res.render('settings', {title:'Change Settings', settings:settings});
  });
}

function chooseFriend(req, res, next) {
  var friend = xss(req.body.who);
  sql.getGameState(friend, function(error, result) {
    var gamestate;
    gamestate = result;
    var data = {userName: friend,
                userData: gamestate,
                isFriend: true
                 };
    res.render('idleisland', {data:data});
  });
}

function refresh(req, res, next){
    var gameState = xss(req.body.submitString);
    var score = xss(req.body.score);
    console.log(score);
    sql.setGameState(req.session.user, gameState, score, function(){
      console.log('allt gekk upp');
      res.redirect('/idleisland');
    });
}

function exit(req, res, next){
  var friend = xss(req.body.checkFriend);
  if (friend === 'true') {
    var gameState = xss(req.body.submitString);
    var score = xss(req.body.score);
    console.log(score);
    sql.setGameState(req.session.user, gameState, score, function(){
      console.log('allt gekk upp');
      res.redirect('/menu');
    });
  } else {

    res.redirect('/viewFriends');
  }
}

function logout(req, res, next) {
  // eyðir session og öllum gögnum, verður til nýtt við næsta request
  req.session.destroy(function(){
    res.redirect('/');
  });
}

function menu(req, res, next) {
  var gamestate;
      sql.getGameState(req.session.user, function(error, dataa){
        if(error){
          console.log(error);
        }else {
          console.log('success');
        }
        gamestate = dataa;
        res.render('menu', { title: 'Idle Island', gamestate: gamestate});
      });
}
function developmentViewFriends(req, res, next){
  var friended = ["a", "b", "c"];
  res.render('viewFriends', { status: 'Your friends', entries: friended});
}

function viewFriends(req, res, next) {
  username = req.session.user;

  sql.findFriendList(username, function(err, result) {
    console.dir(result);
    if (err) {
      console.error(err);
    }
    friends = result[0].friendid.split(',');
    var friended = [];
    for (var i = 1; i < friends.length; i++) {
      friended.push(friends[i]);
    }
    var gamestate;
      sql.getGameState(req.session.user, function(error, dataa){
        if(error){
          console.log(error);
        }else {
          console.log('success');
        }
        gamestate = dataa;

        if (friended.length > 0) {
          res.render('viewFriends', { status: 'Your friends', entries: friended,gamestate: gamestate});
        } else {
          res.render('viewFriends', { status: 'Get some friends, loser', entries: false,gamestate: gamestate});
        }
      });
  });
}

function addFriends(req, res, next) {
  var gamestate;
      sql.getGameState(req.session.user, function(error, dataa){
        if(error){
          console.log(error);
        }else {
          console.log('success');
        }
        gamestate = dataa;

        res.render('addFriends', { title: 'Add Friends', gamestate: gamestate});
      });
}

function addFriendsHandler(req, res, next) {
  var username = req.session.user;
  var friend = xss(req.body.friend);
  if (friend === username) {
    res.render('addFriends', {status: "You can't add yourself, ya dingus"});
  }
  
  else if (friend === '') {
    res.render('addFriends', {status: 'Username is required!'});
  } else {
    sql.isUserNTaken(friend, function (error, result) {
      if (error) {
        console.error(error);
      }
      if (result) {
        sql.findFriendList(username, function(err, result) {
          if (err) {
            console.error(err);
          } 
          console.log(result[0]);
          friends = result[0].friendid.split(',');
          friended = friends[1];
          if (friend === friended) {
            res.render('addFriends', { status: "User is already a friend!"});
          } else {  
            if (result) {
              sql.addFriend(username, friend, function(err, result) {
                if (err) {
                  console.error(err);
                }
                else {
                  res.render('addFriends', { status: 'Friend added!'});
                }
              });
            }
          }
        });
      } else {
        console.log("add friend: user doesn't exist");
        res.render('addFriends', { status: "User doesn't exist"});
      }
    });
  }
}

function highScores(req, res, next) {
  sql.findAllHighScore(function(error, result) {
    if (error) {
      console.error(error);
    }
    var entries = [];
    for(var i = 0; i < result.rows.length; i++) {
      entries.push(result.rows[i]);
    }
      var gamestate;
      sql.getGameState(req.session.user, function(error, dataa){
        if(error){
          console.log(error);
        }else {
          console.log('success');
        }
        gamestate = dataa;

        var data = { entries: entries, gamestate: gamestate}
        
        res.render('highscores', {data});
      });
  });
}



function settings(req, res, next) {
  sql.getSettings(req.session.user, function(error, settings){
    res.render('settings', 
      { 
        title: 'Change Settings',
        action: '/settings',
        btnText1:'Restore default settings', 
        btnText2:'Save and go back to menu', 
        settings:settings
      });
  });
}


function play(req, res, next) {
  var gamestate;
  sql.getGameState(req.session.user, function(error, dataa){
    if(error){
      console.log(error);
    }else {
      console.log('success');
    }
    gamestate = dataa;
    console.log('inníplay');
    console.log(gamestate);

    var data = {userName: req.session.user,
                userData: gamestate,
                isFriend: false };

    res.render('idleisland', {data: data});
  });
}*/

module.exports = router;
