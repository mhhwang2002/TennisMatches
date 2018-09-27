const AG = require('AGraph');
var TM= {} // TM is an object. 

/**
  create a graph=(VE,E) from a set of DB records.
  The created graph has "_id", "_src", "_dst".
*/
TM.constructGraph = function (records) 
{
  var G = new AG.AGraph("_id", "_src", "_dst");
  var edgeRecords = [];
  if(records) {
    //-- step 1. add all vertices and collect edges. 
    for(var ii=0; ii<records.length;ii++){
      var record = records[ii];
      if (record._src && record._dst)  // edge 
        edgeRecords.push(record); 
      else 
        G.addVtx(record._id, record); 
    }
    //-- step 2. add all edges 
    for(var ii=0; ii<edgeRecords.length;ii++){
      var edge = edgeRecords[ii];
      var src = edge._src;
      var dst = edge._dst;
      G.addEdge(edge._id, src._id, dst._id, edge); 
    } 
  } 
  return G;
}

/**
  get a partial graph of a given player from a total graph allMatchesG.
  The created graph has "_id", "_src", "_dst".
*/
TM.getPlayerGraph = function(playerId, allMatchesG)
{
  var answerG = new AG.AGraph("_id", "_src", "_dst");
  //-- get players scores of matches  
  if(playerId in allMatchesG.VE) { // if playerId is in VE. 
    var playerScoreEdges = allMatchesG.getOutgoingEdges(playerId); 

    //-- add match first 
    for(var ii=0; ii<playerScoreEdges.length;ii++){
      var playerScoreEdge = playerScoreEdges[ii];
      var matchID = playerScoreEdge._dst._id; // destination is a match
      var matchEntity = allMatchesG.getEntity(matchID);
      answerG.addVtx(matchID, matchEntity);  

      var matchPlayerScoreEdges = allMatchesG.getIncomingEdges(matchID); // get all player's score edges for a match 
      //-- add each player's score for the match 
      for(var jj=0; jj<matchPlayerScoreEdges.length;jj++){
        var playerScoreEdge = matchPlayerScoreEdges[jj];
        var playerID = playerScoreEdge._src._id; // source is a player
        if(!(playerID in answerG.VE)){
          var playerEntity = allMatchesG.getEntity(playerID);
          answerG.addVtx(playerID, playerEntity);  
        }
        answerG.addEdge(playerScoreEdge._id, playerID, matchID, playerScoreEdge);  
      }
    }  
  } 
  return answerG;
}

const MG = require("@mhhwang2002/MongoGraph");
const MongoClient = require('mongodb').MongoClient ;
const SINGLES="SG";
const DOUBLES="DB";

/**
 * TM.TennisMatches constructor 
 * @constructor
 */
