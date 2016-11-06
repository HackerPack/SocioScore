var express = require('express')
var pg = require('pg')
var twitter = require('twitter')
var request = require('request')
var cors = require('cors')
var log4js = require('log4js')
var logger = log4js.getLogger()
var bodyParser = require('body-parser');


var databasePort = process.env.CSDBPORT || 5432
var databaseName = 'trollwall'//process.env.CSDBNAME || ''
// <<<<<<< HEAD
var databaseUserName = 'postgres'//process.env.CSDBUSER
// =======
// var databaseUserName = process.env.CSDBUSER
// >>>>>>> 5345786512f4882c7c0d7d75e5e67428b20f29bc
var databasePassword = process.env.CSDBPASSWORD
var databaseURL = '10.126.79.76';//'localhost'//process.env.CSDBURL
var barkAccessToken = process.env.BARK_TOKEN
var app = express()

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


var conString = `postgres://${databaseUserName}:${databasePassword}@${databaseURL}:${databasePort}/${databaseName}`
var pgclient = new pg.Client(conString)
pgclient.connect()

app.use(cors())
app.get('/', function (req, res) {
	res.send('Hello World!')
})

app.listen(3000, function () {
	logger.info('Example app listening on port 3000!')
})




var phoneEmailids = []

pgclient.query("select phonenumber,emailid from users", function (error, result) {
	// logger.info(result)

	if(error || !result.rows)
		return

	// logger.info(result)
	for (var i = 0; i < result.rows.length; i++) {
		if (result.rows[i])
			phoneEmailids.push(result.rows[i])
	}

	logger.info(JSON.stringify(phoneEmailids))
	handleStreams(phoneEmailids)
})

function checkTweets (message, callback) {
	request({ url: 'https://partner.bark.us/api/v1/messages?token='+barkAccessToken, //URL to hit
	    // qs: {from: 'blog example', time: +new Date()}, //Query string data
	    headers: {
		    'Content-Type': 'application/json; charset=utf-8'
		},
	    method: 'POST',
	    //Lets post the following key/values as form
	    json: {
	    	message: message
    	}
	}, function(error, response, body){
		if (error) {
			callback({success: false, message: 'Error in API call'});
		}
		else {
			if (body.success) {
				callback({success: body.success, message: body.abusive});
			}
			else {
				logger.info(body)
				console.log("FAILURE: RETRY");
				callback({success: body.success, message: 'API call failed'});
// >>>>>>> 5345786512f4882c7c0d7d75e5e67428b20f29bc
			}
		}
	});
}


app.get('/phone/:phonenumber', function (req, res) {
	logger.info(req.params.phonenumber)

	pgclient.query("select * from harassers where harassers.phoneNumber='"+req.params.phonenumber+"'", function (error, response) {
		// logger.info(error)
		// logger.info(response)
		// logger.info(response.rows)
		if (response.rows) {
			logger.info(response.rows[0])
			res.send(response.rows[0])
		} else {
			logger.info(reponse.rows)
			res.send(response.rows)
		}
	})
})

function queryBark(tweets, index) {
	if (index >= tweets.length)
			return tweets




}

app.post('/checkTweets', function (req, res) {
	logger.info(req.body)
	var tweets = req.body.tweets
	logger.info("these are the tweets " )
	logger.info(tweets)
	// var classifiedTweets = []
	function loop(index) {
		if (index >= tweets.length) {
			res.send(tweets)
			return;
		}


		setTimeout(function(index) {
		request({ url: 'https://partner.bark.us/api/v1/messages?token='+barkAccessToken, //URL to hit
	    // qs: {from: 'blog example', time: +new Date()}, //Query string data

	    method: 'POST',
	    //Lets post the following key/values as form
	    json: {
	    	message: tweets[index].tweet
    	}
		}, function(error, response, body){
			// if (isTimedOut) {
			// 	return
			// 	}
			// }
			// isReqComplete = true
			// console(isReqComplete)
			if(error) {
				logger.info(error);
			} else {
				// logger.info(response.statusCode, body);
				logger.info('reponse from bark api received')
				tweets[index].abusive = body.abusive
				delete(tweets[index].tweet)
				}
				// callback({success: body.success, abusive: body.abusive})

				// if (body.success) {
				// 	callback(body.abusive)
				// } else {
				// 	callback('api call failed')
				// }
				loop(index+1)
			})




	}, 500, index)
	}

	if (tweets)
		loop(0)
	else
		res.send([])
})

