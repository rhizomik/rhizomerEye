import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatasetService } from '../dataset.service';
import { Dataset } from '../dataset';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-edit-dataset',
  templateUrl: '../dataset-form/dataset-form.component.html',
  styleUrls: ['../dataset-form/dataset-form.component.css']
})
export class EditDatasetComponent implements OnInit {
  dataset: Dataset = new Dataset();

  constructor(private route: ActivatedRoute,
              private router: Router,
              private datasetService: DatasetService) { }

  ngOnInit() {
    const datasetId = this.route.snapshot.paramMap.get('did');
    forkJoin([
      this.datasetService.get(datasetId),
      this.datasetService.serverGraphs(datasetId),
      this.datasetService.datasetGraphs(datasetId)])
    .subscribe(
      ([dataset, serverGraphs, datasetGraphs]) => {
        this.dataset = dataset;
        this.dataset.serverGraphs = serverGraphs;
        this.dataset.graphs = datasetGraphs;
      });
  }

  graphChange(graph: string, isChecked: boolean) {
    if (isChecked) {
      this.dataset.graphs.push(graph);
    } else {
      this.dataset.graphs = this.dataset.graphs.filter(item => item !== graph);
    }
  }

  onSubmit(): void {
    forkJoin([
      this.datasetService.update(this.dataset),
      this.datasetService.updateGraphs(this.dataset.id, this.dataset.graphs)])
    .subscribe(
      () => this.router.navigate(['/datasets', this.dataset.id, 'details']));
  }

  isSelected(graph: string): boolean {
    return this.dataset.graphs.includes(graph);
  }
}
