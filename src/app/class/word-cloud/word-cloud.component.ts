import { Component, OnInit } from '@angular/core';
import { Observable, of, OperatorFunction } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { DatasetService } from '../../dataset/dataset.service';
import { ClassService } from '../class.service';
import { Class } from '../class';

import * as d3 from 'd3-selection';
import * as d3Cloud from 'd3-cloud';
import * as d3Scale from 'd3-scale';
import * as d3ScaleChromatic from 'd3-scale-chromatic';
import { AuthenticationBasicService } from '../../login-basic/authentication-basic.service';
import { Dataset } from '../../dataset/dataset';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-word-cloud',
  templateUrl: './word-cloud.component.html',
  styleUrls: ['./word-cloud.component.css']
})
export class WordCloudComponent implements OnInit {

  datasetId: string;
  classes: Class[];
  svg;
  width: number;
  height: number;
  fillScale;
  minFontSize = 10;
  maxFontSize = 40;
  topClasses = 300;
  searching = false;
  searchFailed = false;
  emptyAutocomplete = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthenticationBasicService,
    public translate: TranslateService,
    private datasetService: DatasetService,
    private classService: ClassService) {
  }

  ngOnInit() {
    this.datasetId = this.route.snapshot.paramMap.get('did') || 'default';
    this.datasetService.get(this.datasetId).subscribe((dataset: Dataset) => {
      if (dataset.queryType === 'DETAILED') {
        if (this.datasetId === 'default') {
          this.router.navigate(['/network']);
        } else {
          this.router.navigate(['/datasets', this.datasetId, 'network']);
        }
      } else {
        this.loadClassList();
        this.setup();
      }
    },
    () => this.router.navigate(['/about']));
  }

  loadClassList() {
    this.classService.getTopClasses(this.datasetId, this.topClasses).subscribe({
      next: (classes: Class[]) => {
        this.classes = classes.map(cls => new Class(cls));
        this.populate();
      },
      error: () => this.router.navigate(['/about'])});
  }

  autocomplete: OperatorFunction<string, readonly Class[]> = (text$: Observable<string>) =>
    text$.pipe(
      tap(() => this.emptyAutocomplete = false),
      debounceTime(500),
      distinctUntilChanged(),
      tap(() => this.searching = true),
      switchMap(term => term.length < 3 ? of([]) :
          this.classService.getTopClassesContaining(this.datasetId, 10, term, this.translate.currentLang).pipe(
            tap(() => this.searchFailed = false),
            map(response => response.map(cls => new Class(cls))),
            catchError(() => {
              this.searchFailed = true;
              return of([]);
            })
          )
      ),
      tap((results) => { this.searching = false; this.emptyAutocomplete = results.length < 1 })
    )

  private setup() {
    this.fillScale = d3Scale.scaleOrdinal(d3ScaleChromatic.schemeCategory10);
    this.svg = d3.select('svg');
    this.width = this.svg.node().getBoundingClientRect().width;
    this.height = window.innerHeight - this.svg.node().getBoundingClientRect().top - 50;
    this.svg = this.svg.attr('height', this.height).append('g')
      .attr('transform', 'translate(' + Math.floor(this.width / 2) + ',' + Math.floor(this.height / 2) + ')');
  }

  private populate() {
    const fontFace = 'Impact';
    const fontWeight = 'bold';
    const spiralType = 'rectangular';

    const maxCount = Math.max(...this.classes.map(c => c.instanceCount), 0);
    const minCount = Math.min(...this.classes.map(c => c.instanceCount), 0);

    d3Cloud()
    .size([this.width, this.height])
    .words(this.classes)
    .padding(3)
    .rotate(() => 0)
    // .rotate(() => Math.floor(Math.random() * 3) * 30 - 30)
    .text(d => d.getLabel(this.translate.currentLang))
    .font(fontFace)
    .fontStyle(fontWeight)
    .fontSize(d => ((d.instanceCount - minCount) / (maxCount - minCount)) * this.maxFontSize + this.minFontSize )
    .spiral(spiralType)
    .on('end', () => this.draw())
    .start();
  }

  private draw() {
    this.svg
    .selectAll('text')
    .data(this.classes)
    .enter()
    .append('text')
    .style('font-family', d => d.font)
    .style('font-size', d => d.size + 'px')
    .style('fill', (d, i) => this.fillScale(i))
    .attr('cursor', 'pointer')
    .attr('text-anchor', 'middle')
    .attr('transform', d => 'translate(' + [d.x, d.y] + ')rotate(' + d.rotate + ')')
    .attr('class', 'word-cloud')
    .attr('title', d => d.uri)
    .text(d => d.getLabel(this.translate.currentLang))
    .on('click', this.browse.bind(this));
  }

  browse(item: any) {
    const curie = item.currentTarget ? item.currentTarget.__data__?.curie : item?.curie;
    if (!curie) {
      item.preventDefault();
      return;
    }
    if (this.datasetId === 'default') {
      this.router.navigate(['/overview', curie]);
    } else {
      this.router.navigate(['/datasets', this.datasetId, curie]);
    }
  }

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  search(text: string) {
    if (this.datasetId === 'default') {
      this.router.navigate(['/overview/search'],
        { queryParams: { 'text': text } });
    } else {
      this.router.navigate(['/datasets', this.datasetId, 'search'],
        { queryParams: { 'text': text } });
    }
  }
}
