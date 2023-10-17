import {
  Component,
  OnInit,
  ViewChildren,
  QueryList,
  ChangeDetectorRef,
} from '@angular/core';
import { ymlService } from '../../service/yaml-parser/yaml-parser.service';
import * as d3 from 'd3';
import * as yaml from 'js-yaml';
import { Router, NavigationExtras } from '@angular/router';
import { MatChip } from '@angular/material/chips';
import { from, single } from 'rxjs';

export interface activitySchema {
  activityName: string;
  teamsImplemented: any;
}

export interface cardSchema {
  Dimension: string;
  SubDimension: string;
  Description: string;
  Level: string;
  'Done%': number;
  Activity: activitySchema[];
}

@Component({
  selector: 'app-circular-heatmap',
  templateUrl: './circular-heatmap.component.html',
  styleUrls: ['./circular-heatmap.component.css'],
})

export class CircularHeatmapComponent implements OnInit {
  Routing: string = '/activity-description';
  maxLevelOfActivities: number = -1;
  showActivityCard: boolean = false;
  cardHeader: string = '';
  cardSubheader: string = '';
  currentDimension: string = '';
  cardDescription: string = '';
  activityData: any[] = [];
  ALL_CARD_DATA: cardSchema[] = [];
  radial_labels: string[] = [];
  YamlObject: any;
  teamList: any;
  teamGroups: any;
  selectedTeamChips: string[] = ['All'];
  teamVisible: string[] = [];
  segment_labels: string[] = [];
  activityDetails: any;
  showOverlay: boolean;
  descMap = {};
  projectOptions = {};
  selectedProject: string;
  projectNames: [];

  changeProject(e) {
    localStorage.setItem('selectedProject', e.value);
    localStorage.setItem('selectedProjectConfig', this.projectOptions[e.value])
    location.reload();
  }

  constructor(
    private yaml: ymlService,
    private router: Router,
    private changeDetector: ChangeDetectorRef
  ) {
    this.showOverlay = false;
  }

  ngOnInit(): void {
    this.yaml.setURI('./assets/config/meta.yaml');
    // Function sets column header
    this.yaml.getJson().subscribe(data => {
      this.YamlObject = data;
      this.projectNames = this.YamlObject['projects'].map(p => p.name);
      this.YamlObject['projects'].forEach(p => this.projectOptions[p.name]= p.config);

      // Levels header
      for (let x in this.YamlObject['strings']['en']['maturity_levels']) {
        var y = parseInt(x) + 1;
        this.radial_labels.push('Level ' + y);
        this.maxLevelOfActivities = y;
      }

      this.loadProject();

    });


    // Team Data
    this.yaml.setURI('./assets/config/meta.yaml');
    this.yaml.getJson().subscribe(data => {
      this.YamlObject = data;

      this.teamList = this.YamlObject['teams'];
      this.teamGroups = this.YamlObject['teamGroups'];
      this.teamVisible = [...this.teamList];
    });

    this.yaml.setURI('./assets/config/DimensionInfo.yaml');
    this.yaml.getJson().subscribe(data => {
      this.YamlObject = data;
      Object.keys(data).forEach(d => this.descMap[d] = data[d].desc);
    });
  }

