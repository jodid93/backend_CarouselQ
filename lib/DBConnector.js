'use strict';

//var hash = require('../lib/pass').hash;
var pg = require('pg');
var fs = require('fs');

//var defaultSettings = require('../lib/defaultSettings');


////
//DATABSE CONNECTION
////
////
var DATABASE = process.env.DATABASE_URL;
//var DATABASE = "postgres://postgres:k0kerg0t@localhost/postgres";

module.exports.removeSong = function(hashName, trackUri, cb){
  pg.connect(DATABASE, function(error,client,done){
    if(error){
      console.log(error);
      return cb(error);
    }else{
      console.log('náði að tengjast grunni');
      
      var values = [trackUri, hashName];
      var query = 'DELETE FROM songs WHERE songs_uri = $1 and song_user = $2';

      client.query(query, values, function(err){
      if(err){
        console.log(err)
        return cb(err)
      }else{
        console.log('fyrsta gekk upp reyni seinni ')
        var values2 = [trackUri,hashName];
        var query2 = 'update userinfo set userinfo_songs = array_remove((select userinfo_songs from userinfo where userinfo_hashnameid = $2 ),$1) where userinfo_hashnameid = $2';

        client.query(query2, values2, function(err){
        if(err){
          console.log(err)
          return cb(err)
        }else{
          console.log('allt gekk upp, returning ')
          
          return cb(null);
        }
      })
      }
    })
    }
  })
}

module.exports.getQueue = function (queueId, cb){
  pg.connect(DATABASE, function(error,client,done){
    if(error){
      console.log(error)
      return cb(error)
    }
    console.log('connected to database');
    var values = [queueId];
    var query = 'select s.songs_uri, s.song_name, s.song_band, s.song_skipvotes, s.song_duration, u.userinfo_songsplayed, u.userinfo_hashnameid, u.UserInfo_name from songs as s join (select userinfo_hashnameid, userinfo_songsplayed, UserInfo_name from userinfo where userinfo_hashnameid = ANY((select users from queues where queue_id = $1) :: text[])) as u on s.song_user = u.userinfo_hashnameid'
    client.query(query, values, function(err,  result){
      if(err){
        console.log(err)
        return cb(err)
      }
      console.log('everything good; returning')
      return cb(null, result);
    })
  });
} 


module.exports.getUserSongs = function(userID, name,count, cb){
  pg.connect(DATABASE, function(error,client,done){
    if(error){
      console.log(error);
      return cb(error);
    }else{
      console.log('náði að tengjast grunni');
      var values = [userID];
      var query = 'SELECT * from songs where songs_uri = any ((select userinfo_songs from userinfo where userinfo_hashnameid = $1)::text[])and song_user = $1;';
      client.query(query, values, function(err,  result){
      if(err){
        console.log(err)
        return cb(err)
      }else{
        console.log('allt gekk upp ---   ')
        return cb(null, result, name, count);
      }
    })
    }
  })
}

module.exports.getUsersInQueue = function(queueID, cb){
  pg.connect(DATABASE, function(error,client,done){
    if(error){
      console.log(error);
      return cb(error);
    }else{
      console.log('náði að tengjast grunni');
      var values = [queueID];
      var query = 'SELECT userinfo_hashnameid, userinfo_name, userinfo_songsplayed FROM userinfo WHERE userinfo_hashnameid  = any ((select users from queues where queue_id = $1)::text[])';
      client.query(query, values, function(err,  result){
      if(err){
        console.log(err)
        return cb(err)
      }else{
        console.log('allt gekk upp ---   ')
        return cb(null, result);
      }
    })
    }
  })
}

