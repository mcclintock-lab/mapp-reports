require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function(el) {
  var $el, $toggler, app, e, node, nodeid, toc, toggler, togglers, view, _i, _len, _ref;
  $el = $(el);
  app = window.app;
  toc = app.getToc();
  if (!toc) {
    console.log('No table of contents found');
    return;
  }
  togglers = $el.find('a[data-toggle-node]');
  _ref = togglers.toArray();
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    toggler = _ref[_i];
    $toggler = $(toggler);
    nodeid = $toggler.data('toggle-node');
    try {
      view = toc.getChildViewById(nodeid);
      node = view.model;
      $toggler.attr('data-visible', !!node.get('visible'));
      $toggler.data('tocItem', view);
    } catch (_error) {
      e = _error;
      $toggler.attr('data-not-found', 'true');
    }
  }
  return togglers.on('click', function(e) {
    e.preventDefault();
    $el = $(e.target);
    view = $el.data('tocItem');
    if (view) {
      view.toggleVisibility(e);
      return $el.attr('data-visible', !!view.model.get('visible'));
    } else {
      return alert("Layer not found in the current Table of Contents. \nExpected nodeid " + ($el.data('toggle-node')));
    }
  });
};


},{}],"/+NBkR":[function(require,module,exports){
var RecordSet, ReportTab, enableLayerTogglers, round, _ref,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

enableLayerTogglers = require('./enableLayerTogglers.coffee');

round = require('./utils.coffee').round;

RecordSet = (function() {
  function RecordSet(data) {
    this.data = data;
  }

  RecordSet.prototype.toArray = function() {
    return _.map(this.data.value[0].features, function(feature) {
      return feature.attributes;
    });
  };

  RecordSet.prototype.raw = function(attr) {
    var attrs;
    attrs = _.map(this.toArray(), function(row) {
      return row[attr];
    });
    attrs = _.filter(attrs, function(attr) {
      return attr !== void 0;
    });
    if (attrs.length === 0) {
      throw "Could not get attribute " + attr;
    } else if (attrs.length === 1) {
      return attrs[0];
    } else {
      return attrs;
    }
  };

  RecordSet.prototype.int = function(attr) {
    var raw;
    raw = this.raw(attr);
    if (_.isArray(raw)) {
      return _.map(raw, parseInt);
    } else {
      return parseInt(raw);
    }
  };

  RecordSet.prototype.float = function(attr, decimalPlaces) {
    var raw;
    if (decimalPlaces == null) {
      decimalPlaces = 2;
    }
    raw = this.raw(attr);
    if (_.isArray(raw)) {
      return _.map(raw, function(val) {
        return round(val, decimalPlaces);
      });
    } else {
      return round(raw, decimalPlaces);
    }
  };

  RecordSet.prototype.bool = function(attr) {
    var raw;
    raw = this.raw(attr);
    if (_.isArray(raw)) {
      return _.map(raw, function(val) {
        return val.toString().toLowerCase() === 'true';
      });
    } else {
      return raw.toString().toLowerCase() === 'true';
    }
  };

  return RecordSet;

})();

ReportTab = (function(_super) {
  __extends(ReportTab, _super);

  function ReportTab() {
    this.remove = __bind(this.remove, this);
    _ref = ReportTab.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  ReportTab.prototype.name = 'Information';

  ReportTab.prototype.dependencies = [];

  ReportTab.prototype.initialize = function(model, options) {
    this.model = model;
    this.options = options;
    this.app = window.app;
    return _.extend(this, this.options);
  };

  ReportTab.prototype.render = function() {
    throw 'render method must be overidden';
  };

  ReportTab.prototype.show = function() {
    this.$el.show();
    return this.visible = true;
  };

  ReportTab.prototype.hide = function() {
    this.$el.hide();
    return this.visible = false;
  };

  ReportTab.prototype.remove = function() {
    return ReportTab.__super__.remove.call(this);
  };

  ReportTab.prototype.onLoading = function() {};

  ReportTab.prototype.getResult = function(id) {
    var result, results;
    results = this.getResults();
    result = _.find(results, function(r) {
      return r.paramName === id;
    });
    if (result == null) {
      throw new Error('No result with id ' + id);
    }
    return result.value;
  };

  ReportTab.prototype.getFirstResult = function(param, id) {
    var e, result;
    result = this.getResult(param);
    try {
      return result[0].features[0].attributes[id];
    } catch (_error) {
      e = _error;
      throw "Error finding " + param + ":" + id + " in gp results";
    }
  };

  ReportTab.prototype.getResults = function() {
    var results, _ref1, _ref2;
    if (!(results = (_ref1 = this.results) != null ? (_ref2 = _ref1.get('data')) != null ? _ref2.results : void 0 : void 0)) {
      throw new Error('No gp results');
    }
    return _.filter(results, function(result) {
      var _ref3;
      return (_ref3 = result.paramName) !== 'ResultCode' && _ref3 !== 'ResultMsg';
    });
  };

  ReportTab.prototype.recordSet = function(dependency, paramName, sketchClassId) {
    var dep, param, rs;
    if (__indexOf.call(this.dependencies, dependency) < 0) {
      throw new Error("Unknown dependency " + dependency);
    }
    if (sketchClassId) {
      dep = _.find(this.allResults, function(result) {
        return result.get('name') === dependency && result.get('sketchClass') === sketchClassId;
      });
    } else {
      dep = _.find(this.allResults, function(result) {
        return result.get('name') === dependency;
      });
    }
    if (!dep) {
      console.log(this.allResults);
      throw new Error("Could not find results for " + dependency + ".");
    }
    console.log('dep', dep);
    param = _.find(dep.get('data').results, function(param) {
      return param.paramName === paramName;
    });
    if (!param) {
      console.log(dep.get('data').results);
      throw new Error("Could not find param " + paramName + " in " + dependency);
    }
    rs = new RecordSet(param);
    rs.sketchClass = dep.get('sketchClass');
    return rs;
  };

  ReportTab.prototype.recordSets = function(dependency, paramName) {
    var dep, deps, param, params, rs, _i, _len;
    if (__indexOf.call(this.dependencies, dependency) < 0) {
      throw new Error("Unknown dependency " + dependency);
    }
    deps = _.filter(this.allResults, function(result) {
      return result.get('name') === dependency;
    });
    console.log('deps', deps);
    if (!deps.length) {
      console.log(this.allResults);
      throw new Error("Could not find results for " + dependency + ".");
    }
    params = [];
    for (_i = 0, _len = deps.length; _i < _len; _i++) {
      dep = deps[_i];
      param = _.find(dep.get('data').results, function(param) {
        return param.paramName === paramName;
      });
      if (!param) {
        console.log(dep.get('data').results);
        throw new Error("Could not find param " + paramName + " in " + dependency);
      }
      rs = new RecordSet(param);
      rs.sketchClass = dep.get('sketchClass');
      params.push(rs);
    }
    return params;
  };

  ReportTab.prototype.enableTablePaging = function() {
    return this.$('[data-paging]').each(function() {
      var $table, i, noRowsMessage, pageSize, pages, parent, rows, ul, _i, _len, _ref1;
      $table = $(this);
      pageSize = $table.data('paging');
      rows = $table.find('tbody tr').length;
      pages = Math.ceil(rows / pageSize);
      if (pages > 1) {
        $table.append("<tfoot>\n  <tr>\n    <td colspan=\"" + ($table.find('thead th').length) + "\">\n      <div class=\"pagination\">\n        <ul>\n          <li><a href=\"#\">Prev</a></li>\n        </ul>\n      </div>\n    </td>\n  </tr>\n</tfoot>");
        ul = $table.find('tfoot ul');
        _ref1 = _.range(1, pages + 1);
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          i = _ref1[_i];
          ul.append("<li><a href=\"#\">" + i + "</a></li>");
        }
        ul.append("<li><a href=\"#\">Next</a></li>");
        $table.find('li a').click(function(e) {
          var $a, a, n, offset, text;
          e.preventDefault();
          $a = $(this);
          text = $a.text();
          if (text === 'Next') {
            a = $a.parent().parent().find('.active').next().find('a');
            if (a.text() !== 'Next') {
              return a.click();
            }
          } else if (text === 'Prev') {
            a = $a.parent().parent().find('.active').prev().find('a');
            if (a.text() !== 'Prev') {
              return a.click();
            }
          } else {
            $a.parent().parent().find('.active').removeClass('active');
            $a.parent().addClass('active');
            n = parseInt(text);
            $table.find('tbody tr').hide();
            offset = pageSize * (n - 1);
            return $table.find("tbody tr").slice(offset, n * pageSize).show();
          }
        });
        $($table.find('li a')[1]).click();
      }
      if (noRowsMessage = $table.data('no-rows')) {
        if (rows === 0) {
          parent = $table.parent();
          $table.remove();
          parent.removeClass('tableContainer');
          return parent.append("<p>" + noRowsMessage + "</p>");
        }
      }
    });
  };

  ReportTab.prototype.enableLayerTogglers = function() {
    return enableLayerTogglers(this.$el);
  };

  return ReportTab;

})(Backbone.View);

module.exports = ReportTab;


},{"./enableLayerTogglers.coffee":1,"./utils.coffee":3}],3:[function(require,module,exports){
module.exports = {
  round: function(number, decimalPlaces) {
    var multiplier;
    if (!_.isNumber(number)) {
      number = parseFloat(number);
    }
    multiplier = Math.pow(10, decimalPlaces);
    return Math.round(number * multiplier) / multiplier;
  }
};


},{}],4:[function(require,module,exports){
this["Templates"] = this["Templates"] || {};

this["Templates"]["node_modules/seasketch-reporting-api/attributes/attributeItem"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");_.b("<tr data-attribute-id=\"");_.b(_.v(_.f("id",c,p,0)));_.b("\" data-attribute-exportid=\"");_.b(_.v(_.f("exportid",c,p,0)));_.b("\" data-attribute-type=\"");_.b(_.v(_.f("type",c,p,0)));_.b("\">");_.b("\n" + i);_.b("  <td class=\"name\">");_.b(_.v(_.f("name",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("  <td class=\"value\">");_.b(_.v(_.f("formattedValue",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("</tr>");return _.fl();;});

this["Templates"]["node_modules/seasketch-reporting-api/attributes/attributesTable"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");_.b("<table class=\"attributes\">");_.b("\n" + i);if(_.s(_.f("attributes",c,p,1),c,p,0,44,81,"{{ }}")){_.rs(c,p,function(c,p,_){_.b(_.rp("attributes/attributeItem",c,p,"    "));});c.pop();}_.b("</table>");_.b("\n");return _.fl();;});

this["Templates"]["node_modules/seasketch-reporting-api/genericAttributes"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");if(_.s(_.d("sketchClass.deleted",c,p,1),c,p,0,24,270,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"alert alert-warn\" style=\"margin-bottom:10px;\">");_.b("\n" + i);_.b("  This sketch was created using the \"");_.b(_.v(_.d("sketchClass.name",c,p,0)));_.b("\" template, which is");_.b("\n" + i);_.b("  no longer available. You will not be able to copy this sketch or make new");_.b("\n" + i);_.b("  sketches of this type.");_.b("\n" + i);_.b("</div>");_.b("\n");});c.pop();}_.b("<div class=\"reportSection\">");_.b("\n" + i);_.b("  <h4>");_.b(_.v(_.d("sketchClass.name",c,p,0)));_.b(" Attributes</h4>");_.b("\n" + i);_.b(_.rp("attributes/attributesTable",c,p,"    "));_.b("  </table>");_.b("\n" + i);_.b("</div>");_.b("\n");return _.fl();;});