  loadProject = function() {
    var project = localStorage.getItem('selectedProject');
    this.selectedProject = project != null ? project :  "Mobile Sportsbook"
    
    this.yaml.setURI('./assets/config/'+this.projectOptions[this.selectedProject]);
    // Function sets data
    this.yaml.getJson().subscribe(data => {
      this.YamlObject = data;

      var allDimensionNames = Object.keys(this.YamlObject);
      // console.log(allDimensionNames);
      for (var i = 0; i < allDimensionNames.length; i++) {
        var allSubDimensionInThisDimension = Object.keys(
          this.YamlObject[allDimensionNames[i]]
        );
        for (var j = 0; j < allSubDimensionInThisDimension.length; j++) {
          this.segment_labels.push(allSubDimensionInThisDimension[j]);
        }
      }
      // console.log(this.segment_labels);
      for (var l = 0; l < this.maxLevelOfActivities; l++) {
        var allDimensionNames = Object.keys(this.YamlObject);
        for (var i = 0; i < allDimensionNames.length; i++) {
          var allSubDimensionInThisDimension = Object.keys(
            this.YamlObject[allDimensionNames[i]]
          );
          for (var j = 0; j < allSubDimensionInThisDimension.length; j++) {
            var allActivityInThisSubDimension = Object.keys(
              this.YamlObject[allDimensionNames[i]][
                allSubDimensionInThisDimension[j]
              ]
            );
            var tempData: cardSchema = {
              Dimension: '',
              SubDimension: '',
              Description: '',
              Level: '',
              'Done%': -1,
              Activity: [],
            };
            var totalTeamsImplemented: number = 0;
            var totalActivityTeams: number = 0;
            tempData['Dimension'] = allDimensionNames[i];
            tempData['SubDimension'] = allSubDimensionInThisDimension[j];
            tempData['Level'] = 'Level ' + (l + 1);
            tempData['Description'] = this.descMap[tempData['SubDimension']];
            for (var k = 0; k < allActivityInThisSubDimension.length; k++) {
              try {
                var lvlOfCurrentActivity =
                  this.YamlObject[allDimensionNames[i]][
                    allSubDimensionInThisDimension[j]
                  ][allActivityInThisSubDimension[k]]['level'];
                if (lvlOfCurrentActivity == l + 1) {
                  totalActivityTeams += 1;
                  var nameOfActivity: string = allActivityInThisSubDimension[k];

                  // Create an object from an array from meta data
                  const teams = this.teamList;

                  var teamStatus: { [key: string]: boolean } = {};

                  teams.forEach((singleTeam: any) => {
                    teamStatus[singleTeam] = false;
                  });

                  var teamsImplemented: any =
                    this.YamlObject[allDimensionNames[i]][
                      allSubDimensionInThisDimension[j]
                    ][allActivityInThisSubDimension[k]]['teamsImplemented'];
                  if (teamsImplemented) {
                    teamStatus = teamsImplemented;
                  }

                  // Calculating %done
                  (
                    Object.keys(teamStatus) as (keyof typeof teamStatus)[]
                  ).forEach((key, index) => {
                    // 👇️ name Bobby Hadz 0, country Chile 1
                    totalActivityTeams += 1;
                    if (teamStatus[key] === true) {
                      totalTeamsImplemented += 1;
                    }
                  });

                  tempData['Activity'].push({
                    activityName: nameOfActivity,
                    teamsImplemented: teamStatus,
                  });
                }
                if (totalActivityTeams > 0) {
                  tempData['Done%'] =
                    totalTeamsImplemented / totalActivityTeams;
                }
              } catch {
                console.log('level for activity does not exist');
              }
            }
            this.ALL_CARD_DATA.push(tempData);
          }
        }
      }
      this.loadState();
      this.loadCircularHeatMap(
        this.ALL_CARD_DATA,
        '#chart',
        this.radial_labels,
        this.segment_labels
      );
      this.noActivitytoGrey();
    });
  }

  // Team Filter BEGINS

  @ViewChildren(MatChip) chips!: QueryList<MatChip>;

  // Define an array to store MatChip components
  matChipsArray: MatChip[] = [];
  toggleTeamGroupSelection(chip: MatChip) {
    chip.toggleSelected();
    let currChipValue = chip.value.replace(/\s/g, '');

    if (chip.selected) {
      this.selectedTeamChips = [currChipValue];
      if (currChipValue == 'All') {
        this.teamVisible = [...this.teamList];
      } else {
        this.teamVisible = [];

        (
          Object.keys(this.teamGroups) as (keyof typeof this.teamGroups)[]
        ).forEach((key, index) => {
          if (key === currChipValue) {
            this.teamVisible = [...this.teamGroups[key]];
          }
        });
      }
    } else {
      this.selectedTeamChips = this.selectedTeamChips.filter(
        o => o !== currChipValue
      );
    }
    console.log('Selected Chips', this.selectedTeamChips);
    console.log('Team Visible', this.teamVisible);
    console.log('All chips', this.matChipsArray);

    // Update heatmap based on selection
    this.updateChips(true);
  }

