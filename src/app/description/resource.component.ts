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
  remoteResource: Description = new Description();
  remoteAnonResources: Map<string, Description> = new Map<string, Description>();

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
          this.resource = response['@graph']
            .filter(instance => UriUtils.expandUri(instance['@id'], response['@context']) === this.resourceUri)
            .map(instance => new Description(instance, response['@context']))[0];
          response['@graph']
            .filter(instance => (<string>instance['@id']).startsWith('_:'))
            .map(instance => this.anonResources.set(instance['@id'], new Description(instance, response['@context'])));
        } else {
          this.resource = new Description(response, response['@context']);
        }
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
      });
  }

}
