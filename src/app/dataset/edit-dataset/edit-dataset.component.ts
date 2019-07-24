import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatasetService } from '../dataset.service';
import { Dataset } from '../dataset';
import { forkJoin } from 'rxjs';
import { FormControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatasetFormModalComponent } from './dataset-form-modal.component';

@Component({
  selector: 'app-edit-dataset',
  templateUrl: '../dataset-form/dataset-form.component.html',
  styleUrls: ['../dataset-form/dataset-form.component.css']
})
export class EditDatasetComponent implements OnInit {
  dataset: Dataset = new Dataset();
  isEditing = true;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private datasetService: DatasetService,
              private modalService: NgbModal) { }

  ngOnInit() {
    const datasetId = this.route.snapshot.paramMap.get('did');
    if (!history.state.dataset) {
      this.datasetService.get(datasetId).subscribe(dataset => this.dataset = dataset);
    } else {
      this.dataset = history.state.dataset;
    }
    forkJoin([
      this.datasetService.serverGraphs(datasetId),
      this.datasetService.datasetGraphs(datasetId)])
    .subscribe(
      ([serverGraphs, datasetGraphs]) => {
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

  addGraph(newGraph: FormControl) {
    if (!this.dataset.serverGraphs.includes(newGraph.value)) {
      this.dataset.serverGraphs.push(newGraph.value);
    }
    if (!this.dataset.graphs.includes(newGraph.value)) {
      this.dataset.graphs.push(newGraph.value);
    }
    newGraph.reset();
  }

  loadModal(graph: string) {
    const modalRef = this.modalService.open(DatasetFormModalComponent);
    modalRef.componentInstance.dataset = this.dataset;
    modalRef.componentInstance.graph = graph;
  }
}
