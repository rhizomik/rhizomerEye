import { Component, Input } from '@angular/core';
import { Description } from './description';
import { UriUtils } from '../shared/uriutils';
import { ActivatedRoute, Router } from '@angular/router';
import { ClassService } from '../class/class.service';
import { Class } from '../class/class';
import { Value } from './value';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-description',
  templateUrl: './description.component.html',
  styleUrls: ['./description.component.css']
})
export class DescriptionComponent {
  @Input()
  datasetId: string;
  @Input()
  description: Description = new Description();
  @Input()
  anonDescriptions: Map<string, Description> = new Map<string, Description>();
  @Input()
  labels: Map<string, Value> = new Map<string, Value>();
  @Input()
  resource = 'resource';
  @Input()
  details = false;
  depictionExpanded = false;

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              public translate: TranslateService,
              private classService: ClassService) { }

  getAnonResource(value: any) {
    return this.anonDescriptions.get(value.asString());
  }

  clickDescriptionDepiction() {
    if (this.details) {
      this.depictionExpanded = !this.depictionExpanded;
    } else {
      this.router.navigate([this.resource], { queryParams: { uri: this.description['@id'] },
        relativeTo: this.activatedRoute });
    }
  }

  localName(uri: string): string {
    return UriUtils.localName(uri);
  }

  browseClass(uri: string): void {
    this.classService.getClassCurie(this.datasetId, uri).subscribe((cls: Class) => {
      if (this.datasetId === 'default') {
        this.router.navigate(['/overview', cls.curie]);
      } else {
        this.router.navigate(['/datasets', this.datasetId, cls.curie]);
      }
    });
  }
}
