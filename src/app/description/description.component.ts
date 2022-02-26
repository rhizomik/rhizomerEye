import { Component, ComponentFactoryResolver, Input } from '@angular/core';
import { Description } from './description';
import { UriUtils } from '../shared/uriutils';
import { Router } from '@angular/router';
import { ClassService } from '../class/class.service';
import { Class } from '../class/class';

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
  labels: Map<string, string> = new Map<string, string>();
  @Input()
  resource = 'resource';
  depictionExpanded = false;

  constructor(private router: Router,
              private classService: ClassService) { }

  getAnonResource(value: any) {
    return this.anonDescriptions.get(value.asString());
  }

  switchExpansion() {
    this.depictionExpanded = !this.depictionExpanded;
  }

  localName(uri: string): string {
    //console.log("LocalName");
    //console.log(this.description.asJsonLd());
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
