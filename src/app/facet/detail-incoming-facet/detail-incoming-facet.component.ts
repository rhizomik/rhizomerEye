import { Component, Input } from '@angular/core';
import { IncomingFacet } from '../incomingFacet';
import { Router } from '@angular/router';
import { Dataset } from '../../dataset/dataset';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-detail-incoming-facet',
  templateUrl: './detail-incoming-facet.component.html',
  styleUrls: ['./detail-incoming-facet.component.css']
})
export class DetailIncomingFacetComponent {
  @Input() dataset: Dataset;
  @Input() facet: IncomingFacet = new IncomingFacet();
  @Input() resource: string;

  constructor(
    private router: Router,
    public translate: TranslateService) {
  }

  browseIncoming(domainCurie: string): void {
    const queryParams = {};
    if (this.dataset.queryType === 'OPTIMIZED') {
      queryParams[this.facet.curie + ' xsd:string'] = '"' + this.resource + '"';
    } else {
      queryParams[this.facet.curie + ' ' + this.facet.rangeCurie] = '<' + this.resource + '>';
    }
    if (this.dataset.id === 'default') {
      this.router.navigate(['/overview', domainCurie], { queryParams: queryParams });
    } else {
      this.router.navigate(['/datasets', this.dataset.id, domainCurie], { queryParams: queryParams });
    }

  }
}
