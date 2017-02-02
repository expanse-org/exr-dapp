angular.
module('dashhead').
component('dashhead', {
    bindings: {
        title: '@'
    },
    templateUrl: 'core/dashhead/dashhead.template.html',
    controller: function(User) {
      //initialize them thangs
      this.$onInit = function() {
      //  this.accounts = User.getAccounts();
      }
    }
});
