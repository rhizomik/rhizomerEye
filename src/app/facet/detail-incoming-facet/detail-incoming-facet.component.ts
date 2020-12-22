import { Component, Input } from '@angular/core';
import { IncomingFacet } from '../incomingFacet';
import { Router } from '@angular/router';

@Component({
  selector: 'app-detail-incoming-facet',
  templateUrl: './detail-incoming-facet.component.html',
  styleUrls: ['./detail-incoming-facet.component.css']
})
export class DetailIncomingFacetComponent {
  @Input() datasetId: string;
  @Input() facet: IncomingFacet = new IncomingFacet();
  @Input() resource: string;

  constructor(private router: Router) {}

  browseIncoming(datasetId: string, classCurie: string, propertyCurie: string, resource: string): void {
    const queryParams = {};
    queryParams[propertyCurie + ' xsd:string'] = '"' + resource + '"';
    if (this.datasetId === 'default') {
      this.router.navigate(['/overview', classCurie], { queryParams: queryParams });
    } else {
      this.router.navigate(['/datasets', datasetId, classCurie], { queryParams: queryParams });
    }

  }
}
