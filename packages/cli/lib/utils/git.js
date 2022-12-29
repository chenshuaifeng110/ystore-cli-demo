"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchTagList = exports.fetchRepoList = void 0;
var _axios = _interopRequireDefault(require("axios"));
var _constants = require("./constants");
var _files = require("./files");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
// 获取模板列表
const fetchRepoList = async () => {
  const data = _constants.templateRepos.map(item => ({
    name: item
  }));
  return data;
};

// 获取tag列表
exports.fetchRepoList = fetchRepoList;
const fetchTagList = async repo => {
  const CONFIG = await (0, _files.getAll)();
  const {
    data
  } = await _axios.default.get(`${CONFIG.API_BASE}/repos/chenshuaifeng110/${repo}/tags`);
  return data;
};
exports.fetchTagList = fetchTagList;