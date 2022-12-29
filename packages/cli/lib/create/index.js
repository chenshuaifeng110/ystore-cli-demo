"use strict";

var _chalk = _interopRequireDefault(require("chalk"));
var _path = _interopRequireDefault(require("path"));
var _inquirer = _interopRequireDefault(require("inquirer"));
var _ncp = _interopRequireDefault(require("ncp"));
var _fs = _interopRequireDefault(require("fs"));
var _child_process = require("child_process");
var _utils = require("../utils");
var _git = require("../utils/git");
var _files = require("../utils/files");
var _download = require("../utils/download");
var _initGit = require("../utils/initGit");
var _constants = require("../utils/constants");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
module.exports = async appname => {
  if (!appname) return console.log(_chalk.default.red('command格式错误, 请输入 ystore create appname'));
  // 0> 获取git模板仓库信息
  let repos = await (0, _utils.startLoading)(_git.fetchRepoList, '正在获取模板列表 ....')();
  const {
    repo
  } = await _inquirer.default.prompt({
    name: 'repo',
    type: 'list',
    message: '请选择创建工程的模板仓库',
    choices: repos
  });
  // 2) 拉取远程仓库版本
  let tags = await (0, _utils.startLoading)(_git.fetchTagList, '正在拉取 tags ....')(repo);
  const {
    tag
  } = await _inquirer.default.prompt({
    name: 'tag',
    type: 'list',
    message: '请选择创建工程的模板版本',
    choices: tags
  });
  // 3) 将模板缓存下来
  const result = await (0, _utils.startLoading)(_download.download, '正在下载模板中 ...')(repo, tag);
  if (!result) return;
  // 4) 选择使用的包管理工具， npm / yarn
  const {
    packageManagerName
  } = await _inquirer.default.prompt({
    name: 'packageManagerName',
    type: 'list',
    message: '请选择一个包管理工具来下载依赖',
    choices: _constants.packageManagers.map(item => item.name)
  });
  const packageItem = _constants.packageManagers.find(item => item.name === packageManagerName);
  const installDependencies = () => {
    try {
      // 获取当前终端所在目录
      let templateDir = _path.default.join(process.cwd(), appname);
      process.chdir(templateDir);
      (0, _child_process.execSync)(packageItem === null || packageItem === void 0 ? void 0 : packageItem.installCommand, {
        stdio: 'ignore'
      });
      console.log(_chalk.default.green('依赖下载中请稍后 ...'));
    } catch (error) {
      console.log(_chalk.default.red(`使用${packageItem === null || packageItem === void 0 ? void 0 : packageItem.name}下载出错，错误原因${error.message}`));
      return;
    }
  };
  const successTip = () => {
    installDependencies();
    const templateDir = `${_constants.downloadDirectory}/${repo}`;
    (0, _files.rmDir)(templateDir);
    (0, _initGit.initGit)();
    console.log(_chalk.default.green('初始化模板仓库成功，请:'));
    console.log();
    console.log(_chalk.default.cyan('  cd'), appname);
    console.log(`  ${_chalk.default.cyan(`${packageItem === null || packageItem === void 0 ? void 0 : packageItem.name} run serve`)}`);
  };
  if (result) {
    const CONFIG = await (0, _files.getAll)();
    // 4）进行拷贝操作
    if (!_fs.default.existsSync(_path.default.join(result, CONFIG.ASK_IN_CLI))) {
      (0, _ncp.default)(result, _path.default.resolve(appname), error => {
        if (error) {
          return console.log((0, _chalk.default)(`拷贝操作发生错误，错误原因${error.message}`));
        } else {
          successTip();
        }
      });
    }
  }
};