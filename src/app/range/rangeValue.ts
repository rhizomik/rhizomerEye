import { Filter } from '../breadcrumb/filter';
import { Facet } from '../facet/facet';
import { Labelled } from '../shared/labelled';

export class RangeValue extends Labelled {
  count: number;
  uri: string;
  selected = false;
  negated = false;

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
    const filter = filters.find(f => f.facet.id === facet.id && f.range.uri === facet.range);
    this.selected = filter?.values.find(value => value.value === this.value)?.selected || false;
    this.negated = filter?.values.find(value => value.value === this.value)?.negated || false;
  }
}
