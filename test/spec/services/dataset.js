'use strict';

describe('Service: Dataset', function () {

  // load the service's module
  beforeEach(module('rhizomerEyeApp'));

  // instantiate service
  var DatasetService;
  beforeEach(inject(function (_Dataset_) {
    Dataset = _Dataset_;
  }));

  it('should do something', function () {
    expect(!!Dataset).toBe(true);
  });

});
