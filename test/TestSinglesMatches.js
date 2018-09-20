const MG = require("@mhhwang2002/MongoGraph");
const assert = require('chai').assert;
//const AG = require('../AGraph');
const MongoClient = require('mongodb').MongoClient ;
const TM = require("../TennisMatches");

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
 	let db_members="Test_members";
	let tbv_members="members";

	let db_Australian_Open = "Australian_Open_Tennis";
	let db_French_Open = "French_Open_Tennis";
	let db_Wimbledon = "Wimbledon_Tennis";
	let db_US_Open = "US_Open_Tennis";

    let tbv_tennis_matches = "matches"; 
    let tbe_players2matches = "players2matches";
    let db_url = 'mongodb://localhost:27017'; 

	var _players=[];
	it('Delete a member and  tournaments DBs  ', async() => { 
		try{
			let client = await MongoClient.connect(db_url, { useNewUrlParser: true});
			let gdb = new MG.Graph(client, {print_out:true});
			gdb.begin_profiling("Main"); 
				await gdb.clearDB(db_members);   
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
	});

	it('Create a member DB from players ', async() => { 
		try{
			let client = await MongoClient.connect(db_url, { useNewUrlParser: true});
			let gdb = new MG.Graph(client, {print_out:true});
			gdb.begin_profiling("Main");    
			    let results = await gdb.insert(db_members, tbv_members, [{name:"Andy Murray"},{name:"Dominic Thiem"},{name:"Juan Martin del Potro"},
			    	{name:"Kevin Anderson"}, {name:"Marin Cilic"}, {name:"Milos Raonic"}, {name:"Novak Djokovic"}, {name:"NRafael Nadal"},
			    	{name:"Roger Federer"}, {name:"Stan Wawrinka"}]);
			    results = await gdb.get(db_members, tbv_members, {});
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
 
	it('Insert 2015 Grand Slam Men\'s Finals \n \
		2015 \tAustralian  \tNovak Djokovic \tAndy Murray           \t7-6, 6-7, 6-3, 6-0\n \
		2015 \tFrench Open \tStan Wawrinka  \tNovak Djokovic        \t4-6, 6-4, 6-3, 6-4\n \
		2015 \tWimbledon   \tNovak Djokovic \tRoger Federer         \t7-6, 6-7, 6-4, 6-3\n \
		2015 \tUP Open     \tNovak Djokovic \tRoger Federer         \t6-4, 5-7, 6-4, 6-4" ', async() => {  
		let tmatches = new TM.TennisMatches(db_url, db_members, tbv_members, tbe_players2matches);
	 	try{ 
	 		let winer_id = get_id(_players, "Novak Djokovic"); assert(winer_id); 
	 		let opponent_id = get_id(_players, "Andy Murray"); assert(opponent_id);  
	 		let date = new Date(2015,0,1,0,0,0,0)// month counst from 0 not 1. 
	 		let results = await tmatches.insert_singles_match(db_Australian_Open, tbv_tennis_matches, winer_id, [7,6,6,6], opponent_id, [6,7,3,0], date );
	 		assert(results.length == 3); // one match two edges.
	 		
	 		winer_id = get_id(_players, "Stan Wawrinka"); assert(winer_id); 
	 		opponent_id = get_id(_players, "Novak Djokovic"); assert(opponent_id);   
	 		date = new Date(2015,4,0,0,0,0,0)// month counst from 0 not 1. 
	 		results = await tmatches.insert_singles_match(db_French_Open, tbv_tennis_matches, winer_id, [4,6,6,6], opponent_id, [6,4,3,4], date );
	 		assert(results.length == 3); // one match two edges. 
	 		
	 		winer_id = get_id(_players, "Novak Djokovic"); assert(winer_id); 
	 		opponent_id = get_id(_players, "Roger Federer"); assert(opponent_id);  
	 		date = new Date(2015,6,0,0,0,0,0)// month counst from 0 not 1. 
	 		results = await tmatches.insert_singles_match(db_Wimbledon, tbv_tennis_matches, winer_id, [7,6,6,6], opponent_id, [6,7,4,3], date );
	 		assert(results.length == 3); // one match two edges. 
	 	  
	 		winer_id = get_id(_players, "Novak Djokovic"); assert(winer_id); 
	 		opponent_id = get_id(_players, "Roger Federer"); assert(opponent_id);  
	 		date = new Date(2015,8,0,0,0,0,0)// month counst from 0 not 1. 
	 		results = await tmatches.insert_singles_match(db_US_Open, tbv_tennis_matches, winer_id, [6,5,6,6], opponent_id, [4,7,4,4], date );
	 		assert(results.length == 3); // one match two edges.
	 	}
	 	catch(err){
	 		console.log(err);
	 		assert(0);
	 	}  
	 }); 
	  
	it('Insert 2016 Grand Slam Men\'s Finals \n \
		2016 \tAustralian Open \tNovak Djokovic \tAndy Murray           \t6-1, 7-5, 7-6\n \
		2016 \tFrench Open     \tNovak Djokovic \tAndy Murray           \t3-6, 6-1, 6-2, 6-4\n \
		2016 \tWimbledon       \tAndy Murray    \tMilos Raonic          \t6-4, 7-6, 7-6\n \
		2016 \tUS Open         \tStan Wawrinka  \tNovak Djokovic        \t6-7, 6-4, 7-5, 6-3" ', async() => {  
		let tmatches = new TM.TennisMatches(db_url, db_members, tbv_members, tbe_players2matches);
	 	try{
	 		let winer_id = get_id(_players, "Novak Djokovic"); assert(winer_id); 
	 		let opponent_id = get_id(_players, "Andy Murray"); assert(opponent_id); 
	 		let date = new Date(2016,0,1,0,0,0,0)// month counst from 0 not 1. 
	 		let results = await tmatches.insert_singles_match(db_Australian_Open, tbv_tennis_matches, winer_id, [6,7,7], opponent_id, [1,5,6], date );
	 		assert(results.length == 3); // one match two edges.
	 	 
	 		winer_id = get_id(_players, "Novak Djokovic"); assert(winer_id); 
	 		opponent_id = get_id(_players, "Andy Murray"); assert(opponent_id);  
	 		date = new Date(2016,4,0,0,0,0,0)// month counst from 0 not 1. 
	 		results = await tmatches.insert_singles_match(db_French_Open, tbv_tennis_matches, winer_id, [3,6,6,6], opponent_id, [6,1,2,4], date );
	 		assert(results.length == 3); // one match two edges.
	 	 
	 		winer_id = get_id(_players, "Andy Murray"); assert(winer_id); 
	 		opponent_id = get_id(_players, "Milos Raonic"); assert(opponent_id);  
	 		date = new Date(2016,6,0,0,0,0,0)// month counst from 0 not 1. 
	 		results = await tmatches.insert_singles_match(db_Wimbledon, tbv_tennis_matches, winer_id, [6,7,7], opponent_id, [4,6,6], date );
	 		assert(results.length == 3); // one match two edges. 
	 		
	 		winer_id = get_id(_players, "Stan Wawrinka"); assert(winer_id); 
	 		opponent_id = get_id(_players, "Novak Djokovic"); assert(opponent_id);  
	 		date = new Date(2016,8,0,0,0,0,0)// month counst from 0 not 1. 
	 		results = await tmatches.insert_singles_match(db_US_Open, tbv_tennis_matches, winer_id, [6,6,7,6], opponent_id, [7,4,5,3], date );
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

	console.log("2016 \tAustralian Open \tNovak Djokovic \tAndy Murray           \t6-1, 7-5, 7-6");
	console.log("2016 \tFrench Open     \tNovak Djokovic \tAndy Murray           \t3-6, 6-1, 6-2, 6-4");
	console.log("2016 \tWimbledon       \tAndy Murray    \tMilos Raonic          \t6-4, 7-6, 7-6");
	console.log("2016 \tUS Open         \tStan Wawrinka  \tNovak Djokovic        \t6-7(, 6-4, 7-5, 6-3");
	
	console.log("2017 \tAustralian Open \tRoger Federer  \tRafael Nadal          \t6-4, 3-6, 6-1, 3-6, 6-3");
	console.log("2017 \tFrench Open     \tRafael Nadal   \tStan Wawrinka         \t6-2, 6-3, 6-1");
	console.log("2017 \tWimbledon       \tRoger Federer  \tMarin Čilić           \t6-3, 6-1, 6-4");
	console.log("2017 \tUS Open         \tRafael Nadal   \tKevin Anderson        \t6-3, 6-3, 6-4");

	console.log("2018 \tAustralian Open \tRoger Federer  \tMarin Cilic           \t6-2, 6-7, 6-3, 3-6, 6-1"); 
	console.log("2018 \tFrench Open     \tRafael Nadal   \tDominic Thiem         \t6-4, 6-3, 6-2");
	console.log("2018 \tWimbledon       \tNovak Djokovic \tKevin Anderson        \t6-2, 6-2, 7-6");
	console.log("2018 \tUS Open         \tNovak Djokovic \tJuan Martín del Potro \t6-3, 7-6, 6-4");

	// it('Test find a single match "Federer" vs "Nadal" ', async() => { 
	// 	try{ 
	// 		let tmatches = new TM.TennisMatches(db_url, db_members, tbv_members, tbe_players2matches);
	// 		let G = await tmatches.find_matches_G(db_Australian_Open, tbv_tennis_matches, _players[0]._id, match_date_2016_Aug, match_date_2016_Aug);  
	// 		assert(Object.keys(G.VE).length == 5); // one match + two score edges + two players;

	// 		//console.log(JSON.stringify(G.VE));
	// 	}
	// 	catch(err){
	// 		console.log(err);
	// 		assert(0);
	// 	}  
	// }); 
});