module.exports.addSongToQueue = function addSongToQueue(hashName, trackUri, trackName, trackBand, trackDur, cb){

  pg.connect(DATABASE, function(error,client,done){
    if(error){
      console.log(error);
      return cb(error);
    }else{
      console.log('náði að tengjast grunni');
      var hashName2 = '{\"'+trackUri+'\"}'
      var values = [hashName, hashName2];
      var query = 'update userinfo set userinfo_songs= (select userinfo_songs from userinfo where userinfo_hashnameid = $1) || $2 where userinfo_hashnameid = $1';

      client.query(query, values, function(err){
      if(err){
        console.log(err)
        return cb(err)
      }else{
        console.log('fyrsta gekk upp reyni seinni ')
        var values2 = [trackUri,trackName,trackBand,trackDur, hashName];
        var query2 = 'insert into songs (songs_uri, song_name, song_band, song_skipvotes, song_duration, song_user) values ( $1, $2, $3, 0, $4, $5)';

        client.query(query2, values2, function(err){
        if(err){
          console.log(err)
          return cb(err)
        }else{
          console.log('allt gekk upp, returning ')
          
          return cb(null);
        }
      })
      }
    })
    }
  })
}

module.exports.makeUserInactive = function makeUserInactive(hashedUN,cb){
  pg.connect(DATABASE, function(error,client,done){
    if(error){
      console.log(error);
      return cb(error);
    }else{
      console.log('náði að tengjast grunni');
      var values = [hashedUN];
      var query = 'UPDATE userinfo SET UserInfo_Active = \'FALSE\' WHERE userinfo_hashnameid = $1';
      client.query(query, values, function(err){
      if(err){
        console.log(err)
        return cb(err)
      }else{
        console.log('allt gekk upp ---   ')
        return cb(null);
      }
    })
    }
  })
}

module.exports.createTables = function createTables( cb ){
  console.log('er að fara connecta')
  console.log(DATABASE);
  pg.connect(DATABASE, function (error, client, done) {
    if (error) {
      console.log(error);
      return cb(error);
    }
    console.log('náði að connecta við gagna grunn')
    var query = 'CREATE TABLE if not exists Queues( queue_id VARCHAR(10) NOT NULL, users TEXT[]);';
    client.query(query, function (err, result) {
      if (err) {
        
        console.log(err);
        return cb(error);
      } else {
        console.log('fyrsta skipun gekk upp reyni næstu')
        var query2 = 'CREATE TABLE if not exists UserInfo( UserInfo_name VARCHAR(100) NOT NULL, UserInfo_songs TEXT[], UserInfo_hashName TEXT[], UserInfo_Qowner boolean, UserInfo_Active boolean, UserInfo_hashNameId VARCHAR(100), userinfo_songsplayed INTEGER);';
        client.query(query2, function (err, result) {
          
          if (err) {
            console.log(err);
            return cb(error);
          } else {
            console.log('seinni skipun gekk upp reyni næstu')
            var query3 = 'CREATE TABLE if not exists SONGS( songs_uri VARCHAR(100) NOT NULL, song_name VARCHAR(500), song_band VARCHAR(100), song_skipVotes integer, song_duration integer, song_user VARCHAR(100));';
            client.query(query3, function (err, result) {
              
              if (err) {
                console.log(err);
                return cb(error);
              } else {
                console.log('seinnasta skipun gekk eftir, allt gott returning');
                return cb(false);
              }
            });
          }
        });
      }
    });
  });
};

module.exports.addNewUser = function addNewUser(username, queueId, hashedUN, owner, cb){
  pg.connect(DATABASE, function (error, client, done) {
    if (error) {
      console.log(error);
      return cb(error);
    }

    console.log('náði að connecta við gagna grunn')
    var arrHash2 = '{\"'+hashedUN+'\"}'
    var values = [username,arrHash2,owner,hashedUN];
    var query = 'INSERT INTO userinfo (userinfo_name, userinfo_hashname, UserInfo_Qowner, UserInfo_Active, UserInfo_hashNameId, userinfo_songsplayed) VALUES($1, $2, $3, true, $4,0)';
    client.query(query, values, function (err, result) {

      if (err) {
        console.log(err);
        return cb(error);
      } else {

        if(owner === 'true'){

          console.log('fyrsta skipun gekk upp reyni næstu');
          var arrHash = '{\"'+hashedUN+'\"}'
          console.log(arrHash,queueId,hashedUN);
          var values2 = [queueId, arrHash];
          var query2 = 'INSERT INTO queues (queue_id, users) VALUES($1, $2)';

          client.query(query2, values2, function (err, result) {
            if (err) {
              console.log(err);
              return cb(error);
            } else {
              console.log('seinni skipun gekk eftir, allt gott returning');
              return cb(false)
            }
          });
        }else if(owner === 'false'){
          var arrHash3 = '{\"'+hashedUN+'\"}'
          var values3 = [queueId, arrHash3];
          var query3 = 'update queues set users = (select users from queues where queue_id = $1) || $2 where queue_id = $1';

          client.query(query3, values3, function (err, result) {

            if (err) {
              console.log(err);
              return cb(error);
            } else {
              console.log('seinni skipun gekk eftir, allt gott returning');
              return cb(false)
            }
          });

        }else{
          console.log('facking shit bitch')
          cb('allt ónýtt');
        }
      }
    });
  });
}

