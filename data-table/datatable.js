var firebase;

$(document).ready(function() {
    var json = []; 
    addBlankCells(json);
    firebase = new Firebase('https://firelang.firebaseio.com/translations/');
    resetColumns(json);
});

function addBlankCells(json) {
    json.push({"":""});
}

function addColumn() {
    var title = prompt("Name of the new column","col");
    if(title) {
        firebase.child(title).set({a:"a"});
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
