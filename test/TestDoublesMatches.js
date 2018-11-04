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
 	let db_players="Test_Doubles_players";
	let tbv_players="players";

	let db_Australian_Open = "Australian_Open_Tennis_Doubles";
	let db_French_Open = "French_Open_Tennis_Doubles";
	let db_Wimbledon = "Wimbledon_Tennis_Doubles";
	let db_US_Open = "US_Open_Tennis_Doubles";

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
			    let results = await gdb.insert(db_players, tbv_players, [
			    	{name:"Bob Bryan"}, {name:"Feliciano Lopez"},{name:"Donald Young"},{name:"Feliciano López"},
			    	{name:"Henri Kontinen"}, {name:"Horia Tecău"},  {name:"Jack Sock"},  {name:"Jean-Julien Rojer"},
			    	{name:"John Peers"},  {name:"Juan Sebastián Cabal"},  {name:"Łukasz Kubot"},  {name:"Marc López"},
			    	{name:"Marcelo Melo"}, {name:"Mate Pavić"}, {name:"Michael Venus"}, {name:"Mike Bryan"}, 
			    	{name:"Nicolas Mahut"}, {name:"Oliver Marach"}, {name:"Pierre-Hugues Herbert"}, {name:"Raven Klaasen"}, 
			    	{name:"Robert Farah"}, {name:"Ryan Harrison"}, {name:"Santiago González"}]);
			    results = await gdb.get(db_players, tbv_players, {});
				assert(results.length == 23);
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

	it('Insert 2017 Grand Slam Men\'s Doubles Finals \n \
		2017 \tAustralian  \tHenri Kontinen & John Peers     \tBob Bryan & Mike Bryan             \t7-5, 7-5\n \
		2017 \tFrench Open \tRyan Harrison & Michael Venus   \tSantiago González  & Donald Young  \t7-6, 6-7, 6-3\n \
		2017 \tWimbledon   \tŁukasz Kubot & Marcelo Melo     \tOliver Marach & Mate Pavić         \t5-7, 7-5, 7-6, 3-6, 13-11\n \
		2017 \tUP Open     \tJean-Julien Rojer & Horia Tecău \tFeliciano López & Marc López       \t6-4, 5-7, 6-4, 6-4" ', async() => {  
		//let tmatches = new TM.TennisMatches(db_url, db_players, tbv_players, tbe_players2matches);
	 	try{ 
	 		let winer1_id = get_id(_players, "Henri Kontinen"); assert(winer1_id); 
	 		let winer2_id = get_id(_players, "John Peers"); assert(winer2_id); 
	 		let opponent1_id = get_id(_players, "Bob Bryan"); assert(opponent1_id);  
	 		let opponent2_id = get_id(_players, "Mike Bryan"); assert(opponent2_id);  

	 		let date = new Date(2017,0)// month counst from 0 not 1. 
	 		let results = await tmatches.insert_doubles_match(db_Australian_Open, tbv_tennis_matches, winer1_id, winer2_id, [7,7], 
	 			                                              opponent1_id, opponent2_id, [5,5], date);
	 		assert(results.length == 5); // one match 4 edges.
	 		
	 		winer1_id = get_id(_players, "Ryan Harrison"); assert(winer1_id); 
	 		winer2_id = get_id(_players, "Michael Venus"); assert(winer2_id); 
	 		opponent1_id = get_id(_players, "Santiago González"); assert(opponent1_id);  
	 		opponent2_id = get_id(_players, "Donald Young"); assert(opponent2_id);  

	 		date = new Date(2017,4)// month counst from 0 not 1. 
	 		results = await tmatches.insert_doubles_match(db_French_Open, tbv_tennis_matches, winer1_id, winer2_id, [7,6,6], 
	 			                                          opponent1_id, opponent2_id, [6,7,3], date);
	 		assert(results.length == 5); // one match 4 edges.

	 		winer1_id = get_id(_players, "Łukasz Kubot"); assert(winer1_id); 
	 		winer2_id = get_id(_players, "Marcelo Melo"); assert(winer2_id); 
	 		opponent1_id = get_id(_players, "Oliver Marach"); assert(opponent1_id);  
	 		opponent2_id = get_id(_players, "Mate Pavić"); assert(opponent2_id);  

	 		date = new Date(2017,6)// month counst from 0 not 1. 
	 		results = await tmatches.insert_doubles_match(db_Wimbledon, tbv_tennis_matches, winer1_id, winer2_id, [5,7,7,3,13], 
	 			                                          opponent1_id, opponent2_id, [7,5,6,6,11], date);
	 		assert(results.length == 5); // one match 4 edges

	 		winer1_id = get_id(_players, "Jean-Julien Rojer"); assert(winer1_id); 
	 		winer2_id = get_id(_players, "Horia Tecău"); assert(winer2_id); 
	 		opponent1_id = get_id(_players, "Feliciano López"); assert(opponent1_id);  
	 		opponent2_id = get_id(_players, "Marc López"); assert(opponent2_id);  

	 		date = new Date(2017,8)// month counst from 0 not 1. 
	 		results = await tmatches.insert_doubles_match(db_US_Open, tbv_tennis_matches, winer1_id, winer2_id, [6,5,6,6], 
	 			                                          opponent1_id, opponent2_id, [4,7,4,4], date);
	 		assert(results.length == 5); // one match 4 edges
	 	}
	 	catch(err){
	 		console.log(err); 
	 		assert(0);
	 	}  
	 }); 
	
  
	it('Insert 2018 Grand Slam Men\'s Doubles Finals \n \
		2018 \tAustralian  \tOliver Marach & Mate Pavić            \tJuan Sebastián Cabal & Robert Farah \t6-4, 6-4\n \
		2018 \tFrench Open \tPierre-Hugues Herbert & Nicolas Mahut \tOliver Marach & Mate Pavić          \t6-2, 7-6\n \
		2018 \tWimbledon   \tMike Bryan & Jack Sock                \tRaven Klaasen & Michael Venus       \t6-3, 6-7, 6-3, 5-7, 7-5\n \
		2018 \tUP Open     \tMike Bryan & Marcelo Melo                \tŁukasz Kubot & Jack Sock         \t3-3, 1-1" ', async() => {  
		//let tmatches = new TM.TennisMatches(db_url, db_players, tbv_players, tbe_players2matches);
	 	try{ 
	 		let winer1_id = get_id(_players, "Oliver Marach"); assert(winer1_id); 
	 		let winer2_id = get_id(_players, "Mate Pavić"); assert(winer2_id); 
	 		let opponent1_id = get_id(_players, "Juan Sebastián Cabal"); assert(opponent1_id);  
	 		let opponent2_id = get_id(_players, "Robert Farah"); assert(opponent2_id);  

	 		let date = new Date(2018,0)// month counst from 0 not 1. 
	 		let results = await tmatches.insert_doubles_match(db_Australian_Open, tbv_tennis_matches, winer1_id, winer2_id, [6,6], 
	 			                                              opponent1_id, opponent2_id, [4,4], date);
	 		assert(results.length == 5); // one match 4 edges.
	 		
	 		winer1_id = get_id(_players, "Pierre-Hugues Herbert"); assert(winer1_id); 
	 		winer2_id = get_id(_players, "Nicolas Mahut"); assert(winer2_id); 
	 		opponent1_id = get_id(_players, "Oliver Marach"); assert(opponent1_id);  
	 		opponent2_id = get_id(_players, "Mate Pavić"); assert(opponent2_id);   

	 		date = new Date(2018,4)// month counst from 0 not 1. 
	 		results = await tmatches.insert_doubles_match(db_French_Open, tbv_tennis_matches, winer1_id, winer2_id, [6,7], 
	 			                                          opponent1_id, opponent2_id, [2,6], date);
	 		assert(results.length == 5); // one match 4 edges.

	 		winer1_id = get_id(_players, "Mike Bryan"); assert(winer1_id); 
	 		winer2_id = get_id(_players, "Jack Sock"); assert(winer2_id); 
	 		opponent1_id = get_id(_players, "Raven Klaasen"); assert(opponent1_id);  
	 		opponent2_id = get_id(_players, "Michael Venus"); assert(opponent2_id);  

	 		date = new Date(2018,6)// month counst from 0 not 1. 
	 		results = await tmatches.insert_doubles_match(db_Wimbledon, tbv_tennis_matches, winer1_id, winer2_id, [6,6,6,5,7], 
	 			                                          opponent1_id, opponent2_id, [3,7,3,7,5], date);
	 		assert(results.length == 5); // one match 4 edges

	 		winer1_id = get_id(_players, "Mike Bryan"); assert(winer1_id); 
	 		winer2_id = get_id(_players, "Marcelo Melo"); assert(winer2_id); 
	 		opponent1_id = get_id(_players, "Łukasz Kubot"); assert(opponent1_id);  
	 		opponent2_id = get_id(_players, "Jack Sock"); assert(opponent2_id);  

	 		date = new Date(2018,7)// month counst from 0 not 1. 
	 		results = await tmatches.insert_doubles_match(db_US_Open, tbv_tennis_matches, winer1_id, winer2_id, [3,1], 
	 			                                          opponent1_id, opponent2_id, [3,1], date);
	 		assert(results.length == 5); // one match 4 edges
	 	}
	 	catch(err){
	 		console.log(err); 
	 		assert(0);
	 	}  
	 }); 
	it('Update 2018 Grand Slam Men\'s Doubles Finals \n \
		2018 \tUP Open     \tMike Bryan & Jack Sock                \tŁukasz Kubot & Marcelo Melo          \t6-3, 6-1" ', async() => {  
		//let tmatches = new TM.TennisMatches(db_url, db_players, tbv_players, tbe_players2matches);
	 	try{ 
	 		let winer1_id = get_id(_players, "Mike Bryan"); assert(winer1_id); 
	 		let winer2_id = get_id(_players, "Jack Sock"); assert(winer2_id); 
	 		let opponent1_id = get_id(_players, "Łukasz Kubot"); assert(opponent1_id);
	 		let opponent2_id = get_id(_players, "Marcelo Melo"); assert(opponent2_id);  
	 		let wrongdate = new Date(2018,7)// month counst from 0 not 1. 
	 		let G = await tmatches.find_doubles_matches_G(db_US_Open, tbv_tennis_matches, winer1_id, null, opponent1_id, null, wrongdate, wrongdate); 
	 		let matches = G.getVtxs(function(entity) { return entity.date?true:false;}); // match vertice has date.  
	 		assert(matches.length == 1);
	 		let newDate =  new Date(2018,8);
	 		results = await tmatches.update_doubles_match(db_US_Open, tbv_tennis_matches, matches[0]._id, winer1_id, winer2_id,[6,6], 
	 			                                                                                          opponent1_id, opponent2_id, [3,1], newDate );
	 	}
	 	catch(err){
	 		console.log(err); 
	 		assert(0);
	 	}  
	 }); 
	

	it('Find final matches of "Mike Bryan" in Grand Slams 2017 to 2018', async() => { 
		try{ 
			//let tmatches = new TM.TennisMatches(db_url, db_players, tbv_players, tbe_players2matches);
			let player_id = get_id(_players, "Mike Bryan"); assert(player_id);   
			var GrandSlamDB = [db_Australian_Open, db_French_Open, db_Wimbledon, db_US_Open];
			var GrandSlamFinals={}
			for(let ii in GrandSlamDB) {
				let db = GrandSlamDB[ii];
				let G = await tmatches.find_doubles_matches_G(db, tbv_tennis_matches, player_id, null, null, null, new Date(2017,0), new Date(2018,11)); 
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
	
	it('Find final matches of "Mike Bryan" against "Marcelo Melo" in Grand Slams 2017 to 2018', async() => { 
		try{ 
			//let tmatches = new TM.TennisMatches(db_url, db_players, tbv_players, tbe_players2matches);
			let player1_id = get_id(_players, "Mike Bryan"); assert(player1_id);   
			let opponent1_id = get_id(_players, "Marcelo Melo"); assert(opponent1_id);   
			var GrandSlamDB = [db_Australian_Open, db_French_Open, db_Wimbledon, db_US_Open];
			var GrandSlamFinals={}
			for(let ii in GrandSlamDB) {
				let db = GrandSlamDB[ii];
				let G = await tmatches.find_doubles_matches_G(db, tbv_tennis_matches, player1_id, null, opponent1_id, null, new Date(2017,0), new Date(2018,11)); 
				GrandSlamFinals[db] = G;
			} 

			for (let db in GrandSlamFinals) {
				let G = GrandSlamFinals[db];
				let matches = G.getOutgoingEdgeDestinations(player1_id);   
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
	it('Find final matches of "Mike Bryan" & "Bob Bryan" in Grand Slams 2017 to 2018', async() => { 
		try{ 
			//let tmatches = new TM.TennisMatches(db_url, db_players, tbv_players, tbe_players2matches);
			let player1_id = get_id(_players, "Mike Bryan"); assert(player1_id);   
			let player2_id = get_id(_players, "Bob Bryan"); assert(player2_id);   
			var GrandSlamDB = [db_Australian_Open, db_French_Open, db_Wimbledon, db_US_Open];
			var GrandSlamFinals={}
			for(let ii in GrandSlamDB) {
				let db = GrandSlamDB[ii];
				let G = await tmatches.find_doubles_matches_G(db, tbv_tennis_matches, player1_id, player2_id, null, null, new Date(2017,0), new Date(2018,11)); 
				GrandSlamFinals[db] = G;
			} 

			for (let db in GrandSlamFinals) {
				let G = GrandSlamFinals[db];
				let matches = G.getOutgoingEdgeDestinations(player1_id);   
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
	it('Find final matches of "Mike Bryan" & "Bob Bryan" against Henri "Kontinen" & "John Peers" in Grand Slams 2017 to 2018', async() => { 
		try{ 
			//let tmatches = new TM.TennisMatches(db_url, db_players, tbv_players, tbe_players2matches);
			let player1_id = get_id(_players, "Mike Bryan"); assert(player1_id);   
			let player2_id = get_id(_players, "Bob Bryan"); assert(player2_id);   
			let opponent1_id = get_id(_players, "Bob Bryan"); assert(opponent1_id);   
			let opponent2_id = get_id(_players, "Bob Bryan"); assert(opponent2_id);   
			var GrandSlamDB = [db_Australian_Open, db_French_Open, db_Wimbledon, db_US_Open];
			var GrandSlamFinals={}
			for(let ii in GrandSlamDB) {
				let db = GrandSlamDB[ii];
				let G = await tmatches.find_doubles_matches_G(db, tbv_tennis_matches, player1_id, player2_id, opponent1_id, opponent2_id, new Date(2017,0), new Date(2018,11)); 
				GrandSlamFinals[db] = G;
			} 

			for (let db in GrandSlamFinals) {
				let G = GrandSlamFinals[db];
				let matches = G.getOutgoingEdgeDestinations(player1_id);   
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
	 
	it('Find final doubles matches of Grand Slams 2017 to 2018', async() => { 
		try{ 
			//let tmatches = new TM.TennisMatches(db_url, db_players, tbv_players, tbe_players2matches); 
			var GrandSlamDB = [db_Australian_Open, db_French_Open, db_Wimbledon, db_US_Open];
			var GrandSlamFinals={}
			for(let ii in GrandSlamDB) {
				let db = GrandSlamDB[ii];
				let G = await tmatches.find_doubles_matches_G(db, tbv_tennis_matches, null, null, null, null, new Date(2017,0), new Date(2018,11)); 
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