module.exports = this["Templates"];
},{}],5:[function(require,module,exports){
var ArrayEnvironmentTab, ReportTab, templates, _ref,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ReportTab = require('reportTab');

templates = require('../templates/templates.js');

ArrayEnvironmentTab = (function(_super) {
  __extends(ArrayEnvironmentTab, _super);

  function ArrayEnvironmentTab() {
    this.renderMarxanAnalysis = __bind(this.renderMarxanAnalysis, this);
    _ref = ArrayEnvironmentTab.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  ArrayEnvironmentTab.prototype.name = 'Environment';

  ArrayEnvironmentTab.prototype.className = 'environment';

  ArrayEnvironmentTab.prototype.template = templates.arrayEnvironment;

  ArrayEnvironmentTab.prototype.dependencies = ['Habitat', 'ExistingMarineProtectedAreas', 'OverlapWithImpAreas', 'MarxanAnalysis'];

  ArrayEnvironmentTab.prototype.timeout = 600000;

  ArrayEnvironmentTab.prototype.render = function() {
    var context,
      _this = this;
    console.log(this.recordSet('Habitat', 'ImportantAreas').toArray());
    console.log(this.recordSet('ExistingMarineProtectedAreas', "ExistingMarineProtectedAreas").toArray());
    console.log(this.recordSet("OverlapWithImpAreas", "ProvincialTenures").toArray());
    console.log(this.recordSet("MarxanAnalysis", "MarxanAnalysis").toArray());
    context = {
      sketch: this.model.forTemplate(),
      sketchClass: this.sketchClass.forTemplate(),
      attributes: this.model.getAttributes(),
      admin: this.project.isAdmin(window.user),
      habitats: this.recordSet('Habitat', 'ImportantAreas').toArray(),
      existingMPAs: this.recordSet('ExistingMarineProtectedAreas', "ExistingMarineProtectedAreas").toArray(),
      importantAreas: this.recordSet("OverlapWithImpAreas", "ProvincialTenures").toArray(),
      marxanAnalyses: _.map(this.recordSet("MarxanAnalysis", "MarxanAnalysis").toArray(), function(f) {
        return f.NAME;
      })
    };
    this.$el.html(this.template.render(context, templates));
    this.enableTablePaging();
    this.enableLayerTogglers();
    this.$('.chosen').chosen({
      disable_search_threshold: 10,
      width: '400px'
    });
    this.$('.chosen').change(function() {
      return _.defer(_this.renderMarxanAnalysis);
    });
    return this.renderMarxanAnalysis();
  };

  ArrayEnvironmentTab.prototype.renderMarxanAnalysis = function() {
    var color, data, domain, el, height, histo, i, margin, max_q, min_q, name, q, quantile, quantiles, records, svg, width, x, xAxis, y, yAxis, _i, _j, _len, _len1;
    name = this.$('.chosen').val();
    records = this.recordSet("MarxanAnalysis", "MarxanAnalysis").toArray();
    data = _.find(records, function(record) {
      return record.NAME === name;
    });
    histo = data.HISTO.slice(1, data.HISTO.length - 1).split(/\s/);
    histo = _.filter(histo, function(s) {
      return s.length > 0;
    });
    histo = _.map(histo, function(val) {
      return parseInt(val);
    });
    quantiles = _.filter(_.keys(data), function(key) {
      return key.indexOf('Q') === 0;
    });
    for (i = _i = 0, _len = quantiles.length; _i < _len; i = ++_i) {
      q = quantiles[i];
      if (parseFloat(data[q]) > parseFloat(data.SCORE) || i === quantiles.length - 1) {
        max_q = quantiles[i];
        min_q = quantiles[i - 1] || "Q0";
        break;
      }
    }
    this.$('.scenarioResults').html("The average Marxan score for this zones within this proposal is <strong>" + data.SCORE + "</strong>, placing it in \nthe <strong>" + (min_q.replace('Q', '')) + "% - " + (max_q.replace('Q', '')) + "% quantile \nrange</strong> for this sub-region.");
    this.$('.scenarioDescription').html(data.MARX_DESC.replace('this zone ', 'zones within this proposal '));
    domain = _.map(quantiles, function(q) {
      return data[q];
    });
    domain.push(100);
    domain.unshift(0);
    color = d3.scale.linear().domain(domain).range(["#47ae43", "#6c0", "#ee0", "#eb4", "#ecbb89", "#eeaba0"].reverse());
    quantiles = _.map(quantiles, function(key) {
      var max, min;
      max = parseFloat(data[key]);
      min = parseFloat(data[quantiles[_.indexOf(quantiles, key) - 1]] || 0);
      return {
        range: "" + (parseInt(key.replace('Q', '')) - 20) + "-" + (key.replace('Q', '')) + "%",
        name: key,
        start: min,
        end: max,
        bg: color((max + min) / 2)
      };
    });
    if (window.d3) {
      this.$('.viz').html('');
      el = this.$('.viz')[0];
      x = d3.scale.linear().domain([0, 100]).range([0, 400]);
      margin = {
        top: 5,
        right: 20,
        bottom: 30,
        left: 45
      };
      width = 400 - margin.left - margin.right;
      height = 300 - margin.top - margin.bottom;
      x = d3.scale.linear().domain([0, 100]).range([0, width]);
      y = d3.scale.linear().range([height, 0]).domain([0, d3.max(histo)]);
      xAxis = d3.svg.axis().scale(x).orient("bottom");
      yAxis = d3.svg.axis().scale(y).orient("left");
      svg = d3.select(this.$('.viz')[0]).append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).append("g").attr("transform", "translate(" + margin.left + ", " + margin.top + ")");
      svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")").call(xAxis).append("text").attr("x", width / 2).attr("dy", "3em").style("text-anchor", "middle").text("Score");
      svg.append("g").attr("class", "y axis").call(yAxis).append("text").attr("transform", "rotate(-90)").attr("y", 6).attr("dy", ".71em").style("text-anchor", "end").text("Number of Planning Units");
      svg.selectAll(".bar").data(histo).enter().append("rect").attr("class", "bar").attr("x", function(d, i) {
        return x(i);
      }).attr("width", width / 100).attr("y", function(d) {
        return y(d);
      }).attr("height", function(d) {
        return height - y(d);
      }).style('fill', function(d, i) {
        q = _.find(quantiles, function(q) {
          return i >= q.start && i <= q.end;
        });
        return (q != null ? q.bg : void 0) || "steelblue";
      });
      svg.selectAll(".score").data([Math.round(data.SCORE)]).enter().append("text").attr("class", "score").attr("x", function(d) {
        return (x(d) - 8) + 'px';
      }).attr("y", function(d) {
        return (y(histo[d]) - 10) + 'px';
      }).text("▼");
      svg.selectAll(".scoreText").data([Math.round(data.SCORE)]).enter().append("text").attr("class", "scoreText").attr("x", function(d) {
        return (x(d) - 6) + 'px';
      }).attr("y", function(d) {
        return (y(histo[d]) - 30) + 'px';
      }).text(function(d) {
        return d;
      });
      this.$('.viz').append('<div class="legends"></div>');
      for (_j = 0, _len1 = quantiles.length; _j < _len1; _j++) {
        quantile = quantiles[_j];
        this.$('.viz .legends').append("<div class=\"legend\"><span style=\"background-color:" + quantile.bg + ";\">&nbsp;</span>" + quantile.range + "</div>");
      }
      this.$('.viz').append('<br style="clear:both;">');
      return this.$('');
    }
  };

  return ArrayEnvironmentTab;

})(ReportTab);

module.exports = ArrayEnvironmentTab;


},{"../templates/templates.js":11,"reportTab":"/+NBkR"}],6:[function(require,module,exports){
var ArrayOverviewTab, ReportTab, key, partials, templates, val, _partials, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ReportTab = require('reportTab');

templates = require('../templates/templates.js');

_partials = require('../node_modules/seasketch-reporting-api/templates/templates.js');

partials = [];

for (key in _partials) {
  val = _partials[key];
  partials[key.replace('node_modules/seasketch-reporting-api/', '')] = val;
}

ArrayOverviewTab = (function(_super) {
  __extends(ArrayOverviewTab, _super);

  function ArrayOverviewTab() {
    _ref = ArrayOverviewTab.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  ArrayOverviewTab.prototype.name = 'Overview';

  ArrayOverviewTab.prototype.className = 'overview';

  ArrayOverviewTab.prototype.template = templates.arrayOverview;

  ArrayOverviewTab.prototype.dependencies = ['ZoneSize', 'TerrestrialProtectedAreas'];

  ArrayOverviewTab.prototype.timeout = 600000;

  ArrayOverviewTab.prototype.render = function() {
    var TableOfContents, context, node, nodes, _i, _len;
    context = {
      sketch: this.model.forTemplate(),
      sketchClass: this.sketchClass.forTemplate(),
      attributes: this.model.getAttributes(),
      admin: this.project.isAdmin(window.user),
      size: this.recordSet('ZoneSize', 'ZoneSize').float('SIZE_SQ_KM', 2),
      numChildren: this.children.length,
      adjacentProtectedArea: this.recordSet('TerrestrialProtectedAreas', 'TerrestrialProtectedAreas').bool('Result')[0]
    };
    this.$el.html(this.template.render(context, partials));
    this.enableLayerTogglers();
    nodes = [this.model];
    this.model.set('open', true);
    nodes = nodes.concat(this.children);
    for (_i = 0, _len = nodes.length; _i < _len; _i++) {
      node = nodes[_i];
      node.set('selected', false);
    }
    TableOfContents = window.require('views/tableOfContents');
    this.toc = new TableOfContents(nodes);
    this.$('.tocContainer').append(this.toc.el);
    return this.toc.render();
  };

  ArrayOverviewTab.prototype.remove = function() {
    var _ref1;
    if ((_ref1 = this.toc) != null) {
      _ref1.remove();
    }
    return ArrayOverviewTab.__super__.remove.call(this);
  };

  return ArrayOverviewTab;

})(ReportTab);

module.exports = ArrayOverviewTab;


},{"../node_modules/seasketch-reporting-api/templates/templates.js":4,"../templates/templates.js":11,"reportTab":"/+NBkR"}],7:[function(require,module,exports){
var ArrayEnvironmentTab, ArrayOverviewTab, CultureTab, EconomicTab;

ArrayOverviewTab = require('./arrayOverviewTab.coffee');

ArrayEnvironmentTab = require('./arrayEnvironmentTab.coffee');

EconomicTab = require('./economicTab.coffee');

CultureTab = require('./cultureTab.coffee');

window.app.registerReport(function(report) {
  report.tabs([ArrayOverviewTab, ArrayEnvironmentTab, EconomicTab, CultureTab]);
  return report.stylesheets(['./report.css']);
});


},{"./arrayEnvironmentTab.coffee":5,"./arrayOverviewTab.coffee":6,"./cultureTab.coffee":9,"./economicTab.coffee":10}],"reportTab":[function(require,module,exports){
module.exports=require('/+NBkR');
},{}],9:[function(require,module,exports){
var CultureTab, ReportTab, templates, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ReportTab = require('reportTab');

templates = require('../templates/templates.js');

CultureTab = (function(_super) {
  __extends(CultureTab, _super);

  function CultureTab() {
    _ref = CultureTab.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  CultureTab.prototype.name = 'Culture';

  CultureTab.prototype.className = 'culture';

  CultureTab.prototype.template = templates.culture;

  CultureTab.prototype.render = function() {
    var context, zoneType, _ref1, _ref2, _ref3;
    zoneType = _.find(this.model.getAttributes(), function(attr) {
      return attr.exportid === 'ZONE_TYPE';
    });
    zoneType = (zoneType != null ? zoneType.value : void 0) || 'smz';
    context = {
      sketch: this.model.forTemplate(),
      sketchClass: this.sketchClass.forTemplate(),
      attributes: this.model.getAttributes(),
      admin: this.project.isAdmin(window.user),
      array: ((_ref1 = this.children) != null ? _ref1.length : void 0) > 0,
      pmz: !(((_ref2 = this.children) != null ? _ref2.length : void 0) > 0) && zoneType === 'pmz',
      smz: !(((_ref3 = this.children) != null ? _ref3.length : void 0) > 0) && zoneType === 'smz'
    };
    this.$el.html(this.template.render(context, templates));
    return this.enableLayerTogglers();
  };

  return CultureTab;

})(ReportTab);

module.exports = CultureTab;


},{"../templates/templates.js":11,"reportTab":"/+NBkR"}],10:[function(require,module,exports){
var EconomicTab, ReportTab, templates, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ReportTab = require('reportTab');

templates = require('../templates/templates.js');

EconomicTab = (function(_super) {
  __extends(EconomicTab, _super);

  function EconomicTab() {
    _ref = EconomicTab.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  EconomicTab.prototype.name = 'Economy';

  EconomicTab.prototype.className = 'economic';

  EconomicTab.prototype.template = templates.economic;

  EconomicTab.prototype.dependencies = ["Closures", "OverlapWithExistingProvincialTenures"];

  EconomicTab.prototype.timeout = 600000;

  EconomicTab.prototype.render = function() {
    var context, zoneType, _ref1, _ref2, _ref3;
    zoneType = _.find(this.model.getAttributes(), function(attr) {
      return attr.exportid === 'ZONE_TYPE';
    });
    zoneType = (zoneType != null ? zoneType.value : void 0) || 'smz';
    context = {
      sketch: this.model.forTemplate(),
      sketchClass: this.sketchClass.forTemplate(),
      attributes: this.model.getAttributes(),
      admin: this.project.isAdmin(window.user),
      closures: this.recordSet("Closures", "FisheriesClosures").toArray(),
      provincial: this.recordSet("OverlapWithExistingProvincialTenures", "ProvincialTenures").toArray(),
      array: ((_ref1 = this.children) != null ? _ref1.length : void 0) > 0,
      pmz: !(((_ref2 = this.children) != null ? _ref2.length : void 0) > 0) && zoneType === 'pmz',
      smz: !(((_ref3 = this.children) != null ? _ref3.length : void 0) > 0) && zoneType === 'smz'
    };
    this.$el.html(this.template.render(context, templates));
    this.enableLayerTogglers();
    return this.enableTablePaging();
  };

  return EconomicTab;

})(ReportTab);

module.exports = EconomicTab;


},{"../templates/templates.js":11,"reportTab":"/+NBkR"}],11:[function(require,module,exports){
this["Templates"] = this["Templates"] || {};

this["Templates"]["arrayEnvironment"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Habitat Representation (All Zones Combined)</h4>");_.b("\n" + i);_.b("  <table data-paging=\"10\">");_.b("\n" + i);_.b("    <thead>");_.b("\n" + i);_.b("      <tr>");_.b("\n" + i);_.b("        <th>Habitat</th>");_.b("\n" + i);_.b("        <th>Protected Area (km²)</th>");_.b("\n" + i);_.b("      </tr>");_.b("\n" + i);_.b("    </thead>");_.b("\n" + i);_.b("    <tbody>");_.b("\n" + i);if(_.s(_.f("habitats",c,p,1),c,p,0,267,333,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <tr><td>");_.b(_.v(_.f("HAB_NAME",c,p,0)));_.b("</td><td>");_.b(_.v(_.f("CLPD_AREA",c,p,0)));_.b("</td></tr>");_.b("\n");});c.pop();}_.b("    </tbody>");_.b("\n" + i);_.b("    <tfoot>");_.b("\n" + i);_.b("      <tr>");_.b("\n" + i);_.b("        <td colspan=\"3\" class=\"paragraph\">");_.b("\n" + i);_.b("          Habitat data for benthic ecosystems, pelagic areas, and oceanographic processes is used to inform siting of zones. Included here are biogenic habitats as well as community-forming species, such as eelgrass and kelp.");_.b("\n" + i);_.b("        </td>");_.b("\n" + i);_.b("      </tr>");_.b("\n" + i);_.b("    </tfoot>");_.b("\n" + i);_.b("  </table>");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("\n" + i);_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Overlap with Existing Protected Areas <a href=\"#\" data-toggle-node=\"520d4c2a674659cb7b35d575\" data-visible=\"false\">show layer</a></h4>");_.b("\n" + i);_.b("  <table data-paging=\"10\" data-no-rows=\"Does not overlap any Existing Protected Areas. MaPP recommends spatial locations for marine protection that include either or both ecological and cultural values, including areas that contribute to a Marine Protected Area network for the Northern Shelf Bioregion.\">");_.b("\n" + i);_.b("    <thead>");_.b("\n" + i);_.b("      <tr>");_.b("\n" + i);_.b("        <th>Protected Area</th>");_.b("\n" + i);_.b("        <th>Overlap (km²)</th>");_.b("\n" + i);_.b("        <th>Overlap %</th>");_.b("\n" + i);_.b("      </tr>");_.b("\n" + i);_.b("    </thead>");_.b("\n" + i);_.b("    <tbody>");_.b("\n" + i);if(_.s(_.f("existingMPAs",c,p,1),c,p,0,1373,1491,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <tr>");_.b("\n" + i);_.b("        <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("        <td>");_.b(_.v(_.f("CLPD_AREA",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("        <td>");_.b(_.v(_.f("PERC_AREA",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("      </tr>");_.b("\n");});c.pop();}_.b("    </tbody>");_.b("\n" + i);_.b("    <tfoot>");_.b("\n" + i);_.b("      <tr>");_.b("\n" + i);_.b("        <td colspan=\"3\" class=\"paragraph\">");_.b("\n" + i);_.b("          MaPP recommends spatial locations for marine protection that include either or both ecological and cultural values, including areas that contribute to a Marine Protected Area network for the Northern Shelf Bioregion.  ");_.b("\n" + i);_.b("        </td>");_.b("\n" + i);_.b("      </tr>");_.b("\n" + i);_.b("    </tfoot>");_.b("\n" + i);_.b("  </table>");_.b("\n" + i);_.b("  <!-- <a href=\"#\" data-toggle-node=\"51f5545c08dc4f5f2d216146\" data-visible=\"false\">show habitats layer</a> -->");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("\n" + i);_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Overlap with Important Marine Areas</h4>");_.b("\n" + i);_.b("  <table  data-paging=\"10\" data-no-rows=\"Does not overlap any Important Marine Areas\">");_.b("\n" + i);_.b("    <thead>");_.b("\n" + i);_.b("      <tr>");_.b("\n" + i);_.b("        <th>Important Area</th>");_.b("\n" + i);_.b("        <th>Overlap (km²)</th>");_.b("\n" + i);_.b("        <th>Overlap %</th>");_.b("\n" + i);_.b("      </tr>");_.b("\n" + i);_.b("    </thead>");_.b("\n" + i);_.b("    <tbody>");_.b("\n" + i);if(_.s(_.f("importantAreas",c,p,1),c,p,0,2339,2457,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <tr>");_.b("\n" + i);_.b("        <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("        <td>");_.b(_.v(_.f("CLPD_AREA",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("        <td>");_.b(_.v(_.f("PERC_AREA",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("      </tr>");_.b("\n");});c.pop();}_.b("    </tbody>");_.b("\n" + i);_.b("    <tfoot>");_.b("\n" + i);_.b("      <tr>");_.b("\n" + i);_.b("        <td colspan=\"3\" class=\"paragraph\">");_.b("\n" + i);_.b("          To reduce potential conflicts with these marine species, ");if(_.s(_.f("pmz",c,p,1),c,p,0,2631,2658,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Protection Management Zones");});c.pop();}if(_.s(_.f("smz",c,p,1),c,p,0,2674,2698,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Special Management Zones");});c.pop();}_.b(" may consider these areas. Important Areas were identified during the process of establishing Ecologically and Biologically Significant Areas (EBSAs) by the Pacific North Coast Integrated Management Area (PNCIMA). Important Bird Areas (IBAs) were identified by Bird Studies Canada and Nature Canada.  Critical Habitat meets Canada's Species at Risk Requirements. Potential critical is insufficient information to meet SARA requirements. See the <a href=\"http://pncima.org/site/atlas.html\" target=\"_blank\">PNCIMA atlas</a> for more information ");_.b("\n" + i);_.b("        </td>");_.b("\n" + i);_.b("      </tr>");_.b("\n" + i);_.b("    </tfoot>");_.b("\n" + i);_.b("\n" + i);_.b("  </table>");_.b("\n" + i);_.b("  <!-- <a href=\"#\" data-toggle-node=\"51f5545c08dc4f5f2d216146\" data-visible=\"false\">show habitats layer</a> -->");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("\n" + i);_.b("\n" + i);_.b("<div class=\"reportSection\">");_.b("\n" + i);_.b("  <h4>Marxan Analysis</h4>");_.b("\n" + i);_.b("  <select class=\"chosen\" width=\"400px\">");_.b("\n" + i);if(_.s(_.f("marxanAnalyses",c,p,1),c,p,0,3540,3586,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("    <option value=\"");_.b(_.v(_.d(".",c,p,0)));_.b("\">");_.b(_.v(_.d(".",c,p,0)));_.b("</option>");_.b("\n");});c.pop();}_.b("  </select>");_.b("\n" + i);_.b("  <p class=\"scenarioResults\"></p>");_.b("\n" + i);_.b("  <div class=\"viz\"></div>");_.b("\n" + i);_.b("  <p class=\"scenarioDescription\"></p>");_.b("\n" + i);_.b("  <p>");_.b("\n" + i);_.b("    MaPP collaborated with the <a href=\"http://bcmca.ca/\" target=\"_blank\">BC Marine Conservation Analysis (BCMCA)</a> to identify marine areas of high conservation value based on spatial datasets of ecological information. These Marxan scenarios can be used to inform the location or siting of MaPP zones. <a href=\"http://www.uq.edu.au/marxan/\" target=\"_blank\">Marxan</a> is a decision support tool developed by the University of Queensland to provide solutions to the “minimum set problem” - capturing a specified amount (target) of individual features for the least cost. Based on relatively simple mathematical algorithms and equations, Marxan searches millions of potential solutions to find the best balance between costs and benefits. In short, Marxan solutions minimize the overall cost subject to the constraint of meeting specified “targets” for all features.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("  <p>");_.b("\n" + i);_.b("    MaPP consulted the MaPP Science Advisory Committee (SAC) for advice on scenarios and target selection.  The SAC supported the decision to use the percentage target categories established by the BCMCA project team in 2006. Please see this <a href=\"https://dl.dropboxusercontent.com/u/1764986/BCMCA-Marxan for MaPP-Report on initial scenarios_27Feb2013.pdf\" target=\"_blank\">2013 BCMCA report</a> for more information about the MaPP-BCMCA project and Marxan scenarios, and consult the <a href=\"http://bcmca.ca\" target=\"_blank\">BCMCA Atlas</a> for detailed information about targets, species, and habitats.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("</div>");_.b("\n");return _.fl();;});

this["Templates"]["arrayOverview"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");_.b("<div class=\"reportSection\">");_.b("\n" + i);_.b("  <h4>Size</h4>");_.b("\n" + i);_.b("  <p class=\"large\">");_.b("\n" + i);_.b("    This regional proposal contains ");_.b(_.v(_.f("numChildren",c,p,0)));_.b(" zones and covers a total of <strong>");_.b(_.v(_.f("size",c,p,0)));_.b(" square kilometers</strong>.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("  <div class=\"tocContainer\"></div>");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("\n" + i);if(_.s(_.f("adjacentProtectedArea",c,p,1),c,p,0,265,741,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"reportSection\">");_.b("\n" + i);_.b("  <h4>Nearby Areas</h4>");_.b("\n" + i);_.b("  <p class=\"large green-check\">");_.b("\n" + i);_.b("    Zones within this proposal are adjacent to a <strong>Terrestrial Protected Area</strong>.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("  <p>");_.b("\n" + i);_.b("    Build on past and existing zoning efforts that are consistent with an ecosystem-based management approach.  Wherever possible, do not duplicate existing zoning efforts and consider existing terrestrial zoning for adjacent marine zoning to achieve zoning objectives.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("</div>");_.b("\n");});c.pop();}_.b("\n" + i);_.b("<!-- <div class=\"reportSection\">");_.b("\n" + i);_.b("  <h4>Transmission Lines <a href=\"#\" data-toggle-node=\"51f6ad677bbb9b2457020f52\" data-visible=\"false\">show layer</a></h4>");_.b("\n" + i);_.b("  <p class=\"large\">");_.b("\n" + i);_.b("    This zone is ");_.b(_.v(_.f("transmissionLines",c,p,0)));_.b(" km from the nearest transmission lines.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b(" -->");_.b("\n" + i);if(_.s(_.f("attributes",c,p,1),c,p,0,1057,1183,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"reportSection\">");_.b("\n" + i);_.b("  <h4>");_.b(_.v(_.d("sketchClass.name",c,p,0)));_.b(" Attributes</h4>");_.b("\n" + i);_.b(_.rp("attributes/attributesTable",c,p,"    "));_.b("  </table>");_.b("\n" + i);_.b("</div>");_.b("\n");});c.pop();}return _.fl();;});

this["Templates"]["culture"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");_.b("<div class=\"reportSection ");if(_.s(_.f("overlap",c,p,1),c,p,0,38,46,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("emphasis");});c.pop();}_.b("\">");_.b("\n" + i);_.b("  <h4>Cultural Uses<!-- Overlap with Historical or Archeological Sites --></h4>");_.b("\n" + i);_.b("  <p>");_.b("\n" + i);if(_.s(_.f("smz",c,p,1),c,p,0,159,373,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("    First Nations traditional uses continue in the Special Management Zone in accordance with");_.b("\n" + i);_.b("    legal obligations and government policies, including practices for food, social, and ceremonial");_.b("\n" + i);_.b("    fisheries.");_.b("\n");});c.pop();}if(_.s(_.f("pmz",c,p,1),c,p,0,394,611,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("    First Nations traditional uses continue in the Protection Management Zone in accordance with");_.b("\n" + i);_.b("    legal obligations and government policies, including practices for food, social, and ceremonial");_.b("\n" + i);_.b("    fisheries.");_.b("\n");});c.pop();}if(_.s(_.f("array",c,p,1),c,p,0,634,847,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("    First Nations traditional uses continue in zones within this proposal in accordance with");_.b("\n" + i);_.b("    legal obligations and government policies, including practices for food, social, and ceremonial");_.b("\n" + i);_.b("    fisheries.");_.b("\n");});c.pop();}_.b("  </p>");_.b("\n" + i);_.b("<!--   <p>");_.b("\n" + i);if(_.s(_.f("overlap",c,p,1),c,p,0,892,970,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("    This zone overlaps with sensitive historical or archeological areas.");_.b("\n");});c.pop();}if(!_.s(_.f("overlap",c,p,1),c,p,1,0,0,"")){_.b("    This zone </strong>does not</strong> overlap with any sensitive historical or archeological areas.");_.b("\n");};_.b("  </p> -->");_.b("\n" + i);_.b("</div>");_.b("\n");return _.fl();;});

this["Templates"]["demo"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");_.b("<div class=\"reportSection\">");_.b("\n" + i);_.b("  <h4>Output</h4>");_.b("\n" + i);_.b("  <pre>");_.b(_.v(_.f("result",c,p,0)));_.b("</pre>");_.b("\n" + i);_.b("</div>");_.b("\n");return _.fl();;});

