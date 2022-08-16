import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BreadcrumbService } from '../breadcrumb/breadcrumb.service';
import { Class } from '../class/class';
import { Description } from '../description/description';
import { Value } from '../description/value';
import { DatasetService } from '../dataset/dataset.service';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit, OnDestroy {
  datasetId: string;
  text: BehaviorSubject<string> = new BehaviorSubject<string>('');
  totalInstances = 0;
  page = 1;
  pageSize = 20;
  resources: Description[] = [];
  anonResources: Map<string, Description> = new Map<string, Description>();
  labels: Map<string, Value> = new Map<string, Value>();
  showFacets: boolean;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    public translate: TranslateService,
    private datasetService: DatasetService) {
  }

  ngOnInit() {
    this.datasetId = this.route.snapshot.paramMap.get('did') || 'default';
    this.route.queryParams.subscribe((params: Params) => this.text.next(params['text']));
    this.text.subscribe((text: string) => this.search(text));
  }

  search(text: string) {
    this.resources = undefined;
    this.totalInstances = undefined;
    this.page = 1;
    window.scrollTo(0, 0);
    this.datasetService.getSearchInstancesCount(this.datasetId, text).subscribe({
      next: count => this.totalInstances = count, error: () => { this.totalInstances = 0; this.resources = [] } });
    this.loadInstances(this.datasetId, text, this.page);
  }

  loadInstances(datasetId: string, text: string, page: number) {
    this.datasetService.searchInstances(datasetId, text, page, this.pageSize).subscribe({
      next: (instances) => {
        this.labels = new Map([...Description.getLabels(instances)]);
        if (instances['@graph']) {
          this.anonResources = Description.getAnonResources(instances, this.labels, this.translate.currentLang);
          this.resources =  Description.getTypedResources(instances, this.labels, this.translate.currentLang);
        } else if (instances['@type']) {
          this.resources = [new Description(instances, instances['@context'], this.labels, this.translate.currentLang)];
        } else {
          this.resources = [];
        }
        this.sortResource();
      },
      error: (error) => console.log(error)
    });
  }

  goToPage(page: number) {
    window.scrollTo(0, 0);
    this.resources = undefined;
    this.loadInstances(this.datasetId, this.text.getValue(), page);
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

  searchContains(text: string) {
    this.router.navigate([], { queryParams: { 'text': text } });
  }

  currentText(): string {
    return this.text.getValue()
  }

  ngOnDestroy() {
    this.breadcrumbService.clearFilter();
  }
}

