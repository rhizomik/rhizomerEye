import { Component, Input, OnInit } from '@angular/core';
import { Description } from './description';

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
  depictionExpanded = false;

  constructor() { }

  ngOnInit() {
  }

  isAnonResource(value: any) {
    return value.value && typeof value.value === 'string' && value.value.startsWith('_:');
  }

  getAnonResource(value: any) {
    return this.anonDescriptions.get(value.value);
  }

  switchExpansion() {
    this.depictionExpanded = !this.depictionExpanded;
  }
}
