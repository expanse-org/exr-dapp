'use strict';
angular.
module('footer').
component('footer', {
    templateUrl: 'core/footer/footer.template.html',
    controller: function() {
        this.version =  require('./package.json').version;
    }
});
