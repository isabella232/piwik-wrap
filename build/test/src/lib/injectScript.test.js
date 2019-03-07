"use strict";

var _unexpected = _interopRequireDefault(require("unexpected"));

var DOM = _interopRequireWildcard(require("../../helpers/DOM"));

var _injectScript = _interopRequireDefault(require("../../../src/lib/injectScript"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe("injectScript", function () {
  var script, scripts;
  before(function () {
    return DOM.create();
  });
  before(function () {
    return document.body.appendChild(document.createElement("script"));
  });
  before(function () {
    return script = document.createElement("script");
  });
  it("should inject a passed script before existing scripts", function () {
    (0, _injectScript.default)(script);
    scripts = Array.from(document.getElementsByTagName("script"));
    (0, _unexpected.default)(scripts, "to have length", 2);
    (0, _unexpected.default)(scripts[0], "to equal", script);
  });
  after(function () {
    return DOM.destroy();
  });
});