ReportTab = require 'reportTab'
templates = require '../templates/templates.js'

class EconomicTab extends ReportTab
  name: 'Economy'
  className: 'economic'
  template: templates.economic
  dependencies: [
    "Closures"
    "OverlapWithExistingProvincialTenures"
  ]
  timeout: 120000

  render: () ->
    zoneType = _.find @model.getAttributes(), (attr) -> 
      attr.exportid is 'ZONE_TYPE'
    zoneType = zoneType?.value or 'smz'

    # setup context object with data and render the template from it
    context =
      sketch: @model.forTemplate()
      sketchClass: @sketchClass.forTemplate()
      attributes: @model.getAttributes()
      admin: @project.isAdmin window.user
      closures: @recordSet("Closures", "FisheriesClosures").toArray()
      provincial: @recordSet("OverlapWithExistingProvincialTenures", "ProvincialTenures").toArray()
      array: @children?.length > 0
      pmz: !(@children?.length > 0) and zoneType is 'pmz'
      smz: !(@children?.length > 0) and zoneType is 'smz'

    @$el.html @template.render(context, templates)
    @enableLayerTogglers()
    @enableTablePaging()

module.exports = EconomicTab