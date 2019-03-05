import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatasetService } from '../dataset/dataset.service';
import { Description } from './description';

@Component({
  selector: 'app-resource',
  templateUrl: './resource.component.html',
  styleUrls: ['./resource.component.css']
})
export class ResourceComponent implements OnInit {
  private datasetId: string;
  private resourceUri: string;
  private resource: Description = new Description();
  private anonResources: Map<string, Description> = new Map<string, Description>();

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
          .filter(instance => !(<string>instance['@id']).startsWith('_:'))
          .map(instance => new Description(instance, response['@context']));
          response['@graph']
          .filter(instance => (<string>instance['@id']).startsWith('_:'))
          .map(instance => this.anonResources.set( instance['@id'], new Description(instance, response['@context'])));
        } else {
          this.resource = new Description(response, response['@context']);
        }
      });
  }

}
