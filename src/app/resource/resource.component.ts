import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DatasetService } from '../dataset/dataset.service';
import { Description } from '../description/description';
import { UriUtils } from '../shared/uriutils';
import { Resource } from './resource';
import { IncomingFacet } from '../facet/incomingFacet';
import { Dataset } from '../dataset/dataset';
import { TranslateService } from '@ngx-translate/core';
import { FacetDomain } from '../facet/facetDomain';

@Component({
  selector: 'app-resource',
  templateUrl: './resource.component.html',
  styleUrls: ['./resource.component.css']
})
export class ResourceComponent implements OnInit, OnDestroy {
  datasetId: string;
  dataset: Dataset;
  resourceUri: string;
  resource: Resource = new Resource();
  content: string;
  anonResources: Map<string, Description> = new Map<string, Description>();
  labels: Map<string, any> = new Map<string, any>();
  remoteAnonResources: Map<string, Description> = new Map<string, Description>();
  incomings: IncomingFacet[];
  loading = true;
  showFacets: boolean;

  constructor(private router: Router,
              private route: ActivatedRoute,
              private datasetService: DatasetService,
              public translate: TranslateService,
              @Inject(DOCUMENT) private document: any) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.resource = new Resource({}, {}, new Map(), new Map(), this.translate.currentLang);
  }

  ngOnInit() {
    this.datasetId = this.route.snapshot.paramMap.get('did') || 'default';
    this.resourceUri = this.route.snapshot.queryParamMap.get('uri') || this.document.location.href;
    this.datasetService.get(this.datasetId).subscribe((dataset) => this.dataset = dataset);
    this.datasetService.describeDatasetResource(this.datasetId, this.resourceUri).subscribe({
      next: (response) => {
        if (response['@graph']) {
          this.labels = Description.getLabels(response);
          this.anonResources = Description.getAnonResources(response, this.labels);
          const resources = response['@graph']
            .filter(instance => UriUtils.expandUri(instance['@id'], response['@context']) === this.resourceUri)
            .map(instance =>
              new Resource(instance, response['@context'], this.labels, this.anonResources, this.translate.currentLang));
          this.resource = resources.length ? resources[0] :
            new Resource({}, {}, new Map(), new Map(), this.translate.currentLang);
          this.browseContent(response['@context']);
        } else if (response['@id'] && response['@context'] &&
          UriUtils.expandUri(response['@id'], response['@context']) === this.resourceUri) {
          this.resource = new Resource(response, response['@context'], new Map(), new Map(), this.translate.currentLang);
          this.browseContent(response['@context']);
        }
        this.setPageJsonLd(this.resource);
        this.browseRemoteData(this.datasetId, this.resourceUri);
      },
      error: () => {
        this.onNoData();
      }
    });
    this.datasetService.resourceIncomingFacets(this.datasetId, this.resourceUri).subscribe({
      next: (incomings) => {
        this.incomings = incomings
          .map(incoming => new IncomingFacet(incoming))
          .sort((a, b) =>
            a.getLabel(this.translate.currentLang).localeCompare(b.getLabel(this.translate.currentLang)));
        this.incomings.forEach(incoming =>
          incoming.domains = incoming.domains
            .map(domain => new FacetDomain(domain))
            .sort((a, b) =>
              a.getLabel(this.translate.currentLang).localeCompare(b.getLabel(this.translate.currentLang))));
      },
      error: () => this.incomings = []
    });
  }

  private browseContent(context: Object = {}) {
    if (!this.resource.anonBody && this.resource.topicOf.length > 0) {
      this.browseRemoteContent(this.datasetId,
        UriUtils.expandUri(this.resource.topicOf[0].asString(), context));
    } else {
      this.loading = false;
    }
  }

  private browseRemoteContent(datasetId: string, url: string) {
    if (url && UriUtils.isUrl(url)) {
      this.datasetService.browseUriContent(datasetId, url).subscribe(content => {
        this.content = content;
        this.loading = false;
      });
    } else {
      this.loading = false;
    }
  }

  private browseRemoteData(datasetId: string, uri: string) {
    if (!UriUtils.isUrl(uri)) {
      this.loading = false;
      return;
    }
    this.datasetService.browseUriData(datasetId, uri).subscribe({
      next: (remote) => {
        let remoteResource;
        if (remote['@graph']) {
          const labels = Description.getLabels(remote);
          const anonResources = Description.getAnonResources(remote, this.labels);
          remoteResource = remote['@graph']
            .filter(instance => UriUtils.expandUri(instance['@id'], remote['@context']) === this.resourceUri)
            .map(instance =>
              new Resource(instance, remote['@context'], labels, anonResources, this.translate.currentLang))[0];

        } else {
          remoteResource = new Resource(remote, remote['@context'], new Map(), new Map(), this.translate.currentLang);
        }
        this.resource['@id'] ? this.resource.combine(remoteResource) : this.resource = remoteResource;
        if (!this.resource['@id']) {
          this.onNoData();
        }
        this.loading = false;
      },
      error: (error) => console.log(error)
    });
  }

  private onNoData() {
    if (this.datasetId === 'default') {
      this.router.navigate(['/overview']);
    } else {
      this.router.navigate(['/datasets', this.datasetId]);
    }
  }

  private setPageJsonLd(resource: Resource): void {
    this.removePageJsonLd();
    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.text = resource.asSchemaOrgJsonLd();
    this.document.head.appendChild(script);
  }

  private removePageJsonLd() {
    this.document.querySelectorAll('[type="application/ld+json"]')
      .forEach(element => this.document.head.removeChild(element));
  }

  ngOnDestroy() {
    this.removePageJsonLd();
  }
}
