var firebase;

$(document).ready(function() {
    var json = []; 
    addBlankCells(json);
    firebase = new Firebase('https://firelang.firebaseio.com/translations/');
    resetColumns();
});

function addBlankCells(json) {
    json.push({"":""});
}

function resetColumns() {
    $('#columns').columns({data:json});
    $(".ui-table").find("thead")[0].addEventListener("mousedown",function() {alert(123);});
}
