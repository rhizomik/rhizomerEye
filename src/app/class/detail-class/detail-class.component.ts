import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClassService } from '../class.service';
import { Class } from '../class';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-detail-class',
  templateUrl: './detail-class.component.html',
  styleUrls: ['./detail-class.component.css']
})
export class DetailClassComponent implements OnInit {
  clazz: Class = new Class();
  datasetId: string;
  classId: string;

  constructor(
    private route: ActivatedRoute,
    public translate: TranslateService,
    private classService: ClassService) {
  }

  ngOnInit() {
    this.datasetId = this.route.snapshot.paramMap.get('did');
    this.classId = this.route.snapshot.paramMap.get('cid');
    this.classService.get(this.datasetId, this.classId).subscribe(
      (clazz: Class) => { this.clazz = clazz; });
  }
}
