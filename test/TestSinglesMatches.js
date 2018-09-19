const MG = require("@mhhwang2002/MongoGraph");
const assert = require('chai').assert;
//const AG = require('../AGraph');
const MongoClient = require('mongodb').MongoClient ;
const TM = require("../TennisMatches");

describe('test a Graph in TWO DataBases', function(){ 
	console.log("Year \tTournament      \tWinner         \tRunner-up             \tScore");
	console.log("2018 \tUS Open         \tNovak Djokovic \tJuan Martín del Potro \t6-3, 7-6(7-5), 6-4");
	console.log("2018 \tWimbledon       \tNovak Djokovic \tKevin Anderson        \t6-2, 6-2, 7-6(7-3)");
	console.log("2018 \tFrench Open     \tRafael Nadal   \tDominic Thiem         \t6-4, 6-3, 6-2");
	console.log("2018 \tAustralian Open \tRoger Federer  \tMarin Cilic           \t6-2, 6-7(4-7), 6-3, 3-6, 6-1");
	console.log("2017 \tUS Open         \tRafael Nadal   \tKevin Anderson        \t6-3, 6-3, 6-4 [1]");
	console.log("2017 \tWimbledon       \tRoger Federer  \tMarin Čilić           \t6-3, 6-1, 6-4");
	console.log("2017 \tFrench Open     \tRafael Nadal   \tStan Wawrinka         \t6-2, 6-3, 6-1");
	console.log("2017 \tAustralian Open \tRoger Federer  \tRafael Nadal          \t6-4, 3-6, 6-1, 3-6, 6-3");
	console.log("2016 \tUS Open         \tStan Wawrinka  \tNovak Djokovic        \t6-7(1-7), 6-4, 7-5, 6-3");
	console.log("2016 \tWimbledon       \tAndy Murray    \tMilos Raonic          \t6-4, 7-6 (3), 7-6 (2)");
	console.log("2016 \tFrench Open     \tNovak Djokovic \tAndy Murray           \t3-6, 6-1, 6-2, 6-4");
	console.log("2016 \tAustralian Open \tNovak Djokovic \tAndy Murray           \t6-1, 7-5, 7-6 (3)");
	console.log("2015 \tUS Open         \tNovak Djokovic \tRoger Federer         \t6-4, 5-7, 6-4, 6-4");
	console.log("2015 \tWimbledon       \tNovak Djokovic \tRoger Federer         \t7-6 (1), 6-7 (10), 6-4, 6-3");
	console.log("2015 \tFrench Open     \tStan Wawrinka  \tNovak Djokovic        \t4-6, 6-4, 6-3, 6-4");
	console.log("2015 \tAustralian Open \tNovak Djokovic \tAndy Murray           \t7-6 (5), 6-7 (4), 6-3, 6-0");

 	let db_members="Test_members";
	let tbv_members="members";

	let db_tennis_league = "Test_tennis_league";
    let tbv_tennis_matches = "matches"; 
    let tbe_players2matches = "players2matches";
    let db_url = 'mongodb://localhost:27017';
    
	let match_date_2016_Aug = new Date(2016, 7, 24, 10, 33, 30, 0); // month counst from 0 not 1. 

	let match_date_2016_Jan = new Date(2016, 0, 0, 0, 0, 0, 0); // month counst from 0 not 1. 
	let match_date_2017_May = new Date(2017, 4, 0, 0, 0, 0, 0); // month counst from 0 not 1. 
	let match_date_2017_Jul = new Date(2017, 6, 0, 0, 0, 0, 0); // month counst from 0 not 1. 
    let match_date_2017_Sep = new Date(2017, 8, 0, 0, 0, 0, 0); // month counst from 0 not 1. 

	var _members=[], _matches=[];
	it('Test delete a member and a league in two DBs  ', async() => { 
		try{
			let client = await MongoClient.connect(db_url, { useNewUrlParser: true});
			let gdb = new MG.Graph(client, {print_out:true});
			gdb.begin_profiling("Main"); 
				await gdb.clearDB(db_members);  
			    await gdb.clearDB(db_tennis_league);   
		    	await client.close();  
		    	//assert(0);
			gdb.end_profiling();   
		}
		catch(err){
			console.log(err);
			assert(0); 
		} 
	});

	it('Test create a member DB with four players "Federer", "Nadal", "Djokovic", "Murray" ', async() => { 
		try{
			let client = await MongoClient.connect(db_url, { useNewUrlParser: true});
			let gdb = new MG.Graph(client, {print_out:true});
			gdb.begin_profiling("Main");   
			    let results = await gdb.insert(db_members, tbv_members, [{name:"Federer"},{name:"Nadal"},{name:"Djokovic"},{name:"Murray"}]);
			    results = await gdb.get(db_members, tbv_members, {});
				assert(results.length == 4);
				for(let ii in results)
					_members.push(results[ii]);

		    	await client.close();  
		    	//assert(0);
			gdb.end_profiling();   
		}
		catch(err){
			console.log(err);
			assert(0); 
		}
	});

	it('Test a single match "Federer" vs "Nadal" ', async() => { 
		try{
			let tmatches = new TM.TennisMatches(db_url, db_members, tbv_members, tbe_players2matches);
			let results = await tmatches.insert_singles_match(db_tennis_league, tbv_tennis_matches, _members[0]._id, [6,4,7], _members[1]._id, [4,6,5], match_date_2016_Aug);
			assert(results.length == 3); // one match two edges.
		}
		catch(err){
			console.log(err);
			assert(0);
		}  
	});

	it('Test find a single match "Federer" vs "Nadal" ', async() => { 
		try{ 
			let tmatches = new TM.TennisMatches(db_url, db_members, tbv_members, tbe_players2matches);
			let G = await tmatches.find_matches_G(db_tennis_league, tbv_tennis_matches, _members[0]._id, match_date_2016_Aug, match_date_2016_Aug);  
			assert(Object.keys(G.VE).length == 5); // one match + two score edges + two players;

			//console.log(JSON.stringify(G.VE));
		}
		catch(err){
			console.log(err);
			assert(0);
		}  
	});

});