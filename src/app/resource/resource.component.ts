import { Component, OnInit, ViewChild } from '@angular/core';
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
export class ResourceComponent implements OnInit {
  datasetId: string;
  resourceUri: string;
  resource: Resource = new Resource();
  content: string;
  anonResources: Map<string, Description> = new Map<string, Description>();
  labels: Map<string, string> = new Map<string, string>();
  remoteResource: Description = new Description();
  remoteAnonResources: Map<string, Description> = new Map<string, Description>();
  loading = true;
  editing = false;
  editorConfig = { extraPlugins: 'autogrow', allowedContent: true };

  constructor(private router: Router,
              private route: ActivatedRoute,
              private datasetService: DatasetService) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  ngOnInit() {
    this.datasetId = this.route.snapshot.paramMap.get('did');
    this.resourceUri = this.route.snapshot.queryParamMap.get('uri');
    this.datasetService.describeDatasetResource(this.datasetId, this.resourceUri).subscribe(
      (response) => {
        if (response['@graph']) {
          this.labels = Description.getLabels(response);
          this.anonResources = Description.getAnonResources(response, this.labels);
          this.resource = response['@graph']
            .filter(instance => UriUtils.expandUri(instance['@id'], response['@context']) === this.resourceUri)
            .map(instance => new Resource(instance, response['@context'], this.labels, this.anonResources))[0];
          if (!this.resource.body && this.resource.topicOf) {
            this.browseRemoteContent(this.datasetId, UriUtils.expandUri(this.resource.topicOf, response['@context']));
          } else {
            this.loading = false;
          }
        } else if (response['@id'] && response['@context'] &&
            UriUtils.expandUri(response['@id'], response['@context']) === this.resourceUri) {
          this.resource = new Resource(response, response['@context'], this.labels, this.anonResources);
          if (!this.resource.body && this.resource.topicOf) {
            this.browseRemoteContent(this.datasetId, UriUtils.expandUri(this.resource.topicOf, response['@context']));
          } else {
            this.loading = false;
          }
        } else {
          this.browseRemoteData(this.datasetId, this.resourceUri);
        }
      });
  }

  public saveContent() {
    this.editing = false;
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
        if (remote['@graph']) {
          this.remoteResource = remote['@graph']
            .filter(instance => UriUtils.expandUri(instance['@id'], remote['@context']) === this.resourceUri)
            .map(instance => new Description(instance, remote['@context']))[0];
          remote['@graph']
            .filter(instance => (<string>instance['@id']).startsWith('_:'))
            .map(instance => this.remoteAnonResources.set(instance['@id'], new Description(instance, remote['@context'])));
        } else {
          this.remoteResource = new Description(remote, remote['@context']);
        }
        this.loading = false;
      }, error => console.log(error));
  }
}
