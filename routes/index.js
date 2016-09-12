var express = require('express');
var router = express.Router();

var sql = require('../lib/DBConnector');
var ensureUser = require('../lib/ensureLoggedIn');
var xss = require('xss');

//var defaultSettings = require('../lib/defaultSettings');

////
//HOME PAGE
////

router.get('/', homePage);
//router.post('/', addRandomUser);
//router.get('/testConnection', testConnection);
router.get('/addNewUser/:name/:hash/:id/:owner', addNewUser);
router.get('/doesQueueExist/:queueId', doesQueueExist);

router.get('/initDB', initializeDB);
router.get('/makeUserInactive/:hash',makeUserInactive);
router.get('/addSongToQueue/:hashName/:trackUri/:trackName/:trackBand/:trackDur', addSongToQueue);

router.get('/getQueue/:queueid', getQueue);

router.get('/removeSong/:hashName/:trackUri', removeSong);

function removeSong(req, res, next){
  sql.removeSong(xss(req.params.hashName), xss(req.params.trackUri), function(error){
    if(error){
      console.log(error)
    }else{
      res.json({"status":"good"});
    }
  })
}
function getQueue(req, res, next){
  
  sql.getQueue(xss(req.params.queueid), function(error,data){
    if(error){
      console.log('error getting the queue for id' + xss(req.params.queueid),error);
      return;
    }
    var users = sortSongsByUsers(data);
    users = users.sort(sortSongsBySongsPlayed);
    res.json(getFairQueue(users));

  })
  
}

function getFairQueue(users){
  var queue = [];
  var maxSongs = 0;
  for(var i = 0; i<users.length; i++){
    if(users[i].songs.length > maxSongs){
      maxSongs = users[i].songs.length 
    }
  }

  for(var i = 0; i<maxSongs; i++){
    for(var u = 0; u<users.length; u++ ){
      if(users[u].songs[i]){
        queue.push({
          userName: users[u].userName,
          userHash: users[u].userHash,
          songName: users[u].songs[i].songName,
          songUri: users[u].songs[i].songUri,
          songBand: users[u].songs[i].songBand,
          songSkips: users[u].songs[i].songSkips,
          songDuration: users[u].songs[i].songDuration
        })
      }
    }
  }
  return queue;
}

function sortSongsBySongsPlayed(a,b) {
  if (a.userSongsPlayed < b.userSongsPlayed)
    return -1;
  if (a.userSongsPlayed > b.userSongsPlayed)
    return 1;
  return 0;
}

function sortSongsByUsers(data){
   var users = []
    for (var i = 0; i< data.rows.length; i++){
      var user = data.rows[i];
      var  currUser = users.find(x => x.userHash === user.userinfo_hashnameid)
      if( currUser){
         currUser.songs.push(
          {
            songName: user.songs_name,
            songUri: user.songs_uri,
            songBand: user.song_band,
            songSkips: user.song_skipvotes,
            songDuration: user.song_duration
          }
        )
      }else{
        users.push(
          { 
            userName: user.userinfo_name,
            userHash: user.userinfo_hashnameid,
            userSongsPlayed: user.userinfo_songsplayed,
            songs: [{
              songName: user.songs_name,
              songUri: user.songs_uri,
              songBand: user.song_band,
              songSkips: user.song_skipvotes,
              songDuration: user.song_duration
            }]  
          }
        )
      }
    }
    return users;
}

function addSongToQueue(req, res, next){
  sql.addSongToQueue(xss(req.params.hashName),xss(req.params.trackUri),xss(req.params.trackName),xss(req.params.trackBand),xss(req.params.trackDur), function(error){
    if(error){
      console.log(error)
    }else{
      res.json({"status":"good"});
    }
  })
}

function makeUserInactive(req, res, next){
  sql.makeUserInactive(xss(req.params.hash), function(error){
    if(error){
      console.log(error)
    }else{
      res.json({"status":"good"});
    }
  })
}

function doesQueueExist(req, res, next){
  sql.doesQExist(xss(req.params.queueId), function(error, data){
    if(error){
      console.log(error, 'fokk');
    }else{
        console.log('herna er data hahahaha     ',data);
      if(data.rowCount === 1){
        console.log('status á að vera true');
        res.json({"status": "true"});
      }else{
        res.json({"status": "false"});
      }
    }
  });
}

//router.get('/addNewUser/:name/:hash/:id/:owner', addNewUser);

function addNewUser(req, res, next){

  if(req.params.id.length > 9){
    console.log('stop trying to break my app >:('); 
    res.json({"status": "bad"})
     
  }

  sql.addNewUser(xss(req.params.name), xss(req.params.id), xss(req.params.hash), xss(req.params.owner), function(error){
    console.log('what');
    if(error){
      console.log(error);
    }
    req.session.regenerate(function (){
        req.session.user = xss(req.params.hash);
      });
    console.log('what 123 ');
    
    res.json({"status": "good"})
  });
  
}

function initializeDB(req, res, next){
  sql.createTables(function (error){
    if(error){
      console.log(error);
    }
  });
  console.log('töflur ættu að vera komnar');
  res.json({"status": "good"});
}

//TEMP MEHTOD SOLUTION
function homePage(req, res, next){
  //Initialize tables and then render main screen
  /*console.log(sql);
  sql.createTables( function(error){
    if( error ){
      console.log(error);
    }
    //res.redirect('/login');
    //res.render('login', { title: 'Log In' });
  });
  console.log("ertu hér");*/
  res.render('menu',{user: 'dickhead númer 2',
                     title: 'test'});
}

function addRandomUser(req, res, next){
  console.log('adding a random user');
  sql.addRandomUser(function(error){
    if(error){
      console.log('MARRAFACCA',error);
    }
  });

  var resData

  sql.getRandomUser(function(error, data){
    if(error){
      console.log('SHIIIIIIT',error)
    }else{
      resData = data;
      console.log(resData);

      resData = {user: 'still a dichhead',
                 title: 'test',
                 userExsist: true,
                 randomUser: 'johannes'}
    }
  });
  res.render('menu', {user: 'allt ónýtt',
                     title: 'test'});
}

/*
  for Testing: http://localhost:8080/testConnection
  for Raun   : https://carousel-q.herokuapp.com/testConnection
*/
function testConnection(req, res, next){
  console.log('prepping response to server');
  
  res.setHeader('Content-Type', 'application/json');
  res.json({"foo": "bar"});
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