app.post('/addUser', function (req, res) {
	logger.info(req.body)
	var name = req.body.name || ''
	var phoneNumber = req.body.phoneNumber || ''
	var emailid = req.body.email || ''
	var twitterHandle = req.body.twitterHandle || ''


	console.log(phoneNumber)
	pgclient.query("insert into users (name, emailid, phonenumber, twitterhandle) values ($1, $2, $3, $4)", [name, emailid, phoneNumber, twitterHandle], function(error, response) {
		console.log(response)
		if (error) {
			res.send(error)

		} else {
			res.send('new user added successfully')
		}
	})
})

app.get('/checkTweet', function (req, res) {
	logger.info(req.query.tweet)
	// var isTimedOut = false;
	// var isReqComplete = false;
	// res.send(req.query.tweet)

	// setTimeout(function() {
	// 	if (isReqComplete)
	// 		retur/n
	// 	isTimedOut = true
	// 	logger.info('trying to send timeout message')
	// 	res.send('bark api not responding')

	// }, 5000)

	// request({ url: 'https://partner.bark.us/api/v1/messages?token=gympEyUqvY4Vg5P55nqo13uC', //URL to hit
	//     // qs: {from: 'blog example', time: +new Date()}, //Query string data

	//     method: 'POST',
	//     //Lets post the following key/values as form
	//     json: {
	//     	message: req.query.tweet
 //    	}
	// 	}, function(error, response, body){
	// 		// if (isTimedOut) {
	// 		// 	return
	// 		// 	}
	// 		// }
	// 		// isReqComplete = true
	// 		// console(isReqComplete)
	// 		if(error) {
	// 			logger.info(error);
	// 		} else {
	// 			logger.info(response.statusCode, body);
	// 			res.send(body)
	// 		}
	// 	});

	checkTweets(req.query.tweet, function(barkResponse) {
		res.send(barkResponse)
	})

})

app.get('/score/twitter/', function(request, res) {
	var params = {screen_name: request.query.user};
	client.get('statuses/user_timeline', params, function(error, tweets, response) {
		if (!error) {
			//timeoutPointer = setTimeout(function() {
			// 	res.send({success : false, message : 'Timeout' });
			//}, 10000);
			abusiveTweets = 0;
			totalTweets = tweets.length;
			processedCount = 0;
			for (tweetIterator in tweets) {
				setTimeout( (function(k) {
					checkTweets(tweets[k].text, function(barkResponse) {
						processedCount ++;
						if (barkResponse.success && barkResponse.message) {
							abusiveTweets ++;
						}

						if (processedCount == totalTweets) {
							//clearTimeout(timeoutPointer);
							try {
								res.send({ score : 100 * (1 - abusiveTweets / totalTweets), abusiveCount : abusiveTweets });
							}
							catch(e) {}
						}
					});
				}), 400 * tweetIterator, tweetIterator);
			}
		}
		else {
			try {
				res.send({success : false, message : 'Error with Twitter API' });
			}
			catch(e) {}
		}
	});
});



var client = new twitter({
	consumer_key: process.env.TWITTER_CONSUMER_KEY,
	consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
	access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
	access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});


function handleStreams(phoneEmailids) {

	var phones = []

	if (phoneEmailids.length == 0)
		return
	for (var i = 0; i < phoneEmailids.length; i++) {
		if (phoneEmailids[i].phonenumber) {
			phones.push(phoneEmailids[i].phonenumber)
		}
	}

	logger.info(phones)

	client.stream('statuses/filter', {track: phones.join()}, function(stream) {
  stream.on('data', function(event) {
    logger.info("data captured from stream")
    // logger.info(event)
    logger.info("The URL of the tweet is " + "https://twitter.com/statuses/"+event.id_str)
    logger.info(event && event.text);
  });

  stream.on('error', function(error) {
    // throw error;
    logger.info(error)
  });
});

}


var params = {q: '@gvivek19'};
client.get('search/tweets', params, function(error, tweets, response) {
	if (!error) {
		// logger.info(JSON.stringify(tweets));
	}
});
