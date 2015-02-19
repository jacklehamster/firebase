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
    var rows = {};
    for(var col in o) {
        for(var row in o[col]) {
            if(!rows[row]) {
                rows[row] = {};
            }
            var value = o[col][row].value;
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
    var firstColumn  = null;
    //  get columns name
    for(var i in json[0]) {
        if(i!='') {
            columnNames[i] = true;
            if(!firstColumn) firstColumn = i;
        }
    }
    
    var count = 1;
    while(columnNames["col"+count]) {
        count++;
    }
    if(firstColumn) {
        for(var i=0;i<json.length;i++) {
            var name = json[i][firstColumn];
            if(name) {
                firebase.child("col"+count).child(name).set({value:name});
            }
        }
    }
    firebase.child("col"+count).child("dummy").set({value:"dummy"});
    
}

function addRow(json) {
    var title = prompt("Enter new string");
    if(title) {
        for(var i in json[0]) {
            if(i!='') {
                firebase.child(i).child(title).set({value:title});
            }
        }
    }
}

function countColumns(json) {
    var columnNames = {};
    //  get columns name
    for(var j in json) {
        for(var i in json[j]) {
            columnNames[i] = true;
        }
    }

    var count = 0;
    for(var i in columnNames) {
        count++;
    }
    return count;
}

function countRows(json) {
    return json.length;
}

function resetColumns(json,destroy) {
    if(destroy)
        $("#columns").columns('destroy');
    $('#columns').columns({data:json});
    $(".ui-table").find('td').on("mousedown",
        function(e) {
            var cols = countColumns(json);
            var index = $(".ui-table").find('td').index(this);
            var col = index % cols;
            var row = Math.floor(index/cols);
            var rows = countRows(json);
            if(row==rows-1) {
                addRow(json);
            }
            else {
                e.preventDefault();
            }
        });;
    $(".ui-table").find('th').on("mousedown",
        function(e) {
            var cols = countColumns(json);
            var index = $(".ui-table").find('th').index(this);
            if(index==cols-1) {
                addColumn(json);
            }
            else {
                e.preventDefault();
            }
        });
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
