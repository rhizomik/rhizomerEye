import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Facet } from '../facet';
import { FacetService } from '../facet.service';

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
    private facetService: FacetService) {
  }

  ngOnInit() {
    this.datasetId = this.route.snapshot.paramMap.get('did');
    this.classId = this.route.snapshot.paramMap.get('cid');
    this.facetService.getAll(this.datasetId, this.classId).subscribe(
      (facets: Facet[]) => {
        this.facets = facets;
        this.totalFacets = facets.length;
      });
  }

  showSearchResults(facets) {
    this.facets = facets;
  }
}
