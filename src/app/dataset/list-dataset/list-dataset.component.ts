import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Dataset } from '../dataset';
import { DatasetService } from '../dataset.service';

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
    private datasetService: DatasetService) {
  }

  ngOnInit() {
    this.datasetService.getAll()
    .subscribe(
      (datasets: Dataset[]) => {
        this.datasets = datasets;
        this.totalDatasets = datasets.length;
      });
  }

  showSearchResults(datasets) {
    this.datasets = datasets;
  }
}
