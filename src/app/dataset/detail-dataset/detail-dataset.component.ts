import { Component, OnInit } from '@angular/core';
import { Dataset } from '../dataset';
import { ActivatedRoute, Router } from '@angular/router';
import { DatasetService } from '../dataset.service';

@Component({
  selector: 'app-detail-dataset',
  templateUrl: './detail-dataset.component.html',
  styleUrls: ['./detail-dataset.component.css']
})
export class DetailDatasetComponent implements OnInit {
  dataset: Dataset = new Dataset();

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private datasetService: DatasetService) {
  }

  ngOnInit() {
    const datasetId = this.route.snapshot.paramMap.get('did');
    this.datasetService.get(datasetId).subscribe(
      (dataset: Dataset) => { this.dataset = dataset; });
  }
}
