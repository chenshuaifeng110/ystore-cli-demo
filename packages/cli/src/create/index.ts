import chalk from 'chalk';
import path from 'path';
import Inquirer from 'inquirer';
import ncp from 'ncp';
import fs from 'fs';
import { execSync } from 'child_process';
import { startLoading } from '../utils';
import { fetchRepoList, fetchTagList } from '../utils/git';
import { getAll, rmDir } from '../utils/files';
import { download } from '../utils/download';
import { initGit } from '../utils/initGit';
import { packageManagers, downloadDirectory } from '../utils/constants';

module.exports = async (appname: string) => {
  if (!appname) return console.log(chalk.red('command格式错误, 请输入 ystore create appname'));
  // 0> 获取git模板仓库信息
  let repos = await startLoading(fetchRepoList, '正在获取模板列表 ....')();
  const { repo } = await Inquirer.prompt({
    name: 'repo',
    type: 'list',
    message: '请选择创建工程的模板仓库',
    choices: repos,
  });
  // 2) 拉取远程仓库版本
  let tags = await startLoading(fetchTagList, '正在拉取 tags ....')(repo);
  const { tag } = await Inquirer.prompt({
    name: 'tag',
    type: 'list',
    message: '请选择创建工程的模板版本',
    choices: tags,
  });
  // 3) 将模板缓存下来
  const result = await startLoading(download, '正在下载模板中 ...')(repo, tag);
  if (!result) return;
  // 4) 选择使用的包管理工具， npm / yarn
  const { packageManagerName } = await Inquirer.prompt({
    name: 'packageManagerName',
    type: 'list',
    message: '请选择一个包管理工具来下载依赖',
    choices: packageManagers.map((item) => item.name),
  });
  const packageItem = packageManagers.find((item) => item.name === packageManagerName);
  const installDependencies = () => {
    try {
      // 获取当前终端所在目录
      let templateDir = path.join(process.cwd(), appname);
      process.chdir(templateDir);
      execSync(packageItem?.installCommand as string, { stdio: 'ignore' });
      console.log(chalk.green('依赖下载中请稍后 ...'));
    } catch (error: any) {
      console.log(chalk.red(`使用${packageItem?.name}下载出错，错误原因${error.message}`));
      return;
    }
  };
  const successTip = () => {
    installDependencies();
    const templateDir = `${downloadDirectory}/${repo}`;
    rmDir(templateDir);
    initGit();
    console.log(chalk.green('初始化模板仓库成功，请:'));
    console.log();
    console.log(chalk.cyan('  cd'), appname);
    console.log(`  ${chalk.cyan(`${packageItem?.name} run serve`)}`);
  };
  if (result) {
    const CONFIG = await getAll();
    // 4）进行拷贝操作
    if (!fs.existsSync(path.join(result, CONFIG.ASK_IN_CLI))) {
      ncp(result, path.resolve(appname), (error: any) => {
        if (error) {
          return console.log(chalk(`拷贝操作发生错误，错误原因${error.message}`));
        } else {
          successTip();
        }
      });
    }
  }
};
