import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Class } from '../class';
import { ClassService } from '../class.service';
import { DatasetService } from '../../dataset/dataset.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-list-class',
  templateUrl: './list-class.component.html',
  styleUrls: ['./list-class.component.css']
})
export class ListClassComponent implements OnInit {
  datasetId: string;
  classes: Class[] = [];
  totalClasses = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public translate: TranslateService,
    private datasetService: DatasetService,
    private classService: ClassService) {
  }

  ngOnInit() {
    this.datasetId = this.route.snapshot.paramMap.get('did');
    this.loadClassList();
  }

  loadClassList() {
    this.classService.getAll(this.datasetId).subscribe(
      (classes: Class[]) => {
        this.classes = classes.sort((a, b) =>
          a.getLabel(this.translate.currentLang).localeCompare(b.getLabel(this.translate.currentLang)));
        this.totalClasses = classes.length;
      });
  }

  reloadClassList(): void {
    this.datasetService.clearClasses(this.datasetId).subscribe(
      () => this.loadClassList()
    );
  }

  showSearchResults(classes) {
    this.classes = classes;
  }
}
