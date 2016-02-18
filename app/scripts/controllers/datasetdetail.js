'use strict';

/**
 * @ngdoc function
 * @name rhizomerEyeApp.controller:DatasetDetailCtrl
 * @description
 * # DatasetDetailCtrl
 * Controller of the rhizomerEyeApp
 */
angular.module('rhizomerEyeApp')
  .controller('DatasetDetailCtrl', function ($scope, $stateParams, Dataset) {

    $scope.dataset = Dataset.get({id : $stateParams.id});
    $scope.datasetGraphs = Dataset.datasetGraphs({id : $stateParams.id}, function(result) {
      $scope.newDatasetGraphs = angular.copy(result);
    });
    $scope.serverGraphs = Dataset.serverGraphs({id : $stateParams.id});

    $scope.isDatasetGraphsChanged = function() {
      return $scope.newDatasetGraphs.toString() !== $scope.datasetGraphs.toString();
    };

  });
