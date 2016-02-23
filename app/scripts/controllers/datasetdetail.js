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
    $scope.datasetGraphs = Dataset.datasetGraphs({id : $stateParams.id});
    $scope.serverGraphs = Dataset.serverGraphs({id : $stateParams.id});
    $scope.isDatasetGraphsChanged = { value: false };

  });
