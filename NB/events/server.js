//core node modules
var express = require('express');
var http = require('http');
var mysql = require('mysql');
var app = express();
var bodyParser = require('body-parser');

//parse all from data
app.use(bodyParser.urlencoded({ extended: true }));

//used for formatting dates
var dateFormat =require('dateformat');
var now = new Date();


// view engine  ,  template parsing , using ejs types
app.set('view engine', 'ejs');

//import all js & css files to inject in the app
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js' ));
app.use('/js', express.static(__dirname + '/node_modules/tether/dist/js' ));
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist' ));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css' ));




const con = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "",
	database: "db_name" // must create db using CREATE DATABASE mydatabasename;
});  

/* & check the connection

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});
*/

const siteTitle = "Simple Application";
const baseURL = "http://localhost:4000/"

app.get('/',function(req, res){

	con.query("SELECT * FROM e_events ORDER BY e_start_date DESC",function(err, result){
		res.render('pages/index',{
			siteTitle : siteTitle,
			pageTitle : "Event list",
			items : result
		});
	});
});

app.get('/event/add',function(req, res){

	res.render('pages/add-event.ejs',{
		siteTitle : siteTitle,
		pageTitle : "Add new event",
		items : ''
	});
});

//When submitted 
app.post('/event/add',function(req, res){

	var query = "INSERT INTO `e_events` (e_name,e_start_date,e_end_date,e_desc,e_location) VALUES(";
		query += "'"+req.body.e_name+"',";
		query += "'"+dateFormat(req.body.e_start_date,"yyyy-mm-dd")+"',";
		query += "'"+dateFormat(req.body.e_end_date,"yyyy-mm-dd")+"',";
		query += "'"+req.body.e_desc+"',";
		query += "'"+req.body.e_location+"')";
	
	con.query(query, function(err, result){
		res.redirect(baseURL);
	});
});

app.get('/event/edit/:event_id',function (req,res){
	con.query("SELECT * FROM `e_events` WHERE `e_id` = '"+ req.params.event_id + "'",function(err,result){
	//format the date
	result[0].e_start_date =dateFormat(result[0].e_start_date,"yyyy-mm-dd");
	result[0].e_end_date =dateFormat(result[0].e_end_date,"yyyy-mm-dd");

		res.render('pages/edit-event.ejs',{
			siteTitle : siteTitle,
			pageTitle : "Editing event : " + result[0].e_name,
			item : result
		});
	});
});

//When submitted 
app.post('/event/edit/:event_id',function(req, res){

	var query = "UPDATE `e_events` SET";
		query += "`e_name` = '"+req.body.e_name+"',";
		query += "`e_start_date` = '"+req.body.e_start_date+"',";
		query += "`e_end_date` = '"+req.body.e_end_date+"',";
		query += "`e_desc` = '"+req.body.e_desc+"',";
		query += "`e_location` = '"+req.body.e_location+"'";
		query += " WHERE `e_events`.`e_id` = "+req.body.e_id+"";
	
	con.query(query, function(err, result){
		
		if(result.affectedRows)
		{
			res.redirect(baseURL);
		}
	});
});

app.get('/event/delete/:event_id',function (req,res){
	con.query("DELETE FROM e_events WHERE e_id = '"+ req.params.event_id + "'",function(err,result){
		if(result.affectedRows)
		{
			res.redirect(baseURL);
		}
	});
});


//connect to the server
var server = app.listen(4000,function (){
	console.log("Server started in 4000....");
});
