import { Filter } from '../breadcrumb/filter';
import { Facet } from '../facet/facet';
import { Labelled } from '../shared/labelled';

export class Value extends Labelled {
  count: number;
  uri: string;
  selected = false;

  constructor(values: Object = {}, facet: Facet, filters: Filter[]) {
    super(values);
    if (this.uri) {
      this.value = '<' + this.uri + '>';
    } else if (this.value.indexOf('^^') > 0) {
      this.value = '\"' + this.value.split('^^')[0] +
        '\"^^<' + this.value.split('^^')[1] + '>';
    } else {
      this.value = '\"' + this.value + '\"';
    }

    this.selected = filters.filter((filter: Filter) =>
      (filter.facet.id === facet.id && filter.value && filter.value === this.value)).length > 0;
  }
}
