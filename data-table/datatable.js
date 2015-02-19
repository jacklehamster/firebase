var firebase;
var json = [];

$(document).ready(function() {
    addBlankCells(json);
    firebase = new Firebase('https://firelang.firebaseio.com/translations/');
//    firebase.on("child_added",onChildAdded);
    firebase.on("value",onBaseChanged)
    resetColumns(json,false);
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
    resetColumns(json,true);
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

function addColumn(json) {
    var columnNames = {};
    //  get columns name
    for(var i in json[0]) {
        if(i!='') {
            columnNames[i] = true;
        }
    }
    
    var count = 1;
    while(columnNames["col"+count]) {
        count++;
    }
    
    firebase.child("col"+count).set({"dummy":"dummy"});
    
}

function addRow(json) {
    for(var i in json[0]) {
        if(i!='') {
           firebase.child(i).child("newvalue").set("newvalue");
        }
    }
}

function resetColumns(json,destroy) {
    if(destroy)
        $("#columns").columns('destroy');
    $('#columns').columns({data:json});
    $(".ui-table").find('td').on("mousedown",
        function() {
            alert(this.innerHTML);
        });;
    /*
    var ths = $(".ui-table").find("thead").find("th");
    ths[ths.length-1].addEventListener("mousedown",
        function() {
            addColumn(json);
        }
    );
    var lastRow = $('tr[data-columns-row-id="'+(json.length-1)+'"]')[0];
    lastRow.addEventListener("mousedown",
        function() {
            addRow(json);
        });*/
}
