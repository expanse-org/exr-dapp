// NOTES:
// This service talks to the backend mongodb server
'user strict';

angular.module("bondService", []).
factory('Bond', function($http) {
 

  function getUserBonds() {
    return $http.get(apiUrl+'/events/all').then(function(data){
        return data.data.ret;
      }).catch(function(e){
        console.log(e);
      });
  }

    return {
      getUserBonds: getUserBonds
    }
});