module.exports.doesQExist = function doesQueueExist(queueId, cb){
  pg.connect(DATABASE, function(error, client, done){
    if(error){
      console.log(error);
      return cb(error);
    }

    console.log('náði að tengjast við gagna grunn');
    var values = [queueId];
    var query = 'select queue_id from queues where queue_id = $1';
    //var query = 'select * from queues';
    client.query(query, values, function(err, result){
      if(err){
        console.log(err)
        return cb(err)
      }else{
        console.log('allt gekk upp ---   ', result)
        return cb(null, result);
      }
    })
  })
}

/*module.exports.addUserToQueue = function addUserToQueue(userName, queueId, cb){
  pg.connect(DATABASE, function(error, client, done){
    if(error){
      console.log(error);
      return cb(error);
    }
    console.log('náði að tengjast gagnagrunni');
    var values = [userName, queueId];
    var query = 
  })
}*/
/* to uppdate array: 
update test set arr = (
  select arr from test where id = 'id123'
) ||'{"john"}'
where id = 'id123'
update queues set users = (
  select users
  from queues
  where queue_id = 'ABCDE'
) || (
  select userinfo_hashname
  from userinfo
  where userinfo_name = 'test2')
      
      where queue_id = 'ABCDE'
*/

/*
module.exports.addRandomUser = function addRandomUser(cb){
  pg.connect(DATABASE, function (error, client, done) {
    if (error) {
      console.log(error);
      return cb(error);
    }
    var query = 'INSERT INTO Queues (id, users) VALUES(1, "jon")';
    client.query(query, function (err, result) {
      done();
      if (err) {
        console.error('BITCH ASS !!!!!',err);
        return cb(error);
      } else {
        console.log('FUCK YEAH! I HAVE A RANDOM USER!');
        return cb(false);
      }
    });
  });
};
module.exports.getRandomUser = function getRandomUser(cb){
  pg.connect(DATABASE, function (error, client, done) {
    if (error) {
      console.log(error);
      console.log('MOTHER FUCKER !!!!!!!',error);
      return cb(error);
    }
    
    client.query(query, values, function (err, result) {
      
      console.log("Select random user done !");
      done();
      if (err) {
        return cb(error);
      } else {
        return cb(null, result.rows);
      }
    });
  });
};*/


//thorgeirs pc local Database connection string
//var DATABASE = "postgres://postgres:M39JPD@localhost/vefforritunLokaverkefni";

//thorgeirs laptop local Database connection string
//var DATABASE = "postgres://postgres:MaxvTQ@localhost/vefforritunLokaverkefni";

//máni local Database connection string
//var DATABASE = "postgres://thorkellmani:1234@localhost/lokaverkefni";

//josua local connection
//var DATABASE = "postgres://postgres:123@localhost/verkefni6";




//
//  INFORMATION - SELECT query
//    result = [ {attrb_1, attrb_2, ...}, {attrb_1, attrb_2, ...}, ... ]
//    e.g. users table, select all ->
//    result = [ {username:goggi, salt: '...', hash: '...'} ]



