import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Dataset } from '../dataset';
import { DatasetService } from '../dataset.service';
import { EndpointService } from '../endpoint.service';
import { Endpoint } from '../endpoint';

@Component({
  selector: 'app-list-dataset',
  templateUrl: './list-dataset.component.html',
  styleUrls: ['./list-dataset.component.css']
})
export class ListDatasetComponent implements OnInit {
  public datasets: Dataset[] = [];
  public totalDatasets = 0;

  constructor(
    public router: Router,
    private datasetService: DatasetService,
    private endpointService: EndpointService) {
  }

  ngOnInit() {
    this.datasetService.getAll()
    .subscribe(
      (datasets: Dataset[]) => {
        this.datasets = datasets;
        this.totalDatasets = datasets.length;
        this.datasets.forEach((dataset: Dataset) => {
          this.endpointService.getAll(dataset.id).subscribe((endpoints: Endpoint[]) => {
            dataset.endpoint = endpoints[0];
          });
        });
      });
  }

  showSearchResults(datasets) {
    this.datasets = datasets;
  }
}
