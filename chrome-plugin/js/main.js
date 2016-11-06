setInterval(function() {
		processPage();
		processUserNames(function() {
			processTweets();
		});
}, 500);


function processUserNames(callback){
	var classNames = ["DashboardProfileCard-screennameLink", "username", "twitter-atreply",
		"ProfileHeaderCard-screennameLink", "ProfileCard-screennameLink"];
		processUserClassName(classNames, 0, function() {
			callback();
		});
}

function processUserClassName(classNames, q, callback){
	className = classNames[q];
	var tags = $("." + className);
	getScoreByUsername(tags, 0, function() {
		if (q < classNames.length) {
			processUserClassName(classNames, q + 1, callback);
		}
		else {
			callback();
		}
	});
}

function getScoreByUsername(tags, i, callback) {
	var name = $(tags[i]).text().trim();
	var score = window.localStorage.getItem("hoya-user-"+name);
	if(score != null){
		score = parseInt(score);
	}
	if (score != null && score != -1) {
		renderUserName(score, tags[i]);
	}
	if(! isSane(name) || $(tags[i]).hasClass("hoyahacks") || (score != null)){
		if (i < tags.length) {
			getScoreByUsername(tags, i + 1, callback);
			return;
		}
		else {
			callback();
			return;
		}
	}
	window.localStorage.setItem("hoya-user-"+name, "-1");
	api.getScoreByUsername(name, tags[i], function(data, tag) {
		window.localStorage.setItem("hoya-user-"+name, data.score.toString());
		renderUserName(data.score, tag);
		if (i < tags.length) {
			getScoreByUsername(tags, i + 1, callback);
			return;
		}
		else {
			callback();
			return;
		}
	});
}

function isSane(name){
	return (name[0] == "@" && name.length > 1);
}

function renderUserName(score, tag){
	$(tag).addClass("hoyahacks");
	score = Math.floor(score);
	if(score > 80){
		$(tag).append("<span class='hoya-name green'>"+score+"</span>");
	}
	else if(score < 40){
		$(tag).append("<span class='hoya-name red'>"+score+"</span>");
	}
	else{
		$(tag).append("<span class='hoya-name yellow'>"+score+"</span>");
	}
}

function processPage(){
	var url = window.location.href.split("/");
	if(url.length != 4){
		$("#report-btn").remove();
		return;
	}
	if(url[3] == "following" || url[3] == "followers"){
		$("#report-btn").remove();
		return;
	}
	var name = url[3].trim();
	if(name.length < 1){
		$("#report-btn").remove();
		return;
	}
	name = "@" + name;
	var parent = $("#global-actions");
	var button = "<button class='btn hoya-btn' id='report-btn'>View Report</button";
	$("#report-btn").remove();
	parent.append(button);
	$("#report-btn").click(function(){
		api.getDataByUsername(name, function(data) {
			renderPopup(data);
		});
	});

}

function renderPopup(data){
	var score = "";
	data.score = Math.floor(data.score);
	if(data.score > 80){
		score = "<div class='score green'>" + data.score + "</div>";
	}
	else if(data.score < 40){
		score = "<div class='score red'>" + data.score + "</div>";
	}
	else{
		score = "<div class='score yellow'>" + data.score + "</div>";
	}
	var name = "<div class='name'>" + data.name + "</div>";
	var complaints = "<div class='complaints'>" + data.complaints + " complaints raised against user</div>";
	var femComplaints = "<div class='complaints'>" + data.femaleAbuseCount + " of them are raised by females</div>";
	$("body").append("<div class='hoya-hover' id='report-popup'><div class='hoya-popup'>"+name+score+complaints+femComplaints+"</div></div>");
	$("#report-popup").click(function(){
		$("#report-popup").remove();
	})
}

function processTweets() {
	var tweetsLi = $("li[data-item-type='tweet']");
	var data = [];

	for (var i = 0; i < tweetsLi.length; i++) {
		var  val = tweetsLi[i];
		var tid = $(val).attr('data-item-id');
		var tweetText = $($('.tweet-text')[i]).text();
		var userid = $($(".username.js-action-profile-name")[i]).text();
		var local = window.localStorage.getItem("hoya-tweet-"+tid);
		if(local == null){
			window.localStorage.setItem("hoya-tweet-"+tid, "-1");
			data.push({"tweet_id" : tid, "tweet" : tweetText, "user_id" : userid});
		}
		else if(local != "-1"){
			processTweet(JSON.parse(local));
		}
	}

	if(data.length > 0){
		api.getTweetAnalysis(data, function(response_data) {
			$.each(response_data, function(i, v) {
				window.localStorage.setItem("hoya-tweet-"+v['tweet_id'], JSON.stringify(v));
				processTweet(v);
			});
		});
	}
}

function processTweet(v){
	var tid = v['tweet_id'];
	if($("#hoya-black-" + tid).length != 0 && (! $("#hoya-black-" + tid).is(":visible"))) {
		return;
	}
	var abusive = v['abusive'];
	if (abusive === 'true') {
		var d = document.createElement('div');
		$(d).append('<div class="displayMessage">We found this tweet to be abusive. </div>');

		var showButton = document.createElement("div");
		showButton.className = 'showTweet';
		showButton.innerHTML = "Show Tweet";
		$(d).append(showButton);

		d.className = "hoya-blackbox";
		d.id = "hoya-black-" + tid;

		(function(tid) {
			$(showButton).on("click", function() {
				$("#hoya-black-" + tid).hide();
			});
		})(tid);

		$("#hoya-black-" + tid).remove();
		$("li[data-item-id='"+tid+"']").append(d);
	}
}