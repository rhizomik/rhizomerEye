import { Component, OnInit } from '@angular/core';
import { Dataset } from '../dataset';
import { ActivatedRoute, Router } from '@angular/router';
import { DatasetService } from '../dataset.service';
import { forkJoin } from 'rxjs';

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
    forkJoin([
      this.datasetService.get(datasetId),
      this.datasetService.datasetGraphs(datasetId)])
    .subscribe(
      ([dataset, graphs]) => {
          this.dataset = dataset;
          this.dataset.graphs = graphs;
        });
  }

  reloadClassList(): void {
    this.datasetService.clearClasses(this.dataset.id).subscribe(
      () => this.router.navigate(['/datasets', this.dataset.id])
    );
  }

  deleteDataset() {
    this.datasetService.delete(this.dataset).subscribe(
      () => this.router.navigate(['datasets'])
    );
  }
}