/*
////
//HELPER FUNCTIONS
////
//returns function(error, resultRows)
function findUser (username, cb) {
  pg.connect(DATABASE, function (error, client, done) {
    if (error) {
      return cb(error);
    }
    var values = [username];
    var query = 'SELECT username, salt, hash FROM users WHERE username = $1';
    client.query(query, values, function (err, result) {
      
      console.log("Select user done !");
      done();
      if (err) {
        return cb(error);
      } else {
        return cb(null, result.rows);
      }
    });
  });
}
function createUserWithHashAndSalt (username, salt, hash, cb) {
  pg.connect(DATABASE, function (error, client, done) {
    if (error) {
      console.log("error to connect to DataBase!");
      return cb(error);
    }
    //fyrir insert inn i users
    console.log("Connection to DataBase done!");
    var values = [username, salt, hash];
    var query = 'INSERT INTO users (username, salt, hash) VALUES($1, $2, $3)';
    client.query(query, values, function (err, result) {
      
      done();
      var settings = defaultSettings( 'string' );
      console.log(settings);
      //fyrir insert inn í gamestate
      var JSONstring = '{"userName": "'+username+'", "upgrades1": [[1,0,3],[0,3,3],[3,3,3]], "upgrades2": [[1,0,3],[0,3,3],[3,3,3]], "currency": 0, "settings": '+settings+', "currFactor": 0, "treeFactor": 1, "timestamp": '+ Date.now() +',"score":0 }'; 
      var values = [username,JSONstring,0];
      var query = 'INSERT INTO gamestate (username, gamestate, score) VALUES($1, $2, $3)';
      client.query(query, values, function (err, result) {
      done();
        //fyrir insert inn í friends
        var values = [username,username];
        var query = 'INSERT INTO friends (username, friendid) VALUES($1, $2)';
        client.query(query, values, function (err, result) {
        console.log("Insert user into table done !");
        done();
          if (err) {
            console.error(err);
            return cb(error);
          } else {
            return cb(null, true);
          }
        });
      });
    });
  });
}
function friendList(username, cb){
  pg.connect(DATABASE, function (error, client, done) {
    if (error) {
      return cb(error);
    }
    var values = [username];
    var query = 'SELECT friendID FROM friends WHERE username = $1;'; //it was FROM users LIMIT 20;
    client.query(query, values, function (err, result) {
      done();
      if (err) {
        return cb(error);
      } else {
        return cb(null, result.rows);
      }
    });
  });
}*/





////
//MODULES
////




