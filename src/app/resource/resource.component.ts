import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DatasetService } from '../dataset/dataset.service';
import { Description } from '../description/description';
import { UriUtils } from '../shared/uriutils';
import { Resource } from './resource';

@Component({
  selector: 'app-resource',
  templateUrl: './resource.component.html',
  styleUrls: ['./resource.component.css']
})
export class ResourceComponent implements OnInit, OnDestroy {
  datasetId: string;
  resourceUri: string;
  resource: Resource = new Resource();
  content: string;
  anonResources: Map<string, Description> = new Map<string, Description>();
  labels: Map<string, string> = new Map<string, string>();
  remoteAnonResources: Map<string, Description> = new Map<string, Description>();
  loading = true;

  constructor(private router: Router,
              private route: ActivatedRoute,
              private datasetService: DatasetService,
              @Inject(DOCUMENT) private document: any) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  ngOnInit() {
    this.datasetId = this.route.snapshot.paramMap.get('did') || 'default';
    this.resourceUri = this.route.snapshot.queryParamMap.get('uri') || this.document.location.href;
    this.datasetService.describeDatasetResource(this.datasetId, this.resourceUri).subscribe(
      (response) => {
        if (response['@graph']) {
          this.labels = Description.getLabels(response);
          this.anonResources = Description.getAnonResources(response, this.labels);
          this.resource = response['@graph']
            .filter(instance => UriUtils.expandUri(instance['@id'], response['@context']) === this.resourceUri)
            .map(instance => new Resource(instance, response['@context'], this.labels, this.anonResources))[0];
          this.browseContent(response['@context']);
        } else if (response['@id'] && response['@context'] &&
          UriUtils.expandUri(response['@id'], response['@context']) === this.resourceUri) {
          this.resource = new Resource(response, response['@context']);
          this.browseContent(response['@context']);
        }
        this.setPageJsonLd(this.resource);
        this.browseRemoteData(this.datasetId, this.resourceUri);
      },
      error => {
        this.onNoData();
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
    this.datasetService.browseUriData(datasetId, uri).subscribe(
      (remote) => {
        let remoteResource;
        if (remote['@graph']) {
          const labels = Description.getLabels(remote);
          const anonResources = Description.getAnonResources(remote, this.labels);
          remoteResource = remote['@graph']
            .filter(instance => UriUtils.expandUri(instance['@id'], remote['@context']) === this.resourceUri)
            .map(instance => new Resource(instance, remote['@context'], labels, anonResources))[0];

        } else {
          remoteResource = new Resource(remote, remote['@context']);
        }
        this.resource['@id'] ? this.resource.combine(remoteResource) : this.resource = remoteResource;
        if (!this.resource['@id']) {
          this.onNoData();
        }
        this.loading = false;
      }, error => console.log(error));
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
