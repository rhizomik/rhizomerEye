'use strict';

/**
 * @ngdoc function
 * @name rhizomerEyeApp.controller:DatasetEditCtrl
 * @description
 * # DatasetEditCtrl
 * Controller of the rhizomerEyeApp
 */
angular.module('rhizomerEyeApp')
  .controller('DatasetEditCtrl', function ($scope, $state, $stateParams, Dataset) {

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

    $scope.updateDatasetGraphs = function(newGraphs) {
      Dataset.updateDatasetGraphs({id : $stateParams.id}, newGraphs).$promise
        .then(function () {
          $state.go('dataset-edit', {id: $stateParams.id});
        })
        .catch(function (error) {
          $scope.error = error;
        });
    };

  });
