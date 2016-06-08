//
//
//	LOG IN SYSTEM (autheration)
//
//
var express = require('express');
var router = express.Router();

var sql = require('../lib/DBConnector');
var xss = require('xss');

//var ensureUser = require('../lib/ensureLoggedIn');

//if enter login in url -> if user is 
router.get('/login', redirectIfLoggedIn, login);
router.post('/login', loginHandler);

router.get('/create', redirectIfLoggedIn, createForm);
router.post('/create', createHandler);

router.get('/logout', logout);

var formDataLogin =
{
	title: 'Log in',
	method: 'post',
	action: '/login',
	btnTitle:'Submit',
	linkText:'Create new account',
	linkHref:'/create',
	username: "",
	error: false,
	errorMessage: ""
};

var formDataCreate =
{
	title: 'Create user',
	method: 'post',
	action: '/create',
	btnTitle:'Create',
	linkText:'Back to login page',
	linkHref:'./login',
	username: "",
	error: false,
	errorMessage: ""
};


function login(req, res, next) {
	res.render('form', formDataLogin);
}

function redirectIfLoggedIn(req, res, next) {
	if (req.session.user) {
		res.redirect('/menu');
	} else {
		next();
	}
}

function logout(req, res, next) {
	// eyðir session og öllum gögnum, verður til nýtt við næsta request
	req.session.destroy(function(){
		res.redirect('/');
	});
}


function loginHandler(req, res, next) {
	var username = xss(req.body.username);
	var password = xss(req.body.password);

	sql.isValidUser(username, password, function (err, user) {
	if (user) {
		console.log("This user is valid!");
		req.session.regenerate(function (){
			req.session.user = username;
			res.redirect('/menu'); //var wall
		});
	} else {
		console.log("This user is NOT valid!");
		var data = clone( formDataLogin );
		data.error = true;
		data.username=username;
		data.errorMessage="Wrong username or password :(";
		console.log("formDataLogin");
		console.dir(formDataLogin);
		console.log("data");
		console.dir(data);
		res.render('form', data);
	}
	});
}

function clone( object ){
	var data = {};
	for(var item in object){
		data[item] = object[item];
	}
	return data;
}

function createForm(req, res, next) {
	res.render('form', formDataCreate);
}

//TODO:ask for the "data.message", is it dangerous ?
function createHandler(req, res, next) {
	var username = xss(req.body.username);
	var password = xss(req.body.password);

	var data = formDataCreate;

	if( isEmpty(username) || isEmpty(password) ){
		handleSmallError(true,"username or password fail!");
		data.error = true;
		data.errorMessage = "User name and password is requried";
		res.render('form', data);
	} else {
		sql.isUserNTaken(username, function( error, userNameTaken ){
			handleSmallError(error,"auth.js: finding if username taken");
			if( !error ){
				if( userNameTaken ){
					sql.findRandomUserN( username, function(error, userNames){
						handleSmallError(error, "auth.js:find random User fail");
						data.error = true;
						data.errorMessage='"'+username+'" is already taken.';
						data.userNOptions=userNames;
						res.render('form', data);
					});
				} else if( !userNameTaken ){
					console.log("d");
					sql.createNewUser( username, password, function(error, success){
						if(error){
							console.log("auth.js:Error->Trying to create new user");
							console.log(error);
						}
						res.redirect('/menu');
					});
				}
			}
		});
	}
}


function handleSmallError( error, message ){
	if( error ){
		console.log( message );
		console.log(  error  );
	}
}

function isEmpty( variable ){
	var newString = variable.toString();
	return (newString.length !== 0) ? false : true;
}


module.exports = router;
