import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatasetService } from '../dataset.service';
import { Dataset } from '../dataset';
import { forkJoin, Observable } from 'rxjs';

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
    this.datasetService.get(datasetId).subscribe(
      (dataset: Dataset) => {
        this.dataset = dataset;
        this.datasetService.datasetGraphs(dataset.id).subscribe(
          (graphs: string[]) => this.dataset.graphs = graphs
        );
        this.datasetService.serverGraphs(dataset.id).subscribe(
          (graphs: string[]) => this.dataset.serverGraphs = graphs
        );
      });
  }

  graphChange(graph: string, isChecked: boolean) {
    if(isChecked) {
      this.dataset.graphs.push(graph);
    } else {
      this.dataset.graphs = this.dataset.graphs.filter(item => item !== graph);
    }
  }

  onSubmit(): void {
    this.datasetService.updateGraphs(this.dataset.id, this.dataset.graphs).subscribe(
      () => this.router.navigate(['/datasets', this.dataset.id]));
  }

  isSelected(graph: string): boolean {
    return this.dataset.graphs.includes(graph);
  }
}
