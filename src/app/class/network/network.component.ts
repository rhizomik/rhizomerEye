import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthenticationBasicService } from '../../login-basic/authentication-basic.service';
import { DatasetService } from '../../dataset/dataset.service';
import { ClassService } from '../class.service';
import { FacetService } from '../../facet/facet.service';
import { Class } from '../class';
import { Facet } from '../../facet/facet';

import * as d3 from 'd3';

@Component({
  selector: 'app-network',
  templateUrl: './network.component.html',
  styleUrls: ['./network.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class NetworkComponent implements OnInit, OnDestroy {
  datasetId: string;
  classes: Class[];
  facets: Facet[];
  topClasses = 30;
  facetRelevance = 0.2;
  links: { id: string, label: string; source: string; target: string }[];
  nodes: { id: string; label: string; curie: string; count: number }[];
  maxCount: number;
  minCount: number;
  maxNodeSize: number;
  minNodeSize: number;
  svg: any;
  colors = d3.scaleOrdinal(d3.schemeCategory10);
  simulation: any;
  link: any;
  node: any;
  linkLabels: any;
  linkPath: any;
  textPath: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthenticationBasicService,
    private datasetService: DatasetService,
    private classService: ClassService,
    private facetService: FacetService) {
  }

  ngOnInit() {
    this.datasetId = this.route.snapshot.paramMap.get('did') || 'default';
    this.loadClassList();
  }

  loadClassList() {
    this.classService.getTopClasses(this.datasetId, this.topClasses).subscribe(
      (classes: Class[]) => {
        this.classes = classes;
        this.nodes = this.classes.map((cls: Class) => ({
          id: cls.uri,
          label: cls.label,
          curie: cls.curie,
          count: cls.instanceCount
        }));
        forkJoin(classes.map(cls => this.facetService.getAllRelevant(this.datasetId, cls.curie, this.facetRelevance)))
          .subscribe(
            classesFacets => {
              this.facets = classesFacets.reduce((acc, val) => acc.concat(val), []);
              this.links = this.facets.map((facet: Facet) => ({
                id: facet.id,
                label: facet.label,
                source: facet.domainURI,
                target: facet.range,
                count: facet.timesUsed
              }));
              this.links = this.links.filter(link =>
                  this.nodes.find(node => node.id === link.target) &&
                  this.nodes.find(node => node.id === link.source) &&
                  link.source !== link.target);
              this.nodes = this.nodes.filter(node =>
                this.links.find(link => node.id === link.target) ||
                this.links.find(link => node.id === link.source));
              this.setup();
            });
      },
      () => this.router.navigate(['/about']));
  }

  setup() {
    this.svg = d3.select('svg');
    const width = this.svg.node().getBoundingClientRect().width;
    const height = window.innerHeight - this.svg.node().getBoundingClientRect().top;
    const vmin = Math.min(width, height);
    const vmax = Math.max(width, height);
    this.svg = this.svg
      .attr('viewBox', [-width / 2, -height / 2, width, height]);

    this.maxCount = Math.max(...this.nodes.map(c => c.count), 0);
    this.minCount = Math.min(...this.nodes.map(c => c.count), this.maxCount);
    this.maxNodeSize = vmin / 30 + 5;
    this.minNodeSize = vmin / 90 + 5;

    this.simulation = d3.forceSimulation(this.nodes as any[])
      .force('link', d3.forceLink(this.links).id(d => d['id']).distance(vmin / 10))
      .force('charge', d3.forceManyBody().strength(-vmax))
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
      .text(d => d.id);

    this.node.append('text')
        .text(d => d.label)
        .attr('class', 'node-label')
      .clone(true).lower()
        .attr('class', 'node-label-outline');

    this.node.append('circle').lower()
      .attr('fill', d => this.colors(d.curie.split(':')[0]))
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
      dr = Math.sqrt(dx * dx + dy * dy),
      sweep = leftHand ? 0 : 1;
    return 'M' + start.x + ',' + start.y + 'A' + dr + ',' + dr + ' 0 0,' + sweep + ' ' + end.x + ',' + end.y;
  }

  adjustMarker(isSweep, d, node) {
    const pl = node.getTotalLength(),
      // radius of circle plus marker head
      r = this.nodeSize(d.target.count) + 7, // "size" of the marker Math.sqrt(5**2 + 5**2)
      // position close to where path intercepts circle
      m = node.getPointAtLength(r);

    const start = isSweep ? d.source : d.target,
      dx = m.x - start.x,
      dy = m.y - start.y,
      dr = Math.sqrt(dx * dx + dy * dy),
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

  browse(event) {
    const curie = event.currentTarget ? event.currentTarget.__data__.curie : event.curie;
    if (this.datasetId === 'default') {
      this.router.navigate(['/overview', curie]);
    } else {
      this.router.navigate(['/datasets', this.datasetId, curie]);
    }
  }

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  ngOnDestroy(): void {
    this.simulation.stop();
  }
}
