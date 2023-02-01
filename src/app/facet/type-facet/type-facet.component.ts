import { Component, Input, OnInit } from '@angular/core';
import { Facet } from '../facet';
import { Range } from '../../range/range';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-type-facet',
  templateUrl: './type-facet.component.html',
  styleUrls: ['./type-facet.component.css']
})
export class TypeFacetComponent implements OnInit {
  @Input() datasetId: string;
  @Input() text: BehaviorSubject<string>;
  facet: Facet;
  range: Range;

  constructor(
    public translate: TranslateService) {
  }

  ngOnInit(): void {
    this.facet = new Facet(
      { uri: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', label: 'Type',
        range: 'http://www.w3.org/2000/01/rdf-schema#Resource', curie: 'rdf:type', relation: true });
    this.range = new Range(
      { uri: 'http://www.w3.org/2000/01/rdf-schema#Resource', label: 'Resource',
        curie: 'rdfs:Resource', relation: true });
    this.facet.ranges = [];
    this.facet.ranges.push(this.range);
  }
}
