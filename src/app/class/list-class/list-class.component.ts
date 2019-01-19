import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Class } from '../class';
import { ClassService } from '../class.service';

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
    private classService: ClassService) {
  }

  ngOnInit() {
    this.datasetId = this.route.snapshot.paramMap.get('did');
    this.classService.getAll(this.datasetId).subscribe(
      (classes: Class[]) => {
        this.classes = classes;
        this.totalClasses = classes.length;
      });
  }

  showSearchResults(classes) {
    this.classes = classes;
  }
}
