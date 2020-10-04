import { Component, Input, OnInit } from '@angular/core';
import { Description } from './description';
import { UriUtils } from '../shared/uriutils';

@Component({
  selector: 'app-description',
  templateUrl: './description.component.html',
  styleUrls: ['./description.component.css']
})
export class DescriptionComponent implements OnInit {
  @Input()
  description: Description = new Description();
  @Input()
  anonDescriptions: Map<string, Description> = new Map<string, Description>();
  @Input()
  labels: Map<string, string> = new Map<string, string>();
  @Input()
  describe = 'describe';
  depictionExpanded = false;

  constructor() { }

  ngOnInit() {
  }

  isAnonResource(value: any) {
    if (value.value && typeof value.value === 'string' && value.value.startsWith('_:')) {
      return true;
    } else if (value['@id'] && value['@id'].startsWith('_:')) {
      return true;
    }
    return false;
  }

  getAnonResource(value: any) {
    return this.anonDescriptions.get(value.value);
  }

  switchExpansion() {
    this.depictionExpanded = !this.depictionExpanded;
  }

  localName(uri: string): string {
    return UriUtils.localName(uri);
  }
}
