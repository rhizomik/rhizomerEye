'use strict';

/**
 * @ngdoc service
 * @name rhizomerEyeApp.Dataset
 * @description
 * # Dataset
 * Service in the rhizomerEyeApp.
 */
angular.module('rhizomerEyeApp')
  .service('Dataset', function ($resource, environment) {
    return $resource(environment.api+'/datasets/:id', {},
      {
        'update': { method: 'PUT' },
        'datasetGraphs': { method: 'GET', url: environment.api+'/datasets/:id/graphs', isArray: true },
        'serverGraphs': { method: 'GET', url: environment.api+'/datasets/:id/server/graphs', isArray: true }
      });
  });
