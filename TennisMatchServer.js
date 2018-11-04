const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser());

const MongoClient = require('mongodb').MongoClient ;
const MG = require("@mhhwang2002/MongoGraph");
const TM = require("./TennisMatches");

let db_players="Test_Doubles_players";
let tbv_players="players";

let db_Australian_Open_Ds = "Australian_Open_Tennis_Doubles";
let db_French_Open_Ds = "French_Open_Tennis_Doubles";
let db_Wimbledon_Ds = "Wimbledon_Tennis_Doubles";
let db_US_Open_Ds = "US_Open_Tennis_Doubles";

let tbv_tennis_matches = "matches"; 
let tbe_players2matches = "players2matches";
let db_url = 'mongodb://localhost:27017'; 


app.post('/Search_Players', async (req, res, next) => {  
    console.log("req="+JSON.stringify(req.body));  // your JSON
    try 
    {
        let client = await MongoClient.connect(db_url, { useNewUrlParser: true});
        let gdb = new MG.Graph(client,{print_out:true});
        gdb.begin_profiling("Search_Players"); 
            let things = await gdb.get(db_players, tbv_players, {});  
            res.end(JSON.stringify(things)); 
        gdb.end_profiling();       
    }
    catch(e){
        next(e);
    }
});

function arraysEqual(arr1, arr2) {
    if(arr1.length !== arr2.length)
        return false;
    for(var i = arr1.length; i--;) {
        if(arr1[i] !== arr2[i])
            return false;
    }

    return true;
}

function M_getTwoTeams(players){
    let teams=[];
    if( players.length == 4) {
        if(players[0].team == players[1].team) {
            teams.push([players[0], players[1]]);
            teams.push([players[2], players[3]]);
        } else if(players[0].team == players[2].team) {
            teams.push([players[0], players[2]]);
            teams.push([players[1], players[3]]);
        } else if(players[0].team == players[3].team) {
            teams.push([players[0], players[3]]);
            teams.push([players[1], players[2]]);
        } else {
            console.log(JSON.stringify(players));
            console.log("################ ERROR: Same team doesn't exists ##########");
        }
    }
    return teams;
}
function M_getReadableDoublesMatches(G){
    let matches = G.getVtxs(function(entity) { return entity.date?true:false;}); //note: a match vertice has date.  
    matches.sort(function(a,b)  { // sort by date 'descending' 
        if (a.date < b.date) return 1;
        else if (a.date > b.date) return -1;
        else {
            if(Number(a.id) < Number(b.id)) // comparing in number for 9 < 10. 
                return 1;  // less                     
             else if(Number(a.id) > Number(b.id)) 
                return -1; // greater 
            else 
                return 0; // tie
        }
    });

    let readable_matches=[]
    for(let mi in matches) { 
        let matchvtx = matches[mi]; 
        console.log(" Final Macht=", matchvtx);
        let readable_match={date:matchvtx['date']}; 
        let inE = G.getIncomingEdges(matchvtx); 
        let players=[];
        for(let ei in inE) {
            let edge = inE[ei];
            let player = G.getEdgeSource(edge); 
            console.log("\t Player=", player.name, ", Score=", edge.scores);
            players.push({name:player.name, scores:edge.scores, team:edge.team});
        }

        readable_match["players"]=M_getTwoTeams(players);
        readable_matches.push(readable_match);
    }

    return readable_matches;
}

//app.post('/Search_Matches_Of_Player', function (req, res) {  
app.post('/Search_Matches_Of_Player', async (req, res, next) =>{  
    try 
    {
        console.log("req="+JSON.stringify(req.body));  // your JSON
        let playerDBId = null; // get_DB_id(GMemberArray, req.body.PlayerId);
        let client = await MongoClient.connect(db_url, { useNewUrlParser: true});
        let tmatches = new TM.TennisMatches(db_url, db_players, tbv_players, tbe_players2matches);  
        await tmatches.open_DB_connection();

        let startDate = new Date(2015,0);  let endDate = new Date(2018,11);
        let GrandSlamDB_names = [db_Australian_Open_Ds, db_French_Open_Ds, db_Wimbledon_Ds, db_US_Open_Ds];
        let GrandSlamFinals={}
        for(let ii in GrandSlamDB_names) {
            let db_names = GrandSlamDB_names[ii];
            let G = await tmatches.find_doubles_matches_G(db_names, tbv_tennis_matches, playerDBId, null, null, null, startDate, endDate); 
            GrandSlamFinals[db_names] = G;
        } 
        //await 
        tmatches.close_DB_connection(); // <-- done by parallel.

        let total_matches={};
        //-- formating matches in a human-readable Object 
        for (let db_name in GrandSlamFinals) {
            console.log("################ <" + db_name + "> ####################");
            let G = GrandSlamFinals[db_name]; 
            let matches = M_getReadableDoublesMatches(G);
            total_matches[db_name] = matches;
            console.log("################# End of <" + db_name + "> ######################");
        }
        res.end(JSON.stringify(total_matches));
    }
    catch(e) {
        next(e);
    }
    
});


app.use('/', express.static(__dirname)); //  + '/public'));

let port_no = 8124;
//var server = app.listen(port_no, '192.168.1.3', function () { 
var server = app.listen(8081, '127.0.0.1', function () { 
//var server = app.listen(8521, '192.168.1.9', function () { 
  let host = server.address().address
  let port = server.address().port 
  console.log("Example app listening at http://%s:%s", host, port);
});