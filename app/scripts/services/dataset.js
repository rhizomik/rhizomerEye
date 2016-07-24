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
        'getClasses': { method: 'GET', url: environment.api+'/datasets/:id/classes', isArray: true },
        'updateClasses': { method: 'PUT', url: environment.api+'/datasets/:id/classes', isArray: true },
        'datasetGraphs': { method: 'GET', url: environment.api+'/datasets/:id/graphs', isArray: true },
        'updateDatasetGraphs': { method: 'PUT', url: environment.api+'/datasets/:id/graphs', isArray: true },
        'serverGraphs': { method: 'GET', url: environment.api+'/datasets/:id/server/graphs', isArray: true }
      });
  });
