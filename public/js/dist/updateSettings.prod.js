"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.updateSettings=void 0;var _axios=_interopRequireDefault(require("axios")),_alert=require("./alert");function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}var updateSettings=function(t,r){var a;return regeneratorRuntime.async(function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,a="password"===r?"http://127.0.0.1:3000/api/v1/users/updateMyPassword":"http://127.0.0.1:3000/api/v1/users/updateMe",e.next=4,regeneratorRuntime.awrap((0,_axios.default)({method:"PATCH",url:a,data:t}));case 4:"success"===e.sent.data.status&&(0,_alert.showAlert)("success","".concat(r.toUpperCase()," Updated Successfully!")),e.next=11;break;case 8:e.prev=8,e.t0=e.catch(0),(0,_alert.showAlert)("error",e.t0.response.data.message);case 11:case"end":return e.stop()}},null,null,[[0,8]])};exports.updateSettings=updateSettings;