TM.TennisMatches = function(db_url, db_member_name, table_member_name, table_player2match_name){
    this.db_url = db_url, 
	//this.print_out = (options && options.print_out)?options.print_out:false,
	this.fname_stack=[], 
	this.db_members=db_member_name, // member db 
    this.tbv_members=table_member_name,   // member table 
    this.tbe_players2matches=table_player2match_name, // player 2 match table

    /**
    * open connection of this client
    */
    this.open_DB_connection= async function()
    {
        try{
            this.client = await MongoClient.connect(this.db_url, { useNewUrlParser: true});
            this.gdb = new MG.Graph(this.client,{print_out:true});
            return true;
        }
        catch(err){
            console.log(err.message);
            return false;
        }
    }

    /**
    * close connection of this client.
    */
    this.close_DB_connection = async function()
    {
        try{
            await this.client.close();  
            return true;
        }
        catch(err){
            console.log(err.message);
            return false;
        }
    }

    /**
    * db_name: db name for a league.
    * match_table_name: collection name of the match to insert.
    * player1_id, player2_id: MongogDB generating _ids.
    * scores1 & scores2: an same size Array of numbers.
    * date: date of the match
    */
    this.insert_singles_match = async function(db_name, match_table_name, player1_id, scores1, player2_id, scores2, date)
    {
        try{ 
            //let this.gdb = new MG.Graph(this.client,{print_out:true});
            this.gdb.begin_profiling("insert_singles_match");
                await this.gdb.insert(db_name, match_table_name, [{date:date, type:SINGLES}])  
                let inserted_match = await this.gdb.getLastOne(db_name, match_table_name,{});  
                if( !inserted_match._id )  
                    throw "ERROR insert(DB="+db_name+", table="+match_table_name+")";

                let matchID=inserted_match._id;
                let player1E = {_src:{db:this.db_members, table:this.tbv_members, _id: player1_id}, _dst:{db:db_name, table:match_table_name, _id: matchID}, scores:scores1}; 
                let player2E = {_src:{db:this.db_members, table:this.tbv_members, _id: player2_id}, _dst:{db:db_name, table:match_table_name, _id: matchID}, scores:scores2}; 
                let edges = [player1E, player2E];
                let results = await this.gdb.insertEdge(db_name, this.tbe_players2matches, edges) ;
                if (results.ops.length != 2)
                    throw "ERROR insertEdge (DB="+db_name+", table="+this.tbe_players2matches+")";
                let result_total = [inserted_match].concat(results.ops);
                //await this.client.close();  
            this.gdb.end_profiling();
            return result_total;
        }
        catch(err){
            console.log(err);
        } 
    }

    /**
    * db_name: db name for a league.
    * match_table_name: collection name of the match to insert.    
    * player11_id, player12_id: MongogDB generating _ids for team1.
    * player21_id, player22_id: MongogDB generating _ids for team2.
    * scores1 & scores2: an same size Array of numbers.
    * date: date of the match
    */
    this.insert_doubles_match = async function(db_name, match_table_name, player11_id, player12_id, scores1, player21_id, player22_id, scores2, date)
    {
        try{
            //let this.client = await MongoClient.connect(this.db_url, { useNewUrlParser: true});
            //let this.gdb = new MG.Graph(this.client,{print_out:true});
            this.gdb.begin_profiling("insert_doublees_match");
                let result_match = await this.gdb.insert(db_name, match_table_name, [{date:date, type:DOUBLES}])  
                let inserted_match = await this.gdb.getLastOne(db_name, match_table_name,{});  
                if( !inserted_match._id )  
                    throw "ERROR insert(DB="+db_name+", table="+match_table_name+")"; 
                let matchID=inserted_match._id;

                let player11E = {_src:{db:this.db_members, table:this.tbv_members, _id: player11_id}, _dst:{db:db_name, table:match_table_name, _id: matchID}, scores:scores1};
                let player12E = {_src:{db:this.db_members, table:this.tbv_members, _id: player12_id}, _dst:{db:db_name, table:match_table_name, _id: matchID}, scores:scores1};
                let player21E = {_src:{db:this.db_members, table:this.tbv_members, _id: player21_id}, _dst:{db:db_name, table:match_table_name, _id: matchID}, scores:scores2};
                let player22E = {_src:{db:this.db_members, table:this.tbv_members, _id: player22_id}, _dst:{db:db_name, table:match_table_name, _id: matchID}, scores:scores2};
                let edges = [player11E, player12E, player21E, player22E];
                let results = await this.gdb.insertEdge(db_name, this.tbe_players2matches, edges) ;
                if (results.ops.length != 4)
                    throw "ERROR insertEdge (DB="+db_name+", table="+this.tbe_players2matches+")";
                //await this.client.close();  
                let result_total = [inserted_match].concat(results.ops);
            this.gdb.end_profiling();
            return result_total;
        }
        catch(err){
            console.log(err);
        } 
    }

    /**
    *
    */
    this.find_singles_matches_G = async function(db_name, match_table_name, player_id, oppoent_id, startDate, endDate)
    {    
        try{
            //let this.client = await MongoClient.connect(this.db_url, { useNewUrlParser: true});
            //let this.gdb = new MG.Graph(this.client,{print_out:true});
            this.gdb.begin_profiling("find_matches");
                let search_condition = {"$and":[{"date":{"$gte":startDate} }, {"date":{"$lte":endDate} }]};
                let edge_table_list = [{db:db_name, table:this.tbe_players2matches}];
                let MatchScorePlayers = await this.gdb.getInEV(db_name, match_table_name, search_condition, edge_table_list);
                //-- step2. filter out matches which is not related to the given player. 
                let allMatchesG = TM.constructGraph(MatchScorePlayers); 
                console.log("################ All Maches within Dates ##############")
                allMatchesG.printGraphStructure();

                let playerMatchG = player_id ? TM.getPlayerGraph(player_id, allMatchesG) : allMatchesG;
                let matches = oppoent_id ? TM.getPlayerGraph(oppoent_id, playerMatchG) : playerMatchG;
                console.log("################ Given Player's Maches within Dates ##############")
                matches.printGraphStructure();
                
                //await this.client.close();   
            this.gdb.end_profiling();
            return matches; // a graph
        }
        catch(err){
            console.log(err);
        }
    }

    /**
    *
    */
    this.find_doubles_matches_G = async function(db_name, match_table_name, player1_id, player2_id, oppoent1_id, oppoent2_id, startDate, endDate)
    {   
        try{
            //let this.client = await MongoClient.connect(this.db_url, { useNewUrlParser: true});
            //let this.gdb = new MG.Graph(this.client,{print_out:true});
            this.gdb.begin_profiling("find_matches");
                let search_condition = {"$and":[{"date":{"$gte":startDate} }, {"date":{"$lte":endDate} }]};
                let edge_table_list = [{db:db_name, table:this.tbe_players2matches}];
                let MatchScorePlayers = await this.gdb.getInEV(db_name, match_table_name, search_condition, edge_table_list);
                //-- step2. filter out matches which is not related to the given player. 
                let allMatchesG = TM.constructGraph(MatchScorePlayers); 
                console.log("################ All Maches within Dates ##############")
                allMatchesG.printGraphStructure();

                let player1MatchG = player1_id ? TM.getPlayerGraph(player1_id, allMatchesG) : allMatchesG;
                let player1N2MatchG = player2_id ? TM.getPlayerGraph(player2_id, player1MatchG) : player1MatchG;
                let op1Matches = oppoent1_id ? TM.getPlayerGraph(oppoent1_id, player1N2MatchG) : player1N2MatchG;
                let op1N2Matches = oppoent2_id ? TM.getPlayerGraph(oppoent2_id, op1Matches) : op1Matches;
                console.log("################ Given Player's Maches within Dates ##############")
                op1N2Matches.printGraphStructure();
                
                //await this.client.close();   
            this.gdb.end_profiling();
            return op1N2Matches; // a graph
        }
        catch(err){
            console.log(err);
        }
    }

    /**
    *
    */
    this.update_singles_match = async function(db_name, match_table_name, match_id, player1_id, scores1, player2_id, scores2, date)
    {
       try{ 
            //let this.gdb = new MG.Graph(this.client,{print_out:true});
            this.gdb.begin_profiling("update_singles_match");
                let result = await this.gdb.update(db_name, match_table_name, {_id:match_id}, {date:date});
                //console.log("result(match)=", result);  
                
                let results = await this.gdb.get(db_name, this.tbe_players2matches, {"_dst._id": match_id}) ;
                console.log(results);
                if(results.length != 2)
                    throw "ERROR get (DB="+db_name+", table="+this.tbe_players2matches+", condition={_dst._id:"+ match_id+"})";

                for(let ii in results) {
                    let OldDoc = results[ii];
                    let NewDoc = {};
                    if(ii==0)
                        NewDoc = {_src:{db:this.db_members, table:this.tbv_members, _id: player1_id}, _dst:{db:db_name, table:match_table_name, _id: match_id}, scores:scores1}; 
                    else 
                        NewDoc = {_src:{db:this.db_members, table:this.tbv_members, _id: player2_id}, _dst:{db:db_name, table:match_table_name, _id: match_id}, scores:scores2}; 
                    let result = await this.gdb.update(db_name, this.tbe_players2matches, {_id:OldDoc._id}, NewDoc);
                    //console.log("ii="+ii+", result(playerScoreEdge)=", result); 
                }  
                //let result_total = [inserted_match].concat(results.ops);
                //await this.client.close();  
            this.gdb.end_profiling();
            //return result_total;
        }
        catch(err){
            console.log(err);
        } 
    }

    /**
    *
    */
    this.update_doubles_match = async function(db_name, match_table_name, match_id, player11_id, player12_id, scores1, player21_id, player22_id, scores2, date)
    {
        try{ 
            //let this.gdb = new MG.Graph(this.client,{print_out:true});
            this.gdb.begin_profiling("update_doubles_match");
                let result = await this.gdb.update(db_name, match_table_name, {_id:match_id}, {date:date});
                //console.log("result(match)=", result);  
                
                let results = await this.gdb.get(db_name, this.tbe_players2matches, {"_dst._id": match_id}) ;
                console.log(results);
                if(results.length != 4)
                    throw "ERROR get (DB="+db_name+", table="+this.tbe_players2matches+", condition={_dst._id:"+ match_id+"})";

                for(let ii in results) {
                    let OldDoc = results[ii];
                    let NewDoc = {};
                    if(ii==0)
                        NewDoc = {_src:{db:this.db_members, table:this.tbv_members, _id: player11_id}, _dst:{db:db_name, table:match_table_name, _id: match_id}, scores:scores1}; 
                    else if(ii==1)
                        NewDoc = {_src:{db:this.db_members, table:this.tbv_members, _id: player12_id}, _dst:{db:db_name, table:match_table_name, _id: match_id}, scores:scores1}; 
                    else if(ii==2)
                        NewDoc = {_src:{db:this.db_members, table:this.tbv_members, _id: player21_id}, _dst:{db:db_name, table:match_table_name, _id: match_id}, scores:scores2}; 
                    else  
                        NewDoc = {_src:{db:this.db_members, table:this.tbv_members, _id: player22_id}, _dst:{db:db_name, table:match_table_name, _id: match_id}, scores:scores2}; 
                    let result = await this.gdb.update(db_name, this.tbe_players2matches, {_id:OldDoc._id}, NewDoc);
                    //console.log("ii="+ii+", result(playerScoreEdge)=", result); 
                }  
                //let result_total = [inserted_match].concat(results.ops);
                //await this.client.close();  
            this.gdb.end_profiling();
            //return result_total;
        }
        catch(err){
            console.log(err);
        } 
    }

    /**
    *
    */
    this.remove_match = async function(db_name, match_table_name, match_id, team1)
    {

    }
}

if (typeof module != 'undefined') // node
    module.exports = TM; //