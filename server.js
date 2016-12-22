#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var fs = require('fs');
var http = require('http');
var bodyParser = require('body-parser');
var mysql = require("mysql");
require("babel-polyfill");
var arr;

/**
 *  Define the sample application.
 */
var SampleApp = function() {

    //  Scope.
    var self = this;


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
        self.port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        }
    };


    /**
     *  Populate the cache.
     */
    self.populateCache = function() {
        if (typeof self.zcache === "undefined") {
            self.zcache = { 'index.html': '' };
        }

        //  Local cache for static content.
        self.zcache['index.html'] = fs.readFileSync('./index.html');
    };


    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function(key) { return self.zcache[key]; };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...',
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
        self.routes = { };

        self.routes['/asciimo'] = function(req, res) {
            var link = "http://i.imgur.com/kmbjB.png";
            res.send("<html><body><img src='" + link + "'></body></html>");
        };

        self.routes['/'] = function(req, res) {
            res.setHeader('Content-Type', 'text/html');
            res.send(self.cache_get('index.html') );
        };
		
				
		self.routes['/api/transactions'] = function(req, res) {
                var Arrow = arr;

				var selectFn = function () {
					/* @arrow :: _ ~> _ */
					var limit = parseInt(req.query['limit']) || 10,
					query = req.query['query'] || "select * from query.icd9 limit ?";
					connection.query(query, [limit], function (err, rows) {
						if (err) {
							res.json({
								"Error" : true,
								"Message" : "Error executing MySQL query: " + err
							});
						} else {
							res.json({
								"items" : rows,
								"count" : rows.length
							});
						}
					});
				};

				var getLimit = function() {
					/* @arrow :: _ ~> Number */
					return parseInt(req.query['limit']) || 10;
				};

				var handle = function (data) {
					/* @arrow :: _ ~> _ */
                    res.json({
                        "items" : data,
                        "count" : data.length
                    });
				};

				var dbQuery = function (limit) {
					/* @conf :: Number
					 * @resp :: _ */
					return {
						'query' : req.query['query'] || 'select * from query.icd9 limit ?',
                        'param' : [limit]
					}
				};

                getLimit.lift().seq(Arrow.db(dbQuery, connection), handle.lift()).run();
			};
	};


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.createRoutes();
        self.app = express.createServer();

        //  Add handlers for the app (from the routes).
        for (var r in self.routes) {
            self.app.get(r, self.routes[r]);
        }
		self.app.use('/dep', express.static('dep'));
        self.app.use('/data', express.static('data'));
    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.populateCache();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
		self.connectMysql();
    };

	self.connectMysql = function () {
		var self = this;
		var pool = mysql.createPool({
				connectionLimit : 100,
				host : process.env.OPENSHIFT_MYSQL_DB_HOST,
				port : process.env.OPENSHIFT_MYSQL_DB_PORT,
				user : process.env.OPENSHIFT_MYSQL_DB_USERNAME,
				password : process.env.OPENSHIFT_MYSQL_DB_PASSWORD,
				database : 'query',
				debug : false
			});
		pool.getConnection(function (err, connection) {
			if (err) {
				self.stop(err);
			} else {
				this.connection = connection;
				console.log('Connected to mysql!');
			}
		});
	};
	self.stop = function (err) {
		console.log("ISSUE WITH MYSQL n" + err);
	};
    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
		eval(fs.readFileSync('parser.js')+'');
		eval(fs.readFileSync('arrows.js')+'');
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), self.ipaddress, self.port);
						arr = Arrow;
        });
    };

};   /*  Sample Application.  */



/**
 *  main():  Main code.
 */
var zapp = new SampleApp();
zapp.initialize();
zapp.start();

