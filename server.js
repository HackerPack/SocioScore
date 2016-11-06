var express = require('express')
var pg = require('pg')
var twitter = require('twitter')
var request = require('request')
var cors = require('cors')
var log4js = require('log4js')
var logger = log4js.getLogger()
var bodyParser = require('body-parser');
var mailer = require('express-mailer');



var databasePort = process.env.CSDBPORT || 5432
var databasePassword = process.env.CSDBPASSWORD
var databaseURL = '10.126.79.76';//'localhost'//process.env.CSDBURL
var databaseName = 'trollwall' //process.env.CSDBNAME || ''
    // <<<<<<< HEAD
var databaseUserName = 'postgres' //process.env.CSDBUSER
var barkAccessToken = process.env.BARK_TOKEN
var app = express()

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({
    extended: true
})); // support encoded bodies


var conString = `postgres://${databaseUserName}:${databasePassword}@${databaseURL}:${databasePort}/${databaseName}`
var pgclient = new pg.Client(conString)
pgclient.connect()

app.use(cors())
app.get('/', function(req, res) {
    res.send('Hello World!')
})

app.listen(3000, function() {
    logger.info('Example app listening on port 3000!')
})



var phoneEmailids = []

pgclient.query("select phonenumber,emailid from users", function(error, result) {
    // logger.info(result)

    if (error || !result.rows)
        return

    // logger.info(result)
    for (var i = 0; i < result.rows.length; i++) {
        if (result.rows[i])
            phoneEmailids.push(result.rows[i])
    }

    // logger.info(JSON.stringify(phoneEmailids))
    handleStreams(phoneEmailids)
})

function checkTweets(message, callback) {
    request({
        url: 'https://partner.bark.us/api/v1/messages?token=' + barkAccessToken, //URL to hit
        // qs: {from: 'blog example', time: +new Date()}, //Query string data
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        },
        method: 'POST',
        //Lets post the following key/values as form
        json: {
            message: message
        }
    }, function(error, response, body) {
        if (error) {
            callback({
                success: false,
                message: 'Error in API call'
            });
        } else {
            if (body && body.success) {
                callback({
                    success: body.success,
                    message: body.abusive
                });
            } else {
                logger.info(body)
                console.log("FAILURE: RETRY");
                callback({
                    success: body.success,
                    message: 'API call failed'
                });
                // >>>>>>> 5345786512f4882c7c0d7d75e5e67428b20f29bc
            }
        }
    });
}



