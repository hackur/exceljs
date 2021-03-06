'use strict';

var CellXform = require('../../../../../lib/xlsx/xform/sheet/cell-xform');
var testXformHelper = require('./../test-xform-helper');

var SharedStringsXform = require('../../../../../lib/xlsx/xform/strings/shared-strings-xform');
var Enums = require('../../../../../lib/doc/enums');

var fakeStyles = {
  addStyleModel: function(style, effectiveType) {
    if (effectiveType === Enums.ValueType.Date) {
      return 1;
    }
    return 0;
  },
  getStyleModel: function(styleId) {
    switch(styleId) {
      case 1:
        return {numFmt:'mm-dd-yy'};
      default:
        return null;
    }
  }
};

var fakeHyperlinkMap = {
  H1: 'http://www.foo.com'
};

var expectations = [
  {
    title: 'Styled Null',
    create:  function() { return new CellXform()},
    preparedModel: {address: 'A1', type: Enums.ValueType.Null, styleId: 1},
    xml: '<c r="A1" s="1" />',
    parsedModel: {address: 'A1', type: Enums.ValueType.Null, styleId: 1},
    tests: ['render', 'renderIn', 'parse']
  },
  {
    title: 'Number',
    create:  function() { return new CellXform()},
    preparedModel: {address: 'A1', type: Enums.ValueType.Number, value: 5},
    parsedModel: {address: 'A1', type: Enums.ValueType.Number, value: 5},
    xml: '<c r="A1"><v>5</v></c>',
    tests: ['render', 'renderIn', 'parse']
  },
  {
    title: 'Boolean',
    create:  function() { return new CellXform()},
    preparedModel: {address: 'A1', type: Enums.ValueType.Boolean, value: true},
    parsedModel: {address: 'A1', type: Enums.ValueType.Boolean, value: true},
    xml: '<c r="A1" t="b"><v>1</v></c>',
    tests: ['render', 'renderIn', 'parse']
  },
  {
    title: 'Error',
    create:  function() { return new CellXform()},
    preparedModel: {address: 'A1', type: Enums.ValueType.Error, value: { error: '#N/A'}},
    parsedModel: {address: 'A1', type: Enums.ValueType.Error, value: { error: '#N/A'}},
    xml: '<c r="A1" t="e"><v>#N/A</v></c>',
    tests: ['render', 'renderIn', 'parse']
  },
  {
    title: 'Inline String',
    create:  function() { return new CellXform()},
    initialModel: {address: 'A1', type: Enums.ValueType.String, value: 'Foo'},
    preparedModel: {address: 'A1', type: Enums.ValueType.String, value: 'Foo'},
    xml: '<c r="A1" t="str"><v>Foo</v></c>',
    parsedModel: {address: 'A1', type: Enums.ValueType.String, value: 'Foo'},
    reconciledModel: {address: 'A1', type: Enums.ValueType.String, value: 'Foo'},
    tests: ['prepare', 'render', 'renderIn', 'parse', 'reconcile'],
    options: { hyperlinkMap: fakeHyperlinkMap, styles: fakeStyles }
  },
  {
    title: 'Shared String',
    create:  function() { return new CellXform()},
    initialModel: {address: 'A1', type: Enums.ValueType.String, value: 'Foo'},
    preparedModel: {address: 'A1', type: Enums.ValueType.String, value: 'Foo', ssId: 0},
    xml: '<c r="A1" t="s"><v>0</v></c>',
    parsedModel: {address: 'A1', type: Enums.ValueType.String, value: 0},
    reconciledModel: {address: 'A1', type: Enums.ValueType.String, value: 'Foo'},
    tests: ['prepare', 'render', 'renderIn', 'parse', 'reconcile'],
    options: { sharedStrings: new SharedStringsXform(), hyperlinkMap: fakeHyperlinkMap, styles: fakeStyles }
  },
  {
    title: 'Date',
    create:  function() { return new CellXform()},
    initialModel: {address: 'A1', type: Enums.ValueType.Date, value: new Date('2016-06-09T00:00:00.000Z')},
    preparedModel: {address: 'A1', type: Enums.ValueType.Date, value: new Date('2016-06-09T00:00:00.000Z'), styleId: 1},
    xml: '<c r="A1" s="1"><v>42530</v></c>',
    parsedModel: {address: 'A1', type: Enums.ValueType.Number, value: 42530, styleId: 1},
    reconciledModel: {address: 'A1', type: Enums.ValueType.Date, value: new Date('2016-06-09T00:00:00.000Z'), style: {numFmt: 'mm-dd-yy'}},
    tests: ['prepare', 'render', 'renderIn', 'parse', 'reconcile'],
    options: { sharedStrings: new SharedStringsXform(), hyperlinks: [], hyperlinkMap: fakeHyperlinkMap, styles: fakeStyles }
  },
  {
    title: 'Hyperlink',
    create:  function() { return new CellXform()},
    initialModel: {address: 'H1', type: Enums.ValueType.Hyperlink, hyperlink: 'http://www.foo.com', text: 'www.foo.com'},
    preparedModel: {address: 'H1', type: Enums.ValueType.Hyperlink, hyperlink: 'http://www.foo.com', text: 'www.foo.com', ssId: 0},
    xml: '<c r="H1" t="s"><v>0</v></c>',
    parsedModel: {address: 'H1', type: Enums.ValueType.String, value: 0},
    reconciledModel: {address: 'H1', type: Enums.ValueType.Hyperlink, text: 'www.foo.com', hyperlink: 'http://www.foo.com'},
    tests: ['prepare', 'render', 'renderIn', 'parse', 'reconcile'],
    options: { sharedStrings: new SharedStringsXform(), hyperlinks: [], hyperlinkMap: fakeHyperlinkMap, styles: fakeStyles }
  },
  {
    title: 'String Formula',
    create:  function() { return new CellXform()},
    initialModel: {address: 'A1', type: Enums.ValueType.Formula, formula: 'A2', result: 'Foo'},
    preparedModel: {address: 'A1', type: Enums.ValueType.Formula, formula: 'A2', result: 'Foo'},
    xml: '<c r="A1" t="str"><f>A2</f><v>Foo</v></c>',
    parsedModel: {address: 'A1', type: Enums.ValueType.Formula, formula: 'A2', result: 'Foo'},
    reconciledModel: {address: 'A1', type: Enums.ValueType.Formula, formula: 'A2', result: 'Foo'},
    tests: ['prepare', 'render', 'renderIn', 'parse', 'reconcile'],
    options: { sharedStrings: new SharedStringsXform(), hyperlinks: [], hyperlinkMap: fakeHyperlinkMap, styles: fakeStyles, formulae: {}, siFormulae: 0 },
  },
  {
    title: 'Number Formula',
    create:  function() { return new CellXform()},
    preparedModel: {address: 'A1', type: Enums.ValueType.Formula, formula: 'A2', result: 7},
    xml: '<c r="A1"><f>A2</f><v>7</v></c>',
    parsedModel: {address: 'A1', type: Enums.ValueType.Formula, formula: 'A2', result: 7},
    tests: ['render', 'renderIn', 'parse'],
    options: { formulae: {}, siFormulae: 0 },
  },
  {
    title: 'Shared Formula',
    create:  function() { return new CellXform()},
    initialModel: {address: 'A2', type: Enums.ValueType.Formula, sharedFormula: 'A1', result: 2},
    preparedModel: {address: 'A2', type: Enums.ValueType.Formula, sharedFormula: 'A1', result: 2, si: 0 },
    xml: '<c r="A2"><f t="shared" si="0" /><v>2</v></c>',
    parsedModel: {address: 'A2', type: Enums.ValueType.Formula, result: 2, si: '0', sharedFormula: true },
    reconciledModel: {address: 'A2', type: Enums.ValueType.Formula, result: 2, sharedFormula: 'A1' },
    tests: ['prepare', 'render', 'renderIn', 'parse', 'reconcile'],
    options: {
      styles: fakeStyles,
      hyperlinks: [],
      hyperlinkMap: fakeHyperlinkMap,
      formulae: {
        A1: { address: 'A1', type: Enums.ValueType.Formula, formula: 'ROW()', result: 1 },
        0: { address: 'A1', type: Enums.ValueType.Formula, formula: 'ROW()', result: 1, si: '0' },
      },
      siFormulae: 0
    },
  },
  {
    title: 'Master Shared Formula',
    create:  function() { return new CellXform()},
    preparedModel: {address: 'A2', type: Enums.ValueType.Formula, formula: 'A1', result: 2, si: 0 },
    xml: '<c r="A2"><f t="shared" si="0">A1</f><v>2</v></c>',
    parsedModel: {address: 'A2', type: Enums.ValueType.Formula, formula: 'A1', result: 2, si: '0', sharedFormula: true },
    reconciledModel: {address: 'A2', type: Enums.ValueType.Formula, formula: 'A1', result: 2 },
    tests: ['render', 'renderIn', 'parse', 'reconcile'],
    options: {
      styles: fakeStyles,
      hyperlinks: [],
      hyperlinkMap: fakeHyperlinkMap,
      formulae: {},
      siFormulae: 0
    },
  },
];

describe('CellXform', function () {
  testXformHelper(expectations);
});
