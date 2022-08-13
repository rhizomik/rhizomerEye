import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatasetService } from '../dataset.service';
import { Dataset } from '../dataset';
import { forkJoin } from 'rxjs';
import { NgModel } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatasetFormModalComponent } from './dataset-form-modal.component';
import { Endpoint } from '../endpoint';
import { EndpointService } from '../endpoint.service';

@Component({
  selector: 'app-edit-dataset',
  templateUrl: '../dataset-form/dataset-form.component.html',
  styleUrls: ['../dataset-form/dataset-form.component.css']
})
export class EditDatasetComponent implements OnInit {
  datasetId = '';
  dataset: Dataset = new Dataset();
  endpoint: Endpoint = new Endpoint();
  endpoints: Endpoint[] = [];
  isEditing = true;
  passwordProtected = false;
  changePassword = true;
  graphsRetrieved = false;
  active = 1;
  error = false;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private datasetService: DatasetService,
              private endpointService: EndpointService,
              private modalService: NgbModal) { }

  ngOnInit() {
    this.datasetId = this.route.snapshot.paramMap.get('did');
    if (!history.state.dataset) {
      this.datasetService.get(this.datasetId).subscribe(dataset => this.dataset = dataset);
      this.endpointService.getAll(this.datasetId).subscribe(endpoints => {
        this.endpoints = endpoints;
        if (this.endpoints.length > 0) {
          this.endpoint = this.endpoints[0];
          this.changePassword = false;
          this.passwordProtected = !!this.endpoint.queryUsername;
          this.getGraphs();
        }
      });
    } else {
      this.active = 2;
      this.dataset = history.state.dataset;
    }
  }

  saveDataset(): void {
    this.datasetService.update(this.dataset).subscribe(
      () => this.active = 2);
  }

  saveEndpoint(): void {
    if (this.endpoints.length > 0) {
      this.endpointService.updateEndpoint(this.datasetId, this.endpoint).subscribe(
        () => {
          this.active = 3;
          this.getGraphs();
        });
    } else {
      this.endpointService.create(this.datasetId, this.endpoint).subscribe(
        (endpoint) => {
          this.endpoint = endpoint;
          this.endpoints.push(endpoint);
          this.changePassword = false;
          this.getGraphs();
          this.active = 3;
        });
    }
  }

  getGraphs() {
    forkJoin([
      this.endpointService.serverGraphs(this.datasetId, this.endpoint.id),
      this.endpointService.dataGraphs(this.datasetId, this.endpoint.id),
      this.endpointService.ontologyGraphs(this.datasetId, this.endpoint.id)])
    .subscribe({
        next: ([serverGraphs, dataGraphs, ontologyGraphs]) => {
          this.graphsRetrieved = true;
          this.endpoint.serverGraphs = serverGraphs.sort((a, b) => a.localeCompare(b));
          this.endpoint.graphs = dataGraphs.filter(graph => this.endpoint.serverGraphs.includes(graph));
          this.endpoint.ontologies = ontologyGraphs.filter(graph => this.endpoint.serverGraphs.includes(graph));
        },
        error: () => this.error = true
    });
  }

  graphChange(graph: string, isChecked: boolean) {
    if (isChecked) {
      this.endpoint.graphs.push(graph);
      if (this.isSelectedOntology(graph)) {
        this.ontologyChange(graph, false);
      }
    } else {
      this.endpoint.graphs = this.endpoint.graphs.filter(item => item !== graph);
    }
  }

  ontologyChange(graph: string, isChecked: boolean) {
    if (isChecked) {
      this.endpoint.ontologies.push(graph);
      if (this.isSelectedData(graph)) {
        this.graphChange(graph, false);
      }
    } else {
      this.endpoint.ontologies = this.endpoint.ontologies.filter(item => item !== graph);
    }
  }

  setGraphs(): void {
    forkJoin([
      this.endpointService.updateGraphs(this.dataset.id, this.endpoint.id, this.endpoint.graphs),
      this.endpointService.updateOntologies(this.dataset.id, this.endpoint.id, this.endpoint.ontologies),
      this.datasetService.clearClasses(this.dataset.id)])
      .subscribe(() => this.router.navigate(['/datasets', this.dataset.id, 'details']));
  }

  isSelectedData(graph: string): boolean {
    return this.endpoint.graphs.includes(graph);
  }

  isSelectedOntology(graph: string): boolean {
    return this.endpoint.ontologies.includes(graph);
  }

  addGraph(newGraph: NgModel) {
    if (!this.endpoint.serverGraphs.includes(newGraph.value)) {
      this.endpoint.serverGraphs.push(newGraph.value);
    }
    if (!this.endpoint.graphs.includes(newGraph.value)) {
      this.endpoint.graphs.push(newGraph.value);
    }
    newGraph.reset();
  }

  loadModal(graph: string) {
    const modalRef = this.modalService.open(DatasetFormModalComponent);
    modalRef.componentInstance.dataset = this.dataset;
    modalRef.componentInstance.endpoint = this.endpoint;
    modalRef.componentInstance.graph = graph;
  }

  switchChangePassword() {
    this.changePassword = !this.changePassword;
    this.endpoint.updatePassword = null;
  }

  switchedWritable() {
    if (!this.endpoint.writable) {
      this.endpoint.updateEndPoint = null;
      this.endpoint.updateUsername = null;
      this.endpoint.updatePassword = null;
    } else {
      this.endpoint.updateEndPoint = this.endpoint.queryEndPoint;
      this.endpoint.updateUsername = this.endpoint.queryUsername;
      this.endpoint.updatePassword = this.endpoint.queryPassword;
    }
  }

  switchPasswordProtected() {
    this.passwordProtected = !this.passwordProtected;
    if (!this.passwordProtected) {
      this.endpoint.queryUsername = null;
      this.endpoint.queryPassword = null;
    }
  }
}
