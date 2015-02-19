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

function resetColumns(json) {
    $('#columns').columns({data:json});
    $(".ui-table").find("thead")[0].addEventListener("mousedown",function() {alert(123);});
}