  toggleTeamSelection(chip: MatChip) {
    chip.toggleSelected();
    let currChipValue = chip.value.replace(/\s/g, '');
    let prevSelectedChip = this.selectedTeamChips;
    if (chip.selected) {
      this.teamVisible.push(currChipValue);
      this.selectedTeamChips = [];
    } else {
      this.selectedTeamChips = [];
      this.teamVisible = this.teamVisible.filter(o => o !== currChipValue);
    }
    console.log('Selected Chips', this.selectedTeamChips);
    console.log('Team Visible', this.teamVisible);
    console.log('Team List', this.teamList);
    console.log('All chips', this.matChipsArray);
    // Update heatmap based on selection
    this.updateChips(prevSelectedChip);
  }

  ngAfterViewInit() {
    // Putting all the chips inside an array

    setTimeout(() => {
      this.matChipsArray = this.chips.toArray();
      this.updateChips(true);
      this.reColorHeatmap();
    }, 100);
  }
  updateChips(fromTeamGroup: any) {
    console.log('updating chips', fromTeamGroup);
    // Re select chips
    this.matChipsArray.forEach(chip => {
      let currChipValue = chip.value.replace(/\s/g, '');

      if (this.teamVisible.includes(currChipValue)) {
        console.log(currChipValue);
        chip.selected = true;
      } else {
        if (!this.selectedTeamChips.includes(currChipValue)) {
          chip.selected = false;
        }
      }
    });
    this.reColorHeatmap();
  }
  // Team Filter ENDS

  teamCheckbox(activityIndex: number, teamKey: any) {
    let _self = this;
    var index = 0;
    for (var i = 0; i < this.ALL_CARD_DATA.length; i++) {
      if (
        this.ALL_CARD_DATA[i]['SubDimension'] === this.cardHeader &&
        this.ALL_CARD_DATA[i]['Level'] === this.cardSubheader
      ) {
        index = i;
        break;
      }
    }
    this.ALL_CARD_DATA[index]['Activity'][activityIndex]['teamsImplemented'][
      teamKey
    ] =
      !this.ALL_CARD_DATA[index]['Activity'][activityIndex]['teamsImplemented'][
        teamKey
      ];
    this.saveState();
    this.reColorHeatmap();
  }

