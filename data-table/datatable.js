var firebase;

$(document).ready(function() {
    var json = []; 
    addBlankCells(json);
    $('#columns').columns({data:json});
    firebase = new Firebase('https://firelang.firebaseio.com/translations/');
});

function addBlankCells(json) {
    json.push({"row":"col"});
}