/*//returns callback(error, isTaken),
//isTaken is true if the username is already taken, otherwise false
//error return null if all is ok, otherwise error object or String errMessage 
module.exports.isUserNTaken=function isUserNTaken(userN, cb){
  findUser(userN, function(error, resultRow){
    if(error){
      cb(error, null);
    } else if( resultRow[0] ){
        if( resultRow[0].username === userN){
          cb(null, true);
        }
    } else {
      cb(null,false);
    }
  });
};
//returns callback(error, isValid), 
//isValid is true if user exist otherwise false
module.exports.isValidUser=function isValidUser(username, password, cb){
  findUser(username, function (err, result) {
    var user = null;
    if (result.length === 1) {
      user = result[0];
    }
    if (!user) {
      return cb(new Error('cannot find user'));
    }
    hash(password, user.salt, function(err, hash){
      if (err) {
        return cb(err);
      }
      
      if (hash === user.hash) {
        return cb(null, true);//cb(null, user);
      }
      cb(new Error('invalid password'), false);
    });
  });
};
// returns function(error, successBoolean)
module.exports.createNewUser = function createNewUser (userN, passW, cb) {
  console.log("try to createUser !");
  hash(passW, function (err, salt, hash) {
    console.log("hash done !");
    if (err) {
      return cb(err);
    }
    createUserWithHashAndSalt(userN, salt, hash, cb);
  });
};
//TODO: test this module
//returns function(error, friends), friends is a String
module.exports.findFriendList = function findFriendList (username, cb) {
  friendList(username, cb);
};
//TODO: test this module
//returns function(error, playersHighScores),
//object playerHighScores contains 10 or less players name and score
module.exports.findAllHighScore = function findHighScoreForAll( cb ){
   pg.connect(DATABASE, function (error, client, done) {
    if (error) {
      return cb(error);
    }
    //getum sleppt DESC með því að skrifa út röðina í öfugri röð.
    //Þá erum við búinn að spara keyrsluna við að keyra DESC
    var query = 'SELECT username, score FROM gamestate ORDER BY score DESC LIMIT 10;';
    client.query(query, function (err, result) {
      done();
      if (err) {
        return cb(error);
      } else {
        return cb(null, result);
      }
    });
  });
};
//TODO: test this module
module.exports.findUserHighScore=function findUserHighScore(userN,cb){
  friendList( userN, function(error, friends){
    
    pg.connect(DATABASE, function (error, client, done) {
      if (error) {
        return cb(error);
      }
      //variable friends is a String, it keeps the 
      //username friends and the username itself.
      var values = [friends];
      var query = 'SELECT username, score FROM gamestate WHERE username = ANY($1) ORDER BY score DESC LIMIT 10;';
      client.query(query, function (err, result) {
        done();
        if (err) {
          return cb(error);
        } else {
          return cb(null, result);
        }
      });
    });
  });
};
module.exports.setGameState=function storeGameState(userN, gameS, score, cb){
  pg.connect(DATABASE, function (error, client, done) {
    if (error) {
      return cb(error);
    }
    var values = [gameS, userN];
    var query = 'UPDATE gamestate SET gamestate = $1 WHERE username = $2';
    client.query(query, values, function (err, result) {
      done();
      if (err) {
        return cb(error);
      } else {
        var values = [score, userN];
        var query = 'UPDATE gamestate SET score = $1 WHERE username = $2';
        client.query(query, values, function (err, result) {
          done();
          if (err) {
            return cb(error);
          } else {
            return cb(null, result);
          }
        });
      }
    });
  });
};
module.exports.getGameState=function getGameState(userN, callback){
  pg.connect(DATABASE, function (error, client, done) {
    if (error) {
      return callback(error);
    }
    var values = [userN];
    var query = 'SELECT gamestate FROM gamestate WHERE username = $1';
    client.query(query, values, function (err, result) {
      
      done();
      //console.log("Select user done ! data = ", result.rows[0].gamestate);
      if (err) {
        return callback(error);
      } else {
        console.log("result.rows[0]");
        console.log(result.rows[0]);
        if(result.rows[0] === [] ){
          return callback("Ekkert gamestate!");
        } else {
          return callback(null, result.rows[0].gamestate);
        }
      }
    });
  });
};
module.exports.setSettings=function setSettings(userN,settings,cb){
  pg.connect(DATABASE, function (error, client, done) {
    if (error) {
      return cb(error);
    }
    var values = [userN];
    var query = 
      'SELECT gamestate '+
      'FROM gamestate '+
      'WHERE username=$1;';
    client.query(query, values, function (err, result) {      
      done();
      if (err) {
        console.log( error );
      } else {
        err = null;
      }
      var gamestate = JSON.parse(result.rows[0].gamestate);
      gamestate.settings=settings;
      var newGamestate = JSON.stringify( gamestate );
      var values = [newGamestate, userN];
      var query = 
        'UPDATE gamestate '+
        'SET gamestate=$1 '+
        'WHERE username=$2;';
      client.query(query, values, function (error, result) {      
        done();
        if (error) {
          return cb(error);
        } else {
          return cb(null);
        }
      });
    });
  });
};
module.exports.getSettings=function getSettings(userN,cb){
  pg.connect(DATABASE, function (error, client, done) {
    if (error) {
      return cb(error);
    }
    var values = [userN];
    var query = 
      'SELECT gamestate '+
      'FROM gamestate '+
      'WHERE username=$1;';
    client.query(query, values, function (err, result) {      
      done();
      if (err) {
        return cb(err);
      } else {
        var newGamestate = JSON.parse(result.rows[0].gamestate);
        return cb(null, newGamestate.settings);
      }
    });
  });
};
module.exports.addFriend=function addFriend(userN, friendsN, cb){
  //TODO: add friendN to friends table where userN is.
  
  pg.connect(DATABASE, function (error, client, done) {
    if (error) {
      return cb(error);
    }
    var values = [userN];
    var query = 'SELECT friendid FROM friends WHERE username = $1';
    client.query(query, values, function (err, result) {
      done();
      if (err) {
        return cb(error);
      } else {
        var friendid = result.rows[0].friendid.split(',');
        var newFriends = friendid + ',' + friendsN;
        values = [newFriends, userN];
        query = 'UPDATE friends SET friendid = $1 WHERE username = $2';
        client.query(query, values, function (err, result) {
          done();
          if (err) {
            return cb(error);
          } else {
            return cb(null, result);
          }
        });
      }
    });
  });
};
*/