  loadCircularHeatMap(
    dataset: any,
    dom_element_to_append_to: string,
    radial_labels: string[],
    segment_labels: string[]
  ) {

    var noOfradialSegmentsRequired  = radial_labels.length; // dirty fix to remove level 0. 

    var showTooltip = function(evt, text) {
      let tooltip = document.getElementById("tooltip");
      tooltip.innerHTML = text;
      tooltip.style.display = "block";
      tooltip.style.left = evt.pageX + 10 + 'px';
      tooltip.style.top = evt.pageY + 10 + 'px';
    }
    
    var hideTooltip = function() {
      var tooltip = document.getElementById("tooltip");
      tooltip.style.display = "none";
    }


    //console.log(segment_labels)
    //d3.select(dom_element_to_append_to).selectAll('svg').exit()
    let _self = this;
    var margin = {
      top: 50,
      right: 50,
      bottom: 50,
      left: 50,
    };
    var width = 900;
    var curr: any;
    var height = width;
    var innerRadius = 50; // width/14;

    var segmentHeight =
      (width - margin.top - margin.bottom - 2 * innerRadius) /
      (2 * noOfradialSegmentsRequired);

    var chart = this.circularHeatChart(segment_labels.length)
      .innerRadius(innerRadius)
      .segmentHeight(segmentHeight)
      .domain([0, 1])
      .range(['white', 'green'])
      .radialLabels(radial_labels)
      .segmentLabels(segment_labels);

    chart.accessor(function (d: any) {
      return d['Done%'];
    });
    //d3.select("svg").remove();
    console.log(dataset, dataset)
    var data = dataset.filter(d => d.Level !== "Level 0");
    //data = dataset;
    var svg = d3
      .select(dom_element_to_append_to)
      .selectAll('svg')
      .data([data])
      .enter()
      .append('svg')
      .attr('width', height) // 70% forces the heatmap down
      .attr('height', height)
      .append('g')
      .attr(
        'transform',
        'translate(' +
          (width / 2 - (noOfradialSegmentsRequired * segmentHeight + innerRadius)) +
          ',' +
          margin.top +
          ')'
      )
      .call(chart);

    function cx() {
      var e = window.event as MouseEvent;
      return e.clientX;
    }
    function cy() {
      var e = window.event as MouseEvent;
      return e.clientY;
    }

    svg
      .selectAll('path')
      .on('click', function (d) {
        try {
          curr = d.explicitOriginalTarget.__data__;
        } catch {
          curr = d.srcElement.__data__;
        }
        var index = 0;
        var cnt = 0;
        for (var i = 0; i < _self.ALL_CARD_DATA.length; i++) {
          if (
            _self.ALL_CARD_DATA[i]['SubDimension'] === curr.SubDimension &&
            _self.ALL_CARD_DATA[i]['Level'] === curr.Level
          ) {
            index = i;
            break;
          }
        }
        if(_self.ALL_CARD_DATA[index]['Activity'].length == 0){
          return
        }
        _self.currentDimension = curr.Dimension;
        _self.cardSubheader = curr.Level;
        _self.activityData = curr.Activity;
        _self.cardHeader = curr.SubDimension;
        _self.cardDescription = _self.descMap[curr.SubDimension];

        _self.showActivityCard = true;
      })
      .on('mouseover', function (d) {
        try {
          curr = d.explicitOriginalTarget.__data__;
        } catch {
          curr = d.toElement.__data__;
        }
        // increase the segment height of the one being hovered as well as all others of the same date
        // while decreasing the height of all others accordingly
        
        var activityNames = curr.Activity.map(act => act.activityName).join("<BR>- ").replaceAll("\"", "");
        showTooltip(d, "<b>"+curr.Dimension+": "+curr.SubDimension+"</b> ("+curr.Level+")<BR>- "+activityNames);
        if (curr['Done%'] != -1) {
          d3.selectAll(
            '#segment-' +
              curr.SubDimension.replace(/ /g, '-') +
              '-' +
              curr.Level.replaceAll(' ', '-')
          ).attr('fill', 'yellow');
        }
      })

      .on('mouseout', function (d) {
        hideTooltip();
        if(curr['Activity'].length == 0){
          d3.selectAll(
            '#segment-' +
              curr.SubDimension.replace(/ /g, '-') +
              '-' +
              curr.Level.replaceAll(' ', '-')
          ).attr('fill', '#DCDCDC');
        }else if (curr['Done%'] != -1) {
          d3.selectAll(
            '#segment-' +
              curr.SubDimension.replace(/ /g, '-') +
              '-' +
              curr.Level.replaceAll(' ', '-')
          ).attr('fill', function (p) {
            var color = d3
              .scaleLinear<string, string>()
              .domain([0, 1])
              .range(['white', 'green']);
            // how to access a function within reusable charts
            //console.log(color(d.Done));
            return color(curr['Done%']);
          });
        } else {
          d3.selectAll(
            '#segment-' +
              curr.SubDimension.replace(/ /g, '-') +
              '-' +
              curr.Level.replaceAll(' ', '-')
          ).attr('fill', '#DCDCDC');
        }
      });
    this.reColorHeatmap();
  }



