import { Component, Input, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { BreadcrumbService } from '../../breadcrumb/breadcrumb.service';
import { Facet } from '../facet';
import { TranslateService } from '@ngx-translate/core';
import { Filter, Operator } from '../../breadcrumb/filter';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-detail-facet',
  templateUrl: './detail-facet.component.html',
  styleUrls: ['./detail-facet.component.css']
})
export class DetailFacetComponent implements OnInit {
  @Input() facet: Facet = new Facet();
  @Input() datasetId: string;
  @Input() classId: string;
  @Input() ngUnsubscribe: Subject<void> = new Subject<void>();
  private subscription: Subscription;

  constructor(
    public translate: TranslateService,
    private breadcrumbService: BreadcrumbService) {
  }

  ngOnInit() {
    this.subscription = this.breadcrumbService.filtersSelection.pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (filters: Filter[]) => {
        if (this.facet.selected &&
          !filters.find(filter => filter.classId == this.classId && filter.facet.uri == this.facet.uri)) {
          this.facet.selected = false;
        }
      });
  }

  filterAll() {
    if (!this.facet.selected) {
      this.breadcrumbService.addFacetFilter(new Filter(this.classId, this.facet, null, Operator.NONE, []));
      this.facet.selected = true;
    } else {
      this.breadcrumbService.removeFacetFilter(this.classId, this.facet, null);
      this.facet.selected = false;
    }
  }
}