this["Templates"]["economic"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");if(_.s(_.f("pmz",c,p,1),c,p,0,8,1290,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Overlap with Fisheries Closures</h4>");_.b("\n" + i);_.b("  <table data-paging=\"10\" data-no-rows=\"Does not overlap any Fisheries Closures. Fisheries closures may need to be considered to reduce potential conflicts between uses and activities. Federal Rockfish Conservation Areas and Federal Sponge Reef Reserve are analysed for overlap with ");if(_.s(_.f("array",c,p,1),c,p,0,388,414,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("zones within this proposal");});c.pop();}if(!_.s(_.f("array",c,p,1),c,p,1,0,0,"")){_.b("this zone");};_.b(". \">");_.b("\n" + i);_.b("    <thead>");_.b("\n" + i);_.b("      <tr>");_.b("\n" + i);_.b("        <th>Tenures</th>");_.b("\n" + i);_.b("        <th>Overlap (km²)</th>");_.b("\n" + i);_.b("        <th>Overlap %</th>");_.b("\n" + i);_.b("      </tr>");_.b("\n" + i);_.b("    </thead>");_.b("\n" + i);_.b("    <tbody>");_.b("\n" + i);if(_.s(_.f("closures",c,p,1),c,p,0,620,738,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <tr>");_.b("\n" + i);_.b("        <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("        <td>");_.b(_.v(_.f("CLPD_AREA",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("        <td>");_.b(_.v(_.f("PERC_AREA",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("      </tr>");_.b("\n");});c.pop();}_.b("    </tbody>");_.b("\n" + i);_.b("    <tfoot>");_.b("\n" + i);_.b("      <tr>");_.b("\n" + i);_.b("        <td colspan=\"3\" class=\"paragraph\">");_.b("\n" + i);_.b("          Fisheries closures may need to be considered to reduce potential conflicts between uses and activities. Federal Rockfish Conservation Areas and Federal Sponge Reef Reserve are analysed for overlap with ");if(_.s(_.f("array",c,p,1),c,p,0,1053,1079,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("zones within this proposal");});c.pop();}if(!_.s(_.f("array",c,p,1),c,p,1,0,0,"")){_.b("this zone");};_.b(". ");_.b("\n" + i);_.b("        </td>");_.b("\n" + i);_.b("      </tr>");_.b("\n" + i);_.b("    </tfoot>");_.b("\n" + i);_.b("  </table>");_.b("\n" + i);_.b("  <!-- <a href=\"#\" data-toggle-node=\"51f5545c08dc4f5f2d216146\" data-visible=\"false\">show habitats layer</a> -->");_.b("\n" + i);_.b("</div>");_.b("\n");});c.pop();}_.b("\n" + i);_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Overlap with Provincial Tenures <a href=\"#\" data-toggle-node=\"51f2f5cba72ec0681606208e\" data-visible=\"false\">show layer</a></h4>");_.b("\n" + i);_.b("  <table data-paging=\"10\" data-no-rows=\"Does not overlap any Provincial Tenures.\">");_.b("\n" + i);_.b("    <thead>");_.b("\n" + i);_.b("      <tr>");_.b("\n" + i);_.b("        <th>Tenures</th>");_.b("\n" + i);_.b("        <th>Overlap (km²)</th>");_.b("\n" + i);_.b("        <th>Overlap %</th>");_.b("\n" + i);_.b("      </tr>");_.b("\n" + i);_.b("    </thead>");_.b("\n" + i);_.b("    <tbody>");_.b("\n" + i);if(_.s(_.f("provincial",c,p,1),c,p,0,1725,1843,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <tr>");_.b("\n" + i);_.b("        <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("        <td>");_.b(_.v(_.f("CLPD_AREA",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("        <td>");_.b(_.v(_.f("PERC_AREA",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("      </tr>");_.b("\n");});c.pop();}_.b("    </tbody>");_.b("\n" + i);_.b("    <tfoot>");_.b("\n" + i);_.b("      <tr>");_.b("\n" + i);_.b("        <td colspan=\"3\" class=\"paragraph\">");_.b("\n" + i);if(_.s(_.f("smz",c,p,1),c,p,0,1956,2270,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          One of the objectives for Special Management Zones is to provide for certainty for business and user groups, including economic development opportunities.  To reduce potential conflicts between uses and activities, Special Management Zones need to consider existing provincial crown tenures. ");_.b("\n");});c.pop();}if(_.s(_.f("pmz",c,p,1),c,p,0,2297,2457,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          To reduce potential conflicts between uses and activities, Protection Management Zones need to consider existing provincial crown tenures.");_.b("\n");});c.pop();}if(_.s(_.f("array",c,p,1),c,p,0,2486,2624,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          To reduce potential conflicts between uses and activities, zones need to consider existing provincial crown tenures.");_.b("\n");});c.pop();}_.b("        </td>");_.b("\n" + i);_.b("      </tr>");_.b("\n" + i);_.b("    </tfoot>");_.b("\n" + i);_.b("  </table>");_.b("\n" + i);_.b("  <!-- <a href=\"#\" data-toggle-node=\"51f5545c08dc4f5f2d216146\" data-visible=\"false\">show habitats layer</a> -->");_.b("\n" + i);_.b("</div>");_.b("\n");return _.fl();;});

this["Templates"]["environment"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Habitat Representation <!-- <a href=\"#\" data-toggle-node=\"51f302d508dc4f5f2d00996a\" data-visible=\"false\">show layer</a> --></h4>");_.b("\n" + i);_.b("  <table data-paging=\"10\">");_.b("\n" + i);_.b("    <thead>");_.b("\n" + i);_.b("      <tr>");_.b("\n" + i);_.b("        <th>Habitat</th>");_.b("\n" + i);_.b("        <th>Protected Area (km²)</th>");_.b("\n" + i);_.b("      </tr>");_.b("\n" + i);_.b("    </thead>");_.b("\n" + i);_.b("    <tbody>");_.b("\n" + i);if(_.s(_.f("habitats",c,p,1),c,p,0,347,413,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <tr><td>");_.b(_.v(_.f("HAB_NAME",c,p,0)));_.b("</td><td>");_.b(_.v(_.f("CLPD_AREA",c,p,0)));_.b("</td></tr>");_.b("\n");});c.pop();}_.b("    </tbody>");_.b("\n" + i);_.b("    <tfoot>");_.b("\n" + i);_.b("      <tr>");_.b("\n" + i);_.b("        <td colspan=\"3\" class=\"paragraph\">");_.b("\n" + i);_.b("          Habitat data for benthic ecosystems, pelagic areas, and oceanographic processes is used to inform siting of this zone. Included here are biogenic habitats as well as community-forming species, such as eelgrass and kelp.");_.b("\n" + i);_.b("        </td>");_.b("\n" + i);_.b("      </tr>");_.b("\n" + i);_.b("    </tfoot>");_.b("\n" + i);_.b("  </table>");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("\n" + i);_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Overlap with Existing Protected Areas <a href=\"#\" data-toggle-node=\"520d4c2a674659cb7b35d575\" data-visible=\"false\">show layer</a></h4>");_.b("\n" + i);_.b("  <table data-paging=\"10\" data-no-rows=\"Does not overlap any Existing Protected Areas. MaPP recommends spatial locations for marine protection that include either or both ecological and cultural values, including areas that contribute to a Marine Protected Area network for the Northern Shelf Bioregion.\">");_.b("\n" + i);_.b("    <thead>");_.b("\n" + i);_.b("      <tr>");_.b("\n" + i);_.b("        <th>Protected Area</th>");_.b("\n" + i);_.b("        <th>Overlap (km²)</th>");_.b("\n" + i);_.b("        <th>Overlap %</th>");_.b("\n" + i);_.b("      </tr>");_.b("\n" + i);_.b("    </thead>");_.b("\n" + i);_.b("    <tbody>");_.b("\n" + i);if(_.s(_.f("existingMPAs",c,p,1),c,p,0,1457,1575,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <tr>");_.b("\n" + i);_.b("        <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("        <td>");_.b(_.v(_.f("CLPD_AREA",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("        <td>");_.b(_.v(_.f("PERC_AREA",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("      </tr>");_.b("\n");});c.pop();}_.b("    </tbody>");_.b("\n" + i);_.b("    <tfoot>");_.b("\n" + i);_.b("      <tr>");_.b("\n" + i);_.b("        <td colspan=\"3\" class=\"paragraph\">");_.b("\n" + i);_.b("          MaPP recommends spatial locations for marine protection that include either or both ecological and cultural values, including areas that contribute to a Marine Protected Area network for the Northern Shelf Bioregion.  ");_.b("\n" + i);_.b("        </td>");_.b("\n" + i);_.b("      </tr>");_.b("\n" + i);_.b("    </tfoot>");_.b("\n" + i);_.b("  </table>");_.b("\n" + i);_.b("  <!-- <a href=\"#\" data-toggle-node=\"51f5545c08dc4f5f2d216146\" data-visible=\"false\">show habitats layer</a> -->");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("\n" + i);_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Overlap with Important Marine Areas</h4>");_.b("\n" + i);_.b("  <table  data-paging=\"10\" data-no-rows=\"Does not overlap any Important Marine Areas\">");_.b("\n" + i);_.b("    <thead>");_.b("\n" + i);_.b("      <tr>");_.b("\n" + i);_.b("        <th>Important Area</th>");_.b("\n" + i);_.b("        <th>Overlap (km²)</th>");_.b("\n" + i);_.b("        <th>Overlap %</th>");_.b("\n" + i);_.b("      </tr>");_.b("\n" + i);_.b("    </thead>");_.b("\n" + i);_.b("    <tbody>");_.b("\n" + i);if(_.s(_.f("importantAreas",c,p,1),c,p,0,2423,2541,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <tr>");_.b("\n" + i);_.b("        <td>");_.b(_.v(_.f("NAME",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("        <td>");_.b(_.v(_.f("CLPD_AREA",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("        <td>");_.b(_.v(_.f("PERC_AREA",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("      </tr>");_.b("\n");});c.pop();}_.b("    </tbody>");_.b("\n" + i);_.b("    <tfoot>");_.b("\n" + i);_.b("      <tr>");_.b("\n" + i);_.b("        <td colspan=\"3\" class=\"paragraph\">");_.b("\n" + i);_.b("          To reduce potential conflicts with these marine species, ");if(_.s(_.f("pmz",c,p,1),c,p,0,2715,2742,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Protection Management Zones");});c.pop();}if(_.s(_.f("smz",c,p,1),c,p,0,2758,2782,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("Special Management Zones");});c.pop();}_.b(" may consider these areas. Important Areas were identified during the process of establishing Ecologically and Biologically Significant Areas (EBSAs) by the Pacific North Coast Integrated Management Area (PNCIMA). Important Bird Areas (IBAs) were identified by Bird Studies Canada and Nature Canada.  Critical Habitat meets Canada's Species at Risk Requirements. Potential critical is insufficient information to meet SARA requirements. See the <a href=\"http://pncima.org/site/atlas.html\" target=\"_blank\">PNCIMA atlas</a> for more information ");_.b("\n" + i);_.b("        </td>");_.b("\n" + i);_.b("      </tr>");_.b("\n" + i);_.b("    </tfoot>");_.b("\n" + i);_.b("\n" + i);_.b("  </table>");_.b("\n" + i);_.b("  <!-- <a href=\"#\" data-toggle-node=\"51f5545c08dc4f5f2d216146\" data-visible=\"false\">show habitats layer</a> -->");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("\n" + i);_.b("\n" + i);_.b("<div class=\"reportSection\">");_.b("\n" + i);_.b("  <h4>Marxan Analysis</h4>");_.b("\n" + i);_.b("  <select class=\"chosen\" width=\"400px\">");_.b("\n" + i);if(_.s(_.f("marxanAnalyses",c,p,1),c,p,0,3624,3670,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("    <option value=\"");_.b(_.v(_.d(".",c,p,0)));_.b("\">");_.b(_.v(_.d(".",c,p,0)));_.b("</option>");_.b("\n");});c.pop();}_.b("  </select>");_.b("\n" + i);_.b("  <p class=\"scenarioResults\"></p>");_.b("\n" + i);_.b("  <div class=\"viz\"></div>");_.b("\n" + i);_.b("  <p class=\"scenarioDescription\"></p>");_.b("\n" + i);_.b("  <p>");_.b("\n" + i);_.b("    MaPP collaborated with the <a href=\"http://bcmca.ca/\" target=\"_blank\">BC Marine Conservation Analysis (BCMCA)</a> to identify marine areas of high conservation value based on spatial datasets of ecological information. These Marxan scenarios can be used to inform the location or siting of MaPP zones. <a href=\"http://www.uq.edu.au/marxan/\" target=\"_blank\">Marxan</a> is a decision support tool developed by the University of Queensland to provide solutions to the “minimum set problem” - capturing a specified amount (target) of individual features for the least cost. Based on relatively simple mathematical algorithms and equations, Marxan searches millions of potential solutions to find the best balance between costs and benefits. In short, Marxan solutions minimize the overall cost subject to the constraint of meeting specified “targets” for all features.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("  <p>");_.b("\n" + i);_.b("    MaPP consulted the MaPP Science Advisory Committee (SAC) for advice on scenarios and target selection.  The SAC supported the decision to use the percentage target categories established by the BCMCA project team in 2006. Please see this <a href=\"https://dl.dropboxusercontent.com/u/1764986/BCMCA-Marxan for MaPP-Report on initial scenarios_27Feb2013.pdf\" target=\"_blank\">2013 BCMCA report</a> for more information about the MaPP-BCMCA project and Marxan scenarios, and consult the <a href=\"http://bcmca.ca\" target=\"_blank\">BCMCA Atlas</a> for detailed information about targets, species, and habitats.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("</div>");_.b("\n");return _.fl();;});

this["Templates"]["overview"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");_.b("<div class=\"reportSection\">");_.b("\n" + i);_.b("  <h4>Size</h4>");_.b("\n" + i);_.b("  <p class=\"large\">");_.b("\n" + i);_.b("    This zone is <strong>");_.b(_.v(_.f("size",c,p,0)));_.b(" square kilometers</strong>. Size is used to quantify draft spatial zones and provide percent coverage. ");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("\n" + i);if(_.s(_.f("adjacentProtectedArea",c,p,1),c,p,0,243,701,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"reportSection\">");_.b("\n" + i);_.b("  <h4>Nearby Areas</h4>");_.b("\n" + i);_.b("  <p class=\"large green-check\">");_.b("\n" + i);_.b("    This zone is adjacent to a <strong>Terrestrial Protected Area</strong>.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("  <p>");_.b("\n" + i);_.b("    Build on past and existing zoning efforts that are consistent with an ecosystem-based management approach.  Wherever possible, do not duplicate existing zoning efforts and consider existing terrestrial zoning for adjacent marine zoning to achieve zoning objectives.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("</div>");_.b("\n");});c.pop();}_.b("\n" + i);if(!_.s(_.f("pmz",c,p,1),c,p,1,0,0,"")){_.b("<div class=\"reportSection\">");_.b("\n" + i);_.b("  <h4>Transmission Lines <a href=\"#\" data-toggle-node=\"51f6ad677bbb9b2457020f52\" data-visible=\"false\">show layer</a></h4>");_.b("\n" + i);_.b("  <p class=\"large\">");_.b("\n" + i);_.b("    This zone is ");_.b(_.v(_.f("transmissionLines",c,p,0)));_.b(" km from the nearest transmission lines.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("\n" + i);_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Distance to Infrastructure</h4>");_.b("\n" + i);_.b("  <table>");_.b("\n" + i);_.b("    <thead>");_.b("\n" + i);_.b("      <tr>");_.b("\n" + i);_.b("        <th>Infrastructure</th>");_.b("\n" + i);_.b("        <th>Distance (km)</th>");_.b("\n" + i);_.b("      </tr>");_.b("\n" + i);_.b("    </thead>");_.b("\n" + i);_.b("    <tbody>");_.b("\n" + i);if(_.s(_.f("infrastructure",c,p,1),c,p,0,1241,1327,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("      <tr>");_.b("\n" + i);_.b("        <td>");_.b(_.v(_.f("Name",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("        <td>");_.b(_.v(_.f("DistInKM",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("      </tr>");_.b("\n");});c.pop();}_.b("    </tbody>");_.b("\n" + i);_.b("    <tfoot>");_.b("\n" + i);_.b("      <tr>");_.b("\n" + i);_.b("      <td colspan=\"2\" class=\"paragraph\">");_.b("\n" + i);_.b("      The horizontal distance to ferries, ports, harbours, fuel docks, and other marine and coastal infrastructure might be helpful for planning marine uses and activities that are supported in this zone. ");_.b("\n" + i);_.b("      </td>");_.b("\n" + i);_.b("      </tr>");_.b("\n" + i);_.b("    </tfoot>");_.b("\n" + i);_.b("  </table>");_.b("\n" + i);_.b("</div>");_.b("\n");};_.b("\n" + i);_.b("\n" + i);if(_.s(_.f("anyAttributes",c,p,1),c,p,0,1714,1840,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"reportSection\">");_.b("\n" + i);_.b("  <h4>");_.b(_.v(_.d("sketchClass.name",c,p,0)));_.b(" Attributes</h4>");_.b("\n" + i);_.b(_.rp("attributes/attributesTable",c,p,"    "));_.b("  </table>");_.b("\n" + i);_.b("</div>");_.b("\n");});c.pop();}return _.fl();;});

module.exports = this["Templates"];
},{}]},{},[7])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvY2J1cnQvV29ya2luZy9tYXBwLXJlcG9ydHMvbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3NjcmlwdHMvZW5hYmxlTGF5ZXJUb2dnbGVycy5jb2ZmZWUiLCIvVXNlcnMvY2J1cnQvV29ya2luZy9tYXBwLXJlcG9ydHMvbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3NjcmlwdHMvcmVwb3J0VGFiLmNvZmZlZSIsIi9Vc2Vycy9jYnVydC9Xb3JraW5nL21hcHAtcmVwb3J0cy9ub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvc2NyaXB0cy91dGlscy5jb2ZmZWUiLCIvVXNlcnMvY2J1cnQvV29ya2luZy9tYXBwLXJlcG9ydHMvbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3RlbXBsYXRlcy90ZW1wbGF0ZXMuanMiLCIvVXNlcnMvY2J1cnQvV29ya2luZy9tYXBwLXJlcG9ydHMvc2NyaXB0cy9hcnJheUVudmlyb25tZW50VGFiLmNvZmZlZSIsIi9Vc2Vycy9jYnVydC9Xb3JraW5nL21hcHAtcmVwb3J0cy9zY3JpcHRzL2FycmF5T3ZlcnZpZXdUYWIuY29mZmVlIiwiL1VzZXJzL2NidXJ0L1dvcmtpbmcvbWFwcC1yZXBvcnRzL3NjcmlwdHMvYXJyYXlSZXBvcnQuY29mZmVlIiwiL1VzZXJzL2NidXJ0L1dvcmtpbmcvbWFwcC1yZXBvcnRzL3NjcmlwdHMvY3VsdHVyZVRhYi5jb2ZmZWUiLCIvVXNlcnMvY2J1cnQvV29ya2luZy9tYXBwLXJlcG9ydHMvc2NyaXB0cy9lY29ub21pY1RhYi5jb2ZmZWUiLCIvVXNlcnMvY2J1cnQvV29ya2luZy9tYXBwLXJlcG9ydHMvdGVtcGxhdGVzL3RlbXBsYXRlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsQ0FBTyxDQUFVLENBQUEsR0FBWCxDQUFOLEVBQWtCO0NBQ2hCLEtBQUEs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LENBT0E7O0NBUEEsRUFTUSxHQUFSLEdBQVE7Q0FDTixPQUFBLDhCQUFBO0NBQUEsQ0FBMEMsQ0FBL0IsQ0FBWCxDQUF3QixHQUF4QixDQUEyQyxJQUF6QjtDQUNYLEdBQUQsQ0FBYSxHQUFqQixLQUFBO0NBRFMsSUFBK0I7Q0FBMUMsRUFFVyxDQUFYLENBRkEsR0FFQTtDQUZBLEVBTUUsQ0FERixHQUFBO0NBQ0UsQ0FBUSxFQUFDLENBQUssQ0FBZCxLQUFRO0NBQVIsQ0FDYSxFQUFDLEVBQWQsS0FBQTtDQURBLENBRVksRUFBQyxDQUFLLENBQWxCLElBQUEsR0FBWTtDQUZaLENBR08sRUFBQyxDQUFSLENBQUEsQ0FBZTtDQUhmLENBSVUsRUFBQyxFQUFYLENBQVUsQ0FBVixDQUFVLENBQUEsU0FBQTtDQUpWLENBS1ksRUFBQyxFQUFiLENBQVksRUFBQSxDQUFaLFNBQVksbUJBQUE7Q0FMWixFQU0yQixFQUEzQixDQUFBO0FBQ00sQ0FQTixDQU9LLENBQUwsQ0FBa0MsQ0FBbEIsQ0FBaEIsRUFBa0M7QUFDNUIsQ0FSTixDQVFLLENBQUwsQ0FBa0MsQ0FBbEIsQ0FBaEIsRUFBa0M7Q0FkcEMsS0FBQTtDQUFBLENBZ0JvQyxDQUFoQyxDQUFKLEVBQVUsQ0FBQSxDQUFTLENBQVQ7Q0FoQlYsR0FpQkEsZUFBQTtDQUNDLEdBQUEsT0FBRCxNQUFBO0NBNUJGLEVBU1E7O0NBVFI7O0NBRHdCOztBQStCMUIsQ0FsQ0EsRUFrQ2lCLEdBQVgsQ0FBTixJQWxDQTs7OztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IChlbCkgLT5cbiAgJGVsID0gJCBlbFxuICBhcHAgPSB3aW5kb3cuYXBwXG4gIHRvYyA9IGFwcC5nZXRUb2MoKVxuICB1bmxlc3MgdG9jXG4gICAgY29uc29sZS5sb2cgJ05vIHRhYmxlIG9mIGNvbnRlbnRzIGZvdW5kJ1xuICAgIHJldHVyblxuICB0b2dnbGVycyA9ICRlbC5maW5kKCdhW2RhdGEtdG9nZ2xlLW5vZGVdJylcbiAgIyBTZXQgaW5pdGlhbCBzdGF0ZVxuICBmb3IgdG9nZ2xlciBpbiB0b2dnbGVycy50b0FycmF5KClcbiAgICAkdG9nZ2xlciA9ICQodG9nZ2xlcilcbiAgICBub2RlaWQgPSAkdG9nZ2xlci5kYXRhKCd0b2dnbGUtbm9kZScpXG4gICAgdHJ5XG4gICAgICB2aWV3ID0gdG9jLmdldENoaWxkVmlld0J5SWQgbm9kZWlkXG4gICAgICBub2RlID0gdmlldy5tb2RlbFxuICAgICAgJHRvZ2dsZXIuYXR0ciAnZGF0YS12aXNpYmxlJywgISFub2RlLmdldCgndmlzaWJsZScpXG4gICAgICAkdG9nZ2xlci5kYXRhICd0b2NJdGVtJywgdmlld1xuICAgIGNhdGNoIGVcbiAgICAgICR0b2dnbGVyLmF0dHIgJ2RhdGEtbm90LWZvdW5kJywgJ3RydWUnXG5cbiAgdG9nZ2xlcnMub24gJ2NsaWNrJywgKGUpIC0+XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgJGVsID0gJChlLnRhcmdldClcbiAgICB2aWV3ID0gJGVsLmRhdGEoJ3RvY0l0ZW0nKVxuICAgIGlmIHZpZXdcbiAgICAgIHZpZXcudG9nZ2xlVmlzaWJpbGl0eShlKVxuICAgICAgJGVsLmF0dHIgJ2RhdGEtdmlzaWJsZScsICEhdmlldy5tb2RlbC5nZXQoJ3Zpc2libGUnKVxuICAgIGVsc2VcbiAgICAgIGFsZXJ0IFwiTGF5ZXIgbm90IGZvdW5kIGluIHRoZSBjdXJyZW50IFRhYmxlIG9mIENvbnRlbnRzLiBcXG5FeHBlY3RlZCBub2RlaWQgI3skZWwuZGF0YSgndG9nZ2xlLW5vZGUnKX1cIlxuIiwiZW5hYmxlTGF5ZXJUb2dnbGVycyA9IHJlcXVpcmUgJy4vZW5hYmxlTGF5ZXJUb2dnbGVycy5jb2ZmZWUnXG5yb3VuZCA9IHJlcXVpcmUoJy4vdXRpbHMuY29mZmVlJykucm91bmRcblxuY2xhc3MgUmVjb3JkU2V0XG5cbiAgY29uc3RydWN0b3I6IChAZGF0YSkgLT5cblxuICB0b0FycmF5OiAoKSAtPlxuICAgIF8ubWFwIEBkYXRhLnZhbHVlWzBdLmZlYXR1cmVzLCAoZmVhdHVyZSkgLT5cbiAgICAgIGZlYXR1cmUuYXR0cmlidXRlc1xuXG4gIHJhdzogKGF0dHIpIC0+XG4gICAgYXR0cnMgPSBfLm1hcCBAdG9BcnJheSgpLCAocm93KSAtPlxuICAgICAgcm93W2F0dHJdXG4gICAgYXR0cnMgPSBfLmZpbHRlciBhdHRycywgKGF0dHIpIC0+IGF0dHIgIT0gdW5kZWZpbmVkXG4gICAgaWYgYXR0cnMubGVuZ3RoIGlzIDBcbiAgICAgIHRocm93IFwiQ291bGQgbm90IGdldCBhdHRyaWJ1dGUgI3thdHRyfVwiXG4gICAgZWxzZSBpZiBhdHRycy5sZW5ndGggaXMgMVxuICAgICAgcmV0dXJuIGF0dHJzWzBdXG4gICAgZWxzZVxuICAgICAgcmV0dXJuIGF0dHJzXG5cbiAgaW50OiAoYXR0cikgLT5cbiAgICByYXcgPSBAcmF3KGF0dHIpXG4gICAgaWYgXy5pc0FycmF5KHJhdylcbiAgICAgIF8ubWFwIHJhdywgcGFyc2VJbnRcbiAgICBlbHNlXG4gICAgICBwYXJzZUludChyYXcpXG5cbiAgZmxvYXQ6IChhdHRyLCBkZWNpbWFsUGxhY2VzPTIpIC0+XG4gICAgcmF3ID0gQHJhdyhhdHRyKVxuICAgIGlmIF8uaXNBcnJheShyYXcpXG4gICAgICBfLm1hcCByYXcsICh2YWwpIC0+IHJvdW5kKHZhbCwgZGVjaW1hbFBsYWNlcylcbiAgICBlbHNlXG4gICAgICByb3VuZChyYXcsIGRlY2ltYWxQbGFjZXMpXG5cbiAgYm9vbDogKGF0dHIpIC0+XG4gICAgcmF3ID0gQHJhdyhhdHRyKVxuICAgIGlmIF8uaXNBcnJheShyYXcpXG4gICAgICBfLm1hcCByYXcsICh2YWwpIC0+IHZhbC50b1N0cmluZygpLnRvTG93ZXJDYXNlKCkgaXMgJ3RydWUnXG4gICAgZWxzZVxuICAgICAgcmF3LnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKSBpcyAndHJ1ZSdcblxuY2xhc3MgUmVwb3J0VGFiIGV4dGVuZHMgQmFja2JvbmUuVmlld1xuICBuYW1lOiAnSW5mb3JtYXRpb24nXG4gIGRlcGVuZGVuY2llczogW11cblxuICBpbml0aWFsaXplOiAoQG1vZGVsLCBAb3B0aW9ucykgLT5cbiAgICAjIFdpbGwgYmUgaW5pdGlhbGl6ZWQgYnkgU2VhU2tldGNoIHdpdGggdGhlIGZvbGxvd2luZyBhcmd1bWVudHM6XG4gICAgIyAgICogbW9kZWwgLSBUaGUgc2tldGNoIGJlaW5nIHJlcG9ydGVkIG9uXG4gICAgIyAgICogb3B0aW9uc1xuICAgICMgICAgIC0gLnBhcmVudCAtIHRoZSBwYXJlbnQgcmVwb3J0IHZpZXcgXG4gICAgIyAgICAgICAgY2FsbCBAb3B0aW9ucy5wYXJlbnQuZGVzdHJveSgpIHRvIGNsb3NlIHRoZSB3aG9sZSByZXBvcnQgd2luZG93XG4gICAgQGFwcCA9IHdpbmRvdy5hcHBcbiAgICBfLmV4dGVuZCBALCBAb3B0aW9uc1xuXG4gIHJlbmRlcjogKCkgLT5cbiAgICB0aHJvdyAncmVuZGVyIG1ldGhvZCBtdXN0IGJlIG92ZXJpZGRlbidcblxuICBzaG93OiAoKSAtPlxuICAgIEAkZWwuc2hvdygpXG4gICAgQHZpc2libGUgPSB0cnVlXG5cbiAgaGlkZTogKCkgLT5cbiAgICBAJGVsLmhpZGUoKVxuICAgIEB2aXNpYmxlID0gZmFsc2VcblxuICByZW1vdmU6ICgpID0+XG4gICAgc3VwZXIoKVxuICBcbiAgb25Mb2FkaW5nOiAoKSAtPiAjIGV4dGVuc2lvbiBwb2ludCBmb3Igc3ViY2xhc3Nlc1xuXG4gIGdldFJlc3VsdDogKGlkKSAtPlxuICAgIHJlc3VsdHMgPSBAZ2V0UmVzdWx0cygpXG4gICAgcmVzdWx0ID0gXy5maW5kIHJlc3VsdHMsIChyKSAtPiByLnBhcmFtTmFtZSBpcyBpZFxuICAgIHVubGVzcyByZXN1bHQ/XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIHJlc3VsdCB3aXRoIGlkICcgKyBpZClcbiAgICByZXN1bHQudmFsdWVcblxuICBnZXRGaXJzdFJlc3VsdDogKHBhcmFtLCBpZCkgLT5cbiAgICByZXN1bHQgPSBAZ2V0UmVzdWx0KHBhcmFtKVxuICAgIHRyeVxuICAgICAgcmV0dXJuIHJlc3VsdFswXS5mZWF0dXJlc1swXS5hdHRyaWJ1dGVzW2lkXVxuICAgIGNhdGNoIGVcbiAgICAgIHRocm93IFwiRXJyb3IgZmluZGluZyAje3BhcmFtfToje2lkfSBpbiBncCByZXN1bHRzXCJcblxuICBnZXRSZXN1bHRzOiAoKSAtPlxuICAgIHVubGVzcyByZXN1bHRzID0gQHJlc3VsdHM/LmdldCgnZGF0YScpPy5yZXN1bHRzXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGdwIHJlc3VsdHMnKVxuICAgIF8uZmlsdGVyIHJlc3VsdHMsIChyZXN1bHQpIC0+XG4gICAgICByZXN1bHQucGFyYW1OYW1lIG5vdCBpbiBbJ1Jlc3VsdENvZGUnLCAnUmVzdWx0TXNnJ11cblxuICByZWNvcmRTZXQ6IChkZXBlbmRlbmN5LCBwYXJhbU5hbWUsIHNrZXRjaENsYXNzSWQpIC0+XG4gICAgdW5sZXNzIGRlcGVuZGVuY3kgaW4gQGRlcGVuZGVuY2llc1xuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiVW5rbm93biBkZXBlbmRlbmN5ICN7ZGVwZW5kZW5jeX1cIlxuICAgIGlmIHNrZXRjaENsYXNzSWRcbiAgICAgIGRlcCA9IF8uZmluZCBAYWxsUmVzdWx0cywgKHJlc3VsdCkgLT4gXG4gICAgICAgIHJlc3VsdC5nZXQoJ25hbWUnKSBpcyBkZXBlbmRlbmN5IGFuZCBcbiAgICAgICAgICByZXN1bHQuZ2V0KCdza2V0Y2hDbGFzcycpIGlzIHNrZXRjaENsYXNzSWRcbiAgICBlbHNlXG4gICAgICBkZXAgPSBfLmZpbmQgQGFsbFJlc3VsdHMsIChyZXN1bHQpIC0+IHJlc3VsdC5nZXQoJ25hbWUnKSBpcyBkZXBlbmRlbmN5XG4gICAgdW5sZXNzIGRlcFxuICAgICAgY29uc29sZS5sb2cgQGFsbFJlc3VsdHNcbiAgICAgIHRocm93IG5ldyBFcnJvciBcIkNvdWxkIG5vdCBmaW5kIHJlc3VsdHMgZm9yICN7ZGVwZW5kZW5jeX0uXCJcbiAgICBjb25zb2xlLmxvZyAnZGVwJywgZGVwXG4gICAgcGFyYW0gPSBfLmZpbmQgZGVwLmdldCgnZGF0YScpLnJlc3VsdHMsIChwYXJhbSkgLT4gXG4gICAgICBwYXJhbS5wYXJhbU5hbWUgaXMgcGFyYW1OYW1lXG4gICAgdW5sZXNzIHBhcmFtXG4gICAgICBjb25zb2xlLmxvZyBkZXAuZ2V0KCdkYXRhJykucmVzdWx0c1xuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiQ291bGQgbm90IGZpbmQgcGFyYW0gI3twYXJhbU5hbWV9IGluICN7ZGVwZW5kZW5jeX1cIlxuICAgIHJzID0gbmV3IFJlY29yZFNldChwYXJhbSlcbiAgICBycy5za2V0Y2hDbGFzcyA9IGRlcC5nZXQoJ3NrZXRjaENsYXNzJylcbiAgICByc1xuXG4gIHJlY29yZFNldHM6IChkZXBlbmRlbmN5LCBwYXJhbU5hbWUpIC0+XG4gICAgdW5sZXNzIGRlcGVuZGVuY3kgaW4gQGRlcGVuZGVuY2llc1xuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiVW5rbm93biBkZXBlbmRlbmN5ICN7ZGVwZW5kZW5jeX1cIlxuICAgIGRlcHMgPSBfLmZpbHRlciBAYWxsUmVzdWx0cywgKHJlc3VsdCkgLT4gcmVzdWx0LmdldCgnbmFtZScpIGlzIGRlcGVuZGVuY3lcbiAgICBjb25zb2xlLmxvZyAnZGVwcycsIGRlcHNcbiAgICB1bmxlc3MgZGVwcy5sZW5ndGhcbiAgICAgIGNvbnNvbGUubG9nIEBhbGxSZXN1bHRzXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJDb3VsZCBub3QgZmluZCByZXN1bHRzIGZvciAje2RlcGVuZGVuY3l9LlwiXG4gICAgcGFyYW1zID0gW11cbiAgICBmb3IgZGVwIGluIGRlcHNcbiAgICAgIHBhcmFtID0gXy5maW5kIGRlcC5nZXQoJ2RhdGEnKS5yZXN1bHRzLCAocGFyYW0pIC0+IFxuICAgICAgICBwYXJhbS5wYXJhbU5hbWUgaXMgcGFyYW1OYW1lXG4gICAgICB1bmxlc3MgcGFyYW1cbiAgICAgICAgY29uc29sZS5sb2cgZGVwLmdldCgnZGF0YScpLnJlc3VsdHNcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiQ291bGQgbm90IGZpbmQgcGFyYW0gI3twYXJhbU5hbWV9IGluICN7ZGVwZW5kZW5jeX1cIlxuICAgICAgcnMgPSBuZXcgUmVjb3JkU2V0KHBhcmFtKVxuICAgICAgcnMuc2tldGNoQ2xhc3MgPSBkZXAuZ2V0KCdza2V0Y2hDbGFzcycpXG4gICAgICBwYXJhbXMucHVzaCByc1xuICAgIHJldHVybiBwYXJhbXNcblxuXG4gIGVuYWJsZVRhYmxlUGFnaW5nOiAoKSAtPlxuICAgIEAkKCdbZGF0YS1wYWdpbmddJykuZWFjaCAoKSAtPlxuICAgICAgJHRhYmxlID0gJChAKVxuICAgICAgcGFnZVNpemUgPSAkdGFibGUuZGF0YSgncGFnaW5nJylcbiAgICAgIHJvd3MgPSAkdGFibGUuZmluZCgndGJvZHkgdHInKS5sZW5ndGhcbiAgICAgIHBhZ2VzID0gTWF0aC5jZWlsKHJvd3MgLyBwYWdlU2l6ZSlcbiAgICAgIGlmIHBhZ2VzID4gMVxuICAgICAgICAkdGFibGUuYXBwZW5kIFwiXCJcIlxuICAgICAgICAgIDx0Zm9vdD5cbiAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgPHRkIGNvbHNwYW49XCIjeyR0YWJsZS5maW5kKCd0aGVhZCB0aCcpLmxlbmd0aH1cIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicGFnaW5hdGlvblwiPlxuICAgICAgICAgICAgICAgICAgPHVsPlxuICAgICAgICAgICAgICAgICAgICA8bGk+PGEgaHJlZj1cIiNcIj5QcmV2PC9hPjwvbGk+XG4gICAgICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICA8L3Rmb290PlxuICAgICAgICBcIlwiXCJcbiAgICAgICAgdWwgPSAkdGFibGUuZmluZCgndGZvb3QgdWwnKVxuICAgICAgICBmb3IgaSBpbiBfLnJhbmdlKDEsIHBhZ2VzICsgMSlcbiAgICAgICAgICB1bC5hcHBlbmQgXCJcIlwiXG4gICAgICAgICAgICA8bGk+PGEgaHJlZj1cIiNcIj4je2l9PC9hPjwvbGk+XG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIHVsLmFwcGVuZCBcIlwiXCJcbiAgICAgICAgICA8bGk+PGEgaHJlZj1cIiNcIj5OZXh0PC9hPjwvbGk+XG4gICAgICAgIFwiXCJcIlxuICAgICAgICAkdGFibGUuZmluZCgnbGkgYScpLmNsaWNrIChlKSAtPlxuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgICRhID0gJCh0aGlzKVxuICAgICAgICAgIHRleHQgPSAkYS50ZXh0KClcbiAgICAgICAgICBpZiB0ZXh0IGlzICdOZXh0J1xuICAgICAgICAgICAgYSA9ICRhLnBhcmVudCgpLnBhcmVudCgpLmZpbmQoJy5hY3RpdmUnKS5uZXh0KCkuZmluZCgnYScpXG4gICAgICAgICAgICB1bmxlc3MgYS50ZXh0KCkgaXMgJ05leHQnXG4gICAgICAgICAgICAgIGEuY2xpY2soKVxuICAgICAgICAgIGVsc2UgaWYgdGV4dCBpcyAnUHJldidcbiAgICAgICAgICAgIGEgPSAkYS5wYXJlbnQoKS5wYXJlbnQoKS5maW5kKCcuYWN0aXZlJykucHJldigpLmZpbmQoJ2EnKVxuICAgICAgICAgICAgdW5sZXNzIGEudGV4dCgpIGlzICdQcmV2J1xuICAgICAgICAgICAgICBhLmNsaWNrKClcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAkYS5wYXJlbnQoKS5wYXJlbnQoKS5maW5kKCcuYWN0aXZlJykucmVtb3ZlQ2xhc3MgJ2FjdGl2ZSdcbiAgICAgICAgICAgICRhLnBhcmVudCgpLmFkZENsYXNzICdhY3RpdmUnXG4gICAgICAgICAgICBuID0gcGFyc2VJbnQodGV4dClcbiAgICAgICAgICAgICR0YWJsZS5maW5kKCd0Ym9keSB0cicpLmhpZGUoKVxuICAgICAgICAgICAgb2Zmc2V0ID0gcGFnZVNpemUgKiAobiAtIDEpXG4gICAgICAgICAgICAkdGFibGUuZmluZChcInRib2R5IHRyXCIpLnNsaWNlKG9mZnNldCwgbipwYWdlU2l6ZSkuc2hvdygpXG4gICAgICAgICQoJHRhYmxlLmZpbmQoJ2xpIGEnKVsxXSkuY2xpY2soKVxuICAgICAgXG4gICAgICBpZiBub1Jvd3NNZXNzYWdlID0gJHRhYmxlLmRhdGEoJ25vLXJvd3MnKVxuICAgICAgICBpZiByb3dzIGlzIDBcbiAgICAgICAgICBwYXJlbnQgPSAkdGFibGUucGFyZW50KCkgICAgXG4gICAgICAgICAgJHRhYmxlLnJlbW92ZSgpXG4gICAgICAgICAgcGFyZW50LnJlbW92ZUNsYXNzICd0YWJsZUNvbnRhaW5lcidcbiAgICAgICAgICBwYXJlbnQuYXBwZW5kIFwiPHA+I3tub1Jvd3NNZXNzYWdlfTwvcD5cIlxuXG4gIGVuYWJsZUxheWVyVG9nZ2xlcnM6ICgpIC0+XG4gICAgZW5hYmxlTGF5ZXJUb2dnbGVycyhAJGVsKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFJlcG9ydFRhYiIsIm1vZHVsZS5leHBvcnRzID1cbiAgXG4gIHJvdW5kOiAobnVtYmVyLCBkZWNpbWFsUGxhY2VzKSAtPlxuICAgIHVubGVzcyBfLmlzTnVtYmVyIG51bWJlclxuICAgICAgbnVtYmVyID0gcGFyc2VGbG9hdChudW1iZXIpXG4gICAgbXVsdGlwbGllciA9IE1hdGgucG93IDEwLCBkZWNpbWFsUGxhY2VzXG4gICAgTWF0aC5yb3VuZChudW1iZXIgKiBtdWx0aXBsaWVyKSAvIG11bHRpcGxpZXIiLCJ0aGlzW1wiVGVtcGxhdGVzXCJdID0gdGhpc1tcIlRlbXBsYXRlc1wiXSB8fCB7fTtcblxudGhpc1tcIlRlbXBsYXRlc1wiXVtcIm5vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS9hdHRyaWJ1dGVzL2F0dHJpYnV0ZUl0ZW1cIl0gPSBuZXcgSG9nYW4uVGVtcGxhdGUoZnVuY3Rpb24oYyxwLGkpe3ZhciBfPXRoaXM7Xy5iKGk9aXx8XCJcIik7Xy5iKFwiPHRyIGRhdGEtYXR0cmlidXRlLWlkPVxcXCJcIik7Xy5iKF8udihfLmYoXCJpZFwiLGMscCwwKSkpO18uYihcIlxcXCIgZGF0YS1hdHRyaWJ1dGUtZXhwb3J0aWQ9XFxcIlwiKTtfLmIoXy52KF8uZihcImV4cG9ydGlkXCIsYyxwLDApKSk7Xy5iKFwiXFxcIiBkYXRhLWF0dHJpYnV0ZS10eXBlPVxcXCJcIik7Xy5iKF8udihfLmYoXCJ0eXBlXCIsYyxwLDApKSk7Xy5iKFwiXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDx0ZCBjbGFzcz1cXFwibmFtZVxcXCI+XCIpO18uYihfLnYoXy5mKFwibmFtZVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8dGQgY2xhc3M9XFxcInZhbHVlXFxcIj5cIik7Xy5iKF8udihfLmYoXCJmb3JtYXR0ZWRWYWx1ZVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC90cj5cIik7cmV0dXJuIF8uZmwoKTs7fSk7XG5cbnRoaXNbXCJUZW1wbGF0ZXNcIl1bXCJub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvYXR0cmlidXRlcy9hdHRyaWJ1dGVzVGFibGVcIl0gPSBuZXcgSG9nYW4uVGVtcGxhdGUoZnVuY3Rpb24oYyxwLGkpe3ZhciBfPXRoaXM7Xy5iKGk9aXx8XCJcIik7Xy5iKFwiPHRhYmxlIGNsYXNzPVxcXCJhdHRyaWJ1dGVzXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiYXR0cmlidXRlc1wiLGMscCwxKSxjLHAsMCw0NCw4MSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKF8ucnAoXCJhdHRyaWJ1dGVzL2F0dHJpYnV0ZUl0ZW1cIixjLHAsXCIgICAgXCIpKTt9KTtjLnBvcCgpO31fLmIoXCI8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIik7cmV0dXJuIF8uZmwoKTs7fSk7XG5cbnRoaXNbXCJUZW1wbGF0ZXNcIl1bXCJub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvZ2VuZXJpY0F0dHJpYnV0ZXNcIl0gPSBuZXcgSG9nYW4uVGVtcGxhdGUoZnVuY3Rpb24oYyxwLGkpe3ZhciBfPXRoaXM7Xy5iKGk9aXx8XCJcIik7aWYoXy5zKF8uZChcInNrZXRjaENsYXNzLmRlbGV0ZWRcIixjLHAsMSksYyxwLDAsMjQsMjcwLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJhbGVydCBhbGVydC13YXJuXFxcIiBzdHlsZT1cXFwibWFyZ2luLWJvdHRvbToxMHB4O1xcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBUaGlzIHNrZXRjaCB3YXMgY3JlYXRlZCB1c2luZyB0aGUgXFxcIlwiKTtfLmIoXy52KF8uZChcInNrZXRjaENsYXNzLm5hbWVcIixjLHAsMCkpKTtfLmIoXCJcXFwiIHRlbXBsYXRlLCB3aGljaCBpc1wiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgbm8gbG9uZ2VyIGF2YWlsYWJsZS4gWW91IHdpbGwgbm90IGJlIGFibGUgdG8gY29weSB0aGlzIHNrZXRjaCBvciBtYWtlIG5ld1wiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgc2tldGNoZXMgb2YgdGhpcyB0eXBlLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvblxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+XCIpO18uYihfLnYoXy5kKFwic2tldGNoQ2xhc3MubmFtZVwiLGMscCwwKSkpO18uYihcIiBBdHRyaWJ1dGVzPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXy5ycChcImF0dHJpYnV0ZXMvYXR0cmlidXRlc1RhYmxlXCIsYyxwLFwiICAgIFwiKSk7Xy5iKFwiICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIik7cmV0dXJuIF8uZmwoKTs7fSk7XG5cbm1vZHVsZS5leHBvcnRzID0gdGhpc1tcIlRlbXBsYXRlc1wiXTsiLCJSZXBvcnRUYWIgPSByZXF1aXJlICdyZXBvcnRUYWInXG50ZW1wbGF0ZXMgPSByZXF1aXJlICcuLi90ZW1wbGF0ZXMvdGVtcGxhdGVzLmpzJ1xuXG5jbGFzcyBBcnJheUVudmlyb25tZW50VGFiIGV4dGVuZHMgUmVwb3J0VGFiXG4gIG5hbWU6ICdFbnZpcm9ubWVudCdcbiAgY2xhc3NOYW1lOiAnZW52aXJvbm1lbnQnXG4gIHRlbXBsYXRlOiB0ZW1wbGF0ZXMuYXJyYXlFbnZpcm9ubWVudFxuICBkZXBlbmRlbmNpZXM6IFtcbiAgICAnSGFiaXRhdCdcbiAgICAnRXhpc3RpbmdNYXJpbmVQcm90ZWN0ZWRBcmVhcydcbiAgICAnT3ZlcmxhcFdpdGhJbXBBcmVhcydcbiAgICAnTWFyeGFuQW5hbHlzaXMnXG4gIF1cbiAgdGltZW91dDogNjAwMDAwXG5cbiAgcmVuZGVyOiAoKSAtPlxuICAgICMgc2V0dXAgY29udGV4dCBvYmplY3Qgd2l0aCBkYXRhIGFuZCByZW5kZXIgdGhlIHRlbXBsYXRlIGZyb20gaXRcbiAgICBjb25zb2xlLmxvZyBAcmVjb3JkU2V0KCdIYWJpdGF0JywgJ0ltcG9ydGFudEFyZWFzJykudG9BcnJheSgpXG4gICAgY29uc29sZS5sb2cgQHJlY29yZFNldCgnRXhpc3RpbmdNYXJpbmVQcm90ZWN0ZWRBcmVhcycsIFwiRXhpc3RpbmdNYXJpbmVQcm90ZWN0ZWRBcmVhc1wiKS50b0FycmF5KClcbiAgICBjb25zb2xlLmxvZyBAcmVjb3JkU2V0KFwiT3ZlcmxhcFdpdGhJbXBBcmVhc1wiLCBcIlByb3ZpbmNpYWxUZW51cmVzXCIpLnRvQXJyYXkoKVxuICAgIGNvbnNvbGUubG9nIEByZWNvcmRTZXQoXCJNYXJ4YW5BbmFseXNpc1wiLCBcIk1hcnhhbkFuYWx5c2lzXCIpLnRvQXJyYXkoKVxuICAgIGNvbnRleHQgPVxuICAgICAgc2tldGNoOiBAbW9kZWwuZm9yVGVtcGxhdGUoKVxuICAgICAgc2tldGNoQ2xhc3M6IEBza2V0Y2hDbGFzcy5mb3JUZW1wbGF0ZSgpXG4gICAgICBhdHRyaWJ1dGVzOiBAbW9kZWwuZ2V0QXR0cmlidXRlcygpXG4gICAgICBhZG1pbjogQHByb2plY3QuaXNBZG1pbiB3aW5kb3cudXNlclxuICAgICAgaGFiaXRhdHM6IEByZWNvcmRTZXQoJ0hhYml0YXQnLCAnSW1wb3J0YW50QXJlYXMnKS50b0FycmF5KClcbiAgICAgIGV4aXN0aW5nTVBBczogQHJlY29yZFNldCgnRXhpc3RpbmdNYXJpbmVQcm90ZWN0ZWRBcmVhcycsIFxuICAgICAgICBcIkV4aXN0aW5nTWFyaW5lUHJvdGVjdGVkQXJlYXNcIikudG9BcnJheSgpXG4gICAgICBpbXBvcnRhbnRBcmVhczogQHJlY29yZFNldChcIk92ZXJsYXBXaXRoSW1wQXJlYXNcIiwgXG4gICAgICAgIFwiUHJvdmluY2lhbFRlbnVyZXNcIikudG9BcnJheSgpXG4gICAgICBtYXJ4YW5BbmFseXNlczogXy5tYXAoQHJlY29yZFNldChcIk1hcnhhbkFuYWx5c2lzXCIsIFwiTWFyeGFuQW5hbHlzaXNcIilcbiAgICAgICAgLnRvQXJyYXkoKSwgKGYpIC0+IGYuTkFNRSlcblxuICAgIEAkZWwuaHRtbCBAdGVtcGxhdGUucmVuZGVyKGNvbnRleHQsIHRlbXBsYXRlcylcbiAgICBAZW5hYmxlVGFibGVQYWdpbmcoKVxuICAgIEBlbmFibGVMYXllclRvZ2dsZXJzKClcbiAgICBAJCgnLmNob3NlbicpLmNob3Nlbih7ZGlzYWJsZV9zZWFyY2hfdGhyZXNob2xkOiAxMCwgd2lkdGg6JzQwMHB4J30pXG4gICAgQCQoJy5jaG9zZW4nKS5jaGFuZ2UgKCkgPT5cbiAgICAgIF8uZGVmZXIgQHJlbmRlck1hcnhhbkFuYWx5c2lzXG4gICAgQHJlbmRlck1hcnhhbkFuYWx5c2lzKClcblxuICByZW5kZXJNYXJ4YW5BbmFseXNpczogKCkgPT5cbiAgICBuYW1lID0gQCQoJy5jaG9zZW4nKS52YWwoKVxuICAgIHJlY29yZHMgPSBAcmVjb3JkU2V0KFwiTWFyeGFuQW5hbHlzaXNcIiwgXCJNYXJ4YW5BbmFseXNpc1wiKS50b0FycmF5KClcbiAgICBkYXRhID0gXy5maW5kIHJlY29yZHMsIChyZWNvcmQpIC0+IHJlY29yZC5OQU1FIGlzIG5hbWVcbiAgICBoaXN0byA9IGRhdGEuSElTVE8uc2xpY2UoMSwgZGF0YS5ISVNUTy5sZW5ndGggLSAxKS5zcGxpdCgvXFxzLylcbiAgICBoaXN0byA9IF8uZmlsdGVyIGhpc3RvLCAocykgLT4gcy5sZW5ndGggPiAwXG4gICAgaGlzdG8gPSBfLm1hcCBoaXN0bywgKHZhbCkgLT5cbiAgICAgIHBhcnNlSW50KHZhbClcbiAgICBxdWFudGlsZXMgPSBfLmZpbHRlcihfLmtleXMoZGF0YSksIChrZXkpIC0+IGtleS5pbmRleE9mKCdRJykgaXMgMClcbiAgICBmb3IgcSwgaSBpbiBxdWFudGlsZXNcbiAgICAgIGlmIHBhcnNlRmxvYXQoZGF0YVtxXSkgPiBwYXJzZUZsb2F0KGRhdGEuU0NPUkUpIG9yIGkgaXMgcXVhbnRpbGVzLmxlbmd0aCAtIDFcbiAgICAgICAgbWF4X3EgPSBxdWFudGlsZXNbaV1cbiAgICAgICAgbWluX3EgPSBxdWFudGlsZXNbaSAtIDFdIG9yIFwiUTBcIiAjIHF1YW50aWxlc1tpXVxuICAgICAgICBicmVha1xuICAgIEAkKCcuc2NlbmFyaW9SZXN1bHRzJykuaHRtbCBcIlwiXCJcbiAgICAgIFRoZSBhdmVyYWdlIE1hcnhhbiBzY29yZSBmb3IgdGhpcyB6b25lcyB3aXRoaW4gdGhpcyBwcm9wb3NhbCBpcyA8c3Ryb25nPiN7ZGF0YS5TQ09SRX08L3N0cm9uZz4sIHBsYWNpbmcgaXQgaW4gXG4gICAgICB0aGUgPHN0cm9uZz4je21pbl9xLnJlcGxhY2UoJ1EnLCAnJyl9JSAtICN7bWF4X3EucmVwbGFjZSgnUScsICcnKX0lIHF1YW50aWxlIFxuICAgICAgcmFuZ2U8L3N0cm9uZz4gZm9yIHRoaXMgc3ViLXJlZ2lvbi5cbiAgICBcIlwiXCJcblxuICAgIEAkKCcuc2NlbmFyaW9EZXNjcmlwdGlvbicpLmh0bWwgZGF0YS5NQVJYX0RFU0MucmVwbGFjZSgndGhpcyB6b25lICcsICd6b25lcyB3aXRoaW4gdGhpcyBwcm9wb3NhbCAnKVxuXG4gICAgZG9tYWluID0gXy5tYXAgcXVhbnRpbGVzLCAocSkgLT4gZGF0YVtxXVxuICAgIGRvbWFpbi5wdXNoIDEwMFxuICAgIGRvbWFpbi51bnNoaWZ0IDBcbiAgICBjb2xvciA9IGQzLnNjYWxlLmxpbmVhcigpXG4gICAgICAuZG9tYWluKGRvbWFpbilcbiAgICAgIC5yYW5nZShbXCIjNDdhZTQzXCIsIFwiIzZjMFwiLCBcIiNlZTBcIiwgXCIjZWI0XCIsIFwiI2VjYmI4OVwiLCBcIiNlZWFiYTBcIl0ucmV2ZXJzZSgpKVxuICAgIHF1YW50aWxlcyA9IF8ubWFwIHF1YW50aWxlcywgKGtleSkgLT5cbiAgICAgIG1heCA9IHBhcnNlRmxvYXQoZGF0YVtrZXldKVxuICAgICAgbWluICA9IHBhcnNlRmxvYXQoZGF0YVtxdWFudGlsZXNbXy5pbmRleE9mKHF1YW50aWxlcywga2V5KSAtIDFdXSBvciAwKVxuICAgICAge1xuICAgICAgICByYW5nZTogXCIje3BhcnNlSW50KGtleS5yZXBsYWNlKCdRJywgJycpKSAtIDIwfS0je2tleS5yZXBsYWNlKCdRJywgJycpfSVcIlxuICAgICAgICBuYW1lOiBrZXlcbiAgICAgICAgc3RhcnQ6IG1pblxuICAgICAgICBlbmQ6IG1heFxuICAgICAgICBiZzogY29sb3IoKG1heCArIG1pbikgLyAyKVxuICAgICAgfVxuICAgIGlmIHdpbmRvdy5kM1xuICAgICAgQCQoJy52aXonKS5odG1sKCcnKVxuICAgICAgZWwgPSBAJCgnLnZpeicpWzBdXG4gICAgICB4ID0gZDMuc2NhbGUubGluZWFyKClcbiAgICAgICAgLmRvbWFpbihbMCwgMTAwXSlcbiAgICAgICAgLnJhbmdlKFswLCA0MDBdKSAgICAgIFxuXG5cblxuICAgICAgIyBIaXN0b2dyYW1cblxuICAgICAgbWFyZ2luID0gXG4gICAgICAgIHRvcDogNVxuICAgICAgICByaWdodDogMjBcbiAgICAgICAgYm90dG9tOiAzMFxuICAgICAgICBsZWZ0OiA0NVxuICAgICAgd2lkdGggPSA0MDAgLSBtYXJnaW4ubGVmdCAtIG1hcmdpbi5yaWdodFxuICAgICAgaGVpZ2h0ID0gMzAwIC0gbWFyZ2luLnRvcCAtIG1hcmdpbi5ib3R0b21cbiAgICAgIFxuICAgICAgeCA9IGQzLnNjYWxlLmxpbmVhcigpXG4gICAgICAgIC5kb21haW4oWzAsIDEwMF0pXG4gICAgICAgIC5yYW5nZShbMCwgd2lkdGhdKVxuICAgICAgeSA9IGQzLnNjYWxlLmxpbmVhcigpXG4gICAgICAgIC5yYW5nZShbaGVpZ2h0LCAwXSlcbiAgICAgICAgLmRvbWFpbihbMCwgZDMubWF4KGhpc3RvKV0pXG5cbiAgICAgIHhBeGlzID0gZDMuc3ZnLmF4aXMoKVxuICAgICAgICAuc2NhbGUoeClcbiAgICAgICAgLm9yaWVudChcImJvdHRvbVwiKVxuICAgICAgeUF4aXMgPSBkMy5zdmcuYXhpcygpXG4gICAgICAgIC5zY2FsZSh5KVxuICAgICAgICAub3JpZW50KFwibGVmdFwiKVxuXG4gICAgICBzdmcgPSBkMy5zZWxlY3QoQCQoJy52aXonKVswXSkuYXBwZW5kKFwic3ZnXCIpXG4gICAgICAgIC5hdHRyKFwid2lkdGhcIiwgd2lkdGggKyBtYXJnaW4ubGVmdCArIG1hcmdpbi5yaWdodClcbiAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgaGVpZ2h0ICsgbWFyZ2luLnRvcCArIG1hcmdpbi5ib3R0b20pXG4gICAgICAuYXBwZW5kKFwiZ1wiKVxuICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZSgje21hcmdpbi5sZWZ0fSwgI3ttYXJnaW4udG9wfSlcIilcblxuICAgICAgc3ZnLmFwcGVuZChcImdcIilcbiAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcInggYXhpc1wiKVxuICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZSgwLCN7aGVpZ2h0fSlcIilcbiAgICAgICAgLmNhbGwoeEF4aXMpXG4gICAgICAuYXBwZW5kKFwidGV4dFwiKVxuICAgICAgICAuYXR0cihcInhcIiwgd2lkdGggLyAyKVxuICAgICAgICAuYXR0cihcImR5XCIsIFwiM2VtXCIpXG4gICAgICAgIC5zdHlsZShcInRleHQtYW5jaG9yXCIsIFwibWlkZGxlXCIpXG4gICAgICAgIC50ZXh0KFwiU2NvcmVcIilcblxuICAgICAgc3ZnLmFwcGVuZChcImdcIilcbiAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcInkgYXhpc1wiKVxuICAgICAgICAuY2FsbCh5QXhpcylcbiAgICAgIC5hcHBlbmQoXCJ0ZXh0XCIpXG4gICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIFwicm90YXRlKC05MClcIilcbiAgICAgICAgLmF0dHIoXCJ5XCIsIDYpXG4gICAgICAgIC5hdHRyKFwiZHlcIiwgXCIuNzFlbVwiKVxuICAgICAgICAuc3R5bGUoXCJ0ZXh0LWFuY2hvclwiLCBcImVuZFwiKVxuICAgICAgICAudGV4dChcIk51bWJlciBvZiBQbGFubmluZyBVbml0c1wiKVxuXG4gICAgICBzdmcuc2VsZWN0QWxsKFwiLmJhclwiKVxuICAgICAgICAgIC5kYXRhKGhpc3RvKVxuICAgICAgICAuZW50ZXIoKS5hcHBlbmQoXCJyZWN0XCIpXG4gICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcImJhclwiKVxuICAgICAgICAgIC5hdHRyKFwieFwiLCAoZCwgaSkgLT4geChpKSlcbiAgICAgICAgICAuYXR0cihcIndpZHRoXCIsICh3aWR0aCAvIDEwMCkpXG4gICAgICAgICAgLmF0dHIoXCJ5XCIsIChkKSAtPiB5KGQpKVxuICAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIChkKSAtPiBoZWlnaHQgLSB5KGQpKVxuICAgICAgICAgIC5zdHlsZSAnZmlsbCcsIChkLCBpKSAtPlxuICAgICAgICAgICAgcSA9IF8uZmluZCBxdWFudGlsZXMsIChxKSAtPlxuICAgICAgICAgICAgICBpID49IHEuc3RhcnQgYW5kIGkgPD0gcS5lbmRcbiAgICAgICAgICAgIHE/LmJnIG9yIFwic3RlZWxibHVlXCJcblxuICAgICAgc3ZnLnNlbGVjdEFsbChcIi5zY29yZVwiKVxuICAgICAgICAgIC5kYXRhKFtNYXRoLnJvdW5kKGRhdGEuU0NPUkUpXSlcbiAgICAgICAgLmVudGVyKCkuYXBwZW5kKFwidGV4dFwiKVxuICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwic2NvcmVcIilcbiAgICAgICAgLmF0dHIoXCJ4XCIsIChkKSAtPiAoeChkKSAtIDggKSsgJ3B4JylcbiAgICAgICAgLmF0dHIoXCJ5XCIsIChkKSAtPiAoeShoaXN0b1tkXSkgLSAxMCkgKyAncHgnKVxuICAgICAgICAudGV4dChcIuKWvFwiKVxuXG4gICAgICBzdmcuc2VsZWN0QWxsKFwiLnNjb3JlVGV4dFwiKVxuICAgICAgICAgIC5kYXRhKFtNYXRoLnJvdW5kKGRhdGEuU0NPUkUpXSlcbiAgICAgICAgLmVudGVyKCkuYXBwZW5kKFwidGV4dFwiKVxuICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwic2NvcmVUZXh0XCIpXG4gICAgICAgIC5hdHRyKFwieFwiLCAoZCkgLT4gKHgoZCkgLSA2ICkrICdweCcpXG4gICAgICAgIC5hdHRyKFwieVwiLCAoZCkgLT4gKHkoaGlzdG9bZF0pIC0gMzApICsgJ3B4JylcbiAgICAgICAgLnRleHQoKGQpIC0+IGQpXG5cbiAgICAgIEAkKCcudml6JykuYXBwZW5kICc8ZGl2IGNsYXNzPVwibGVnZW5kc1wiPjwvZGl2PidcbiAgICAgIGZvciBxdWFudGlsZSBpbiBxdWFudGlsZXNcbiAgICAgICAgQCQoJy52aXogLmxlZ2VuZHMnKS5hcHBlbmQgXCJcIlwiXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImxlZ2VuZFwiPjxzcGFuIHN0eWxlPVwiYmFja2dyb3VuZC1jb2xvcjoje3F1YW50aWxlLmJnfTtcIj4mbmJzcDs8L3NwYW4+I3txdWFudGlsZS5yYW5nZX08L2Rpdj5cbiAgICAgICAgXCJcIlwiXG4gICAgICBAJCgnLnZpeicpLmFwcGVuZCAnPGJyIHN0eWxlPVwiY2xlYXI6Ym90aDtcIj4nXG5cbiAgICAgIEAkKCcnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFycmF5RW52aXJvbm1lbnRUYWIiLCJSZXBvcnRUYWIgPSByZXF1aXJlICdyZXBvcnRUYWInXG50ZW1wbGF0ZXMgPSByZXF1aXJlICcuLi90ZW1wbGF0ZXMvdGVtcGxhdGVzLmpzJ1xuX3BhcnRpYWxzID0gcmVxdWlyZSAnLi4vbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3RlbXBsYXRlcy90ZW1wbGF0ZXMuanMnXG5wYXJ0aWFscyA9IFtdXG5mb3Iga2V5LCB2YWwgb2YgX3BhcnRpYWxzXG4gIHBhcnRpYWxzW2tleS5yZXBsYWNlKCdub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvJywgJycpXSA9IHZhbFxuXG5jbGFzcyBBcnJheU92ZXJ2aWV3VGFiIGV4dGVuZHMgUmVwb3J0VGFiXG4gIG5hbWU6ICdPdmVydmlldydcbiAgY2xhc3NOYW1lOiAnb3ZlcnZpZXcnXG4gIHRlbXBsYXRlOiB0ZW1wbGF0ZXMuYXJyYXlPdmVydmlld1xuICBkZXBlbmRlbmNpZXM6IFtcbiAgICAnWm9uZVNpemUnXG4gICAgJ1RlcnJlc3RyaWFsUHJvdGVjdGVkQXJlYXMnXG4gICAgIyAnRGlzdGFuY2VUb1RyYW5zbWlzc2lvbkxpbmVzJ1xuICBdXG4gIHRpbWVvdXQ6IDYwMDAwMFxuXG4gIHJlbmRlcjogKCkgLT5cbiAgICAjIGNvbnNvbGUubG9nIEByZWNvcmRTZXQoXCJEaXN0YW5jZVRvVHJhbnNtaXNzaW9uTGluZXNcIiwgXCJEaXN0YW5jZVRvVHJhbnNtaXNzaW9uTGluZXNcIilcbiAgICBjb250ZXh0ID1cbiAgICAgIHNrZXRjaDogQG1vZGVsLmZvclRlbXBsYXRlKClcbiAgICAgIHNrZXRjaENsYXNzOiBAc2tldGNoQ2xhc3MuZm9yVGVtcGxhdGUoKVxuICAgICAgYXR0cmlidXRlczogQG1vZGVsLmdldEF0dHJpYnV0ZXMoKVxuICAgICAgYWRtaW46IEBwcm9qZWN0LmlzQWRtaW4gd2luZG93LnVzZXJcbiAgICAgIHNpemU6IEByZWNvcmRTZXQoJ1pvbmVTaXplJywgJ1pvbmVTaXplJykuZmxvYXQoJ1NJWkVfU1FfS00nLCAyKVxuICAgICAgbnVtQ2hpbGRyZW46IEBjaGlsZHJlbi5sZW5ndGhcbiAgICAgIGFkamFjZW50UHJvdGVjdGVkQXJlYTogQHJlY29yZFNldCgnVGVycmVzdHJpYWxQcm90ZWN0ZWRBcmVhcycsIFxuICAgICAgICAnVGVycmVzdHJpYWxQcm90ZWN0ZWRBcmVhcycpLmJvb2woJ1Jlc3VsdCcpWzBdXG4gICAgICAjIHRyYW5zbWlzc2lvbkxpbmVzOiBAcmVjb3JkU2V0KFwiRGlzdGFuY2VUb1RyYW5zbWlzc2lvbkxpbmVzXCIsIFxuICAgICAgIyAgIFwiRGlzdGFuY2VUb1RyYW5zbWlzc2lvbkxpbmVzXCIpLmZsb2F0KCdEaXN0SW5LTScsIDIpXG4gICAgICAjIGluZnJhc3RydWN0dXJlOiBAcmVjb3JkU2V0KFwiRGlzdGFuY2VUb0luZnJhc3RydWN0dXJlXCIsIFxuICAgICAgIyAgIFwiRGlzdGFuY2VUb0luZnJhc3RydWN0dXJlXCIpLnRvQXJyYXkoKVxuXG4gICAgQCRlbC5odG1sIEB0ZW1wbGF0ZS5yZW5kZXIoY29udGV4dCwgcGFydGlhbHMpXG4gICAgQGVuYWJsZUxheWVyVG9nZ2xlcnMoKVxuICAgIG5vZGVzID0gW0Btb2RlbF1cbiAgICBAbW9kZWwuc2V0ICdvcGVuJywgdHJ1ZVxuICAgIG5vZGVzID0gbm9kZXMuY29uY2F0IEBjaGlsZHJlblxuICAgIGZvciBub2RlIGluIG5vZGVzXG4gICAgICBub2RlLnNldCAnc2VsZWN0ZWQnLCBmYWxzZVxuICAgIFRhYmxlT2ZDb250ZW50cyA9IHdpbmRvdy5yZXF1aXJlKCd2aWV3cy90YWJsZU9mQ29udGVudHMnKVxuICAgIEB0b2MgPSBuZXcgVGFibGVPZkNvbnRlbnRzKG5vZGVzKVxuICAgIEAkKCcudG9jQ29udGFpbmVyJykuYXBwZW5kIEB0b2MuZWxcbiAgICBAdG9jLnJlbmRlcigpXG5cbiAgcmVtb3ZlOiAoKSAtPlxuICAgIEB0b2M/LnJlbW92ZSgpXG4gICAgc3VwZXIoKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gQXJyYXlPdmVydmlld1RhYiIsIkFycmF5T3ZlcnZpZXdUYWIgPSByZXF1aXJlICcuL2FycmF5T3ZlcnZpZXdUYWIuY29mZmVlJ1xuQXJyYXlFbnZpcm9ubWVudFRhYiA9IHJlcXVpcmUgJy4vYXJyYXlFbnZpcm9ubWVudFRhYi5jb2ZmZWUnXG5FY29ub21pY1RhYiA9IHJlcXVpcmUgJy4vZWNvbm9taWNUYWIuY29mZmVlJ1xuQ3VsdHVyZVRhYiA9IHJlcXVpcmUgJy4vY3VsdHVyZVRhYi5jb2ZmZWUnXG5cbndpbmRvdy5hcHAucmVnaXN0ZXJSZXBvcnQgKHJlcG9ydCkgLT5cbiAgcmVwb3J0LnRhYnMgW1xuICAgIEFycmF5T3ZlcnZpZXdUYWIsIFxuICAgIEFycmF5RW52aXJvbm1lbnRUYWIsIFxuICAgIEVjb25vbWljVGFiLCBcbiAgICBDdWx0dXJlVGFiXG4gIF1cbiAgIyBwYXRoIG11c3QgYmUgcmVsYXRpdmUgdG8gZGlzdC9cbiAgcmVwb3J0LnN0eWxlc2hlZXRzIFsnLi9yZXBvcnQuY3NzJ11cbiIsIlJlcG9ydFRhYiA9IHJlcXVpcmUgJ3JlcG9ydFRhYidcbnRlbXBsYXRlcyA9IHJlcXVpcmUgJy4uL3RlbXBsYXRlcy90ZW1wbGF0ZXMuanMnXG5cbmNsYXNzIEN1bHR1cmVUYWIgZXh0ZW5kcyBSZXBvcnRUYWJcbiAgbmFtZTogJ0N1bHR1cmUnXG4gIGNsYXNzTmFtZTogJ2N1bHR1cmUnXG4gIHRlbXBsYXRlOiB0ZW1wbGF0ZXMuY3VsdHVyZVxuICAjIGRlcGVuZGVuY2llczogWydBcmNoU2l0ZU92ZXJsYXAnXVxuICAjIHRpbWVvdXQ6IDYwMDAwXG5cbiAgcmVuZGVyOiAoKSAtPlxuICAgICMgc2V0dXAgY29udGV4dCBvYmplY3Qgd2l0aCBkYXRhIGFuZCByZW5kZXIgdGhlIHRlbXBsYXRlIGZyb20gaXRcbiAgICB6b25lVHlwZSA9IF8uZmluZCBAbW9kZWwuZ2V0QXR0cmlidXRlcygpLCAoYXR0cikgLT4gXG4gICAgICBhdHRyLmV4cG9ydGlkIGlzICdaT05FX1RZUEUnXG4gICAgem9uZVR5cGUgPSB6b25lVHlwZT8udmFsdWUgb3IgJ3NteidcblxuICAgIGNvbnRleHQgPVxuICAgICAgc2tldGNoOiBAbW9kZWwuZm9yVGVtcGxhdGUoKVxuICAgICAgc2tldGNoQ2xhc3M6IEBza2V0Y2hDbGFzcy5mb3JUZW1wbGF0ZSgpXG4gICAgICBhdHRyaWJ1dGVzOiBAbW9kZWwuZ2V0QXR0cmlidXRlcygpXG4gICAgICBhZG1pbjogQHByb2plY3QuaXNBZG1pbiB3aW5kb3cudXNlclxuICAgICAgIyBvdmVybGFwOiBAcmVjb3JkU2V0KFwiQXJjaFNpdGVPdmVybGFwXCIsIFwiQXJjaFNpdGVPdmVybGFwXCIpLmJvb2woJ1Jlc3VsdCcpXG4gICAgICBhcnJheTogQGNoaWxkcmVuPy5sZW5ndGggPiAwXG4gICAgICBwbXo6ICEoQGNoaWxkcmVuPy5sZW5ndGggPiAwKSBhbmQgem9uZVR5cGUgaXMgJ3BteidcbiAgICAgIHNtejogIShAY2hpbGRyZW4/Lmxlbmd0aCA+IDApIGFuZCB6b25lVHlwZSBpcyAnc216J1xuXG4gICAgQCRlbC5odG1sIEB0ZW1wbGF0ZS5yZW5kZXIoY29udGV4dCwgdGVtcGxhdGVzKVxuICAgIEBlbmFibGVMYXllclRvZ2dsZXJzKClcblxubW9kdWxlLmV4cG9ydHMgPSBDdWx0dXJlVGFiIiwiUmVwb3J0VGFiID0gcmVxdWlyZSAncmVwb3J0VGFiJ1xudGVtcGxhdGVzID0gcmVxdWlyZSAnLi4vdGVtcGxhdGVzL3RlbXBsYXRlcy5qcydcblxuY2xhc3MgRWNvbm9taWNUYWIgZXh0ZW5kcyBSZXBvcnRUYWJcbiAgbmFtZTogJ0Vjb25vbXknXG4gIGNsYXNzTmFtZTogJ2Vjb25vbWljJ1xuICB0ZW1wbGF0ZTogdGVtcGxhdGVzLmVjb25vbWljXG4gIGRlcGVuZGVuY2llczogW1xuICAgIFwiQ2xvc3VyZXNcIlxuICAgIFwiT3ZlcmxhcFdpdGhFeGlzdGluZ1Byb3ZpbmNpYWxUZW51cmVzXCJcbiAgXVxuICB0aW1lb3V0OiA2MDAwMDBcblxuICByZW5kZXI6ICgpIC0+XG4gICAgem9uZVR5cGUgPSBfLmZpbmQgQG1vZGVsLmdldEF0dHJpYnV0ZXMoKSwgKGF0dHIpIC0+IFxuICAgICAgYXR0ci5leHBvcnRpZCBpcyAnWk9ORV9UWVBFJ1xuICAgIHpvbmVUeXBlID0gem9uZVR5cGU/LnZhbHVlIG9yICdzbXonXG5cbiAgICAjIHNldHVwIGNvbnRleHQgb2JqZWN0IHdpdGggZGF0YSBhbmQgcmVuZGVyIHRoZSB0ZW1wbGF0ZSBmcm9tIGl0XG4gICAgY29udGV4dCA9XG4gICAgICBza2V0Y2g6IEBtb2RlbC5mb3JUZW1wbGF0ZSgpXG4gICAgICBza2V0Y2hDbGFzczogQHNrZXRjaENsYXNzLmZvclRlbXBsYXRlKClcbiAgICAgIGF0dHJpYnV0ZXM6IEBtb2RlbC5nZXRBdHRyaWJ1dGVzKClcbiAgICAgIGFkbWluOiBAcHJvamVjdC5pc0FkbWluIHdpbmRvdy51c2VyXG4gICAgICBjbG9zdXJlczogQHJlY29yZFNldChcIkNsb3N1cmVzXCIsIFwiRmlzaGVyaWVzQ2xvc3VyZXNcIikudG9BcnJheSgpXG4gICAgICBwcm92aW5jaWFsOiBAcmVjb3JkU2V0KFwiT3ZlcmxhcFdpdGhFeGlzdGluZ1Byb3ZpbmNpYWxUZW51cmVzXCIsIFwiUHJvdmluY2lhbFRlbnVyZXNcIikudG9BcnJheSgpXG4gICAgICBhcnJheTogQGNoaWxkcmVuPy5sZW5ndGggPiAwXG4gICAgICBwbXo6ICEoQGNoaWxkcmVuPy5sZW5ndGggPiAwKSBhbmQgem9uZVR5cGUgaXMgJ3BteidcbiAgICAgIHNtejogIShAY2hpbGRyZW4/Lmxlbmd0aCA+IDApIGFuZCB6b25lVHlwZSBpcyAnc216J1xuXG4gICAgQCRlbC5odG1sIEB0ZW1wbGF0ZS5yZW5kZXIoY29udGV4dCwgdGVtcGxhdGVzKVxuICAgIEBlbmFibGVMYXllclRvZ2dsZXJzKClcbiAgICBAZW5hYmxlVGFibGVQYWdpbmcoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEVjb25vbWljVGFiIiwidGhpc1tcIlRlbXBsYXRlc1wiXSA9IHRoaXNbXCJUZW1wbGF0ZXNcIl0gfHwge307XG5cbnRoaXNbXCJUZW1wbGF0ZXNcIl1bXCJhcnJheUVudmlyb25tZW50XCJdID0gbmV3IEhvZ2FuLlRlbXBsYXRlKGZ1bmN0aW9uKGMscCxpKXt2YXIgXz10aGlzO18uYihpPWl8fFwiXCIpO18uYihcIjxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gdGFibGVDb250YWluZXJcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGg0PkhhYml0YXQgUmVwcmVzZW50YXRpb24gKEFsbCBab25lcyBDb21iaW5lZCk8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIxMFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDx0aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGg+SGFiaXRhdDwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGg+UHJvdGVjdGVkIEFyZWEgKGttwrIpPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8L3RoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8dGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImhhYml0YXRzXCIsYyxwLDEpLGMscCwwLDI2NywzMzMsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgIDx0cj48dGQ+XCIpO18uYihfLnYoXy5mKFwiSEFCX05BTUVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPjx0ZD5cIik7Xy5iKF8udihfLmYoXCJDTFBEX0FSRUFcIixjLHAsMCkpKTtfLmIoXCI8L3RkPjwvdHI+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgICAgPC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPHRmb290PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx0ZCBjb2xzcGFuPVxcXCIzXFxcIiBjbGFzcz1cXFwicGFyYWdyYXBoXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgSGFiaXRhdCBkYXRhIGZvciBiZW50aGljIGVjb3N5c3RlbXMsIHBlbGFnaWMgYXJlYXMsIGFuZCBvY2Vhbm9ncmFwaGljIHByb2Nlc3NlcyBpcyB1c2VkIHRvIGluZm9ybSBzaXRpbmcgb2Ygem9uZXMuIEluY2x1ZGVkIGhlcmUgYXJlIGJpb2dlbmljIGhhYml0YXRzIGFzIHdlbGwgYXMgY29tbXVuaXR5LWZvcm1pbmcgc3BlY2llcywgc3VjaCBhcyBlZWxncmFzcyBhbmQga2VscC5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPC90Zm9vdD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvdGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxoND5PdmVybGFwIHdpdGggRXhpc3RpbmcgUHJvdGVjdGVkIEFyZWFzIDxhIGhyZWY9XFxcIiNcXFwiIGRhdGEtdG9nZ2xlLW5vZGU9XFxcIjUyMGQ0YzJhNjc0NjU5Y2I3YjM1ZDU3NVxcXCIgZGF0YS12aXNpYmxlPVxcXCJmYWxzZVxcXCI+c2hvdyBsYXllcjwvYT48L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIxMFxcXCIgZGF0YS1uby1yb3dzPVxcXCJEb2VzIG5vdCBvdmVybGFwIGFueSBFeGlzdGluZyBQcm90ZWN0ZWQgQXJlYXMuIE1hUFAgcmVjb21tZW5kcyBzcGF0aWFsIGxvY2F0aW9ucyBmb3IgbWFyaW5lIHByb3RlY3Rpb24gdGhhdCBpbmNsdWRlIGVpdGhlciBvciBib3RoIGVjb2xvZ2ljYWwgYW5kIGN1bHR1cmFsIHZhbHVlcywgaW5jbHVkaW5nIGFyZWFzIHRoYXQgY29udHJpYnV0ZSB0byBhIE1hcmluZSBQcm90ZWN0ZWQgQXJlYSBuZXR3b3JrIGZvciB0aGUgTm9ydGhlcm4gU2hlbGYgQmlvcmVnaW9uLlxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDx0aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGg+UHJvdGVjdGVkIEFyZWE8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRoPk92ZXJsYXAgKGttwrIpPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx0aD5PdmVybGFwICU8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDwvdGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiZXhpc3RpbmdNUEFzXCIsYyxwLDEpLGMscCwwLDEzNzMsMTQ5MSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIk5BTUVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIkNMUERfQVJFQVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiUEVSQ19BUkVBXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgIDwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDx0Zm9vdD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGQgY29sc3Bhbj1cXFwiM1xcXCIgY2xhc3M9XFxcInBhcmFncmFwaFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIE1hUFAgcmVjb21tZW5kcyBzcGF0aWFsIGxvY2F0aW9ucyBmb3IgbWFyaW5lIHByb3RlY3Rpb24gdGhhdCBpbmNsdWRlIGVpdGhlciBvciBib3RoIGVjb2xvZ2ljYWwgYW5kIGN1bHR1cmFsIHZhbHVlcywgaW5jbHVkaW5nIGFyZWFzIHRoYXQgY29udHJpYnV0ZSB0byBhIE1hcmluZSBQcm90ZWN0ZWQgQXJlYSBuZXR3b3JrIGZvciB0aGUgTm9ydGhlcm4gU2hlbGYgQmlvcmVnaW9uLiAgXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDwvdGZvb3Q+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPCEtLSA8YSBocmVmPVxcXCIjXFxcIiBkYXRhLXRvZ2dsZS1ub2RlPVxcXCI1MWY1NTQ1YzA4ZGM0ZjVmMmQyMTYxNDZcXFwiIGRhdGEtdmlzaWJsZT1cXFwiZmFsc2VcXFwiPnNob3cgaGFiaXRhdHMgbGF5ZXI8L2E+IC0tPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+T3ZlcmxhcCB3aXRoIEltcG9ydGFudCBNYXJpbmUgQXJlYXM8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPHRhYmxlICBkYXRhLXBhZ2luZz1cXFwiMTBcXFwiIGRhdGEtbm8tcm93cz1cXFwiRG9lcyBub3Qgb3ZlcmxhcCBhbnkgSW1wb3J0YW50IE1hcmluZSBBcmVhc1xcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDx0aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGg+SW1wb3J0YW50IEFyZWE8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRoPk92ZXJsYXAgKGttwrIpPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx0aD5PdmVybGFwICU8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDwvdGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaW1wb3J0YW50QXJlYXNcIixjLHAsMSksYyxwLDAsMjMzOSwyNDU3LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiTkFNRVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiQ0xQRF9BUkVBXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJQRVJDX0FSRUFcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgICAgPC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPHRmb290PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx0ZCBjb2xzcGFuPVxcXCIzXFxcIiBjbGFzcz1cXFwicGFyYWdyYXBoXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgVG8gcmVkdWNlIHBvdGVudGlhbCBjb25mbGljdHMgd2l0aCB0aGVzZSBtYXJpbmUgc3BlY2llcywgXCIpO2lmKF8ucyhfLmYoXCJwbXpcIixjLHAsMSksYyxwLDAsMjYzMSwyNjU4LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJQcm90ZWN0aW9uIE1hbmFnZW1lbnQgWm9uZXNcIik7fSk7Yy5wb3AoKTt9aWYoXy5zKF8uZihcInNtelwiLGMscCwxKSxjLHAsMCwyNjc0LDI2OTgsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIlNwZWNpYWwgTWFuYWdlbWVudCBab25lc1wiKTt9KTtjLnBvcCgpO31fLmIoXCIgbWF5IGNvbnNpZGVyIHRoZXNlIGFyZWFzLiBJbXBvcnRhbnQgQXJlYXMgd2VyZSBpZGVudGlmaWVkIGR1cmluZyB0aGUgcHJvY2VzcyBvZiBlc3RhYmxpc2hpbmcgRWNvbG9naWNhbGx5IGFuZCBCaW9sb2dpY2FsbHkgU2lnbmlmaWNhbnQgQXJlYXMgKEVCU0FzKSBieSB0aGUgUGFjaWZpYyBOb3J0aCBDb2FzdCBJbnRlZ3JhdGVkIE1hbmFnZW1lbnQgQXJlYSAoUE5DSU1BKS4gSW1wb3J0YW50IEJpcmQgQXJlYXMgKElCQXMpIHdlcmUgaWRlbnRpZmllZCBieSBCaXJkIFN0dWRpZXMgQ2FuYWRhIGFuZCBOYXR1cmUgQ2FuYWRhLiAgQ3JpdGljYWwgSGFiaXRhdCBtZWV0cyBDYW5hZGEncyBTcGVjaWVzIGF0IFJpc2sgUmVxdWlyZW1lbnRzLiBQb3RlbnRpYWwgY3JpdGljYWwgaXMgaW5zdWZmaWNpZW50IGluZm9ybWF0aW9uIHRvIG1lZXQgU0FSQSByZXF1aXJlbWVudHMuIFNlZSB0aGUgPGEgaHJlZj1cXFwiaHR0cDovL3BuY2ltYS5vcmcvc2l0ZS9hdGxhcy5odG1sXFxcIiB0YXJnZXQ9XFxcIl9ibGFua1xcXCI+UE5DSU1BIGF0bGFzPC9hPiBmb3IgbW9yZSBpbmZvcm1hdGlvbiBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPC90Zm9vdD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwhLS0gPGEgaHJlZj1cXFwiI1xcXCIgZGF0YS10b2dnbGUtbm9kZT1cXFwiNTFmNTU0NWMwOGRjNGY1ZjJkMjE2MTQ2XFxcIiBkYXRhLXZpc2libGU9XFxcImZhbHNlXFxcIj5zaG93IGhhYml0YXRzIGxheWVyPC9hPiAtLT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvblxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+TWFyeGFuIEFuYWx5c2lzPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxzZWxlY3QgY2xhc3M9XFxcImNob3NlblxcXCIgd2lkdGg9XFxcIjQwMHB4XFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwibWFyeGFuQW5hbHlzZXNcIixjLHAsMSksYyxwLDAsMzU0MCwzNTg2LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgPG9wdGlvbiB2YWx1ZT1cXFwiXCIpO18uYihfLnYoXy5kKFwiLlwiLGMscCwwKSkpO18uYihcIlxcXCI+XCIpO18uYihfLnYoXy5kKFwiLlwiLGMscCwwKSkpO18uYihcIjwvb3B0aW9uPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICA8L3NlbGVjdD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxwIGNsYXNzPVxcXCJzY2VuYXJpb1Jlc3VsdHNcXFwiPjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxkaXYgY2xhc3M9XFxcInZpelxcXCI+PC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8cCBjbGFzcz1cXFwic2NlbmFyaW9EZXNjcmlwdGlvblxcXCI+PC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPHA+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIE1hUFAgY29sbGFib3JhdGVkIHdpdGggdGhlIDxhIGhyZWY9XFxcImh0dHA6Ly9iY21jYS5jYS9cXFwiIHRhcmdldD1cXFwiX2JsYW5rXFxcIj5CQyBNYXJpbmUgQ29uc2VydmF0aW9uIEFuYWx5c2lzIChCQ01DQSk8L2E+IHRvIGlkZW50aWZ5IG1hcmluZSBhcmVhcyBvZiBoaWdoIGNvbnNlcnZhdGlvbiB2YWx1ZSBiYXNlZCBvbiBzcGF0aWFsIGRhdGFzZXRzIG9mIGVjb2xvZ2ljYWwgaW5mb3JtYXRpb24uIFRoZXNlIE1hcnhhbiBzY2VuYXJpb3MgY2FuIGJlIHVzZWQgdG8gaW5mb3JtIHRoZSBsb2NhdGlvbiBvciBzaXRpbmcgb2YgTWFQUCB6b25lcy4gPGEgaHJlZj1cXFwiaHR0cDovL3d3dy51cS5lZHUuYXUvbWFyeGFuL1xcXCIgdGFyZ2V0PVxcXCJfYmxhbmtcXFwiPk1hcnhhbjwvYT4gaXMgYSBkZWNpc2lvbiBzdXBwb3J0IHRvb2wgZGV2ZWxvcGVkIGJ5IHRoZSBVbml2ZXJzaXR5IG9mIFF1ZWVuc2xhbmQgdG8gcHJvdmlkZSBzb2x1dGlvbnMgdG8gdGhlIOKAnG1pbmltdW0gc2V0IHByb2JsZW3igJ0gLSBjYXB0dXJpbmcgYSBzcGVjaWZpZWQgYW1vdW50ICh0YXJnZXQpIG9mIGluZGl2aWR1YWwgZmVhdHVyZXMgZm9yIHRoZSBsZWFzdCBjb3N0LiBCYXNlZCBvbiByZWxhdGl2ZWx5IHNpbXBsZSBtYXRoZW1hdGljYWwgYWxnb3JpdGhtcyBhbmQgZXF1YXRpb25zLCBNYXJ4YW4gc2VhcmNoZXMgbWlsbGlvbnMgb2YgcG90ZW50aWFsIHNvbHV0aW9ucyB0byBmaW5kIHRoZSBiZXN0IGJhbGFuY2UgYmV0d2VlbiBjb3N0cyBhbmQgYmVuZWZpdHMuIEluIHNob3J0LCBNYXJ4YW4gc29sdXRpb25zIG1pbmltaXplIHRoZSBvdmVyYWxsIGNvc3Qgc3ViamVjdCB0byB0aGUgY29uc3RyYWludCBvZiBtZWV0aW5nIHNwZWNpZmllZCDigJx0YXJnZXRz4oCdIGZvciBhbGwgZmVhdHVyZXMuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8cD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgTWFQUCBjb25zdWx0ZWQgdGhlIE1hUFAgU2NpZW5jZSBBZHZpc29yeSBDb21taXR0ZWUgKFNBQykgZm9yIGFkdmljZSBvbiBzY2VuYXJpb3MgYW5kIHRhcmdldCBzZWxlY3Rpb24uICBUaGUgU0FDIHN1cHBvcnRlZCB0aGUgZGVjaXNpb24gdG8gdXNlIHRoZSBwZXJjZW50YWdlIHRhcmdldCBjYXRlZ29yaWVzIGVzdGFibGlzaGVkIGJ5IHRoZSBCQ01DQSBwcm9qZWN0IHRlYW0gaW4gMjAwNi4gUGxlYXNlIHNlZSB0aGlzIDxhIGhyZWY9XFxcImh0dHBzOi8vZGwuZHJvcGJveHVzZXJjb250ZW50LmNvbS91LzE3NjQ5ODYvQkNNQ0EtTWFyeGFuIGZvciBNYVBQLVJlcG9ydCBvbiBpbml0aWFsIHNjZW5hcmlvc18yN0ZlYjIwMTMucGRmXFxcIiB0YXJnZXQ9XFxcIl9ibGFua1xcXCI+MjAxMyBCQ01DQSByZXBvcnQ8L2E+IGZvciBtb3JlIGluZm9ybWF0aW9uIGFib3V0IHRoZSBNYVBQLUJDTUNBIHByb2plY3QgYW5kIE1hcnhhbiBzY2VuYXJpb3MsIGFuZCBjb25zdWx0IHRoZSA8YSBocmVmPVxcXCJodHRwOi8vYmNtY2EuY2FcXFwiIHRhcmdldD1cXFwiX2JsYW5rXFxcIj5CQ01DQSBBdGxhczwvYT4gZm9yIGRldGFpbGVkIGluZm9ybWF0aW9uIGFib3V0IHRhcmdldHMsIHNwZWNpZXMsIGFuZCBoYWJpdGF0cy5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO3JldHVybiBfLmZsKCk7O30pO1xuXG50aGlzW1wiVGVtcGxhdGVzXCJdW1wiYXJyYXlPdmVydmlld1wiXSA9IG5ldyBIb2dhbi5UZW1wbGF0ZShmdW5jdGlvbihjLHAsaSl7dmFyIF89dGhpcztfLmIoaT1pfHxcIlwiKTtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxoND5TaXplPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxwIGNsYXNzPVxcXCJsYXJnZVxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIFRoaXMgcmVnaW9uYWwgcHJvcG9zYWwgY29udGFpbnMgXCIpO18uYihfLnYoXy5mKFwibnVtQ2hpbGRyZW5cIixjLHAsMCkpKTtfLmIoXCIgem9uZXMgYW5kIGNvdmVycyBhIHRvdGFsIG9mIDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwic2l6ZVwiLGMscCwwKSkpO18uYihcIiBzcXVhcmUga2lsb21ldGVyczwvc3Ryb25nPi5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxkaXYgY2xhc3M9XFxcInRvY0NvbnRhaW5lclxcXCI+PC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiYWRqYWNlbnRQcm90ZWN0ZWRBcmVhXCIsYyxwLDEpLGMscCwwLDI2NSw3NDEsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIjxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb25cXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGg0Pk5lYXJieSBBcmVhczwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8cCBjbGFzcz1cXFwibGFyZ2UgZ3JlZW4tY2hlY2tcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICBab25lcyB3aXRoaW4gdGhpcyBwcm9wb3NhbCBhcmUgYWRqYWNlbnQgdG8gYSA8c3Ryb25nPlRlcnJlc3RyaWFsIFByb3RlY3RlZCBBcmVhPC9zdHJvbmc+LlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPHA+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIEJ1aWxkIG9uIHBhc3QgYW5kIGV4aXN0aW5nIHpvbmluZyBlZmZvcnRzIHRoYXQgYXJlIGNvbnNpc3RlbnQgd2l0aCBhbiBlY29zeXN0ZW0tYmFzZWQgbWFuYWdlbWVudCBhcHByb2FjaC4gIFdoZXJldmVyIHBvc3NpYmxlLCBkbyBub3QgZHVwbGljYXRlIGV4aXN0aW5nIHpvbmluZyBlZmZvcnRzIGFuZCBjb25zaWRlciBleGlzdGluZyB0ZXJyZXN0cmlhbCB6b25pbmcgZm9yIGFkamFjZW50IG1hcmluZSB6b25pbmcgdG8gYWNoaWV2ZSB6b25pbmcgb2JqZWN0aXZlcy5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7Xy5iKFwiPCEtLSA8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxoND5UcmFuc21pc3Npb24gTGluZXMgPGEgaHJlZj1cXFwiI1xcXCIgZGF0YS10b2dnbGUtbm9kZT1cXFwiNTFmNmFkNjc3YmJiOWIyNDU3MDIwZjUyXFxcIiBkYXRhLXZpc2libGU9XFxcImZhbHNlXFxcIj5zaG93IGxheWVyPC9hPjwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8cCBjbGFzcz1cXFwibGFyZ2VcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICBUaGlzIHpvbmUgaXMgXCIpO18uYihfLnYoXy5mKFwidHJhbnNtaXNzaW9uTGluZXNcIixjLHAsMCkpKTtfLmIoXCIga20gZnJvbSB0aGUgbmVhcmVzdCB0cmFuc21pc3Npb24gbGluZXMuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiIC0tPlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJhdHRyaWJ1dGVzXCIsYyxwLDEpLGMscCwwLDEwNTcsMTE4MyxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvblxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+XCIpO18uYihfLnYoXy5kKFwic2tldGNoQ2xhc3MubmFtZVwiLGMscCwwKSkpO18uYihcIiBBdHRyaWJ1dGVzPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXy5ycChcImF0dHJpYnV0ZXMvYXR0cmlidXRlc1RhYmxlXCIsYyxwLFwiICAgIFwiKSk7Xy5iKFwiICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9cmV0dXJuIF8uZmwoKTs7fSk7XG5cbnRoaXNbXCJUZW1wbGF0ZXNcIl1bXCJjdWx0dXJlXCJdID0gbmV3IEhvZ2FuLlRlbXBsYXRlKGZ1bmN0aW9uKGMscCxpKXt2YXIgXz10aGlzO18uYihpPWl8fFwiXCIpO18uYihcIjxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gXCIpO2lmKF8ucyhfLmYoXCJvdmVybGFwXCIsYyxwLDEpLGMscCwwLDM4LDQ2LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJlbXBoYXNpc1wiKTt9KTtjLnBvcCgpO31fLmIoXCJcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGg0PkN1bHR1cmFsIFVzZXM8IS0tIE92ZXJsYXAgd2l0aCBIaXN0b3JpY2FsIG9yIEFyY2hlb2xvZ2ljYWwgU2l0ZXMgLS0+PC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxwPlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJzbXpcIixjLHAsMSksYyxwLDAsMTU5LDM3MyxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgIEZpcnN0IE5hdGlvbnMgdHJhZGl0aW9uYWwgdXNlcyBjb250aW51ZSBpbiB0aGUgU3BlY2lhbCBNYW5hZ2VtZW50IFpvbmUgaW4gYWNjb3JkYW5jZSB3aXRoXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIGxlZ2FsIG9ibGlnYXRpb25zIGFuZCBnb3Zlcm5tZW50IHBvbGljaWVzLCBpbmNsdWRpbmcgcHJhY3RpY2VzIGZvciBmb29kLCBzb2NpYWwsIGFuZCBjZXJlbW9uaWFsXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIGZpc2hlcmllcy5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fWlmKF8ucyhfLmYoXCJwbXpcIixjLHAsMSksYyxwLDAsMzk0LDYxMSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgIEZpcnN0IE5hdGlvbnMgdHJhZGl0aW9uYWwgdXNlcyBjb250aW51ZSBpbiB0aGUgUHJvdGVjdGlvbiBNYW5hZ2VtZW50IFpvbmUgaW4gYWNjb3JkYW5jZSB3aXRoXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIGxlZ2FsIG9ibGlnYXRpb25zIGFuZCBnb3Zlcm5tZW50IHBvbGljaWVzLCBpbmNsdWRpbmcgcHJhY3RpY2VzIGZvciBmb29kLCBzb2NpYWwsIGFuZCBjZXJlbW9uaWFsXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIGZpc2hlcmllcy5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fWlmKF8ucyhfLmYoXCJhcnJheVwiLGMscCwxKSxjLHAsMCw2MzQsODQ3LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgRmlyc3QgTmF0aW9ucyB0cmFkaXRpb25hbCB1c2VzIGNvbnRpbnVlIGluIHpvbmVzIHdpdGhpbiB0aGlzIHByb3Bvc2FsIGluIGFjY29yZGFuY2Ugd2l0aFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICBsZWdhbCBvYmxpZ2F0aW9ucyBhbmQgZ292ZXJubWVudCBwb2xpY2llcywgaW5jbHVkaW5nIHByYWN0aWNlcyBmb3IgZm9vZCwgc29jaWFsLCBhbmQgY2VyZW1vbmlhbFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICBmaXNoZXJpZXMuXCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8IS0tICAgPHA+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcIm92ZXJsYXBcIixjLHAsMSksYyxwLDAsODkyLDk3MCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgIFRoaXMgem9uZSBvdmVybGFwcyB3aXRoIHNlbnNpdGl2ZSBoaXN0b3JpY2FsIG9yIGFyY2hlb2xvZ2ljYWwgYXJlYXMuXCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31pZighXy5zKF8uZihcIm92ZXJsYXBcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCIgICAgVGhpcyB6b25lIDwvc3Ryb25nPmRvZXMgbm90PC9zdHJvbmc+IG92ZXJsYXAgd2l0aCBhbnkgc2Vuc2l0aXZlIGhpc3RvcmljYWwgb3IgYXJjaGVvbG9naWNhbCBhcmVhcy5cIik7Xy5iKFwiXFxuXCIpO307Xy5iKFwiICA8L3A+IC0tPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIik7cmV0dXJuIF8uZmwoKTs7fSk7XG5cbnRoaXNbXCJUZW1wbGF0ZXNcIl1bXCJkZW1vXCJdID0gbmV3IEhvZ2FuLlRlbXBsYXRlKGZ1bmN0aW9uKGMscCxpKXt2YXIgXz10aGlzO18uYihpPWl8fFwiXCIpO18uYihcIjxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb25cXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGg0Pk91dHB1dDwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8cHJlPlwiKTtfLmIoXy52KF8uZihcInJlc3VsdFwiLGMscCwwKSkpO18uYihcIjwvcHJlPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIik7cmV0dXJuIF8uZmwoKTs7fSk7XG5cbnRoaXNbXCJUZW1wbGF0ZXNcIl1bXCJlY29ub21pY1wiXSA9IG5ldyBIb2dhbi5UZW1wbGF0ZShmdW5jdGlvbihjLHAsaSl7dmFyIF89dGhpcztfLmIoaT1pfHxcIlwiKTtpZihfLnMoXy5mKFwicG16XCIsYyxwLDEpLGMscCwwLDgsMTI5MCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+T3ZlcmxhcCB3aXRoIEZpc2hlcmllcyBDbG9zdXJlczwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIiBkYXRhLW5vLXJvd3M9XFxcIkRvZXMgbm90IG92ZXJsYXAgYW55IEZpc2hlcmllcyBDbG9zdXJlcy4gRmlzaGVyaWVzIGNsb3N1cmVzIG1heSBuZWVkIHRvIGJlIGNvbnNpZGVyZWQgdG8gcmVkdWNlIHBvdGVudGlhbCBjb25mbGljdHMgYmV0d2VlbiB1c2VzIGFuZCBhY3Rpdml0aWVzLiBGZWRlcmFsIFJvY2tmaXNoIENvbnNlcnZhdGlvbiBBcmVhcyBhbmQgRmVkZXJhbCBTcG9uZ2UgUmVlZiBSZXNlcnZlIGFyZSBhbmFseXNlZCBmb3Igb3ZlcmxhcCB3aXRoIFwiKTtpZihfLnMoXy5mKFwiYXJyYXlcIixjLHAsMSksYyxwLDAsMzg4LDQxNCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiem9uZXMgd2l0aGluIHRoaXMgcHJvcG9zYWxcIik7fSk7Yy5wb3AoKTt9aWYoIV8ucyhfLmYoXCJhcnJheVwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcInRoaXMgem9uZVwiKTt9O18uYihcIi4gXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPHRoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx0aD5UZW51cmVzPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx0aD5PdmVybGFwIChrbcKyKTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGg+T3ZlcmxhcCAlPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8L3RoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8dGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImNsb3N1cmVzXCIsYyxwLDEpLGMscCwwLDYyMCw3MzgsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJOQU1FXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJDTFBEX0FSRUFcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIlBFUkNfQVJFQVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8dGZvb3Q+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRkIGNvbHNwYW49XFxcIjNcXFwiIGNsYXNzPVxcXCJwYXJhZ3JhcGhcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICBGaXNoZXJpZXMgY2xvc3VyZXMgbWF5IG5lZWQgdG8gYmUgY29uc2lkZXJlZCB0byByZWR1Y2UgcG90ZW50aWFsIGNvbmZsaWN0cyBiZXR3ZWVuIHVzZXMgYW5kIGFjdGl2aXRpZXMuIEZlZGVyYWwgUm9ja2Zpc2ggQ29uc2VydmF0aW9uIEFyZWFzIGFuZCBGZWRlcmFsIFNwb25nZSBSZWVmIFJlc2VydmUgYXJlIGFuYWx5c2VkIGZvciBvdmVybGFwIHdpdGggXCIpO2lmKF8ucyhfLmYoXCJhcnJheVwiLGMscCwxKSxjLHAsMCwxMDUzLDEwNzksXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcInpvbmVzIHdpdGhpbiB0aGlzIHByb3Bvc2FsXCIpO30pO2MucG9wKCk7fWlmKCFfLnMoXy5mKFwiYXJyYXlcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJ0aGlzIHpvbmVcIik7fTtfLmIoXCIuIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8L3Rmb290PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwhLS0gPGEgaHJlZj1cXFwiI1xcXCIgZGF0YS10b2dnbGUtbm9kZT1cXFwiNTFmNTU0NWMwOGRjNGY1ZjJkMjE2MTQ2XFxcIiBkYXRhLXZpc2libGU9XFxcImZhbHNlXFxcIj5zaG93IGhhYml0YXRzIGxheWVyPC9hPiAtLT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+T3ZlcmxhcCB3aXRoIFByb3ZpbmNpYWwgVGVudXJlcyA8YSBocmVmPVxcXCIjXFxcIiBkYXRhLXRvZ2dsZS1ub2RlPVxcXCI1MWYyZjVjYmE3MmVjMDY4MTYwNjIwOGVcXFwiIGRhdGEtdmlzaWJsZT1cXFwiZmFsc2VcXFwiPnNob3cgbGF5ZXI8L2E+PC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDx0YWJsZSBkYXRhLXBhZ2luZz1cXFwiMTBcXFwiIGRhdGEtbm8tcm93cz1cXFwiRG9lcyBub3Qgb3ZlcmxhcCBhbnkgUHJvdmluY2lhbCBUZW51cmVzLlxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDx0aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGg+VGVudXJlczwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGg+T3ZlcmxhcCAoa23Csik8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRoPk92ZXJsYXAgJTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPC90aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJwcm92aW5jaWFsXCIsYyxwLDEpLGMscCwwLDE3MjUsMTg0MyxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIk5BTUVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIkNMUERfQVJFQVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiUEVSQ19BUkVBXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgIDwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDx0Zm9vdD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGQgY29sc3Bhbj1cXFwiM1xcXCIgY2xhc3M9XFxcInBhcmFncmFwaFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcInNtelwiLGMscCwxKSxjLHAsMCwxOTU2LDIyNzAsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICBPbmUgb2YgdGhlIG9iamVjdGl2ZXMgZm9yIFNwZWNpYWwgTWFuYWdlbWVudCBab25lcyBpcyB0byBwcm92aWRlIGZvciBjZXJ0YWludHkgZm9yIGJ1c2luZXNzIGFuZCB1c2VyIGdyb3VwcywgaW5jbHVkaW5nIGVjb25vbWljIGRldmVsb3BtZW50IG9wcG9ydHVuaXRpZXMuICBUbyByZWR1Y2UgcG90ZW50aWFsIGNvbmZsaWN0cyBiZXR3ZWVuIHVzZXMgYW5kIGFjdGl2aXRpZXMsIFNwZWNpYWwgTWFuYWdlbWVudCBab25lcyBuZWVkIHRvIGNvbnNpZGVyIGV4aXN0aW5nIHByb3ZpbmNpYWwgY3Jvd24gdGVudXJlcy4gXCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31pZihfLnMoXy5mKFwicG16XCIsYyxwLDEpLGMscCwwLDIyOTcsMjQ1NyxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgIFRvIHJlZHVjZSBwb3RlbnRpYWwgY29uZmxpY3RzIGJldHdlZW4gdXNlcyBhbmQgYWN0aXZpdGllcywgUHJvdGVjdGlvbiBNYW5hZ2VtZW50IFpvbmVzIG5lZWQgdG8gY29uc2lkZXIgZXhpc3RpbmcgcHJvdmluY2lhbCBjcm93biB0ZW51cmVzLlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9aWYoXy5zKF8uZihcImFycmF5XCIsYyxwLDEpLGMscCwwLDI0ODYsMjYyNCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgIFRvIHJlZHVjZSBwb3RlbnRpYWwgY29uZmxpY3RzIGJldHdlZW4gdXNlcyBhbmQgYWN0aXZpdGllcywgem9uZXMgbmVlZCB0byBjb25zaWRlciBleGlzdGluZyBwcm92aW5jaWFsIGNyb3duIHRlbnVyZXMuXCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgICAgICAgIDwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPC90Zm9vdD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvdGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8IS0tIDxhIGhyZWY9XFxcIiNcXFwiIGRhdGEtdG9nZ2xlLW5vZGU9XFxcIjUxZjU1NDVjMDhkYzRmNWYyZDIxNjE0NlxcXCIgZGF0YS12aXNpYmxlPVxcXCJmYWxzZVxcXCI+c2hvdyBoYWJpdGF0cyBsYXllcjwvYT4gLS0+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiKTtyZXR1cm4gXy5mbCgpOzt9KTtcblxudGhpc1tcIlRlbXBsYXRlc1wiXVtcImVudmlyb25tZW50XCJdID0gbmV3IEhvZ2FuLlRlbXBsYXRlKGZ1bmN0aW9uKGMscCxpKXt2YXIgXz10aGlzO18uYihpPWl8fFwiXCIpO18uYihcIjxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gdGFibGVDb250YWluZXJcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGg0PkhhYml0YXQgUmVwcmVzZW50YXRpb24gPCEtLSA8YSBocmVmPVxcXCIjXFxcIiBkYXRhLXRvZ2dsZS1ub2RlPVxcXCI1MWYzMDJkNTA4ZGM0ZjVmMmQwMDk5NmFcXFwiIGRhdGEtdmlzaWJsZT1cXFwiZmFsc2VcXFwiPnNob3cgbGF5ZXI8L2E+IC0tPjwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8dGFibGUgZGF0YS1wYWdpbmc9XFxcIjEwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPHRoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx0aD5IYWJpdGF0PC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx0aD5Qcm90ZWN0ZWQgQXJlYSAoa23Csik8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDwvdGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaGFiaXRhdHNcIixjLHAsMSksYyxwLDAsMzQ3LDQxMyxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgPHRyPjx0ZD5cIik7Xy5iKF8udihfLmYoXCJIQUJfTkFNRVwiLGMscCwwKSkpO18uYihcIjwvdGQ+PHRkPlwiKTtfLmIoXy52KF8uZihcIkNMUERfQVJFQVwiLGMscCwwKSkpO18uYihcIjwvdGQ+PC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8dGZvb3Q+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRkIGNvbHNwYW49XFxcIjNcXFwiIGNsYXNzPVxcXCJwYXJhZ3JhcGhcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICBIYWJpdGF0IGRhdGEgZm9yIGJlbnRoaWMgZWNvc3lzdGVtcywgcGVsYWdpYyBhcmVhcywgYW5kIG9jZWFub2dyYXBoaWMgcHJvY2Vzc2VzIGlzIHVzZWQgdG8gaW5mb3JtIHNpdGluZyBvZiB0aGlzIHpvbmUuIEluY2x1ZGVkIGhlcmUgYXJlIGJpb2dlbmljIGhhYml0YXRzIGFzIHdlbGwgYXMgY29tbXVuaXR5LWZvcm1pbmcgc3BlY2llcywgc3VjaCBhcyBlZWxncmFzcyBhbmQga2VscC5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPC90Zm9vdD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvdGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxoND5PdmVybGFwIHdpdGggRXhpc3RpbmcgUHJvdGVjdGVkIEFyZWFzIDxhIGhyZWY9XFxcIiNcXFwiIGRhdGEtdG9nZ2xlLW5vZGU9XFxcIjUyMGQ0YzJhNjc0NjU5Y2I3YjM1ZDU3NVxcXCIgZGF0YS12aXNpYmxlPVxcXCJmYWxzZVxcXCI+c2hvdyBsYXllcjwvYT48L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPHRhYmxlIGRhdGEtcGFnaW5nPVxcXCIxMFxcXCIgZGF0YS1uby1yb3dzPVxcXCJEb2VzIG5vdCBvdmVybGFwIGFueSBFeGlzdGluZyBQcm90ZWN0ZWQgQXJlYXMuIE1hUFAgcmVjb21tZW5kcyBzcGF0aWFsIGxvY2F0aW9ucyBmb3IgbWFyaW5lIHByb3RlY3Rpb24gdGhhdCBpbmNsdWRlIGVpdGhlciBvciBib3RoIGVjb2xvZ2ljYWwgYW5kIGN1bHR1cmFsIHZhbHVlcywgaW5jbHVkaW5nIGFyZWFzIHRoYXQgY29udHJpYnV0ZSB0byBhIE1hcmluZSBQcm90ZWN0ZWQgQXJlYSBuZXR3b3JrIGZvciB0aGUgTm9ydGhlcm4gU2hlbGYgQmlvcmVnaW9uLlxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDx0aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGg+UHJvdGVjdGVkIEFyZWE8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRoPk92ZXJsYXAgKGttwrIpPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx0aD5PdmVybGFwICU8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDwvdGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiZXhpc3RpbmdNUEFzXCIsYyxwLDEpLGMscCwwLDE0NTcsMTU3NSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIk5BTUVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRkPlwiKTtfLmIoXy52KF8uZihcIkNMUERfQVJFQVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiUEVSQ19BUkVBXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgIDwvdGJvZHk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDx0Zm9vdD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGQgY29sc3Bhbj1cXFwiM1xcXCIgY2xhc3M9XFxcInBhcmFncmFwaFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIE1hUFAgcmVjb21tZW5kcyBzcGF0aWFsIGxvY2F0aW9ucyBmb3IgbWFyaW5lIHByb3RlY3Rpb24gdGhhdCBpbmNsdWRlIGVpdGhlciBvciBib3RoIGVjb2xvZ2ljYWwgYW5kIGN1bHR1cmFsIHZhbHVlcywgaW5jbHVkaW5nIGFyZWFzIHRoYXQgY29udHJpYnV0ZSB0byBhIE1hcmluZSBQcm90ZWN0ZWQgQXJlYSBuZXR3b3JrIGZvciB0aGUgTm9ydGhlcm4gU2hlbGYgQmlvcmVnaW9uLiAgXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDwvdGZvb3Q+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPCEtLSA8YSBocmVmPVxcXCIjXFxcIiBkYXRhLXRvZ2dsZS1ub2RlPVxcXCI1MWY1NTQ1YzA4ZGM0ZjVmMmQyMTYxNDZcXFwiIGRhdGEtdmlzaWJsZT1cXFwiZmFsc2VcXFwiPnNob3cgaGFiaXRhdHMgbGF5ZXI8L2E+IC0tPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+T3ZlcmxhcCB3aXRoIEltcG9ydGFudCBNYXJpbmUgQXJlYXM8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPHRhYmxlICBkYXRhLXBhZ2luZz1cXFwiMTBcXFwiIGRhdGEtbm8tcm93cz1cXFwiRG9lcyBub3Qgb3ZlcmxhcCBhbnkgSW1wb3J0YW50IE1hcmluZSBBcmVhc1xcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDx0aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGg+SW1wb3J0YW50IEFyZWE8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHRoPk92ZXJsYXAgKGttwrIpPC90aD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx0aD5PdmVybGFwICU8L3RoPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDwvdGhlYWQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDx0Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiaW1wb3J0YW50QXJlYXNcIixjLHAsMSksYyxwLDAsMjQyMywyNTQxLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICA8dHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiTkFNRVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGQ+XCIpO18uYihfLnYoXy5mKFwiQ0xQRF9BUkVBXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJQRVJDX0FSRUFcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvdHI+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgICAgPC90Ym9keT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPHRmb290PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx0ZCBjb2xzcGFuPVxcXCIzXFxcIiBjbGFzcz1cXFwicGFyYWdyYXBoXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgVG8gcmVkdWNlIHBvdGVudGlhbCBjb25mbGljdHMgd2l0aCB0aGVzZSBtYXJpbmUgc3BlY2llcywgXCIpO2lmKF8ucyhfLmYoXCJwbXpcIixjLHAsMSksYyxwLDAsMjcxNSwyNzQyLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJQcm90ZWN0aW9uIE1hbmFnZW1lbnQgWm9uZXNcIik7fSk7Yy5wb3AoKTt9aWYoXy5zKF8uZihcInNtelwiLGMscCwxKSxjLHAsMCwyNzU4LDI3ODIsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIlNwZWNpYWwgTWFuYWdlbWVudCBab25lc1wiKTt9KTtjLnBvcCgpO31fLmIoXCIgbWF5IGNvbnNpZGVyIHRoZXNlIGFyZWFzLiBJbXBvcnRhbnQgQXJlYXMgd2VyZSBpZGVudGlmaWVkIGR1cmluZyB0aGUgcHJvY2VzcyBvZiBlc3RhYmxpc2hpbmcgRWNvbG9naWNhbGx5IGFuZCBCaW9sb2dpY2FsbHkgU2lnbmlmaWNhbnQgQXJlYXMgKEVCU0FzKSBieSB0aGUgUGFjaWZpYyBOb3J0aCBDb2FzdCBJbnRlZ3JhdGVkIE1hbmFnZW1lbnQgQXJlYSAoUE5DSU1BKS4gSW1wb3J0YW50IEJpcmQgQXJlYXMgKElCQXMpIHdlcmUgaWRlbnRpZmllZCBieSBCaXJkIFN0dWRpZXMgQ2FuYWRhIGFuZCBOYXR1cmUgQ2FuYWRhLiAgQ3JpdGljYWwgSGFiaXRhdCBtZWV0cyBDYW5hZGEncyBTcGVjaWVzIGF0IFJpc2sgUmVxdWlyZW1lbnRzLiBQb3RlbnRpYWwgY3JpdGljYWwgaXMgaW5zdWZmaWNpZW50IGluZm9ybWF0aW9uIHRvIG1lZXQgU0FSQSByZXF1aXJlbWVudHMuIFNlZSB0aGUgPGEgaHJlZj1cXFwiaHR0cDovL3BuY2ltYS5vcmcvc2l0ZS9hdGxhcy5odG1sXFxcIiB0YXJnZXQ9XFxcIl9ibGFua1xcXCI+UE5DSU1BIGF0bGFzPC9hPiBmb3IgbW9yZSBpbmZvcm1hdGlvbiBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPC90Zm9vdD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwhLS0gPGEgaHJlZj1cXFwiI1xcXCIgZGF0YS10b2dnbGUtbm9kZT1cXFwiNTFmNTU0NWMwOGRjNGY1ZjJkMjE2MTQ2XFxcIiBkYXRhLXZpc2libGU9XFxcImZhbHNlXFxcIj5zaG93IGhhYml0YXRzIGxheWVyPC9hPiAtLT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvblxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+TWFyeGFuIEFuYWx5c2lzPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxzZWxlY3QgY2xhc3M9XFxcImNob3NlblxcXCIgd2lkdGg9XFxcIjQwMHB4XFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwibWFyeGFuQW5hbHlzZXNcIixjLHAsMSksYyxwLDAsMzYyNCwzNjcwLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgPG9wdGlvbiB2YWx1ZT1cXFwiXCIpO18uYihfLnYoXy5kKFwiLlwiLGMscCwwKSkpO18uYihcIlxcXCI+XCIpO18uYihfLnYoXy5kKFwiLlwiLGMscCwwKSkpO18uYihcIjwvb3B0aW9uPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICA8L3NlbGVjdD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxwIGNsYXNzPVxcXCJzY2VuYXJpb1Jlc3VsdHNcXFwiPjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxkaXYgY2xhc3M9XFxcInZpelxcXCI+PC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8cCBjbGFzcz1cXFwic2NlbmFyaW9EZXNjcmlwdGlvblxcXCI+PC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPHA+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIE1hUFAgY29sbGFib3JhdGVkIHdpdGggdGhlIDxhIGhyZWY9XFxcImh0dHA6Ly9iY21jYS5jYS9cXFwiIHRhcmdldD1cXFwiX2JsYW5rXFxcIj5CQyBNYXJpbmUgQ29uc2VydmF0aW9uIEFuYWx5c2lzIChCQ01DQSk8L2E+IHRvIGlkZW50aWZ5IG1hcmluZSBhcmVhcyBvZiBoaWdoIGNvbnNlcnZhdGlvbiB2YWx1ZSBiYXNlZCBvbiBzcGF0aWFsIGRhdGFzZXRzIG9mIGVjb2xvZ2ljYWwgaW5mb3JtYXRpb24uIFRoZXNlIE1hcnhhbiBzY2VuYXJpb3MgY2FuIGJlIHVzZWQgdG8gaW5mb3JtIHRoZSBsb2NhdGlvbiBvciBzaXRpbmcgb2YgTWFQUCB6b25lcy4gPGEgaHJlZj1cXFwiaHR0cDovL3d3dy51cS5lZHUuYXUvbWFyeGFuL1xcXCIgdGFyZ2V0PVxcXCJfYmxhbmtcXFwiPk1hcnhhbjwvYT4gaXMgYSBkZWNpc2lvbiBzdXBwb3J0IHRvb2wgZGV2ZWxvcGVkIGJ5IHRoZSBVbml2ZXJzaXR5IG9mIFF1ZWVuc2xhbmQgdG8gcHJvdmlkZSBzb2x1dGlvbnMgdG8gdGhlIOKAnG1pbmltdW0gc2V0IHByb2JsZW3igJ0gLSBjYXB0dXJpbmcgYSBzcGVjaWZpZWQgYW1vdW50ICh0YXJnZXQpIG9mIGluZGl2aWR1YWwgZmVhdHVyZXMgZm9yIHRoZSBsZWFzdCBjb3N0LiBCYXNlZCBvbiByZWxhdGl2ZWx5IHNpbXBsZSBtYXRoZW1hdGljYWwgYWxnb3JpdGhtcyBhbmQgZXF1YXRpb25zLCBNYXJ4YW4gc2VhcmNoZXMgbWlsbGlvbnMgb2YgcG90ZW50aWFsIHNvbHV0aW9ucyB0byBmaW5kIHRoZSBiZXN0IGJhbGFuY2UgYmV0d2VlbiBjb3N0cyBhbmQgYmVuZWZpdHMuIEluIHNob3J0LCBNYXJ4YW4gc29sdXRpb25zIG1pbmltaXplIHRoZSBvdmVyYWxsIGNvc3Qgc3ViamVjdCB0byB0aGUgY29uc3RyYWludCBvZiBtZWV0aW5nIHNwZWNpZmllZCDigJx0YXJnZXRz4oCdIGZvciBhbGwgZmVhdHVyZXMuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8cD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgTWFQUCBjb25zdWx0ZWQgdGhlIE1hUFAgU2NpZW5jZSBBZHZpc29yeSBDb21taXR0ZWUgKFNBQykgZm9yIGFkdmljZSBvbiBzY2VuYXJpb3MgYW5kIHRhcmdldCBzZWxlY3Rpb24uICBUaGUgU0FDIHN1cHBvcnRlZCB0aGUgZGVjaXNpb24gdG8gdXNlIHRoZSBwZXJjZW50YWdlIHRhcmdldCBjYXRlZ29yaWVzIGVzdGFibGlzaGVkIGJ5IHRoZSBCQ01DQSBwcm9qZWN0IHRlYW0gaW4gMjAwNi4gUGxlYXNlIHNlZSB0aGlzIDxhIGhyZWY9XFxcImh0dHBzOi8vZGwuZHJvcGJveHVzZXJjb250ZW50LmNvbS91LzE3NjQ5ODYvQkNNQ0EtTWFyeGFuIGZvciBNYVBQLVJlcG9ydCBvbiBpbml0aWFsIHNjZW5hcmlvc18yN0ZlYjIwMTMucGRmXFxcIiB0YXJnZXQ9XFxcIl9ibGFua1xcXCI+MjAxMyBCQ01DQSByZXBvcnQ8L2E+IGZvciBtb3JlIGluZm9ybWF0aW9uIGFib3V0IHRoZSBNYVBQLUJDTUNBIHByb2plY3QgYW5kIE1hcnhhbiBzY2VuYXJpb3MsIGFuZCBjb25zdWx0IHRoZSA8YSBocmVmPVxcXCJodHRwOi8vYmNtY2EuY2FcXFwiIHRhcmdldD1cXFwiX2JsYW5rXFxcIj5CQ01DQSBBdGxhczwvYT4gZm9yIGRldGFpbGVkIGluZm9ybWF0aW9uIGFib3V0IHRhcmdldHMsIHNwZWNpZXMsIGFuZCBoYWJpdGF0cy5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO3JldHVybiBfLmZsKCk7O30pO1xuXG50aGlzW1wiVGVtcGxhdGVzXCJdW1wib3ZlcnZpZXdcIl0gPSBuZXcgSG9nYW4uVGVtcGxhdGUoZnVuY3Rpb24oYyxwLGkpe3ZhciBfPXRoaXM7Xy5iKGk9aXx8XCJcIik7Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvblxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+U2l6ZTwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8cCBjbGFzcz1cXFwibGFyZ2VcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICBUaGlzIHpvbmUgaXMgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJzaXplXCIsYyxwLDApKSk7Xy5iKFwiIHNxdWFyZSBraWxvbWV0ZXJzPC9zdHJvbmc+LiBTaXplIGlzIHVzZWQgdG8gcXVhbnRpZnkgZHJhZnQgc3BhdGlhbCB6b25lcyBhbmQgcHJvdmlkZSBwZXJjZW50IGNvdmVyYWdlLiBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJhZGphY2VudFByb3RlY3RlZEFyZWFcIixjLHAsMSksYyxwLDAsMjQzLDcwMSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvblxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+TmVhcmJ5IEFyZWFzPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxwIGNsYXNzPVxcXCJsYXJnZSBncmVlbi1jaGVja1xcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIFRoaXMgem9uZSBpcyBhZGphY2VudCB0byBhIDxzdHJvbmc+VGVycmVzdHJpYWwgUHJvdGVjdGVkIEFyZWE8L3N0cm9uZz4uXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8cD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgQnVpbGQgb24gcGFzdCBhbmQgZXhpc3Rpbmcgem9uaW5nIGVmZm9ydHMgdGhhdCBhcmUgY29uc2lzdGVudCB3aXRoIGFuIGVjb3N5c3RlbS1iYXNlZCBtYW5hZ2VtZW50IGFwcHJvYWNoLiAgV2hlcmV2ZXIgcG9zc2libGUsIGRvIG5vdCBkdXBsaWNhdGUgZXhpc3Rpbmcgem9uaW5nIGVmZm9ydHMgYW5kIGNvbnNpZGVyIGV4aXN0aW5nIHRlcnJlc3RyaWFsIHpvbmluZyBmb3IgYWRqYWNlbnQgbWFyaW5lIHpvbmluZyB0byBhY2hpZXZlIHpvbmluZyBvYmplY3RpdmVzLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIgKyBpKTtpZighXy5zKF8uZihcInBtelwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIjxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb25cXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGg0PlRyYW5zbWlzc2lvbiBMaW5lcyA8YSBocmVmPVxcXCIjXFxcIiBkYXRhLXRvZ2dsZS1ub2RlPVxcXCI1MWY2YWQ2NzdiYmI5YjI0NTcwMjBmNTJcXFwiIGRhdGEtdmlzaWJsZT1cXFwiZmFsc2VcXFwiPnNob3cgbGF5ZXI8L2E+PC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxwIGNsYXNzPVxcXCJsYXJnZVxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIFRoaXMgem9uZSBpcyBcIik7Xy5iKF8udihfLmYoXCJ0cmFuc21pc3Npb25MaW5lc1wiLGMscCwwKSkpO18uYihcIiBrbSBmcm9tIHRoZSBuZWFyZXN0IHRyYW5zbWlzc2lvbiBsaW5lcy5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gdGFibGVDb250YWluZXJcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGg0PkRpc3RhbmNlIHRvIEluZnJhc3RydWN0dXJlPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDx0YWJsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPHRoZWFkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx0aD5JbmZyYXN0cnVjdHVyZTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dGg+RGlzdGFuY2UgKGttKTwvdGg+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPC90aGVhZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPHRib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJpbmZyYXN0cnVjdHVyZVwiLGMscCwxKSxjLHAsMCwxMjQxLDEzMjcsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgIDx0cj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJOYW1lXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx0ZD5cIik7Xy5iKF8udihfLmYoXCJEaXN0SW5LTVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC90cj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICA8L3Rib2R5PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8dGZvb3Q+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPHRyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDx0ZCBjb2xzcGFuPVxcXCIyXFxcIiBjbGFzcz1cXFwicGFyYWdyYXBoXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICBUaGUgaG9yaXpvbnRhbCBkaXN0YW5jZSB0byBmZXJyaWVzLCBwb3J0cywgaGFyYm91cnMsIGZ1ZWwgZG9ja3MsIGFuZCBvdGhlciBtYXJpbmUgYW5kIGNvYXN0YWwgaW5mcmFzdHJ1Y3R1cmUgbWlnaHQgYmUgaGVscGZ1bCBmb3IgcGxhbm5pbmcgbWFyaW5lIHVzZXMgYW5kIGFjdGl2aXRpZXMgdGhhdCBhcmUgc3VwcG9ydGVkIGluIHRoaXMgem9uZS4gXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L3RyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8L3Rmb290PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO307Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJhbnlBdHRyaWJ1dGVzXCIsYyxwLDEpLGMscCwwLDE3MTQsMTg0MCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvblxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+XCIpO18uYihfLnYoXy5kKFwic2tldGNoQ2xhc3MubmFtZVwiLGMscCwwKSkpO18uYihcIiBBdHRyaWJ1dGVzPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXy5ycChcImF0dHJpYnV0ZXMvYXR0cmlidXRlc1RhYmxlXCIsYyxwLFwiICAgIFwiKSk7Xy5iKFwiICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9cmV0dXJuIF8uZmwoKTs7fSk7XG5cbm1vZHVsZS5leHBvcnRzID0gdGhpc1tcIlRlbXBsYXRlc1wiXTsiXX0=
;