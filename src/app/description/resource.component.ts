import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatasetService } from '../dataset/dataset.service';
import { Description } from './description';
import { UriUtils } from '../shared/uriutils';

@Component({
  selector: 'app-resource',
  templateUrl: './resource.component.html',
  styleUrls: ['./resource.component.css']
})
export class ResourceComponent implements OnInit {
  datasetId: string;
  resourceUri: string;
  resource: Description = new Description();
  anonResources: Map<string, Description> = new Map<string, Description>();
  labels: Map<string, string> = new Map<string, string>();
  remoteResource: Description = new Description();
  remoteAnonResources: Map<string, Description> = new Map<string, Description>();
  loading = true;

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
          response['@graph']
            .filter(instance => (<string>instance['@id']).startsWith('_:'))
            .map(instance => this.anonResources.set(instance['@id'], new Description(instance, response['@context'])));
          response['@graph']
            .map(instance => Object.entries(instance)
              .forEach(([key, value]) => {
                if (key.includes('label')) {
                  this.labels.set(UriUtils.expandUri(instance['@id'], response['@context']), <string>value);
                }
              }));
          this.resource = response['@graph']
            .filter(instance => UriUtils.expandUri(instance['@id'], response['@context']) === this.resourceUri)
            .map(instance => new Description(instance, response['@context'], this.labels))[0];
        } else if (response['@id'] && response['@context'] &&
                   UriUtils.expandUri(response['@id'], response['@context']) === this.resourceUri) {
          this.resource = new Description(response, response['@context'], this.labels);
        }
        this.loading = false;
      });
    this.datasetService.browseUri(this.datasetId, this.resourceUri).subscribe(
      (response) => {
        if (response['@graph']) {
          this.remoteResource = response['@graph']
            .filter(instance => UriUtils.expandUri(instance['@id'], response['@context']) === this.resourceUri)
            .map(instance => new Description(instance, response['@context']))[0];
          response['@graph']
            .filter(instance => (<string>instance['@id']).startsWith('_:'))
            .map(instance => this.remoteAnonResources.set(instance['@id'], new Description(instance, response['@context'])));
        } else {
          this.remoteResource = new Description(response, response['@context']);
        }
        this.loading = false;
      });
  }

}
