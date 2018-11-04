const MG = require("@mhhwang2002/MongoGraph");
const assert = require('chai').assert;
//const AG = require('../AGraph');
const MongoClient = require('mongodb').MongoClient ;
const TM = require("../TennisMatches");
const AG = require('AGraph');

function get_id(player_docs, player_name)
{
	for(let ii in player_docs) {
		let player = player_docs[ii];
		if(player.name == player_name )
			return player._id;
	}
	return null;
}
describe('Grand Slam Men\'s Finals', function(){  
 	let db_players="Test_Singles_players";
	let tbv_players="players";

	let db_Australian_Open = "Australian_Open_Tennis_Singles";
	let db_French_Open = "French_Open_Tennis_Singles";
	let db_Wimbledon = "Wimbledon_Tennis_Singles";
	let db_US_Open = "US_Open_Tennis_Singles";

    let tbv_tennis_matches = "matches"; 
    let tbe_players2matches = "players2matches";
    let db_url = 'mongodb://localhost:27017'; 

	var _players=[];
	it('Delete a member and  tournaments DBs  ', async() => { 
		try{
			let client = await MongoClient.connect(db_url, { useNewUrlParser: true});
			let gdb = new MG.Graph(client, {print_out:true});
			gdb.begin_profiling("Main"); 
				await gdb.clearDB(db_players);   
			    await gdb.clearDB(db_Australian_Open);  
			    await gdb.clearDB(db_French_Open); 
			    await gdb.clearDB(db_Wimbledon); 
			    await gdb.clearDB(db_US_Open);  
		    	await client.close();  
		    	//assert(0);
			gdb.end_profiling();   
		}
		catch(err){
			console.log(err); 
			assert(0);
		} 
		finally{

		}
	});

	it('Create a member DB from players ', async() => { 
		try{
			let client = await MongoClient.connect(db_url, { useNewUrlParser: true});
			let gdb = new MG.Graph(client, {print_out:true});
			gdb.begin_profiling("Main");    
			    let results = await gdb.insert(db_players, tbv_players, [{name:"Andy Murray"},{name:"Dominic Thiem"},{name:"Juan Martin del Potro"},
			    	{name:"Kevin Anderson"}, {name:"Marin Cilic"}, {name:"Milos Raonic"}, {name:"Novak Djokovic"}, {name:"Rafael Nadal"},
			    	{name:"Roger Federer"}, {name:"Stan Wawrinka"}]);
			    results = await gdb.get(db_players, tbv_players, {});
				assert(results.length == 10);
				for(let ii in results)
					_players.push(results[ii]);

		    	await client.close();  
		    	//assert(0);
			gdb.end_profiling();   
		}
		catch(err){
			console.log(err); 
			assert(0);
		}
	}); 
 
 	let tmatches = new TM.TennisMatches(db_url, db_players, tbv_players, tbe_players2matches);

 	it('Open Tennis DB Connection" ', async() => {  
		//let tmatches = new TM.TennisMatches(db_url, db_players, tbv_players, tbe_players2matches);
	 	try{  
	 		let b_result = await tmatches.open_DB_connection();
	 		assert(b_result);
	 	}
	 	catch(err){
	 		console.log(err); 
	 		assert(0);
	 	}  
	 });  

	it('Insert 2015 Grand Slam Men\'s Finals \n \
		2015 \tAustralian  \tNovak Djokovic \tAndy Murray           \t7-6, 6-7, 6-3, 6-0\n \
		2015 \tFrench Open \tStan Wawrinka  \tNovak Djokovic        \t4-6, 6-4, 6-3, 6-4\n \
		2015 \tWimbledon   \tNovak Djokovic \tRoger Federer         \t7-6, 6-7, 6-4, 6-3\n \
		2015 \tUP Open     \tNovak Djokovic \tRoger Federer         \t6-4, 5-7, 6-4, 6-4" ', async() => {  
		//let tmatches = new TM.TennisMatches(db_url, db_players, tbv_players, tbe_players2matches);
	 	try{ 
	 		let winer_id = get_id(_players, "Novak Djokovic"); assert(winer_id); 
	 		let opponent_id = get_id(_players, "Andy Murray"); assert(opponent_id);  
	 		let date = new Date(2015,0,1)// month counst from 0 not 1. 
	 		let results = await tmatches.insert_singles_match(db_Australian_Open, tbv_tennis_matches, winer_id, [7,6,6,6], opponent_id, [6,7,3,0], date );
	 		assert(results.length == 3); // one match two edges.
	 		
	 		winer_id = get_id(_players, "Stan Wawrinka"); assert(winer_id); 
	 		opponent_id = get_id(_players, "Novak Djokovic"); assert(opponent_id);   
	 		date = new Date(2015,4)// month counst from 0 not 1. 
	 		results = await tmatches.insert_singles_match(db_French_Open, tbv_tennis_matches, winer_id, [4,6,6,6], opponent_id, [6,4,3,4], date );
	 		assert(results.length == 3); // one match two edges. 
	 		
	 		winer_id = get_id(_players, "Novak Djokovic"); assert(winer_id); 
	 		opponent_id = get_id(_players, "Roger Federer"); assert(opponent_id);  
	 		date = new Date(2015,6)// month counst from 0 not 1. 
	 		results = await tmatches.insert_singles_match(db_Wimbledon, tbv_tennis_matches, winer_id, [7,6,6,6], opponent_id, [6,7,4,3], date );
	 		assert(results.length == 3); // one match two edges. 
	 	  
	 		winer_id = get_id(_players, "Novak Djokovic"); assert(winer_id); 
	 		opponent_id = get_id(_players, "Roger Federer"); assert(opponent_id);  
	 		date = new Date(2015,8)// month counst from 0 not 1. 
	 		results = await tmatches.insert_singles_match(db_US_Open, tbv_tennis_matches, winer_id, [6,5,6,6], opponent_id, [4,7,4,4], date );
	 		assert(results.length == 3); // one match two edges.
	 	}
	 	catch(err){
	 		console.log(err); 
	 		assert(0);
	 	}  
	 }); 
	  
    console.log("Year \tTournament      \tWinner         \tRunner-up             \tScore"); 
	console.log("2015 \tAustralian      \tNovak Djokovic \tAndy Murray           \t7-6, 6-7, 6-3, 6-0");
	console.log("2015 \tFrench Open     \tStan Wawrinka  \tNovak Djokovic        \t4-6, 6-4, 6-3, 6-4");
	console.log("2015 \tWimbledon       \tNovak Djokovic \tRoger Federer         \t7-6, 6-7, 6-4, 6-3");
	console.log("2015 \tUP Open         \tNovak Djokovic \tRoger Federer         \t6-4, 5-7, 6-4, 6-4");

	console.log("2016 \tAustralian Open \tNovak Djokovic \tAndy Murray           \t6-1, 7-5, 7-6");
	console.log("2016 \tFrench Open     \tNovak Djokovic \tAndy Murray           \t3-6, 6-1, 6-2, 6-4");
	console.log("2016 \tWimbledon       \tAndy Murray    \tMilos Raonic          \t6-4, 7-6, 7-6");
	console.log("2016 \tUS Open         \tStan Wawrinka  \tNovak Djokovic        \t6-7(, 6-4, 7-5, 6-3");
 
	it('Insert 2016 Grand Slam Men\'s Finals \n \
		2016 \tAustralian Open \tNovak Djokovic \tAndy Murray           \t6-1, 7-5, 7-6\n \
		2016 \tFrench Open     \tNovak Djokovic \tAndy Murray           \t3-6, 6-1, 6-2, 6-4\n \
		2016 \tWimbledon       \tAndy Murray    \tMilos Raonic          \t6-4, 7-6, 7-6\n \
		2016 \tUS Open         \tStan Wawrinka  \tNovak Djokovic        \t6-7, 6-4, 7-5, 6-3" ', async() => {  
		//let tmatches = new TM.TennisMatches(db_url, db_players, tbv_players, tbe_players2matches);
	 	try{
	 		let winer_id = get_id(_players, "Novak Djokovic"); assert(winer_id); 
	 		let opponent_id = get_id(_players, "Andy Murray"); assert(opponent_id); 
	 		let date = new Date(2016,0,1)// month counst from 0 not 1. 
	 		let results = await tmatches.insert_singles_match(db_Australian_Open, tbv_tennis_matches, winer_id, [6,7,7], opponent_id, [1,5,6], date );
	 		assert(results.length == 3); // one match two edges.
	 	 
	 		winer_id = get_id(_players, "Novak Djokovic"); assert(winer_id); 
	 		opponent_id = get_id(_players, "Andy Murray"); assert(opponent_id);  
	 		date = new Date(2016,4)// month counst from 0 not 1. 
	 		results = await tmatches.insert_singles_match(db_French_Open, tbv_tennis_matches, winer_id, [3,6,6,6], opponent_id, [6,1,2,4], date );
	 		assert(results.length == 3); // one match two edges.
	 	 
	 		winer_id = get_id(_players, "Andy Murray"); assert(winer_id); 
	 		opponent_id = get_id(_players, "Milos Raonic"); assert(opponent_id);  
	 		date = new Date(2016,6)// month counst from 0 not 1. 
	 		results = await tmatches.insert_singles_match(db_Wimbledon, tbv_tennis_matches, winer_id, [6,7,7], opponent_id, [4,6,6], date );
	 		assert(results.length == 3); // one match two edges. 
	 		
	 		winer_id = get_id(_players, "Stan Wawrinka"); assert(winer_id); 
	 		opponent_id = get_id(_players, "Novak Djokovic"); assert(opponent_id);  
	 		date = new Date(2016,8)// month counst from 0 not 1. 
	 		results = await tmatches.insert_singles_match(db_US_Open, tbv_tennis_matches, winer_id, [6,6,7,6], opponent_id, [7,4,5,3], date );
	 		assert(results.length == 3); // one match two edges.
	 	}
	 	catch(err){
	 		console.log(err); 
	 		assert(0);
	 	}  
	 }); 
	
	console.log("2017 \tAustralian Open \tRoger Federer  \tRafael Nadal          \t6-4, 3-6, 6-1, 3-6, 6-3");
	console.log("2017 \tFrench Open     \tRafael Nadal   \tStan Wawrinka         \t6-2, 6-3, 6-1");
	console.log("2017 \tWimbledon       \tRoger Federer  \tMarin Cilic           \t6-3, 6-1, 6-4");
	console.log("2017 \tUS Open         \tRafael Nadal   \tKevin Anderson        \t6-3, 6-3, 6-4");
    it('Insert 2017 Grand Slam Men\'s Finals \n \
		2017 \tAustralian Open \tRoger Federer  \tRafael Nadal          \t6-4, 3-6, 6-1, 3-6, 6-3\n \
		2017 \tFrench Open     \tRafael Nadal   \tStan Wawrinka         \t6-2, 6-3, 6-1\n \
		2017 \tWimbledon       \tRoger Federer  \tMarin CiliC           \t6-3, 6-1, 6-4\n \
		2017 \tUS Open         \tRafael Nadal   \tKevin Anderson        \t6-3, 6-3, 6-4" ', async() => {  
		//let tmatches = new TM.TennisMatches(db_url, db_players, tbv_players, tbe_players2matches);
	 	try{
	 		let winer_id = get_id(_players, "Roger Federer"); assert(winer_id); 
	 		let opponent_id = get_id(_players, "Rafael Nadal"); assert(opponent_id); 
	 		let date = new Date(2017,0,1)// month counst from 0 not 1. 
	 		let results = await tmatches.insert_singles_match(db_Australian_Open, tbv_tennis_matches, winer_id, [6,3,6,3,6], opponent_id, [4,6,1,6,3], date );
	 		assert(results.length == 3); // one match two edges.
	 	 
	 		winer_id = get_id(_players, "Rafael Nadal"); assert(winer_id); 
	 		opponent_id = get_id(_players, "Stan Wawrinka"); assert(opponent_id);  
	 		date = new Date(2017,4)// month counst from 0 not 1. 
	 		results = await tmatches.insert_singles_match(db_French_Open, tbv_tennis_matches, winer_id, [6,6,6], opponent_id, [2,3,1], date );
	 		assert(results.length == 3); // one match two edges.
	 	 
	 		winer_id = get_id(_players, "Roger Federer"); assert(winer_id); 
	 		opponent_id = get_id(_players, "Marin Cilic"); assert(opponent_id);  
	 		date = new Date(2017,6)// month counst from 0 not 1. 
	 		results = await tmatches.insert_singles_match(db_Wimbledon, tbv_tennis_matches, winer_id, [6,6,6], opponent_id, [3,1,4], date );
	 		assert(results.length == 3); // one match two edges. 
	 		
	 		winer_id = get_id(_players, "Rafael Nadal"); assert(winer_id); 
	 		opponent_id = get_id(_players, "Kevin Anderson"); assert(opponent_id);  
	 		date = new Date(2017,8)// month counst from 0 not 1. 
	 		results = await tmatches.insert_singles_match(db_US_Open, tbv_tennis_matches, winer_id, [6,6,6], opponent_id, [3,3,4], date );
	 		assert(results.length == 3); // one match two edges.
	 	}
	 	catch(err){
	 		console.log(err); 
	 		assert(0);
	 	}  
	 }); 
	console.log("2018 \tAustralian Open \tRoger Federer  \tMarin Cilic           \t6-2, 6-7, 6-3, 3-6, 6-1"); 
	console.log("2018 \tFrench Open     \tRafael Nadal   \tDominic Thiem         \t6-4, 6-3, 6-2");
	console.log("2018 \tWimbledon       \tNovak Djokovic \tKevin Anderson        \t6-2, 6-2, 7-6");
	console.log("2018 \tUS Open         \tNovak Djokovic \tJuan Martin del Potro \t6-3, 7-6, 6-4");
	it('Insert 2018 Grand Slam Men\'s Finals \n \
		2018 \tAustralian Open \tRoger Federer  \tMarin Cilic           \t6-2, 6-7, 6-3, 3-6, 6-1\n \
		2018 \tFrench Open     \tRafael Nadal   \tDominic Thiem         \t6-4, 6-3, 6-2\n \
		2018 \tWimbledon       \tNovak Djokovic \tKevin Anderson        \t6-2, 6-2, 7-6\n \
		2018 \tUS Open         \tNovak Djokovic \tKevin Anderson \t6-3, 7-6, 6-4" ', async() => {  
		//let tmatches = new TM.TennisMatches(db_url, db_players, tbv_players, tbe_players2matches);
	 	try{
	 		let winer_id = get_id(_players, "Roger Federer"); assert(winer_id); 
	 		let opponent_id = get_id(_players, "Marin Cilic"); assert(opponent_id); 
	 		let date = new Date(2018,0,1)// month counst from 0 not 1. 
	 		let results = await tmatches.insert_singles_match(db_Australian_Open, tbv_tennis_matches, winer_id, [6,6,6,3,6], opponent_id, [2,7,3,6,1], date );
	 		assert(results.length == 3); // one match two edges.
	 	 
	 		winer_id = get_id(_players, "Rafael Nadal"); assert(winer_id); 
	 		opponent_id = get_id(_players, "Dominic Thiem"); assert(opponent_id);  
	 		date = new Date(2018,4)// month counst from 0 not 1. 
	 		results = await tmatches.insert_singles_match(db_French_Open, tbv_tennis_matches, winer_id, [6,6,6], opponent_id, [4,3,2], date );
	 		assert(results.length == 3); // one match two edges.
	 	 
	 		winer_id = get_id(_players, "Novak Djokovic"); assert(winer_id); 
	 		opponent_id = get_id(_players, "Kevin Anderson"); assert(opponent_id);  
	 		date = new Date(2018,6)// month counst from 0 not 1. 
	 		results = await tmatches.insert_singles_match(db_Wimbledon, tbv_tennis_matches, winer_id, [6,6,7], opponent_id, [2,2,6], date );
	 		assert(results.length == 3); // one match two edges. 
	 		
	 		winer_id = get_id(_players, "Novak Djokovic"); assert(winer_id); 
	 		opponent_id = get_id(_players, "Kevin Anderson"); assert(opponent_id);  
	 		date = new Date(2018,7)// month counst from 0 not 1. 
	 		results = await tmatches.insert_singles_match(db_US_Open, tbv_tennis_matches, winer_id, [3,6,4] , opponent_id, [6,7,6], date );
	 		assert(results.length == 3); // one match two edges.
	 	}
	 	catch(err){
	 		console.log(err); 
	 		assert(0);
	 	}  
	}); 

	it('Update 2018 Grand Slam Men\'s Finals \n \
		2018 \tUS Open         \tNovak Djokovic \tJuan Martin del Potro \t6-3, 7-6, 6-4" ', async() => {  
		//let tmatches = new TM.TennisMatches(db_url, db_players, tbv_players, tbe_players2matches);
	 	try{ 
	 		let winer_id = get_id(_players, "Novak Djokovic"); assert(winer_id); 
	 		let opponent_id = get_id(_players, "Juan Martin del Potro"); assert(opponent_id);  
	 		let wrongdate = new Date(2018,7)// month counst from 0 not 1. 
	 		let G = await tmatches.find_singles_matches_G(db_US_Open, tbv_tennis_matches, winer_id, null, wrongdate, wrongdate); 
	 		let matches = G.getVtxs(function(entity) { return entity.date?true:false;}); // match vertice has date.  
	 		assert(matches.length == 1);
	 		let newDate =  new Date(2018,8);
	 		results = await tmatches.update_singles_match(db_US_Open, tbv_tennis_matches, matches[0]._id, winer_id, [6,7,6], opponent_id, [3,6,4], newDate );
	 		//assert(results.length == 3); // one match two edges.
	 	}
	 	catch(err){
	 		console.log(err); 
	 		assert(0);
	 	}  
	}); 

	it('Find final matches of "Federer" in Grand Slams 2015 to 2018', async() => { 
		try{ 
			//let tmatches = new TM.TennisMatches(db_url, db_players, tbv_players, tbe_players2matches);
			let player_id = get_id(_players, "Roger Federer"); assert(player_id);   
			var GrandSlamDB = [db_Australian_Open, db_French_Open, db_Wimbledon, db_US_Open];
			var GrandSlamFinals={}
			for(let ii in GrandSlamDB) {
				let db = GrandSlamDB[ii];
				let G = await tmatches.find_singles_matches_G(db, tbv_tennis_matches, player_id, null, new Date(2015,0), new Date(2018,11)); 
				GrandSlamFinals[db] = G;
			} 

			for (let db in GrandSlamFinals) {
				let G = GrandSlamFinals[db];
				let matches = G.getOutgoingEdgeDestinations(player_id);   
				for(let mi in matches){
					let match = matches[mi];
					console.log(db+" Final Macht=", match);
					let inE = G.getIncomingEdges(match);
					for(let ei in inE) {
						let edge = inE[ei];
						let player = G.getEdgeSource(edge); 
						console.log("\t Player=", player.name, ", Score=", edge.scores);
					}
				}
			}
		}
		catch(err){
			console.log(err); 
			assert(0);
		}  
	}); 
	it('Find final matches of "Federer" against "Djokovic" in Grand Slams 2015 to 2018', async() => { 
		try{ 
			//let tmatches = new TM.TennisMatches(db_url, db_players, tbv_players, tbe_players2matches);
			let player_id = get_id(_players, "Roger Federer"); assert(player_id);   
			let opponent_id = get_id(_players, "Novak Djokovic"); assert(opponent_id);   
			var GrandSlamDB = [db_Australian_Open, db_French_Open, db_Wimbledon, db_US_Open];
			var GrandSlamFinals={}
			for(let ii in GrandSlamDB) {
				let db = GrandSlamDB[ii];
				let G = await tmatches.find_singles_matches_G(db, tbv_tennis_matches, player_id, opponent_id, new Date(2015,0), new Date(2018,11)); 
				GrandSlamFinals[db] = G;
			} 

			for (let db in GrandSlamFinals) {
				let G = GrandSlamFinals[db];
				let matches = G.getOutgoingEdgeDestinations(player_id);   
				for(let mi in matches){
					let match = matches[mi];
					console.log(db+" Final Macht=", match);
					let inE = G.getIncomingEdges(match);
					for(let ei in inE) {
						let edge = inE[ei];
						let player = G.getEdgeSource(edge); 
						console.log("\t Player=", player.name, ", Score=", edge.scores);
					}
				}
			}
		}
		catch(err){
			console.log(err); 
			assert(0);
		}  
	}); 
	it('Find final matches of Grand Slams 2015 to 2018', async() => { 
		try{ 
			//let tmatches = new TM.TennisMatches(db_url, db_players, tbv_players, tbe_players2matches); 
			var GrandSlamDB = [db_Australian_Open, db_French_Open, db_Wimbledon, db_US_Open];
			var GrandSlamFinals={}
			for(let ii in GrandSlamDB) {
				let db = GrandSlamDB[ii];
				let G = await tmatches.find_singles_matches_G(db, tbv_tennis_matches, null, null, new Date(2015,0), new Date(2018,11)); 
				GrandSlamFinals[db] = G;
			} 

			for (let db in GrandSlamFinals) {
				console.log("################ <" + db + "> ####################");
				let G = GrandSlamFinals[db];
				let matches = G.getVtxs(function(entity) { return entity.date?true:false;}); // match vertice has date.  
				for(let mi in matches){
					let match = matches[mi];
					console.log(" Final Macht=", match);
					let inE = G.getIncomingEdges(match);
					for(let ei in inE) {
						let edge = inE[ei];
						let player = G.getEdgeSource(edge); 
						console.log("\t Player=", player.name, ", Score=", edge.scores);
					}
				}
				console.log("################# End of <" + db + "> ######################");
			}
		}
		catch(err){
			console.log(err); 
			assert(0);
		}  
	}); 
	it('Close Tennis DB Connection" ', async() => {  
		//let tmatches = new TM.TennisMatches(db_url, db_players, tbv_players, tbe_players2matches);
	 	try{  
	 		let b_result = await tmatches.close_DB_connection();
	 		assert(b_result);
	 	}
	 	catch(err){
	 		console.log(err); 
	 		assert(0);
	 	}  
	 }); 

});