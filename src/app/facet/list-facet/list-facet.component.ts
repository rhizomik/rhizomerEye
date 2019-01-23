import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Facet } from '../facet';
import { Range } from '../../range/range';
import { FacetService } from '../facet.service';
import { RangeService } from '../../range/range.service';
import { Value } from '../../range/value';

@Component({
  selector: 'app-list-facet',
  templateUrl: './list-facet.component.html',
  styleUrls: ['./list-facet.component.css']
})
export class ListFacetComponent implements OnInit {
  datasetId: string;
  classId: string;
  facets: Facet[] = [];
  totalFacets = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private facetService: FacetService,
    private rangeService: RangeService) {
  }

  ngOnInit() {
    this.datasetId = this.route.snapshot.paramMap.get('did');
    this.classId = this.route.snapshot.paramMap.get('cid');
    this.facetService.getAll(this.datasetId, this.classId).subscribe(
      (facets: Facet[]) => {
        this.facets = facets;
        this.totalFacets = facets.length;
        this.facets.map(facet =>
            this.rangeService.getAll(this.datasetId, this.classId, facet.curie).subscribe(
              ranges => facet.ranges = ranges)
        );
      });
  }

  firstValues(facet: Facet, range: Range) {
    this.rangeService.getValues(this.datasetId, this.classId, facet.curie, range.curie).subscribe(
      (values: Value[]) => range.values = values.map(value => new Value(value)));
  }

  showSearchResults(facets) {
    this.facets = facets;
  }
}
