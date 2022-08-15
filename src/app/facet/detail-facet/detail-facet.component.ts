import { Component, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { BreadcrumbService } from '../../breadcrumb/breadcrumb.service';
import { Facet } from '../facet';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-detail-facet',
  templateUrl: './detail-facet.component.html',
  styleUrls: ['./detail-facet.component.css']
})
export class DetailFacetComponent {
  @Input() facet: Facet = new Facet();
  @Input() datasetId: string;
  @Input() classId: string;
  @Input() ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    public translate: TranslateService,
    private breadcrumbService: BreadcrumbService) {
  }

  filterAll() {
    if (!this.facet.selected) {
      this.breadcrumbService.addFacetFilter(this.classId, this.facet, null, null);
      this.facet.selected = true;
    } else {
      this.breadcrumbService.removeFacetFilter(this.classId, this.facet, null, null);
      this.facet.selected = false;
    }
  }
}
