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

    $scope.tab = {
      selected: 1,
      setTab: function (newValue) {
        $scope.tab.selected = newValue;
      },
      isSet: function (tabName) {
        return $scope.tab.selected === tabName;
      }
    };

    $scope.dataset = Dataset.get({id : $stateParams.id});
    Dataset.datasetGraphs({id : $stateParams.id}, function(result) {
      $scope.datasetGraphs = result;
      $scope.newDatasetGraphs = angular.copy(result);
    });
    $scope.serverGraphs = Dataset.serverGraphs({id : $stateParams.id});
    $scope.isDatasetGraphsChanged = { value: false };

  });
