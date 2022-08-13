import { Component, OnInit } from '@angular/core';
import { Dataset } from '../dataset';
import { ActivatedRoute, Router } from '@angular/router';
import { DatasetService } from '../dataset.service';
import { forkJoin } from 'rxjs';
import { EndpointService } from '../endpoint.service';
import { Endpoint } from '../endpoint';

@Component({
  selector: 'app-detail-dataset',
  templateUrl: './detail-dataset.component.html',
  styleUrls: ['./detail-dataset.component.css']
})
export class DetailDatasetComponent implements OnInit {
  dataset: Dataset = new Dataset();
  endpoint: Endpoint = new Endpoint();

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private datasetService: DatasetService,
    private endpointService: EndpointService) {
  }

  ngOnInit() {
    const datasetId = this.route.snapshot.paramMap.get('did');
    forkJoin([
      this.datasetService.get(datasetId),
      this.endpointService.getAll(datasetId)])
    .subscribe(
      ([dataset, endpoints]) => {
          this.dataset = dataset;
          this.endpoint = endpoints[0];
          this.endpointService.dataGraphs(datasetId, this.endpoint.id).subscribe(
            graphs => this.endpoint.graphs = graphs);
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

  editDataset() {
    this.router.navigate(['/datasets', this.dataset.id, 'edit']);
  }
}
