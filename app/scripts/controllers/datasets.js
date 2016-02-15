'use strict';

/**
 * @ngdoc function
 * @name rhizomerEyeApp.controller:DatasetsCtrl
 * @description
 * # DatasetsCtrl
 * Controller of the rhizomerEyeApp
 */
angular.module('rhizomerEyeApp')
  .controller('DatasetsCtrl', function ($scope, Dataset) {

    $scope.datasets = [];
    $scope.loadAll = function() {
      Dataset.query(function(result) {
        $scope.datasets = result;
      });
    };

    $scope.loadAll();

  });
