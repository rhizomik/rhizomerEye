import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { forkJoin, Observable, of, OperatorFunction } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthenticationBasicService } from '../../login-basic/authentication-basic.service';
import { DatasetService } from '../../dataset/dataset.service';
import { ClassService } from '../class.service';
import { FacetService } from '../../facet/facet.service';
import { Class } from '../class';
import { Relation } from '../../facet/relation';

import * as d3 from 'd3';

@Component({
  selector: 'app-network',
  templateUrl: './network.component.html',
  styleUrls: ['./network.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class NetworkComponent implements OnInit, OnDestroy {
  datasetId: string;
  searching = false;
  searchFailed = false;
  classes: Class[];
  relations: Relation[];
  topClasses = 30;
  facetRelevance = 0.3;
  links: { id: string, label: string; source: string; target: string }[];
  nodes: { id: string; label: string; uri: string; count: number }[];
  maxCount: number;
  minCount: number;
  maxNodeSize: number;
  minNodeSize: number;
  svg: any;
  width: number;
  height: number;
  colors = d3.scaleOrdinal(d3.schemeCategory10);
  simulation: any;
  force: number;
  link: any;
  node: any;
  linkPath: any;
  textPath: any;
  emptyAutocomplete = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthenticationBasicService,
    private datasetService: DatasetService,
    private classService: ClassService,
    private facetService: FacetService,
    ) {
  }

  ngOnInit() {
    this.datasetId = this.route.snapshot.paramMap.get('did') || 'default';
    this.svg = d3.select('svg');
    this.width = this.svg.node().getBoundingClientRect().width;
    this.height = window.innerHeight - this.svg.node().getBoundingClientRect().top - 60;
    this.loadClassList();
  }

  loadClassList() {
    this.classService.getTopClasses(this.datasetId, this.topClasses).subscribe({
      next: (classes: Class[]) => {
        this.classes = classes;
        this.nodes = this.classes.map((cls: Class) => ({
          id: cls.curie,
          label: cls.label,
          uri: cls.uri,
          count: cls.instanceCount
        }));
        forkJoin(classes.map(cls => this.facetService.getRelevantRelations(this.datasetId, cls.curie, this.facetRelevance))
                        .map(o => o.pipe(catchError(() => of([])))))
          .subscribe(
            classesFacets => {
              this.relations = classesFacets.reduce((acc, val) => acc.concat(val), []);
              this.links = this.relations.map((relation: Relation) => ({
                id: relation.classCurie + '/' + relation.propertyCurie + '/' + relation.rangeCurie,
                label: relation.propertyLabel,
                source: relation.classCurie,
                target: relation.rangeCurie,
                count: relation.uses
              }));
              this.links = this.links.filter(link =>
                  this.nodes.find(node => node.id === link.target) &&
                  this.nodes.find(node => node.id === link.source) &&
                  link.source !== link.target);
              this.nodes = this.nodes.filter(node =>
                this.links.find(link => node.id === link.target) ||
                this.links.find(link => node.id === link.source));
              const repetitions = this.links.reduce((acc, link) => {
                const id = link.source + '/' + link.target;
                acc[id] = acc[id] || [];
                acc[id].push({ id: link.id, count: acc[id].length + 1 });
                return acc;
              }, Object.create(null));
              Object.keys(repetitions).filter(key => repetitions[key].length > 1)
                .forEach(key => {
                  repetitions[key].forEach(repetition => {
                      const repeatedLink = this.links.find(link => link.id === repetition.id);
                      if (repeatedLink && repetition.count > 1) {
                        repeatedLink['repetition'] = repetition.count;
                      }
                    }
                  );
                });
              this.setup();
            });
      },
      error: () => this.router.navigate(['/about'])
    });
  }

  setup() {
    this.svg.selectAll('*').remove();
    const vmin = Math.min(this.width, this.height);
    this.force = vmin;
    this.svg = this.svg
      .attr('viewBox', [-this.width / 2, -this.height / 2, this.width, this.height]);

    this.maxCount = Math.max(...this.nodes.map(c => c.count), 0);
    this.minCount = Math.min(...this.nodes.map(c => c.count), this.maxCount);
    this.maxNodeSize = vmin / 30 + 5;
    this.minNodeSize = vmin / 90 + 5;

    this.simulation = d3.forceSimulation(this.nodes as any[])
      .force('link', d3.forceLink(this.links).id(d => d['id']).distance(d => d['label'].length * 10))
      .force('charge', d3.forceManyBody().strength(-this.force))
      .force('x', d3.forceX())
      .force('y', d3.forceY());

    this.svg.append('defs')
      .append('marker')
        .attr('id', 'arrow-marker')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 0)
        .attr('refY', 0)
        .attr('markerWidth', 5)
        .attr('markerHeight', 5)
        .attr('orient', 'auto')
      .append('path')
        .attr('d', 'M0,-5L10,0L0,5');

    this.link = this.svg.append('g')
      .selectAll('g.link')
      .data(this.links)
      .enter().append('g')
        .attr('class', 'link');

    this.linkPath = this.link.append('path')
      .attr('class', 'link-path')
      .attr('marker-end', 'url(#arrow-marker)');

    this.textPath = this.link.append('path')
      .attr('id', d => d.id)
      .attr('class', 'text-path');

    this.svg.append('g')
      .selectAll('.link-label')
      .data(this.links)
      .enter().append('text')
        .attr('class', 'link-label')
      .append('textPath')
        .attr('startOffset', '50%')
        .attr('text-anchor', 'middle')
        .attr('xlink:href', d => '#' + d.id)
        .text(d => d.label)
      .clone(true).lower()
        .attr('class', 'link-label-outline');

    this.node = this.svg.append('g')
      .selectAll('g')
      .data(this.nodes)
      .join('g')
        .on('click', this.browse.bind(this))
        .call(this.drag(this.simulation));

    this.node.append('title')
      .text(d => d.uri);

    this.node.append('text')
        .text(d => d.label)
        .attr('class', 'node-label')
      .clone(true).lower()
        .attr('class', 'node-label-outline');

    this.node.append('circle').lower()
      .attr('fill', d => this.colors(d.id.split(':')[0]))
      .attr('r', d => this.nodeSize(d.count));

    this.simulation.on('tick', () => this.ticked());
  }

  ticked() {
    this.linkPath.attr('d', d => this.arcPath(false, d));
    this.linkPath.attr('d', (d, i, n) => this.adjustMarker(true, d, n[i]));
    this.textPath.attr('d', d => this.arcPath(d.source.x < d.target.x, d));
    this.node.attr('transform', d => `translate(${d.x}, ${d.y})`);
  }

  nodeSize(n: number) {
    return ((n - this.minCount) / (this.maxCount - this.minCount)) * this.maxNodeSize + this.minNodeSize;
  }

  arcPath(leftHand, d) {
    const start = leftHand ? d.source : d.target,
      end = leftHand ? d.target : d.source,
      dx = end.x - start.x,
      dy = end.y - start.y,
      repetition = d.repetition ? 1 / 2 + 1 / (d.repetition * d.repetition) : 1,
      dr = Math.sqrt(dx * dx + dy * dy) * repetition,
      sweep = leftHand ? 0 : 1;
    return 'M' + start.x + ',' + start.y + 'A' + dr + ',' + dr + ' 0 0,' + sweep + ' ' + end.x + ',' + end.y;
  }

  adjustMarker(isSweep, d, node) {
    const r = this.nodeSize(d.target.count) + 7, // "size" of the marker Math.sqrt(5**2 + 5**2)
      m = node.getPointAtLength(r);

    const start = isSweep ? d.source : d.target,
      dx = m.x - start.x,
      dy = m.y - start.y,
      repetition = d.repetition ? 1 / 2 + 1 / (d.repetition * d.repetition) : 1,
      dr = Math.sqrt(dx * dx + dy * dy) * repetition,
      sweep = isSweep ? 0 : 1;

    return 'M' + start.x + ',' + start.y + 'A' + dr + ',' + dr + ' 0 0,' + sweep + ' ' + m.x + ',' + m.y;
  }

  drag = simulation => {

    function dragstarted(event) {
      if (!event.active) { simulation.alphaTarget(0.3).restart(); }
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event) {
      if (!event.active) { simulation.alphaTarget(0); }
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  }

  autocomplete: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) =>
    text$.pipe(
      tap(() => this.emptyAutocomplete = false),
      debounceTime(500),
      distinctUntilChanged(),
      tap(() => this.searching = true),
      switchMap(term => term.length < 3 ? of([]) :
        this.classService.getTopClassesContaining(this.datasetId, 10, term).pipe(
          tap(() => this.searchFailed = false),
          catchError(() => {
            this.searchFailed = true;
            return of([]);
          })
        )
      ),
      tap((results) => { this.searching = false; this.emptyAutocomplete = results.length < 1 })
    )

  browse(event) {
    const curie = event.currentTarget ? event.currentTarget.__data__.id : event.curie;
    if (this.datasetId === 'default') {
      this.router.navigate(['/overview', curie]);
    } else {
      this.router.navigate(['/datasets', this.datasetId, curie]);
    }
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

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  expand() {
    this.force = this.force * 1.5;
    this.simulation.force('charge', d3.forceManyBody().strength(-this.force));
    this.simulation.alpha(1).restart();
  }

  contract() {
    this.force = this.force * 0.5;
    this.simulation.force('charge', d3.forceManyBody().strength(-this.force));
    this.simulation.alpha(1).restart();
  }

  setFacetRelevance(relevance: number) {
    this.facetRelevance = relevance;
    this.loadClassList();
  }

  ngOnDestroy(): void {
    this.simulation.stop();
  }
}