  circularHeatChart(num_of_segments: number) {
    var margin = {
        top: 20,
        right: 50,
        bottom: 50,
        left: 20,
      },
      innerRadius = 20,
      numSegments = num_of_segments,
      segmentHeight = 20,
      domain: any = null,
      range = ['white', 'red'],
      accessor = function (d: any) {
        return d;
      };
    var radialLabels = [];
    var segmentLabels: any[] = [];



    function chart(selection: any) {
      selection.each(function (this: any, data: any) {
        var svg = d3.select(this);

        var offset =
          innerRadius + Math.ceil(data.length / numSegments) * segmentHeight;
        var g = svg
          .append('g')
          .classed('circular-heat', true)
          .attr(
            'transform',
            'translate(' +
              (margin.left + offset) +
              ',' +
              (margin.top + offset) +
              ')'
          );

        var autoDomain = false;
        if (domain === null) {
          domain = d3.extent(data, accessor);
          autoDomain = true;
        }
        var color = d3
          .scaleLinear<string, string>()
          .domain(domain)
          .range(range);
        if (autoDomain) domain = null;

        g.selectAll('path')
          .data(data)
          .enter()
          .append('path')
          // .attr("class","segment")
          .attr('class', function (d: any) {
            return 'segment-' + d.SubDimension.replace(/ /g, '-');
          })
          .attr('id', function (d: any) {
            return (
              'segment-' +
              d.SubDimension.replace(/ /g, '-') +
              '-' +
              d.Level.replaceAll(' ', '-')
            );
          })
          .attr(
            'd',
            d3
              .arc<any>()
              .innerRadius(ir)
              .outerRadius(or)
              .startAngle(sa)
              .endAngle(ea)
          )
          .attr('stroke', function (d) {
            return '#252525';
          })
          .attr('fill', function (d) {
            return color(accessor(d));
          });

        // Unique id so that the text path defs are unique - is there a better way to do this?
        // console.log(d3.selectAll(".circular-heat")["_groups"][0].length)
        var id = 1;

        //Segment labels
        var segmentLabelOffset = 5;
        var r =
          innerRadius +
          Math.ceil(data.length / numSegments) * segmentHeight +
          segmentLabelOffset;
        var labels = svg
          .append('g')
          .classed('labels', true)
          .classed('segment', true)
          .attr(
            'transform',
            'translate(' +
              (margin.left + offset) +
              ',' +
              (margin.top + offset) +
              ')'
          );

        labels
          .append('def')
          .append('path')
          .attr('id', 'segment-label-path-' + id)
          .attr('d', 'm0 -' + r + ' a' + r + ' ' + r + ' 0 1 1 -1 0');

        var labelTexts = segmentLabels.map(l=> l.length > 16 ? l.substring(0,16)+"..." : l);

        labels
          .selectAll('text')
          .data(labelTexts)
          .enter()
          .append('text')
          .append('textPath')
          .attr('xlink:href', '#segment-label-path-' + id)
          .style('font-size', '10px')
          .style('white-space', 'nowrap')
          .style('overflow', 'hidden')
          .style('text-overflow', 'ellipsis')
          .attr('startOffset', function (d, i) {
            return (i * 100) / numSegments + 0.1 + '%';
          })
          .text(function (d: any) {
            return d;
          });
      });
    }

    /* Arc functions */
    var ir = function (d: any, i: number) {
      return innerRadius + Math.floor(i / numSegments) * segmentHeight;
    };
    var or = function (d: any, i: number) {
      return (
        innerRadius +
        segmentHeight +
        Math.floor(i / numSegments) * segmentHeight
      );
    };
    var sa = function (d: any, i: number) {
      return (i * 2 * Math.PI) / numSegments;
    };
    var ea = function (d: any, i: number) {
      return ((i + 1) * 2 * Math.PI) / numSegments;
    };

    /* Configuration getters/setters */
    chart.margin = function (_: any) {
      //if (!arguments.length) return margin;
      margin = _;
      return chart;
    };

    chart.innerRadius = function (_: any) {
      // if (!arguments.length) return innerRadius;
      innerRadius = _;
      return chart;
    };

    chart.numSegments = function (_: any) {
      //if (!arguments.length) return numSegments;
      numSegments = _;
      return chart;
    };

    chart.segmentHeight = function (_: any) {
      // if (!arguments.length) return segmentHeight;
      segmentHeight = _;
      return chart;
    };

    chart.domain = function (_: any) {
      //if (!arguments.length) return domain;
      domain = _;
      return chart;
    };

    chart.range = function (_: any) {
      // if (!arguments.length) return range;
      range = _;
      return chart;
    };

    chart.radialLabels = function (_: any) {
      // if (!arguments.length) return radialLabels;
      if (_ == null) _ = [];
      radialLabels = _;
      return chart;
    };

    chart.segmentLabels = function (_: any) {
      // if (!arguments.length) return segmentLabels;
      if (_ == null) _ = [];
      segmentLabels = _;
      return chart;
    };

    chart.accessor = function (_: any) {
      if (!arguments.length) return accessor;
      accessor = _;
      return chart;
    };

    return chart;
  }

