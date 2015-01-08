angular.module('app', ['ngWebSocket'])

.controller('mainCtrl', function($scope, $websocket) {
    var ws = $websocket('ws://localhost:8080/app');
        ws.send('testUser');
    ws.onMessage(function(message) {
        console.log('got message at client: ', message)
        var data = JSON.parse(message.data);
        $scope.type = data.data.event;
        $scope.data = JSON.stringify(data.data.info);
    });
    $scope.send = function() {
        var data = JSON.parse($scope.data);
        data.from = 'testUser';
        ws.send(JSON.stringify({
            type : "custom",
            data : {
                event : $scope.type,
                info : data
            }
        }));
    }
});