app.get('/phone/:phonenumber', function(req, res) {
    logger.info(req.params.phonenumber)

    pgclient.query("select * from harassers where harassers.phoneNumber='" + req.params.phonenumber + "'", function(error, response) {
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


app.post('/checkTweets', function(req, res) {
    logger.info(req.body)
    var tweets = req.body.tweets
    logger.info("these are the tweets ")
    logger.info(tweets)
        // var classifiedTweets = []
    function loop(index) {
        if (index >= tweets.length) {
            res.send(tweets)
            return;
        }

        pgclient.query("select * from tweets where id='" + tweets[index].tweet_id + "'",
            function(error, result) {

                if (!error && result.rows.length > 0) {

                    logger.info('tweet found in db')
                    logger.info(result.rows)
                    tweets[index].abusive = result.rows[0].abusive
                    delete(tweets[index].tweet)
                    loop(index + 1)

                } else {
                    setTimeout(function(index) {
                        request({
                            url: 'https://partner.bark.us/api/v1/messages?token=' + barkAccessToken, //URL to hit
                            // qs: {from: 'blog example', time: +new Date()}, //Query string data

                            method: 'POST',
                            //Lets post the following key/values as form
                            json: {
                                message: tweets[index].tweet
                            }
                        }, function(error, response, body) {
                            // if (isTimedOut) {
                            //  return
                            //  }
                            // }
                            // isReqComplete = true
                            // console(isReqComplete)
                            if (error) {
                                logger.info(error);
                            } else {
                                // logger.info(response.statusCode, body);
                                logger.info('reponse from bark api received')
                                if (body && body.success) {
                                    tweets[index].abusive = body.abusive
                                    delete(tweets[index].tweet)

                                    pgclient.query("insert into tweets (id, abusive) values ($1, $2)", [tweets[index].tweet_id, body.abusive], function(error, result) {
                                        if (!error)
                                            logger.info('inserted tweet into db')
                                        else
                                            logger.info('couldnt insert tweet into db')
                                    })
                                }
                            }
                            loop(index + 1)
                        })
                    }, 500, index)
                }

            })
    }

    if (tweets)
        loop(0)
    else
        res.send([]);
})

app.post('/addUser', function(req, res) {
    logger.info(req.body)
    var name = req.body.name || ''
    var phoneNumber = req.body.phoneNumber || ''
    var emailid = req.body.email || ''
    var twitterHandle = req.body.twitterHandle || ''
    var gender = req.body.gender || ''
    var race = req.body.race || ''

    console.log(phoneNumber)
    pgclient.query("insert into users (name, emailid, phonenumber, twitterhandle, gender, race) values ($1, $2, $3, $4, $5, $6)", [name, emailid, phoneNumber, twitterHandle, gender, race], function(error, response) {
        console.log(response)
        if (error) {
            res.send(error)

        } else {
            res.send('new user added successfully')
        }
    })
})

app.post('/addHarassment', function(req, res) {
    logger.info(req.body)
    var victim = req.body.victim;
    var harasser = req.body.harasser;
    var isfemale = req.body.isfemale;

    pgclient.query("insert into harassment_reports (victim, harasser, is_female) values ($1, $2, $3)", [victim, harasser, isfemale], function(error, response) {
        console.log(response)
        if (error) {
            res.send(error)

        } else {
            res.send('success')
        }
    })
})


app.get('/checkTweet', function(req, res) {
    logger.info(req.query.tweet)
        // var isTimedOut = false;
        // var isReqComplete = false;
        // res.send(req.query.tweet)

    // setTimeout(function() {
    //  if (isReqComplete)
    //      retur/n
    //  isTimedOut = true
    //  logger.info('trying to send timeout message')
    //  res.send('bark api not responding')

    // }, 5000)

    // request({ url: 'https://partner.bark.us/api/v1/messages?token=gympEyUqvY4Vg5P55nqo13uC', //URL to hit
    //     // qs: {from: 'blog example', time: +new Date()}, //Query string data

    //     method: 'POST',
    //     //Lets post the following key/values as form
    //     json: {
    //      message: req.query.tweet
    //      }
    //  }, function(error, response, body){
    //      // if (isTimedOut) {
    //      //  return
    //      //  }
    //      // }
    //      // isReqComplete = true
    //      // console(isReqComplete)
    //      if(error) {
    //          logger.info(error);
    //      } else {
    //          logger.info(response.statusCode, body);
    //          res.send(body)
    //      }
    //  });

    checkTweets(req.query.tweet, function(barkResponse) {
        res.send(barkResponse)
    })

})

function formatScore(score) {
    return score.toFixed(0)
}

function calculateScore(params, res, priorAbuse, femaleCount) {
	client.get('statuses/user_timeline', params, function(error, tweets, response) {
			//logger.info('indide the function after user timeline call')
			if (!error) {
					//timeoutPointer = setTimeout(function() {
					//  res.send({success : false, message : 'Timeout' });
					//}, 10000);

					// logger.info(tweets)
					var abusiveTweets = priorAbuse;
					var totalTweets = tweets.length;
					var processedCount = 0;
					// logger.info('tweets to be serached')
					// logger.info(tweets)
					function loop(index) {
							// logger.info('This is the value of tweetIterator')
							// logger.info(tweetIterator)
							if (index == totalTweets) {
									//clearTimeout(timeoutPointer);
									try {
											console.log("SENDING 1...");
											console.log(abusiveTweets);
											res.send({
													score: formatScore(100 * (1 - abusiveTweets / totalTweets)),
													abusiveCount: abusiveTweets,
													femaleAbuseCount: femaleCount
											});
											return;
									} catch (e) {}
							}
							// logger.info(tweets[index].id)
							// logger.info(tweets[index].text)
							pgclient.query("select * from tweets where id='" + tweets[index].id + "'", function(error, result) {
									// logger.info(result);
									if (!error && result.rows.length > 0) {
											// logger.info('user tweet found in db ')
											// index++
											// logger.info(result.rows[0].abusive)
											// logger.info()
											logger.info(result.rows[0].abusive, typeof result.rows[0].abusive, result.rows[0].abusive == 'true')
											if (result.rows[0].abusive == 'true')
													abusiveTweets++

													if (index == totalTweets) {
															//clearTimeout(timeoutPointer);
															try {
																	console.log("SENDING 2...");
																	console.log(abusiveTweets);
																	res.send({
																			score: formatScore(100 * (1 - abusiveTweets / totalTweets)),
																			abusiveCount: abusiveTweets,
																			femaleAbuseCount: femaleCount
																	});
																	return;
															} catch (e) {}
													}
											loop(index + 1)

									} else {
											setTimeout((function(index) {

													checkTweets(tweets[index].text, function(barkResponse) {
															// logger.info('inside the ekse part')
															// logger.info(tweets[index].text)
															// logger.info('barkResponse is')
															if (barkResponse.success) {
																	pgclient.query("insert into tweets (id, abusive) values ($1, $2)", [tweets[index].id, barkResponse.message], function(error, result) {
																			if (!error) {
																					// logger.info('inserted user tweet into db')
																					//logger.info(error)
																			} else {
																					// logger.info('couldnt insert user  tweet into db')
																					//logger.info(error)
																			}
																	})

															}


															if (barkResponse.success && barkResponse.message) {
																	abusiveTweets++;
															}

															if (index == totalTweets) {
																	//clearTimeout(timeoutPointer);
																	try {
																			console.log("SENDING 3...");
																			console.log(abusiveTweets);
																			res.send({
																					score: formatScore(100 * (1 - abusiveTweets / totalTweets)),
																					abusiveCount: abusiveTweets,
																					femaleAbuseCount: femaleCount
																			});
																			return;
																	} catch (e) {}
															}

															loop(index+1)
													});

											}), 500, index);
									}
							})
					}

					loop(0)

			} else {
					try {
							res.send({
									success: false,
									message: 'Error with Twitter API'
							});
					} catch (e) {}
			}
	});
}
app.get('/score/twitter/', function(request, res) {
    var params = {
        screen_name: request.query.user
    };
		var femaleCount = 0;
		var priorAbuse = 0;
		console.log(request.query.user)
		pgclient.query("select * from harassment_reports where harasser = $1", [request.query.user], function(e2, r2) {
			console.log(r2);
			if (!e2 && r2.rows.length > 0) {
				for ( z = 0 ; z < r2.rows.length ; z++) {
					if (r2.rows[z]['is_female'] == 'true') {
						femaleCount ++;
					}
				}
				priorAbuse = r2.rows.length;
				calculateScore(params, res, priorAbuse, femaleCount);
			}
			else {
				calculateScore(params, res, priorAbuse, femaleCount);
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

    // logger.info(phones)


    // client.stream('statuses/filter', {
    //     track: phones.join()
    // }, function(stream) {
    //     stream.on('data', function(event) {
    //         logger.info("data captured from stream")
    //             // logger.info(event)
    //         var mailOptions = {
    //             from: 'rakeshkumarwashere@gmail.com', // sender address
    //             to: 'rsukuma2@ncsu.edu', // list of receivers
    //             subject: 'Phone number exposed', // Subject line
    //             text: 'Your phone number was exposed and tweeted. Click here to see the tweet ' + "https://twitter.com/statuses/" + event.id_str, // plaintext body
    //             // html: '<b>Hello world 🐴</b>' // html body
    //         };

    //         transporter.sendMail(mailOptions, function(error, info) {
    //             if (error) {
    //                 return console.log(error);
    //             }
    //             console.log('Message sent: ' + info.response);
    //         });

    //         logger.info("The URL of the tweet is " + "https://twitter.com/statuses/" + event.id_str)
    //         logger.info(event && event.text);
    //     });

    //     stream.on('error', function(error) {
    //         // throw error;
    //         logger.info(error)
    //     });
    // });

}
