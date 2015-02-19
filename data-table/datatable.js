var firebase;

$(document).ready(function() {
    var json = []; 
    $('#columns').columns({data:json});
    firebase = new Firebase('https://firelang.firebaseio.com/translations/');
});

function addBlankCells(json) {
    json.push({"":""});
}
