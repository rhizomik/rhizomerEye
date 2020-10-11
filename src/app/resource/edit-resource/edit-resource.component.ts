import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatasetService } from '../../dataset/dataset.service';
import { Description } from '../../description/description';
import { Resource } from '../resource';

@Component({
  selector: 'app-resource',
  templateUrl: './edit-resource.component.html',
  styleUrls: ['./edit-resource.component.css']
})
export class EditResourceComponent implements OnInit {
  datasetId: string;
  resourceUri: string;
  resource: Resource = new Resource();
  content: string;
  anonResources: Map<string, Description> = new Map<string, Description>();
  labels: Map<string, string> = new Map<string, string>();
  editing = true;
  editorConfig = { extraPlugins: 'autogrow', allowedContent: true };
  jsonld = '';

  constructor(private router: Router,
              private route: ActivatedRoute,
              private datasetService: DatasetService) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    const navigation = this.router.getCurrentNavigation();
    this.resource = navigation.extras.state && navigation.extras.state.resource;
  }

  ngOnInit() {
    this.datasetId = this.route.snapshot.paramMap.get('did');
    this.resourceUri = this.route.snapshot.queryParamMap.get('uri');
    if (!this.resource) {
      this.router.navigate(['../resource'],
        { relativeTo: this.route, queryParams: { uri: this.resourceUri } });
    } else {
      this.jsonld = this.resource.asJsonLd();
    }
  }

  public saveContent() {
    this.datasetService.updateDatasetResource(this.datasetId, this.resourceUri, this.jsonld)
      .subscribe(() =>
        this.router.navigate(['../resource'],
          { relativeTo: this.route, queryParams: { uri: this.resourceUri } }));
  }
}