  noActivitytoGrey(): void {
    for (var x = 0; x < this.ALL_CARD_DATA.length; x++) {
      if (this.ALL_CARD_DATA[x]['Activity'].length == 0) {
        d3.selectAll(
          '#segment-' +
            this.ALL_CARD_DATA[x]['SubDimension'].replace(/ /g, '-') +
            '-' +
            this.ALL_CARD_DATA[x]['Level'].replace(' ', '-')
        ).attr('fill', '#DCDCDC');
      }
    }
  }

  navigate(dim: string, subdim: string, activityName: string) {
    let navigationExtras = {
      dimension: dim,
      subDimension: subdim,
      activityName: activityName,
    };
    this.yaml.setURI('./assets/YAML/generated/generated.yaml');
    this.activityDetails = this.YamlObject[dim][subdim][activityName];
    if (this.activityDetails) {
      this.activityDetails.navigationExtras = navigationExtras;
    }
    this.showOverlay = true;
  }
  closeOverlay() {
    this.showOverlay = false;
  }
  SaveEditedYAMLfile() {
    let yamlStr = yaml.dump(this.YamlObject);
    let file = new Blob([yamlStr], { type: 'text/csv;charset=utf-8' });
    var link = document.createElement('a');
    link.href = window.URL.createObjectURL(file);
    link.download = 'generated.yaml';
    link.click();
    link.remove();
  }
  reColorHeatmap() {
    for (var index = 0; index < this.ALL_CARD_DATA.length; index += 1) {
      let cntAll: number = 0;
      let cntTrue: number = 0;
      var _self = this;
      for (var i = 0; i < this.ALL_CARD_DATA[index]['Activity'].length; i++) {
        var activityTeamList: any;
        activityTeamList =
          this.ALL_CARD_DATA[index]['Activity'][i]['teamsImplemented'];
        (
          Object.keys(activityTeamList) as (keyof typeof activityTeamList)[]
        ).forEach((key, index) => {
          if (typeof key === 'string') {
            if (this.teamVisible.includes(key)) {
              if (activityTeamList[key] === true) {
                cntTrue += 1;
              }
              cntAll += 1;
            }
          }
        });
      }
      if (cntAll !== 0) {
        this.ALL_CARD_DATA[index]['Done%'] = cntTrue / cntAll;
      } else {
        this.ALL_CARD_DATA[index]['Done%'] = 0;
      }
      var color = d3
        .scaleLinear<string, string>()
        .domain([0, 1])
        .range(['white', 'green']);

      d3.selectAll(
        '#segment-' +
          this.ALL_CARD_DATA[index]['SubDimension'].replace(/ /g, '-') +
          '-' +
          this.ALL_CARD_DATA[index]['Level'].replace(' ', '-')
      ).attr('fill', function (p) {
        return color(_self.ALL_CARD_DATA[index]['Done%']);
      });
    }
     this.noActivitytoGrey();
  }

  ResetIsImplemented() {
    for (var x = 0; x < this.ALL_CARD_DATA.length; x++) {
      if (this.ALL_CARD_DATA[x]['Done%'] > 0) {
        for (var y = 0; y < this.ALL_CARD_DATA[x]['Activity'].length; y++) {
          var currActivityTeamsImplemented =
            this.ALL_CARD_DATA[x]['Activity'][y]['teamsImplemented'];
          (
            Object.keys(
              currActivityTeamsImplemented
            ) as (keyof typeof currActivityTeamsImplemented)[]
          ).forEach((key, index) => {
            currActivityTeamsImplemented[key] = false;
          });
        }
        this.reColorHeatmap();
      }
    }
    this.saveState();
  }

  saveState() {
    localStorage.setItem('dataset', JSON.stringify(this.ALL_CARD_DATA));
  }
  loadState() {
    // var content = localStorage.getItem('dataset');
    // if (content != null) {
    //  this.ALL_CARD_DATA = JSON.parse(content);
    // }
  }
}
