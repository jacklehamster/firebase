var firebase;
var json = [];

$(document).ready(function() {
    addBlankCells(json);
    firebase = new Firebase('https://firelang.firebaseio.com/translations/');
//    firebase.on("child_added",onChildAdded);
    firebase.on("value",onBaseChanged)
    resetColumns(json);
});

function onBaseChanged(snapshot) {
    var o = snapshot.val();
    json = [];
    var columns = {};
    for(var col in o) {
        columns[col] = true;
    }
    var rows = {};
    for(var col in o) {
        for(var row in o[col]) {
            if(!rows[row]) {
                rows[row] = {};
            }
            var value = o[col][row];
            rows[row][col] = value;
        }
    }
    for(var row in rows) {
        json.push(rows[row]);
    }
    addBlankCells(json);
    console.log(json);
    resetColumns(json);
}

function onChildAdded(snapshot) {
    var o = snapshot.val();
    console.log(o);
    console.log(firebase);
}

function addBlankCells(json) {
    //  add a blank column
    for(var i=0;i<json.length;i++) {
        json[i][""] = "";
    }
    
    //  add a blank row
    var newRow = {"":""};
    for(var col in json[0]) {
        newRow[col] = "";
    }
    json.push(newRow);
    
//    json.push({"":""});
}

function addColumn() {
    var title = prompt("Name of the new column","col");
    if(title) {
        firebase.child(title).set({"dummy":"dummy"});
    }
}

function resetColumns(json) {
    $("#columns").columns('destroy');
    $('#columns').columns({data:json});
    $(".ui-table").find("thead")[0].addEventListener("mousedown",
        function() {
            addColumn();
            
        }
    );
}
