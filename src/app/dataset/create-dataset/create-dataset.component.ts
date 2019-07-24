import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Dataset } from '../dataset';
import { DatasetService } from '../dataset.service';

@Component({
  selector: 'app-create-dataset',
  templateUrl: '../dataset-form/dataset-form.component.html',
  styleUrls: ['../dataset-form/dataset-form.component.css']
})
export class CreateDatasetComponent implements OnInit {
  dataset: Dataset;
  isEditing = false;

  constructor(private router: Router,
              private datasetService: DatasetService) {
  }

  ngOnInit() {
    this.dataset = new Dataset();
  }

  onSubmit(): void {
    this.datasetService.create(this.dataset).subscribe(
      (dataset: Dataset) => this.router.navigate(['/datasets', dataset.id, 'edit'],
        { state: { dataset: this.dataset } }));
  }
}
