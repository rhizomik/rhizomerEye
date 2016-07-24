'use strict';

/**
 * @ngdoc function
 * @name rhizomerEyeApp.controller:DatasetClassFacetsCtrl
 * @description
 * # DatasetClassFacetsCtrl
 * Controller of the rhizomerEyeApp
 */
angular.module('rhizomerEyeApp')
  .controller('DatasetClassFacetsCtrl', function ($scope, $state, $stateParams, Dataset) {

    $scope.dataset = Dataset.get({id : $stateParams.did});
    $scope.class = Dataset.getClass({did : $stateParams.did, cid: $stateParams.cid});
    $scope.facets = Dataset.getClassFacets({did : $stateParams.did, cid: $stateParams.cid});

    $scope.refreshFacets = function() {
      Dataset.updateClassFacets({did: $stateParams.did, cid: $stateParams.cid}, []).$promise
        .then(function () {
          $scope.facets = Dataset.getClassFacets({did : $stateParams.did, cid: $stateParams.cid});
        })
        .catch(function (error) {
          $scope.error = error;
        });
    };

  });
