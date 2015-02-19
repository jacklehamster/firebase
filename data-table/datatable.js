var firebase;

$(document).ready(function() {
    var json = []; 
    addBlankCells(json);
    firebase = new Firebase('https://firelang.firebaseio.com/translations/');
    firebase.on("child_added",onChildAdded);
    firebase.on("value",onBaseChanged)
    resetColumns(json);
});

function onBaseChanged(snapshot) {
    var o = snapshot.val();
    console.log("---");
    console.log(o);
    console.log(firebase);
    
}

function onChildAdded(snapshot) {
    var o = snapshot.val();
    console.log(o);
    console.log(firebase);
}

function addBlankCells(json) {
    json.push({"":""});
}

function addColumn() {
    var title = prompt("Name of the new column","col");
    if(title) {
        firebase.child(title).set({"dummy":"dummy"});
    }
}

function resetColumns(json) {
    $('#columns').columns({data:json});
    $(".ui-table").find("thead")[0].addEventListener("mousedown",
        function() {
            addColumn();
            
        }
    );
}
