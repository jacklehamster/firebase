
function Lobby(callback) {
    var self = this;
    this.callback = callback;
    var firebaseRoot = new Firebase('https://mmo-ponk.firebaseio.com');
    var lobby = firebaseRoot.child('lobby');
    
    
    lobby.on('value', scoreChanged);
    function scoreChanged(snapshot) {
        var o = snapshot.val();
        self.table = o;
        if(self.callback) {
            self.callback(self);
        }
    }
}