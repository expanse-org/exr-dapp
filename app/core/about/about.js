'use strict';
angular.
  module('about').
    component('about', {
      templateUrl: 'core/about/about.template.html',
      controller: function(){
        this.modal = {
          title: 'About'
        }
      }
    });
