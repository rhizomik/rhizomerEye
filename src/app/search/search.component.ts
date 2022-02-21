import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { BreadcrumbService } from '../breadcrumb/breadcrumb.service';
import { Class } from '../class/class';
import { Description } from '../description/description';
import { Value } from '../description/value';
import { DatasetService } from '../dataset/dataset.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit, OnDestroy {
  datasetId: string;
  text: string;
  totalInstances = 0;
  page = 1;
  pageSize = 10;
  datasetClass: Class = new Class();
  resources: Description[] = [];
  anonResources: Map<string, Description> = new Map<string, Description>();
  labels: Map<string, Value> = new Map<string, Value>();
  showFacets: boolean;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    private datasetService: DatasetService) {
  }

  ngOnInit() {
    this.datasetId = this.route.snapshot.paramMap.get('did') || 'default';
    this.text = this.route.snapshot.queryParamMap.get('text');
    this.search(this.text);
  }

  search(text: string) {
    this.resources = undefined;
    this.totalInstances = undefined;
    this.page = 1;
    window.scrollTo(0, 0);
    this.datasetService.getSearchInstancesCount(this.datasetId, this.text).subscribe({
      next: count => this.totalInstances = count, error: () => { this.totalInstances = 0; this.resources = [] } });
    this.loadInstances(this.datasetId, this.text, this.page);
  }

  loadInstances(datasetId: string, text: string, page: number) {
    this.datasetService.searchInstances(datasetId, text, page, this.pageSize).subscribe(
      (instances) => {
        this.labels = new Map([...Description.getLabels(instances)]);
        if (instances['@graph']) {
          this.anonResources = Description.getAnonResources(instances, this.labels);
          this.resources =  Description.getResources(instances, this.labels);
        } else if (instances['@type']) {
          this.resources = [new Description(instances, instances['@context'], this.labels)];
        } else {
          this.resources = [];
        }
        this.sortResource();
      });
  }

  goToPage(page: number) {
    window.scrollTo(0, 0);
    this.resources = undefined;
    this.loadInstances(this.datasetId, this.text, page);
  }

  private sortResource() {
    this.resources.sort((a, b) => {
      if (a.label && b.label) {
        return a.label.toLowerCase().localeCompare(b.label.toLowerCase());
      } else if (!a.label && b.label) {
        return -1;
      } else if (a.label && !b.label) {
        return 1;
      } else {
        return a['@id'].localeCompare(b['@id']);
      }
    });
  }

  ngOnDestroy() {
    this.breadcrumbService.clearFilter();
  }
}

