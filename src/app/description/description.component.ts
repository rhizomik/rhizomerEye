import { Component, Input, OnInit } from '@angular/core';
import { Description } from './description';

@Component({
  selector: 'app-description',
  templateUrl: './description.component.html',
  styleUrls: ['./description.component.css']
})
export class DescriptionComponent implements OnInit {
  @Input()
  description: Description;
  @Input()
  anonDescriptions: Map<string, Description> = new Map<string, Description>();

  constructor() { }

  ngOnInit() {
  }

  isAnonResource(value: any) {
    return typeof value === 'string' && value.startsWith('_:');
  }

  getAnonResource(value: any) {
    return this.anonDescriptions.get(value);
  }
}
