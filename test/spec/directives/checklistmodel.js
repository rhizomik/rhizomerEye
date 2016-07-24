'use strict';

describe('Directive: checklistModel', function () {

  // load the directive's module
  beforeEach(module('rhizomerEyeApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<checklist-model></checklist-model>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the checklistModel directive');
  }));
});
