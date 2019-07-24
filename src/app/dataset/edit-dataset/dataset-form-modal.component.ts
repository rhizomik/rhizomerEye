import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Dataset } from '../dataset';
import { DatasetService } from '../dataset.service';

@Component({
  selector: 'app-dataset-form-modal',
  templateUrl: './dataset-form-modal.component.html'
})
export class DatasetFormModalComponent {
  @Input() dataset: Dataset;
  @Input() graph: string;
  file: File = null;
  isLoading = false;
  isReplacement = false;

  constructor(public activeModal: NgbActiveModal,
              private datasetService: DatasetService) {}

  onFileChange(event) {
    this.file = event.target.files.item(0);
    const extension = this.file.name.split('.')[1];
    switch (extension) {
      case 'ttl': this.file['content-type'] = 'text/turtle'; break;
      case 'rdf': this.file['content-type'] = 'application/rdf+xml'; break;
      case 'n3': this.file['content-type'] = 'text/n3'; break;
      case 'nt': this.file['content-type'] = 'application/n-triples'; break;
      case 'nq': this.file['content-type'] = 'application/n-quads'; break;
      case 'json': this.file['content-type'] = 'application/ld+json'; break;
      case 'jsonld': this.file['content-type'] = 'application/ld+json'; break;
      default: this.file['content-type'] = 'text/turtle';
    }
  }

  onSubmit(): void {
    if (this.isReplacement) {
      this.datasetService.replaceData(this.dataset.id, this.graph, this.file).subscribe( () => {
        this.isLoading = false;
        this.activeModal.close();
      }, error => {
        this.isLoading = false;
        this.activeModal.close();
        console.log(error);
      });
    } else {
      this.datasetService.storeData(this.dataset.id, this.graph, this.file).subscribe(() => {
        this.isLoading = false;
        this.activeModal.close();
      }, error => {
        this.isLoading = false;
        this.activeModal.close();
        console.log(error);
      });
    }
  }
}
