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
				"score": data['message'],
				"complaints": data['abusiveCount']
			});
		},
			error : function(data) { console.log('error'); }
		});

	}
}
