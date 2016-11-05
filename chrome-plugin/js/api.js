var api = {
	"getScoreByUsername": function(username){
		return { "score": Math.floor(Math.random() * 100) + 1 };
	},

	"getDataByUsername": function(username){
		return {
			"name": username + " " + username,
			"score": Math.floor(Math.random() * 100) + 1,
			"complaints": 10,
			"fake_accounts": 3
		}
	}
}