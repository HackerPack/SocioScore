var hostaddress = 'http://localhost:3000/';

var api = {
	"getScoreByUsername": function(username, tag, callback){
		$.ajax({
			'url' : hostaddress + 'score/twitter/',
			'type' : 'get',
			'data' : { user : username },
			success : function(data) { callback( { "score" : data.score}, tag);
		},
			error : function(data) { console.log('error'); }
		});
	},

	"getDataByUsername": function(username, callback){
		$.ajax({
			'url' : hostaddress + 'score/twitter/',
			'type' : 'get',
			'data' : { user : username },
			success : function(data) { callback( {
				"name": username,
				"score": data['score'],
				"complaints": data['abusiveCount']
			});
		},
			error : function(data) { console.log(data);console.log('error'); }
		});
	},

	"getTweetAnalysis" : function(data, callback) {
		console.log("the data in the api.js method is:")
		console.log(data)
		$.ajax({
			'url' : hostaddress + 'checkTweets',
			'type' : 'post',
			'data' : {'tweets' : data },
			success : function(data) {
				callback([{ tweet_id : data[0].tweet_id, abusive : true}]);
			},
			error : function(data) { console.log(data); }
		});
	},

	"registerNewUser" : function(name, email, phone, twitter, callback) {
		$.ajax({
			'url' : hostaddress + 'addUser',
			'type' : 'post',
			'data' : {'name' : name, 'phoneNumber' : phone, 'email' : email, 'twitterHandle':twitter },
			success : function(data) {
				if (data == "new user added successfully") {
					callback({success : true});
				}
			},
			error : function(data) { console.log(data);callback({success:false}) }
		});
	}
}
